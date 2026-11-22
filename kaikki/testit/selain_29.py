"""Kaikki 0.29: rivien sarakejärjestys ja minigraafit."""
import asyncio
import json
from pathlib import Path

from playwright.async_api import async_playwright, expect

ROOT = Path(__file__).resolve().parent
APP = (ROOT.parent / 'index.html').as_uri()
FAKE = (ROOT / 'fakegh.js').read_text()
FIXTURES = {
    'inbox/a.md': '---\ntyyppi: inbox\notsikko: Alku\nhinta: 12\ntrendikuva: 1,3,2\n---\n# Alku\n',
    'inbox/b.md': '---\ntyyppi: inbox\notsikko: Beta\nhinta: 3\ntrendikuva: 1,5;2,5\n---\n# Beta\n',
    'inbox/c.md': '---\ntyyppi: inbox\notsikko: Gamma\n---\n# Gamma\n',
    'data/paiva.csv': 'pvm,arvo\n2026-11-20,4\n2026-11-21,7\n2026-11-22,6\n',
    'nakymat/seuranta.md': '---\ntyyppi: nakyma\notsikko: Seuranta\nnakyy: ei\nsarakkeet:\n  - otsikko\n  - hinta | luku | €\n  - trendikuva | minigraafi\n  - mittarit | minigraafi | data/paiva.csv:arvo\n---\n',
}


async def test(browser, width):
    context = await browser.new_context(viewport={'width': width, 'height': 860})
    page = await context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    await page.add_init_script(FAKE + '''
      for (const [path, text] of Object.entries(%s)) window.__repo.put(path, text);
      localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
      localStorage.setItem('kaikki:nview','nakymat/seuranta.md');
    ''' % json.dumps(FIXTURES))
    await page.goto(APP)
    if width < 1000:
        await page.locator('#nviewbtn').click()
    notes = page.locator('#nlist')
    titles = notes.locator('.rvt')
    await expect(titles).to_have_text(['Alku', 'Beta', 'Gamma'])
    row = notes.locator('.rvr').filter(has=page.get_by_text('Beta', exact=True))
    await expect(row.get_by_role('img', name='Minigraafi, 2 arvoa. Pienin 1,5, suurin 2,5, viimeisin 2,5.')).to_have_count(1)
    await expect(row.get_by_role('img', name='Minigraafi, 3 arvoa. Pienin 4, suurin 7, viimeisin 6.')).to_have_count(1)
    await page.get_by_role('button', name='Hinta, järjestä', exact=True).click()
    await expect(titles).to_have_text(['Beta', 'Alku', 'Gamma'])
    await page.get_by_role('button', name='Hinta, nouseva järjestys', exact=True).click()
    await expect(titles).to_have_text(['Alku', 'Beta', 'Gamma'])
    await page.get_by_role('button', name='Hinta, laskeva järjestys', exact=True).click()
    await expect(page.get_by_role('button', name='Hinta, järjestä', exact=True)).to_be_focused()
    assert await page.evaluate("!__repo.log.some(line => line.startsWith('PUT '))")
    assert not errors, errors
    print(f'{width} px: sarakejärjestys, tyhjät arvot ja molemmat minigraafilähteet toimivat')
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
