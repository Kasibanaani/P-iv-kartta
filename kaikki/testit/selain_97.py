"""0.97 (työjonon kärki 4): suomalainen aika kirjausreitillä. Kysyvän napin päiväkenttä tulkitsee 5.1.26, 05.01.2026 klo 7.30 ja
vk 53/2026 ja näyttää tulkinnan nelinumeroisella vuodella. Napin aika Kuluva viikko kirjoittaa vk N/VVVV. Puhelinleveydet 390 ja 320."""
import re
from datetime import date

from playwright.sync_api import expect, sync_playwright

from selain_19 import APP, FAKE

WD = ['ma', 'ti', 'ke', 'to', 'pe', 'la', 'su']
T = date.today()
ISO = T.isocalendar()
WEEK = f'vk {ISO[1]}/{ISO[0]}'
NOTE = '---\ntyyppi: muistiinpano\notsikko: Vireloki\nlahde: emil\n---\n# Vireloki\n'
SAATIMET = '''---
tyyppi: pohja
otsikko: Säätimet
nakyy: ei
lahde: emil
---
# Säätimet

## Vire
- tunnus: vire
- laji: kertanappi
- muuttuja: vire
- tapa: lisaa
- minne: [[vireloki]]
- aika: kysy
'''
SEED = r"""
  if (!__repo.kept) {
    __repo.put('tieto/vireloki.md', %r);
    __repo.put('pohjat/saatimet.md', %r);
  }
  localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
""" % (NOTE, SAATIMET)


def note(page):
    return page.evaluate("__repo.get('tieto/vireloki.md')||''")


def open_list(page):
    page.evaluate("document.getElementById('menu').click()")
    page.get_by_role('menuitem', name='Säätimet').click()
    return page.get_by_role('dialog', name='Säätimet')


def check(browser, width):
    page = browser.new_page(viewport={'width': width, 'height': 760})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.add_init_script(FAKE + SEED)
    page.goto(APP)
    page.wait_for_function("""() => KaikkiTesti.vault().files['pohjat/saatimet.md'] && !KaikkiTesti.status().includes('…')""")
    lst = open_list(page)
    ask = page.locator('#saadin-ask')
    day = page.locator('#saadin-ask-day')
    heard = page.locator('#saadin-ask-when')
    clock = page.locator('#saadin-ask-clock')

    # Oletus on tämä päivä suomalaisittain.
    lst.get_by_role('button', name='Kirjaa: Vire').click()
    expect(ask).to_be_visible()
    expect(day).to_have_value(f'{T.day}.{T.month}.{T.year}')
    expect(heard).to_have_text(f'{WD[T.weekday()]} {T.day}.{T.month}.{T.year}')
    page.locator('#saadin-ask-value').fill('6')
    # Kaksinumeroinen vuosi näytetään nelinumeroisena.
    day.fill('5.1.26')
    expect(heard).to_have_text('ma 5.1.2026')
    # Tunnistamaton ei kirjoita.
    day.fill('ensi kuussa')
    expect(heard).to_contain_text('Ei tunnistettu')
    expect(day).to_have_attribute('aria-invalid', 'true')
    ask.locator('button[type=submit]').click()
    expect(ask.locator('.msg')).to_contain_text('Kirjoita päivä tai viikko')
    assert 'vire' not in note(page)
    # Viikko: tulkinta viikon päivineen, kellonaikakenttä piiloon.
    day.fill('vk 53/2026')
    expect(heard).to_have_text('vk 53/2026 (28.12.–3.1.2027)')
    expect(clock).to_be_hidden()
    ask.locator('button[type=submit]').click()
    expect(ask).to_be_hidden()
    page.wait_for_function("(__repo.get('tieto/vireloki.md')||'').includes('vire = 6')")
    assert re.search(r'^- \(\(vk 53/2026; vire = 6; \^qh[\w-]+\)\)$', note(page), re.M), note(page)

    # Päivä ja kellonaika samassa kentässä.
    lst.get_by_role('button', name='Kirjaa: Vire').click()
    page.locator('#saadin-ask-value').fill('8')
    day.fill('05.01.2026 klo 7.30')
    expect(heard).to_have_text('ma 5.1.2026 klo 07.30')
    expect(clock).to_be_hidden()
    ask.locator('button[type=submit]').click()
    page.wait_for_function("(__repo.get('tieto/vireloki.md')||'').includes('vire = 8')")
    assert '- ((5.1.2026 klo 07.30; vire = 8; ^qh' in note(page), note(page)

    # Päivä ilman kelloa: kellonaikakenttä käytössä.
    lst.get_by_role('button', name='Kirjaa: Vire').click()
    page.locator('#saadin-ask-value').fill('9')
    day.fill('5.1.2026')
    expect(clock).to_be_visible()
    clock.fill('21:15')
    ask.locator('button[type=submit]').click()
    page.wait_for_function("(__repo.get('tieto/vireloki.md')||'').includes('vire = 9')")
    assert '- ((5.1.2026 klo 21.15; vire = 9; ^qh' in note(page), note(page)

    # Lukija: viikkohavainto näkyy viikkona.
    obs = page.evaluate("MUUTTUJA.parse(__repo.get('tieto/vireloki.md'),new Date()).map(o=>[o.viikko,o.paivat,o.kello,o.luku])")
    assert obs == [['2026-W53', [], '', 6], ['', ['2026-01-05'], '07:30', 8], ['', ['2026-01-05'], '21:15', 9]], obs

    # Editori: Kuluva viikko näkyy esikatselussa ja kirjoitetaan viikkona.
    lst.get_by_role('button', name='+ Uusi säädin').click()
    ed = page.locator('#saadin-edit')
    page.locator('#saadin-name').fill('Viikon paino')
    page.locator('#saadin-has-var').check()
    page.locator('#saadin-var').fill('paino')
    page.locator('#saadin-value').fill('80')
    page.locator('#saadin-unit').fill('kg')
    page.locator('#saadin-when').select_option('viikko')
    page.locator('#saadin-where').select_option('teksti')
    page.locator('#saadin-find').fill('Vireloki')
    ed.locator('.saadin-found button').first.click()
    expect(ed.locator('.saadin-preview')).to_contain_text(f'(({WEEK}; paino = 80 kg))')
    assert page.evaluate("document.getElementById('saadin-edit').scrollWidth<=document.getElementById('saadin-edit').clientWidth+1")
    page.locator('#saadin-save').click()
    expect(ed).to_be_hidden()
    page.wait_for_function("(__repo.get('pohjat/saatimet.md')||'').includes('- aika: viikko')")
    lst.get_by_role('button', name='Kirjaa: Viikon paino').click()
    page.wait_for_function("(__repo.get('tieto/vireloki.md')||'').includes('paino = 80 kg')")
    assert f'- (({WEEK}; paino = 80 kg; ^qh' in note(page), note(page)
    assert not errors, errors
    page.close()


with sync_playwright() as p:
    b = p.chromium.launch()
    for w in (390, 320):
        check(b, w)
    b.close()
print('ok')
