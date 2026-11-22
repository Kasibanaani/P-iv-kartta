"""Kaikki 0.11: huoltopyynnöt, rinnakkainen kirjoitus ja Vaultin tiedostojen muokkaus."""
import asyncio
import json
from pathlib import Path

from playwright.async_api import async_playwright, expect


HERE = Path(__file__).resolve().parent
APP = (HERE.parent / 'index.html').as_uri()
FAKE = (HERE / 'fakegh.js').read_text()
REQUESTS = 'yllapito/pyynnot.md'
REQUEST_FILE = (
    '---\ntyyppi: loki\notsikko: Huoltopyynnöt\nnakyy: ei\n---\n'
    '# Huoltopyynnöt\n\n## Avoimet\n\n## Tehdyt\n\n'
    '- [x] 2026-11-20 · Järjestä · vanha\n'
)
GUIDE = '---\ntyyppi: ohje\notsikko: Testiohje\n---\n# Testiohje\n\nVanha sisältö.\n'
SEED = {
    REQUESTS: REQUEST_FILE,
    'yllapito/loki.md': '# Ylläpitoloki\n',
    'ohjeet/testiohje.md': GUIDE,
    'ohjeet/_hakemisto.md': '# Hakemisto\n',
    'inbox/remontti.md': '---\ntyyppi: inbox\nlahde: emil\notsikko: Remontti\n---\n# Remontti\n',
    'tieto/piilotettu.md': '---\nnakyy: ei\notsikko: Piilotettu\n---\n# Piilotettu\n',
    'arkisto/vanha.md': '---\nnakyy: ei\notsikko: Vanha\n---\n# Vanha\n',
}


async def run(browser, width):
    context = await browser.new_context(viewport={'width': width, 'height': 850})
    page = await context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    await page.add_init_script(
        FAKE + '''
        const repo = window.__repo;
        for (const [path, text] of Object.entries(%s)) repo.put(path, text);
        localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault', token:'testi', branch:'main'}));
        const fakeFetch = window.fetch;
        let collided = false;
        window.fetch = function(url, options) {
            if (!collided && options && options.method === 'PUT' && url.endsWith('/contents/yllapito/pyynnot.md')) {
                collided = true;
                repo.put('yllapito/pyynnot.md', repo.get('yllapito/pyynnot.md').replace(
                    '## Avoimet\\n', '## Avoimet\\n- [ ] 2026-11-21 · Rinnakkainen · muu\\n'
                ));
            }
            return fakeFetch.apply(this, arguments);
        };''' % json.dumps(SEED)
    )
    await page.goto(APP)
    await page.wait_for_function("window.KaikkiTesti?.vault().files['yllapito/pyynnot.md']")
    assert await page.evaluate("!__repo.log.some(entry => entry.startsWith('PUT '))")

    if width >= 1000:
        await page.locator('#deskmenu').click()
        await page.locator('#m-gh').click()
        await expect(page.locator('#gsheet')).to_be_visible()
        await page.mouse.click(2, 5)
        await expect(page.locator('#gsheet')).to_be_hidden()
        await page.locator('#deskmenu').click()
        await page.locator('#m-vwork').click()
        await page.get_by_role('button', name='Pyydä järjestämään: saapuneet', exact=True).click()
    else:
        await page.locator('#menu').click()
        await page.locator('#m-vreq').click()
        await page.get_by_role('button', name='Saapuneet', exact=True).click()

    await page.wait_for_function("(__repo.get('yllapito/pyynnot.md') || '').includes('Järjestä · inbox')")
    content = await page.evaluate("__repo.get('yllapito/pyynnot.md')")
    opened, done = content.split('## Tehdyt')
    assert 'Rinnakkainen · muu' in opened
    assert opened.count('Järjestä · inbox') == 1
    assert 'Järjestä · vanha' in done

    await page.locator('#nlist').get_by_text('Remontti', exact=True).click()
    await page.locator('#ns-more').click()
    await page.locator('#nsm-vreq').click()
    await expect(page.locator('#ns-vmsg')).to_contain_text('synkronointijonoon')
    await page.wait_for_function("(__repo.get('yllapito/pyynnot.md') || '').includes('Järjestä · [[remontti]]')")
    await page.keyboard.press('Escape')
    await expect(page.locator('#nsheet')).to_be_hidden()

    if width >= 1000:
        await page.locator('#deskmenu').click()
        await page.locator('#m-vwork').click()
    else:
        await page.locator('#menu').click()
        await page.locator('#m-vwork').click()
    files = page.locator('#vwork-files')
    await expect(files.get_by_role('button', name='Huoltopyynnöt', exact=True)).to_be_visible()
    await expect(files.get_by_role('button', name='loki', exact=True)).to_be_visible()
    await expect(files.get_by_role('button', name='Piilotettu', exact=True)).to_be_visible()
    await expect(files.get_by_role('button', name='Vanha', exact=True)).to_have_count(0)
    await expect(files.get_by_role('button', name='Hakemisto', exact=True)).to_have_count(0)
    await files.get_by_role('button', name='Testiohje', exact=True).click()
    await expect(page.locator('#ns-h')).to_have_text('Testiohje')
    await expect(page.locator('#ns-text')).to_have_value('# Testiohje\n\nVanha sisältö.\n')
    await page.locator('#ns-text').fill('# Testiohje\n\nPäivitetty sisältö.\n')
    await page.keyboard.press('Escape')
    await page.wait_for_function("(__repo.get('ohjeet/testiohje.md') || '').includes('Päivitetty sisältö.')")
    assert await page.evaluate("__repo.get('ohjeet/testiohje.md')") == GUIDE.replace(
        'Vanha sisältö.', 'Päivitetty sisältö.'
    )
    assert not await page.evaluate("__repo.log.some(entry => entry.startsWith('DELETE '))")
    assert not errors, errors
    print(f'{width} px: huoltopyynnöt ja Tekoälylle toimivat')
    await context.close()


async def main():
    async with async_playwright() as playwright:
        try:
            browser = await playwright.chromium.launch()
        except Exception:
            browser = await playwright.chromium.launch(executable_path='/opt/pw-browsers/chromium')
        async with browser:
            for width in (320, 390, 1280, 1440):
                await run(browser, width)


if __name__ == '__main__':
    asyncio.run(main())
