# Versio 7.3: ketju käynnistää toisen ketjun selaimessa. Käynnistä ketju paletista ketjuun, kohde ja Odota-rasti paneelista,
# ▶ → pääketju odottaa (⏳ odottaa, otsikossa Odottaa: …), aliketju etenee ajastimella ja pääketju jatkaa sen valmistuttua,
# ilman rastia molemmat etenevät rinnakkain, itsensä käynnistys näyttää huomautuksen. Kuvat versio73_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0].id;
 var lst=KK.addBlock(P,'lista',{tx:'Loki',nm:'Loki',v:v});lst.x=60;lst.y=60;
 var a=KK.addBlock(P,'ketju',{nm:'Pää'});var aw=KK.addNode(P,a.id,60,40);
 var r1=KK.addBlock(P,'tee',{do:'rivi',o:lst.id,tx:'Pää alku'});KK.addNode(P,r1.id,90,90,aw.id);
 var b=KK.addBlock(P,'ketju',{nm:'Ali'});var bw=KK.addNode(P,b.id,560,40);
 var t=KK.addBlock(P,'ajastin',{kesto:2}),r2=KK.addBlock(P,'tee',{do:'rivi',o:lst.id,tx:'Ali valmis'});var nt=KK.addNode(P,t.id,590,90,bw.id),n2=KK.addNode(P,r2.id,590,180,bw.id);KK.addLink(P,nt.id,'e',n2.id,'e');
 APP.renderAll();return [a.id,aw.id,b.id,bw.id,lst.id];})()"""
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Ketjut');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            aid,aw,bid,bw,lid=await pg.evaluate(SETUP)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            r=await pg.locator('#lworld [data-nid="%s"]'%aw).bounding_box()
            l=pg.locator('#pal .chip[data-make*=\'"do":"kaynnista"\']').first;await l.scroll_into_view_if_needed();c0=await l.bounding_box()
            await veda(pg,[c0['x']+c0['width']/2,c0['y']+c0['height']/2],[r['x']+100,r['y']+150]);await pg.wait_for_timeout(200)
            sn=await P(pg,"P.lg.n.find(n=>P.b[n.p].do==='kaynnista').id")
            await pg.select_option('#insp select[data-k="o"]',bid);await pg.wait_for_timeout(100)
            await pg.check('#insp input[data-k="odota"]');await pg.wait_for_timeout(150)
            lab=await pg.inner_text('#lworld [data-nid="%s"] .lt'%sn);print(W,'1 tapahtuma:',lab);assert lab.strip()=='Käynnistä ketju: Ali ja odota'
            await pg.select_option('#insp select[data-kadd="after"]','tee:rivi');await pg.wait_for_timeout(150)
            await pg.select_option('#insp select[data-k="o"]',lid);await pg.fill('#insp input[data-k="tx"]','Pää loppu');await pg.wait_for_timeout(100)
            await pg.click('#lworld [data-nid="%s"] [data-kplay]'%aw);await pg.wait_for_timeout(250)
            chip=await pg.inner_text('#lworld [data-nid="%s"] .kleft'%sn);hd=await pg.inner_text('#lworld [data-nid="%s"] .know'%aw);hb=await pg.inner_text('#lworld [data-nid="%s"] .wh'%bw)
            print(W,'2 odottaa:',chip,'|',hd,'|',hb.replace('\n',' '));assert 'odottaa' in chip and hd.startswith('Odottaa: Ali valmis') and 'käynnissä' in hb
            await pg.screenshot(path='versio73_odottaa_%d.png'%W)
            await pg.wait_for_timeout(2600)
            rr=await P(pg,"KK.listRows(P,'%s').map(r=>r.tx)"%lid);print(W,'3 valmis:',rr);assert rr==['Pää alku','Ali valmis','Pää loppu']
            # ilman odotusta: rinnakkain
            await pg.click('#lworld [data-nid="%s"] .lb'%sn);await pg.wait_for_timeout(120);await pg.uncheck('#insp input[data-k="odota"]');await pg.wait_for_timeout(120)
            await pg.click('#lworld [data-nid="%s"] [data-kplay]'%aw);await pg.wait_for_timeout(250)
            rr=await P(pg,"KK.listRows(P,'%s').map(r=>r.tx)"%lid);print(W,'4 rinnakkain:',rr[3:]);assert rr[3:]==['Pää alku','Pää loppu']
            # itsensä käynnistys
            await pg.click('#lworld [data-nid="%s"] .lb'%sn);await pg.wait_for_timeout(120);await pg.select_option('#insp select[data-k="o"]',aid);await pg.wait_for_timeout(150)
            await pg.click('#lworld [data-nid="%s"] .ktl'%aw);await pg.wait_for_timeout(150)
            ins=await pg.inner_text('#insp');print(W,'5 huomautus:','ei voi käynnistää itseään' in ins);assert 'ei voi käynnistää itseään' in ins
            print(W,'errs',errs);assert not errs
            await b.close()
asyncio.run(main())
