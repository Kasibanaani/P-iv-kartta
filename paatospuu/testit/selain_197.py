"""Juuri 1.97 (Emil 29.10.2026): muistiinpanon kirjoituskentällä huomioreunus, kun tekstissä ei ole yhtään päivää.
Päivän tarkkuus riittää (päivämäärä, viikonpäivä, huomenna, pelkkä kellonaika tai päivämääräkenttä sammuttaa). Tyhjällä ei reunusta.
Reunus ei estä tallennusta. 390, 320, 1280 ja 1440 px."""
import asyncio, os, sys
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from apu import tab
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
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
    await pg.clock.install(time='2026-10-29T09:00:00+02:00')
    await pg.goto(U); await pg.wait_for_timeout(300)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await tab(pg,'notes'); await pg.wait_for_timeout(100)
    await pg.click("#newnote"); await pg.wait_for_timeout(200)
    nd=lambda: pg.evaluate("document.getElementById('ns-text').classList.contains('nodate')")
    want('tyhjä: ei reunusta', not await nd())
    await pg.fill('#ns-text','Muista soittaa putkimiehelle'); await pg.wait_for_timeout(80)
    want('ilman päivää: reunus', await nd())
    sh=await pg.evaluate("getComputedStyle(document.getElementById('ns-text')).boxShadow")
    want('reunus näkyy', 'inset' in sh and '2px' in sh)
    for t in ('Muista soittaa huomenna','Muista soittaa perjantaina','Muista soittaa 3.11.','Muista soittaa klo 14','Sauna perjantaisin klo 8 31.12.26 asti'):
        await pg.fill('#ns-text',t); await pg.wait_for_timeout(60)
        want('päivä sammuttaa: '+t[15:40], not await nd())
    await pg.fill('#ns-text','Eka teksti ilman aikaa\n---\nToka huomenna'); await pg.wait_for_timeout(60)
    want('yksikin päivä koko kentässä riittää', not await nd())
    await pg.fill('#ns-text','Ilman aikaa'); await pg.wait_for_timeout(60)
    await pg.fill('#ns-date','2026-11-05'); await pg.dispatch_event('#ns-date','input'); await pg.dispatch_event('#ns-date','change'); await pg.wait_for_timeout(80)
    want('päivämääräkenttä sammuttaa', not await nd())
    await pg.fill('#ns-date',''); await pg.dispatch_event('#ns-date','input'); await pg.dispatch_event('#ns-date','change'); await pg.wait_for_timeout(80)
    want('kentän tyhjennys palauttaa', await nd())
    await pg.click('#nsheet .sx'); await pg.wait_for_timeout(200)
    want('tallentuu silti', await pg.evaluate("JSON.parse(localStorage.getItem('paatospuu:v1')).kokonaisuudet[0].muistiinpanot.some(function(n){return n.text==='Ilman aikaa';})"))
    await pg.locator('#nlist .ncard:has-text("Ilman aikaa")').first.click(); await pg.wait_for_timeout(250)
    want('vanha muistiinpano avattaessa: reunus', await nd())
    want('ei vaakavieritystä', await pg.evaluate("document.documentElement.scrollWidth<=innerWidth"))
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640),(1280,800),(1440,900)): bad+=await run(p,w,h)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
