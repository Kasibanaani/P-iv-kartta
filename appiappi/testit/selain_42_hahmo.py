# Appi-appi 3: hahmoasetukset selaimessa. Paneeli: ohjaus (Nopeus / Tatti / Napautus / Auto), tatti-valinta, kytkentäkohdat
# vaihtuvat, vauhti (kiihtyminen, jarrutus, muoto, liukkaus), hahmo (kääntyy kulkusuuntaan, kuva katsoo). Lukittuna:
# tatti → hahmo kiihtyy ja kiertyy kulkusuuntaan (sisällön rotate), napautus maailmaan → hahmo kulkee kohtaan ja rengas
# näyttää kohteen, auto tatilla → ajaa keulan suuntaan ja kääntyy. Kuvat appiappi3_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0];v.laite='puhelin';var vw=v.id;
 v.kr=[{id:'pohja',n:'Pohja'},{id:'k1',n:'Kojelauta',rv:0}];
 function U(k,o,x,y,w,h,nm){var b=KK.addBlock(P,k,o);b.x=x;b.y=y;if(w)b.w=w;if(h)b.h=h;if(nm)KK.setName(P,b.id,nm);return b;}
 var tj=U('tatti',{v:vw},115,660,160,160,'Tatti');tj.kr='k1';
 var hm=U('muoto',{v:vw,laji:'lappu',hue:1,tx:'▲'},175,300,40,40,'Hahmo');
 var li=KK.addBlock(P,'liike',{});KK.addNode(P,li.id,600,0);
 var ky=KK.addBlock(P,'kayra',{});KK.addNode(P,ky.id,300,300);KK.setName(P,ky.id,'Lähtö');
 KK.repair(P);APP.renderAll();return {tj:tj.id,hm:hm.id,li:li.id,ky:ky.id};})()"""
async def valitse(pg,id):
    await pg.evaluate("(function(){APP.S.sel={t:'b',id:'%s'};APP.S.multi=[];APP.renderAll();})()"%id);await pg.wait_for_timeout(120)
async def pos(pg,id):
    return await pg.evaluate("[parseFloat(document.querySelector('.ue[data-id=\"%s\"]').style.left),parseFloat(document.querySelector('.ue[data-id=\"%s\"]').style.top),document.querySelector('.ue[data-id=\"%s\"] .in').style.transform]"%(id,id,id))
async def tatti(pg,I,dx,dy,ms):
    tb=await pg.locator('.ue[data-id="%s"] .w-tatti'%I['tj']).bounding_box();cx,cy=tb['x']+tb['width']/2,tb['y']+tb['height']/2
    await pg.mouse.move(cx,cy);await pg.mouse.down();await pg.mouse.move(cx+tb['width']*dx,cy+tb['height']*dy,steps=4);await pg.wait_for_timeout(ms)
async def main():
    async with async_playwright() as p:
        for W in (1440,390):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Hahmo');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP)
            if W>500:
                # --- 0. Paneeli ---
                await valitse(pg,I['li'])
                await pg.select_option('#insp select[data-k="o"]',I['hm']);await pg.wait_for_timeout(100)
                await pg.click('#insp [data-seg="ohj"][data-v="tatti"]');await pg.wait_for_timeout(120)
                assert await P(pg,"KK.ports(P.b['%s']).ins.map(x=>x.p)"%I['li'])==['vm','c','e']
                await pg.select_option('#insp select[data-k="tt"]',I['tj']);await pg.wait_for_timeout(100)
                await pg.fill('#insp input[data-k="ka"]','0.6');await pg.dispatch_event('#insp input[data-k="ka"]','input')
                await pg.select_option('#insp select[data-k="km"]',I['ky']);await pg.wait_for_timeout(100)
                await pg.select_option('#insp select[data-k="km"]','hidastuu');await pg.wait_for_timeout(100)
                await pg.click('#insp [data-seg="kaanny"][data-v="kaanny"]');await pg.wait_for_timeout(120)
                assert await pg.locator('#insp [data-seg="ks"][data-v="ylos"].on').count()==1
                for seg in ('napautus','auto'):
                    await pg.click('#insp [data-seg="ohj"][data-v="%s"]'%seg);await pg.wait_for_timeout(100)
                assert await pg.locator('#insp input[data-k="kaa"]').count()==1,'auton kääntyvyys'
                await pg.click('#insp [data-seg="ohj"][data-v="tatti"]');await pg.wait_for_timeout(100)
                c=await P(pg,"(function(){var b=P.b['%s'];return [b.o,b.ohj,b.tt,String(b.ka),b.km,b.kaanny];})()"%I['li'])
                print(W,'0 paneeli:',c);assert c==[I['hm'],'tatti',I['tj'],'0.6','hidastuu','kaanny']
                await pg.screenshot(path='appiappi3_paneeli_%d.png'%W)
            else:
                await pg.evaluate("(function(){var b=APP.P.b['%s'];b.o='%s';b.ohj='tatti';b.tt='%s';b.ka='0.6';b.km='hidastuu';b.kaanny='kaanny';APP.renderAll();})()"%(I['li'],I['hm'],I['tj']))
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            # --- 1. Tatti oikealle: kiihtyy, kiertyy 90° ---
            await tatti(pg,I,0.45,0,250);n1=await P(pg,"E().val('%s','nop')"%I['li']);await pg.wait_for_timeout(700);n2=await P(pg,"E().val('%s','nop')"%I['li'])
            q=await pos(pg,I['hm']);await pg.screenshot(path='appiappi3_tatti_%d.png'%W);await pg.mouse.up();await pg.wait_for_timeout(200)
            print(W,'1 kiihtyy',round(n1),'→',round(n2),q);assert 20<n1<n2 and n2>150 and q[0]>200 and q[2]=='rotate(90deg)'
            # --- 2. Napautus kohteeseen ---
            await pg.evaluate("(function(){var b=APP.P.b['%s'];b.ohj='napautus';b.vm=500;b.ka='';APP.P.st['o:%s']={x:175,y:300};delete APP.P.st['%s'];KK.repair(APP.P);APP.renderAll();})()"%(I['li'],I['hm'],I['li']))
            vb=await pg.locator('#uvp').bounding_box();z=vb['width']/390
            tx,ty=80,560;await pg.mouse.click(vb['x']+tx*z,vb['y']+ty*z);await pg.wait_for_timeout(120)
            ring=await pg.locator('#uworld .tgtm').count();await pg.wait_for_timeout(1000)
            q=await pos(pg,I['hm']);ring2=await pg.locator('#uworld .tgtm').count()
            print(W,'2 napautus: rengas',ring,'→',ring2,'paikka',q);assert ring==1 and ring2==0 and abs(q[0]-(tx-20))<1.5 and abs(q[1]-(ty-20))<1.5
            assert q[2].startswith('rotate(') ,'kiertyi kulkusuuntaan'
            await pg.screenshot(path='appiappi3_napautus_%d.png'%W)
            # Napautus painikkeeseen ei liikuta (tatti on painike-alue)
            # --- 3. Auto tatilla ---
            await pg.evaluate("(function(){var b=APP.P.b['%s'];b.ohj='auto';b.vm=200;b.kaa=180;b.ka='';APP.P.st['o:%s']={x:175,y:400};delete APP.P.st['%s'];KK.repair(APP.P);APP.renderAll();})()"%(I['li'],I['hm'],I['li']))
            await tatti(pg,I,0,-0.45,600);q1=await pos(pg,I['hm'])
            await pg.mouse.move(*(await keskus(pg,'.ue[data-id="%s"] .w-tatti'%I['tj'])),steps=1)
            tb=await pg.locator('.ue[data-id="%s"] .w-tatti'%I['tj']).bounding_box();await pg.mouse.move(tb['x']+tb['width']*0.85,tb['y']+tb['height']*0.15,steps=3);await pg.wait_for_timeout(500)
            su=await P(pg,"E().val('%s','suu')"%I['li']);q2=await pos(pg,I['hm']);await pg.mouse.up();await pg.wait_for_timeout(200)
            print(W,'3 auto: ylös',q1[:2],'käännös suunta',su,q2);assert q1[1]<330 and abs(q1[0]-175)<1 and 30<su<170 and q2[0]>176
            print(W,'errs',errs);assert not errs;await b.close()
asyncio.run(main())
