"""0.89: säätimet kojelaudan ruutuina ja pikakirjauksen Napit-välilehdellä (jäsennys A6.2)."""
import datetime
import json
import re

from playwright.sync_api import expect, sync_playwright

from selain_64 import QuietHandler, ThreadingHTTPServer, Thread
from selain_68 import TESTS
from selain_72 import select_tab

TODAY = datetime.date.today()
DAY_PATH = f'paivat/{TODAY.year}/{TODAY.isoformat()}.md'
SAATIMET = 'pohjat/saatimet.md'
BOARD = 'data/kojelauta.md'
HEAD = ('| id | otsikko | muuttuja | laske | aika | tunniste | kansio | yksikko | nayta |\n'
        '| --- | --- | --- | --- | --- | --- | --- | --- | --- |\n')
DATA = {
    SAATIMET: ('# Säätimet\n\n## Kahvi\n- tunnus: kahvi\n- muuttuja: Kahvi (kpl)\n- arvo: 1\n\n'
               '## Paino\n- tunnus: paino\n- muuttuja: Paino (kg)\n- pikakirjaus: ei\n'),
    BOARD: HEAD,
    'pohjat/pikakirjaus.md': '## Seuranta\n- Treeni | kyllä | #treeni\n',
    'inbox/muuta.md': '# Muuta\n\nTeksti.\n',
}
LINE = r'- \(\(' + re.escape(f'{TODAY.day}.{TODAY.month}.{TODAY.year}') + r' klo \d\d\.\d\d, Kahvi \(kpl\) = 1, \^qh[a-z0-9-]+\)\)'


def repo(page, path):
    return page.evaluate('p => __repo.get(p) || ""', path)


def kahvit(page):
    return len(re.findall(LINE, repo(page, DAY_PATH)))


def run(browser, url, width):
    phone = width < 500
    page = browser.new_page(viewport={'width': width, 'height': 860}, is_mobile=phone, has_touch=phone, reduced_motion='reduce')
    page.set_default_timeout(8000)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.add_init_script((TESTS / 'fakegh.js').read_text() + """
      if (!__repo.kept) for (const [path, text] of Object.entries(%s)) __repo.put(path, text);
      localStorage.setItem('kaikki:gh', '{"repo":"testi/vault","token":"x","branch":"main"}');
    """ % json.dumps(DATA))
    page.goto(url)
    page.wait_for_function('p => KaikkiTesti.vault().files[p]', arg=SAATIMET)

    # Kojelauta: lisää säädinruutu olemassa olevasta säätimestä.
    select_tab(page, width, 'dash', 'Kojelauta')
    page.locator('#mvb-lock').click()
    page.locator('#mvb-add').click()
    ed = page.get_by_role('dialog', name='Uusi ruutu')
    ed.get_by_label('Ruudun tyyppi').select_option('saadin')
    expect(ed.get_by_label('Säädin', exact=True)).to_have_value('kahvi')
    expect(ed.get_by_label('Muuttuja', exact=True)).to_be_hidden()
    expect(ed.get_by_label('Tunniste (valinnainen)', exact=True)).to_be_hidden()
    expect(ed.locator('fieldset', has_text='Rajaukset')).to_be_hidden()
    ed.get_by_role('button', name='Tallenna').click()
    page.wait_for_function(r'p => /\|\s*saadin\s*\|/.test(__repo.get(p)) && __repo.get(p).includes("| kahvi |")', arg=BOARD)
    assert repo(page, BOARD).startswith(HEAD.split('\n')[0][:-1]), 'otsikkorivi säilyy yhteensopivana'

    # Uusi säädin suoraan ruudun editorista.
    page.locator('#mvb-add').click()
    ed.get_by_label('Ruudun tyyppi').select_option('saadin')
    ed.get_by_label('Säädin', exact=True).select_option('__uusi')
    new = page.get_by_role('dialog', name='Uusi säädin')
    new.get_by_role('textbox', name='Nimi').fill('Vesi')
    new.get_by_role('checkbox', name='Teksti').check()
    new.get_by_role('textbox', name='Teksti', exact=True).fill('Vesilasi')
    new.get_by_label('Minne').select_option('oma')
    new.get_by_role('checkbox', name='Näytä pikakirjauksessa').uncheck()
    new.get_by_role('button', name='Tallenna').click()
    page.wait_for_function('p => __repo.get(p).includes("## Vesi\\n- tunnus: vesi\\n- laji: kertanappi\\n- teksti: Vesilasi\\n- tapa: lisaa\\n- minne: oma\\n- aika: nyt\\n- pikakirjaus: ei")', arg=SAATIMET)
    expect(ed.get_by_label('Säädin', exact=True)).to_have_value('vesi')
    ed.get_by_role('textbox', name='Otsikko').fill('Juomat')
    ed.get_by_role('button', name='Tallenna').click()
    page.wait_for_function('p => __repo.get(p).includes("| Juomat | vesi |")', arg=BOARD)
    page.locator('#mvb-lock').click()

    tiles = page.locator('.saadin-card')
    expect(tiles).to_have_count(2)
    expect(page.locator('.saadin-card', has_text='Juomat').get_by_role('button', name='Kirjaa: Vesi')).to_be_visible()
    page.get_by_role('button', name='Kirjaa: Kahvi').click()
    page.wait_for_function('p => (__repo.get(p) || "").includes("Kahvi (kpl) = 1")', arg=DAY_PATH)
    assert kahvit(page) == 1, repo(page, DAY_PATH)
    undo = page.get_by_role('button', name='Kumoa: Kahvi')
    expect(undo).to_be_visible()
    box = undo.bounding_box()
    assert box['x'] + box['width'] >= width - 2
    undo.click()
    page.wait_for_function('p => !__repo.get(p).includes("Kahvi (kpl)")', arg=DAY_PATH)
    page.get_by_role('button', name='Kirjaa: Vesi').click()
    page.wait_for_function('() => !!__repo.get("inbox/saadin-vesi.md")')
    own = repo(page, 'inbox/saadin-vesi.md')
    assert own.startswith('---\ntyyppi: muistiinpano\notsikko: Vesi\n') and own.endswith('# Vesi\n\n- Vesilasi\n'), own

    # Pikakirjaus: Napit näyttää vain pikakirjaukseen valitut säätimet ja kirjaa heti.
    page.get_by_role('button', name='Pikakirjaus', exact=True).click()
    quick = page.get_by_role('dialog', name='Pikakirjaus', exact=True)
    quick.get_by_role('button', name='Napit', exact=True).click()
    expect(quick.get_by_label('Päivä', exact=True)).to_be_hidden()
    expect(quick.get_by_role('button', name='Kirjaa: Paino')).to_have_count(0)
    expect(quick.get_by_role('button', name='Kirjaa: Vesi')).to_have_count(0)
    quick.get_by_role('button', name='Kirjaa: Kahvi').click()
    page.wait_for_function('p => __repo.get(p).includes("Kahvi (kpl) = 1")', arg=DAY_PATH)
    expect(quick.locator('#quick-msg')).to_contain_text('Kahvi kirjattu')
    expect(quick.get_by_text('Napit kirjaavat heti.')).to_have_count(1)
    quick.get_by_role('button', name='Kumoa: Kahvi').click()
    page.wait_for_function('p => !__repo.get(p).includes("Kahvi (kpl)")', arg=DAY_PATH)
    quick.get_by_role('button', name='Kirjaa: Kahvi').click()
    quick.get_by_role('button', name='Kirjaa: Kahvi').click()
    page.wait_for_function('() => document.getElementById("saadin-undo-said").textContent && !document.querySelector("#quick-entry button:disabled")')
    page.wait_for_timeout(200)
    assert kahvit(page) == 2, repo(page, DAY_PATH)

    # Valinta muistetaan ja + Uusi nappi avaa säädineditorin.
    quick.get_by_role('button', name='Valmis', exact=True).click()
    page.get_by_role('button', name='Pikakirjaus', exact=True).click()
    expect(quick.get_by_role('button', name='Napit', exact=True)).to_have_attribute('aria-pressed', 'true')
    quick.get_by_role('button', name='+ Uusi nappi', exact=True).click()
    expect(page.get_by_role('dialog', name='Uusi säädin')).to_be_visible()
    page.get_by_role('dialog', name='Uusi säädin').get_by_role('button', name='Peru').click()
    quick.get_by_role('button', name='Seuranta', exact=True).click()
    expect(quick.get_by_role('button', name='Treeni', exact=True)).to_be_visible()
    expect(quick.get_by_text('Napit kirjaavat heti.')).to_have_count(0)
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), 'ei vaakavieritystä'
    assert not errors, errors
    page.context.close()
    print(f'{width} px: OK')


def run_empty(browser, url):
    """Ilman säätimiä: ruudun editorista tehdään ensimmäinen säädin, ja säätimien tiedosto syntyy."""
    page = browser.new_page(viewport={'width': 390, 'height': 800}, is_mobile=True, has_touch=True, reduced_motion='reduce')
    page.set_default_timeout(8000)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    seed = {k: v for k, v in DATA.items() if k != SAATIMET}
    page.add_init_script((TESTS / 'fakegh.js').read_text() + """
      if (!__repo.kept) for (const [path, text] of Object.entries(%s)) __repo.put(path, text);
      localStorage.setItem('kaikki:gh', '{"repo":"testi/vault","token":"x","branch":"main"}');
    """ % json.dumps(seed))
    page.goto(url)
    page.wait_for_function('p => KaikkiTesti.vault().files[p]', arg=BOARD)
    select_tab(page, 390, 'dash', 'Kojelauta')
    page.locator('#mvb-lock').click()
    page.locator('#mvb-add').click()
    ed = page.get_by_role('dialog', name='Uusi ruutu')
    ed.get_by_label('Ruudun tyyppi').select_option('saadin')
    expect(ed.get_by_label('Säädin', exact=True)).to_have_value('')
    page.wait_for_function('() => !document.querySelector(".vref.spin")')
    ed.get_by_role('button', name='Tallenna').click()
    expect(ed.locator('#mvb-msg')).to_contain_text('Valitse säädin')
    ed.get_by_label('Säädin', exact=True).select_option('__uusi')
    new = page.get_by_role('dialog', name='Uusi säädin')
    new.get_by_role('textbox', name='Nimi').fill('Kävely')
    new.get_by_role('checkbox', name='Aikaleima').check()
    new.get_by_role('button', name='Tallenna').click()
    page.wait_for_function('() => (__repo.get("pohjat/saatimet.md") || "").startsWith("---\\ntyyppi: pohja\\n")')
    expect(ed.get_by_label('Säädin', exact=True)).to_have_value('kavely')
    ed.get_by_role('button', name='Tallenna').click()
    page.wait_for_function('p => __repo.get(p).includes("| kavely |")', arg=BOARD)
    page.locator('#mvb-lock').click()
    page.get_by_role('button', name='Kirjaa: Kävely').click()
    page.wait_for_function('p => /\\n- klo \\d\\d\\.\\d\\d · Kävely\\n$/.test(__repo.get(p) || "")', arg=DAY_PATH)
    assert not errors, errors
    page.context.close()
    print('ilman säätimiä: OK')


if __name__ == '__main__':
    with ThreadingHTTPServer(('127.0.0.1', 0), QuietHandler) as server, sync_playwright() as p:
        Thread(target=server.serve_forever, daemon=True).start()
        browser = p.chromium.launch()
        try:
            for width in (320, 390, 1280, 1440):
                run(browser, f'http://127.0.0.1:{server.server_port}/', width)
            run_empty(browser, f'http://127.0.0.1:{server.server_port}/')
        finally:
            browser.close()
