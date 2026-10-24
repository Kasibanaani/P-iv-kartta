"""Juuri 1.61: korjaukset ja hyväksytyt kohdat (Emil 23.10.2026).
Pura linkki tallentuu yksinään, luonnos palautuu, Kumoa, listasta tehdyn varauksen kuittaus, ikkunan taustan lukitus, asiasanakortin osiot.
Leveydet 390 ja 320 px. Käyttö: python3 testit/selain_161.py"""
import asyncio, os, sys, json, datetime
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from apu import tab, menu, tsx
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
K="JSON.parse(localStorage.getItem('paatospuu:v1')).kokonaisuudet[0]"
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h})).new_page()
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond):
        print('  %-40s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(200)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await tab(pg,'notes'); await pg.wait_for_timeout(50)
    # Pura linkki tallentuu, vaikka mikään muu ei muutu
    await pg.click('#newnote'); await pg.fill('#ns-text','Palaveri 30.10.2026 klo 14'); await pg.dispatch_event('#ns-text','input'); await pg.click('#nsheet .sx'); await pg.wait_for_timeout(60)
    await pg.locator('#nlist .ncard:has-text("Palaveri")').click(); await pg.wait_for_timeout(60)
    await pg.evaluate("(function(){var t=document.getElementById('ns-text');t.focus();t.setSelectionRange(11,11);t.click();})()"); await pg.wait_for_timeout(80)
    want('aikalinkin valikko', await pg.is_visible('#tm-unlink'))
    await pg.click('#tm-unlink'); await pg.wait_for_timeout(40); await pg.click('#nsheet .sx'); await pg.wait_for_timeout(60)
    nl=json.loads(await pg.evaluate("JSON.stringify("+K+".muistiinpanot[0].nl||null)"))
    want('pelkkä purku tallentuu', bool(nl) and nl[0]['w'].startswith('30.10.2026'))
    # Luonnos palautuu uudelleenlatauksen jälkeen eikä tee muistiinpanoa
    n0=await pg.evaluate(K+".muistiinpanot.length")
    await pg.click('#newnote'); await pg.fill('#ns-text','Kesken jäänyt ajatus'); await pg.dispatch_event('#ns-text','input'); await pg.wait_for_timeout(900)
    await pg.reload(); await pg.wait_for_timeout(250)
    want('luonnos palautuu ikkunaan', await pg.is_visible('#nsheet') and await pg.input_value('#ns-text')=='Kesken jäänyt ajatus')
    want('luonnos ei ole muistiinpano', await pg.evaluate(K+".muistiinpanot.length")==n0)
    await pg.click('#nsheet .sx'); await pg.wait_for_timeout(60)
    want('ruksi tallentaa luonnoksen', await pg.evaluate(K+".muistiinpanot.length")==n0+1 and await pg.evaluate("localStorage.getItem('paatospuu:luonnos')") is None)
    await pg.reload(); await pg.wait_for_timeout(200); want('ei toista palautusta', not await pg.is_visible('#nsheet'))
    # Kumoa kuittauksen jälkeen
    await tab(pg,'notes'); await pg.wait_for_timeout(50)
    await pg.locator('#nlist .ncard:has-text("Kesken") .ncheck').click(); await pg.wait_for_timeout(60)
    want('Kumoa näkyy', await pg.is_visible('#undo') and 'Kuitattu' in await pg.inner_text('#undo'))
    r=await pg.evaluate("(function(){var u=document.getElementById('undo').getBoundingClientRect(),n=(document.getElementById('pbar').offsetParent?document.getElementById('pbar'):document.getElementById('nav')).getBoundingClientRect();return [u.bottom<=n.top,u.right<=innerWidth,u.left>=0];})()")
    want('Kumoa alapalkin yllä ruudussa', all(r))
    await pg.click('#undo-b'); await pg.wait_for_timeout(60)
    want('Kumoa palauttaa', not await pg.evaluate("!!"+K+".muistiinpanot.filter(function(n){return /Kesken/.test(n.teksti||n.text);})[0].done") and not await pg.is_visible('#undo'))
    # Kuittauksen peruminen ei poista ajankohtien kuittauksia
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0],n=k.muistiinpanot.filter(function(n){return /Palaveri/.test(n.teksti||n.text);})[0];n.pts={'2026-10-30 14:00':'2026-10-23T10:00:00.000Z'};localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()""")
    await pg.reload(); await pg.wait_for_timeout(150); await tab(pg,'notes'); await pg.wait_for_timeout(50)
    c=pg.locator('#nlist .ncard:has-text("Palaveri") .ncheck'); await c.click(); await pg.wait_for_timeout(40); await pg.mouse.click(5,5); await pg.wait_for_timeout(40)
    await pg.click('#noteview [data-nv="done"]'); await pg.wait_for_timeout(40)
    await pg.locator('#nlist .ncard:has-text("Palaveri") .ncheck').click(); await pg.wait_for_timeout(60)
    pts=json.loads(await pg.evaluate("JSON.stringify("+K+".muistiinpanot.filter(function(n){return /Palaveri/.test(n.teksti||n.text);})[0].pts||null)"))
    want('peruminen säilyttää kohdan kuittauksen', pts=={'2026-10-30 14:00':'2026-10-23T10:00:00.000Z'})
    await tab(pg,'notes'); await pg.click('#noteview [data-nv="open"]'); await pg.wait_for_timeout(40)
    # Listasta tehdyn varauksen kuittaus kuittaa kohteen; tuleva varaus näkyy kohteessa
    today=datetime.date.today().isoformat(); tom=(datetime.date.today()+datetime.timedelta(days=1)).isoformat()
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0];k.termit=(k.termit||[]).concat([{id:'tv1',name:'Kävely',yes:[],no:[],dur:30},{id:'tv2',name:'Lukeminen',yes:[],no:[],dur:30}]);
      k.tarkistuslista=(k.tarkistuslista||[]).concat([{id:'rv',name:'Arki',created:'2026-10-01T00:00:00.000Z',it:[{id:'tv1'},{id:'tv2'}]}]);
      k.muistiinpanot=k.muistiinpanot.concat([{id:'nv1',created:'2026-10-23T08:00:00.000Z',edited:'2026-10-23T08:00:00.000Z',teksti:'Tarkistuslistasta: Arki – Kävely',text:'Tarkistuslistasta: Arki – Kävely',paiva:'TODAY',date:'TODAY',time:{s:'17:30',e:'18:00'},pl:{r:'rv',i:'tv1'},pts:{'TODAY 17:30':'2026-10-23T18:00:00.000Z'}},
        {id:'nv2',created:'2026-10-23T08:00:00.000Z',edited:'2026-10-23T08:00:00.000Z',teksti:'Tarkistuslistasta: Arki – Lukeminen',text:'Tarkistuslistasta: Arki – Lukeminen',paiva:'TOM',date:'TOM',time:{s:'09:00',e:'09:30'},pl:{r:'rv',i:'tv2'}}]);
      localStorage.setItem('paatospuu:v1',JSON.stringify(o).replace(/TODAY/g,'%s').replace(/TOM/g,'%s'));})()"""%(today,tom))
    await pg.reload(); await pg.wait_for_timeout(150); await tab(pg,'notes'); await pg.wait_for_timeout(40); await tab(pg,'list'); await pg.wait_for_timeout(60)
    row=pg.locator('#chlist .crow:has-text("Arki")')
    if await row.get_attribute('class') and 'open' not in await row.get_attribute('class'): await row.locator('.chd').click(); await pg.wait_for_timeout(50)
    want('varauksen kuittaus kuittasi kohteen', await row.locator('.cpill.ok:has-text("Kävely")').count()==1)
    want('tuleva varaus näkyy kohteessa', 'varattu' in await row.locator('.cpill:has-text("Lukeminen")').inner_text())
    ok1=json.loads(await pg.evaluate("JSON.stringify("+K+".tarkistuslista.filter(function(r){return r.id==='rv';})[0].it)"))
    want('kuittausaika varauksesta', [x for x in ok1 if x['id']=='tv1'][0].get('ok')=='2026-10-23T18:00:00.000Z')
    # Ikkuna auki: tausta lukittu
    await menu(pg,'#m-proj'); await pg.wait_for_timeout(80)
    want('ikkuna lukitsee taustan', await pg.evaluate("document.documentElement.classList.contains('modal')&&getComputedStyle(document.getElementById('main')).overflowY==='hidden'"))
    await pg.click('#psheet .sx'); await pg.wait_for_timeout(80)
    want('sulkeminen vapauttaa', not await pg.evaluate("document.documentElement.classList.contains('modal')"))
    # Asiasanakortin osiot ja yhteenveto
    await tab(pg,'terms'); await pg.wait_for_timeout(50); await pg.locator('#p-terms .row:has-text("Kävely")').first.click(); await pg.wait_for_timeout(50)
    want('osiot Tunnistus, Listassa, Muut', await pg.locator('#tsheet details.tsec').count()==3 and await pg.is_visible('#ti-yes') and not await pg.is_visible('#tdur'))
    want('suljetun osion yhteenveto', 'kesto 30 min' in await pg.inner_text('#tsec-lista summary'))
    o=json.loads(await pg.evaluate("(function(){var w=document.documentElement.clientWidth,out=[];document.querySelectorAll('#tsheet summary').forEach(function(e){var r=e.getBoundingClientRect();if(r.right>w+0.5)out.push(1);});return JSON.stringify(out);})()"))
    want('ei yli ruudun', not o)
    await tsx(pg); await pg.wait_for_timeout(40)
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640)): bad+=await run(p,w,h)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
