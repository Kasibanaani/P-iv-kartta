# Appi-appi 27 (F30 kohdat 1–3): logiikkapinta (1440 ja 1280 hiirellä, 390 ja 320 kosketuksella CDP:llä).
# Kulman valinnat Pistokkeet ja Viitteet, palikan oma pistokeasetus paneelista, viitteiden katkoviivat (valitulle,
# kaikille, ei), Kaavan venytys kulmasta ja kaavan kirjoitus suoraan palikkaan (Enter tallentaa, Esc peruu, Kumoa).
# Kuvat appiappi27_*.png. Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P;var vw=P.views[0].id;
 var u=KK.addBlock(P,'muisti',{v:'8'});KK.setName(P,u.id,'Uni');KK.addNode(P,u.id,10,60);
 var k=KK.addBlock(P,'kaava',{});k.f=KK.kaavaToIds(P,'uni > 7');var kn=KK.addNode(P,k.id,130,140);
 var t=KK.addBlock(P,'nayta',{v:vw,tx:'Hei'});t.x=20;t.y=20;t.w=200;t.h=40;KK.setName(P,t.id,'Rivi');var tn=KK.addNode(P,t.id,40,330);
 KK.addLink(P,kn.id,'v',tn.id,'nk');P.lcam={x:0,y:0,z:1};
 KK.repair(P);APP.renderAll();return {u:u.id,k:k.id,kn:kn.id,t:t.id};})()"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in (1440,1280,390,320):
            mob=W<500;H=844 if mob else 900
            ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            cdp=await ctx.new_cdp_session(pg)
            async def T(typ,pts):await cdp.send('Input.dispatchTouchEvent',{'type':typ,'touchPoints':[{'x':x,'y':y} for (x,y) in pts]})
            async def tapxy(x,y):
                if mob:await T('touchStart',[(x,y)]);await T('touchEnd',[])
                else:await pg.mouse.click(x,y)
                await pg.wait_for_timeout(200)
            async def tap(sel):
                if mob:await pg.tap(sel)
                else:await pg.click(sel)
                await pg.wait_for_timeout(200)
            async def dragxy(a,t,n=10):
                if mob:
                    await T('touchStart',[a])
                    for i in range(1,n+1):await T('touchMove',[(a[0]+(t[0]-a[0])*i/n,a[1]+(t[1]-a[1])*i/n)])
                    await T('touchEnd',[])
                else:
                    await pg.mouse.move(*a);await pg.mouse.down();await pg.mouse.move(t[0],t[1],steps=n);await pg.mouse.up()
                await pg.wait_for_timeout(250)
            await pg.fill('#wname','Pinta');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            await tap('#tabs [data-t="logiikka"]')
            K='#lels .ln[data-nid="%s"]'%I['kn']
            async def kc():
                r=await pg.locator(K+' .lb').bounding_box();return (r['x']+r['width']/2,r['y']+r['height']/2)
            async def refs():return await pg.evaluate("document.querySelectorAll('#lsvg path.lk.ref').length")
            # 1 pistokkeet näkyvät, valinta kulmassa
            assert await pg.locator('#lviewc [data-lview="pin"]').inner_text()=='Pistokkeet: näkyvät'
            assert await pg.locator(K+' .pins.o .pt').count()==1
            await pg.screenshot(path='appiappi27_nakyvat_%d.png'%W)
            # 2 piiloon: valinta korostuu, nuoli himmeä, pistoke ei osu
            await tap('#lviewc [data-lview="pin"]')
            assert await pg.evaluate("APP.P.lg.pin")=='h'
            pb=pg.locator('#lviewc [data-lview="pin"]');assert await pb.inner_text()=='Pistokkeet piilossa' and 'on' in (await pb.get_attribute('class'))
            assert 'nopin' in (await pg.locator(K).get_attribute('class'))
            assert await pg.evaluate("document.querySelectorAll('#lsvg path.lk.hp').length")==1,'nuoli himmeänä'
            op=float(await pg.evaluate("getComputedStyle(document.querySelector('#lsvg path.lk.hp')).opacity"));assert op<0.5,op
            vis=await pg.evaluate("getComputedStyle(document.querySelector('%s .pins.o .pt')).visibility"%K);assert vis=='hidden',vis
            await pg.screenshot(path='appiappi27_piilossa_%d.png'%W)
            # 3 palikan oma asetus voittaa: Näkyvät
            c=await kc();await tapxy(*c)
            assert await pg.evaluate("APP.S.sel&&APP.S.sel.id")==I['kn']
            ih=(await pg.inner_text('#insp')).lower();assert 'ulkonäkö logiikassa' in ih and 'kuten muut (piilossa)' in ih,ih[:300]
            await pg.evaluate("document.querySelector('#insp [data-seg=\"lpin\"][data-v=\"n\"]').click()");await pg.wait_for_timeout(200)
            assert await pg.evaluate("APP.P.b['%s'].lpin"%I['k'])=='n'
            assert 'nopin' not in (await pg.locator(K).get_attribute('class'))
            # 4 viitteet: valitulle (oletus) näyttää uni → kaava
            assert await refs()==1,await refs()
            await pg.evaluate("APP.S.sel=null;APP.renderAll()");await pg.wait_for_timeout(150)
            assert await refs()==0
            await tap('#lviewc [data-lview="vit"]');assert await pg.evaluate("APP.P.lg.vit")=='kaikki' and await refs()==1
            await pg.screenshot(path='appiappi27_viitteet_%d.png'%W)
            await tap('#lviewc [data-lview="vit"]');assert await pg.evaluate("APP.P.lg.vit")=='ei' and await refs()==0
            await tap('#lviewc [data-lview="vit"]');assert await pg.evaluate("APP.P.lg.vit")==None
            await tap('#lviewc [data-lview="pin"]');assert await pg.evaluate("APP.P.lg.pin")==None
            # 5 venytys kulmasta (valittuna kulma näkyy)
            c=await kc();await tapxy(*c)
            r=await pg.locator(K+' .rs').bounding_box();w0=(await pg.locator(K).bounding_box())['width']
            a=(r['x']+r['width']/2,r['y']+r['height']/2);await dragxy(a,(a[0]+90,a[1]+50))
            kw=await pg.evaluate("KK.nodeOf(APP.P,'%s').kw"%I['kn']);kh=await pg.evaluate("KK.nodeOf(APP.P,'%s').kh"%I['kn'])
            assert kw and kw>=w0+80 and kh>=80,(W,w0,kw,kh)
            assert 'kz' in (await pg.locator(K).get_attribute('class'))
            # 6 suora kirjoitus: napautus valitussa palikassa avaa kentän
            c=await kc();await tapxy(*c)
            assert await pg.locator('#kedit textarea').count()==1,'kirjoituskenttä auki'
            u0=await pg.evaluate("APP.S.undo.length")
            await pg.fill('#kedit textarea','uni > 9');await pg.wait_for_timeout(150)
            assert 'ei päde' in await pg.inner_text('#kres2')
            await pg.fill('#kedit textarea','uni > 9 +');await pg.wait_for_timeout(150)
            assert '⚠' in await pg.inner_text('#kres2'),'virhe näkyy'
            await pg.fill('#kedit textarea','un');await pg.wait_for_timeout(150);await pg.dispatch_event('#kedit textarea','keyup')
            await pg.wait_for_timeout(100);assert await pg.locator('#ksug2 [data-ksug="uni"]').count()==1,'ehdotus uni'
            await pg.evaluate("(function(){var b=document.querySelector('#ksug2 [data-ksug=\"uni\"]');b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true}));})()")
            await pg.wait_for_timeout(100);v=await pg.input_value('#kedit textarea');assert v=='uni',v
            await pg.type('#kedit textarea',' > 9');await pg.screenshot(path='appiappi27_kirjoitus_%d.png'%W)
            await pg.press('#kedit textarea','Enter');await pg.wait_for_timeout(200)
            assert await pg.locator('#kedit').count()==0
            f=await pg.evaluate("KK.kaavaToText(APP.P,APP.P.b['%s'].f)"%I['k']);assert f.strip()=='uni > 9',f
            assert await pg.evaluate("APP.S.undo.length")==u0+1,'yksi Kumoa-askel'
            assert 'uni &gt; 9' in await pg.inner_html(K) or 'uni' in await pg.inner_text(K)
            # Esc peruu
            c=await kc();await tapxy(*c);await pg.fill('#kedit textarea','uni < 1');await pg.wait_for_timeout(100);await pg.press('#kedit textarea','Escape');await pg.wait_for_timeout(200)
            f=await pg.evaluate("KK.kaavaToText(APP.P,APP.P.b['%s'].f)"%I['k']);assert f.strip()=='uni > 9',f
            assert await pg.evaluate("APP.S.undo.length")==u0+1
            # napautus muualle tallentaa
            c=await kc();await tapxy(*c);await pg.fill('#kedit textarea','uni > 2');await pg.wait_for_timeout(100)
            vb=await pg.locator('#lvp').bounding_box();await tapxy(vb['x']+vb['width']-30,vb['y']+vb['height']-90)
            await pg.wait_for_timeout(200);assert await pg.locator('#kedit').count()==0
            f=await pg.evaluate("KK.kaavaToText(APP.P,APP.P.b['%s'].f)"%I['k']);assert f.strip()=='uni > 2',f
            # tallennus ja uudelleenavaus
            await pg.wait_for_timeout(400);await pg.reload();await pg.wait_for_timeout(400)
            n2=await pg.evaluate("(function(){var n=KK.nodeOf(APP.P,'%s');return [n.kw,n.kh,APP.P.b[n.p].lpin];})()"%I['kn'])
            assert n2==[kw,kh,'n'],n2
            print(W,'ok');print('errs',errs);await ctx.close()
        await b.close()
asyncio.run(main())
