# Appi-appi 17 (F24): massa, kimmoisuus ja kitka selaimessa. Paneeli (1440, 1280): palikan Este ja osuma-alue -osioon
# Massa ja Kimmoisuus, ilman Liikettä varoitus ja ＋ Liike (tekee Liikkeen ilman ohjausta), Liikkeen Törmäykset-osio
# (kitka, esimerkki, massan tila, ei ohjausta). Käyttö (myös 390 ja 320): painike Lisää vauhtix → pallo lähtee, osuu
# toiseen palloon (törmäsi, isku), toinen lentää ja kimpoaa seinästä. Kuvat appiappi17_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0];v.laite='puhelin';var vw=v.id;
 function U(k,o,x,y,w,h,nm){var b=KK.addBlock(P,k,o);b.x=x;b.y=y;if(w)b.w=w;if(h)b.h=h;if(nm)KK.setName(P,b.id,nm);return b;}
 var p1=U('muoto',{v:vw,laji:'ympyra',hue:1},40,200,40,40,'Pallo');p1.este=true;
 var p2=U('muoto',{v:vw,laji:'ympyra',hue:3},160,200,40,40,'Kiekko');p2.este=true;p2.mas=1;p2.kim=80;
 var se=U('muoto',{v:vw,laji:'laatikko',hue:4},330,100,20,300,'Seinä');se.este=true;
 var nb=U('nappi',{v:vw,tx:'Lyö',beh:'kerta'},40,600,120,50,'Lyö');
 var l2=KK.addBlock(P,'liike',{o:p2.id});l2.kit='0';KK.addNode(P,l2.id,600,120);
 KK.repair(P);APP.renderAll();return {p1:p1.id,p2:p2.id,se:se.id,nb:nb.id,l2:l2.id};})()"""
async def main():
    async with async_playwright() as p:
        for W in (1440,1280,390,320):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Massa');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP)
            if W>500:
                await pg.evaluate("(function(){APP.S.sel={t:'b',id:'%s'};APP.S.multi=[];APP.renderAll();})()"%I['p1']);await pg.wait_for_timeout(150)
                assert await pg.locator('#insp input[data-k="mas"]').count()==1,'massa-kenttä'
                assert await pg.locator('#insp input[data-k="kim"]').count()==1,'kimmoisuus-kenttä'
                assert await pg.locator('#insp [data-do="lisaaliike"]').count()==0,'ei massaa → ei ＋ Liike'
                await pg.fill('#insp input[data-k="mas"]','1');await pg.wait_for_timeout(120)
                await pg.fill('#insp input[data-k="kim"]','80');await pg.wait_for_timeout(120)
                mk=await P(pg,"[P.b['%s'].mas,P.b['%s'].kim]"%(I['p1'],I['p1']));print(W,'mas,kim',mk);assert [str(q) for q in mk]==['1','80'],mk
                await pg.evaluate("APP.renderAll()");await pg.wait_for_timeout(100)
                assert await pg.locator('#insp .help',has_text='Ilman Liikettä palikka ei voi liikkua').count()==1
                await pg.locator('#insp [data-do="lisaaliike"]').scroll_into_view_if_needed()
                await pg.screenshot(path='appiappi17_massa_%d.png'%W)
                await pg.click('#insp [data-do="lisaaliike"]');await pg.wait_for_timeout(200)
                l1=await P(pg,"Object.values(P.b).filter(b=>b.k==='liike'&&b.o==='%s').map(b=>b.id)"%I['p1']);assert len(l1)==1,l1;I['l1']=l1[0]
                assert await P(pg,"KK.nodesOfBlock(P,'%s').length"%I['l1'])==1,'Liike logiikassa'
                await pg.evaluate("(function(){APP.S.sel={t:'b',id:'%s'};APP.S.multi=[];APP.renderAll();})()"%I['l1']);await pg.wait_for_timeout(150)
                sec=pg.locator('#insp #fyssec');assert await sec.count()==1,'Törmäykset-osio'
                assert await sec.get_attribute('open') is not None,'auki, kun kohteella on massa'
                assert await sec.locator('.help',has_text='Ei ohjausta: liikkuu vain törmäyksistä').count()==1
                assert await sec.locator('.help',has_text='on massa 1').count()==1
                assert await sec.locator('.help',has_text='300 px/s → pysähtyy 0,4 s:ssa, liukuu 60 px').count()==1,'kitka 50 esimerkki'
                await sec.locator('input[data-k="kit"]').fill('10');await pg.wait_for_timeout(120)
                assert str(await P(pg,"P.b['%s'].kit"%I['l1']))=='10'
                await pg.evaluate("APP.renderAll()");await pg.wait_for_timeout(100)
                assert await pg.locator('#insp #fyssec .help',has_text='pysähtyy 10 s:ssa').count()==1
                await pg.locator('#insp #fyssec').scroll_into_view_if_needed()
                await pg.screenshot(path='appiappi17_tormaykset_%d.png'%W)
                await pg.locator('#insp #fyssec input[data-k="kit"]').fill('0');await pg.wait_for_timeout(120)
            else:
                I['l1']=await pg.evaluate("(function(){var P=APP.P,b=P.b['%s'];b.mas=1;b.kim=80;var l=KK.addBlock(P,'liike',{o:b.id});l.kit='0';KK.addNode(P,l.id,600,0);KK.repair(P);APP.renderAll();return l.id;})()"%I['p1'])
            # Lyö-painike: Lisää Pallon Liikkeen vauhtix 400; Kiekon törmäsi laskee ja kirjaa iskun
            await pg.evaluate("""(function(){var P=APP.P,I=%s;var t=KK.addBlock(P,'tee',{do:'lisaa',o:I.l1,om:'vauhtix',v:'400'});KK.addLink(P,KK.addNode(P,I.nb,300,300).id,'e',KK.addNode(P,t.id,450,300).id,'e');
              var m=KK.addBlock(P,'muisti',{v:'0'});KK.setName(P,m.id,'Osumat');KK.addNode(P,m.id,900,120);var c=KK.addBlock(P,'tee',{do:'lisaa',o:m.id});KK.addLink(P,KK.nodesOfBlock(P,I.l2)[0].id,'tor',KK.addNode(P,c.id,800,120).id,'e');
              KK.repair(P);APP.renderAll();})()"""%json.dumps(I))
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            async def x(id):return await P(pg,"E().omiNum('%s','x',0)"%id)
            assert await x(I['p1'])==40
            await pg.click('.ue[data-id="%s"] button'%I['nb']);await pg.wait_for_timeout(200)
            u1=await P(pg,"E().omiNum('%s','vauhtix',0)"%I['l1']);assert u1>0,u1
            vmin,xmax,shot=0,0,False
            for i in range(30):
                await pg.wait_for_timeout(50);xx=await x(I['p2']);vv=await P(pg,"E().omiNum('%s','vauhtix',0)"%I['l2']);vmin=min(vmin,vv);xmax=max(xmax,xx)
                if i==8:await pg.screenshot(path='appiappi17_kaytto_%d.png'%W)
            print(W,'kiekko: suurin x',xmax,'pienin vauhti',vmin);assert xmax<=290.1,'ei seinän läpi';assert vmin<-100,'kimposi seinästä'
            a1,a2=await x(I['p1']),await x(I['p2']);v1=await P(pg,"E().omiNum('%s','vauhtix',0)"%I['l1']);v2=await P(pg,"E().omiNum('%s','vauhtix',0)"%I['l2'])
            os_=await P(pg,"E().val(Object.values(P.b).filter(b=>b.nm==='Osumat')[0].id)");isku=await P(pg,"E().omiNum('%s','isku',0)"%I['l2'])
            print(W,'pallo',a1,v1,'kiekko',a2,v2,'osumat',os_,'isku',isku)
            assert a2>160 and os_>=1 and isku>300,'kiekko sai osuman'
            print(W,'errs',errs);assert not errs;await b.close()
asyncio.run(main())
