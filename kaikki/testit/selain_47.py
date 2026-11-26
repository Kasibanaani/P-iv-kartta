"""Treenisarjan pikakirjaus avaa esitäytön ilman sivuvaikutuksia."""
import asyncio
import json
from urllib.parse import urlencode

from playwright.async_api import async_playwright, expect

from selain_45 import APP, FAKE, CSV, SPEC, BEFORE, MOVES


async def check(browser, width):
    phone = width < 1000
    ctx = await browser.new_context(viewport={'width': width, 'height': 860}, has_touch=phone)
    page = await ctx.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    await page.add_init_script(FAKE + '''
      for (const [path, text] of Object.entries(%s)) __repo.put(path, text);
      localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
      localStorage.setItem('kaikki:calview','week');
    ''' % json.dumps({CSV: BEFORE, SPEC: json.dumps(MOVES)}))
    text = 'Treenisarja: kyykky; 8; 42,5'
    await page.goto(APP + '#' + urlencode({'kirjaa': text}))
    dialog = page.get_by_role('dialog', name='Treenisarja tekstinä')
    await expect(dialog.get_by_role('textbox')).to_have_value('kyykky; 8; 42,5')
    await dialog.get_by_role('button', name='Täytä sarja').click()
    treeni = page.locator('#p-treeni')
    await expect(treeni.get_by_role('textbox', name='Toistot', exact=True)).to_have_value('8')
    await expect(treeni.get_by_role('textbox', name='Paino (kg)', exact=True)).to_have_value('42.5')
    assert await page.evaluate('p => __repo.get(p)', CSV) == BEFORE
    await treeni.get_by_role('button', name='Kirjaa sarja').click()
    await expect(treeni.get_by_role('status')).to_have_text('Sarja 1 kirjattu.')
    data = await page.evaluate('p => __repo.get(p)', CSV)
    assert data.startswith(BEFORE) and ',Kyykky,m2,1,42.5,8\n' in data
    if phone:
        await page.locator('#roll').click()
        await page.locator('#section-cal').click()
    else:
        await page.locator('#navbtn').click(); await page.get_by_role('tab', name='Kalenteri', exact=True).click()
    await expect(page.get_by_text('Kirjattu: Treeni 1 sarja', exact=True)).to_be_visible()
    await page.locator('#quick-entry-mobile' if phone else '#quick-entry-desktop').click()
    await page.get_by_role('button', name='Treenisarja', exact=True).click()
    await expect(dialog).to_be_visible()
    await page.mouse.click(3, 3)
    await expect(dialog).to_be_hidden()
    assert await page.evaluate('p => __repo.get(p)', CSV) == data
    assert not errors, errors
    assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    await ctx.close()
    print(f'{width} px: tekstilinkki, pikakirjaus ja kalenterin kooste')


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
