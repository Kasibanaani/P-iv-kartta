"""Muistion oma järjestys sekä Muistion ja taulukoiden laitteiden välinen lukko."""
import json

from playwright.sync_api import expect, sync_playwright

from selain_64 import QuietHandler, Thread, ThreadingHTTPServer
from selain_67 import open_sheets
from selain_68 import EDIT, HEAD, TESTS

VIEW = 'nakymat/arki.md'
DEFAULT = 'nakymat/kaikki.md'
DERIVED = 'taulukot/lasku/nakyma.md'
NOTES = {f'arki/{slug}.md': ('---\ntyyppi: tieto\notsikko: ' + name + '\nhinta: ' + str(i)
                             + '\n---\n# ' + name + '\n\nLisätietoa.\n')
         for i, (slug, name) in enumerate([('alfa', 'Alfa'), ('beta', 'Beta'), ('gamma', 'Gamma')], 1)}
VIEW_TEXT = ('---\ntyyppi: nakyma\notsikko: Arki\nnakyy: ei\nmista: kansio = arki\n'
             'sarakkeet:\n  - otsikko\n  - hinta | luku | €\n---\n# Arki\n\n'
             '## Oma järjestys\n\n- arki/gamma.md\n- arki/alfa.md\n- arki/beta.md\n'
             '\n## Pidä tämä\nOma huomio.\n')
TABLE_TEXT = (HEAD.format(name='Oma') + '| 20 | =A1*2 | 0 |\n| 5 | =A2*2 | 0 |\n').replace('\n', '\r\n')
DERIVED_TEXT = ('---\ntyyppi: taulukko\notsikko: Muistiinpanot\ntaulukko: Lasku\n'
                'mista: kansio = arki\nsarakkeet:\n  - otsikko\n  - hinta\n---\n# Muistiinpanot\n')


def document(page, path):
    return page.evaluate('path => __repo.get(path)', path)


def put(page, path, text):
    page.evaluate('([path,text]) => __repo.put(path,text)', [path, text])


def opened(browser, url, width, files):
    phone = width < 500
    page = browser.new_page(viewport={'width': width, 'height': 830}, has_touch=phone, is_mobile=phone)
    page.set_default_timeout(8000)
    page.add_init_script((TESTS / 'fakegh.js').read_text() + """
      if (!__repo.kept) for (const [path, text] of Object.entries(%s)) __repo.put(path, text);
      localStorage.setItem('kaikki:gh', '{"repo":"testi/vault","token":"x","branch":"main"}');
      if (!localStorage.getItem('kaikki:nmode')) localStorage.setItem('kaikki:nmode','rows');
      if (!localStorage.getItem('kaikki:nview')) localStorage.setItem('kaikki:nview', %s);
      if (!localStorage.getItem('kaikki:taulukko')) localStorage.setItem('kaikki:taulukko', %s);
    """ % (json.dumps(files), json.dumps(VIEW), json.dumps(EDIT)))
    page.goto(url)
    page.wait_for_function('path => KaikkiTesti.vault().files[path]', arg=VIEW)
    return page


def run(browser, url, width):
    seed = {**NOTES, VIEW: VIEW_TEXT, EDIT: TABLE_TEXT, DERIVED: DERIVED_TEXT}
    page = opened(browser, url, width, seed)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    phone = width < 500

    def press(item):
        item.tap() if phone else item.click()

    titles = page.locator('.rvb .rvt')
    lock = page.get_by_role('button', name='Näkymän lukitus')
    expect(titles).to_have_text(['Gamma', 'Alfa', 'Beta'])
    expect(lock).to_have_attribute('aria-pressed', 'false')
    handle = page.get_by_role('button', name='Siirrä Alfa nuolinäppäimillä tai raahaamalla')
    handle.press('ArrowDown')
    expect(titles).to_have_text(['Gamma', 'Beta', 'Alfa'])
    saved = document(page, VIEW)
    assert '## Pidä tämä\nOma huomio.\n' in saved and document(page, DEFAULT) is None

    press(page.get_by_role('button', name='Otsikko, järjestä'))
    expect(titles).to_have_text(['Alfa', 'Beta', 'Gamma'])
    press(page.locator('#nvpick'))
    press(page.get_by_role('menuitem', name='Palauta oma järjestys'))
    expect(titles).to_have_text(['Gamma', 'Beta', 'Alfa'])
    assert document(page, VIEW) == saved

    # Tiedosto vaihtui GitHubissa: vain lukitusrivi päivittyy tuoreeseen runkoon.
    remote = saved.replace('Oma huomio.', 'Toisen laitteen huomio.')
    put(page, VIEW, remote)
    press(lock)
    expect(lock).to_have_attribute('aria-pressed', 'true')
    locked_note_doc = document(page, VIEW)
    assert locked_note_doc.replace('lukittu: kyllä\n', '') == remote
    expect(page.locator('#note-select-toggle,.note-order-handle,.rv-value,.rv-head-sort')).to_have_count(0)
    expect(page.locator('#newnote')).to_be_hidden()
    press(titles.first)
    preview = page.get_by_role('dialog', name='Muistiinpanon esikatselu')
    expect(preview.get_by_text('Lisätietoa.', exact=False)).to_be_visible()
    expect(preview.locator('textarea,input')).to_have_count(0)
    assert preview.get_by_role('button', name='Sulje').count() == 0
    box = preview.bounding_box()
    page.mouse.click(max(1, box['x'] - 5), box['y'] + min(20,box['height']/2))
    expect(preview).to_be_hidden()
    press(page.locator('#nviewbtn'))
    expect(page.get_by_role('button', name='Näkymän lukitus')).to_have_attribute('aria-pressed', 'true')
    press(page.locator('.ncard').first)
    expect(preview).to_be_visible()
    page.keyboard.press('Escape')
    expect(preview).to_be_hidden()
    press(page.locator('#nviewbtn'))

    other = opened(browser, url, width, {**seed, VIEW: locked_note_doc})
    expect(other.get_by_role('button', name='Näkymän lukitus')).to_have_attribute('aria-pressed', 'true')
    expect(other.locator('.rvb .rvt')).to_have_text(['Gamma', 'Beta', 'Alfa'])
    other.get_by_role('button', name='Näkymän lukitus').click()
    expect(other.get_by_role('button', name='Näkymän lukitus')).to_have_attribute('aria-pressed', 'false')
    put(page, VIEW, document(other, VIEW))
    page.evaluate('KaikkiTesti.pull()')
    expect(lock).to_have_attribute('aria-pressed', 'false')
    expect(handle).to_be_visible()
    assert document(page, VIEW) == remote
    other.context.close()

    press(page.locator('#nvpick'))
    press(page.get_by_role('menuitem', name='Kaikki muistiinpanot'))
    press(lock)
    expect(lock).to_have_attribute('aria-pressed', 'true')
    assert 'lukittu: kyllä' in document(page, DEFAULT)
    press(lock)
    expect(lock).to_have_attribute('aria-pressed', 'false')
    assert 'lukittu:' not in document(page, DEFAULT)

    open_sheets(page, width)
    sheet_lock = page.get_by_role('button', name='Välilehden lukitus')
    grid = page.locator('#sg-wrap')
    value = page.get_by_role('textbox', name='Kaava tai arvo')
    first = grid.locator('td[data-r="0"][data-c="0"]')
    press(page.get_by_role('button', name='Taulukon toiminnot'))
    press(page.get_by_role('menuitem', name='Sarake A · Suodata ja lajittele…'))
    sorter = page.get_by_role('dialog', name='Sarake A')
    sorter.get_by_label('Lajittelu', exact=True).select_option('1')
    press(sorter.get_by_role('button', name='Käytä'))
    expect(grid.locator('tbody th')).to_have_text(['2', '1'])
    press(page.get_by_role('button', name='Palauta oma järjestys'))
    expect(grid.locator('tbody th')).to_have_text(['1', '2'])
    assert document(page, EDIT) == TABLE_TEXT

    press(sheet_lock)
    expect(sheet_lock).to_have_attribute('aria-pressed', 'true')
    locked_table = document(page, EDIT)
    assert locked_table.replace('lukittu: kyllä\r\n', '') == TABLE_TEXT
    expect(value).to_have_attribute('readonly', '')
    expect(page.locator('.sg-fill-handle,.sg-rz,.sg-tabadd')).to_have_count(0)
    first.dblclick()
    grid.press('Delete')
    grid.press('Control+z')
    grid.evaluate('''grid => {const data = new DataTransfer(); data.setData('text/plain', '99');
      grid.dispatchEvent(new ClipboardEvent('paste', {bubbles:true,cancelable:true,clipboardData:data}));}''')
    expect(grid.locator('.sg-ed')).to_have_count(0)
    expect(first).to_have_text('20')
    assert document(page, EDIT) == locked_table
    press(page.get_by_role('button', name='Taulukon toiminnot'))
    expect(page.get_by_role('menuitem')).to_have_text(['Vie CSV'])
    page.keyboard.press('Escape')

    # Toisella laitteella lukittu ruudukko torjuu myös ennen hakua jonotetun solumuokkauksen.
    press(sheet_lock)
    expect(sheet_lock).to_have_attribute('aria-pressed', 'false')
    put(page, EDIT, locked_table)
    value.fill('27')
    value.press('Enter')
    expect(sheet_lock).to_have_attribute('aria-pressed', 'true')
    assert document(page, EDIT) == locked_table
    expect(first).to_have_text('20')
    press(sheet_lock)
    expect(sheet_lock).to_have_attribute('aria-pressed', 'false')
    page.wait_for_function('path => __repo.get(path).includes("| 27 |")', arg=EDIT)
    expect(first).to_have_text('27')

    press(page.get_by_role('button', name='Muistiinpanot', exact=True))
    press(sheet_lock)
    expect(sheet_lock).to_have_attribute('aria-pressed', 'true')
    grid.press('Enter')
    expect(preview).to_be_visible()
    assert preview.get_by_role('button', name='Sulje').count() == 0
    box = preview.bounding_box()
    page.mouse.click(max(1, box['x'] - 5), box['y'] + min(20,box['height']/2))
    expect(preview).to_be_hidden()
    assert document(page, DERIVED).replace('lukittu: kyllä\n', '') == DERIVED_TEXT
    assert all(document(page, path) == text for path, text in NOTES.items())
    assert not errors, errors
    page.context.close()
    print(f'{width} px: OK')


if __name__ == '__main__':
    with ThreadingHTTPServer(('127.0.0.1', 0), QuietHandler) as server, sync_playwright() as p:
        Thread(target=server.serve_forever, daemon=True).start()
        browser = p.chromium.launch()
        try:
            for width in (320, 390, 1280, 1440):
                run(browser, f'http://127.0.0.1:{server.server_port}/', width)
        finally:
            browser.close()
