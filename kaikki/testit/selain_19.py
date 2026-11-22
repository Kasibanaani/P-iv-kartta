"""Kaikki 0.19: omat pikanapit, päivän muistiinpano ja automaattiset tunnisteet."""
import asyncio
from datetime import date
import json
from pathlib import Path
import re

from playwright.async_api import async_playwright, expect

ROOT = Path(__file__).resolve().parent
APP = (ROOT.parent / 'index.html').as_uri()
FAKE = (ROOT / 'fakegh.js').read_text()
DAY = date.today().isoformat()
PATH = f'paivat/{DAY[:4]}/{DAY}.md'
ORIGINAL = f'---\ntyyppi: paiva\notsikko: {DAY}\nlahde: emil\n---\n# {DAY}\n\nAiempi muistiinpano.\n'
FIXTURES = {
    PATH: ORIGINAL,
    'ohjeet/muistiinpanot.md': '## Omat kentät\n- **Sovitut kentät:** `arvio` (luku 1–10).\n',
    'pohjat/tunnisteet.md': '#koira: Koira, koiran\n#ulkoilu: pitkä kävely\n',
}


async def test(browser, width):
    context = await browser.new_context(viewport={'width': width, 'height': 860})
    page = await context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    await page.add_init_script(FAKE + '''
      if (!window.__repo.kept) {
        for (const [path, text] of Object.entries(%s)) window.__repo.put(path, text);
      }
      localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
    ''' % json.dumps(FIXTURES))
    await page.goto(APP)
    await page.wait_for_function("KaikkiTesti.vault().files['ohjeet/muistiinpanot.md']")
    starter = page.get_by_role('button', name='Pikakirjaus', exact=True)
    await starter.click()
    quick = page.locator('#quick-entry')
    await quick.get_by_role('button', name='+ Uusi nappi', exact=True).click()
    form = quick.get_by_role('form', name='Uusi pikakirjausnappi', exact=True)
    await form.get_by_label('Nimi').fill('tuntematon')
    await form.get_by_role('button', name='Lisää nappi').click()
    await expect(quick.locator('#quick-msg')).to_contain_text('sovitun kentän nimi')
    assert await page.evaluate("!__repo.get('pohjat/pikakirjaus.md')")
    await form.get_by_label('Nimi').fill('Arvio')
    await form.get_by_label('Arvolaji').select_option('1-5')
    await form.get_by_label('Tunnisteet').fill('#kokeilu')
    await form.get_by_role('button', name='Lisää nappi').click()
    await expect(quick.get_by_role('button', name='Arvio', exact=True)).to_be_visible()
    assert await page.evaluate("__repo.get('pohjat/pikakirjaus.md')") == '## Seuranta\n- Arvio | 1-5 | #kokeilu\n'
    await quick.get_by_role('button', name='Arvio', exact=True).click()
    await quick.get_by_role('button', name='4', exact=True).click()
    concurrent = ORIGINAL + '\nToisen laitteen lisäys.\n'
    await page.evaluate('([path, text]) => __repo.put(path, text)', [PATH, concurrent])
    await page.keyboard.press('Escape')
    await expect(quick).to_be_hidden()
    result = await page.evaluate('path => __repo.get(path)', PATH)
    assert result.startswith(concurrent)
    assert re.search(r'## Pikakirjaukset\n\n- klo \d\d\.\d\d · arvio: 4 #kokeilu\n', result)

    if width >= 1000:
        await page.get_by_role('tab', name='Kalenteri', exact=True).click()
    else:
        await page.locator('#roll').click()
        await page.locator('#section-cal').click()
    day = page.locator(f'#wklist .wkday[data-day="{DAY}"]')
    await expect(day.locator('.wk-recorded')).to_have_text('Kirjattu: arvio 4')
    await expect(day.locator('.wrow')).to_have_count(0)
    if width >= 1000:
        await page.get_by_role('tab', name='Muistio', exact=True).click()
    else:
        await page.locator('#roll').click()
        await page.locator('#section-notes').click()
    await page.locator('#newnote').click()
    text = 'Koiran kanssa pitkä kävely #kokeilu'
    await page.locator('#ns-text').fill(text)
    await page.keyboard.press('Escape')
    await page.wait_for_function("Object.values(__repo.files).some(file => file.t.includes('tagit: [koira, ulkoilu]'))")
    await page.locator('#nlist').get_by_text('Koiran kanssa pitkä kävely').click()
    tags = page.locator('#ns-tags')
    await expect(tags.locator('.auto-note-tag')).to_have_text(['#koira', '#ulkoilu'])
    await expect(tags.get_by_role('button', name='#kokeilu', exact=True)).to_be_visible()
    await expect(page.locator('#ns-text')).to_have_value(text)
    assert not errors, errors
    print(f'{width} px: uusi nappi, päivämuistiinpano ja automaattiset tunnisteet toimivat')
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
