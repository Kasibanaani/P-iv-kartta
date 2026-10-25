"""Juuri 1.82: estetiikka-asetukset (muotokieli, napit, kuittaus, kuvitus) projektikohtaisesti. 1.86: paletit korvattu värikoneella (selain_186).
Leveydet 390 ja 320 px. Käyttö: python3 testit/selain_182.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from apu import tab, menu
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
K="JSON.parse(localStorage.getItem('paatospuu:v1')).kokonaisuudet[0].asetukset"
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h})).new_page()
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond):
        print('  %-48s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    root=lambda k: pg.evaluate("document.documentElement.dataset['%s']||''"%k)
    var=lambda k: pg.evaluate("document.documentElement.style.getPropertyValue('%s')"%k)
    async def opn():
        await menu(pg,'#m-proj'); await pg.wait_for_timeout(150)
    async def pick(sel):
        await pg.locator(sel).scroll_into_view_if_needed(); await pg.locator(sel).click(); await pg.wait_for_timeout(60)
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(200)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await tab(pg,'notes'); await pg.wait_for_timeout(80)
    await opn()
    want('ei valmiita paletteja, kuvat asetuksissa', await pg.locator('#set-pals').count()==0 and await pg.locator('#set-pal').count()==0 and await pg.locator('#set-art button').count()==32)
    await pick('#set-mode button[data-v="dark"]')
    want('Tumma-tila värikoneella', await root('pal')=='kone' and await pg.evaluate("document.documentElement.style.colorScheme")=='dark')
    await pick('#set-look button[data-v="satu"]')
    want('muotokieli Satumetsä: serif-otsikot, säteet', await root('hf')=='serif' and await root('rs')=='1' and await root('tabst')=='dot')
    want('muotokieli piilottaa Reunat-valinnan', await pg.locator('#set-edge').count()==0)
    await pick('#set-bfx button[data-v="offset"]')
    await pick('#set-bshape button[data-v="999"]')
    await pick('#set-ck button[data-v="50%|line"]')
    want('napit: siirtymä, pilleri; kuittaus viivana', await root('bfx')=='offset' and (await var('--r-btn')).strip()=='999px' and await root('ckl')=='1')
    await pick('#set-art button[data-v="puu4"]')
    want('kuvituskaista näkyy', await pg.evaluate("(function(){var a=document.getElementById('artband');return !a.hidden&&!!a.querySelector('svg');})()"))
    want('ei vaakavieritystä asetuksissa', await pg.evaluate("document.documentElement.scrollWidth<=%d"%w))
    if os.environ.get('KUVA'): await pg.screenshot(path=os.environ['KUVA']+'/e182a_%d.png'%w)
    await pg.click('#psheet .sx'); await pg.wait_for_timeout(120)
    if os.environ.get('KUVA'): await pg.screenshot(path=os.environ['KUVA']+'/e182b_%d.png'%w)
    c=json.loads(await pg.evaluate("JSON.stringify(%s)"%K))
    want('tallentuu projektiin', c.get('mode')=='dark' and 'pal' not in c and c.get('look')=='satu' and c.get('art')=='puu4' and c.get('dbfx')=='offset')
    await pg.reload(); await pg.wait_for_timeout(250)
    want('säilyy uudelleenlatauksessa', await pg.evaluate("document.documentElement.style.colorScheme")=='dark' and await pg.evaluate("!document.getElementById('artband').hidden"))
    await opn()
    await pick('#set-art button[data-v="kuvio"]')
    want('pelkkä kuvio: kaista piiloon', await root('art')=='kuvio' and await pg.evaluate("document.getElementById('artband').hidden"))
    await pick('#set-look button[data-v="juuri"]')
    want('Juuri-muotokieli palauttaa perusmuodot', await root('hf')=='' and await root('rs')=='')
    await pg.click('#psheet .sx'); await pg.wait_for_timeout(120)
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640)): bad+=await run(p,w,h)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
