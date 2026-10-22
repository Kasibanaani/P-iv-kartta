# Jonon 42e (suunnitelma 31 V3) selaimessa: Listan paneelin *Rivit: Ryhmästä #eläimet* näyttää jäsenet riveinä, ilman
# Lisää rivi -kenttää. Käytössä rasti on jäsenen .rasti, rivin muokkaus muuttaa jäsenen tekstiä ja × poistaa ryhmästä.
# Ryhmäpalikan *Tee näkymään → Lista ryhmän jäsenistä* tekee ryhmälistan. 1440 ja 1280.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0];function Y(nm,t,y){var b=KK.addBlock(P,'arvo',{yl:1});KK.addNode(P,b.id,40,y);KK.setName(P,b.id,nm);KK.ylAseta(P,b,t,'@');KK.ylLinkit(P,b,t);KK.repair(P);return b.id;}
 var g=Y('Eläimet','',40),a=Y('Koira','Koira\\n#eläimet',120),c=Y('Kissa','Kissa\\n#eläimet',200);
 var li=KK.addBlock(P,'lista',{tx:'Eläimet',v:v.id});li.x=40;li.y=40;li.w=320;li.h=220;KK.setName(P,li.id,'Lista');KK.repair(P);APP.renderAll();return [li.id,g,a,c];})()"""
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Ryhmälista');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            lid,g,a,c=await pg.evaluate(SETUP);L='#uels .ue[data-id="%s"]'%lid
            await pg.click(L);await pg.wait_for_timeout(200)
            J=await P(pg,"KK.jkFind(P,'eläimet')")
            sel=pg.locator('#insp [data-k="ryh"]')
            if await pg.locator('#insp [data-lsl]').count():await pg.select_option('#insp [data-lsl]','j:'+J)  # 119: Lähde-valinta
            elif await pg.evaluate("()=>{var e=document.querySelector('#insp [data-k=\"ryh\"]');return e&&e.tagName==='SELECT';}"):await sel.select_option(J)
            else:await pg.click('#insp [data-k="ryh"] [data-v="%s"], #insp [data-seg="ryh"] [data-v="%s"]'%(J,J))
            await pg.wait_for_timeout(250)
            async def tila():return await pg.evaluate("(s)=>[Array.from(document.querySelectorAll(s+' .lr .lt')).map(e=>e.textContent),!!document.querySelector(s+' .ladd'),document.querySelectorAll(s+' .lr.done').length]",L)
            t=await tila();print(W,'ryhmästä:',t,await P(pg,"P.b[%r].ryh"%lid));assert t==[['Koira','Kissa'],True,0],t
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            await pg.click(L+' [data-row="%s"] .box'%c);await pg.wait_for_timeout(200)
            r=await P(pg,"[!!(P.st['o:'+%r]&&P.st['o:'+%r].rasti===true),APP.ev().prop(%r,'rasti'),APP.ev().val(%r)]"%(c,c,c,lid));print(W,'rasti:',r);assert r==[True,True,1],r
            await pg.click(L+' [data-row="%s"] .lt'%a);await pg.keyboard.press('End');await pg.keyboard.type(' Rekku');await pg.keyboard.press('Enter');await pg.wait_for_timeout(250)
            r=await P(pg,"[APP.ev().val(%r),P.b[%r].nm]"%(a,a));print(W,'muokkaus:',r);assert r[0]=='Koira Rekku',r
            await pg.click(L+' [data-row="%s"] .x'%c);await pg.wait_for_timeout(250)
            t=await tila();print(W,'poisto:',t);assert t[0]==['Koira Rekku'],t
            await pg.fill(L+' .ladd','Hevonen');await pg.press(L+' .ladd','Enter');await pg.wait_for_timeout(250)
            t=await tila();r=await P(pg,"[KK.jkRivit(P,%r).map(function(q){return q.tx;}),APP.ev().val(%r)]"%(J,g));print(W,'rivijäsen:',t,r);assert t[0]==['Koira Rekku','Hevonen'] and r==[['Hevonen'],2],(t,r)
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            await pg.click(L);await pg.wait_for_timeout(200);await pg.click('#insp [data-tpk]');await pg.wait_for_timeout(300)
            r=await P(pg,"[KK.jkRivit(P,%r).length,Object.values(P.b).filter(function(x){return x.yl&&x.jkt&&x.jkt.indexOf(%r)>=0&&APP.ev().val(x.id)==='Hevonen';}).length,document.querySelectorAll('%s .lr').length]"%(J,J,L))
            print(W,'tee palikaksi:',r);assert r==[0,1,2],r
            # Tee näkymään → Lista ryhmän jäsenistä
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            await pg.evaluate("(id)=>{APP.S.sel={t:'n',id:KK.nodesOfBlock(APP.P,id)[0].id};APP.renderAll();}",g);await pg.wait_for_timeout(200)
            n0=await P(pg,"Object.values(P.b).filter(function(x){return x.k==='lista';}).length")
            await pg.click('#insp [data-tnvm]');await pg.wait_for_timeout(200);await pg.click('#menu button:has-text("Lista ryhmän jäsenistä")');await pg.wait_for_timeout(300)
            r=await P(pg,"Object.values(P.b).filter(function(x){return x.k==='lista'&&x.ryh;}).length");print(W,'tee listaksi:',n0,r);assert r==2,r
            print(W,'virheet:',errs);assert not errs,errs
            await b.close()
asyncio.run(main())
