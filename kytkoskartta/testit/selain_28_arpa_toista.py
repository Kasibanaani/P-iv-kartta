# Versio 7.5: Arpa ja Toista selaimessa. Arpa paletista ketjuun, vaihtoehtojen määrä paneelista (kohdat 1–N), jatkot
# jokaiseen vaihtoehtoon, ajo arpoo (Math.random); Toista paletista, kerrat paneelista, kierros-haara ja viiva takaisin,
# ajastimen kanssa kierroslaskuri näkyy (1/2) ja valmis-haara lopuksi. Kuvat versio75_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0].id;
 var lst=KK.addBlock(P,'lista',{tx:'Loki',nm:'Loki',v:v});lst.x=60;lst.y=60;
 var k=KK.addBlock(P,'ketju',{nm:'Peli'});var w=KK.addNode(P,k.id,300,40);
 var k2=KK.addBlock(P,'ketju',{nm:'Kierrokset'});var w2=KK.addNode(P,k2.id,300,420);
 APP.renderAll();return [k.id,w.id,k2.id,w2.id,lst.id];})()"""
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Peli');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            kid,wid,k2,w2,lid=await pg.evaluate(SETUP)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            async def drop(k,wn,dx,dy):
                r=await pg.locator('#lworld [data-nid="%s"]'%wn).bounding_box()
                l=pg.locator('#pal .chip[data-make*=\'"k":"%s"\']'%k).first;await l.scroll_into_view_if_needed();c0=await l.bounding_box()
                await veda(pg,[c0['x']+c0['width']/2,c0['y']+c0['height']/2],[r['x']+dx,r['y']+dy]);await pg.wait_for_timeout(200)
            await drop('arpa',wid,140,80)
            an=await P(pg,"P.lg.n.find(n=>P.b[n.p].k==='arpa').id")
            await pg.click('#insp [data-seg="n"][data-v="3"]');await pg.wait_for_timeout(150)
            ems=await pg.locator('#lworld [data-nid="%s"] .pins.o .pw>em'%an).all_inner_texts();print(W,'1 kohdat:',ems);assert ems==['1','2','3']
            for i in (1,2,3):
                await pg.click('#lworld [data-nid="%s"] .lb'%an);await pg.wait_for_timeout(120)
                await pg.select_option('#insp select[data-kadd="after:a%d"]'%i,'tee:rivi');await pg.wait_for_timeout(150)
                await pg.select_option('#insp select[data-k="o"]',lid);await pg.fill('#insp input[data-k="tx"]','Vaihtoehto %d'%i);await pg.wait_for_timeout(80)
            for i in range(12):await pg.evaluate("KK.chainStart(APP.P,'%s',APP.ctx())"%kid)
            rr=await P(pg,"KK.listRows(P,'%s').map(r=>r.tx)"%lid);print(W,'2 arvontoja:',len(rr),sorted(set(rr)));assert len(rr)==12 and len(set(rr))>=2
            # Toista
            await drop('toista',w2,140,80)
            tn=await P(pg,"P.lg.n.find(n=>P.b[n.p].k==='toista').id")
            await pg.fill('#insp input[data-k="kerrat"]','2');await pg.wait_for_timeout(120)
            await pg.select_option('#insp select[data-kadd="after:e"]','ajastin');await pg.wait_for_timeout(150)
            await pg.fill('#insp input[data-k="kesto"]','1');await pg.wait_for_timeout(100)
            aj=await P(pg,"P.lg.n.find(n=>P.b[n.p].k==='ajastin').id")
            # viiva ajastimesta takaisin toistoon
            a=await pg.locator('#lworld [data-nid="%s"] .pins.o .pt[data-p="e"]'%aj).bounding_box();t=await pg.locator('#lworld [data-nid="%s"] .pins.i .pt[data-p="e"]'%tn).bounding_box()
            await veda(pg,[a['x']+6,a['y']+6],[t['x']+6,t['y']+6])
            ok=await P(pg,"P.lg.l.some(l=>l.f==='%s'&&l.t==='%s')"%(aj,tn));print(W,'3 viiva takaisin:',ok);assert ok
            await pg.click('#lworld [data-nid="%s"] .lb'%tn);await pg.wait_for_timeout(120)
            await pg.select_option('#insp select[data-kadd="after:m"]','tee:rivi');await pg.wait_for_timeout(150)
            await pg.select_option('#insp select[data-k="o"]',lid);await pg.fill('#insp input[data-k="tx"]','Kierrokset valmiit');await pg.wait_for_timeout(100)
            await pg.click('#lworld [data-nid="%s"] [data-kplay]'%w2);await pg.wait_for_timeout(300)
            chip=await pg.inner_text('#lworld [data-nid="%s"] .lv'%tn);print(W,'4 laskuri:',chip);assert chip.strip()=='1/2'
            await pg.screenshot(path='versio75_toista_%d.png'%W)
            await pg.wait_for_timeout(2600)
            rr=await P(pg,"KK.listRows(P,'%s').map(r=>r.tx)"%lid);print(W,'5 valmis:',rr[-1]);assert rr[-1]=='Kierrokset valmiit'
            st=await P(pg,"P.st['%s'].run"%k2);assert st is False
            print(W,'errs',errs);assert not errs
            await b.close()
asyncio.run(main())
