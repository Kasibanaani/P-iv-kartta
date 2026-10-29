"""Juuri 1.93 (Emil 26.10.2026): toistuvuus alkaen/saakka, oletuksena vuoden loppuun; toistuva teksti listalla tavallisena toistuvana kohteena
(avoinna viimeisimmästä kerrasta kuittaukseen asti); tekstissä yliviivaus vasta päättyessä; päättymisestä ilmoitusmuistiinpano. 390 ja 320 px."""
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
    ctx=await b.new_context(viewport={'width':w,'height':h}); pg=await ctx.new_page()
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond):
        print('  %-48s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    print('leveys',w)
    await pg.clock.install(time='2026-10-30T09:00:00+02:00')  # perjantai
    await pg.goto(U); await pg.wait_for_timeout(300)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0],t='2026-10-26T06:00:00.000Z';
      k.muistiinpanot=[{id:'n1',created:t,edited:t,text:'Sauna perjantaisin klo 14 vk 50 saakka',date:''},{id:'n2',created:'2026-10-01T06:00:00.000Z',edited:t,text:'Uinti tiistaisin alkaen 1.10. päättyen 20.10.',date:''}];
      k.jatkuvalista={mu:1};localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()""")
    await pg.reload(); await pg.wait_for_timeout(400); await tab(pg,'list'); await pg.wait_for_timeout(200)
    row='#chlist .crow[data-id="mu:n1:t0"]'
    want('toistuva rivi listalla', await pg.locator(row).count()==1 and (await pg.inner_text(row+' .cn')).startswith('Sauna'))
    want('päättynyt ei listalla', await pg.locator('#chlist .crow[data-id^="mu:n2"]').count()==0)
    pill=pg.locator(row+' .cpill').first
    want('kohteena Perjantai, avoinna', 'Perjantai' in (await pill.inner_text()) and 'kuittaamatta' in await pg.inner_text(row+' .cs'))
    await pill.click(); await pg.wait_for_timeout(300)
    pts=json.loads(await pg.evaluate("JSON.stringify(%s.muistiinpanot.filter(function(n){return n.id==='n1';})[0].pts||{})"%K))
    want('kuittaus koskee tätä kertaa', list(pts.keys())==['2026-10-30 14:00'])
    want('kuitattu tänään', 'kuitattu tänään' in await pg.inner_text(row+' .cs'))
    # Ilmoitus päättyneestä
    notes=json.loads(await pg.evaluate("JSON.stringify(%s.muistiinpanot.map(function(n){return n.text;}))"%K))
    want('ilmoitusmuistiinpano päättyneestä', any(t.startswith('Järjestelmäilmoitus: toistuvuus päättyi 20.10.2026.') for t in notes))
    want('järjestelmäasiasana', await pg.evaluate("%s.termit.some(function(t){return t.name==='Järjestelmäilmoitus';})"%K))
    # Seuraava viikko: maanantaina kuitattu, perjantaina taas auki
    await pg.clock.set_fixed_time('2026-11-02T09:00:00+02:00'); await pg.reload(); await pg.wait_for_timeout(400); await tab(pg,'list'); await pg.wait_for_timeout(200)
    want('välipäivänä seuraava kerta', 'seuraava' in await pg.inner_text(row+' .cs'))
    await pg.clock.set_fixed_time('2026-11-06T09:00:00+02:00'); await pg.reload(); await pg.wait_for_timeout(400); await tab(pg,'list'); await pg.wait_for_timeout(200)
    want('seuraava perjantai avaa', 'kuittaamatta' in await pg.inner_text(row+' .cs'))
    # Muistiinpanossa: ei yliviivausta kesken, päättynyt yliviivattu
    await tab(pg,'notes'); await pg.wait_for_timeout(200)
    want('kesken ei yliviivattu', await pg.locator('#nlist .ncard:has-text("Sauna") .dn').count()==0)
    # 1.98: päättynyt toistuva teksti on valmis, joten se on Kuitatuissa
    await pg.click('#noteview [data-nv="done"]'); await pg.wait_for_timeout(150)
    want('päättynyt yliviivattu', await pg.locator('#nlist .ncard:has-text("Uinti") .dn').count()==1)
    await pg.click('#noteview [data-nv="open"]'); await pg.wait_for_timeout(150)
    await pg.locator('#nlist .ncard:has-text("Sauna")').first.click(); await pg.wait_for_timeout(250)
    R=await pg.evaluate("Array.prototype.map.call(document.querySelectorAll('#ns-dlist .drow'),function(r){return r.querySelector('i').innerText;})")
    want('ajankohtana alku ja loppu', len(R)==1 and R[0].startswith('joka pe 26.10.2026–13.12.2026 klo 14.00') and 'kerta 6.11.2026 klo 14' in R[0])
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640)): bad+=await run(p,w,h)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
