"""Juuri 1.105 (Emil 18.11.2026): vaiheet A ja B. Matala alapalkki; Listat- ja rivin ikkuna pieninä ilman ruksia; Viikot kuten Mätsikissä
(kortti, viikkonumero ja määrä ruudussa, viikon asiat ikkunaan päälle); listakohtaiset tarkistuskohteet ja siirto (rivi ruksii pois, r.ei);
Kerran-sarake; Ruudut (kaksi rinnakkain, väri = kiire ja painoarvo, ikkuna päälle, OK, Päivä, Valitse asiat, ruutu ei liiku);
uusi ajassa uusiutuva lista. 390 ja 320 px kosketuksella, 1280 hiirellä."""
import asyncio, os, sys, datetime
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import apu
from apu import tab, menu
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
K="JSON.parse(localStorage.getItem('paatospuu:v1')).kokonaisuudet[0]"
OVER="""(function(){var w=document.documentElement.clientWidth,out=[];document.querySelectorAll('input,textarea,select,button').forEach(function(e){var r=e.getBoundingClientRect();
 if(r.width&&r.height&&e.offsetParent!==null&&!e.closest('.hscroll,.lwv')&&(r.right>w+0.5||r.left<-0.5))out.push((e.id||e.className||e.tagName)+' '+Math.round(r.left)+'..'+Math.round(r.right));});return JSON.stringify(out);})()"""
async def run(p,w,h,touch):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h},has_touch=touch,is_mobile=touch)).new_page()
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond):
        print('  %-56s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    async def tap(sel):
        if touch: await pg.tap(sel)
        else: await pg.click(sel)
        await pg.wait_for_timeout(120)
    async def box(sel):
        r=await pg.locator(sel).first.bounding_box(); return (round(r['x']),round(r['y']),round(r['width']),round(r['height'])) if r else None
    async def outside():
        await pg.mouse.click(w//2,12); await pg.wait_for_timeout(150)
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(300)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    now=datetime.datetime.now(); d=lambda n:(now-datetime.timedelta(days=n)).isoformat()
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0];
      k.termit=[{id:'t1',name:'Lääkkeet',yes:['lääk'],no:[],ev:14},{id:'t2',name:'Pyykit',yes:['pyyk'],no:[],ev:7},{id:'t3',name:'Kastelu',yes:['kastel'],no:[]},{id:'t4',name:'Soitto',yes:[],no:[],ev:28}];k.tarkeat=['t1','t2','t3','t4'];
      k.tarkistuslista=[{id:'c1',name:'Kettu',created:'%s',it:[{id:'t1',ok:'%s'},{id:'t2'}]},{id:'c2',name:'Siili',created:'%s',it:[{id:'t3'},{id:'t4',ok:'%s'}]},
        {id:'c3',name:'Mäyrä',created:'%s',it:[{id:'t1',ok:'%s'},{id:'t2',ok:'%s'}]},{id:'c4',name:'Ilves',created:'%s',it:[]}];
      localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()"""%(d(20),d(2),d(20),d(1),d(20),d(1),d(1),d(20)))
    await pg.reload(); await pg.wait_for_timeout(300)
    try: await pg.evaluate("localStorage.removeItem('paatospuu:listview');lstV=null")
    except Exception: pass
    # A1 alapalkki
    if w<1000:
        rb=await box('#roll'); mb=await box('#menu')
        want('alapalkin osionappi ja Valikko matalat (≤ 40 px)', rb and mb and rb[3]<=40 and mb[3]<=40)
    # Listat: Ruudut oletuksena, siirto
    await tab(pg,'list'); await pg.evaluate("JuuriTesti.setListView('g')"); await pg.wait_for_timeout(250)
    want('Ruudut oletuksena', await pg.locator('#rtiles .rtile').count()==4 and await pg.get_attribute('#listview [data-v="g"]','aria-pressed')=='true')
    want('siirto: listan kohteet = käsin valitut', await pg.evaluate(K+".jatkuvalista.tk.join()")=='t1,t2,t3,t4')
    want('siirto: rivi ruksii pois puuttuvat (ei muutu)', await pg.evaluate(K+".tarkistuslista.map(function(r){return (r.ei||[]).join('+');}).join('|')")=='t3+t4|t1+t2|t3+t4|t1+t2+t3+t4')
    y1=await box('.rtile[data-id="c1"]'); y2=await box('.rtile[data-id="c2"]')
    want('kaksi ruutua rinnakkain', y1[1]==y2[1] and y2[0]>y1[0])
    tone=lambda i:pg.get_attribute('.rtile[data-id="%s"]'%i,'data-tone')
    want('Siili: tärkein avoin ylimpänä kolmanneksena (vahvin)', await tone('c2')=='hot3')
    want('Kettu: keskitaso', await tone('c1')=='hot2')
    want('Mäyrä: ei heti tarkistettavaa (kunnossa tai tulossa ensi viikolla)', await tone('c3') in ('ok','soon'))
    want('Ilves: ei asioita (katkoviiva)', await tone('c4')=='none')
    want('ei sivun vaakavieritystä', await pg.evaluate(OVER)=='[]')
    T0=[await box('.rtile[data-id="%s"]'%i) for i in ('c1','c2','c3','c4')]
    await tap('.rtile[data-id="c1"]')
    want('ruutu avaa ikkunan päälle', await pg.is_visible('#lwpop .lwpd') and await pg.locator('#lwpop .lwe[data-id="t2"] .okbtn').count()==1)
    want('ikkunassa ei ruksia', await pg.locator('#lwpop .sx').count()==0)
    await tap('#lwpop .lwe[data-id="t2"] .okbtn')
    want('OK kuittaa asian riville', await pg.evaluate(K+".tarkistuslista[0].it.filter(function(x){return x.id==='t2';})[0].ok")!=None)
    want('ruudun väri ei vaihdu ikkunan ollessa auki', await tone('c1')=='hot2')
    await tap('#lwpop .lwe[data-id="t1"] .rtpv') if await pg.locator('#lwpop .lwe[data-id="t1"] .rtpv').count() else None
    want('Päivä avaa kuukausivalitsimen', await pg.evaluate("document.getElementById('dsheet').open"))
    await apu.sulje(pg,'dsheet'); await pg.wait_for_timeout(150)
    want('ikkuna pysyy valitsimen jälkeen', await pg.is_visible('#lwpop .lwpd'))
    await tap('#rt-sel')
    want('Valitse asiat: kaikki listan kohteet ruksein', await pg.locator('#lwpop .rtchk').count()==4)
    await tap('#lwpop .rtchk[data-id="t3"]')
    want('ruksi tuo asian riville (r.ei)', await pg.evaluate(K+".tarkistuslista[0].ei.join()")=='t4')
    await tap('#lwpop .rtchk[data-id="t1"]')
    want('ruksin poisto jättää asian pois', await pg.evaluate(K+".tarkistuslista[0].ei.join()")=='t4,t1')
    await tap('#lwpop .rtchk[data-id="t1"]')
    await outside()
    want('ulkopuolinen napautus sulkee ikkunan', await pg.locator('#lwpop .lwpd').count()==0 or not await pg.is_visible('#lwpop'))
    want('... eikä avaa mitään muuta', await pg.evaluate("!document.querySelector('dialog[open]')"))
    T1=[await box('.rtile[data-id="%s"]'%i) for i in ('c1','c2','c3','c4')]
    want('ruudut eivät liiku', T0==T1)
    want('Kettu: Kastelu nyt tärkein avoin', (await pg.inner_text('.rtile[data-id="c1"] .rtop')).startswith('Kastelu'))
    # Kerran-sarake
    await tab(pg,'terms'); await pg.wait_for_timeout(200)
    want('Kerran-otsikko ensimmäisenä (1.108 Pika pois)', (await pg.locator('#implist .drow').first.locator('.evc').nth(1).text_content())=='Kerran')
    await tap('#implist .drow:has-text("Kastelu") .evc[data-ev="once"]')
    want('Kerran tallentuu asiasanalle', await pg.evaluate(K+".termit.filter(function(t){return t.id==='t3';})[0].once")==1)
    await tap('#implist .drow:has-text("Soitto") .evc[data-ev="once"]')
    want('Kerran poistaa välin', await pg.evaluate("(function(){var t=%s.termit.filter(function(t){return t.id==='t4';})[0];return t.once===1&&!t.ev;})()"%K))
    await tap('#implist .drow:has-text("Soitto") .evc[data-ev="28"]')
    want('väli poistaa Kerran', await pg.evaluate("(function(){var t=%s.termit.filter(function(t){return t.id==='t4';})[0];return !t.once&&t.ev===28;})()"%K))
    await tab(pg,'list'); await pg.evaluate("JuuriTesti.setListView('g')"); await pg.wait_for_timeout(200)
    await tap('.rtile[data-id="c2"]')
    want('Kerran näkyy ikkunassa', 'kerran' in await pg.inner_text('#lwpop .lwe[data-id="t3"]'))
    await outside()
    # Viikot
    await tap('#listview [data-v="w"]'); await pg.wait_for_timeout(200)
    want('Viikot: rivi korttina, 14 viikkoruutua', await pg.locator('#lwk .lwr').count()==4 and await pg.locator('.lwr[data-id="c1"] .lwc').count()==14)
    wk=datetime.date.today().isocalendar()[1]
    want('ruudussa viikkonumero, kuluva alleviivattu', (await pg.inner_text('.lwr[data-id="c2"] .lwc[data-w="0"] b'))==str(wk) and await pg.locator('.lwr[data-id="c2"] .lwc[data-w="0"].cur').count()==1)
    want('kuluvalla viikolla avointa: punainen ja määrä', await pg.evaluate("(function(){var c=document.querySelector('.lwr[data-id=\"c2\"] .lwc[data-w=\"0\"]');return c.classList.contains('red')&&c.querySelector('small').textContent==='1';})()"))
    want('kortin nimirivillä tärkein avoin', (await pg.inner_text('.lwr[data-id="c2"] .lwn span'))=='Kastelu')
    c0=await box('.lwr[data-id="c2"] .lwc[data-w="0"]')
    await tap('.lwr[data-id="c2"] .lwc[data-w="0"]')
    want('viikon napautus avaa ikkunan päälle', await pg.is_visible('#lwpop #lwx') and await pg.locator('#lwk #lwx').count()==0)
    await tap('#lwpop .lwe[data-id="t3"] .okbtn')
    want('OK kuittaa', await pg.evaluate(K+".tarkistuslista[1].it.filter(function(x){return x.id==='t3';})[0].ok")!=None)
    await outside()
    want('ulkopuolinen sulkee, ruutu ei liiku', not await pg.is_visible('#lwpop') and await box('.lwr[data-id="c2"] .lwc[data-w="0"]')==c0)
    want('ei sivun vaakavieritystä Viikoissa', await pg.evaluate(OVER)=='[]')
    # Listat-ikkuna: pieni, ei ruksia, tarkistuskohteet, uusi ajassa uusiutuva lista
    await tap('#chlist-pick')
    want('Listat-ikkuna ilman ruksia', await pg.is_visible('#wsheet') and await pg.locator('#wsheet .sx').count()==0)
    await tap('#ws-tk [data-tid="t4"]')
    want('tarkistuskohteen poisto listalta', await pg.evaluate(K+".jatkuvalista.tk.join()")=='t1,t2,t3')
    await tap('#ws-tk [data-tid="t4"]')
    want('... ja lisäys', await pg.evaluate(K+".jatkuvalista.tk.join()")=='t1,t2,t3,t4')
    await pg.fill('#ws-new','Koti'); await tap('#ws-add-aj')
    L=await pg.evaluate(K+".listat.filter(function(l){return l.name==='Koti';})[0]")
    want('uusi Lista on ajassa uusiutuva', L and L.get('aj')==1 and not L.get('wf') and L.get('tk')==[])
    want('uudella listalla Ruudut ja Viikot', await pg.locator('#listview').count()==1)
    await tap('#chlist-pick'); await tap('#ws-tk [data-tid="t2"]')
    want('listakohtainen tarkistuskohde', await pg.evaluate(K+".listat.filter(function(l){return l.name==='Koti';})[0].tk.join()")=='t2')
    want('jatkuvan listan kohteet ennallaan', await pg.evaluate(K+".jatkuvalista.tk.join()")=='t1,t2,t3,t4')
    await apu.sulje(pg,'wsheet')
    await b.close()
    return bad,errs
async def main():
    allbad=[]
    async with async_playwright() as p:
        for w,h,t in [(390,844,True),(320,640,True),(1280,800,False)]:
            bad,errs=await run(p,w,h,t); allbad+=['%d: %s'%(w,x) for x in bad]+['%d: virhe %s'%(w,e) for e in errs]
    if allbad: print('\n'.join(allbad)); sys.exit(1)
    print('selain_1105 ok')
asyncio.run(main())
