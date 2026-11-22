"""Kaikki 0.20: jaettu XY-pädi ja Vaultiin tallentuva tarkkuus."""
import asyncio
from datetime import date
import json
from pathlib import Path

from playwright.async_api import async_playwright, expect

ROOT = Path(__file__).resolve().parent
APP = (ROOT.parent / 'index.html').as_uri()
FAKE = (ROOT / 'fakegh.js').read_text()
DAY = date.today().isoformat()
HEADER = 'pvm,arvo\n'
SPEC = {'taulukot': [{'id': 'paiva', 'tiedosto': 'data/paiva.csv', 'sarakkeet': [
    {'id': 'arvo', 'nimi': 'Arvo', 'laji': 'luku'},
]}]}
FIXTURES = {'data/mittarit.json': json.dumps(SPEC), 'data/paiva.csv': HEADER,
            'pohjat/pikakirjaus.md': '## Seuranta\n- Arvo | xy 0-100 | #mittaus\n'}


async def drag_to(page, surface, x, y):
    box = await surface.bounding_box()
    assert box
    await page.mouse.move(box['x'] + 8, box['y'] + box['height'] - 8)
    await page.mouse.down()
    await page.mouse.move(box['x'] + (x + .5) * box['width'] / 10,
                          box['y'] + (9 - y + .5) * box['height'] / 10, steps=3)
    await expect(surface.locator('.xy-bubble')).to_be_visible()
    await page.mouse.up()


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
    await page.wait_for_function("KaikkiTesti.vault().files['pohjat/pikakirjaus.md']")
    await page.get_by_role('button', name='Pikakirjaus', exact=True).click()
    quick = page.locator('#quick-entry')
    picker = page.locator('#xy-picker')
    button = quick.get_by_role('button', name='Arvo', exact=True)
    out = picker.locator('#xy-output')
    await button.click()
    await drag_to(page, picker.locator('.xy-surface'), 7, 4)
    await expect(out).to_have_text('47')
    await picker.get_by_role('button', name='Peru', exact=True).click()
    await expect(button).to_have_attribute('aria-pressed', 'false')
    await button.click()
    await picker.get_by_label('Väli').select_option('1000')
    await picker.get_by_label('Tarkkuus').select_option('2')
    hundreds = picker.get_by_role('slider', name='Sadat')
    await hundreds.focus()
    await page.keyboard.press('ArrowRight')
    surfaces = picker.locator('.xy-surface')
    await drag_to(page, surfaces.nth(0), 7, 4)
    await drag_to(page, surfaces.nth(1), 5, 2)
    await expect(out).to_have_text('147,25')
    await picker.get_by_role('button', name='OK', exact=True).click()
    await expect(picker).to_be_hidden()
    assert await page.evaluate("__repo.get('pohjat/pikakirjaus.md')") == '## Seuranta\n- Arvo | xy 0-1000 ,01 | #mittaus\n'
    assert await page.evaluate("__repo.get('data/paiva.csv')") == HEADER
    await quick.get_by_role('button', name='Valmis', exact=True).click()
    await expect(quick).to_be_hidden()
    assert await page.evaluate("__repo.get('data/paiva.csv')") == HEADER + DAY + ',147.25\n'

    if width >= 1000:
        await page.get_by_role('tab', name='Kojelauta', exact=True).click()
    else:
        await page.locator('#roll').click()
        await page.locator('#section-dash').click()
    await page.locator('#dash-entry-open').click()
    dash = page.locator('#dash-entry')
    await dash.get_by_role('button', name='Valitse Arvo XY-pädillä').click()
    await picker.get_by_label('Väli').select_option('10')
    await picker.get_by_label('Tarkkuus').select_option('1')
    whole = picker.get_by_role('slider', name='Kokonaisosa')
    await whole.focus()
    await page.keyboard.press('Home')
    await page.keyboard.press('ArrowRight')
    frac = picker.get_by_role('slider', name='Desimaali')
    await frac.focus()
    await page.keyboard.press('ArrowRight')
    await expect(out).to_have_text('1,1')
    await picker.get_by_role('button', name='OK', exact=True).click()
    await expect(dash.get_by_label('Arvo', exact=True)).to_have_value('1.1')
    await dash.get_by_role('button', name='Tallenna', exact=True).click()
    await expect(dash).to_be_hidden()
    assert await page.evaluate("__repo.get('data/paiva.csv')") == HEADER + DAY + ',1.1\n'
    assert not errors, errors
    print(f'{width} px: XY-pädi, tarkkuuden tallennus ja mittarilomake toimivat')
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
