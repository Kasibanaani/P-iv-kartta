# Animoi-tila ja nauhoitus keinokellolla (testi ohjaa aikaa, joten ruutujen määrä on tarkka):
# ● Nauhoita → sormen liike 2 s → 48 ruutua; toinen kierros nivelosalle, kun vartalo toistaa omaansa (moniraita: vartalo ei muutu,
# nauhoitus loppuu animaation lopussa); harjoittelu ei tallennu; kaksi osaa kahdella sormella samalla kertaa; Apple Pencil
# (pointerType pen); hiiren kiertokahva nauhoituksessa; laskuri 3-2-1 ja osaan tarttuminen laskurin aikana; Kumoa poistaa
# kierroksen; toisto ja silmukka; haamukuva; aikajanan veto; näppäimet. iPad 1024 ja 820 (kosketus) sekä 1280 (hiiri).
import asyncio, os, math
from playwright.async_api import async_playwright
from yhteinen import *
FPS=24
async def nappi(pg,T,sel):
    c=await pg.evaluate("(s)=>{var r=document.querySelector(s).getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];}",sel)
    if T:await T.napauta(sel)
    else:await pg.mouse.click(*c)
    await pg.wait_for_timeout(30)
async def rakenna(pg):
    await uusi(pg,'Ukko')
    await lisaa(pg,svg('#c33',120,200),'Vartalo');await lisaa(pg,svg('#36c',30,120),'Käsi')
    await pg.evaluate("""(()=>{var P=APP.P,AM=APP.AM,v=P.osat[0],k=P.osat[1];v.perus={x:200,y:300,kulma:0,koko:1};v.kp=[60,100];
      AM.vaihdaVanhempi(P,k.id,v.id,0);k.liikkuu='nivel';k.kp=[15,10];k.perus={x:100,y:30,kulma:0,koko:1};APP.Dt.cfg.laskuri=false;APP.muuttui();APP.renderAll();APP.testi(true);APP.kello(1000);})()""")
async def main():
    async with async_playwright() as p:
        for W,H,touch in ((1024,768,True),(820,1180,True),(1280,800,False)):
            b,ctx,pg,errs=await avaa(p,W,H,touch=touch);T=await Kosketus.luo(pg) if touch else None
            await rakenna(pg)
            async def alas(x,y,i=0):
                if T:await T.t('touchStart',[(i,(x,y))])
                else:await pg.mouse.move(x,y);await pg.mouse.down()
            async def liiku(pts):
                if T:await T.t('touchMove',[(i,q) for i,q in enumerate(pts)])
                else:await pg.mouse.move(*pts[0])
            async def ylos():
                if T:await T.t('touchEnd',[])
                else:await pg.mouse.up()
            # 1. Vartalo: 2 s oikealle 60 näytettä sekunnissa
            await nappi(pg,T,'#recbtn');assert await P(pg,"[S.tila,!!S.nauh,P.ruutuja]")==['animoi',True,1440],'nauhoitus alkoi, Animoi-tila, avoin pituus'
            t0=1000;s=await P(pg,"S.nak.s");a=await ruutu(pg,200,350)
            await alas(*a)
            for i in range(1,121):
                await liiku([(a[0]+i*s,a[1])]);await kello(pg,t0+i*1000/60)
            await ylos();await kello(pg,t0+2000+20)
            await nappi(pg,T,'#recbtn')
            r=await P(pg,"[P.ruutuja,AM.nauhoitettuja(P,O('Vartalo').id),P.liike[O('Vartalo').id][0][0],P.liike[O('Vartalo').id][24][0],P.liike[O('Vartalo').id][47][0],AM.onLiike(P,O('Käsi').id)]")
            print(W,'kierros 1',r)
            assert r[0]==48 and r[1]==48,'2 s = 48 ruutua'
            assert abs(r[2]-200)<0.6 and abs(r[3]-260)<0.8 and abs(r[4]-317.5)<0.8,'x etenee 60 px/s'
            assert r[5]==False,'käsi ei nauhoittunut'
            # 2. Käsi (nivel) toisella kierroksella: vartalo toistaa, käsi kääntyy 0 → 90°, pituus pysyy, loppuu itsestään
            vartalo=await P(pg,"P.liike[O('Vartalo').id]")
            t0=5000;await kello(pg,t0);await nappi(pg,T,'#recbtn')
            kp=await P(pg,"AM.maailmaksi(P,O('Käsi'),AM.maailma(P,0))");aw=await P(pg,"AM.piste(AM.maailma(P,0)[O('Käsi').id].m,15,110)")
            a=await ruutu(pg,aw[0],aw[1]);c=await ruutu(pg,kp['x'],kp['y']);R=math.hypot(a[0]-c[0],a[1]-c[1])
            await alas(*a)
            for i in range(1,121):
                kpn=await P(pg,"AM.maailmaksi(P,O('Käsi'),AM.maailma(P,S.f))");c=await ruutu(pg,kpn['x'],kpn['y'])
                an=math.pi/2+math.radians(90*min(1,i/96));await liiku([(c[0]+R*math.cos(an),c[1]+R*math.sin(an))]);await kello(pg,t0+i*1000/60)
            r=await P(pg,"[!!S.nauh,P.ruutuja,AM.nauhoitettuja(P,O('Käsi').id)]");print(W,'kierros 2',r)
            assert r==[False,48,48],'nauhoitus loppui itsestään 2 s kohdalla, käsi 48 ruutua'
            await ylos();await pg.wait_for_timeout(30)
            assert await P(pg,"P.liike[O('Vartalo').id]")==vartalo,'moniraita: vartalon nauhoitus ei muuttunut'
            kk=await P(pg,"[P.liike[O('Käsi').id][0][2],P.liike[O('Käsi').id][47][2],P.liike[O('Käsi').id][10][0],P.liike[O('Käsi').id][40][0]]");print(W,'käsi',kk)
            assert abs(kk[0])<1 and abs(kk[1]-90)<1.5,'käden kulma 0 → 90° vartalon suhteen'
            assert kk[2]==100 and kk[3]==100,'nivel: kiinnityskohta pysyy'
            # 3. Harjoittelu ei tallennu
            await nappi(pg,T,'#startbtn');ennen=await P(pg,"P.liike");vv=await P(pg,"AM.maailmaksi(P,O('Vartalo'),AM.maailma(P,0))")
            a=await ruutu(pg,vv['x'],vv['y']+40);await alas(*a);await liiku([(a[0]+60,a[1]+30)])
            assert 'Harjoittelet' in await pg.inner_text('#tstat'),'harjoittelu näkyy'
            await ylos();await pg.wait_for_timeout(30);assert await P(pg,"P.liike")==ennen and await P(pg,"Object.keys(S.yli).length")==0,'harjoittelu palaa paikalleen'
            # 4. Kumoa poistaa kierroksen, Tee uudelleen palauttaa
            await nappi(pg,T,'#undobtn');assert not await P(pg,"AM.onLiike(P,O('Käsi').id)"),'Kumoa poisti käden kierroksen'
            await nappi(pg,T,'#redobtn');assert await P(pg,"AM.nauhoitettuja(P,O('Käsi').id)")==48
            # 5. Toisto ja silmukka
            await kello(pg,10000);await nappi(pg,T,'#playbtn');await kello(pg,11000);assert await P(pg,"S.f")==24,'1 s toistoa = ruutu 24'
            await kello(pg,12500);assert await P(pg,"S.f")==12,'silmukka alkaa alusta';await nappi(pg,T,'#playbtn');assert await P(pg,"S.toisto")==None
            # 6. Haamukuva: hyppy ruutujen 4 ja 5 välillä, edellinen ruutu näkyy himmeänä
            await pg.evaluate("(()=>{var P=APP.P,id=P.osat[0].id;P.liike[id][4]=[60,200,0,1];P.liike[id][5]=[400,200,0,1];P.osat[0].tas=0;APP.muuttui();APP.asetaRuutu(5);})()")
            px=await pg.evaluate("""(()=>{var c=document.querySelector('#cv'),q=APP.ruudulle(60,200),d=window.devicePixelRatio||1;return Array.from(c.getContext('2d').getImageData(Math.round(q[0]*d),Math.round(q[1]*d),1,1).data);})()""")
            await nappi(pg,T,'#haamubtn');px2=await pg.evaluate("""(()=>{var c=document.querySelector('#cv'),q=APP.ruudulle(60,200),d=window.devicePixelRatio||1;return Array.from(c.getContext('2d').getImageData(Math.round(q[0]*d),Math.round(q[1]*d),1,1).data);})()""")
            print(W,'haamu',px,px2);assert px[1]<235 and px[0]>px[1]+10,'haamukuva näkyy punertavana';assert px2[:3]==[255,255,255],'haamukuva pois: valkoinen'
            await nappi(pg,T,'#haamubtn')
            # 7. Aikajanan veto
            tb=await pg.evaluate("(()=>{var r=document.querySelector('#tlcv').getBoundingClientRect();return [r.left,r.top,r.width];})()")
            x=tb[0]+10+(tb[2]-20)*(30.5/48)
            if T:await T.nollaa();await T.t('touchStart',[(0,(x,tb[1]+8))]);await T.t('touchEnd',[])
            else:await pg.mouse.click(x,tb[1]+8)
            await pg.wait_for_timeout(30);assert await P(pg,"S.f")==30,'aikajanan napautus valitsee ruudun'
            assert '31 / 48' in await pg.inner_text('#fcount')
            await pg.screenshot(path='animoi_%d.png'%W)
            if T:
                # 8. Kaksi osaa yhtä aikaa: sormi vartalossa ja toinen kädessä samalla kierroksella
                await pg.evaluate("(()=>{var P=APP.P;P.osat.forEach(o=>APP.AM.tyhjennaLiike(P,o.id));APP.muuttui();APP.renderAll();})()")
                t0=20000;await kello(pg,t0);await nappi(pg,T,'#recbtn')
                vv=await P(pg,"AM.piste(AM.maailma(P,0)[O('Vartalo').id].m,60,180)");a1=await ruutu(pg,vv[0],vv[1])
                kw=await P(pg,"AM.piste(AM.maailma(P,0)[O('Käsi').id].m,15,110)");a2=await ruutu(pg,kw[0],kw[1])
                await T.t('touchStart',[(0,a1)]);await T.t('touchStart',[(0,a1),(1,a2)])
                for i in range(1,25):
                    await T.t('touchMove',[(0,(a1[0],a1[1]-i)),(1,(a2[0]+i*2,a2[1]))]);await kello(pg,t0+i*1000/24)
                await T.t('touchEnd',[]);await kello(pg,t0+1100)
                r=await P(pg,"[AM.nauhoitettuja(P,O('Vartalo').id),AM.nauhoitettuja(P,O('Käsi').id)]");print(W,'kaksi osaa',r);assert r[0]>=24 and r[1]>=24,'molemmat osat nauhoittuivat samalla kierroksella'
                await kello(pg,t0+2100);assert await P(pg,"S.nauh")==None
                # 9. Apple Pencil: kynällä nauhoitus
                await pg.evaluate("(()=>{var P=APP.P;P.osat.forEach(o=>APP.AM.tyhjennaLiike(P,o.id));APP.muuttui();APP.renderAll();})()")
                t0=30000;await kello(pg,t0);await nappi(pg,T,'#recbtn')
                vv=await P(pg,"AM.piste(AM.maailma(P,0)[O('Vartalo').id].m,60,180)");a=await ruutu(pg,vv[0],vv[1])
                await T.kyna('mousePressed',*a)
                for i in range(1,25):await T.kyna('mouseMoved',a[0],a[1]+i*2,0.3+i/50);await kello(pg,t0+i*1000/24)
                await T.kyna('mouseReleased',a[0],a[1]+48);await kello(pg,t0+1200)
                r=await P(pg,"[AM.nauhoitettuja(P,O('Vartalo').id),P.liike[O('Vartalo').id][24][1]-P.liike[O('Vartalo').id][0][1]]");print(W,'kynä',r,await P(pg,"[P.liike[O('Vartalo').id].slice(0,3),P.liike[O('Käsi').id]&&P.liike[O('Käsi').id].filter(x=>x).length,S.sel==O('Vartalo').id]"))
                assert r[0]>=24 and abs(r[1]-48/s)<1.5,'kynä nauhoittaa'
                await kello(pg,t0+2100)
                # 10. Laskuri: osaan tartutaan laskurin aikana, liike alkaa ruudusta 0
                await pg.evaluate("(()=>{var P=APP.P;P.osat.forEach(o=>APP.AM.tyhjennaLiike(P,o.id));APP.Dt.cfg.laskuri=true;APP.muuttui();APP.renderAll();})()")
                t0=40000;await kello(pg,t0);await nappi(pg,T,'#recbtn');assert await P(pg,"!!S.cd&&!S.nauh"),'laskuri käynnissä'
                await kello(pg,t0+100);assert await pg.locator('#countdown.show').count()==1 and (await pg.inner_text('#countdown b'))=='3'
                vv=await P(pg,"AM.piste(AM.maailma(P,0)[O('Vartalo').id].m,60,180)");a=await ruutu(pg,vv[0],vv[1]);await T.t('touchStart',[(0,a)])
                await kello(pg,t0+1500);assert (await pg.inner_text('#countdown b'))=='1'
                await kello(pg,t0+2100);assert await P(pg,"!!S.nauh&&!S.cd"),'nauhoitus alkoi laskurin jälkeen'
                for i in range(1,13):await T.t('touchMove',[(0,(a[0]+i*2,a[1]))]);await kello(pg,t0+2100+i*1000/24)
                await T.t('touchEnd',[]);await kello(pg,t0+2100+700)
                r=await P(pg,"[P.liike[O('Vartalo').id][0]!=null,P.liike[O('Vartalo').id][12]!=null]");assert r==[True,True],'laskurin aikana tartuttu osa nauhoittuu ruudusta 0'
                await kello(pg,t0+4200);assert await P(pg,"S.nauh")==None
            else:
                # 8b. Hiiri: kiertokahvalla nauhoitus, näppäimet R ja välilyönti
                await pg.evaluate("(()=>{var P=APP.P;P.osat.forEach(o=>APP.AM.tyhjennaLiike(P,o.id));APP.valitse(P.osat[0].id);APP.asetaRuutu(0);APP.renderAll();})()")
                kh=await pg.evaluate("(()=>{var r=document.querySelector('#cv').getBoundingClientRect(),k=APP.S.kahvat;return {c:[r.left+APP.ruudulle(200,300)[0],r.top+APP.ruudulle(200,300)[1]],ki:[r.left+k.kierto[0],r.top+k.kierto[1]]};})()")
                t0=20000;await kello(pg,t0);await pg.keyboard.press('r');assert await P(pg,"!!S.nauh"),'R aloittaa'
                c=kh['c'];R=math.hypot(kh['ki'][0]-c[0],kh['ki'][1]-c[1]);await pg.mouse.move(*kh['ki']);await pg.mouse.down()
                for i in range(1,25):an=-math.pi/2+math.radians(45*i/24);await pg.mouse.move(c[0]+R*math.cos(an),c[1]+R*math.sin(an));await kello(pg,t0+i*1000/24)
                await pg.mouse.up();await kello(pg,t0+1100);await pg.keyboard.press('r')
                r=await P(pg,"[S.nauh,AM.nauhoitettuja(P,O('Vartalo').id),P.liike[O('Vartalo').id][24][2]]");print(W,'kiertokahva',r);assert r[0]==None and r[1]>=24 and abs(r[2]-45)<1,'kiertokahva nauhoittaa kierron'
                await kello(pg,50000);await pg.keyboard.press(' ');assert await P(pg,"!!S.toisto"),'välilyönti toistaa';await pg.keyboard.press(' ')
                await pg.keyboard.press('ArrowRight');await pg.keyboard.press('ArrowRight');assert await P(pg,"S.f")>=1
            assert errs==[],errs
            await b.close()
    print('ok')
asyncio.run(main())
