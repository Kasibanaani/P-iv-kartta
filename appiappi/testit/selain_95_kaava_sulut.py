# Jonon 12g (F41): kaavan sulut ja jos ilman funktioita selaimessa (tietokone 1440 ja 1280, 390 savutestinä).
# Laskusulut, jos (ehto) a muuten b ja jos ehto niin a muuten b (kirjoitettu muoto säilyy), ja/tai, ehdotukset jos ( ja ja,
# virhe laskun keskellä olevasta jos-sanasta, liitetty vanha jos(;;) muuttuu kentässä uudeksi, Miksi?, ja versio 8
# -tallennus vanhoilla kaavoilla ja varatulla viitteellä avautuu muunnettuna. Ei oikeaa iPhonea eikä Safaria.
import asyncio, json
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P;var vw=P.views[0].id;
 var u=KK.addBlock(P,'muisti',{v:'8'});KK.setName(P,u.id,'Uni');KK.addNode(P,u.id,10,60);
 var s=KK.addBlock(P,'muisti',{v:'3'});KK.setName(P,s.id,'Sarake');KK.addNode(P,s.id,10,140);
 var k=KK.addBlock(P,'kaava',{});k.f=KK.kaavaToIds(P,'(sarake - 1) * 80 + 28');var kn=KK.addNode(P,k.id,200,100);
 P.lcam={x:0,y:0,z:1};KK.repair(P);APP.renderAll();return {k:k.id,kn:kn.id};})()"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in (1440,1280,390):
            mob=W<500;H=844 if mob else 900
            ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Sulut');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            if mob:await pg.tap('#tabs [data-t="logiikka"]')
            else:await pg.click('#tabs [data-t="logiikka"]')
            await pg.wait_for_timeout(200)
            await pg.evaluate("APP.S.sel={t:'b',id:'%s'};APP.S.multi=[];APP.renderAll()"%I['k']);await pg.wait_for_timeout(200)
            ta='#insp textarea[data-kaava]'
            # 1 laskusulut
            r=await pg.inner_text('#kres');print(W,'1 sulut:',r);assert '188' in r,r
            if mob:
                print(W,'errs',errs);assert not errs,errs;await ctx.close();continue
            # 2 niin-muoto: tulos ja kirjoitettu muoto säilyy
            await pg.fill(ta,'jos uni > 7 niin "levännyt" muuten "väsynyt"');await pg.wait_for_timeout(150)
            r=await pg.inner_text('#kres');print(W,'2 niin:',r);assert 'levännyt' in r,r
            await pg.press(ta,'Enter');await pg.wait_for_timeout(200)
            v=await pg.input_value(ta);assert v=='jos uni > 7 niin "levännyt" muuten "väsynyt"',v
            # 3 sulkumuoto, muuten jos ja ja/tai
            await pg.fill(ta,'jos (uni > 9) "a" muuten jos (uni > 5 ja (sarake < 2 tai sarake > 2)) "b" muuten "c"');await pg.wait_for_timeout(150)
            r=await pg.inner_text('#kres');print(W,'3 ketju:',r);assert 'Nyt: b' in r,r
            w=await pg.inner_text('#whysec');print(W,'3 Miksi?:',w.replace('\n',' ')[:240])
            assert 'Ehto ”uni > 9” ei päde, joten jos valitsi muuten-osan' in w and 'Ehto ”uni > 5 ja (sarake < 2 tai sarake > 2)” pätee' in w,w
            # 4 jos laskun keskellä ilman sulkuja: selvä ohje; sulkujen kanssa toimii
            await pg.fill(ta,'2 * jos (uni > 7) 10 muuten 1');await pg.wait_for_timeout(150)
            r=await pg.inner_text('#kres');print(W,'4 virhe:',r);assert 'sulkuihin' in r,r
            await pg.fill(ta,'2 * (jos (uni > 7) 10 muuten 1)');await pg.wait_for_timeout(150)
            r=await pg.inner_text('#kres');assert '20' in r,r
            # 5 liitetty vanha muoto muuntuu: kenttä näyttää uuden muodon, kun siitä poistutaan
            await pg.fill(ta,'jos(ja(uni > 7; sarake = 3); "x"; "y")');await pg.wait_for_timeout(150)
            r=await pg.inner_text('#kres');assert 'Nyt: x' in r,r
            await pg.press(ta,'Enter');await pg.wait_for_timeout(200)
            v=await pg.input_value(ta);print(W,'5 vanha →',v);assert v=='jos (uni > 7 ja sarake = 3) "x" muuten "y"',v
            # 6 ehdotukset: jos ( alussa, tai arvon jälkeen
            await pg.fill(ta,'jo');await pg.focus(ta);await pg.press(ta,'End');await pg.wait_for_timeout(150)
            s=pg.locator('#ksug [data-ksug="jos ("]');assert await s.count()==1,'ehdotus jos ('
            assert await pg.locator('#ksug [data-ksug="ja "]').count()==0,'ja ei alussa'
            await pg.fill(ta,'uni > 7 ta');await pg.focus(ta);await pg.press(ta,'End');await pg.wait_for_timeout(150)
            s=pg.locator('#ksug [data-ksug="tai "]');assert await s.count()==1,'ehdotus tai'
            await s.dispatch_event('pointerdown');await pg.wait_for_timeout(150)
            v=await pg.input_value(ta);print(W,'6 ehdotus:',v);assert v=='uni > 7 tai ',v
            await pg.screenshot(path='kaava_sulut_%d.png'%W)
            # 7 versio 8 -tallennus: vanha kaava ja varattu viite avautuvat muunnettuina
            await pg.evaluate("APP.saveNow()")
            D=await pg.evaluate("""(function(){var D=JSON.parse(localStorage.getItem('appiappi.v1'));D.ver=8;var P=D.projects.filter(function(x){return x.id===APP.P.id;})[0];
              var u=Object.values(P.b).filter(function(b){return b.nm==='Uni';})[0];u.nm='Tai';u.vt='tai';
              P.b['%s'].f='jos({#'+u.id+'} > 7; "vanha"; tai({#'+u.id+'} < 1; kyllä))';return JSON.stringify(D);})()"""%I['k'])
            # sivu tallentaa poistuessaan, joten vanha tallennus kirjoitetaan ennen appin käynnistystä
            await pg.add_init_script("if(!sessionStorage.getItem('v8')){sessionStorage.setItem('v8','1');localStorage.setItem('appiappi.v1',%s);}"%json.dumps(D))
            await pg.reload();await pg.wait_for_function("window.APP&&APP.P&&APP.P.b")
            await pg.wait_for_timeout(250)
            f=await P(pg,"KK.kaavaToText(P,P.b['%s'].f)"%I['k']);print(W,'7 avattu:',f)
            assert f=='jos (tai_1 > 7) "vanha" muuten tai_1 < 1 tai kyllä',f
            assert await P(pg,"E().val('%s')"%I['k'])=='vanha'
            assert await P(pg,"B('Tai').vt")=='tai_1'
            print(W,'errs',errs);assert not errs,errs
            await ctx.close()
        await b.close()
asyncio.run(main())
