# Versio 6.4: Aseta arvo ja Aseta tila ketjussa selaimessa. Aseta tila paletista ketjuun, kohde ja tila paneelista
# (on valittu / ei ole valittu), Aseta arvo kohteeseen, ＋ Lisää tapahtuma alkuun asettaa ketjun alkuun, ajo ▶:llä
# muuttaa näkymän palikat (kytkin, valintaruutu, luku), ja käyttönäkymä näyttää muutokset. Kuvat versio64_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0].id;
 var ky=KK.addBlock(P,'kytkin',{tx:'Valo',nm:'Valo',v:v});ky.x=60;ky.y=60;
 var ru=KK.addBlock(P,'ruutu',{tx:'Tehty',nm:'Tehty',v:v});ru.x=60;ru.y=130;
 var lu=KK.addBlock(P,'luku',{tx:'Pisteet',nm:'Pisteet',v:v});lu.x=60;lu.y=200;
 var k=KK.addBlock(P,'ketju',{nm:'Asetus'});var w=KK.addNode(P,k.id,330,60);
 APP.renderAll();return [k.id,w.id,ky.id,ru.id,lu.id];})()"""
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Aseta');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            kid,wid,ky,ru,lu=await pg.evaluate(SETUP)
            await pg.evaluate("APP.P.st['%s']=true"%ky)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            r=await pg.locator('#lworld [data-nid="%s"]'%wid).bounding_box()
            l=pg.locator('#pal .chip[data-make*=\'"do":"tila"\']').first;await l.scroll_into_view_if_needed();c0=await l.bounding_box()
            await veda(pg,[c0['x']+c0['width']/2,c0['y']+c0['height']/2],[r['x']+120,r['y']+80]);await pg.wait_for_timeout(200)
            await pg.select_option('#insp select[data-k="o"]',ky);await pg.wait_for_timeout(100)
            await pg.click('#insp [data-seg="ti"][data-v="ei"]');await pg.wait_for_timeout(100)
            lab=await pg.inner_text('#lworld .ln.kv .lt');print(W,'1 aseta tila:',lab);assert lab.strip()=='Valo: ei ole valittu'
            # Aseta arvo jatkoksi
            await pg.select_option('#insp select[data-kadd="after"]','tee:aseta');await pg.wait_for_timeout(200)
            await pg.select_option('#insp select[data-k="o"]',lu);await pg.fill('#insp input[data-k="v"]','12');await pg.wait_for_timeout(150)
            # ketjun alkuun: Aseta tila Tehty
            await pg.click('#lworld [data-nid="%s"] .ktl'%wid);await pg.wait_for_timeout(150)
            await pg.select_option('#insp select[data-kadd="start"]','tee:tila');await pg.wait_for_timeout(200)
            await pg.select_option('#insp select[data-k="o"]',ru);await pg.wait_for_timeout(100)
            order=await P(pg,"KK.chainOrder(P,'%s').map(id=>KK.descAct(P,KK.nodeOf(P,id).p))"%kid);print(W,'2 järjestys:',order)
            assert order==['Tehty: on valittu','Valo: ei ole valittu','Pisteet = 12']
            await pg.click('#lworld [data-nid="%s"] [data-kplay]'%wid);await pg.wait_for_timeout(200)
            v=await P(pg,"[E().val('%s'),E().val('%s'),E().val('%s')]"%(ky,ru,lu));print(W,'3 ajon jälkeen:',v);assert v==[False,True,12]
            await pg.screenshot(path='versio64_logiikka_%d.png'%W)
            await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(250)
            sw=await pg.locator('.ue[data-id="%s"] .sw.on'%ky).count();bx=await pg.locator('.ue[data-id="%s"] .box.on'%ru).count();
            print(W,'4 näkymässä: kytkin päällä',sw,'ruutu valittu',bx);assert sw==0 and bx==1
            await pg.screenshot(path='versio64_nakyma_%d.png'%W)
            print(W,'errs',errs);assert not errs
            await b.close()
asyncio.run(main())
