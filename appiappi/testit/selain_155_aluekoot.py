# Jonon 22b (F43 vaihe 1): Alueen pikakoot (Ruudun kokoinen, Ruudun levyinen, Kumoa), Korkeus: sisällön mukaan paneelista,
# rullaustapa Koko alue näkyy, ja laitenäkymässä Siirry alueeseen vaihtaa maailman rajan, Palaa takaisin palauttaa.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0];v.laite='puhelin';v.lrul='kaikki';var vw=v.id;
 function U(k,o,x,y,w,h,nm){var b=KK.addBlock(P,k,o);b.x=x;b.y=y;if(w)b.w=w;if(h)b.h=h;if(nm)KK.setName(P,b.id,nm);return b;}
 function N(b,x,y){return KK.addNode(P,b.id,x,y);}
 var koti=U('alue',{v:vw},0,0,390,1200,'Koti'),huone=U('alue',{v:vw},2000,0,600,400,'Huone');v.kam={ra:koti.id};
 var n1=U('nappi',{v:vw,tx:'Huoneeseen',beh:'kerta'},40,100,200,56,'Huoneeseen'),n2=U('nappi',{v:vw,tx:'Takaisin',beh:'kerta'},2040,40,200,56,'Takaisin');
 U('muoto',{v:vw,laji:'laatikko'},300,1100,60,60,'Alhaalla');
 var t1=KK.addBlock(P,'tee',{do:'siirry',o:huone.id}),t2=KK.addBlock(P,'tee',{do:'takaisin'});
 KK.addLink(P,N(n1,0,0).id,'e',N(t1,300,0).id,'e');KK.addLink(P,N(n2,0,200).id,'e',N(t2,300,200).id,'e');
 KK.repair(P);APP.renderAll();return {koti:koti.id,huone:huone.id,n1:n1.id,n2:n2.id};})()"""
CAM="(function(){var c=APP.P.cam[APP.S.vw],v=document.querySelector('#uvp').getBoundingClientRect();return [-c.x/c.z,-c.y/c.z,c.z,v.width,c.ra||''];})()"
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Aluekoot');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP)
            # --- 1. Pikakoot ja Kumoa ---
            await pg.evaluate("(id)=>{APP.S.sel={t:'b',id:id};APP.renderAll();}",I['huone']);await pg.wait_for_timeout(100)
            await pg.click('#insp [data-akoko="ruutu"]');await pg.wait_for_timeout(100)
            r=await P(pg,"[B('Huone').w,B('Huone').h]");print(W,'ruudun kokoinen',r);assert r==[390,844],r
            await pg.keyboard.press('Meta+z' if False else 'Control+z');await pg.wait_for_timeout(150)
            r=await P(pg,"[B('Huone').w,B('Huone').h]");print(W,'kumottu',r);assert r==[600,400],r
            await pg.evaluate("(id)=>{APP.S.sel={t:'b',id:id};APP.renderAll();}",I['huone']);await pg.wait_for_timeout(100)
            await pg.click('#insp [data-akoko="leveys"]');await pg.wait_for_timeout(100)
            r=await P(pg,"[B('Huone').w,B('Huone').h]");assert r==[390,400],r
            await pg.evaluate("(()=>{var h=Object.values(APP.P.b).find(b=>b.nm==='Huone');h.w=600;APP.renderAll();})()")
            # --- 2. Korkeus: sisällön mukaan ---
            await pg.evaluate("(id)=>{APP.S.sel={t:'b',id:id};APP.renderAll();}",I['koti']);await pg.wait_for_timeout(100)
            await pg.check('#insp [data-k="kork_on"]');await pg.wait_for_timeout(150)
            r=await P(pg,"[B('Koti').kork,B('Koti').h]");print(W,'sisällön mukaan',r);assert r==['sis',1168],r
            await pg.evaluate("(()=>{var a=Object.values(APP.P.b).find(b=>b.nm==='Alhaalla');a.y=1150;APP.renderAll();})()");await pg.wait_for_timeout(100)
            r=await P(pg,"B('Koti').h");assert r==1218,'kasvoi palikan siirrosta %s'%r
            # --- 3. Paneelin rullaustavat ---
            await pg.evaluate("(function(){APP.S.sel=null;APP.renderAll();})()");await pg.wait_for_timeout(100)
            assert await pg.locator('#insp [data-vseg="lrul"][data-v="koko"]').count()==1
            # --- 4. Käytössä: Siirry vaihtaa rajan, Palaa takaisin palauttaa ---
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            c0=await pg.evaluate(CAM);print(W,'alussa',c0);assert abs(c0[0])<1 and abs(c0[1])<1 and c0[4]=='',c0
            await pg.click('.ue[data-id="%s"]'%I['n1']);await pg.wait_for_timeout(700)
            c1=await pg.evaluate(CAM);print(W,'huoneessa',c1);assert c1[4]==I['huone'] and 1999<=c1[0]<=2211 and abs(c1[1]-(400-844)/2)<2,c1
            # veto ei vie huoneen ulkopuolelle
            v=await pg.locator('#uvp').bounding_box();await veda(pg,[v['x']+v['width']/2,v['y']+v['height']/2],[v['x']+v['width']-5,v['y']+v['height']/2+200]);await pg.wait_for_timeout(300)
            c2=await pg.evaluate(CAM);print(W,'vedon jälkeen',c2);assert c2[0]>=1999 and abs(c2[1]-c1[1])<2,c2
            await pg.click('.ue[data-id="%s"]'%I['n2']);await pg.wait_for_timeout(700)
            c3=await pg.evaluate(CAM);print(W,'takaisin',c3);assert c3[4]=='' and abs(c3[0])<1,c3
            # --- 5. Koko alue näkyy: Koti mahtuu ruutuun, Siirry näyttää Huoneen kokonaan ---
            await pg.click('#lockbtn');await pg.wait_for_timeout(200)
            await pg.evaluate("(function(){APP.P.views[0].lrul='koko';APP.renderAll();})()")
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            c4=await pg.evaluate(CAM);s=c4[3]/390;print(W,'koko alue',c4)
            assert abs(c4[2]/s-844/1218)<0.01 and abs(c4[1])<1,c4
            await pg.click('.ue[data-id="%s"]'%I['n1']);await pg.wait_for_timeout(700)
            c5=await pg.evaluate(CAM);print(W,'koko huone',c5);assert abs(c5[2]/s-0.65)<0.01 and abs(c5[0]-2000)<1,c5
            await pg.screenshot(path='aluekoot_%d.png'%W)
            print(W,'ok','errs',errs);assert not errs
            await b.close()
asyncio.run(main())
