"""0.84: täyttö alas Muistiossa: kahva, 50 riviä yhdellä commitilla, kumous tavulleen, Esc, yhteyskatko ja valintatila."""
import json

from playwright.sync_api import expect, sync_playwright

from selain_60 import TESTS, URL, VIEW
from selain_63 import RULES

KEY = 'muuttuja("Uni (h)")'
DOC = ('---\ntyyppi: nakyma\notsikko: Päivät\nnakyy: ei\nmista: kansio = paivat\njarjestys: otsikko nouseva\nsarakkeet:\n'
       '  - otsikko\n  - arvio | luku\n  - ' + KEY + ' | luku | h\n---\n# Päivät\n')


def notes():
    out = {}
    for i in range(52):
        if i == 0:
            text = '---\ntyyppi: paiva\narvio: 7\n---\n# Päivä 00\n\n!!Uni (h): 8!!\n'
        elif i % 3 == 0:
            text = f'---\ntyyppi: paiva\narvio: {i}\nlahde: emil\n---\n# Päivä {i:02d}\n\nRunko {i}.  \n'
        else:
            text = f'# Päivä {i:02d}\n\nTeksti ilman alkutietoja {i}.\n'
        out[f'paivat/p{i:02d}.md'] = text
    return out


NOTES = notes()


def launch(browser, width, height=800):
    page = browser.new_page(viewport={'width': width, 'height': height},
                            has_touch=width < 500, is_mobile=width < 500)
    page.set_default_timeout(10000)
    seed = dict(NOTES)
    seed.update({VIEW: DOC, 'ohjeet/muistiinpanot.md': RULES})
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


def row(page, title):
    return page.locator('.rvb .rvr').filter(has=page.get_by_role('button', name=title, exact=True))


def cell(page, title, key):
    return row(page, title).locator(f".rvc:has(.rv-value[data-field='{key}'])")


def commits(page):
    return page.evaluate("__repo.log.filter(l => l === 'POST /git/commits').length")


def repo(page, path):
    return page.evaluate('p => __repo.get(p)', path)


def drag(page, title, key, to_title, release=True):
    source = cell(page, title, key)
    source.hover()
    handle = source.locator('.rv-fill')
    box = handle.bounding_box()
    page.mouse.move(box['x'] + 4, box['y'] + 4)
    page.mouse.down()
    target = row(page, to_title).bounding_box()
    page.mouse.move(box['x'] + 4, target['y'] + target['height'] / 2, steps=8)
    if release:
        page.mouse.up()


def desktop(browser, width):
    page = launch(browser, width, height=2400)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    expect(cell(page, 'Päivä 00', 'arvio')).to_have_text('7')

    # Esc peruu vedon eikä kirjoita mitään.
    before = commits(page)
    drag(page, 'Päivä 00', 'arvio', 'Päivä 05', release=False)
    expect(page.locator('.rvc.rv-fill-target')).to_have_count(5)
    expect(page.locator('.rv-fill-badge')).to_have_text('↓ 5 riviä')
    page.keyboard.press('Escape')
    page.mouse.up()
    expect(page.locator('.rvc.rv-fill-target')).to_have_count(0)
    page.wait_for_timeout(300)
    assert commits(page) == before

    # Yhteyskatko: mitään ei muuteta ja ikkuna listaa täyttämättä jääneet.
    page.evaluate("""() => { window.__realFetch = window.fetch;
      window.fetch = (u, o) => (o && o.method === 'POST' && String(u).includes('/git/trees'))
        ? Promise.reject(new TypeError('offline')) : window.__realFetch(u, o); }""")
    drag(page, 'Päivä 00', 'arvio', 'Päivä 02')
    expect(page.locator('#nvfill-fail')).to_have_attribute('open', '')
    expect(page.locator('#nvfill-fail-list li')).to_have_text(['Päivä 01', 'Päivä 02'])
    assert repo(page, 'paivat/p01.md') == NOTES['paivat/p01.md']
    page.evaluate('() => { window.fetch = window.__realFetch; }')
    page.locator('#nvfill-retry').click()
    page.wait_for_function("() => __repo.get('paivat/p02.md').includes('arvio: 7')")
    assert 'arvio: 7' in repo(page, 'paivat/p01.md')
    page.locator('#undo-b').click()
    page.wait_for_function("t => __repo.get('paivat/p02.md') === t", arg=NOTES['paivat/p02.md'])
    assert repo(page, 'paivat/p01.md') == NOTES['paivat/p01.md']

    # 50 riviä yhdellä vedolla = yksi commit. Muu teksti säilyy.
    before = commits(page)
    drag(page, 'Päivä 00', 'arvio', 'Päivä 50')
    expect(page.locator('#undo-t')).to_contain_text('Täytetty 50 riviä')
    assert commits(page) == before + 1
    for i in range(1, 51):
        text, old = repo(page, f'paivat/p{i:02d}.md'), NOTES[f'paivat/p{i:02d}.md']
        assert 'arvio: 7\n' in text, text
        body = old.split('---\n', 2)[2] if old.startswith('---\n') else old
        assert text.endswith(body), (text, old)
    assert repo(page, 'paivat/p51.md') == NOTES['paivat/p51.md']
    assert repo(page, 'paivat/p00.md') == NOTES['paivat/p00.md']
    expect(cell(page, 'Päivä 50', 'arvio')).to_have_text('7')

    # Kumoa (Ctrl/Cmd+Z) palauttaa jokaisen tiedoston tavulleen yhdellä commitilla.
    page.locator('#nsearch').focus()
    page.locator('#nlist').focus()
    page.keyboard.press('Control+z')
    page.wait_for_function("t => __repo.get('paivat/p50.md') === t", arg=NOTES['paivat/p50.md'])
    for path, text in NOTES.items():
        assert repo(page, path) == text, path
    assert commits(page) == before + 2

    # Tekstimuuttuja: merkintä lisätään muistiinpanon loppuun.
    drag(page, 'Päivä 00', KEY, 'Päivä 02')
    page.wait_for_function("() => __repo.get('paivat/p02.md').endsWith('!!Uni (h): 8!!\\n')")
    assert repo(page, 'paivat/p01.md').startswith(NOTES['paivat/p01.md'])
    expect(cell(page, 'Päivä 02', KEY)).to_have_text('8 h')
    assert not errors, errors
    page.context.close()


def phone(browser, width):
    page = launch(browser, width)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    expect(row(page, 'Päivä 00')).to_be_visible()
    page.locator('#note-select-toggle').tap()
    for title in ('Päivä 00', 'Päivä 01', 'Päivä 02', 'Päivä 03'):
        page.get_by_label('Valitse ' + title, exact=True).tap()
    page.locator('#note-batch-fill').tap()
    expect(page.locator('#nvfill')).to_have_attribute('open', '')
    page.locator('#nvfill-column').select_option(label='Arvio')
    expect(page.locator('#nvfill-summary')).to_contain_text('Lähde: Päivä 00 (7). Kopioi arvon 3')
    before = commits(page)
    page.locator('#nvfill-go').tap()
    page.wait_for_function("() => __repo.get('paivat/p03.md').includes('arvio: 7')")
    assert commits(page) == before + 1
    assert 'arvio: 7' in repo(page, 'paivat/p01.md') and 'arvio: 7' in repo(page, 'paivat/p02.md')
    assert repo(page, 'paivat/p04.md') == NOTES['paivat/p04.md']
    assert page.locator('.rv-fill').count() == 0
    assert not errors, errors
    page.context.close()


if __name__ == '__main__':
    with sync_playwright() as p:
        browser = p.chromium.launch()
        try:
            for width in (320, 390, 1280, 1440):
                (phone if width < 500 else desktop)(browser, width)
                print(f'{width} px: OK')
        finally:
            browser.close()
