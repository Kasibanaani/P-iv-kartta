# Versio 6.3: ajastin selaimessa. Ajastin paletista ketjuun (kytkeytyy edelliseen), kesto ja yksikkö paneelista,
# ▶ → haara odottaa ajastimessa (korostus ja jäljellä oleva aika), ketju jatkuu ajan kuluttua, tila säilyy sivun
# uudelleenlatauksen yli, ja kun appi on ollut kiinni pidempään kuin kesto, ketju jatkuu heti avattaessa. Kuvat versio63_*.png.
import asyncio,time
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P;
 var lst=KK.addBlock(P,'lista',{tx:'Loki',nm:'Loki',v:P.views[0].id});lst.x=80;lst.y=160;
 var k=KK.addBlock(P,'ketju',{nm:'Odotus'});var w=KK.addNode(P,k.id,330,60);
 var a=KK.addBlock(P,'tee',{do:'rivi',o:lst.id,tx:'Ennen'});var na=KK.addNode(P,a.id,370,120,w.id);
 APP.renderAll();return [k.id,w.id,na.id,lst.id];})()"""
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Ajastin');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            kid,wid,na,lid=await pg.evaluate(SETUP)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            def rows():return P(pg,"KK.listRows(P,'%s').map(r=>r.tx)"%lid)
            # --- ajastin paletista ketjuun ---
            r=await pg.locator('#lworld [data-nid="%s"]'%wid).bounding_box()
            l=pg.locator('#pal .chip[data-make*=\'"k":"ajastin"\']').first;await l.scroll_into_view_if_needed();c0=await l.bounding_box()
            await veda(pg,[c0['x']+c0['width']/2,c0['y']+c0['height']/2],[r['x']+110,r['y']+150]);await pg.wait_for_timeout(200)
            tn=await P(pg,"P.lg.n.find(n=>P.b[n.p].k==='ajastin').id")
            ln=await P(pg,"P.lg.l.some(l=>l.f==='%s'&&l.t==='%s')"%(na,tn));print(W,'1 ajastin kytkeytyi:',ln);assert ln
            # kesto 2 s paneelista
            await pg.fill('#insp input[data-k="kesto"]','2');await pg.wait_for_timeout(100)
            await pg.click('#insp [data-seg="yks"][data-v="min"]');await pg.wait_for_timeout(100)
            ms=await P(pg,"KK.timerMs(P,KK.nodeOf(P,'%s').p,APP.ctx())"%tn);print(W,'2 kesto 2 min:',ms);assert ms==120000
            await pg.click('#insp [data-seg="yks"][data-v="s"]');await pg.wait_for_timeout(100)
            lab=await pg.inner_text('#lworld [data-nid="%s"] .lt'%tn);print(W,'3 nimi:',lab);assert 'Odota' in lab and '2 s' in lab
            # jatko ajastimen perään
            await pg.select_option('#insp select[data-kadd="after"]','tee:rivi');await pg.wait_for_timeout(200)
            await pg.select_option('#insp select[data-k="o"]',lid);await pg.wait_for_timeout(100)
            await pg.fill('#insp input[data-k="tx"]','Jälkeen');await pg.wait_for_timeout(150)
            order=await P(pg,"KK.chainOrder(P,'%s').map(id=>P.b[KK.nodeOf(P,id).p].k)"%kid);print(W,'4 järjestys:',order);assert order==['tee','ajastin','tee']
            # --- käynnistys: odottaa ajastimessa ---
            await pg.click('#lworld [data-nid="%s"] [data-kplay]'%wid);await pg.wait_for_timeout(300)
            rr=await rows();run=await pg.locator('#lworld [data-nid="%s"].krun'%tn).count();left=await pg.inner_text('#lworld [data-nid="%s"] .kleft'%tn)
            hd=await pg.inner_text('#lworld [data-nid="%s"] .wh'%wid)
            print(W,'5 odottaa:',rr,run,left,'|',hd.replace('\n',' '));assert rr==['Ennen'] and run==1 and '0:0' in left and 'käynnissä' in hd
            await pg.click('#lworld [data-nid="%s"] .lb'%tn);await pg.wait_for_timeout(150)
            ins=await pg.inner_text('#insp');assert 'Käynnissä: alkoi klo' in ins and 'Kun appi on kiinni, mitään ei tapahdu' in ins
            await pg.screenshot(path='versio63_odottaa_%d.png'%W)
            await pg.wait_for_timeout(2400)
            rr=await rows();run=await pg.locator('#lworld .ln.krun').count();print(W,'6 ajan kuluttua:',rr,run);assert rr==['Ennen','Jälkeen'] and run==0
            # --- uudelleenlataus kesken odotuksen ---
            await pg.evaluate("KK.nodeOf(APP.P,'%s')&&(APP.P.b[KK.nodeOf(APP.P,'%s').p].kesto=3)"%(tn,tn))
            await pg.click('#lworld [data-nid="%s"] [data-kplay]'%wid);await pg.wait_for_timeout(200);await pg.evaluate("APP.saveNow()");await pg.wait_for_timeout(300)
            await pg.reload();await pg.wait_for_timeout(400)
            rr=await rows();runv=await P(pg,"P.st['%s'].run"%kid);print(W,'7 latauksen jälkeen:',rr,runv);assert rr==['Ennen','Jälkeen','Ennen'] and runv
            await pg.wait_for_timeout(3200)
            rr=await rows();print(W,'8 jatkui:',rr);assert rr[-1]=='Jälkeen' and len(rr)==4
            # --- appi kiinni pidempään kuin kesto: jatkuu heti avattaessa ---
            await pg.evaluate("KK.chainStart(APP.P,'%s',APP.ctx());APP.saveNow()"%kid)
            u=await pg.evaluate("location.href");await pg.goto('about:blank');time.sleep(3.4);await pg.goto(u);await pg.wait_for_timeout(250)
            rr=await rows();print(W,'9 avattaessa heti:',rr[-2:],len(rr));assert len(rr)==6 and rr[-1]=='Jälkeen'
            print(W,'errs',errs);assert not errs
            await b.close()
asyncio.run(main())
