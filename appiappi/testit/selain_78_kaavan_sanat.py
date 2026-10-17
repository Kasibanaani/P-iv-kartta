# Jonon 1l (linjakkuuskartoitus 4): kaavan sanat selaimessa (1440 ja 1280 hiirellä, 390 ja 320 kosketuksella).
# Näkymän teksti näyttää valinta-ominaisuuden näkyvällä nimellä ja päivämäärän tekstin perässä; Vertailu-palikan
# paneelissa valinta sisältää (paletissa vain merkit); kirjaushistorian ohje neuvoo nyt.päivä. Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P;var vw=P.views[0].id;
 var m=KK.addBlock(P,'muoto',{v:vw,laji:'ympyra'});m.x=20;m.y=100;m.w=60;m.h=60;KK.setName(P,m.id,'Pallo');KK.addNode(P,m.id,10,40);
 var a=KK.addBlock(P,'tulos',{});KK.setName(P,a.id,'Kuvaus');KK.addNode(P,a.id,330,60);
 var k=KK.addBlock(P,'kaava',{});k.f=KK.kaavaToIds(P,'kuvaus = "Muoto: " + pallo.muoto + ", päivä " + tänään');KK.addNode(P,k.id,130,160);
 var t=KK.addBlock(P,'nayta',{v:vw});t.tx=KK.toIds(P,'{Kuvaus}');t.x=20;t.y=20;t.w=300;t.h=40;KK.setName(P,t.id,'Teksti');KK.addNode(P,t.id,40,300);
 var v=KK.addBlock(P,'vert',{op:'eq',a:'Banaanikakku',b:'kakku'});var vn=KK.addNode(P,v.id,330,200);
 var l=KK.addBlock(P,'taulu',{nm:'Loki'});KK.histMake(l);KK.addNode(P,l.id,330,320);
 P.lcam={x:0,y:0,z:1};KK.repair(P);APP.renderAll();return {m:m.id,k:k.id,t:t.id,v:v.id,vn:vn.id,l:l.id};})()"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in (1440,1280,390,320):
            mob=W<500;H=844 if mob else 900
            ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Sanat');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            # 1 näkymän teksti: näkyvä nimi ympyrä ja päivämäärä tekstin perässä
            t=(await pg.inner_text('.ue[data-id="%s"]'%I['t'])).strip();print(W,'1 näkymä:',t)
            assert t.startswith('Muoto: ympyrä, päivä ') and t[-4:].isdigit(),t
            # 2 paletissa ei sisältää-merkkiä, logiikassa Vertailun paneeli
            assert await pg.locator('#pal .chip.sym',has_text='sisältää').count()==0,'paletissa vain merkit'
            if mob:await pg.tap('#tabs [data-t="logiikka"]')
            else:await pg.click('#tabs [data-t="logiikka"]')
            await pg.wait_for_timeout(200)
            await pg.evaluate("APP.S.sel={t:'b',id:'%s'};APP.S.multi=[];APP.renderAll()"%I['v']);await pg.wait_for_timeout(200)
            assert await P(pg,"E().val('%s')"%I['v'])==False
            s=pg.locator('#insp button[data-seg="op"][data-v="has"]');assert await s.count()==1,'valinta sisältää'
            if mob:await s.dispatch_event('click')
            else:await s.scroll_into_view_if_needed();await s.click()
            await pg.wait_for_timeout(200)
            assert await P(pg,"P.b['%s'].op"%I['v'])=='has'
            assert await P(pg,"E().val('%s')"%I['v'])==True,'Banaanikakku sisältää kakku'
            assert 'kirjainkoolla ei väliä' in await pg.inner_text('#insp')
            lab=await pg.inner_text('.ln[data-nid="%s"]'%I['vn'])
            print(W,'2 vertailu:',lab.replace('\n',' ')[:120]);assert 'sisältää' in lab,lab
            # 3 kirjaushistorian ohje: nyt.päivä
            await pg.evaluate("APP.S.sel={t:'b',id:'%s'};APP.S.multi=[];APP.renderAll()"%I['l']);await pg.wait_for_timeout(200)
            h=await pg.inner_text('#insp');assert '.päivä = nyt.päivä' in h,'ohje nyt.päivä';assert 'tänään on kalenteripäivä' in h
            await pg.screenshot(path='kaavan_sanat_%d.png'%W)
            print(W,'errs',errs);assert not errs,errs
            await ctx.close()
        await b.close()
asyncio.run(main())
