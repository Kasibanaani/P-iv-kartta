"""0.81: Muistion yhteenvetorivi: laskut, suodatus, tallennus näkymätiedostoon ja sarakkeen kaava koko sarakkeesta."""
import json
import re

from playwright.sync_api import expect, sync_playwright

from selain_60 import TESTS, URL, VIEW
from selain_63 import RULES, file_is, set_file

KEY = 'muuttuja("Uni (h)")'
SHARE = '=PYÖRISTÄ(arvio/SUMMA(arvio)*100; 1)'
DOC = ('---\ntyyppi: nakyma\notsikko: Päivät\nnakyy: ei\nmista: kansio = paivat\nsarakkeet:\n  - otsikko\n'
       '  - arvio | luku | €\n  - ' + KEY + ' | luku | h | w=120\n  - ulkoilu | kylla-ei\n  - ' + SHARE + ' | prosentti\n'
       '---\n# Päivät\n')
NOTES = {
    'paivat/2026/2026-11-20.md': '---\ntyyppi: paiva\narvio: 0,1\nulkoilu: kyllä\n---\n# Aamu\n\n!!2026-11-20: Uni (h): 7,5!!\n',
    'paivat/2026/2026-11-21.md': '---\ntyyppi: paiva\narvio: 0,2\nulkoilu: ei\n---\n# Ilta\n\n!!2026-11-21: Uni (h): 8!!\n',
    'paivat/2026/2026-11-22.md': '---\ntyyppi: paiva\narvio: ei tiedossa\nulkoilu: kyllä\n---\n# Retki\n\n!!Uni (h): huono!!\n',
    'paivat/2026/2026-11-23.md': '# Tyhjä päivä\n\nEi kirjauksia.\n',
    'inbox/muu.md': '---\ntyyppi: tieto\narvio: 10\n---\n# Näkymän ulkopuolella\n',
}


def launch(browser, width, view=DOC):
    page = browser.new_page(viewport={'width': width, 'height': 700},
                            has_touch=width < 500, is_mobile=width < 500)
    page.set_default_timeout(8000)
    seed = dict(NOTES)
    seed.update({VIEW: view, 'ohjeet/muistiinpanot.md': RULES})
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


def sum_cell(page, key):
    return page.locator(f".rvsum .rvc[data-k='{key}']")


def header_menu(page, key):
    page.locator(f".rvhead [data-k='{key}'] .rv-head-sort").press('Shift+F10')


def choose(page, key, name):
    header_menu(page, key)
    page.locator('#rvm-calc').click()
    page.get_by_role('menuitem', name=name, exact=True).click()


def run(browser, width):
    phone = width < 500
    page = launch(browser, width)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    expect(page.locator('.rvb .rvr')).to_have_count(4)
    expect(page.locator('.rvsum')).to_have_count(0)

    # Sarakkeen kaava laskee SUMMA(arvio) näkymän riveistä (0,3), ei koko Vaultista (10,3).
    aamu = page.locator('.rvb .rvr').filter(has_text='Aamu')
    expect(aamu.locator('.rvc').nth(4)).to_have_text('33,3 %')
    expect(page.locator('.rvb .rvr').filter(has_text='Ilta').locator('.rvc').nth(4)).to_have_text('66,7 %')

    # Summa sarakevalikosta: tekstit ja tyhjät ohitetaan, liukulukuvirhe ei näy.
    choose(page, 'arvio|luku', 'Summa')
    cell = sum_cell(page, 'arvio|luku')
    expect(cell).to_contain_text('Summa')
    expect(cell).to_contain_text('0,3 €')
    file_is(page, VIEW, DOC.replace('  - arvio | luku | €\n', '  - arvio | luku | € | laske=summa\n'))

    # Toisella laitteella samaan aikaan muutettu leveys ja oma lasku yhdistyvät.
    remote = DOC.replace('  - arvio | luku | €\n', '  - arvio | luku | € | laske=summa\n').replace('| w=120', '| w=160')
    set_file(page, VIEW, remote)
    choose(page, KEY + '|luku', 'Keskiarvo')
    expected = remote.replace(' | luku | h | w=160\n', ' | luku | h | w=160 | laske=keskiarvo\n')
    file_is(page, VIEW, expected)
    expect(sum_cell(page, KEY + '|luku')).to_contain_text('7,75 h')

    choose(page, 'ulkoilu|kylla-ei', 'Kyllä-osuus')
    expected = expected.replace('  - ulkoilu | kylla-ei\n', '  - ulkoilu | kylla-ei | laske=osuus-kylla\n')
    file_is(page, VIEW, expected)
    expect(sum_cell(page, 'ulkoilu|kylla-ei')).to_contain_text('50 %')

    # Yhteenvetorivin solusta voi vaihtaa laskun; mediaani ja määrä.
    target = sum_cell(page, KEY + '|luku').get_by_role('button')
    if phone:
        target.tap()
    else:
        target.click()
    page.get_by_role('menuitem', name='Mediaani', exact=True).click()
    expected = expected.replace('laske=keskiarvo', 'laske=mediaani')
    file_is(page, VIEW, expected)
    expect(sum_cell(page, KEY + '|luku')).to_contain_text('7,75 h')
    if not phone:
        expect(sum_cell(page, KEY + '|luku').get_by_role('button')).to_be_focused()
    choose(page, 'otsikko', 'Määrä')
    expected = expected.replace('  - otsikko\n', '  - otsikko | laske=maara\n')
    file_is(page, VIEW, expected)
    expect(sum_cell(page, 'otsikko')).to_contain_text('4')

    # Haku rajaa näkyvät rivit ja tulokset päivittyvät heti.
    page.locator('#nsearch').fill('Ilta')
    expect(sum_cell(page, 'otsikko')).to_contain_text('1')
    expect(sum_cell(page, 'arvio|luku')).to_contain_text('0,2 €')
    expect(sum_cell(page, 'ulkoilu|kylla-ei')).to_have_text(re.compile(r'^Kyllä\s*0 %$'))
    page.locator('#nsearch').fill('')
    expect(sum_cell(page, 'arvio|luku')).to_contain_text('0,3 €')

    # Ei laskua poistaa määreen; muu rivi säilyy.
    choose(page, 'arvio|luku', 'Ei laskua')
    expected = expected.replace(' | € | laske=summa\n', ' | €\n')
    file_is(page, VIEW, expected)
    expect(sum_cell(page, 'arvio|luku')).to_have_text('')

    # Lukittu näkymä näyttää tulokset mutta ei muutosnappeja.
    page.get_by_role('button', name='Näkymän lukitus').click()
    expect(page.get_by_role('button', name='Näkymän lukitus')).to_have_attribute('aria-pressed', 'true')
    expect(sum_cell(page, 'otsikko')).to_contain_text('4')
    expect(page.locator('.rvsum button')).to_have_count(0)
    for path, text in NOTES.items():
        file_is(page, path, text)
    assert not errors, errors
    page.context.close()

    # Uudelleenavaus lukee tiedoston: yhteenveto on yhteinen kaikille laitteille.
    other = launch(browser, 1280 if phone else 390, view=expected)
    expect(sum_cell(other, KEY + '|luku')).to_contain_text('Mediaani')
    expect(sum_cell(other, 'ulkoilu|kylla-ei')).to_contain_text('50 %')
    other.context.close()

    # Pitkässä näkymässä rivi pysyy näkyvän alueen alareunassa vieritettäessä.
    long_view = DOC.replace('  - otsikko\n', '  - otsikko | laske=maara\n')
    many = launch_many(browser, width, long_view)
    total = len(NOTES) - 1 + 60
    expect(sum_cell(many, 'otsikko')).to_contain_text(str(total))
    scroller = many.locator('#nlist')
    for top in (0, 900):
        scroller.evaluate('(el, top) => el.scrollTop = top', top)
        many.wait_for_timeout(50)
        box = many.locator('.rvsum').bounding_box()
        area = scroller.bounding_box()
        assert abs(box['y'] + box['height'] - (area['y'] + area['height'])) <= 2, (top, box, area)
    many.context.close()
    print(f'{width} px: OK')


def launch_many(browser, width, view):
    page = browser.new_page(viewport={'width': width, 'height': 700},
                            has_touch=width < 500, is_mobile=width < 500)
    page.set_default_timeout(8000)
    seed = dict(NOTES)
    for i in range(60):
        seed[f'paivat/2026/lisa-{i:02d}.md'] = f'# Lisärivi {i}\n'
    seed.update({VIEW: view, 'ohjeet/muistiinpanot.md': RULES})
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


if __name__ == '__main__':
    with sync_playwright() as p:
        browser = p.chromium.launch()
        try:
            for width in (320, 390, 1280, 1440):
                run(browser, width)
        finally:
            browser.close()
