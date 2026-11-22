"""Päivän vaihtuminen ja päättynyt toisto eivät kirjoita Vaultiin."""
import asyncio
import json

from playwright.async_api import async_playwright

from selain_22 import APP, FAKE

REPEATING = 'inbox/loppunut.md'
RELATIVE = 'inbox/suhteellinen.md'
SEED = {
    REPEATING:
        '---\ntyyppi: inbox\notsikko: Loppunut\nluotu: 2025-02-03\nlahde: emil\n---\n'
        '# Loppunut\nJoka maanantai alkaen 10.2.2025 ja päättyen 17.2.2025.\n',
    RELATIVE:
        '---\ntyyppi: inbox\notsikko: Suhteellinen\nluotu: 2025-02-03\nlahde: emil\n'
        'juuri: {"rel":[{"w":"huomenna","o":"huomenna","at":"2025-02-03T12:00:00Z","d":"2025-02-04"}]}\n---\n'
        '# Suhteellinen\nSoita huomenna.\n',
}


async def check(browser, width):
    context = await browser.new_context(viewport={'width': width, 'height': 850})
    page = await context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    await page.add_init_script(FAKE + '''
      if (!__repo.kept) for (const [path, text] of Object.entries(%s)) __repo.put(path, text);
      localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
    ''' % json.dumps(SEED))
    await page.goto(APP)
    await page.wait_for_function('KaikkiTesti.notes().filter(n => n.rep === "rx").length === 1')
    await page.wait_for_function('__repo.log.includes("GET /contents/listat/listat.json")')
    await page.evaluate('KaikkiTesti.collect()')
    mutations = await page.evaluate('() => __repo.log.filter(line => !line.startsWith("GET "))')
    assert not mutations, (mutations, await page.evaluate('() => __repo.files'))
    assert await page.evaluate('paths => paths.map(p => __repo.get(p))', [REPEATING, RELATIVE]) == list(SEED.values())
    await page.reload()
    await page.wait_for_function('__repo.log.includes("GET /contents/listat/listat.json")')
    count = await page.evaluate('() => KaikkiTesti.notes().filter(n => n.rep === "rx").length')
    assert count == 1, count
    mutations = await page.evaluate('() => __repo.log.filter(line => !line.startsWith("GET "))')
    assert not mutations, (mutations, await page.evaluate('() => __repo.files'))
    assert not errors, errors
    await context.close()
    print(f'{width} px: alkuperäiset tiedostot säilyivät ja ilmoitus pysyi laitteella')


async def main():
    async with async_playwright() as playwright:
        try:
            browser = await playwright.chromium.launch()
        except Exception:
            browser = await playwright.chromium.launch(executable_path='/opt/pw-browsers/chromium')
        async with browser:
            for width in (1440, 1280, 390, 320):
                await check(browser, width)


if __name__ == '__main__':
    asyncio.run(main())
