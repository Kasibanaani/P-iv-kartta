# Versio 6.6: viilaus selaimessa. Huomautukset ketjun otsikossa (⚠ määrä) ja paneelissa (⚠ virheet, ℹ︎ tiedot),
# virheellinen tapahtuma korostuu, kehä ilman ajastinta näkyy ennen ajoa ja pysäyttää ajon selkeällä viestillä,
# käytön aikana tuleva virhe kerrotaan ilmoituksella kerran. Kuvat versio66_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P;
 var k=KK.addBlock(P,'ketju',{nm:'Tarkistus'});var w=KK.addNode(P,k.id,330,60);
 var a=KK.addBlock(P,'tee',{do:'aseta',nm:'Ilman kohdetta'}),b=KK.addBlock(P,'tee',{do:'ilmoita',tx:'B',nm:'B'}),c=KK.addBlock(P,'tee',{do:'ilmoita',tx:'C',nm:'C'});
 var na=KK.addNode(P,a.id,360,110,w.id),nb=KK.addNode(P,b.id,360,190,w.id),nc=KK.addNode(P,c.id,360,270,w.id);
 KK.addLink(P,na.id,'e',nb.id,'e');KK.addLink(P,nb.id,'e',nc.id,'e');KK.addLink(P,nc.id,'e',nb.id,'e');
 var k2=KK.addBlock(P,'ketju',{nm:'Myöhemmin'});var w2=KK.addNode(P,k2.id,760,60);
 var t1=KK.addBlock(P,'ajastin',{kesto:1}),t2=KK.addBlock(P,'ajastin',{kesto:'0'});
 var n1=KK.addNode(P,t1.id,790,110,w2.id),n2=KK.addNode(P,t2.id,790,190,w2.id);KK.addLink(P,n1.id,'e',n2.id,'e');
 APP.renderAll();return [k.id,w.id,na.id,k2.id,w2.id];})()"""
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Viilaus');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            kid,wid,na,k2,w2=await pg.evaluate(SETUP)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            await pg.evaluate("(function(){var c=APP.P.lcam;c.x=-200;c.y=0;c.z=0.85;APP.renderAll();})()");await pg.wait_for_timeout(150)
            hd=await pg.inner_text('#lworld [data-nid="%s"] .kiss'%wid);print(W,'1 otsikossa:',hd);assert hd.strip()=='⚠ 2'
            er=await pg.locator('#lworld [data-nid="%s"].has-err'%na).count();assert er==1,'virheellinen tapahtuma korostuu'
            await pg.click('#lworld [data-nid="%s"] .ktl'%wid);await pg.wait_for_timeout(150)
            ins=await pg.inner_text('#insp');print(W,'2 paneeli:',[l for l in ins.split('\n') if l.startswith('⚠') or l.startswith('ℹ')])
            assert '⚠ ”Ilman kohdetta”: valitse kohde.' in ins and 'Kehä ilman ajastinta: B → C → B' in ins and 'Mikään ei vielä käynnistä' in ins
            await pg.screenshot(path='versio66_huomautukset_%d.png'%W)
            await pg.click('#insp [data-kplay2]');await pg.wait_for_timeout(200)
            tx=await pg.inner_text('#toast');hdr=await pg.inner_text('#lworld [data-nid="%s"] .wh'%wid);print(W,'3 ajo:',tx,'|',hdr.replace('\n',' '))
            assert 'kehää ilman ajastinta' in tx and 'pysähtyi' in hdr
            ins=await pg.inner_text('#insp');assert 'Pysähtyi' in ins
            # käytön aikana tuleva virhe: toinen ajastin, jonka kesto on nolla
            await pg.click('#lworld [data-nid="%s"] [data-kplay]'%w2);await pg.wait_for_timeout(1800)
            tx=await pg.inner_text('#toast');print(W,'4 käytön aikana:',tx);assert 'Myöhemmin' in tx and 'kesto on nolla' in tx
            print(W,'errs',errs);assert not errs
            await b.close()
asyncio.run(main())
