# Versio 6.8: ehto ketjussa selaimessa. Ehto paletista ketjuun, palikka paneelista, ＋ Jatka kyllä-haaraan / ei-haaraan,
# kyllä/ei-merkinnät näkyvissä, ei-haaran viiva katkoviivana, ajo menee oikeaan haaraan kytkimen tilan mukaan,
# ƒ Ehto kaavasta ja Miksi?. Kuvat versio68_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0].id;
 var ky=KK.addBlock(P,'kytkin',{tx:'Valo',nm:'Valo',v:v});ky.x=60;ky.y=60;
 var lst=KK.addBlock(P,'lista',{tx:'Loki',nm:'Loki',v:v});lst.x=60;lst.y=130;
 var k=KK.addBlock(P,'ketju',{nm:'Haarat'});var w=KK.addNode(P,k.id,300,60);
 APP.renderAll();return [k.id,w.id,ky.id,lst.id];})()"""
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Ehto');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            kid,wid,ky,lid=await pg.evaluate(SETUP)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            r=await pg.locator('#lworld [data-nid="%s"]'%wid).bounding_box()
            l=pg.locator('#pal .chip[data-make*=\'"k":"haara"\']').first;await l.scroll_into_view_if_needed();c0=await l.bounding_box()
            await veda(pg,[c0['x']+c0['width']/2,c0['y']+c0['height']/2],[r['x']+120,r['y']+80]);await pg.wait_for_timeout(200)
            hn=await P(pg,"P.lg.n.find(n=>P.b[n.p].k==='haara').id")
            await pg.select_option('#insp select[data-k="o"]',ky);await pg.wait_for_timeout(150)
            lab=await pg.inner_text('#lworld [data-nid="%s"] .lt'%hn);print(W,'1 ehto:',lab);assert lab.strip()=='Onko Valo valittu?'
            ems=await pg.locator('#lworld [data-nid="%s"] .pins.o .pw>em'%hn).all_inner_texts();assert ems==['kyllä','ei']
            vis=await pg.evaluate("getComputedStyle(document.querySelector('#lworld [data-nid=\"%s\"] .pins.o .pw>em')).display"%hn);assert vis=='block'
            await pg.select_option('#insp select[data-kadd="after:e"]','tee:rivi');await pg.wait_for_timeout(200)
            await pg.select_option('#insp select[data-k="o"]',lid);await pg.fill('#insp input[data-k="tx"]','Valo päällä');await pg.wait_for_timeout(100)
            await pg.click('#lworld [data-nid="%s"] .lb'%hn);await pg.wait_for_timeout(150)
            await pg.select_option('#insp select[data-kadd="after:m"]','tee:rivi');await pg.wait_for_timeout(200)
            await pg.select_option('#insp select[data-k="o"]',lid);await pg.fill('#insp input[data-k="tx"]','Valo pois');await pg.wait_for_timeout(100)
            st=await P(pg,"P.lg.l.filter(l=>KK.isChainLink(P,l)).map(l=>l.fp).sort()");kno=await pg.locator('#lsvg path.lk.ch.kno').count()
            print(W,'2 haarat:',st,'katkoviiva',kno);assert st==['e','m'] and kno==1
            pos=await P(pg,"P.lg.n.filter(n=>P.b[n.p].k==='tee').map(n=>n.x)");print(W,'3 sijainnit:',pos);assert pos[1]>pos[0]+250,'ei-haara oikealle'
            await pg.click('#lworld [data-nid="%s"] [data-kplay]'%wid);await pg.wait_for_timeout(200)
            await pg.evaluate("APP.P.st['%s']=true"%ky);await pg.click('#lworld [data-nid="%s"] [data-kplay]'%wid);await pg.wait_for_timeout(200)
            rr=await P(pg,"KK.listRows(P,'%s').map(r=>r.tx)"%lid);print(W,'4 ajo:',rr);assert rr==['Valo pois','Valo päällä']
            await pg.click('#lworld [data-nid="%s"] .lb'%hn);await pg.wait_for_timeout(150)
            why=await pg.inner_text('#insp .why');print(W,'5 miksi:',why.split('\n')[0]);assert 'kyllä-haaraan' in why
            await pg.screenshot(path='versio68_ehto_%d.png'%W)
            await pg.click('#insp [data-kto="c"]');await pg.wait_for_timeout(200)
            await pg.fill('#insp textarea[data-kaava]','valo == ei');await pg.wait_for_timeout(150)
            lab=await pg.inner_text('#lworld [data-nid="%s"] .lt'%hn);print(W,'6 kaavasta:',lab);assert 'nuolesta' in lab
            await pg.click('#lworld [data-nid="%s"] [data-kplay]'%wid);await pg.wait_for_timeout(200)
            rr=await P(pg,"KK.listRows(P,'%s').map(r=>r.tx)"%lid);print(W,'7 kaava ratkaisee:',rr[-1]);assert rr[-1]=='Valo pois'
            print(W,'errs',errs);assert not errs
            await b.close()
asyncio.run(main())
