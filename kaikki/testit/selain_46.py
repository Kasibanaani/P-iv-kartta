"""Treeni-seuranta laskee päivä- ja viikkomäärät, maksimiarviot ja tavoitteet."""
import asyncio
import copy
import datetime
import json

from playwright.async_api import async_playwright, expect

from selain_45 import APP, FAKE, CSV, SPEC, HEADER, TODAY, PAST, MOVES


async def check(browser, width):
    context = await browser.new_context(viewport={'width': width, 'height': 860}, has_touch=width < 1000)
    page = await context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    model = copy.deepcopy(MOVES)
    model['liikkeet'][0].update({
        'sjakso': 4, 'sjaksoPv': 7, 'goals': [
            {'kg': 50, 'rep': 8, 'pvm': (datetime.date.today() + datetime.timedelta(days=20)).isoformat(),
             'luotu': PAST},
        ],
    })
    source = (
        f'{HEADER}\n{PAST},18:00,vanha,Pystypunnerrus,m1,1,40,8\n'
        f'{TODAY},09:00,uusi,Pystypunnerrus,m1,1,45,8\n'
        f'{TODAY},09:01,uusi,Pystypunnerrus,m1,2,40,8\n'
    )
    await page.add_init_script(FAKE + '''
      for (const [path, text] of Object.entries(%s)) __repo.put(path, text);
      localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
    ''' % json.dumps({CSV: source, SPEC: json.dumps(model)}))
    await page.goto(APP)
    if width >= 1000:
        await page.get_by_role('tab', name='Treeni', exact=True).click()
    else:
        await page.locator('#roll').click()
        await page.locator('#section-treeni').click()
    panel = page.locator('#p-treeni')
    await panel.get_by_role('button', name='Seuranta', exact=True).click()
    await expect(panel.get_by_role('img', name='2 treenipäivää 12 viikossa')).to_be_visible()
    await expect(panel.get_by_text('Tällä viikolla 2 sarjaa')).to_be_visible()
    await expect(panel.get_by_text('57 kg', exact=True)).to_be_visible()
    await expect(panel.get_by_role('progressbar', name='Hartiat', exact=True)).to_have_attribute('value', '2')
    await expect(panel.get_by_role('progressbar', name='Pystypunnerrus', exact=True)).to_have_attribute('value', '2')
    await expect(panel.get_by_role('progressbar', name='Pystypunnerrus · 50 kg × 8')).to_have_attribute('value', '50')
    assert await page.evaluate('p => __repo.get(p)', CSV) == source
    assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    assert not errors, errors
    await context.close()
    print(f'{width} px: 12 viikkoa, maksimiarvio ja tavoitteet')


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
