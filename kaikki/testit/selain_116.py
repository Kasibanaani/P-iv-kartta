"""0.116: lukitun Muistio-näkymän järjestysnappi (Tulevat) kertoo napautettaessa lukituksesta eikä jää hiljaiseksi.
Lukituksen avaamisen jälkeen järjestysvalikko aukeaa. Leveydet 390, 320 ja 1440 px."""
from playwright.sync_api import sync_playwright

from selain_19 import APP, FAKE

SEED = r"""
  if (!__repo.kept) { __repo.put('tieto/koe.md', '# Koe\n\nAlku.\n');
    __repo.put('nakymat/kaikki.md', '---\ntyyppi: nakyma\notsikko: Kaikki muistiinpanot\nnakyy: ei\nlukittu: kyllä\n---\n# Kaikki muistiinpanot\n'); }
  localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
  localStorage.setItem('kaikki:nmode','cards');
"""


def check(browser, width):
    page = browser.new_page(viewport={'width': width, 'height': 844})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.add_init_script(FAKE + SEED)
    page.goto(APP)
    page.wait_for_function("window.KaikkiTesti && KaikkiTesti.notes().some(n=>n.vp==='tieto/koe.md') && !KaikkiTesti.status().includes('…')")
    page.wait_for_function("document.getElementById('notesort') && document.getElementById('notesort').getAttribute('aria-disabled')==='true'")
    page.click('#notesort', force=True)  # aria-disabled: Playwright ei muuten napauta
    page.wait_for_function("!document.getElementById('undo').hidden && document.getElementById('undo-t').textContent.includes('lukittu')")
    assert page.evaluate("document.getElementById('sortpop').hidden")
    page.click('.view-lock')
    page.wait_for_function("__repo.get('nakymat/kaikki.md').indexOf('lukittu')<0")
    page.wait_for_function("document.getElementById('notesort').getAttribute('aria-disabled')!=='true'")
    page.click('#notesort')
    page.wait_for_function("!document.getElementById('sortpop').hidden")
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
print('selain_116 ok')
