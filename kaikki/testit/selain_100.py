"""0.100: iso vault ei mahdu localStorageen (Safarin noin 5 Mt, jaettu muiden appien kanssa). Isot tallennukset IndexedDB:hen.

Testi jäljittelee pientä kiintiötä: localStorage hylkää kirjoituksen, joka veisi kokonaiskoon yli 1 000 000 merkin. Toisen apin
300 000 merkin tiedot ovat valmiina. Tarkistukset: ei muisti täynnä -ilmoitusta, välimuisti ja muistiinpanot IndexedDB:ssä,
toisen apin tiedot ennallaan, ilman verkkoa tehty muokkaus ja koko vault säilyvät uudelleenlatauksessa ja lähtevät verkon palatessa.
Vanha muoto (kaikki tiedostot ja lähetysjono yhdessä localStorage-avaimessa) siirtyy IndexedDB:hen ja odottava muokkaus lähtee.
Täsmäytys: välimuistin tuntema tiedosto ilman laitteen muistiinpanoa palautetaan eikä arkistoida."""
import json

from playwright.sync_api import expect, sync_playwright

from selain_64 import QuietHandler, ThreadingHTTPServer, Thread
from selain_68 import TESTS

N = 400
BODY = ('Pitkä lähdeteksti, jossa on taitoja ja harjoituksia. ' * 28).strip()
QUOTA = r"""
  const lsSet = Storage.prototype.setItem;
  Storage.prototype.setItem = function(key, value) {
    if (this === window.localStorage) {
      let total = 0;
      for (let i = 0; i < this.length; i++) { const k = this.key(i); if (k !== key) total += k.length + (this.getItem(k) || '').length; }
      if (total + String(key).length + String(value).length > 1000000) throw new DOMException('Muisti täynnä', 'QuotaExceededError');
    }
    return lsSet.call(this, key, value);
  };
  const realFetch = window.fetch;
  window.fetch = function(url) {
    if (sessionStorage.getItem('alhaalla') && String(url).includes('api.github.com')) return Promise.reject(new TypeError('Failed to fetch'));
    return realFetch.apply(this, arguments);
  };
"""


def seed_big():
    notes = {f'tieto/iso/n{i:03d}.md': f'# Iso {i}\n\n{BODY}\n' for i in range(N)}
    notes['tieto/koe.md'] = '# Koe\n\nAlku.\n'
    return notes


def launch(browser, url, width, extra=''):
    phone = width < 500
    page = browser.new_page(viewport={'width': width, 'height': 844}, is_mobile=phone, has_touch=phone)
    page.set_default_timeout(15000)
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.add_init_script((TESTS / 'fakegh.js').read_text() + QUOTA + """
      if (!__repo.kept) for (const [p, t] of Object.entries(%s)) __repo.put(p, t);
      if (!localStorage.getItem('paivakartta:v1')) localStorage.setItem('paivakartta:v1', 'x'.repeat(300000));
      localStorage.setItem('kaikki:gh', '{"repo":"testi/vault","token":"x","branch":"main"}');
      localStorage.setItem('kaikki:nmode', 'cards');
    """ % json.dumps(seed_big()) + extra)
    page.goto(url)
    return page, errors


def ls_total(page):
    return page.evaluate("""() => { let t = 0; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); t += k.length + localStorage.getItem(k).length; } return t; }""")


def big(browser, url, width):
    page, errors = launch(browser, url, width)
    page.wait_for_function(f'() => KaikkiTesti.notes().filter(n => n.vp && n.vp.startsWith("tieto/iso/")).length === {N}')
    page.wait_for_function("() => !KaikkiTesti.status().includes('…')")
    page.evaluate('KaikkiTesti.kflush()')
    st = page.evaluate('KaikkiTesti.kstore()')
    assert st['readOk'], st
    assert st['where'].get('kaikki:vault') == 'idb' and st['where'].get('kaikki:v1') == 'idb', st
    assert page.evaluate("localStorage.getItem('kaikki:vault')") is None
    assert page.evaluate("localStorage.getItem('paivakartta:v1').length") == 300000, 'toisen apin tiedot säilyvät'
    assert ls_total(page) < 1000000
    assert page.evaluate('Object.keys(KaikkiTesti.store().fail)') == []
    expect(page.locator('#status')).to_be_hidden()

    # Ilman verkkoa: muokkaus jonoon, uudelleenlataus lukee koko vaultin ja muokkauksen laitteelta.
    page.evaluate("sessionStorage.setItem('alhaalla', '1')")
    page.locator('#nsearch').fill('Alku.')
    page.locator('#nlist .nt').filter(has_text='Alku.').first.click()
    expect(page.locator('#nsheet')).to_be_visible()
    page.locator('#ns-text').evaluate(r"""el => { el.value = 'Koe\n\nAlku.\n\nKirjoitettu ilman verkkoa.'; el.dispatchEvent(new Event('input', {bubbles: true})); }""")
    page.keyboard.press('Escape')
    page.wait_for_function("() => (KaikkiTesti.vault().q['tieto/koe.md'] || {}).t?.includes('ilman verkkoa')")
    page.evaluate('KaikkiTesti.kflush()')
    page.reload()
    page.wait_for_function(f'() => window.KaikkiTesti && KaikkiTesti.notes().filter(n => n.vp && n.vp.startsWith("tieto/iso/")).length === {N}')
    assert 'Kirjoitettu ilman verkkoa.' in page.evaluate("KaikkiTesti.vault().q['tieto/koe.md'].t")
    assert any('ilman verkkoa' in n for n in page.evaluate("KaikkiTesti.notes().map(n => n.text)"))
    expect(page.locator('#status')).to_be_hidden()

    # Verkko palaa: muokkaus lähtee GitHubiin kerran.
    page.evaluate("sessionStorage.removeItem('alhaalla')")
    page.evaluate('KaikkiTesti.flush()')
    page.wait_for_function("() => (__repo.get('tieto/koe.md') || '').includes('Kirjoitettu ilman verkkoa.')")
    assert page.evaluate("__repo.get('tieto/koe.md')").count('Kirjoitettu ilman verkkoa') == 1
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    assert not errors, errors
    page.context.close()


def legacy(browser, url):
    """Vanha muoto: kaikki:vault localStoragessa tiedostoineen ja jonoineen. Pakotettu IndexedDB-raja 0."""
    old = r"""
      if (!sessionStorage.getItem('vanha')) {
        sessionStorage.setItem('vanha', '1');
        const files = {}; for (const [p, f] of Object.entries(__repo.files)) files[p] = {t: f.t, sha: f.sha};
        const q = {'tieto/koe.md': {t: '# Koe\n\nAlku.\n\nOdotti vanhassa jonossa.\n', base: __repo.files['tieto/koe.md'].sha}};
        const known = {}; Object.keys(files).forEach(p => known[p] = 1);
        localStorage.setItem('kaikki:vault', JSON.stringify({files, known, q, ops: []}));
        localStorage.setItem('kaikki:idb-raja', '0');
      }
    """
    page, errors = launch(browser, url, 390, old)
    page.wait_for_function("() => (__repo.get('tieto/koe.md') || '').includes('Odotti vanhassa jonossa.')")
    page.wait_for_function("() => !Object.keys(KaikkiTesti.vault().q).length")
    page.evaluate('KaikkiTesti.kflush()')
    page.wait_for_function("() => localStorage.getItem('kaikki:vault') === null && localStorage.getItem('kaikki:v1') === null")
    assert page.evaluate('KaikkiTesti.kstore()')['where'].get('kaikki:vaultq') == 'idb', 'raja 0: myös jono IndexedDB:ssä'
    page.evaluate("sessionStorage.setItem('alhaalla', '1')")
    page.reload()
    page.wait_for_function(f'() => window.KaikkiTesti && KaikkiTesti.notes().filter(n => n.vp && n.vp.startsWith("tieto/iso/")).length === {N}')
    assert any('Odotti vanhassa jonossa.' in n for n in page.evaluate("KaikkiTesti.notes().map(n => n.text)"))
    assert page.evaluate('KaikkiTesti.kstore()')['where'].get('kaikki:vault') == 'idb'
    # Täsmäytys: muistiinpanoja ei ollut laitteella, mutta välimuisti tunsi tiedostot. Mitään ei saa arkistoida GitHubissa.
    page.evaluate("sessionStorage.removeItem('alhaalla')")
    page.evaluate('KaikkiTesti.flush()')
    page.wait_for_timeout(1500)
    assert not [p for p in page.evaluate('Object.keys(__repo.files)') if p.startswith('arkisto/')], 'ei arkistointeja'
    assert page.evaluate("Object.keys(__repo.files).filter(p => p.startsWith('tieto/iso/')).length") == N
    assert not errors, errors
    page.context.close()


if __name__ == '__main__':
    with ThreadingHTTPServer(('127.0.0.1', 0), QuietHandler) as server, sync_playwright() as p:
        Thread(target=server.serve_forever, daemon=True).start()
        browser = p.chromium.launch()
        url = f'http://127.0.0.1:{server.server_port}/'
        for width in (320, 390, 1280):
            big(browser, url, width)
            print(f'Iso vault {width} px: OK', flush=True)
        legacy(browser, url)
        print('Vanha tallennus siirtyy: OK', flush=True)
