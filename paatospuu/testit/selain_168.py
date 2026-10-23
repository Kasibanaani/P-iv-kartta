"""Juuri 1.68: rivin tärkein kuittaamaton kohde erottuu (täytetty), kuittauksen jälkeen seuraava (Emil 23.10.2026).
Leveydet 390 ja 320 px. Käyttö: python3 testit/selain_168.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
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
    await pg.goto(U); await pg.wait_for_timeout(200)
    await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0];
      k.termit=[{id:'ta',name:'Sähköposti',yes:[],no:[]},{id:'tb',name:'Lähetteet',yes:[],no:[]},{id:'tc',name:'Kirjaukset',yes:[],no:[]}];k.tarkeat=['tb','tc'];
      k.tarkistuslista=[{id:'r1',name:'Rutiinit',created:'2026-10-01T00:00:00.000Z',it:[{id:'ta'},{id:'tb'},{id:'tc'}]}];localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()""")
    await pg.reload(); await pg.wait_for_timeout(150); await pg.click('[data-tab="list"]'); await pg.wait_for_timeout(60)
    await pg.click('#chlist .crow[data-id="r1"] .chd'); await pg.wait_for_timeout(60)
    top=lambda: pg.evaluate("Array.prototype.map.call(document.querySelectorAll('#chlist .cpill.ctop'),function(b){return b.dataset.tid;})")
    want('tärkein erottuu, vain yksi', await top()==['tb'])
    c=await pg.evaluate("(function(){var a=getComputedStyle(document.querySelector('.cpill.ctop')),b=getComputedStyle(document.querySelector('.cpill:not(.ctop):not(.ok)'));return [a.backgroundColor,b.backgroundColor];})()")
    want('täytetty, muut ääriviivoin', c[0]!=c[1])
    order=await pg.evaluate("Array.prototype.map.call(document.querySelectorAll('#chlist .cpill'),function(b){return b.dataset.tid;})")
    want('järjestys ei muutu', order==['ta','tb','tc'])
    await pg.click('#chlist .cpill.ctop'); await pg.wait_for_timeout(80)
    want('kuittauksen jälkeen seuraava tärkein', await top()==['tc'])
    await pg.click('#chlist .cpill.ctop'); await pg.wait_for_timeout(80)
    want('tähdetön viimeisenä tärkeimmäksi', await top()==['ta'])
    await pg.click('#chlist .cpill.ctop'); await pg.wait_for_timeout(80)
    want('kaikki kuitattu: ei korostusta', await top()==[])
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640)): bad+=await run(p,w,h)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
