# P3b: toistin (toistuva kortti, F05) selaimessa. Tietokone 1440 ja 1280 (tumma), puhelin 390 ja 320 (kosketus).
# Tietokone: paletin Toistin näkyy vasta, kun on Tietotaulukko; toistin kanvaasille vetämällä, nuoli taulukon rivit-kohdasta
# toistimen rivit-kohtaan logiikassa vetämällä, kortin malli vetämällä palikat ensimmäiseen korttiin (teksti {kohde.nimi},
# painike, lukukenttä sidottuna sarakkeeseen paneelista), haalea esikatselu muokatessa, lukittuna kortti jokaiselle riville,
# painike lisää oman rivinsä määrää, kenttään kirjoitus kirjoittaa riville, järjestyksen vaihto kesken kirjoituksen ei vie
# kohdistusta, rullaus kehyksen sisällä 40 rivillä, rivin poisto, toistimen siirto vie mallin mukanaan ja palikan
# irrotus. Puhelin: ruudukko 2 saraketta 390 px:llä ja 1 sarake 320 px:llä, napautus kortin painikkeeseen ja
# valintaruutuun (oma tila riveittäin). Kuvat appiappi15_*.png. Testit ajetaan tietokoneen Chromiumissa, eivät oikealla iPhonella.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P;
 var t=KK.addBlock(P,'taulu',{nm:'Tuotteet'});var tn=KK.addNode(P,t.id,60,60);var c1=KK.addCol(t,'Nimi','teksti'),c2=KK.addCol(t,'Määrä','luku');
 [['Maito','2'],['Leipä','0'],['Juusto','5']].forEach(function(x){var r=KK.tAddRow(P,t.id,false);KK.tEdit(P,t.id,false,r,c1.id,x[0]);KK.tEdit(P,t.id,false,r,c2.id,x[1]);});
 var k=KK.addBlock(P,'trivi',{nm:'Kohde',tt:t.id});KK.addNode(P,k.id,60,220);
 var j=KK.addBlock(P,'joukko',{nm:'Joukko'});var jn=KK.addNode(P,j.id,320,60);KK.addLink(P,tn.id,'rj',jn.id,'rv');
 KK.repair(P);APP.renderAll();return {t:t.id,tn:tn.id,j:j.id,jn:jn.id,c2:c2.id};})()"""
async def insp(pg): return await pg.inner_text('#insp')
async def lajista(pg,k,x,y):
    l=pg.locator('#pal .chip[data-make*=\'"k":"%s"\']'%k).first
    await l.scroll_into_view_if_needed();c=await l.bounding_box()
    await veda(pg,[c['x']+c['width']/2,c['y']+c['height']/2],[x,y])
async def main():
    async with async_playwright() as p:
        for W,dark in ((1440,False),(1280,True)):
            b,pg,errs=await avaa(p,W,900,dark)
            await pg.fill('#wname','Kortit');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(150)
            chips=await pg.evaluate("[...document.querySelectorAll('#pal .chip')].map(c=>c.textContent.trim())");assert not any('Toistin' in c for c in chips),'ilman taulukkoa ei Toistinta'
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            # 1. Toistin paletista kanvaasille
            box=await pg.locator('#uvp').bounding_box();X0=box['x'];Y0=box['y']
            await paletti(pg,'Toistin',X0+300,Y0+300)
            T=await P(pg,"Object.values(P.b).filter(b=>b.k==='toistin').map(b=>b.id)[0]");assert T
            await pg.evaluate("(t)=>{var b=APP.P.b[t];b.x=40;b.y=40;b.w=360;b.h=300;APP.S.sel={t:'b',id:t};APP.renderAll();}",T);await pg.wait_for_timeout(150)
            t=await insp(pg);print(W,'1 paneeli:',[l for l in t.split('\n') if 'rivejä' in l.lower() or 'malli' in l.lower()][:3]);assert 'Ei rivejä' in t and 'Kortin malli' in t
            msg=await pg.inner_text('#uels [data-id="%s"] .tmsg'%T);assert 'Tuo rivit' in msg,msg
            # 2. Nuoli logiikassa: taulukon rivit → toistimen rivit
            await pg.click('#insp [data-do="tologic"]');await pg.wait_for_timeout(250)
            if await pg.locator('#tabs [data-t="logiikka"]').is_visible(): await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(200)
            tnode=await P(pg,"P.lg.n.filter(n=>n.p==='%s').map(n=>n.id)[0]"%T);assert tnode
            await pg.evaluate("(n)=>{var x=APP.P.lg.n.find(m=>m.id===n);x.x=360;x.y=220;APP.renderAll();}",tnode);await pg.wait_for_timeout(150)
            a=await keskus(pg,'#lworld [data-nid="%s"] .pins.o .pt[data-p="rj"]'%I['tn']);z=await keskus(pg,'#lworld [data-nid="%s"] .pins.i .pt[data-p="rv"]'%tnode);await veda(pg,a,z)
            ls=await P(pg,"P.lg.l.filter(l=>l.t==='%s').map(l=>[l.fp,l.tp])"%tnode);print(W,'2 nuoli:',ls);assert ['rj','rv'] in ls
            await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(200)
            await pg.evaluate("(t)=>{APP.S.sel={t:'b',id:t};APP.renderAll();}",T);await pg.wait_for_timeout(150)
            t=await insp(pg);assert 'Kortteja\n3' in t or 'Kortteja 3' in t.replace('\n',' '),t
            # 3. Kortin malli: palikat vedetään ensimmäiseen korttiin (40,40 360×64)
            async def maailma(x,y): return await pg.evaluate("(a)=>{var vp=document.querySelector('#uvp'),w=document.querySelector('#uworld');var r=w.getBoundingClientRect(),m=new DOMMatrix(getComputedStyle(w).transform);return [r.left+a[0]*m.a,r.top+a[1]*m.d];}",[x,y])
            p1=await maailma(110,72);await lajista(pg,'nayta',p1[0],p1[1])
            p2=await maailma(370,72);await lajista(pg,'nappi',p2[0],p2[1])
            ms=await P(pg,"Object.values(P.b).filter(b=>b.tst==='%s').map(b=>[b.k,b.nm])"%T);print(W,'3 malli:',ms)
            assert [m[0] for m in ms]==['nayta','nappi'],ms
            TX=await P(pg,"Object.values(P.b).filter(b=>b.tst==='%s'&&b.k==='nayta')[0].id"%T);BT=await P(pg,"Object.values(P.b).filter(b=>b.tst==='%s'&&b.k==='nappi')[0].id"%T)
            # Koko ja sisältö: teksti {kohde.nimi}, painike +, lukukenttä sidottuna Määrä-sarakkeeseen
            LU=await pg.evaluate("""(a)=>{var P=APP.P,v=P.views[0].id;var tx=P.b[a[0]];tx.x=44;tx.y=50;tx.w=140;tx.h=40;tx.tx=KK.toIds(P,'{kohde.nimi}');var bt=P.b[a[1]];bt.tx='+';bt.beh='kerta';bt.x=330;bt.y=50;bt.w=60;bt.h=44;
              var lu=KK.addBlock(P,'luku',{v:v,tx:''});lu.x=196;lu.y=44;lu.w=120;lu.h=56;KK.tstAssign(P,[lu.id]);KK.repair(P);APP.S.sel={t:'b',id:lu.id};APP.renderAll();return lu.id;}""",[TX,BT])
            assert await P(pg,"P.b['%s'].tst"%LU)==T
            t=await insp(pg);assert 'KORTISSA' in t.upper() and 'Arvo sarakkeesta' in t,t
            await pg.select_option('#insp select[data-k="tsar"]',I['c2']);await pg.wait_for_timeout(150)
            assert await P(pg,"P.b['%s'].tsar"%LU)==I['c2']
            # 4. Muokatessa: malli näyttää ensimmäisen rivin, muut kortit haaleina
            mt=(await pg.inner_text('#uels > [data-id="%s"]'%TX)).strip();assert mt=='Maito',mt
            gh=await pg.locator('#uels [data-id="%s"] .tcard.thaam'%T).count();assert gh==2,gh
            gt=await pg.inner_text('#uels [data-id="%s"] .tcard.thaam >> nth=0'%T);assert 'Leipä' in gt,gt
            await pg.screenshot(path='appiappi15_muokkaus_%d.png'%W)
            # Logiikka: painike → Lisää 1 määrään tapahtuman rivillä
            await pg.evaluate("""(a)=>{var P=APP.P;var bn=KK.addNode(P,a[0],60,400);var t=KK.addBlock(P,'tee',{do:'lisaa',o:a[1],sk:a[2],rl:'tapahtuma'});var tn=KK.addNode(P,t.id,300,400);KK.addLink(P,bn.id,'e',tn.id,'e');KK.repair(P);APP.renderAll();}""",[BT,I['t'],I['c2']])
            # 5. Lukittuna: kortti jokaiselle riville
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            cards=await pg.evaluate("[...document.querySelectorAll('#uels [data-id=\"%s\"] .tcard')].map(c=>[c.getAttribute('data-row'),c.innerText.replace(/\\s+/g,' ').trim(),c.style.top])"%T);print(W,'5 kortit:',cards)
            assert len(cards)==3 and 'Maito' in cards[0][1] and 'Leipä' in cards[1][1] and 'Juusto' in cards[2][1]
            assert await pg.locator('#uels > [data-id="%s"]'%TX).count()==0,'malli ei näy erikseen käytössä'
            R=[c[0] for c in cards]
            def card(r,id): return '#uels .tcard[data-row="%s"] [data-id="%s"]'%(r,id)
            vals=await pg.evaluate("(s)=>s.map(x=>document.querySelector(x).value)",[card(r,LU)+' input' for r in R]);assert vals==['2','0','5'],vals
            await pg.click(card(R[1],BT)+' button');await pg.wait_for_timeout(200)
            m=await P(pg,"KK.tRows(P,'%s').map(r=>r.a['%s'])"%(I['t'],I['c2']));print(W,'5 painettu Leipä:',m);assert m==[2,1,5],m
            assert await pg.evaluate("(s)=>document.querySelector(s).value",card(R[1],LU)+' input')=='1'
            # Kenttään kirjoitus kirjoittaa riville; + ja − kentän napit
            await pg.fill(card(R[2],LU)+' input','7');await pg.press(card(R[2],LU)+' input','Enter');await pg.wait_for_timeout(200)
            await pg.click(card(R[0],LU)+' [data-act="inc"]');await pg.wait_for_timeout(150)
            m=await P(pg,"KK.tRows(P,'%s').map(r=>r.a['%s'])"%(I['t'],I['c2']));print(W,'5 kentät:',m);assert m==[3,1,7],m
            # Sidottu tekstikenttä näyttää ja muuttaa rivin nimen
            TK=await pg.evaluate("(a)=>{var P=APP.P;var k=KK.addBlock(P,'teksti',{v:P.views[0].id,tx:''});k.x=44;k.y=44;k.w=140;k.h=56;KK.tstAssign(P,[k.id]);k.tsar='c1';KK.repair(P);APP.renderAll();return k.id;}",[])
            nv=await pg.evaluate("(s)=>s.map(x=>document.querySelector(x).value)",[card(r,TK)+' input' for r in R]);assert nv==['Maito','Leipä','Juusto'],nv
            await pg.fill(card(R[2],TK)+' input','Brie');await pg.wait_for_timeout(200)
            nm=await P(pg,"KK.tRows(P,'%s').map(r=>r.a.c1)"%I['t']);assert nm==['Maito','Leipä','Brie'],nm
            await pg.evaluate("(k)=>{KK.removeBlock(APP.P,k);APP.renderAll();}",TK);await pg.wait_for_timeout(150)
            tt=await pg.inner_text('#uels .tcard[data-row="%s"]'%R[2]);assert 'Brie' in tt,tt
            # 6. Järjestys määrän mukaan kesken kirjoituksen: kohdistus ja keskeneräinen teksti säilyvät oikealla rivillä
            await pg.evaluate("(a)=>{KK.addLink(APP.P,APP.P.lg.n.find(n=>n.p===a[0]).id,'rj',a[1],'rv');}",[I['j'],tnode])
            await pg.focus(card(R[1],LU)+' input');await pg.keyboard.press('End');await pg.keyboard.type('9')
            await pg.evaluate("(a)=>{var j=APP.P.b[a[0]];j.js=a[1];j.su='laskeva';APP.renderAll();}",[I['j'],I['c2']]);await pg.wait_for_timeout(200)
            fo=await pg.evaluate("(function(){var a=document.activeElement;var c=a&&a.closest('.tcard');return [a&&a.tagName,c&&c.getAttribute('data-row'),a&&a.value];})()");print(W,'6 kohdistus:',fo);assert fo[0]=='INPUT' and fo[1]==R[1] and fo[2]=='19',fo
            order=await pg.evaluate("[...document.querySelectorAll('#uels [data-id=\"%s\"] .tcard')].sort((a,b)=>parseFloat(a.style.top)-parseFloat(b.style.top)).map(c=>c.getAttribute('data-row'))"%T);print(W,'6 järjestys:',order);assert order==[R[2],R[0],R[1]],order
            await pg.keyboard.press('Enter');await pg.wait_for_timeout(200)
            m=await P(pg,"KK.tRows(P,'%s').map(r=>r.a['%s'])"%(I['t'],I['c2']));assert m==[3,19,7],m
            order=await pg.evaluate("[...document.querySelectorAll('#uels [data-id=\"%s\"] .tcard')].sort((a,b)=>parseFloat(a.style.top)-parseFloat(b.style.top)).map(c=>c.getAttribute('data-row'))"%T);assert order==[R[1],R[2],R[0]],order
            # 7. 40 riviä: rullaus kehyksen sisällä, kamera ei liiku
            await pg.evaluate("""(a)=>{var P=APP.P;for(var i=0;i<37;i++){var r=KK.tAddRow(P,a[0],true);KK.tEdit(P,a[0],true,r,'c1','Rivi '+i);KK.tEdit(P,a[0],true,r,a[1],i%10);}APP.renderAll();}""",[I['t'],I['c2']]);await pg.wait_for_timeout(200)
            n=await pg.locator('#uels [data-id="%s"] .tcard'%T).count();assert n==40,n
            cam0=await pg.evaluate("JSON.stringify(APP.P.cam)")
            c=await keskus(pg,'#uels [data-id="%s"] .tsc'%T);await pg.mouse.move(c[0],c[1]);await pg.mouse.wheel(0,600);await pg.wait_for_timeout(250)
            st=await pg.evaluate("document.querySelector('#uels [data-id=\"%s\"] .tsc').scrollTop"%T);cam1=await pg.evaluate("JSON.stringify(APP.P.cam)");print(W,'7 rullaus:',st);assert st>0 and cam0==cam1,(st,cam0,cam1)
            await pg.screenshot(path='appiappi15_kaytto_%d.png'%W)
            # Rivin poisto: kortti häviää
            await pg.evaluate("(a)=>{KK.tDelRow(APP.P,a[0],true,a[1]);APP.renderAll();}",[I['t'],R[0]]);await pg.wait_for_timeout(150)
            assert await pg.locator('#uels .tcard[data-row="%s"]'%R[0]).count()==0;assert await pg.locator('#uels [data-id="%s"] .tcard'%T).count()==39
            # 8. Muokkaus: toistimen siirto vie mallin mukanaan, palikka irtoaa vetämällä pois
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            await pg.evaluate("(t)=>{var e=document.querySelector('#uels [data-id=\"'+t+'\"] .tsc');e.scrollTop=0;}",T)
            x0=await P(pg,"[P.b['%s'].x,P.b['%s'].x]"%(T,TX))
            a=await maailma(250,330);z=await maailma(300,370);await veda(pg,a,z)
            x1=await P(pg,"[P.b['%s'].x,P.b['%s'].x,P.b['%s'].tst]"%(T,TX,TX));print(W,'8 siirto:',x0,x1);assert x1[0]-x0[0]==x1[1]-x0[1]!=0 and x1[2]==T,(x0,x1)
            r=await pg.locator('#uels > [data-id="%s"]'%BT).bounding_box();await veda(pg,[r['x']+r['width']/2,r['y']+r['height']/2],[r['x']+r['width']/2+400,r['y']+r['height']/2+300])
            assert await P(pg,"P.b['%s'].tst||''"%BT)=='','vedetty pois → irti'
            ms=await P(pg,"KK.tstMembers(P,'%s').length"%T);assert ms==2,ms
            # Miksi?
            await pg.evaluate("(t)=>{APP.S.sel={t:'b',id:t};APP.renderAll();}",T);await pg.wait_for_timeout(150)
            ws=await pg.inner_text('#whysec') if await pg.locator('#whysec').count() else ''
            print(W,'8 miksi:',ws[:160].replace('\n',' | '));assert '39 korttia' in ws
            print(W,'errs',errs);assert not errs,errs
            await b.close()
        for W in (390,320):
            b=await p.chromium.launch();errs=[]
            ctx=await b.new_context(viewport={'width':W,'height':844},has_touch=True,is_mobile=True,reduced_motion='reduce')
            pg=await ctx.new_page();pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Puhelin');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate("""(function(){var P=APP.P,v=P.views[0].id;
              var t=KK.addBlock(P,'taulu',{nm:'Ostokset'});var tn=KK.addNode(P,t.id,40,40);var c1=KK.addCol(t,'Nimi','teksti'),c2=KK.addCol(t,'Kpl','luku');
              [['Maito','2'],['Leipä','1'],['Omena','4'],['Juusto','']].forEach(function(x){var r=KK.tAddRow(P,t.id,false);KK.tEdit(P,t.id,false,r,c1.id,x[0]);KK.tEdit(P,t.id,false,r,c2.id,x[1]);});
              var ko=KK.addBlock(P,'trivi',{nm:'Kohde',tt:t.id});KK.addNode(P,ko.id,40,160);
              var T=KK.addBlock(P,'toistin',{v:v,tsu:'ruudukko',kw:170,kh:96,vali:10});T.x=10;T.y=10;T.w=W0-20;T.h=420;var Tn=KK.addNode(P,T.id,300,40);KK.addLink(P,tn.id,'rj',Tn.id,'rv');
              var bg=KK.addBlock(P,'muoto',{v:v,laji:'laatikko',tx:''});bg.x=10;bg.y=10;bg.w=170;bg.h=96;bg.z=-1;
              var tx=KK.addBlock(P,'nayta',{v:v,tx:''});tx.x=18;tx.y=16;tx.w=150;tx.h=30;tx.tx=KK.toIds(P,'{kohde.nimi}: {kohde.kpl}');
              var bt=KK.addBlock(P,'nappi',{v:v,tx:'+1',beh:'kerta'});bt.x=18;bt.y=54;bt.w=70;bt.h=44;var bn=KK.addNode(P,bt.id,40,300);
              var ru=KK.addBlock(P,'ruutu',{v:v,tx:'Ok'});ru.x=96;ru.y=58;ru.w=80;ru.h=40;
              KK.tstAssign(P,[bg.id,tx.id,bt.id,ru.id]);
              var lr=KK.addBlock(P,'tee',{do:'lisaa',o:t.id,sk:c2.id,rl:'tapahtuma'});var ln=KK.addNode(P,lr.id,260,300);KK.addLink(P,bn.id,'e',ln.id,'e');
              KK.repair(P);APP.renderAll();return {t:t.id,T:T.id,tx:tx.id,bt:bt.id,ru:ru.id,c2:c2.id,n:KK.tstMembers(P,T.id).length};})()""".replace('W0',str(W)))
            assert I['n']==4,I
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            cards=await pg.evaluate("[...document.querySelectorAll('#uels .tcard')].map(c=>[c.getAttribute('data-row'),c.innerText.replace(/\\s+/g,' ').trim(),parseFloat(c.style.left),parseFloat(c.style.top)])");print(W,'9 kortit:',cards)
            cols=len(set(c[2] for c in cards));assert cols==(2 if W==390 else 1),cols
            assert 'Maito: 2' in cards[0][1] and 'Juusto: –' in cards[3][1],cards
            R=[c[0] for c in cards]
            await pg.tap('#uels .tcard[data-row="%s"] [data-id="%s"] button'%(R[3],I['bt']));await pg.wait_for_timeout(200)
            await pg.tap('#uels .tcard[data-row="%s"] [data-id="%s"] button'%(R[0],I['bt']));await pg.wait_for_timeout(200)
            m=await P(pg,"KK.tRows(P,'%s').map(r=>r.a['%s']===undefined?null:r.a['%s'])"%(I['t'],I['c2'],I['c2']));print(W,'9 napautettu:',m);assert m==[3,1,4,1],m
            tt=await pg.inner_text('#uels .tcard[data-row="%s"]'%R[3]);assert 'Juusto: 1' in tt,tt
            await pg.tap('#uels .tcard[data-row="%s"] [data-id="%s"] [data-act="toggle"]'%(R[1],I['ru']));await pg.wait_for_timeout(200)
            on=await pg.evaluate("[...document.querySelectorAll('#uels .tcard')].map(c=>!!c.querySelector('[data-id=\"%s\"] .box.on'))"%I['ru']);print(W,'9 rastit:',on);assert on==[False,True,False,False],on
            sw=await pg.evaluate("document.documentElement.scrollWidth");assert sw<=W,('ei vaakavieritystä',sw)
            await pg.screenshot(path='appiappi15_puhelin_%d.png'%W)
            print(W,'errs',errs);assert not errs,errs
            await b.close()
asyncio.run(main())
