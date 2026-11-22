"""Kaikki 0.21: rivinäkymä täyttää tietokoneella muistiolle varatun tilan."""
import asyncio
import json
from pathlib import Path

from playwright.async_api import async_playwright, expect

ROOT = Path(__file__).resolve().parent
APP = (ROOT.parent / 'index.html').as_uri()
FAKE = (ROOT / 'fakegh.js').read_text()
VIEW = '---\ntyyppi: nakyma\notsikko: Paljon sarakkeita\nnakyy: ei\nsarakkeet:\n  - otsikko\n' + ''.join(f'  - kentta{i}\n' for i in range(18)) + '---\n'
NOTE = '---\ntyyppi: inbox\notsikko: Ensimmäinen rivi\n---\n# Ensimmäinen rivi\nTekstiä.\n'


async def test(browser, width):
    context = await browser.new_context(viewport={'width': width, 'height': 860})
    page = await context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    await page.add_init_script(FAKE + '''
      window.__repo.put('nakymat/laaja.md', %s);
      window.__repo.put('inbox/rivi.md', %s);
      localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
      localStorage.setItem('kaikki:nview','nakymat/laaja.md');
    ''' % (json.dumps(VIEW), json.dumps(NOTE)))
    await page.goto(APP)
    if width >= 1000:
        await page.get_by_role('tab', name='Muistio', exact=True).click()
    else:
        await page.locator('#roll').click()
        await page.locator('#section-notes').click()
        await page.locator('#nviewbtn').click()
    listbox = page.get_by_role('region', name='Muistiinpanojen rivit', exact=True)
    await expect(listbox.get_by_text('Ensimmäinen rivi', exact=True)).to_be_visible()
    widths = await page.locator('#p-notes').evaluate('panel => { const css = getComputedStyle(panel.parentElement); return [panel.clientWidth, panel.parentElement.clientWidth - parseFloat(css.paddingLeft) - parseFloat(css.paddingRight)]; }')
    assert abs(widths[0] - widths[1]) <= 1, widths
    position = await listbox.evaluate('''list => {
      list.scrollLeft = 200;
      list.dispatchEvent(new Event('scroll'));
      return [list.scrollLeft, document.querySelector('.rvh').scrollLeft,
              list.querySelector('.rvt').getBoundingClientRect().left - list.getBoundingClientRect().left];
    }''')
    assert position[:2] == [200, 200] and abs(position[2]) <= 1, position
    assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    await page.locator('#nviewbtn').click()
    await expect(page.locator('#p-notes .ncard').get_by_text('Ensimmäinen rivi')).to_be_visible()
    if widths[1] > 1100:
        assert await page.locator('#p-notes').evaluate('panel => panel.clientWidth') == 1100
    assert not errors, errors
    print(f'{width} px: rivien leveys, otsikon vieritys ja korttien leveys toimivat')
    await context.close()


async def main():
    async with async_playwright() as playwright:
        try:
            browser = await playwright.chromium.launch()
        except Exception:
            browser = await playwright.chromium.launch(executable_path='/opt/pw-browsers/chromium')
        async with browser:
            for width in (320, 390, 1280, 1440, 1920):
                await test(browser, width)


if __name__ == '__main__':
    asyncio.run(main())
