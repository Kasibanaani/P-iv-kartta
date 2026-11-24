"""0.82: päiväsarake kuukausivalitsimella, useampi päivä ja Näytä kalenterissa."""
import datetime
import json

from playwright.sync_api import expect, sync_playwright

from selain_60 import TESTS, URL, VIEW
from selain_63 import DOC, ENTRY, NOTE, OTHER, SECOND, RULES, file_is, row, set_file

WD = ['ma', 'ti', 'ke', 'to', 'pe', 'la', 'su']
START = ENTRY.replace('tagit: [seuranta]\n', 'tagit: [seuranta]\nmittaus: 2026-11-30\n')
KEY = 'muuttuja("Lähtö")'
VIEW_TEXT = DOC.replace('  - mittaus | pvm\n', '  - mittaus | pvm\n  - ' + KEY + ' | pvm\n')


def short(iso):
    day = datetime.date.fromisoformat(iso)
    year = '' if day.year == datetime.date.today().year else str(day.year)
    return f'{WD[day.weekday()]} {day.day}.{day.month}.{year}'


def launch(browser, width, note=START, view=VIEW_TEXT):
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
        localStorage.setItem('kaikki:calview','w');
      }
    """ % (json.dumps(seed), json.dumps(VIEW)))
    page.goto(URL)
    return page


def cell(page, key='mittaus'):
    return row(page).locator(f".rv-value[data-field='{key}']")


def press(page, locator, phone):
    if phone:
        locator.tap()
    else:
        locator.click()


def close_outside(page):
    page.mouse.click(3, 3)
    expect(page.locator('#dsheet')).not_to_have_attribute('open', '')


def day(page, iso):
    return page.locator(f'#ds-grid [data-day="{iso}"]')


def run(browser, width):
    phone = width < 500
    page = launch(browser, width)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    expect(cell(page)).to_have_text(short('2026-11-30'))

    # Napautus avaa kuukausivalitsimen valitun päivän kuukaudesta; seuraava kuukausi ja toinen päivä.
    press(page, cell(page), phone)
    expect(page.locator('#dsheet')).to_have_attribute('open', '')
    expect(page.locator('#ds-cap')).to_have_text('Mittaus · Ensimmäinen seuranta')
    expect(page.locator('#ds-h')).to_have_text('marraskuu 2026')
    expect(day(page, '2026-11-30')).to_have_attribute('aria-pressed', 'true')
    press(page, page.locator('#ds-next'), phone)
    press(page, day(page, '2026-12-02'), phone)
    expect(day(page, '2026-12-02')).to_have_attribute('aria-pressed', 'true')
    close_outside(page)
    text = START.replace('mittaus: 2026-11-30\n', 'mittaus: 2026-11-30, 2026-12-02\n')
    file_is(page, NOTE, text)
    expect(cell(page)).to_have_text(short('2026-11-30') + '+1')
    expect(cell(page)).to_be_focused()

    # Avaus ja sulku ilman muutosta ei kirjoita.
    press(page, cell(page), phone)
    expect(page.locator('#dsheet')).to_have_attribute('open', '')
    close_outside(page)
    page.wait_for_timeout(300)
    file_is(page, NOTE, text)

    # Toisella laitteella muutettu arvo: ristiriita näyttää solueditorin ja Korvaa arvo tallentaa oman valinnan.
    press(page, cell(page), phone)
    expect(page.locator('#ds-h')).to_have_text('joulukuu 2026')
    press(page, page.locator('#ds-prev'), phone)
    press(page, day(page, '2026-11-30'), phone)
    remote = text.replace('mittaus: 2026-11-30, 2026-12-02\n', 'mittaus: 2026-12-24\n') + '\nToisen laitteen rivi.\n'
    set_file(page, NOTE, remote)
    close_outside(page)
    expect(page.locator('#nvcell-error')).to_contain_text('Tallennettu arvo: 2026-12-24')
    expect(page.locator('#nvcell-input')).to_have_value('2026-12-02')
    file_is(page, NOTE, remote)
    page.get_by_role('button', name='Korvaa arvo').click()
    text = remote.replace('mittaus: 2026-12-24\n', 'mittaus: 2026-12-02\n')
    file_is(page, NOTE, text)
    expect(cell(page)).to_have_text(short('2026-12-02'))

    # Viimeisen päivän poisto tyhjentää kentän, ja rivi poistuu alkutiedoista.
    press(page, cell(page), phone)
    expect(page.locator('#ds-h')).to_have_text('joulukuu 2026')
    press(page, day(page, '2026-12-02'), phone)
    close_outside(page)
    text = text.replace('mittaus: 2026-12-02\n', '')
    file_is(page, NOTE, text)
    expect(cell(page)).to_have_text('–')

    # Tekstimuuttujan päivä tallentuu merkintänä.
    press(page, cell(page, KEY), phone)
    expect(page.locator('#ds-cap')).to_have_text('Lähtö · Ensimmäinen seuranta')
    today = datetime.date.today().isoformat()
    press(page, day(page, today), phone)
    close_outside(page)
    text = text + '\n!!Lähtö: ' + today + '!!\n'
    file_is(page, NOTE, text)
    expect(cell(page, KEY)).to_have_text(short(today))

    if not phone:
        # Tietokoneella näppäily avaa tekstikentän: useampi päivä pilkulla, järjestys korjautuu.
        expect(cell(page, KEY)).to_be_focused()
        cell(page).focus()
        expect(cell(page)).to_be_focused()
        page.keyboard.press('2')
        page.locator('#nvcell-input').fill('2026-12-05, 2026-12-01, 2026-12-05')
        page.locator('#nvcell-input').press('Enter')
        text = text.replace('tagit: [seuranta]\n', 'tagit: [seuranta]\nmittaus: 2026-12-01, 2026-12-05\n')
        file_is(page, NOTE, text)
        cell(page).press('F2')
        page.locator('#nvcell-input').fill('30.11.2026')
        page.locator('#nvcell-input').press('Enter')
        expect(page.locator('#nvcell-error')).to_contain_text('VVVV-KK-PP')
        page.locator('#nvcell-input').press('Escape')
        file_is(page, NOTE, text)

    # Edellisen solun kohdistus palautuu ruudunpäivityksen jälkeen; odotetaan se ennen valikkoa.
    expect(cell(page, KEY if phone else 'mittaus')).to_be_focused()
    # Näytä kalenterissa sarakevalikosta: näkymätiedoston määre ja kalenterin vain luettava merkintä.
    page.locator(f".rvhead [data-k='{KEY}|pvm'] .rv-head-sort").press('Shift+F10')
    expect(page.locator('#rvm-kal')).to_have_attribute('aria-checked', 'false')
    page.locator('#rvm-kal').click()
    view = VIEW_TEXT.replace(f'  - {KEY} | pvm\n', f'  - {KEY} | pvm | kalenteri=kylla\n')
    file_is(page, VIEW, view)
    if page.locator('#roll').is_visible():
        page.locator('#roll').click()
        page.locator('#section-cal').click()
    else:
        page.locator('[data-tab="cal"]').click()
    chip = page.locator('.nvcal-chip').filter(has_text='Ensimmäinen seuranta')
    expect(chip).to_have_count(1)
    expect(chip).to_contain_text('Lähtö')
    press(page, chip, phone)
    expect(page.locator('#nsheet')).to_be_visible()
    file_is(page, OTHER, SECOND)
    assert not errors, errors
    page.context.close()

    # Muuten kuin valitsimella kirjoitettu arvo säilyy, kun päivän napauttaa päälle ja pois.
    for raw in ('ensi viikolla', '2026-12-02,2026-11-30'):
        loose = START.replace('mittaus: 2026-11-30\n', f'mittaus: {raw}\n')
        other = launch(browser, width, note=loose)
        press(other, cell(other), phone)
        expect(other.locator('#dsheet')).to_have_attribute('open', '')
        target = other.locator('#ds-grid .mday').nth(10)
        press(other, target, phone)
        press(other, target, phone)
        close_outside(other)
        other.wait_for_timeout(400)
        file_is(other, NOTE, loose)
        other.context.close()
    print(f'{width} px: OK')


if __name__ == '__main__':
    with sync_playwright() as p:
        browser = p.chromium.launch()
        try:
            for width in (320, 390, 1280, 1440):
                run(browser, width)
        finally:
            browser.close()
