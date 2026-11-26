"""0.99 (A6.4–A6.5): pohjaan jäävä nappi ja XY-pädi puhelimella ja tietokoneella.

Pohjaan jäävä nappi: päälle kirjoittaa rivin ^tunnus-päivä, tila näkyy, pois poistaa täsmälleen saman rivin, Kumoa palauttaa,
tila luetaan tekstistä (toisen laitteen rivi = päällä latauksessa), Muistion nappisarake kohdistuu riviin. XY: editori, kojelaudan
pädi (veto, näppäimistö, suhteellinen akseli), pikakirjauksen ikkuna ja päivitä-tapa."""
import datetime
import json
import re

from playwright.sync_api import expect, sync_playwright

from selain_64 import QuietHandler, ThreadingHTTPServer, Thread
from selain_68 import TESTS
from selain_72 import select_tab

TODAY = datetime.date.today()
DAY_PATH = f'paivat/{TODAY.year}/{TODAY.isoformat()}.md'
SAATIMET = 'pohjat/saatimet.md'
BOARD = 'data/kojelauta.md'
VIEW = 'nakymat/kirjaukset.md'
NOTE = 'inbox/ensimmainen.md'
OLD = 'inbox/vanha.md'
MARK = f'^kahvi-{TODAY.isoformat()}'
HEAD = ('| id | otsikko | muuttuja | laske | aika | tunniste | kansio | yksikko | nayta | lahde |\n'
        '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n')
DATA = {
    SAATIMET: ('# Säätimet\n\n'
               '## Kahvi\n- tunnus: kahvi\n- laji: pohjaan\n- muuttuja: Kahvi (kpl)\n- arvo: 1\n\n'
               '## Siivottu\n- tunnus: siivottu\n- laji: pohjaan\n- teksti: Siivottu\n- minne: oma\n- aika: paiva\n- pikakirjaus: ei\n\n'
               '## Olo\n- tunnus: olo\n- laji: xy\n- muuttuja: Vire\n- min: 0\n- max: 10\n- askel: 1\n- suhteellinen: kylla\n'
               '- muuttuja: Mieliala\n- min: -5\n- max: 5\n- askel: 0,5\n- kohde: Olo\n- tapa: paivita\n'),
    BOARD: HEAD + '| s1 |  | kahvi |  |  |  |  |  |  | saadin |\n| s2 |  | olo |  |  |  |  |  |  | saadin |\n',
    VIEW: ('---\ntyyppi: nakyma\notsikko: Kirjaukset\nmista: kansio = inbox\n'
           'sarakkeet:\n  - otsikko\n  - nappi(siivottu) | w=140\n---\n# Kirjaukset\n'),
    NOTE: '# Ensimmäinen\n\nEnsimmäinen teksti.\n',
    OLD: f'# Vanha\n\n((1.11.{TODAY.year} klo 08.00, Olo: Vire = 7, Mieliala = 1))\n',
}


def repo(page, path):
    return page.evaluate('p => __repo.get(p) || ""', path)


def tap(page, locator, phone):
    if phone:
        locator.tap()
    else:
        locator.click()


def launch(browser, url, width, seed):
    phone = width < 500
    page = browser.new_page(viewport={'width': width, 'height': 860}, is_mobile=phone, has_touch=phone, reduced_motion='reduce')
    page.set_default_timeout(8000)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.add_init_script((TESTS / 'fakegh.js').read_text() + """
      if (!__repo.kept) for (const [path, text] of Object.entries(%s)) __repo.put(path, text);
      localStorage.setItem('kaikki:gh', '{"repo":"testi/vault","token":"x","branch":"main"}');
      localStorage.setItem('kaikki:nmode', 'rows');
      localStorage.setItem('kaikki:nview', '%s');
    """ % (json.dumps(seed), VIEW))
    page.goto(url)
    page.wait_for_function('p => KaikkiTesti.vault().files[p]', arg=SAATIMET)
    return page, errors


def toggle(browser, url, width):
    phone = width < 500
    page, errors = launch(browser, url, width, DATA)
    select_tab(page, width, 'dash', 'Kojelauta')
    kahvi = page.locator('.saadin-card[data-id="s1"]').get_by_role('button', name='Kahvi', exact=True)
    expect(kahvi).to_have_attribute('aria-pressed', 'false')

    # Päälle: rivi päivän muistiinpanoon jakson tunnisteella, nappi jää pohjaan.
    tap(page, kahvi, phone)
    page.wait_for_function('([p,m]) => (__repo.get(p) || "").includes(m)', arg=[DAY_PATH, MARK])
    expect(kahvi).to_have_attribute('aria-pressed', 'true')
    line = [x for x in repo(page, DAY_PATH).split('\n') if MARK in x]
    assert len(line) == 1 and re.match(r'- \(\(\d+\.\d+\.\d{4} klo \d\d\.\d\d; Kahvi \(kpl\) = 1; \^kahvi-[\d-]+\)\)$', line[0]), line
    before_on = repo(page, DAY_PATH)

    # Pois: täsmälleen sama rivi poistuu, muu teksti säilyy. Kumoa palauttaa rivin samaan kohtaan.
    tap(page, kahvi, phone)
    page.wait_for_function('([p,m]) => !__repo.get(p).includes(m)', arg=[DAY_PATH, MARK])
    expect(kahvi).to_have_attribute('aria-pressed', 'false')
    assert '## Pikakirjaukset' in repo(page, DAY_PATH)
    tap(page, page.get_by_role('button', name='Kumoa: Kahvi'), phone)
    page.wait_for_function('([p,t]) => __repo.get(p) === t', arg=[DAY_PATH, before_on])
    expect(kahvi).to_have_attribute('aria-pressed', 'true')

    # Pikakirjauksessa sama tila. Pois sieltä, ja kojelauta seuraa.
    page.get_by_role('button', name='Pikakirjaus', exact=True).click()
    quick = page.get_by_role('dialog', name='Pikakirjaus', exact=True)
    quick.get_by_role('button', name='Napit', exact=True).click()
    qk = quick.get_by_role('button', name='Kahvi', exact=True)
    expect(qk).to_have_attribute('aria-pressed', 'true')
    expect(quick.get_by_role('button', name='Kirjaa: Olo')).to_have_attribute('aria-haspopup', 'dialog')
    tap(page, qk, phone)
    page.wait_for_function('([p,m]) => !__repo.get(p).includes(m)', arg=[DAY_PATH, MARK])
    expect(qk).to_have_attribute('aria-pressed', 'false')
    expect(quick.locator('#quick-msg')).to_contain_text('Kahvi pois')
    quick.get_by_role('button', name='Valmis', exact=True).click()
    expect(kahvi).to_have_attribute('aria-pressed', 'false')

    # Tila luetaan tekstistä: toisen laitteen kirjoittama rivi näkyy latauksessa päällä, ja sen poisto vapauttaa napin.
    other = repo(page, DAY_PATH).rstrip('\n') + f'\n- ((Kahvi (kpl) = 1, {MARK}))\n'
    page.evaluate('([p,t]) => { __repo.put(p, t); __repo.kept = true; }', [DAY_PATH, other])
    page.reload()
    page.wait_for_function('p => KaikkiTesti.vault().files[p]', arg=SAATIMET)
    select_tab(page, width, 'dash', 'Kojelauta')
    expect(kahvi).to_have_attribute('aria-pressed', 'true')
    tap(page, kahvi, phone)
    page.wait_for_function('([p,m]) => !__repo.get(p).includes(m)', arg=[DAY_PATH, MARK])
    expect(kahvi).to_have_attribute('aria-pressed', 'false')

    # Muistion nappisarake: rivin muistiinpano on kohde, ja tila on rivikohtainen.
    select_tab(page, width, 'notes', 'Muistio')
    first = page.get_by_role('button', name='Siivottu · Ensimmäinen', exact=True)
    expect(first).to_have_attribute('aria-pressed', 'false')
    tap(page, first, phone)
    page.wait_for_function('p => __repo.get(p).includes("- Siivottu ^siivottu-")', arg=NOTE)
    expect(first).to_have_attribute('aria-pressed', 'true')
    expect(page.get_by_role('button', name='Siivottu · Vanha', exact=True)).to_have_attribute('aria-pressed', 'false')
    assert not repo(page, 'inbox/saadin-siivottu.md'), 'rivin nappi ei kirjoita omaan muistiinpanoonsa'
    tap(page, first, phone)
    page.wait_for_function('([p,t]) => __repo.get(p).trimEnd() === t.trimEnd()', arg=[NOTE, DATA[NOTE]])
    expect(first).to_have_attribute('aria-pressed', 'false')
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), 'ei vaakavieritystä'
    assert not errors, errors
    page.context.close()


def xy(browser, url, width):
    phone = width < 500
    page, errors = launch(browser, url, width, DATA)
    select_tab(page, width, 'dash', 'Kojelauta')
    card = page.locator('.saadin-card[data-id="s2"]')
    x = card.get_by_role('slider', name='X · Vire')
    y = card.get_by_role('slider', name='Y · Mieliala')
    # Suhteellinen X: edellinen arvo 7 keskellä, väli 2–12 rajattuna 2–10. Kiinteä Y: koko väli, aloitus edellisestä arvosta.
    expect(x).to_have_value('7')
    expect(y).to_have_value('1')
    expect(x).to_have_attribute('min', '2')
    expect(x).to_have_attribute('max', '10')
    expect(card.get_by_text('Edellinen 7 · keskellä')).to_be_visible()
    pad = card.locator('.saadin-pad')
    box = pad.bounding_box()
    assert box['width'] <= width - 20 and abs(box['width'] - box['height']) < 2, box

    # Veto: oikea yläkulma = X yläraja (10), Y 5. Vasen ala = 2 ja -5.
    if phone:
        cdp = page.context.new_cdp_session(page)
        def touch(kind, px=0, py=0):
            cdp.send('Input.dispatchTouchEvent', {'type': kind, 'touchPoints': [{'x': px, 'y': py}] if kind != 'touchEnd' else []})
        touch('touchStart', box['x'] + box['width'] * .5, box['y'] + box['height'] * .5)
        touch('touchMove', box['x'] + box['width'] * .8, box['y'] + box['height'] * .3)
        touch('touchMove', box['x'] + box['width'] - 1, box['y'] + 1)
        touch('touchEnd')
    else:
        page.mouse.move(box['x'] + box['width'] * .5, box['y'] + box['height'] * .5)
        page.mouse.down()
        page.mouse.move(box['x'] + box['width'] - 1, box['y'] + 1, steps=8)
        page.mouse.up()
    expect(x).to_have_value('10')
    expect(y).to_have_value('5')
    expect(card.locator('output').first).to_have_text('10')
    # Näppäimistö hienosäätää (natiivi liukusäädin): Y alas kaksi askelta.
    y.focus()
    page.keyboard.press('ArrowLeft')
    page.keyboard.press('ArrowLeft')
    expect(y).to_have_value('4')
    expect(y).to_have_attribute('aria-valuetext', '4,0')
    tap(page, card.get_by_role('button', name='Kirjaa: Olo'), phone)
    page.wait_for_function('p => (__repo.get(p) || "").includes("Olo: Vire = 10; Mieliala = 4,0; ^olo))")', arg=DAY_PATH)
    expect(page.get_by_role('button', name='Kumoa: Olo')).to_be_visible()

    # Pikakirjaus avaa saman pädin ikkunaan. Suhteellinen X keskittyy juuri kirjattuun 10:een (väli 5–10). Päivitä-tapa korvaa oman rivin, joten rivejä on yksi.
    page.get_by_role('button', name='Pikakirjaus', exact=True).click()
    quick = page.get_by_role('dialog', name='Pikakirjaus', exact=True)
    quick.get_by_role('button', name='Napit', exact=True).click()
    tap(page, quick.get_by_role('button', name='Kirjaa: Olo'), phone)
    dlg = page.get_by_role('dialog', name='Olo', exact=True)
    expect(dlg.get_by_text('Kirjoittaa: päivän muistiinpano')).to_be_visible()
    dx = dlg.get_by_role('slider', name='X · Vire')
    expect(dx).to_have_value('10')
    expect(dx).to_have_attribute('min', '5')
    dx.fill('6')
    dlg.get_by_role('slider', name='Y · Mieliala').fill('-2.5')
    tap(page, dlg.get_by_role('button', name='Kirjaa', exact=True), phone)
    page.wait_for_function('p => __repo.get(p).includes("Olo: Vire = 6; Mieliala = -2,5; ^olo))")', arg=DAY_PATH)
    expect(dlg).to_be_hidden()
    assert repo(page, DAY_PATH).count('^olo') == 1, repo(page, DAY_PATH)
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), 'ei vaakavieritystä'
    assert not errors, errors
    page.context.close()


def editor(browser, url, width):
    """Uusi pohjaan jäävä nappi ja XY editorista: laji, rajaukset ja tiedostomuoto."""
    phone = width < 500
    page, errors = launch(browser, url, width, DATA)
    page.get_by_role('button', name='Pikakirjaus', exact=True).click()
    quick = page.get_by_role('dialog', name='Pikakirjaus', exact=True)
    quick.get_by_role('button', name='Napit', exact=True).click()
    quick.get_by_role('button', name='+ Uusi nappi', exact=True).click()
    new = page.get_by_role('dialog', name='Uusi säädin')
    new.get_by_role('textbox', name='Nimi').fill('Vitamiini')
    new.get_by_label('Laji', exact=True).select_option('pohjaan')
    expect(new.get_by_text('nappi jää päälle')).to_be_visible()
    expect(new.get_by_label('Lisää vai päivitä')).to_be_hidden()
    expect(new.locator('#saadin-when option[value="kysy"]')).to_be_disabled()
    new.get_by_role('checkbox', name='Teksti').check()
    new.get_by_role('textbox', name='Teksti', exact=True).fill('D-vitamiini otettu')
    new.get_by_label('Aika', exact=True).select_option('paiva')
    expect(new.locator('.saadin-preview code')).to_have_text(f'- D-vitamiini otettu ^vitamiini-{TODAY.isoformat()}')
    new.get_by_role('button', name='Tallenna').click()
    page.wait_for_function('p => __repo.get(p).includes("## Vitamiini\\n- tunnus: vitamiini\\n- laji: pohjaan\\n- teksti: D-vitamiini otettu\\n- tapa: lisaa\\n- minne: paiva\\n- aika: paiva")', arg=SAATIMET)
    vit = quick.get_by_role('button', name='Vitamiini', exact=True)
    expect(vit).to_have_attribute('aria-pressed', 'false')
    tap(page, vit, phone)
    page.wait_for_function(f'p => (__repo.get(p) || "").includes("- D-vitamiini otettu ^vitamiini-{TODAY.isoformat()}")', arg=DAY_PATH)
    expect(vit).to_have_attribute('aria-pressed', 'true')

    quick.get_by_role('button', name='+ Uusi nappi', exact=True).click()
    new.get_by_role('textbox', name='Nimi').fill('Kipu')
    new.get_by_label('Laji', exact=True).select_option('xy')
    expect(new.get_by_role('checkbox', name='Teksti')).to_be_hidden()
    expect(new.get_by_role('textbox', name='Arvo')).to_be_hidden()
    new.get_by_label('X-akselin muuttuja').fill('Kipu')
    new.locator('#saadin-min').fill('0')
    new.locator('#saadin-max').fill('10')
    new.get_by_role('button', name='+ Lisää Y-akseli').click()
    expect(new.get_by_role('button', name='+ Lisää Y-akseli')).to_be_disabled()
    new.get_by_label('Y-akselin muuttuja').fill('Jännitys')
    new.locator('#saadin-min-2').fill('0')
    new.locator('#saadin-max-2').fill('1')
    new.locator('#saadin-step-2').fill('5')
    new.get_by_role('button', name='Tallenna').click()
    expect(new.locator('#saadin-msg')).to_contain_text('Y-akselin askel')
    new.locator('#saadin-step-2').fill('0,1')
    new.locator('#saadin-rel').check()
    new.get_by_role('button', name='Tallenna').click()
    page.wait_for_function('p => __repo.get(p).includes("## Kipu\\n- tunnus: kipu\\n- laji: xy\\n- muuttuja: Kipu\\n- min: 0\\n- max: 10\\n- suhteellinen: kylla\\n- muuttuja: Jännitys\\n- min: 0\\n- max: 1\\n- askel: 0,1\\n- tapa: lisaa")', arg=SAATIMET)
    tap(page, quick.get_by_role('button', name='Kirjaa: Kipu'), phone)
    dlg = page.get_by_role('dialog', name='Kipu', exact=True)
    expect(dlg.get_by_role('slider', name='X · Kipu')).to_have_value('5')
    expect(dlg.get_by_role('slider', name='Y · Jännitys')).to_have_value('0.5')
    box = dlg.locator('.saadin-pad').bounding_box()
    assert box['x'] >= 0 and box['x'] + box['width'] <= width, box
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), 'ei vaakavieritystä'
    assert not errors, errors
    page.context.close()


if __name__ == '__main__':
    with ThreadingHTTPServer(('127.0.0.1', 0), QuietHandler) as server, sync_playwright() as p:
        Thread(target=server.serve_forever, daemon=True).start()
        browser = p.chromium.launch()
        url = f'http://127.0.0.1:{server.server_port}/'
        for width in (320, 390, 1280):
            toggle(browser, url, width)
            xy(browser, url, width)
            editor(browser, url, width)
            print(f'Pohjaan jäävä nappi ja XY {width} px: OK', flush=True)
