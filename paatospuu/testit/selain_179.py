"""Juuri 1.79: teksti syynä ja seurauksena, tunnistussanat ehtoina, asiasanakortin ilmoitusosio (Emil 24.10.2026).
"lääk" lainausmerkeissä on teksti (osuu listan rivien teksteihin), tekstiseuraus näkyy listan ilmoituksena ja Lopeta-muistiinpanossa.
Kortilla ei sanakenttiä: Tulee, kun / Pois, kun / Tuo ja + Ehto tälle asialle. Leveydet 390 ja 320 px. Käyttö: python3 testit/selain_179.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from apu import tab, menu, tsx
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
K="JSON.parse(localStorage.getItem('paatospuu:v1')).kokonaisuudet[0]"
OVER="""(function(){var w=document.documentElement.clientWidth,out=[];document.querySelectorAll('input,textarea,select,button').forEach(function(e){var r=e.getBoundingClientRect();
 if(r.width&&r.height&&e.offsetParent!==null&&(r.right>w+0.5||r.left<-0.5))out.push(e.id||e.className||e.tagName);});return JSON.stringify(out);})()"""
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h})).new_page()
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond):
        print('  %-48s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    async def pills(rid):
        c=pg.locator('#chlist .crow[data-id="%s"]'%rid)
        if 'open' not in (await c.get_attribute('class')): await c.locator('.chd').click(); await pg.wait_for_timeout(50)
        return await pg.evaluate("Array.prototype.map.call(document.querySelectorAll('#chlist .crow[data-id=\"%s\"] .cpill'),function(b){return b.dataset.tid+(b.classList.contains('ok')?'+':'');})"%rid)
    async def close(rid):
        c=pg.locator('#chlist .crow[data-id="%s"]'%rid)
        if 'open' in (await c.get_attribute('class')): await c.locator('.chd').click(); await pg.wait_for_timeout(50)
    E=lambda: pg.evaluate("JSON.parse(JSON.stringify("+K+".ehdot||[]))")
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(200)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0];
      k.termit=[{id:'ta',name:'Kipu',yes:['särky'],no:['ei kipua']},{id:'tb',name:'Lääkäri',yes:[],no:[]},{id:'tc',name:'Soitto',yes:[],no:[]}];
      k.listat=[{id:'L1',name:'Arvio',created:'2026-10-01T00:00:00.000Z',eh:1}];
      k.tarkistuslista=[{id:'r1',name:'Oireet',l:'L1',created:'2026-10-01T00:00:00.000Z',it:[{id:'ta'}]},{id:'r2',name:'Soita lääkärille',l:'L1',created:'2026-10-02T00:00:00.000Z',it:[{id:'tc'}]},
        {id:'r3',name:'Toimet',l:'L1',created:'2026-10-03T00:00:00.000Z',it:[{id:'tb'}]}];
      localStorage.setItem('paatospuu:v1',JSON.stringify(o));localStorage.setItem('paatospuu:lista:'+k.id,'L1');})()""")
    await pg.reload(); await pg.wait_for_timeout(200); await tab(pg,'terms'); await pg.wait_for_timeout(60); await pg.click('#tt-eh'); await pg.wait_for_timeout(250)
    # Ehto 1: Kun "lääk" -> Tuo Lääkäri
    await pg.click('#eh-add'); await pg.wait_for_timeout(60)
    want('kenttä: asiasana tai "teksti"', 'teksti' in await pg.get_attribute('#eh-new','placeholder'))
    await pg.fill('#eh-new','“lääk”'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(60)
    want('teksti syylaatikossa lainausmerkeissä', await pg.inner_text('#eh-cause .ehc.q')=='“lääk”' and (await E())[0]['k']==['q:lääk'])
    want('ei uutta asiasanaa tekstistä', await pg.evaluate(K+".termit.length")==3)
    await pg.click('#eh-t'); await pg.wait_for_timeout(30); await pg.click('#eh-body .ehps[data-sec="t"] .ehp[data-tid="tb"]'); await pg.wait_for_timeout(30)
    await pg.click('#eh-done'); await pg.wait_for_timeout(60)
    # Ehto 2: Kun Kipu -> Tuo "Soita ennen klo 10"
    await pg.click('#eh-add'); await pg.wait_for_timeout(60); await pg.click('#eh-body .ehps[data-sec="k"] .ehp[data-tid="ta"]'); await pg.click('#eh-t'); await pg.wait_for_timeout(30)
    await pg.fill('#eh-new','"Soita ennen klo 10"'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(60)
    want('teksti seurauksena', await pg.inner_text('#eh-eff .ehc.q')=='“Soita ennen klo 10”' and (await E())[1]['on']==['q:Soita ennen klo 10'])
    want('Tekstit-osio valinnassa', await pg.locator('#eh-pick .ehp[data-tid="q:lääk"]').count()==1)
    want('mahtuu', json.loads(await pg.evaluate(OVER))==[])
    if os.environ.get('KUVA'): await pg.screenshot(path=os.environ['KUVA']+'/e179a_%d.png'%w)
    await pg.click('#eh-done'); await pg.wait_for_timeout(60)
    t=await pg.inner_text('#eh-body')
    want('yhteenvedossa tekstit', '“lääk”' in t and 'tuo “Soita ennen klo 10”' in t)
    want('Tunnistus-osio yhteenvedossa', await pg.locator('#eh-tun .ehr[data-w="ta"]').count()==1)
    await pg.click('#ehsheet .sx'); await pg.wait_for_timeout(80)
    # Lista
    await tab(pg,'list'); await pg.wait_for_timeout(80)
    want('teksti syynä tuo Lääkärin (rivin teksti)', 'tb' in await pills('r3'))
    await close('r3')
    want('ei ilmoitusta ennen syytä', await pg.locator('#chk-say').count()==0)
    await pills('r1'); await pg.locator('#chlist .crow[data-id="r1"] .cpill[data-tid="ta"]').click(); await pg.wait_for_timeout(80); await close('r1')
    want('tekstiseuraus listan ilmoituksena', await pg.is_visible('#chk-say') and 'Soita ennen klo 10' in await pg.inner_text('#chk-say'))
    if os.environ.get('KUVA'): await pg.screenshot(path=os.environ['KUVA']+'/e179b_%d.png'%w)
    await pg.click('#chk-end'); await pg.wait_for_timeout(100)
    want('Lopeta tallentaa ilmoituksen', 'Ilmoitukset: Soita ennen klo 10' in await pg.evaluate(K+".muistiinpanot[0].text"))
    # Asiasanakortti: ilmoitusosio
    await tab(pg,'terms'); await pg.wait_for_timeout(60); await pg.locator('#p-terms .row[data-id="ta"]').first.click(); await pg.wait_for_timeout(200)
    want('kortilla ei sanakenttiä', await pg.locator('#tyes').count()==0 and await pg.locator('#tno').count()==0)
    ti=await pg.inner_text('#t-info')
    want('Tulee, kun tekstissä / Ei, kun / Tuo', '“särky”' in await pg.inner_text('#ti-yes') and '“ei kipua”' in await pg.inner_text('#ti-no') and 'Tuo' in ti and 'Soita ennen klo 10' in ti)
    await pg.click('#t-addeh'); await pg.wait_for_timeout(250)
    want('+ Ehto: asia valmiina seurauksena', await pg.is_visible('#ehsheet') and await pg.inner_text('#eh-eff .ehc')=='Kipu' and await pg.is_visible('#eh-pick'))
    await pg.click('#eh-body .ehps[data-sec="k"] .ehp[data-tid="tb"]'); await pg.wait_for_timeout(40); await pg.click('#eh-done'); await pg.wait_for_timeout(250)
    want('Valmis palaa korttiin, rivi päivittyy', not await pg.is_visible('#ehsheet') and await pg.is_visible('#tsheet') and 'Lääkäri' in await pg.inner_text('#t-info'))
    # Tunnistussanat ehtona kortilta
    await pg.click('#ti-yes'); await pg.wait_for_timeout(250)
    want('tunnistus ehtona: Kun tekstissä → Tuo Kipu', await pg.is_visible('#ehsheet') and await pg.inner_text('#eh-h')=='Tunnistus' and (await pg.inner_text('#crumb')).endswith('Asiat › Tunnistus') and await pg.locator('#ehw-y .ehp[data-w="särky"]').count()==1)
    await pg.fill('#ehw-y-in','Kolotus'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(60)
    await pg.locator('#ehw-y .ehp[data-w="särky"]').click(); await pg.wait_for_timeout(60)
    T=json.loads(await pg.evaluate("JSON.stringify("+K+".termit[0])"))
    want('sanat tallentuvat asiasanalle', T['yes']==['kolotus'] and T['no']==['ei kipua'])
    await pg.click('#ehsheet .sx'); await pg.wait_for_timeout(250)
    want('paluu korttiin, kortti päivittyy', await pg.is_visible('#tsheet') and '“kolotus”' in await pg.inner_text('#ti-yes'))
    await pg.click('#tok'); await pg.wait_for_timeout(100)
    T=json.loads(await pg.evaluate("JSON.stringify("+K+".termit[0])"))
    want('kortin Valmis säilyttää sanat', T['yes']==['kolotus'] and T['no']==['ei kipua'])
    # Ehto ilman syytä ei jää
    await pg.locator('#p-terms .row[data-id="tc"]').first.click(); await pg.wait_for_timeout(200); n0=len(await E())
    await pg.click('#t-addeh'); await pg.wait_for_timeout(250); await pg.click('#ehsheet .sx'); await pg.wait_for_timeout(250)
    want('syytön ehto poistuu', len(await E())==n0 and await pg.is_visible('#tsheet'))
    await tsx(pg)
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640)): bad+=await run(p,w,h)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
