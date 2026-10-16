# Versio 6.5 → Appi-appi 9: entiset tulevat tapahtumat ovat nyt käytössä. Paletissa ei ole Tulossa myöhemmin -kohtaa;
# Teksti ilmestyy, Kuva vaihtuu, Animaatio ja Näkymänvaihto ovat kohdassa Näkymä ja efektit, ja vedettäessä syntyy palikka
# (myös ketjun ulkopuolelle). Ketjussa kohteeton efekti näkyy merkinnällä valitse kohde ja huomautuksena, paneelissa on
# efektin asetukset, ja ketju kulkee sen ohi.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Tulevat');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            assert await pg.locator('#pal .chip.soon').count()==0,'ei Tulossa-kohtaa'
            ch=pg.locator('#pal .chip',has_text='Animaatio').first;await ch.scroll_into_view_if_needed();lv=await pg.locator('#lvp').bounding_box();c=await ch.bounding_box()
            n0=await P(pg,"Object.keys(P.b).length")
            await veda(pg,[c['x']+20,c['y']+10],[lv['x']+300,lv['y']+300])
            n1=await P(pg,"Object.keys(P.b).length");k=await P(pg,"Object.values(P.b).filter(b=>b.k==='anim').length");print(W,'1 veto:',n0,n1,k);assert n1==n0+1 and k==1
            await pg.evaluate("""(function(){var P=APP.P;var k=KK.addBlock(P,'ketju'),w=KK.addNode(P,k.id,200,60);var lst=KK.addBlock(P,'lista',{nm:'Loki',v:P.views[0].id});
              var a=KK.addBlock(P,'tee',{do:'rivi',o:lst.id,tx:'1'}),f=KK.addBlock(P,'anim'),c=KK.addBlock(P,'tee',{do:'rivi',o:lst.id,tx:'2'});
              var na=KK.addNode(P,a.id,230,110,w.id),nf=KK.addNode(P,f.id,230,190,w.id),nc=KK.addNode(P,c.id,230,270,w.id);KK.addLink(P,na.id,'e',nf.id,'e');KK.addLink(P,nf.id,'e',nc.id,'e');APP.renderAll();})()""")
            await pg.wait_for_timeout(150)
            nid=await P(pg,"P.lg.n.filter(n=>P.b[n.p].k==='anim'&&n.g)[0].id");sel='#lworld .ln[data-nid="%s"]'%nid
            tx=await pg.inner_text(sel+' .lt');print(W,'2 kanvaasilla:',tx);assert 'valitse kohde' in tx
            await pg.click(sel+' .lb');await pg.wait_for_timeout(300);ins=await pg.evaluate("document.querySelector('#insp').textContent")
            assert 'Liike' in ins and 'Ravistus' in ins and 'valitse palikka' in ins
            iss=await P(pg,"KK.chainIssues(P,Object.values(P.b).filter(b=>b.k==='ketju')[0].id).map(x=>x.t).join('|')");print(W,'huomautus:',iss);assert 'valitse palikka, jolle efekti tehdään' in iss
            await pg.click('#lworld .lw.kt [data-kplay]');await pg.wait_for_timeout(150)
            r=await P(pg,"KK.listRows(P,B('Loki').id).map(r=>r.tx)");print(W,'3 ohi:',r);assert r==['1','2']
            await pg.screenshot(path='versio65_tulevat_%d.png'%W)
            print(W,'errs',errs);assert not errs
            await b.close()
asyncio.run(main())
