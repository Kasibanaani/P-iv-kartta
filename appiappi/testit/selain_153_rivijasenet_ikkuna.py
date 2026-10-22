# Jono 42e3 selaimessa: ryhmän ikkunassa käytössä lisätyt rivijäsenet näkyvät riveinä (rasti ☑/☐) ja ikkunan summa laskee ne;
# Palauta poistaa rivit. 1440 ja 1280.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P;function Y(nm,t,y){var b=KK.addBlock(P,'arvo',{yl:1});KK.addNode(P,b.id,40,y);KK.setName(P,b.id,nm);KK.ylAseta(P,b,t,'@');KK.ylLinkit(P,b,t);KK.repair(P);return b;}
 var g=Y('Luvut','',40),a=Y('A','4\\n#luvut',120);var J=KK.ylOma(P,g);P.st['jkr:'+J]=[{id:'q1',tx:'10'},{id:'q2',tx:'Soita',c:true}];
 var w=KK.addBlock(P,'ikkuna',{m:'sum'});var wn=KK.addNode(P,w.id,400,40);wn.w=320;wn.h=260;w.wr=g.id;KK.repair(P);KK.wrSync(P,w,wn);KK.repair(P);KK.tick(P,{});APP.renderAll();return [w.id,wn.id];})()"""
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Rivijäsenet');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            wid,wnid=await pg.evaluate(SETUP);await pg.wait_for_timeout(250)
            r=await pg.evaluate("(n)=>{var w=document.querySelector('.lw[data-nid=\"'+n+'\"]');var rs=w?Array.from(w.querySelectorAll('.wrjr')).map(e=>e.textContent):null;var j=w&&w.querySelector('.wrj');var wr=w&&w.getBoundingClientRect(),jr=j&&j.getBoundingClientRect();return [rs,jr?jr.bottom<=wr.bottom+1&&jr.top>=wr.top:false];}",wnid)
            v=await P(pg,"APP.ev().val(%r)"%wid);print(W,'ikkuna:',r,v)
            assert r[0]==['☐ 10','☑ Soita'] and r[1],r
            assert v==14,v
            await pg.evaluate("()=>{APP.P.st={};KK.tick(APP.P,{});APP.renderAll();}");await pg.wait_for_timeout(200)
            n=await pg.evaluate("(n)=>document.querySelectorAll('.lw[data-nid=\"'+n+'\"] .wrjr').length",wnid);print(W,'palauta:',n);assert n==0,n
            print(W,'virheet:',errs);assert not errs,errs
            await b.close()
asyncio.run(main())
