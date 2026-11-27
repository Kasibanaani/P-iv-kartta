"""0.117: rajattu kenen kirjoittamat -suodatin näkyy Muistion yläosassa piilotettujen määrän kanssa, ja Näytä kaikki tuo
tekoälyn muistiinpanot näkyviin. Haku kertoo suodattimen piilottamista. Leveydet 390, 320 ja 1440 px."""
from playwright.sync_api import sync_playwright

from selain_19 import APP, FAKE

AI = 'alueet/hyvinvointi/paivan-ohjain.md'
SEED = r"""
  if (!__repo.kept) { __repo.put('tieto/oma.md', '---\nlahde: emil\n---\n# Oma\n\nOma teksti.\n');
    __repo.put('alueet/hyvinvointi/paivan-ohjain.md', '---\ntyyppi: muistiinpano\notsikko: Päivän ohjain\nlahde: chatgpt\n---\n# Päivän ohjain\n\nOhjain.\n'); }
  localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
  localStorage.setItem('kaikki:nmode','cards');
  if (!sessionStorage.getItem('seeded')) { localStorage.setItem('kaikki:lahde','emil'); sessionStorage.setItem('seeded','1'); }
"""


def check(browser, width):
    page = browser.new_page(viewport={'width': width, 'height': 844})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.add_init_script(FAKE + SEED)
    page.goto(APP)
    page.wait_for_function("window.KaikkiTesti && KaikkiTesti.notes().some(n=>n.vp==='tieto/oma.md') && !KaikkiTesti.status().includes('…')")
    page.wait_for_function("document.getElementById('srcband')")
    band = page.locator('#srcband').inner_text()
    assert 'Näytetään vain: Omat ja yhdessä tehdyt' in band and '1 muistiinpano piilossa' in band, band
    assert not page.evaluate("p=>KaikkiTesti.notes().some(n=>n.vp===p)", AI)
    page.fill('#nsearch', 'ohjain')
    page.wait_for_timeout(100)
    assert 'piilottaa 1 muistiinpanoa' in page.locator('#nempty').inner_text()
    page.click('#srcband-all')
    page.wait_for_function("p=>KaikkiTesti.notes().some(n=>n.vp===p)", arg=AI)
    assert page.locator('#srcband').count() == 0
    note = page.evaluate("p=>KaikkiTesti.notes().find(n=>n.vp===p).id", AI)
    page.fill('#nsearch', 'ohjain')
    page.wait_for_timeout(100)
    assert page.locator('#nlist [data-id="%s"]' % note).is_visible()
    assert page.evaluate("document.documentElement.scrollWidth<=innerWidth")
    assert not errors, errors
    page.close()


with sync_playwright() as p:
    try:
        browser = p.chromium.launch()
    except Exception:
        browser = p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    for width in (390, 320, 1440):
        check(browser, width)
    browser.close()
print('selain_117 ok')
