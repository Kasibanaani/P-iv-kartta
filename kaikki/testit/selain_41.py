"""Rakenne ja kaavaviitteet tallentuvat yhdessä myös repon muuttuessa."""
import asyncio
import json
from pathlib import Path

from playwright.async_api import async_playwright, expect

ROOT = Path(__file__).resolve().parent
APP = (ROOT.parent / 'index.html').as_uri()
FAKE = (ROOT / 'fakegh.js').read_text(encoding='utf8')
TARGET = 'taulukot/kokeilu/lahde.md'
OTHER = 'taulukot/kokeilu/yhteenveto.md'
BOARD = 'taulukot/kokeilu/_nakyma.md'
SOURCE = '---\ntyyppi: taulukko\notsikko: Lähde\n---\n| A | B |\n| --- | --- |\n| 9 | 24 |\n| 24 | 9 |\n'
SUMMARY = '---\ntyyppi: taulukko\notsikko: Yhteenveto\n---\n| Kaava |\n| --- |\n| =[[lahde]]!A1 |\n'
CARDS = '---\ntyyppi: kojelauta\n---\n| id | otsikko | laji | solu | min | max |\n| --- | --- | --- | --- | --- | --- |\n| k1 | Arvo | luku | [[lahde]]!A1 |  |  |\n'


async def check(browser, width):
    phone = width < 1000
    ctx = await browser.new_context(viewport={'width': width, 'height': 850}, has_touch=phone)
    page = await ctx.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    await page.add_init_script(FAKE + '''
      (() => {
        const seed = %s;
        for (const [path, body] of Object.entries(seed)) __repo.put(path, body);
        localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault', token:'x', branch:'main'}));
        localStorage.setItem('kaikki:taulukko', %s);
        const fetchGitHub = window.fetch;
        window.fetch = async (url, init) => {
          if (init.method === 'PATCH' && String(url).includes('/git/refs/heads/main')) {
            if (window.failRef) return new Response('{}', {status: 503});
            if (window.raceRef) {
              window.raceRef = false;
              __repo.put('_rinnakkainen.md', '# Rinnakkainen');
            }
            if (window.timeoutRef) {
              window.timeoutRef = false;
              await fetchGitHub(url, init);
              throw new Error('Verkkoyhteys katkesi vastauksen aikana');
            }
          }
          return fetchGitHub(url, init);
        };
      })();
    ''' % (json.dumps({TARGET: SOURCE, OTHER: SUMMARY, BOARD: CARDS}), json.dumps(TARGET)))
    await page.goto(APP)
    if phone:
        await page.locator('#roll').click()
        await page.locator('#section-sheets').click()
    else:
        await page.locator('#navbtn').click()
        await page.locator('#nav [data-tab="sheets"]').click()
    await expect(page.locator('#sg-wrap td[data-r="0"][data-c="0"]')).to_have_text('9')

    async def insert_row(flag=None):
        if flag:
            await page.evaluate('(flag) => { window[flag] = true; }', flag)
        await page.locator('#sg-wrap th.sg-rn[data-r="0"]').click()
        await page.locator('#sg-more').click()
        await page.locator('#sgs-row-ib').click()

    for flag in ('failRef', 'raceRef'):
        await insert_row(flag)
        await expect(page.locator('#undo')).to_be_visible()
        await expect(page.locator('#undo-t')).to_contain_text('Taulukkomuutosta ei voitu vahvistaa')
        assert await page.evaluate('paths => paths.map(p => __repo.get(p))', [TARGET, OTHER, BOARD]) == [SOURCE, SUMMARY, CARDS]
        await page.evaluate('(flag) => { window[flag] = false; }', flag)
        await page.wait_for_function('document.getElementById("undo").hidden', timeout=5000)

    await page.evaluate('([path, body]) => __repo.put(path, body)', [OTHER, SUMMARY + '| 18 |\n'])
    await insert_row('timeoutRef')
    await page.wait_for_function('([paths, target, ref]) => paths.every(p => __repo.get(p).includes(ref)) && __repo.get(target).includes("|  |  |")',
                                 arg=[[OTHER, BOARD], TARGET, '[[lahde]]!A2'])
    assert '| 18 |' in await page.evaluate('p => __repo.get(p)', OTHER)
    assert await page.evaluate('() => __repo.get("_rinnakkainen.md")') == '# Rinnakkainen'
    await expect(page.locator('#sg-wrap td[data-r="1"][data-c="0"]')).to_have_text('9')
    assert not errors, errors
    await ctx.close()
    print(f'{width} px: kaavojen, kortin ja taulukon yhteinen tallennus')


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
