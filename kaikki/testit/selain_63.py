"""Muistion sarakkeen arvo tallentuu alkuperäiseen muistiinpanoon."""
import json
import shutil

from playwright.sync_api import expect, sync_playwright

from selain_60 import TESTS, URL, VIEW, edit

NOTE = 'paivat/2026/2026-11-23.md'
OTHER = 'paivat/2026/2026-11-22.md'
DOC = ('---\ntyyppi: nakyma\notsikko: Päivät\nnakyy: ei\n'
       'mista: kansio = paivat\nsarakkeet:\n  - otsikko\n  - arvio | luku\n'
       '  - vire | palkki | 0-10\n  - ulkoilu | kylla-ei\n  - mittaus | pvm\n---\n# Päivät\n')
ENTRY = ('---\ntyyppi: paiva\nluotu: 2026-11-23\nlahde: emil\ntagit: [seuranta]\n---\n'
         '# Ensimmäinen seuranta\n\nRunko  \n\n```\narvio: 99\n```\n\narvio: 5\n')
SECOND = '# Toinen seuranta\n\nVanha muistiinpano ilman alkutietoja.\n'
RULES = '### Omat kentät\n- Sovitut kentät: `arvio`.\n'


def launch(browser, width, note=ENTRY, view=DOC):
    page = browser.new_page(viewport={'width': width, 'height': 800},
                            has_touch=width < 500, is_mobile=width < 500)
    page.set_default_timeout(8000)
    seed = {VIEW: view, NOTE: note, OTHER: SECOND, 'ohjeet/muistiinpanot.md': RULES}
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


def row(page, title='Ensimmäinen seuranta'):
    return page.locator('.rvb .rvr').filter(has=page.get_by_role('button', name=title, exact=True))


def field(page, key='uni', title='Ensimmäinen seuranta'):
    return row(page, title).locator(f'.rv-value[data-field="{key}"]')


def open_cell(page, key='uni', title='Ensimmäinen seuranta', touch=False):
    cell = field(page, key, title)
    if touch:
        cell.tap()
    else:
        cell.press('Enter')
    return page.locator('#nvcell-input')


def file_is(page, path, text):
    page.wait_for_function('([path,text]) => __repo.get(path) === text', arg=[path, text])


def set_file(page, path, content):
    page.evaluate('([path,value]) => __repo.put(path,value)', [path, content])


def with_field(text, line):
    return text.replace('\n---\n', '\n' + line + '\n---\n', 1)


def run(browser, width):
    page = launch(browser, width)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    expect(field(page, 'arvio')).to_have_text('5')
    edit(page)
    page.get_by_label('Kentän nimi').fill('Uni')
    page.get_by_role('button', name='Lisää kenttä', exact=True).click()
    page.get_by_label('Näyttötapa: uni').select_option('luku')
    page.locator('.nved-col[data-k=uni]').get_by_label('Yksikkö').fill('h')
    page.locator('#nvedit').get_by_role('button', name='Tallenna', exact=True).click()
    expect(field(page)).to_have_text('–')
    view = page.evaluate('path => __repo.get(path)', VIEW)
    assert '  - uni | luku | h\n' in view

    cell = open_cell(page, touch=width < 500)
    expect(cell).to_have_attribute('inputmode', 'decimal')
    cell.fill('8 h')
    cell.press('Enter')
    expect(cell).to_have_attribute('aria-invalid', 'true')
    file_is(page, NOTE, ENTRY)
    cell.fill('8,5')
    cell.press('Enter')
    text = with_field(ENTRY, 'uni: 8,5')
    file_is(page, NOTE, text)
    expect(field(page)).to_have_text('8,5 h')
    expect(field(page)).to_be_focused()

    if width == 390:
        other = launch(browser, 1280, note=text, view=view.replace('uni | luku | h', 'uni | prosentti'))
        expect(field(other)).to_have_text('8,5 %')
        file_is(other, NOTE, text)
        other.context.close()

    # Oman kentän arvo on kaavamoottorin jo luettavissa. Oikea muistiinpano avautuu otsikosta.
    assert page.evaluate("KAAVA.create(KaikkiTesti.notes(), new Set()).run('=SUMMA(uni)').value") == 8.5
    row(page).get_by_role('button', name='Ensimmäinen seuranta', exact=True).click()
    expect(page.locator('#nsheet')).to_be_visible()
    page.get_by_role('button', name='Tiedot', exact=True).click()
    expect(page.locator('#ns-info').get_by_label('uni', exact=True)).to_have_value('8,5')
    page.keyboard.press('Escape')
    page.locator('#nsheet .sx').click()

    edit(page)
    page.get_by_label('Näyttötapa: uni').select_option('palkki')
    page.locator('.nved-col[data-k=uni]').get_by_label('Väli').fill('0-10')
    page.locator('#nvedit').get_by_role('button', name='Tallenna', exact=True).click()
    expect(field(page).locator('.rvpb i')).to_have_attribute('style', 'width: 85%;')
    file_is(page, NOTE, text)
    assert page.evaluate('path => __repo.get(path)', VIEW).find('uni | palkki | 0-10') >= 0

    # Escape peruu, myöhemmin tehty muu tiedostomuutos säilyy ja sama kenttä vaatii valinnan.
    cell = open_cell(page)
    cell.fill('7')
    cell.press('Escape')
    file_is(page, NOTE, text)
    cell = open_cell(page)
    cell.fill('7')
    remote = text.replace('Runko  ', 'Uusi runko  ')
    set_file(page, NOTE, remote)
    cell.press('Enter')
    text = remote.replace('uni: 8,5', 'uni: 7')
    file_is(page, NOTE, text)
    expect(field(page).locator('small')).to_have_text('7')
    cell = open_cell(page)
    cell.fill('9')
    remote = text.replace('uni: 7', 'uni: 6')
    set_file(page, NOTE, remote)
    cell.press('Enter')
    expect(page.locator('#nvcell-error')).to_contain_text('Tallennettu arvo: 6')
    expect(cell).to_have_value('9')
    file_is(page, NOTE, remote)
    page.get_by_role('button', name='Korvaa arvo', exact=True).click()
    text = remote.replace('uni: 6', 'uni: 9')
    file_is(page, NOTE, text)

    cell = open_cell(page, 'arvio')
    cell.fill('4')
    cell.press('Enter')
    text = text.replace('\narvio: 5\n', '\narvio: 4\n')
    file_is(page, NOTE, text)
    expect(field(page, 'arvio')).to_have_text('4')

    cell = open_cell(page, 'ulkoilu')
    cell.select_option('ei')
    page.locator('#nvcell-form').get_by_role('button', name='Tallenna', exact=True).click()
    text = with_field(text, 'ulkoilu: ei')
    file_is(page, NOTE, text)
    expect(field(page, 'ulkoilu')).to_have_attribute('aria-label', 'Ulkoilu · Ensimmäinen seuranta · ei')
    cell = open_cell(page, 'mittaus')
    cell.fill('2026-11-22')
    page.locator('#nvcell-form').get_by_role('button', name='Tallenna', exact=True).click()
    text = with_field(text, 'mittaus: 2026-11-22')
    file_is(page, NOTE, text)
    expect(field(page, 'mittaus')).to_have_text('22.11.2026')

    cell = open_cell(page, title='Toinen seuranta')
    cell.fill('0')
    cell.press('Enter')
    file_is(page, OTHER, '---\nuni: 0\n---\n' + SECOND)
    expect(field(page, title='Toinen seuranta').locator('small')).to_have_text('0')
    cell = open_cell(page)
    cell.fill('')
    cell.press('Enter')
    file_is(page, NOTE, text.replace('uni: 9\n', ''))
    expect(field(page)).to_have_text('–')
    assert not errors, errors
    page.context.close()
    print(f'{width} px: OK')


if __name__ == '__main__':
    with sync_playwright() as playwright:
        try:
            browser = playwright.chromium.launch()
        except Exception:
            browser = playwright.chromium.launch(executable_path=shutil.which('chromium'))
        for width in (320, 390, 1280, 1440):
            run(browser, width)
        browser.close()
