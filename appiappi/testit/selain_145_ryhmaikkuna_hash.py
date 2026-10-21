# Jonon 42d (suunnitelma 31 V8) selaimessa: ikkunan paneelin Nimi-kenttään kirjoitettu #eläimet tekee ikkunasta ryhmän ikkunan.
# Ryhmä tageista ilman yleispalikkaa saa palikan ikkunan viereen, jäsenet tulevat ikkunaan; uusi #nimi tekee tyhjän ryhmän;
# nimi ei muutu #-tekstiksi; Kumoa peruu. 1440 ja 1280.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,g=KK.jkLuo(P,'eläimet');function Y(nm,t,y){var b=KK.addBlock(P,'arvo',{yl:1});KK.addNode(P,b.id,40,y);KK.setName(P,b.id,nm);KK.ylAseta(P,b,t,'@');b.jkt=[g];return b.id;}
 var a=Y('Koira','4',60),c=Y('Kissa','6',140);var w=KK.addBlock(P,'ikkuna',{m:'sum'});var wn=KK.addNode(P,w.id,520,60);wn.w=300;wn.h=200;KK.repair(P);APP.renderAll();return [w.id,wn.id,a,c];})()"""
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Ikkuna');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            w,wn,a,c=await pg.evaluate(SETUP);await pg.wait_for_timeout(200)
            async def tila():return await P(pg,"(function(){var wb=P.b[%r],o=wb.wr&&P.b[wb.wr];return [o?o.vt:'',P.lg.n.filter(function(n){return n.g===%r&&n.wa;}).map(function(n){return n.p;}).sort(),wb.nm,APP.ev().val(%r)];})()"%(w,wn,w))
            async def nimi(t):
                await pg.evaluate("(id)=>{APP.S.sel={t:'n',id:id};APP.renderAll();}",wn);await pg.wait_for_timeout(200)
                await pg.fill('#insp input[data-k="nm"]',t);await pg.press('#insp input[data-k="nm"]','Enter');await pg.wait_for_timeout(300)
            nm0=(await tila())[2]
            await nimi('#eläimet');t=await tila();print(W,'#eläimet:',t);assert t[0]=='eläimet' and t[1]==sorted([a,c]) and t[2]==nm0 and t[3]==10,t
            n=await P(pg,"Object.values(P.b).filter(function(x){return x.yl&&x.vt==='eläimet';}).length");assert n==1,n
            await nimi('#uudet');t=await tila();print(W,'#uudet:',t);assert t[0]=='uudet' and t[1]==[] and t[2]==nm0,t
            assert await P(pg,"!!KK.jkFind(P,'uudet')")
            await pg.evaluate('document.activeElement&&document.activeElement.blur()');await pg.keyboard.press('Control+z');await pg.wait_for_timeout(300)
            t=await tila();print(W,'kumoa:',t);assert t[0]=='eläimet',t
            print(W,'virheet:',errs);assert not errs,errs
            await b.close()
asyncio.run(main())
