"""0.83: valinta-, monivalinta- ja tilasarakkeet: sirut, valintalista, uusi valinta, valintojen muokkaus."""
import json

from playwright.sync_api import expect, sync_playwright

from selain_60 import TESTS, URL, VIEW
from selain_63 import RULES, file_is, set_file

DOC = ('---\ntyyppi: nakyma\notsikko: Projektit\nnakyy: ei\nmista: kansio = projektit\nsarakkeet:\n  - otsikko\n'
       '  - vaihe | valinta | Idea:sininen, Työn alla:keltainen, Valmis:vihreä\n'
       '  - aiheet | monivalinta | Työ, Koti\n  - tila | tila\n---\n# Projektit\n')
ONE = 'projektit/remontti.md'
TWO = 'projektit/vanha.md'
ONE_TEXT = '---\ntyyppi: projekti\nvaihe: Idea\naiheet: [Työ]\ntila: kesken\n---\n# Remontti\n\nTeksti.\n'
TWO_TEXT = '---\ntyyppi: projekti\nvaihe: Arkistoitu\n---\n# Vanha\n'


def launch(browser, width):
    page = browser.new_page(viewport={'width': width, 'height': 800},
                            has_touch=width < 500, is_mobile=width < 500)
    page.set_default_timeout(8000)
    seed = {VIEW: DOC, ONE: ONE_TEXT, TWO: TWO_TEXT, 'ohjeet/muistiinpanot.md': RULES}
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


def cell(page, key, title='Remontti'):
    row = page.locator('.rvb .rvr').filter(has=page.get_by_role('button', name=title, exact=True))
    return row.locator(f".rv-value[data-field='{key}']")


def press(page, locator, phone):
    if phone:
        locator.tap()
    else:
        locator.click()


def option(page, name):
    return page.locator('#nvchoice-list .nvch-opt').filter(has=page.locator('.rv-opt', has_text=name)).first


def run(browser, width):
    phone = width < 500
    page = launch(browser, width)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    dialog = page.locator('#nvchoice')

    # Sirut: tunnettu valinta värillä, tuntematon harmaana katkoviivana, tila kirjainkoosta riippumatta.
    chip = cell(page, 'vaihe').locator('.rv-opt')
    expect(chip).to_have_text('Idea')
    assert chip.evaluate('c => getComputedStyle(c).getPropertyValue("--oc").trim()') == '#3b7dd8'
    expect(cell(page, 'vaihe', 'Vanha').locator('.rv-opt-unknown')).to_have_text('Arkistoitu')
    expect(cell(page, 'tila').locator('.rv-opt')).to_have_text('Kesken')
    assert cell(page, 'tila').locator('.rv-opt').evaluate('c => getComputedStyle(c).color') == \
        page.evaluate('getComputedStyle(document.body).color')

    # Valinta: napautus avaa listan, valinta tallentaa heti.
    press(page, cell(page, 'vaihe'), phone)
    expect(dialog).to_have_attribute('open', '')
    expect(page.locator('#nvchoice-title')).to_have_text('Vaihe')
    expect(option(page, 'Idea')).to_have_attribute('aria-current', 'true')
    expect(option(page, 'Idea')).to_be_focused()
    press(page, option(page, 'Työn alla'), phone)
    expect(dialog).not_to_have_attribute('open', '')
    text = ONE_TEXT.replace('vaihe: Idea', 'vaihe: Työn alla')
    file_is(page, ONE, text)
    expect(cell(page, 'vaihe').locator('.rv-opt')).to_have_text('Työn alla')

    # Avaus ja sulku ilman muutosta ei kirjoita.
    press(page, cell(page, 'vaihe'), phone)
    page.mouse.click(3, 3)
    expect(dialog).not_to_have_attribute('open', '')
    page.wait_for_timeout(300)
    file_is(page, ONE, text)

    # Monivalinta: ruksit, uusi valinta kirjoittamalla, Valmis. Uusi nimi menee myös sarakkeen valintalistaan.
    press(page, cell(page, 'aiheet'), phone)
    expect(option(page, 'Työ')).to_have_attribute('aria-pressed', 'true')
    press(page, option(page, 'Koti'), phone)
    expect(option(page, 'Koti')).to_have_attribute('aria-pressed', 'true')
    page.locator('#nvchoice-new').fill('Harrastus')
    page.locator('#nvchoice-new').press('Enter')
    expect(option(page, 'Harrastus')).to_have_attribute('aria-pressed', 'true')
    press(page, page.locator('#nvchoice-done'), phone)
    text = text.replace('aiheet: [Työ]', 'aiheet: [Työ, Koti, Harrastus]')
    file_is(page, ONE, text)
    page.wait_for_function("p => (__repo.get(p) || '').includes('  - aiheet | monivalinta | Työ:ruskea, Koti:oranssi, Harrastus:')", arg=VIEW)
    expect(cell(page, 'aiheet').locator('.rv-opt')).to_have_count(3)
    expect(cell(page, 'aiheet').locator('.rv-opt-unknown')).to_have_count(0)

    # Tila: kolme ryhmää, valinta tallentaa. Toisen laitteen muu muutos säilyy.
    press(page, cell(page, 'tila'), phone)
    expect(page.locator('#nvchoice-list .nvch-opt .rv-opt')).to_have_text(['Ei aloitettu', 'Kesken', 'Valmis'])
    expect(option(page, 'Kesken')).to_have_attribute('aria-current', 'true')
    remote = text.replace('Teksti.\n', 'Teksti.\nToisen laitteen rivi.\n')
    set_file(page, ONE, remote)
    press(page, option(page, 'Valmis'), phone)
    text = remote.replace('tila: kesken', 'tila: Valmis')
    file_is(page, ONE, text)

    # Tyhjennä poistaa kentän.
    press(page, cell(page, 'vaihe', 'Vanha'), phone)
    expect(option(page, 'Arkistoitu')).to_have_attribute('aria-current', 'true')
    press(page, dialog.get_by_role('button', name='Tyhjennä'), phone)
    file_is(page, TWO, TWO_TEXT.replace('vaihe: Arkistoitu\n', ''))

    # Valintojen muokkaus sarakevalikosta: järjestys ja väri tallentuvat näkymään kaikille laitteille.
    page.locator(".rvhead [data-k='vaihe|valinta'] .rv-head-sort").press('Shift+F10')
    page.locator('#rvm-choices').click()
    edit = page.locator('#nvchoice-edit')
    expect(edit).to_have_attribute('open', '')
    edit.get_by_label('Väri: Idea').select_option('punainen')
    edit.get_by_role('button', name='Siirrä ylös').nth(2).click()
    press(page, page.locator('#nvchoice-edit-save'), phone)
    page.wait_for_function("p => (__repo.get(p) || '').includes('  - vaihe | valinta | Idea:punainen, Valmis:vihreä, Työn alla:keltainen\\n')", arg=VIEW)
    expect(cell(page, 'vaihe').locator('.rv-opt')).to_have_text('Työn alla')

    # Lajittelu otsikosta seuraa Emilin järjestystä, ei aakkosia.
    press(page, page.locator(".rvhead [data-k='vaihe|valinta'] .rv-head-sort"), phone)
    first = page.locator('.rvb .rvr').first
    expect(first).to_contain_text('Remontti')
    assert not errors, errors
    page.context.close()
    print(f'{width} px: OK')


if __name__ == '__main__':
    with sync_playwright() as p:
        browser = p.chromium.launch()
        try:
            for width in (320, 390, 1280, 1440):
                run(browser, width)
        finally:
            browser.close()
