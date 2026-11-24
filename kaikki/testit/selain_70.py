"""Sanalinkkikytkin säilyy ja käsin tehdyt wikilinkit avautuvat."""
import json

from playwright.sync_api import expect, sync_playwright

from selain_60 import TESTS
from selain_64 import QuietHandler, ThreadingHTTPServer, Thread

SOURCE = 'tieto/aloitus.md'
TARGET = 'tieto/retkisuunnitelma.md'
BODY = '# Aloitus\n\nRetkisuunnitelma löytyy tästä.\n\n[[retkisuunnitelma|Avaa kohde]]\n[[retkisuunnitelma]]\n'
TEXT = BODY.removeprefix('# ').rstrip()


def tap_text(page, locator, phone):
    point = locator.evaluate_handle("""element => new Promise((resolve,reject) => {
        function check(frames) {
            const r=Array.from(element.getClientRects()).find(rect=>rect.width>6);
            if (r) {
                const x=r.x+r.width/2, y=r.y+r.height/2;
                if (document.elementFromPoint(x,y)?.id==='ns-text') return resolve([x,y]);
            }
            if (frames===60) return reject(new Error('Linkki ei ole muistiinpanon näkyvässä tekstikentässä.'));
            requestAnimationFrame(()=>check(frames+1));
        }
        check(0);
    })""")
    x, y = point.json_value()
    (page.touchscreen.tap if phone else page.mouse.click)(x, y)


def run(browser, url, width):
    phone = width < 500
    page = browser.new_page(viewport={'width': width, 'height': 800},
                            has_touch=phone, is_mobile=phone, reduced_motion='reduce')
    page.set_default_timeout(7000)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    header = '---\ntyyppi: tieto\nluotu: 2026-11-23\nlahde: emil\n---\n'
    source = header + BODY
    page.add_init_script((TESTS / 'fakegh.js').read_text() + """
        if (!__repo.kept) for (const [path, text] of Object.entries(%s)) __repo.put(path, text);
        localStorage.setItem('kaikki:gh', '{"repo":"testi/vault","token":"x","branch":"main"}');
        localStorage.setItem('kaikki:nmode','rows');
    """ % json.dumps({SOURCE: source, TARGET: header + '# Retkisuunnitelma\n\nPolku metsään.\n'}))
    page.goto(url)
    note = page.locator('#ns-text')
    auto = page.locator('#ns-hl .wl').filter(has_text='Retkisuunnitelma')
    switch = page.get_by_role('switch', name='Automaattiset sanalinkit')
    pop = page.locator('#ns-tm')

    def open_source():
        page.locator('#nlist .rvr .rvt').get_by_text('Aloitus', exact=True).click()
        expect(note).to_have_value(TEXT)
        expect(note).to_have_attribute('readonly', '')
        page.locator('#nsheet').evaluate('d => Promise.allSettled(d.getAnimations().map(a => a.finished))')

    def close_dialog():
        page.keyboard.press('Escape')

    def settings():
        if phone:
            page.click('#menu')
            page.click('#m-proj')
        else:
            page.click('#title')

    open_source()
    expect(auto).to_have_count(1)
    tap_text(page, auto, phone)
    expect(pop.get_by_role('button', name='Retkisuunnitelma', exact=True)).to_be_visible()
    close_dialog()
    expect(page.locator('#nsheet')).to_be_hidden()

    settings()
    expect(switch).to_have_attribute('aria-checked', 'true')
    if phone:
        page.get_by_text('Automaattiset sanalinkit', exact=True).tap()
    else:
        switch.press('Space')
        expect(switch).to_be_focused()
    expect(switch).to_have_attribute('aria-checked', 'false')
    close_dialog()

    open_source()
    expect(auto).to_have_count(0)
    for link in (page.locator('#ns-hl .lka').get_by_text('Avaa kohde', exact=True),
                 page.locator('#ns-hl .lks[data-t="Retkisuunnitelma"]')):
        expect(link).to_be_attached()
        tap_text(page, link, phone)
        expect(note).to_have_value('Retkisuunnitelma\n\nPolku metsään.')
        close_dialog()
        open_source()

    # Tavallinen sana vie muokkaustilaan eikä avaa sanalinkkivalikkoa.
    point = page.locator('#ns-hl').evaluate("""element => {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        for (let n; (n=walker.nextNode());) {
            const i=n.textContent.indexOf('Retkisuunnitelma löytyy');
            if (i<0) continue;
            const range=document.createRange();
            range.setStart(n,i+1);range.setEnd(n,i+9);
            const r=range.getBoundingClientRect();
            return [r.x+r.width/2,r.y+r.height/2];
        }
    }""")
    assert point
    (page.touchscreen.tap if phone else page.mouse.click)(*point)
    expect(note).to_be_editable()
    expect(pop).to_be_hidden()
    expect(auto).to_have_count(0)
    expect(page.locator('#ns-hl .lka, #ns-hl .lks')).to_have_count(2)
    expect(note).to_have_value(TEXT)
    close_dialog()

    page.reload()
    settings()
    expect(switch).to_have_attribute('aria-checked', 'false')
    switch.click()
    expect(switch).to_have_attribute('aria-checked', 'true')
    close_dialog()
    open_source()
    expect(auto).to_have_count(1)
    assert page.evaluate('(path) => __repo.get(path)', SOURCE) == source
    assert not page.evaluate("() => __repo.log.some(line => /^(PUT|PATCH|DELETE) /.test(line))")
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
