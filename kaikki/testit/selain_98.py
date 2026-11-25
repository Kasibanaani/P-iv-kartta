"""Kojelaudan veto ja Muistion nappisarake puhelimessa ja tietokoneella."""
import json
from pathlib import Path
import re

from playwright.sync_api import expect, sync_playwright

from selain_86 import LAYOUT, QuietHandler, Thread, ThreadingHTTPServer, page_with_data
from selain_72 import select_tab
from selain_80 import press
from selain_88 import SAATIMET

VIEW = 'nakymat/kirjaukset.md'
NOTE = 'inbox/ensimmainen.md'
OTHER = 'inbox/toinen.md'
PRESETS = (
    '## Merkitse\n- tunnus: merkitse\n- teksti: Merkintä riville\n'
    '- minne: oma\n- aika: paiva\n\n'
    '## Kirjaa määrä\n- tunnus: maara\n- muuttuja: Testimäärä\n'
    '- minne: [[ensimmainen]]\n- aika: kysy\n'
)
DATA = {
    VIEW: '---\ntyyppi: nakyma\notsikko: Kirjaukset\nmista: kansio = inbox\n'
          'sarakkeet:\n  - otsikko\n  - nappi(maara) | w=140\n  - nappi(puuttuva)\n---\n# Kirjaukset\n',
    NOTE: '# Ensimmäinen\n\nEnsimmäinen teksti.\n',
    OTHER: '# Toinen\n\nToinen teksti.\n',
    SAATIMET: PRESETS,
}


def point(locator):
    box = locator.bounding_box()
    assert box
    return box['x'] + box['width'] / 2, box['y'] + box['height'] / 2


def dashboard(browser, url, width):
    page = page_with_data(browser, url, width)
    phone = width < 500
    select_tab(page, width, 'dash', 'Kojelauta')
    page.locator('#mvb-lock').click()
    grid = page.locator('.dash-grid')
    tile = grid.locator('[data-id="o0"]')
    resize = tile.get_by_role('button', name='Muuta kokoa · Havainto 0')
    move = tile.get_by_role('button', name='Siirrä Havainto 0')
    main = page.locator('#main')
    size = tile.bounding_box()
    cdp = page.context.new_cdp_session(page) if phone else None

    def gesture(action, x=0, y=0):
        if phone:
            cdp.send('Input.dispatchTouchEvent', {
                'type': {'down': 'touchStart', 'move': 'touchMove', 'up': 'touchEnd', 'cancel': 'touchCancel'}[action],
                'touchPoints': [{'x': x, 'y': y}] if action in ('down', 'move') else [],
            })
        elif action == 'move':
            page.mouse.move(x, y)
        elif action == 'down':
            page.mouse.move(x, y)
            page.mouse.down()
        else:
            page.mouse.up()

    def writes():
        return page.evaluate("p => __repo.log.filter(x => x === 'PUT /contents/' + p).length", LAYOUT)

    # Lyhyt veto seuraa liikettä. Ruudukko ja holvi pysyvät paikallaan.
    x, y = point(resize)
    gesture('down', x, y)
    gesture('move', x - 12, y + 24)
    live = tile.locator('.dash-size-preview:not(.dash-size-snap)')
    expect(live).to_be_visible()
    assert live.bounding_box()['height'] > size['height'] + 10
    assert tile.bounding_box()['height'] == size['height']
    gesture('move', x, y)
    page.wait_for_function("h => Math.abs(document.querySelector('.dash-size-preview:not(.dash-size-snap)').getBoundingClientRect().height - h) < 1", arg=size['height'])
    if phone:
        gesture('cancel')
    else:
        page.keyboard.press('Escape')
        gesture('up')
    expect(live).to_have_count(0)
    assert writes() == 0
    assert tile.bounding_box()['height'] == size['height']

    # Pidempi veto näyttää ruudukkoon sopivan koon ja tallentaa kerran.
    gesture('down', x, y)
    gesture('move', x - 10, y + 112)
    snap = tile.locator('.dash-size-snap')
    expect(snap).to_be_visible()
    assert snap.bounding_box()['height'] == 210
    gesture('up')
    page.wait_for_function("p => __repo.get(p) && Object.values(JSON.parse(__repo.get(p)).items).some(x => x.height === 2)", arg=LAYOUT)
    assert writes() == 1
    assert tile.bounding_box()['height'] >= 210

    # Nostettu ruutu liikkuu kosketuksen tai hiiren mukana, ja pudotussuunta näkyy.
    other = grid.locator('[data-id="o1"]')
    x, y = point(move)
    box = other.bounding_box()
    gesture('down', x, y)
    gesture('move', box['x'] + box['width'] * .75, box['y'] + box['height'] * .75)
    expect(other).to_have_class(re.compile('dash-drop-after'))
    assert abs(tile.bounding_box()['y'] - size['y']) > 40
    gesture('up')
    expect(grid.locator('.dash-tile').first).to_have_attribute('data-id', 'o1')
    assert writes() == 2

    # Reunavieritys jatkuu, vaikka osoitin ei liiku. Peruuttaminen ei tallenna.
    x, y = point(move)
    main_box = main.bounding_box()
    gesture('down', x, y)
    gesture('move', x, main_box['y'] + main_box['height'] - 14)
    page.wait_for_function("document.querySelector('#main').scrollTop > 50")
    if phone:
        gesture('cancel')
    else:
        page.keyboard.press('Escape')
        gesture('up')
    expect(grid.locator('.dash-lift')).to_have_count(0)
    assert writes() == 2

    page.reload()
    page.wait_for_function('p => KaikkiTesti.vault().files[p]', arg=LAYOUT)
    select_tab(page, width, 'dash', 'Kojelauta')
    expect(grid.locator('.dash-tile').first).to_have_attribute('data-id', 'o1')
    assert tile.bounding_box()['height'] >= 210
    if not phone:
        mode = page.locator('#mvb-lock')
        if mode.get_attribute('aria-pressed') == 'false':
            mode.press('Enter')
        tile.get_by_role('button', name='Muokkaa ruutua Havainto 0').press('Enter')
        page.locator('#mvb-edit').get_by_text('Asettelu', exact=True).press('Enter')
        page.locator('#mvb-edit').get_by_role('button', name='Siirrä edemmäs').press('Enter')
        expect(grid.locator('.dash-tile').first).to_have_attribute('data-id', 'o0')
    page.context.close()


def memo(browser, url, width):
    phone = width < 500
    page = browser.new_page(viewport={'width': width, 'height': 850}, is_mobile=phone, has_touch=phone)
    page.set_default_timeout(8000)
    page.add_init_script((Path(__file__).parent / 'fakegh.js').read_text() + """
      if (!__repo.kept) for (const [path, text] of Object.entries(%s)) __repo.put(path, text);
      localStorage.setItem('kaikki:gh', '{"repo":"testi/vault","token":"x","branch":"main"}');
      localStorage.setItem('kaikki:nmode', 'rows');
      localStorage.setItem('kaikki:nview', '%s');
    """ % (json.dumps(DATA), VIEW))
    page.goto(url)
    select_tab(page, width, 'notes', 'Muistio')
    def wait_file(path, text):
        return page.wait_for_function('([p,t]) => __repo.get(p)?.includes(t)', arg=[path, text])

    def get_button(name, title):
        return page.get_by_role('button', name=f'{name} · {title}', exact=True)
    expect(get_button('Kirjaa määrä', 'Toinen')).to_be_visible()
    expect(page.get_by_text('Nappi puuttuu', exact=True)).to_have_count(2)

    add = page.get_by_role('button', name='Lisää sarake', exact=True)
    press(page, add, phone)
    dialog = page.get_by_role('dialog', name='Uusi sarake')
    dialog.get_by_label('Arvo tallentuu').select_option('nappi')
    expect(dialog.get_by_label('Laji')).to_be_hidden()
    expect(dialog.locator('option[value="maara"]')).to_have_count(0)
    dialog.get_by_label('Säädin').select_option('merkitse')
    press(page, dialog.get_by_role('button', name='Lisää sarake'), phone)
    wait_file(VIEW, '  - nappi(merkitse)')

    # Kertanappi kohdistuu riviin, ja kumoaminen palauttaa saman rivin.
    press(page, get_button('Merkitse', 'Ensimmäinen'), phone)
    wait_file(NOTE, 'Merkintä riville')
    assert page.evaluate('p => __repo.get(p)', OTHER) == DATA[OTHER]
    assert not page.evaluate("() => __repo.get('inbox/saadin-merkitse.md')")
    press(page, page.get_by_role('button', name='Kumoa: Merkitse'), phone)
    page.wait_for_function('([p,t]) => __repo.get(p).trimEnd() === t.trimEnd()', arg=[NOTE, DATA[NOTE]])

    # Kysyvä nappi ohittaa myös toiseen muistiinpanoon määritetyn oletuskohteen.
    press(page, get_button('Kirjaa määrä', 'Toinen'), phone)
    ask = page.get_by_role('dialog', name='Kirjaa määrä')
    expect(ask.get_by_text('Kirjoittaa: Toinen')).to_be_visible()
    ask.get_by_role('textbox', name='Arvo · Testimäärä').fill('8')
    press(page, ask.get_by_role('button', name='Kirjaa', exact=True), phone)
    wait_file(OTHER, 'Testimäärä = 8')
    assert page.evaluate('p => __repo.get(p)', NOTE).rstrip() == DATA[NOTE].rstrip()

    page.reload()
    select_tab(page, width, 'notes', 'Muistio')
    expect(get_button('Merkitse', 'Ensimmäinen')).to_be_visible()
    page.get_by_role('button', name='Näkymän lukitus').click()
    expect(page.get_by_role('button', name='Näkymän lukitus')).to_have_attribute('aria-pressed', 'true')
    expect(get_button('Merkitse', 'Ensimmäinen')).to_have_count(0)
    expect(get_button('Kirjaa määrä', 'Toinen')).to_have_count(0)
    page.context.close()


if __name__ == '__main__':
    with ThreadingHTTPServer(('127.0.0.1', 0), QuietHandler) as server, sync_playwright() as p:
        Thread(target=server.serve_forever, daemon=True).start()
        browser = p.chromium.launch()
        url = f'http://127.0.0.1:{server.server_port}/'
        for width in (320, 390, 1280):
            dashboard(browser, url, width)
            memo(browser, url, width)
            print(f'Kojelauta ja Muistion nappisarake {width} px: OK', flush=True)
