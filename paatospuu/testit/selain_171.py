"""Juuri 1.71 (Emil 24.10.2026): pitkä painallus ei maalaa nappeja, yläpalkissa ei määrää, listan ehdot kytkimenä,
uusi muistiinpano kursori valmiina, kasvava kenttä (5 riviä + 1 tyhjä rivi), matalammat päivänapit ja pallerolle tilaa.
Leveydet 390 ja 320 px kosketuksella. Käyttö: python3 testit/selain_171.py"""
import asyncio, os, sys
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from apu import tab, menu, tsx
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h},has_touch=True,is_mobile=True)).new_page()
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond):
        print('  %-50s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(200)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    # 25.10.2026: toinen muistiinpano tänään (huomenna osui sunnuntaina seuraavalle viikolle, eikä viikkonäkymässä ollut merkittyä päivää)
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0];
      k.termit=[{id:'ta',name:'Kipu',yes:['kipu'],no:[]}];k.tarkeat=['ta'];
      k.muistiinpanot=[{id:'n1',created:'2026-10-01T08:00:00.000Z',edited:'2026-10-01T08:00:00.000Z',text:'kipu tänään',date:''},{id:'n2',created:new Date().toISOString(),edited:new Date().toISOString(),text:'jotain tänään',date:''}];
      localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()""")
    await pg.reload(); await pg.wait_for_timeout(150)
    sel=await pg.evaluate("(function(){var c=matchMedia('(pointer:coarse)').matches,b=getComputedStyle(document.querySelector('#nav .tab')).userSelect,t=getComputedStyle(document.createElement('textarea'));return [c,b];})()")
    want('kosketuksella napit eivät ole valittavaa tekstiä', (not sel[0]) or sel[1]=='none')
    want('kenttä on valittavaa tekstiä', await pg.evaluate("getComputedStyle(document.getElementById('ns-text')).userSelect")!='none')
    want('nav: Muistio', 'Muistio' in await pg.inner_text('[data-tab="notes"]') and 'Muistiot' not in await pg.inner_text('[data-tab="notes"]'))
    want('ei määrää yläpalkissa', not await pg.is_visible('#count'))
    # Uusi muistiinpano: fokus kentässä, viisi riviä
    await tab(pg,'notes'); await pg.wait_for_timeout(100); await pg.tap('#newnote'); await pg.wait_for_timeout(150)
    want('uusi muistiinpano: kursori kentässä', await pg.evaluate("document.activeElement&&document.activeElement.id")=='ns-text')
    hgt=lambda: pg.evaluate("document.getElementById('ns-text').getBoundingClientRect().height")
    lh=await pg.evaluate("parseFloat(getComputedStyle(document.getElementById('ns-text')).lineHeight)")
    h0=await hgt()
    want('alkukorkeus noin viisi riviä', 5*lh<=h0<=5*lh+30)
    await pg.keyboard.type('a\nb\nc\nd\ne\nf\ng'); await pg.wait_for_timeout(80)
    h1=await hgt(); sh=await pg.evaluate("(function(t){return t.scrollHeight-t.clientHeight;})(document.getElementById('ns-text'))")
    want('kasvaa ja alla tyhjä rivi', h1>h0 and sh<=1 and h1>=7*lh+lh)
    want('ilman näppäimistöä ei kaistaa', not await pg.is_visible('#kbgap'))
    hl=await pg.evaluate("(function(){var a=document.getElementById('ns-text').getBoundingClientRect(),b=document.getElementById('ns-hl').getBoundingClientRect();return Math.abs(a.height-b.height);})()")
    want('korostus seuraa kentän kokoa', hl<=1)
    await pg.click('#nsheet .sx'); await pg.wait_for_timeout(100)
    # Vanha muistiinpano ei avaa näppäimistöä
    await pg.locator('#nlist .ncard').first.click(); await pg.wait_for_timeout(120)
    want('vanha muistiinpano: ei fokusta', await pg.evaluate("document.activeElement&&document.activeElement.id")!='ns-text')
    await pg.click('#nsheet .sx'); await pg.wait_for_timeout(100)
    # Listan ehdot kytkimenä
    await tab(pg,'list'); await pg.wait_for_timeout(80); await pg.click('#chlist-pick'); await pg.wait_for_timeout(80)
    want('ehdot kytkimenä', await pg.get_attribute('#ws-eh','role')=='switch' and await pg.locator('#ws-ehb').count()==0)
    await pg.click('#ws-eh'); await pg.wait_for_timeout(50)
    want('kytkin päälle', await pg.get_attribute('#ws-eh','aria-checked')=='true')
    await pg.click('#wsheet .sx'); await pg.wait_for_timeout(80)
    # Kalenteri: pallero ei koske numeroon
    await tab(pg,'cal'); await pg.wait_for_timeout(120)
    g=await pg.evaluate("""(function(){var d=[].filter.call(document.querySelectorAll('#week .cday'),function(x){return x.classList.contains('has')&&!x.classList.contains('hassub');})[0];if(!d)return {h:99,gap:-9};
      var r=d.getBoundingClientRect(),tn=[].filter.call(d.childNodes,function(n){return n.nodeType===3;})[0],rg=document.createRange();rg.selectNodeContents(tn);var t=rg.getBoundingClientRect(),a=getComputedStyle(d,'::after');
      return {h:r.height,gap:(r.bottom-parseFloat(a.bottom)-parseFloat(a.height))-t.bottom,has:d.classList.contains('has')};})()""")
    want('päivänappi matalampi', g['h']<=40.5)
    want('pallerolla tilaa numeron alla', g['gap']>=1)
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640)): bad+=await run(p,w,h)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
