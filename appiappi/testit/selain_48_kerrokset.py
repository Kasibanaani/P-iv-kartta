# Appi-appi 9: kerrokset käytössä. Paneeli (1440 ja 1280): ⚙ kerrosriviltä, näkyy käytössä / estää / himmennys,
# Ohjaa logiikasta tekee Kerros-palikan, sen paneelin kerrosvalinta. Lukittuna (1440, 390, 320): piilotettu valikko ei näy,
# painike avaa sen (Vaihda → näkyy), valikko estää alemman painikkeen ja himmentää, Sulje sulkee, läpinäkyvyys.
# Muokatessa piilotetun kerroksen palikat näkyvät. Kuvat appiappi9_kerros_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0];v.laite='puhelin';var vw=v.id;v.kr=[{id:'pohja',n:'Pohja'},{id:'k1',n:'Valikko',pk:true,es:true,him:40}];
 function U(k,o,x,y,w,h,nm){var b=KK.addBlock(P,k,o);b.x=x;b.y=y;if(w)b.w=w;if(h)b.h=h;if(nm)KK.setName(P,b.id,nm);return b;}
 var av=U('nappi',{v:vw,tx:'Avaa valikko',beh:'kerta'},40,60,200,50,'Avaa');
 var la=U('nappi',{v:vw,tx:'Laskuri',beh:'kerta'},40,600,200,50,'Laskuri');
 var pa=U('muoto',{v:vw,kr:'k1',laji:'laatikko',hue:6},60,200,270,300,'Paneeli');
 var su=U('nappi',{v:vw,kr:'k1',tx:'Sulje',beh:'kerta'},95,420,200,50,'Sulje');
 KK.repair(P);APP.renderAll();return {av:av.id,la:la.id,pa:pa.id,su:su.id,vw:vw};})()"""
async def main():
    async with async_playwright() as p:
        for W in (1440,1280,390,320):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Kerrokset');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP)
            # Muokatessa piilotetun kerroksen palikka näkyy (ei hid-luokkaa)
            assert await pg.locator('.ue[data-id="%s"].hid'%I['su']).count()==0,'muokatessa näkyy'
            if W>500:
                await pg.evaluate("(function(){APP.S.sel=null;APP.S.multi=[];APP.renderAll();})()");await pg.wait_for_timeout(120)
                await pg.click('#insp [data-krk0="k1"]');await pg.wait_for_timeout(120)
                nk=pg.locator('#insp input[data-krk="nak"][data-kid="k1"]');assert await nk.count()==1 and not await nk.is_checked()
                assert await pg.locator('#insp input[data-krk="es"][data-kid="k1"]').is_checked()
                assert await pg.locator('#insp input[data-krk="him"][data-kid="k1"]').input_value()=='40'
                await nk.check();await pg.wait_for_timeout(120);assert await P(pg,"P.views[0].kr[1].pk===undefined")
                await pg.locator('#insp input[data-krk="nak"][data-kid="k1"]').uncheck();await pg.wait_for_timeout(120);assert await P(pg,"P.views[0].kr[1].pk===true")
                await pg.locator('#insp input[data-krk="es"][data-kid="k1"]').scroll_into_view_if_needed()
                await pg.screenshot(path='appiappi9_kerros_paneeli_%d.png'%W)
                await pg.click('#insp [data-krlog="k1"]');await pg.wait_for_timeout(200)
                kb=await P(pg,"Object.values(P.b).filter(b=>b.k==='kerros').map(b=>[b.vw,b.kr,b.nm,b.vt])");print(W,'kerros-palikka:',kb)
                assert kb==[[I['vw'],'k1','Valikko','valikko']],kb
                await pg.evaluate("(function(){var P=APP.P;var kb=Object.values(P.b).filter(b=>b.k==='kerros')[0];APP.S.sel={t:'n',id:KK.nodesOfBlock(P,kb.id)[0].id};APP.renderAll();})()");await pg.wait_for_timeout(150)
                sel=await pg.locator('#insp select[data-krsel]').input_value();assert sel==I['vw']+'|k1',sel
                assert await pg.locator('#insp input[data-krk="nak"]').count()==1,'perusarvot kerros-palikan paneelissa'
            else:
                await pg.evaluate("(function(){var P=APP.P;var b=KK.addBlock(P,'kerros',{vw:'%s',kr:'k1',nm:'Valikko'});KK.addNode(P,b.id,40,40);KK.repair(P);})()"%I['vw'])
            # Avaa ja Sulje vaihtavat valikon näkyvyyttä; Laskuri laskee painalluksia
            await pg.evaluate("""(function(){var P=APP.P,I=%s;var kb=Object.values(P.b).filter(b=>b.k==='kerros')[0];
              [I.av,I.su].forEach(function(id,i){var t=KK.addBlock(P,'tee',{do:'vaihda',o:kb.id,om:'nakyy'});KK.addLink(P,KK.addNode(P,id,300,80*i).id,'e',KK.addNode(P,t.id,500,80*i).id,'e');});
              KK.repair(P);APP.renderAll();})()"""%json.dumps(I))
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            async def lask():return await P(pg,"KK.num(P.st['%s']||0)"%I['la'])
            assert await pg.locator('.ue[data-id="%s"].hid'%I['su']).count()==1,'valikko piilossa'
            assert await pg.locator('#krsuoja').count()==0
            await pg.click('.ue[data-id="%s"] button'%I['la']);await pg.wait_for_timeout(150);assert await lask()==1
            await pg.click('.ue[data-id="%s"] button'%I['av']);await pg.wait_for_timeout(200)
            assert await pg.locator('.ue[data-id="%s"].hid'%I['su']).count()==0,'valikko auki'
            sh=await pg.evaluate("(function(){var s=document.getElementById('krsuoja');return s?[s.style.pointerEvents,s.style.background,s.nextElementSibling&&s.nextElementSibling.getAttribute('data-id')]:null;})()")
            print(W,'suoja:',sh);assert sh and sh[0]=='auto' and 'rgba(0, 0, 0, 0.34' in sh[1] and sh[2]==I['pa'],sh
            await pg.screenshot(path='appiappi9_kerros_auki_%d.png'%W)
            # Alempi Laskuri on suojan alla: napautus ei mene läpi (myöskään Avaa)
            c=await keskus(pg,'.ue[data-id="%s"]'%I['av']);await pg.mouse.click(c[0],c[1]);await pg.wait_for_timeout(150)
            assert await pg.locator('.ue[data-id="%s"].hid'%I['su']).count()==0,'Avaa ei toimi suojan läpi'
            el=await pg.evaluate("(function(){var r=document.querySelector('.ue[data-id=\"%s\"]').getBoundingClientRect();var e=document.elementFromPoint(r.left+10,r.top+10);return e&&(e.id||e.className);})()"%I['la'])
            assert el=='krsuoja',el
            await pg.click('.ue[data-id="%s"] button'%I['su']);await pg.wait_for_timeout(200)
            assert await pg.locator('.ue[data-id="%s"].hid'%I['su']).count()==1 and await pg.locator('#krsuoja').count()==0,'suljettu'
            await pg.click('.ue[data-id="%s"] button'%I['la']);await pg.wait_for_timeout(150);assert await lask()==2,'Laskuri toimii taas'
            # Ei estä, vain himmentää: suoja ei ota kosketuksia
            await pg.evaluate("(function(){var v=APP.P.views[0];delete v.kr[1].es;v.kr[1].lp=50;APP.renderAll();})()")
            await pg.click('.ue[data-id="%s"] button'%I['av']);await pg.wait_for_timeout(200)
            pe=await pg.evaluate("document.getElementById('krsuoja').style.pointerEvents");assert pe=='none',pe
            op=await pg.evaluate("getComputedStyle(document.querySelector('.ue[data-id=\"%s\"]')).opacity"%I['su']);assert abs(float(op)-0.5)<0.01,op
            await pg.click('.ue[data-id="%s"] button'%I['la']);await pg.wait_for_timeout(150);assert await lask()==3,'ei estä'
            print(W,'errs',errs);assert not errs;await b.close()
asyncio.run(main())
