# Appi-appi 30 (jonon 1h): tekstihaku sisältää kaavassa selaimessa (1440 ja 1280 hiirellä, 390 ja 320 kosketuksella).
# Näkymän teksti saa arvon kaavasta, paneelin kaava ja tulos, ehdotus sisältää kirjoitettaessa arvon jälkeen
# (ei kaavan alussa), ohjeteksti mainitsee tekstihaun, Miksi? näyttää kaavan. Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P;var vw=P.views[0].id;
 var n=KK.addBlock(P,'muisti',{v:'Mustikkapiirakka'});KK.setName(P,n.id,'Nimi');KK.addNode(P,n.id,10,60);
 var h=KK.addBlock(P,'muisti',{v:'PIIRA'});KK.setName(P,h.id,'Haku');KK.addNode(P,h.id,10,160);
 var a=KK.addBlock(P,'tulos',{});KK.setName(P,a.id,'Osuma');KK.addNode(P,a.id,330,60);
 var k=KK.addBlock(P,'kaava',{});k.f=KK.kaavaToIds(P,'osuma = jos(nimi sisältää haku; "löytyi"; "ei löytynyt")');var kn=KK.addNode(P,k.id,130,260);
 var t=KK.addBlock(P,'nayta',{v:vw});t.tx=KK.toIds(P,'Haku: {Osuma}');t.x=20;t.y=20;t.w=220;t.h=40;KK.setName(P,t.id,'Tulos');KK.addNode(P,t.id,40,400);
 P.lcam={x:0,y:0,z:1};KK.repair(P);APP.renderAll();return {n:n.id,h:h.id,a:a.id,k:k.id,kn:kn.id,t:t.id};})()"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in (1440,1280,390,320):
            mob=W<500;H=844 if mob else 900
            ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Haku');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            # 1 näkymän teksti: haku isoilla kirjaimilla löytää
            t=(await pg.inner_text('.ue[data-id="%s"]'%I['t'])).strip();print(W,'1 näkymä:',t);assert t=='Haku: löytyi',t
            # 2 paneeli: kaava, tulos, ohje ja Miksi?
            if mob:await pg.tap('#tabs [data-t="logiikka"]')
            else:await pg.click('#tabs [data-t="logiikka"]')
            await pg.wait_for_timeout(200)
            await pg.evaluate("APP.S.sel={t:'b',id:'%s'};APP.S.multi=[];APP.renderAll()"%I['k']);await pg.wait_for_timeout(200)
            ta='#insp textarea[data-kaava]'
            v=await pg.input_value(ta);print(W,'2 kaava:',v);assert v=='osuma = jos (nimi sisältää haku) "löytyi" muuten "ei löytynyt"',v
            assert 'löytyi' in await pg.inner_text('#kres')
            assert 'sisältää' in await pg.inner_text('#insp'),'ohjeessa tekstihaku'
            w=await pg.inner_text('#whysec');print(W,'2 Miksi?:',w.replace('\n',' ')[:200]);assert 'Ehto ”nimi sisältää haku” pätee' in w,w
            # 3 kirjoitus paneelissa: puolukka ei löydy, tyhjä haku pätee
            await pg.fill(ta,'nimi sisältää "puolukka"');await pg.wait_for_timeout(150)
            r=await pg.inner_text('#kres');print(W,'3 tulos:',r);assert 'ei' in r and 'kyllä' not in r,r
            await pg.fill(ta,'nimi sisältää ""');await pg.wait_for_timeout(150)
            assert await P(pg,"E().val('%s')"%I['k'])==True
            # 4 ehdotus sisältää arvon jälkeen, ei kaavan alussa
            await pg.fill(ta,'nimi sis');await pg.focus(ta);await pg.press(ta,'End');await pg.wait_for_timeout(150)
            s=pg.locator('#ksug [data-ksug="sisältää "]');assert await s.count()==1,'ehdotus sisältää'
            await s.dispatch_event('pointerdown');await pg.wait_for_timeout(150)
            v=await pg.input_value(ta);print(W,'4 ehdotus:',repr(v));assert v=='nimi sisältää ',v
            await pg.fill(ta,'sis');await pg.focus(ta);await pg.press(ta,'End');await pg.wait_for_timeout(150)
            assert await pg.locator('#ksug [data-ksug="sisältää "]').count()==0,'ei ehdotusta alussa'
            await pg.fill(ta,'nimi sisältää haku');await pg.wait_for_timeout(150)
            await pg.screenshot(path='appiappi30_paneeli_%d.png'%W)
            print(W,'errs',errs);assert not errs,errs
            await ctx.close()
        await b.close()
asyncio.run(main())
