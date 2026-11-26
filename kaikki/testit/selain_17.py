"""Kaikki 0.17: Muistion luku, tunnisterajaus ja rivinäkymä."""
import asyncio
import json
from pathlib import Path

from playwright.async_api import async_playwright, expect

ROOT = Path(__file__).resolve().parent
APP = (ROOT.parent / 'index.html').as_uri()
FAKE = (ROOT / 'fakegh.js').read_text()
FIXTURES = {
    'inbox/puu.md': (
        '---\ntyyppi: inbox\notsikko: Puun hoito\nluotu: 2026-11-22\n'
        'tagit: [Remontti, suunnittelu]\n---\n# Puun hoito\n\n'
        'Tarvitaan #Öljy ja #remontti. Ohita #3, `#koodi` ja https://example.org/#ankkuri.\n'
    ),
    'inbox/taimi.md': (
        '---\ntyyppi: inbox\notsikko: Taimen hoito\nluotu: 2026-11-22\n---\n'
        '# Taimen hoito\n\nTarvitaan #kastelu.\n'
    ),
    'nakymat/oljy.md': (
        '---\ntyyppi: nakyma\notsikko: Öljyttävät\nnakyy: ei\n'
        'mista: tunniste = öljy\nsarakkeet:\n  - otsikko\n  - tunnisteet\n---\n'
    ),
}


async def test(browser, width):
    context = await browser.new_context(viewport={'width': width, 'height': 860})
    page = await context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    await page.add_init_script(FAKE + '''
      for (const [path, content] of Object.entries(%s)) window.__repo.put(path, content);
      localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
    ''' % json.dumps(FIXTURES))
    await page.goto(APP)
    if width >= 1000:
        await page.locator('#navbtn').click(); await page.get_by_role('tab', name='Muistio', exact=True).click()
    else:
        await page.locator('#roll').click()
        await page.locator('#section-notes').click()
    notes = page.locator('#nlist')
    await notes.get_by_text('Puun hoito').click()
    tags = page.get_by_role('group', name='Tunnisteet', exact=True)
    await expect(tags.get_by_role('button')).to_have_text(['#öljy', '#remontti', '#suunnittelu'])
    await tags.get_by_role('button', name='#öljy', exact=True).click()
    await expect(page.locator('#nsheet')).to_be_hidden()
    await expect(notes.get_by_text('Puun hoito')).to_be_visible()
    await expect(notes.get_by_text('Taimen hoito')).to_have_count(0)
    await page.locator('#filterpick').click()
    filters = page.locator('#fsheet')
    await expect(filters.get_by_role('heading', name='Tunnisteet')).to_be_visible()
    await expect(filters.get_by_role('button', name='#öljy', exact=True)).to_have_attribute('aria-pressed', 'true')
    await filters.locator('#fs-clear').click()
    await page.keyboard.press('Escape')
    await expect(notes.get_by_text('Taimen hoito')).to_be_visible()

    if width < 1000:
        await page.locator('#nviewbtn').click()
    await page.locator('#nvpick').click()
    await page.get_by_role('menuitem', name='Öljyttävät', exact=True).click()
    await expect(notes.get_by_text('Puun hoito', exact=True)).to_be_visible()
    await expect(notes.get_by_text('Taimen hoito', exact=True)).to_have_count(0)
    await expect(notes.locator('.note-tag-cell .rv-tag')).to_have_text(['#öljy', '#remontti', '#suunnittelu'])
    assert not await page.evaluate("__repo.log.some(line => line.startsWith('PUT '))")
    assert not errors, errors
    print(f'{width} px: tunnisteet ja molemmat suodatustavat toimivat')
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
