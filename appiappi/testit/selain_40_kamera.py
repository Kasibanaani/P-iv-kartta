# Appi-appi 1: maailma ja kamera selaimessa. Puhelinnäkymä: tatti kojelautakerroksessa (lukittu ruutuun), hahmo pohjalla,
# kaukainen tausta 50 %:n kerroksessa. Kamera seuraa hahmoa: kuollut alue 0 % → hahmo pysyy keskellä, tatti pysyy paikallaan
# ruudulla, tausta liikkuu puolet kameran liikkeestä (parallaksi vaakaan). Kuollut alue 40 %: hahmo pääsee ensin liikkumaan.
# Maailman rajat Alue-palikasta. Rullaus kaikkiin suuntiin ilman kameraa: veto sivulle ja ylös rullaa rajoihin asti.
# Paneelin Maailma ja kamera -osio. Muokatessa kuollut alue näkyy katkoviivaympyränä. Kuvat appiappi1_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0];v.laite='puhelin';var vw=v.id;
 v.kr=[{id:'pohja',n:'Pohja'},{id:'k1',n:'Kojelauta',rv:0},{id:'k2',n:'Tausta',rv:50}];v.kr=[v.kr[2],v.kr[0],v.kr[1]];
 function U(k,o,x,y,w,h,nm){var b=KK.addBlock(P,k,o);b.x=x;b.y=y;if(w)b.w=w;if(h)b.h=h;if(nm)KK.setName(P,b.id,nm);return b;}
 function N(b,x,y){return KK.addNode(P,b.id,x,y);}
 var tj=U('tatti',{v:vw},115,640,160,160,'Tatti');tj.kr='k1';
 var hm=U('muoto',{v:vw,laji:'ympyra',hue:1},175,402,40,40,'Hahmo');
 var ta=U('muoto',{v:vw,laji:'laatikko',hue:3},100,100,60,60,'Kaukana');ta.kr='k2';
 var puu=U('muoto',{v:vw,laji:'laatikko',hue:2},300,200,50,50,'Puu');
 var maa=U('alue',{v:vw},-400,-400,1600,1600,'Maa');
 var tjn=N(tj,0,0),hmn=N(hm,900,0);
 var li=KK.addBlock(P,'liike',{x0:0,y0:0});var lin=N(li,600,0);
 var mx=KK.addBlock(P,'lasku',{op:'mul',b:400}),my=KK.addBlock(P,'lasku',{op:'mul',b:400});var mxn=N(mx,300,0),myn=N(my,300,80);
 KK.addLink(P,tjn.id,'x',mxn.id,'a');KK.addLink(P,tjn.id,'y',myn.id,'a');KK.addLink(P,mxn.id,'v',lin.id,'vx');KK.addLink(P,myn.id,'v',lin.id,'vy');
 KK.addLink(P,lin.id,'v',hmn.id,'dx');KK.addLink(P,lin.id,'y',hmn.id,'dy');
 KK.repair(P);APP.renderAll();return {tj:tj.id,hm:hm.id,ta:ta.id,puu:puu.id,maa:maa.id,li:li.id};})()"""
async def rel(pg,id):
    """Palikan keskipiste suhteessa laitteen ruutuun (ruudun pikseleinä) ja ruudun koko."""
    return await pg.evaluate("""(id)=>{var v=document.querySelector('#uvp').getBoundingClientRect(),e=document.querySelector('.ue[data-id="'+id+'"]').getBoundingClientRect();
      return [e.left+e.width/2-v.left,e.top+e.height/2-v.top,v.width,v.height];}""",id)
async def tyhja(pg):
    await pg.evaluate("(function(){APP.S.sel=null;APP.S.multi=[];APP.renderAll();})()");await pg.wait_for_timeout(100)
async def main():
    async with async_playwright() as p:
        for W in (1440,390):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Maailma');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP)
            if W>500:
                # --- 0. Paneeli: Maailma ja kamera ---
                await tyhja(pg)
                assert 'MAAILMA JA KAMERA' in (await pg.inner_text('#insp')).upper()
                await pg.select_option('#insp [data-vkam="o"]',I['hm']);await pg.wait_for_timeout(150)
                assert await P(pg,"P.views[0].kam")=={'o':I['hm']}
                await pg.fill('#insp [data-vkam="ka"]','0');await pg.dispatch_event('#insp [data-vkam="ka"]','change');await pg.wait_for_timeout(100)
                await pg.fill('#insp [data-vkam="pe"]','0');await pg.dispatch_event('#insp [data-vkam="pe"]','change');await pg.wait_for_timeout(100)
                await pg.select_option('#insp [data-vkam="ra"]',I['maa']);await pg.wait_for_timeout(100)
                k=await P(pg,"P.views[0].kam");print(W,'0 paneelista:',k);assert k=={'o':I['hm'],'ka':0,'pe':0,'ra':I['maa']}
                assert await pg.locator('#insp [data-vseg="lrul"][data-v="kaikki"].on').count()==1,'seuratessa kaikkiin suuntiin'
                await pg.fill('#insp [data-vkam="ka"]','40');await pg.dispatch_event('#insp [data-vkam="ka"]','change');await pg.wait_for_timeout(150)
                z=await pg.evaluate("(function(){var e=document.querySelector('#dframe .dzone');return e?[parseFloat(e.style.width),parseFloat(e.style.left)]:null;})()")
                print(W,'  kuollut alue muokatessa:',z);assert z and abs(z[0]-0.4*390)<0.5 and abs(z[1]-(195-78))<0.5
                await pg.screenshot(path='appiappi1_paneeli_%d.png'%W)
                await pg.evaluate("APP.P.views[0].kam.ka=0;APP.renderAll()")
            else:
                await pg.evaluate("(function(){APP.P.views[0].kam={o:'%s',ka:0,pe:0,ra:'%s'};APP.renderAll();})()"%(I['hm'],I['maa']))
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            # --- 1. Avattaessa hahmo keskellä ---
            h=await rel(pg,I['hm']);t0=await rel(pg,I['tj']);k0=await rel(pg,I['ta']);print(W,'1 hahmo alussa:',[round(x) for x in h])
            assert abs(h[0]-h[2]/2)<2 and abs(h[1]-h[3]/2)<2,h
            # --- 2. Tatti oikealle: hahmo pysyy keskellä, tatti paikallaan, tausta liikkuu puolet ---
            tb=await pg.locator('.ue[data-id="%s"] .w-tatti'%I['tj']).bounding_box();cx,cy=tb['x']+tb['width']/2,tb['y']+tb['height']/2
            await pg.mouse.move(cx,cy);await pg.mouse.down();await pg.mouse.move(cx+tb['width']*0.45,cy,steps=4);await pg.wait_for_timeout(600)
            await pg.screenshot(path='appiappi1_seuraa_%d.png'%W)
            await pg.mouse.up();await pg.wait_for_timeout(300)
            x1=await P(pg,"E().val('%s')"%I['li']);h=await rel(pg,I['hm']);t1=await rel(pg,I['tj']);k1=await rel(pg,I['ta'])
            z=h[2]/390
            print(W,'2 liikuttu',round(x1),'hahmo',[round(x) for x in h[:2]],'tatti',round(t1[0]-t0[0],1),'tausta',round(k1[0]-k0[0],1))
            assert x1>80,x1
            assert abs(h[0]-h[2]/2)<3 and abs(h[1]-h[3]/2)<3,'hahmo keskellä'
            assert abs(t1[0]-t0[0])<1 and abs(t1[1]-t0[1])<1,'kojelauta paikallaan'
            assert abs((k1[0]-k0[0])-(-x1*z/2))<3,'tausta puolella vauhdilla'
            assert await pg.evaluate("!APP.S.frRaf"),'kuvasilmukka pysähtyi'
            # --- 3. Maailman raja: hahmo vasemmalle reunaan, kamera ei mene rajan yli ---
            await pg.evaluate("(function(){APP.P.st['%s']={x:-560,y:0};KK.tick(APP.P,APP.ctx());APP.renderAll();APP.runFrames();})()"%I['li'])
            await pg.wait_for_timeout(400)
            h=await rel(pg,I['hm']);c=await pg.evaluate("[APP.P.cam[APP.S.vw].x/APP.P.cam[APP.S.vw].z]")
            print(W,'3 rajalla: hahmo',[round(x) for x in h[:2]],'kamera x',round(-c[0]))
            assert abs(-c[0]-(-400))<1,'kamera alueen vasemmassa reunassa (hyppy seurataan)';assert h[0]<h[2]/2-50,'hahmo vasemmalla, ei keskellä'
            # --- 4. Kuollut alue 40 %: pieni siirto ei liikuta kameraa, iso liikuttaa ---
            await pg.evaluate("(function(){APP.P.views[0].kam.ka=40;delete APP.P.views[0].kam.ra;APP.P.st['%s']={x:0,y:0};KK.tick(APP.P,APP.ctx());APP.goStart(APP.S.vw);APP.renderAll();})()"%I['li']);await pg.wait_for_timeout(200)
            c0=await pg.evaluate("APP.P.cam[APP.S.vw].x/APP.P.cam[APP.S.vw].z")
            await pg.evaluate("(function(){APP.P.st['%s']={x:50,y:0};KK.tick(APP.P,APP.ctx());APP.renderAll();APP.runFrames();})()"%I['li']);await pg.wait_for_timeout(300)
            c1=await pg.evaluate("APP.P.cam[APP.S.vw].x/APP.P.cam[APP.S.vw].z")
            await pg.evaluate("(function(){APP.P.st['%s']={x:200,y:0};KK.tick(APP.P,APP.ctx());APP.renderAll();APP.runFrames();})()"%I['li']);await pg.wait_for_timeout(300)
            c2=await pg.evaluate("APP.P.cam[APP.S.vw].x/APP.P.cam[APP.S.vw].z")
            vis=await pg.evaluate("document.querySelector('#uvp').getBoundingClientRect()");sw,sh=vis['width']/z,vis['height']/z;R=0.4*min(sw,sh)/2
            print(W,'4 kuollut alue: kamera',round(-c0),round(-c1),round(-c2),'R',round(R))
            assert abs(c1-c0)<0.5,'sisällä ei liiku';assert abs((-c2)-(-c0)-(200-R))<1.5,'reunalla lähtee mukaan'
            # --- 5. Rullaus kaikkiin suuntiin ilman kameraa ---
            await pg.evaluate("(function(){var v=APP.P.views[0];delete v.kam;v.lrul='kaikki';APP.goStart(APP.S.vw);APP.renderAll();})()");await pg.wait_for_timeout(150)
            vb=await pg.locator('#uvp').bounding_box();a=[vb['x']+vb['width']*0.5,vb['y']+vb['height']*0.35]
            await veda(pg,a,[a[0]-150,a[1]-120])
            c=await pg.evaluate("[APP.P.cam[APP.S.vw].x/APP.P.cam[APP.S.vw].z,APP.P.cam[APP.S.vw].y/APP.P.cam[APP.S.vw].z]")
            print(W,'5 rullattu kaikkiin suuntiin:',[round(x) for x in c]);assert c[0]<-100 and c[1]<-80,c
            await veda(pg,a,[a[0]-3000,a[1]-3000],steps=4)
            c=await pg.evaluate("[APP.P.cam[APP.S.vw].x/APP.P.cam[APP.S.vw].z,APP.P.cam[APP.S.vw].y/APP.P.cam[APP.S.vw].z]")
            print(W,'  reunaan asti:',[round(x) for x in c]);assert abs(-c[0]-(1200-sw))<2 and abs(-c[1]-(1200-sh))<2,'alueen (Maa) oikea alakulma'
            # --- 6. Ei rullausta ---
            await pg.evaluate("(function(){APP.P.views[0].lrul='ei';APP.goStart(APP.S.vw);APP.renderAll();})()")
            await veda(pg,a,[a[0]-150,a[1]-120]);c=await pg.evaluate("[APP.P.cam[APP.S.vw].x,APP.P.cam[APP.S.vw].y]");assert c==[0,0],c
            # Vanha pystyrullaus ennallaan
            await pg.evaluate("(function(){delete APP.P.views[0].lrul;APP.renderAll();})()")
            await veda(pg,a,[a[0]-150,a[1]-120]);c=await pg.evaluate("[APP.P.cam[APP.S.vw].x,APP.P.cam[APP.S.vw].y]");print(W,'6 pystyyn:',c);assert c[0]==0
            print(W,'errs',errs);assert not errs;await b.close()
asyncio.run(main())
