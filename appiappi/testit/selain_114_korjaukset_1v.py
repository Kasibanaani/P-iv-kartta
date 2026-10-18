# Jonon 1v (kartoitus 11): S3 Liikkeen osio Hyppy näkyy, kun hyppää-kohtaan on nuoli ilman painovoimaa, ja kertoo, että
# painovoima puuttuu; painovoima-Alueen kanssa varoitusta ei ole. S4 toisesta projektista liitetty Alue: Tunnistaa palautuu
# (kuka tahansa) ja ilmoitus kertoo sen. Tietokone 1440 ja 1280 px, 390 px savutestinä. Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0].id;
 function U(k,o,x,y,w,h,nm){var b=KK.addBlock(P,k,o);b.x=x;b.y=y;b.w=w;b.h=h;KK.setName(P,b.id,nm);return b;}
 var h=U('muoto',{v:v,laji:'laatikko'},150,300,40,40,'Pelaaja'),n=U('nappi',{v:v,beh:'pida'},20,560,120,44,'Hyppy'),a=U('alue',{v:v},0,0,200,200,'Maali');
 h.este=true;a.kuka=h.id;var l=KK.addBlock(P,'liike',{o:h.id});KK.setName(P,l.id,'Hahmon liike');var ln=KK.addNode(P,l.id,300,0),nn=KK.addNode(P,n.id,0,0);
 KK.addLink(P,nn.id,'e',ln.id,'hyp');KK.repair(P);APP.renderAll();return {h:h.id,l:l.id,n:n.id,a:a.id};})()"""
SEL="(i)=>{APP.S.sel={t:'b',id:i};APP.S.multi=[];APP.renderAll();}"
async def main():
    async with async_playwright() as p:
        for W in (1440,1280,390):
            b,pg,errs=await avaa(p,W,900 if W>500 else 844)
            await pg.fill('#wname','Korjaukset');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(200)
            # S3: ei painovoima-Aluetta, nuoli hyppää-kohtaan → osio Hyppy auki ja varoitus
            await pg.evaluate(SEL,I['l']);await pg.wait_for_timeout(150)
            assert await pg.locator('#hysec').count()==1,'osio Hyppy näkyy ilman painovoimaa, kun hyppää-kohtaan on nuoli'
            assert await pg.evaluate("document.querySelector('#hysec').open"),'auki'
            assert 'Painovoima puuttuu' in await pg.inner_text('#hypv')
            if W>500:await pg.screenshot(path='korjaukset_1v_hyppy_%d.png'%W)
            # painovoima-Alue lisätään: osio Painovoima mukaan, varoitus pois
            await pg.evaluate("(function(){var P=APP.P,a=KK.addBlock(P,'alue',{v:P.views[0].id});a.x=0;a.y=0;a.w=400;a.h=600;a.pv=2000;KK.repair(P);APP.renderAll();})()")
            await pg.evaluate(SEL,I['l']);await pg.wait_for_timeout(150)
            assert await pg.locator('#pvsec, #hysec').count()>=1 and await pg.locator('#hypv').count()==0,'painovoimalla ei varoitusta'
            # S4: Alue kopioidaan toiseen projektiin ilman Pelaajaa → Tunnistaa tyhjenee, ilmoitus kertoo
            await pg.evaluate("(i)=>{APP.S.tab='nakyma';APP.S.sel={t:'b',id:i};APP.S.multi=[];APP.renderAll();}",I['a'])
            await pg.keyboard.press('Control+c');await pg.wait_for_timeout(100)
            assert await pg.evaluate("!!APP.S.vclip"),'kopioitu'
            await pg.evaluate("APP.S.vclip.pid='toinen'");await pg.keyboard.press('Control+v');await pg.wait_for_timeout(150)
            r=await pg.evaluate("(function(){var b=APP.P.b[APP.S.sel.id];return {k:b.k,kuka:b.kuka===undefined,t:document.querySelector('#toast').textContent};})()")
            assert r['k']=='alue' and r['kuka'] and 'Tunnistaa palautui: kuka tahansa' in r['t'],r
            assert not errs,errs
            print(W,'ok','errs',errs);await b.close()
asyncio.run(main())
