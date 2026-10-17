# F28 Jana, vaihe 1 (Appi-appi 41) logiikassa (1440 ja 1280 hiirellä, 390 ja 320 kosketuksella CDP:llä).
# Asteikko ja merkin kohta palikan yllä, raahaus loksahtaa portaaseen ja näyttää luvun, kohta paneelista numerona,
# ▶ käynnistää ja alussa oleva merkki laukeaa, loppu 10 → 5 jättää merkin reunaan haaleana (ei katoa), Arvo ei mene janaan,
# Toiminnon kohteeksi kelpaa jana (Ilman laukaisua), paletin Jana (tietokone), tallennus. Kuvat appiappi41_*.png. Ei oikeaa iPhonea.
import asyncio, os
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P;
 var j=KK.addBlock(P,'jana',{}),jn=KK.addNode(P,j.id,20,40);KK.setName(P,j.id,'Jana');jn.w=420;jn.h=200;
 var m=KK.addBlock(P,'muisti',{v:'0'});KK.setName(P,m.id,'Laskuri');KK.addNode(P,m.id,20,420);
 var t0=KK.addBlock(P,'tee',{do:'lisaa',o:m.id,v:'1'});KK.setName(P,t0.id,'Alussa');var t0n=KK.addNode(P,t0.id,40,140,jn.id);t0n.jk=0;
 var t3=KK.addBlock(P,'tee',{do:'aseta',o:m.id,v:'30'});KK.setName(P,t3.id,'Kolme');var t3n=KK.addNode(P,t3.id,40,190,jn.id);t3n.jk=3;
 var a=KK.addBlock(P,'arvo',{v:'1'});KK.setName(P,a.id,'Irto');var an=KK.addNode(P,a.id,40,520);
 P.lcam={x:0,y:0,z:1};KK.repair(P);APP.renderAll();return {j:j.id,jn:jn.id,t0n:t0n.id,t3n:t3n.id,t3:t3.id,m:m.id,an:an.id};})()"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in ((int(os.environ['VAIN']),) if os.environ.get('VAIN') else (1440,1280,390,320)):
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
            async def dragxy(a,t,n=12,hold=None):
                if mob:
                    await T('touchStart',[a])
                    for i in range(1,n+1):await T('touchMove',[(a[0]+(t[0]-a[0])*i/n,a[1]+(t[1]-a[1])*i/n)])
                    if hold:await hold()
                    await T('touchEnd',[])
                else:
                    await pg.mouse.move(*a);await pg.mouse.down();await pg.mouse.move(t[0],t[1],steps=n)
                    if hold:await hold()
                    await pg.mouse.up()
                await pg.wait_for_timeout(250)
            def N(nid):return '#lels [data-nid="%s"]'%nid
            async def node(nid):return await pg.evaluate("(function(){var n=KK.nodeOf(APP.P,'%s');return {x:n.x,y:n.y,g:n.g,jk:n.jk===undefined?null:n.jk};})()"%nid)
            await pg.fill('#wname','Janat');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            await tap('#tabs [data-t="logiikka"]')
            J=N(I['jn'])
            # 1 ulkoasu: JANA-otsikko, asteikko 0–10 (luvut), merkkien kohdat palikoiden yllä
            assert 'JANA' in await pg.locator(J+' .ktl').inner_text()
            labs=await pg.evaluate("[...document.querySelectorAll('%s .jtl')].map(e=>e.textContent)"%J);assert labs[0]=='0' and labs[-1]=='10',labs
            ml=await pg.evaluate("[...document.querySelectorAll('%s .jml')].map(e=>e.textContent)"%J);assert sorted(ml)==['0 s','3 s'],ml
            # merkin vasen reuna = kohta: 3 / 10 asteikosta (sivuilla 16 px)
            jx=await node(I['jn']);t3=await node(I['t3n'])
            assert abs(t3['x']-(jx['x']+16+(420-32)*0.3))<=1,(t3,jx)
            await pg.screenshot(path='appiappi41_jana_%d.png'%W)
            # 2 raahaus: loksahtaa portaaseen ja näyttää luvun raahatessa
            jb=await pg.locator(J).bounding_box();z=await pg.evaluate("APP.S.lcamZ||(APP.P.lcam&&APP.P.lcam.z)||1")
            r=await pg.locator(N(I['t3n'])).bounding_box()
            seen={}
            async def hold():
                await pg.wait_for_timeout(60);seen['h']=await pg.evaluate("(document.getElementById('jdh')||{}).textContent||''")
            px_per=(jb['width']-32*z)/10
            await dragxy((r['x']+r['width']/2,r['y']+r['height']/2),(r['x']+r['width']/2+px_per*3.4,r['y']+r['height']/2+4),hold=hold)
            n3=await node(I['t3n']);assert n3['g']==I['jn'] and n3['jk']==6,('loksahdus portaaseen',n3)
            assert seen.get('h')=='6 s',seen
            assert await pg.locator('#jdh').count()==0,'raahausluku pois'
            # 3 paneeli: kohta numerona
            r=await pg.locator(N(I['t3n'])).bounding_box();await tapxy(r['x']+r['width']/2,r['y']+r['height']/2)
            ih=(await pg.inner_text('#insp')).lower();assert 'kohta janalla' in ih,ih[:300]
            await pg.fill('#insp input[data-jk]','7');await pg.wait_for_timeout(250)
            assert (await node(I['t3n']))['jk']==7
            assert '7 s' in await pg.evaluate("[...document.querySelectorAll('%s .jml')].map(e=>e.textContent).join('|')"%J)
            # Miksi? kertoo merkistä
            wt=await pg.evaluate("KK.why(APP.P,KK.Ev(APP.P),'%s',2).txt"%I['t3']);assert 'merkki kohdassa 7' in wt,wt
            # 4 janan paneeli ja ▶: alussa oleva merkki laukeaa heti
            h=await pg.locator(J+' .ktl').bounding_box();await tapxy(h['x']+h['width']/2,h['y']+h['height']/2)
            ih=(await pg.inner_text('#insp')).lower();assert 'kulku' in ih and 'hypyssä' in ih and 'kierros' in ih,ih[:500]
            await pg.evaluate("document.querySelector('#insp [data-do=\"janago\"]').click()");await pg.wait_for_timeout(1300)
            st=await pg.evaluate("(function(){var s=APP.P.st['%s']||{};return {run:!!s.run,d:s.d||0,m:APP.P.st['%s']};})()"%(I['j'],I['m']))
            assert st['run'] and st['d']>0.8 and st['m']==1,st
            assert 'jrun' in (await pg.locator(J).get_attribute('class')).split()
            assert await pg.locator(J+' .jph').count()==1,'kulkuviiva'
            await pg.evaluate("document.querySelector('#insp [data-do=\"janastop\"]').click()");await pg.wait_for_timeout(250)
            assert not await pg.evaluate("!!(APP.P.st['%s']||{}).run"%I['j'])
            # 5 loppu 10 → 5: merkki 7 s reunaan haaleana, ei katoa
            await pg.fill('#insp input[data-k="b"]','5');await pg.dispatch_event('#insp input[data-k="b"]','input');await pg.wait_for_timeout(300)
            cls=await pg.locator(N(I['t3n'])).get_attribute('class');assert 'jout' in cls.split(),cls
            assert 'ulkopuolella' in await pg.locator(J).inner_text()
            t3=await node(I['t3n']);jx=await node(I['jn']);assert t3['jk']==7 and abs(t3['x']-(jx['x']+16+388))<=1,(t3,jx)
            await pg.screenshot(path='appiappi41_ulkopuolella_%d.png'%W)
            await pg.fill('#insp input[data-k="b"]','10');await pg.dispatch_event('#insp input[data-k="b"]','input');await pg.wait_for_timeout(250)
            # 6 Arvo ei mene janaan
            jb=await pg.locator(J).bounding_box();ab=await pg.locator(N(I['an'])).bounding_box()
            await dragxy((ab['x']+15,ab['y']+12),(jb['x']+jb['width']/2,jb['y']+jb['height']-30))
            assert (await node(I['an']))['g']=='','Arvo ei ole merkki'
            # 7 Toiminnon kohteeksi jana: Aseta arvo ja Ilman laukaisua
            nt=await pg.evaluate("(function(){var P=APP.P,t=KK.addBlock(P,'tee',{do:'aseta',o:'%s',v:'4'});KK.setName(P,t.id,'Siirto');var n=KK.addNode(P,t.id,40,640);APP.S.sel={t:'n',id:n.id};APP.renderAll();return n.id;})()"%I['j']);await pg.wait_for_timeout(200)
            ih=(await pg.inner_text('#insp')).lower();assert 'ilman laukaisua' in ih,ih[:600]
            # 8 paletti (tietokone): Jana Ketju-otsikon alla, veto luo janan
            if not mob:
                ch='#pal .chip[data-make*="jana"]';assert await pg.locator(ch).count()==1
                n0=await pg.evaluate("Object.values(APP.P.b).filter(b=>b.k==='jana').length")
                await pg.locator(ch).scroll_into_view_if_needed();vb=await pg.locator('#lvp').bounding_box();c=await pg.locator(ch).bounding_box()
                await veda(pg,[c['x']+c['width']/2,c['y']+c['height']/2],[vb['x']+vb['width']-260,vb['y']+vb['height']-150])
                assert await pg.evaluate("Object.values(APP.P.b).filter(b=>b.k==='jana').length")==n0+1
            # 9 tallennus
            await pg.wait_for_timeout(400);await pg.reload();await pg.wait_for_timeout(400)
            v=await pg.evaluate("(function(){return [KK.nodeOf(APP.P,'%s').jk,KK.nodeOf(APP.P,'%s').g,APP.P.b['%s'].k];})()"%(I['t3n'],I['t3n'],I['j']))
            assert v==[7,I['jn'],'jana'],v
            print(W,'ok');print('errs',errs);await ctx.close()
        await b.close()
asyncio.run(main())
