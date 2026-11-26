"""Holvin keskeneräinen haku, rinnakkaiset kirjoitukset ja havaintojen todellinen järjestys."""
from playwright.sync_api import expect, sync_playwright

from selain_19 import APP, FAKE

SEED = r"""
  if (!__repo.kept) __repo.put('tieto/koe.md', '# Koe\n\nAlku.\n');
  localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
  localStorage.setItem('kaikki:nmode','cards');
  const originalFetch = window.fetch;
  let hold = false;
  window.fetch = async (url, options) => {
    const method = options?.method || 'GET';
    if (window.publicRepo && url.includes('/repos/testi/julkinen')) {
      return Response.json({private:false,default_branch:'main'});
    }
    if (window.partial && url.includes('/git/trees/')) return Response.json({tree:[],truncated:true});
    if (window.badBlob && url.includes('/git/blobs/'+window.badBlob)) return new Response('',{status:503});
    if (window.failLookup && method==='GET' && url.includes('/contents/tieto/koe.md')) return new Response('',{status:503});
    if (window.slow && method==='PUT' && url.includes('/contents/tieto/koe.md') && !hold) {
      hold=true; await new Promise(resolve => { window.releaseWrite=resolve; });
    }
    return originalFetch(url,options);
  };
"""
def ready(page):
    page.wait_for_function("""() => KaikkiTesti.notes().some(n=>n.vp==='tieto/koe.md') &&
      __repo.log.includes('GET /contents/listat/listat.json') &&
      !KaikkiTesti.status().includes('…')""")


def edit(page, text):
    page.evaluate(r"""text=>{
      KaikkiTesti.notes().find(n=>n.vp==='tieto/koe.md').text=text;
      KaikkiTesti.collect();
    }""", text)


def check(browser, width):
    page = browser.new_page(viewport={'width':width,'height':844})
    page.add_init_script(FAKE+SEED)
    page.goto(APP)
    ready(page)
    page.evaluate("window.partial=true")
    assert not page.evaluate("KaikkiTesti.pull()")
    assert page.evaluate("KaikkiTesti.notes().some(n=>n.vp==='tieto/koe.md')")
    page.evaluate(r"""() => {
      window.partial=false; __repo.put('tieto/koe.md','# Koe\n\nEtä.\n');
      __repo.put('tieto/uusi.md','# Lisäys\n'); window.badBlob=__repo.files['tieto/uusi.md'].sha;
    }""")
    assert not page.evaluate("KaikkiTesti.pull()")
    assert 'Alku' in page.evaluate("KaikkiTesti.vault().files['tieto/koe.md'].t")
    assert 'ajan tasalla' not in page.evaluate('KaikkiTesti.status()')
    page.evaluate("window.badBlob=null")
    assert page.evaluate("KaikkiTesti.pull()")
    page.evaluate("window.slow=true")
    edit(page, 'Koe\n\nEnsimmäinen')
    page.wait_for_function('!!window.releaseWrite')
    edit(page, 'Koe\n\nToinen')
    page.evaluate('releaseWrite()')
    page.wait_for_function("__repo.get('tieto/koe.md').includes('Toinen')&&!KaikkiTesti.vault().q['tieto/koe.md']")
    page.evaluate(r"""() => {__repo.put('tieto/koe.md','# Koe\n\nTekoälyn jatko.\n');window.failLookup=true;}""")
    edit(page, 'Koe\n\nOma jatko.')
    page.wait_for_function("document.querySelector('#gs-status').textContent.includes('503')")
    assert page.evaluate("JSON.parse(localStorage.getItem('kaikki:vaultq')).q['tieto/koe.md'].t.includes('Oma jatko')")
    page.evaluate('window.failLookup=false')
    page.evaluate('KaikkiTesti.flush()')
    assert page.evaluate("__repo.get('tieto/koe.md').includes('Tekoälyn jatko')")
    assert page.evaluate("Object.keys(__repo.files).some(p=>p.includes('ristiriita')&&__repo.get(p).includes('Oma jatko'))")
    page.evaluate(r"""() => {__repo.put('listat/listat.json','{vajaa');}""")
    page.evaluate('KaikkiTesti.lsSync()')
    assert page.evaluate("__repo.get('listat/listat.json')") == '{vajaa'
    expect(page.locator('#gs-status')).to_contain_text('Listojen synkronointi keskeytyi')
    page.evaluate(r"""() => {__repo.put('listat/listat.json','{"lisatieto":"säilytä"}');}""")
    page.evaluate('KaikkiTesti.lsSync()')
    assert page.evaluate("JSON.parse(__repo.get('listat/listat.json')).lisatieto") == 'säilytä'
    # Tavallinen auki oleva editori. Haku, kirjoitus ja ulkopuolelta sulkeminen.
    expect(page.locator('#nlist')).not_to_contain_text('1.1.2026')
    page.locator('#nlist .nt').filter(has_text='Tekoälyn jatko.').click()
    expect(page.locator('#nsheet')).to_be_visible()
    page.evaluate(r"""__repo.put('tieto/koe.md','# Koe\n\nToinen etämuutos.\n')""")
    assert page.evaluate('KaikkiTesti.refresh()')
    expect(page.locator('#ns-vmsg')).to_contain_text('Holvin versio muuttui')
    page.locator('#ns-text').evaluate(r"""el=>{el.readOnly=false;el.value='Koe\n\nOma avoimesta editorista.';el.dispatchEvent(new Event('input',{bubbles:true}));}""")
    page.keyboard.press('Escape')
    page.wait_for_function("Object.keys(__repo.files).some(p=>p.includes('ristiriita')&&__repo.get(p).includes('Oma avoimesta editorista'))")
    assert page.evaluate("__repo.get('tieto/koe.md').includes('Toinen etämuutos')")
    # Hylätty yhteys ei vaihda aktiivisen tallennusjonon kohdetta.
    page.evaluate("document.getElementById('gsheet').showModal(); window.publicRepo=true")
    page.locator('#gs-repo').fill('testi/julkinen')
    page.locator('#gs-tok').fill('eri')
    page.locator('#gs-save').click()
    expect(page.locator('#gs-msg')).to_contain_text('yksityinen')
    assert page.evaluate('KaikkiTesti.gh().repo') == 'testi/vault'
    assert page.evaluate('KaikkiTesti.gh().token') == 'x'
    page.close()


def latest(browser):
    page=browser.new_page(viewport={'width':1280,'height':844})
    page.add_init_script(FAKE+SEED+r"""
      __repo.put('data/kojelauta.md','| id | otsikko | muuttuja | laske | aika | tunniste | kansio | yksikko | nayta |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- |\n| koe | Koetulos | Koe | summa | | | | | luku |\n');
      __repo.put('tieto/kellot.md','# Kellot\n((25.11.2026 klo 8.30, Koe = 1))\n((25.11.2026 klo 12.00, Koe = 2))\n((25.11.2026 klo 12.00, Koe = 3))\n');
    """)
    page.goto(APP)
    ready(page)
    page.get_by_role('tab',name='Kojelauta',exact=True).click()
    expect(page.locator('#p-dash')).to_contain_text('Koetulos')
    expect(page.locator('#p-dash')).not_to_contain_text('Vaultissa ei ole mittareita')
    expect(page.locator('#dashrange')).to_have_count(0)
    page.locator('#deskmenu').click()
    page.locator('#m-mv').click()
    row=page.locator('#mv-list .mvrow').filter(has_text='Koe')
    expect(row).to_contain_text('viimeisin 2 arvoa')
    row.click()
    assert page.locator('#mv-obs .mvrow b').all_text_contents() == ['2','3','1']
    page.close()


if __name__=='__main__':
    with sync_playwright() as playwright:
        browser=playwright.chromium.launch()
        for width in (390,1280):
            check(browser,width)
        latest(browser)
        browser.close()
