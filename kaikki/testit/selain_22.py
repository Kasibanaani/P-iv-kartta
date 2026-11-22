"""Kaikki 0.22: Muistion monivalinta, arkistointi ja roskakori."""
import asyncio
import json
from pathlib import Path

from playwright.async_api import async_playwright, expect

ROOT = Path(__file__).resolve().parent
APP = (ROOT.parent / 'index.html').as_uri()
FAKE = (ROOT / 'fakegh.js').read_text()
TITLES = ['Omena', 'Päärynä', 'Persikka']
FIXTURES = {f'inbox/{i}.md': f'---\ntyyppi: inbox\notsikko: {title}\nlahde: emil\n---\n# {title}\n'
            for i, title in enumerate(TITLES, start=1)}


async def test(browser, width):
    context = await browser.new_context(viewport={'width': width, 'height': 860})
    page = await context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    await page.add_init_script(FAKE + '''
      for (const [path, text] of Object.entries(%s)) window.__repo.put(path, text);
      localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
    ''' % json.dumps(FIXTURES))
    await page.goto(APP)
    if width >= 1000:
        await page.get_by_role('tab', name='Muistio', exact=True).click()
    else:
        await page.locator('#roll').click()
        await page.locator('#section-notes').click()
    notes = page.locator('#nlist')
    await expect(notes.get_by_text('Omena', exact=True)).to_be_visible()
    toggle = page.locator('#note-select-toggle')
    count = page.locator('#note-select-count')
    await toggle.click()
    await expect(count).to_have_text('Valittu 0')
    first = notes.get_by_role('checkbox', name='Valitse Omena', exact=True)
    second = notes.get_by_role('checkbox', name='Valitse Päärynä', exact=True)
    await first.check()
    await second.check()
    await expect(count).to_have_text('Valittu 2')
    await page.locator('#note-batch-archive').click()
    await expect(notes.get_by_text('Omena', exact=True)).to_have_count(0)
    await expect(notes.get_by_text('Päärynä', exact=True)).to_have_count(0)
    await page.get_by_role('button', name='Kumoa', exact=True).click()
    await expect(notes.get_by_text('Omena', exact=True)).to_be_visible()
    await expect(notes.get_by_text('Päärynä', exact=True)).to_be_visible()
    await expect(notes.get_by_text('Persikka', exact=True)).to_be_visible()

    if width < 1000:
        await page.locator('#nviewbtn').click()
    await toggle.click()
    await first.check()
    await second.check()
    await page.locator('#nsearch').fill('omena')
    await expect(count).to_have_text('Valittu 1')
    await page.locator('#nsearch').fill('')
    await expect(second).not_to_be_checked()
    await second.check()
    await page.locator('#note-batch-open').click()
    confirmation = page.get_by_role('dialog', name='Siirrä roskakoriin?', exact=True)
    await expect(confirmation).to_contain_text('2 valittua muistiinpanoa')
    await confirmation.get_by_role('button', name='Peru', exact=True).click()
    await expect(count).to_have_text('Valittu 2')
    assert await page.evaluate("!__repo.log.some(line => line.startsWith('DELETE '))")
    await page.locator('#note-batch-open').click()
    await confirmation.get_by_role('button', name='Siirrä roskakoriin', exact=True).click()
    await expect(confirmation).to_be_hidden()
    await expect(notes.get_by_text('Omena', exact=True)).to_have_count(0)
    await expect(notes.get_by_text('Päärynä', exact=True)).to_have_count(0)
    await expect(notes.get_by_text('Persikka', exact=True)).to_be_visible()
    await page.locator('#nmore-trash').click()
    await expect(page.get_by_role('button', name='Omena Poistettu', exact=False)).to_be_visible()
    await expect(page.get_by_role('button', name='Päärynä Poistettu', exact=False)).to_be_visible()
    await page.wait_for_function("__repo.get('arkisto/inbox/1.md') && __repo.get('arkisto/inbox/2.md') && !__repo.get('inbox/1.md') && !__repo.get('inbox/2.md')")
    assert await page.evaluate("Boolean(__repo.get('inbox/3.md'))")
    assert not errors, errors
    print(f'{width} px: monivalinta, arkistoinnin kumoaminen ja roskakori toimivat')
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
