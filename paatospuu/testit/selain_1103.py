"""Juuri 1.103 (Emil 15.11.2026): Mätsik Forestin selkeytykset Juureen.
Kalenterin oletus Viikko (päivät otsikkoina, tärkeysjärjestys, napautus avaa pienen OK-ikkunan, kuitattu jää paikalleen,
Viikko/Päivä alapalkissa, alapalkki ei liiku näkymää vaihtaessa); Asiat-taulukko (uusiutumisvälit sarakkeina, yksi valinta per rivi,
uusi napautus poistaa, kahvasta raahaus, nimi pysyy paikallaan sivuvierityksessä, otsikkorivin i); ohjeet i-nappien takana;
muistiinpanon Päivät-kuukausivalitsin (monta päivää tekstiin, toinen napautus poistaa, ei näppäimistöä).
390 ja 320 px kosketuksella, 1280 hiirellä."""
import asyncio, os, sys, json, datetime
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from apu import tab, menu
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
K="JSON.parse(localStorage.getItem('paatospuu:v1')).kokonaisuudet[0]"
OVER="""(function(){var w=document.documentElement.clientWidth,out=[];document.querySelectorAll('input,textarea,select,button').forEach(function(e){var r=e.getBoundingClientRect();
 if(r.width&&r.height&&e.offsetParent!==null&&!e.closest('.hscroll')&&(r.right>w+0.5||r.left<-0.5))out.push((e.id||e.className||e.tagName)+' '+Math.round(r.left)+'..'+Math.round(r.right));});return JSON.stringify(out);})()"""
def iso(d): return d.isoformat()
async def run(p,w,h,touch):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h},has_touch=touch,is_mobile=touch)).new_page(); await pg.add_init_script("try{if(!localStorage.getItem('paatospuu:listview'))localStorage.setItem('paatospuu:listview','r')}catch(e){}")
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond):
        print('  %-50s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    async def tap(sel):
        if touch: await pg.tap(sel)
        else: await pg.click(sel)
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(300)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    t=datetime.date.today(); tm=t+datetime.timedelta(days=1); fd=lambda d:'%d.%d.%d'%(d.day,d.month,d.year)
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0],T=new Date().toISOString();
      k.muistiinpanot=[{id:'a',created:T,edited:T,text:'Kokous %s klo 9',date:''},{id:'b',created:T,edited:T,text:'Lääkkeet %s klo 13',date:''},{id:'c',created:T,edited:T,text:'Pyykit %s',date:''}];
      k.termit=[{id:'t1',name:'Lääkkeet',yes:['lääk'],no:[]},{id:'t2',name:'Pyykit',yes:['pyyk'],no:[]}];k.tarkeat=['t1','t2'];
      localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()"""%(fd(tm),fd(tm),fd(tm)))
    await pg.reload(); await pg.wait_for_timeout(300)
    # --- kalenteri: viikko oletuksena ---
    await tab(pg,'cal'); await pg.wait_for_timeout(250)
    want('Viikko oletuksena', await pg.is_visible('#wklist') and not await pg.is_visible('#timeline') and await pg.get_attribute('#calview [data-v="w"]','aria-pressed')=='true')
    rows=await pg.evaluate("Array.prototype.map.call(document.querySelectorAll('.wkday[data-day=\"%s\"] .wrow .wtt'),function(e){return e.textContent;})"%iso(tm))
    want('tärkeysjärjestys, ei kellonaikaa ensin', rows==['Lääkkeet','Pyykit','Kokous'])
    want('päivät otsikkoina, myös seuraava viikko', await pg.locator('.wkday').count()>=8 and await pg.locator('.wkdiv').count()==1)
    bar=lambda: pg.evaluate("JSON.stringify(['#calview','#caltoday','#calmonth','#roll','#menu'].map(function(s){var e=document.querySelector(s);if(!e||!e.offsetParent)return null;var r=e.getBoundingClientRect();return [Math.round(r.left),Math.round(r.top)];}))")
    b0=await bar()
    if w<1000: want('valinta alapalkissa', json.loads(b0)[0] is not None and json.loads(b0)[0][1]>h-120)
    want('mahtuu (viikko)', json.loads(await pg.evaluate(OVER))==[])
    if w<1000: want('vientinappi kalenterissa', await pg.is_visible('#qx'))
    r1=pg.locator('.wkday[data-day="%s"] .wrow'%iso(tm)).nth(1); y0=(await r1.bounding_box())['y']
    await r1.click(); await pg.wait_for_timeout(120)
    want('napautus avaa pienen ikkunan', await pg.is_visible('#wkpop') and await pg.is_visible('#wk-ok') and await pg.is_visible('#wk-open'))
    if w<1000:
        await pg.mouse.click(w/2,8); await pg.wait_for_timeout(120)
        want('ulkopuolinen napautus vain sulkee', not await pg.is_visible('#wkpop') and await pg.locator('.wrow.done').count()==0)
        await r1.click(); await pg.wait_for_timeout(120)
    await pg.click('#wk-ok'); await pg.wait_for_timeout(200)
    r1=pg.locator('.wkday[data-day="%s"] .wrow'%iso(tm)).nth(1)
    pts=json.loads(await pg.evaluate("JSON.stringify(%s.muistiinpanot.filter(function(n){return n.id==='c';})[0].pts||{})"%K))
    want('OK kuittaa (pts) ja rivi jää paikalleen himmeänä', list(pts.keys())==[iso(tm)] and 'done' in (await r1.get_attribute('class')) and abs((await r1.bounding_box())['y']-y0)<2 and await r1.locator('.wtt').inner_text()=='Pyykit')
    await r1.click(); await pg.wait_for_timeout(120)
    want('kuitatussa Kumoa kuittaus', await pg.inner_text('#wk-ok')=='Kumoa kuittaus')
    await pg.click('#wk-ok'); await pg.wait_for_timeout(150)
    want('kumous palauttaa', await pg.locator('.wrow.done').count()==0)
    await pg.locator('.wkday[data-day="%s"] .wrow'%iso(tm)).first.click(); await pg.wait_for_timeout(120); await pg.click('#wk-open'); await pg.wait_for_timeout(250)
    want('Avaa muistiinpano', await pg.is_visible('#nsheet') and 'Lääkkeet' in await pg.input_value('#ns-text'))
    await pg.click('#nsheet .sx'); await pg.wait_for_timeout(150)
    await pg.click('#calview [data-v="d"]'); await pg.wait_for_timeout(250)
    want('Päivä näyttää aikajanan', await pg.is_visible('#timeline') and not await pg.is_visible('#wklist'))
    b1=await bar()
    want('alapalkki ja nauha eivät liiku näkymää vaihtaessa', b0==b1)
    await pg.reload(); await pg.wait_for_timeout(300); await tab(pg,'cal'); await pg.wait_for_timeout(200)
    want('valinta muistetaan laitteella', await pg.is_visible('#timeline'))
    await pg.click('#calview [data-v="w"]'); await pg.wait_for_timeout(200)
    # --- Asiat-taulukko ---
    await tab(pg,'terms'); await pg.wait_for_timeout(200)
    want('otsikkorivi ja sarakkeet', await pg.locator('#thead .evh').count()==11 and await pg.locator('#implist .drow').nth(0).locator('.evc').count()==11)  # 1.105: Pika + Kerran + 9 väliä
    c=pg.locator('#implist .drow[data-id="t1"] .evc[data-ev="7"]'); await c.click(); await pg.wait_for_timeout(150)
    ev=lambda: pg.evaluate("JSON.stringify(%s.termit.map(function(t){return [t.id,t.ev||0];}))"%K)
    want('napautus valitsee välin', json.loads(await ev())==[['t1',7],['t2',0]] and await pg.get_attribute('#implist .drow[data-id="t1"] .evc[data-ev="7"]','aria-pressed')=='true')
    await pg.locator('#implist .drow[data-id="t1"] .evc[data-ev="14"]').click(); await pg.wait_for_timeout(150)
    want('yksi valinta per rivi', json.loads(await ev())[0]==['t1',14] and await pg.locator('#implist .drow[data-id="t1"] .evc[aria-pressed="true"]').count()==1)
    await pg.locator('#implist .drow[data-id="t1"] .evc[data-ev="14"]').click(); await pg.wait_for_timeout(150)
    want('uusi napautus poistaa', json.loads(await ev())[0]==['t1',0])
    want('ei poistonappeja taulukossa', await pg.locator('#p-terms .trow .danger, #p-terms .trow .dangerline').count()==0)
    want('mahtuu (taulukko)', json.loads(await pg.evaluate(OVER))==[])
    # sivuvieritys: nimi pysyy, otsikot ja muut osat seuraavat
    x0=(await pg.locator('#implist .drow[data-id="t1"] .row').bounding_box())['x']
    await pg.evaluate("(function(){var l=document.getElementById('implist');l.scrollLeft=150;l.dispatchEvent(new Event('scroll'));})()"); await pg.wait_for_timeout(80)
    sl=json.loads(await pg.evaluate("JSON.stringify([document.getElementById('implist').scrollLeft,document.querySelector('#thead .trow').scrollLeft,document.getElementById('termlist').scrollLeft])"))
    want('nimi pysyy, sarakkeet vierivät yhdessä', abs((await pg.locator('#implist .drow[data-id="t1"] .row').bounding_box())['x']-x0)<1 and (sl[0]==0 or (sl[0]==sl[1] and sl[0]==sl[2])))
    await pg.evaluate("(function(){var l=document.getElementById('implist');l.scrollLeft=0;l.dispatchEvent(new Event('scroll'));})()"); await pg.wait_for_timeout(50)
    # kahvasta raahaus
    g=await pg.locator('#implist .drow[data-id="t2"] .tgrip').bounding_box(); x=g['x']+g['width']/2; y=g['y']+g['height']/2
    await pg.mouse.move(x,y); await pg.mouse.down()
    for k in range(1,9): await pg.mouse.move(x,y-100*k/8); await pg.wait_for_timeout(10)
    await pg.mouse.up(); await pg.wait_for_timeout(150)
    want('kahva siirtää heti (ei pitoa)', json.loads(await pg.evaluate("JSON.stringify(%s.tarkeat)"%K))==['t2','t1'])
    # i-nappi
    await pg.click('#thead .ib'); await pg.wait_for_timeout(100)
    want('i avaa ohjeen', await pg.is_visible('#infop') and 'uusiutuu' in (await pg.inner_text('#infop')))
    await pg.mouse.click(w/2,h-140); await pg.wait_for_timeout(100)
    want('ulkopuolinen napautus sulkee ohjeen eikä tee muuta', not await pg.is_visible('#infop') and not await pg.is_visible('#tsheet'))
    want('ei pitkiä ohjekappaleita näkymässä', await pg.locator('#p-terms p.sub:has-text("Napauta tähteä")').count()==0)
    # --- Päivät-valitsin ---
    await tab(pg,'notes'); await pg.wait_for_timeout(150)
    await pg.locator('#nlist .ncard').first.click(); await pg.wait_for_timeout(250)
    await pg.fill('#ns-text','Reseptiuusinta\nsoita'); await pg.evaluate("document.activeElement.blur()")
    want('Päivät-nappi mahtuu riville', json.loads(await pg.evaluate(OVER))==[] and await pg.is_visible('#ns-days'))
    await tap('#ns-days'); await pg.wait_for_timeout(200)
    want('kuukausinäkymä, 42 ruutua, ei näppäimistöä', await pg.is_visible('#dsheet') and await pg.locator('#ds-grid > *').count()==42 and await pg.evaluate("document.activeElement.id")!='ns-text')
    bx=await pg.locator('#ds-grid').bounding_box()
    d1=await pg.locator('#ds-grid .mday').nth(9).get_attribute('data-day'); d2=await pg.locator('#ds-grid .mday').nth(16).get_attribute('data-day')
    await pg.locator('#ds-grid .mday').nth(9).click(); await pg.wait_for_timeout(80); await pg.locator('#ds-grid .mday').nth(16).click(); await pg.wait_for_timeout(80)
    f=lambda s:'%d.%d.%d'%(int(s[8:]),int(s[5:7]),int(s[:4]))
    v=await pg.input_value('#ns-text')
    want('monta päivää tekstiin', v==('Reseptiuusinta %s, %s\nsoita'%(f(d1),f(d2))))
    want('valitut korostettuina, valitsin ei liiku', await pg.locator('#ds-grid .mday.on').count()==2 and (await pg.locator('#ds-grid').bounding_box())==bx)
    await pg.locator('#ds-grid .mday').nth(9).click(); await pg.wait_for_timeout(80)
    want('toinen napautus poistaa', await pg.input_value('#ns-text')==('Reseptiuusinta %s\nsoita'%f(d2)))
    await pg.click('#ds-next'); await pg.wait_for_timeout(60)
    want('kuukauden vaihto, koko ei muutu', await pg.locator('#ds-grid > *').count()==42 and (await pg.locator('#ds-grid').bounding_box())['height']==bx['height'])
    await pg.mouse.click(w/2,8); await pg.wait_for_timeout(150)
    want('ulkopuolinen napautus sulkee valitsimen', not await pg.is_visible('#dsheet') and await pg.is_visible('#nsheet'))
    want('ei virheitä', not errs)
    await b.close(); return bad
async def main():
    bad=[]
    async with async_playwright() as p:
        for w,h,t in ((390,844,True),(320,640,True),(1280,800,False)): bad+=await run(p,w,h,t)
    if bad: print('VIRHEET:',bad); sys.exit(1)
    print('OK []')
asyncio.run(main())
