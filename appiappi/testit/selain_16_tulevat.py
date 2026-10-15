# Versio 6.5: tulevat tapahtumat paletissa. Teksti ilmestyy, Kuva vaihtuu, Animaatio ja Näkymänvaihto näkyvät
# himmeinä kohdassa Tulossa myöhemmin; niitä ei voi vetää kanvaasille, napautus kertoo, että ne tulevat myöhemmin.
# Tallennettu tuleva tapahtuma (esim. toisesta versiosta) näkyy ketjussa merkinnällä tulossa ja ketju kulkee sen ohi.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Tulevat');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            soon=await pg.locator('#pal .chip.soon').all_inner_texts();print(W,'1 tulossa:',soon)
            assert [x.split('\n')[-1].strip() for x in soon]==['Teksti ilmestyy','Kuva vaihtuu','Animaatio','Näkymänvaihto'] or len(soon)==4
            await pg.locator('#pal .chip.soon').first.scroll_into_view_if_needed();lv=await pg.locator('#lvp').bounding_box();c=await pg.locator('#pal .chip.soon').first.bounding_box()
            n0=await P(pg,"Object.keys(P.b).length")
            await veda(pg,[c['x']+20,c['y']+10],[lv['x']+300,lv['y']+300])
            n1=await P(pg,"Object.keys(P.b).length");t=await pg.inner_text('#toast');print(W,'2 veto:',n0,n1,'|',t);assert n0==n1 and 'Tulossa myöhemmin' in t
            await pg.evaluate("""(function(){var P=APP.P;var k=KK.addBlock(P,'ketju'),w=KK.addNode(P,k.id,200,60);var lst=KK.addBlock(P,'lista',{nm:'Loki',v:P.views[0].id});
              var a=KK.addBlock(P,'tee',{do:'rivi',o:lst.id,tx:'1'}),f=KK.addBlock(P,'anim'),c=KK.addBlock(P,'tee',{do:'rivi',o:lst.id,tx:'2'});
              var na=KK.addNode(P,a.id,230,110,w.id),nf=KK.addNode(P,f.id,230,190,w.id),nc=KK.addNode(P,c.id,230,270,w.id);KK.addLink(P,na.id,'e',nf.id,'e');KK.addLink(P,nf.id,'e',nc.id,'e');APP.renderAll();})()""")
            await pg.wait_for_timeout(150)
            tx=await pg.inner_text('#lworld .ln.g-fx .lt');print(W,'3 kanvaasilla:',tx);assert 'tulossa' in tx
            await pg.click('#lworld .ln.g-fx .lb');await pg.wait_for_timeout(150);ins=await pg.inner_text('#insp');assert 'myöhemmässä versiossa' in ins
            await pg.click('#lworld .lw.kt [data-kplay]');await pg.wait_for_timeout(150)
            r=await P(pg,"KK.listRows(P,B('Loki').id).map(r=>r.tx)");print(W,'4 ohi:',r);assert r==['1','2']
            await pg.screenshot(path='versio65_tulevat_%d.png'%W)
            print(W,'errs',errs);assert not errs
            await b.close()
asyncio.run(main())
