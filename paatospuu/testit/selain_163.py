"""Juuri 1.63: asetukset projektikohtaisia ja Projekti-ikkunassa (Emil 23.10.2026). Vanha tallennus: yhteiset asetukset kaikille.
Leveydet 390 ja 320 px. Käyttö: python3 testit/selain_163.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from apu import tab, menu, tsx
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h})).new_page()
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond):
        print('  %-44s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    print('leveys',w)
    # Vanha tallennus: cfg vain ylätasolla, kaksi projektia
    await pg.goto(U); await pg.wait_for_timeout(100)
    await pg.evaluate("""localStorage.setItem('paatospuu:v1',JSON.stringify({app:'paatospuu',ver:1,kcur:'a',cfg:{tint:'forest',font:'serif'},kokonaisuudet:[{id:'a',name:'Eka',puut:[],muistiinpanot:[]},{id:'b',name:'Toka',puut:[],muistiinpanot:[]}]}))""")
    await pg.reload(); await pg.wait_for_timeout(150)
    want('vanhat asetukset molemmille', await pg.evaluate("document.documentElement.dataset.font")=='serif')
    await menu(pg,'#m-proj'); await pg.wait_for_timeout(80)
    want('asetukset Projekti-ikkunassa', await pg.is_visible('#pk-set #set-font') and await pg.is_visible('#pk-set #set-kh'))
    r=await pg.evaluate("(function(){var w=document.documentElement.clientWidth,o=0;document.querySelectorAll('#psheet button,#psheet select').forEach(function(e){var r=e.getBoundingClientRect();if(r.width&&e.offsetParent&&r.right>w+.5)o++;});return o;})()")
    want('mahtuu', r==0)
    await pg.click('#set-font [data-v="mono"]'); await pg.wait_for_timeout(60)
    want('muutos heti', await pg.evaluate("document.documentElement.dataset.font")=='mono' and await pg.get_attribute('#set-font [data-v="mono"]','aria-pressed')=='true')
    await pg.click('#pk-list .row[data-k="b"]'); await pg.wait_for_timeout(100)
    want('toinen projekti pitää omansa', await pg.evaluate("document.documentElement.dataset.font")=='serif')
    await menu(pg,'#m-proj'); await pg.wait_for_timeout(80); await pg.click('#pk-list .row[data-k="a"]'); await pg.wait_for_timeout(100)
    want('takaisin: oma tyyli', await pg.evaluate("document.documentElement.dataset.font")=='mono')
    o=json.loads(await pg.evaluate("localStorage.getItem('paatospuu:v1')"))
    want('tallennus: asetukset projektissa', o['kokonaisuudet'][0]['asetukset']['font']=='mono' and o['kokonaisuudet'][1]['asetukset']['font']=='serif')
    await pg.reload(); await pg.wait_for_timeout(150)
    want('säilyy uudelleenlatauksessa', await pg.evaluate("document.documentElement.dataset.font")=='mono')
    await menu(pg,'#m-proj'); await pg.wait_for_timeout(80); await pg.fill('#pk-new','Kolmas') if await pg.is_visible('#pk-new') else None
    if not await pg.is_visible('#pk-new'): await pg.click('#pk-more summary'); await pg.fill('#pk-new','Kolmas')
    await pg.click('#pk-add'); await pg.wait_for_timeout(100)
    want('uusi projekti perii nykyisen tyylin', await pg.evaluate("document.documentElement.dataset.font")=='mono')
    await pg.click('#psheet .sx'); await pg.wait_for_timeout(60)
    want('osiot rullausnapissa: Muistio, Kalenteri, Listat, Asiat (1.72)', await pg.evaluate("Array.prototype.map.call(document.querySelectorAll('nav .tab'),function(b){return b.dataset.tab;}).join()")=='notes,cal,list,terms,use')
    seen=[]
    for _ in range(4): seen.append(await pg.inner_text('#roll-now')); await pg.click('#roll'); await pg.wait_for_timeout(30)
    want('rullaus kiertää neljä osiota', sorted(seen)==sorted(['Muistio','Kalenteri','Listat','Asiat']) and await pg.inner_text('#roll-now')==seen[0])
    await pg.click('#status') if await pg.is_visible('#status') else None
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640)): bad+=await run(p,w,h)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
