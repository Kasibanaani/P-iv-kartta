"""Päätöspuun selaintesti: koko polku tekstikentästä opetukseen, kierrokseen, muistiinpanoon, termeihin ja varmuuskopioon.
Leveydet 390 ja 320 px; tarkistaa, ettei mikään mene ruudun yli eikä sivulla ole virheitä.
Käyttö: python3 testit/selain_perus.py [kuvakansio]"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
SHOTS=sys.argv[1] if len(sys.argv)>1 else None
OVER="""(function(){var w=document.documentElement.clientWidth,out=[];
 document.querySelectorAll('input,textarea,select,button').forEach(function(e){var r=e.getBoundingClientRect();
  if(r.width&&r.height&&e.offsetParent!==null&&e.type!=='file'&&(r.right>w+0.5||r.left<-0.5))out.push((e.id||e.className||e.tagName)+' '+Math.round(r.left)+'..'+Math.round(r.right));});
 var m=document.getElementById('main');return JSON.stringify({w:w,doc:document.documentElement.scrollWidth,main:[m.scrollWidth,m.clientWidth],yli:out});})()"""
TEXT="""Kissa
Koira
Ruoka
Leikki
#Eläimet: Kaikki lemmikit
>Perustelu: Lemmikki tarvitsee ruokaa joka päivä. // Toinen kappale."""
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h},device_scale_factor=2)).new_page()
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(U); await pg.wait_for_timeout(200)
    async def check(label):
        r=json.loads(await pg.evaluate(OVER)); good=not r['yli'] and r['doc']<=r['w'] and r['main'][0]<=r['main'][1]
        print('  %-30s %s %s'%(label,'ok' if good else 'YLI',r if not good else ''))
        if not good: bad.append(label)
        if SHOTS: await pg.screenshot(path=os.path.join(SHOTS,'%d-%s.png'%(w,label.replace(' ','_'))))
    def want(label,cond):
        print('  %-30s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    print('leveys',w)
    await check('alku')
    await pg.fill('#firstproj','Lemmikit'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await pg.click('#p-use .btn'); await pg.fill('#xs-text',TEXT); await check('tekstikenttä'); await pg.click('#xs-ok'); await pg.wait_for_timeout(100)
    # opetus
    await pg.click('[data-tab="teach"]'); await pg.wait_for_timeout(100)
    rows=lambda: pg.locator('#tlist [data-id]')
    want('opetuksessa 7 riviä', await rows().count()==7)
    async def tap(i): await pg.click('#tlist [data-id="%s"]'%i); await pg.wait_for_timeout(40)
    await tap('__alku'); await tap('kissa'); await tap('koira'); await tap('__alku')
    await tap('kissa'); await tap('eläimet'); await tap('perustelu'); await tap('kissa'); await tap('koira'); await check('opetus poissulku')
    want('ylä palkki punainen', await pg.get_attribute('#top','data-ed')=='x')
    await tap('kissa')
    await tap('eläimet'); await tap('ruoka'); await tap('leikki'); await pg.click('#info-done')
    want('säännöt', json.loads(await pg.evaluate("JSON.stringify(JSON.parse(localStorage.getItem('paatospuu:v1')).projektit[0].rules)"))=={'__alku':{'o':['kissa','koira'],'x':[]},'kissa':{'o':['eläimet','perustelu'],'x':['koira']},'eläimet':{'o':['ruoka','leikki'],'x':[]}})
    await check('opetus')
    await pg.click('[data-tm="mx"]'); await pg.click('#mxnew'); await pg.click('#p-teach [data-id="ruoka"]'); await pg.click('#p-teach [data-id="leikki"]'); await pg.click('#mxsave'); await check('toisensa poissulkevat')
    await pg.click('[data-tm="edit"]'); await pg.wait_for_timeout(50); await check('muokkaa')
    await pg.click('#p-teach [data-id="leikki"]'); await pg.fill('#ls-text','Leikkiminen'); await pg.click('#ls-ok'); await pg.wait_for_timeout(50)
    mx=json.loads(await pg.evaluate("JSON.stringify(JSON.parse(localStorage.getItem('paatospuu:v1')).projektit[0].mx)"))
    want('nimen vaihto seuraa', mx==[['ruoka','leikkiminen']])
    # käyttö
    await pg.click('[data-tab="use"]'); await pg.click('#start'); await pg.wait_for_timeout(50)
    opts=lambda: pg.locator('#opts [data-id]').evaluate_all("es=>es.map(e=>e.dataset.id)")
    want('alussa kissa, koira', await opts()==['kissa','koira'])
    await pg.click('#opts [data-id="kissa"]'); 
    want('koira harmaa', 'dim' in (await pg.get_attribute('#opts [data-id="koira"]','class')))
    await check('käyttö valinta'); await pg.click('#act-go'); await pg.wait_for_timeout(50)
    want('kissan jälkeen ryhmän jäsenet', await opts()==['ruoka','leikkiminen'])
    want('ilmoitus ruudussa', 'Lemmikki tarvitsee' in await pg.inner_text('#log'))
    await pg.click('#opts [data-id="ruoka"]')
    want('toisensa poissulkeva harmaa', 'dim' in (await pg.get_attribute('#opts [data-id="leikkiminen"]','class')))
    await pg.click('#act-go'); await check('käyttö loppu')
    await pg.click('#act-end'); await pg.fill('#es-note','Soita eläinlääkärille perjantaina'); await check('lopetus'); await pg.click('#es-save'); await pg.wait_for_timeout(50)
    # muistiinpanot
    await pg.click('[data-tab="notes"]'); await pg.wait_for_timeout(50)
    txt=await pg.inner_text('#nlist')
    want('muistiinpano tallentui', 'Valinnat: Kissa → Ruoka' in txt and 'perjantaina' in txt)
    await pg.click('#terms'); await pg.fill('#newterm','eläin'); await pg.keyboard.press('Enter'); await pg.fill('#tyes','kissa'); await pg.fill('#tno','lelu'); await check('termi'); await pg.click('#tok')
    await pg.click('#ts-body .btnrow .btn'); await pg.wait_for_timeout(50)
    want('termi näkyy kortissa', 'eläin' in await pg.inner_text('#nlist .nf'))
    want('päivä kortissa', await pg.locator('#nlist .nd').count()==1)
    await pg.click('#newnote'); await pg.fill('#ns-text','Muistutus 24.12. ja kahden viikon sisällä'); await check('uusi muistiinpano')
    want('päivät tunnistettu', await pg.locator('#ns-found i').count()==2)
    await pg.click('#ns-ok'); await check('muistiinpanot')
    # asetukset ja varmuuskopio
    await pg.click('[data-tab="set"]'); await pg.click('#exptxt'); await pg.wait_for_timeout(50)
    dump=await pg.input_value('#dataout textarea'); await check('asetukset')
    await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(100)
    await pg.click('[data-tab="set"]'); await pg.click('#p-set details summary'); await pg.fill('#imptext',dump); await pg.click('#impcheck'); await pg.click('#impok'); await pg.wait_for_timeout(50)
    await pg.click('[data-tab="notes"]'); want('tuonti palautti', await pg.locator('#nlist .ncard').count()==2)
    for mode in ['Tumma']:
        await pg.click('[data-tab="set"]'); await pg.click('#p-set .seg button:has-text("%s")'%mode); await check('tumma')
    print('  errs',errs); await b.close(); return bad+(['virheet'] if errs else [])
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in [(390,844),(320,640)]: bad+=await run(p,w,h)
        print('VIRHEET' if bad else 'OK',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
