"""Päätöspuun tietokonetesti: leveä asettelu 1440 ja 1280 px (vaihe 14). Sama appi ja sama tallennus kuin puhelimessa.
Käyttö: python3 testit/selain_tietokone.py [kuvakansio]"""
import asyncio, os, sys, json, datetime
from playwright.async_api import async_playwright
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
SHOTS=sys.argv[1] if len(sys.argv)>1 else None
T=datetime.date.today(); D=lambda n:(T+datetime.timedelta(days=n)).isoformat(); NOW=datetime.datetime.now().isoformat()
TREE="Jalat\nSelkä\nRinta\n#Ylävartalo: selkä ja rinta\n?Kipu: Onko jokin kipeä?\n>Lepo: Pidä välillä lepopäivä.\n\n=Alku avaa:\nJalat\n#Ylävartalo\n\n=Ylävartalo avaa:\nSelkä\nRinta\n\n=Toisensa poissulkevat:\nJalat\n#Ylävartalo\n\n=Salitreeni:\nsali-\n!salibandy-"
SEED={'app':'paatospuu','ver':2,'kcur':'k1','kokonaisuudet':[{'id':'k1','name':'Salitreeni','cur':'p1',
  'puut':[{'id':'p1','name':'Treenin valinta','text':TREE,'rt':1}],
  'muistiinpanot':[{'id':'n%d'%i,'created':NOW,'edited':NOW,'text':t,'date':d,**({'time':tm} if tm else {})} for i,(t,d,tm) in enumerate([
    ('Sali: jalat ja kyykky',D(0),{'s':'17:00','e':'18:30'}),('Soita fysioterapeutille',D(0),{'s':'09:30','e':'10:00'}),('Ostoslista: kaurahiutaleet, rahka',D(1),None),
    ('Salitreeni selkä',D(2),{'s':'16:00','e':'17:00'}),('Lepopäivä',D(3),None),('Hammaslääkäri',D(4),{'s':'13:00','e':'14:00'}),('Ideoita: uusi ohjelma joulukuulle','',None)])],
  'termit':[{'id':'t1','name':'Kipu','yes':['kipeä','särky-'],'no':[]}],
  'toistuvat':[{'id':'r1','text':'Venyttely','mode':'every','n':1,'unit':'w','start':D(0),'created':NOW}]}],'cfg':{}}
OVER="""(function(){var w=document.documentElement.clientWidth,out=[];
 document.querySelectorAll('input,textarea,select,button').forEach(function(e){var r=e.getBoundingClientRect();
  if(r.width&&r.height&&e.offsetParent!==null&&e.type!=='file'&&!e.closest('.hscroll')&&(r.right>w+0.5||r.left<-0.5))out.push((e.id||e.className||e.tagName));});
 var m=document.getElementById('main');return JSON.stringify({w:w,doc:document.documentElement.scrollWidth,main:[m.scrollWidth,m.clientWidth],yli:out});})()"""
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h})).new_page()
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(U); await pg.evaluate("s=>localStorage.setItem('paatospuu:v1',s)",json.dumps(SEED)); await pg.reload(); await pg.wait_for_timeout(200)
    async def check(label):
        r=json.loads(await pg.evaluate(OVER)); good=not r['yli'] and r['doc']<=r['w'] and r['main'][0]<=r['main'][1]
        print('  %-30s %s %s'%(label,'ok' if good else 'YLI',r if not good else ''))
        if not good: bad.append(label)
        if SHOTS: await pg.screenshot(path=os.path.join(SHOTS,'%d-%s.png'%(w,label.replace(' ','_'))))
    def want(label,cond):
        print('  %-30s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    print('leveys',w)
    for t in ['use','notes','cal','set']:
        await pg.click('[data-tab="%s"]'%t); await pg.wait_for_timeout(120); await check('tab '+t)
    await pg.click('[data-tab="notes"]'); await pg.locator('#nlist .ncard').first.click(); await pg.wait_for_timeout(150); await check('muistiinpano ikkuna')
    await pg.click('#ns-ok'); await pg.wait_for_timeout(50)
    # 1.39: napsautus Muistioiden tyhjään kohtaan tekee uuden
    mb=await pg.locator('#main').bounding_box(); await pg.mouse.click(mb['x']+mb['width']/2,mb['y']+mb['height']-80); await pg.wait_for_timeout(80)
    want('tyhjän kohdan napsautus avaa uuden muistiinpanon', await pg.is_visible('#nsheet') and await pg.inner_text('#ns-stamp')=='Uusi')
    await pg.click('#ns-ok'); await pg.wait_for_timeout(50)
    await pg.locator('#nlist .ncard').first.click(); await pg.wait_for_timeout(80); want('kortin napsautus avaa sen', await pg.inner_text('#ns-stamp')!='Uusi'); await pg.click('#ns-ok'); await pg.wait_for_timeout(50)
    st=lambda: pg.evaluate("JSON.parse(localStorage.getItem('paatospuu:v1')).kokonaisuudet[0]")
    want('sivupalkki vasemmalla', (await pg.locator('#nav').bounding_box())['x']==0 and (await pg.locator('#nav').bounding_box())['height']>=h-1)
    # Opetus: tekstikenttä auki oikealla, kirjoitus päivittää puun ja napautus tekstin
    await pg.click('[data-tab="use"]'); await pg.wait_for_timeout(50); await pg.click('#build'); await pg.wait_for_timeout(100)
    want('tekstikenttä telakassa', await pg.is_visible('#xs-text') and not await pg.is_visible('#opentext') and not await pg.is_visible('#xs-ok'))
    bb=await pg.locator('#xsheet').bounding_box(); tb=await pg.locator('#tlist').bounding_box(); want('ei päällekkäin', tb['x']+tb['width']<=bb['x']+1)
    await pg.click('#xs-text'); await pg.evaluate("(function(){var t=document.getElementById('xs-text'),i=t.value.indexOf('\\n\\n');t.setSelectionRange(i,i);})()"); await pg.keyboard.type('\nVatsa'); await pg.wait_for_timeout(450)
    want('kirjoitus näkyy opetuksessa heti', await pg.locator('#tlist [data-id="vatsa"]').count()==1)
    await pg.click('#tlist [data-id="__alku"]'); await pg.click('#tlist [data-id="vatsa"]'); await pg.click('#ed-done'); await pg.wait_for_timeout(100)
    v=await pg.input_value('#xs-text'); want('napautus näkyy tekstissä', 'Vatsa' in v.split('=Alku avaa:')[1].split('\n\n')[0] and v.startswith('Jalat\n')); await check('opetus telakka')
    await pg.click('[data-tab="use"]'); await pg.wait_for_timeout(50); want('telakka sulkeutuu muualla', not await pg.is_visible('#xs-text'))
    await pg.click('#start'); await pg.wait_for_timeout(80); await check('kierros')
    # Kalenteri: viikko sarakkeina
    await pg.click('[data-tab="cal"]'); await pg.wait_for_timeout(150)
    want('seitsemän päivää', await pg.locator('#timeline .dcol').count()==7)
    d0=datetime.date.fromisoformat(await pg.locator('#timeline .dcol').first.get_attribute('data-day')); tue=(d0+datetime.timedelta(days=1)).isoformat(); wed=(d0+datetime.timedelta(days=2)).isoformat()
    col=pg.locator('#timeline .dcol[data-day="%s"]'%tue); await col.scroll_into_view_if_needed(); cb=await col.bounding_box()
    await pg.evaluate("document.getElementById('main').scrollTop=0"); await pg.wait_for_timeout(50)
    cb=await col.bounding_box(); await pg.mouse.move(cb['x']+40,cb['y']+6*48+20); await pg.mouse.down(); await pg.mouse.move(cb['x']+40,cb['y']+7*48+20,steps=6); await pg.mouse.up(); await pg.wait_for_timeout(80)
    want('hiirellä veto tekee merkinnän pituuksineen', await pg.is_visible('#nsheet') and await pg.input_value('#ns-ts')=='06:30' and await pg.input_value('#ns-te')=='07:30' and await pg.input_value('#ns-date')==tue)
    await pg.click('#ns-ok'); await pg.wait_for_timeout(50)
    await pg.click('#week .cday[data-day="%s"]'%tue); await pg.wait_for_timeout(80); await pg.click('#calplus'); await pg.wait_for_timeout(80)
    want('plus: valittu päivä', await pg.input_value('#ns-date')==tue); await pg.fill('#ns-ts','06:30'); await pg.fill('#ns-text','Aamulenkki'); await pg.click('#ns-ok'); await pg.wait_for_timeout(80)
    ev=pg.locator('#timeline .ev:has-text("Aamulenkki")'); want('näkyy tiistaina', await ev.count()==1 and await ev.evaluate("e=>e.closest('.dcol').dataset.day")==tue)
    await pg.evaluate("document.getElementById('main').scrollTop-=120"); await pg.wait_for_timeout(50)  # vartin merkintä esiin kiinteän yläosan alta
    eb=await ev.bounding_box(); tb=await pg.locator('#timeline .dcol[data-day="%s"]'%wed).bounding_box()
    x0=eb['x']+20; y0=eb['y']+eb['height']/2
    await pg.mouse.move(x0,y0); await pg.mouse.down(); await pg.wait_for_timeout(450)
    for k in range(1,11): await pg.mouse.move(x0+(tb['x']+40-x0)*k/10,y0)
    await pg.wait_for_timeout(50); await check('raahaus toiselle päivälle'); await pg.mouse.up(); await pg.wait_for_timeout(150)
    n=[x for x in (await st())['muistiinpanot'] if x['text'].startswith('Aamulenkki')][0]
    want('siirtyi keskiviikolle, aika säilyi', [n['date'],n['time']['s']]==[wed,'06:30'])
    print('  errs',errs); await b.close(); return bad+(['virheet'] if errs else [])
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in [(1440,900),(1280,800)]: bad+=await run(p,w,h)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
