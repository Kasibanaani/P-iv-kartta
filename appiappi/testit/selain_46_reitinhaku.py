# Appi-appi 7: reitinhaku selaimessa. Liikkeen paneelissa Napautus → valinta Kiertää esteet (ohje vaihtuu, kohta
# ei pääse ilmestyy). Lukittuna napautus seinän taakse → hahmo kiertää seinän eikä käy sen sisällä, rengas näyttää
# kohteen ja katoaa perillä. Leveydet 1440, 390 ja 320. Kuvat appiappi7_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0];v.laite='puhelin';var vw=v.id;
 function U(k,o,x,y,w,h,nm){var b=KK.addBlock(P,k,o);b.x=x;b.y=y;if(w)b.w=w;if(h)b.h=h;if(nm)KK.setName(P,b.id,nm);return b;}
 var hm=U('muoto',{v:vw,laji:'ympyra',hue:1},40,330,40,40,'Hahmo');
 var se=U('muoto',{v:vw,laji:'laatikko',hue:4},170,200,24,420,'Seinä');se.este=true;
 var li=KK.addBlock(P,'liike',{o:hm.id});KK.addNode(P,li.id,600,0);
 KK.repair(P);APP.renderAll();return {hm:hm.id,se:se.id,li:li.id};})()"""
async def main():
    async with async_playwright() as p:
        for W in (1440,390,320):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Reitinhaku');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP)
            if W>500:
                await pg.evaluate("(function(){APP.S.sel={t:'b',id:'%s'};APP.S.multi=[];APP.renderAll();})()"%I['li']);await pg.wait_for_timeout(120)
                assert await pg.locator('#insp input[data-k="kie"]').count()==0,'valinta vain napautukselle'
                await pg.click('#insp [data-seg="ohj"][data-v="napautus"]');await pg.wait_for_timeout(120)
                assert await pg.locator('#insp .help',has_text='jää esteen taakse').count()==1
                await pg.check('#insp input[data-k="kie"]');await pg.wait_for_timeout(150)
                assert await P(pg,"P.b['%s'].kie"%I['li'])==True
                assert await pg.locator('#insp .help',has_text='lyhimmän reitin').count()==1
                assert 'eip' in await P(pg,"KK.ports(P.b['%s']).outs.map(x=>x.p)"%I['li'])
                await pg.locator('#insp input[data-k="kie"]').scroll_into_view_if_needed()
                await pg.screenshot(path='appiappi7_paneeli_%d.png'%W)
            else:
                await pg.evaluate("(function(){var b=APP.P.b['%s'];b.ohj='napautus';b.kie=true;b.vm=400;KK.repair(APP.P);APP.renderAll();})()"%I['li'])
            await pg.evaluate("(function(){APP.P.b['%s'].vm=400;})()"%I['li'])
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            vb=await pg.locator('#uvp').bounding_box();z=vb['width']/390
            tx,ty=300,350;await pg.mouse.click(vb['x']+tx*z,vb['y']+ty*z);await pg.wait_for_timeout(60)
            assert await pg.locator('#uworld .tgtm').count()==1,'rengas'
            pts=[];shot=False
            for i in range(40):
                await pg.wait_for_timeout(60)
                q=await P(pg,"[E().omiNum('%s','x',0)+20,E().omiNum('%s','y',0)+20]"%(I['hm'],I['hm']));pts.append(q)
                if not shot and q[1]<200:await pg.screenshot(path='appiappi7_kiertaa_%d.png'%W);shot=True
            for q in pts:
                nx,ny=max(170,min(194,q[0])),max(200,min(620,q[1]))
                assert ((q[0]-nx)**2+(q[1]-ny)**2)**0.5>=19.4,'seinän sisällä %s'%q
            print(W,'kulki:',pts[0],'→ ylin',min(pts,key=lambda q:q[1]),'→',pts[-1])
            assert min(q[1] for q in pts)<200,'kiersi yläkautta'
            assert abs(pts[-1][0]-tx)<1 and abs(pts[-1][1]-ty)<1,'perillä %s'%pts[-1]
            assert await pg.locator('#uworld .tgtm').count()==0,'rengas pois perillä'
            assert await P(pg,"E().val('%s','eip')"%I['li'])==False
            print(W,'errs',errs);assert not errs;await b.close()
asyncio.run(main())
