"""0.88: säädineditori, kertanappi, toiminnon asetukset ja reunan Kumoa (jäsennys A6.1)."""
import datetime
import json
import re

from playwright.sync_api import expect, sync_playwright

from selain_64 import QuietHandler, ThreadingHTTPServer, Thread
from selain_68 import TESTS

TODAY = datetime.date.today()
DAY_PATH = f'paivat/{TODAY.year}/{TODAY.isoformat()}.md'
SAATIMET = 'pohjat/saatimet.md'
PRESETS = 'pohjat/pikakirjaus.md'
UNI = 'inbox/unipaivakirja.md'
OLD_DAY = 'paivat/2026/2026-11-20.md'
SEED_SAATIMET = ('---\ntyyppi: pohja\notsikko: Säätimet\nnakyy: ei\nlahde: emil\n---\n# Säätimet\n\n'
                 '## Kadonnut\n- teksti: Ei minnekään\n- minne: [[ei-ole]]\n')
DATA = {
    SAATIMET: SEED_SAATIMET,
    PRESETS: '## Seuranta\n- Treeni | kyllä | #treeni\n\n## Muuttujat\n- "Uni (h)"\n',
    UNI: '---\ntyyppi: muistiinpano\notsikko: Unipäiväkirja\nlahde: emil\n---\n# Unipäiväkirja\n\nKappale.\n',
    'tieto/uni.md': '# Uniseuranta\n\n!!2026-11-19: Uni (h): 7!!\n',
}


def fi(day):
    return f'{day.day}.{day.month}.{day.year}'


def open_list(page):
    page.evaluate("document.getElementById(innerWidth>=1000&&document.getElementById('deskmenu').offsetParent?'deskmenu':'menu').click()")
    page.get_by_role('menuitem', name='Säätimet').click()
    return page.get_by_role('dialog', name='Säätimet')


def repo(page, path):
    return page.evaluate('p => __repo.get(p)', path)


def run(browser, url, width):
    phone = width < 500
    page = browser.new_page(viewport={'width': width, 'height': 860}, is_mobile=phone, has_touch=phone, reduced_motion='reduce')
    page.set_default_timeout(8000)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.add_init_script((TESTS / 'fakegh.js').read_text() + """
      if (!__repo.kept) for (const [path, text] of Object.entries(%s)) __repo.put(path, text);
      localStorage.setItem('kaikki:gh', '{"repo":"testi/vault","token":"x","branch":"main"}');
    """ % json.dumps(DATA))
    page.goto(url)
    page.wait_for_function('p => KaikkiTesti.vault().files[p]', arg=UNI)
    lst = open_list(page)
    expect(lst.get_by_role('button', name='Muokkaa: Kadonnut')).to_contain_text('[[ei-ole]]')

    # Kadonnut kohde: ei kirjoiteta minnekään, viesti kertoo syyn.
    lst.get_by_role('button', name='Kirjaa: Kadonnut').click()
    expect(lst.locator('#saadin-list-msg')).to_contain_text('[[ei-ole]] ei löydy')
    assert page.evaluate("Object.keys(__repo.files).filter(p => p.includes('ei-ole')).length") == 0

    # Uusi kertanappi: muuttuja, kiinteä arvo ja havaintotunniste päivän muistiinpanoon.
    lst.get_by_role('button', name='+ Uusi säädin').click()
    ed = page.get_by_role('dialog', name='Uusi säädin')
    ed.get_by_role('textbox', name='Nimi').fill('Kahvi')
    ed.get_by_role('checkbox', name='Muuttuja').check()
    ed.get_by_role('combobox', name='Muuttuja', exact=True).fill('Kahvi (kpl)')
    # 0.96: muuttujarivin kentät Muuttuja, Arvo (tyhjä = kysytään) ja Yksikkö.
    ed.get_by_role('textbox', name='Arvo', exact=True).fill('1')
    ed.get_by_role('textbox', name='Havaintotunniste (valinnainen)').fill('ravinto')
    expect(ed.locator('.saadin-preview')).to_contain_text('Kahvi (kpl) = 1, #ravinto))')
    expect(ed.locator('.saadin-preview')).to_contain_text('päivän muistiinpano')
    expect(ed.get_by_role('checkbox', name='Aikaleima')).to_be_disabled()
    ed.get_by_role('button', name='Tallenna').click()
    page.wait_for_function('p => __repo.get(p).includes("## Kahvi\\n- tunnus: kahvi\\n- laji: kertanappi\\n- muuttuja: Kahvi (kpl)\\n- arvo: 1\\n- havaintotunniste: ravinto\\n- tapa: lisaa\\n- minne: paiva\\n- aika: nyt\\n")', arg=SAATIMET)
    assert repo(page, SAATIMET).startswith(SEED_SAATIMET), 'vanha säädin säilyy'

    lst.get_by_role('button', name='Kirjaa: Kahvi').click()
    page.wait_for_function('p => !!__repo.get(p)', arg=DAY_PATH)
    day = repo(page, DAY_PATH)
    assert re.search(r'\n## Pikakirjaukset\n\n- \(\(' + re.escape(fi(TODAY)) + r' klo \d\d\.\d\d, Kahvi \(kpl\) = 1, #ravinto, \^qh[a-z0-9-]+\)\)\n$', day), day
    assert day.startswith('---\ntyyppi: paiva\n')
    expect(lst.locator('#saadin-list-msg')).to_contain_text('Kahvi kirjattu')
    undo = page.get_by_role('button', name='Kumoa: Kahvi')
    expect(undo).to_be_visible()
    box = undo.bounding_box()
    assert box['x'] + box['width'] >= width - 2, 'Kumoa on näytön oikeassa reunassa'
    undo.click()
    page.wait_for_function('p => !__repo.get(p).includes("Kahvi (kpl)")', arg=DAY_PATH)
    expect(undo).to_be_hidden()

    # Toinen painallus jää; Kumoa katoaa itsestään noin kuudessa sekunnissa (tarkistetaan yhdellä leveydellä).
    lst.get_by_role('button', name='Kirjaa: Kahvi').click()
    page.wait_for_function('p => __repo.get(p).includes("Kahvi (kpl) = 1")', arg=DAY_PATH)
    if width == 1440:
        expect(undo).to_be_visible()
        page.wait_for_timeout(6300)
        expect(undo).to_be_hidden()

    # Pelkkä aikaleima, päivitä-tapa ja hakukentästä valittu muistiinpano.
    lst.get_by_role('button', name='+ Uusi säädin').click()
    ed.get_by_role('textbox', name='Nimi').fill('Herätys')
    ed.get_by_role('checkbox', name='Aikaleima').check()
    ed.get_by_label('Lisää vai päivitä').select_option('paivita')
    ed.get_by_label('Minne').select_option('teksti')
    ed.get_by_role('searchbox', name='Hae muistiinpano').fill('unipäi')
    ed.locator('.saadin-found').get_by_role('button', name=re.compile('Unipäiväkirja')).click()
    expect(ed.get_by_text('Valittu: Unipäiväkirja ([[unipaivakirja]])')).to_be_visible()
    expect(ed.locator('.saadin-preview')).to_contain_text(' · Herätys ^heratys')
    ed.get_by_role('button', name='Tallenna').click()
    page.wait_for_function('p => __repo.get(p).includes("## Herätys\\n- tunnus: heratys\\n- laji: kertanappi\\n- aikaleima: kylla\\n- tapa: paivita\\n- minne: [[unipaivakirja]]\\n- aika: nyt\\n")', arg=SAATIMET)
    lst.get_by_role('button', name='Kirjaa: Herätys').click()
    page.wait_for_function('p => __repo.get(p).includes("^heratys")', arg=UNI)
    stamp = re.escape(TODAY.isoformat()) + r' klo \d\d\.\d\d · Herätys \^heratys\n$'
    assert re.search(r'Kappale\.\n\n- ' + stamp, repo(page, UNI)), repo(page, UNI)
    page.evaluate('p => __repo.put(p, __repo.get(p).replace(/klo \\d\\d\\.\\d\\d · Herätys/, "klo 05.00 · Herätys"))', UNI)
    page.evaluate('KaikkiTesti.pull()')
    page.wait_for_function('p => KaikkiTesti.vault().files[p].t.includes("05.00")', arg=UNI)
    lst.get_by_role('button', name='Kirjaa: Herätys').click()
    page.wait_for_function('p => !__repo.get(p).includes("05.00")', arg=UNI)
    text = repo(page, UNI)
    assert text.count('^heratys') == 1 and re.search(r'Kappale\.\n\n- ' + stamp, text), text
    page.get_by_role('button', name='Kumoa: Herätys').click()
    page.wait_for_function('p => __repo.get(p).includes("klo 05.00 · Herätys ^heratys")', arg=UNI)
    dates = page.evaluate("p => noteDates({text: __repo.get(p).split('---\\n')[2], vp: p, created: new Date().toISOString()}).length", UNI)
    assert dates == 0, f'aikaleima ei saa näkyä kalenterissa ({dates})'

    # Vanha muuttujanappi säätimeksi; arvo ja päivä kysytään.
    lst.locator('summary', has_text='Pikakirjauksen vanhat napit').click()
    lst.get_by_role('button', name='Tee säätimeksi: Uni (h)').click()
    ed.get_by_role('button', name='Tallenna').click()
    page.wait_for_function('p => __repo.get(p).includes("## Uni (h)\\n- tunnus: uni-h\\n- laji: kertanappi\\n- muuttuja: Uni (h)\\n- tapa: lisaa\\n- minne: paiva\\n- aika: kysy\\n")', arg=SAATIMET)
    page.wait_for_function('p => !__repo.get(p).includes(\'"Uni (h)"\') && __repo.get(p).includes("- Treeni | kyllä | #treeni")', arg=PRESETS)
    lst.get_by_role('button', name='Kirjaa: Uni (h)').click()
    ask = page.get_by_role('dialog', name='Uni (h)')
    ask.get_by_label('Arvo · Uni (h)').fill('7,5')
    ask.get_by_label('Päivä').fill('2026-11-20')
    expect(ask.get_by_text('Kirjoittaa: päivän muistiinpano', exact=False)).to_contain_text('20.11.2026')
    ask.get_by_role('button', name='Kirjaa').click()
    page.wait_for_function('p => !!__repo.get(p)', arg=OLD_DAY)
    assert re.search(r'\n- \(\(20\.11\.2026, Uni \(h\) = 7,5, \^qh[a-z0-9-]+\)\)\n$', repo(page, OLD_DAY)), repo(page, OLD_DAY)
    expect(ask).to_be_hidden()
    expect(page.get_by_role('button', name='Kumoa: Uni (h)')).to_be_visible()

    # Poisto poistaa vain säätimen, ei kirjauksia.
    lst.get_by_role('button', name='Muokkaa: Kahvi').click()
    page.get_by_role('dialog', name='Muokkaa säädintä').get_by_role('button', name='Poista säädin').click()
    page.wait_for_function('p => !__repo.get(p).includes("## Kahvi")', arg=SAATIMET)
    assert 'Kahvi (kpl) = 1' in repo(page, DAY_PATH)
    expect(lst.get_by_role('button', name='Kirjaa: Kahvi')).to_have_count(0)
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), 'ei vaakavieritystä'
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
