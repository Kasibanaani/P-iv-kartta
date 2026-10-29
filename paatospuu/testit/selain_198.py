"""Juuri 1.98 (Emil 29.10.2026): kuittaus kuuluu tekstille. Usean tekstin kortissa ympyrä jokaiselle tekstille, muistiinpano Kuitattuihin
vasta kun kaikki tekstit on kuitattu; yhden ajan tekstin ympyrä = kalenterin kuittaus; vanha kuitattu luetaan; arkistointi varmistuksella
(vahvistus eri kohdassa), arkistoitu ei näy muualla, palautus Arkistosta. 390, 320, 1280 ja 1440 px."""
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
        print('  %-50s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    print('leveys',w)
    await pg.clock.install(time='2026-10-29T09:00:00+02:00')
    await pg.goto(U); await pg.wait_for_timeout(300)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0],t='2026-10-20T06:00:00.000Z';
      k.muistiinpanot=[{id:'m',created:t,edited:t,text:'Soita putkimiehelle\\n---\\nOsta maitoa kaupasta',date:''},
        {id:'h',created:t,edited:t,text:'Hammaslääkäri 5.11. klo 10',date:''},
        {id:'v',created:t,edited:t,text:'Vanha kuitattu asia',date:'',done:t},
        {id:'a',created:t,edited:t,text:'Arkistoitava juttu 30.10.',date:''}];localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()""")
    await pg.reload(); await pg.wait_for_timeout(400); await tab(pg,'notes'); await pg.wait_for_timeout(200)
    card=lambda i:'#nlist .ncard[data-id="%s"]'%i
    want('usean tekstin kortissa kaksi ympyrää', await pg.locator(card('m')+' .ncheck').count()==2 and await pg.locator(card('m')+' .npart').count()==2)
    want('yhden tekstin kortissa yksi ympyrä', await pg.locator(card('h')+' .ncheck').count()==1)
    want('vanha kuitattu ei avoimissa', await pg.locator(card('v')).count()==0)
    await pg.click(card('m')+' .npart >> nth=0 >> .ncheck'); await pg.wait_for_timeout(250)
    want('eka teksti kuitattu, kortti yhä avoimissa', await pg.locator(card('m')).count()==1 and await pg.get_attribute(card('m')+' .npart >> nth=0 >> .ncheck','aria-pressed')=='true' and await pg.get_attribute(card('m')+' .npart >> nth=1 >> .ncheck','aria-pressed')=='false')
    want('kuitattu teksti haalea', await pg.locator(card('m')+' .npart.pdone').count()==1)
    await pg.click(card('m')+' .npart >> nth=1 >> .ncheck'); await pg.wait_for_timeout(250)
    want('molemmat kuitattu: Kuitattuihin', await pg.locator(card('m')).count()==0)
    await pg.click(card('h')+' .ncheck'); await pg.wait_for_timeout(250)
    st=json.loads(await pg.evaluate("JSON.stringify(%s.muistiinpanot.filter(function(n){return n.id==='h';})[0])"%K))
    want('yhden ajan ympyrä = kalenterin kuittaus', list((st.get('pts') or {}).keys())==['2026-11-05 10:00'] and bool(st.get('done')))
    # Usean tekstin ikkunassa ei muistiinpanon Kuittaa-nappia
    await pg.click('#noteview [data-nv="done"]'); await pg.wait_for_timeout(200)
    want('Kuitatuissa vanha ja kuitatut', all([await pg.locator(card(i)).count()==1 for i in 'mhv']))
    await pg.locator(card('m')+' .nt').first.click(); await pg.wait_for_timeout(250)
    want('usean tekstin ikkunassa ei Kuittaa', await pg.is_hidden('#ns-done') and await pg.is_visible('#ns-arch'))
    await pg.click('#nsheet .sx'); await pg.wait_for_timeout(200)
    # Kalenterin kuittauksen peruutus avaa tekstin
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1'));o.kokonaisuudet[0].muistiinpanot.forEach(function(n){if(n.id==='h')delete n.pts;});localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()""")
    await pg.reload(); await pg.wait_for_timeout(400); await tab(pg,'notes'); await pg.wait_for_timeout(200)
    want('kalenterikuittauksen poisto palauttaa avoimiin', await pg.locator(card('h')).count()==1)
    # Arkistointi
    await pg.locator(card('a')+' .nt').first.click(); await pg.wait_for_timeout(250)
    want('Arkistoi tarjolla avoimelle', await pg.is_visible('#ns-arch') and (await pg.inner_text('#ns-arch'))=='Arkistoi')
    a0=await pg.locator('#ns-arch').bounding_box()
    await pg.click('#ns-arch'); await pg.wait_for_timeout(150)
    want('varmistus aukeaa', await pg.is_visible('#ns-archbox') and await pg.is_hidden('#ns-delrow'))
    a1=await pg.locator('#ns-archok').bounding_box()
    hit=a1['x']<=a0['x']+a0['width']/2<=a1['x']+a1['width'] and a1['y']<=a0['y']+a0['height']/2<=a1['y']+a1['height']
    want('vahvistus eri kohdassa kuin Arkistoi', not hit)
    await pg.click('#ns-archno'); await pg.wait_for_timeout(100)
    want('Peruuta palauttaa', await pg.is_hidden('#ns-archbox') and await pg.is_visible('#ns-delrow'))
    await pg.click('#ns-arch'); await pg.wait_for_timeout(100); await pg.click('#ns-archok'); await pg.wait_for_timeout(300)
    want('ikkuna sulkeutuu, ei avoimissa', await pg.is_hidden('#nsheet') and await pg.locator(card('a')).count()==0)
    want('arkistoitu tallessa', await pg.evaluate("!!%s.muistiinpanot.filter(function(n){return n.id==='a';})[0].arch"%K))
    await tab(pg,'cal'); await pg.wait_for_timeout(200)
    want('arkistoitu ei kalenterissa', 'Arkistoitava' not in await pg.inner_text('#main'))
    await tab(pg,'notes'); await pg.wait_for_timeout(150); await pg.click('#noteview [data-nv="done"]'); await pg.wait_for_timeout(200)
    want('Arkisto Kuitattujen lopussa', await pg.locator('#archlist .row').count()==1 and await pg.locator(card('a')).count()==0)
    await pg.click('#archlist .row'); await pg.wait_for_timeout(250)
    want('palautusnappi', (await pg.inner_text('#ns-arch'))=='Palauta arkistosta')
    await pg.click('#ns-arch'); await pg.wait_for_timeout(200); await pg.click('#nsheet .sx'); await pg.wait_for_timeout(200)
    await pg.click('#noteview [data-nv="open"]'); await pg.wait_for_timeout(200)
    want('palautettu avoimiin', await pg.locator(card('a')).count()==1)
    want('ei vaakavieritystä', await pg.evaluate("document.documentElement.scrollWidth<=innerWidth"))
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640),(1280,800),(1440,900)): bad+=await run(p,w,h)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
