"""Kaikki 0.23: oma järjestys näppäimillä, raahaamalla ja uudelleen ladatessa."""
import asyncio
import json
from pathlib import Path

from playwright.async_api import async_playwright, expect

ROOT = Path(__file__).resolve().parent
APP = (ROOT.parent / 'index.html').as_uri()
FAKE = (ROOT / 'fakegh.js').read_text()
ORDER = 'nakymat/kaikki.md'
TITLES = ['Omena', 'Päärynä', 'Persikka']
FIXTURES = {f'inbox/{i}.md': f'---\ntyyppi: inbox\notsikko: {title}\nlahde: emil\n---\n# {title}\n'
            for i, title in enumerate(TITLES, start=1)}


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
    if width < 1000:
        await page.locator('#nviewbtn').click()
    await page.locator('#notesort').click()
    await page.get_by_role('menuitem', name='Oma järjestys', exact=True).click()
    headings = page.locator('#nlist .note-order-open')
    await expect(headings).to_have_text(TITLES)
    first = page.get_by_role('button', name='Siirrä Omena nuolinäppäimillä tai raahaamalla', exact=True)
    await first.focus()
    await page.keyboard.press('ArrowDown')
    await expect(headings).to_have_text(['Päärynä', 'Omena', 'Persikka'])
    saved = await page.evaluate('path => __repo.get(path)', ORDER)
    assert saved.index('inbox/2.md') < saved.index('inbox/1.md') < saved.index('inbox/3.md')
    concurrent = saved + '\n## Toisen laitteen huomio\n\nSäilytä tämä.\n'
    await page.evaluate('([path, text]) => __repo.put(path, text)', [ORDER, concurrent])
    await first.scroll_into_view_if_needed()
    start = await first.bounding_box()
    end = await headings.last.bounding_box()
    assert start and end
    await page.mouse.move(start['x'] + start['width'] / 2, start['y'] + start['height'] / 2)
    await page.mouse.down()
    await page.mouse.move(start['x'] + start['width'] / 2, end['y'] + end['height'] - 1, steps=4)
    await page.mouse.up()
    await expect(headings).to_have_text(['Päärynä', 'Persikka', 'Omena'])
    saved = await page.evaluate('path => __repo.get(path)', ORDER)
    assert 'Säilytä tämä.' in saved
    await page.locator('#nsearch').fill('omena')
    await expect(first).to_be_hidden()
    await page.locator('#nsearch').fill('')
    await expect(first).to_be_visible()
    await page.reload()
    await expect(headings).to_have_text(['Päärynä', 'Persikka', 'Omena'])
    await page.get_by_role('button', name='Omena', exact=True).click()
    await expect(page.locator('#ns-text')).to_have_value('Omena')
    assert not errors, errors
    print(f'{width} px: näppäinsiirto, raahaus ja Vaultin oma järjestys toimivat')
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
