# Jonon 1o (kartoitus 6): Tietotaulukon lähteen tyhjennys kertoo poistuneet haettu-nuolet (Kumoa palauttaa), näkymän
# välilehden vaihto lukitussa näkymässä laskee logiikan heti (KUN näkymä = "Toinen"), kuvasilmukka jatkuu, kun
# Sekuntikello alkaa käydä liikkeen pysähtyessä (KUN kello >= 1 laukeaa ilman muuta syötettä), Liikkeen Ominaisuudet-
# osiossa kiihtyminen. Tietokone 1440 ja 1280 hiirellä, 390 savutestinä. Ei oikeaa iPhonea.
import asyncio, os
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,vw=P.views[0].id;
 var t=KK.addBlock(P,'taulu',{});KK.setName(P,t.id,'Taulu');t.lp='tuonnit/a.json';var tn=KK.addNode(P,t.id,20,40);
 var m=KK.addBlock(P,'muisti',{v:'0'});KK.setName(P,m.id,'Haut');KK.addNode(P,m.id,620,40);
 var a=KK.addBlock(P,'tee',{do:'lisaa',o:m.id,v:'1'});var an=KK.addNode(P,a.id,400,40);KK.addLink(P,tn.id,'hok',an.id,'e');
 P.views.push({id:'v2',n:'Toinen'});
 var nk=KK.addBlock(P,'muisti',{v:'0'});KK.setName(P,nk.id,'Avattu');KK.addNode(P,nk.id,620,200);
 var ku=KK.addBlock(P,'kun',{}),kun=KK.addNode(P,ku.id,200,200),kf=KK.addBlock(P,'kaava',{});KK.addNode(P,kf.id,20,200);kf.f=KK.kaavaToIds(P,'näkymä = "Toinen"');
 KK.addLink(P,KK.nodesOfBlock(P,kf.id)[0].id,'v',kun.id,'c');var ta=KK.addBlock(P,'tee',{do:'lisaa',o:nk.id,v:'1'});KK.addLink(P,kun.id,'e',KK.addNode(P,ta.id,400,200).id,'e');
 var pal=KK.addBlock(P,'muoto',{v:vw});pal.x=40;pal.y=300;pal.w=40;pal.h=40;
 var li=KK.addBlock(P,'liike',{o:pal.id});li.kit=100;KK.setName(P,li.id,'Pallo');KK.addNode(P,li.id,20,360);
 var ke=KK.addBlock(P,'kello',{});KK.setName(P,ke.id,'Kello');var ken=KK.addNode(P,ke.id,400,360);
 var eh=KK.addBlock(P,'kaava',{});KK.addNode(P,eh.id,200,360);var va=KK.addBlock(P,'muisti',{v:'0'});KK.setName(P,va.id,'Valmis');KK.addNode(P,va.id,20,420);eh.f=KK.kaavaToIds(P,'ja(pallo.liikkuu = ei; valmis = 1)');KK.addLink(P,KK.nodesOfBlock(P,eh.id)[0].id,'v',ken.id,'c');
 var k2=KK.addBlock(P,'kun',{}),k2n=KK.addNode(P,k2.id,200,480),k2f=KK.addBlock(P,'kaava',{});KK.addNode(P,k2f.id,20,480);k2f.f=KK.kaavaToIds(P,'kello.kulunut >= 1');
 KK.addLink(P,KK.nodesOfBlock(P,k2f.id)[0].id,'v',k2n.id,'c');var mk=KK.addBlock(P,'muisti',{v:'0'});KK.setName(P,mk.id,'Minuutti');KK.addNode(P,mk.id,620,480);
 var tk=KK.addBlock(P,'tee',{do:'lisaa',o:mk.id,v:'1'});KK.addLink(P,k2n.id,'e',KK.addNode(P,tk.id,400,480).id,'e');
 P.lcam={x:0,y:0,z:1};KK.repair(P);KK.tick(P,{now:function(){return new Date();}});APP.renderAll();
 return {t:t.id,tn:tn.id,m:m.id,nk:nk.id,li:li.id,ke:ke.id,mk:mk.id,ln:KK.nodesOfBlock(P,li.id)[0].id,va:va.id};})()"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in ((int(os.environ['VAIN']),) if os.environ.get('VAIN') else (1440,1280,390)):
            mob=W<500;H=844 if mob else 900
            ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            assert pg.url.startswith('http://127.0.0.1'),pg.url
            await pg.fill('#wname','Korjaukset');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            def stv(id):return pg.evaluate("KK.Ev(APP.P).val('%s')"%id)
            # 1 Lähteen tyhjennys: haettu-nuoli poistuu, ilmoitus kertoo, Kumoa palauttaa
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(200)
            def links():return pg.evaluate("APP.P.lg.l.filter(l=>l.f==='%s').map(l=>l.fp)"%I['tn'])
            assert await links()==['hok'],await links()
            await pg.evaluate("APP.S.sel={t:'n',id:'%s'};APP.renderAll()"%I['tn']);await pg.wait_for_timeout(200)
            f=pg.locator('#insp [data-k="lp"]');await f.scroll_into_view_if_needed();await f.fill('');await f.press('Tab');await pg.wait_for_timeout(250)
            tt=await pg.inner_text('#toast');assert '1 nuoli poistui' in tt and 'Kumoa' in tt,tt
            assert await links()==[],await links()
            await pg.screenshot(path='appiappi_1o_lahde_%d.png'%W)
            await pg.evaluate("document.activeElement&&document.activeElement.blur()");await pg.keyboard.press('Control+z');await pg.wait_for_timeout(200)
            assert await links()==['hok'],('kumoa',await links())
            # 2 Liikkeen Ominaisuudet-osiossa kiihtyminen ja jarrutus (perusarvo paneelin kentästä)
            await pg.evaluate("APP.S.sel={t:'n',id:'%s'};APP.S.omOpen=true;APP.renderAll()"%I['ln']);await pg.wait_for_timeout(200)
            ih=await pg.inner_text('#insp');assert 'kiihtyminen' in ih and 'jarrutus' in ih and 'liukkaus' in ih,ih[-800:]
            # 3 Näkymän vaihto lukittuna laskee logiikan heti
            await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(200)
            await pg.click('#lockbtn');await pg.wait_for_timeout(250)
            assert await stv(I['nk'])==0
            await pg.click('#vtabs [data-vw="v2"]');await pg.wait_for_timeout(150)
            assert await stv(I['nk'])==1,'KUN näkymä = "Toinen" laukesi vaihdossa'
            await pg.click('#vtabs [data-vw="%s"]'%(await pg.evaluate("APP.P.views[0].id")));await pg.wait_for_timeout(150)
            # 4 Kello alkaa käydä, kun pallo pysähtyy, ja kuvasilmukka jatkuu ilman syötettä
            assert not await pg.evaluate("!!(APP.P.st['%s']&&APP.P.st['%s'].run)"%(I['ke'],I['ke'])),'kello seis: ei valmis'
            await pg.wait_for_timeout(300);assert not await pg.evaluate("!!APP.S.frRaf"),'kuvasilmukka ei käy'
            await pg.evaluate("KK.setVal(APP.P,'%s',1,{now:function(){return new Date();}});KK.setOmi(APP.P,'%s','vauhtix',400);APP.runFrames()"%(I['va'],I['li']))
            await pg.wait_for_timeout(1800)
            assert await stv(I['mk'])==1,('KUN kello >= 1 laukesi itsestään',await stv(I['mk']),await pg.evaluate("JSON.stringify(APP.P.st['%s'])"%I['ke']))
            await pg.screenshot(path='appiappi_1o_kello_%d.png'%W)
            print(W,'ok');print('errs',errs);assert not errs,errs;await ctx.close()
        await b.close()
asyncio.run(main())
