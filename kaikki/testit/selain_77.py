"""Jaetut lukumuodot, vakiot, selaimen vanha asetus ja rinnakkaismuokkaus."""
import json
import re

from playwright.sync_api import expect, sync_playwright

from selain_64 import QuietHandler, Thread, ThreadingHTTPServer
from selain_67 import open_sheets
from selain_68 import DATA, EDIT, HEAD, SEED, TESTS

KEY = 'kaikki:sg-format:' + json.dumps(['testi/vault', 'main', EDIT], separators=(',', ':'))
ORIGINAL = (HEAD.format(name='Oma') + (
    '| 8,5 | 85 | 2026-11-30 |\n'
    '| -0,5 | =B1+1 | 2026-02-30 |\n'
    '| 2,5 | =A1*2 | 2026-12-01 |\n'
    '| 1 | 0 | teksti |\n'
    '\n# Säilytä tämä\n')).replace('\n', '\r\n')
FORMATS = r'^lukumuodot: (.*)\r\n'


def open_grid(browser, url, width, text, legacy=None):
    phone = width < 500
    page = browser.new_page(viewport={'width': width, 'height': 820}, has_touch=phone, is_mobile=phone,
                            timezone_id='America/Los_Angeles')
    page.add_init_script((TESTS / 'fakegh.js').read_text() + """
      if (!__repo.kept) {
        for (const [path, text] of Object.entries(%s)) __repo.put(path, text);
        if (%s) localStorage.setItem(%s, %s);
      }
      localStorage.setItem('kaikki:gh','{"repo":"testi/vault","token":"x","branch":"main"}');
      localStorage.setItem('kaikki:taulukko', %s);
    """ % (json.dumps({**SEED, EDIT: text}), json.dumps(bool(legacy)), json.dumps(KEY),
           json.dumps(json.dumps(legacy)), json.dumps(EDIT)))
    page.goto(url)
    page.wait_for_function('path => KaikkiTesti.vault().files[path]', arg=EDIT)
    open_sheets(page, width)
    return page


def run(browser, url, width):
    page = open_grid(browser, url, width, ORIGINAL, {'0,0': ['euro', 2]})
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))

    def action(locator):
        locator.tap() if width < 500 else locator.click()

    def cell(row, col, view=page):
        return view.locator(f'td[data-r="{row-1}"][data-c="{col-1}"]')

    dialog = page.get_by_role('dialog', name='Lukumuoto')
    apply = dialog.get_by_role('button', name='Käytä')

    def edit(address, kind):
        action(page.get_by_role('button', name='Taulukon toiminnot'))
        action(page.get_by_role('menuitem', name='Lukumuoto…', exact=True))
        dialog.get_by_label('Solu tai alue').fill(address)
        dialog.get_by_label('Muoto', exact=True).select_option(kind)

    def apply_format(address, kind):
        edit(address, kind)
        action(apply)
        expect(dialog).to_be_hidden()

    def document():
        return page.evaluate('path => __repo.get(path)', EDIT)

    page.wait_for_function('key => localStorage.getItem(key) === null', arg=KEY)
    assert json.loads(re.search(FORMATS, document(), re.M)[1]) == {'euro:2': ['A1']}
    assert re.sub(FORMATS, '', document(), flags=re.M) == ORIGINAL
    expect(cell(1, 1)).to_have_text(re.compile(r'^8,50\s*€$'))
    edit('A1:A2', 'h-min')
    expect(dialog.get_by_text('Esimerkki · 8 h 30 min')).to_be_visible()
    page.keyboard.press('Escape')
    expect(dialog).to_be_hidden()
    expect(cell(1, 1)).to_have_text(re.compile(r'^8,50\s*€$'))
    apply_format('A1:A2', 'h-min')
    apply_format('B1:B2', 'mm:ss')
    apply_format('A3', 'paivat')
    apply_format('C1:C2', 'pvm-lyhyt')
    apply_format('C3', 'pvm')
    expect(cell(1, 1)).to_have_text('8 h 30 min')
    expect(cell(2, 1)).to_have_text('−0 h 30 min')
    expect(cell(1, 2)).to_have_text('01:25')
    expect(cell(2, 2)).to_have_text('01:26')
    expect(cell(3, 1)).to_have_text('2,50 pv')
    expect(cell(1, 3)).to_have_text('ma 30.11.')
    expect(cell(2, 3)).to_have_text('2026-02-30')
    expect(cell(3, 3)).to_have_text('1.12.2026')
    expect(cell(3, 2)).to_have_text('17')
    action(cell(1, 1))
    expect(page.get_by_role('textbox', name='Kaava tai arvo')).to_have_value('8,5')
    assert page.evaluate('path => __repo.get(path)', DATA) == SEED[DATA]

    # Eri osoitteen rinnakkaismuutos säilyy. Saman osoitteen ristiriita pysäyttää koko alueen.
    edit('A4', 'euro')
    remote = document().replace('"pvm":["C3"]', '"pvm":["C3"],"prosentti:0":["B4"]')
    page.evaluate('([path,text]) => __repo.put(path,text)', [EDIT, remote])
    action(apply)
    expect(dialog).to_be_hidden()
    expect(cell(4, 2)).to_have_text(re.compile(r'^0\s*%$'))
    edit('A4:B4', 'luku')
    remote = document().replace('"euro:2":["A4"]', '"prosentti:2":["A4"]')
    page.evaluate('([path,text]) => __repo.put(path,text)', [EDIT, remote])
    action(apply)
    expect(dialog.get_by_text('Lukumuotoa muutettiin toisaalla.', exact=False)).to_be_visible()
    assert document() == remote
    page.keyboard.press('Escape')
    expect(dialog).to_be_hidden()

    apply_format('A1', 'yleinen')
    expect(cell(1, 1)).to_have_text('8,5')
    assert re.sub(FORMATS, '', document(), flags=re.M) == ORIGINAL
    other = open_grid(browser, url, width, document(), {'0,0': ['euro', 2], '3,2': ['luku', 3]})
    other.wait_for_function('key => localStorage.getItem(key) === null', arg=KEY)
    expect(cell(1, 1, other)).to_have_text('8,5')
    expect(cell(1, 3, other)).to_have_text('ma 30.11.')
    expect(cell(2, 2, other)).to_have_text('01:26')
    another_text = other.evaluate('path => __repo.get(path)', EDIT)
    saved = json.loads(re.search(FORMATS, another_text, re.M)[1])
    assert saved['yleinen'] == ['A1'] and saved['luku:3'] == ['C4']
    assert re.sub(FORMATS, '', another_text, flags=re.M) == ORIGINAL
    other.reload()
    open_sheets(other, width)
    expect(cell(3, 3, other)).to_have_text('1.12.2026')
    if width == 1440:
        page.locator('#sg-wrap th.sg-rn[data-r="0"]').click()
        page.get_by_role('button', name='Taulukon toiminnot').click()
        page.locator('#sgs-row-ib').click()
        expect(cell(1, 2)).to_be_empty()
        expect(cell(2, 2)).to_have_text('01:25')
        expect(cell(3, 2)).to_have_text('86')
        assert json.loads(re.search(FORMATS, document(), re.M)[1])['mm:ss'] == ['B1', 'B2']
    assert not errors, errors
    page.context.close()
    other.context.close()
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
