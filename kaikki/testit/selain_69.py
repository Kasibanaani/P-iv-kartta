"""Muistion tekstimuuttujat, yhteinen vieritys ja lajittelun rivien säilyminen."""
import json

from playwright.sync_api import expect, sync_playwright

from selain_60 import TESTS, VIEW, edit
from selain_63 import NOTE, OTHER, file_is
from selain_64 import QuietHandler, ThreadingHTTPServer, Thread

NAME = 'Uni (h), oma | ilta'
NEW = 'Uusi seuranta'
KEY = f'muuttuja({json.dumps(NAME, ensure_ascii=False)})'
ENTRY = f'---\ntyyppi: paiva\nluotu: 2026-11-23\nuni: 99\n---\n# Ensimmäinen\n\nAamulla !!22.11.: {NAME}: 8!! kirjattu.\n'
SECOND = '# Toinen\n\nTekstiä.\n'
MULTI = f'# Monta merkintää\n\n!!22.11.: {NAME}: 6!!\n!!21.11.: {NAME}: 10!!\n'
DOC = ('---\ntyyppi: nakyma\notsikko: Päivät\nnakyy: ei\n'
       'mista: kansio = paivat\nsarakkeet:\n  - otsikko | w=180\n  - kansio | w=170\n'
       '  - luotu | w=220\n  - tunnisteet | w=580\n---\n# Päivät\n')


def launch(browser, url, width, notes, document):
    page = browser.new_page(viewport={'width': width, 'height': 740},
                            has_touch=width < 500, is_mobile=width < 500)
    page.set_default_timeout(8000)
    seeds = {VIEW: document, **notes}
    page.add_init_script((TESTS / 'fakegh.js').read_text() + """
        for (const [path, text] of Object.entries(%s)) if (!__repo.kept) __repo.put(path, text);
        localStorage.setItem('kaikki:gh', '{"repo":"testi/vault","token":"x","branch":"main"}');
        localStorage.setItem('kaikki:nmode','rows');
        localStorage.setItem('kaikki:nview',%s);
    """ % (json.dumps(seeds), json.dumps(VIEW)))
    page.goto(url)
    return page


def cell(page, title, name=NAME):
    return page.get_by_role('button', name=f'{name} · {title} · ', exact=False)


def run(browser, url, width):
    notes = {NOTE: ENTRY, OTHER: SECOND, 'paivat/monta.md': MULTI}
    notes.update({f'paivat/n{i}.md': f'# Rivi {i:02}\n\nOmenahaku' for i in range(45)})
    page = launch(browser, url, width, notes, DOC)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    expect(page.locator('.rvb .rvr')).to_have_count(len(notes))
    edit(page)
    editor = page.locator('#nvedit')
    picker = editor.get_by_label('Tekstimuuttuja', exact=True)
    expect(editor.locator('#nved-variable-names option')).to_have_attribute('value', NAME)
    for name in (NAME.lower(), NEW):
        picker.fill(name)
        editor.get_by_role('button', name='Lisää muuttuja').click()
    editor.get_by_label(f'Näyttötapa: {NAME}').select_option('luku')
    editor.get_by_role('button', name='Tallenna', exact=True).click()
    expect(cell(page, 'Ensimmäinen')).to_have_text('8')
    expect(cell(page, 'Toinen')).to_have_text('–')
    many = page.locator('.rvb .rvr').filter(has_text='Monta merkintää').locator('.rvc').nth(4)
    expect(many).to_have_text('6')
    expect(many.locator('button')).to_have_count(1)
    document = page.evaluate('path => __repo.get(path)', VIEW)
    assert f'  - {KEY} | luku\n' in document
    file_is(page, NOTE, ENTRY)
    cell(page, 'Toinen').click()
    value = page.locator('#nvcell-input')
    value.fill('0')
    value.press('Enter')
    second = SECOND + f'\n!!{NAME}: 0!!\n'
    file_is(page, OTHER, second)
    expect(cell(page, 'Toinen')).to_have_text('0')
    cell(page, 'Toinen').click()
    value.fill('')
    value.press('Enter')
    file_is(page, OTHER, SECOND + '\n\n')

    # Yksittäisen havainnon muutos säilyttää muun tekstin ja rinnakkaisen GitHub-muutoksen.
    cell(page, 'Ensimmäinen').click()
    value = page.locator('#nvcell-input')
    expect(value).to_have_value('8')
    refreshed = ENTRY.replace('kirjattu.', 'kirjattu. Myöhempi lisäys.')
    page.evaluate('([path, text]) => __repo.put(path, text)', [NOTE, refreshed])
    value.fill('8,5')
    value.press('Enter')
    changed = refreshed.replace(': 8!!', ': 8,5!!')
    file_is(page, NOTE, changed)
    expect(cell(page, 'Ensimmäinen')).to_have_text('8,5')

    # Sisällön ja otsikon paikka on sama välittömästi vierityksen jälkeen.
    result = page.locator('#nlist').evaluate("""list => {
        list.scrollTop = 300;
        const header = list.querySelector('.rvh'), left = list.getBoundingClientRect().left;
        return [40, 85, 160, 0].map(x => {
            list.scrollLeft = x;
            const row = list.querySelector('.rvb .rvr:nth-child(9)');
            return [list.scrollLeft, list.scrollTop,
                Math.abs(header.getBoundingClientRect().top-list.getBoundingClientRect().top),
                Math.abs(header.querySelector('.rvt').getBoundingClientRect().left-left),
                Math.abs(header.querySelector('.rvc:nth-child(4)').getBoundingClientRect().left
                    -row.querySelector('.rvc:nth-child(4)').getBoundingClientRect().left)];
        });
    }""")
    assert result[2][0] >= 80 and result[2][1] >= 200, result
    assert all(max(row[2:]) <= 1 for row in result), result

    # Tilapäinen lajittelu säilyttää jo piirretyn rivin ja laskettu arvo ohjaa järjestystä.
    page.locator('.rvb .rvr').first.evaluate("row => {window.firstRow = row;}")
    head = page.locator('.rvhead button').filter(has_text=NAME)
    head.press('Enter')
    expect(page.locator('.rvb .rvr').first).to_contain_text('Monta merkintää')
    assert page.evaluate('() => firstRow.isConnected')
    page.locator('#nsearch').fill('Omenahaku')
    expect(page.locator('.rvb .rvr:visible')).to_have_count(45)
    page.locator('#nsearch').fill('')
    expect(page.locator('.rvb .rvr:visible')).to_have_count(len(notes))

    # Uusi muuttuja on yhteisessä luettelossa jo ennen havaintoa, myös toisella laitteella.
    other = launch(browser, url, 1280 if width < 500 else 390,
                   {NOTE: changed, OTHER: SECOND}, document)
    expect(cell(other, 'Ensimmäinen')).to_have_text('8,5')
    menu = '#deskmenu' if width < 500 else '#menu'
    other.click(menu)
    other.click('#m-mv')
    expect(other.locator('#mv-list .mvrow').filter(has_text=NEW)).to_contain_text('0 merkintää')
    assert not errors, errors
    page.context.close()
    other.context.close()
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
