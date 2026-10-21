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
TEXT="""?Apu: Onko lemmikki kotona?
Kissa
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
    await pg.click('#p-use .btn'); await pg.fill('#xs-text',TEXT+'\n// oma osio\nkissa\nKeskeneräi'); await pg.wait_for_timeout(50); await check('tekstikenttä')
    ks=await pg.evaluate("Array.prototype.map.call(document.querySelectorAll('#xs-hl > span'),function(e){return e.className;})")
    want('värit rivityypeistä', 'k-q' in ks and 'k-g' in ks and 'k-t' in ks and 'k-c' in ks and ks.count('k-w')==1)
    al=await pg.evaluate("(function(){var a=document.getElementById('xs-text'),b=document.getElementById('xs-hl');return [a.scrollHeight,b.scrollHeight,b.textContent.replace(/\u200b/,'')===a.value,a.clientHeight,b.clientHeight,a.clientWidth,b.clientWidth];})()")
    want('väripinta kohdallaan', abs(al[0]-al[1])<=2 and al[2] and al[3]==al[4] and al[5]==al[6])
    await pg.fill('#xs-text',TEXT); await pg.click('#xs-ok'); await pg.wait_for_timeout(100)
    # opetus
    await pg.click('[data-tab="teach"]'); await pg.wait_for_timeout(100)
    rows=lambda: pg.locator('#tlist [data-id]')
    want('opetuksessa 8 riviä', await rows().count()==8)
    async def tap(i): await pg.click('#tlist [data-id="%s"]'%i); await pg.wait_for_timeout(40)
    await tap('__alku'); await tap('kissa'); await tap('koira'); await tap('__alku')
    await tap('kissa'); await tap('eläimet'); await tap('perustelu'); await tap('apu'); await tap('kissa'); await tap('koira'); await check('opetus poissulku')
    want('ylä palkki punainen', await pg.get_attribute('#top','data-ed')=='x')
    await tap('kissa')
    want('kolmas napautus: ehdot', await pg.get_attribute('#top','data-ed')=='c' and await pg.is_visible('#needmode')); await check('opetus ehdot')
    await tap('kissa')
    await tap('perustelu'); await pg.click('#needmode [data-need="all"]'); await tap('ruoka'); await tap('perustelu')
    need=json.loads(await pg.evaluate("JSON.stringify(JSON.parse(localStorage.getItem('paatospuu:v1')).projektit[0].need||{})"))
    want('ilmoitus: kaikki tarvitaan', need=={'perustelu':['kissa','ruoka']})
    await tap('perustelu'); await pg.click('#needmode [data-need="one"]'); await tap('perustelu')
    want('takaisin yksi riittää', json.loads(await pg.evaluate("JSON.stringify(JSON.parse(localStorage.getItem('paatospuu:v1')).projektit[0].need||{})"))=={})
    await tap('perustelu'); await tap('ruoka'); await tap('perustelu')
    await tap('eläimet'); await tap('ruoka'); await tap('leikki'); await pg.click('#info-done')
    want('säännöt', json.loads(await pg.evaluate("JSON.stringify(JSON.parse(localStorage.getItem('paatospuu:v1')).projektit[0].rules)"))=={'__alku':{'o':['kissa','koira'],'x':[]},'kissa':{'o':['eläimet','apu','perustelu'],'x':['koira']},'eläimet':{'o':['ruoka','leikki'],'x':[]}})
    await check('opetus')
    await pg.click('[data-tm="mx"]'); await pg.click('#mxnew'); await pg.click('#p-teach [data-id="ruoka"]'); await pg.click('#p-teach [data-id="leikki"]'); await pg.click('#mxsave'); await check('toisensa poissulkevat')
    await pg.click('[data-tm="edit"]'); await pg.wait_for_timeout(50); await check('muokkaa')
    await pg.click('[data-move="ruoka|-1"]'); await pg.click('[data-move="ruoka|1"]')
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
    want('apukysymys näkyy', 'Onko lemmikki kotona?' in await pg.inner_text('#qbar'))
    await pg.evaluate("document.getElementById('main').scrollTop=400"); await check('apukysymys vieritettynä')
    await pg.click('#opts [data-id="ruoka"]')
    want('toisensa poissulkeva harmaa', 'dim' in (await pg.get_attribute('#opts [data-id="leikkiminen"]','class')))
    await pg.click('#act-go'); await check('käyttö loppu')
    want('apukysymys poistui', await pg.locator('#qbar').count()==0)
    await pg.click('#act-end'); await pg.fill('#es-note','Soita eläinlääkärille perjantaina'); await check('lopetus'); await pg.click('#es-save'); await pg.wait_for_timeout(50)
    # muistiinpanot
    await pg.click('[data-tab="notes"]'); await pg.wait_for_timeout(50)
    txt=await pg.inner_text('#nlist')
    want('muistiinpano tallentui', 'Valinnat: Kissa → Ruoka' in txt and 'Ryhmät: Eläimet' in txt and 'perjantaina' in txt)
    await pg.evaluate("document.getElementById('main').scrollTop=0")
    y0=(await pg.locator('#newnote').bounding_box())['y']; await pg.evaluate("document.getElementById('main').scrollTop=500"); y1=(await pg.locator('#newnote').bounding_box())['y']
    want('Uusi-nappi pysyy paikallaan alhaalla', y0==y1 and y0==y1)
    await pg.click('#terms'); await pg.fill('#newterm','eläin'); await pg.keyboard.press('Enter'); await pg.fill('#tyes','kissa'); await pg.fill('#tno','lelu'); await check('termi'); await pg.click('#tok')
    want('päätöspuun rivit termeinä', await pg.locator('#autoterms [data-id]').count()==6)
    await pg.click('#autoterms [data-id="a:ruoka"]'); await pg.fill('#tyes','nappula'); await pg.click('#tok'); await check('automaattinen termi')
    await pg.click('#ts-body .btnrow .btn'); await pg.wait_for_timeout(50)
    want('automaattinen termi kortissa', 'Kissa' in await pg.inner_text('#nlist .nf'))
    want('termi näkyy kortissa', 'eläin' in await pg.inner_text('#nlist .nf'))
    want('päivä kortissa', await pg.locator('#nlist .nd').count()==1)
    await pg.click('#newnote'); await pg.fill('#ns-text','Muistutus 24.12. ja kahden viikon sisällä'); await check('uusi muistiinpano')
    await pg.fill('#ns-date','2026-12-24')
    want('päivät tunnistettu', await pg.locator('#ns-found i').count()==2)
    await pg.fill('#ns-text','Palaveri 1.7.26 klo13-16'); await pg.dispatch_event('#ns-text','input')
    want('ei korostusta ennen välilyöntiä', await pg.locator('#ns-hl mark').count()==0)
    await pg.type('#ns-text',' tärkeä'); want('korostus välilyönnin jälkeen', await pg.inner_text('#ns-hl mark')=='1.7.26 klo13-16')
    await check('korostus')
    await pg.fill('#ns-text','Muistutus 24.12. ja kahden viikon sisällä')
    await pg.click('#ns-ok'); await check('muistiinpanot')
    # kierros päivälle: edellinen kierros (Kissa, Eläimet, Ruoka) päivälle 24.12. muistiinpanon kautta
    await pg.click('[data-tab="notes"]'); await pg.locator('#nlist .ncard').last.click(); await pg.fill('#ns-date','2026-12-24'); await pg.click('#ns-ok')
    await pg.click('[data-tab="use"]'); await pg.fill('#startdate','2026-12-24'); await pg.dispatch_event('#startdate','change'); await check('kierros päivälle')
    want('päivän esikatselu', '1 ilmoitus' in await pg.inner_text('#startinfo'))
    await pg.click('#start'); await pg.wait_for_timeout(50)
    want('päivän valinnat valmiina', 'Lemmikki tarvitsee' in await pg.inner_text('#log') and await opts()==['kissa','ruoka','leikkiminen'] and 'sel' in await pg.get_attribute('#opts [data-id="ruoka"]','class'))
    await pg.click('#act-end'); want('päivä valmiina lopussa', await pg.input_value('#es-date')=='2026-12-24'); await pg.click('#es-cancel')
    # sanahaku
    await pg.click('[data-tab="notes"]'); await pg.fill('#nsearch','EI LÖYDY'); await pg.wait_for_timeout(50)
    want('sanahaku piilottaa', await pg.locator('#nlist .ncard:visible').count()==0 and await pg.is_visible('#nempty'))
    await pg.fill('#nsearch',''); await pg.wait_for_timeout(50); want('haku tyhjä näyttää kaikki', await pg.locator('#nlist .ncard:visible').count()==await pg.locator('#nlist .ncard').count()); await check('sanahaku')
    # puun kopiointi
    await pg.click('#title'); await pg.click('#ps-copy'); await pg.wait_for_timeout(50); await check('kopioi puu')
    pr=json.loads(await pg.evaluate("JSON.stringify(JSON.parse(localStorage.getItem('paatospuu:v1')).projektit)"))
    want('kopio: teksti ja säännöt', len(pr)==2 and pr[1]['name']=='Lemmikit (kopio)' and pr[1]['text']==pr[0]['text'] and pr[1]['rules']==pr[0]['rules'] and pr[1]['mx']==pr[0]['mx'] and not pr[1].get('session') and pr[1]['id']!=pr[0]['id'])
    await pg.click('#ps-del'); await pg.click('#ps-del'); await pg.click('#ps-close'); await pg.wait_for_timeout(50)
    # asetukset ja varmuuskopio
    await pg.click('[data-tab="set"]'); await pg.click('#exptxt'); await pg.wait_for_timeout(50)
    dump=await pg.input_value('#dataout textarea'); await check('asetukset')
    await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(100)
    await pg.click('[data-tab="set"]'); await pg.click('#p-set details summary'); await pg.fill('#imptext',dump); await pg.click('#impcheck'); await pg.click('#impok'); await pg.wait_for_timeout(50)
    await pg.click('[data-tab="notes"]'); want('tuonti palautti', await pg.locator('#nlist .ncard').count()==2)
    await pg.click('[data-tab="set"]'); await pg.click('#set-size [data-v="small"]'); await pg.click('[data-tab="teach"]'); await pg.click('[data-tm="build"]'); await check('pienet nappulat opetus')
    await pg.click('[data-tab="set"]'); await pg.click('#set-size [data-v="normal"]')
    for mode in ['Tumma']:
        await pg.click('[data-tab="set"]'); await pg.click('#p-set .seg button:has-text("%s")'%mode); await check('tumma')
    print('  errs',errs); await b.close(); return bad+(['virheet'] if errs else [])
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in [(390,844),(320,640)]: bad+=await run(p,w,h)
        print('VIRHEET' if bad else 'OK',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
