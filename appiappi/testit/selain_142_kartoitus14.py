# Jonon 1y (kartoitus 14 S3) selaimessa: Laattakartan paneelissa lajin nimen vaihto päivittää kaavan polun .määrä.<laji> ja
# tapahtuma.laji-vertailun tekstin, ilmoitus kertoo määrän, Kumoa palauttaa nimen ja kaavat yhdellä painalluksella. 1440 ja 1280.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P;var b=KK.addBlock(P,'laatat',{v:P.views[0].id});b.x=40;b.y=40;b.rk=32;b.lh2=1;b.lw=3;b.lrt=['kk#'];
 b.lj=[{c:'#',n:'Seinä',t:'kiintea',hue:0},{c:'k',n:'Kolikko',t:'lapi',hue:3,il:true}];KK.setName(P,b.id,'Kartta');
 function Y(t){var y=KK.addBlock(P,'arvo',{yl:1});KK.addNode(P,y.id,300,Math.random()*400);KK.ylAseta(P,y,t,'@');return y.id;}
 var m=Y('= @kartta.määrä.kolikko'),s=Y('= tapahtuma.laji = "Kolikko"');KK.repair(P);APP.renderAll();return [b.id,m,s];})()"""
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Laatat');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            kid,m,s=await pg.evaluate(SETUP)
            async def tila():return await P(pg,"[P.b[%r].f,P.b[%r].f,P.b[%r].lj[1].n,APP.ev().val(%r)]"%(m,s,kid,m))
            await pg.click('#uels .ue[data-id="%s"]'%kid);await pg.wait_for_timeout(200)
            await pg.fill('#insp input[data-ltj="1|n"]','Raha');await pg.press('#insp input[data-ltj="1|n"]','Enter');await pg.wait_for_timeout(250)
            t=await tila();toast=await pg.evaluate("()=>document.body.innerText.indexOf('Lajin nimi vaihtui myös 2 kaavassa')>=0")
            print(W,'nimi:',t,toast);assert t[0].endswith('.määrä.raha') and '"Raha"' in t[1] and t[2]=='Raha' and t[3]==2 and toast,t
            await pg.evaluate('document.activeElement.blur()');await pg.keyboard.press('Control+z');await pg.wait_for_timeout(250)
            t=await tila();print(W,'kumoa:',t);assert t[0].endswith('.määrä.kolikko') and '"Kolikko"' in t[1] and t[2]=='Kolikko' and t[3]==2,t
            print(W,'virheet:',errs);assert not errs,errs
            await b.close()
asyncio.run(main())
