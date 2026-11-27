"""0.113: GitHub-vault-ikkunan Tarkista tiedosto ja Hae kaikki uudelleen. Leveydet 390 ja 320 px.
Tarkistus kertoo tiedoston kulun portaittain (GitHub, laitteen välimuisti, näkyvyys, jono, poisto, muistiinpano).
Hae kaikki uudelleen korjaa välimuistin, jonka tiedosto on samalla versiotunnuksella mutta väärällä sisällöllä,
eikä hävitä lähettämätöntä omaa muutosta."""
from playwright.sync_api import sync_playwright

from selain_19 import APP, FAKE

NEW = 'alueet/hyvinvointi/paivan-ohjain.md'
NEW_MD = '---\ntyyppi: muistiinpano\notsikko: Päivän ohjain\nluotu: 2026-11-26\nlahde: chatgpt\n---\n# Päivän ohjain\n\n((uni: =LIUKUSÄÄDIN(min = 0; max = 10; alku = 5)))\n'
SEED = r"""
  if (!__repo.kept) { __repo.put('tieto/koe.md', '# Koe\n\nAlku.\n'); __repo.put('inbox/oma.md', '# Oma\n\nOma teksti.\n'); }
  localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
  localStorage.setItem('kaikki:nmode','cards');
"""


def idle(page):
    page.wait_for_function("!Object.keys(KaikkiTesti.vault().q).length && !KaikkiTesti.status().includes('…')")


def check(browser, width):
    page = browser.new_page(viewport={'width': width, 'height': 844})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.add_init_script(FAKE + SEED)
    page.goto(APP)
    page.wait_for_function("window.KaikkiTesti && KaikkiTesti.notes().some(n=>n.vp==='tieto/koe.md') && !KaikkiTesti.status().includes('…')")
    page.evaluate("([a,b])=>__repo.put(a,b)", [NEW, NEW_MD])
    assert page.evaluate("KaikkiTesti.pull()")
    why = page.evaluate("KaikkiTesti.why('ohjai')")
    assert why[0] == '— ' + NEW, why
    assert why[1].startswith('1. GitHubissa: on') and 'sama versio' in why[2] and 'näkyy suodattimella' in why[3], why
    assert why[-1] == '6. Muistiinpano: on.', why
    assert 'ei ole yhtään' in page.evaluate("KaikkiTesti.why('eiolemassa')")[0]

    # Rikkinäinen välimuisti: sama versiotunnus, väärä sisältö, eikä muistiinpanoa. Tavallinen haku ei korjaa, koko haku korjaa.
    page.evaluate("""p=>{const c=KaikkiTesti.vault().files[p];c.t='---\\nnakyy: ei\\n---\\nrikki';KaikkiTesti.desync(p);}""", NEW)
    assert page.evaluate("KaikkiTesti.pull()")
    assert not page.evaluate("p=>KaikkiTesti.notes().some(n=>n.vp===p)", NEW)
    assert 'EI näy' in ' '.join(page.evaluate("KaikkiTesti.why('ohjai')"))
    page.evaluate(r"""()=>{const n=KaikkiTesti.notes().find(x=>x.vp==='inbox/oma.md');n.text+='\nOdottaa.';}""")
    page.evaluate("__repo.log.length=0")
    assert page.evaluate("KaikkiTesti.fullPull()")
    idle(page)
    assert page.evaluate("p=>KaikkiTesti.notes().filter(n=>n.vp===p).length", NEW) == 1
    assert 'Odottaa.' in page.evaluate("__repo.get('inbox/oma.md')")
    log = page.evaluate("__repo.log")
    assert sum(1 for x in log if x.startswith('GET /git/blobs/')) >= 3, log
    assert not [p for p in page.evaluate("Object.keys(__repo.files)") if p.startswith('arkisto/')]

    # Ikkunan napit ja versio.
    page.evaluate("document.getElementById('ghbtn').click()")
    assert ('Kaikki ' + page.evaluate("KaikkiTesti.ver()")) in page.locator('#gs-status').inner_text()
    page.fill('#gs-why', 'ohjai')
    page.click('#gs-whybtn')
    assert '6. Muistiinpano: on.' in page.locator('#gs-whyout').inner_text()
    page.click('#gs-full')
    page.wait_for_function("document.getElementById('gs-whyout').textContent.startsWith('Kaikki tiedostot haettu uudelleen')")
    assert page.evaluate("document.documentElement.scrollWidth<=innerWidth")
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
print('selain_113 ok')
