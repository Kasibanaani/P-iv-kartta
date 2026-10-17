# F29 vaihe 1: animointi selaimessa (1440 ja 1280 hiirellä, 390 ja 320 kosketuksella), Vähennä liikettä pois päältä.
# Käytössä: näkyviin tuleva palikka häivyttää ja ottaa napautuksen heti; piilotus vaihtaa näkyy = ei heti, palikka jää
# häipymään eikä ota napautusta; keskeytys kääntää saman animaation nykyisestä kohdasta (ei hyppyä); liukuessa oikea
# sijainti ei muutu; kesto 0 nuolesta = töks; projektin oletus (Asetukset) koskee palikkaa ilman omaa. Muokatessa
# paneelin osio Animointi tallentaa kentät. Lopuksi Vähennä liikettä päällä: ei animaatioita. Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,vw=P.views[0].id;
 function U(k,o,x,y,w,h,nm){var b=KK.addBlock(P,k,o);b.x=x;b.y=y;b.w=w;b.h=h;KK.setName(P,b.id,nm);return b;}
 var r=U('ruutu',{v:vw,tx:'Näytä'},10,10,180,44,'Näytä');
 var n=U('nappi',{v:vw,tx:'Lisää',beh:'kerta',ani:'haivytys',ank:0.8},10,70,140,44,'Lisää');n.nk={m:'kun',r:r.id};
 var l=U('nayta',{v:vw,tx:'Liukuu',ani:'vasemmalta',ank:0.8,anp:'tasainen'},160,70,140,44,'Liukuu');l.nk={m:'kun',r:r.id};
 var o=U('nayta',{v:vw,tx:'Oletus'},10,130,140,44,'Oletus');o.nk={m:'kun',r:r.id};
 var m=KK.addBlock(P,'muisti',{v:'0'});KK.setName(P,m.id,'Laskuri');KK.addNode(P,m.id,600,0);
 var t=KK.addBlock(P,'tee',{do:'lisaa',o:m.id});KK.addLink(P,KK.addNode(P,n.id,0,0).id,'e',KK.addNode(P,t.id,300,0).id,'e');
 KK.repair(P);APP.saveNow();APP.renderAll();return {r:r.id,n:n.id,l:l.id,o:o.id,m:m.id};})()"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in (1440,1280,390,320):
            mob=W<500;H=844 if mob else 900
            ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='no-preference')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            async def tap(sel):
                if mob:await pg.tap(sel)
                else:await pg.click(sel)
            async def tapxy(x,y):
                if mob:await pg.touchscreen.tap(x,y)
                else:await pg.mouse.click(x,y)
            async def J(js):return await pg.evaluate(js)
            def ue(i):return '.ue[data-id="%s"]'%i
            async def anims(i):return await J("document.querySelector('%s').getAnimations().length"%ue(i))
            async def shown(i):return await J("String(APP.ev().prop('%s','näkyy'))"%i)
            async def cnt():return await J("String(APP.ev().val('%s'))"%I['m'])
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Animointi');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await J(SETUP);await pg.wait_for_timeout(200)
            if not mob:
                # Paneeli: osio Animointi, kentät tallentuvat
                await pg.click(ue(I['o']));await pg.wait_for_timeout(150)
                assert await pg.locator('#ansec').count()==1
                assert await J("document.getElementById('ansec').open")==False,'kiinni, kun mitään ei ole valittu'
                await pg.click('#ansec summary');await pg.select_option('#ansec select[data-k="ani"]','kasvu');await pg.wait_for_timeout(100)
                await pg.fill('#ansec input[data-k="ank"]','0,4');await pg.wait_for_timeout(100)
                await pg.click('#ansec [data-seg="anp"][data-v="joustava"]');await pg.wait_for_timeout(100)
                ob=await J("JSON.stringify([APP.P.b['%s'].ani,APP.P.b['%s'].ank,APP.P.b['%s'].anp])"%(I['o'],I['o'],I['o']))
                print(W,'paneeli',ob);assert ob=='["kasvu",0.4,"joustava"]',ob
                assert await J("document.getElementById('ansec').open")==True
                await pg.select_option('#ansec select[data-k="ani"]','');await pg.fill('#ansec input[data-k="ank"]','');await pg.click('#ansec [data-seg="anp"][data-v=""]')
                await pg.wait_for_timeout(100);assert await J("JSON.stringify(['ani','ank','anp'].filter(function(k){return k in APP.P.b['%s'];}))"%I['o'])=='[]','oletukseen = kenttä pois'
                await pg.keyboard.press('Escape')
                # Projektin oletus Asetuksista
                await pg.click('#setbtn');await pg.wait_for_timeout(150)
                await pg.select_option('#anset select[data-pan="i"]','alhaalta');await pg.fill('#anset input[data-pan="k"]','0,6');await pg.press('#anset input[data-pan="k"]','Tab');await pg.wait_for_timeout(100)
                pa=await J("JSON.stringify(APP.P.an)");print(W,'oletus',pa);assert pa=='{"i":"alhaalta","k":0.6}',pa
                await pg.click('#sheet [data-x="close"]');await pg.wait_for_timeout(150)
            else:
                await J("APP.P.an={i:'alhaalta',k:0.6};APP.saveNow()")
            await tap('#lockbtn');await pg.wait_for_timeout(200)
            assert await J("getComputedStyle(document.querySelector('%s')).display"%ue(I['n']))=='none'
            # 1 näkyviin: näkyy heti, animaatio käy, napautus osuu heti
            await tap(ue(I['r'])+' .w-chk');await pg.wait_for_timeout(60)
            assert await shown(I['n'])=='true';a=await anims(I['n']);print(W,'1 anim',a);assert a==1,a
            assert await anims(I['o'])==1,'projektin oletus animoi'
            await tap(ue(I['n'])+' button');await pg.wait_for_timeout(80);c=await cnt();print(W,'1 laskuri',c);assert c=='1',c
            # liukuessa oikea sijainti ei muutu
            pos=await J("(function(){var e=document.querySelector('%s');return [e.style.left,e.style.top,APP.ev().prop('%s','x')];})()"%(ue(I['l']),I['l']))
            print(W,'1 liuku',pos);assert pos==['160px','70px',160],pos
            await pg.wait_for_timeout(900);assert await anims(I['n'])==0 and await anims(I['l'])==0
            # 2 piiloon: näkyy = ei heti, häipyy näkyvissä ilman kosketuksia
            bb=await pg.locator(ue(I['n'])).bounding_box();cx,cy=bb['x']+bb['width']/2,bb['y']+bb['height']/2
            await tap(ue(I['r'])+' .w-chk');await pg.wait_for_timeout(60)
            assert await shown(I['n'])=='false'
            d=await J("(function(){var e=document.querySelector('%s');return [getComputedStyle(e).display,e.classList.contains('anout'),e.getAnimations().length];})()"%ue(I['n']))
            print(W,'2 häipyy',d);assert d==['flex',True,1],d
            await tapxy(cx,cy);await pg.wait_for_timeout(80);c=await cnt();assert c=='1','häipyvä ei ota napautusta: '+c
            await pg.wait_for_timeout(900)
            d=await J("(function(){var e=document.querySelector('%s');return [getComputedStyle(e).display,e.classList.contains('anout'),e.getAnimations().length];})()"%ue(I['n']))
            print(W,'2 lopussa',d);assert d==['none',False,0],d
            # 3 keskeytys kääntyy: sama animaatio, ei hyppyä
            await tap(ue(I['r'])+' .w-chk');await pg.wait_for_timeout(300)
            o1=await J("+getComputedStyle(document.querySelector('%s')).opacity"%ue(I['n']))
            await J("window._a0=document.querySelector('%s').getAnimations()[0]"%ue(I['n']))
            await tap(ue(I['r'])+' .w-chk');await pg.wait_for_timeout(16)
            k=await J("(function(){var e=document.querySelector('%s'),a=e.getAnimations();return [a.length,a[0]===window._a0,a[0].playbackRate,+getComputedStyle(e).opacity,e.classList.contains('anout')];})()"%ue(I['n']))
            print(W,'3 kääntyy',o1,k);assert k[0]==1 and k[1] and k[2]==-1 and k[4],k;assert 0.05<o1<0.95 and abs(k[3]-o1)<0.25,(o1,k)
            await pg.wait_for_timeout(900);assert await J("getComputedStyle(document.querySelector('%s')).display"%ue(I['n']))=='none'
            # 4 kesto 0 Aseta-toiminnolla = töks
            await J("KK.setOmi(APP.P,'%s','animointi.kesto',0);APP.renderAll()"%I['n'])
            await tap(ue(I['r'])+' .w-chk');await pg.wait_for_timeout(60);assert await anims(I['n'])==0,'kesto 0 = töks'
            await tap(ue(I['r'])+' .w-chk');await pg.wait_for_timeout(900)
            await pg.screenshot(path='appiappiF29_animointi_%d.png'%W)
            print(W,'errs',errs);assert not errs,errs
            await ctx.close()
        # 5 Vähennä liikettä: ei animaatioita, näkyvyys silti heti
        ctx=await b.new_context(viewport={'width':390,'height':844},has_touch=True,is_mobile=True,reduced_motion='reduce')
        pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(U);await pg.wait_for_timeout(250);await pg.fill('#wname','RM');await pg.click('#wcreate');await pg.wait_for_timeout(150)
        I=await pg.evaluate(SETUP);await pg.tap('#lockbtn');await pg.wait_for_timeout(200)
        await pg.tap('.ue[data-id="%s"] .w-chk'%I['r']);await pg.wait_for_timeout(60)
        rm=await pg.evaluate("[String(APP.ev().prop('%s','näkyy')),document.querySelector('.ue[data-id=\"%s\"]').getAnimations().length]"%(I['n'],I['n']))
        print('RM',rm);assert rm==['true',0],rm
        assert not errs,errs
        await b.close()
asyncio.run(main())
