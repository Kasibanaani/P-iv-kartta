"""Kaikki 0.55 (korjaussuunnitelma 1, 23.11.2026): näkymätiedoston turvallinen osapäivitys.
Tarkistaa testivaultilla (fakegh.js):
1. Pelkkä nimen vaihto muuttaa vain otsikko- ja #-otsikkorivin: oma alkutieto, kommentti, sarakkeen lisämääre ja runko säilyvät rivi riviltä.
2. Kun palvelimelle tulee uusi rivi (muu alkutieto) näkymän ollessa auki, se säilyy ja oma muutos yhdistyy.
3. Eri kenttien muutokset yhdistyvät (palvelimella ehto, omassa sarake).
4. Saman kentän ristiriita: palvelimen versio jää, Näkymä-valikossa Käytä omaa / Pidä toisaalla tehty, ja Näkymä-nappiin tulee merkki.
5. A:n hidas tallennus ja B:n muokkaus samaan aikaan: A ei valitse itseään kesken B:n muokkauksen, molemmat tallentuvat oikeisiin tiedostoihin.
6. Yhteyskatko: luonnos jää odottamaan (myös sivun uudelleenlatauksen yli), Yritä uudelleen tallentaa; Hylkää poistaa.
7. Peru muutokset ei kirjoita mitään.
Leveydet 1440 ja 390. Käyttö: python3 testit/selain_55.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
FAKE=open(os.path.join(D,'fakegh.js'),encoding='utf8').read()
def md(t,extra=''): return '---\ntyyppi: projekti\notsikko: %s\nkuvaus: \nluotu: 2026-11-20\nlahde: emil\n%s---\n# %s\n\nTeksti.\n'%(t,extra,t)
VA=('---\ntyyppi: nakyma\notsikko: Alfa\nkuvaus: Testinäkymä\nluotu: 2026-11-21\nlahde: emil\nnakyy: ei\noma: säilyy\n# kommentti alkutiedoissa\n'
    'mista: tila = kesken\nsarakkeet:\n  # sarakkeiden kommentti\n  - otsikko\n  - tila | siru | | lisa=1\n  - hinta | luku | €\n---\n# Alfa\n\nRunko **säilyy**.\n\n- rivi\n')
VB='---\ntyyppi: nakyma\notsikko: Beeta\nkuvaus: \nluotu: 2026-11-21\nlahde: emil\nnakyy: ei\nsarakkeet:\n  - otsikko\n  - tila\n---\n# Beeta\n'
SEED={'projektit/a.md':md('Keittiö','tila: kesken\nhinta: 10\n'),'projektit/b.md':md('Eteinen','tila: valmis\nhinta: 20\n'),
      'nakymat/alfa.md':VA,'nakymat/beeta.md':VB}
# Hidastus ja katko näkymätiedostojen PUT-pyyntöihin testin ohjaamana.
CTRL="""(function(){var f=window.fetch;window.__ctl={slow:{},fail:false};window.fetch=function(u,o){var m=(o&&o.method)||'GET',s=String(u);
  var hit=/\\/contents\\/nakymat%2F([^?]+)/.exec(s)||/\\/contents\\/nakymat\\/([^?]+)/.exec(s);
  if(hit&&m==='PUT'){if(window.__ctl.fail)return Promise.reject(new TypeError('Failed to fetch'));var ms=window.__ctl.slow[decodeURIComponent(hit[1])];
    if(ms){var a=arguments,t=this;return new Promise(function(r){setTimeout(function(){r(f.apply(t,a));},ms);});}}
  return f.apply(this,arguments);};})();"""
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h})).new_page()
    await pg.add_init_script(FAKE+";(function(){var S=%s;if(!window.__repo.kept)for(var k in S)window.__repo.put(k,S[k]);try{if(!sessionStorage.getItem('__init')){sessionStorage.setItem('__init','1');localStorage.setItem('kaikki:gh',JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));localStorage.setItem('kaikki:nmode','rows');localStorage.setItem('kaikki:nview','nakymat/alfa.md');}}catch(e){}})();"%json.dumps(SEED)+CTRL)
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond,info=''):
        print('  %-62s %s %s'%(label,'ok' if cond else 'VIRHE',info if not cond else ''))
        if not cond: bad.append(label)
    async def get(path): return await pg.evaluate("__repo.get(%s)||''"%json.dumps(path))
    async def put(path,t): await pg.evaluate("__repo.put(%s,%s)"%(json.dumps(path),json.dumps(t)))
    async def puts(): return await pg.evaluate("__repo.log.filter(function(x){return /^PUT \\/contents\\/nakymat/.test(x);}).length")
    async def edit(view=None):
        if view: await pg.click('#nvpick'); await pg.click('#nv-'+view.replace('/','-').replace('.','-')); await pg.wait_for_timeout(150)
        await pg.click('#nvpick'); await pg.click('#nv-edit'); await pg.wait_for_timeout(150)
    async def close(): await pg.mouse.click(3,3); await pg.wait_for_timeout(100)
    async def until(js,ms=8000):
        try: await pg.wait_for_function(js,timeout=ms); return True
        except Exception: return False
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(1500)
    # 1. nimen vaihto
    await edit(); await pg.fill('#nved-name','Alfa uusi'); await close()
    ok=await until("(__repo.get('nakymat/alfa.md')||'').indexOf('Alfa uusi')>0")
    t=await get('nakymat/alfa.md')
    exp=VA.replace('otsikko: Alfa\n','otsikko: Alfa uusi\n').replace('---\n# Alfa\n','---\n# Alfa uusi\n')
    want('1 nimen vaihto muuttaa vain nimen rivit',ok and t==exp,'\n'+t)
    # 2. palvelimelle uusi rivi kesken muokkauksen + oma muutos
    await pg.wait_for_timeout(300)
    await edit(); await pg.fill('#nved-name','Alfa 2')
    await put('nakymat/alfa.md',exp.replace('oma: säilyy\n','oma: säilyy\nuusi: palvelimelta\n'))
    await close(); ok=await until("(__repo.get('nakymat/alfa.md')||'').indexOf('Alfa 2')>0")
    t=await get('nakymat/alfa.md')
    want('2 palvelimen uusi rivi säilyy, oma nimi tallentuu',ok and 'uusi: palvelimelta' in t and 'otsikko: Alfa 2' in t and 'lisa=1' in t and 'Runko **säilyy**.' in t,'\n'+t)
    # 3. eri kenttien muutokset yhdistyvät: palvelimella ehto, omassa sarake pois
    await pg.wait_for_timeout(300)
    await edit(); await pg.locator('#nvedit .nved-col[data-k="hinta"] input[type=checkbox]').uncheck(); await pg.wait_for_timeout(80)
    await put('nakymat/alfa.md',t.replace('mista: tila = kesken','mista: tila = valmis'))
    await close(); ok=await until("(__repo.get('nakymat/alfa.md')||'').indexOf('hinta | luku')<0")
    t=await get('nakymat/alfa.md')
    want('3 eri kenttien muutokset yhdistyvät',ok and 'mista: tila = valmis' in t and 'hinta | luku' not in t and '  - tila | siru | | lisa=1' in t and '  # sarakkeiden kommentti' in t,'\n'+t)
    # 4. saman kentän ristiriita
    await pg.wait_for_timeout(300)
    await edit(); await pg.fill('#nved-name','Oma nimi')
    await put('nakymat/alfa.md',t.replace('otsikko: Alfa 2','otsikko: Toisaalla').replace('# Alfa 2','# Toisaalla'))
    n0=await puts(); await close(); await until("document.getElementById('nvpick')&&document.getElementById('nvpick').classList.contains('nv-warn')"); await pg.wait_for_timeout(200)
    t=await get('nakymat/alfa.md')
    warn=await pg.evaluate("document.getElementById('nvpick').classList.contains('nv-warn')")
    want('4 ristiriita: palvelimen versio jää, ei kirjoitusta',await puts()==n0 and 'otsikko: Toisaalla' in t,'\n'+t)
    want('4 Näkymä-napissa merkki',warn)
    await pg.click('#nvpick'); await pg.wait_for_timeout(100)
    st=await pg.evaluate("(document.querySelector('#sortpop .nv-pend')||{}).textContent||''")
    want('4 valikossa ristiriidan kuvaus',('muutettu toisaalla' in st) and ('nimi' in st),st)
    await pg.click('#sortpop [id$="-mine"]'); ok=await until("(__repo.get('nakymat/alfa.md')||'').indexOf('otsikko: Oma nimi')>0")
    t=await get('nakymat/alfa.md')
    want('4 Käytä omaa versiota tallentaa oman nimen',ok and '# Oma nimi' in t and 'uusi: palvelimelta' in t,'\n'+t)
    await pg.wait_for_timeout(300)
    want('4 merkki poistuu',not await pg.evaluate("document.getElementById('nvpick').classList.contains('nv-warn')"))
    # 5. A:n hidas tallennus, B:tä muokataan samaan aikaan
    await pg.evaluate("__ctl.slow['alfa.md']=2500")
    await edit('nakymat/alfa.md'); await pg.fill('#nved-name','Alfa hidas'); await close()
    await edit('nakymat/beeta.md'); await pg.fill('#nved-name','Beeta uusi')
    ok=await until("(__repo.get('nakymat/alfa.md')||'').indexOf('Alfa hidas')>0",6000)
    await pg.wait_for_timeout(200)
    sel=await pg.evaluate("localStorage.getItem('kaikki:nview')"); val=await pg.input_value('#nved-name')
    want('5 A valmistuu kesken B:n muokkauksen, ei vaihda valintaa',ok and sel=='nakymat/beeta.md' and val=='Beeta uusi',(sel,val))
    await close(); ok=await until("(__repo.get('nakymat/beeta.md')||'').indexOf('Beeta uusi')>0")
    a=await get('nakymat/alfa.md'); bb=await get('nakymat/beeta.md')
    want('5 molemmat oikeisiin tiedostoihin',ok and 'otsikko: Alfa hidas' in a and 'Beeta' not in a and 'otsikko: Beeta uusi' in bb and 'Alfa' not in bb,(a,bb))
    await pg.evaluate("__ctl.slow={}")
    # 6. yhteyskatko, uudelleenlataus, uudelleenyritys ja hylkäys
    await pg.wait_for_timeout(300)
    await pg.evaluate("__ctl.fail=true")
    await edit('nakymat/beeta.md'); await pg.fill('#nved-name','Beeta katko'); await close(); await until("(localStorage.getItem('kaikki:nvpend')||'').indexOf('virhe')>0")
    pend=await pg.evaluate("JSON.parse(localStorage.getItem('kaikki:nvpend')||'[]')")
    want('6 epäonnistunut luonnos säilyy laitteella',len(pend)==1 and pend[0]['st']=='virhe' and pend[0]['D']['name']=='Beeta katko',pend)
    await pg.reload(); await pg.wait_for_timeout(1500)
    await pg.evaluate("__ctl.fail=false")
    await pg.click('#nvpick'); await pg.wait_for_timeout(100)
    st=await pg.evaluate("(document.querySelector('#sortpop .nv-pend')||{}).textContent||''")
    want('6 uudelleenlatauksen jälkeen valikossa: ei tallentunut',('Beeta katko' in st) and ('ei tallentunut' in st),st)
    await pg.click('#sortpop [id$="-retry"]'); ok=await until("(__repo.get('nakymat/beeta.md')||'').indexOf('Beeta katko')>0")
    await pg.wait_for_timeout(300)
    want('6 Yritä uudelleen tallentaa ja tyhjentää jonon',ok and await pg.evaluate("!localStorage.getItem('kaikki:nvpend')"))
    await pg.evaluate("__ctl.fail=true")
    await edit('nakymat/beeta.md'); await pg.fill('#nved-name','Hylätään'); await close(); await until("(localStorage.getItem('kaikki:nvpend')||'').indexOf('virhe')>0")
    await pg.evaluate("__ctl.fail=false")
    await pg.click('#nvpick'); await pg.wait_for_timeout(100); await pg.click('#sortpop [id$="-drop"]'); await pg.wait_for_timeout(500)
    want('6 Hylkää: ei kirjoitusta, jono tyhjä',await pg.evaluate("!localStorage.getItem('kaikki:nvpend')") and 'Hylätään' not in await get('nakymat/beeta.md'))
    # 7. peru
    n0=await puts(); await edit('nakymat/beeta.md'); await pg.fill('#nved-name','Peruttu'); await pg.click('#nved-cancel'); await pg.wait_for_timeout(800)
    want('7 Peru muutokset ei kirjoita',await puts()==n0 and 'Peruttu' not in await get('nakymat/beeta.md'))
    want('ei sivuttaisvieritystä',await pg.evaluate("document.documentElement.scrollWidth<=innerWidth"))
    want('ei sivuvirheitä',not errs,errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((1440,900),(390,844)): bad+=await run(p,w,h)
    print('KAIKKI OK' if not bad else 'VIRHEITÄ: '+', '.join(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
