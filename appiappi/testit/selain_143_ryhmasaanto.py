# Jonon 42c (suunnitelma 31 V7) selaimessa: ryhmäpalikkaan kirjoitettu rivi kuuluu, kun jäsen sisältää "koira" tekee
# koira-teksteistä jäseniä, ryhmän ikkunaan tulee toisinto ⚡-merkillä (wrsk), rivi säilyy muokattaessa, Kumoa peruu. 1440 ja 1280.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P;function Y(nm,t,x,y){var b=KK.addBlock(P,'arvo',{yl:1});KK.addNode(P,b.id,x,y);KK.setName(P,b.id,nm);KK.ylAseta(P,b,t,'@');return b;}
 var a=Y('Musta','Musta koira',60,60),k=Y('Kissa','Kissa',60,140),g=Y('Koirat','',60,240);
 var w=KK.addBlock(P,'ikkuna',{m:'sum'});var wn=KK.addNode(P,w.id,420,40);wn.w=300;wn.h=200;w.wr=g.id;KK.repair(P);APP.renderAll();return [a.id,g.id,wn.id];})()"""
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Ryhmä');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            a,g,wn=await pg.evaluate(SETUP);await pg.wait_for_timeout(200)
            gn=await P(pg,"KK.nodesOfBlock(P,%r)[0].id"%g)
            c=await keskus(pg,'#lworld .ln[data-nid="%s"]'%gn);await pg.mouse.dblclick(c[0],c[1]);await pg.wait_for_timeout(200)
            await pg.fill('#yedit textarea','kuuluu, kun jäsen sisältää "koira"');await pg.keyboard.press('Enter');await pg.wait_for_timeout(300)
            async def tila():return await P(pg,"(function(){var J=KK.ylOma(P,P.b[%r]);var js=J?APP.ev().jkJasenet(J):[];return [!!P.b[%r].jku,P.b[%r].yer||'',js,document.querySelectorAll('#lworld .ln.wrsk').length];})()"%(g,g,g))
            t=await tila();print(W,'sääntö:',t);assert t[0] and t[1]=='' and t[2]==[a] and t[3]==1,t
            c=await keskus(pg,'#lworld .ln[data-nid="%s"]'%gn);await pg.mouse.dblclick(c[0],c[1]);await pg.wait_for_timeout(200)
            v=await pg.input_value('#yedit textarea');print(W,'muokkaus:',repr(v));assert 'kuuluu, kun jäsen sisältää "koira"' in v
            await pg.keyboard.press('Escape');await pg.wait_for_timeout(150);await pg.evaluate('document.activeElement&&document.activeElement.blur()')
            await pg.keyboard.press('Control+z');await pg.wait_for_timeout(300)
            t=await tila();print(W,'kumoa:',t);assert not t[0] and t[3]==0,t
            print(W,'virheet:',errs);assert not errs,errs
            await b.close()
asyncio.run(main())
