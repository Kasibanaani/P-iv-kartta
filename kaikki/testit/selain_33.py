"""Kaikki 0.33 (Emil 22.11.2026, A0.7): näkymämuokkain apissa ja sovittujen kenttien luku vaultin oikeasta ohjeesta.
Tarkistaa: vaultin ohjeen `### Omat kentät` + `- Sovitut kentät:` (ilman lihavointia) tunnistetaan, jolloin tekstirivi `hinta: 50` on kenttä;
Näkymä-valikossa + Uusi näkymä; ikkunassa nimi, ehto (hinta > 100), järjestys (hinta laskeva), sarake hinta luku-näyttötavalla ja yksiköllä;
määrä päivittyy; ulkopuolinen napautus tallentaa `nakymat/<nimi>.md`:n tekoälyn kanssa samassa muodossa ja valitsee näkymän; rivit
rajautuvat ja järjestyvät; Muokkaa + Peru muutokset ei kirjoita mitään; ≠-ehto toimii. Leveydet 1440 ja 390.
Käyttö: python3 testit/selain_33.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
FAKE=open(os.path.join(D,'fakegh.js'),encoding='utf8').read()
def md(t,extra='',body='Teksti.'): return '---\ntyyppi: projekti\notsikko: %s\nkuvaus: \nluotu: 2026-11-20\nlahde: emil\n%s---\n# %s\n\n%s\n'%(t,extra,t,body)
OHJE='---\ntyyppi: ohje\notsikko: Muistiinpanot\n---\n# Muistiinpanot\n\n## Alkutiedot\n\n### Omat kentät (Emil 2026-11-22: sarakkeet)\n\n- Sovitut kentät: `tila` (yllä), `hinta` (euroina).\n\n## Linkit\n'
SEED={'ohjeet/muistiinpanot.md':OHJE,
      'projektit/r/keittio.md':md('Keittiö','hinta: 1200\ntila: kesken\n'),
      'projektit/r/eteinen.md':md('Eteinen','hinta: 300\ntila: valmis\n'),
      'projektit/r/teippi.md':md('Teippi','','Ostettu.\nhinta: 50\n'),
      'projektit/r/idea.md':md('Idea','tila: idea\n')}
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h})).new_page()
    await pg.add_init_script(FAKE+";(function(){var S=%s;if(!window.__repo.kept)for(var k in S)window.__repo.put(k,S[k]);try{localStorage.setItem('kaikki:gh',JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));localStorage.setItem('kaikki:nmode','rows')}catch(e){}})();"%json.dumps(SEED))
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond,info=''):
        print('  %-58s %s %s'%(label,'ok' if cond else 'VIRHE',info if not cond else ''))
        if not cond: bad.append(label)
    async def titles(): return await pg.evaluate("Array.from(document.querySelectorAll('#nlist .rvr .rvt')).filter(function(c){return !c.closest('[hidden]');}).map(function(c){return c.textContent.trim();})")
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(1500)
    al=await pg.evaluate("Array.from(formulaContext().allowed)") if await pg.evaluate("typeof formulaContext==='function'") else None
    await pg.click('#nvpick'); await pg.click('#nv-new'); await pg.wait_for_timeout(200)
    want('+ Uusi näkymä avaa ikkunan',await pg.evaluate("document.getElementById('nvedit').open"))
    await pg.fill('#nved-name','Kalliit')
    await pg.click('#nved-addcond')
    sel=pg.locator('#nvedit .nved-row select').nth(0)
    opts=await sel.evaluate("s=>Array.from(s.options).map(o=>o.value)")
    want('vaultin ohjeen kentät (### Omat kentät) tunnistetaan',('hinta' in opts) and ('tila' in opts),opts)
    await sel.select_option('hinta'); await pg.locator('#nvedit .nved-row select').nth(1).select_option('>')
    await pg.locator('#nvedit .nved-row input').first.fill('100')
    cnt=await pg.evaluate("document.getElementById('nved-count').textContent")
    want('määrä päivittyy (2 yli 100)',cnt.startswith('2 '),cnt)
    await pg.select_option('#nved-sort','hinta'); await pg.locator('#nvedit').get_by_label('Suunta',exact=True).select_option('-1')
    col=pg.locator('#nvedit .nved-col[data-k="hinta"]')
    await col.locator('input[type=checkbox]').check(); await pg.wait_for_timeout(100)
    await pg.locator('#nvedit .nved-col[data-k="hinta"] select').select_option('luku'); await pg.wait_for_timeout(100)
    await pg.locator('#nvedit .nved-col[data-k="hinta"] .nved-opt').fill('€')
    await pg.mouse.click(3,3); await pg.wait_for_timeout(100)
    want('ulkopuolinen napautus sulkee',not await pg.evaluate("document.getElementById('nvedit').open"))
    try: await pg.wait_for_function("(__repo.get('nakymat/kalliit.md')||'').length>0",timeout=8000); ok=True
    except Exception: ok=False
    t=await pg.evaluate("__repo.get('nakymat/kalliit.md')||''")
    want('näkymätiedosto tallentui samaan muotoon',ok and 'tyyppi: nakyma' in t and 'mista: hinta > 100' in t and 'jarjestys: hinta laskeva' in t and '  - hinta | luku | €' in t and 'nakyy: ei' in t,t)
    await pg.wait_for_timeout(300)
    tl=await titles()
    want('näkymä valittu, rivit rajattu ja järjestetty',tl==['Keittiö','Eteinen'],tl)
    hd=await pg.evaluate("Array.from(document.querySelectorAll('.rvhead .rvc[data-k]')).map(function(c){return c.textContent.trim();})")
    want('hinta-sarake mukana',any(x.lower().startswith('hinta') for x in hd),hd)
    # muokkaa + peru
    n0=await pg.evaluate("__repo.log.filter(function(x){return /^PUT/.test(x);}).length")
    await pg.click('#nvpick'); await pg.click('#nv-edit'); await pg.wait_for_timeout(150)
    await pg.fill('#nved-name','Muutettu'); await pg.click('#nved-cancel'); await pg.wait_for_timeout(800)
    n1=await pg.evaluate("__repo.log.filter(function(x){return /^PUT/.test(x);}).length")
    want('Peru muutokset ei kirjoita',n1==n0 and 'otsikko: Kalliit' in await pg.evaluate("__repo.get('nakymat/kalliit.md')"),(n0,n1))
    # ≠-ehto ja tekstirivin kenttä
    await pg.click('#nvpick'); await pg.click('#nv-edit'); await pg.wait_for_timeout(150)
    await pg.locator('#nvedit .nved-row select').nth(1).select_option('<')
    await pg.locator('#nvedit .nved-row input').first.fill('100')
    await pg.mouse.click(3,3)
    try: await pg.wait_for_function("(__repo.get('nakymat/kalliit.md')||'').includes('hinta < 100')",timeout=8000)
    except Exception: pass
    await pg.wait_for_timeout(300)
    tl=await titles()
    want('tekstirivin kenttä (hinta: 50) rajauksessa',tl==['Teippi'],tl)
    want('ei sivuttaisvieritystä (sivu)',await pg.evaluate("document.documentElement.scrollWidth<=innerWidth"))
    want('ei sivuvirheitä',not errs,errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((1440,900),(390,844)): bad+=await run(p,w,h)
    print('KAIKKI OK' if not bad else 'VIRHEITÄ: '+', '.join(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
