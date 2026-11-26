"""0.101 (suunnitelman 21.7): kaavasarake ＋ sarake -ikkunasta, rivin muuttujat ja ehtofunktiot Muistion rivinäkymässä."""
import datetime

from playwright.sync_api import expect, sync_playwright

from selain_60 import VIEW
from selain_63 import DOC, ENTRY, NOTE, OTHER, SECOND, file_is
from selain_80 import heads, launch, press

TAG = '=JOS(ONTUNNISTE("seuranta"); "seurannassa"; "ei")'
AGE = '=PÄIVIÄ(luotu; TÄNÄÄN())'


def cell_text(page, key, title):
    """Rivin solun teksti sarakeotsikon data-k:n perusteella."""
    return page.evaluate("""([key, title]) => {
      const head = [...document.querySelectorAll('.rvhead .rvc')];
      const i = head.findIndex(c => c.dataset.k === key);
      const row = [...document.querySelectorAll('.rvb .rvr')].find(r => r.textContent.includes(title));
      if (i < 0 || !row) return null;
      return [...row.querySelectorAll(':scope > .rvc')][i]?.textContent.trim() ?? null;
    }""", [key, title])


def wait_cell(page, key, title, text):
    page.wait_for_function("""([key, title, text]) => {
      const head = [...document.querySelectorAll('.rvhead .rvc')];
      const i = head.findIndex(c => c.dataset.k === key);
      const row = [...document.querySelectorAll('.rvb .rvr')].find(r => r.textContent.includes(title));
      return i >= 0 && row && [...row.querySelectorAll(':scope > .rvc')][i]?.textContent.trim() === text;
    }""", arg=[key, title, text])


def run(browser, width):
    phone = width < 500
    page = launch(browser, width)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    add = page.get_by_role('button', name='Lisää sarake', exact=True)
    dialog = page.get_by_role('dialog', name='Uusi sarake')
    formula = page.locator('#nvcol-formula')
    expect(page.locator('.rvb .rvr').first).to_be_visible()

    # Kaava-valinta: nimi piiloon, kaavakenttä ja vihje näkyviin.
    press(page, add, phone)
    expect(dialog).to_be_visible()
    expect(formula).to_be_hidden()
    page.locator('#nvcol-source').select_option('kaava')
    expect(formula).to_be_visible()
    expect(page.locator('#nvcol-name')).to_be_hidden()
    expect(page.locator('#nvcol-formula-hint')).to_contain_text('ajankohta')
    expect(page.locator('#nvcol-source-hint')).to_contain_text('ei kirjoiteta mitään')
    assert page.evaluate('document.documentElement.scrollWidth') <= width

    # Esimerkki täyttää kaavan ja lajin, esikatselu laskee ensimmäiselle riville.
    press(page, dialog.get_by_role('button', name='Päiviä luonnista'), phone)
    expect(formula).to_have_value(AGE)
    expect(page.locator('#nvcol-type')).to_have_value('luku')
    expect(page.locator('#nvcol-formula-preview')).to_contain_text('Ensimmäinen rivi')

    # Kesken jäänyt kaava: ei virhettä kirjoittaessa, virhe vasta lisättäessä.
    formula.fill('=JOS(1;')
    expect(page.locator('#nvcol-error')).to_have_text('')
    expect(formula).not_to_have_attribute('aria-invalid', 'true')
    press(page, dialog.get_by_role('button', name='Lisää sarake'), phone)
    expect(page.locator('#nvcol-error')).to_contain_text('Kaavaa ei voi lukea')
    expect(formula).to_have_attribute('aria-invalid', 'true')
    expect(dialog).to_be_visible()
    file_is(page, VIEW, DOC)

    # Ehto tunnisteesta. Yhtäsuuruusmerkin voi jättää pois.
    formula.fill(TAG[1:])
    expect(formula).not_to_have_attribute('aria-invalid', 'true')
    page.locator('#nvcol-type').select_option('')
    expect(page.locator('#nvcol-formula-preview')).to_contain_text(': seurannassa')
    press(page, dialog.get_by_role('button', name='Lisää sarake'), phone)
    expect(dialog).to_be_hidden()
    expected = DOC.replace('  - mittaus | pvm\n', '  - mittaus | pvm\n  - ' + TAG + '\n')
    file_is(page, VIEW, expected)
    wait_cell(page, TAG, 'Ensimmäinen seuranta', 'seurannassa')
    wait_cell(page, TAG, 'Toinen seuranta', 'ei')

    # Päiviä luonnista lukuna. Toisen muistiinpanon luontipäivä tulee polusta.
    today = datetime.date.today()
    press(page, add, phone)
    page.locator('#nvcol-source').select_option('kaava')
    press(page, dialog.get_by_role('button', name='Päiviä luonnista'), phone)
    page.locator('#nvcol-option').fill('pv')
    press(page, dialog.get_by_role('button', name='Lisää sarake'), phone)
    expect(dialog).to_be_hidden()
    expected = expected.replace(TAG + '\n', TAG + '\n  - ' + AGE + ' | luku | pv\n')
    file_is(page, VIEW, expected)
    first = (today - datetime.date(2026, 11, 23)).days
    second = (today - datetime.date(2026, 11, 22)).days
    wait_cell(page, AGE + '|luku', 'Ensimmäinen seuranta', f'{first} pv')
    wait_cell(page, AGE + '|luku', 'Toinen seuranta', f'{second} pv')
    assert heads(page)[-1] == '+'

    # Sama kaava uudelleen: virhe.
    press(page, add, phone)
    page.locator('#nvcol-source').select_option('kaava')
    formula.fill(AGE)
    press(page, dialog.get_by_role('button', name='Lisää sarake'), phone)
    expect(page.locator('#nvcol-error')).to_have_text('Sama kaava on jo tässä näkymässä.')
    page.keyboard.press('Escape')
    expect(dialog).to_be_hidden()

    # Kaava ei kirjoita muistiinpanoihin.
    file_is(page, NOTE, ENTRY)
    file_is(page, OTHER, SECOND)
    assert page.evaluate('document.documentElement.scrollWidth') <= width
    assert not errors, errors
    page.context.close()
    print(f'{width} px: OK')


if __name__ == '__main__':
    with sync_playwright() as p:
        browser = p.chromium.launch()
        try:
            for width in (320, 390, 1280):
                run(browser, width)
        finally:
            browser.close()
