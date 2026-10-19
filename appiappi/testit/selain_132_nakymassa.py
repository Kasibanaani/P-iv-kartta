# Appi-appi 95 (Emil 19.10., jonon 38): logiikan paletin osio Näkymässä (näkymän palikat ilman esiintymää, näkymittäin,
# veto tekee esiintymän, pienennys muistetaan, tyhjänä piilossa) ja pistokkeet oletuksena osoitettaessa. 1440 ja 1280.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Nk');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            await pg.evaluate("()=>{var P=APP.P,v=P.views[0].id;[['nappi','Uni',300],['nayta','Otsikko',100],['saadin','Mieliala',200]].forEach(q=>{var b=KK.addBlock(P,q[0],{v:v,x:100,y:q[2]});KK.setName(P,b.id,q[1]);b.nmSet=true;});APP.renderAll();}")
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            t=await pg.inner_text('#nkcol');nm=await pg.evaluate("[...document.querySelectorAll('#nkcol [data-inst] .pn')].map(e=>e.textContent)")
            print(W,'1 sarake:',t.split('\n')[0],nm);assert 'Näkymässä' in t and nm==['Otsikko','Mieliala','Uni'],'järjestys ylhäältä alas'
            c=await pg.locator('#nkcol [data-inst]:has-text("Uni")').bounding_box();lv=await pg.locator('#lvp').bounding_box()
            await veda(pg,[c['x']+30,c['y']+10],[lv['x']+lv['width']*0.6,lv['y']+300]);await pg.wait_for_timeout(300)
            n=await P(pg,"P.lg.n.map(n=>P.b[n.p].nm)");nm=await pg.evaluate("[...document.querySelectorAll('#nkcol [data-inst] .pn')].map(e=>e.textContent)")
            print(W,'2 veto:',n,nm);assert n==['Uni'] and nm==['Otsikko','Mieliala']
            await pg.click('#nkcol [data-nkc]');await pg.wait_for_timeout(200)
            assert await pg.locator('#nkcol [data-inst]').count()==0 and 'kiinni' in (await pg.get_attribute('#nkcol','class'))
            await pg.reload();await pg.wait_for_function("window.APP&&APP.P");await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            print(W,'3 pienennys muistetaan:',await pg.locator('#nkcol [data-inst]').count());assert await pg.locator('#nkcol [data-inst]').count()==0
            await pg.click('#nkcol [data-nkc]');await pg.wait_for_timeout(200);assert await pg.locator('#nkcol [data-inst]').count()==2
            # toinen näkymä: otsikot näkymittäin
            await pg.evaluate("()=>{var P=APP.P;var v={id:'v2x',n:'Toinen'};P.views.push(v);var b=KK.addBlock(P,'nappi',{v:v.id,x:10,y:10});KK.setName(P,b.id,'Kahvi');b.nmSet=true;APP.renderAll();}")
            await pg.wait_for_timeout(200);hv=await pg.evaluate("[...document.querySelectorAll('#nkcol .nkv')].map(e=>e.textContent)");print(W,'4 näkymittäin:',hv);assert hv==['Näkymä 1','Toinen']
            # kaikki käytössä: sarake piiloon
            await pg.evaluate("()=>{var P=APP.P,y=0;Object.values(P.b).forEach(b=>{if(b.v&&!KK.nodesOfBlock(P,b.id).length&&b.k!=='merkki')KK.addNode(P,b.id,0,(y+=60));});APP.renderAll();}")
            await pg.wait_for_timeout(200);d=await pg.evaluate("getComputedStyle(document.querySelector('#nkcol')).display");print(W,'5 tyhjä:',d);assert d=='none'
            await pg.screenshot(path='nakymassa_%d.png'%W)
            print('errs',errs);assert not errs;await b.close()
asyncio.run(main())
