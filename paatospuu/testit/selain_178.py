"""Juuri 1.78: ehdot laatikkoina (Emil 24.10.2026). Syylaatikko (Jokin / Kaikki / Poissulkevat) ylhäällä, välissä Tuo / Poissulkee,
seurauslaatikko alla. Ryhmä ja aikasana syynä, ryhmän oma Jokin/Kaikki, ryhmä rivillä toteamuksena (vain muualla olemattomat jäsenet).
Suora ristiriita estetään, kaksoiskappale poistuu, muut huomautuksena. Leveydet 390 ja 320 px. Käyttö: python3 testit/selain_178.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from apu import tab, menu, tsx
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
K="JSON.parse(localStorage.getItem('paatospuu:v1')).kokonaisuudet[0]"
OVER="""(function(){var w=document.documentElement.clientWidth,out=[];document.querySelectorAll('input,textarea,select,button').forEach(function(e){var r=e.getBoundingClientRect();
 if(r.width&&r.height&&e.offsetParent!==null&&(r.right>w+0.5||r.left<-0.5))out.push(e.id||e.className||e.tagName);});return JSON.stringify(out);})()"""
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h})).new_page()
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond):
        print('  %-48s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    async def pills(rid):
        c=pg.locator('#chlist .crow[data-id="%s"]'%rid)
        if 'open' not in (await c.get_attribute('class')): await c.locator('.chd').click(); await pg.wait_for_timeout(50)
        return await pg.evaluate("Array.prototype.map.call(document.querySelectorAll('#chlist .crow[data-id=\"%s\"] .cpill'),function(b){return b.dataset.tid+(b.classList.contains('ok')?'+':'')+(b.classList.contains('cno')?'-':'');})"%rid)
    async def close(rid):
        c=pg.locator('#chlist .crow[data-id="%s"]'%rid)
        if 'open' in (await c.get_attribute('class')): await c.locator('.chd').click(); await pg.wait_for_timeout(50)
    k_=lambda sel: pg.click('#eh-body .ehps[data-sec="k"] .ehp[data-tid="%s"]'%sel)
    t_=lambda sel: pg.click('#eh-body .ehps[data-sec="t"] .ehp[data-tid="%s"]'%sel)
    toast=lambda: pg.inner_text('#undo-t')
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(200)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0];
      k.termit=[{id:'ta',name:'Kipu',yes:[],no:[]},{id:'tb',name:'Kuume',yes:[],no:[]},{id:'tc',name:'Lääkäri',yes:[],no:[]},{id:'td',name:'Lepo',yes:[],no:[]},{id:'te',name:'Lenkki',yes:[],no:[]}];
      k.ryhmat=[{id:'G',name:'Oireet',m:['ta','tb']}];k.listat=[{id:'L1',name:'Arvio',created:'2026-10-01T00:00:00.000Z',eh:1}];
      k.tarkistuslista=[{id:'r1',name:'Yleisvointi',l:'L1',g:['G'],created:'2026-10-01T00:00:00.000Z',it:[]},{id:'r2',name:'Kipuarvio',l:'L1',created:'2026-10-02T00:00:00.000Z',it:[{id:'ta'}]},
        {id:'r3',name:'Toimet',l:'L1',created:'2026-10-03T00:00:00.000Z',it:[{id:'tc'},{id:'td'},{id:'te'}]}];
      localStorage.setItem('paatospuu:v1',JSON.stringify(o));localStorage.setItem('paatospuu:lista:'+k.id,'L1');})()""")
    await pg.reload(); await pg.wait_for_timeout(200); await tab(pg,'terms'); await pg.wait_for_timeout(60); await pg.click('#tt-eh'); await pg.wait_for_timeout(250)
    # Ehto 1: #Oireet -> Tuo Lääkäri
    await pg.click('#eh-add'); await pg.wait_for_timeout(60)
    secs=await pg.evaluate("Array.prototype.map.call(document.querySelectorAll('#eh-pick .ehsub'),function(e){return e.textContent;})")
    want('syyn valinnassa ryhmät ja aika', 'Ryhmät' in secs and any(s.startswith('Aika') for s in secs))
    await k_('G'); await pg.wait_for_timeout(30)
    want('ryhmä syylaatikossa', (await pg.inner_text('#eh-cause .ehchips')).startswith('Oireet'))
    await pg.click('#eh-t'); await pg.wait_for_timeout(40)
    secs=await pg.evaluate("Array.prototype.map.call(document.querySelectorAll('#eh-pick .ehsub'),function(e){return e.textContent;})")
    want('seurauksen valinnassa vain asiasanat', 'Ryhmät' not in secs and not any(s.startswith('Aika') for s in secs) and await pg.locator('#eh-pick .ehps[data-sec="k"]').count()==0)
    await t_('tc'); await pg.wait_for_timeout(30)
    g=await pg.evaluate("""(function(){var a=document.getElementById('eh-cause').getBoundingClientRect(),v=document.getElementById('eh-verb').getBoundingClientRect(),t=document.getElementById('eh-eff').getBoundingClientRect();return [a.bottom<=v.top+1,v.bottom<=t.top+1,Math.abs(a.left-t.left)<2];})()""")
    want('laatikot pystysuunnassa: syy, Tuo/Poissulkee, seuraus', all(g))
    want('mahtuu', json.loads(await pg.evaluate(OVER))==[])
    if os.environ.get('KUVA'): await pg.screenshot(path=os.environ['KUVA']+'/e178a_%d.png'%w)
    await pg.click('#eh-done'); await pg.wait_for_timeout(60)
    # Ehto 2: Poissulkevat Lepo, Lenkki
    await pg.click('#eh-add'); await pg.wait_for_timeout(60); await pg.locator('#eh-ty button:has-text("Poissulkevat")').click(); await pg.wait_for_timeout(30)
    want('Poissulkevat: ei seurauslaatikkoa, ei ryhmiä', await pg.locator('#eh-eff').count()==0 and await pg.locator('#eh-verb').count()==0 and await pg.locator('#eh-pick .ehp[data-tid="G"]').count()==0)
    await k_('td'); await k_('te'); await pg.wait_for_timeout(30); await pg.click('#eh-done'); await pg.wait_for_timeout(60)
    t=await pg.inner_text('#eh-body')
    want('yhteenveto: numero, syy, seuraus', '#Oireet' in t and 'tuo Lääkäri' in t and 'Poissulkevat' in t and 'Lepo · Lenkki' in t)
    # Suora ristiriita: samat syyt tuovat ja vievät Lääkärin
    await pg.click('#eh-add'); await pg.wait_for_timeout(60); await k_('G'); await pg.locator('#eh-verb button:has-text("Poissulkee")').click(); await pg.click('#eh-t'); await pg.wait_for_timeout(30)
    await t_('tc'); await pg.wait_for_timeout(60)
    E=json.loads(await pg.evaluate("JSON.stringify("+K+".ehdot)"))
    want('suora ristiriita estetään ja kerrotaan', 'Ristiriita' in await toast() and E[2]['off']==[] and await pg.locator('#eh-eff .ehc').count()==0)
    # Eri syy: sallitaan, huomautus
    await pg.click('#eh-k'); await pg.wait_for_timeout(30); await k_('G'); await k_('tb'); await pg.click('#eh-t'); await pg.wait_for_timeout(30); await t_('tc'); await pg.wait_for_timeout(60)
    want('eri syillä sallitaan', json.loads(await pg.evaluate("JSON.stringify("+K+".ehdot)"))[2]['off']==['tc'])
    nt=await pg.locator('#eh-body .ehnote').all_inner_texts()
    want('huomautus toisesta ehdosta', len(nt)==1 and 'Ehto 1 tuo Lääkäri esiin' in nt[0])
    await pg.click('#eh-body .ehnote'); await pg.wait_for_timeout(60)
    want('huomautus avaa ehdon 1', (await pg.inner_text('#eh-cause .ehchips')).startswith('Oireet') and await pg.inner_text('#eh-eff .ehc')=='Lääkäri')
    await pg.click('#eh-done'); await pg.wait_for_timeout(40)
    want('yhteenvedossa huomautus', '1 huomautus' in await pg.inner_text('#eh-body .ehr[data-eh]:nth-child(1)'))
    await pg.locator('#eh-body .ehr[data-eh]').nth(2).click(); await pg.wait_for_timeout(40)
    await pg.click('#eh-del'); await pg.wait_for_timeout(40); await pg.locator('#ehsheet .delbox button:has-text("Poista")').last.click(); await pg.wait_for_timeout(60)
    # Poissulkevan jäsen ei saa tuoda toista
    await pg.click('#eh-add'); await pg.wait_for_timeout(60); await k_('td'); await pg.click('#eh-t'); await pg.wait_for_timeout(30); await t_('te'); await pg.wait_for_timeout(60)
    want('poissulkevat estävät tuonnin', 'poissulkevia' in await toast() and await pg.locator('#eh-eff .ehc').count()==0)
    await pg.click('#eh-del'); await pg.wait_for_timeout(40); await pg.locator('#ehsheet .delbox button:has-text("Poista")').last.click(); await pg.wait_for_timeout(60)
    # Kaksoiskappale poistuu
    await pg.click('#eh-add'); await pg.wait_for_timeout(60); await pg.locator('#eh-ty button:has-text("Poissulkevat")').click(); await k_('te'); await k_('td'); await pg.click('#eh-done'); await pg.wait_for_timeout(60)
    want('kaksoiskappale ei tallennu', 'Sama ehto on jo' in await toast() and len(json.loads(await pg.evaluate("JSON.stringify("+K+".ehdot)")))==2)
    await pg.click('#ehsheet .sx'); await pg.wait_for_timeout(80)
    # Lista: ryhmä toteamuksena, ryhmä syynä, Poissulkevat
    await tab(pg,'list'); await pg.wait_for_timeout(80)
    want('ryhmärivillä vain muualla olemattomat jäsenet', await pills('r1')==['tb'])
    want('toteamus: jokin · ei vielä', 'jokin · ei vielä' in await pg.inner_text('#chlist .crow[data-id="r1"] .cgrp'))
    want('Lääkäri piilossa', sorted(await pills('r3'))==['td','te'])
    await close('r1'); await close('r3')
    await pills('r2'); await pg.locator('#chlist .crow[data-id="r2"] .cpill[data-tid="ta"]').click(); await pg.wait_for_timeout(80); await close('r2'); await pg.wait_for_timeout(80)
    await pills('r1')
    want('ryhmä toteutuu toisen rivin kuittauksesta', 'toteutunut' in await pg.inner_text('#chlist .crow[data-id="r1"] .cgrp'))
    want('ryhmä syynä tuo Lääkärin', 'tc' in await pills('r3'))
    await pg.locator('#chlist .crow[data-id="r3"] .cpill[data-tid="td"]').click(); await pg.wait_for_timeout(80)
    P=await pills('r3')
    want('Poissulkevat: Lepo kuitattu, Lenkki pois', 'td+' in P and 'te-' in P)
    if os.environ.get('KUVA'): await pg.screenshot(path=os.environ['KUVA']+'/e178b_%d.png'%w)
    await close('r1'); await close('r3')
    # Ryhmän oma sääntö: Kaikki
    await tab(pg,'terms'); await pg.wait_for_timeout(60); await pg.locator('#grplist .row[data-id="G"]').click(); await pg.wait_for_timeout(120)
    await pg.locator('#g-all button:has-text("Kaikki")').click(); await pg.wait_for_timeout(30); await pg.click('#gok'); await tsx(pg); await pg.wait_for_timeout(60)
    want('ryhmän sääntö tallentuu', await pg.evaluate(K+".ryhmat[0].all")==1)
    await tab(pg,'list'); await pg.wait_for_timeout(80)
    await pills('r1')
    want('Kaikki: ei vielä, Lääkäri taas piilossa', 'kaikki · ei vielä' in await pg.inner_text('#chlist .crow[data-id="r1"] .cgrp') and 'tc' not in await pills('r3'))
    await close('r3')
    # Toteamusrivi: kaikki jäsenet muilla riveillä
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0];k.tarkistuslista.push({id:'r4',name:'Kuumearvio',l:'L1',created:'2026-10-04T00:00:00.000Z',it:[{id:'tb'}]});
      localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()""")
    await pg.reload(); await pg.wait_for_timeout(200); await tab(pg,'list'); await pg.wait_for_timeout(80)
    want('toteamusrivi odottaa', await pills('r1')==[] and 'odottaa' in await pg.inner_text('#chlist .crow[data-id="r1"] .cs'))
    await close('r1'); await pills('r4'); await pg.locator('#chlist .crow[data-id="r4"] .cpill[data-tid="tb"]').click(); await pg.wait_for_timeout(80); await close('r4'); await pg.wait_for_timeout(80)
    want('toteamusrivi toteutuu', 'toteutunut' in await pg.inner_text('#chlist .crow[data-id="r1"] .cs') and 'tc' in await pills('r3'))
    await close('r3')
    # Aikasana syynä jatkuvalla listalla
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0],d=new Date(),iso=d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);
      k.muistiinpanot=[{id:'n1',created:'2026-10-20T08:00:00.000Z',edited:'2026-10-20T08:00:00.000Z',teksti:'Soita',text:'Soita',paiva:iso,date:iso}];
      k.tarkistuslista.push({id:'j1',name:'Soita',nid:'n1',created:'2026-10-01T00:00:00.000Z',it:[{id:'ta'}]},{id:'j2',name:'Muuta',created:'2026-10-01T00:00:00.000Z',it:[{id:'tb'},{id:'td'}]});
      k.jatkuvalista={eh:1};k.ehdot.push({id:'ez',k:['z:today'],on:['td'],off:[]},{id:'ew',k:['z:tomorrow'],on:['te'],off:[]});k.tarkistuslista[3].it.push({id:'te'});
      localStorage.setItem('paatospuu:v1',JSON.stringify(o));localStorage.removeItem('paatospuu:lista:'+k.id);})()""")
    await pg.reload(); await pg.wait_for_timeout(200); await tab(pg,'list'); await pg.wait_for_timeout(80)
    P=await pills('j2')
    want('Tänään syynä tuo, Huomenna ei', 'td' in P and 'te' not in P)
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640)): bad+=await run(p,w,h)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
