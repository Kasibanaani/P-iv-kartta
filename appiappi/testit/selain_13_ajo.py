# Versio 6.2: ketju käynnistyy ja etenee selaimessa. Nuoli painikkeesta ketjun käynnistä-kohtaan vedetään hiirellä,
# käyttö lukittuna (painallus → tapahtumat järjestyksessä), ▶-nappi otsikossa ja paneelissa, tila paneelissa,
# seurannan välähdys, tyhjän ketjun virhe ja ketjun tapahtuman paneeli (Paikka ketjussa). Kuvakaappaukset versio62_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P;
 var btn=KK.addBlock(P,'nappi',{beh:'kerta',tx:'Aloita',nm:'Aloita',v:P.views[0].id});btn.x=80;btn.y=80;
 var lst=KK.addBlock(P,'lista',{tx:'Loki',nm:'Loki',v:P.views[0].id});lst.x=80;lst.y=160;
 var k=KK.addBlock(P,'ketju',{nm:'Aamu'});var w=KK.addNode(P,k.id,330,60);
 var a=KK.addBlock(P,'tee',{do:'rivi',o:lst.id,tx:'Yksi'}),b=KK.addBlock(P,'tee',{do:'rivi',o:lst.id,tx:'Kaksi'});
 var na=KK.addNode(P,a.id,370,120,w.id),nb=KK.addNode(P,b.id,370,200,w.id);KK.addLink(P,na.id,'e',nb.id,'e');
 KK.addNode(P,btn.id,60,100);APP.renderAll();return [k.id,w.id];})()"""
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Ajo');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            kid,wid=await pg.evaluate(SETUP)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            def rows():return P(pg,"KK.listRows(P,B('Loki').id).map(r=>r.tx)")
            # --- nuoli painikkeesta ketjun käynnistä-kohtaan ---
            bn=await P(pg,"P.lg.n.find(n=>P.b[n.p].nm==='Aloita').id")
            a=await pg.locator('#lworld [data-nid="%s"] .pins.o .pt[data-p="e"]'%bn).bounding_box()
            t=await pg.locator('#lworld [data-nid="%s"] > .pins.i .pt[data-p="e"]'%wid).bounding_box()
            await veda(pg,[a['x']+6,a['y']+6],[t['x']+6,t['y']+6])
            ln=await P(pg,"P.lg.l.filter(l=>l.t==='%s'&&l.tp==='e').length"%wid);print(W,'1 nuoli käynnistä-kohtaan:',ln);assert ln==1
            # --- ▶ otsikossa ---
            await pg.click('#lworld [data-nid="%s"] [data-kplay]'%wid);await pg.wait_for_timeout(150)
            r=await rows();print(W,'2 ▶ otsikossa:',r);assert r==['Yksi','Kaksi']
            fl=await pg.locator('#lworld .ln.kv.kdone').count();print(W,'3 välähdys:',fl);assert fl==2
            await pg.screenshot(path='versio62_ajo_%d.png'%W)
            # --- paneeli: tila ja ▶ Käynnistä nyt ---
            await pg.click('#lworld [data-nid="%s"] .ktl'%wid);await pg.wait_for_timeout(150)
            ins=await pg.inner_text('#insp');print(W,'4 tila:',[x for x in ins.split('\n') if 'Valmis' in x or 'käynnist' in x][:2]);assert 'Valmis · käynnistynyt 1 kertaa' in ins
            await pg.click('#insp [data-kplay2]');await pg.wait_for_timeout(150)
            r=await rows();assert r==['Yksi','Kaksi','Yksi','Kaksi']
            # --- käyttö lukittuna: painallus käynnistää ---
            await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(200);await pg.click('#lockbtn');await pg.wait_for_timeout(150)
            bid=await P(pg,"B('Aloita').id");await pg.click('.ue[data-id="%s"] [data-act="press"]'%bid);await pg.wait_for_timeout(200)
            r=await rows();print(W,'5 käytössä:',r[-2:],len(r));assert len(r)==6 and r[-2:]==['Yksi','Kaksi']
            lt=await pg.inner_text('.ue[data-id="%s"]'%(await P(pg,"B('Loki').id")));assert lt.count('Kaksi')==3
            await pg.click('#lockbtn');await pg.wait_for_timeout(150)
            # --- ketjun tapahtuman paneeli ---
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            nb=await P(pg,"KK.chainOrder(P,'%s')[1]"%kid);await pg.click('#lworld [data-nid="%s"] .lb'%nb);await pg.wait_for_timeout(150)
            ins=await pg.inner_text('#insp');print(W,'6 paikka ketjussa:','paikka ketjussa' in ins.lower(),'Ketju päättyy tähän' in ins);assert 'paikka ketjussa' in ins.lower() and 'Ketju päättyy tähän' in ins and 'SITTEN' not in ins
            # --- tyhjä ketju: virhe näkyy ---
            k2=await pg.evaluate("(function(){var k=KK.addBlock(APP.P,'ketju',{nm:'Tyhjä'});var w=KK.addNode(APP.P,k.id,330,420);APP.renderAll();return w.id;})()")
            await pg.click('#lworld [data-nid="%s"] [data-kplay]'%k2);await pg.wait_for_timeout(200)
            tx=await pg.inner_text('#toast');hd=await pg.inner_text('#lworld [data-nid="%s"] .wh'%k2);print(W,'7 tyhjä:',tx,'|',hd.replace('\n',' '));assert 'tyhjä' in tx and 'pysähtyi' in hd
            print(W,'errs',errs);assert not errs
            await b.close()
asyncio.run(main())
