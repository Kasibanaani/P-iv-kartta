"""Taulukon näyttöjärjestys säilyttää soluosoitteet, valinnan ja Vaultin tiedostot."""
import json
import re

from playwright.sync_api import expect, sync_playwright

from selain_64 import QuietHandler, Thread, ThreadingHTTPServer
from selain_67 import open_sheets
from selain_68 import DATA, EDIT, HEAD, SEED, TESTS

ORIGINAL = HEAD.format(name='Oma') + (
    '| Keep alpha | 10 | =B1*2 |\n'
    '| Hide beta | 2 | Säilytä |\n'
    '| KEEP gamma | =2+1 |  |\n'
    '| Keep delta | 3 | Toinen |\n'
    '| Other | =1/0 | Säilytä myös |\n'
    '| Keep empty |  |  |\n'
)


def run(browser, url, width):
    phone = width < 500
    page = browser.new_page(viewport={'width': width, 'height': 820},
                            has_touch=phone, is_mobile=phone)
    page.set_default_timeout(8500)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.add_init_script((TESTS / 'fakegh.js').read_text() + """
      if (!__repo.kept) for (const [path, text] of Object.entries(%s)) __repo.put(path, text);
      localStorage.setItem('kaikki:gh','{"repo":"testi/vault","token":"x","branch":"main"}');
      if (!localStorage.getItem('kaikki:taulukko')) localStorage.setItem('kaikki:taulukko', %s);
    """ % (json.dumps({**SEED, EDIT: ORIGINAL}), json.dumps(EDIT)))
    page.goto(url)
    page.wait_for_function('path => KaikkiTesti.vault().files[path]', arg=EDIT)
    open_sheets(page, width)
    wrap = page.locator('#sg-wrap')
    dialog = page.get_by_role('dialog', name=re.compile(r'^Sarake [ABC]'))
    sort = dialog.get_by_label('Lajittelu', exact=True)
    mode = dialog.get_by_label('Suodatus', exact=True)
    value = dialog.get_by_label('Etsittävä arvo')
    apply = dialog.get_by_role('button', name='Käytä', exact=True)
    fx = page.get_by_role('textbox', name='Kaava tai arvo')
    reset = page.get_by_role('button', name='Palauta näkymä')
    headings = wrap.locator('tbody th.sg-rn')

    def cell(row, col):
        return wrap.locator(f'td[data-r="{row-1}"][data-c="{col-1}"]')

    def header(col):
        return wrap.locator(f'th.sg-ch[data-c="{col-1}"]')

    def select(item):
        item.tap() if phone else item.click()

    def open_display(col):
        if phone:
            select(header(col))
            select(page.get_by_role('button', name='Taulukon toiminnot'))
        else:
            header(col).click(button='right')
        select(page.get_by_role('menuitem', name=f'Sarake {chr(64+col)} · Suodata ja lajittele…'))
        expect(dialog).to_be_visible()

    def row_numbers(*rows):
        expect(headings).to_have_text([str(row) for row in rows])

    def document_is(text):
        assert page.evaluate('path => __repo.get(path)', EDIT) == text

    def clipboard(action, text=None):
        return wrap.evaluate("""(grid, [action, text]) => {
          const clipboardData = new DataTransfer();
          if (text !== null) clipboardData.setData('text/plain', text);
          grid.dispatchEvent(new ClipboardEvent(action, {clipboardData,bubbles:true,cancelable:true}));
          return clipboardData.getData('text/plain');
        }""", [action, text])

    row_numbers(1, 2, 3, 4, 5, 6)
    open_display(1)
    expect(sort).to_be_focused()
    mode.select_option('contains')
    value.fill('keep')
    page.keyboard.press('Escape')
    expect(dialog).to_be_hidden()
    row_numbers(1, 2, 3, 4, 5, 6)

    open_display(1)
    mode.select_option('contains')
    value.fill('  KeEp  ')
    select(apply)
    row_numbers(1, 3, 4, 6)
    expect(page.get_by_text('4 / 6 riviä')).to_be_visible()
    expect(header(1)).to_have_attribute('aria-label', 'Sarake A, suodatettu')
    open_display(2)
    sort.select_option('1')
    select(apply)
    row_numbers(3, 4, 1, 6)
    expect(header(2)).to_have_attribute('aria-sort', 'ascending')
    document_is(ORIGINAL)

    open_display(3)
    mode.select_option('filled')
    select(apply)
    row_numbers(4, 1)
    open_display(3)
    mode.select_option('')
    select(apply)
    row_numbers(3, 4, 1, 6)
    select(page.get_by_role('button', name='Data', exact=True))
    expect(reset).to_have_count(0)
    select(page.get_by_role('button', name='Oma', exact=True))
    row_numbers(3, 4, 1, 6)

    select(cell(3, 2))
    expect(fx).to_have_value('=2+1')
    expect(page.locator('#sg-addr')).to_have_text('B3')
    wrap.press('Shift+ArrowDown')
    wrap.press('Shift+ArrowDown')
    assert clipboard('copy') == '=2+1\n3\n10'
    expect(wrap.locator('td.sg-sel')).to_have_count(3)
    expect(cell(2, 2)).to_have_count(0)

    fx.fill('11')
    fx.press('Enter')
    row_numbers(4, 1, 3, 6)
    changed = ORIGINAL.replace('| =2+1 |', '| 11 |')
    page.wait_for_function('([path,text]) => __repo.get(path)===text', arg=[EDIT, changed])
    select(cell(4, 3))
    clipboard('paste', 'Näkyvä ensimmäinen\nNäkyvä toinen')
    expect(cell(4, 3)).to_have_text('Näkyvä ensimmäinen')
    expect(cell(1, 3)).to_have_text('Näkyvä toinen')
    changed = changed.replace('Toinen |', 'Näkyvä ensimmäinen |').replace('=B1*2 |', 'Näkyvä toinen |')
    page.wait_for_function('([path,text]) => __repo.get(path)===text', arg=[EDIT, changed])
    # Näkyvän alueen ulkopuolelle menevä liitos hylätään kokonaan.
    select(cell(6, 3))
    clipboard('paste', 'Uusi\nYlimääräinen')
    expect(page.get_by_text('Liitettävä alue ei mahdu näkyviin soluihin.')).to_be_visible()
    expect(cell(6, 3)).to_be_empty()
    document_is(changed)

    open_display(1)
    value.fill('ei löytyvää arvoa')
    select(apply)
    expect(page.get_by_text('Suodatukseen ei ole osumia.')).to_be_visible()
    expect(fx).to_have_attribute('readonly', '')
    wrap.press('Delete')
    clipboard('paste', 'Virhe')
    document_is(changed)
    select(reset)
    row_numbers(1, 2, 3, 4, 5, 6)
    expect(reset).to_have_count(0)
    document_is(changed)

    if width == 1440:
        select(page.get_by_role('button', name='Data', exact=True))
        open_display(1)
        sort.select_option('-1')
        select(apply)
        expect(headings.first).to_have_text('300')
        select(page.get_by_role('button', name='Taulukon toiminnot'))
        select(page.get_by_role('menuitem', name='Jäädytä rivit ja sarakkeet…'))
        freeze = page.get_by_role('dialog', name='Jäädytä rivit ja sarakkeet')
        freeze.get_by_label('Ensimmäiset rivit').select_option('1')
        select(freeze.get_by_role('button', name='Käytä'))
        expect(wrap.locator('tr.sg-pr td[data-c="0"]')).to_have_text('300')
        wrap.evaluate('grid => grid.scrollTop = 5800')
        expect(cell(95, 1)).to_have_count(1)
        expect(wrap.locator('tr.sg-pr td[data-c="0"]')).to_have_text('300')
        assert page.evaluate('path => __repo.get(path)', DATA) == SEED[DATA]
        page.reload()
        page.wait_for_function('path => KaikkiTesti.vault().files[path]', arg=DATA)
        open_sheets(page, width)
        expect(wrap.locator('tr.sg-pr td[data-c="0"]')).to_have_text('1')
        expect(reset).to_have_count(0)

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
