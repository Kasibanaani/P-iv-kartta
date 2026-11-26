"""Kaavaohjatut säätimet, viivakuvaajat ja kirjaaminen Kaikin lukutilassa."""
import json
from datetime import datetime, timezone

from playwright.sync_api import expect, sync_playwright

from selain_104 import FAKE, URL, md
from selain_107 import close_outside
from selain_109 import open_note

NOTE = 'projektit/palaute.md'
BODY = '''((rauha: =KYTKIN("Rauhoita ilta"; tallenna = "päivään")))
((Ohje: =NÄYTÄ(rauha; "Puhelin sivuun")))
((ulkona: =VALINTA(true; false; tyhjä = "Kirjaamatta"; otsikko = "Kävin ulkona"; tallenna = "päivään")))
((vesi: =ASKELLUS(otsikko = "Vesilasit"; min = 0; max = 20; tallenna = "päivään")))
((Iltarutiini: =TARKISTUSLISTA("Tiskit"; "Työeväät"; tallenna = "päivään")))
((=KOKEILU()))
---
((liike: =VALINTA("Penkki"; "Soutu"; esitys = "valikko")))
((paino: =LUKUKENTTÄ(otsikko = "Paino"; min = 1; max = 500; askel = 0,5; alku = 80)))
((toistot: =LUKUKENTTÄ(otsikko = "Toistot"; min = 1; max = 100; alku = 8)))
((=PAINIKE("Kirjaa sarja"; KIRJAA(liike; "paino (kg)" = paino; toistot = toistot; "sarjapaino (kg)" = paino * toistot))))
((Sarjat tänään: =KIRJAUKSET(OMA_SARJA(""; "sarjapaino (kg)"); aika = TÄNÄÄN())))
---
((jakso: =VALINTA("7 päivää"; "14 päivää")))
((tasoitus: =KYTKIN("7 yön keskiarvo"; alku = true)))
((tavoite: =KYTKIN("Tavoiteviiva")))
((muoto: =VALINTA("viiva"; "pylväät")))
((Uni: =KUVAAJA(OMA_SARJA(""; "uni (h)"); aika = jakso; esitys = muoto; liukuva = JOS(tasoitus; 7; 0); tavoite = JOS(tavoite; 7; false))))
((tunnit: =LUKUKENTTÄ(otsikko = "Viime yö"; min = 0; max = 16; askel = 0,1; alku = 7,1)))
((=PAINIKE("Kirjaa uni"; PÄIVITÄ(""; "uni (h)" = tunnit))))
- ((21.11.2026; uni = 7 h))
- ((23.11.2026; uni = 6,5 h))
- ((25.11.2026; uni = 8 h))
'''


def check(browser, width):
    mobile = width < 500
    page = browser.new_page(viewport={'width': width, 'height': 850},
                            is_mobile=mobile, has_touch=mobile, timezone_id='Europe/Helsinki')
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.set_default_timeout(7000)
    page.clock.set_fixed_time(datetime(2026, 11, 26, 18, tzinfo=timezone.utc))
    page.add_init_script(FAKE + '''
      if (!__repo.kept) __repo.put(%s, %s);
      localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
    ''' % (json.dumps(NOTE), json.dumps(md('Palautuminen', BODY))))
    page.goto(URL)
    open_note(page, 'Palautuminen')
    sheet = page.locator('#nsheet')
    def button(name):
        return sheet.get_by_role('button', name=name, exact=True)

    guide = sheet.locator('.ns-cell').filter(has=page.get_by_text('Ohje',exact=True))
    expect(guide).to_be_hidden()
    sheet.get_by_role('switch', name='Rauhoita ilta').check()
    expect(guide.locator('.ns-cell-value')).to_have_text('Puhelin sivuun')
    button('Ei').click()
    expect(button('Ei')).to_have_attribute('aria-pressed','true')
    expect(button('Kirjaamatta')).to_have_attribute('aria-pressed','false')
    button('Vesilasit: lisää').click()
    expect(sheet.locator('.ns-stepper output')).to_have_text('1')
    sheet.get_by_label('Tiskit').check()
    expect(sheet.locator('.ns-check-count')).to_have_text('1 / 2')

    button('Kokeile arvoja').click()
    button('Vesilasit: lisää').click()
    expect(sheet.locator('.ns-stepper output')).to_have_text('2')
    expect(button('Kirjaa sarja')).to_be_disabled()
    button('Palaa aiempiin arvoihin').click()
    expect(sheet.locator('.ns-stepper output')).to_have_text('1')

    sheet.get_by_label('liike').select_option(label='Soutu')
    sheet.get_by_label('Paino').fill('82.5')
    button('Kirjaa sarja').click()
    expect(sheet.locator('.ns-records:visible')).to_contain_text('660')
    page.wait_for_function("""p => __repo.get(p).includes('Soutu: paino (kg) = 82.5; toistot = 8; sarjapaino (kg) = 660')""",arg=NOTE)
    button('Kumoa viimeisin').click()
    expect(sheet.locator('.ns-records:visible')).to_have_text('Ei kirjauksia')
    page.wait_for_function('p => !__repo.get(p).includes("Soutu: paino")',arg=NOTE)

    chart = sheet.locator('.ns-graph:visible')
    expect(chart.locator('svg circle')).to_have_count(3)
    expect(chart.locator('.ns-chart-info')).to_contain_text('Kirjaamatta')
    chart.locator('button').press('ArrowLeft')
    expect(chart.locator('.ns-chart-info')).to_contain_text('8 h')
    button('14 päivää').click()
    sheet.get_by_role('switch',name='Tavoiteviiva').check()
    expect(chart.locator('.ns-chart-summary')).to_contain_text('Tavoite 7 h')
    button('pylväät').click()
    expect(chart.locator('svg rect')).to_have_count(3)
    sheet.get_by_label('Viime yö').fill('8.5')
    button('Kirjaa uni').click()
    expect(chart.locator('svg rect')).to_have_count(4)
    expect(chart.locator('.ns-chart-info')).to_contain_text('8,5 h')
    sheet.get_by_label('Viime yö').fill('8.1')
    button('Kirjaa uni').click()
    expect(chart.locator('.ns-chart-info')).to_contain_text('8,1 h')
    expect(chart.locator('svg rect')).to_have_count(4)
    button('Kumoa viimeisin').click()
    expect(chart.locator('.ns-chart-info')).to_contain_text('8,5 h')

    # 0.111: ruudun ⋯ näkyy aina, Asettelu on yläpalkin nappi.
    expect(sheet.locator('.ns-box-menu').first).to_be_visible()
    sheet.locator('#ns-more').click()
    expect(sheet.get_by_role('menuitem',name='Kopioi käyttölinkki')).to_be_visible()
    expect(sheet.get_by_role('menuitem',name='Muuta ruutujen asettelua')).to_have_count(0)
    page.keyboard.press('Escape')
    sheet.get_by_role('button',name='Muuta ruutujen asettelua').click()
    expect(sheet.locator('.ns-box-menu:visible').first).to_be_visible()
    expect(button('Kirjaa uni')).to_be_disabled()
    close_outside(page)
    page.wait_for_function('p => __repo.get(p).includes("; ulkona = false; ^muistion-saadin")', arg=NOTE)

    open_note(page,'Palautuminen')
    expect(sheet.get_by_role('switch',name='Rauhoita ilta')).to_be_checked()
    expect(button('Ei')).to_have_attribute('aria-pressed','true')
    expect(sheet.locator('.ns-stepper output')).to_have_text('1')
    expect(sheet.get_by_label('Tiskit')).to_be_checked()
    close_outside(page)
    page.goto(URL + '#muistio=projektit%2Fpalaute.md')
    expect(sheet.get_by_role('button',name='Muokkaa muistiinpanoa')).to_be_visible()
    expect(sheet.get_by_role('switch',name='Rauhoita ilta')).to_be_checked()
    assert not errors, errors
    page.context.close()


if __name__ == '__main__':
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for width in (320, 390, 1280, 1440):
            check(browser,width)
        browser.close()
    print('Lukutilan säätimet, viivakuvaajat ja kirjaaminen toimivat neljällä leveydellä.')
