"""Juuri 1.83: tekstin kaavat löytyvät lähimmän i-napin takaa (Emil 24.10.2026), ei tekstikenttien vierestä.
Muistiinpanon, Listan, Ehtojen, Asioiden, kalenterin ja toistuvan ohjeessa avautuvat Kaavat-laatikot; Asiat tekstinä -ikkunan i-nappi avaa oman ohjeensa.
Leveydet 390 ja 320 px. Käyttö: python3 testit/selain_183.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from apu import tab, menu, tsx
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
OVER="""(function(){var w=document.documentElement.clientWidth,out=[];document.querySelectorAll('#hs-body *').forEach(function(e){var r=e.getBoundingClientRect();
 if(r.width&&r.height&&e.offsetParent!==null&&(r.right>w+0.5||r.left<-0.5))out.push(e.tagName+':'+e.textContent.slice(0,20));});return JSON.stringify(out);})()"""
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h})).new_page()
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond):
        print('  %-48s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    sums=lambda: pg.evaluate("Array.prototype.map.call(document.querySelectorAll('#hs-body details.kv summary'),function(s){return s.textContent;})")
    async def closeh(): await pg.click('#hsheet .sx'); await pg.wait_for_timeout(120)
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(200)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    # Muistiinpano: i-nappi ikkunassa
    await tab(pg,'notes'); await pg.click('#newnote'); await pg.wait_for_timeout(200)
    await pg.click('#nsheet .dhelp' if await pg.is_visible('#nsheet .dhelp') else '#nsheet .ibtn'); await pg.wait_for_timeout(200)
    s=await sums()
    want('muistiinpano: kaavat ajankohdat, asiasanat, muut', s==['Kaavat: ajankohdat tekstissä','Kaavat: asiasanat tekstissä','Kaavat: muut muistiinpanossa'])
    want('laatikot kiinni aluksi', await pg.evaluate("Array.prototype.every.call(document.querySelectorAll('#hs-body details.kv'),function(d){return !d.open;})"))
    await pg.locator('#hs-body details.kv summary').first.click(); await pg.wait_for_timeout(80)
    t=await pg.inner_text('#hs-body details.kv')
    want('ajankohdat: keskeiset kaavat', all(x in t for x in ['24.10.','ylihuomenna','vk45','ensi viikolla','3 päivän päästä','joka toinen tiistai','kuun viimeiset 5 pv','klo 13–16','huomenna 9 ja 10','Pura linkki']))
    want('mahtuu leveyteen', json.loads(await pg.evaluate(OVER))==[])
    if os.environ.get('KUVA'): await pg.screenshot(path=os.environ['KUVA']+'/e183a_%d.png'%w)
    await closeh(); await pg.click('#nsheet .sx'); await pg.wait_for_timeout(150)
    # Muistio-osion ohje Valikosta
    await menu(pg,'#m-help'); await pg.wait_for_timeout(150)
    want('Muistio-osion ohje: ajankohdat', 'Kaavat: ajankohdat tekstissä' in await sums())
    await closeh()
    # Lista
    await tab(pg,'list'); await pg.wait_for_timeout(80); await menu(pg,'#m-help'); await pg.wait_for_timeout(150)
    s=await sums()
    want('Listan ohje: rivin kentät ensin', s[:1]==['Kaavat: rivin kentät'] and 'Kaavat: ajankohdat tekstissä' in s)
    await pg.locator('#hs-body details.kv summary').first.click(); await pg.wait_for_timeout(60)
    want('rivin kentät: #Nimi ja Nimi*', '#Nimi' in await pg.inner_text('#hs-body details.kv') and 'Nimi*' in await pg.inner_text('#hs-body details.kv'))
    await closeh()
    # Kalenteri
    await tab(pg,'cal'); await pg.wait_for_timeout(80); await menu(pg,'#m-help'); await pg.wait_for_timeout(150)
    want('kalenterin ohje: ajankohdat', (await sums())==['Kaavat: ajankohdat tekstissä'])
    await closeh()
    # Asiat: osion ohje, Ehdot ja Asiat tekstinä
    await tab(pg,'terms'); await pg.wait_for_timeout(80); await menu(pg,'#m-help'); await pg.wait_for_timeout(150)
    want('Asioiden ohje: uusi asiasana', (await sums())[:1]==['Kaavat: uusi asiasana'])
    await closeh()
    await pg.click('#tt-eh'); await pg.wait_for_timeout(250)
    await pg.click('#ehsheet .dhelp' if await pg.is_visible('#ehsheet .dhelp') else '#ehsheet .ibtn'); await pg.wait_for_timeout(200)
    s=await sums(); await pg.locator('#hs-body details.kv summary').first.click(); await pg.wait_for_timeout(60)
    want('Ehtojen ohje: kenttä ja tekstimuoto', s==['Kaavat: ehdot'] and 'Poissulkevat: Lepo, Lenkki.' in await pg.inner_text('#hs-body details.kv'))
    await closeh(); await pg.click('#ehsheet .sx'); await pg.wait_for_timeout(200)
    await menu(pg,'#tt-open'); await pg.wait_for_timeout(250)
    await pg.click('#tsheet .dhelp' if await pg.is_visible('#tsheet .dhelp') else '#ts-help'); await pg.wait_for_timeout(200)
    hb=await pg.inner_text('#hs-body')
    want('Asiat tekstinä: oma ohje', await pg.inner_text('#hs-h')=='Asiat tekstinä' and all(x in hb for x in ['=Kipu:','!ei kipua','=Kipu*:','Ehdot:','Kun Kipu ja Kuume','#Oireet','"lääk"']))
    want('mahtuu leveyteen (tekstinä)', json.loads(await pg.evaluate(OVER))==[])
    if os.environ.get('KUVA'): await pg.screenshot(path=os.environ['KUVA']+'/e183b_%d.png'%w)
    await closeh(); await pg.click('#tt-ok'); await pg.wait_for_timeout(250)
    await pg.fill('#newterm','Kipu'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(250)
    await pg.click('#tsheet .dhelp' if await pg.is_visible('#tsheet .dhelp') else '#ts-help'); await pg.wait_for_timeout(200)
    want('kortin i-nappi palaa Asiasanat-ohjeeseen', await pg.inner_text('#hs-h')=='Asiasanat')
    await closeh(); await tsx(pg)
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640)): bad+=await run(p,w,h)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
