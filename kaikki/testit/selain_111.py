"""Kaikki 0.111 (Emil 26.11.2026): muistiinpanon yläpalkki, Muokkaa- ja Asettelu-napit, ruudun ⋯-valikko,
säätimen koon muutos, aina lukutilassa aukeava muistiinpano ja lukitusta listasta avaaminen.
Leveydet 320, 390, 1280 ja 1440 px."""
import json
from datetime import datetime, timezone

from playwright.sync_api import expect, sync_playwright

from selain_104 import FAKE, URL, md
from selain_107 import close_outside, drag_handle

NOTE = 'projektit/laskuri.md'
BODY = '''((taso: =LIUKUSÄÄDIN(min = 0; max = 10; askel = 1; tallenna = "päivään")))
((tulos: =taso * 2))

Tähän voi kirjoittaa tavallista tekstiä.
''' + '\n'.join('Rivi %d tekstiä vierityksen kokeiluun.' % i for i in range(40)) + '''
- ((26.11.2026 klo 20.14, taso = 3, ^muistion-saadin-abc-2026-11-26))'''
SEED = {NOTE: md('Oma laskuri', BODY), 'tieto/muu.md': md('Toinen muistiinpano', 'Tavallista tekstiä.')}


def check(browser, width):
    phone = width < 500
    page = browser.new_page(viewport={'width': width, 'height': 820}, is_mobile=phone, has_touch=phone,
                            timezone_id='Europe/Helsinki')
    page.set_default_timeout(7000)
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.clock.set_fixed_time(datetime(2026, 11, 26, 18, tzinfo=timezone.utc))
    page.add_init_script(FAKE + '''
      if (!__repo.kept) for (const [p, t] of Object.entries(%s)) __repo.put(p, t);
      localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
      if (!localStorage.getItem('kaikki:nmode')) localStorage.setItem('kaikki:nmode','rows');
    ''' % json.dumps(SEED))
    page.goto(URL)
    sheet = page.locator('#nsheet')
    row = page.locator('.rvb .rvr').filter(has_text='Oma laskuri')

    def press(item):
        item.tap() if phone else item.click()

    def open_note():
        expect(row).to_be_visible()
        press(row)
        expect(sheet).to_be_visible()

    open_note()
    ta = sheet.locator('#ns-text')
    slider = sheet.get_by_role('slider', name='taso')
    edit = sheet.get_by_role('button', name='Muokkaa muistiinpanoa')
    layout = sheet.get_by_role('button', name='Muuta ruutujen asettelua')
    cell = sheet.locator('.ns-cell')
    control = sheet.locator('.ns-control')

    # Lukutila: kaksi nappia yläpalkissa, ei Lähteet-nappia arvon mukaan, ruutujen ⋯ kulmassa.
    expect(ta).not_to_be_editable()
    expect(edit).to_be_visible()
    expect(layout).to_be_visible()
    expect(layout).to_have_attribute('aria-pressed', 'false')
    expect(sheet.get_by_role('button', name='Lähteet', exact=False)).to_have_count(0)
    expect(sheet.locator('.ns-box-menu')).to_have_count(2)
    for box in (cell, control):
        menu = box.locator('.ns-box-menu summary').bounding_box()
        outer = box.bounding_box()
        assert outer['x'] + outer['width'] - (menu['x'] + menu['width']) < 12, (width, menu, outer)
        assert menu['y'] - outer['y'] < 12 and menu['width'] <= 24, (width, menu, outer)

    # Yläpalkki pysyy kiinni yläreunassa: sen yläpuolelta ei näy vieritettyä sisältöä.
    sheet.evaluate('d => d.scrollTop = 400')
    page.wait_for_timeout(100)
    gap = page.evaluate('''() => {
      const d = document.querySelector('#nsheet'), r = d.getBoundingClientRect();
      const x = r.left + r.width / 2, hits = [];
      for (let y = r.top + d.clientTop + 1; y < document.querySelector('#ns-header').getBoundingClientRect().bottom - 1; y += 2) {
        const e = document.elementFromPoint(x, y);
        if (e && e.closest('#ns-hl,#ns-wrap')) hits.push(Math.round(y - r.top));
      }
      return hits;
    }''')
    assert not gap, (width, 'sisältö näkyy yläpalkin yläpuolelta', gap)
    if not phone:
        rows = page.evaluate('''() => new Set(['#ns-h', '#ns-when', '#ns-mode', '#ns-layout', '#ns-more']
          .map(s => Math.round(document.querySelector(s).getBoundingClientRect().top / 8))).size''')
        assert rows == 1, (width, 'yläpalkki ei ole yhdellä rivillä')
    sheet.evaluate('d => d.scrollTop = 0')

    # ⋯-valikko: lähteet, viittaus ja kaavan muokkaus.
    press(cell.locator('summary'))
    expect(cell.get_by_role('button', name='Kopioi viittaus')).to_be_visible()
    press(cell.get_by_role('button', name='Lähteet (1)'))
    expect(cell.locator('.ns-cell-sources')).to_contain_text('Oma laskuri')
    expect(cell.locator('details')).not_to_have_attribute('open', '')
    press(control.locator('summary'))
    expect(control.get_by_role('button', name='Muokkaa kaavaa')).to_be_visible()
    expect(control.get_by_role('button', name='Kopioi viittaus')).to_be_visible()
    press(sheet.locator('#ns-hl'))
    expect(control.locator('details')).not_to_have_attribute('open', '')

    # Asettelu: säätimen kokoa voi muuttaa, säädin ei toimi asettelun aikana.
    before = control.bounding_box()['width']
    press(layout)
    expect(layout).to_have_attribute('aria-pressed', 'true')
    expect(slider).to_be_disabled()
    handle = control.get_by_role('button', name='Muuta säätimen kokoa', exact=False)
    expect(handle).to_be_visible()
    drag_handle(page, handle, -60, 20, phone)
    after = control.bounding_box()
    assert after['width'] < before - 30, (width, before, after)
    assert page.evaluate('document.documentElement.scrollWidth === innerWidth')
    if phone:
        # CDP:n kosketusveto jättää Chromiumiin eleen, joka syö seuraavan napautuksen; neutraali napautus nimeen ensin.
        name = control.locator('label').first.bounding_box()
        page.touchscreen.tap(name['x'] + 10, name['y'] + name['height'] / 2)
    press(layout)
    expect(layout).to_have_attribute('aria-pressed', 'false')
    expect(slider).to_be_enabled()
    expect(handle).to_be_hidden()

    # Muokkaa kaavaa vie tekstiin. Suljettaessa ja avattaessa muistiinpano on taas lukutilassa ja koko säilyy.
    press(control.locator('summary'))
    press(control.get_by_role('button', name='Muokkaa kaavaa'))
    expect(ta).to_be_editable()
    expect(layout).to_be_hidden()
    expect(sheet.get_by_role('button', name='Siirry lukutilaan')).to_be_visible()
    if phone:
        page.keyboard.press('Escape')
        expect(sheet).to_be_hidden()
    else:
        close_outside(page)
    assert page.evaluate("!document.activeElement.closest('.rvb') || document.activeElement.matches(':focus-visible') === false")
    open_note()
    expect(ta).not_to_be_editable()
    assert abs(control.bounding_box()['width'] - after['width']) < 2
    close_outside(page)
    if not phone:
        focused = page.evaluate("document.activeElement.closest('.rvb') ? document.activeElement.className : ''")
        assert not focused, (width, 'listan rivi jäi kohdistetuksi', focused)

    # Lukittu lista: muistiinpano aukeaa oikeaan ikkunaan lukutilassa ja sen voi vaihtaa muokattavaksi.
    lock = page.get_by_role('button', name='Näkymän lukitus')
    press(lock)
    expect(lock).to_have_attribute('aria-pressed', 'true')
    open_note()
    expect(ta).not_to_be_editable()
    expect(slider).to_be_enabled()
    expect(layout).to_be_visible()
    press(edit)
    expect(ta).to_be_editable()
    assert 'Tähän voi kirjoittaa' in ta.input_value()
    assert not errors, errors
    page.context.close()


if __name__ == '__main__':
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for w in (320, 390, 1280, 1440):
            check(browser, w)
        browser.close()
    print('Muistiinpanon yläpalkki, asettelu, ruudun valikko ja lukitun listan avaus toimivat neljällä leveydellä.')
