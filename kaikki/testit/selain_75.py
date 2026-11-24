"""Jäädytetyt rivit ja sarakkeet ovat samoja soluja myös pitkää taulukkoa vieritettäessä."""
import json
import re

from playwright.sync_api import expect, sync_playwright

from selain_64 import QuietHandler, Thread, ThreadingHTTPServer
from selain_67 import open_sheets
from selain_68 import DATA, EDIT, SEED, TESTS


def long_sheet():
    cols = 18
    return ('---\ntyyppi: taulukko\notsikko: Oma\ntaulukko: Lasku\nleveydet: '
            + ', '.join(['100'] * cols) + '\n---\n# Oma\n\n'
            + '| ' + ' | '.join(chr(65 + c) for c in range(cols)) + ' |\n'
            + '| ' + ' | '.join(['---'] * cols) + ' |\n'
            + ''.join('| ' + ' | '.join(f'{r}.{c}' for c in range(cols)) + ' |\n'
                      for r in range(1, 341)))


ORIGINAL = long_sheet()


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
    dialog = page.get_by_role('dialog', name='Jäädytä rivit ja sarakkeet')
    rows = dialog.get_by_label('Ensimmäiset rivit')
    cols = dialog.get_by_label('Vasemman reunan sarakkeet')
    apply = dialog.get_by_role('button', name='Käytä', exact=True)
    fx = page.get_by_role('textbox', name='Kaava tai arvo')

    def cell(row, col):
        return wrap.locator(f'td[data-r="{row-1}"][data-c="{col-1}"]')

    def select(item):
        item.tap() if phone else item.click()

    def open_freeze():
        select(page.get_by_role('button', name='Taulukon toiminnot'))
        select(page.get_by_role('menuitem', name='Jäädytä rivit ja sarakkeet…'))

    def scroll(x, y):
        wrap.evaluate('(grid,[x,y]) => {grid.scrollLeft=x;grid.scrollTop=y;}', [x,y])

    def scroll_pos():
        return wrap.evaluate('grid => [grid.scrollLeft,grid.scrollTop]')

    def follows_grid():
        return page.evaluate("""() => {
          const cell = document.querySelector('td[data-r="0"][data-c="0"]');
          const input = document.querySelector('.sg-ed');
          if (!cell || !input) return false;
          const a = cell.getBoundingClientRect(), b = input.getBoundingClientRect();
          return Math.abs(a.x-b.x)<2 && Math.abs(a.y-b.y)<2;
        }""")

    expect(wrap.locator('.sg-pr, .sg-pc')).to_have_count(0)
    open_freeze()
    expect(rows).to_be_focused()
    rows.select_option('2')
    cols.select_option('2')
    page.keyboard.press('Escape')
    expect(dialog).to_be_hidden()
    expect(wrap.locator('.sg-pr, .sg-pc')).to_have_count(0)

    open_freeze()
    rows.select_option('2')
    cols.select_option('2')
    select(apply)
    expect(wrap).to_be_focused()
    expect(wrap.locator('tr.sg-pr')).to_have_count(2)
    expect(cell(1, 1)).to_have_class(re.compile(r'\bsg-pc\b'))
    box1, box2 = cell(1, 1).bounding_box(), cell(2, 1).bounding_box()
    cell(1, 1).evaluate("cell => cell.dataset.testPin = 'original'")
    scroll(670, 6300)
    expect(cell(220, 9)).to_have_count(1)
    expect(cell(1, 1)).to_have_attribute('data-test-pin', 'original')
    assert wrap.locator('tbody tr:not(.sg-sp)').count() < 150
    assert wrap.locator('td[data-r="0"]').count() == 18
    for pinned, before in [(cell(1, 1), box1), (cell(2, 1), box2)]:
        after = pinned.bounding_box()
        assert abs(after['x']-before['x']) < 2, (after, before)
        assert abs(after['y']-before['y']) < 2, (after, before)
        assert pinned.evaluate("""cell => {
          const box = cell.getBoundingClientRect();
          return document.elementFromPoint(box.x+10,box.y+10) === cell;
        }""")
    assert cell(220, 1).bounding_box()['x'] == box1['x']
    assert scroll_pos()[0] > 200
    assert page.evaluate('path => __repo.get(path)', EDIT) == ORIGINAL

    if width == 1440:
        expect(cell(1, 2)).to_have_class(re.compile(r'\bsg-pc\b'))
        page.set_viewport_size({'width': 320, 'height': 820})
        expect(cell(1, 2)).not_to_have_class(re.compile(r'\bsg-pc\b'))
        expect(cell(1, 1)).to_have_class(re.compile(r'\bsg-pc\b'))
        page.set_viewport_size({'width': width, 'height': 820})
        expect(cell(1, 2)).to_have_class(re.compile(r'\bsg-pc\b'))

    select(cell(1, 1))
    expect(fx).to_have_value('1.0')
    position = scroll_pos()
    if phone:
        select(cell(1, 1))
    else:
        wrap.press('F2')
    inline = wrap.get_by_role('textbox', name='Muokkaa solua A1')
    expect(inline).to_be_focused()
    assert follows_grid()
    inline.fill('12')
    scroll(position[0]-85, 7800)
    expect(cell(278, 9)).to_have_count(1)
    page.wait_for_function("""() => {
      const a = document.querySelector('td[data-r="0"][data-c="0"]').getBoundingClientRect();
      const b = document.querySelector('.sg-ed').getBoundingClientRect();
      return Math.abs(a.x-b.x)<2 && Math.abs(a.y-b.y)<2;
    }""")
    inline.press('Enter')
    expect(cell(1, 1)).to_have_text('12')
    changed = ORIGINAL.replace('| 1.0 | 1.1 |', '| 12 | 1.1 |', 1)
    page.wait_for_function('([path,text]) => __repo.get(path)===text', arg=[EDIT,changed])

    select(page.get_by_role('button', name='Data', exact=True))
    expect(wrap.locator('.sg-pr, .sg-pc')).to_have_count(0)
    assert page.evaluate('path => __repo.get(path)', DATA) == SEED[DATA]
    select(page.get_by_role('button', name='Oma', exact=True))
    expect(wrap.locator('tr.sg-pr')).to_have_count(2)
    page.reload()
    page.wait_for_function('path => KaikkiTesti.vault().files[path]', arg=EDIT)
    open_sheets(page, width)
    expect(wrap.locator('tr.sg-pr')).to_have_count(2)
    expect(cell(1, 1)).to_have_text('12')
    open_freeze()
    expect(rows).to_have_value('2')
    expect(cols).to_have_value('2')
    rows.select_option('0')
    cols.select_option('0')
    select(apply)
    expect(wrap.locator('.sg-pr, .sg-pc')).to_have_count(0)
    scroll(500, 5000)
    expect(cell(1, 1)).to_have_count(0)
    assert page.evaluate('path => __repo.get(path)', EDIT) == changed
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
