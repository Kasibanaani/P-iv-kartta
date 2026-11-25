"""0.93: kaksi välilehteä samassa selaimessa. Vain yksi tallentaa; käyttö siirtyy toiselle tallennettuna eikä kesken lähetyksen
luovutettu muutos monistu."""
from playwright.sync_api import expect, sync_playwright

from selain_19 import FAKE
import functools, http.server, threading
from pathlib import Path

# Välilehdet jakavat localStorage-tilan luotettavasti vain oikealla alkuperällä (http), eivät file://-osoitteessa.
class _Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
_server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(_Quiet, directory=str(Path(__file__).resolve().parent.parent)))
threading.Thread(target=_server.serve_forever, daemon=True).start()
APP = 'http://127.0.0.1:%d/index.html' % _server.server_port

PRE = "try{localStorage.setItem('__repoShared','1');}catch(e){}\n"
SEED = r"""
  if (!__repo.kept) { __repo.put('tieto/koe.md', '# Koe\n\nAlku.\n'); }
  localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
  localStorage.setItem('kaikki:nmode','cards');
  const originalFetch = window.fetch;
  let hold = false;
  window.fetch = async (url, options) => {
    const method = options?.method || 'GET';
    if (window.offline && String(url).includes('api.github.com')) throw new TypeError('Failed to fetch');
    if (window.slow && method==='PUT' && !hold) { hold=true; await new Promise(r => { window.releaseWrite=r; }); }
    return originalFetch(url, options);
  };
"""


def ready(page):
    page.wait_for_function("""() => KaikkiTesti.notes().some(n=>n.vp==='tieto/koe.md') && !KaikkiTesti.status().includes('…')""")


def edit(page, text):
    page.evaluate(r"""text=>{KaikkiTesti.notes().find(n=>n.vp==='tieto/koe.md').text=text;KaikkiTesti.save();KaikkiTesti.collect();}""", text)


def puts(page):
    return page.evaluate("__repo.log.filter(x=>x.startsWith('PUT')||x.startsWith('PATCH')||x.startsWith('DELETE')).length")


def check(browser, width):
    ctx = browser.new_context(viewport={'width': width, 'height': 844})
    errors = []
    ctx.on('weberror', lambda e: errors.append(str(e.error)) if 'Access is denied' not in str(e.error) else None)
    ctx.add_init_script(PRE + FAKE + SEED)
    a = ctx.new_page()
    a.goto(APP)
    ready(a)
    expect(a.locator('#tabsheet')).to_be_hidden()
    b = ctx.new_page()
    b.goto(APP)
    b.wait_for_function("!!window.KaikkiTesti")
    st = [a.evaluate("[localStorage.getItem('kaikki:tab'),Date.now(),KaikkiTesti.tab(),document.hidden]"), b.evaluate("[KaikkiTesti.tab(),document.hidden]")]
    assert b.evaluate("KaikkiTesti.tab().passive"), st
    expect(b.locator('#tabsheet')).to_be_visible()
    b.wait_for_timeout(400)
    assert puts(b) == 0
    # A kirjaa ilman yhteyttä; muutos odottaa A:n jonossa.
    a.evaluate("window.offline=true")
    edit(a, 'Koe\n\nKirjattu A:ssa.')
    a.wait_for_function("!!KaikkiTesti.vault().q['tieto/koe.md']")
    # B ottaa käyttöön: A luovuttaa, B latautuu ja lähettää A:n muutoksen.
    b.locator('#tab-take').click()
    expect(a.locator('#tabsheet')).to_be_visible()
    b.wait_for_load_state()
    ready(b)
    expect(b.locator('#tabsheet')).to_be_hidden()
    b.wait_for_function("(__repo.get('tieto/koe.md')||'').includes('Kirjattu A:ssa.')")
    # Passiivinen A ei tallenna eikä lähetä.
    a.evaluate("window.offline=false")
    before = puts(a)
    edit(a, 'Koe\n\nEi saa tallentua.')
    a.evaluate("KaikkiTesti.flush()")
    a.wait_for_timeout(300)
    assert puts(a) == before
    assert 'Ei saa tallentua' not in a.evaluate("localStorage.getItem('kaikki:v1')")
    # Kesken lähetyksen luovutettu muutos lähtee vain kerran.
    b.evaluate("window.slow=true")
    edit(b, 'Koe\n\nKesken lähetyksen.')
    b.wait_for_function('!!window.releaseWrite')
    a.locator('#tab-take').click()
    expect(b.locator('#tabsheet')).to_be_visible()
    a.wait_for_load_state()
    ready(a)
    expect(a.locator('#tabsheet')).to_be_hidden()
    a.wait_for_function("(__repo.get('tieto/koe.md')||'').includes('Kesken lähetyksen.')")
    b.evaluate('releaseWrite()')
    b.wait_for_timeout(500)
    a.evaluate("KaikkiTesti.pull()")
    files = a.evaluate("(__repo.get('x'),Object.keys(__repo.files))")
    assert not [p for p in files if 'ristiriita' in p], files
    assert a.evaluate("__repo.get('tieto/koe.md')").endswith('Kesken lähetyksen.\n')
    assert a.evaluate("!Object.keys(KaikkiTesti.vault().q).length")
    assert not errors, errors
    ctx.close()


if __name__ == '__main__':
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        for width in (390, 1280):
            check(browser, width)
        browser.close()
