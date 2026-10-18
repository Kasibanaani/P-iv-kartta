# Jonon 17 (F35 vaihe B): Liikkeen osio Hyppy (auki, kun hyppää-kohtaan tulee nuoli), korkeus ja ponnistusteksti, lyhyt
# hyppy -valinta, lukittuna Painike (Pohjassa vain painettaessa) hypyttää hahmoa ja hahmo laskeutuu, tallennus säilyy.
# Tietokone 1440 ja 1280 px, 390 px savutestinä. Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0].id;
 function U(k,o,x,y,w,h,nm){var b=KK.addBlock(P,k,o);b.x=x;b.y=y;b.w=w;b.h=h;KK.setName(P,b.id,nm);return b;}
 var a=U('alue',{v:v},0,0,360,600,'Maailma'),f=U('muoto',{v:v,laji:'laatikko'},0,500,360,40,'Lattia'),h=U('muoto',{v:v,laji:'laatikko'},150,420,40,40,'Pelaaja'),
   n=U('nappi',{v:v,beh:'pida'},20,560,120,44,'Hyppy');
 a.pv=2000;f.este=true;h.este=true;var l=KK.addBlock(P,'liike',{o:h.id});KK.setName(P,l.id,'Hahmon liike');var ln=KK.addNode(P,l.id,300,0),nn=KK.addNode(P,n.id,0,0);
 KK.repair(P);APP.renderAll();return {a:a.id,f:f.id,h:h.id,l:l.id,n:n.id,ln:ln.id,nn:nn.id};})()"""
SEL="(i)=>{APP.S.sel={t:'b',id:i};APP.S.multi=[];APP.renderAll();}"
async def main():
    async with async_playwright() as p:
        for W in (1440,1280,390):
            b,pg,errs=await avaa(p,W,900 if W>500 else 844)
            await pg.fill('#wname','Hyppy');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(200)
            if W>500:
                # 1 Osio Hyppy suljettuna, kun nuolta ei ole; kohdat hyppää ja lopeta hyppy logiikassa
                await pg.evaluate(SEL,I['l']);await pg.wait_for_timeout(150)
                assert await pg.locator('#hysec').count()==1,'Liikkeellä osio Hyppy'
                assert not await pg.evaluate("document.querySelector('#hysec').open"),'suljettu ilman nuolta'
                ins=await pg.evaluate("(i)=>KK.ports(APP.P.b[i]).ins.map(function(o){return o.n;})",I['l'])
                assert 'hyppää' in ins and 'lopeta hyppy' in ins,ins
                await pg.evaluate("(I)=>{KK.addLink(APP.P,I.nn,'e',I.ln,'hyp');KK.addLink(APP.P,I.nn,'irti',I.ln,'hyx');KK.repair(APP.P);APP.renderAll();}",I)
                await pg.evaluate(SEL,I['l']);await pg.wait_for_timeout(150)
                assert await pg.evaluate("document.querySelector('#hysec').open"),'auki, kun hyppää-kohtaan tulee nuoli'
                txt=await pg.inner_text('#hysec')
                assert 'ponnistus 693 px/s, ilmassa 0,69 s' in txt and 'hyppyjä jäljellä' in txt,txt
                await pg.fill('#insp input[data-k="hyk"]','160');await pg.wait_for_timeout(200)
                assert await P(pg,"P.b['%s'].hyk"%I['l'])==160
                await pg.evaluate("document.activeElement&&document.activeElement.blur()");await pg.evaluate(SEL,I['l']);await pg.wait_for_timeout(150)
                assert 'ponnistus 800 px/s, ilmassa 0,8 s' in await pg.inner_text('#hysec')
                await pg.uncheck('#hysec input[data-k="hyl_on"]');await pg.wait_for_timeout(150)
                assert await P(pg,"P.b['%s'].hylp"%I['l']) is True
                await pg.check('#hysec input[data-k="hyl_on"]');await pg.wait_for_timeout(150)
                assert await P(pg,"P.b['%s'].hylp===undefined"%I['l'])
                await pg.fill('#insp input[data-k="ilo"]','60');await pg.wait_for_timeout(150)
                await pg.screenshot(path='hyppy_paneeli_%d.png'%W)
            else:
                await pg.evaluate("(I)=>{KK.addLink(APP.P,I.nn,'e',I.ln,'hyp');KK.addLink(APP.P,I.nn,'irti',I.ln,'hyx');APP.P.b[I.l].hyk=160;KK.repair(APP.P);APP.renderAll();}",I)
            # 2 Lukittuna: painike pohjassa → hyppy noin 160 px, irti → laskeutuu takaisin
            await pg.click('#lockbtn');await pg.wait_for_timeout(600)
            y0=await pg.evaluate("(I)=>KK.Ev(APP.P,APP.ctx()).omiNum(I.h,'y',0)",I)
            assert abs(y0-460)<0.01,y0
            bb=await pg.locator('.ue[data-id="%s"]'%I['n']).bounding_box()
            await pg.mouse.move(bb['x']+bb['width']/2,bb['y']+bb['height']/2);await pg.mouse.down()
            ys=[]
            for i in range(25):
                await pg.wait_for_timeout(30);ys.append(await pg.evaluate("(I)=>KK.Ev(APP.P,APP.ctx()).omiNum(I.h,'y',0)",I))
            await pg.mouse.up();await pg.wait_for_timeout(1200)
            st=await pg.evaluate("(I)=>{var E=KK.Ev(APP.P,APP.ctx());return [E.omiNum(I.h,'y',0),E.val(I.l,'maa')];}",I)
            assert 460-min(ys)>140 and 460-min(ys)<165,('hyppy noin 160 px',min(ys))
            assert abs(st[0]-460)<0.01 and st[1] is True,st
            await pg.screenshot(path='hyppy_lukittu_%d.png'%W)
            if W<500:
                print(W,'ok (savutesti)','errs',errs);await b.close();continue
            await pg.click('#lockbtn');await pg.wait_for_timeout(200)
            # 3 Tallennus säilyy
            await pg.evaluate("APP.saveNow()");await pg.reload();await pg.wait_for_timeout(400)
            assert await P(pg,"P.b['%s'].hyk"%I['l'])==160 and await P(pg,"P.b['%s'].ilo"%I['l'])==60
            print(W,'ok','errs',errs);await b.close()
asyncio.run(main())
