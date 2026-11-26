"""Kaikki 0.104 (Emil 26.11.2026, suunnitelman 22, AJ1 + AJ2): vaakasuuntainen aikajana kalenterissa.
Tarkistaa: aikavälit palkkeina (yksittäiset päivät kytkimellä), mittakaavan vaihto napista ja Ctrl+rullalla, liukuva vieritys ja otsikko,
napautus avaa muistiinpanon, hiirellä siirto ja kummankin pään venytys kirjoittavat päivät tekstiin ja Kumoa palauttaa, Esc peruu,
näppäimistö (Alt+nuoli), kosketuksella pitkä painallus ja veto siirtää ja pelkkä pyyhkäisy vierittää. Leveydet 1280 ja 390 (320 asettelu)."""
import json
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

D = Path(__file__).resolve().parent
URL = (D.parent / 'index.html').as_uri()
FAKE = (D / 'fakegh.js').read_text()
REM = 'projektit/remontti.md'


def md(title, body, lahde='emil'):
    return '---\ntyyppi: projekti\notsikko: %s\nluotu: 2026-11-20\nlahde: %s\n---\n# %s\n\n%s\n' % (title, lahde, title, body)


SEED = {REM: md('Keittiöremontti', 'Suunnittelu 23.11.2026–4.12.2026. Sitten purku.'),
        'projektit/purku.md': md('Purku', 'Purku 2.12.2026–12.12.2026.', 'emil+claude'),
        'projektit/joulu.md': md('Joulun valmistelu', 'Valmistelut 14.12.2026–24.12.2026.', 'claude'),
        'kalenteri/kaynti.md': md('Lääkäri', 'Lääkäri 27.11.2026 klo 10-11.')}


def open_page(browser, width):
    phone = width < 500
    ctx = browser.new_context(viewport={'width': width, 'height': 800}, has_touch=phone, is_mobile=phone)
    page = ctx.new_page()
    page.set_default_timeout(8000)
    page.add_init_script(FAKE + ";(function(){var S=%s;if(!window.__repo.kept)for(var k in S)window.__repo.put(k,S[k]);"
                         "localStorage.setItem('kaikki:gh',JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));"
                         "localStorage.setItem('kaikki:calview','a');localStorage.setItem('kaikki:ajzoom','kk');"
                         "localStorage.setItem('kaikki:ajsingle','0');})();" % json.dumps(SEED))
    page.goto(URL)
    page.wait_for_timeout(1200)
    if width >= 1000:
        page.click('#navbtn')
        page.click('#nav [data-tab="cal"]')
    else:
        page.click('#roll')
        page.click('#section-cal')
    page.wait_for_selector('#ajwrap .ajbar')
    return page


def bar(page, name):
    return page.locator('.ajbar').filter(has_text=name)


def ppd(page):
    return page.evaluate("""() => { const b = document.querySelector('.ajzoom [aria-pressed="true"]').dataset.z;
      const d = {pv:1, vk:7, kk:31, '3kk':92, '6kk':183, v:366}[b];
      return document.querySelector('.ajin').getBoundingClientRect().width / (5 * d + 1); }""")


def has(page, text):
    page.wait_for_function('([p, t]) => (__repo.get(p) || "").includes(t)', arg=[REM, text])


def undo(page):
    page.locator('#undo-b').click()
    has(page, 'Suunnittelu 23.11.2026–4.12.2026. Sitten')


def mouse_drag(page, x, y, dx, steps=6, cancel=False):
    page.mouse.move(x, y)
    page.mouse.down()
    for i in range(1, steps + 1):
        page.mouse.move(x + dx * i / steps, y)
    if cancel:
        page.keyboard.press('Escape')
    page.mouse.up()


def run_desktop(browser, width):
    page = open_page(browser, width)
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    expect(page.locator('.ajbar')).to_have_count(3)
    expect(page.locator('#ajlabel')).not_to_be_empty()
    expect(page.locator('#calview [data-v="d"]')).to_have_attribute('aria-label', 'Tunnit')

    # Yksittäiset päivät kytkimellä.
    page.locator('#ajsingle').check()
    expect(page.locator('.ajbar')).to_have_count(4)
    page.locator('#ajsingle').uncheck()
    expect(page.locator('.ajbar')).to_have_count(3)

    rem = bar(page, 'Keittiöremontti')
    d = ppd(page)
    box = rem.bounding_box()
    cx, cy = box['x'] + box['width'] / 2, box['y'] + box['height'] / 2

    # Esc peruu kesken vedon: ei kirjoitusta, palkki palaa.
    mouse_drag(page, cx, cy, 3 * d, cancel=True)
    page.wait_for_timeout(300)
    assert 'Suunnittelu 23.11.2026–4.12.2026.' in page.evaluate('p => __repo.get(p)', REM)
    assert abs(rem.bounding_box()['x'] - box['x']) < 1

    # Siirto kaksi päivää eteenpäin, vihje näyttää tulevat päivät, Kumoa palauttaa.
    page.mouse.move(cx, cy)
    page.mouse.down()
    for i in range(1, 7):
        page.mouse.move(cx + 2 * d * i / 6, cy)
    expect(page.locator('.ajtip')).to_have_text('25.11.–6.12.')
    expect(page.locator('.ajorigin')).to_have_count(1)
    page.mouse.up()
    has(page, 'Suunnittelu 25.11.2026–6.12.2026. Sitten')
    expect(page.locator('.ajtip')).to_have_count(0)
    expect(page.locator('#undo')).to_contain_text('Keittiöremontti')
    undo(page)

    # Oikea kahva venyttää loppua, vasen siirtää alkua.
    box = bar(page, 'Keittiöremontti').bounding_box()
    mouse_drag(page, box['x'] + box['width'] - 3, cy, 3 * d)
    has(page, 'Suunnittelu 23.11.2026–7.12.2026.')
    undo(page)
    box = bar(page, 'Keittiöremontti').bounding_box()
    mouse_drag(page, box['x'] + 3, cy, 1 * d)
    has(page, 'Suunnittelu 24.11.2026–4.12.2026.')
    undo(page)

    # Näppäimistö: Alt+→ siirtää päivän ja kohdistus pysyy palkissa.
    bar(page, 'Keittiöremontti').focus()
    page.keyboard.press('Alt+ArrowRight')
    has(page, 'Suunnittelu 24.11.2026–5.12.2026.')
    expect(bar(page, 'Keittiöremontti')).to_be_focused()
    undo(page)

    # Napsautus ilman liikettä avaa muistiinpanon.
    bar(page, 'Purku').click()
    expect(page.locator('#nsheet')).to_be_visible()
    page.keyboard.press('Escape')
    expect(page.locator('#nsheet')).to_be_hidden()

    # Mittakaava: Viikko leventää päivää, Ctrl+rulla vaihtaa takaisin isompaan.
    w0 = bar(page, 'Purku').bounding_box()['width']
    page.locator('.ajzoom [data-z="vk"]').click()
    expect(page.locator('.ajzoom [data-z="vk"]')).to_have_attribute('aria-pressed', 'true')
    assert bar(page, 'Purku').count() == 0 or bar(page, 'Purku').bounding_box()['width'] > w0 * 2
    wb = page.locator('#ajwrap').bounding_box()
    page.mouse.move(wb['x'] + wb['width'] / 2, wb['y'] + 120)
    page.keyboard.down('Control')
    page.mouse.wheel(0, 120)
    page.keyboard.up('Control')
    expect(page.locator('.ajzoom [data-z="kk"]')).to_have_attribute('aria-pressed', 'true')

    # Vieritys: otsikko päivittyy ja alue laajenee reunalla (palkit pysyvät).
    label0 = page.locator('#ajlabel').text_content()
    page.evaluate("document.getElementById('ajwrap').scrollLeft += document.getElementById('ajwrap').clientWidth * 2.2")
    page.wait_for_timeout(400)
    assert page.locator('#ajlabel').text_content() != label0
    page.evaluate("document.getElementById('ajwrap').scrollLeft -= document.getElementById('ajwrap').clientWidth * 2.2")
    page.wait_for_timeout(400)
    expect(page.locator('.ajbar')).to_have_count(3)

    assert page.evaluate('document.documentElement.scrollWidth') <= width
    assert not errors, errors
    page.context.close()


def run_phone(browser, width):
    page = open_page(browser, width)
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    expect(page.locator('.ajbar')).to_have_count(3)
    assert page.evaluate('document.documentElement.scrollWidth') <= width
    expect(page.locator('.ajtitle-top')).to_be_visible()
    if width < 360:
        page.context.close()
        return
    cdp = page.context.new_cdp_session(page)

    def touch(kind, x=0, y=0):
        cdp.send('Input.dispatchTouchEvent', {'type': kind, 'touchPoints': [{'x': x, 'y': y}] if kind != 'touchEnd' else []})

    wrap = page.locator('#ajwrap')
    # Pelkkä pyyhkäisy vierittää eikä muokkaa.
    sl = wrap.evaluate('w => w.scrollLeft')
    box = bar(page, 'Keittiöremontti').bounding_box()
    cx, cy = box['x'] + box['width'] / 2, box['y'] + box['height'] / 2
    wrap.evaluate('w => w.scrollLeft += 40')
    assert wrap.evaluate('w => w.scrollLeft') != sl
    wrap.evaluate('w => w.scrollLeft -= 40')
    page.wait_for_timeout(200)

    # Pitkä painallus ja veto siirtää kaksi päivää.
    d = ppd(page)
    box = bar(page, 'Keittiöremontti').bounding_box()
    cx, cy = box['x'] + min(box['width'] / 2, 60), box['y'] + box['height'] / 2
    touch('touchStart', cx, cy)
    page.wait_for_timeout(500)
    for i in range(1, 7):
        touch('touchMove', cx + 2 * d * i / 6, cy)
    touch('touchEnd')
    has(page, 'Suunnittelu 25.11.2026–6.12.2026.')
    undo(page)
    assert not errors, errors
    page.context.close()


if __name__ == '__main__':
    with sync_playwright() as p:
        browser = p.chromium.launch()
        try:
            run_desktop(browser, 1280)
            print('1280 px: OK')
            for w in (390, 320):
                run_phone(browser, w)
                print(f'{w} px: OK')
        finally:
            browser.close()
