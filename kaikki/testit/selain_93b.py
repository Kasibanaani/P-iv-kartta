"""0.93: Kirjaa siihen, mitä olet tekemässä. Muistiinpanon lukunäkymästä ＋ Kirjaa: teksti ja omat napit ryhmittäin avoimeen
muistiinpanoon, teksti säilyy ryhmää vaihdettaessa, kumoa, lukittu näkymä estää."""
from playwright.sync_api import expect, sync_playwright

from selain_19 import APP, FAKE

NOTE = '---\ntyyppi: muistiinpano\notsikko: Salitreeni\npikaryhma: Treeni\nlahde: emil\n---\n# Salitreeni\n\nTänään jalat ja penkki.\n'
SAATIMET = '''---
tyyppi: pohja
otsikko: Säätimet
nakyy: ei
lahde: emil
---
# Säätimet

## Penkki
- tunnus: penkki
- laji: kertanappi
- ryhma: Treeni
- muuttuja: Penkki (kg)
- tapa: lisaa
- minne: paiva
- aika: nyt

## Venyttely
- tunnus: venyttely
- laji: kertanappi
- ryhma: Treeni
- teksti: Venytelty
- aikaleima: kylla
- tapa: lisaa
- minne: paiva
- aika: nyt

## Kahvi
- tunnus: kahvi
- laji: kertanappi
- teksti: Kahvi juotu
- tapa: lisaa
- minne: paiva
- aika: nyt
'''
SEED = r"""
  if (!__repo.kept) {
    __repo.put('tieto/salitreeni.md', %r);
    __repo.put('pohjat/saatimet.md', %r);
    __repo.put('nakymat/treenit.md', '---\ntyyppi: nakyma\notsikko: Treenit\n---\n# Treenit\n');
  }
  localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
  localStorage.setItem('kaikki:nmode','cards');
""" % (NOTE, SAATIMET)


def ready(page):
    page.wait_for_function("""() => KaikkiTesti.notes().some(n=>n.vp==='tieto/salitreeni.md') && !KaikkiTesti.status().includes('…')""")


def repo(page):
    return page.evaluate("__repo.get('tieto/salitreeni.md')")


def check(browser, width):
    page = browser.new_page(viewport={'width': width, 'height': 844})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.add_init_script(FAKE + SEED)
    page.goto(APP)
    ready(page)
    page.locator('#nlist .nt').filter(has_text='Tänään jalat').first.click()
    expect(page.locator('#nsheet')).to_be_visible()
    expect(page.locator('#ns-log')).to_be_visible()
    page.locator('#ns-log').click()
    d = page.locator('#note-log')
    expect(d).to_be_visible()
    expect(page.locator('#nl-target')).to_have_text('Salitreeni')
    # pikaryhma: Treeni avaa ryhmän valmiiksi
    expect(page.locator('#nl-groups button', has_text='Treeni')).to_have_attribute('aria-pressed', 'true')
    expect(page.locator('#nl-btns')).to_contain_text('Penkki')
    page.locator('#nl-text').fill('Lämmittely tehty.')
    page.locator('#nl-groups button', has_text='Napit').click()
    expect(page.locator('#nl-btns')).to_contain_text('Kahvi')
    expect(page.locator('#nl-btns')).not_to_contain_text('Penkki')
    page.locator('#nl-groups button', has_text='Treeni').click()
    assert page.locator('#nl-text').input_value() == 'Lämmittely tehty.'
    # Kysyvä nappi kirjoittaa avoimeen muistiinpanoon, ei päivän muistiinpanoon.
    page.locator('#nl-btns button', has_text='Penkki').click()
    expect(page.locator('#saadin-ask')).to_be_visible()
    page.locator('#saadin-ask-value').fill('80')
    page.locator('#saadin-ask button[type=submit]').click()
    expect(page.locator('#saadin-ask')).to_be_hidden()
    page.wait_for_function("(__repo.get('tieto/salitreeni.md')||'').includes('Penkki (kg) = 80')")
    assert not page.evaluate("Object.keys(__repo.files).some(p=>p.startsWith('paivat/'))")
    expect(d).to_be_visible()
    expect(page.locator('#ns-text')).to_have_value(__import__('re').compile('Penkki \\(kg\\) = 80'))
    assert page.locator('#nl-text').input_value() == 'Lämmittely tehty.'
    # Vapaa teksti loppuun omaksi kappaleekseen.
    page.locator('#nl-save').click()
    page.wait_for_function("(__repo.get('tieto/salitreeni.md')||'').endsWith('\\n\\nLämmittely tehty.\\n')")
    expect(page.locator('#nl-text')).to_have_value('')
    expect(page.locator('#nl-msg')).to_contain_text('Kirjattu: Salitreeni')
    # Kumoa palauttaa tiedoston ja tekstin.
    page.locator('#saadin-undo-b').click()
    page.wait_for_function("!(__repo.get('tieto/salitreeni.md')||'').includes('Lämmittely tehty.')")
    assert 'Penkki (kg) = 80' in repo(page)
    expect(page.locator('#nl-text')).to_have_value('Lämmittely tehty.')
    # Muistiinpano ei palaa vanhaan versioon seuraavassa synkassa.
    page.evaluate("KaikkiTesti.collect()")
    page.wait_for_function("!KaikkiTesti.status().includes('…')")
    assert 'Penkki (kg) = 80' in repo(page)
    # Ruudun leveys: ei vaakaylivuotoa ikkunassa.
    assert page.evaluate("document.getElementById('note-log').scrollWidth<=document.getElementById('note-log').clientWidth+1")
    page.locator('#nl-close').click()
    expect(d).to_be_hidden()
    # Luonnos säilyy suljettaessa.
    page.locator('#ns-log').click()
    expect(page.locator('#nl-text')).to_have_value('Lämmittely tehty.')
    page.locator('#nl-close').click()
    page.keyboard.press('Escape')
    # Näkymästä avattu; näkymä lukitaan auki olevan ikkunan aikana -> kirjaus estyy.
    page.evaluate("KaikkiTesti.openFromView('tieto/salitreeni.md','nakymat/treenit.md')")
    expect(page.locator('#ns-log')).to_be_visible()
    page.locator('#ns-log').click()
    page.evaluate(r"""()=>{const V=KaikkiTesti.vault();V.files['nakymat/treenit.md'].t='---\ntyyppi: nakyma\notsikko: Treenit\nlukittu: kyllä\n---\n# Treenit\n';}""")
    before = repo(page)
    page.locator('#nl-btns button', has_text='Venyttely').click()
    expect(page.locator('#nl-msg')).to_contain_text('lukittu')
    page.wait_for_timeout(200)
    assert repo(page) == before
    assert not errors, errors
    page.close()


if __name__ == '__main__':
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        for width in (320, 390, 1280, 1440):
            check(browser, width)
            print(width, 'px: OK')
        browser.close()
