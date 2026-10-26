"""Juuri 1.91 (Emil 26.10.2026): muistiinpano jakautuu teksteihin erottimella --- (omalla rivillä tai kesken tekstin). Ajat ja asiasanat
teksti kerrallaan, kalenterimerkintä ja listan muistiinpanorivi näyttävät vain oman tekstinsä. Leveydet 390 ja 320 px. Käyttö: python3 testit/selain_191.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from apu import tab
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
    print('leveys',w)
    await pg.clock.install(time='2026-10-26T09:00:00+02:00')
    await pg.goto(U); await pg.wait_for_timeout(300)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0],t='2026-10-26T06:00:00.000Z';
      k.muistiinpanot=[{id:'n1',created:t,edited:t,text:'Kauppa: maito ja leipä\\n---\\nHammaslääkäri tänään klo 14\\n---\\nSoita Liisalle tänään',date:''}];
      k.tarkistuslista=[{id:'r1',name:'Liisa',men:true,created:t,edited:t,it:[]}];k.jatkuvalista={mu:1};localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()""")
    await pg.reload(); await pg.wait_for_timeout(300); await tab(pg,'list'); await pg.wait_for_timeout(200)
    ids=await pg.evaluate("Array.prototype.map.call(document.querySelectorAll('#chlist .crow'),function(r){return r.dataset.id;})")
    want('muistiinpanorivi per teksti, ei päivätöntä', 'mu:n1:1' in ids and 'mu:n1:2' in ids and 'mu:n1:0' not in ids and 'mu:n1' not in ids)
    want('rivin nimenä oman tekstin alku', (await pg.inner_text('#chlist .crow[data-id="mu:n1:1"] .cn')).startswith('Hammaslääkäri') and (await pg.inner_text('#chlist .crow[data-id="mu:n1:2"] .cn')).startswith('Soita Liisalle'))
    want('Mainittu vain Liisan tekstistä', 'Soita Liisalle' in (await pg.inner_text('#chlist .crow[data-id="r1"]')) and 'Hammas' not in (await pg.inner_text('#chlist .crow[data-id="r1"]')))
    await pg.locator('#chlist .crow[data-id="mu:n1:1"] .cpill').first.click(); await pg.wait_for_timeout(200)
    pts=json.loads(await pg.evaluate("JSON.stringify(%s.muistiinpanot[0].pts||{})"%K))
    want('kuittaus vain oman tekstin aikaan', list(pts.keys())==['2026-10-26 14:00'])
    want('toinen teksti yhä kuittaamatta', 'kuitattu' not in await pg.inner_text('#chlist .crow[data-id="mu:n1:2"]'))
    # Avattu rivi: vain oma teksti, muutos kirjoittuu oikeaan kohtaan
    await pg.locator('#chlist .crow[data-id="mu:n1:2"] .chd').click(); await pg.wait_for_timeout(120)
    ta=pg.locator('#chlist .crow[data-id="mu:n1:2"] textarea.cta')
    want('avattuna vain oma teksti', await ta.input_value()=='Soita Liisalle tänään')
    await ta.fill('Soita Liisalle ja Pekalle tänään'); await ta.dispatch_event('change'); await pg.wait_for_timeout(200)
    txt=await pg.evaluate("%s.muistiinpanot[0].text"%K)
    want('muutos oman tekstin kohdalle', txt=='Kauppa: maito ja leipä\n---\nHammaslääkäri tänään klo 14\n---\nSoita Liisalle ja Pekalle tänään')
    # Kalenteri: merkinnässä vain oma teksti
    await tab(pg,'cal'); await pg.wait_for_timeout(250)
    ev=await pg.evaluate("Array.prototype.map.call(document.querySelectorAll('#timeline .ev b'),function(e){return e.textContent;})")
    want('kalenterimerkintä näyttää oman tekstinsä', ev==['Hammaslääkäri'])
    body=await pg.inner_text('body')
    want('ajaton teksti omana sirunaan', 'Soita Liisalle ja Pekalle' in body and 'Kauppa' not in body)
    # Erottimen poisto: kuittaus säilyy, koska se on avattu ajasta
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0];k.muistiinpanot[0].text=k.muistiinpanot[0].text.split('\\n---\\n').join('\\n');localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()""")
    await pg.reload(); await pg.wait_for_timeout(300); await tab(pg,'cal'); await pg.wait_for_timeout(250)
    want('erottimen poisto: kuittaus säilyy', await pg.locator('#timeline .ev.done').count()==1)
    want('ilman erotinta koko muistiinpano yhtenä', await pg.evaluate("document.querySelector('#timeline .ev b').textContent")=='Kauppa: maito ja leipä')
    # Viikonpäivät aikasanoina: Ehtojen valitsimessa oma osio
    await tab(pg,'terms'); await pg.wait_for_timeout(200)
    want('viikonpäivän nimi', await pg.evaluate("typeof timeName==='function'&&timeName('z:5')==='Perjantai'"))
    await pg.click('#tt-eh'); await pg.wait_for_timeout(250); await pg.click('#eh-add'); await pg.wait_for_timeout(80)
    secs=await pg.evaluate("Array.prototype.map.call(document.querySelectorAll('#eh-pick .ehsub'),function(e){return e.textContent;})")
    want('syyn valinnassa Viikonpäivät', 'Viikonpäivät' in secs and await pg.locator('#eh-pick .ehp[data-tid="z:5"]').count()==1)
    await pg.locator('#eh-pick .ehp[data-tid="z:5"]').click(); await pg.wait_for_timeout(60)
    want('perjantai syylaatikossa', (await pg.inner_text('#eh-cause .ehchips')).startswith('Perjantai'))
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640)): bad+=await run(p,w,h)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
