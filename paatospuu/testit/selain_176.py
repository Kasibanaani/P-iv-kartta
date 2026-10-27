"""Juuri 1.76: vaakataso puhelimella (Emil 24.10.2026). Ylä- ja alapalkki pois, kapea sivupalkki oikealla (rullaus kuvakkeena,
vienti, Valikko), kalenteri päivät rinnakkain koko leveydellä, osion ohjainrivi piilossa. Kääntö takaisin pystyyn palauttaa palkit.
Koot 844×390 ja 667×375 (vaaka) sekä 390×844 (pysty). Käyttö: python3 testit/selain_176.py"""
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
        print('  %-48s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    print('koko %dx%d'%(w,h))
    await pg.goto(U); await pg.wait_for_timeout(200)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0],iso=new Date().toISOString().slice(0,10);
      k.muistiinpanot=[{id:'n1',created:'2026-10-20T08:00:00.000Z',edited:'2026-10-20T08:00:00.000Z',teksti:'Palaveri klo 10',text:'Palaveri klo 10',paiva:iso,date:iso,time:{s:'10:00',e:'11:00'}}];
      localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()""")
    await pg.reload(); await pg.wait_for_timeout(200)
    g=await pg.evaluate("""(function(){var p=document.getElementById('pbar').getBoundingClientRect(),m=document.getElementById('main'),mr=m.getBoundingClientRect(),cs=getComputedStyle(m);
      return {top:!!document.querySelector('.top').offsetHeight,px:p.left,pw:p.width,ph:p.height,ptop:p.top,mainTop:mr.top,mainBottom:mr.bottom,padR:parseFloat(cs.paddingRight),sbar:Array.prototype.some.call(document.querySelectorAll('#sbar button'),function(b){return b.offsetHeight>0;}),app:document.querySelector('.app').getBoundingClientRect().width};})()""")
    want('ei yläpalkkia, sisältö ylhäältä alas', not g['top'] and g['mainTop']<=1 and abs(g['mainBottom']-h)<=1)
    want('kapea sivupalkki oikealla koko korkeudelta', g['px']>=w-80 and g['pw']<=80 and abs(g['ph']-h)<=1 and g['ptop']<=1)
    want('sisältö ei jää palkin alle', g['padR']>=g['pw']-1)
    want('koko leveys käytössä', g['app']>=w-1)
    want('ohjainrivi piilossa', not g['sbar'])
    want('rullauksessa kuvake ja pisteet', await pg.locator('#roll-ic svg').count()==1 and await pg.locator('#roll-dots i').count()==4 and not await pg.is_visible('#roll-now'))
    await pg.click('#roll'); await pg.click('#section-cal'); await pg.wait_for_timeout(120)
    want('napautus vie Kalenteriin', await pg.inner_text('#roll-now')=='Kalenteri' and await pg.is_visible('#p-cal'))
    c=await pg.evaluate("(function(){var d=document.querySelectorAll('#timeline .dcol'),w=document.getElementById('week');return [d.length,w.classList.contains('wk7'),document.querySelectorAll('#timeline .ev').length,Math.round(document.getElementById('timeline').getBoundingClientRect().right)];})()")
    want('kalenteri: päivät rinnakkain', c[0]==7 and c[1] and c[2]>=1)
    want('kalenteri ulottuu palkkiin asti', c[3]>=w-g['pw']-20 and c[3]<=w-g['pw']+1)
    await pg.click('#menu'); await pg.wait_for_timeout(80)
    r=await pg.evaluate("(function(){var m=document.getElementById('menupop').getBoundingClientRect(),p=document.getElementById('pbar').getBoundingClientRect();return [m.right<=p.left+1,m.top>=0,m.bottom<=innerHeight];})()")
    want('Valikko palkin vieressä ruudussa', all(r))
    await pg.mouse.click(200,h/2); await pg.wait_for_timeout(80)
    want('ulkopuolinen napautus sulkee', not await pg.is_visible('#menupop') and await pg.locator('#nsheet[open]').count()==0)
    await pg.click('#qx'); await pg.wait_for_timeout(80)
    r=await pg.evaluate("(function(){var m=document.getElementById('qxpop').getBoundingClientRect(),p=document.getElementById('pbar').getBoundingClientRect();return [m.right<=p.left+1,m.top>=0,m.bottom<=innerHeight];})()")
    want('pikavienti palkin vieressä ruudussa', all(r)); await pg.mouse.click(200,h/2); await pg.wait_for_timeout(60)
    # Ikkuna vaakatasossa
    await pg.click('#timeline .ev'); await pg.wait_for_timeout(250)
    r=await pg.evaluate("(function(){var d=document.getElementById('nsheet').getBoundingClientRect(),b=document.querySelector('#nsheet .dbar').getBoundingClientRect();return [Math.round(d.top),Math.round(innerHeight-d.bottom),Math.round(innerHeight-b.bottom)];})()")
    want('ikkuna koko korkeudelta, oma palkki alhaalla', r==[0,0,0])
    await pg.click('#nsheet .sx'); await pg.wait_for_timeout(100)
    want('paluu kalenteriin', not await pg.is_visible('#nsheet') and await pg.is_visible('#p-cal'))
    o=json.loads(await pg.evaluate("(function(){var w=document.documentElement.clientWidth,o=[];document.querySelectorAll('button,input').forEach(function(e){var r=e.getBoundingClientRect();if(r.width&&e.offsetParent&&(r.right>w+.5||r.left<-.5))o.push(e.id||e.className);});return JSON.stringify(o);})()"))
    want('ei mitään yli ruudun', not o)
    # Kääntö pystyyn
    await pg.set_viewport_size({'width':390,'height':844}); await pg.wait_for_timeout(250)
    g=await pg.evaluate("(function(){var p=document.getElementById('pbar').getBoundingClientRect();return {top:!!document.querySelector('.top').offsetHeight,pb:Math.round(innerHeight-p.bottom),pw:Math.round(p.width),sbar:Array.prototype.some.call(document.querySelectorAll('#sbar button'),function(b){return b.offsetHeight>0;}),cols:document.querySelectorAll('#timeline .dcol').length};})()")
    want('pystyssä palkit palaavat', g['top'] and g['pb']==0 and g['pw']==390 and g['sbar'] and g['cols']==0)
    want('pystyssä nimi näkyy', await pg.is_visible('#roll-now') and not await pg.is_visible('#roll-ic'))
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((844,390),(667,375)): bad+=await run(p,w,h)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
