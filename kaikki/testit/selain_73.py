"""Kojelaudan lähteet sulkeutuvat kortin ulkopuolelta ja pitkä lista vierii."""
import json
import re
from datetime import date, timedelta

from playwright.sync_api import expect, sync_playwright

from selain_64 import QuietHandler, TESTS, Thread, ThreadingHTTPServer


def seed():
    today = date.today()
    values = '\n'.join(f'!!{today - timedelta(days=i)}: Uni (h): {i}!!' for i in range(1, 17))
    return {
        'tieto/uni.md': f'# Uniseuranta\n\n{values}\n',
        'data/kojelauta.md': (
            '| id | otsikko | muuttuja | laske | aika | tunniste | kansio | yksikko | nayta |\n'
            '| --- | --- | --- | --- | --- | --- | --- | --- | --- |\n'
            '| first | Ensimmäinen | Uni (h) | viimeisin | | | | h | kuvaaja |\n'
            '| second | Toinen | Uni (h) | viimeisin | | | | h | luku |\n'
        ),
    }


def run(browser, url, width):
    phone = width < 500
    page = browser.new_page(viewport={'width': width, 'height': 640},
                            has_touch=phone, is_mobile=phone, reduced_motion='reduce')
    page.set_default_timeout(7000)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.add_init_script((TESTS / 'fakegh.js').read_text() + """
      for (const [path, text] of Object.entries(%s)) if (!__repo.kept) __repo.put(path, text);
      localStorage.setItem('kaikki:gh', '{"repo":"testi/vault","token":"x","branch":"main"}');
    """ % json.dumps(seed()))
    page.goto(url)
    page.wait_for_function("window.KaikkiTesti?.vault().files['data/kojelauta.md']")
    if phone:
        page.click('#roll')
        page.click('#section-dash')
    else:
        page.get_by_role('tab', name='Kojelauta', exact=True).click()

    first = page.locator('.mvb-card[data-id=first]')
    second = page.locator('.mvb-card[data-id=second]')
    toggle = first.get_by_role('button', name='Lähteet (16)')
    other = second.get_by_role('button', name='Lähteet (16)')
    sources = first.get_by_role('region', name='Lähteet: Ensimmäinen')
    other_sources = second.get_by_role('region', name='Lähteet: Toinen')

    def select(item):
        item.tap() if phone else item.click()

    select(toggle)
    expect(toggle).to_have_attribute('aria-expanded', 'true')
    expect(sources.locator('.mvrow')).to_have_count(16)
    dims = sources.evaluate("""list => {
        list.scrollTop=70;
        return [list.scrollTop,list.scrollHeight,list.clientHeight,innerHeight];
    }""")
    assert 0 < dims[0] and dims[1] > dims[2] and dims[2] < dims[3]/2, dims

    # Yläpalkin napautus sulkee listan myös lyhyellä puhelinnäytöllä.
    top = page.locator('#top').bounding_box()
    (page.touchscreen.tap if phone else page.mouse.click)(top['x'] + top['width']/2, top['y'] + top['height']/2)
    expect(toggle).to_have_attribute('aria-expanded', 'false')
    expect(sources).to_be_hidden()

    select(toggle)
    select(other)
    expect(toggle).to_have_attribute('aria-expanded', 'false')
    expect(other_sources).to_be_visible()
    other_sources.locator('.mvrow').first.focus()
    page.keyboard.press('Escape')
    expect(other_sources).to_be_hidden()
    expect(other).to_be_focused()

    select(toggle)
    select(sources.locator('.mvrow').first)
    expect(page.locator('#ns-text')).to_have_value(re.compile('Uniseuranta'))
    page.keyboard.press('Escape')
    expect(page.locator('#nsheet')).to_be_hidden()
    expect(toggle).to_have_attribute('aria-expanded', 'true')
    select(toggle)
    expect(toggle).to_have_attribute('aria-expanded', 'false')

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
