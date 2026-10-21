# Jonon 42b (F47 V2): Listan paneelin rasti *Rastisarake* (oletus päällä). Pois: rivien rastiruudut ja otsikon n/m
# katoavat, rivin muokkaus ja lisäys toimivat. Kumoa yhdellä painalluksella (paneelin rastin kohdistus ei enää tee ylimääräistä askelta). Päälle takaisin: tallennetut rastit näkyvät. 1440 ja 1280.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0];var li=KK.addBlock(P,'lista',{tx:'Tehtävät',v:v.id});li.x=40;li.y=40;li.w=320;li.h=220;KK.setName(P,li.id,'Tehtävät');
 P.st[li.id]={rows:[{id:'r1',tx:'Kauppa',c:true,d:''},{id:'r2',tx:'Posti',c:false,d:''}]};KK.repair(P);APP.renderAll();return li.id;})()"""
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Rasti');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            lid=await pg.evaluate(SETUP);L='#uels .ue[data-id="%s"]'%lid
            async def tila():return await pg.evaluate("(s)=>[document.querySelectorAll(s+' .lr .box').length,!!document.querySelector(s+' .ttl small'),document.querySelectorAll(s+' .lr.done').length,APP.ev().val(%r)]"%lid,L)
            assert await tila()==[2,True,1,1],await tila()
            await pg.click(L);await pg.wait_for_timeout(200)
            ck=pg.locator('#insp input[data-k="rasti"]');assert await ck.is_checked()
            await ck.click();await pg.wait_for_timeout(200);t=await tila();print(W,'pois:',t);assert t==[0,False,0,0],t
            await pg.screenshot(path='lista_rasti_pois_%d.png'%W)
            await pg.locator('#insp input[data-k="rasti"]').click();await pg.wait_for_timeout(200);t=await tila();print(W,'takaisin:',t);assert t==[2,True,1,1],t
            await pg.evaluate('document.activeElement.blur()');await pg.keyboard.press('Control+z');await pg.wait_for_timeout(200);t=await tila();print(W,'kumoa yhdellä:',t);assert t==[0,False,0,0],t
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            await pg.click(L+' [data-row="r2"] .lt');await pg.keyboard.type('kortti');await pg.keyboard.press('Enter');await pg.wait_for_timeout(200)
            await pg.fill(L+' .ladd','Uusi');await pg.press(L+' .ladd','Enter');await pg.wait_for_timeout(200)
            r=await pg.evaluate("(id)=>KK.listRows(APP.P,id).map(r=>r.tx)",lid);print(W,'käyttö:',r);assert r==['Kauppa','Postikortti','Uusi'] and (await tila())[0]==0
            print(W,'virheet:',errs);assert not errs,errs
            await b.close()
asyncio.run(main())
