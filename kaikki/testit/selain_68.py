"""Kaavaviitteen poiminta hiirellä, näppäimistöllä ja kosketuksella."""
import json

from playwright.sync_api import expect, sync_playwright

from selain_67 import TESTS, open_sheets

EDIT = 'taulukot/lasku/oma.md'
DATA = 'taulukot/lasku/data.md'
HEAD = ('---\ntyyppi: taulukko\notsikko: {name}\ntaulukko: Lasku\n'
        'leveydet: 70, 70, 70\n---\n# {name}\n\n'
        '| A | B | C |\n| --- | --- | --- |\n')
SEED = {
    EDIT: HEAD.format(name='Oma') + '| 1 | 0 | 0 |\n| 2 | 0 | 0 |\n',
    DATA: HEAD.format(name='Data') + ''.join(f'| {i} | 2 | 0 |\n' for i in range(1, 301)),
}


def run(browser, width):
    phone = width < 1000
    page = browser.new_page(viewport={'width': width, 'height': 800}, has_touch=phone, is_mobile=phone)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.add_init_script((TESTS / 'fakegh.js').read_text() + """
      for (const [path, text] of Object.entries(%s)) __repo.put(path, text);
      localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
      localStorage.setItem('kaikki:taulukko', %s);
    """ % (json.dumps(SEED), json.dumps(EDIT)))
    page.goto((TESTS.parent / 'index.html').as_uri())
    page.wait_for_function('(path) => window.KaikkiTesti?.vault().files[path]', arg=EDIT)
    open_sheets(page, width)
    fx = page.locator('#sg-fx')
    wrap = page.locator('#sg-wrap')
    pick = page.get_by_role('button', name='Valitse solu', exact=True)
    info = page.locator('#sg-formula-info')

    def cell(r, c):
        return wrap.locator(f'td[data-r="{r}"][data-c="{c}"]')

    def select(item):
        item.tap() if phone else item.click()

    def write(value, start, end):
        fx.fill(value)
        fx.evaluate('(input, [start, end]) => input.setSelectionRange(start, end)', [start, end])

    select(cell(0, 2))
    if phone:
        write('=10+99*2', 4, 6)
        select(pick)
    else:
        cell(0, 2).dblclick()
        inline = wrap.locator('.sg-ed')
        inline.fill('=10+99*2')
        inline.evaluate('input => input.setSelectionRange(4, 6)')
        inline.press('Alt+Enter')
    select(cell(1, 0))
    expect(cell(0, 2)).to_have_class('n sg-origin')
    expect(cell(1, 0)).to_have_attribute('aria-selected', 'true')
    expect(info).to_contain_text('Oma · C1 · Viite: Oma · A2')
    select(page.get_by_role('button', name='Käytä viitettä'))
    expect(fx).to_be_focused()
    expect(fx).to_have_value('=10+A2*2')
    assert fx.evaluate('input => input.selectionStart') == 6
    if phone:
        select(page.get_by_role('button', name='Tallenna kaava'))
    else:
        fx.press('Enter')
    expect(cell(0, 2)).to_have_text('14')

    select(cell(1, 2))
    write('=SUMMA()+1', 7, 7)
    if phone:
        select(pick)
    else:
        fx.press('Tab')
        expect(pick).to_be_focused()
        pick.press('Enter')
    select(page.get_by_role('button', name='Data', exact=True))
    expect(fx).to_have_value('=SUMMA()+1')
    expect(info).to_contain_text('Oma · C2')
    assert wrap.locator('td').count() < 600
    wrap.evaluate('grid => grid.scrollTop = grid.scrollHeight')
    expect(cell(299, 1)).to_be_visible()
    if phone:
        select(page.get_by_role('button', name='Valitse alue'))
        select(cell(299, 1))
        select(cell(297, 0))
    else:
        select(cell(299, 1))
        wrap.press('Shift+ArrowUp')
        wrap.press('Shift+ArrowUp')
        wrap.press('Shift+ArrowLeft')
        expect(wrap.locator('td.sg-reference')).to_have_count(6)
        cell(299, 1).drag_to(cell(297, 0))
    expect(wrap.locator('td.sg-reference')).to_have_count(6)
    expect(info).to_contain_text('Data · A298:B300')
    if phone:
        select(page.get_by_role('button', name='Käytä viitettä'))
    else:
        wrap.press('Enter')
    expect(page.get_by_role('button', name='Oma', exact=True)).to_have_attribute('aria-pressed', 'true')
    expect(fx).to_have_value('=SUMMA([[taulukot/lasku/data]]!A298:B300)+1')
    expect(cell(1, 2)).to_have_text('0')
    select(page.get_by_role('button', name='Tallenna kaava'))
    expect(cell(1, 2)).to_have_text('904')
    page.wait_for_function('path => __repo.get(path).includes("A298:B300)+1")', arg=EDIT)

    select(cell(1, 2))
    write('=123+', 5, 5)
    select(pick)
    select(page.get_by_role('button', name='Data', exact=True))
    select(page.get_by_role('button', name='Kaavariville'))
    expect(fx).to_have_value('=123+')
    expect(fx).to_be_focused()
    select(pick)
    select(page.get_by_role('button', name='Data', exact=True))
    select(cell(0, 1))
    if phone:
        select(page.get_by_role('button', name='Peru', exact=True))
    else:
        wrap.press('Escape')
    expect(cell(1, 2)).to_have_text('904')
    assert page.evaluate('(path) => __repo.get(path)', DATA) == SEED[DATA]
    assert '123' not in page.evaluate('(path) => __repo.get(path)', EDIT)
    if width == 1440:
        select(cell(1, 2))
        write('=2*', 3, 3)
        select(pick)
        select(page.get_by_role('button', name='Data', exact=True))
        select(cell(1, 0))
        remote = SEED[EDIT].replace('| 1 | 0 | 0 |', '| 1 | 0 | =10+A2*2 |').replace('| 2 | 0 | 0 |', '| 2 | 0 | 77 |')
        page.evaluate('([path, text]) => __repo.put(path, text)', [EDIT, remote])
        page.evaluate('KaikkiTesti.pull()')
        expect(info).to_contain_text('Data · A2')
        select(page.get_by_role('button', name='Käytä viitettä'))
        expect(fx).to_have_value('=2*[[taulukot/lasku/data]]!A2')
        fx.press('Enter')
        page.wait_for_function('path => Object.keys(__repo.files).some(p => p.startsWith(path.replace(".md", "-ristiriita-"))'
                               ' && __repo.get(p).includes("=2*[[taulukot/lasku/data]]!A2"))', arg=EDIT)
        assert page.evaluate('(path) => __repo.get(path)', EDIT) == remote
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    assert not errors, errors
    page.close()


if __name__ == '__main__':
    with sync_playwright() as playwright, playwright.chromium.launch() as browser:
        for width in (320, 390, 1280, 1440):
            run(browser, width)
            print(f'{width} px OK')
