"""Juuri 1.104 (Emil 15.11.2026): Mätsik Forestin lista Juureen.
Asiat-taulukon Pika-sarake (pikanapit taulukon järjestyksessä); Listat-osion Viikot (oletus): rivi per listan rivi, 14 viikkoa, viikon napautus
avaa viikon asiat (OK kuittaa, kuitattu jää paikalleen, uusi napautus perii), ulkopuolinen napautus vain sulkee; Viikot/Rivit ja Pika alapalkissa
(eivät liiku näkymää vaihtaessa); pikamuistiinpano (rivi, asia, kuukausivalitsin, monta päivää yhteen muistiinpanoon, toinen napautus poistaa,
+ Uusi lisää asian); Aikaehdotukset Lista-ikkunassa. 390 ja 320 px kosketuksella, 1280 hiirellä."""
import asyncio, os, sys, json, datetime
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import apu
from apu import tab, menu
apu.VIIKOT=True
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
        print('  %-52s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    async def tap(sel):
        if touch: await pg.tap(sel)
        else: await pg.click(sel)
        await pg.wait_for_timeout(120)
    async def box(sel):
        r=await pg.locator(sel).first.bounding_box(); return (round(r['x']),round(r['y']),round(r['width'])) if r else None
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(300)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    now=datetime.datetime.now(); d=lambda n:(now-datetime.timedelta(days=n)).isoformat()
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0];
      k.termit=[{id:'t1',name:'Lääkkeet',yes:['lääk'],no:[],ev:14},{id:'t2',name:'Pyykit',yes:['pyyk'],no:[],ev:14},{id:'t3',name:'Kastelu',yes:['kastel'],no:[]}];k.tarkeat=['t1','t2'];
      k.tarkistuslista=[{id:'c1',name:'Kettu',created:'%s',it:[{id:'t1',ok:'%s'},{id:'t2'}]},{id:'c2',name:'Siili',created:'%s',it:[{id:'t3'}]}];
      k.muistiinpanot=[{id:'n1',text:'Siili kastelu %s',created:'%s'}];
      localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()"""%(d(20),d(2),d(20),(now+datetime.timedelta(days=14)).strftime('%d.%m.%Y'),d(1)))
    await pg.reload(); await pg.wait_for_timeout(300)
    # Asiat: Pika-sarake
    await tab(pg,'terms'); await pg.wait_for_timeout(200)
    want('Pika-otsikko ensimmäisenä', (await pg.locator('#thead .evh').first.text_content())=='Pika')
    want('Pika-ruutu kaikilla asiasanoilla', await pg.locator('.evc.pkc').count()==3)
    want('aikasanoilla ei Pika-ruutua', await pg.locator('#termlist .tcells.none .pkc').count()==0)
    await tap('#implist .evc.pkc[data-pk="t2"]'); await tap('#termlist .evc.pkc[data-pk="t3"]'); await tap('#implist .evc.pkc[data-pk="t1"]')
    want('Pika tallentuu (pikat)', await pg.evaluate(K+".pikat.join()")=='t2,t3,t1')
    want('Pika näkyy valittuna', await pg.get_attribute('#implist .evc.pkc[data-pk="t2"]','aria-pressed')=='true')
    await tap('#implist .evc.pkc[data-pk="t2"]')
    want('uusi napautus poistaa Pika-valinnan', await pg.evaluate(K+".pikat.join()")=='t3,t1')
    # Listat: Viikot (1.105: Ruudut on oletus, Viikot alapalkin valinnalla; kortti per rivi kuten Mätsikissä, viikko avaa ikkunan päälle)
    await tab(pg,'list'); await pg.wait_for_timeout(250)
    want('Viikot valittuna', await pg.locator('#lwk').count()==1 and await pg.get_attribute('#listview [data-v="w"]','aria-pressed')=='true')
    want('14 viikkoa kortilla', await pg.locator('.lwr[data-id="c1"] .lwc').count()==14)
    want('rivi per listan rivi', await pg.locator('#lwk .lwr').count()==2)
    want('Kettu: avointa tällä viikolla (punainen, 1)', await pg.evaluate("(function(){var c=document.querySelector('.lwr[data-id=\"c1\"] .lwc[data-w=\"0\"]');return c.classList.contains('red')&&c.querySelector('small').textContent==='1';})()"))
    k1=await pg.evaluate("(function(){var c=[].slice.call(document.querySelectorAll('.lwr[data-id=\"c1\"] .lwc'));return c.findIndex(function(x,i){return i>0&&x.classList.contains('yel');});})()")
    want('Lääkkeet uusiutuu tulevalla viikolla (keltainen)', k1>=1)
    k2=await pg.evaluate("(function(){var c=[].slice.call(document.querySelectorAll('.lwr[data-id=\"c2\"] .lwc'));return c.map(function(x){return x.classList.contains('red')?'r':x.classList.contains('inf')?'i':x.classList.contains('yel')?'y':'-';}).join('');})()")
    want('Siili: kuittaamaton nyt (punainen), muistiinpanon päivä tulevalla (tieto)', k2[0]=='r' and 'i' in k2[1:])
    want('ei sivun vaakavieritystä', await pg.evaluate(OVER)=='[]')
    c0=await box('.lwr[data-id="c1"] .lwc[data-w="0"]')
    await tap('.lwr[data-id="c1"] .lwc[data-w="0"]')
    want('viikon napautus avaa asiat ikkunaan', await pg.is_visible('#lwpop #lwx'))
    want('ruutu ei liiku avatessa', await box('.lwr[data-id="c1"] .lwc[data-w="0"]')==c0)
    names=await pg.evaluate("[].map.call(document.querySelectorAll('#lwx .lwe .lwt .t'),function(e){return e.textContent;}).join()")
    mon=(now-datetime.timedelta(days=now.weekday())).date()
    want('viikon asiat tärkeysjärjestyksessä', names==('Lääkkeet,Pyykit' if (now-datetime.timedelta(days=2)).date()>=mon else 'Pyykit'))
    py='#lwx .lwe[data-id="t2"] .okbtn'; yb=await box(py)
    await tap(py)
    want('OK kuittaa rivin asian', await pg.evaluate(K+".tarkistuslista[0].it.filter(function(x){return x.id==='t2';})[0].ok")!=None)
    want('kuitattu jää paikalleen himmeänä', await pg.locator('#lwx .lwe.done[data-id="t2"]').count()==1 and await box(py)==yb)
    await tap(py)
    want('uusi napautus perii kuittauksen', await pg.evaluate(K+".tarkistuslista[0].it.filter(function(x){return x.id==='t2';})[0].ok")==None)
    await pg.mouse.click(w//2,12); await pg.wait_for_timeout(150)
    want('ulkopuolinen napautus sulkee viikon', await pg.locator('#lwx').count()==0)
    want('... eikä avaa mitään muuta', await pg.evaluate("!document.querySelector('dialog[open]')"))
    # alapalkki ei liiku Viikot ↔ Ruudut
    B=['#chlist-pick','#pika-open','#listview','#listview [data-v="g"]']
    b1=[await box(s) for s in B]
    await tap('#listview [data-v="g"]'); await pg.wait_for_timeout(150)
    want('Ruudut näyttää rivit ruutuina', await pg.locator('#rtiles .rtile').count()==2 and await pg.locator('#lwk').count()==0)
    b2=[await box(s) for s in B]
    want('alapalkki ei liiku näkymää vaihtaessa', b1==b2)
    want('Aikaehdotukset ei ole alapalkissa', await pg.locator('#pbar #chplan-t, .plbar #chplan-t').count()==0)
    if touch:
        pb=await box('#pika-open'); lb=await box('#chlist-pick')
        want('Pika samalla rivillä kuin Lista', pb and lb and abs(pb[1]-lb[1])<4)
    await tap('#chlist-pick'); await pg.wait_for_timeout(150)
    want('Aikaehdotukset Lista-ikkunassa', await pg.locator('#wsheet #chplan-t').count()==1)
    await tap('#wsheet #chplan-t')
    want('Aikaehdotukset-kytkin toimii', await pg.get_attribute('#wsheet #chplan-t','aria-checked')=='true')
    await tap('#wsheet #chplan-t')
    await tap('#wsheet #ws-rows')
    want('vanha rivinäkymä Lista-ikkunasta', await pg.get_attribute('#wsheet #ws-rows','aria-checked')=='true')
    await apu.sulje(pg,'wsheet')
    want('rivinäkymä näyttää listan rivit', await pg.locator('#chlist .crow').count()==2 and await pg.locator('#lwk,#rtiles').count()==0)
    await tap('#listview [data-v="w"]') if await pg.locator('#listview [data-v="w"]').count() else await pg.evaluate("JuuriTesti.setListView('w')")
    await pg.wait_for_timeout(150)
    want('valinta muistetaan laitteella', await pg.evaluate("localStorage.getItem('paatospuu:listview')")=='w')
    # Pikamuistiinpano
    await tap('#pika-open')
    want('pikaikkuna aukeaa', await pg.evaluate("document.getElementById('pksheet').open"))
    want('rivinapit listan riveistä', await pg.locator('#pika-rows .mini').count()==2)
    want('asianapit taulukon järjestyksessä (tärkeät ensin)', await pg.evaluate("[].map.call(document.querySelectorAll('#pika-items [data-t]'),function(e){return e.textContent;}).join()")=='Lääkkeet,Kastelu')
    want('vihje rivin valinnasta otsikon perässä', await pg.locator('#pika-body .pkhint').count()==1)
    ib1=await box('#pika-items [data-t="t1"]')
    await pg.evaluate("document.querySelector('#pika-items [data-t=\"t1\"]').click()"); await pg.wait_for_timeout(120)
    want('ilman riviä asia ei avaa valitsinta', not await pg.evaluate("document.getElementById('dsheet').open"))
    await tap('#pika-rows [data-r="c1"]')
    want('asianapit eivät liiku rivin valinnasta', await box('#pika-items [data-t="t1"]')==ib1)
    await tap('#pika-items [data-t="t1"]')
    want('asia avaa kuukausivalitsimen', await pg.evaluate("document.getElementById('dsheet').open"))
    want('ruudukko aina 6 viikkoa', await pg.locator('#ds-grid > *').count()==42)
    days=await pg.evaluate("[].map.call(document.querySelectorAll('#ds-grid .mday'),function(b){return b.dataset.day;})")
    await tap('#ds-grid [data-day="%s"]'%days[19]); await tap('#ds-grid [data-day="%s"]'%days[26])
    t=await pg.evaluate(K+".muistiinpanot.filter(function(n){return n.pika;}).map(function(n){return n.text+'|'+n.pika.it+'|'+n.pika.r;}).join()")
    dd=lambda iso:'%d.%d.%s'%(int(iso[8:]),int(iso[5:7]),iso[:4])
    want('yksi muistiinpano, monta päivää', t=='Kettu Lääkkeet %s, %s|t1|c1'%(dd(days[19]),dd(days[26])))
    await tap('#ds-grid [data-day="%s"]'%days[19])
    want('toinen napautus poistaa päivän', await pg.evaluate(K+".muistiinpanot.filter(function(n){return n.pika;})[0].text")=='Kettu Lääkkeet %s'%dd(days[26]))
    if touch: await apu.sulje(pg,'dsheet')
    else: await apu.sulje(pg,'dsheet')
    await pg.wait_for_timeout(150)
    want('pikapäivät näkyvät ikkunassa', 'Lääkkeet' in (await pg.locator('#pika-dates').text_content()))
    hb=await box('#pika-dates')
    await tap('#pika-new')
    await pg.fill('#pika-newin','Soitto'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(150)
    want('+ Uusi lisää asiasanan pikanapiksi', await pg.evaluate(K+".termit.some(function(t){return t.name==='Soitto';})") and await pg.locator('#pika-items [data-t]').count()==3)
    want('päivälaatikko ei liiku', (await box('#pika-dates'))[2]==hb[2])
    want('ei sivun vaakavieritystä pikaikkunassa', await pg.evaluate(OVER)=='[]')
    await pg.keyboard.press('Escape'); await pg.wait_for_timeout(150)
    # pikapäivä viikossa; OK kuittaa päivän ja aloittaa asian välin alusta
    wk=await pg.evaluate("""(function(){var iso='%s',d=new Date(+iso.slice(0,4),+iso.slice(5,7)-1,+iso.slice(8)),t=new Date();function mon(x){var y=new Date(x.getFullYear(),x.getMonth(),x.getDate());y.setDate(y.getDate()-((y.getDay()+6)%%7));return y;}
      return Math.round((mon(d)-mon(t))/(7*864e5));})()"""%days[26])
    if 0<=wk<14:
        await tap('.lwr[data-id="c1"] .lwc[data-w="%d"]'%wk)
        want('pikapäivä viikon asioissa', await pg.locator('#lwx .lwe[data-k="p"]').count()==1)
        await tap('#lwx .lwe[data-k="p"] .okbtn')
        want('pikapäivän OK kuittaa päivän', await pg.evaluate(K+".muistiinpanot.filter(function(n){return n.pika;})[0].pts['%s']"%days[26])!=None)
        want('... ja aloittaa asian välin alusta', (await pg.evaluate(K+".tarkistuslista[0].it.filter(function(x){return x.id==='t1';})[0].ok"))[:10]==datetime.datetime.now(datetime.timezone.utc).isoformat()[:10])
        await tap('#lwx .lwe[data-k="p"] .okbtn')
        want('uusi napautus perii molemmat', await pg.evaluate("(function(){var k=%s;var n=k.muistiinpanot.filter(function(n){return n.pika;})[0];return !(n.pts&&n.pts['%s'])&&k.tarkistuslista[0].it[0].ok==='%s';})()"%(K,days[26],d(2))))
    await b.close()
    return bad,errs
async def main():
    allbad=[]
    async with async_playwright() as p:
        for w,h,t in [(390,844,True),(320,640,True),(1280,800,False)]:
            bad,errs=await run(p,w,h,t); allbad+=['%d: %s'%(w,x) for x in bad]+['%d: virhe %s'%(w,e) for e in errs]
    if allbad: print('\n'.join(allbad)); sys.exit(1)
    print('selain_1104 ok')
asyncio.run(main())
