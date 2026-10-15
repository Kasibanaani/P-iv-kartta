# Appi-appi 5: ruudukko kerroksen ominaisuutena selaimessa. Kerrosrivin ▦ lisää ruudukon (40 px), ruutukoko ja tihennys
# riviltä, ruudukko näkyy muokatessa, palikka kohdistuu ruudukkoon raahatessa ja kokoa muutettaessa, ⇧ ohittaa, näkyy aina
# -valinta näyttää sen käytössä. Alueen Ruutu kerrallaan -valinta. Lukittuna napautus vie hahmon ruudun keskelle ja
# napautus alueeseen kertoo ruudun tekstiin. Kuvat appiappi5_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0];v.laite='puhelin';var vw=v.id;
 function U(k,o,x,y,w,h,nm){var b=KK.addBlock(P,k,o);b.x=x;b.y=y;if(w)b.w=w;if(h)b.h=h;if(nm)KK.setName(P,b.id,nm);return b;}
 function N(b,x,y){return KK.addNode(P,b.id,x,y);}
 var hm=U('muoto',{v:vw,laji:'ympyra',hue:1},100,100,40,40,'Hahmo');
 var la=U('muoto',{v:vw,laji:'laatikko',hue:3},200,400,60,60,'Laatta');
 var al=U('alue',{v:vw},0,500,400,200,'Lauta');
 var tx=U('nayta',{v:vw,tx:''},10,10,370,40,'Tila');
 var li=KK.addBlock(P,'liike',{o:hm.id,ohj:'napautus',vm:800});N(li,600,0);
 var mem=KK.addBlock(P,'muisti',{v:'0'});N(mem,900,300);var t=KK.addBlock(P,'tee',{do:'lisaa',o:mem.id});var tn=N(t,600,300);KK.addLink(P,N(al,300,300).id,'nap',tn.id,'e');
 tx.tx='Napautuksia {'+mem.vt+'}';
 KK.repair(P);APP.renderAll();return {hm:hm.id,la:la.id,al:al.id,li:li.id,mem:mem.id,tx:tx.id};})()"""
async def tyhja(pg):
    await pg.evaluate("(function(){APP.S.sel=null;APP.S.multi=[];APP.renderAll();})()");await pg.wait_for_timeout(100)
async def main():
    async with async_playwright() as p:
        for W in (1440,390):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Ruudukko');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP)
            if W>500:
                await tyhja(pg)
                assert await pg.locator('#uworld .rgrid').count()==0
                await pg.click('#insp [data-krg0="pohja"]');await pg.wait_for_timeout(150)
                assert await P(pg,"P.views[0].kr")==[{'id':'pohja','n':'Pohja','rk':40}]
                assert await pg.locator('#uworld .rgrid').count()==1,'ruudukko näkyy muokatessa'
                await pg.fill('#insp input[data-krg="rk"]','50');await pg.dispatch_event('#insp input[data-krg="rk"]','change');await pg.wait_for_timeout(120)
                await pg.select_option('#insp select[data-krg="rt"]','2');await pg.wait_for_timeout(120)
                kr=await P(pg,"P.views[0].kr[0]");print(W,'0 kerros:',kr);assert kr=={'id':'pohja','n':'Pohja','rk':50,'rt':2}
                bg=await pg.evaluate("document.querySelector('#uworld .rgrid').style.backgroundSize");assert '50px 50px' in bg and '25px 25px' in bg,bg
                await pg.screenshot(path='appiappi5_ruudukko_%d.png'%W)
                # Raahaus kohdistuu 25 px:n välein
                c=await keskus(pg,'.ue[data-id="%s"]'%I['la']);z=await pg.evaluate("APP.P.cam[APP.S.vw].z")
                await veda(pg,c,[c[0]+37*z,c[1]+12*z])
                xy=await P(pg,"[P.b['%s'].x,P.b['%s'].y]"%(I['la'],I['la']));print(W,'1 raahattu:',xy);assert xy==[225,400],xy
                rh=await pg.locator('.ue[data-id="%s"] .rh'%I['la']).bounding_box();await veda(pg,[rh['x']+rh['width']/2,rh['y']+rh['height']/2],[rh['x']+rh['width']/2+33*z,rh['y']+rh['height']/2+3*z])
                wh=await P(pg,"[P.b['%s'].w,P.b['%s'].h]"%(I['la'],I['la']));print(W,'  koko:',wh);assert wh==[100,75],wh
                # ⇧ ohittaa
                c=await keskus(pg,'.ue[data-id="%s"]'%I['la']);await pg.mouse.move(c[0],c[1]);await pg.mouse.down();await pg.keyboard.down('Shift');await pg.mouse.move(c[0]+4*z,c[1],steps=3);await pg.mouse.move(c[0]+7*z,c[1],steps=3);await pg.mouse.up();await pg.keyboard.up('Shift');await pg.wait_for_timeout(150)
                xy=await P(pg,"P.b['%s'].x"%I['la']);print(W,'  vapaasti:',xy);assert xy%25!=0
                # Alueen ruutu kerrallaan
                await pg.evaluate("(function(){APP.S.sel={t:'b',id:'%s'};APP.renderAll();})()"%I['al']);await pg.wait_for_timeout(120)
                await pg.select_option('#insp select[data-k="rkr"]','pohja');await pg.wait_for_timeout(120)
                assert await P(pg,"P.b['%s'].rkr"%I['al'])=='pohja'
                assert 'ruutuina' in await pg.inner_text('#insp')
                await pg.evaluate("APP.P.views[0].kr[0].rk=50;delete APP.P.views[0].kr[0].rt;APP.renderAll()")
            else:
                await pg.evaluate("(function(){APP.P.views[0].kr=[{id:'pohja',n:'Pohja',rk:50}];APP.P.b['%s'].rkr='pohja';KK.repair(APP.P);APP.renderAll();})()"%I['al'])
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            assert await pg.locator('#uworld .rgrid').count()==0,'ei näy käytössä oletuksena'
            vb=await pg.locator('#uvp').bounding_box();z=vb['width']/390
            # Napautus vie ruudun keskelle
            await pg.mouse.click(vb['x']+262*z,vb['y']+213*z);await pg.wait_for_timeout(700)
            c=await P(pg,"[E().omiNum('%s','x',0)+20,E().omiNum('%s','y',0)+20]"%(I['hm'],I['hm']));print(W,'2 hahmo ruudun keskellä:',c);assert c==[275,225],c
            # Napautus alueeseen: ruutu tekstiin
            await pg.mouse.click(vb['x']+130*z,vb['y']+560*z);await pg.wait_for_timeout(700)
            t=await pg.inner_text('.ue[data-id="%s"]'%I['tx']);r=await P(pg,"[E().val('%s','nx'),E().val('%s','ny')]"%(I['al'],I['al']));print(W,'3 napautettu:',t,r);assert r==[3,2] and 'Napautuksia 1' in t
            await pg.screenshot(path='appiappi5_kaytto_%d.png'%W)
            # Näkyy aina
            await pg.evaluate("APP.P.views[0].kr[0].rkn='aina';APP.renderAll()");await pg.wait_for_timeout(100)
            assert await pg.locator('#uworld .rgrid.use').count()==1,'näkyy käytössä'
            print(W,'errs',errs);assert not errs;await b.close()
asyncio.run(main())
