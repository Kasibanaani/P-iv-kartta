"""Juuri 1.88 (Emil 25.10.2026): kerrosmallin näkyvät osat.
A: toistuvan kohteen napissa ohut kiertonuoli, kertakohteessa ei. B: listan kytkin tuo tänään ja myöhässä olevat muistiinpanot riveiksi
(kohde Tänään/Myöhässä, kuittaus vain sen päivän ajankohtaan, kuitattu jää pohjalle, ei kahdesti). C: kalenterin kuitattu vihreillä reunoilla ja ruksilla.
D: kierroslistan Lopeta-muistiinpano kuten päätöspuun kierros (Valinnat, ehtojen tekstit kappaleina). Leveydet 390 ja 320 px. Käyttö: python3 testit/selain_188.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from apu import tab, menu
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
K="JSON.parse(localStorage.getItem('paatospuu:v1')).kokonaisuudet[0]"
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h})).new_page()
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond):
        print('  %-48s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    async def opn(rid):
        c=pg.locator('#chlist .crow[data-id="%s"]'%rid)
        if 'open' not in (await c.get_attribute('class')): await c.locator('.chd').click(); await pg.wait_for_timeout(60)
    async def rows(): return await pg.evaluate("Array.prototype.map.call(document.querySelectorAll('#chlist .crow'),function(c){return c.dataset.id;})")
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(200)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0],t=new Date().toISOString();
      k.termit=[{id:'tk',name:'Kastelu',yes:[],no:[],ev:7},{id:'tl',name:'Pakkaus',yes:[],no:[]}];
      k.muistiinpanot=[{id:'n1',created:t,edited:t,text:'Soita Liisalle\\ntänään klo 10',date:''},{id:'n2',created:t,edited:t,text:'Laskut 20.10.2026',date:''},
        {id:'n3',created:t,edited:t,text:'Kauppa tänään',date:''},{id:'n4',created:t,edited:t,text:'Ei päivää',date:''}];
      k.tarkistuslista=[{id:'r1',name:'Koti',nid:'n3',created:t,edited:t,it:[{id:'tk'},{id:'tl'}]}];
      localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()""")
    await pg.reload(); await pg.wait_for_timeout(250)
    await tab(pg,'list'); await pg.wait_for_timeout(150)
    want('ilman kytkintä ei muistiinpanorivejä', await rows()==['r1'])
    # A: kiertonuoli
    await opn('r1')
    want('toistuvassa kiertonuoli', await pg.locator('#chlist .crow[data-id="r1"] .cpill[data-tid="tk"] .crep').count()==1)
    want('kertakohteessa ei merkkiä', await pg.locator('#chlist .crow[data-id="r1"] .cpill[data-tid="tl"] .crep').count()==0)
    want('ääneen: toistuva', ', toistuva' in (await pg.get_attribute('#chlist .crow[data-id="r1"] .cpill[data-tid="tk"]','aria-label') or ''))
    await opn('r1'); await pg.locator('#chlist .crow[data-id="r1"] .chd').click(); await pg.wait_for_timeout(60)
    # B: kytkin
    await pg.click('#chlist-pick'); await pg.wait_for_timeout(120)
    want('kytkin oletuksena pois', await pg.get_attribute('#ws-mu','aria-checked')=='false')
    await pg.click('#ws-mu'); await pg.wait_for_timeout(60)
    want('kytkin päälle', await pg.get_attribute('#ws-mu','aria-checked')=='true')
    await pg.click('#ws-list .row[data-l=""]'); await pg.wait_for_timeout(150)
    R=await rows()
    want('tänään ja myöhässä riveiksi, ei kahdesti', 'mu:n1' in R and 'mu:n2' in R and 'mu:n3' not in R and 'mu:n4' not in R)
    want('nimenä ensimmäinen rivi ja merkki', (await pg.inner_text('#chlist .crow[data-id="mu:n1"] .cn')).replace('\n',' ').startswith('Soita Liisalle') and await pg.locator('#chlist .crow[data-id="mu:n1"] .cmu').count()==1)
    want('tallentuu listalle', json.loads(await pg.evaluate("JSON.stringify(%s.jatkuvalista||null)"%K)) =={'mu':1})
    await opn('mu:n1')
    pl=await pg.evaluate("Array.prototype.map.call(document.querySelectorAll('#chlist .crow[data-id=\"mu:n1\"] .cpill'),function(b){return b.dataset.tid;})")
    want('kohde Tänään, ei Muokkaa-nappia', pl==['z:today'] and await pg.locator('#chlist .crow[data-id="mu:n1"] .cedit').count()==0)
    await opn('mu:n2')
    want('myöhässä olevan kohde Myöhässä', await pg.locator('#chlist .crow[data-id="mu:n2"] .cpill[data-tid="z:late"]').count()==1)
    ta=pg.locator('#chlist .crow[data-id="mu:n1"] textarea')
    await ta.fill('Soita Liisalle ja Mikolle\ntänään klo 10'); await ta.dispatch_event('change'); await pg.wait_for_timeout(120)
    want('teksti muokattavissa', 'Mikolle' in await pg.evaluate("%s.muistiinpanot.filter(function(n){return n.id==='n1';})[0].text"%K))
    if os.environ.get('KUVA'): await pg.screenshot(path=os.environ['KUVA']+'/e188a_%d.png'%w)
    await pg.locator('#chlist .crow[data-id="mu:n1"] .cpill[data-tid="z:today"]').click(); await pg.wait_for_timeout(150)
    pts=json.loads(await pg.evaluate("JSON.stringify(%s.muistiinpanot.filter(function(n){return n.id==='n1';})[0].pts||{})"%K))
    td=await pg.evaluate("(function(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);})()")
    want('kuittaa vain sen päivän ajankohdan', list(pts.keys())==[td+' 10:00'])
    for rid in list(await rows()):
        c=pg.locator('#chlist .crow[data-id="%s"]'%rid)
        if 'open' in (await c.get_attribute('class')): await c.locator('.chd').click(); await pg.wait_for_timeout(60)
    await pg.wait_for_timeout(700)
    R=await rows()
    want('kuitattu jää pohjalle', R[-1]=='mu:n1' and 'kuitattu tänään' in await pg.inner_text('#chlist .crow[data-id="mu:n1"] .cs'))
    # C: kalenterissa vihreä reuna ja ruksi
    await tab(pg,'cal'); await pg.wait_for_timeout(200)
    want('kalenterissa kuitattu ruksilla', await pg.locator('#timeline .ev.done .okm').count()>=1)
    bs=await pg.evaluate("(function(){var e=document.querySelector('#timeline .ev.done');var s=getComputedStyle(e);return [s.borderTopWidth,s.textDecorationLine];})()")
    want('reunat, ei yliviivausta', bs[0]=='2px' and 'line-through' not in bs[1])
    # Peruutus listalta: kuitattu rivi auki, napautus peruu
    await tab(pg,'list'); await pg.wait_for_timeout(150); await opn('mu:n1')
    await pg.locator('#chlist .crow[data-id="mu:n1"] .cpill[data-tid="z:today"]').click(); await pg.wait_for_timeout(150)
    want('napautus peruu kuittauksen', await pg.evaluate("!%s.muistiinpanot.filter(function(n){return n.id==='n1';})[0].pts"%K))
    want('mahtuu leveyteen', await pg.evaluate("(function(){var W=document.documentElement.clientWidth,o=0;document.querySelectorAll('#chlist button').forEach(function(e){var r=e.getBoundingClientRect();if(r.width&&r.right>W+.5)o++;});return o;})()")==0)
    await pg.reload(); await pg.wait_for_timeout(250); await tab(pg,'list'); await pg.wait_for_timeout(150)
    want('kytkin säilyy latauksessa', 'mu:n1' in await rows())
    # D: kierroslistan Lopeta
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0],t=new Date();
      function at(n){return new Date(t.getTime()-n*60000).toISOString();}
      k.listat=[{id:'L1',name:'Arvio',created:at(99),eh:1}];k.ehdot=[{id:'e1',k:['tl'],on:['q:Muista kuitti'],off:[]}];
      k.tarkistuslista=k.tarkistuslista.concat([{id:'k1',name:'Kassi',l:'L1',created:at(99),it:[{id:'tl',ok:at(5)},{id:'tk',ok:at(9)}]}]);
      localStorage.setItem('paatospuu:v1',JSON.stringify(o));localStorage.setItem('paatospuu:lista:'+k.id,'L1');})()""")
    await pg.reload(); await pg.wait_for_timeout(250); await tab(pg,'list'); await pg.wait_for_timeout(150)
    await pg.click('#chk-end'); await pg.wait_for_timeout(150)
    tx=await pg.evaluate(K+".muistiinpanot[0].text")
    want('Lopeta: valinnat kuittausjärjestyksessä', tx.startswith('Arvio\nValinnat: Kastelu → Pakkaus\nKunnossa: Kassi'))
    want('Lopeta: ehtojen teksti kappaleena', tx.endswith('\n\nMuista kuitti') and 'Ilmoitukset:' not in tx)
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640)): bad+=await run(p,w,h)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
