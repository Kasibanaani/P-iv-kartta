# Pajakone 2: puhelinappin perusta selaimessa. Rullausvauhti (lukittu ruutuun ja hitaampi tausta) lukitussa
# puhelinnäkymässä, Siirry ja Palaa takaisin (myös kahdesti, historia nollautuu välilehdestä), painike: pohjassa vain
# painettaessa, pitkä painallus, irrotus ja kesto, lyhyt napautus pitkän painalluksen kanssa; Ruudun keskelle (yksi ja
# monivalinta), Monista alle ja viereen, Puhelin vaaka. Kuvat pajakone2_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0].id;P.views[0].laite='puhelin';P.views.push({id:'v2',n:'Toinen',laite:'puhelin'});P.vseq=2;
 function U(k,o,x,y,w,h,nm){var b=KK.addBlock(P,k,o);b.x=x;b.y=y;if(w)b.w=w;if(h)b.h=h;if(nm)KK.setName(P,b.id,nm);return b;}
 function L(b,x,y){return KK.addNode(P,b.id,x,y);}
 var bg=U('muoto',{v:v,laji:'laatikko'},0,0,390,2400,'Tausta');bg.rv=50;bg.z=-5;
 var bar=U('nappi',{v:v,tx:'Valikko',beh:'kerta'},0,790,390,54,'Palkki');bar.rv=0;bar.z=10;
 var low=U('nayta',{v:v,tx:'Alhaalla'},20,1400,300,40,'Alhaalla');
 var go=U('nappi',{v:v,tx:'Seuraava',beh:'kerta'},20,40,160,44,'Seuraava');
 var back=U('nappi',{v:'v2',tx:'Takaisin',beh:'kerta'},20,40,160,44,'Takaisin');
 var gas=U('nappi',{v:v,tx:'Kaasu',beh:'pida'},20,120,160,60,'Kaasu');
 var lp=U('nappi',{v:v,tx:'Pitkä',beh:'kerta',ext:true},200,120,160,60,'Pitkä');
 var tap=U('nappi',{v:v,tx:'Napautus',beh:'kerta',ext:true},200,200,160,60,'Napautus');
 var mem=U('muisti',{v:'0'},0,0,0,0,'Laskuri');var mem2=U('muisti',{v:'0'},0,0,0,0,'Napit');
 L(mem,700,200);L(mem2,700,300);
 var gn=L(go,0,0),bn=L(back,0,100),lpn=L(lp,0,200),tpn=L(tap,0,300),gsn=L(gas,0,400);
 var s1=KK.addBlock(P,'tee',{do:'siirry',vw:'v2',x:0,y:0,tapa:'heti'});var s1n=L(s1,300,0);KK.addLink(P,gn.id,'e',s1n.id,'e');
 var s2=KK.addBlock(P,'tee',{do:'takaisin',tapa:'heti'});var s2n=L(s2,300,100);KK.addLink(P,bn.id,'e',s2n.id,'e');
 var a1=KK.addBlock(P,'tee',{do:'lisaa',o:mem.id});var a1n=L(a1,300,200);KK.addLink(P,lpn.id,'pitka',a1n.id,'e');
 var a2=KK.addBlock(P,'tee',{do:'lisaa',o:mem2.id});var a2n=L(a2,300,260);KK.addLink(P,lpn.id,'e',a2n.id,'e');
 var a3=KK.addBlock(P,'tee',{do:'lisaa',o:mem2.id,v:'10'});var a3n=L(a3,300,300);KK.addLink(P,tpn.id,'e',a3n.id,'e');
 KK.repair(P);APP.renderAll();return {bg:bg.id,bar:bar.id,go:go.id,back:back.id,gas:gas.id,lp:lp.id,tap:tap.id,mem:mem.id,mem2:mem2.id};})()"""
async def box(pg,id):
    return await pg.evaluate("(function(){var r=document.querySelector('.ue[data-id=\"%s\"]').getBoundingClientRect();return [r.left,r.top,r.width,r.height];})()"%id)
async def cam(pg):
    return await pg.evaluate("(function(){var c=APP.P.cam[APP.S.vw];return [c.x,c.y,c.z];})()")
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Puhelinappi');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP)
            # --- 1. Muokatessa: rullausvauhti paneelissa, lukittu näkyy katkoviivana ---
            await pg.click('.ue[data-id="%s"]'%I['bar']);await pg.wait_for_timeout(120)
            segs=await pg.eval_on_selector_all('#insp [data-seg="rv"]','e=>e.map(x=>x.textContent+(x.classList.contains("on")?"*":""))')
            print(W,'1 rullausvauhti:',segs);assert segs==['Sormen mukana','50 %','25 %','Lukittu ruutuun*']
            assert await pg.evaluate("document.querySelector('.ue[data-id=\"%s\"]').classList.contains('rvlock')"%I['bar'])
            # --- 2. Lukittu: palkki pysyy, tausta liikkuu puolet, sisältö sormen mukana ---
            await pg.click('#lockbtn');await pg.wait_for_timeout(250)
            b0=await box(pg,I['bar']);g0=await box(pg,I['bg']);s0=await box(pg,I['go']);v=await pg.evaluate("(function(){var r=document.querySelector('#uvp').getBoundingClientRect();return [r.left,r.top,r.width,r.height];})()")
            await pg.mouse.move(v[0]+v[2]/2,v[1]+v[3]/2)
            for i in range(3):
                await pg.mouse.wheel(0,200);await pg.wait_for_timeout(60)
            c=await cam(pg);b1=await box(pg,I['bar']);g1=await box(pg,I['bg']);s1=await box(pg,I['go'])
            dy=-c[1];print(W,'2 rullattu',round(dy,1),'palkki',round(b1[1]-b0[1],2),'tausta',round(g1[1]-g0[1],1),'sisältö',round(s1[1]-s0[1],1))
            assert dy>100 and abs(b1[1]-b0[1])<0.6 and abs((g0[1]-g1[1])-dy/2)<1.5 and abs((s0[1]-s1[1])-dy)<1.5
            await pg.screenshot(path='pajakone2_rullaus_%d.png'%W)
            # --- 3. Siirry ja Palaa takaisin ---
            await pg.mouse.wheel(0,-2000);await pg.wait_for_timeout(100)
            await pg.click('.ue[data-id="%s"] button'%I['go']);await pg.wait_for_timeout(200)
            assert await pg.evaluate("APP.S.vw")=='v2'
            await pg.click('.ue[data-id="%s"] button'%I['back']);await pg.wait_for_timeout(200)
            assert await pg.evaluate("APP.S.vw")=='v1','takaisin ensimmäiseen'
            await pg.click('.ue[data-id="%s"] button'%I['go']);await pg.wait_for_timeout(150)
            await pg.click('#vtabs [data-vw="v1"]');await pg.wait_for_timeout(150);await pg.click('#vtabs [data-vw="v2"]');await pg.wait_for_timeout(150)
            await pg.click('.ue[data-id="%s"] button'%I['back']);await pg.wait_for_timeout(150)
            assert await pg.evaluate("APP.S.vw")=='v2','välilehti nollasi historian'
            await pg.click('#vtabs [data-vw="v1"]');await pg.wait_for_timeout(150)
            # --- 4. Pohjassa vain painettaessa ---
            gb=await box(pg,I['gas']);await pg.mouse.move(gb[0]+gb[2]/2,gb[1]+gb[3]/2);await pg.mouse.down();await pg.wait_for_timeout(120)
            on=await P(pg,"E().val('%s')"%I['gas']);cls=await pg.evaluate("document.querySelector('.ue[data-id=\"%s\"] button').className"%I['gas'])
            await pg.wait_for_timeout(300);await pg.mouse.up();await pg.wait_for_timeout(120)
            off=await P(pg,"E().val('%s')"%I['gas']);k=await P(pg,"E().val('%s','k')"%I['gas'])
            print(W,'4 kaasu:',on,cls,off,k);assert on is True and 'on' in cls.split() and off is False and 0.3<k<1.5
            # --- 5. Pitkä painallus korvaa tavallisen, lyhyt on tavallinen ---
            lb=await box(pg,I['lp']);await pg.mouse.move(lb[0]+lb[2]/2,lb[1]+lb[3]/2);await pg.mouse.down();await pg.wait_for_timeout(700);await pg.mouse.up();await pg.wait_for_timeout(150)
            r=await P(pg,"[E().val('%s'),E().val('%s')]"%(I['mem'],I['mem2']));print(W,'5 pitkä:',r);assert r==[1,0],r
            await pg.mouse.down();await pg.wait_for_timeout(60);await pg.mouse.up();await pg.wait_for_timeout(150)
            r=await P(pg,"[E().val('%s'),E().val('%s')]"%(I['mem'],I['mem2']));assert r==[1,1],r
            # Napautus-painikkeessa ei pitkää kytkentää: pitkäkin pito antaa tavallisen painalluksen
            tb=await box(pg,I['tap']);await pg.mouse.move(tb[0]+tb[2]/2,tb[1]+tb[3]/2);await pg.mouse.down();await pg.wait_for_timeout(700);await pg.mouse.up();await pg.wait_for_timeout(150)
            assert await P(pg,"E().val('%s')"%I['mem2'])==11
            assert await P(pg,"E().val('%s','k')"%I['tap'])>0.6
            # --- 6. Muokkaus: Ruudun keskelle, Monista ---
            await pg.click('#lockbtn');await pg.wait_for_timeout(200)
            await pg.click('.ue[data-id="%s"]'%I['go']);await pg.wait_for_timeout(120)
            await pg.click('#insp [data-scr="h"]');await pg.wait_for_timeout(120)
            x=await P(pg,"P.b['%s'].x"%I['go']);assert x==(390-160)//2,x
            await pg.fill('#dupn','3');await pg.fill('#dupg','12');await pg.click('#insp [data-dupd="y"]');await pg.wait_for_timeout(150)
            ys=await P(pg,"Object.values(P.b).filter(b=>b.k==='nappi'&&b.tx==='Seuraava').map(b=>[b.x,b.y]).sort((a,b)=>a[1]-b[1])")
            print(W,'6 monista:',ys);assert ys==[[115,40],[115,96],[115,152],[115,208]]
            nms=await P(pg,"Object.values(P.b).filter(b=>b.tx==='Seuraava').map(b=>b.nm)");assert len(set(nms))==4
            await pg.click('#undobtn');await pg.wait_for_timeout(120)
            assert await P(pg,"Object.values(P.b).filter(b=>b.tx==='Seuraava').length")==1
            # Monivalinta pystysuunnassa keskelle ryhmänä
            await pg.click('.ue[data-id="%s"]'%I['gas']);await pg.click('.ue[data-id="%s"]'%I['lp'],modifiers=['Shift']);await pg.wait_for_timeout(150)
            await pg.click('#insp [data-scr="v"]');await pg.wait_for_timeout(120)
            r=await P(pg,"[P.b['%s'].y,P.b['%s'].y]"%(I['gas'],I['lp']));print(W,'6 ryhmä:',r);assert r==[392,392]
            # Puhelin vaaka
            await pg.evaluate("(function(){APP.S.sel=null;APP.S.multi=[];APP.renderAll();})()");await pg.wait_for_timeout(100)
            await pg.click('#insp [data-vseg="laite"][data-v="puhelinv"]');await pg.wait_for_timeout(150)
            await pg.click('#lockbtn');await pg.wait_for_timeout(250)
            vb=await pg.evaluate("(function(){var r=document.querySelector('#uvp').getBoundingClientRect();return [r.width,r.height];})()")
            assert abs(vb[0]/vb[1]-844/390)<0.02,vb
            await pg.screenshot(path='pajakone2_puhelin_vaaka_%d.png'%W)
            print(W,'errs',errs);assert not errs;await b.close()
asyncio.run(main())
