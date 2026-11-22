"""Kaikki 0.27: Kojelaudan kortit, lukitus ja taulukkosolujen ohjaus."""
import asyncio
import json
from pathlib import Path

from playwright.async_api import async_playwright, expect

ROOT = Path(__file__).resolve().parent
APP = (ROOT.parent / 'index.html').as_uri()
FAKE = (ROOT / 'fakegh.js').read_text()
BOOK = 'taulukot/koe/'
GRID = '---\ntyyppi: taulukko\notsikko: Pohja\ntaulukko: Koe\n---\n# Pohja\n\n| A | B | C | D |\n| --- | --- | --- | --- |\n| 23 | 0 | valmis | =A1+1 |\n'
BOARD = '---\ntyyppi: kojelauta\notsikko: Kojelauta\n---\n# Kojelauta\n\n| id | otsikko | laji | solu | min | max |\n| --- | --- | --- | --- | --- | --- |\n| k1 | Laskettu | luku | [[pohja]]!D1 | | |\n| k2 | Täyttö | palkki | [[pohja]]!A1 | 0 | 50 |\n| k3 | Tila | teksti | [[pohja]]!C1 | | |\n| k4 | Käytössä | kytkin | [[pohja]]!B1 | | |\n| k5 | Säädä | liukusaadin | [[pohja]]!A1 | 0 | 50 |\n'


async def test(browser, width):
    context = await browser.new_context(viewport={'width': width, 'height': 860})
    page = await context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    await page.add_init_script(FAKE + '''
      if (!window.__repo.kept) {
        window.__repo.put('taulukot/koe/pohja.md', %s);
        window.__repo.put('taulukot/koe/_nakyma.md', %s);
      }
      localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
    ''' % (json.dumps(GRID), json.dumps(BOARD)))
    await page.goto(APP)
    await page.wait_for_function("KaikkiTesti.vault().files['taulukot/koe/_nakyma.md']")
    if width >= 1000:
        await page.get_by_role('tab', name='Kojelauta', exact=True).click()
    else:
        await page.locator('#roll').click()
        await page.locator('#section-dash').click()
    dashboard = page.get_by_role('region', name='Taulukon kortit', exact=True)
    def card(title):
        return dashboard.get_by_role('article').filter(has=page.get_by_role('heading', name=title, exact=True))
    await expect(card('Laskettu').get_by_text('24', exact=True)).to_be_visible()
    await expect(card('Tila').get_by_text('valmis', exact=True)).to_be_visible()
    await expect(card('Täyttö').locator('meter')).to_have_attribute('value', '23')
    toggle = dashboard.get_by_role('switch', name='Käytössä', exact=True)
    slider = dashboard.get_by_role('slider', name='Säädä', exact=True)
    await expect(toggle).to_be_disabled()
    await expect(slider).to_be_disabled()
    assert await page.evaluate("!__repo.log.some(line => line.startsWith('PUT '))")
    await dashboard.get_by_role('button', name='Muokkaa kortteja', exact=True).click()
    await toggle.check()
    await page.wait_for_function("__repo.get('taulukot/koe/pohja.md').includes('| 23 | 1 |')")
    await slider.focus()
    await page.keyboard.press('ArrowRight')
    await expect(card('Laskettu').get_by_text('25', exact=True)).to_be_visible()
    await expect(card('Täyttö').locator('meter')).to_have_attribute('value', '24')

    await dashboard.get_by_role('button', name='+ Kortti', exact=True).click()
    editor = page.locator('#board-edit')
    await editor.get_by_label('Otsikko').fill('Toinen luku')
    await editor.get_by_label('Solu', exact=True).fill('A1')
    await editor.get_by_role('button', name='Tallenna', exact=True).click()
    await expect(card('Toinen luku').get_by_text('24', exact=True)).to_be_visible()
    await dashboard.get_by_role('button', name='Muokkaa korttia Toinen luku', exact=True).click()
    await editor.get_by_label('Otsikko').fill('Uusi nimi')
    await editor.get_by_role('button', name='Tallenna', exact=True).click()
    await expect(card('Uusi nimi').get_by_text('24', exact=True)).to_be_visible()
    await dashboard.get_by_role('button', name='Lukitse kortit', exact=True).click()
    await expect(slider).to_be_disabled()
    assert await page.evaluate("__repo.get('taulukot/koe/_nakyma.md').includes('| Uusi nimi | luku | [[pohja]]!A1 |')")
    assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    assert not errors, errors
    print(f'{width} px: korttilajit, lukitus, muokkaus ja ohjaus toimivat')
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
