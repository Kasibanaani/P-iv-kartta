# Versio 7.4: ketjun tulos selaimessa. Päätöspuu Ehto → Ketjun tulos kumpaankin haaraan paneelin napeilla, ketjun Tulos-osio
# (Nyt: …), Vie tulos näkymän palikkaan → teksti, ajo kytkimen mukaan näkyy käyttönäkymän tekstissä, kaava viite.tulos,
# Lopeta ketju paletissa. Kuvat versio74_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0].id;
 var ky=KK.addBlock(P,'kytkin',{tx:'Aurinko paistaa',nm:'Aurinko',v:v});ky.x=60;ky.y=60;
 var t=KK.addBlock(P,'nayta',{tx:'',nm:'Vastaus',v:v});t.x=60;t.y=130;
 var k=KK.addBlock(P,'ketju',{nm:'Päätös'});var w=KK.addNode(P,k.id,330,40);
 var h=KK.addBlock(P,'haara',{o:ky.id});var nh=KK.addNode(P,h.id,370,90,w.id);
 APP.renderAll();return [k.id,w.id,nh.id,ky.id,t.id];})()"""
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Tulos');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            kid,wid,nh,ky,tid=await pg.evaluate(SETUP)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            for port,val in (('e','Ulos!'),('m','Sisälle')):
                await pg.click('#lworld [data-nid="%s"] .lb'%nh);await pg.wait_for_timeout(120)
                await pg.select_option('#insp select[data-kadd="after:%s"]'%port,'ktulos');await pg.wait_for_timeout(150)
                await pg.fill('#insp input[data-k="v"]',val);await pg.wait_for_timeout(100)
            labs=await pg.locator('#lworld .ln.kv .lt').all_inner_texts();print(W,'1 lehdet:',labs);assert 'Tulos: Ulos!' in labs and 'Tulos: Sisälle' in labs
            await pg.click('#lworld [data-nid="%s"] .ktl'%wid);await pg.wait_for_timeout(150)
            await pg.click('#insp [data-ktvie]');await pg.wait_for_timeout(100);await pg.locator('#menu button',has_text='Vastaus').click();await pg.wait_for_timeout(100)
            items=await pg.locator('#menu button').all_inner_texts();print(W,'2 kohdat:',items);await pg.locator('#menu button',has_text='teksti').first.click();await pg.wait_for_timeout(150)
            ok=await P(pg,"P.lg.l.some(l=>l.f==='%s'&&l.fp==='t'&&l.tp==='tx')"%wid);assert ok
            await pg.click('#lworld [data-nid="%s"] [data-kplay]'%wid);await pg.wait_for_timeout(200)
            await pg.click('#lworld [data-nid="%s"] .ktl'%wid);await pg.wait_for_timeout(150)
            nyt=await pg.inner_text('#insp .kres');print(W,'3 tulos:',nyt);assert 'Sisälle' in nyt
            await pg.screenshot(path='versio74_logiikka_%d.png'%W)
            await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(200);await pg.click('#lockbtn');await pg.wait_for_timeout(150)
            await pg.click('.ue[data-id="%s"] [data-act="toggle"]'%ky);await pg.wait_for_timeout(150)
            await pg.evaluate("KK.chainStart(APP.P,'%s',APP.ctx());APP.renderAll()"%kid);await pg.wait_for_timeout(150)
            t=await pg.inner_text('.ue[data-id="%s"]'%tid);print(W,'4 näkymässä:',t);assert t.strip()=='Ulos!'
            await pg.screenshot(path='versio74_nakyma_%d.png'%W)
            await pg.click('#lockbtn');await pg.wait_for_timeout(150)
            v=await pg.evaluate("(function(){var P=APP.P;var k=KK.addBlock(P,'kaava');KK.addNode(P,k.id,900,600);k.f=KK.kaavaToIds(P,'päätös.tulos');return APP.ev().val(k.id);})()");print(W,'5 kaava:',v);assert v=='Ulos!'
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(200)
            n=await pg.locator('#pal .chip[data-make*=\'"k":"lopeta"\']').count();assert n==1
            print(W,'errs',errs);assert not errs
            await b.close()
asyncio.run(main())
