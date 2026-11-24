"""Taulukoiden näkymävälilehti käyttää Muistion editoria ja turvallista osapäivitystä."""
import json

from playwright.sync_api import expect, sync_playwright

from selain_60 import TESTS

SHEET = 'taulukot/projektit/projektit.md'
OTHER = 'taulukot/projektit/muu.md'
NOTE_VIEW = 'nakymat/projektit.md'
LEGACY = 'taulukot/projektit/minimi.md'
DOC = (
    '---\ntyyppi: taulukko\notsikko: Projektit\ntaulukko: Oma kirja\n'
    'mista: kansio = projektit\njarjestys: hinta laskeva\ntuntematon: säilytä\n'
    'sarakkeet:\n  - otsikko\n  # Oma kommentti\n'
    '  - hinta | luku | € | w=125 | oma=kyllä\n  - =hinta*2\n'
    '---\n# Projektit\n\nKäsin kirjoitettu runko.\n'
)
NOTES = {
    'projektit/a.md': ('Alfa', 20),
    'projektit/b.md': ('Beta', 20),
    'projektit/c.md': ('Gamma', 10),
    'inbox/d.md': ('Delta', 30),
}
SEED = {
    SHEET: DOC,
    OTHER: ('---\ntyyppi: taulukko\notsikko: Summa\ntaulukko: Oma kirja\n'
            '---\n# Summa\n\n| Tulos |\n| --- |\n| =SUMMA([[projektit]]!B1:B3) |\n'),
    NOTE_VIEW: DOC.replace('tyyppi: taulukko', 'tyyppi: nakyma\nnakyy: ei'),
    LEGACY: ('---\ntyyppi: taulukko\notsikko: Minimi\ntaulukko: Oma kirja\n'
             'mista: kansio = projektit\n---\n# Minimi\n'),
    **{path: f'---\ntyyppi: tieto\notsikko: {name}\nhinta: {price}\n---\n# {name}\n'
       for path, (name, price) in NOTES.items()},
}


def open_sheets(page, width):
    if width < 1000:
        page.locator('#roll').click()
        page.locator('#section-sheets').click()
    else:
        page.locator('#nav [data-tab=sheets]').click()


def open_editor(page):
    page.locator('#sg-more').click()
    page.get_by_role('menuitem', name='Muokkaa näkymävälilehteä').click()
    dialog = page.get_by_role('dialog', name='Muokkaa näkymävälilehteä')
    expect(dialog).to_be_visible()
    return dialog


def rows(page, names):
    expect(page.locator('#sg-wrap tbody td[data-c="0"]')).to_have_text(names)


def wait_document(page, path, text):
    page.wait_for_function('([path, text]) => __repo.get(path) === text', arg=[path, text])


def run(browser, width):
    phone = width < 1000
    page = browser.new_page(viewport={'width': width, 'height': 800}, has_touch=phone, is_mobile=phone)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.add_init_script((TESTS / 'fakegh.js').read_text() + """
      if (!__repo.kept) {
        for (const [path, text] of Object.entries(%s)) __repo.put(path, text);
        localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
        localStorage.setItem('kaikki:taulukko', %s);
        localStorage.setItem('kaikki:nview', %s);
      }
    """ % (json.dumps(SEED), json.dumps(SHEET), json.dumps(NOTE_VIEW)))
    page.goto((TESTS.parent / 'index.html').as_uri())
    page.wait_for_function('(path) => window.KaikkiTesti?.vault().files[path]', arg=SHEET)
    open_sheets(page, width)
    rows(page, ['Alfa', 'Beta', 'Gamma'])

    editor = open_editor(page)
    editor.get_by_label('Näkymän nimi').fill('Peruttava nimi')
    if phone:
        editor.get_by_role('button', name='Peru muutokset').click()
    else:
        page.keyboard.press('Escape')
    expect(editor).to_be_hidden()
    wait_document(page, SHEET, DOC)

    editor = open_editor(page)
    editor.get_by_role('button', name='Lisää lajitteluperuste').click()
    editor.get_by_label('Lajittelukenttä 2').select_option('otsikko')
    editor.get_by_label('Suunta 2').select_option('-1')
    # Toisaalla tehty muutos eri kenttään ja runkoon on säilytettävä.
    remote = DOC.replace('tuntematon: säilytä', 'tuntematon: tuore').replace('Käsin kirjoitettu', 'Toisaalla kirjoitettu')
    page.evaluate('([path, text]) => __repo.put(path, text)', [SHEET, remote])
    editor.get_by_role('button', name='Tallenna').click()
    sorted_doc = remote.replace('jarjestys: hinta laskeva', 'jarjestys: hinta laskeva, otsikko laskeva')
    wait_document(page, SHEET, sorted_doc)
    rows(page, ['Beta', 'Alfa', 'Gamma'])
    assert page.evaluate('localStorage.getItem("kaikki:nview")') == NOTE_VIEW
    assert page.evaluate('(path) => __repo.get(path)', NOTE_VIEW) == SEED[NOTE_VIEW]

    editor = open_editor(page)
    editor.get_by_role('button', name='Poista ehto').click()
    editor.get_by_role('button', name='Lisää ehto').click()
    editor.get_by_label('Ehdon kenttä').select_option('hinta')
    editor.get_by_label('Vertailu').select_option('>')
    editor.get_by_label('Arvo', exact=True).fill('10')
    editor.locator('[data-k="=hinta*2"]').get_by_role('button', name='Siirrä ylös').click()
    editor.get_by_text('Yhteiset sarakeleveydet', exact=True).click()
    editor.get_by_label('Valitse sarake leveydelle').select_option(label='hinta')
    editor.get_by_label('Yhteinen leveys pikseleinä').fill('180')
    editor.get_by_role('button', name='Tallenna').click()
    expected = sorted_doc.replace('mista: kansio = projektit', 'mista: hinta > 10').replace(
        '  # Oma kommentti\n  - hinta | luku | € | w=125 | oma=kyllä\n  - =hinta*2',
        '  - =hinta*2\n  # Oma kommentti\n  - hinta | luku | € | w=180 | oma=kyllä',
    )
    wait_document(page, SHEET, expected)
    rows(page, ['Delta', 'Beta', 'Alfa'])
    expect(page.locator('#sg-wrap tbody td[data-c="1"]')).to_have_text(['60', '40', '40'])
    expect(page.locator('#sg-wrap col').nth(3)).to_have_css('width', '180px')

    # Toinen välilehti näkee uudet arvot samasta osoitteesta, myös uudelleen avattaessa.
    page.get_by_role('button', name='Summa', exact=True).click()
    expect(page.locator('#sg-wrap tbody td')).to_have_text(['140'])
    page.get_by_role('button', name='Projektit', exact=True).click()
    page.reload()
    if not page.locator('#sg-wrap').is_visible():
        open_sheets(page, width)
    rows(page, ['Delta', 'Beta', 'Alfa'])

    editor = open_editor(page)
    editor.get_by_label('Näkymän nimi').fill('Oma nimi')
    renamed = expected.replace('otsikko: Projektit', 'otsikko: Tuore nimi').replace('# Projektit', '# Tuore nimi')
    page.evaluate('([path, text]) => __repo.put(path, text)', [SHEET, renamed])
    editor.get_by_role('button', name='Tallenna').click()
    expect(page.get_by_role('button', name='Tuore nimi', exact=True)).to_be_visible()
    page.locator('#sg-more').click()
    expect(page.get_by_role('status').filter(has_text='muutettu toisaalla: nimi')).to_be_visible()
    page.get_by_role('menuitem', name='Pidä toisaalla tehty').click()
    wait_document(page, SHEET, renamed)

    page.get_by_role('button', name='Minimi', exact=True).click()
    editor = open_editor(page)
    editor.get_by_role('button', name='Poista ehto').click()
    editor.get_by_role('button', name='Tallenna').click()
    wait_document(page, LEGACY, SEED[LEGACY].replace('kansio = projektit', 'kaikki'))
    expect(page.locator('#sg-status')).to_have_text('Näkymä · 4 muistiinpanoa')
    assert not errors, errors
    for path in [OTHER, *NOTES]:
        assert page.evaluate('(path) => __repo.get(path)', path) == SEED[path]
    page.close()


if __name__ == '__main__':
    with sync_playwright() as playwright, playwright.chromium.launch() as browser:
        for width in (320, 390, 1280, 1440):
            run(browser, width)
            print(f'{width} px OK')
