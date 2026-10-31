"""Juuri 1.101 (Emil 31.10.2026): käyttötila ja fokus. Rakentelu piiloon, avattu rivi omana näkymänään, järjestys elää vain siinä,
muualla avautuva ei näy ennen paluuta (piste), valmiin jälkeen palataan itse. 390, 320, 1280 ja 1440 px."""
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
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e,e.stack)))
    def want(label,cond):
        print('  %-52s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    print('leveys',w)
    await pg.clock.install(time='2026-10-30T09:00:00+02:00')
    await pg.goto(U); await pg.wait_for_timeout(300)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    # Kipu > Kuume > Lääkäri tärkeysjärjestyksessä. Ehto: kun Kipu kuitataan, Soitto tulee esiin rivillä Muut.
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0];
      k.termit=[{id:'ta',name:'Kipu',yes:[],no:[]},{id:'tb',name:'Kuume',yes:[],no:[]},{id:'tc',name:'Lääkäri',yes:[],no:[]},{id:'td',name:'Soitto',yes:[],no:[]}];k.tarkeat=['ta','tb','tc','td'];
      k.tarkistuslista=[{id:'r1',name:'Aamu',created:'2026-10-01T00:00:00.000Z',it:[{id:'tc'},{id:'ta'},{id:'tb'}]},{id:'r2',name:'Muut',created:'2026-10-02T00:00:00.000Z',it:[{id:'td'}]}];
      k.ehdot=[{id:'e1',k:['ta'],on:['td'],off:[]}];k.jatkuvalista={eh:1};
      localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()""")
    await pg.reload(); await pg.wait_for_timeout(400); await tab(pg,'list'); await pg.wait_for_timeout(200)
    want('rakennustilassa Muokkaa näkyy', await pg.locator('#chlist .crow[data-id="r1"] .chd').count()==1)
    # käyttötila päälle projektin ikkunasta (toimii puhelimella ja koneella)
    if await pg.is_visible('#menu'):
        await pg.click('#menu'); await pg.wait_for_timeout(40)
        want('valikossa Käyttötila', (await pg.text_content('#m-kt'))=='Käyttötila')
        await pg.click('#m-kt'); await pg.wait_for_timeout(150)
    else:
        await pg.click('#title'); await pg.wait_for_timeout(100); await pg.click('#pk-kt'); await pg.wait_for_timeout(100)
        want('projektin ikkunassa kytkin päällä', (await pg.get_attribute('#pk-kt','aria-checked'))=='true')
        want('projektin muokkaus piilossa', not await pg.is_visible('#pk-del') and not await pg.is_visible('#pk-name'))
        await pg.click('#ps-close') if await pg.is_visible('#ps-close') else await pg.keyboard.press('Escape'); await pg.wait_for_timeout(100)
    want('body.kt', await pg.evaluate("document.body.classList.contains('kt')"))
    want('Asiat ei osiona', await pg.evaluate("document.querySelectorAll('#roll-dots i').length")==3 and await pg.evaluate("getComputedStyle(document.querySelector('#nav .tab[data-tab=terms]')).display")=='none')
    want('ei + -nappia listalla', not await pg.is_visible('#newnote'))
    # avaa rivi -> fokus
    await pg.click('#chlist .crow[data-id="r1"] .chd'); await pg.wait_for_timeout(200)
    want('fokus auki, muut rivit poissa', await pg.locator('#kfoc').count()==1 and await pg.locator('#chlist .crow').count()==0)
    names=lambda: pg.evaluate("Array.prototype.map.call(document.querySelectorAll('#kflist .kfr .kft>span'),function(s){return s.textContent;})")
    want('järjestys tärkeyden mukaan', await names()==['Kipu','Kuume','Lääkäri'])
    want('ei Muokkaa-nappia', await pg.locator('#kfoc .cedit').count()==0 and await pg.locator('.cedit').count()==0)
    await pg.click('#kflist .kfr.kf1'); await pg.wait_for_timeout(250)
    want('kuittaus: seuraava tärkein ylös', await names()==['Kuume','Lääkäri'])
    want('pysyy fokuksessa (ehto ei siirrä)', await pg.locator('#kfoc').count()==1)
    want('Tehty (1)', (await pg.text_content('#kf-more'))=='Tehty (1)')
    await pg.click('#kflist .kfr.kf1'); await pg.wait_for_timeout(200); await pg.click('#kflist .kfr.kf1'); await pg.wait_for_timeout(200)
    want('valmis-tila ja Takaisin', await pg.is_visible('#kf-done-back'))
    want('ei palaa itsestään', await pg.locator('#kfoc').count()==1)
    sw=await pg.evaluate('document.documentElement.scrollWidth'); want('ei vaakavieritystä (fokus)', sw<=w)
    await pg.click('#kf-done-back'); await pg.wait_for_timeout(250)
    want('palattu listaan', await pg.locator('#kfoc').count()==0 and await pg.locator('#chlist .crow').count()>=2)
    want('ehdon avaama rivi saa pisteen', await pg.locator('#chlist .crow[data-id="r2"] .ktnew').count()==1)
    # rakennustila takaisin
    if await pg.is_visible('#menu'):
        await pg.click('#menu'); await pg.wait_for_timeout(40); await pg.click('#m-kt'); await pg.wait_for_timeout(150)
    else:
        await pg.click('#title'); await pg.wait_for_timeout(100); await pg.click('#pk-kt'); await pg.wait_for_timeout(100); await pg.keyboard.press('Escape'); await pg.wait_for_timeout(100)
    want('rakennustila palauttaa', not await pg.evaluate("document.body.classList.contains('kt')") and await pg.evaluate("document.querySelectorAll('#roll-dots i').length")==4)
    saved=await pg.evaluate("JSON.parse(localStorage.getItem('paatospuu:v1')).kokonaisuudet[0].asetukset.kt||null")
    want('tallennus: kt pois', saved is None)
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def run2(p):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':390,'height':844})).new_page()
    pg.on('pageerror',lambda e:errs.append(str(e)))
    def want(label,cond):
        print('  %-52s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    print('poimitut tekstit fokuksessa')
    await pg.clock.install(time='2026-10-30T09:00:00+02:00')
    await pg.goto(U); await pg.wait_for_timeout(300)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0],t='2026-10-20T06:00:00.000Z';
      k.muistiinpanot=[{id:'b',created:t,edited:t,text:'Tiskikone: vaihda suodatin',date:''}];
      k.tarkistuslista=[{id:'r1',name:'Tiskikone',it:[],px:{n:1,t:[]}}];k.asetukset=Object.assign(k.asetukset||{},{kt:'on'});localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()""")
    await pg.reload(); await pg.wait_for_timeout(400); await tab(pg,'list'); await pg.wait_for_timeout(200)
    want('käyttötila säilyy latauksessa', await pg.evaluate("document.body.classList.contains('kt')"))
    await pg.click('#chlist .crow[data-id="r1"] .chd'); await pg.wait_for_timeout(200)
    want('teksti fokuksen rivinä', 'Tiskikone' in (await pg.text_content('#kflist')))
    await pg.click('#kflist .kfr.kf1'); await pg.wait_for_timeout(200)
    want('tekstin kuittaus', await pg.evaluate("JSON.parse(localStorage.getItem('paatospuu:v1')).kokonaisuudet[0].muistiinpanot[0].tx!==undefined||JSON.parse(localStorage.getItem('paatospuu:v1')).kokonaisuudet[0].muistiinpanot[0].done!==undefined") and await pg.is_visible('#kf-done-back'))
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640),(1280,800),(1440,900)): bad+=await run(p,w,h)
        bad+=await run2(p)
        print('OK' if not bad else 'VIRHE', bad); sys.exit(1 if bad else 0)
asyncio.run(main())
