"""0.94: suorien kirjausten yhteinen tulosmalli. Kirjaus on laitteella ennen lähetystä, verkkokatko jättää sen jonoon, kadonnut
vastaus ei monista riviä, kaksi tarkoituksellista painallusta tekee kaksi riviä ja kadonnut kohde ei hävitä tekstiä."""
import re
from playwright.sync_api import expect, sync_playwright

from selain_19 import FAKE
from selain_93 import APP  # http-palvelin: uudelleenlataus näkee saman localStoragen (file:// ei aina)
from selain_93b import SAATIMET

NOTE = '---\ntyyppi: muistiinpano\notsikko: Salitreeni\npikaryhma: Treeni\nlahde: emil\n---\n# Salitreeni\n\nAlku.\n'
SEED = r"""
  if (!__repo.kept) { __repo.put('tieto/salitreeni.md', %r); __repo.put('pohjat/saatimet.md', %r); }
  localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
  localStorage.setItem('kaikki:nmode','cards');
  window.offline = sessionStorage.getItem('offline')==='1';
  const originalFetch = window.fetch;
  window.fetch = async (url, options) => {
    const method = options?.method || 'GET';
    if (window.offline && String(url).includes('api.github.com')) throw new TypeError('Failed to fetch');
    const res = await originalFetch(url, options);
    if (method==='PUT') {
      const b=JSON.parse(options.body), t=decodeURIComponent(escape(atob(b.content)));
      (window.puts=window.puts||[]).push(b.message);
      if (window.losePut && t.includes(window.losePut)) { window.losePut=''; throw new TypeError('Failed to fetch'); }
    }
    return res;
  };
""" % (NOTE, SAATIMET)


def ready(page):
    page.wait_for_function("""() => KaikkiTesti.notes().some(n=>n.vp==='tieto/salitreeni.md') && !KaikkiTesti.status().includes('…')""")


def count(page, s):
    return page.evaluate("s=>{const t=__repo.get('tieto/salitreeni.md')||'';return t.split(s).length-1;}", s)


def open_log(page):
    page.locator('#nlist .nt').filter(has_text='Alku.').first.click()
    page.locator('#ns-log').click()
    expect(page.locator('#note-log')).to_be_visible()


def idle(page):
    page.wait_for_function("!KaikkiTesti.status().includes('…')")


def check(browser, width):
    page = browser.new_page(viewport={'width': width, 'height': 844})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.add_init_script(FAKE + SEED)
    page.goto(APP)
    ready(page)
    open_log(page)
    # 1. Verkkokatko: teksti jonoon laitteelle, säilyy uudelleenlatauksen yli, lähtee kerran.
    page.evaluate("window.offline=true;sessionStorage.setItem('offline','1')")
    page.locator('#nl-text').fill('Ilman yhteyttä kirjattu.')
    page.locator('#nl-save').click()
    expect(page.locator('#nl-msg')).to_contain_text('Tallessa laitteella')
    expect(page.locator('#nl-text')).to_have_value('')
    assert 'Ilman yhteyttä kirjattu.' in page.evaluate("JSON.stringify(JSON.parse(localStorage.getItem('kaikki:vault')).ops)")
    assert 'odottaa' in page.evaluate("KaikkiTesti.status()")
    page.evaluate("sessionStorage.setItem('offline','0')")
    page.reload()
    ready(page)
    try:
        page.wait_for_function("(__repo.get('tieto/salitreeni.md')||'').includes('Ilman yhteyttä kirjattu.')", timeout=8000)
    except Exception:
        raise AssertionError(page.evaluate("[JSON.stringify(KaikkiTesti.vault().ops).slice(0,300), JSON.stringify(Object.keys(KaikkiTesti.vault().q)), KaikkiTesti.status(), document.getElementById('gs-status').textContent, __repo.log, KaikkiTesti.tab(), document.getElementById('tabsheet').open]"))
    idle(page)
    assert count(page, 'Ilman yhteyttä kirjattu.') == 1
    assert page.evaluate("!KaikkiTesti.vault().ops.length")
    # 2. Vastaus katoaa onnistuneen tallennuksen jälkeen: uusinta ei tee toista riviä.
    open_log(page)
    page.evaluate("window.losePut='Vastaus katosi.'")
    page.locator('#nl-text').fill('Vastaus katosi.')
    page.locator('#nl-save').click()
    expect(page.locator('#nl-msg')).to_contain_text('Tallessa laitteella')
    idle(page)
    assert count(page, 'Vastaus katosi.') == 1
    page.evaluate("KaikkiTesti.flush()")
    page.wait_for_function("!KaikkiTesti.vault().ops.length")
    assert count(page, 'Vastaus katosi.') == 1
    # 3. Sama havaintonappi, vastaus katoaa: lohkon tunnus estää toisen kirjauksen.
    page.evaluate("window.losePut='Penkki (kg) = 80'")
    page.locator('#nl-btns button', has_text='Penkki').click()
    page.locator('#saadin-ask-value').fill('80')
    page.locator('#saadin-ask button[type=submit]').click()
    page.wait_for_function("KaikkiTesti.vault().ops.length===1&&KaikkiTesti.vault().ops[0].sent&&!KaikkiTesti.status().includes('…')")
    page.evaluate("KaikkiTesti.flush()")
    page.wait_for_function("!KaikkiTesti.vault().ops.length")
    assert count(page, 'Penkki (kg) = 80') == 1
    # 4. Kaksi tarkoituksellista samanlaista painallusta = kaksi riviä.
    page.locator('#nl-groups button', has_text='Napit').click()
    page.locator('#nl-btns button', has_text='Kahvi').click()
    page.wait_for_function("(__repo.get('tieto/salitreeni.md')||'').split('Kahvi juotu').length===2")
    idle(page)
    page.locator('#nl-btns button', has_text='Kahvi').click()
    page.wait_for_function("(__repo.get('tieto/salitreeni.md')||'').split('Kahvi juotu').length===3")
    # 5. Kohde poistetaan ennen lähtöä: teksti talteen inboxiin.
    page.evaluate("window.offline=true")
    page.locator('#nl-text').fill('Kohde katosi välissä.')
    page.locator('#nl-save').click()
    expect(page.locator('#nl-msg')).to_contain_text('Tallessa laitteella')
    page.evaluate("delete __repo.files['tieto/salitreeni.md']; window.offline=false")
    page.evaluate("KaikkiTesti.flush()")
    page.wait_for_function("Object.keys(__repo.files).some(p=>p.startsWith('inbox/')&&p.endsWith('-kirjaus.md')&&__repo.get(p).includes('Kohde katosi välissä.'))")
    assert page.evaluate("!KaikkiTesti.vault().ops.length")
    puts = page.evaluate("window.puts")
    assert not [m for m in puts if not (m.startswith('appi: kirjaus') or m.startswith('appi: säädin') or 'inbox/' in m)], puts
    assert not errors, errors
    page.close()


if __name__ == '__main__':
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        for width in (320, 390, 1280, 1440):
            check(browser, width)
            print(width, 'px: OK')
        browser.close()
