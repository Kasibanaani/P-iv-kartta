"""Juuri 1.87: listan kohteen kuittaus uusiutuu myös tiettyinä viikonpäivinä ja kuun päivinä (Emil 25.10.2026), aikavälin lisäksi tai sijaan.
Asiasanakortin Listassa-osiossa viikonpäivät ja kuun päivät napautettavina, yhteenveto, tallennus, ja lista laukeaa valitun päivän alkaessa.
Leveydet 390 ja 320 px. Käyttö: python3 testit/selain_187.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from apu import tab, menu
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
K="JSON.parse(localStorage.getItem('paatospuu:v1')).kokonaisuudet[0]"
async def run(p,w,h):
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
    # Kortti: viikonpäivät ja kuun päivät
    await tab(pg,'terms'); await pg.wait_for_timeout(80)
    await pg.fill('#newterm','Kastelu'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(250)
    await pg.evaluate("document.getElementById('tsec-lista').open=true"); await pg.wait_for_timeout(60)
    want('viikonpäivät ma–su ja kuun päivät 1–31', await pg.evaluate("Array.prototype.map.call(document.querySelectorAll('#twd button'),function(b){return b.textContent;}).join(' ')")=='ma ti ke to pe la su' and await pg.locator('#tmd button').count()==31)
    await pg.select_option('#tev','7'); await pg.click('#twd button[data-v="1"]'); await pg.click('#twd button[data-v="4"]')
    for d in ('15','1'):
        await pg.locator('#tmd button[data-v="%s"]'%d).scroll_into_view_if_needed(); await pg.click('#tmd button[data-v="%s"]'%d)
    s=await pg.inner_text('#tsec-lista summary')
    want('yhteenveto: aika, viikonpäivät ja kuun päivät', 'uusiutuu 7 pv, ma to, kuun 1., 15.' in s)
    await pg.click('#twd button[data-v="4"]')
    want('toinen napautus poistaa', await pg.get_attribute('#twd button[data-v="4"]','aria-pressed')=='false' and 'ma, kuun' in await pg.inner_text('#tsec-lista summary'))
    want('mahtuu leveyteen', await pg.evaluate("(function(){var W=document.documentElement.clientWidth,o=0;document.querySelectorAll('#tsheet button').forEach(function(e){var r=e.getBoundingClientRect();if(r.width&&r.right>W+.5)o++;});return o;})()")==0)
    if os.environ.get('KUVA'): await pg.screenshot(path=os.environ['KUVA']+'/e187_%d.png'%w)
    await pg.click('#tok'); await pg.wait_for_timeout(150)
    t=[x for x in json.loads(await pg.evaluate("JSON.stringify(%s.termit)"%K)) if x['name']=='Kastelu'][0]
    want('tallentuu asiasanalle', t.get('ev')==7 and t.get('wd')==[1] and t.get('md')==[1,15])
    want('rivillä yhteenveto', 'uusiutuu 7 pv, ma, kuun 1., 15.' in await pg.inner_text('#p-terms .row:has-text("Kastelu")'))
    await pg.locator('#p-terms .row:has-text("Kastelu")').first.click(); await pg.wait_for_timeout(250)
    await pg.evaluate("document.getElementById('tsec-lista').open=true")
    want('avautuu valintoineen', await pg.get_attribute('#twd button[data-v="1"]','aria-pressed')=='true' and await pg.get_attribute('#tmd button[data-v="15"]','aria-pressed')=='true')
    await pg.click('#tok'); await pg.wait_for_timeout(100)
    # Lista: eilinen viikonpäivä laukaisee toissapäivän kuittauksen, huominen ei; tämän päivän kuun päivä laukaisee eilisen
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0],d=new Date();
      function at(n){var x=new Date(d.getFullYear(),d.getMonth(),d.getDate()-n,10);return x.toISOString();}
      var yw=new Date(d.getFullYear(),d.getMonth(),d.getDate()-1).getDay(),tw=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1).getDay();
      k.termit=[{id:'ta',name:'Eilen',yes:[],no:[],wd:[yw]},{id:'tb',name:'Huomenna',yes:[],no:[],wd:[tw]},{id:'tc',name:'Kuun päivä',yes:[],no:[],md:[d.getDate()]},{id:'td',name:'Viikko',yes:[],no:[],ev:7,wd:[tw]}];
      k.tarkistuslista=[{id:'r1',name:'Koti',created:at(5),edited:at(5),it:[{id:'ta',ok:at(2)},{id:'tb',ok:at(2)},{id:'tc',ok:at(1)},{id:'td',ok:at(1)}]}];
      localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()""")
    await pg.reload(); await pg.wait_for_timeout(250)
    await tab(pg,'list'); await pg.wait_for_timeout(150)
    if await pg.locator('#chlist .cpill').count()<4: await pg.click('#chlist .crow .chd'); await pg.wait_for_timeout(150)
    pills=await pg.evaluate("Array.prototype.map.call(document.querySelectorAll('#chlist .cpill'),function(b){return b.textContent.replace('✓','').trim()+(b.getAttribute('aria-pressed')==='true'?'+':'');})")
    want('eilinen viikonpäivä ja kuun päivä laukaisivat', 'Eilen' in pills and 'Kuun päivä' in pills)
    want('huominen viikonpäivä ei vielä', 'Huomenna+' in pills and 'Viikko+' in pills)
    want('rivillä kaksi kuittaamatta', '2 kuittaamatta' in await pg.inner_text('#chlist'))
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640)): bad+=await run(p,w,h)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
