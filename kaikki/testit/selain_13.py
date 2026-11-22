"""Kaikki 0.13: mittarien kirjaus, päivärivi ja rinnakkaiset CSV-muutokset."""
import asyncio
from datetime import date, timedelta
import json
from pathlib import Path

from playwright.async_api import async_playwright, expect


HERE = Path(__file__).resolve().parent
APP = (HERE.parent / 'index.html').as_uri()
FAKE = (HERE / 'fakegh.js').read_text()
CSV = 'data/paiva.csv'
TODAY = date.today().isoformat()
YESTERDAY = (date.today() - timedelta(days=1)).isoformat()
TOMORROW = (date.today() + timedelta(days=1)).isoformat()
SEED = {
    'data/mittarit.json': json.dumps({'versio': 1, 'taulukot': [{
        'id': 'paiva', 'nimi': 'Päivä', 'avain': 'pvm', 'tiedosto': CSV,
        'sarakkeet': [
            {'id': 'energia', 'nimi': 'Energia', 'laji': 'asteikko', 'min': 1, 'max': 5},
            {'id': 'olo', 'nimi': 'Olo', 'laji': 'valinta', 'arvot': [['1', 'Matala'], ['2', 'Hyvä']]},
            {'id': 'treeni', 'nimi': 'Treeni', 'laji': 'kylla-ei'},
            {'id': 'paino', 'nimi': 'Paino', 'laji': 'luku', 'yksikko': 'kg'},
            {'id': 'muu', 'nimi': 'Muu', 'laji': 'luku', 'kirjaus': False},
        ],
    }]}),
    CSV: f'pvm,energia,olo,treeni,paino,muu\n{YESTERDAY},2,1,1,73,8\n{TODAY},2,1,0,72.5,9\n',
}


async def run(browser, width):
    context = await browser.new_context(viewport={'width': width, 'height': 860})
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
            if (!collided && options && options.method === 'PUT' && url.endsWith('/contents/data/paiva.csv')) {
                collided = true;
                repo.put('data/paiva.csv', repo.get('data/paiva.csv').replace(',2,1,0,72.5,9', ',2,2,0,72.5,9'));
            }
            return fakeFetch.apply(this, arguments);
        };''' % json.dumps(SEED)
    )
    await page.goto(APP)
    await page.wait_for_function("window.KaikkiTesti?.vault().files['data/paiva.csv']")
    if width >= 1000:
        await page.get_by_role('tab', name='Kojelauta', exact=True).click()
    else:
        await page.locator('#roll').click()
        await page.locator('#section-dash').click()

    open_entry = page.locator('#dash-entry-open')
    form = page.locator('#dash-entry-form')
    energy = form.get_by_label('Energia', exact=True)
    workout = form.get_by_label('Treeni', exact=True)
    weight = form.get_by_label('Paino (kg)', exact=True)
    day = form.get_by_label('Päivä', exact=True)
    save = page.locator('#dash-entry-save')

    await open_entry.click()
    await expect(day).to_have_value(TODAY)
    await expect(energy).to_have_value('2')
    await expect(form.get_by_label('Muu', exact=True)).to_have_count(0)
    await energy.fill('4')
    await workout.select_option('1')
    await save.click()
    await expect(page.locator('#dash-entry')).to_be_hidden()
    content = await page.evaluate("__repo.get('data/paiva.csv')")
    assert content == f'pvm,energia,olo,treeni,paino,muu\n{YESTERDAY},2,1,1,73,8\n{TODAY},4,2,1,72.5,9\n'

    await open_entry.click()
    await expect(energy).to_have_value('4')
    await energy.fill('3')
    await page.evaluate("__repo.put('data/paiva.csv', __repo.get('data/paiva.csv').replace(',4,2,1,72.5,9', ',5,2,1,72.5,9'))")
    await save.click()
    await expect(page.locator('#dash-entry-msg')).to_contain_text('Sama mittari muuttui')
    assert ',5,2,1,72.5,9' in await page.evaluate("__repo.get('data/paiva.csv')")
    await page.locator('#dash-entry-reload').click()
    await expect(energy).to_have_value('5')

    await day.fill(TOMORROW)
    await expect(weight).to_have_value('')
    await weight.fill('71.5')
    await save.click()
    await expect(page.locator('#dash-entry')).to_be_hidden()
    content = await page.evaluate("__repo.get('data/paiva.csv')")
    assert content.splitlines()[-1] == f'{TOMORROW},,,,71.5,'
    assert content.count(TOMORROW) == 1
    assert not errors, errors
    print(f'{width} px: kirjaus, uusi päivärivi ja rinnakkaiset muutokset toimivat')
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
