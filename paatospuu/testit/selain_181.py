"""Juuri 1.81: päiväykset lasketaan oikean kalenterin mukaan, vaikka projektin kalenterista on poistettu viikonpäiviä (Emil 24.10.2026).
Piilotetulle päivälle osuva päiväys jää ennalleen, mutta aikalinkki on harmaa ja tulkinnassa ja kortissa lukee "ei näy kalenterissa (su)".
Kello asetetaan perjantaille ja lauantaille 23.–24.10.2026, sunnuntai pois käytöstä. Leveys 390 px. Käyttö: python3 testit/selain_181.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from apu import tab, menu, tsx
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
K="JSON.parse(localStorage.getItem('paatospuu:v1')).kokonaisuudet[0]"
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    ctx=await b.new_context(viewport={'width':w,'height':h},timezone_id='Europe/Helsinki'); pg=await ctx.new_page()
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond):
        print('  %-48s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    async def note(t):
        await pg.click('#newnote'); await pg.wait_for_timeout(200); await pg.fill('#ns-text',t); await pg.dispatch_event('#ns-text','input'); await pg.wait_for_timeout(80)
    print('leveys',w)
    await pg.clock.install(time='2026-10-23T12:00:00+03:00')
    await pg.goto(U); await pg.wait_for_timeout(300)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await pg.evaluate("(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1'));o.kokonaisuudet[0].kalenteri={s:0,e:1440,off:[0]};localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()")
    await pg.reload(); await pg.wait_for_timeout(300); await tab(pg,'notes')
    await note('Pe kirjoitettu maanantaina klo 10'); await pg.click('#nsheet .sx'); await pg.wait_for_timeout(150)
    await pg.clock.run_for(24*3600*1000); await pg.reload(); await pg.wait_for_timeout(400); await tab(pg,'notes'); await pg.wait_for_timeout(200)
    t=await pg.evaluate(K+".muistiinpanot[0].text")
    want('pe kirjoitettu maanantai on lauantaina ylihuomenna', t=='Pe kirjoitettu ylihuomenna klo 10' and 'ma 26.10.2026' in await pg.inner_text('#nlist .ncard .nd'))
    await note('Tapaaminen ylihuomenna klo 11')
    f=await pg.inner_text('#ns-found')
    want('ylihuomenna = maanantai, vaikka sunnuntai pois', 'ma 26.10.2026' in f and 'ei näy' not in f)
    await pg.fill('#ns-text','Tapaaminen huomenna klo 11 kotona'); await pg.dispatch_event('#ns-text','input'); await pg.wait_for_timeout(80)
    f=await pg.inner_text('#ns-found')
    want('huomenna = sunnuntai, merkitty', 'su 25.10.2026' in f and 'ei näy kalenterissa (su)' in f and await pg.locator('#ns-found i.hd').count()==1)
    want('aikalinkki harmaana tekstissä', await pg.locator('#ns-hl mark.hd').count()>=1)
    await pg.click('#nsheet .sx'); await pg.wait_for_timeout(150)
    want('kortissa merkintä', 'ei näy kalenterissa (su)' in await pg.inner_text('#nlist'))
    want('päiväys säilyy', 'huomenna' in await pg.evaluate(K+".muistiinpanot[0].text"))
    await tab(pg,'cal'); await pg.wait_for_timeout(200)
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=await run(p,390,844)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
