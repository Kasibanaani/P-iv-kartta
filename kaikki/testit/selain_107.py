"""Kaavaruudut, lukutilan erotin ja liukusäätimen tallennus suljettaessa."""
import json
from datetime import datetime, timezone

from playwright.sync_api import expect, sync_playwright

from selain_104 import FAKE, URL, md

NOTE = 'projektit/tilanne.md'
SOURCE = 'projektit/tyo.md'
BODY = """## Päivän tilanne
työ: {=[[tyo]].arvo}
arki: {=3}
väsymys: {=HAVAINTO("Minä"; "Väsymys"; TÄNÄÄN(); VIIMEISIN)}
kuormitus: {=työ + arki + väsymys}
{liukusäädin: väsymys; kohde = "Minä"; muuttuja = "Väsymys"; min = 0; max = 10; askel = 1}
{painike: "Merkitse tehty"; muuttuja = "Tehty"; arvo = 1}

---
## Muut asiat
{=SUMMA(HAVAINNOT("Minä"; "Väsymys"; "7 päivää"))}
—-
Viimeinen osio.

```text
---
esimerkki: {=404}
```
"""
SEED = {
    NOTE: md('Kokeilumuistio', BODY + '\n((26.11.2026 klo 12.00, Minä: Väsymys = 4))'),
    SOURCE: md('Työn lähde', 'arvo: {=4}'),
}


def open_app(browser, width):
    mobile = width < 500
    page = browser.new_page(viewport={'width': width, 'height': 820},
                            has_touch=mobile, is_mobile=mobile)
    page.set_default_timeout(7000)
    page.clock.set_fixed_time(datetime(2026, 11, 26, 16, tzinfo=timezone.utc))
    page.add_init_script(FAKE + """
      if (!__repo.kept) for (const [path, text] of Object.entries(%s)) __repo.put(path, text);
      localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
    """ % json.dumps(SEED))
    page.goto(URL)
    return page


def open_note(page):
    card = page.locator('#nlist').get_by_role('button', name='Kokeilumuistio').first
    expect(card).to_be_visible()
    card.click()


def close_outside(page):
    box = page.locator('#nsheet').bounding_box()
    w = page.viewport_size['width']
    assert box['x'] > 1 or box['x'] + box['width'] < w - 1, box
    x = 1 if box['x'] > 1 else w - 1
    if page.evaluate('navigator.maxTouchPoints > 0'):
        page.touchscreen.tap(x, box['y'] + 30)
    else:
        page.mouse.click(x, box['y'] + 30)
    expect(page.locator('#nsheet')).to_be_hidden()


def drag_handle(page, button, dx, dy, touch):
    button.scroll_into_view_if_needed()
    box = button.bounding_box()
    x, y = box['x'] + box['width'] / 2, box['y'] + box['height'] / 2
    if touch:
        session = page.context.new_cdp_session(page)
        for kind, tx, ty in [('touchStart', x, y), ('touchMove', x+dx, y+dy), ('touchEnd', 0, 0)]:
            session.send('Input.dispatchTouchEvent', {
                'type': kind, 'touchPoints': [] if kind == 'touchEnd' else [{'x': tx, 'y': ty}],
            })
        session.detach()
    else:
        page.mouse.move(x, y)
        page.mouse.down()
        page.mouse.move(x + dx, y + dy, steps=7)
        page.mouse.up()


def run(browser, width):
    page = open_app(browser, width)
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    open_note(page)
    note = page.locator('#nsheet')
    cells = note.locator('.ns-cell')
    total = cells.filter(has=page.get_by_text('kuormitus', exact=True))
    val = total.locator('.ns-cell-value')
    expect(cells).to_have_count(5)
    expect(note.locator('hr.note-divider')).to_have_count(2)
    expect(val).to_have_text('11')
    expect(note.locator('#ns-hl')).to_contain_text('esimerkki: {=404}')

    slider = note.get_by_role('slider', name='väsymys')
    expect(slider).to_have_value('4')
    slider.press('ArrowRight')
    expect(val).to_have_text('12')
    slider.press('ArrowRight')
    expect(val).to_have_text('13')
    expect(cells.last.locator('.ns-cell-value')).to_have_text('10')
    assert 'muistion-saadin' not in page.evaluate('p => __repo.get(p)', NOTE)

    page.evaluate('(p) => __repo.put(p[0], p[1])', [SOURCE, md('Työn lähde', 'arvo: {=5}')])
    page.evaluate('KaikkiTesti.pull()')
    expect(val).to_have_text('14')
    expect(slider).to_have_value('6')

    handle = total.get_by_role('button', name='Muuta kokoa', exact=False)
    def size():
        return total.evaluate("""e => [e.getBoundingClientRect().width,
                                    parseFloat(e.style.getPropertyValue('--cell-h'))]""")
    before = size()
    drag_handle(page, handle, -32, -12, width < 500)
    after = size()
    assert after[0] < before[0] - 5, (before, after)
    assert after[1] < before[1], (before, after)
    assert page.evaluate('document.documentElement.scrollWidth === innerWidth')

    close_outside(page)
    page.wait_for_function("p => __repo.get(p).includes('muistion-saadin')", arg=NOTE)
    saved = page.evaluate('p => __repo.get(p)', NOTE)
    assert saved.count('muistion-saadin') == 1 and 'Väsymys = 6' in saved

    open_note(page)
    expect(val).to_have_text('14')
    assert size() == after
    note.get_by_role('button', name='Merkitse tehty').click()
    page.wait_for_function("p => __repo.get(p).includes('Tehty = 1')", arg=NOTE)
    select = total.get_by_role('button', name='Muokkaa kaavaa: kuormitus')
    select.click()
    ta = note.locator('#ns-text')
    expect(ta).to_be_editable()
    selected = ta.evaluate('e => e.value.slice(e.selectionStart, e.selectionEnd)')
    assert selected == 'työ + arki + väsymys', selected
    expect(note.locator('hr.note-divider')).to_have_count(0)
    note.get_by_role('button', name='Siirry lukutilaan').click()
    expect(val).to_have_text('14')
    assert size() == after

    close_outside(page)
    open_note(page)
    expect(val).to_have_text('14')
    assert size() == after
    if width == 1280:
        page.set_viewport_size({'width': 390, 'height': 820})
        close_outside(page)
        open_note(page)
        expect(val).to_have_text('14')
        assert size() != after, 'Puhelimella oli tietokoneen ruutukoko.'
    assert not errors, errors
    page.context.close()


if __name__ == '__main__':
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for w in (320, 390, 1280, 1440):
            run(browser, w)
        browser.close()
