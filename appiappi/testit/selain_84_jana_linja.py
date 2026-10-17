# Jonon 1n (linjakkuuskartoitus 5): Janan paneeli näyttää edistymisen prosentteina ja kaavan nimen edistyminen (0–1),
# Kierroksen vaihto ei poista valmis-nuolta, kulun vaihto Aika → Arvo kertoo poistuneet nuolet (arvojanalla ei ole valmis- eikä käynnissä-kohtaa) (Kumoa palauttaa).
# Tietokone 1440 ja 1280 hiirellä, 390 savutestinä. Ei oikeaa iPhonea.
import asyncio, os
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P;
 var j=KK.addBlock(P,'jana',{}),jn=KK.addNode(P,j.id,20,40);KK.setName(P,j.id,'Jana');jn.w=420;jn.h=200;
 var m=KK.addBlock(P,'muisti',{v:'0'});KK.setName(P,m.id,'Laskuri');KK.addNode(P,m.id,620,60);
 var t=KK.addBlock(P,'tee',{do:'lisaa',o:m.id,v:'1'});KK.setName(P,t.id,'Valmiina');var tn=KK.addNode(P,t.id,620,160);
 var c=KK.addBlock(P,'kun',{});var cn=KK.addNode(P,c.id,620,260);
 KK.addLink(P,jn.id,'e',tn.id,'e');KK.addLink(P,jn.id,'r',cn.id,'c');
 P.lcam={x:0,y:0,z:1};KK.repair(P);APP.renderAll();return {j:j.id,jn:jn.id};})()"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in ((int(os.environ['VAIN']),) if os.environ.get('VAIN') else (1440,1280,390)):
            mob=W<500;H=844 if mob else 900
            ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Janat');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(200)
            def links():return pg.evaluate("APP.P.lg.l.filter(l=>l.f==='%s').map(l=>l.fp).sort()"%I['jn'])
            assert await links()==['e','r'],await links()
            await pg.evaluate("APP.S.sel={t:'n',id:'%s'};APP.renderAll()"%I['jn']);await pg.wait_for_timeout(200)
            ih=await pg.inner_text('#insp')
            assert 'jana.edistyminen (0–1)' in ih and 'osuus' not in ih,ih[-400:]
            assert '0 %' in ih,ih[:600]
            # Kierros Toista ja takaisin: valmis-nuoli jää
            for v in ('toista','edestakaisin','kerta'):
                await pg.evaluate("document.querySelector('#insp [data-seg=\"kierros\"][data-v=\"%s\"]').click()"%v);await pg.wait_for_timeout(150)
                assert await links()==['e','r'],(v,await links())
            assert 'Kierros laukeaa vain toistuvalla janalla' in await pg.inner_text('#insp')
            # ▶ ja pysäytys: prosentit paneelissa
            await pg.evaluate("document.querySelector('#insp [data-do=\"janago\"]').click()");await pg.wait_for_timeout(1100)
            await pg.evaluate("document.querySelector('#insp [data-do=\"janastop\"]').click()");await pg.wait_for_timeout(200)
            ed=await pg.evaluate("KK.Ev(APP.P).val('%s','os')"%I['j']);assert 0.05<ed<0.2,ed
            assert '%' in await pg.locator('#insp .sdnow').inner_text()
            # Kulku Arvo: käynnissä-nuoli poistuu ja ilmoitus kertoo; Kumoa palauttaa
            await pg.evaluate("document.querySelector('#insp [data-seg=\"kulku\"][data-v=\"arvo\"]').click()");await pg.wait_for_timeout(200)
            tt=await pg.inner_text('#toast');assert '2 nuolta poistui' in tt and 'Kumoa' in tt,tt
            assert await links()==[],await links()
            await pg.screenshot(path='appiappi_1n_kulku_%d.png'%W)
            await pg.evaluate("document.activeElement&&document.activeElement.blur()");await pg.keyboard.press('Control+z');await pg.wait_for_timeout(200)
            assert await links()==['e','r'],('kumoa',await links())
            print(W,'ok');print('errs',errs);await ctx.close()
        await b.close()
asyncio.run(main())
