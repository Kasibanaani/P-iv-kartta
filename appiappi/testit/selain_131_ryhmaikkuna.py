# Jonon 37c (F45, suunnitelma 29 kohta 5): ryhmän ikkuna. Ikkunan valikosta tai otsikkoon kirjoittamalla @eläin: jokainen
# eläimen jäsen näkyy ikkunassa rinnakkaisena esiintymänä (uusi jäsen tulee, poistettu katoaa) ja ikkuna laskee niistä
# (SUMMA). Esiintymän poisto ikkunasta irrottaa jäsenen ryhmästä, palikka säilyy. Tietokone 1440 ja 1280.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
async def wa(pg,wid):
    return await P(pg,"P.lg.n.filter(n=>n.g===%r&&n.wa).map(n=>P.b[n.p].nm).sort()"%wid)
async def valikko(pg,wid,teksti):
    await pg.click('#lworld .lw[data-nid="%s"] [data-wmb]'%wid);await pg.wait_for_timeout(120)
    await pg.locator('#menu button',has_text=teksti).first.click();await pg.wait_for_timeout(200)
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Ryhmäikkuna');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            await pg.evaluate("""(function(){var P=APP.P;function yl(nm,t,x,y){var b=KK.addBlock(P,'arvo',{yl:1});KK.addNode(P,b.id,x,y);KK.setName(P,b.id,nm);KK.ylAseta(P,b,t,'@');KK.ylLinkit(P,b,t);return b;}
              yl('Eläin','',40,40);yl('Koira','4\\n#eläin',40,120);yl('Kissa','6\\n#eläin',40,200);KK.repair(P);APP.renderAll();})()""")
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            r=await pg.evaluate("()=>{var e=document.querySelector('#lvp').getBoundingClientRect();return [e.left+e.width*0.6,e.top+e.height*0.3];}")
            await veda(pg,await keskus(pg,'#pal .chip[data-make*="ikkuna"][data-make*="yl"]'),r)
            wid=await P(pg,"P.lg.n.filter(n=>P.b[n.p].k==='ikkuna')[0].id")
            # 1 valikosta @eläin
            await valikko(pg,wid,'@eläin (2)');m=await wa(pg,wid)
            gr=await pg.inner_text('#lworld .lw[data-nid="%s"] [data-wgr]'%wid);print(W,'1 ryhmän ikkuna:',m,gr);assert m==['Kissa','Koira'] and gr=='@eläin'
            await valikko(pg,wid,'SUMMA');v=await P(pg,"E().val(KK.nodeOf(P,%r).p)"%wid);print(W,'2 summa:',v);assert v==10,v
            # 3 uusi jäsen tulee itsestään
            await pg.evaluate("(function(){var P=APP.P;var b=KK.addBlock(P,'arvo',{yl:1});KK.addNode(P,b.id,40,280);KK.setName(P,b.id,'Kilpikonna');KK.ylAseta(P,b,'1\\n#eläin','@');KK.ylLinkit(P,b,'1\\n#eläin');KK.repair(P);KK.tick(P,APP.ctx());APP.renderAll();})()")
            m=await wa(pg,wid);v=await P(pg,"E().val(KK.nodeOf(P,%r).p)"%wid);print(W,'3 uusi jäsen:',m,v);assert m==['Kilpikonna','Kissa','Koira'] and v==11
            # 4 esiintymän poisto irrottaa ryhmästä, palikka säilyy
            kid=await P(pg,"P.lg.n.filter(n=>n.g===%r&&n.wa&&P.b[n.p].nm==='Kissa')[0].id"%wid)
            await pg.click('#lworld .ln[data-nid="%s"]'%kid);await pg.keyboard.press('Delete');await pg.wait_for_timeout(200)
            if await pg.locator('#delask button').count():await pg.locator('#delask button').first.click();await pg.wait_for_timeout(150)
            t=[await wa(pg,wid),await P(pg,"KK.ylTeksti(P,B('Eläin'),'@')"),await P(pg,"!!B('Kissa')&&KK.nodesOfBlock(P,B('Kissa').id).length")]
            print(W,'4 poisto:',t);assert t[0]==['Kilpikonna','Koira'] and t[1]=='@koira @kilpikonna' and t[2]==1,t
            # 5 Ei ryhmää, sitten kirjoitus otsikkoon
            await valikko(pg,wid,'Ei ryhmää');m=await wa(pg,wid);assert m==[] and await P(pg,"P.lg.n.filter(n=>n.g===%r).length"%wid)==0,m
            await valikko(pg,wid,'Kirjoita ryhmä');await pg.fill('#lworld [data-wgri]','@eläin');await pg.keyboard.press('Enter');await pg.wait_for_timeout(250)
            m=await wa(pg,wid);print(W,'5 kirjoitettu:',m);assert m==['Kilpikonna','Koira'],m
            await pg.click('.zoomc [data-z="fit"]');await pg.wait_for_timeout(300);await pg.screenshot(path='ryhmaikkuna_%d.png'%W)
            # 6 lataus
            await pg.reload();await pg.wait_for_function("window.APP&&APP.P");await pg.wait_for_timeout(300)
            m=await wa(pg,wid);print(W,'6 lataus:',m);assert m==['Kilpikonna','Koira'],m
            print(W,'virheet:',errs);assert not errs,errs
            await b.close()
asyncio.run(main())
