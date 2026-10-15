# Versio 6.12: ketjuikkuna puhelimella sormella (390 ja 320 px, kosketus). Kanvaasi koko leveydellä, paletti ja paneeli
# laatikkoina alareunan napeista, ketju napautuksella, tapahtuma napautuksella valittuun ketjuun, ketjun veto ja koon
# muutos sormella, viivan veto sormella, kahden sormen zoomaus, paneelin vihjeteksti ja Valmis. Kosketus tehdään
# Chromiumin kosketustapahtumina (CDP). Testit ajetaan tietokoneen Chromiumissa, eivät oikealla puhelimella. Kuvat versio612_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in (390,320):
            ctx=await b.new_context(viewport={'width':W,'height':844},has_touch=True,is_mobile=True,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            cdp=await ctx.new_cdp_session(pg)
            async def T(typ,pts):await cdp.send('Input.dispatchTouchEvent',{'type':typ,'touchPoints':[{'x':x,'y':y,'id':i} for i,(x,y) in enumerate(pts)]})
            async def sveda(a,t,steps=10):
                await T('touchStart',[a])
                for i in range(1,steps+1):await T('touchMove',[(a[0]+(t[0]-a[0])*i/steps,a[1]+(t[1]-a[1])*i/steps)])
                await T('touchEnd',[]);await pg.wait_for_timeout(200)
            async def tap(sel):
                bb=await pg.locator(sel).first.bounding_box();await pg.touchscreen.tap(bb['x']+bb['width']/2,bb['y']+bb['height']/2);await pg.wait_for_timeout(200)
            await pg.fill('#wname','Puhelin');await tap('#wcreate')
            await tap('#tabs [data-t="logiikka"]')
            sw=await pg.evaluate("[document.querySelector('#stage').getBoundingClientRect().width,getComputedStyle(document.querySelector('#mbar')).display,document.querySelector('#pal').getBoundingClientRect().right<=1]")
            print(W,'1 asettelu:',sw);assert sw[0]>=W-2 and sw[1]=='flex' and sw[2]
            # paletti laatikkona: Ketju napautuksella
            await tap('#mpal');op=await pg.evaluate("document.body.classList.contains('palopen')");assert op
            tip=await pg.get_attribute('#pal .chip[data-make*=\'"k":"ajastin"\']','title');assert 'Odottaa annetun ajan' in tip
            await pg.locator('#pal .chip[data-make*=\'"k":"ketju"\']').scroll_into_view_if_needed();await tap('#pal .chip[data-make*=\'"k":"ketju"\']')
            st=await pg.evaluate("[document.body.classList.contains('palopen'),Object.values(APP.P.b).filter(b=>b.k==='ketju').length]");print(W,'2 ketju napautuksella:',st);assert st==[False,1]
            wid=await P(pg,"P.lg.n.find(n=>P.b[n.p].k==='ketju').id");kid=await P(pg,"P.lg.n.find(n=>P.b[n.p].k==='ketju').p")
            # tapahtumat napautuksella valittuun ketjuun
            for k,extra in (('tee','[data-make*=\'"do":"aseta"\']'),('ajastin',''),('tee','[data-make*=\'"do":"tila"\']')):
                await tap('#mpal');sel='#pal .chip[data-make*=\'"k":"%s"\']%s'%(k,extra);await pg.locator(sel).first.scroll_into_view_if_needed();await tap(sel)
            order=await P(pg,"KK.chainOrder(P,'%s').map(id=>{var b=P.b[KK.nodeOf(P,id).p];return b.k==='tee'?b.do:b.k;})"%kid);print(W,'3 ketjuun:',order);assert order==['aseta','ajastin','tila']
            await pg.evaluate("(function(){var c=APP.P.lcam;var n=KK.nodeOf(APP.P,'%s');c.z=0.8;c.x=-n.x*c.z+10;c.y=-n.y*c.z+20;APP.renderAll();})()"%wid);await pg.wait_for_timeout(150)
            await pg.screenshot(path='versio612_puhelin_%d.png'%W)
            # ketjun veto sormella otsikosta
            w0=await P(pg,"KK.nodeOf(P,'%s')"%wid);hb=await pg.locator('#lworld [data-nid="%s"] .wname'%wid).bounding_box()
            await sveda([hb['x']+hb['width']/2,hb['y']+8],[hb['x']+hb['width']/2+40,hb['y']+68])
            w1=await P(pg,"KK.nodeOf(P,'%s')"%wid);print(W,'4 veto:',(w1['x']-w0['x'],w1['y']-w0['y']));assert w1['x']-w0['x']==50 and w1['y']-w0['y']==75
            # koon muutos sormella
            await pg.evaluate("(function(){var c=APP.P.lcam;var n=KK.nodeOf(APP.P,'%s');c.x=-n.x*c.z+10;c.y=-n.y*c.z+20;APP.renderAll();})()"%wid);await pg.wait_for_timeout(100)
            rs=await pg.locator('#lworld [data-nid="%s"] .rs'%wid).bounding_box();
            if rs['y']>700:
                await pg.evaluate("(function(){var c=APP.P.lcam;c.y-=%d;APP.renderAll();})()"%(rs['y']-600));await pg.wait_for_timeout(100);rs=await pg.locator('#lworld [data-nid="%s"] .rs'%wid).bounding_box()
            ww0=w1['w'];await sveda([rs['x']+rs['width']/2,rs['y']+rs['height']/2],[rs['x']+rs['width']/2+40,rs['y']+rs['height']/2+30])
            ww1=await P(pg,"KK.nodeOf(P,'%s').w"%wid);print(W,'5 koko:',ww0,'→',ww1);assert ww1>=ww0+40
            # viivan veto sormella: poistetaan ensimmäinen viiva ja vedetään se uudelleen
            await pg.evaluate("(function(){var c=APP.P.lcam;var n=KK.nodeOf(APP.P,'%s');c.x=-n.x*c.z+10;c.y=-n.y*c.z+20;APP.renderAll();})()"%wid)
            ord2=await P(pg,"KK.chainOrder(P,'%s')"%kid);a,bn=ord2[0],ord2[1]
            await pg.evaluate("(function(){var P=APP.P;P.lg.l=P.lg.l.filter(l=>!(l.f==='%s'&&l.t==='%s'));APP.renderAll();})()"%(a,bn));await pg.wait_for_timeout(150)
            po=await pg.locator('#lworld [data-nid="%s"] .pins.o .pt[data-p="e"]'%a).bounding_box();pi=await pg.locator('#lworld [data-nid="%s"] .pins.i .pt[data-p="e"]'%bn).bounding_box()
            await sveda([po['x']+po['width']/2,po['y']+po['height']/2],[pi['x']+pi['width']/2+4,pi['y']+pi['height']/2+3])
            ok=await P(pg,"P.lg.l.some(l=>l.f==='%s'&&l.t==='%s'&&KK.isChainLink(P,l))"%(a,bn));print(W,'6 viiva sormella:',ok);assert ok
            # kahden sormen zoomaus
            z0=await P(pg,"P.lcam.z");lv=await pg.locator('#lvp').bounding_box();cx=lv['x']+lv['width']/2;cy=lv['y']+lv['height']*0.75
            await T('touchStart',[(cx-30,cy),(cx+30,cy)])
            for i in range(1,9):await T('touchMove',[(cx-30-i*10,cy),(cx+30+i*10,cy)])
            await T('touchEnd',[]);await pg.wait_for_timeout(200)
            z1=await P(pg,"P.lcam.z");print(W,'7 zoomaus:',round(z0,2),'→',round(z1,2));assert z1>z0*1.8
            # paneeli laatikkona, vihjeteksti, Valmis
            await pg.evaluate("(function(){var c=APP.P.lcam;var n=KK.nodeOf(APP.P,'%s');c.z=0.8;c.x=-n.x*c.z+10;c.y=-n.y*c.z+20;APP.renderAll();})()"%wid);await pg.wait_for_timeout(100)
            await tap('#lworld [data-nid="%s"] .lb'%ord2[1])
            lab=await pg.inner_text('#mins');print(W,'8 nappi:',lab);assert lab.startswith('Asetukset:')
            await tap('#mins');op=await pg.evaluate("document.body.classList.contains('inspopen')");hint=await pg.inner_text('#insp .khint');print(W,'9 vihje:',hint[:50]);assert op and 'Odottaa annetun ajan' in hint
            ib=await pg.locator('#insp').bounding_box();assert ib['x']>=0 and ib['x']+ib['width']<=W+1
            await pg.screenshot(path='versio612_paneeli_%d.png'%W)
            await tap('#insp [data-mclose]');op=await pg.evaluate("document.body.classList.contains('inspopen')");assert not op
            # ajo puhelimessa: ▶ napautuksella
            await tap('#lworld [data-nid="%s"] [data-kplay]'%wid);run=await P(pg,"P.st['%s'].run"%kid);print(W,'10 ▶:',run);assert run
            print(W,'errs',errs);assert not errs
            await ctx.close()
        await b.close()
asyncio.run(main())
