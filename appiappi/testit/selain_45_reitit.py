# Appi-appi 6: reitit selaimessa. Reitti paletista, ✎ Piirrä uudelleen → napautukset kanvaasille lisäävät pisteet
# (kohdistus 10 px), Valmis lopettaa, pisteen veto siirtää, kaksoisnapautus poistaa. Liikkeen ohjaus Reitti paneelista.
# Lukittuna hahmo kulkee reittiä, reitti ei näy (paitsi Katkoviivana-valinnalla), Pysäytä-painike pysäyttää ja Käynnistä
# jatkaa. Kuvat appiappi6_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0];v.laite='puhelin';var vw=v.id;
 function U(k,o,x,y,w,h,nm){var b=KK.addBlock(P,k,o);b.x=x;b.y=y;if(w)b.w=w;if(h)b.h=h;if(nm)KK.setName(P,b.id,nm);return b;}
 function N(b,x,y){return KK.addNode(P,b.id,x,y);}
 var hm=U('muoto',{v:vw,laji:'ympyra',hue:2},300,700,30,30,'Vartija');
 var st=U('nappi',{v:vw,tx:'Seis',beh:'kerta'},20,780,100,44,'Seis'),go=U('nappi',{v:vw,tx:'Jatka',beh:'kerta'},140,780,100,44,'Jatka');
 var li=KK.addBlock(P,'liike',{o:hm.id,vm:120});var ln=N(li,600,0);KK.addLink(P,N(st,300,0).id,'e',ln.id,'go');
 KK.repair(P);APP.renderAll();return {hm:hm.id,st:st.id,go:go.id,li:li.id};})()"""
async def main():
    async with async_playwright() as p:
        for W in (1440,390):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Reitit');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP)
            if W>500:
                vb=await pg.locator('#uvp').bounding_box();z=await pg.evaluate("APP.P.cam[APP.S.vw].z");cam=await pg.evaluate("[APP.P.cam[APP.S.vw].x,APP.P.cam[APP.S.vw].y]")
                def S(x,y):return [vb['x']+cam[0]+x*z,vb['y']+cam[1]+y*z]
                await paletti(pg,'Reitti',*S(200,500));await pg.wait_for_timeout(150)
                rid=await P(pg,"APP.S.sel.id");assert await P(pg,"P.b['%s'].k"%rid)=='reitti'
                await pg.click('#insp [data-do="reittiuusi"]');await pg.wait_for_timeout(120)
                assert await pg.locator('#uhint',has_text='reitin pisteet').count()==1
                for x,y in ((52,202),(298,198),(301,451)):
                    await pg.mouse.click(*S(x,y));await pg.wait_for_timeout(80)
                r=await P(pg,"(function(){var b=P.b['%s'];return [b.x,b.y,b.pts,b.w,b.h];})()"%rid);print(W,'0 piirretty:',r)
                assert r==[50,200,[[0,0],[250,0],[250,250]],250,250],r
                await pg.click('#uhint [data-rtdone]');await pg.wait_for_timeout(100);assert await pg.locator('#uhint').count()==0
                await pg.screenshot(path='appiappi6_piirto_%d.png'%W)
                # Pisteen veto ja poisto
                h=await pg.locator('.ue[data-id="%s"] .rpt[data-i="1"]'%rid).bounding_box();await veda(pg,[h['x']+h['width']/2,h['y']+h['height']/2],S(300,150))
                pt=await P(pg,"[P.b['%s'].pts[1],P.b['%s'].y]"%(rid,rid));print(W,'  veto:',pt);assert pt==[[250,0],150],pt
                await pg.click('#insp [data-do="reittijatka"]');await pg.mouse.click(*S(50,450));await pg.click('#uhint [data-rtdone]');await pg.wait_for_timeout(80)
                assert await P(pg,"P.b['%s'].pts.length"%rid)==4
                h=await pg.locator('.ue[data-id="%s"] .rpt[data-i="3"]'%rid).bounding_box();await pg.mouse.dblclick(h['x']+h['width']/2,h['y']+h['height']/2);await pg.wait_for_timeout(120)
                assert await P(pg,"P.b['%s'].pts.length"%rid)==3,'kaksoisnapautus poisti'
                # Liike paneelista
                await pg.evaluate("(function(){APP.S.sel={t:'b',id:'%s'};APP.renderAll();})()"%I['li']);await pg.wait_for_timeout(100)
                await pg.click('#insp [data-seg="ohj"][data-v="reitti"]');await pg.wait_for_timeout(100)
                await pg.select_option('#insp select[data-k="rt"]',rid);await pg.wait_for_timeout(100)
                await pg.click('#insp [data-seg="rtt"][data-v="edestakaisin"]');await pg.wait_for_timeout(100)
                assert await P(pg,"[P.b['%s'].ohj,P.b['%s'].rt,P.b['%s'].rtt]"%(I['li'],I['li'],I['li']))==['reitti',rid,'edestakaisin']
                assert 'Kulkijat' in await P(pg,"KK.why(P,E(),'%s',1).txt"%rid)
            else:
                rid=await pg.evaluate("(function(){var P=APP.P,r=KK.addBlock(P,'reitti',{v:P.views[0].id});r.x=50;r.y=150;r.pts=[[0,50],[250,0],[250,300]];r.w=250;r.h=300;var l=P.b['%s'];l.ohj='reitti';l.rt=r.id;l.rtt='edestakaisin';KK.repair(P);APP.renderAll();return r.id;})()"%I['li'])
            # Stop-nappi: kytketään pysäytä-tapahtumaan, jatka käynnistä-tapahtumaan
            await pg.evaluate("(function(){var P=APP.P;P.lg.l=P.lg.l.filter(function(l){return !(l.tp==='go');});var ln=KK.nodesOfBlock(P,'%s')[0];KK.addLink(P,KK.addNode(P,'%s',300,100).id,'e',ln.id,'stop');KK.addLink(P,KK.addNode(P,'%s',300,200).id,'e',ln.id,'go');KK.repair(P);APP.renderAll();})()"%(I['li'],I['st'],I['go']))
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            assert await pg.locator('.ue[data-id="%s"] svg'%rid).count()==0,'reitti ei näy käytössä'
            c0=await P(pg,"[E().omiNum('%s','x',0)+15,E().omiNum('%s','y',0)+15]"%(I['hm'],I['hm']))
            await pg.wait_for_timeout(800)
            c1=await P(pg,"[E().omiNum('%s','x',0)+15,E().omiNum('%s','y',0)+15]"%(I['hm'],I['hm']));print(W,'1 kulkee:',c0,'→',c1)
            assert 45<c0[0]<110 and c1[0]>c0[0]+60,'kulkee reitin alusta oikealle'
            await pg.screenshot(path='appiappi6_kulkee_%d.png'%W)
            await pg.click('.ue[data-id="%s"] button'%I['st']);await pg.wait_for_timeout(200);a=await P(pg,"E().omiNum('%s','x',0)"%I['hm']);await pg.wait_for_timeout(400)
            assert await P(pg,"E().omiNum('%s','x',0)"%I['hm'])==a,'pysähtyi'
            await pg.click('.ue[data-id="%s"] button'%I['go']);await pg.wait_for_timeout(400);assert await P(pg,"E().omiNum('%s','x',0)"%I['hm'])!=a,'jatkoi'
            await pg.evaluate("APP.P.b['%s'].nak='nakyy';APP.renderAll()"%rid);await pg.wait_for_timeout(100)
            assert await pg.locator('.ue[data-id="%s"] svg .rl.u'%rid).count()==1,'katkoviivana käytössä'
            print(W,'errs',errs);assert not errs;await b.close()
asyncio.run(main())
