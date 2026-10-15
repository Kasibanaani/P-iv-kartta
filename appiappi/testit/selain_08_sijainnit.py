# Versio 4: sijainnit ja rajaus. ⌖ Sijainti -nappi (piste ruudun keskelle, zoomaus talteen, kehys),
# alkukohta (lukitus ja välilehti), rullaus Ei rullausta (veto, rulla ja zoomaus estetty, napit piilossa),
# Alueen sisällä (⛶ Alue -nappi, reunat pitävät, pieni alue keskellä), Siirry vierien / heti,
# siirto toisen alueen sijaintiin vaihtaa rajauksen, sijainnit ja alueet piilossa käytössä, Kumoa.
# Kuvakaappaukset versio4_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *

async def cam(pg):
    return await pg.evaluate("(function(){var c=APP.P.cam[APP.S.vw];return [c.x,c.y,c.z];})()")
async def setcam(pg,x,y,z=1):
    await pg.evaluate("(function(){var c=APP.P.cam[APP.S.vw]||(APP.P.cam[APP.S.vw]={});c.x=%s;c.y=%s;c.z=%s;APP.renderAll();})()"%(x,y,z))
async def vpbox(pg):
    return await pg.evaluate("(function(){var r=document.querySelector('#uvp').getBoundingClientRect();return [r.left,r.top,r.width,r.height];})()")
async def ruudulla(pg,wx,wy):
    """Maailman piste ruudun koordinaatteina kanvaasin sisällä."""
    c=await cam(pg);return [c[0]+wx*c[2],c[1]+wy*c[2]]
async def nakyva(pg):
    """Näkyvä maailman suorakulmio [x1,y1,x2,y2]."""
    c=await cam(pg);v=await vpbox(pg)
    return [-c[0]/c[2],-c[1]/c[2],(v[2]-c[0])/c[2],(v[3]-c[1])/c[2]]

async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Sijainnit');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            await paletti(pg,'Painike',500,300);await pg.wait_for_timeout(100)
            # --- 1. ⌖ Sijainti tämän ruudun keskelle, zoomaus talteen ---
            await setcam(pg,-1200,-500,0.8)
            assert await pg.is_visible('.zoomc [data-z="mark"]') and await pg.is_visible('.zoomc [data-z="area"]')
            await pg.click('.zoomc [data-z="mark"]');await pg.wait_for_timeout(150)
            r=await P(pg,"(function(){var m=Object.values(P.b).find(b=>b.k==='merkki');return [m.nm,m.kk,m.zz,m.x+m.w/2,m.y+m.h/2,APP.S.sel.id===m.id];})()")
            v=await vpbox(pg);keski=[(v[2]/2+1200)/0.8,(v[3]/2+500)/0.8]
            print(W,'1 sijainti:',r,'odotettu keskipiste',[round(x) for x in keski])
            assert r[0]=='Sijainti' and r[1]=='keski' and r[2]==0.8 and abs(r[3]-keski[0])<2 and abs(r[4]-keski[1])<2 and r[5]
            assert await pg.is_visible('#mframe'),'kehys näyttää käytössä näkyvän alueen'
            await pg.screenshot(path='versio4_sijainti_%d.png'%W)
            # Kumoa poistaa ja palauttaa
            await pg.click('#undobtn');await pg.wait_for_timeout(120)
            assert await P(pg,"Object.values(P.b).filter(b=>b.k==='merkki').length")==0
            await pg.click('.zoomc [data-z="mark"]');await pg.wait_for_timeout(150)
            # --- 2. Alkukohdaksi ---
            await pg.check('#insp input[data-k="valku"]');await pg.wait_for_timeout(100)
            mid=await P(pg,"Object.values(P.b).find(b=>b.k==='merkki').id")
            assert await P(pg,"P.views[0].alku")==mid
            # --- 3. Lukitus vie alkukohtaan ---
            await setcam(pg,300,200,1.4)
            await pg.click('#lockbtn');await pg.wait_for_timeout(200)
            c=await cam(pg);v=await vpbox(pg);pt=await ruudulla(pg,keski[0],keski[1])
            print(W,'3 lukitus:',[round(x,2) for x in c],'piste ruudulla',[round(x) for x in pt],'keskellä',[v[2]/2,v[3]/2])
            assert c[2]==0.8 and abs(pt[0]-v[2]/2)<2 and abs(pt[1]-v[3]/2)<2
            assert await pg.evaluate("getComputedStyle(document.querySelector('.ue.k-merkki')).display")=='none','sijainti piilossa käytössä'
            # vapaa rullaus toimii vielä
            await pg.mouse.move(v[0]+v[2]/2,v[1]+v[3]/2);await pg.mouse.wheel(0,300);await pg.wait_for_timeout(80)
            assert (await cam(pg))[1]!=c[1],'vapaa: rulla liikuttaa'
            await pg.click('#lockbtn');await pg.wait_for_timeout(150)
            # --- 4. Ei rullausta ---
            await pg.evaluate("APP.S.sel=null;APP.renderAll()")
            await pg.click('#insp [data-vseg="rul"][data-v="ei"]');await pg.wait_for_timeout(100)
            assert await P(pg,"P.views[0].rul")=='ei'
            await pg.click('#lockbtn');await pg.wait_for_timeout(200)
            c0=await cam(pg);v=await vpbox(pg)
            await pg.mouse.move(v[0]+40,v[1]+v[3]-60);await pg.mouse.wheel(0,400);await pg.wait_for_timeout(60)
            await pg.keyboard.down('Control');await pg.mouse.wheel(0,-300);await pg.keyboard.up('Control');await pg.wait_for_timeout(60)
            await veda(pg,[v[0]+40,v[1]+v[3]-60],[v[0]+400,v[1]+v[3]-300])
            c1=await cam(pg);zh=await pg.is_visible('.zoomc')
            print(W,'4 ei rullausta:',[round(x,1) for x in c0],'→',[round(x,1) for x in c1],'zoomnapit näkyvissä',zh)
            assert c0==c1 and not zh
            await pg.screenshot(path='versio4_ei_rullausta_%d.png'%W)
            await pg.click('#lockbtn');await pg.wait_for_timeout(150)
            # --- 5. Alueen sisällä: ⛶ Alue -napista ---
            await setcam(pg,-1000,-400,0.8)
            await pg.click('.zoomc [data-z="area"]');await pg.wait_for_timeout(150)
            A1=await P(pg,"(function(){var a=Object.values(P.b).find(b=>b.k==='alue');return [a.nm,a.x,a.y,a.w,a.h,a.z];})()")
            print(W,'5 alue:',A1)
            assert A1[0]=='Alue' and A1[5]<0
            # isonnetaan aluetta oikealle ja alas, jotta rullattavaa on
            await P(pg,"(function(){var a=Object.values(P.b).find(b=>b.k==='alue');a.w+=600;a.h+=400;APP.renderAll();return 1;})()")
            A1=await P(pg,"(function(){var a=Object.values(P.b).find(b=>b.k==='alue');return [a.x,a.y,a.w,a.h];})()")
            assert await pg.is_visible('#insp [data-vseg="rul"]')
            await pg.click('#insp [data-vseg="rul"][data-v="alue"]');await pg.wait_for_timeout(100)
            await pg.click('#lockbtn');await pg.wait_for_timeout(200)
            v=await vpbox(pg);await pg.mouse.move(v[0]+v[2]/2,v[1]+v[3]/2)
            for d in [(-3000,0),(0,-3000),(4000,0),(0,4000)]:
                await pg.mouse.wheel(d[0],d[1]);await pg.wait_for_timeout(40)
                n=await nakyva(pg)
                assert n[0]>=A1[0]-1 and n[1]>=A1[1]-1 and n[2]<=A1[0]+A1[2]+1 and n[3]<=A1[1]+A1[3]+1,('reunan yli',d,n,A1)
            n=await nakyva(pg);print(W,'5 alueen sisällä, oikea alakulma:',[round(x) for x in n],'alue',A1)
            assert abs(n[2]-(A1[0]+A1[2]))<2 and abs(n[3]-(A1[1]+A1[3]))<2,'rullaus pysähtyy alueen oikeaan alareunaan'
            # zoomaus ulos: alue pienempi kuin ruutu → pysyy keskellä
            for i in range(6):await pg.click('.zoomc [data-z="out"]')
            c=await cam(pg);ak=await ruudulla(pg,A1[0]+A1[2]/2,A1[1]+A1[3]/2)
            print(W,'5 zoomattu ulos',round(c[2],2),'alueen keskipiste ruudulla',[round(x) for x in ak])
            assert abs(ak[0]-v[2]/2)<2 and abs(ak[1]-v[3]/2)<2
            # veto ei vie alueen ohi
            await veda(pg,[v[0]+60,v[1]+v[3]-80],[v[0]+700,v[1]+v[3]-500])
            ak=await ruudulla(pg,A1[0]+A1[2]/2,A1[1]+A1[3]/2);assert abs(ak[0]-v[2]/2)<2
            await pg.screenshot(path='versio4_alue_%d.png'%W)
            assert await pg.evaluate("getComputedStyle(document.querySelector('.ue.k-alue')).display")=='none','alue piilossa käytössä'
            await pg.click('#lockbtn');await pg.wait_for_timeout(150)
            # --- 6. Toinen huone: alue 2 ja sijainti 2 sen sisällä, napit Siirry heti / vierien ---
            r=await P(pg,"""(function(){
              var a2=KK.addBlock(P,'alue',{v:P.views[0].id,nm:'Huone 2'});a2.x=5000;a2.y=0;a2.w=900;a2.h=600;a2.z=-5;
              var m2=KK.addBlock(P,'merkki',{v:P.views[0].id,kk:'keski',nm:'Huone 2 keskellä'});m2.x=5432;m2.y=282;
              var m1=Object.values(P.b).find(b=>b.k==='merkki'&&b.nm==='Sijainti');
              function nap(nm,y,kohde,tapa){var n=KK.addBlock(P,'nappi',{v:P.views[0].id,beh:'kerta',tx:nm,nm:nm});n.x=kohde===m2.id?m1.x-60:5050;n.y=kohde===m2.id?m1.y+y:y+60;
                var t=KK.addBlock(P,'tee',{do:'siirry',o:kohde,tapa:tapa});KK.addLink(P,KK.addNode(P,n.id,0,y).id,'e',KK.addNode(P,t.id,200,y).id,'e');return n;}
              nap('Heti',60,m2.id,'heti');nap('Vierien',120,m2.id,'');nap('Takaisin',0,m1.id,'heti');
              KK.repair(P);APP.renderAll();return [a2.id,m2.id];})()""")
            a2,m2=r
            # Takaisin-nappi on huoneessa 2; ensimmäinen huone on alkukohdan alue
            await pg.click('#lockbtn');await pg.wait_for_timeout(200)
            async def paina(nm):
                i=await P(pg,"B(%r).id"%nm);await pg.click('.ue[data-id="%s"] button'%i)
            await paina('Heti');anim=await pg.evaluate("document.querySelector('#uworld').classList.contains('anim')")
            await pg.wait_for_timeout(120)
            v=await vpbox(pg);pt=await ruudulla(pg,5432+18,282+18);act=await pg.evaluate("APP.P.cam[APP.S.vw].a")
            print(W,'6 heti: anim',anim,'piste',[round(x) for x in pt],'aktiivinen alue',act==a2)
            assert not anim and act==a2
            # huone 2 (900×600) on pienempi kuin ruutu 1440/1280 → keskellä; piste on huoneen keskellä
            assert abs(pt[0]-v[2]/2)<2 and abs(pt[1]-v[3]/2)<2
            # rullaus huoneessa 2 ei vie takaisin huoneeseen 1
            await pg.mouse.move(v[0]+v[2]/2,v[1]+v[3]/2);await pg.mouse.wheel(-5000,0);await pg.wait_for_timeout(40)
            n=await nakyva(pg);assert n[0]>4000,('karkasi huoneesta 2',n)
            await pg.screenshot(path='versio4_huone2_%d.png'%W)
            await paina('Takaisin');await pg.wait_for_timeout(120)
            act=await pg.evaluate("APP.P.cam[APP.S.vw].a");a1id=await P(pg,"Object.values(P.b).find(b=>b.k==='alue'&&b.nm==='Alue').id")
            assert act==a1id,'takaisin ensimmäiseen alueeseen'
            await paina('Vierien');anim=await pg.evaluate("document.querySelector('#uworld').classList.contains('anim')")
            print(W,'6 vierien: anim',anim);assert anim
            await pg.wait_for_timeout(600)
            assert not await pg.evaluate("document.querySelector('#uworld').classList.contains('anim')")
            await pg.click('#lockbtn');await pg.wait_for_timeout(150)
            # --- 7. Siirry-toiminnon paneeli: Vierien / Heti ---
            tid=await P(pg,"Object.values(P.b).find(b=>b.k==='tee'&&b.tapa==='heti').id")
            await pg.evaluate("APP.S.sel={t:'b',id:%r};APP.renderAll()"%tid)
            assert await pg.is_visible('#insp [data-seg="tapa"][data-v="heti"].on')
            await pg.click('#insp [data-seg="tapa"][data-v="vieri"]');await pg.wait_for_timeout(80)
            assert await P(pg,"P.b[%r].tapa"%tid)=='vieri'
            # --- 8. Sijainnin paneeli: kohta, zoomaus, päivitä tähän ---
            await pg.evaluate("APP.S.sel={t:'b',id:%r};APP.renderAll()"%m2)
            await pg.click('#insp [data-seg="kk"][data-v="kulma"]');await pg.wait_for_timeout(80)
            r=await P(pg,"[P.b[%r].kk,P.b[%r].x,P.b[%r].y]"%(m2,m2,m2));print(W,'8 kulmaan:',r)
            assert r==['kulma',5450,300],'piste pysyy paikallaan, merkki siirtyy sen päälle'
            await pg.click('#insp [data-seg="zzm"][data-v="oma"]');await pg.wait_for_timeout(80)
            assert isinstance(await P(pg,"P.b[%r].zz"%m2),(int,float))
            await pg.click('#insp [data-seg="zzm"][data-v="ennallaan"]');await pg.wait_for_timeout(80)
            assert await P(pg,"P.b[%r].zz===undefined"%m2)
            await setcam(pg,-200,-100,1)
            await pg.click('#insp [data-do="markhere"]');await pg.wait_for_timeout(80)
            r=await P(pg,"[P.b[%r].x,P.b[%r].y]"%(m2,m2));print(W,'8 päivitä tähän:',r);assert r==[220,120]
            # --- 9. Tallennus ja uudelleenavaus: lukittuna alkukohtaan ---
            await pg.click('#lockbtn');await pg.wait_for_timeout(100)
            await setcam(pg,900,900,2);await pg.evaluate("APP.saveNow&&APP.saveNow()")
            await pg.reload();await pg.wait_for_timeout(400)
            c=await cam(pg);v=await vpbox(pg);pt=await ruudulla(pg,keski[0],keski[1])
            print(W,'9 avaus:',[round(x,2) for x in c],[round(x) for x in pt])
            assert c[2]==0.8 and abs(pt[0]-v[2]/2)<2 and abs(pt[1]-v[3]/2)<2
            print(W,'errs',errs)
            await b.close()
asyncio.run(main())
