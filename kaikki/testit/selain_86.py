"""Kojelaudan yksi muokkaustila, pysyvä asettelu ja viikkoaikajanan raahaus."""
from datetime import datetime, timezone
import json

from playwright.sync_api import expect, sync_playwright

from selain_27 import BOARD, GRID
from selain_64 import QuietHandler, ThreadingHTTPServer, Thread
from selain_68 import TESTS
from selain_72 import select_tab

LAYOUT = 'data/kojelauta-asettelu.json'
EVENT = 'kalenteri/2026/kalenterikoe.md'
CARD = 'data/kojelauta.md'
METRIC = 'data/mittarit.json'
DAY = '2026-11-24'
NEXT = '2026-11-25'
DATA = {
    EVENT: '---\ntyyppi: tapahtuma\nluotu: 2026-11-24\nkuitattu: 2026-11-24 10:00\n---\n# Kalenterikoe\n\nAamupäivä 24.11.2026 klo 10–11\n',
    CARD: '| id | otsikko | muuttuja | laske | aika | tunniste | kansio | yksikko | nayta |\n'
          '| --- | --- | --- | --- | --- | --- | --- | --- | --- |\n'
          + ''.join(f'| o{i} | Havainto {i} | Uni | viimeisin | | | | | luku |\n' for i in range(18)),
    'paivat/2026/unet.md': '# Uni\n\n((@2026-11-24 | Uni: 8))\n',
    'taulukot/koe/pohja.md': GRID,
    'taulukot/koe/_nakyma.md': BOARD,
    'data/paiva.csv': f'pvm,koe\n{DAY},8\n',
    METRIC: json.dumps({'taulukot': [{'id': 'paiva', 'tiedosto': 'data/paiva.csv', 'avain': 'pvm',
                                     'sarakkeet': [{'id': 'koe', 'nimi': 'CSV-ruutu', 'laji':'luku'}]}]}),
}


def page_with_data(browser, url, width):
    page = browser.new_page(viewport={'width': width, 'height': 850}, is_mobile=width < 500,
                            has_touch=width < 500, reduced_motion='reduce')
    page.set_default_timeout(6500)
    page.clock.set_fixed_time(datetime(2026, 11, 24, 12, tzinfo=timezone.utc))
    page.add_init_script((TESTS / 'fakegh.js').read_text() + """
      if (!__repo.kept) for (const [path, text] of Object.entries(%s)) __repo.put(path, text);
      localStorage.setItem('kaikki:gh', '{"repo":"testi/vault","token":"x","branch":"main"}');
      localStorage.setItem('kaikki:calview', 'd');
      localStorage.setItem('kaikki:nmode', 'rows');
    """ % json.dumps(DATA))
    page.goto(url)
    page.wait_for_function('p => KaikkiTesti.vault().files[p]', arg=CARD)
    return page


def drag(page, locator, x, y):
    box = locator.bounding_box()
    page.mouse.move(box['x'] + box['width']/2, box['y'] + box['height']/2)
    page.mouse.down()
    page.mouse.move(x, y, steps=12)


def dashboard(browser, url, width):
    page = page_with_data(browser, url, width)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    select_tab(page, width, 'dash', 'Kojelauta')
    mode = page.locator('#mvb-lock')
    expect(mode).to_have_attribute('aria-pressed', 'false')
    expect(page.locator('.dash-tile-tools')).to_have_count(0)
    page.locator('#main').evaluate('(el) => el.scrollTop = 550')
    assert mode.bounding_box()['y'] < 140
    mode.click()
    expect(mode).to_have_attribute('aria-pressed', 'true')
    expect(page.locator('.dash-tile[data-editing]')).to_have_count(24)
    page.locator('#main').evaluate('(el) => el.scrollTop = 0')
    dash = page.locator('.dash-grid')
    card = dash.locator('[data-id="o0"]')
    other = dash.locator('[data-id="o1"]')
    target = other.bounding_box()
    drag(page, card.get_by_role('button', name='Siirrä Havainto 0'), target['x']+target['width']*.8, target['y']+target['height']*.75)
    expect(other).to_have_class(rgx('dash-drop'))
    page.mouse.up()
    page.wait_for_function("p => __repo.get(p)?.includes('order')", arg=LAYOUT)
    expect(dash.locator('.dash-tile').first).to_have_attribute('data-id', 'o1')
    resize = card.get_by_role('button', name='Muuta kokoa · Havainto 0')
    box = resize.bounding_box()
    drag(page, resize, box['x'] + 10, box['y'] + 120)
    page.mouse.up()
    page.wait_for_function("p => Object.values(JSON.parse(__repo.get(p)).items).some(x => x.height===2)", arg=LAYOUT)
    assert card.bounding_box()['height'] >= 210

    card.get_by_role('button', name='Muokkaa ruutua Havainto 0').click()
    edit = page.locator('#mvb-edit')
    expect(edit.get_by_role('group', name='Rajaukset')).to_be_visible()
    edit.get_by_role('button', name='Poista ruutu').click()
    expect(card).to_have_count(0)
    table = dash.get_by_role('article').filter(has=page.get_by_role('heading', name='Laskettu'))
    table.get_by_role('button', name='Muokkaa korttia Laskettu').click()
    page.get_by_role('button', name='Poista kortti').click()
    expect(table).to_have_count(0)
    page.wait_for_function("() => __repo.get('taulukot/koe/pohja.md').includes('23 | 0 | valmis')")

    csv = dash.locator('[data-c="koe"]')
    csv.get_by_role('button', name='Muokkaa mittariruutua CSV-ruutu').click()
    page.get_by_role('button', name='Poista kojelaudalta').click()
    expect(csv).to_have_count(0)
    page.locator('#mvb-add').click()
    page.locator('#mvb-kind').select_option('mittari')
    page.get_by_role('dialog', name='Palauta mittariruutu').get_by_role('button', name='CSV-ruutu').click()
    expect(csv).to_be_visible()
    mode.click()
    expect(page.locator('.dash-tile-tools')).to_have_count(0)
    select_tab(page, width, 'notes', 'Muistio')
    region = page.locator('#nlist.rv-scroll')
    expect(region).to_be_visible()
    if width < 500:
        assert 'pan-y' in region.locator('.rvb').evaluate('el => getComputedStyle(el).touchAction')
    assert region.evaluate("(el) => !el.dispatchEvent(new WheelEvent('wheel', {deltaX:-50,bubbles:true,cancelable:true}))")
    assert region.evaluate("(el) => el.dispatchEvent(new WheelEvent('wheel', {deltaY:50,bubbles:true,cancelable:true}))")
    assert not errors, errors
    page.context.close()
    print(f'Kojelauta {width} px: OK')


def rgx(value):
    import re
    return re.compile(value)


def calendar(browser, url):
    page = page_with_data(browser, url, 1280)
    select_tab(page, 1280, 'cal', 'Kalenteri')
    origin = page.locator(f'.dcol[data-day="{DAY}"] .ev')
    expect(origin).to_be_visible()
    origin.scroll_into_view_if_needed()
    box = origin.bounding_box()
    dest = page.locator(f'.dcol[data-day="{NEXT}"]').bounding_box()
    x = dest['x'] + dest['width']/2
    y = box['y'] + box['height']/2 + 42
    drag(page, origin, x, y)
    ghost = page.locator('.calendar-drag-preview')
    expect(ghost).to_be_visible()
    assert ghost.bounding_box()['x'] > box['x'] + 30
    expect(page.locator(f'.dcol[data-day="{NEXT}"]')).to_have_class(rgx('drop'))
    page.mouse.up()
    expect(ghost).to_have_count(0)
    expect(origin).to_have_count(0)
    moved = page.locator(f'.dcol[data-day="{NEXT}"] .ev')
    expect(moved).to_be_visible()
    expect(moved).to_have_class(rgx('done'))
    page.wait_for_function("([p,d]) => __repo.get(p).includes('kuitattu: '+d+' ')", arg=[EVENT,NEXT])
    note = page.evaluate('path => __repo.get(path)', EVENT)
    assert '25.11.2026 klo ' in note.split('\n---\n', 1)[-1], note
    assert '10–11' not in moved.locator('span').first.text_content()
    page.context.close()
    print('Viikkokalenteri: päivä, kellonaika ja kuittaus siirtyivät.')


if __name__ == '__main__':
    with ThreadingHTTPServer(('127.0.0.1', 0), QuietHandler) as server, sync_playwright() as p:
        Thread(target=server.serve_forever, daemon=True).start()
        browser = p.chromium.launch()
        url = f'http://127.0.0.1:{server.server_port}/'
        try:
            for width in (390, 1280):
                dashboard(browser, url, width)
            calendar(browser, url)
        finally:
            browser.close()
