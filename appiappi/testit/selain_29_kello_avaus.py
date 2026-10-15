# Versio 7.6: ajastin kellonaikaan ja ketjun käynnistys projektia avattaessa selaimessa. Kello on testissä siirretty
# (Playwrightin clock) aamuun 15.10.2026 klo 6.59.40 Suomen aikaa. Ajastimen paneelista Kellonaikaan + 7.00, kuvaus
# palikassa, virheellinen aika, ▶ ja ketju jatkuu kello 7.00. Ketjun asetus ”Käynnisty, kun projekti avataan”:
# uudelleenlataus ja projektin vaihto käynnistävät sen. Versio 7.7: paletin ketjuosion ryhmät ja lisäysvalikon ryhmät.
# Kuvat versio76_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0].id;
 var lst=KK.addBlock(P,'lista',{tx:'Loki',nm:'Loki',v:v});lst.x=60;lst.y=60;
 var k=KK.addBlock(P,'ketju',{nm:'Aamu'});var w=KK.addNode(P,k.id,300,40);
 var aj=KK.addBlock(P,'ajastin',{}),he=KK.addBlock(P,'tee',{do:'rivi',o:lst.id,tx:'Herätys'});
 var na=KK.addNode(P,aj.id,340,100,w.id),nh=KK.addNode(P,he.id,340,180,w.id);KK.addLink(P,na.id,'e',nh.id,'e');
 var k2=KK.addBlock(P,'ketju',{nm:'Tervehdys'});var w2=KK.addNode(P,k2.id,300,330);
 var tv=KK.addBlock(P,'tee',{do:'rivi',o:lst.id,tx:'Avattu'});KK.addNode(P,tv.id,340,390,w2.id);
 APP.renderAll();return [k.id,w.id,na.id,k2.id,w2.id,lst.id];})()"""
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b=await p.chromium.launch();errs=[]
            cx=await b.new_context(viewport={'width':W,'height':900},timezone_id='Europe/Helsinki',reduced_motion='reduce')
            await cx.clock.install(time='2026-10-15T06:59:40+03:00')
            pg=await cx.new_page();pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Kello');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            kid,wid,an,k2,w2,lid=await pg.evaluate(SETUP)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            def rows():return P(pg,"KK.listRows(P,'%s').map(r=>r.tx)"%lid)
            # --- ajastin kellonaikaan paneelista ---
            await pg.click('#lworld [data-nid="%s"] .lb'%an);await pg.wait_for_timeout(150)
            await pg.click('#insp [data-seg="tapa"][data-v="klo"]');await pg.wait_for_timeout(150)
            await pg.fill('#insp input[data-k="klo"]','25');await pg.wait_for_timeout(150)
            ins=await pg.inner_text('#insp');print(W,'1 virheellinen:','ei kelpaa' in ins);assert 'ei kelpaa' in ins
            await pg.fill('#insp input[data-k="klo"]','7.00');await pg.wait_for_timeout(150)
            ins=await pg.inner_text('#insp');lab=await pg.inner_text('#lworld [data-nid="%s"] .lb'%an)
            print(W,'2 kellonaika:',lab.replace('\n',' '),'|','kello on 7.00' in ins);assert 'klo 7.00' in lab and 'Odottaa, kunnes kello on 7.00' in ins
            tp=await P(pg,"[P.b[KK.nodeOf(P,'%s').p].tapa,P.b[KK.nodeOf(P,'%s').p].klo]"%(an,an));assert tp==['klo','7.00']
            # --- ▶: odottaa kello 7.00:aan ja jatkaa ---
            await pg.click('#lworld [data-nid="%s"] [data-kplay]'%wid);await pg.wait_for_timeout(150)
            st=await P(pg,"[P.st['%s'].run,new Date(P.st['%s'].tk[0].u).getHours(),new Date(P.st['%s'].tk[0].u).getMinutes()]"%(kid,kid,kid));print(W,'3 odottaa:',st);assert st==[True,7,0]
            assert await rows()==[]
            await pg.screenshot(path='versio76_kello_%d.png'%W)
            await pg.clock.run_for(25000);await pg.wait_for_timeout(200)
            r=await rows();print(W,'4 kello 7.00:',r);assert r==['Herätys']
            assert await P(pg,"P.st['%s'].run"%kid) is False
            # --- käynnisty, kun projekti avataan ---
            await pg.click('#lworld [data-nid="%s"] .ktl'%w2);await pg.wait_for_timeout(150)
            await pg.check('#insp input[data-k="avaus"]');await pg.wait_for_timeout(150)
            av=await P(pg,"P.b['%s'].avaus"%k2);ins=await pg.inner_text('#insp');print(W,'5 asetus:',av);assert av is True and 'käynnistyy kerran aina' in ins
            assert 'Mikään ei vielä käynnistä' not in ins
            await pg.evaluate("APP.saveNow()");await pg.wait_for_timeout(300);await pg.reload();await pg.wait_for_timeout(400)
            r=await rows();print(W,'6 uudelleenlataus:',r);assert r==['Herätys','Avattu']
            # projektin vaihto pois ja takaisin
            pid,oid=await pg.evaluate("(function(){var d=APP.data,o=KK.newProject('Toinen');d.projects.push(o);APP.saveNow();return [APP.P.id,o.id];})()")
            await pg.click('#projbtn');await pg.wait_for_timeout(200);await pg.click('[data-open="%s"]'%oid);await pg.wait_for_timeout(200)
            nm=await P(pg,"P.name");assert nm=='Toinen'
            await pg.click('#projbtn');await pg.wait_for_timeout(200);await pg.click('[data-open="%s"]'%pid);await pg.wait_for_timeout(250)
            r=await rows();print(W,'7 projektin vaihto:',r);assert r==['Herätys','Avattu','Avattu']
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            await pg.screenshot(path='versio76_avaus_%d.png'%W)
            # --- versio 7.7: paletin ketjuosio ja lisäysvalikko ryhmiteltyinä ---
            ps=await pg.locator('#pal .pt-s').all_inner_texts();print(W,'8 paletin ryhmät:',ps);assert [x for x in ps if x in ('Odotus','Haarat','Tekemiset')]==['Odotus','Haarat','Tekemiset']
            await pg.click('#lworld [data-nid="%s"] .ktl'%w2);await pg.wait_for_timeout(150)
            og=await pg.evaluate("[...document.querySelectorAll('#insp select[data-kadd=\"end\"] optgroup')].map(g=>g.label)");print(W,'9 valikon ryhmät:',og);assert og==['Odotus','Haarat','Ketjujen ohjaus','Toiminnot']
            await pg.select_option('#insp select[data-kadd="end"]','ajastin');await pg.wait_for_timeout(150)
            n=await P(pg,"KK.chainSteps(P,'%s').map(n=>P.b[n.p].k)"%k2);assert n==['tee','ajastin']
            print(W,'errs',errs);assert not errs
            await b.close()
asyncio.run(main())
