"""Kaikki 0.16: mittariteksti ja pikakomentolinkin vahvistus."""
import asyncio
from datetime import date, timedelta
import json
from pathlib import Path
from urllib.parse import quote

from playwright.async_api import async_playwright, expect

ROOT = Path(__file__).resolve().parent
APP = (ROOT.parent / 'index.html').as_uri()
FAKE = (ROOT / 'fakegh.js').read_text()
DAY = (date.today() - timedelta(days=1)).isoformat()
HEADER = 'pvm,vire,olo,treeni,paino\n'
SPEC = {'taulukot': [{'id': 'paiva', 'tiedosto': 'data/paiva.csv', 'sarakkeet': [
    {'id': 'vire', 'nimi': 'Vire tänään', 'laji': 'asteikko', 'min': 1, 'max': 5},
    {'id': 'olo', 'nimi': 'Olo', 'laji': 'valinta', 'arvot': [['1', 'Matala'], ['2', 'Hyvä']]},
    {'id': 'treeni', 'nimi': 'Treeni', 'laji': 'kylla-ei'},
    {'id': 'paino', 'nimi': 'Paino', 'laji': 'luku', 'yksikko': 'kg'},
]}]}
TEXT = 'Mittarit: eilen Vire tänään 4; olo hyvä; treeni kyllä; paino 72,5 kg'
NOTE_PATH = 'inbox/kokeilumuistiinpano.md'
NOTE = f'---\ntyyppi: inbox\notsikko: Kokeilumuistiinpano\nluotu: {DAY}\n---\n# Kokeilumuistiinpano\n\nMittarit: vire 3\n'


async def test(browser, width):
    context = await browser.new_context(viewport={'width': width, 'height': 860})
    page = await context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    await page.add_init_script(FAKE + '''
        if (!window.__repo.kept) {
            window.__repo.put('data/mittarit.json', %s);
            window.__repo.put('data/paiva.csv', %s);
            window.__repo.put('inbox/kokeilumuistiinpano.md', %s);
        }
        localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
    ''' % (json.dumps(json.dumps(SPEC)), json.dumps(HEADER), json.dumps(NOTE)))
    link = ('#' if width in (320, 1280) else '?') + 'kirjaa=' + quote(TEXT)
    await page.goto(APP + link)
    dialog = page.locator('#dash-entry')
    await expect(dialog).to_be_visible()
    assert 'kirjaa=' not in page.url
    await expect(dialog.get_by_label('Päivä', exact=True)).to_have_value(DAY)
    await expect(dialog.get_by_label('Vire tänään', exact=True)).to_have_value('4')
    await expect(dialog.get_by_label('Olo', exact=True)).to_have_value('2')
    await expect(dialog.get_by_label('Treeni', exact=True)).to_have_value('1')
    await expect(dialog.get_by_label('Paino (kg)', exact=True)).to_have_value('72.5')
    assert await page.evaluate("__repo.get('data/paiva.csv')") == HEADER
    assert not await page.evaluate("__repo.log.some(line => line.startsWith('PUT '))")
    await dialog.get_by_role('button', name='Tallenna', exact=True).click()
    await expect(dialog).to_be_hidden()
    assert await page.evaluate("__repo.get('data/paiva.csv')") == HEADER + DAY + ',4,2,1,72.5\n'

    if width >= 1000:
        await page.get_by_role('tab', name='Kojelauta', exact=True).click()
    else:
        await page.locator('#roll').click()
        await page.locator('#section-dash').click()
    await page.locator('#dash-entry-open').click()
    await dialog.get_by_text('Kirjaa tekstinä', exact=True).click()
    source = dialog.get_by_role('textbox', name='Mittarit', exact=True)
    await source.fill('Mittarit: vire 4; tunnistamaton 1')
    await dialog.get_by_role('button', name='Täytä kentät tekstistä').click()
    await expect(dialog.locator('#dash-entry-msg')).to_contain_text('Mittaria ei tunnistettu')
    await expect(dialog.get_by_label('Vire tänään', exact=True)).to_have_value('')
    await source.fill('Mittarit: 30.2. vire 4')
    await dialog.get_by_role('button', name='Täytä kentät tekstistä').click()
    await expect(dialog.locator('#dash-entry-msg')).to_contain_text('Päivämäärää ei tunnistettu')

    await page.keyboard.press('Escape')
    if width >= 1000:
        await page.get_by_role('tab', name='Muistio', exact=True).click()
    else:
        await page.locator('#roll').click()
        await page.locator('#section-notes').click()
    assert await page.evaluate("__repo.get('inbox/kokeilumuistiinpano.md')") == NOTE
    await page.locator('#nlist').get_by_text('Kokeilumuistiinpano').click()
    await page.locator('#ns-more').click()
    await page.locator('#nsm-metrics').click()
    await expect(dialog.get_by_label('Vire tänään', exact=True)).to_have_value('3')
    await expect(dialog.get_by_label('Päivä', exact=True)).to_have_value(DAY)
    await dialog.get_by_role('button', name='Tallenna', exact=True).click()
    await page.wait_for_function("__repo.get('inbox/kokeilumuistiinpano.md')?.includes('vire 3 ✓')")
    assert await page.evaluate("__repo.get('data/paiva.csv')") == HEADER + DAY + ',3,2,1,72.5\n'

    await page.locator('#newnote').click()
    await page.locator('#ns-text').fill('Uusi koemuistio\nMittarit: vire 2')
    await page.keyboard.press('Escape')
    await page.wait_for_function("Object.values(__repo.files).some(file => file.t.includes('vire 2 ✓'))")
    today = date.today().isoformat()
    assert await page.evaluate("__repo.get('data/paiva.csv')") == HEADER + DAY + ',3,2,1,72.5\n' + today + ',2,,,\n'
    await page.locator('#nlist').get_by_text('Uusi koemuistio').click()
    await page.locator('#ns-more').click()
    await expect(page.locator('#nsm-metrics')).to_have_count(0)
    await page.keyboard.press('Escape')
    await page.keyboard.press('Escape')
    assert await page.evaluate("__repo.log.filter(line => line === 'PUT /contents/data/paiva.csv').length") == 3
    assert not errors, errors
    print(f'{width} px: mittariteksti, pikakomentolinkki ja muistiinpanon kuittaus toimivat')
    await context.close()


async def main():
    async with async_playwright() as playwright:
        try:
            browser = await playwright.chromium.launch()
        except Exception:
            browser = await playwright.chromium.launch(executable_path='/opt/pw-browsers/chromium')
        async with browser:
            for width in (320, 390, 1280, 1440):
                await test(browser, width)


if __name__ == '__main__':
    asyncio.run(main())
