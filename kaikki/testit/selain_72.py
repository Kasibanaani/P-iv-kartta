"""Täytä alas yhtenä muutoksena ja kirjaa yhteinen tekstimuuttuja päivämuistiinpanoon."""
import json

from playwright.sync_api import expect, sync_playwright

from selain_64 import QuietHandler, ThreadingHTTPServer, Thread
from selain_67 import open_sheets
from selain_68 import DATA, EDIT, HEAD, SEED, TESTS

DAY = '2026-11-22'
DAY_PATH = 'paivat/2026/2026-11-22.md'
PRESETS = 'pohjat/pikakirjaus.md'
OLD = '## Seuranta\n- Treeni | kyllä | #treeni\n\n## Muistutus\n- Laskut\n'
ORIGINAL_DAY = '# 2026-11-22\n\nOma teksti säilyy.\n'
BOARD = 'data/kojelauta.md'
ROWS = ('| 1 | =$A1 | =YHDISTÄ("A1"; [[data]]!a1; SUMMA(A1:A2)) |\n'
        '| 2 | =A2*2 | 9 |\n| 3 | 10 | 5 |\n| 4 | 11 | 6 |\n| 5 | 12 | 7 |\n')
ORIGINAL = HEAD.format(name='Oma') + ROWS


def profile(browser, url, width):
    phone = width < 500
    page = browser.new_page(viewport={'width': width, 'height': 830}, has_touch=phone,
                            is_mobile=phone, reduced_motion='reduce')
    page.set_default_timeout(8500)
    seeds = {**SEED, EDIT: ORIGINAL, DAY_PATH: ORIGINAL_DAY, PRESETS: OLD,
             'tieto/uni.md': '# Uniseuranta\n\n!!2026-11-21: Uni (h): 7!!\n',
             'nakymat/uni.md': '---\ntyyppi: nakyma\notsikko: Uni\nsarakkeet:\n  - otsikko\n'
                               '  - muuttuja("Uni (h)") | luku | h\n---\n',
             BOARD: '| id | otsikko | muuttuja | laske | aika | tunniste | kansio | yksikko | nayta |\n'
                    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |\n'
                    '| uni | Uni | Uni (h) | viimeisin | | | | h | luku |\n'}
    page.add_init_script((TESTS / 'fakegh.js').read_text() + """
      if (!__repo.kept) for (const [path, text] of Object.entries(%s)) __repo.put(path, text);
      localStorage.setItem('kaikki:gh', '{"repo":"testi/vault","token":"x","branch":"main"}');
      localStorage.setItem('kaikki:taulukko', %s);
      localStorage.setItem('kaikki:nmode','rows');
      localStorage.setItem('kaikki:nview','nakymat/uni.md');
    """ % (json.dumps(seeds), json.dumps(EDIT)))
    page.goto(url)
    page.wait_for_function('(path) => KaikkiTesti.vault().files[path]', arg=EDIT)
    return page


def select_tab(page, width, key, name):
    if width < 500:
        page.click('#roll')
        page.click(f'#section-{key}')
    else:
        page.locator('#navbtn').click(); page.get_by_role('tab', name=name, exact=True).click()


def current(page, path):
    return page.evaluate('path => __repo.get(path)', path)


def file_is(page, path, text):
    page.wait_for_function('([path,text]) => __repo.get(path)===text', arg=[path, text])


def run(browser, url, width):
    page = profile(browser, url, width)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    open_sheets(page, width)
    fill = page.get_by_role('dialog', name='Täytä alas', exact=True)
    wrap = page.locator('#sg-wrap')

    def cell(row, column):
        return wrap.locator(f'td[data-r="{row-1}"][data-c="{column-1}"]')

    def menu_fill():
        page.click('#sg-more')
        page.get_by_role('menuitem', name='Täytä alas…').click()

    cell(1, 2).click()
    menu_fill()
    expect(fill.locator('#sg-fill-preview')).to_contain_text('ei sovi')
    expect(fill.get_by_role('button', name='Täytä', exact=True)).to_be_disabled()
    fill.get_by_role('button', name='Peru', exact=True).click()
    assert current(page, EDIT) == ORIGINAL

    cell(2, 2).click()
    if width >= 1000:
        handle = cell(2, 2).get_by_role('button', name='Täytä alas solusta B2')
        a, b = handle.bounding_box(), cell(5, 2).bounding_box()
        page.mouse.move(a['x']+a['width']/2, a['y']+a['height']/2)
        page.mouse.down()
        page.mouse.move(b['x']+b['width']/2, b['y']+b['height']/2, steps=8)
        page.mouse.up()
    else:
        menu_fill()
        fill.get_by_label('Viimeinen rivi').fill('5')
    expect(fill.locator('#sg-fill-preview')).to_contain_text('B5 = =A5*2')
    assert current(page, EDIT) == ORIGINAL
    fill.get_by_role('button', name='Täytä', exact=True).click()
    changed = ORIGINAL.replace('| 3 | 10 |', '| 3 | =A3*2 |').replace('| 4 | 11 |', '| 4 | =A4*2 |').replace('| 5 | 12 |', '| 5 | =A5*2 |')
    file_is(page, EDIT, changed)
    expect(cell(5, 2)).to_have_text('10')
    wrap.press('Control+z')
    file_is(page, EDIT, ORIGINAL)
    expect(cell(3, 2)).to_have_text('10')

    cell(1, 3).click()
    menu_fill()
    fill.get_by_label('Viimeinen rivi').fill('3')
    expect(fill.locator('#sg-fill-preview')).to_contain_text('=YHDISTÄ("A1"; [[data]]!a3; SUMMA(A3:A4))')
    concurrent = ORIGINAL.replace('| 2 | =A2*2 | 9 |', '| 2 | =A2*2 | 99 |')
    page.evaluate('([path,text]) => __repo.put(path,text)', [EDIT, concurrent])
    fill.get_by_role('button', name='Täytä', exact=True).click()
    expect(fill.get_by_text('Lähdesolu tai kohdealue muuttui.', exact=False)).to_be_visible()
    assert current(page, EDIT) == concurrent
    fill.get_by_role('button', name='Peru', exact=True).click()

    page.get_by_role('button', name='Pikakirjaus', exact=True).click()
    quick = page.get_by_role('dialog', name='Pikakirjaus', exact=True)
    quick.get_by_role('button', name='Muuttujat', exact=True).click()
    quick.get_by_role('button', name='+ Uusi nappi', exact=True).click()
    quick.get_by_label('Muuttuja', exact=True).select_option('Uni (h)')
    quick.get_by_role('button', name='Lisää nappi', exact=True).click()
    file_is(page, PRESETS, OLD + '\n## Muuttujat\n- "Uni (h)"\n')
    quick.get_by_label('Päivä', exact=True).fill(DAY)
    quick.get_by_role('button', name='Uni (h)', exact=True).click()
    value = quick.get_by_label('Arvo · Uni (h)')
    expect(quick.get_by_text('Päivämuistiinpano ·', exact=False)).to_contain_text('22.11.2026')
    value.fill('99')
    quick.get_by_role('button', name='Peru arvo', exact=True).click()
    assert current(page, DAY_PATH) == ORIGINAL_DAY
    quick.get_by_role('button', name='Uni (h)', exact=True).click()
    value.fill('8,5')
    quick.get_by_role('button', name='Lisää kirjaus', exact=True).click()
    assert current(page, DAY_PATH) == ORIGINAL_DAY
    quick.get_by_role('button', name='Valmis', exact=True).click()
    page.wait_for_function(
        r'([path, expected]) => __repo.get(path).replace(/; \^qh[a-z0-9-]+(?=\)\))/g, "") === expected',
        arg=[DAY_PATH, ORIGINAL_DAY + '\n## Pikakirjaukset\n\n- ((22.11.2026; Uni (h) = 8,5))\n'])
    select_tab(page, width, 'notes', 'Muistio')
    expect(page.locator('#nlist .rvb .rvr').get_by_role('button', name='Uni (h) · 2026-11-22 · 8,5 h')).to_be_visible()
    select_tab(page, width, 'dash', 'Kojelauta')
    expect(page.locator('.mvb-card[data-id=uni] .dval')).to_have_text('8,5 h')
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
