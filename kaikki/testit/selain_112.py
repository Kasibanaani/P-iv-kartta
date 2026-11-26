"""0.112: uusi holvin muistiinpano tulee näkyviin ja tila kertoo totuuden haun onnistumisesta.

Korjattava 26.11.2026: GitHubiin lisätty muistiinpano ei näkynyt Muistiossa, vaikka tila sanoi ”ajan tasalla”.
Kokeet: (a) uusi alueet/-muistiinpano näkyy ja löytyy osittaisella hakusanalla, (b) moniriviset ((…))-kaavat eivät pudota
tiedostoa, (c) saman päivän muut tiedostot näkyvät, (d) epäonnistunut haku ei näytä ”ajan tasalla” edes onnistuneen
tallennuksen jälkeen, (e) lähettämätön kirjaus säilyy täsmäytyksessä, (f) toistuva haku ei monista eikä arkistoi.
Lisäksi täsmäytysaukko (tunnettu tiedosto ilman muistiinpanoa) palautetaan arkistoimatta, aito poisto arkistoidaan
edelleen ja roskakorin poisto tunnistetaan uudelleenkäynnistyksen jälkeen. Leveydet 390 ja 320 px."""
from playwright.sync_api import sync_playwright

from selain_19 import APP, FAKE

NEW = 'alueet/hyvinvointi/paivan-ohjain.md'
NEW_MD = '''---
tyyppi: muistiinpano
otsikko: Päivän ohjain
kuvaus: Kokeilu.
tagit: [hyvinvointi]
luotu: 2026-11-26
lahde: chatgpt
---
# Päivän ohjain

((uni: =LIUKUSÄÄDIN(min = 0; max = 10; askel = 1; alku = 5; tallenna = "ei")))

((Tila:
  JOS uni < 4: "lepo"
  JOS uni >= 7: "toiminta"
  MUUTEN: "tasapaino"
))

((Ohje:
  JOS NIMETTY("Tila") = "lepo": "Kevyesti."
  MUUTEN: "Valitse yksi asia."
))
'''
OTHER = 'tieto/saman-paivan.md'
OTHER_MD = '---\ntyyppi: tieto\notsikko: Saman päivän\nluotu: 2026-11-26\nlahde: claude\n---\n# Saman päivän\n\nToinen uusi.\n'

SEED = r"""
  if (!__repo.kept) { __repo.put('tieto/koe.md', '---\ntyyppi: tieto\notsikko: Koe\nlahde: claude\n---\n# Koe\n\nAlku.\n'); __repo.put('inbox/oma.md', '# Oma\n\nOma teksti.\n'); }
  localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
  localStorage.setItem('kaikki:nmode','cards');
  const originalFetch = window.fetch;
  window.fetch = async (url, options) => {
    if (window.offline && String(url).includes('api.github.com')) throw new TypeError('Failed to fetch');
    if (window.badBlob && String(url).includes('/git/blobs/'+window.badBlob)) return new Response('',{status:503});
    return originalFetch(url, options);
  };
"""


def ready(page):
    page.wait_for_function("""() => KaikkiTesti.notes().some(n=>n.vp==='tieto/koe.md') &&
      __repo.log.includes('GET /contents/listat/listat.json') && !KaikkiTesti.status().includes('…')""")


def idle(page):
    page.wait_for_function("!Object.keys(KaikkiTesti.vault().q).length && !KaikkiTesti.status().includes('…')")


def count(page, path):
    return page.evaluate("p=>KaikkiTesti.notes().filter(n=>n.vp===p).length", path)


def writes(page):
    return page.evaluate("__repo.log.filter(x=>!x.startsWith('GET'))")


def check(browser, width):
    page = browser.new_page(viewport={'width': width, 'height': 844})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.add_init_script(FAKE + SEED)
    page.goto(APP)
    ready(page)
    assert page.evaluate("KaikkiTesti.status()").startswith('ajan tasalla')

    # (a)–(c) Uudet tiedostot GitHubista: monirivisillä kaavoilla oleva alueet/-muistiinpano ja saman päivän toinen tiedosto.
    page.evaluate("([a,b,c,d])=>{__repo.put(a,b);__repo.put(c,d);}", [NEW, NEW_MD, OTHER, OTHER_MD])
    page.evaluate("__repo.log.length=0")
    assert page.evaluate("KaikkiTesti.pull()")
    assert count(page, NEW) == 1 and count(page, OTHER) == 1
    assert page.evaluate("KaikkiTesti.gap()") == []
    note_id = page.evaluate("p=>KaikkiTesti.notes().find(n=>n.vp===p).id", NEW)
    card = page.locator('#nlist [data-id="%s"]' % note_id)
    assert card.count() == 1
    page.fill('#nsearch', 'ohjai')
    page.wait_for_timeout(100)
    assert card.is_visible(), 'osittainen haku ei löytänyt uutta muistiinpanoa'
    other_id = page.evaluate("p=>KaikkiTesti.notes().find(n=>n.vp===p).id", OTHER)
    assert not page.locator('#nlist [data-id="%s"]' % other_id).is_visible()
    page.fill('#nsearch', '')
    page.wait_for_timeout(100)
    assert page.locator('#nlist [data-id="%s"]' % other_id).is_visible()
    assert writes(page) == [], writes(page)

    # (f) Toistuva haku ei monista, ei kirjoita eikä arkistoi.
    for _ in range(3):
        assert page.evaluate("KaikkiTesti.pull()")
    page.evaluate("KaikkiTesti.collect()")
    page.wait_for_timeout(300)
    assert count(page, NEW) == 1 and count(page, OTHER) == 1
    assert writes(page) == [], writes(page)

    # Täsmäytysaukko: laitteen muistiinpanolistasta puuttuu holvin tunnettu tiedosto. Ennen 0.112:ta haku ohitti sen pysyvästi
    # ja seuraava tallennus arkistoi sen GitHubissa. Nyt haku palauttaa muistiinpanon.
    assert page.evaluate("p=>KaikkiTesti.desync(p)", NEW)
    assert page.evaluate("p=>!!KaikkiTesti.vault().known[p]", NEW)
    assert page.evaluate("KaikkiTesti.pull()")
    assert count(page, NEW) == 1, 'haku ei palauttanut puuttuvaa muistiinpanoa'
    # Sama tallennuksen kautta: arkistointia ei tehdä, muistiinpano palaa.
    assert page.evaluate("p=>KaikkiTesti.desync(p)", OTHER)
    page.evaluate("KaikkiTesti.collect()")
    idle(page)
    assert count(page, OTHER) == 1, 'tallennus ei palauttanut puuttuvaa muistiinpanoa'
    assert OTHER in page.evaluate("Object.keys(__repo.files)")
    assert not [p for p in page.evaluate("Object.keys(__repo.files)") if p.startswith('arkisto/')]
    assert writes(page) == [], writes(page)

    # (e) Lähettämätön kirjaus säilyy täsmäytyksessä: ei yhteyttä, oma muutos jonossa, täsmäytysaukko ja paluu verkkoon.
    page.evaluate("window.offline=true")
    page.evaluate(r"""()=>{const n=KaikkiTesti.notes().find(x=>x.vp==='inbox/oma.md');n.text='Oma\n\nOma teksti.\nKirjattu ilman verkkoa.';KaikkiTesti.collect();}""")
    page.wait_for_function("!!KaikkiTesti.vault().q['inbox/oma.md']")
    assert page.evaluate("KaikkiTesti.desync('inbox/oma.md')")
    page.evaluate("KaikkiTesti.collect()")
    page.wait_for_timeout(200)
    q = page.evaluate("KaikkiTesti.vault().q['inbox/oma.md']")
    assert q and not q.get('arch') and 'Kirjattu ilman verkkoa.' in q['t'], q
    assert page.evaluate("KaikkiTesti.notes().some(n=>n.vp==='inbox/oma.md'&&n.text.includes('Kirjattu ilman verkkoa.'))")
    # (d) Haku ilman yhteyttä ei ole ”ajan tasalla”.
    assert not page.evaluate("KaikkiTesti.pull()")
    assert 'ajan tasalla' not in page.evaluate("KaikkiTesti.status()")
    page.evaluate("window.offline=false")
    page.evaluate("KaikkiTesti.flush()")
    idle(page)
    assert 'Kirjattu ilman verkkoa.' in page.evaluate("__repo.get('inbox/oma.md')")
    assert not [p for p in page.evaluate("Object.keys(__repo.files)") if p.startswith('arkisto/')]

    # (d) Epäonnistunut haku + onnistunut tallennus: tila ei näytä ”ajan tasalla”, erittely kertoo haun virheen.
    page.evaluate(r"""()=>{__repo.put('tieto/rikki.md','# Rikki\n');window.badBlob=__repo.files['tieto/rikki.md'].sha;}""")
    assert not page.evaluate("KaikkiTesti.pull()")
    page.evaluate(r"""()=>{const n=KaikkiTesti.notes().find(x=>x.vp==='inbox/oma.md');n.text+='\nToinen rivi.';KaikkiTesti.collect();}""")
    idle(page)
    status = page.evaluate("KaikkiTesti.status()")
    assert 'ajan tasalla' not in status, status
    detail = page.evaluate("KaikkiTesti.detail()")
    assert any(l.startswith('Haku GitHubista epäonnistui: Tiedoston haku epäonnistui: tieto/rikki.md') for l in detail), detail
    assert any('Viimeisin tallennus GitHubiin' in l for l in detail), detail
    page.evaluate("window.badBlob=null")
    assert page.evaluate("KaikkiTesti.pull()")
    assert page.evaluate("KaikkiTesti.status()").startswith('ajan tasalla')
    assert count(page, 'tieto/rikki.md') == 1

    # Aito poisto arkistoidaan edelleen, ja roskakorin poisto tunnistetaan uudelleenkäynnistyksen jälkeen.
    page.evaluate("KaikkiTesti.trash('tieto/koe.md')")
    idle(page)
    assert 'arkisto/tieto/koe.md' in page.evaluate("Object.keys(__repo.files)")
    assert count(page, 'tieto/koe.md') == 0
    page.evaluate("KaikkiTesti.save()")
    page.evaluate("KaikkiTesti.kflush()")
    page.wait_for_function("""()=>{const w=KaikkiTesti.kstore().where['kaikki:v1'];
      return w!=='ls'||(localStorage.getItem('kaikki:v1')||'').includes('"vp":"tieto/koe.md","vfm"')&&(localStorage.getItem('kaikki:v1')||'').includes('"deleted"');}""")
    page.reload()
    page.wait_for_function("KaikkiTesti.notes().some(n=>n.vp===%r) && !KaikkiTesti.status().includes('…')" % NEW)
    assert 'tieto/koe.md' in page.evaluate("KaikkiTesti.trashPaths()")
    assert count(page, 'tieto/koe.md') == 0 and count(page, NEW) == 1 and count(page, OTHER) == 1
    assert page.evaluate("KaikkiTesti.gap()") == []
    # Erittely GitHub-vault-ikkunassa.
    page.evaluate("document.getElementById('ghbtn').click()")
    text = page.locator('#gs-status').inner_text()
    assert 'Haettu GitHubista klo' in text and 'Lähetysjono: tyhjä.' in text and 'Muistiinpanoja holvista:' in text, text
    assert not errors, errors
    page.close()


with sync_playwright() as p:
    try:
        browser = p.chromium.launch()
    except Exception:
        browser = p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    for width in (390, 320):
        check(browser, width)
    browser.close()
print('selain_112 ok')
