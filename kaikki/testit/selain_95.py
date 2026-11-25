"""0.95: pikakirjauksen Seuranta ja Muuttujat (myös kojelaudan Kirjaa arvo) sekä kojelaudan päivän mittarit yhteisessä
tulosmallissa. Verkkokatko jättää kirjauksen laitteelle (säilyy uudelleenlatauksen yli), kadonnut vastaus ei monista riviä ja
taustalla havaittu ristiriita (sama solu muuttui GitHubissa) tallentaa kirjauksen inboxiin. Muistutus kulkee muistiinpanojonossa."""
from datetime import date
import json

from playwright.sync_api import expect, sync_playwright

from selain_19 import FAKE
from selain_93 import APP  # http-palvelin: uudelleenlataus näkee saman localStoragen (file:// ei aina)

TODAY = date.today().isoformat()
DAY_PATH = 'paivat/%s/%s.md' % (TODAY[:4], TODAY)
HEADER = 'pvm,treeni,vire\n'
PRESETS = '## Seuranta\n- Treeni | kyllä\n- Vire | 1-5\n\n## Muistutus\n- Vaihda suodatin | #koti\n\n## Muuttujat\n- "Uni (h)"\n'
SPEC = {'taulukot': [{'id': 'paiva', 'tiedosto': 'data/paiva.csv', 'sarakkeet': [
    {'id': 'treeni', 'nimi': 'Treeni', 'laji': 'kylla-ei'},
    {'id': 'vire', 'nimi': 'Vire', 'laji': 'asteikko', 'min': 1, 'max': 5},
]}]}
SEED = r"""
  if (!__repo.kept) { __repo.put('data/mittarit.json', %s); __repo.put('data/paiva.csv', %s); __repo.put('pohjat/pikakirjaus.md', %s); }
  localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
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
""" % (json.dumps(json.dumps(SPEC)), json.dumps(HEADER), json.dumps(PRESETS))


def ready(page):
    page.wait_for_function("KaikkiTesti.vault().files['pohjat/pikakirjaus.md'] && !KaikkiTesti.status().includes('…')")


def idle(page):
    page.wait_for_function("!KaikkiTesti.status().includes('…')")


def ops(page):
    return page.evaluate("JSON.stringify(JSON.parse(localStorage.getItem('kaikki:vault')).ops||[])")


def csv(page):
    return page.evaluate("__repo.get('data/paiva.csv')")


def quick(page, *names):
    page.get_by_role('button', name='Pikakirjaus', exact=True).click()
    dialog = page.locator('#quick-entry')
    expect(dialog).to_be_visible()
    if dialog.get_by_role('button', name='Seuranta', exact=True).get_attribute('aria-pressed') != 'true':
        dialog.get_by_role('button', name='Seuranta', exact=True).click()
    for name in names:
        dialog.get_by_role('button', name=name, exact=True).click()
    dialog.get_by_role('button', name='Valmis', exact=True).click()
    expect(dialog).to_be_hidden()


def check(browser, width):
    page = browser.new_page(viewport={'width': width, 'height': 844})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.add_init_script(FAKE + SEED)
    page.goto(APP)
    ready(page)
    toast = page.locator('#undo-t')

    # 1. Verkkokatko: Seuranta (CSV) ja Kirjaa arvo (päivämuistiinpano) jäävät laitteelle.
    page.evaluate("window.offline=true;sessionStorage.setItem('offline','1')")
    quick(page, 'Vire', '4')
    expect(toast).to_contain_text('tallessa laitteella')
    assert 'data/paiva.csv' in ops(page)
    page.get_by_role('button', name='Pikakirjaus', exact=True).click()
    dialog = page.locator('#quick-entry')
    dialog.get_by_role('button', name='Muuttujat', exact=True).click()
    dialog.get_by_role('button', name='Uni (h)', exact=True).click()
    dialog.get_by_label('Arvo · Uni (h)').fill('7,5')
    dialog.get_by_role('button', name='Lisää kirjaus', exact=True).click()
    dialog.get_by_role('button', name='Valmis', exact=True).click()
    expect(dialog).to_be_hidden()
    assert DAY_PATH in ops(page) and 'Uni (h)' in ops(page)
    assert 'odottaa' in page.evaluate("KaikkiTesti.status()")
    # Muistutus kulkee muistiinpanojen jonossa (VC.q), ei suorana kirjauksena.
    page.get_by_role('button', name='Pikakirjaus', exact=True).click()
    dialog.get_by_role('button', name='Muistutus', exact=True).click()
    dialog.get_by_role('button', name='Vaihda suodatin', exact=True).click()
    page.locator(f'#dsheet [data-day="{TODAY}"]').click()
    page.keyboard.press('Escape')
    page.wait_for_function("JSON.stringify(JSON.parse(localStorage.getItem('kaikki:vault')).q||{}).includes('#koti')")
    if dialog.is_visible():
        page.keyboard.press('Escape')
    assert HEADER == csv(page)
    page.evaluate("sessionStorage.setItem('offline','0')")
    page.reload()
    ready(page)
    try:
        page.wait_for_function("(__repo.get('data/paiva.csv')||'').includes(',4')&&(__repo.get(%r)||'').includes('Uni (h)')" % DAY_PATH, timeout=8000)
        page.wait_for_function("Object.entries(__repo.files).some(([p,f])=>p.startsWith('inbox/')&&f.t.includes('#koti'))", timeout=8000)
    except Exception:
        raise AssertionError(page.evaluate("[JSON.stringify(KaikkiTesti.vault().ops).slice(0,400), KaikkiTesti.status(), __repo.log]"))
    idle(page)
    assert csv(page) == HEADER + TODAY + ',,4\n', csv(page)
    day_text = page.evaluate("p=>__repo.get(p)", DAY_PATH)
    assert day_text.count('Uni (h) = 7,5') == 1 or day_text.count('Uni (h) = 7.5') == 1, day_text
    page.wait_for_function("!KaikkiTesti.vault().ops.length")

    # 2. Vastaus katoaa onnistuneen tallennuksen jälkeen: uusinta ei kirjoita toista kertaa.
    page.evaluate("window.losePut=%r" % (TODAY + ',1,4'))
    puts = page.evaluate("__repo.log.filter(l=>l==='PUT /contents/data/paiva.csv').length")
    quick(page, 'Treeni')
    expect(toast).to_contain_text('tallessa laitteella')
    idle(page)
    page.evaluate("KaikkiTesti.flush()")
    page.wait_for_function("!KaikkiTesti.vault().ops.length")
    assert csv(page) == HEADER + TODAY + ',1,4\n', csv(page)
    assert page.evaluate("__repo.log.filter(l=>l==='PUT /contents/data/paiva.csv').length") == puts + 1

    # 3. Ristiriita taustalla: sama solu muuttui GitHubissa ennen lähtöä. GitHubin arvo jää, oma talteen inboxiin.
    page.evaluate("window.offline=true")
    quick(page, 'Vire', '2')
    page.evaluate("t=>__repo.put('data/paiva.csv', t)", HEADER + TODAY + ',1,5\n')
    page.evaluate("window.offline=false")
    page.evaluate("KaikkiTesti.flush()")
    page.wait_for_function("Object.entries(__repo.files).some(([p,f])=>p.startsWith('inbox/')&&p.endsWith('-kirjaus.md')&&f.t.includes('vire = 2'))")
    assert csv(page) == HEADER + TODAY + ',1,5\n', csv(page)
    expect(toast).to_contain_text('inboxiin')
    page.wait_for_function("!KaikkiTesti.vault().ops.length")

    # 4. Kojelaudan päivän mittarit: verkkokatko sulkee lomakkeen ja kirjaus lähtee myöhemmin.
    idle(page)
    if width >= 1000:
        page.get_by_role('tab', name='Kojelauta', exact=True).click()
    else:
        page.locator('#roll').click()
        page.locator('#section-dash').click()
    page.evaluate("window.offline=true")
    page.locator('#dash-entry-open').click()
    form = page.locator('#dash-entry-form')
    form.get_by_label('Vire', exact=True).fill('3')
    page.locator('#dash-entry-save').click()
    expect(page.locator('#dash-entry')).to_be_hidden()
    expect(toast).to_contain_text('Tallessa laitteella')
    page.evaluate("window.offline=false")
    page.evaluate("KaikkiTesti.flush()")
    page.wait_for_function("!KaikkiTesti.vault().ops.length")
    assert csv(page) == HEADER + TODAY + ',1,3\n', csv(page)

    sent = page.evaluate("window.puts")
    assert not [m for m in sent if m not in ('appi: päivän mittarit', 'appi: päivän pikakirjaukset') and 'inbox/' not in m], sent
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    assert not errors, errors
    page.close()


if __name__ == '__main__':
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        for width in (320, 390, 1280, 1440):
            check(browser, width)
            print(width, 'px: OK')
        browser.close()
