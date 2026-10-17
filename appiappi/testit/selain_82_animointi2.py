# F29 vaihe 2: arvon vaihtuminen ja paikan hyppäys selaimessa (1440 ja 1280 hiirellä, 390 ja 320 kosketuksella).
# Käytössä: painike kasvattaa laskuria; Teksti (luku rullaa) näyttää uuden luvun heti, vanha jää haamuksi ja liukuu ylös
# pois; Muoto (ristihäivytys) häivyttää; kaksi nopeaa muutosta peräkkäin = töks, uusin näkyy (ei haamua). Aseta x/y:
# oikea paikka heti, palikka liukuu vanhasta kohdasta; heti perään tuleva toinen siirto = töks. Muokatessa ei animaatiota.
# Paneelissa Arvo vaihtuu vain arvon näyttäville (Kuva ilman luku rullaa, Valintaruudulla ei), Paikka vaihtuu kaikille;
# Asetuksissa projektin oletus. Lopuksi Vähennä liikettä: ei animaatioita. Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,vw=P.views[0].id;
 function U(k,o,x,y,w,h,nm){var b=KK.addBlock(P,k,o);b.x=x;b.y=y;b.w=w;b.h=h;KK.setName(P,b.id,nm);return b;}
 var m=KK.addBlock(P,'muisti',{v:'5'});KK.setName(P,m.id,'Laskuri');KK.addNode(P,m.id,600,0);
 var n=U('nappi',{v:vw,tx:'Lisää',beh:'kerta'},10,10,140,44,'Lisää');
 var t=U('nayta',{v:vw,tx:'{#'+m.id+'}',anv:'rullaa',ank:0.8},10,70,140,44,'Pisteet');
 var f=U('muoto',{v:vw,tx:'{#'+m.id+'}',anv:'ristihaivytys',ank:0.8},170,70,120,60,'Laatikko');
 var s=U('nayta',{v:vw,tx:'Liukuja',anm:'liukuu',ank:0.8},10,160,140,44,'Liukuja');
 var k=U('pkuva',{v:vw},170,160,80,80,'Kuva');var r=U('ruutu',{v:vw,tx:'Rasti'},10,260,160,44,'Rasti');
 var te=KK.addBlock(P,'tee',{do:'lisaa',o:m.id});KK.addLink(P,KK.addNode(P,n.id,0,0).id,'e',KK.addNode(P,te.id,300,0).id,'e');
 KK.repair(P);APP.saveNow();APP.renderAll();return {m:m.id,n:n.id,t:t.id,f:f.id,s:s.id,k:k.id,r:r.id};})()"""
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
            async def J(js):return await pg.evaluate(js)
            def ue(i):return '.ue[data-id="%s"]'%i
            async def ghost(i):return await J("""(function(){var e=document.querySelector('%s'),g=e.querySelector('.anghost'),n=e.querySelector('.in');
              return [g?g.textContent.trim():null,n.textContent.trim(),g?g.getAnimations().length:0,n.getAnimations().length,g?getComputedStyle(g).translate:null];})()"""%ue(i))
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Animointi 2');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await J(SETUP);await pg.wait_for_timeout(200)
            if not mob:
                # Paneeli: Arvo vaihtuu ja Paikka vaihtuu
                await pg.click(ue(I['k']));await pg.wait_for_timeout(150);await pg.click('#ansec summary')
                ko=await J("[].map.call(document.querySelectorAll('#ansec select[data-k=\"anv\"] option'),function(o){return o.value;}).join(',')")
                print(W,'kuva',ko);assert ko==',toks,ristihaivytys',ko
                await pg.select_option('#ansec select[data-k="anm"]','liukuu');await pg.wait_for_timeout(100)
                assert await J("APP.P.b['%s'].anm"%I['k'])=='liukuu'
                await pg.select_option('#ansec select[data-k="anv"]','ristihaivytys');await pg.wait_for_timeout(100)
                assert await J("APP.P.b['%s'].anv"%I['k'])=='ristihaivytys'
                await pg.select_option('#ansec select[data-k="anv"]','');await pg.wait_for_timeout(100)
                assert await J("'anv' in APP.P.b['%s']"%I['k'])==False,'oletukseen = kenttä pois'
                await pg.keyboard.press('Escape');await pg.click(ue(I['r']));await pg.wait_for_timeout(150)
                assert await pg.locator('#ansec select[data-k="anv"]').count()==0,'valintaruudulla ei Arvo vaihtuu'
                assert await pg.locator('#ansec select[data-k="anm"]').count()==1
                await pg.keyboard.press('Escape')
                await pg.click('#setbtn');await pg.wait_for_timeout(150)
                await pg.select_option('#anset select[data-pan="v"]','rullaa');await pg.select_option('#anset select[data-pan="m"]','liukuu');await pg.wait_for_timeout(100)
                pa=await J("JSON.stringify(APP.P.an)");print(W,'oletus',pa);assert pa=='{"v":"rullaa","m":"liukuu"}',pa
                await J("delete APP.P.an;APP.saveNow()")
                await pg.click('#sheet [data-x="close"]');await pg.wait_for_timeout(150)
                # Muokatessa ei animaatiota
                await J("KK.setVal(APP.P,'%s',9,{});APP.renderAll()"%I['m'])
                g=await ghost(I['t']);assert g[0] is None and g[3]==0,('muokatessa',g)
                await J("KK.setVal(APP.P,'%s',5,{});APP.renderAll()"%I['m'])
            await tap('#lockbtn');await pg.wait_for_timeout(250)
            # 1 arvo vaihtuu: luku rullaa ja ristihäivytys
            await tap(ue(I['n'])+' button');await pg.wait_for_timeout(120)
            g=await ghost(I['t']);print(W,'1 rullaa',g)
            assert g[0]=='5' and g[1]=='6' and g[2]==1 and g[3]==1,g
            assert g[4] and g[4]!='none' and '-' in g[4],('vanha liukuu ylös',g)
            h=await ghost(I['f']);print(W,'1 häivytys',h);assert h[0]=='5' and h[1]=='6' and h[2]==1 and h[4] in (None,'none'),h
            await pg.wait_for_timeout(900)
            g=await ghost(I['t']);assert g[0] is None and g[3]==0,('lopussa',g)
            # 2 kaksi nopeaa muutosta: töks, uusin näkyy
            await tap(ue(I['n'])+' button');await pg.wait_for_timeout(30);await tap(ue(I['n'])+' button');await pg.wait_for_timeout(60)
            g=await ghost(I['t']);print(W,'2 nopea',g);assert g[0] is None and g[1]=='8',g
            await pg.wait_for_timeout(900)
            # 3 paikka vaihtuu: oikea paikka heti, liukuu
            await J("KK.setOmi(APP.P,'%s','x',200);APP.renderAll()"%I['s']);await pg.wait_for_timeout(200)
            q=await J("""(function(){var e=document.querySelector('%s');return [e.style.left,APP.ev().prop('%s','x'),e.getAnimations().length,getComputedStyle(e).translate];})()"""%(ue(I['s']),I['s']))
            print(W,'3 liukuu',q);assert q[0]=='200px' and q[1]==200 and q[2]==1 and q[3].startswith('-'),q
            await pg.wait_for_timeout(900)
            assert await J("document.querySelector('%s').getAnimations().length"%ue(I['s']))==0
            # 4 kaksi siirtoa peräkkäin: jälkimmäinen töks
            await J("KK.setOmi(APP.P,'%s','x',20);APP.renderAll()"%I['s']);await pg.wait_for_timeout(30)
            await J("KK.setOmi(APP.P,'%s','x',100);APP.renderAll()"%I['s']);await pg.wait_for_timeout(30)
            q=await J("(function(){var e=document.querySelector('%s');return [e.style.left,e.getAnimations().length];})()"%ue(I['s']))
            print(W,'4 nopea',q);assert q==['100px',0],q
            await pg.screenshot(path='appiappiF29_vaihe2_%d.png'%W)
            print(W,'errs',errs);assert not errs,errs
            await ctx.close()
        # 5 Vähennä liikettä: ei haamua eikä liukua
        ctx=await b.new_context(viewport={'width':390,'height':844},has_touch=True,is_mobile=True,reduced_motion='reduce')
        pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(U);await pg.wait_for_timeout(250);await pg.fill('#wname','RM');await pg.click('#wcreate');await pg.wait_for_timeout(150)
        I=await pg.evaluate(SETUP);await pg.tap('#lockbtn');await pg.wait_for_timeout(250)
        await pg.tap('.ue[data-id="%s"] button'%I['n']);await pg.wait_for_timeout(60)
        await pg.evaluate("KK.setOmi(APP.P,'%s','x',200);APP.renderAll()"%I['s']);await pg.wait_for_timeout(60)
        rm=await pg.evaluate("[document.querySelectorAll('.anghost').length,document.querySelector('.ue[data-id=\"%s\"] .in').textContent.trim(),document.querySelector('.ue[data-id=\"%s\"]').getAnimations().length]"%(I['t'],I['s']))
        print('RM',rm);assert rm==[0,'6',0],rm
        assert not errs,errs
        await b.close()
asyncio.run(main())
