"""Kaikki 0.25: kaavojen lukutila ja näkymien kaavasarakkeet."""
import asyncio
import json
from pathlib import Path

from playwright.async_api import async_playwright, expect

ROOT = Path(__file__).resolve().parent
APP = (ROOT.parent / 'index.html').as_uri()
FAKE = (ROOT / 'fakegh.js').read_text()
NOTE = '---\ntyyppi: inbox\notsikko: Budjetti\ntagit: [remontti]\nhinta: 2,5\njaljella: =20-[[piha]].hinta\n---\n# Budjetti\n\nYhteensä {=SUMMA(hinta; tunniste = remontti)} ja {=[[piha]].hinta}.\nVirhe {=[[puuttuu]].hinta}.\n'
PIHA = '---\ntyyppi: inbox\notsikko: Piha\n---\n# Piha\n\nhinta: 3\n#remontti\n'
FIXTURES = {'inbox/budjetti.md': NOTE, 'inbox/piha.md': PIHA,
            'ohjeet/muistiinpanot.md': '## Omat kentät (Emil)\n- **Sovitut kentät:** `hinta`.\n',
            'nakymat/laskelma.md': '---\ntyyppi: nakyma\notsikko: Laskelma\nnakyy: ei\nsarakkeet:\n  - otsikko\n  - hinta | luku | €\n  - jaljella | luku | €\n  - =SUMMA(hinta; tunniste = remontti) | luku | €\n  - =YHDISTÄ("a|b"; "!") | siru\n  - =[[puuttuu]].hinta | luku | €\n---\n'}


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
    notes = page.locator('#nlist')
    await notes.get_by_text('Budjetti', exact=width >= 1000).click()
    note = page.locator('#nsheet')
    values = note.locator('.formula-result-text')
    await expect(values).to_have_text(['5,5', '3', '#PUUTTUU'])
    await expect(note.locator('#ns-formula-results')).to_have_text('Kaavojen tulokset: 5,5, 3, #PUUTTUU')
    await page.evaluate('text => __repo.put("inbox/piha.md", text)', PIHA.replace('hinta: 3', 'hinta: 5'))
    await page.evaluate('KaikkiTesti.pull()')
    await expect(values).to_have_text(['7,5', '5', '#PUUTTUU'])
    assert 'SUMMA(hinta' in await note.locator('#ns-text').input_value()
    await page.keyboard.press('Escape')
    if width < 1000:
        await page.locator('#nviewbtn').click()
    await page.locator('#nvpick').click()
    await page.get_by_role('menuitem', name='Laskelma', exact=True).click()
    summary = notes.locator('.rvr').filter(has=page.get_by_text('Budjetti', exact=True))
    await expect(summary.locator('.rvc')).to_have_text(['Budjetti', '2,5 €', '15 €', '7,5 €', 'a|b!', '#PUUTTUU'])
    await expect(summary.locator('.formula-error')).to_have_text('#PUUTTUU')
    garden = notes.locator('.rvr').filter(has=page.get_by_text('Piha', exact=True))
    await expect(garden.locator('.rvc').nth(1)).to_have_text('5 €')
    assert await page.evaluate("__repo.get('inbox/budjetti.md')") == NOTE
    assert await page.evaluate("!__repo.log.some(line => line.startsWith('PUT '))")
    assert not errors, errors
    print(f'{width} px: kaavat, tuoreet lähdearvot ja rivisarakkeet toimivat')
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
