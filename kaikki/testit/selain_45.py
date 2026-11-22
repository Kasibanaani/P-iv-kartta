"""Treeni kirjaa sarjat Vaultin nykyiseen CSV-muotoon."""
import asyncio
import datetime
import json

from playwright.async_api import async_playwright, expect

from selain_22 import APP, FAKE

CSV = 'data/treeni.csv'
SPEC = 'data/treeni-liikkeet.json'
HEADER = 'pvm,klo,treeni,liike,liike_id,sarja,kg,toistot'
TODAY = datetime.date.today().isoformat()
PAST = (datetime.date.today() - datetime.timedelta(days=7)).isoformat()
BEFORE = f'{HEADER}\n{PAST},18:00,vanha,Pystypunnerrus,m1,1,40,8\n'
MOVES = {
    'versio': 1,
    'liikkeet': [
        {'id': 'm1', 'nimi': 'Pystypunnerrus', 'askel': 2.5, 'tideal': 8, 'skerta': 3, 'paa': 'Hartiat'},
        {'id': 'm2', 'nimi': 'Kyykky', 'askel': 5, 'tideal': 6, 'paa': 'Jalat'},
        {'id': 'm3', 'nimi': 'Vanha liike', 'arkisto': True},
    ],
    'ryhmat': ['Hartiat', 'Jalat'],
    'treenit': [{'id': 'vanha', 'alku': PAST, 'loppu': PAST}],
    'asetukset': {'jakso': 7, 'tavoitteet': {'Hartiat': {'n': 6, 'pv': 7}}},
}


async def check(browser, width):
    context = await browser.new_context(viewport={'width': width, 'height': 860}, has_touch=width < 1000)
    page = await context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    await page.add_init_script(FAKE + '''
      for (const [path, text] of Object.entries(%s)) {
        if (!__repo.kept) __repo.put(path, text);
      }
      localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
      const fetchGitHub = window.fetch;
      window.fetch = async (url, init) => {
        if (window.loseReply && init.method === 'PUT' && String(url).includes('/contents/data/treeni.csv')) {
          window.loseReply = false;
          await fetchGitHub(url, init);
          throw new Error('Vastaus katosi, vaikka sarja tallentui.');
        }
        return fetchGitHub(url, init);
      };
    ''' % json.dumps({CSV: BEFORE, SPEC: json.dumps(MOVES)}))
    await page.goto(APP)
    if width >= 1000:
        await page.get_by_role('tab', name='Treeni', exact=True).click()
    else:
        await page.locator('#roll').click()
        await page.locator('#section-treeni').click()
    panel = page.locator('#p-treeni')
    await expect(panel.get_by_text('Sarja 1 / 3', exact=True)).to_be_visible()
    await expect(panel.get_by_text('Painoehdotus 40 kg')).to_be_visible()
    await expect(panel.get_by_role('button', name='Vanha liike')).to_have_count(0)
    await panel.get_by_role('button', name='Liikkeet', exact=True).click()
    await expect(panel.get_by_role('region', name='Liikkeet', exact=True)).to_contain_text('Pystypunnerrus')
    await panel.get_by_role('button', name='Lihasryhmät', exact=True).click()
    await expect(panel.get_by_role('region', name='Lihasryhmät', exact=True)).to_contain_text('Hartiat')
    await panel.get_by_role('button', name='Kirjaa', exact=True).click()
    assert await page.evaluate('p => __repo.get(p)', CSV) == BEFORE
    await panel.get_by_role('button', name='Paino (kg) lisää', exact=True).click()
    await expect(panel.get_by_role('textbox', name='Paino (kg)', exact=True)).to_have_value('42,5')
    await page.evaluate('window.loseReply = true')
    await panel.get_by_role('button', name='Kirjaa sarja').click()
    await expect(panel.get_by_role('status')).to_contain_text('Ei yhteyttä GitHubiin')
    await panel.get_by_role('button', name='Kirjaa sarja').click()
    await expect(panel.get_by_text('Sarja 2 / 3', exact=True)).to_be_visible()
    csv = await page.evaluate('p => __repo.get(p)', CSV)
    assert len(csv.splitlines()) == 3, csv
    assert csv.startswith(BEFORE) and ',m1,1,42.5,8\n' in csv
    await panel.get_by_role('button', name='Uusi treeni').click()
    await expect(panel.get_by_text('Sarja 1 / 3', exact=True)).to_be_visible()
    await panel.get_by_role('button', name='Kirjaa sarja').click()
    await expect(panel.get_by_text('Sarja 2 / 3', exact=True)).to_be_visible()
    lines = (await page.evaluate('p => __repo.get(p)', CSV)).splitlines()
    assert lines[2].split(',')[2] != lines[3].split(',')[2]
    assert lines[2].split(',')[0] == lines[3].split(',')[0] == TODAY
    assert await page.evaluate('p => JSON.parse(__repo.get(p)).treenit.length', SPEC) == 1
    assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    assert not errors, errors
    await context.close()
    print(f'{width} px: sarjat, liiketiedot ja uudelleenyritys')


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
