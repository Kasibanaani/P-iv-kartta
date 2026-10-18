# Jonon 17d (F42 vaihe 2, suunnitelma 26): palikan oma syvyys. Puhelinnäkymä, Pohjassa kaksi samankokoista Muotoa samassa
# kohdassa ruudun keskellä: Kivi (pinnassa) ja Lähestyvä (oma syvyys 900, järjestys z 5). Käytössä Lähestyvä on pieni (10 %) ja Kiven takana,
# vaikka z on isompi (syvempi taakse); nappi käynnistää Muutos ajassa 900 → 0 kohtaan o_sy, ja lopuksi Lähestyvä on täysikokoinen
# ja z:n mukaan Kiven edessä. Muokatessa paneelin Oma syvyys -kenttä ja vauhdin valinta poistavat toisensa, Kumoa palauttaa.
# Tietokone 1440 ja 1280 hiirellä, 390 kosketuksella savutestinä. Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0];v.laite='puhelin';var vw=v.id;
 function U(k,o,x,y,w,h,nm){o.v=vw;var b=KK.addBlock(P,k,o);b.x=x;b.y=y;b.w=w;b.h=h;KK.setName(P,b.id,nm);return b;}
 var c=U('muoto',{laji:'laatikko',hue:3},145,372,100,100,'Kivi');
 var a=U('muoto',{laji:'laatikko',hue:1,z:5,sy:900},145,372,100,100,'Lähestyvä');a.ohk=['sy'];
 var go=U('nappi',{tx:'Tule',beh:'kerta'},20,40,140,44,'Tule');
 var y=0;function N(b){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,0,(y+=80));}
 var mu=KK.addBlock(P,'muutos',{a:900,b:0,kesto:0.4});KK.addLink(P,N(go).id,'e',N(mu).id,'e');KK.addLink(P,N(mu).id,'v',N(a).id,'o_sy');
 KK.repair(P);APP.renderAll();return {a:a.id,c:c.id,go:go.id};})()"""
RECT="(i)=>{var e=document.querySelector('.ue[data-id=\"'+i+'\"]'),r=e.getBoundingClientRect();return [r.left,r.top,r.width,r.height];}"
PAALLA="(i)=>{var e=document.querySelector('.ue[data-id=\"'+i+'\"]'),r=e.getBoundingClientRect(),h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2),u=h&&h.closest('.ue');return u?u.getAttribute('data-id'):null;}"
async def main():
    async with async_playwright() as p:
        for W in (1440,1280,390):
            mob=W<500
            b=await p.chromium.launch();errs=[]
            ctx=await b.new_context(viewport={'width':W,'height':844 if mob else 900},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_function("window.APP&&APP.P!==undefined")
            await pg.fill('#wname','Palikan syvyys');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            # Muokatessa oma syvyys näkyy alkuhetken kuvana ja syvempi on takana
            ra=await pg.evaluate(RECT,I['a']);rc=await pg.evaluate(RECT,I['c'])
            print(W,'muokatessa',round(ra[2]/rc[2],3),await pg.evaluate(PAALLA,I['c']))
            assert abs(ra[2]/rc[2]-0.1)<0.01,'muokatessa oma syvyys'
            await pg.click('#lockbtn');await pg.wait_for_timeout(400)
            ra=await pg.evaluate(RECT,I['a']);rc=await pg.evaluate(RECT,I['c']);top=await pg.evaluate(PAALLA,I['a'])
            print(W,'käytössä',round(ra[2]/rc[2],3),'päällä',top==I['a'])
            assert abs(ra[2]/rc[2]-0.1)<0.01,'käytössä koko omasta syvyydestä'
            assert top==I['c'],'syvempi on takana, vaikka z on isompi'
            gb=await pg.evaluate(RECT,I['go'])
            if mob:await pg.touchscreen.tap(gb[0]+gb[2]/2,gb[1]+gb[3]/2)
            else:await pg.mouse.click(gb[0]+gb[2]/2,gb[1]+gb[3]/2)
            await pg.wait_for_timeout(200);mid=await pg.evaluate(RECT,I['a']);print(W,'kesken',round(mid[2]/rc[2],3))
            await pg.wait_for_timeout(700)
            ra=await pg.evaluate(RECT,I['a']);top=await pg.evaluate(PAALLA,I['c']);sy=await P(pg,"E().omiNum(B('Lähestyvä').id,'sy',-1)")
            print(W,'perillä',round(ra[2]/rc[2],3),'syvyys',sy,'päällä Lähestyvä',top==I['a'])
            assert sy==0 and abs(ra[2]/rc[2]-1)<0.01,'Muutos ajassa toi pintaan'
            assert top==I['a'],'samalla syvyydellä z ratkaisee: Lähestyvä edessä'
            assert await P(pg,"E().prop(B('Lähestyvä').id,'nakyvakoko')")==100
            if mob:
                print(W,'ok (savutesti)','errs',errs);assert not errs;await b.close();continue
            # Muokkaus: paneelin Oma syvyys ja vauhdin valinta
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            rc=await pg.evaluate(RECT,I['c']);await pg.evaluate("(i)=>{APP.S.sel={t:'b',id:i};APP.S.multi=[];APP.renderAll();}",I['c']);await pg.wait_for_timeout(150)
            await pg.fill('#insp input[data-k="sy"]','100');await pg.wait_for_timeout(150)
            assert await P(pg,"B('Kivi').sy")==100;rc2=await pg.evaluate(RECT,I['c']);print(W,'Kivi syvyys 100',round(rc2[2]/rc[2],3))
            assert abs(rc2[2]/rc[2]-0.5)<0.01,'oma syvyys 100 = puolet'
            await pg.evaluate("APP.renderAll()");await pg.wait_for_timeout(100)
            tx=await pg.inner_text('#insp');assert 'Oma syvyys 100' in tx,'paneeli kertoo oman syvyyden'
            await pg.click('#insp button[data-seg="rv"][data-v="50"]');await pg.wait_for_timeout(150)
            k=await P(pg,"[B('Kivi').rv,B('Kivi').sy===undefined]");print(W,'vauhti 50',k);assert k==[50,True],'vauhti poistaa syvyyden'
            await pg.fill('#insp input[data-k="sy"]','-50');await pg.wait_for_timeout(150)
            k=await P(pg,"[B('Kivi').rv===undefined,B('Kivi').sy]");assert k==[True,-50],'syvyys poistaa vauhdin'
            rc3=await pg.evaluate(RECT,I['c']);assert abs(rc3[2]/rc[2]-2)<0.02,'etuala'
            await pg.fill('#insp input[data-k="sy"]','');await pg.wait_for_timeout(150)
            assert await P(pg,"B('Kivi').sy===undefined"),'tyhjä = kerroksen mukaan'
            await pg.screenshot(path='selain_palikan_syvyys_%d.png'%W)
            print(W,'ok','errs',errs);assert not errs;await b.close()
asyncio.run(main())
