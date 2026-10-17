# Appi-appi 26 (L2): logiikkapalikoiden asetukset kaavalle (1440 ja 1280 hiirellä, 390 ja 320 kosketuksella).
# Ajastimen paneelin Ominaisuudet-osiossa näkyvät kesto (sekunteina) ja jäljellä; Satunnaisluvulla min ja max;
# näkymän teksti {muna.kesto} näyttää 180 lukittuna. Kuvat appiappi26_*.png. Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0];v.laite='puhelin';var vw=v.id;
 var aj=KK.addBlock(P,'ajastin',{kesto:3,yks:'min'});KK.setName(P,aj.id,'Muna');KK.addNode(P,aj.id,40,40);
 var sa=KK.addBlock(P,'satu',{min:2,max:9});KK.setName(P,sa.id,'Noppa');KK.addNode(P,sa.id,40,200);
 var t=KK.addBlock(P,'nayta',{v:vw,tx:'Kesto {Muna.kesto} s, noppa {Noppa.min}–{Noppa.max}'});t.x=20;t.y=20;t.w=300;t.h=40;KK.setName(P,t.id,'Rivi');
 KK.repair(P);APP.renderAll();return {aj:aj.id,sa:sa.id,t:t.id};})()"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in (1440,1280,390,320):
            mob=W<500;H=844 if mob else 900
            ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Asetukset');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            tab='#tabs [data-t="logiikka"]'
            if mob:await pg.tap(tab)
            else:await pg.click(tab)
            await pg.wait_for_timeout(200)
            for bid,want in ((I['aj'],{'muna.kesto':'180','muna.jäljellä':None}),(I['sa'],{'noppa.min':'2','noppa.max':'9'})):
                await pg.evaluate("(id)=>{APP.S.sel={t:'b',id:id};APP.S.omOpen=true;APP.renderAll();}",bid);await pg.wait_for_timeout(200)
                rows=await pg.evaluate("[...document.querySelectorAll('#omsec .omr')].map(r=>[r.querySelector('.omref').textContent,r.querySelector('.omv').textContent])")
                d=dict(rows)
                for k,v in want.items():
                    assert k in d,(W,k,list(d))
                    if v is not None:assert v in d[k],(W,k,d[k])
                await pg.screenshot(path='appiappi26_%s_%d.png'%('ajastin' if bid==I['aj'] else 'satu',W))
            await pg.evaluate("APP.S.sel=null;APP.renderAll()")
            await pg.click('#tabs [data-t="nakyma"]') if not mob else await pg.tap('#tabs [data-t="nakyma"]')
            await pg.wait_for_timeout(150)
            await pg.click('#lockbtn') if not mob else await pg.tap('#lockbtn')
            await pg.wait_for_timeout(300)
            tx=await pg.inner_text('#uels .ue[data-id="%s"]'%I['t'])
            assert 'Kesto 180 s' in tx and '2–9' in tx,(W,tx)
            print(W,'ok',tx.strip());print('errs',errs);await ctx.close()
        await b.close()
asyncio.run(main())
