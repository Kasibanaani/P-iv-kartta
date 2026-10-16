# Appi-appi 9: efektit selaimessa. Paneeli (1440 ja 1280): efektit paletissa (ei Tulossa-kohtaa), Animaatio-paneelin liike.
# Lukittuna (1440, 390, 320): Teksti ilmestyy kirjain kerrallaan ja jää, Animaatio liikauttaa palikkaa (paikka ei muutu),
# Kuva vaihtuu häivyttäen ja jää, Näkymänvaihto ketjusta liukuen toiseen näkymään ja Palaa takaisin. Kuvat appiappi9_fx_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0];v.laite='puhelin';var vw=v.id;P.views.push({id:'v2',n:'Toinen',laite:'puhelin'});P.vseq=2;
 function U(k,o,x,y,w,h,nm){var b=KK.addBlock(P,k,o);b.x=x;b.y=y;if(w)b.w=w;if(h)b.h=h;if(nm)KK.setName(P,b.id,nm);return b;}
 var ot=U('nayta',{v:vw,tx:'Hei',koko:'l'},20,20,340,50,'Otsikko');
 var la=U('muoto',{v:vw,laji:'laatikko',hue:3,tx:'Laatikko'},20,90,160,80,'Laatikko');
 var ku=U('pkuva',{v:vw,src:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="#c33"/></svg>'},200,90,160,80,'Kuva');
 var B={};[['b1','Teksti',20,200],['b2','Ravista',200,200],['b3','Vaihda kuva',20,270],['b4','Toiseen',200,270]].forEach(function(q){B[q[0]]=U('nappi',{v:vw,tx:q[1],beh:'kerta'},q[2],q[3],160,50,q[1]).id;});
 var t2=U('nayta',{v:'v2',tx:'Toinen näkymä',koko:'l'},20,20,340,50,'T2');var ta=U('nappi',{v:'v2',tx:'Takaisin',beh:'kerta'},20,100,160,50,'Takaisin');
 function L(f,fp,t,tp){KK.addLink(P,f.id,fp,t.id,tp);}
 function N(id,x,y,g){return KK.addNode(P,id,x,y,g);}
 var f1=KK.addBlock(P,'ilmesty',{o:ot.id,tx:'Tervetuloa peliin, pelaaja',tapa:'kirjain',kesto:1});L(N(B.b1,0,0),'e',N(f1.id,200,0),'e');
 var f2=KK.addBlock(P,'anim',{o:la.id,laji:'ravistus',kesto:0.8});L(N(B.b2,0,80),'e',N(f2.id,200,80),'e');
 var f3=KK.addBlock(P,'kuva',{o:ku.id,src:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="#36c"/></svg>',siirtyma:'haivy',kesto:0.6});L(N(B.b3,0,160),'e',N(f3.id,200,160),'e');
 var k=KK.addBlock(P,'ketju',{});var kw=N(k.id,400,0);var f4=KK.addBlock(P,'nvaihto',{vw:'v2',siirtyma:'liuku',kesto:0.5}),f4n=N(f4.id,420,40,kw.id);
 var lo=KK.addBlock(P,'muisti',{v:'0'});N(lo.id,700,0);var li=KK.addBlock(P,'tee',{do:'lisaa',o:lo.id}),lin=N(li.id,420,120,kw.id);L(f4n,'e',lin,'e');L(N(B.b4,0,240),'e',kw,'e');
 var tk=KK.addBlock(P,'tee',{do:'takaisin'});L(N(ta.id,0,320),'e',N(tk.id,200,320),'e');
 KK.repair(P);APP.renderAll();return {ot:ot.id,la:la.id,ku:ku.id,B:B,f2:f2.id,lo:lo.id,vw:vw};})()"""
async def main():
    async with async_playwright() as p:
        for W in (1440,1280,390,320):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Efektit');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP)
            if W>500:
                await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(200)
                assert await pg.locator('#pal .chip.soon').count()==0
                for t in ('Teksti ilmestyy','Kuva vaihtuu','Animaatio','Näkymänvaihto','Kerros'):assert await pg.locator('#pal .chip',has_text=t).count()>=1,t
                await pg.evaluate("(function(){var n=KK.nodesOfBlock(APP.P,'%s')[0];APP.S.sel={t:'n',id:n.id};APP.renderAll();})()"%I['f2']);await pg.wait_for_timeout(150)
                await pg.click('#insp [data-seg="laji"][data-v="pomppu"]');await pg.wait_for_timeout(100);assert await P(pg,"P.b['%s'].laji"%I['f2'])=='pomppu'
                await pg.click('#insp [data-seg="laji"][data-v="ravistus"]');await pg.wait_for_timeout(100)
                lab=await pg.inner_text('#lworld .ln[data-nid="%s"]'%(await P(pg,"KK.nodesOfBlock(P,'%s')[0].id"%I['f2'])));assert 'Laatikko' in lab,lab
                await pg.screenshot(path='appiappi9_fx_paneeli_%d.png'%W)
                await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(200)
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            async def nap(k,ms=150):await pg.click('.ue[data-id="%s"] button'%I['B'][k]);await pg.wait_for_timeout(ms)
            # 1. Teksti ilmestyy kirjain kerrallaan ja jää
            await nap('b1',350);vis=await pg.evaluate("(function(){var e=document.querySelector('.ue[data-id=\"%s\"] .w-txt');var h=e.querySelector('.fxh');return [e.textContent.length,h?h.textContent.length:-1];})()"%I['ot'])
            print(W,'ilmestyy:',vis);assert vis[0]==len('Tervetuloa peliin, pelaaja') and 0<vis[1]<vis[0],vis
            await pg.screenshot(path='appiappi9_fx_ilmestyy_%d.png'%W)
            await pg.wait_for_timeout(900);t=await pg.inner_text('.ue[data-id="%s"] .w-txt'%I['ot']);assert t=='Tervetuloa peliin, pelaaja' and await pg.locator('.ue[data-id="%s"] .fxh'%I['ot']).count()==0,t
            # 2. Animaatio: palikalla on käynnissä oleva animaatio, paikka ei muutu
            x0=await pg.evaluate("document.querySelector('.ue[data-id=\"%s\"]').style.left"%I['la'])
            await nap('b2',100);an=await pg.evaluate("document.querySelector('.ue[data-id=\"%s\"]').getAnimations().length"%I['la']);assert an>=1,an
            await pg.wait_for_timeout(900);assert await pg.evaluate("document.querySelector('.ue[data-id=\"%s\"]').getAnimations().length"%I['la'])==0
            assert await pg.evaluate("document.querySelector('.ue[data-id=\"%s\"]').style.left"%I['la'])==x0
            # 3. Kuva vaihtuu häivyttäen ja jää
            await nap('b3',120);src=await pg.get_attribute('.ue[data-id="%s"] .in:not(.fxold) img'%I['ku'],'src');old=await pg.locator('.ue[data-id="%s"] .fxold'%I['ku']).count()
            print(W,'kuva:',src[:60],'vanha päällä',old);assert 'circle' in src and old==1
            await pg.wait_for_timeout(800);assert await pg.locator('.ue[data-id="%s"] .fxold'%I['ku']).count()==0
            # 4. Näkymänvaihto ketjusta: liukuu, ketju odottaa efektin, Palaa takaisin
            await nap('b4',150);vw=await P(pg,"APP.S.vw");nv=await pg.locator('.fxnv').count();lo=await P(pg,"E().val('%s')"%I['lo'])
            print(W,'näkymänvaihto:',vw,nv,lo);assert vw=='v2' and nv==1 and lo==0
            await pg.screenshot(path='appiappi9_fx_vaihto_%d.png'%W)
            await pg.wait_for_timeout(1700);assert await pg.locator('.fxnv').count()==0;lo=await P(pg,"E().val('%s')"%I['lo']);assert lo==1,lo
            assert 'Toinen näkymä' in await pg.inner_text('#uels')
            await pg.click('.ue:has-text("Takaisin") button');await pg.wait_for_timeout(600);assert await P(pg,"APP.S.vw")==I['vw']
            assert await pg.inner_text('.ue[data-id="%s"] .w-txt'%I['ot'])=='Tervetuloa peliin, pelaaja','teksti jäi'
            print(W,'errs',errs);assert not errs;await b.close()
asyncio.run(main())
