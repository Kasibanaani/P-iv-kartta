"""0.96 (työjonon kärki 2 ja 3): kokonainen treenikerta ja yksi nappieditori.

Kalenterista avattu salitreeni, ＋ Kirjaa → Muokkaa → uusi nappi Treeni-ryhmään: Penkki kysyy painon (kg) ja toistot ja kirjoittaa
ne samaan havaintoon. Kaksi sarjaa peräkkäin (toinen sarja alkaa edellisillä arvoilla), muokkaus napista suoraan, pikakirjauksen ja
kojelaudan muokkaustila sekä uusinnan kertakirjaus. Puhelinleveydet 390 ja 320 px."""
import re
from datetime import date

from playwright.sync_api import expect, sync_playwright

from selain_19 import APP, FAKE

WD = ['ma', 'ti', 'ke', 'to', 'pe', 'la', 'su']
T = date.today()
WHEN = f'{WD[T.weekday()]} {T.day}.{T.month}. klo 18'
NOTE = f'---\ntyyppi: muistiinpano\notsikko: Salitreeni\nlahde: emil\n---\n# Salitreeni\n\nSalitreeni {WHEN}\n'
SAATIMET = '''---
tyyppi: pohja
otsikko: Säätimet
nakyy: ei
lahde: emil
---
# Säätimet

## Venyttely
- tunnus: venyttely
- laji: kertanappi
- ryhma: Treeni
- teksti: Venytelty
- tapa: lisaa
- minne: paiva
- aika: nyt
'''
SEED = r"""
  if (!__repo.kept) {
    __repo.put('tieto/salitreeni.md', %r);
    __repo.put('pohjat/saatimet.md', %r);
  }
  localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
""" % (NOTE, SAATIMET)


def note(page):
    return page.evaluate("__repo.get('tieto/salitreeni.md')||''")


def no_overflow(page, sel):
    return page.evaluate(f"(()=>{{const d=document.querySelector('{sel}');return d.scrollWidth<=d.clientWidth+1;}})()")


def check(browser, width):
    page = browser.new_page(viewport={'width': width, 'height': 760})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.add_init_script(FAKE + SEED)
    page.goto(APP)
    page.wait_for_function("""() => KaikkiTesti.notes().some(n=>n.vp==='tieto/salitreeni.md') && !KaikkiTesti.status().includes('…')""")

    # Kalenterista: tämän päivän salitreeni → Avaa muistiinpano.
    page.locator('#roll').click()
    page.locator('#section-cal').click()
    row = page.locator('.wkday.today .wrow', has_text='Salitreeni').first
    expect(row).to_be_visible()
    row.click()
    page.locator('#wk-open').click()
    expect(page.locator('#nsheet')).to_be_visible()
    page.locator('#ns-log').click()
    d = page.locator('#note-log')
    expect(d).to_be_visible()
    expect(page.locator('#nl-target')).to_have_text('Salitreeni')

    # Muokkaa: Treeni-ryhmän napit avautuvat muokattaviksi, uusi nappi saa ryhmän valmiiksi.
    # Ainoa ryhmä on auki valmiiksi.
    expect(page.locator('#nl-groups button', has_text='Treeni')).to_have_attribute('aria-pressed', 'true')
    page.locator('#nl-edit').click()
    expect(page.locator('#nl-edit')).to_have_attribute('aria-pressed', 'true')
    expect(page.locator('#nl-btns button', has_text='✎ Venyttely')).to_be_visible()
    page.locator('#nl-new').click()
    ed = page.locator('#saadin-edit')
    expect(ed).to_be_visible()
    expect(page.locator('#saadin-group')).to_have_value('Treeni')
    page.locator('#saadin-name').fill('Penkki')
    page.locator('#saadin-has-var').check()
    page.locator('#saadin-var').fill('paino')
    page.locator('#saadin-unit').fill('kg')
    page.locator('#saadin-add-var').click()
    expect(page.locator('#saadin-var-2')).to_be_focused()
    page.locator('#saadin-var-2').fill('toistot')
    page.locator('#saadin-subject').fill('Penkki')
    expect(ed.locator('.saadin-preview')).to_contain_text('Penkki: paino = ‹paino› kg, toistot = ‹toistot›')
    assert no_overflow(page, '#saadin-edit'), 'editorissa vaakaylivuoto'
    # Kolmas muuttuja lisätään ja poistetaan.
    page.locator('#saadin-add-var').click()
    page.locator('#saadin-var-3').fill('tunne')
    ed.get_by_role('button', name='Poista muuttuja tunne').click()
    expect(page.locator('#saadin-var-3')).to_have_count(0)
    page.locator('#saadin-save').click()
    expect(ed).to_be_hidden()
    page.wait_for_function("(__repo.get('pohjat/saatimet.md')||'').includes('## Penkki')")
    saved = page.evaluate("__repo.get('pohjat/saatimet.md')")
    assert '- muuttuja: paino\n- yksikko: kg\n- muuttuja: toistot\n- kohde: Penkki\n' in saved, saved
    assert '- ryhma: Treeni' in saved.split('## Penkki')[1]
    assert 'tunne' not in saved
    expect(page.locator('#nl-btns button', has_text='✎ Penkki')).to_be_visible()
    page.locator('#nl-edit').click()
    expect(page.locator('#nl-edit')).to_have_attribute('aria-pressed', 'false')
    expect(page.locator('#nl-new')).to_have_count(0)

    # Vapaa huomio ja kaksi sarjaa.
    page.locator('#nl-text').fill('Kevyt olo.')
    page.locator('#nl-btns button', has_text='Penkki').click()
    ask = page.locator('#saadin-ask')
    expect(ask).to_be_visible()
    expect(ask.get_by_label('Arvo · paino (kg)')).to_be_focused()
    expect(ask.locator('.saadin-unit')).to_have_text('kg')
    assert ask.get_by_label('Arvo · paino (kg)').get_attribute('inputmode') == 'decimal'
    ask.get_by_label('Arvo · paino (kg)').fill('80')
    ask.get_by_label('Arvo · toistot').fill('8')
    assert no_overflow(page, '#saadin-ask'), 'kysymysikkunassa vaakaylivuoto'
    ask.locator('button[type=submit]').click()
    expect(ask).to_be_hidden()
    page.wait_for_function("(__repo.get('tieto/salitreeni.md')||'').includes('toistot = 8')")
    expect(d).to_be_visible()
    assert page.locator('#nl-text').input_value() == 'Kevyt olo.'
    first = [l for l in note(page).splitlines() if 'toistot = 8' in l][0]
    assert re.match(r'^- \(\(\d+\.\d+\.\d{4} klo \d\d\.\d\d, Penkki: paino = 80 kg, toistot = 8, \^qh[\w-]+\)\)$', first), first
    # Toinen sarja: edelliset arvot valmiina, kirjoitus korvaa valitun.
    page.locator('#nl-btns button', has_text='Penkki').click()
    expect(ask.get_by_label('Arvo · paino (kg)')).to_have_value('80')
    expect(ask.get_by_label('Arvo · toistot')).to_have_value('8')
    ask.get_by_label('Arvo · toistot').fill('6')
    ask.locator('button[type=submit]').click()
    page.wait_for_function("(__repo.get('tieto/salitreeni.md')||'').includes('toistot = 6')")
    text = note(page)
    assert text.count('Penkki: paino = 80 kg') == 2, text
    assert not page.evaluate("Object.keys(__repo.files).some(p=>p.startsWith('paivat/'))"), 'ei päivän muistiinpanoon'
    # Havainnot luetaan samana kohteena ja yksikkönä.
    obs = page.evaluate("MUUTTUJA.parse(__repo.get('tieto/salitreeni.md'),new Date()).map(o=>[o.nimi,o.luku,o.kohde])")
    assert obs == [['paino (kg)', 80, 'Penkki'], ['toistot', 8, 'Penkki'], ['paino (kg)', 80, 'Penkki'], ['toistot', 6, 'Penkki']], obs
    page.locator('#nl-save').click()
    page.wait_for_function("(__repo.get('tieto/salitreeni.md')||'').endsWith('\\n\\nKevyt olo.\\n')")

    # Muokkaus suoraan napista: kiinteä arvo toistoille → nappi kysyy enää painon.
    page.locator('#nl-edit').click()
    page.locator('#nl-btns button', has_text='✎ Penkki').click()
    expect(ed).to_be_visible()
    expect(page.locator('#saadin-edit-title')).to_have_text('Muokkaa säädintä')
    expect(page.locator('#saadin-var-2')).to_have_value('toistot')
    page.locator('#saadin-value-2').fill('5')
    page.locator('#saadin-save').click()
    expect(ed).to_be_hidden()
    page.wait_for_function("(__repo.get('pohjat/saatimet.md')||'').includes('- muuttuja: toistot\\n- arvo: 5\\n')")
    page.locator('#nl-edit').click()
    page.locator('#nl-btns button', has_text='Penkki').click()
    expect(ask.get_by_label('Arvo · paino (kg)')).to_be_visible()
    expect(ask.get_by_label('Arvo · toistot')).to_have_count(0)
    ask.get_by_label('Arvo · paino (kg)').fill('82,5')
    ask.locator('button[type=submit]').click()
    page.wait_for_function("(__repo.get('tieto/salitreeni.md')||'').includes('paino = 82,5 kg, toistot = 5')")
    page.locator('#nl-close').click()
    expect(d).to_be_hidden()
    page.keyboard.press('Escape')

    # Pikakirjauksen Napit: Muokkaa avaa saman editorin.
    page.get_by_role('button', name='Pikakirjaus', exact=True).click()
    quick = page.locator('#quick-entry')
    expect(quick).to_be_visible()
    quick.locator('#quick-controls').click()
    expect(quick.locator('#quick-picks button', has_text='Penkki')).to_be_visible()
    quick.locator('#quick-ctl-edit').click()
    expect(quick.locator('#quick-ctl-edit')).to_have_attribute('aria-pressed', 'true')
    quick.locator('#quick-picks button', has_text='✎ Penkki').click()
    expect(ed).to_be_visible()
    expect(page.locator('#saadin-name')).to_have_value('Penkki')
    ed.get_by_role('button', name='Peru').click()
    expect(ed).to_be_hidden()
    expect(quick).to_be_visible()
    assert no_overflow(page, '#quick-entry'), 'pikakirjauksessa vaakaylivuoto'
    assert not errors, errors
    page.close()


def legacy(browser):
    """Vanha yhden muuttujan säädin aukeaa editoriin ennallaan ja tallentuu samaan muotoon."""
    page = browser.new_page(viewport={'width': 390, 'height': 760})
    old = SAATIMET + '\n## Kahvi\n- tunnus: kahvi\n- laji: kertanappi\n- muuttuja: Kahvi (kpl)\n- arvo: 1\n- tapa: lisaa\n- minne: paiva\n- aika: nyt\n'
    page.add_init_script(FAKE + SEED.replace(repr(SAATIMET), repr(old)))
    page.goto(APP)
    page.wait_for_function("""() => KaikkiTesti.vault().files['pohjat/saatimet.md'] && !KaikkiTesti.status().includes('…')""")
    page.evaluate("document.getElementById('menu').click()")
    page.get_by_role('menuitem', name='Säätimet').click()
    page.get_by_role('dialog', name='Säätimet').get_by_role('button', name='Muokkaa: Kahvi').click()
    expect(page.locator('#saadin-var')).to_have_value('Kahvi (kpl)')
    expect(page.locator('#saadin-value')).to_have_value('1')
    expect(page.locator('#saadin-var-2')).to_have_count(0)
    expect(page.locator('#saadin-edit .saadin-var-x')).to_be_hidden()
    page.locator('#saadin-name').fill('Kahvi aamulla')
    page.locator('#saadin-save').click()
    page.wait_for_function("(__repo.get('pohjat/saatimet.md')||'').includes('## Kahvi aamulla')")
    tail = page.evaluate("__repo.get('pohjat/saatimet.md')").split('## Kahvi aamulla')[1]
    assert tail.startswith('\n- tunnus: kahvi\n- laji: kertanappi\n- muuttuja: Kahvi (kpl)\n- arvo: 1\n- tapa: lisaa\n'), tail
    page.keyboard.press('Escape')
    # Kojelaudan muokkaustilassa säädinruudun nappi avaa napin asetukset, käyttötilassa kirjaa.
    page.locator('#roll').click()
    page.locator('#section-dash').click()
    page.locator('#mvb-lock').click()
    page.locator('#mvb-add').click()
    page.locator('#mvb-kind').select_option('saadin')
    page.locator('#mvb-saadin').select_option('kahvi')
    page.locator('#mvb-save').click()
    card = page.locator('.mvb-card[data-kind=saadin]')
    card.get_by_role('button', name='Muokkaa nappia: Kahvi aamulla').click()
    expect(page.locator('#saadin-edit')).to_be_visible()
    expect(page.locator('#saadin-name')).to_have_value('Kahvi aamulla')
    page.locator('#saadin-edit').get_by_role('button', name='Peru').click()
    page.locator('#mvb-lock').click()
    expect(card.get_by_role('button', name='Kirjaa: Kahvi aamulla')).to_be_visible()
    page.close()


with sync_playwright() as p:
    b = p.chromium.launch()
    for w in (390, 320):
        check(b, w)
    legacy(b)
    b.close()
print('ok')
