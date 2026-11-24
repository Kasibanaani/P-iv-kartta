"""Kojelauta: päivän osioiden jaettu kuittaus ja laskenta muistiinpanon kentistä."""
import asyncio
import json
import re
from datetime import date, timedelta
from pathlib import Path

from playwright.async_api import async_playwright, expect

from apu import tab

HERE = Path(__file__).resolve().parent
FAKE = (HERE / 'fakegh.js').read_text(encoding='utf8')
APP = (HERE.parent / 'index.html').as_uri()
BOARD = 'data/kojelauta.md'
EVENT = 'kalenteri/keikka.md'


def notes():
    today = date.today()
    fi_today = f'{today.day}.{today.month}.{today.year}'
    calendar_body = f'\n# Ensimmäinen\n{fi_today} #arki\n---\nToinen\n{fi_today} #arki\n---\nMuu osio\n{fi_today} #muu\n'

    def note(title, value, days, body):
        day = today - timedelta(days=days)
        return f'---\ntyyppi: muistiinpano\notsikko: {title}\nluotu: {day}\nuni: {value}\n---\n# {title}\n{body}\n'

    return {
        EVENT: f'---\ntyyppi: tapahtuma\nluotu: {today}\n---\n{calendar_body}',
        'paivat/eka.md': note('Ensimmäinen mittaus', '8', 1, f'!!{fi_today}: Uni: 99!!'),
        'paivat/toka.md': note('Toinen mittaus', '6,5', 2, ''),
        'paivat/tyhja.md': note('Tyhjä kenttä', '', 2, f'!!{fi_today}: Uni: 100!!'),
        'inbox/ulkopuoli.md': note('Ulkopuoli', '200', 2, ''),
        BOARD: '\n'.join([
            '# Ruudut', '',
            '| id | otsikko | muuttuja | laske | aika | tunniste | kansio | yksikko | nayta |',
            '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
            '| legacy | Tekstimuuttuja | Uni | summa | 30 | | | | luku |',
            '', 'Oma huomautus säilyy.', '',
        ]),
    }


async def dashboard(page):
    if await page.locator('#roll').is_visible():
        await page.locator('#roll').click()
        await page.locator('#section-dash').click()
    else:
        await page.get_by_role('tab', name='Kojelauta', exact=True).click()


async def run(browser, width):
    today = str(date.today())
    page = await browser.new_page(viewport={'width': width, 'height': 820})
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    fixture = json.dumps(notes())
    await page.add_init_script(FAKE + '''
    for (const [path,text] of Object.entries(%s)) {
      if (!__repo.kept) __repo.put(path,text);
    }
    try {
      localStorage.setItem('kaikki:gh',JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
    } catch (_) {}
    ''' % fixture)
    await page.goto(APP)
    await page.wait_for_function("window.KaikkiTesti?.vault().files['data/kojelauta.md']")
    await dashboard(page)
    await expect(page.locator('[data-id=legacy] .dval')).to_have_text('199')

    await page.locator('#mvb-lock').click()
    await page.locator('#mvb-add').click()
    await page.locator('#mvb-kind').select_option('tarkistuslista')
    await expect(page.locator('#mvb-var')).to_be_hidden()
    await page.locator('#mvb-tag').fill('arki')
    await page.locator('#mvb-dir').fill('kalenteri')
    await page.locator('#mvb-save').click()
    checklist = page.locator('.mvb-card[data-kind=tarkistuslista]')
    await expect(checklist.locator('.mvb-check')).to_have_count(2)
    second = checklist.get_by_role('button', name='Kuittaa: Toinen', exact=True)
    await second.click()
    await expect(checklist.get_by_role('button', name='Kuitattu: Toinen', exact=True)).to_have_attribute('aria-pressed', 'true')
    await expect(checklist.get_by_role('button', name='Kuittaa: Ensimmäinen', exact=True)).to_have_attribute('aria-pressed', 'false')
    await page.wait_for_function(
        "key => __repo.get('kalenteri/keikka.md').includes('kuitattu: '+key)", arg=today+'#1')
    await checklist.get_by_role('button', name='Toinen', exact=True).click()
    await expect(page.locator('#ns-done')).to_have_attribute('aria-pressed', 'true')
    await page.locator('#ns-ok').click()

    await tab(page, 'cal')
    day = page.locator(f'#wklist .wkday[data-day="{today}"]')
    await day.get_by_role('button', name='Kuitattu: Toinen', exact=True).click()
    await dashboard(page)
    await expect(checklist.get_by_role('button', name='Kuittaa: Toinen', exact=True)).to_have_attribute('aria-pressed', 'false')

    await page.locator('#mvb-add').click()
    await page.locator('#mvb-kind').select_option('kentta')
    await page.locator('#mvb-field').select_option('uni')
    await page.locator('#mvb-title').fill('Uni kentistä')
    await page.locator('#mvb-aika').select_option('30')
    await page.locator('#mvb-laske').select_option('keskiarvo')
    await page.locator('#mvb-dir').fill('paivat')
    await page.locator('#mvb-unit').fill('h')
    await page.locator('#mvb-save').click()
    field = page.locator('.mvb-card').filter(has_text='Uni kentistä')
    await expect(field.locator('.dval')).to_have_text('7,25 h')
    await field.get_by_role('button', name='Lähteet (2)').click()
    await expect(field.locator('.mvb-src .mvrow')).to_have_count(2)
    await field.get_by_role('button', name='Ensimmäinen mittaus', exact=False).click()
    await expect(page.locator('#ns-text')).to_have_value(re.compile('Ensimmäinen mittaus'))
    await page.locator('#ns-ok').click()
    saved = await page.evaluate("path => __repo.get(path)", BOARD)
    assert 'Oma huomautus säilyy.' in saved
    await page.reload()
    await page.wait_for_function("window.KaikkiTesti?.vault().files['data/kojelauta.md']")
    if not await field.is_visible():
        await dashboard(page)
    await expect(field.locator('.dval')).to_have_text('7,25 h')
    await expect(checklist.locator('.mvb-check')).to_have_count(2)
    assert not errors, errors
    await page.close()


async def main():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch()
        try:
            for width in (1280, 390):
                await run(browser, width)
        finally:
            await browser.close()


asyncio.run(main())
