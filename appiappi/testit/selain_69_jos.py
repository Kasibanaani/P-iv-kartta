# Appi-appi 28 (F30 kohta 4): jos, ja ja tai kaavassa selaimessa (1440 ja 1280 hiirellä, 390 ja 320 kosketuksella).
# Kaavan tulos jos-rakenteesta näkyy näkymän tekstissä, paneelin kaava ja tulos, ehdotus jos ( kirjoitettaessa,
# pilkkuvirheen ohje, Miksi? kertoo kumpi osa valittiin, suora kirjoitus palikkaan (tietokone). Jonon 12g: vanha
# jos(;;) muuttuu uuteen muotoon (jos (ehto) a muuten b). Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P;var vw=P.views[0].id;
 var u=KK.addBlock(P,'muisti',{v:'8'});KK.setName(P,u.id,'Uni');KK.addNode(P,u.id,10,60);
 var a=KK.addBlock(P,'tulos',{});KK.setName(P,a.id,'Arvio');KK.addNode(P,a.id,330,60);
 var k=KK.addBlock(P,'kaava',{});k.f=KK.kaavaToIds(P,'arvio = jos(uni > 7; "levännyt"; "väsynyt")');var kn=KK.addNode(P,k.id,130,160);
 var t=KK.addBlock(P,'nayta',{v:vw});t.tx=KK.toIds(P,'Olo: {Arvio}');t.x=20;t.y=20;t.w=220;t.h=40;KK.setName(P,t.id,'Olo');KK.addNode(P,t.id,40,330);
 P.lcam={x:0,y:0,z:1};KK.repair(P);APP.renderAll();return {u:u.id,a:a.id,k:k.id,kn:kn.id,t:t.id};})()"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in (1440,1280,390,320):
            mob=W<500;H=844 if mob else 900
            ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Jos');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            # 1 näkymän teksti saa arvon jos-funktiosta kaavan tuloksen kautta
            t=(await pg.inner_text('.ue[data-id="%s"]'%I['t'])).strip();print(W,'1 näkymä:',t);assert t=='Olo: levännyt',t
            # 2 paneeli: kaava, tulos ja Miksi?
            if mob:await pg.tap('#tabs [data-t="logiikka"]')
            else:await pg.click('#tabs [data-t="logiikka"]')
            await pg.wait_for_timeout(200)
            await pg.evaluate("APP.S.sel={t:'b',id:'%s'};APP.S.multi=[];APP.renderAll()"%I['k']);await pg.wait_for_timeout(200)
            ta='#insp textarea[data-kaava]'
            v=await pg.input_value(ta);print(W,'2 kaava:',v);assert v=='arvio = jos (uni > 7) "levännyt" muuten "väsynyt"',v
            r=await pg.inner_text('#kres');assert 'levännyt' in r,r
            w=await pg.inner_text('#whysec');print(W,'2 Miksi?:',w.replace('\n',' ')[:200]);assert 'Ehto ”uni > 7” pätee, joten jos valitsi kyllä-osan' in w
            # 3 muutos paneelissa: sisäkkäinen jos ja ja(…)
            await pg.fill(ta,'arvio = jos(ja(uni > 7; uni < 8); "tasan"; jos(uni >= 8; "paljon"; "vähän"))');await pg.wait_for_timeout(150)
            r=await pg.inner_text('#kres');print(W,'3 tulos:',r);assert 'paljon' in r
            assert await P(pg,"E().val(B('Arvio').id)")=='paljon'
            # 4 pilkku erottimena: selvä ohje
            await pg.fill(ta,'jos(uni > 7, 1, 2)');await pg.wait_for_timeout(150)
            r=await pg.inner_text('#kres');print(W,'4 virhe:',r);assert 'desimaalimerkki' in r
            # 5 ehdotus jos ( kirjoitettaessa
            await pg.fill(ta,'jo');await pg.focus(ta);await pg.press(ta,'End');await pg.wait_for_timeout(150)
            s=pg.locator('#ksug [data-ksug="jos ("]');assert await s.count()==1,'ehdotus jos ('
            await s.dispatch_event('pointerdown');await pg.wait_for_timeout(150)
            v=await pg.input_value(ta);print(W,'5 ehdotus:',v);assert v=='jos (',v
            await pg.fill(ta,'jos(uni > 9; "a"; "b")');await pg.wait_for_timeout(150)
            w=await pg.inner_text('#whysec');assert 'ei päde, joten jos valitsi muuten-osan' in w,w
            await pg.screenshot(path='appiappi28_paneeli_%d.png'%W)
            # 6 suora kirjoitus palikkaan (tietokone): kaksoisnapautus, Enter tallentaa
            if not mob:
                await pg.dblclick('#lels .ln[data-nid="%s"] .lb'%I['kn']);await pg.wait_for_timeout(200)
                assert await pg.locator('#kedit textarea').count()==1
                await pg.fill('#kedit textarea','tai(uni > 9; uni < 3)');await pg.wait_for_timeout(150)
                r=await pg.inner_text('#kres2');print(W,'6 suora:',r);assert 'ei päde' in r
                await pg.press('#kedit textarea','Enter');await pg.wait_for_timeout(150)
                f=await P(pg,"KK.kaavaToText(P,P.b['%s'].f)"%I['k']);assert f=='uni > 9 tai uni < 3',f
                await pg.screenshot(path='appiappi28_suora_%d.png'%W)
            print(W,'errs',errs);assert not errs,errs
            await ctx.close()
        await b.close()
asyncio.run(main())
