"""Juuri 1.100 (Emil 31.10.2026): rivi, jolla on avoin poimittu teksti, nousee listassa; kuittauksen jälkeen palaa. 390, 320, 1280 ja 1440 px."""
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
    await pg.clock.install(time='2026-10-30T09:00:00+02:00')
    await pg.goto(U); await pg.wait_for_timeout(300)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0],t='2026-10-20T06:00:00.000Z';
      k.termit=[{id:'k',name:'Koira',yes:['koir'],no:[]}];
      k.muistiinpanot=[{id:'a',created:t,edited:t,text:'Vie koira ulos\\n---\\nOsta maitoa',date:''},{id:'b',created:'2026-10-21T06:00:00.000Z',edited:t,text:'Tiskikone: vaihda suodatin',date:''},
        {id:'c',created:'2026-10-22T06:00:00.000Z',edited:t,text:'Koiran rokotus 5.11.',date:''},{id:'d',created:t,edited:t,text:'Koira arkistossa',date:'',arch:t}];
      k.tarkistuslista=[{id:'r0',name:'Ensin',it:[]},{id:'r1',name:'Tiskikone',it:[],px:{n:1,t:[]}}];localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()""")
    await pg.reload(); await pg.wait_for_timeout(400); await tab(pg,'list'); await pg.wait_for_timeout(200)
    ids=lambda: pg.evaluate("Array.prototype.map.call(document.querySelectorAll('#chlist .crow:not(.mu)'),function(d){return d.dataset.id;})")
    want('avoin teksti nostaa rivin', (await ids())[:2]==['r1','r0'])
    await pg.click('#chlist .crow[data-id="r1"] .ctxsum'); await pg.wait_for_timeout(150)
    await pg.click('#chlist .crow[data-id="r1"] .ctx[data-nid="b"] .ncheck'); await pg.wait_for_timeout(150)
    await pg.click('#chlist .crow[data-id="r1"] .chd'); await pg.wait_for_timeout(200)
    want('kuittauksen jälkeen palaa', (await ids())[:2]==['r0','r1'])
    sw=await pg.evaluate('document.documentElement.scrollWidth')
    want('ei vaakavieritystä', sw<=w)
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640),(1280,800),(1440,900)): bad+=await run(p,w,h)
        print('OK' if not bad else 'VIRHE', bad); sys.exit(1 if bad else 0)
asyncio.run(main())
