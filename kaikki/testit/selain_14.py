"""Kaikki 0.14: kirjoitusohje, leikepöytä ja tekstin valinta."""
import asyncio
import json
from pathlib import Path

from playwright.async_api import async_playwright, expect

ROOT = Path(__file__).resolve().parent
APP = (ROOT.parent / 'index.html').as_uri()
FAKE = (ROOT / 'fakegh.js').read_text()
SPEC = {'taulukot': [{'id': 'paiva', 'tiedosto': 'data/paiva.csv', 'sarakkeet': [
    {'id': 'vire', 'nimi': 'Vire tänään', 'laji': 'asteikko', 'min': 2, 'max': 5},
    {'id': 'askel', 'nimi': 'Askel', 'laji': 'luku', 'kirjaus': False},
]}]}


async def test(browser, width):
    context = await browser.new_context(viewport={'width': width, 'height': 840})
    page = await context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    await page.add_init_script(FAKE + '''
        window.__repo.put('data/mittarit.json', %s);
        window.__repo.put('data/paiva.csv', 'pvm,vire,askel\\n');
        localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
        Object.defineProperty(navigator, 'clipboard', {value:{writeText(text) {
            if (window.denyClipboard) return Promise.reject(new Error('Denied'));
            window.copied = text; return Promise.resolve();
        }}});
    ''' % json.dumps(json.dumps(SPEC)))
    await page.goto(APP)
    await page.wait_for_function("window.KaikkiTesti?.vault().files['data/paiva.csv']")
    if width >= 1000:
        await page.locator('#deskmenu').click()
        await page.locator('#m-writing-guide').click()
    else:
        await page.locator('#menu').click()
        await page.locator('#m-writing-guide').click()
    guide = page.locator('#writing-guide')
    await expect(guide).to_be_visible()
    await expect(guide.get_by_role('textbox', name='Mittarit')).to_have_value('Mittarit: Vire tänään 2')
    await expect(guide.get_by_role('textbox', name='Muistiinpanon kentät')).to_be_visible()
    await guide.get_by_role('button', name='Kopioi esimerkki: Kalenteri').click()
    assert 'huomenna klo 9' in await page.evaluate('window.copied')
    await page.evaluate('window.denyClipboard = true')
    await guide.get_by_role('button', name='Kopioi esimerkki: Linkki muistiinpanoon').click()
    field = guide.get_by_role('textbox', name='Linkki muistiinpanoon')
    await expect(field).to_be_focused()
    assert await field.evaluate('(el) => el.selectionStart === 0 && el.selectionEnd === el.value.length')
    await page.keyboard.press('Escape')
    await expect(guide).to_be_hidden()
    assert not errors, errors
    print(f'{width} px: kirjoitusohje toimii')
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
