"""Kaikki 0.102 (Emil 26.11.2026): kuka kirjoitti -raita → pieni täplä vasemmassa yläkulmassa, viikkolistan kuittausruutu palkin sisällä.
Tarkistaa viikkolistan, muistiinpanokortit, rivinäkymän otsikon ja aikajanan merkinnät: Emilin omassa ei täplää, yhdessä ja tekoälyn
kirjoittamassa täplä (värit erikseen), missään ei vasenta värireunaa. Leveydet 390, 320 ja 1280."""
import datetime
import json
from pathlib import Path

from playwright.sync_api import sync_playwright

D = Path(__file__).resolve().parent
URL = (D.parent / 'index.html').as_uri()
FAKE = (D / 'fakegh.js').read_text()
T = datetime.date.today()
TD = '%d.%d.' % (T.day, T.month)
SHOT = None  # aseta kansio, jos haluat kuvat


def md(title, lahde, when):
    return ('---\ntyyppi: tapahtuma\notsikko: %s\nkuvaus: \nluotu: 2026-11-20\nlahde: %s\n---\n# %s\n\n%s %s klo %s.\n'
            % (title, lahde, title, title, TD, when))


SEED = {'kalenteri/oma.md': md('Oma meno', 'emil', '9-10'),
        'kalenteri/yhdessa.md': md('Yhdessä kirjoitettu', 'emil+claude', '11-12'),
        'kalenteri/tekoaly.md': md('Tekoälyn kirjoittama', 'claude', '13-14')}

PROBE = """sel => Array.from(document.querySelectorAll(sel)).map(e => {
  const a = getComputedStyle(e, '::after'), s = getComputedStyle(e), r = e.getBoundingClientRect();
  return {t: e.textContent.trim().slice(0, 160), dot: a.content !== 'none' && a.content !== 'normal' && a.width !== 'auto',
    bg: a.backgroundColor, w: parseFloat(a.width), left: parseFloat(a.left), top: parseFloat(a.top),
    shadow: s.boxShadow, bl: parseFloat(s.borderLeftWidth), br: parseFloat(s.borderRightWidth), x: r.x, h: r.height};
})"""


def check_dots(items, kind, bad):
    def find(word):
        return next((i for i in items if word in i['t']), None)
    own, together, ai = find('Oma'), find('Yhdessä'), find('Tekoälyn')
    if not (own and together and ai):
        bad.append(f'{kind}: rivejä puuttuu {[i["t"] for i in items]}')
        return
    if own['dot']:
        bad.append(f'{kind}: Emilin omassa on täplä')
    for item in (together, ai):
        if not item['dot'] or item['w'] > 8 or item['left'] > 8 or item['top'] > 8:
            bad.append(f'{kind}: täplä puuttuu tai väärässä paikassa {item}')
    if together['dot'] and ai['dot'] and together['bg'] == ai['bg']:
        bad.append(f'{kind}: yhdessä ja tekoäly samanväriset')
    for item in (own, together, ai):
        if 'inset' in item['shadow'] and '4px 0px 0px' in item['shadow']:
            bad.append(f'{kind}: vasen raita yhä {item["t"]}')


def open_page(browser, width, errors, calview='w', nmode='cards', calendar=True):
    phone = width < 500
    ctx = browser.new_context(viewport={'width': width, 'height': 800}, has_touch=phone, is_mobile=phone)
    page = ctx.new_page()
    page.set_default_timeout(8000)
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.add_init_script(FAKE + ";(function(){var S=%s;if(!window.__repo.kept)for(var k in S)window.__repo.put(k,S[k]);"
                         "localStorage.setItem('kaikki:gh',JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));"
                         "localStorage.setItem('kaikki:calview','%s');localStorage.setItem('kaikki:nmode','%s');})();"
                         % (json.dumps(SEED), calview, nmode))
    page.goto(URL)
    page.wait_for_timeout(1200)
    if calendar:
        if width >= 1000:
            page.click('#navbtn')
            page.click('#nav [data-tab="cal"]')
        else:
            page.click('#roll')
            page.click('#section-cal')
    return page


def run(browser, width, bad):
    errors = []
    # Viikkolista: täplät ja ruutu palkin sisällä.
    page = open_page(browser, width, errors, 'w')
    page.wait_for_selector('.wline .wrow')
    check_dots(page.evaluate(PROBE, '.wline .wrow'), f'{width} viikkolista', bad)
    boxes = page.evaluate("""() => Array.from(document.querySelectorAll('.wline')).map(l => {
      const c = l.querySelector('.wck').getBoundingClientRect(), w = l.querySelector('.wrow').getBoundingClientRect(),
            t = l.querySelector('.wtt').getBoundingClientRect();
      return {inside: c.left >= w.left && c.right <= w.right + .5 && c.top >= w.top - .5 && c.bottom <= w.bottom + .5,
              edge: w.right - c.right, gap: c.left - t.right};
    })""")
    for b in boxes:
        if not b['inside'] or b['edge'] > 12 or b['gap'] < 0:
            bad.append(f'{width} viikkolista: ruutu ei palkin sisällä tai peittää tekstiä {b}')
    if SHOT:
        page.screenshot(path=f'{SHOT}/viikko{width}.png')
    page.locator('.wline .wck').first.click()
    if page.locator('.wline .wck').first.get_attribute('aria-pressed') != 'true':
        bad.append(f'{width}: kuittaus ei toimi')
    if page.evaluate('document.documentElement.scrollWidth') > width:
        bad.append(f'{width}: sivuttaisvieritys viikkolistassa')
    page.context.close()

    # Aikajanan merkinnät: ei paksua vasenta reunaa, täplä yhdessä/tekoäly.
    page = open_page(browser, width, errors, 'd')
    page.wait_for_selector('#timeline .ev')
    evs = page.evaluate(PROBE, '#timeline .ev')
    check_dots(evs, f'{width} aikajana', bad)
    for e in evs:
        if e['bl'] > e['br'] + 0.5:
            bad.append(f'{width} aikajana: vasen reuna paksumpi {e}')
    if SHOT:
        page.screenshot(path=f'{SHOT}/paiva{width}.png')
    page.context.close()

    # Muistiinpanokortit ja rivinäkymän otsikko.
    page = open_page(browser, width, errors, nmode='cards', calendar=False)
    page.wait_for_selector('.ncard')
    check_dots(page.evaluate(PROBE, '.ncard'), f'{width} kortit', bad)
    if SHOT:
        page.screenshot(path=f'{SHOT}/kortit{width}.png')
    page.context.close()
    page = open_page(browser, width, errors, nmode='rows', calendar=False)
    page.wait_for_selector('.rvb .rvr')
    check_dots(page.evaluate(PROBE, '.rvb .rvr .rvt'), f'{width} rivit', bad)
    if page.evaluate('document.documentElement.scrollWidth') > width:
        bad.append(f'{width}: sivuttaisvieritys')
    page.context.close()
    if errors:
        bad.append(f'{width}: sivuvirheet {errors}')


if __name__ == '__main__':
    import sys
    if len(sys.argv) > 1:
        SHOT = sys.argv[1]
    bad = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        try:
            for width in (390, 320, 1280):
                run(browser, width, bad)
                print(f'{width} px: {"OK" if not bad else "VIRHE"}')
                print('\n'.join(bad))
        finally:
            browser.close()
    if bad:
        print('\n'.join(bad))
        sys.exit(1)
    print('KAIKKI OK')
