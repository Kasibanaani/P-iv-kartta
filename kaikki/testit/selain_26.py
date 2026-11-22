"""Kaikki 0.26: taulukkotiedostot, solujen muokkaus ja välilehtiviittaukset."""
import asyncio
import json
from pathlib import Path

from playwright.async_api import async_playwright, expect

ROOT = Path(__file__).resolve().parent
APP = (ROOT.parent / 'index.html').as_uri()
FAKE = (ROOT / 'fakegh.js').read_text()
SHEET = 'taulukot/koe/kulut.md'
FIXTURES = {
    'taulukot/aineisto/lahde.md': '---\ntyyppi: taulukko\notsikko: Lähde\n---\n# Lähde\n\n| A |\n| --- |\n| 5 |\n',
    'inbox/budjetti.md': '---\ntyyppi: inbox\notsikko: Budjetti\nhinta: 2\n---\n# Budjetti\n',
}


async def test(browser, width):
    context = await browser.new_context(viewport={'width': width, 'height': 860}, accept_downloads=True)
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
    await page.wait_for_function("KaikkiTesti.vault().files['taulukot/aineisto/lahde.md']")
    if width >= 1000:
        await page.get_by_role('tab', name='Taulukot', exact=True).click()
    else:
        await page.locator('#roll').click()
        await page.locator('#section-sheets').click()
    panel = page.locator('#p-sheets')
    async def menu(item):
        await page.locator('#sg-more').click()
        await page.locator('#' + item).click()
    await menu('sgm-new')
    creation = page.locator('#sheet-new')
    await creation.get_by_label('Taulukon nimi').fill('Koe')
    await creation.get_by_label('Välilehden nimi').fill('Kulut')
    await creation.get_by_role('button', name='Luo', exact=True).click()
    await expect(creation).to_be_hidden()
    grid = panel.get_by_role('region', name='Kulut', exact=True)
    await expect(grid.get_by_role('grid')).to_be_visible()

    def cell(address):
        col = ord(address[0]) - 65
        row = int(address[1:]) - 1
        return page.locator(f'#sg-wrap td[data-r="{row}"][data-c="{col}"]')

    async def edit(address, value):
        await cell(address).click()
        await page.keyboard.type(value)
        await page.keyboard.press('Enter')

    async def saved(text):
        await page.wait_for_function('([p, t]) => (__repo.get(p) || "").includes(t)', arg=[SHEET, text], timeout=8000)

    await edit('A1', '4')
    await edit('B1', '=A1+[[lahde]]!A1+[[budjetti]].hinta')
    await expect(grid.get_by_role('gridcell', name='Solu B1, 11', exact=True)).to_be_visible()
    await saved('[[lahde]]!A1')
    await menu('sgm-row')
    await expect(cell('A2')).to_be_visible()
    await edit('A2', '2')
    await edit('C1', '=SUMMA(A1:A2)')
    await expect(grid.get_by_role('gridcell', name='Solu C1, 6', exact=True)).to_be_visible()
    await saved('SUMMA(A1:A2)')
    await menu('sgm-tab')
    await creation.get_by_label('Välilehden nimi').fill('Lisä')
    await creation.get_by_role('button', name='Luo', exact=True).click()
    tabs = panel.get_by_role('group', name='Välilehdet')
    await expect(tabs.get_by_role('button', name='Lisä', exact=True)).to_have_attribute('aria-pressed', 'true')
    await tabs.get_by_role('button', name='Kulut', exact=True).click()
    async with page.expect_download() as download_info:
        await menu('sgm-csv')
    download = await download_info.value
    assert download.suggested_filename == 'kulut.csv'
    assert '"4","11","6"' in (await download.path()).read_text()

    await edit('A1', '8')
    await page.evaluate('path => __repo.put(path, __repo.get(path).replace("| 4 |", "| 9 |"))', SHEET)
    await expect(tabs.get_by_role('button', name='Kulut · ristiriitakopio', exact=True)).to_have_attribute('aria-pressed', 'true', timeout=10000)
    assert '| 9 |' in await page.evaluate('path => __repo.get(path)', SHEET)
    assert await page.evaluate("Object.entries(__repo.files).some(([path,file]) => path.includes('-ristiriita-') && file.t.includes('| 8 |'))")
    assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    assert not errors, errors
    print(f'{width} px: Taulukot, välilehdet, kaavat, CSV ja ristiriitakopio toimivat')
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
