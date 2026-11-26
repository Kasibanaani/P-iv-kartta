"""Kaikki 0.18: mittarien pikakirjaus, muistutuksen päivät ja kalenterin yhteenveto."""
import asyncio
from datetime import date
import json
from pathlib import Path

from playwright.async_api import async_playwright, expect

ROOT = Path(__file__).resolve().parent
APP = (ROOT.parent / 'index.html').as_uri()
FAKE = (ROOT / 'fakegh.js').read_text()
TODAY = date.today().isoformat()
HEADER = 'pvm,treeni,vire,paino\n'
PRESETS = '## Seuranta\n- Treeni | kyllä | #treeni\n- Vire | 1-5\n- Paino | luku | kg\n\n## Muistutus\n- Vaihda suodatin | #koti\n'
SPEC = {'taulukot': [{'id': 'paiva', 'tiedosto': 'data/paiva.csv', 'sarakkeet': [
    {'id': 'treeni', 'nimi': 'Treeni', 'laji': 'kylla-ei'},
    {'id': 'vire', 'nimi': 'Vire', 'laji': 'asteikko', 'min': 1, 'max': 5},
    {'id': 'paino', 'nimi': 'Paino', 'laji': 'luku', 'yksikko': 'kg'},
]}]}


async def test(browser, width):
    context = await browser.new_context(viewport={'width': width, 'height': 860})
    page = await context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    await page.add_init_script(FAKE + '''
      if (!window.__repo.kept) {
        window.__repo.put('data/mittarit.json', %s);
        window.__repo.put('data/paiva.csv', %s);
        window.__repo.put('pohjat/pikakirjaus.md', %s);
      }
      localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
    ''' % (json.dumps(json.dumps(SPEC)), json.dumps(HEADER), json.dumps(PRESETS)))
    await page.goto(APP)
    await page.wait_for_function("KaikkiTesti.vault().files['pohjat/pikakirjaus.md']")
    start = page.get_by_role('button', name='Pikakirjaus', exact=True)
    dialog = page.locator('#quick-entry')
    await start.click()
    await expect(dialog.locator('#quick-day')).to_have_value(TODAY)
    await dialog.get_by_role('button', name='Treeni', exact=True).click()
    await dialog.get_by_role('button', name='Vire', exact=True).click()
    await dialog.get_by_role('button', name='4', exact=True).click()
    await dialog.get_by_role('button', name='Paino', exact=True).click()
    for key in ['7', '2', ',', '5', 'OK']:
        await dialog.get_by_role('button', name=key, exact=True).click()
    assert await page.evaluate("__repo.get('data/paiva.csv')") == HEADER
    if width < 1000:
        await page.mouse.click(3, 3)
    else:
        await page.keyboard.press('Escape')
    await expect(dialog).to_be_hidden()
    assert await page.evaluate("__repo.get('data/paiva.csv')") == HEADER + TODAY + ',1,4,72.5\n'
    assert await page.evaluate("__repo.log.filter(line => line === 'PUT /contents/data/paiva.csv').length") == 1

    await start.click()
    await dialog.get_by_role('button', name='Vire', exact=True).click()
    await dialog.get_by_role('button', name='3', exact=True).click()
    concurrent = HEADER + TODAY + ',1,2,72.5\n'
    await page.evaluate("text => __repo.put('data/paiva.csv', text)", concurrent)
    await dialog.get_by_role('button', name='Valmis', exact=True).click()
    await expect(dialog.locator('#quick-msg')).to_contain_text('Sama mittari muuttui GitHubissa')
    assert await page.evaluate("__repo.get('data/paiva.csv')") == concurrent
    await dialog.get_by_role('button', name='Valmis', exact=True).click()

    await start.click()
    await dialog.get_by_role('button', name='Muistutus', exact=True).click()
    reminder = dialog.get_by_role('button', name='Vaihda suodatin', exact=True)
    await reminder.click()
    dates = page.locator('#dsheet #ds-grid button[data-day]')
    await page.locator(f'#dsheet [data-day="{TODAY}"]').click()
    other = dates.nth(0 if date.today().day > 1 else 1)
    other_day = await other.get_attribute('data-day')
    await other.click()
    await page.keyboard.press('Escape')
    await page.wait_for_function("Object.entries(__repo.files).some(([path, file]) => path.startsWith('inbox/') && file.t.includes('#koti'))")
    await reminder.click()
    await expect(page.locator(f'#dsheet [data-day="{TODAY}"]')).to_have_attribute('aria-pressed', 'true')
    await expect(page.locator(f'#dsheet [data-day="{other_day}"]')).to_have_attribute('aria-pressed', 'true')
    await page.keyboard.press('Escape')
    await page.keyboard.press('Escape')
    await expect(dialog).to_be_hidden()
    await start.click()
    await expect(dialog.get_by_role('button', name='Muistutus', exact=True)).to_have_attribute('aria-pressed', 'true')
    await page.keyboard.press('Escape')

    if width >= 1000:
        await page.locator('#navbtn').click(); await page.get_by_role('tab', name='Kalenteri', exact=True).click()
    else:
        await page.locator('#roll').click()
        await page.locator('#section-cal').click()
    day = page.locator(f'#wklist .wkday[data-day="{TODAY}"]')
    await expect(day.locator('.wk-recorded')).to_have_text('Kirjattu: Treeni, Vire 2, Paino 72,5 kg')
    await expect(page.locator(f'#wklist .uline[data-day="{TODAY}"]').get_by_text('Vaihda suodatin #koti', exact=True)).to_be_visible()
    assert await page.evaluate('document.documentElement.scrollWidth === innerWidth')
    assert not errors, errors
    print(f'{width} px: mittarit, rinnakkainen kirjaus, muistutus ja kalenteririvi toimivat')
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
