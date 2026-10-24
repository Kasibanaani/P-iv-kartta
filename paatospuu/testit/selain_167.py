"""Juuri 1.67: listojen ehdot (Emil 23.10.2026). Kierroslistalla: Kun kuitataan → esiin / pois, Jokin / Kaikki näistä,
piilossa kunnes laukeaa, poissulku harmaana loppuun eikä estä valmistumista, Aloita alusta palauttaa, tallennus ja vienti.
Jatkuvalla listalla sama. Leveydet 390 ja 320 px. Käyttö: python3 testit/selain_167.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from apu import tab, menu, tsx
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
K="JSON.parse(localStorage.getItem('paatospuu:v1')).kokonaisuudet[0]"
OVER="""(function(){var w=document.documentElement.clientWidth,out=[];document.querySelectorAll('input,textarea,select,button').forEach(function(e){var r=e.getBoundingClientRect();
 if(r.width&&r.height&&e.offsetParent!==null&&e.type!=='file'&&(r.right>w+0.5||r.left<-0.5))out.push((e.id||e.className||e.tagName)+' '+Math.round(r.left)+'..'+Math.round(r.right));});return JSON.stringify({doc:document.documentElement.scrollWidth<=w,yli:out});})()"""
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h})).new_page()
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond):
        print('  %-48s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    async def fits(label):
        r=json.loads(await pg.evaluate(OVER)); want(label+' mahtuu',r['doc'] and not r['yli'])
    async def pills(rid):
        c=pg.locator('#chlist .crow[data-id="%s"]'%rid)
        if 'open' not in (await c.get_attribute('class')): await c.locator('.chd').click(); await pg.wait_for_timeout(50)
        return await pg.evaluate("Array.prototype.map.call(document.querySelectorAll('#chlist .crow[data-id=\"%s\"] .cpill'),function(b){return b.dataset.tid+(b.classList.contains('ok')?'+':'')+(b.classList.contains('cno')?'-':'');})"%rid)
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(200)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0];
      k.termit=[{id:'ta',name:'Kipu',yes:[],no:[]},{id:'tb',name:'Kuume',yes:[],no:[]},{id:'tc',name:'Lääkäri',yes:[],no:[]},{id:'td',name:'Odotus',yes:[],no:[]},{id:'te',name:'Lepo',yes:[],no:[]}];k.tarkeat=['tc'];
      k.listat=[{id:'L1',name:'Arvio',created:'2026-10-01T00:00:00.000Z'}];
      k.tarkistuslista=[{id:'r1',name:'Oireet',l:'L1',created:'2026-10-02T00:00:00.000Z',it:[{id:'ta'},{id:'tb'}]},{id:'r2',name:'Toimet',l:'L1',created:'2026-10-03T00:00:00.000Z',it:[{id:'tc'},{id:'td'},{id:'te'}]}];
      localStorage.setItem('paatospuu:v1',JSON.stringify(o));localStorage.setItem('paatospuu:lista:'+k.id,'L1');})()""")
    await pg.reload(); await pg.wait_for_timeout(150); await tab(pg,'list'); await pg.wait_for_timeout(60)
    want('ilman ehtoja kaikki näkyvät', sorted(await pills('r2'))==['tc','td','te'])
    # Ehdot käyttöön Listat-ikkunasta
    await pg.click('#chlist-pick'); await pg.wait_for_timeout(60)
    await pg.click('#ws-eh'); want('kytkin päällä', await pg.get_attribute('#ws-eh','aria-checked')=='true'); await pg.wait_for_timeout(60)
    await fits('Listat-ikkuna ehdoilla')
    want('listan ikkunassa ei ehtojen muokkausta', await pg.locator('#ws-ehb').count()==0)
    await pg.click('#wsheet .sx'); await pg.wait_for_timeout(60); await tab(pg,'terms'); await pg.wait_for_timeout(60); await pg.click('#tt-eh'); await pg.wait_for_timeout(80)
    want('ehtojen ikkuna', await pg.is_visible('#ehsheet') and 'Ehdot' in await pg.inner_text('#eh-h'))
    # Ehto 1: Kipu ja Kuume -> esiin Lääkäri, pois Odotus
    await pg.click('#eh-add'); await pg.wait_for_timeout(60)
    want('tärkeät erikseen ensin', await pg.evaluate("document.querySelector('#eh-body .ehps[data-sec=\"k\"] .ehp').dataset.tid")=='tc')
    await fits('Ehdon muokkaus')
    await pg.click('#eh-body .ehps[data-sec="k"] .ehp[data-tid="ta"]'); await pg.click('#eh-body .ehps[data-sec="k"] .ehp[data-tid="tb"]')
    await pg.locator('#eh-ty button:has-text("Kaikki")').click()
    await pg.click('#eh-t'); await pg.wait_for_timeout(30)
    await pg.click('#eh-body .ehps[data-sec="t"] .ehp[data-tid="tc"]'); await pg.wait_for_timeout(30)
    want('Tuo: Lääkäri seurauslaatikossa', await pg.inner_text('#eh-eff .ehc.on')=='Lääkäri')
    await pg.click('#eh-done'); await pg.wait_for_timeout(60)
    # Ehto 2: samat syyt, Poissulkee Odotus
    await pg.click('#eh-add'); await pg.wait_for_timeout(60)
    await pg.click('#eh-body .ehps[data-sec="k"] .ehp[data-tid="ta"]'); await pg.click('#eh-body .ehps[data-sec="k"] .ehp[data-tid="tb"]'); await pg.locator('#eh-ty button:has-text("Kaikki")').click()
    await pg.locator('#eh-verb button:has-text("Poissulkee")').click(); await pg.click('#eh-t'); await pg.wait_for_timeout(30)
    await pg.click('#eh-body .ehps[data-sec="t"] .ehp[data-tid="td"]'); await pg.wait_for_timeout(30)
    want('Poissulkee: Odotus seurauslaatikossa', await pg.inner_text('#eh-eff .ehc.off')=='Odotus')
    if os.environ.get('KUVA'): await pg.screenshot(path=os.environ['KUVA']+'/eh1_%d.png'%w)
    await pg.click('#eh-done'); await pg.wait_for_timeout(60)
    if os.environ.get('KUVA'): await pg.screenshot(path=os.environ['KUVA']+'/eh2_%d.png'%w)
    t=await pg.inner_text('#eh-body')
    want('yhteenveto', 'Kipu ja Kuume' in t and 'tuo Lääkäri' in t and 'poissulkee Odotus' in t)
    await fits('Ehtojen yhteenveto')
    await pg.click('#ehsheet .sx'); await pg.wait_for_timeout(80); await tab(pg,'list'); await pg.wait_for_timeout(60)
    E=json.loads(await pg.evaluate("JSON.stringify("+K+")"))
    want('tallennus: projektin ehdot, listalla kytkin', E['listat'][0].get('eh')==1 and 'ehdot' not in E['listat'][0] and E['ehdot'][0]['k']==['ta','tb'] and E['ehdot'][0].get('all')==1 and E['ehdot'][0]['on']==['tc'] and E['ehdot'][1]['off']==['td'] and E['ehdot'][1]['k']==['ta','tb'])
    want('esiin tuotava piilossa alussa', sorted(await pills('r2'))==['td','te'])
    # Kipu kuitattu: ei vielä (Kaikki näistä)
    await pills('r1'); await pg.locator('#chlist .crow[data-id="r1"] .cpill[data-tid="ta"]').click(); await pg.wait_for_timeout(60)
    want('yksi laukaisija ei riitä (kaikki)', sorted(await pills('r2'))==['td','te'])
    await pills('r1'); await pg.locator('#chlist .crow[data-id="r1"] .cpill[data-tid="tb"]').click(); await pg.wait_for_timeout(60)
    P=await pills('r2')
    if os.environ.get('KUVA'): await pg.screenshot(path=os.environ['KUVA']+'/eh3_%d.png'%w)
    want('molemmat: Lääkäri esiin, Odotus pois harmaana loppuun', P==['tc','te','td-'])
    want('poissuljettua ei lasketa kuittaamattomaksi', '2 kuittaamatta' in await pg.inner_text('#chlist .crow[data-id="r2"] .cs'))
    await pills('r2'); await pg.locator('#chlist .crow[data-id="r2"] .cpill[data-tid="tc"]').click(); await pg.wait_for_timeout(50)
    await pills('r2'); await pg.locator('#chlist .crow[data-id="r2"] .cpill[data-tid="te"]').click(); await pg.wait_for_timeout(60)
    want('poissuljettu ei estä valmistumista', await pg.evaluate("document.querySelector('#chlist .crow[data-id=\"r2\"]').classList.contains('due')")==False)
    # Lopeta-muistiinpano ei luettele poissuljettua hoidettavaksi
    await pg.click('#chk-end'); await pg.wait_for_timeout(80)
    note=await pg.evaluate(K+".muistiinpanot[0].text")
    want('lopetus: poissuljettu ei hoidettavissa', 'Hoidettavat' not in note and 'Odotus' not in note)
    want('alusta: Lääkäri taas piilossa', sorted(await pills('r2'))==['td','te'])
    # Ehdot pois -> kaikki näkyvät
    await pg.click('#chlist-pick'); await pg.wait_for_timeout(50); await pg.click('#ws-eh'); await pg.wait_for_timeout(50); await pg.click('#wsheet .sx'); await pg.wait_for_timeout(60)
    want('ehdot pois: kaikki näkyvät, ehdot säilyvät', sorted(await pills('r2'))==['tc','td','te'] and len(await pg.evaluate("JSON.parse(JSON.stringify("+K+".ehdot))"))==2)
    # Jatkuva lista: sama, tallennus projektin jatkuvalista-kenttään
    await pg.click('#chlist-pick'); await pg.wait_for_timeout(50); await pg.locator('#ws-list .row[data-l=""]').click(); await pg.wait_for_timeout(60)
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0];k.tarkistuslista.push({id:'j1',name:'Arki',created:'2026-10-01T00:00:00.000Z',it:[{id:'ta'},{id:'te'}]});
      k.jatkuvalista={eh:1,ehdot:[{id:'e1',k:['ta'],on:['te'],off:[]}]};k.tarkistuslista.push({id:'j2',name:'Toinen',created:'2026-10-01T00:00:00.000Z',it:[{id:'tc'},{id:'td'}]});localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()""")
    await pg.reload(); await pg.wait_for_timeout(150); await tab(pg,'list'); await pg.wait_for_timeout(60)
    want('jatkuva: piilossa', await pills('j1')==['ta'])
    await pills('j1'); await pg.locator('#chlist .crow[data-id="j1"] .cpill[data-tid="ta"]').click(); await pg.wait_for_timeout(60)
    want('jatkuva: kuittaus tuo esiin', sorted(await pills('j1'))==['ta+','te'])
    want('vanhan muodon ehdot yhdistyvät projektiin', await pg.evaluate(K+".jatkuvalista.eh")==1 and await pg.evaluate(K+".ehdot.length")==3 and await pg.evaluate("!"+K+".jatkuvalista.ehdot"))
    want('sama ehto pätee toisellakin listalla', await pills('j2')==['td'])
    # Uusi asiasana ehtojen ikkunasta, myös Asiasanat-ikkunan kautta
    await tab(pg,'terms'); await pg.wait_for_timeout(60); await pg.click('#tt-eh'); await pg.wait_for_timeout(80)
    want('Asiasanat-ikkunasta Ehdot', await pg.is_visible('#ehsheet') and await pg.locator('#eh-body .ehr[data-eh]').count()==3)
    await pg.click('#eh-add'); await pg.wait_for_timeout(50); await pg.fill('#eh-new','Kuvaus*'); await pg.click('#eh-newb'); await pg.wait_for_timeout(80)
    nid=await pg.evaluate(K+".termit.filter(function(t){return t.name==='Kuvaus';})[0].id")
    # 1.79: uusi asiasana valitaan samalla avoimeen laatikkoon
    want('uusi asiasana tärkeäksi ja valituksi', await pg.get_attribute('#eh-body .ehps[data-sec="k"] .ehp[data-tid="%s"]'%nid,'aria-pressed')=='true' and nid in await pg.evaluate("JSON.parse(JSON.stringify("+K+".tarkeat))"))
    await pg.click('#eh-done'); await pg.wait_for_timeout(50); await pg.click('#ehsheet .sx'); await pg.wait_for_timeout(60)
    want('ehto tallentui', await pg.evaluate(K+".ehdot.length")==4)
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640)): bad+=await run(p,w,h)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
