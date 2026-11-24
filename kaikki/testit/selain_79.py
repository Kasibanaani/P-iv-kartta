"""Muistion suora solumuokkaus, näppäily ja viimeisin havainto."""
from playwright.sync_api import expect, sync_playwright

from selain_63 import DOC, ENTRY, NOTE, OTHER, SECOND, field, file_is, launch, set_file
from selain_60 import VIEW

NAME = 'Uni (h)'
KEY = 'muuttuja("Uni (h)")'
VIEW_TEXT = DOC.replace(
    '  - vire | palkki | 0-10\n', f'  - =arvio*2 | luku\n  - {KEY} | luku\n')
EARLIEST = '!!2026-11-20: Uni (h): 6!!'
LATEST = '!!2026-11-23: Uni (h): 8!!'
OLDER = '!!2026-11-22: Uni (h): 7!!'
ENTRY_TEXT = ENTRY + f'\n{EARLIEST}\nOma selitys.\n{LATEST}\n{OLDER}\n'
TITLE = 'Ensimmäinen seuranta'


def variable(page, title=TITLE):
    return page.get_by_role('button', name=f'{NAME} · {title} · ', exact=False)


def run(browser, width):
    page = launch(browser, width, note=ENTRY_TEXT, view=VIEW_TEXT)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    phone = width < 500
    value = page.locator('#nvcell-input')
    message = page.locator('#nvcell-error')
    number = field(page, 'arvio')
    observation = variable(page)
    expect(observation).to_have_text('8')

    if phone:
        observation.tap()
        expect(page.get_by_role('dialog', name=NAME)).to_be_visible()
    else:
        number.focus()
        page.keyboard.press('4')
        expect(page.locator('.rvb .rv-cell-inline')).to_have_count(1)
        expect(page.locator('#nvcell-edit[open]')).to_have_count(0)
        expect(value).to_have_value('4')
        value.press('Tab')
        changed = ENTRY_TEXT.replace('\narvio: 5\n', '\narvio: 4\n')
        file_is(page, NOTE, changed)
        expect(observation).to_be_focused()
        observation.press('Enter')
        expect(value).to_have_value('8')
        value.fill('8,5')
        value.press('Shift+Tab')
        changed = changed.replace(LATEST, LATEST.replace(': 8!!', ': 8,5!!'))
        file_is(page, NOTE, changed)
        expect(number).to_be_focused()
        observation.click()
        expect(value).to_have_value('8,5')
        value.fill('0')
        value.press('Escape')
        expect(observation).to_be_focused()
        file_is(page, NOTE, changed)
        observation.click()
    expect(value).to_have_attribute('inputmode', 'decimal')
    current = page.evaluate('path => __repo.get(path)', NOTE)
    previous = '8' if phone else '8,5'
    expect(value).to_have_value(previous)
    value.fill('9,25')
    # Sama arvo uudessa havainnossa on uusi kohde. Muun sisällön muutos säilytetään.
    remote_mark = f'!!2026-11-24: Uni (h): {previous}!!'
    remote = current + '\nToisen laitteen huomio.  \n' + remote_mark + '\n'
    set_file(page, NOTE, remote)
    value.press('Enter')
    expect(message).to_contain_text(f'Tallennettu arvo: {previous}')
    expect(value).to_have_value('9,25')
    file_is(page, NOTE, remote)
    value.press('Enter')
    expect(page.get_by_role('button', name='Korvaa arvo')).to_be_focused()
    file_is(page, NOTE, remote)
    page.get_by_role('button', name='Korvaa arvo').click()
    expected = remote.replace(remote_mark, '!!2026-11-24: Uni (h): 9,25!!')
    file_is(page, NOTE, expected)
    expect(observation).to_have_text('9,25')
    expect(observation).to_be_focused()

    if not phone:
        observation.press('Enter')
        value.fill('9,5')
        # Hakusuodatin voi piilottaa rivin. Keskeneräisen muokkauksen voi silloin perua työkaluriviltä.
        page.locator('#nsearch').fill('Vanha muistiinpano')
        page.get_by_role('button', name='Peru solumuutos').click()
        page.locator('#nsearch').fill('')
        expect(observation).to_have_text('9,25')
        file_is(page, NOTE, expected)
        page.get_by_role('button', name='Näkymän lukitus').click()
        expect(page.get_by_role('button', name='Näkymän lukitus')).to_have_attribute('aria-pressed', 'true')
        expect(page.locator('.rv-value')).to_have_count(0)
    file_is(page, OTHER, SECOND)
    assert '  - =arvio*2 | luku\n' in page.evaluate('path => __repo.get(path)', VIEW)
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
