# Jonon 42f (suunnitelma 31 V6) selaimessa: yleispalikan = @muistutus.kello näkyy kellonaikana (14.00) ja .päivä päivänä;
# kirjoitettaessa @muistutus. ehdottaa päivä, kello, luku ja sanoja. Tietokone 1440 ja 1280.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P;function Y(nm,t,y){var b=KK.addBlock(P,'arvo',{yl:1});KK.addNode(P,b.id,60,y);KK.setName(P,b.id,nm);KK.ylAseta(P,b,t,'@');return b.id;}
 var m=Y('Muistutus','Hammaslääkäri 24.10. klo 14',60),k=Y('Kellolta','= @muistutus.kello',160),p=Y('Päivältä','= @muistutus.päivä',260);KK.repair(P);APP.renderAll();return [m,k,p];})()"""
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Tekstin osat');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            m,k,pv=await pg.evaluate(SETUP);await pg.wait_for_timeout(250)
            tx=await pg.evaluate("(ids)=>ids.map(function(id){var n=KK.nodesOfBlock(APP.P,id)[0];var e=document.querySelector('#lworld .ln[data-nid=\"'+n.id+'\"]');return e?e.innerText:'';})",[k,pv])
            print(W,'näyttö:',tx);assert '14.00' in tx[0] and '24.10' in tx[1],tx
            n=await P(pg,"KK.nodesOfBlock(P,%r)[0].id"%k);c=await keskus(pg,'#lworld .ln[data-nid="%s"]'%n);await pg.mouse.dblclick(c[0],c[1]);await pg.wait_for_timeout(200)
            await pg.fill('#yedit textarea','= @muistutus.');await pg.press('#yedit textarea','End');await pg.keyboard.type('s');await pg.wait_for_timeout(250)
            sug=await pg.evaluate("()=>document.body.innerText");print(W,'ehdotus sanoja:', 'sanoja' in sug);assert 'sanoja' in sug
            print(W,'virheet:',errs);assert not errs,errs
            await b.close()
asyncio.run(main())
