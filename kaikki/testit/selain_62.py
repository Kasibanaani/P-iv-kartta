"""Muistion jaetut sarakeleveydet, laitepoikkeus, sovitus ja rinnakkainen tallennus."""
import re

from playwright.sync_api import expect, sync_playwright

from selain_60 import VIEW, NOTE, LAYOUT, profile, edit, header_menu

PRICE = '  -  hinta  |  luku  |  €  | lisä=oma | w = 105'
FORMULA = '  - =YHDISTÄ("a|b";"c") | teksti | | muu=1 | w=121'
DOC = ('---\ntyyppi: nakyma\notsikko: Leveydet\nnakyy: ei\nsarakkeet:\n'
       '  - otsikko | w=130\n  # Säilytä kommentti\n'
       '  - kansio | w=160\n' + PRICE + '\n' + FORMULA + '\n---\n# Leveydet\nRunko.\n')


def cell(page, key):
    return page.locator(f'.rvhead .rvc[data-k="{key}"]')


def width(page, key):
    return round(cell(page, key).bounding_box()['width'])


def controls(page, label):
    edit(page)
    page.locator('.nved-widths summary').click()
    page.get_by_label('Valitse sarake leveydelle').select_option(label=label)
    return page.get_by_label('Yhteinen leveys pikseleinä')


def save(page):
    page.mouse.click(3, 3)
    expect(page.locator('#nvedit')).not_to_be_visible()


def file_is(page, expected):
    page.wait_for_function('([path, text]) => __repo.get(path) === text', arg=[VIEW, expected])


def retry_old_draft(page, document):
    # Version 0.60 luonnos luki lyhyen w-määreen lajiksi ja jätti ylimääräiset määreet pois.
    draft = {'path': VIEW, 'old': document, 'name': 'Vanha luonnos', 'mista': [], 'sort': None,
             'repo': 'testi/vault', 'branch': 'main', 'sel': VIEW,
             'cols': [{'k': 'otsikko', 't': 'w=130', 'o': ''},
                      {'k': 'kansio', 't': 'w=207', 'o': ''},
                      {'k': 'hinta', 't': 'luku', 'o': '€'},
                      {'k': '=YHDISTÄ("a|b";"c")', 't': 'teksti', 'o': ''}]}
    page.evaluate("""draft => localStorage.setItem('kaikki:nvpend', JSON.stringify([{
        k: draft.repo+'|main|'+draft.path, D: draft, st: 'virhe'
    }]))""", draft)
    page.reload()
    page.click('#nvpick')
    page.locator('#sortpop [id$="-retry"]').click()
    file_is(page, document.replace('otsikko: Leveydet', 'otsikko: Vanha luonnos')
            .replace('# Leveydet', '# Vanha luonnos'))


def run(browser, first, second):
    page = profile(browser, first, DOC)
    page_errors = []
    page.on('pageerror', lambda e: page_errors.append(str(e)))
    expect(cell(page, 'kansio')).to_be_visible()
    assert width(page, 'kansio') == 160 and width(page, 'hinta|luku') == 105
    # Vanha laiteleveys pysyy etusijalla. Pelkkä avaaminen ei jaa sitä.
    page.evaluate('key=>localStorage.setItem(key, JSON.stringify({w:{"kansio|w=160":207}}))', LAYOUT)
    page.reload()
    expect(cell(page, 'kansio')).to_be_visible()
    assert width(page, 'kansio') == 207
    field = controls(page, 'Kansio')
    expect(field).to_have_value('160')
    page.get_by_role('button', name='Kopioi tämän laitteen leveys (207 px)').click()
    expect(field).to_have_value('207')
    page.click('#nved-cancel')
    file_is(page, DOC)

    field = controls(page, 'Kansio')
    page.get_by_role('button', name='Kopioi tämän laitteen leveys (207 px)').click()
    # Toinen kirjoittaja muuttaa samaan aikaan eri sarakkeen leveyttä ja runkoa.
    concurrent = DOC.replace('w = 105', 'w = 119').replace('Runko.', 'Tuore runko.')
    page.evaluate('([path,text])=>__repo.put(path,text)', [VIEW, concurrent])
    save(page)
    shared = concurrent.replace('w=160', 'w=207')
    file_is(page, shared)
    other = profile(browser, second, shared)
    expect(cell(other, 'kansio')).to_be_visible()
    assert width(other, 'kansio') == 207 and width(other, 'hinta|luku') == 119

    # Sama kenttä kahdessa paikassa: kirjaus odottaa valintaa. Tiedosto säilyy siihen asti.
    field = controls(page, 'hinta')
    field.fill('147')
    remote = shared.replace('w = 119', 'w = 132').replace('w=121', 'w=141')
    page.evaluate('([path,text])=>__repo.put(path,text)', [VIEW, remote])
    save(page)
    expect(page.locator('#nvpick')).to_have_class(re.compile('nv-warn'))
    file_is(page, remote)
    page.click('#nvpick')
    page.locator('#sortpop [id$="-mine"]').click()
    resolved = remote.replace('w = 132', 'w = 147')
    file_is(page, resolved)
    assert width(page, 'hinta|luku') == 147

    # Jaa uusi leveys vanhan laitepoikkeuksen rinnalle, sitten palauta jaettuun.
    field = controls(page, 'Kansio')
    field.fill('178')
    save(page)
    updated = resolved.replace('w=207', 'w=178')
    file_is(page, updated)
    assert width(page, 'kansio') == 207
    header_menu(page, 'kansio')
    page.get_by_role('menuitem', name='Käytä yhteistä leveyttä (178 px)').click()
    assert width(page, 'kansio') == 178
    assert page.evaluate('key=>JSON.parse(localStorage.getItem(key)).w.kansio', LAYOUT) is None

    # Sovita pitkään otsikkoon ja lyhyempään sisältöön, myös tyhjään sarakkeeseen.
    long_note = NOTE.replace('Retki', 'Päiväretki lähisaariston majakkasaarelle')
    page.evaluate("text=>__repo.put('tieto/retki.md',text)", long_note)
    page.reload()
    expect(page.get_by_text('Päiväretki lähisaariston majakkasaarelle', exact=True).first).to_be_visible()
    header_menu(page, 'otsikko')
    page.click('#rvm-fit')
    assert 155 < width(page, 'otsikko') < 700
    expect(page.locator('.rvhead [data-k=otsikko] .rv-head-sort')).to_be_focused()
    if first >= 1000:
        fitted = width(page, 'otsikko')
        header_menu(page, 'otsikko')
        page.click('#rvm-wider')
        assert width(page, 'otsikko') == fitted + 40
        cell(page, 'otsikko').locator('.rv-rz').dblclick()
        assert width(page, 'otsikko') == fitted
    header_menu(page, 'kansio')
    page.click('#rvm-fit')
    assert 60 <= width(page, 'kansio') < 178
    file_is(page, updated)
    assert page.evaluate("__repo.get('tieto/retki.md')") == long_note

    field = controls(page, 'hinta')
    field.fill('')
    save(page)
    file_is(page, updated.replace(' | w = 147', ''))
    assert width(page, 'hinta|luku') == 90  # lukusarakkeen automaattinen leveys
    assert not page_errors, page_errors
    retry_old_draft(other, shared)
    page.context.close()
    other.context.close()
    print(f'{first} + {second} px: OK')


if __name__ == '__main__':
    with sync_playwright() as playwright:
        try:
            browser = playwright.chromium.launch()
        except Exception:
            browser = playwright.chromium.launch(executable_path='/opt/pw-browsers/chromium')
        for pair in [(1440, 390), (320, 1280)]:
            run(browser, *pair)
        browser.close()
