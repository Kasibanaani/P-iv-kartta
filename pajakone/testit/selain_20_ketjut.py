# Versio 6.9: monta ketjua selaimessa. Kaksi ketjua paletista, nimet paneelista, paletin lista Ketjut tässä projektissa
# (nimi ja tila), päälle / pois otsikon kytkimestä, paletin kytkimestä ja paneelin rastista, pois päältä oleva ketju
# ei käynnisty painikkeesta mutta toinen käynnistyy, uudelleenkäynnistyksen valinta ja listasta siirtyminen. Kuvat versio69_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Ketjut');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            lv=await pg.locator('#lvp').bounding_box()
            async def chip(k,x,y,extra=''):
                l=pg.locator('#pal .chip[data-make*=\'"k":"%s"\']%s'%(k,extra)).first;await l.scroll_into_view_if_needed();c0=await l.bounding_box()
                await veda(pg,[c0['x']+c0['width']/2,c0['y']+c0['height']/2],[x,y]);await pg.wait_for_timeout(150)
            await chip('ketju',lv['x']+220,lv['y']+150);await pg.fill('#insp input[data-k="nm"]','Aamu');await pg.wait_for_timeout(100)
            await chip('ketju',lv['x']+220,lv['y']+430);await pg.fill('#insp input[data-k="nm"]','Ilta');await pg.wait_for_timeout(100)
            ids=await P(pg,"Object.values(P.b).filter(b=>b.k==='ketju').map(b=>[b.nm,b.id,P.lg.n.find(n=>n.p===b.id).id])")
            (an,aid,aw),(iname,iid,iw)=ids
            # tapahtumat ja yhteinen käynnistäjä
            await pg.evaluate("""(function(){var P=APP.P,v=P.views[0].id;var lst=KK.addBlock(P,'lista',{nm:'Loki',v:v});var btn=KK.addBlock(P,'nappi',{beh:'kerta',nm:'Nappi',v:v});var nb=KK.addNode(P,btn.id,-200,200);
              [['%s','%s'],['%s','%s']].forEach(function(x){var w=KK.nodeOf(P,x[1]);var r=KK.addBlock(P,'tee',{do:'rivi',o:lst.id,tx:P.b[x[0]].nm});KK.addNode(P,r.id,w.x+20,w.y+50,w.id);KK.addLink(P,nb.id,'e',w.id,'e');});APP.renderAll();})()"""%(aid,aw,iid,iw))
            await pg.wait_for_timeout(150)
            await pg.locator('#kpal').scroll_into_view_if_needed()
            rows=await pg.locator('#kpal .krow').all_inner_texts();print(W,'1 lista:',[r.replace('\n',' ') for r in rows]);assert len(rows)==2 and 'Aamu' in rows[0] and 'Ilta' in rows[1]
            # pois päältä otsikon kytkimestä
            await pg.click('#lworld [data-nid="%s"] [data-kon]'%iw);await pg.wait_for_timeout(150)
            off=await P(pg,"P.b['%s'].off"%iid);cls=await pg.get_attribute('#lworld [data-nid="%s"]'%iw,'class');lt=await pg.inner_text('#kpal .krow:nth-child(2)')
            print(W,'2 pois:',off,'off' in cls,lt.replace('\n',' '));assert off and 'off' in cls and 'pois päältä' in lt
            await pg.evaluate("KK.press(APP.P,Object.values(APP.P.b).find(b=>b.nm==='Nappi').id,APP.ctx());APP.renderAll()")
            r=await P(pg,"KK.listRows(P,B('Loki').id).map(r=>r.tx)");print(W,'3 vain päällä oleva:',r);assert r==['Aamu']
            # takaisin päälle paletin kytkimestä
            await pg.click('#kpal [data-konp="%s"]'%iid);await pg.wait_for_timeout(150)
            off=await P(pg,"P.b['%s'].off"%iid);assert not off
            await pg.evaluate("KK.press(APP.P,Object.values(APP.P.b).find(b=>b.nm==='Nappi').id,APP.ctx());APP.renderAll()")
            r=await P(pg,"KK.listRows(P,B('Loki').id).map(r=>r.tx)");print(W,'4 molemmat:',r);assert r==['Aamu','Aamu','Ilta']
            # paneeli: rasti ja uudelleenkäynnistyksen valinta
            await pg.click('#kpal [data-kgob="%s"]'%aid);await pg.wait_for_timeout(250)
            sel=await P(pg,"APP.S.sel&&KK.nodeOf(P,APP.S.sel.id)&&KK.nodeOf(P,APP.S.sel.id).p");print(W,'5 listasta:',sel==aid);assert sel==aid
            await pg.click('#insp [data-seg="uusi"][data-v="alusta"]');await pg.wait_for_timeout(100)
            assert await P(pg,"P.b['%s'].uusi"%aid)=='alusta'
            await pg.uncheck('#insp input[data-k="on"]');await pg.wait_for_timeout(150)
            off=await P(pg,"P.b['%s'].off"%aid);lt=await pg.inner_text('#kpal .krow:nth-child(1)');print(W,'6 rasti:',off,lt.replace('\n',' '));assert off and 'pois päältä' in lt
            await pg.screenshot(path='versio69_ketjut_%d.png'%W)
            print(W,'errs',errs);assert not errs
            await b.close()
asyncio.run(main())
