"""Juuri 1.74: isot ikkunat ilman otsikkoriviä puhelimella (Emil 24.10.2026, kuva 1). Nimi yläreunan pienessä rivissä,
oma alapalkki: vasemmalla ‹ paluukohde (sulkee ja tallentaa), oikealla ohje. Tietokoneella otsikkorivi ja ruksi ennallaan.
Leveydet 390 ja 320 px, tietokone 1280 px. Käyttö: python3 testit/selain_174.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from apu import tab, menu, tsx
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
SEED="""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0];k.name='Koti';k.termit=[{id:'ta',name:'Kipu',yes:['kipu'],no:[]}];
  k.muistiinpanot=[{id:'n1',created:'2026-10-20T08:00:00.000Z',edited:'2026-10-20T08:00:00.000Z',teksti:'Kipu jatkuu',text:'Kipu jatkuu',paiva:'',date:''}];
  localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()"""
async def phone(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h})).new_page()
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond):
        print('  %-48s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(200)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await pg.evaluate(SEED); await pg.reload(); await pg.wait_for_timeout(200)
    await pg.locator('#nlist .ncard').first.click(); await pg.wait_for_timeout(150)
    want('ei otsikkoriviä', not await pg.is_visible('#nsheet .hrow') and not await pg.is_visible('#ns-h'))
    want('nimi yläreunan rivissä', await pg.inner_text('#crumb')=='Koti · Muistio › Muistiinpano')
    g=await pg.evaluate("""(function(){var d=document.getElementById('nsheet'),r=d.getBoundingClientRect(),b=d.querySelector('.dbar').getBoundingClientRect(),x=d.querySelector('.sx').getBoundingClientRect(),i=d.querySelector('.dhelp').getBoundingClientRect(),c=document.getElementById('crumb').getBoundingClientRect();
      return [Math.round(innerHeight-b.bottom),x.left<40,i.right>innerWidth-60,r.top>=c.bottom-1,Math.round(b.height)];})()""")
    want('oma alapalkki alhaalla: ‹ vasemmalla, i oikealla', g[0]==0 and g[1] and g[2] and g[4]<=60)
    want('yläreunan rivi näkyy ikkunan yllä', g[3])
    want('paluunappi kertoo kohteen', await pg.inner_text('#nsheet .sx')=='‹ Muistio')
    # Ohje ikkunan palkista
    await pg.click('#nsheet .dhelp'); await pg.wait_for_timeout(100)
    want('i avaa ikkunan ohjeen', await pg.is_visible('#hsheet') and await pg.inner_text('#hs-h')=='Muistiinpano' and await pg.inner_text('#crumb')=='Koti · Muistio › Muistiinpano')
    want('ohjeessa paluu muistiinpanoon, ei i:tä', await pg.inner_text('#hsheet .sx')=='‹ Muistiinpano' and not await pg.is_visible('#hsheet .dhelp'))
    await pg.click('#hsheet .sx'); await pg.wait_for_timeout(80)
    want('paluu ohjeesta muistiinpanoon', not await pg.is_visible('#hsheet') and await pg.is_visible('#nsheet') and await pg.inner_text('#crumb')=='Koti · Muistio › Muistiinpano')
    # Sisäkkäinen ikkuna: asiasanakortti muistiinpanosta
    await pg.locator('#ns-found i.th[role="button"]').first.click(); await pg.wait_for_timeout(120)
    want('kortin paluu: ‹ Muistiinpano', await pg.is_visible('#tsheet') and await pg.inner_text('#tsheet .sx')=='‹ Muistiinpano' and await pg.inner_text('#crumb')=='Koti · Muistio › Asiasana')
    await pg.click('#tsheet .sx'); await pg.wait_for_timeout(80)
    want('palaa muistiinpanoon', not await pg.is_visible('#tsheet') and await pg.is_visible('#nsheet'))
    # Paluu tallentaa kuten ruksi
    await pg.fill('#ns-text','Kipu jatkuu yhä'); await pg.dispatch_event('#ns-text','input')
    await pg.click('#nsheet .sx'); await pg.wait_for_timeout(100)
    t=await pg.evaluate("(function(n){return n.teksti||n.text;})(JSON.parse(localStorage.getItem('paatospuu:v1')).kokonaisuudet[0].muistiinpanot[0])")
    want('paluu sulkee ja tallentaa', not await pg.is_visible('#nsheet') and t=='Kipu jatkuu yhä' and await pg.inner_text('#crumb')=='Koti · Muistio')
    # Valikosta avattu ikkuna
    await menu(pg,'#m-proj'); await pg.wait_for_timeout(100)
    want('Projekti: paluu osioon', await pg.inner_text('#psheet .sx')=='‹ Muistio' and await pg.inner_text('#crumb')=='Koti · Muistio › Projekti')
    o=await pg.evaluate("(function(){var w=document.documentElement.clientWidth,o=0;document.querySelectorAll('#psheet .dbar button').forEach(function(e){var r=e.getBoundingClientRect();if(e.offsetParent&&(r.right>w+.5||r.left<-.5))o++;});return o;})()")
    want('palkki mahtuu', o==0)
    await pg.click('#psheet .sx'); await pg.wait_for_timeout(80)
    await tab(pg,'list'); await pg.wait_for_timeout(60); await pg.click('#chlist-pick'); await pg.wait_for_timeout(100)
    want('Listat-ikkuna: paluu Listoihin', await pg.inner_text('#wsheet .sx')=='‹ Listat' and await pg.inner_text('#crumb')=='Koti · Listat › Listat')
    await pg.click('#wsheet .sx'); await pg.wait_for_timeout(60)
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
    await pg.click('[data-tab="use"]'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await pg.evaluate(SEED); await pg.reload(); await pg.wait_for_timeout(200)
    await pg.click('[data-tab="notes"]'); await pg.wait_for_timeout(60); await pg.locator('#nlist .ncard').first.click(); await pg.wait_for_timeout(150)
    want('tietokone: otsikkorivi ja ruksi', await pg.is_visible('#ns-h') and await pg.is_visible('#nsheet .hrow .sx') and not await pg.is_visible('#nsheet .dbar'))
    await pg.click('#nsheet .sx'); await pg.wait_for_timeout(80)
    want('ruksi sulkee', not await pg.is_visible('#nsheet'))
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640)): bad+=await phone(p,w,h)
        bad+=await desk(p)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
