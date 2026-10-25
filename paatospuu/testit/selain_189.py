"""Juuri 1.89 (Emil 26.10.2026): päätöspuun säännöt samoina ehtoina kuin listoissa, puuhun rajattuina (Asiat → Ehdot → Puu: nimi).
Puun tekstin säännöt näkyvät ehtoina, muokkaus kirjoittaa ne puun sääntöihin ja tekstiin, Poissulkevat = toisensa poissulkevat, puun esteet.
Leveydet 390 ja 320 px. Käyttö: python3 testit/selain_189.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from apu import tab, menu
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
K="JSON.parse(localStorage.getItem('paatospuu:v1')).kokonaisuudet[0]"
TXT='Kipu\nKuume\nLääkäri\nLepo\n\n=Alku avaa:\nKipu\nKuume\n\n=Kipu avaa:\nLääkäri'
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h})).new_page()
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond):
        print('  %-48s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    pick=lambda sec,name: pg.locator('#eh-body .ehps[data-sec="%s"] .ehp'%sec,has_text=name).first.click()
    tree=lambda: pg.evaluate("JSON.parse(JSON.stringify(%s.puut.filter(function(P){return P.id==='p1';})[0]))"%K)
    rows=lambda: pg.evaluate("Array.prototype.map.call(document.querySelectorAll('#eh-body details.ehtree[data-p=\"p1\"] .ehr .ehtx'),function(e){return e.innerText.replace(/\\n/g,' ');})")
    async def openT():
        if not await pg.evaluate("document.querySelector('#eh-body details.ehtree[data-p=\"p1\"]').open"): await pg.click('#eh-body details.ehtree[data-p="p1"] summary'); await pg.wait_for_timeout(60)
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(200)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await pg.evaluate("""(function(T){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0];
      k.puut=[{id:'p1',name:'Arvio',text:T,rt:1}];k.cur='p1';localStorage.setItem('paatospuu:v1',JSON.stringify(o));})""",TXT)
    await pg.reload(); await pg.wait_for_timeout(250); await tab(pg,'terms'); await pg.wait_for_timeout(60); await pg.click('#tt-eh'); await pg.wait_for_timeout(250)
    want('puun osio Ehdoissa', 'Puu: Arvio' in await pg.inner_text('#eh-body details.ehtree[data-p="p1"] summary'))
    await openT(); R=await rows()
    want('säännöt ehtoina', R==['Alku tuo Kipu, Kuume','Kipu tuo Lääkäri'])
    # Muokkaus: Kipu tuo myös Levon
    await pg.locator('#eh-body details.ehtree[data-p="p1"] .ehr').nth(1).click(); await pg.wait_for_timeout(80)
    want('puun ehto otsikossa', 'Puu: Arvio' in await pg.inner_text('#eh-body .ehtp'))
    await pg.click('#eh-t'); await pg.wait_for_timeout(40)
    secs=await pg.evaluate("Array.prototype.map.call(document.querySelectorAll('#eh-pick .ehsub'),function(e){return e.textContent;})")
    want('valittavina vain puun palikat', secs==['Palikat'] and await pg.locator('#eh-new').count()==0)
    await pick('t','Lepo'); await pg.wait_for_timeout(80)
    T=await tree()
    want('kirjoittuu puun sääntöön ja tekstiin', 'lepo' in T['rules']['kipu']['o'] and '=Kipu avaa:\nLääkäri\nLepo' in T['text'])
    await pg.click('#eh-done'); await pg.wait_for_timeout(80)
    # Poissulkevat
    await openT(); await pg.locator('#eh-body details.ehtree[data-p="p1"] .btnrow button').click(); await pg.wait_for_timeout(80)
    await pg.locator('#eh-ty button:has-text("Poissulkevat")').click(); await pg.wait_for_timeout(40)
    await pick('k','Lääkäri'); await pick('k','Lepo'); await pg.wait_for_timeout(60); await pg.click('#eh-done'); await pg.wait_for_timeout(80)
    T=await tree()
    want('Poissulkevat = toisensa poissulkevat', T.get('mx')==[['lääkäri','lepo']] and '=Toisensa poissulkevat:\nLääkäri\nLepo' in T['text'])
    # Este: Kaikki samaan kohteeseen, joka tulee jo Jokin-ehdosta
    await openT(); await pg.locator('#eh-body details.ehtree[data-p="p1"] .btnrow button').click(); await pg.wait_for_timeout(80)
    await pg.locator('#eh-ty button:has-text("Kaikki")').click(); await pick('k','Kipu'); await pick('k','Kuume'); await pg.click('#eh-t'); await pg.wait_for_timeout(40)
    await pick('t','Lääkäri'); await pg.wait_for_timeout(80)
    want('puun este kerrotaan', 'Jokin' in await pg.inner_text('#undo-t') and not (await tree()).get('need',{}).get('lääkäri'))
    await pick('t','Lepo'); await pg.wait_for_timeout(80)
    want('Jokin ja Kaikki samaan kohteeseen estetty myös Levolle', not (await tree()).get('need',{}).get('lepo'))
    await pg.click('#eh-done'); await pg.wait_for_timeout(80)
    # Alku ei poissulje: Alku tarjolla vain Jokin → Tuo
    await openT(); await pg.locator('#eh-body details.ehtree[data-p="p1"] .btnrow button').click(); await pg.wait_for_timeout(80)
    want('Alku tarjolla Jokin → Tuo -syynä', await pg.locator('#eh-body .ehps[data-sec="k"] .ehp',has_text='Alku').count()==1)
    await pg.locator('#eh-verb button:has-text("Poissulkee")').click(); await pg.wait_for_timeout(60)
    if not await pg.locator('#eh-pick').count(): await pg.click('#eh-k'); await pg.wait_for_timeout(40)
    want('valitsin auki', await pg.locator('#eh-body .ehps[data-sec="k"] .ehp',has_text='Kipu').count()==1)
    want('ei Poissulkee-ehdossa', await pg.locator('#eh-body .ehps[data-sec="k"] .ehp',has_text='Alku').count()==0)
    if os.environ.get('KUVA'): await pg.screenshot(path=os.environ['KUVA']+'/e189_%d.png'%w)
    want('mahtuu leveyteen', await pg.evaluate("(function(){var W=document.documentElement.clientWidth,o=0;document.querySelectorAll('#ehsheet button').forEach(function(e){var r=e.getBoundingClientRect();if(r.width&&r.right>W+.5)o++;});return o;})()")==0)
    await pg.click('#eh-done'); await pg.wait_for_timeout(80)
    # Teksti -> ehdot: muutos puun tekstissä näkyy Ehdoissa
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),P=o.kokonaisuudet[0].puut[0];P.text=P.text.replace('=Kipu avaa:\\nLääkäri\\nLepo','=Kipu avaa:\\nLääkäri\\n\\n=Kuume sulkee:\\nLepo');localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()""")
    await pg.reload(); await pg.wait_for_timeout(250); await tab(pg,'terms'); await pg.wait_for_timeout(60); await pg.click('#tt-eh'); await pg.wait_for_timeout(250); await openT()
    R=await rows()
    if os.environ.get('DBG'): print(R, json.dumps((await tree())['text']))
    want('puun teksti näkyy ehtoina', any(r.startswith('Kipu tuo Lääkäri') for r in R) and 'Kuume poissulkee Lepo' in R and any(r.startswith('Poissulkevat') for r in R))
    want('projektin ehdot ennallaan', await pg.evaluate("(%s.ehdot||[]).length"%K)==0)
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640)): bad+=await run(p,w,h)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
