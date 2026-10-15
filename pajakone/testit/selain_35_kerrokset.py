# Pajakone 3b: kerrokset puhelinnäkymässä. Paneeli (napauta tyhjää): Pohja, ＋ Uusi kerros (tulee aktiiviseksi), nimeäminen,
# rullausvauhti, järjestys ↑↓, uudet palikat aktiiviseen kerrokseen, piirtojärjestys kerroksittain, 👁 piilottaa muokatessa,
# 🔒 estää tarttumisen, ⬚ valitsee kerroksen palikat, palikan Kerros-valinta ja Kerroksen mukaan -vauhti, lukitussa käytössä
# kaikki näkyvät ja kerrosten vauhdit toimivat, kerroksen poisto siirtää palikat pohjalle, Kumoa, tallennus. Kuvat pajakone3b_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
async def tyhja(pg):
    await pg.evaluate("(function(){APP.S.sel=null;APP.S.multi=[];APP.renderAll();})()");await pg.wait_for_timeout(100)
async def rows(pg):
    return await pg.eval_on_selector_all('#insp .krr','e=>e.map(x=>x.querySelector("input").value+(x.classList.contains("on")?"*":""))')
async def order(pg):
    return await pg.eval_on_selector_all('#uels .ue','e=>e.map(x=>APP.P.b[x.getAttribute("data-id")].nm)')
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Kerrokset');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            await pg.evaluate("(function(){APP.P.views[0].laite='puhelin';var b=KK.addBlock(APP.P,'nayta',{v:APP.P.views[0].id,tx:'Sisältö'});b.x=20;b.y=100;KK.setName(APP.P,b.id,'Sisältö');var c=KK.addBlock(APP.P,'nayta',{v:APP.P.views[0].id,tx:'Pitkä'});c.x=20;c.y=1600;KK.setName(APP.P,c.id,'Pitkä');APP.renderAll();})()")
            await tyhja(pg)
            assert await rows(pg)==['Pohja*'],await rows(pg)
            # --- 1. Uusi kerros, nimi, vauhti ---
            await pg.click('#insp [data-kradd]');await pg.wait_for_timeout(120)
            assert await rows(pg)==['Kerros 1*','Pohja'],await rows(pg)
            await pg.fill('#insp [data-krn="k1"]','Palkki');await pg.wait_for_timeout(60)
            await pg.select_option('#insp [data-krv="k1"]','0');await pg.wait_for_timeout(120)
            assert await P(pg,"P.views[0].kr")==[{'id':'pohja','n':'Pohja'},{'id':'k1','n':'Palkki','rv':0}]
            # Uusi palikka aktiiviseen kerrokseen
            st=await pg.locator('#uvp').bounding_box()
            await paletti(pg,'Painike',st['x']+180,st['y']+500);await pg.wait_for_timeout(150)
            bid=await P(pg,"APP.S.sel.id");assert await P(pg,"P.b['%s'].kr"%bid)=='k1'
            await pg.evaluate("(function(){var b=APP.P.b['%s'];KK.setName(APP.P,b.id,'Nappi');b.x=0;b.y=790;b.w=390;b.h=54;APP.renderAll();})()"%bid)
            # --- 2. Toinen kerros taustaksi alimmaksi, 25 % ---
            await tyhja(pg);await pg.click('#insp [data-kradd]');await pg.wait_for_timeout(100)
            await pg.fill('#insp [data-krn="k2"]','Tausta');await pg.click('#insp [data-krd="k2"]');await pg.wait_for_timeout(80);await pg.click('#insp [data-krd="k2"]');await pg.wait_for_timeout(100)
            assert await rows(pg)==['Palkki','Pohja','Tausta*'],await rows(pg)
            await pg.select_option('#insp [data-krv="k2"]','25');await pg.wait_for_timeout(100)
            await paletti(pg,'Laatikko',st['x']+180,st['y']+300);await pg.wait_for_timeout(150)
            tid=await P(pg,"APP.S.sel.id");await pg.evaluate("(function(){var b=APP.P.b['%s'];KK.setName(APP.P,b.id,'Taustakuva');b.x=0;b.y=0;b.w=390;b.h=3000;b.z=50;APP.renderAll();})()"%tid)
            o=await order(pg);print(W,'2 järjestys:',o);assert o[0]=='Taustakuva' and o[-1]=='Nappi','kerros ennen z:aa'
            # Palikan paneelissa Kerros ja Kerroksen mukaan
            await pg.evaluate("(function(){APP.S.sel={t:'b',id:'%s'};APP.renderAll();})()"%tid);await pg.wait_for_timeout(100)
            assert await pg.eval_on_selector('#insp select[data-k="kr"]','e=>e.value')=='k2'
            seg=await pg.inner_text('#insp [data-seg="rv"].on');assert 'Kerroksen mukaan (25 %)' in seg,seg
            # --- 3. Piilota ja lukitse muokatessa, valitse kerroksen palikat ---
            await tyhja(pg);await pg.click('#insp [data-krp="k2"]');await pg.wait_for_timeout(120)
            assert await pg.locator('#uels .ue[data-id="%s"]'%tid).count()==0
            await pg.click('#insp [data-krl="k1"]');await pg.wait_for_timeout(120)
            assert 'krlock' in await pg.evaluate("document.querySelector('.ue[data-id=\"%s\"]').className"%bid)
            await pg.click('#insp [data-krs="pohja"]');await pg.wait_for_timeout(120)
            ms=await P(pg,"APP.S.multi.map(m=>P.b[m.id].nm).sort()");assert ms==['Pitkä','Sisältö'],ms
            await pg.screenshot(path='pajakone3b_paneeli_%d.png'%W)
            # --- 4. Käytössä kaikki näkyvät, palkki pysyy, tausta 25 % ---
            await tyhja(pg);await pg.click('#lockbtn');await pg.wait_for_timeout(250)
            assert await pg.locator('#uels .ue[data-id="%s"]'%tid).count()==1
            async def top(i):return await pg.evaluate("document.querySelector('.ue[data-id=\"%s\"]').getBoundingClientRect().top"%i)
            n0,t0=await top(bid),await top(tid);v=await pg.locator('#uvp').bounding_box();await pg.mouse.move(v['x']+v['width']/2,v['y']+v['height']/2)
            for i in range(3):
                await pg.mouse.wheel(0,250);await pg.wait_for_timeout(60)
            c=await P(pg,"P.cam[APP.S.vw]");dy=-c['y'];n1,t1=await top(bid),await top(tid)
            print(W,'4 rullattu',round(dy),'nappi',round(n1-n0,2),'tausta',round(t0-t1,1));assert dy>300 and abs(n1-n0)<0.6 and abs((t0-t1)-dy*0.25)<1.5
            await pg.screenshot(path='pajakone3b_kaytto_%d.png'%W)
            await pg.click('#lockbtn');await pg.wait_for_timeout(150)
            # --- 5. Kerroksen poisto: palikat pohjalle; Kumoa palauttaa ---
            pg.once('dialog',lambda d:asyncio.ensure_future(d.accept()))
            await tyhja(pg);await pg.click('#insp [data-krx="k1"]');await pg.wait_for_timeout(150)
            assert await P(pg,"[P.views[0].kr.map(k=>k.id),P.b['%s'].kr===undefined]"%bid)==[['k2','pohja'],True]
            await pg.click('#undobtn');await pg.wait_for_timeout(150);assert await P(pg,"P.b['%s'].kr"%bid)=='k1'
            # --- 6. Tallennus ---
            await pg.evaluate("APP.saveNow()");await pg.reload();await pg.wait_for_timeout(300)
            r=await P(pg,"[P.views[0].kr.map(k=>k.n),P.b['%s'].kr,KK.rvOf(P,P.b['%s'])]"%(bid,tid));print(W,'6 tallennettu:',r)
            assert r==[['Tausta','Pohja','Palkki'],'k1',25],r
            print(W,'errs',errs);assert not errs;await b.close()
asyncio.run(main())
