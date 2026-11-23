"""Nimetyn Muistio-näkymän jaettu lajittelu usealla kentällä."""
import json
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread

from playwright.sync_api import expect, sync_playwright

from selain_60 import TESTS, VIEW, edit, header_menu

LEGACY = 'jarjestys: tila'
MULTI = 'jarjestys: tila nouseva, paiva laskeva, maara nouseva'
DOC = (f'---\ntyyppi: nakyma\notsikko: Projektit\nnakyy: ei\n{LEGACY}\n'
       'mista: kansio = projektit\nsarakkeet:\n  - otsikko\n  # Omat asetukset\n'
       '  - tila | siru | muu=oma\n  - paiva | pvm\n  - maara | luku | h\n---\n# Projektit\nRunko.\n')


def note(title, status, date, amount, created=21):
    return (f'---\ntyyppi: tieto\notsikko: {title}\nluotu: 2026-11-{created}\ntila: {status}\n'
            f'paiva: {date}\nmaara: {amount}\n---\n# {title}\n')


NOTES = {
    'projektit/a.md': note('Pieni', 'Avoin', '2.11.2026', '2,5'),
    'projektit/b.md': note('Suuri', 'Avoin', '2026-11-02', '10', 23),
    'projektit/c.md': note('Uusi', 'Avoin', '15.11.2026', '12'),
    'projektit/d.md': note('Tasan', 'Avoin', '2026-11-02', '2.5', 22),
    'projektit/e.md': note('Päivä puuttuu', 'Avoin', '', '0'),
    'projektit/f.md': note('Valmis', 'Valmis', '2026-11-30', '1'),
    'projektit/g.md': note('Tila puuttuu', '', '2026-11-29', '7'),
    'projektit/h.md': note('Määrä puuttuu', 'Avoin', '2026-11-02', ''),
}
ORDER = ['Uusi', 'Tasan', 'Pieni', 'Suuri', 'Määrä puuttuu', 'Päivä puuttuu', 'Valmis', 'Tila puuttuu']


def profile(browser, url, width, document):
    page = browser.new_page(viewport={'width': width, 'height': 800},
                            has_touch=width < 500, is_mobile=width < 500)
    page.set_default_timeout(8000)
    seed = {**NOTES, VIEW: document}
    page.add_init_script((TESTS / 'fakegh.js').read_text() + """
      if (!__repo.kept) {
        for (const [path, text] of Object.entries(%s)) __repo.put(path, text);
        localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
        localStorage.setItem('kaikki:nmode','rows');
        localStorage.setItem('kaikki:nview', %s);
      }
    """ % (json.dumps(seed), json.dumps(VIEW)))
    page.goto(url)
    return page


def expect_rows(page, names):
    expect(page.locator('.rvb .rvr .rvt')).to_have_text(names)


def header(page, key):
    return page.locator(f'.rvhead :is([data-k="{key}"], [data-k^="{key}|"]) .rv-head-sort')


def save(page):
    page.locator('#nvedit').get_by_role('button', name='Tallenna', exact=True).click()


def file_is(page, document):
    page.wait_for_function('([path, text]) => __repo.get(path) === text', arg=[VIEW, document])


def run(browser, url, width, other_width):
    page = profile(browser, url, width, DOC)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    expect(header(page, 'tila')).to_have_accessible_name('Tila, nouseva järjestys')
    edit(page)
    dialog = page.locator('#nvedit')
    expect(dialog.locator('#nved-sort')).to_have_value('tila')
    add = dialog.get_by_role('button', name='+ Lisää lajitteluperuste')
    add.click()
    second = dialog.get_by_label('Lajittelukenttä 2')
    expect(second).to_be_focused()
    second.select_option('paiva')
    dialog.get_by_label('Suunta 2', exact=True).select_option('-1')
    add.click()
    dialog.get_by_label('Lajittelukenttä 3').select_option('maara')
    dialog.get_by_role('button', name='Nosta lajitteluperustetta 3').press('Enter')
    expect(dialog.get_by_label('Lajittelukenttä 2')).to_have_value('maara')
    expect(dialog.get_by_role('button', name='Nosta lajitteluperustetta 2')).to_be_focused()
    dialog.get_by_role('button', name='Laske lajitteluperustetta 2').click()
    expect(dialog.get_by_label('Lajittelukenttä 2')).to_have_value('paiva')
    # Rinnakkainen päivitys muuhun kenttään säilyy sellaisenaan.
    refreshed = DOC.replace('muu=oma', 'muu=tuore').replace('Runko.', 'Tuore runko.')
    page.evaluate('([path, text]) => __repo.put(path, text)', [VIEW, refreshed])
    save(page)
    shared = refreshed.replace(LEGACY, MULTI)
    file_is(page, shared)
    expect_rows(page, ORDER)
    expect(header(page, 'paiva')).to_have_accessible_name('Paiva, laskeva järjestys, lajitteluperuste 2')

    # Otsikon tilapäinen lajittelu säilyttää vaakavierityksen ja jaetun tiedoston.
    title = header(page, 'otsikko')
    position = page.evaluate("() => {const list = document.getElementById('nlist'); list.scrollLeft = 45; return list.scrollLeft}")
    title.press('Enter')
    expect(title).to_be_focused()
    assert page.locator('#nlist').evaluate('list => list.scrollLeft') == position
    assert page.locator('.rvb .rvr .rvt').first.inner_text() == 'Määrä puuttuu'
    title.press('Enter')
    title.press('Enter')
    expect_rows(page, ORDER)
    title.press('Enter')
    header_menu(page, 'otsikko')
    page.get_by_role('menuitem', name='Palauta näkymän lajittelu').click()
    expect_rows(page, ORDER)
    file_is(page, shared)

    # Toinen laite lukee saman tiedoston puhtaalla välimuistilla.
    other = profile(browser, url, other_width, shared)
    expect_rows(other, ORDER)
    edit(other)
    editor = other.locator('#nvedit')
    editor.get_by_role('button', name='Poista lajitteluperuste 1').click()
    expect(editor.locator('#nved-sort')).to_have_value('paiva')
    editor.get_by_role('button', name='Peru muutokset').click()
    file_is(other, shared)
    expect_rows(other, ORDER)
    edit(other)
    editor.get_by_role('button', name='Poista lajitteluperuste 3').click()
    save(other)
    file_is(other, shared.replace(', maara nouseva', ''))
    assert not errors, errors
    page.context.close()
    other.context.close()
    print(f'{width} + {other_width} px: OK')


class QuietHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(TESTS.parent), **kwargs)

    def log_message(self, *_args):
        pass


if __name__ == '__main__':
    with ThreadingHTTPServer(('127.0.0.1', 0), QuietHandler) as server, sync_playwright() as playwright:
        Thread(target=server.serve_forever, daemon=True).start()
        browser = playwright.chromium.launch()
        url = f'http://127.0.0.1:{server.server_port}/'
        try:
            for first, second in ((1440, 320), (390, 1280)):
                run(browser, url, first, second)
        finally:
            browser.close()
            server.shutdown()
