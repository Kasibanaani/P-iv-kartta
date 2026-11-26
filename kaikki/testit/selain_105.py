"""Päävalikon osumat, aikajanan reunat ja koko päivän palkit eri levyksillä."""
import json
from datetime import datetime, timezone

from playwright.sync_api import expect, sync_playwright

from selain_104 import FAKE, URL, md


SEED = {
    'kalenteri/jakso.md': md('Matka', 'Matka 24.11.2026–30.11.2026.', 'emil+claude'),
    'kalenteri/edellinen.md': md('Edellinen viikko', 'Hanke 21.11.2026–24.11.2026.'),
    'kalenteri/yksi.md': md('Yksi päivä', 'Tee se 26.11.2026.', 'claude'),
    'kalenteri/aika.md': md('Kello varattu', 'Tapaaminen 26.11.2026 klo 10–11.'),
}


def open_page(browser, width):
    phone = width < 500
    ctx = browser.new_context(viewport={'width': width, 'height': 844}, has_touch=phone, is_mobile=phone)
    page = ctx.new_page()
    page.clock.set_fixed_time(datetime(2026, 11, 26, 12, tzinfo=timezone.utc))
    page.add_init_script(FAKE + """
      for (const [path, value] of Object.entries(%s)) __repo.put(path, value);
      localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
      localStorage.setItem('kaikki:nmode', 'cards');
      localStorage.setItem('kaikki:calview', 'w');
    """ % json.dumps(SEED))
    page.goto(URL)
    expect(page.locator('.ncard').filter(has_text='Matka')).to_be_visible()
    return page


def check_dot(page, selector, title_selector):
    note = page.locator(selector).filter(has_text='Matka').first
    gap, glow = note.evaluate("""(el, sel) => {
      const dot = getComputedStyle(el, '::after');
      const title = el.querySelector(sel) || el;
      const range = document.createRange();
      range.selectNodeContents(title);
      return [range.getBoundingClientRect().left - el.getBoundingClientRect().left
              - parseFloat(dot.left) - parseFloat(dot.width), dot.boxShadow];
    }""", title_selector)
    assert gap >= 5 and glow == 'none', (gap, glow)


def check_recenter(page):
    page.locator('#calview [data-v="a"]').click()
    wrap = page.locator('#ajwrap')
    wrap.evaluate('el => window.originalScroller = el')
    for direction in (1, 1, -1, -1, -1):
        label = page.locator('#ajlabel')
        before = label.text_content()
        wrap.evaluate('(el, dir) => el.scrollLeft = dir > 0 ? el.scrollWidth : 0', direction)
        expect(label).not_to_have_text(before)
        at_edge = label.text_content()
        reached = wrap.evaluate("""el => {
          const x = el.getBoundingClientRect().left + el.clientWidth / 2;
          return [...el.querySelectorAll('.ajmin')].map(t => [t.textContent, t.getBoundingClientRect().left])
            .sort((a, b) => Math.abs(a[1] - x) - Math.abs(b[1] - x))[0];
        }""")
        page.wait_for_function("""() => {
          const el = document.getElementById('ajwrap');
          return el.scrollLeft > el.clientWidth && el.scrollLeft < el.clientWidth * 3;
        }""")
        assert wrap.evaluate('el => el === window.originalScroller')
        expect(label).to_have_text(at_edge)
        assert wrap.evaluate("""(el, [name, x]) => [...el.querySelectorAll('.ajmin')].some(
          t => t.textContent === name && Math.abs(t.getBoundingClientRect().left - x) < 2
        )""", reached)


def run(browser, width):
    page = open_page(browser, width)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    check_dot(page, '.ncard.src-yhdessa', '.nt')
    page.locator('#nviewbtn').click()
    check_dot(page, '.rvr.src-yhdessa .rvt', '.note-order-open')

    if width >= 1000:
        # Kuvitus muodostaa appiin oman kerrostuskontekstin.
        page.locator('.app').evaluate("el => el.classList.add('hasart')")
        page.locator('#navbtn').click()
        page.locator('#nav [data-tab="cal"]').click(timeout=3000)
        expect(page.locator('#navbtn')).to_have_text('Kalenteri')
    else:
        page.locator('#roll').click()
        page.locator('#section-cal').click()

    current_week = page.locator('#wklist .wk-untimed').first
    span = current_week.locator('.uline').filter(has_text='Matka')
    single = current_week.locator('.uline').filter(has_text='Yksi päivä')
    expect(span).to_have_count(1)
    expect(span).to_have_css('grid-column', '2 / 8')
    expect(single).to_have_css('grid-column', '4 / 5')
    expect(span.locator('.uarrow.next')).to_have_text('→')
    assert span.bounding_box()['y'] != single.bounding_box()['y']
    expect(page.locator('#wklist .wrow').filter(has_text='Kello varattu')).to_have_count(1)
    expect(page.locator('#wklist .wrow').filter(has_text='Matka')).to_have_count(0)

    span.locator('.wck').click()
    expect(span.locator('.wck')).to_have_attribute('aria-pressed', 'true')
    expect(page.locator('#nsheet')).to_be_hidden()
    span.locator('.chip').click()
    page.locator('#wk-open').click()
    expect(page.locator('#nsheet')).to_be_visible()
    page.keyboard.press('Escape')

    page.locator('#calview [data-v="d"]').click()
    bars = page.locator('#untimed')
    date_span = bars.locator('.uline').filter(has_text='Matka')
    expect(date_span).to_have_count(1)
    expect(date_span.locator('.wck')).to_have_attribute('aria-pressed', 'true')
    if width >= 1000:
        expect(date_span).to_have_css('grid-column', '2 / 8')
        # Palkki ja tunnit alkavat samasta tiistain sarakkeesta.
        column = page.locator('.dcol[data-day="2026-11-24"]')
        assert abs(date_span.bounding_box()['x'] - column.bounding_box()['x']) < 4
        check_recenter(page)
    else:
        expect(bars.locator('.udays')).to_have_count(0)
        expect(date_span.locator('.uarrow.prev')).to_have_text('←')
        expect(date_span.locator('.uarrow.next')).to_have_text('→')
        day = page.locator('#week [data-day="2026-11-24"]')
        day.click()
        expect(date_span.locator('.uarrow.prev')).to_have_count(0)
        expect(date_span.locator('.uarrow.next')).to_have_text('→')
        page.locator('#calsticky .calweek-step').last.click()
        expect(date_span.locator('.uarrow.prev')).to_have_text('←')
        expect(date_span.locator('.uarrow.next')).to_have_count(0)
    assert page.evaluate('document.documentElement.scrollWidth === innerWidth')
    assert not errors, errors
    page.context.close()


if __name__ == '__main__':
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for width in (1280, 1440, 390, 320):
            run(browser, width)
            print(f'{width} px: OK')
        browser.close()
