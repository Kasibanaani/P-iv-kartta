"""Juuri 1.90 (Emil 26.10.2026): muistiinpanon Ajankohdat allekkain tekstin kokoisina, muotoiltu aika ensin ja kirjoitettu muoto suluissa,
jokaisella rivillä oma kuittausnappi myös tulevalle päivälle (sama kuittaus kuin kalenterissa). Leveydet 390 ja 320 px. Käyttö: python3 testit/selain_190.py"""
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
    print('leveys',w)
    await pg.clock.install(time='2026-10-26T09:00:00+02:00')
    await pg.goto(U); await pg.wait_for_timeout(300)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0],t='2026-10-22T08:00:00.000Z';
      k.muistiinpanot=[{id:'n1',created:t,edited:t,text:'Hammaslääkäri 28.10. tai 29.10.26\\n30.10. klo 10 ja 30.10. klo 12',date:'2026-10-22'}];localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()""")
    await pg.reload(); await pg.wait_for_timeout(300); await tab(pg,'notes'); await pg.wait_for_timeout(150)
    await pg.locator('#nlist .ncard').first.click(); await pg.wait_for_timeout(250)
    R=await pg.evaluate("Array.prototype.map.call(document.querySelectorAll('#ns-dlist .drow'),function(r){return r.querySelector('i').innerText;})")
    want('ajankohdat allekkain omina riveinään', len(R)==5)
    want('muotoiltu ensin, kirjoitettu suluissa', R[0].startswith('ke 28.10.2026 (28.10.)') and any(r.startswith('pe 30.10.2026 klo 10.00 (30.10. klo 10)') for r in R))
    want('jokaisella rivillä kuittausnappi', await pg.locator('#ns-dlist .drow button.dck').count()==5)
    fs=await pg.evaluate("parseFloat(getComputedStyle(document.querySelector('#ns-dlist .drow i')).fontSize)")
    want('tekstin kokoinen (16 px)', fs==16)
    rows=pg.locator('#ns-dlist .drow')
    await rows.nth(0).locator('.dck').click(); await pg.wait_for_timeout(150)
    pts=json.loads(await pg.evaluate("JSON.stringify(%s.muistiinpanot[0].pts||{})"%K))
    want('tuleva päivä kuittautuu', list(pts.keys())==['2026-10-28'])
    want('nappi kuitatuksi', await pg.get_attribute('#ns-dlist .drow:nth-child(1) .dck','aria-pressed')=='true' and await pg.locator('#ns-dlist .drow:nth-child(1) .dck svg').count()==1)
    i10=[i for i,r in enumerate(R) if 'klo 10.00' in r][0]
    await rows.nth(i10).locator('.dck').click(); await pg.wait_for_timeout(150)
    pts=json.loads(await pg.evaluate("JSON.stringify(%s.muistiinpanot[0].pts||{})"%K))
    want('kellonajan kohta kuittautuu erikseen', sorted(pts.keys())==['2026-10-28','2026-10-30 10:00'])
    await rows.nth(0).locator('.dck').click(); await pg.wait_for_timeout(150)
    want('toinen napautus peruu', sorted(json.loads(await pg.evaluate("JSON.stringify(%s.muistiinpanot[0].pts||{})"%K)).keys())==['2026-10-30 10:00'])
    want('kellonaika avaa yhä valikon', await pg.locator('#ns-found i.tml').count()>=2)
    want('mahtuu leveyteen', await pg.evaluate("(function(){var W=document.documentElement.clientWidth,o=0;document.querySelectorAll('#ns-found *').forEach(function(e){var r=e.getBoundingClientRect();if(r.width&&r.right>W+.5)o++;});return o;})()")==0)
    if os.environ.get('KUVA'):
        await pg.locator('#ns-found').scroll_into_view_if_needed(); await pg.screenshot(path=os.environ['KUVA']+'/e190_%d.png'%w)
    # Sama muistiinpano listalla kahdesti (Mainittu ja muistiinpanorivi): kuittaus yhdestä kuittaa molemmat (Emil 26.10.2026)
    await pg.click('#nsheet .sx'); await pg.wait_for_timeout(150)
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0],t=new Date().toISOString();
      k.muistiinpanot.push({id:'n2',created:t,edited:t,text:'Soita Liisalle tänään',date:''});
      k.tarkistuslista=[{id:'r1',name:'Liisa',men:true,created:t,edited:t,it:[]}];k.jatkuvalista={mu:1};localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()""")
    await pg.reload(); await pg.wait_for_timeout(300); await tab(pg,'list'); await pg.wait_for_timeout(200)
    want('kahdesti listalla', await pg.locator('#chlist .crow[data-id="r1"] .cpill').count()==1 and await pg.locator('#chlist .crow[data-id="mu:n2"]').count()==1)
    await pg.locator('#chlist .crow[data-id="r1"] .cpill').first.click(); await pg.wait_for_timeout(800)
    want('Mainittu kuittaa myös muistiinpanorivin', 'kuitattu tänään' in await pg.inner_text('#chlist .crow[data-id="mu:n2"] .cs') and await pg.locator('#chlist .crow .cpill[aria-pressed="false"]').count()==0)
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640)): bad+=await run(p,w,h)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
