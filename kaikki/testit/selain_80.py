"""0.80: uusi sarake Muistion otsikkorivin ＋-napista."""
import json

from playwright.sync_api import expect, sync_playwright

from selain_60 import TESTS, URL, VIEW
from selain_63 import DOC, ENTRY, NOTE, OTHER, SECOND, RULES, field, file_is, row, set_file

SLEEP = 'inbox/uni.md'
SLEEP_TEXT = '# Viime yö\n\n!!2026-11-20: Uni (h): 7,5!!\n'
NEW_VIEW = 'nakymat/unet.md'


def launch(browser, width, view=DOC, current=VIEW):
    page = browser.new_page(viewport={'width': width, 'height': 800},
                            has_touch=width < 500, is_mobile=width < 500)
    page.set_default_timeout(8000)
    seed = {VIEW: view, NOTE: ENTRY, OTHER: SECOND, SLEEP: SLEEP_TEXT, 'ohjeet/muistiinpanot.md': RULES}
    page.add_init_script((TESTS / 'fakegh.js').read_text() + """
      if (!__repo.kept) {
        for (const [path, text] of Object.entries(%s)) __repo.put(path, text);
        localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
        localStorage.setItem('kaikki:nmode','rows');
        localStorage.setItem('kaikki:nview',%s);
      }
    """ % (json.dumps(seed), json.dumps(current)))
    page.goto(URL)
    return page


def vfield(page, key):
    return row(page).locator(f".rv-value[data-field='{key}']")


def press(page, locator, phone):
    if phone:
        locator.tap()
    else:
        locator.click()


def heads(page):
    return page.locator('.rvhead .rvc').evaluate_all('cells => cells.map(c => c.dataset.k || (c.classList.contains("rv-add") ? "+" : ""))')


def run(browser, width):
    phone = width < 500
    page = launch(browser, width)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    add = page.get_by_role('button', name='Lisää sarake', exact=True)
    dialog = page.get_by_role('dialog', name='Uusi sarake')
    expect(field(page, 'arvio')).to_have_text('5')
    assert heads(page)[-1] == '+'

    # Peruminen ei muuta tiedostoa.
    press(page, add, phone)
    expect(dialog).to_be_visible()
    expect(page.locator('#nvcol-source')).to_have_value('muuttuja')
    expect(page.locator('#nvcol-name')).to_be_focused()
    page.keyboard.press('Escape')
    expect(dialog).to_be_hidden()
    file_is(page, VIEW, DOC)

    # Samankaltainen nimi: ehdotus valitsee olemassa olevan muuttujan ja luku-lajin.
    press(page, add, phone)
    page.locator('#nvcol-name').fill('uni')
    similar = page.locator('#nvcol-similar')
    expect(similar).to_contain_text('Samankaltainen nimi')
    press(page, similar.get_by_role('button', name='Uni (h)'), phone)
    expect(page.locator('#nvcol-name')).to_have_value('Uni (h)')
    expect(page.locator('#nvcol-type')).to_have_value('luku')
    page.locator('#nvcol-option').fill('h')
    # Toisen laitteen muutos samaan tiedostoon säilyy.
    remote = DOC.replace('otsikko: Päivät', 'otsikko: Päivät ja uni').replace('# Päivät\n', '# Päivät ja uni\n')
    set_file(page, VIEW, remote)
    press(page, dialog.get_by_role('button', name='Lisää sarake'), phone)
    expect(dialog).to_be_hidden()
    key = 'muuttuja("Uni (h)")'
    expected = remote.replace('  - mittaus | pvm\n', '  - mittaus | pvm\n  - ' + key + ' | luku | h\n')
    file_is(page, VIEW, expected)
    expect(page.locator(f'.rvhead .rvc[data-k=\'{key}|luku\']')).to_be_visible()
    assert heads(page)[-2:] == [key + '|luku', '+']
    expect(page.locator('#nvpick')).to_contain_text('Päivät ja uni')
    if not phone:
        expect(page.locator(f'.rvhead .rvc[data-k=\'{key}|luku\'] .rv-head-sort')).to_be_focused()

    # Uuteen sarakkeeseen voi heti kirjoittaa. Arvo menee muistiinpanoon merkintänä.
    cell = vfield(page, key)
    expect(cell).to_have_text('–')
    press(page, cell, phone)
    page.locator('#nvcell-input').fill('8')
    page.locator('#nvcell-input').press('Enter')
    file_is(page, NOTE, ENTRY + '\n((Uni (h): 8))\n')
    expect(vfield(page, key)).to_have_text('8 h')

    # Sama muuttuja eri kirjainkoossa on jo näkymässä.
    press(page, add, phone)
    page.locator('#nvcol-name').fill('uni (H)')
    press(page, dialog.get_by_role('button', name='Lisää sarake'), phone)
    expect(page.locator('#nvcol-error')).to_have_text('Muuttuja on jo tässä näkymässä.')
    expect(page.locator('#nvcol-name')).to_have_attribute('aria-invalid', 'true')

    # Alkutietokenttä: nimi muuttuu kenttäavaimeksi.
    page.locator('#nvcol-source').select_option('kentta')
    page.locator('#nvcol-name').fill('Hinta arvio')
    page.locator('#nvcol-type').select_option('palkki')
    expect(page.locator('#nvcol-option')).to_be_visible()
    page.locator('#nvcol-option').fill('0 - 10,5')
    press(page, dialog.get_by_role('button', name='Lisää sarake'), phone)
    expected = expected.replace(' | luku | h\n', ' | luku | h\n  - hinta_arvio | palkki | 0-10.5\n')
    file_is(page, VIEW, expected)
    expect(page.locator('.rvhead .rvc[data-k="hinta_arvio|palkki"]')).to_be_visible()
    file_is(page, OTHER, SECOND)

    # Lukitussa näkymässä ＋ ei näy.
    page.get_by_role('button', name='Näkymän lukitus').click()
    expect(page.get_by_role('button', name='Näkymän lukitus')).to_have_attribute('aria-pressed', 'true')
    expect(add).to_have_count(0)
    page.get_by_role('button', name='Näkymän lukitus').click()
    expect(add).to_have_count(1)
    assert not errors, errors
    page.context.close()

    # Oletusnäkymästä sarake tallentuu uuteen näkymään, joka avautuu.
    page = launch(browser, width, current='')
    page.on('pageerror', lambda error: errors.append(str(error)))
    expect(page.locator('#nvpick')).to_contain_text('Kaikki muistiinpanot')
    press(page, page.get_by_role('button', name='Lisää sarake', exact=True), phone)
    expect(page.locator('#nvcol-info')).to_contain_text('uuteen näkymään')
    expect(page.locator('#nvcol-view')).to_be_focused()
    page.locator('#nvcol-view').fill('Unet')
    page.locator('#nvcol-name').fill('Uni (h)')
    expect(page.locator('#nvcol-type')).to_have_value('luku')
    press(page, page.get_by_role('dialog', name='Uusi sarake').get_by_role('button', name='Lisää sarake'), phone)
    page.wait_for_function('path => !!__repo.get(path)', arg=NEW_VIEW)
    text = page.evaluate('path => __repo.get(path)', NEW_VIEW)
    assert 'otsikko: Unet\n' in text, text
    assert '\nsarakkeet:\n  - otsikko\n  - kansio\n  - kuka\n  - luotu\n  - ajankohta\n  - muuttuja("Uni (h)") | luku\n---\n' in text, text
    expect(page.locator('#nvpick')).to_contain_text('Unet')
    expect(page.locator('.rvb .rvr').filter(has_text='Viime yö').locator('.rv-value[data-field=\'muuttuja("Uni (h)")\']')).to_have_text('7,5')
    file_is(page, VIEW, DOC)
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
