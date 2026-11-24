"""Lukumuoto kuuluu ruudukkoon, ja alueen muotoilu kumoutuu yhdellä toimella."""
import json
import re

from playwright.sync_api import expect, sync_playwright

from selain_64 import QuietHandler, Thread, ThreadingHTTPServer
from selain_67 import open_sheets
from selain_68 import DATA, EDIT, HEAD, SEED, TESTS

ORIGINAL = HEAD.format(name='Oma') + (
    '| 0,25 | =A1*100 | =1/0 |\n'
    '| 0 | -3,125 | Teksti |\n'
    '| | 2,1256 | |\n'
)


def run(browser, url, width):
    phone = width < 500
    page = browser.new_page(viewport={'width': width, 'height': 830},
                            has_touch=phone, is_mobile=phone)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.add_init_script((TESTS / 'fakegh.js').read_text() + """
      if (!__repo.kept) for (const [path, text] of Object.entries(%s)) __repo.put(path, text);
      localStorage.setItem('kaikki:gh', '{"repo":"testi/vault","token":"x","branch":"main"}');
      if (!localStorage.getItem('kaikki:taulukko')) localStorage.setItem('kaikki:taulukko', %s);
    """ % (json.dumps({**SEED, EDIT: ORIGINAL}), json.dumps(EDIT)))
    page.goto(url)
    page.wait_for_function('path => KaikkiTesti.vault().files[path]', arg=EDIT)
    open_sheets(page, width)

    wrap = page.locator('#sg-wrap')
    fx = page.get_by_role('textbox', name='Kaava tai arvo')
    dialog = page.get_by_role('dialog', name='Lukumuoto')
    address = dialog.get_by_label('Solu tai alue')
    kind = dialog.get_by_label('Muoto', exact=True)
    digits = dialog.get_by_label('Desimaalit', exact=True)
    apply = dialog.get_by_role('button', name='Käytä', exact=True)

    def cell(row, col):
        return wrap.locator(f'td[data-r="{row-1}"][data-c="{col-1}"]')

    def select(item):
        item.tap() if phone else item.click()

    def menu(name):
        select(page.get_by_role('button', name='Taulukon toiminnot'))
        select(page.get_by_role('menuitem', name=name, exact=True))

    original_error = cell(1, 3).inner_text()
    expect(cell(1, 1)).to_have_text('0,25')
    menu('Lukumuoto…')
    expect(kind).to_be_focused()
    expect(address).to_have_value('A1')
    kind.select_option('prosentti')
    expect(dialog.get_by_text(re.compile(r'Esimerkki .*26\s*%'))).to_be_visible()
    select(apply)
    expect(dialog).to_be_hidden()
    expect(wrap).to_be_focused()
    expect(cell(1, 1)).to_have_text(re.compile(r'^25\s*%$'))
    expect(cell(1, 1)).to_have_accessible_name(re.compile(r'Solu A1, 25\s*%'))
    expect(fx).to_have_value('0,25')
    expect(cell(1, 2)).to_have_text('25')

    if not phone:
        wrap.press('Shift+ArrowDown')
        wrap.press('Shift+ArrowDown')
        wrap.press('Shift+ArrowRight')
        wrap.press('Shift+ArrowRight')
    menu('Lukumuoto…')
    expect(address).to_have_value('A1' if phone else 'A1:C3')
    address.fill('A1:C99')
    kind.select_option('euro')
    select(apply)
    expect(dialog.get_by_text('Anna taulukossa oleva solu tai alue', exact=False)).to_be_visible()
    expect(cell(1, 1)).to_have_text(re.compile(r'^25\s*%$'))
    address.fill('c3 : a1')
    select(apply)
    expect(cell(1, 1)).to_have_text(re.compile(r'^0,25\s*€$'))
    expect(cell(1, 2)).to_have_text(re.compile(r'^25,00\s*€$'))
    expect(cell(2, 1)).to_have_text(re.compile(r'^0,00\s*€$'))
    expect(cell(1, 3)).to_have_text(original_error)
    expect(cell(2, 3)).to_have_text('Teksti')
    expect(cell(3, 1)).to_be_empty()

    if phone:
        menu('Kumoa lukumuoto')
    else:
        wrap.press('Control+z')
    expect(cell(1, 1)).to_have_text(re.compile(r'^25\s*%$'))
    expect(cell(1, 2)).to_have_text('25')
    expect(cell(2, 1)).to_have_text('0')
    if phone:
        menu('Tee lukumuoto uudelleen')
    else:
        wrap.press('Control+Shift+z')
    expect(cell(1, 2)).to_have_text(re.compile(r'^25,00\s*€$'))
    select(cell(1, 2))
    expect(fx).to_have_value('=A1*100')

    menu('Lukumuoto…')
    kind.select_option('luku')
    digits.select_option('3')
    page.keyboard.press('Escape')
    expect(dialog).to_be_hidden()
    expect(cell(1, 2)).to_have_text(re.compile(r'^25,00\s*€$'))

    menu('Lukumuoto…')
    address.fill('B2:B3')
    kind.select_option('luku')
    digits.select_option('3')
    select(apply)
    expect(cell(2, 2)).to_have_text(re.compile(r'^[\u2212-]3,125$'))
    expect(cell(3, 2)).to_have_text('2,126')
    assert page.evaluate('path => __repo.get(path)', EDIT) == ORIGINAL

    select(page.get_by_role('button', name='Data', exact=True))
    expect(cell(1, 1)).to_have_text('1')
    menu('Lukumuoto…')
    address.fill('A300')
    kind.select_option('euro')
    select(apply)
    expect(cell(300, 1)).to_have_text(re.compile(r'^300,00\s*€$'))
    assert page.evaluate('path => __repo.get(path)', DATA) == SEED[DATA]

    select(page.get_by_role('button', name='Oma', exact=True))
    page.reload()
    page.wait_for_function('path => KaikkiTesti.vault().files[path]', arg=EDIT)
    open_sheets(page, width)
    expect(cell(3, 2)).to_have_text('2,126')
    menu('Lukumuoto…')
    address.fill('A1:C3')
    kind.select_option('yleinen')
    expect(digits).to_be_disabled()
    select(apply)
    expect(cell(1, 1)).to_have_text('0,25')
    expect(cell(3, 2)).to_have_text('2,1256')
    assert page.evaluate('path => __repo.get(path)', EDIT) == ORIGINAL
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
