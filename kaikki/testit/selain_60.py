"""Muistion yhteinen ja laitekohtainen sarakejärjestys kahdessa selainprofiilissa."""
import json
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


TESTS = Path(__file__).resolve().parent
URL = (TESTS.parent / 'index.html').as_uri()
VIEW = 'nakymat/esimerkki.md'
LAYOUT = 'kaikki:nvlay:' + VIEW
SHARED = ['otsikko', 'kansio', 'kuka', 'luotu']
LOCAL = ['otsikko', 'kuka', 'kansio', 'luotu']
EDITED = ['otsikko', 'kuka', 'luotu', 'kansio']
NOTE = '---\ntyyppi: tieto\notsikko: Retki\n---\n# Retki\n'
DOC = ('---\ntyyppi: nakyma\notsikko: Retket\nnakyy: ei\nsarakkeet:\n'
       '  - otsikko\n  - kansio\n  - kuka\n  - luotu\n---\n# Retket\n')


def profile(browser, width, document):
    context = browser.new_context(viewport={'width': width, 'height': 720},
                                  has_touch=width < 500, is_mobile=width < 500)
    page = context.new_page()
    page.set_default_timeout(6000)
    seed = {VIEW: document, 'tieto/retki.md': NOTE, 'nakymat/toinen.md': DOC}
    page.add_init_script((TESTS / 'fakegh.js').read_text() + """
      if (!__repo.kept) {
        for (const [path, text] of Object.entries(%s)) __repo.put(path, text);
        localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
        localStorage.setItem('kaikki:nmode','rows');
        localStorage.setItem('kaikki:nview',%s);
      }
    """ % (json.dumps(seed), json.dumps(VIEW)))
    page.goto(URL)
    return page


def order(page, editor=False):
    selector = '.nved-col:not(.off)' if editor else '.rvhead .rvc[data-k]'
    items = page.locator(selector)
    expect(items).to_have_count(4)
    return items.evaluate_all('items => items.map(item => item.dataset.k)')


def edit(page):
    page.click('#nvpick')
    page.click('#nv-edit')


def header_menu(page, key):
    # Näppäimistö toimii myös silloin, kun sarake olisi puhelimella näytön ulkopuolella.
    page.locator('.rvhead [data-k="' + key + '"] .rv-head-sort').press('Shift+F10')


def change_name(page, name):
    page.locator('#nved-name').fill(name)
    page.mouse.click(3, 3)
    page.wait_for_function("([path, name]) => __repo.get(path).includes('otsikko: '+name+'\\n')",
                           arg=[VIEW, name])


def verify(browser, width, other_width):
    a = profile(browser, width, DOC)
    assert order(a) == SHARED
    header_menu(a, 'kansio')
    a.click('#rvm-wider')
    header_menu(a, 'kansio')
    a.click('#rvm-right')
    assert order(a) == LOCAL
    layout = a.evaluate('key => JSON.parse(localStorage.getItem(key))', LAYOUT)

    # Pelkkä nimen vaihto ei saa julkaista tämän laitteen sarakejärjestystä.
    edit(a)
    assert order(a, editor=True) == SHARED
    change_name(a, 'Matkat')
    renamed = DOC.replace('Retket', 'Matkat')
    assert a.evaluate('path => __repo.get(path)', VIEW) == renamed

    # Keskeytetty järjestely ei muuta tiedostoa eikä laiteasetusta.
    edit(a)
    down = a.locator('.nved-col[data-k=kansio]').get_by_label('Siirrä alas')
    down.click()
    expect(down).to_be_focused()
    assert order(a, editor=True) == LOCAL
    a.click('#nved-cancel')
    assert a.evaluate('path => __repo.get(path)', VIEW) == renamed

    edit(a)
    down.click()
    down.press('Enter')
    row = a.locator('.nved-col[data-k=kansio]')
    expect(row.get_by_label('Siirrä ylös')).to_be_focused()
    expect(row.get_by_label('Siirrä ylös')).to_be_in_viewport()
    assert order(a, editor=True) == EDITED
    a.mouse.click(3, 3)
    edited = renamed.replace('  - kansio\n  - kuka\n  - luotu', '  - kuka\n  - luotu\n  - kansio')
    a.wait_for_function('([path,text]) => __repo.get(path) === text', arg=[VIEW, edited])
    a.reload()
    assert order(a) == LOCAL

    # A:n testipalvelimen tallentama tiedosto on B:n ainoa näkymämääritys.
    b = profile(browser, other_width, a.evaluate('path => __repo.get(path)', VIEW))
    assert order(b) == EDITED
    if width < 500:
        # Kiinteä ensimmäinen sarake on saavutettavissa myös kapealla näytöllä.
        key = 'otsikko'
        box = a.locator('.rvhead .rv-head-sort').first.bounding_box()
        touch = a.context.new_cdp_session(a)
        touch.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [
            {'x': box['x'] + 15, 'y': box['y'] + box['height'] / 2}
        ]})
        expect(a.locator('#rvm-view-order')).to_be_visible()
        touch.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
        a.locator('#rvm-view-order').tap()
    else:
        key = 'kuka'
        header_menu(a, key)
        a.click('#rvm-view-order')
    assert order(a) == EDITED
    expect(a.locator(f'.rvhead [data-k={key}] .rv-head-sort')).to_be_focused()
    updated_layout = a.evaluate('key => JSON.parse(localStorage.getItem(key))', LAYOUT)
    assert updated_layout == {k: v for k, v in layout.items() if k != 'order'}
    assert a.evaluate('path => __repo.get(path)', VIEW) == edited
    assert a.evaluate("__repo.get('tieto/retki.md')") == NOTE
    assert a.evaluate("__repo.get('nakymat/toinen.md')") == DOC
    a.reload()
    assert order(a) == EDITED
    header_menu(a, 'kuka')
    expect(a.locator('#rvm-view-order')).to_have_count(0)
    a.context.close()
    b.context.close()
    print(f'{width} + {other_width} px: OK')


if __name__ == '__main__':
    with sync_playwright() as playwright:
        try:
            browser = playwright.chromium.launch()
        except Exception:
            browser = playwright.chromium.launch(executable_path='/opt/pw-browsers/chromium')
        for first, second in [(1440, 390), (320, 1280)]:
            verify(browser, first, second)
        browser.close()
