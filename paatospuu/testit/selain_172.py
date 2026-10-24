"""Juuri 1.72: alapalkin rullausnappi, Asiat omana osionaan, Valikko ja pikavienti (Emil 24.10.2026).
Rullaus kiertää Muistio · Kalenteri · Listat · Asiat, sivupyyhkäisy taaksepäin, yläreunassa vain pieni ei-painettava rivi,
Valikon ja pikaviennin ulkopuolinen napautus vain sulkee, Päätöspuu Valikosta. Leveydet 390 ja 320 px, tietokone 1280 px.
Käyttö: python3 testit/selain_172.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from apu import tab, menu, tsx
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
SWIPE="""(function(dx){var r=document.getElementById('roll'),b=r.getBoundingClientRect(),x=b.left+b.width/2,y=b.top+b.height/2;
  function t(x){return new Touch({identifier:1,target:r,clientX:x,clientY:y});}
  r.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[t(x)],changedTouches:[t(x)]}));
  r.dispatchEvent(new TouchEvent('touchend',{bubbles:true,touches:[],changedTouches:[t(x+dx)]}));})"""
async def phone(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h},accept_downloads=True)).new_page()
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond):
        print('  %-48s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(200)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0];k.name='Koti';k.termit=[{id:'ta',name:'Kipu',yes:['kipu'],no:[]}];
      k.muistiinpanot=[{id:'n1',created:'2026-10-20T08:00:00.000Z',edited:'2026-10-20T08:00:00.000Z',teksti:'Kipu jatkuu',text:'Kipu jatkuu',paiva:'',date:''}];
      localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()""")
    await pg.reload(); await pg.wait_for_timeout(200)
    # Alku ja palkit
    want('aloitus Muistiosta', await pg.inner_text('#roll-now')=='Muistio' and await pg.is_visible('#p-notes'))
    want('yläreunassa vain pieni rivi', await pg.inner_text('#crumb')=='Koti · Muistio' and not await pg.is_visible('#title') and not await pg.is_visible('#xbtn') and not await pg.is_visible('#hint'))
    g=await pg.evaluate("(function(){var t=document.querySelector('.top').getBoundingClientRect(),c=document.getElementById('crumb'),pb=document.getElementById('pbar').getBoundingClientRect();return [Math.round(t.height),getComputedStyle(c).pointerEvents,Math.round(innerHeight-pb.bottom),Math.round(pb.height)];})()")
    want('yläpalkki matala, rivi ei painettava', g[0]<=40 and g[1]=='none')
    want('alapalkki alhaalla, matala', g[2]<=1 and g[3]<=60)
    want('vanha välilehtirivi piilossa', not await pg.is_visible('#nav'))
    r=await pg.evaluate("(function(){var a=document.getElementById('roll').getBoundingClientRect(),q=document.getElementById('qx').getBoundingClientRect(),m=document.getElementById('menu').getBoundingClientRect();return [a.left,q.left,m.right,innerWidth,a.right<q.left];})()")
    want('rullaus vasemmalla, vienti ja valikko oikealla', r[0]<=20 and r[1]>r[0] and r[2]<=r[3]-4 and r[4])
    # Rullaus
    seq=[]
    for _ in range(4):
        seq.append((await pg.inner_text('#roll-now'),await pg.inner_text('#roll-next'))); await pg.click('#roll'); await pg.wait_for_timeout(40)
    want('napautus kiertää neljä osiota', [s[0] for s in seq]==['Muistio','Kalenteri','Listat','Asiat'] and await pg.inner_text('#roll-now')=='Muistio')
    want('seuraava näkyy vihjeenä', [s[1] for s in seq]==['Kalenteri','Listat','Asiat','Muistio'])
    want('pisteet: neljä, yksi korostettu', await pg.locator('#roll-dots i').count()==4 and await pg.locator('#roll-dots i.on').count()==1)
    await pg.evaluate(SWIPE+"(60)"); await pg.wait_for_timeout(60)
    want('pyyhkäisy oikealle: edellinen', await pg.inner_text('#roll-now')=='Asiat' and await pg.is_visible('#p-terms'))
    await pg.evaluate(SWIPE+"(-60)"); await pg.wait_for_timeout(60)
    want('pyyhkäisy vasemmalle: seuraava', await pg.inner_text('#roll-now')=='Muistio')
    await pg.evaluate(SWIPE+"(8)"); await pg.wait_for_timeout(40)
    want('lyhyt liike ei vaihda', await pg.inner_text('#roll-now')=='Muistio')
    want('osion nimi rivissä', await pg.inner_text('#crumb')=='Koti · Muistio')
    # Valikko: ulkopuolinen napautus vain sulkee
    await pg.click('#menu'); await pg.wait_for_timeout(60)
    ids=await pg.evaluate("Array.prototype.map.call(document.querySelectorAll('#menupop button'),function(b){return b.id;})")
    want('Valikossa projekti, vienti, ohje, Päätöspuu', ids==['m-proj','m-x','m-help','m-tree'])
    want('Valikko ruudussa', await pg.evaluate("(function(){var r=document.getElementById('menupop').getBoundingClientRect(),p=document.getElementById('pbar').getBoundingClientRect();return r.right<=innerWidth&&r.left>=0&&r.bottom<=p.top+1;})()"))
    bb=await pg.locator('#nlist .ncard').first.bounding_box(); await pg.mouse.click(bb['x']+30,bb['y']+bb['height']/2); await pg.wait_for_timeout(80)
    want('ulkopuolinen napautus sulkee, ei avaa korttia', not await pg.is_visible('#menupop') and not await pg.is_visible('#nsheet'))
    bb=await pg.locator('#roll').bounding_box(); await pg.click('#menu'); await pg.wait_for_timeout(40); await pg.mouse.click(bb['x']+20,bb['y']+bb['height']/2); await pg.wait_for_timeout(60)
    want('rullausnapin kohdalla vain sulkee', not await pg.is_visible('#menupop') and await pg.inner_text('#roll-now')=='Muistio')
    # Pikavienti
    await pg.click('#qx'); await pg.wait_for_timeout(60)
    want('pikavienti: kaksi vaihtoehtoa', await pg.locator('#qxpop button').count()==2 and 'Koti' in await pg.inner_text('#qx-proj') and 'varmuuskopio' in await pg.inner_text('#qx-all'))
    async with pg.expect_download() as dl: await pg.click('#qx-all')
    d=await dl.value; want('Vie kaikki tekee tiedoston suoraan', d.suggested_filename=='Juuri.json' and not await pg.is_visible('#vsheet') and not await pg.is_visible('#qxpop'))
    async with pg.expect_download() as dl:
        await pg.click('#qx'); await pg.wait_for_timeout(40); await pg.click('#qx-proj')
    d=await dl.value; want('Vie projekti tekee tiedoston suoraan', d.suggested_filename=='Koti (Juuri).json')
    await pg.wait_for_timeout(60); want('ilmoitus näkyy hetken ilman Kumoa', await pg.is_visible('#undo') and not await pg.is_visible('#undo-b'))
    # Ohje ja Päätöspuu Valikosta
    await menu(pg,'#m-help'); await pg.wait_for_timeout(60)
    want('ohje osion mukaan', await pg.is_visible('#hsheet') and await pg.inner_text('#hs-h')=='Muistio'); await pg.click('#hsheet .sx'); await pg.wait_for_timeout(40)
    await menu(pg,'#m-tree'); await pg.wait_for_timeout(80)
    want('Päätöspuu Valikosta', await pg.is_visible('#p-use') and await pg.inner_text('#roll-now')=='Päätöspuu' and await pg.inner_text('#crumb')=='Koti · Päätöspuu')
    await pg.click('#roll'); await pg.wait_for_timeout(40)
    want('rullaus Päätöspuusta Muistioon', await pg.inner_text('#roll-now')=='Muistio')
    # Asiat-osio
    await tab(pg,'terms'); await pg.wait_for_timeout(60)
    want('Asiat: luettelo osiossa, ei ikkunaa', await pg.is_visible('#p-terms #newterm') and await pg.locator('#p-terms .row:has-text("Kipu")').count()==1 and not await pg.is_visible('#tsheet'))
    want('osiossa vain Ehdot, muut Valikossa', await pg.is_visible('#p-terms #tt-eh') and await pg.locator('#p-terms #tt-open').count()==0 and await pg.locator('#p-terms #tdel-mode').count()==0)
    await pg.click('#menu'); await pg.wait_for_timeout(40)
    want('Asioiden Valikossa teksti ja poisto', await pg.is_visible('#menupop #tt-open') and await pg.is_visible('#menupop #tdel-mode')); await pg.mouse.click(10,120); await pg.wait_for_timeout(40)
    await pg.fill('#newterm','Kuume'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(80)
    want('Enter avaa uuden kortin, ei muuta', await pg.is_visible('#tsheet') and await pg.input_value('#tname-in')=='Kuume' and not await pg.is_visible('#hsheet'))
    await pg.click('#tok'); await pg.wait_for_timeout(60)
    want('Valmis palaa Asioihin', not await pg.is_visible('#tsheet') and await pg.locator('#p-terms .row:has-text("Kuume")').count()==1)
    await pg.locator('#p-terms .row:has-text("Kipu")').first.click(); await pg.wait_for_timeout(60)
    bb=await pg.locator('#roll').bounding_box(); await pg.mouse.click(bb['x']+20,bb['y']+bb['height']/2); await pg.wait_for_timeout(80)
    want('ikkunan ulkopuolinen napautus vain sulkee', not await pg.is_visible('#tsheet') and await pg.inner_text('#roll-now')=='Asiat')
    o=json.loads(await pg.evaluate("(function(){var w=document.documentElement.clientWidth,o=[];document.querySelectorAll('#pbar button,#p-terms button,#p-terms input').forEach(function(e){var r=e.getBoundingClientRect();if(r.width&&e.offsetParent&&(r.right>w+.5||r.left<-.5))o.push(e.id||e.className);});return JSON.stringify(o);})()"))
    want('ei mitään yli ruudun', not o)
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def desk(p):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':1280,'height':800})).new_page()
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond):
        print('  %-48s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    print('leveys 1280')
    await pg.goto(U); await pg.wait_for_timeout(200)
    want('tietokoneella sivupalkki, ei rullausta', await pg.is_visible('#nav') and not await pg.is_visible('#pbar') and await pg.is_visible('#title'))
    want('Asiat sivupalkissa', await pg.is_visible('[data-tab="terms"]'))
    await pg.click('[data-tab="use"]'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await pg.click('[data-tab="terms"]'); await pg.wait_for_timeout(60)
    want('Asiat-osiossa teksti- ja poistonapit', await pg.is_visible('#p-terms #tt-open') and await pg.is_visible('#p-terms #tdel-mode') and await pg.is_visible('#p-terms #tt-eh'))
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640)): bad+=await phone(p,w,h)
        bad+=await desk(p)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
