# Pajakone 3d: tatti, liike ja muutos ajassa selaimessa. Puhelinnäkymä: tatti → (× 200) → Liike → hahmon siirto x ja y.
# Lukittuna: tatin veto oikealle liikuttaa hahmoa (kuvasilmukka), nuppi seuraa, irrotus palauttaa nupin ja pysäyttää;
# Muutos ajassa painikkeesta liikuttaa toista palikkaa 0 → 200 px kestossa ja lähettää valmis; muokatessa siirtoa ei
# näytetä; paneelin ▶ Käynnistä kokeeksi; tatti, Muutos ja Liike paletista. Kuvat pajakone3d_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0].id;P.views[0].laite='puhelin';
 function U(k,o,x,y,w,h,nm){var b=KK.addBlock(P,k,o);b.x=x;b.y=y;if(w)b.w=w;if(h)b.h=h;if(nm)KK.setName(P,b.id,nm);return b;}
 function N(b,x,y){return KK.addNode(P,b.id,x,y);}
 var tj=U('tatti',{v:v},115,620,160,160,'Tatti'),hm=U('muoto',{v:v,laji:'ympyra',hue:1},175,300,40,40,'Hahmo');
 var go=U('nappi',{v:v,tx:'Liu\\u2019uta',beh:'kerta'},20,40,140,44,'Liu'),pal=U('muoto',{v:v,laji:'laatikko',hue:3},20,120,60,40,'Pala');
 var tjn=N(tj,0,0),hmn=N(hm,900,0),gon=N(go,0,300),paln=N(pal,900,300);
 var li=KK.addBlock(P,'liike',{x0:0,y0:0});var lin=N(li,600,0);
 var mx=KK.addBlock(P,'lasku',{op:'mul',b:200}),my=KK.addBlock(P,'lasku',{op:'mul',b:200});var mxn=N(mx,300,0),myn=N(my,300,80);
 KK.addLink(P,tjn.id,'x',mxn.id,'a');KK.addLink(P,tjn.id,'y',myn.id,'a');KK.addLink(P,mxn.id,'v',lin.id,'vx');KK.addLink(P,myn.id,'v',lin.id,'vy');
 KK.addLink(P,lin.id,'v',hmn.id,'dx');KK.addLink(P,lin.id,'y',hmn.id,'dy');
 var mu=KK.addBlock(P,'muutos',{a:0,b:200,kesto:0.6});var mun=N(mu,300,300);KK.addLink(P,gon.id,'e',mun.id,'e');KK.addLink(P,mun.id,'v',paln.id,'dx');
 var mem=KK.addBlock(P,'muisti',{v:'0'});N(mem,900,500);var t=KK.addBlock(P,'tee',{do:'lisaa',o:mem.id});var tn=N(t,600,500);KK.addLink(P,mun.id,'e',tn.id,'e');
 KK.repair(P);APP.renderAll();return {tj:tj.id,hm:hm.id,go:go.id,pal:pal.id,li:li.id,mu:mu.id,mem:mem.id};})()"""
async def tr(pg,id):
    return await pg.evaluate("document.querySelector('.ue[data-id=\"%s\"]').style.transform"%id)
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Liike');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            # Paletissa
            assert await pg.locator('#pal .chip',has_text='Tatti').count()==1
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(150)
            assert await pg.locator('#pal .chip',has_text='Muutos ajassa').count()==1 and await pg.locator('#pal .chip',has_text='Liike').count()>=1
            await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP)
            assert await tr(pg,I['hm'])=='','muokatessa ei siirtoa'
            await pg.click('#lockbtn');await pg.wait_for_timeout(250)
            # --- 1. Tatti oikealle: hahmo liikkuu, nuppi seuraa ---
            tb=await pg.locator('.ue[data-id="%s"] .w-tatti'%I['tj']).bounding_box();cx,cy=tb['x']+tb['width']/2,tb['y']+tb['height']/2
            await pg.mouse.move(cx,cy);await pg.mouse.down();await pg.mouse.move(cx+tb['width']*0.4,cy,steps=4);await pg.wait_for_timeout(500)
            knob=await pg.evaluate("document.querySelector('.ue[data-id=\"%s\"] .tk').style.left"%I['tj'])
            x1=await P(pg,"E().val('%s')"%I['li']);t1=await tr(pg,I['hm'])
            await pg.wait_for_timeout(300);x2=await P(pg,"E().val('%s')"%I['li'])
            print(W,'1 tatti:',knob,round(x1,1),t1,round(x2,1));assert float(knob.rstrip('%'))>75 and x1>40 and x2>x1+30 and t1.startswith('translate(')
            assert abs(await P(pg,"E().val('%s','y')"%I['li']))<1,'vain vaakaan'
            await pg.screenshot(path='pajakone3d_tatti_%d.png'%W)
            await pg.mouse.up();await pg.wait_for_timeout(250)
            assert await P(pg,"E().val('%s')"%I['tj'])==0;x3=await P(pg,"E().val('%s')"%I['li']);await pg.wait_for_timeout(300)
            assert await P(pg,"E().val('%s')"%I['li'])==x3,'pysähtyy irrotettaessa'
            assert await pg.evaluate("!APP.S.frRaf"),'kuvasilmukka pysähtyi'
            knob=await pg.evaluate("document.querySelector('.ue[data-id=\"%s\"] .tk').style.left"%I['tj']);assert knob=='50%'
            # --- 2. Muutos ajassa ---
            await pg.click('.ue[data-id="%s"] button'%I['go']);await pg.wait_for_timeout(250)
            mid=await P(pg,"E().val('%s')"%I['mu']);assert 10<mid<200,mid
            await pg.wait_for_timeout(600)
            fin=[await P(pg,"E().val('%s')"%I['mu']),await tr(pg,I['pal']),await P(pg,"E().val('%s')"%I['mem'])];print(W,'2 lopussa:',fin)
            assert fin==[200,'translate(200px, 0px)',1] or fin==[200,'translate(200.00px, 0.00px)',1],fin
            print(W,'2 muutos ok, puolivälissä',round(mid))
            await pg.screenshot(path='pajakone3d_muutos_%d.png'%W)
            # --- 3. Muokatessa siirto pois, paneelin kokeilu ---
            await pg.click('#lockbtn');await pg.wait_for_timeout(200);assert await tr(pg,I['pal'])==''
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(200)
            mn=await P(pg,"P.lg.n.find(n=>n.p==='%s').id"%I['mu']);await pg.click('#lworld [data-nid="%s"] .lt'%mn);await pg.wait_for_timeout(150)
            await pg.click('#insp [data-do="muutosgo"]');await pg.wait_for_timeout(900)
            assert await P(pg,"E().val('%s')"%I['mem'])==2
            # Miksi?
            assert 'matkasta' in await P(pg,"KK.why(P,E(),'%s',1).txt"%I['mu'])
            assert 'Paikka' in await P(pg,"KK.why(P,E(),'%s',1).txt"%I['li'])
            print(W,'errs',errs);assert not errs;await b.close()
asyncio.run(main())
