"""0.92: arkistointi yhtenä commitina (myös vahvistamaton ja kesken lähetyksen poistettu muistiinpano) ja selaimen muistin loppuminen."""
from playwright.sync_api import expect, sync_playwright

from selain_19 import APP, FAKE

SEED = r"""
  if (!__repo.kept) { __repo.put('tieto/koe.md', '# Koe\n\nAlku.\n'); __repo.put('tieto/toinen.md', '# Toinen\n\nPysyy.\n'); }
  localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
  localStorage.setItem('kaikki:nmode','cards');
  const originalFetch = window.fetch;
  let hold = false;
  window.fetch = async (url, options) => {
    const method = options?.method || 'GET';
    if (window.offline && String(url).includes('api.github.com')) throw new TypeError('Failed to fetch');
    if (window.slow && method==='PUT' && !hold) { hold=true; await new Promise(r => { window.releaseWrite=r; }); }
    const res = await originalFetch(url, options);
    if (window.loseAfter && method==='PATCH' && /\/git\/refs\//.test(url)) window.patched=true;
    else if (window.patched && method==='GET' && /\/git\/trees\//.test(url)) { window.loseAfter=window.patched=false; throw new TypeError('Failed to fetch'); }
    return res;
  };
  const setItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function(key, value) {
    if (window.full && String(key).startsWith('kaikki')) throw new DOMException('Muisti täynnä', 'QuotaExceededError');
    return setItem.call(this, key, value);
  };
"""


def ready(page):
    page.wait_for_function("""() => KaikkiTesti.notes().some(n=>n.vp==='tieto/koe.md') &&
      __repo.log.includes('GET /contents/listat/listat.json') && !KaikkiTesti.status().includes('…')""")


def idle(page):
    page.wait_for_function("!Object.keys(KaikkiTesti.vault().q).length && !KaikkiTesti.status().includes('…')")


def archived(page, text):
    return page.evaluate("t=>Object.keys(__repo.files).filter(p=>p.startsWith('arkisto/')&&__repo.get(p)===t)", text)


def add_note(page, text):
    page.evaluate(r"""text=>{const notes=KaikkiTesti.notes(),n=Object.assign({},notes.find(x=>x.vp==='tieto/toinen.md'));
      ['vp','vfm','vpre','vpost','vh'].forEach(k=>delete n[k]);n.id='t'+Date.now();n.text=text;notes.unshift(n);KaikkiTesti.collect();
      return notes[0].vp;}""", text)
    return page.evaluate("t=>KaikkiTesti.notes().find(n=>n.text===t).vp", text)


def archive_cases(browser, width):
    page = browser.new_page(viewport={'width': width, 'height': 844})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.add_init_script(FAKE + SEED)
    page.goto(APP)
    ready(page)
    # 1. Olemassa oleva muistiinpano: kopio ja poisto samassa commitissa, ei contents-DELETEä.
    page.evaluate("__repo.log.length=0")
    page.evaluate("KaikkiTesti.trash('tieto/koe.md')")
    idle(page)
    assert 'tieto/koe.md' not in page.evaluate("Object.keys(__repo.files)")
    assert archived(page, '# Koe\n\nAlku.\n') == ['arkisto/tieto/koe.md']
    log = page.evaluate("__repo.log")
    assert not any(x.startswith('DELETE') for x in log), log
    assert sum(1 for x in log if x.startswith('PATCH /git/refs')) == 1, log
    # 2. Vastaus katoaa onnistuneen commitin jälkeen: uusinta ei tee toista kopiota.
    page.evaluate("window.loseAfter=true")
    page.evaluate("KaikkiTesti.trash('tieto/toinen.md')")
    page.wait_for_function("!KaikkiTesti.status().includes('…')")
    assert page.evaluate("KaikkiTesti.vault().q['tieto/toinen.md']?.arch")
    assert 'tieto/toinen.md' not in page.evaluate("Object.keys(__repo.files)")
    page.evaluate("KaikkiTesti.flush()")
    idle(page)
    assert archived(page, '# Toinen\n\nPysyy.\n') == ['arkisto/tieto/toinen.md']
    # 3. Uusi muistiinpano poistetaan ennen ensimmäistä tallennusta (ei yhteyttä): kopio arkistoon, ei alkuperäistä.
    page.evaluate("window.offline=true")
    path = add_note(page, 'Bussiajatus ennen tallennusta')
    page.wait_for_function("p=>!KaikkiTesti.status().includes('…')", arg=path)
    assert page.evaluate("p=>!!KaikkiTesti.vault().q[p]", path)
    page.evaluate("p=>KaikkiTesti.trash(p)", path)
    page.evaluate("window.offline=false")
    page.evaluate("KaikkiTesti.flush()")
    idle(page)
    assert path not in page.evaluate("Object.keys(__repo.files)")
    hits = page.evaluate("t=>Object.keys(__repo.files).filter(p=>p.startsWith('arkisto/')&&__repo.get(p).includes(t))", 'Bussiajatus ennen tallennusta')
    assert len(hits) == 1, hits
    # 4. Poisto kesken ensimmäisen lähetyksen: ei palaa näkyviin, GitHubin tiedosto arkistoituu.
    page.evaluate("window.slow=true")
    path2 = add_note(page, 'Poistettu lähetyksen aikana')
    page.wait_for_function('!!window.releaseWrite')
    page.evaluate("p=>KaikkiTesti.trash(p)", path2)
    page.evaluate('releaseWrite()')
    idle(page)
    assert page.evaluate("KaikkiTesti.pull()")
    assert path2 not in page.evaluate("Object.keys(__repo.files)")
    assert not page.evaluate("p=>KaikkiTesti.notes().some(n=>n.vp===p)", path2)
    hits = page.evaluate("t=>Object.keys(__repo.files).filter(p=>p.startsWith('arkisto/')&&__repo.get(p).includes(t))", 'Poistettu lähetyksen aikana')
    assert len(hits) == 1, hits
    # 5. Palautus roskakorista ennen arkistoinnin lähtöä peruu arkistoinnin.
    page.evaluate(r"""__repo.put('tieto/palaa.md','# Palaa\n\nTakaisin.\n')""")
    assert page.evaluate("KaikkiTesti.pull()")
    page.evaluate("window.offline=true")
    page.evaluate("KaikkiTesti.trash('tieto/palaa.md')")
    page.evaluate("KaikkiTesti.restore('tieto/palaa.md')")
    page.evaluate("window.offline=false")
    page.evaluate("KaikkiTesti.flush()")
    idle(page)
    assert page.evaluate("__repo.get('tieto/palaa.md')") == '# Palaa\n\nTakaisin.\n'
    assert archived(page, '# Palaa\n\nTakaisin.\n') == []
    assert page.evaluate("KaikkiTesti.notes().some(n=>n.vp==='tieto/palaa.md')")
    assert not errors, errors
    page.close()


def full_storage(browser, width):
    page = browser.new_page(viewport={'width': width, 'height': 844})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.add_init_script(FAKE + SEED)
    page.goto(APP)
    ready(page)
    expect(page.locator('#status')).to_be_hidden()
    page.evaluate("window.full=true")
    page.locator('#nlist .nt').filter(has_text='Alku.').first.click()
    expect(page.locator('#nsheet')).to_be_visible()
    page.locator('#ns-text').evaluate(r"""el=>{el.value='Koe\n\nKirjoitettu täyteen muistiin.';el.dispatchEvent(new Event('input',{bubbles:true}));}""")
    expect(page.locator('#ns-store')).to_be_visible()
    expect(page.locator('#ns-store')).to_contain_text('muisti on täynnä')
    expect(page.locator('#ns-store')).to_contain_text('GitHubiin')
    page.locator('#ns-store-copy').click()
    expect(page.locator('#ns-store-copy')).not_to_have_text('Kopioi teksti')
    page.keyboard.press('Escape')
    page.wait_for_function("(__repo.get('tieto/koe.md')||'').includes('Kirjoitettu täyteen muistiin.')")
    expect(page.locator('#status')).to_be_visible()
    expect(page.locator('#status')).to_have_text('Laitteen muisti täynnä')
    assert 'kaikki:vault' in page.evaluate("Object.keys(KaikkiTesti.store().fail)")
    page.locator('#status').click()
    expect(page.locator('#storesheet')).to_be_visible()
    expect(page.locator('#st-text')).to_contain_text('muistiinpanon luonnos')
    expect(page.locator('#st-text')).to_contain_text('GitHub')
    # Avaa uudelleen ja vertaa GitHubin tiedostoon.
    page.evaluate("document.getElementById('storesheet').close()")
    page.locator('#nlist .nt').filter(has_text='Kirjoitettu täyteen muistiin.').first.click()
    assert 'Kirjoitettu täyteen muistiin.' in page.locator('#ns-text').input_value()
    assert page.evaluate("__repo.get('tieto/koe.md').includes(document.getElementById('ns-text').value.trim().split('\\n').pop())")
    page.keyboard.press('Escape')
    page.evaluate("window.full=false")
    page.locator('#status').click()
    page.locator('#st-retry').click()
    expect(page.locator('#st-msg')).to_have_text('Tallennus onnistui.')
    expect(page.locator('#status')).to_be_hidden()
    assert 'Kirjoitettu täyteen muistiin.' in page.evaluate("localStorage.getItem('kaikki:vault')")
    assert not errors, errors
    page.close()


if __name__ == '__main__':
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        for width in (320, 390, 1280, 1440):
            archive_cases(browser, width)
            full_storage(browser, width)
        browser.close()
