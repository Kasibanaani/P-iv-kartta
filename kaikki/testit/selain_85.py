"""Havaintotaulukon koosteet, omat kohteet ja kojelaudan kirjausnappi."""
import json

from playwright.sync_api import expect, sync_playwright

from selain_64 import QuietHandler, ThreadingHTTPServer, Thread
from selain_68 import TESTS
from selain_72 import select_tab

SOURCE = 'inbox/makrot.md'
VIEWS = 'data/havaintonakymat.json'
CATALOG = 'data/havaintomaaritykset.json'
DAY = '2026-11-24'
DAY_PATH = f'paivat/2026/{DAY}.md'
MARK = '((Fileesuikale @2026-11-24 | Annos (g): 150 | Kylmä: false | #ravinto))'
DATA = {
    SOURCE: '# Ruokakirjaukset\n\n' + MARK + '\n' + MARK + '\n'
            '((Lohi @2026-11-24 | Annos (g): 100))\n',
    'data/kojelauta.md': '| id | otsikko | muuttuja | laske | aika | tunniste | kansio | yksikko | nayta |\n'
                        '| --- | --- | --- | --- | --- | --- | --- | --- | --- |\n',
}


def run(browser, url, width):
    page = browser.new_page(viewport={'width': width, 'height': 900}, is_mobile=width < 500,
                            has_touch=width < 500, reduced_motion='reduce')
    page.set_default_timeout(7000)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.add_init_script((TESTS / 'fakegh.js').read_text() + """
      if (!__repo.kept) for (const [path, text] of Object.entries(%s)) __repo.put(path, text);
      localStorage.setItem('kaikki:gh', '{"repo":"testi/vault","token":"x","branch":"main"}');
    """ % json.dumps(DATA))
    page.goto(url)
    page.wait_for_function('p => KaikkiTesti.vault().files[p]', arg=SOURCE)
    page.evaluate("document.getElementById(innerWidth>=1000&&document.getElementById('deskmenu').offsetParent?'deskmenu':'menu').click()")
    page.get_by_role('menuitem', name='Havaintotaulukot').click()
    dialog = page.get_by_role('dialog', name='Havaintotaulukot')
    dialog.get_by_label('Näkymän nimi').fill('Omat annokset')
    dialog.get_by_label('Kohteet · yksi per rivi').fill('Fileesuikale\nLohi\nTyhjä kohde')
    dialog.get_by_label('Alkupäivä').fill(DAY)
    dialog.get_by_label('Loppupäivä').fill(DAY)
    dialog.get_by_role('button', name='Lisää sarake').click()
    dialog.get_by_label('Muuttuja', exact=True).fill('Annos (g)')
    result = dialog.locator('.obs-result')
    result.get_by_role('button', name='2 arvoa').click()
    expect(dialog.locator('.obs-sources button')).to_have_count(2)
    dialog.get_by_label('Esitystapa', exact=True).select_option('summa')
    expect(result.get_by_role('button', name='300', exact=True)).to_be_visible()
    dialog.get_by_role('button', name='Tallenna näkymä').click()
    page.wait_for_function('p => __repo.get(p)?.includes("Omat annokset")', arg=VIEWS)
    expect(result.get_by_role('button', name='300', exact=True)).to_be_visible()
    dialog.get_by_role('button', name='Kohde- ja muuttujamääritykset').click()
    catalog = page.get_by_role('dialog', name='Kohde- ja muuttujamääritykset')
    catalog.get_by_label('Nimi', exact=True).fill('Fileesuikale')
    catalog.get_by_role('button', name='Tallenna', exact=True).click()
    page.wait_for_function('p => __repo.get(p)?.includes("Fileesuikale")', arg=CATALOG)
    expect(catalog.get_by_label('Nimi', exact=True)).to_have_value('Fileesuikale')
    catalog.get_by_label('Nimi', exact=True).fill('Broileri')
    catalog.get_by_role('button', name='Tallenna', exact=True).click()
    page.wait_for_function('p => __repo.get(p)?.includes("Broileri")', arg=CATALOG)
    catalog.get_by_role('button', name='Sulje', exact=True).click()

    select_tab(page, width, 'dash', 'Kojelauta')
    page.get_by_role('button', name='Muokkaa ruutuja').click()
    page.get_by_role('button', name='+ Ruutu', exact=True).click()
    board = page.locator('#mvb-edit')
    board.get_by_label('Muuttuja', exact=True).select_option('Annos (g)')
    board.get_by_label('Kohde', exact=True).select_option('Broileri')
    board.get_by_label('Lasku', exact=True).select_option('summa')
    board.get_by_label('Aikaväli', exact=True).select_option('oma')
    board.get_by_label('Alkupäivä').fill(DAY)
    board.get_by_label('Loppupäivä').fill(DAY)
    board.get_by_label('Havainnon tunniste (valinnainen)').fill('ravinto')
    board.get_by_label('Kirjausnappi').select_option('kylla')
    board.get_by_role('button', name='Tallenna', exact=True).click()
    card = page.locator('.mvb-card')
    expect(card.locator('.dval')).to_have_text('300')
    card.get_by_role('button', name='Kirjaa arvo').click()
    quick = page.locator('#quick-entry')
    expect(quick.get_by_label('Kohde (valinnainen)')).to_have_value('Broileri')
    quick.locator('#quick-day').fill(DAY)
    if not quick.locator('#quick-variable-value').is_visible():
        quick.get_by_role('button', name='Annos (g)', exact=True).click()
    quick.get_by_label('Arvo · Annos (g)').fill('50')
    quick.get_by_role('button', name='Lisää kirjaus', exact=True).click()
    quick.get_by_role('button', name='Annos (g)', exact=True).click()
    quick.get_by_label('Arvo · Annos (g)').fill('50')
    quick.get_by_role('button', name='Lisää kirjaus', exact=True).click()
    quick.get_by_role('button', name='Valmis', exact=True).click()
    page.wait_for_function(
        r'p => (__repo.get(p)?.match(/Annos \(g\): 50 \| #ravinto \| \^qh/g) || []).length === 2',
        arg=DAY_PATH)
    expect(card.locator('.dval')).to_have_text('400')
    assert not errors, errors
    page.context.close()
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
