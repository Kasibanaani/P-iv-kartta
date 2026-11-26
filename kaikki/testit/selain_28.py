"""Kaikki 0.28: valitut Asiat muuttuvat tunnisteiksi osuvissa muistiinpanoissa."""
import asyncio
import json
from pathlib import Path

from playwright.async_api import async_playwright, expect

ROOT = Path(__file__).resolve().parent
APP = (ROOT.parent / 'index.html').as_uri()
FAKE = (ROOT / 'fakegh.js').read_text()
FIXTURES = {
    'inbox/piha.md': '---\ntyyppi: inbox\notsikko: Pihan hoito\ntagit: [oma]\n---\n# Pihan hoito\n\nKäynnissä on piharemontti.\n',
    'inbox/loma.md': '---\ntyyppi: inbox\notsikko: Pieni loma\n---\n# Pieni loma\n\nEdessä on mökkireissu.\n',
}
TERMS = [{'id':'t1','name':'Pihan remontti','yes':['piharemontti'],'no':[]},
         {'id':'t2','name':'Mökki','yes':['mökkireissu'],'no':[]}]


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
    await page.wait_for_function("KaikkiTesti.vault().files['inbox/piha.md']")
    # 0.100: ajastettu keräys (vCollect) tallentaa apin muistissa olevan tilan. Aja se ennen syötettä, ettei se korvaa
    # testin kirjoittamaa tallennusta ennen uudelleenlatausta (kilpailutilanne oli jo 0.99:ssä).
    await page.wait_for_function("!KaikkiTesti.status().includes('…')")
    await page.evaluate('KaikkiTesti.collect()')
    await page.wait_for_function("!KaikkiTesti.status().includes('…') && !Object.keys(KaikkiTesti.vault().q).length")
    await page.evaluate('''terms => {
      const db = JSON.parse(localStorage.getItem('kaikki:v1'));
      db.kokonaisuudet[0].termit = terms;
      localStorage.setItem('kaikki:v1', JSON.stringify(db));
    }''', TERMS)
    # Chromium vie localStorage-kirjoitukset perille viiveellä (koottuna, noin 5 s): uudelleen ladattu sivu voi muuten lukea
    # vanhan arvon (sama ilmiö kuin fakegh.js:n sessionStorage-huomautuksessa).
    await page.wait_for_timeout(5500)
    await page.reload()
    await page.locator('#filterpick').click()
    filters = page.locator('#fsheet')
    await filters.get_by_role('button', name='Tuo Asioita tunnisteiksi').click()
    chooser = page.locator('#tag-migration')
    selection = chooser.get_by_role('checkbox', name='Pihan remontti #pihan-remontti · 1 muistiinpanoa')
    other = chooser.get_by_role('checkbox', name='Mökki #mökki · 1 muistiinpanoa')
    await expect(selection).to_be_visible()
    await expect(other).not_to_be_checked()
    await selection.check()
    assert not await page.evaluate("__repo.log.some(line => line.startsWith('PUT '))")
    await chooser.get_by_role('button', name='Lisää tunnisteet', exact=True).click()
    await expect(chooser).to_be_hidden()
    await page.wait_for_function("__repo.get('inbox/piha.md').includes('tagit: [oma, pihan-remontti]')")
    assert 'Käynnissä on piharemontti.' in await page.evaluate("__repo.get('inbox/piha.md')")
    assert await page.evaluate("__repo.get('inbox/loma.md')") == FIXTURES['inbox/loma.md']
    await expect(filters.get_by_role('button', name='#pihan-remontti', exact=True)).to_be_visible()
    await filters.get_by_role('button', name='Tuo Asioita tunnisteiksi').click()
    await expect(chooser.get_by_role('checkbox', name='Pihan remontti #pihan-remontti · 0 muistiinpanoa')).to_be_disabled()
    await page.keyboard.press('Escape')
    assert await page.evaluate("JSON.parse(localStorage.getItem('kaikki:v1')).kokonaisuudet[0].termit.length") == 2
    assert not errors, errors
    print(f'{width} px: valitut Asiat lisätään tunnisteiksi ja alkuperäinen säilyy')
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
