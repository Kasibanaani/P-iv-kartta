# Pajakone 2: Käyrä selaimessa. Palikka paletista, nuoli säätimestä syötteeseen, palikassa väli ja minikäyrä,
# paneeli (välit, tarkkuus, nykyinen x ja tulos), käyräikkuna: portaiden määrä, valmis muoto, portaan veto hiirellä,
# portaan y-arvo kirjoittamalla, Kokeile-säädin (ei muuta oikeaa syötettä), Kumoa, Valmis; lukittu näkymä: säätimen
# liike muuttaa tekstiä {käyrä}; tallennus ja uudelleenavaus. Kuvat pajakone2_kayra_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0].id;
 var sl=KK.addBlock(P,'saadin',{tx:'Kaasu',nm:'Kaasu',v:v,min:0,max:10,start:5});sl.x=80;sl.y=80;
 var tx=KK.addBlock(P,'nayta',{nm:'Nopeus',v:v});tx.x=80;tx.y=200;
 KK.addNode(P,sl.id,40,60);APP.renderAll();return [sl.id,tx.id];})()"""
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Kiihdytys');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            sid,tid=await pg.evaluate(SETUP)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            # --- 1. Paletista ---
            l=pg.locator('#pal .chip[data-make*=\'"k":"kayra"\']').first;await l.scroll_into_view_if_needed();c0=await l.bounding_box()
            st=await pg.locator('#lvp').bounding_box()
            await veda(pg,[c0['x']+c0['width']/2,c0['y']+c0['height']/2],[st['x']+st['width']*0.55,st['y']+200]);await pg.wait_for_timeout(200)
            kid=await P(pg,"Object.values(P.b).find(b=>b.k==='kayra').id");kn=await P(pg,"P.lg.n.find(n=>P.b[n.p].k==='kayra').id")
            hint=await pg.get_attribute('#pal .chip[data-make*=\'"k":"kayra"\']','title');assert 'syötteen' in hint,hint
            lab=await pg.inner_text('#lworld [data-nid="%s"] .lt'%kn);print(W,'1 palikka:',lab);assert '0–10 → 0–100' in lab
            assert await pg.locator('#lworld [data-nid="%s"] svg.sdmn'%kn).count()==1
            # --- 2. Nuoli säätimestä syötteeseen (moottorin kautta), arvo palikassa ja paneelissa ---
            sn=await P(pg,"P.lg.n.find(n=>n.p==='%s').id"%sid)
            assert await pg.evaluate("KK.addLink(APP.P,'%s','v','%s','a')"%(sn,kn));await pg.evaluate("APP.renderAll()");await pg.wait_for_timeout(150)
            await pg.click('#lworld [data-nid="%s"] .lt'%kn);await pg.wait_for_timeout(150)
            assert abs(await P(pg,"E().val('%s')"%kid)-50)<1e-9
            chip=await pg.inner_text('#lworld [data-nid="%s"] .lv'%kn);assert chip.strip()=='50',chip
            ins=await pg.inner_text('#insp');assert 'x = 5' in ins and 'käyrä.x' in ins,ins[:400]
            # Viite käyttöön tekstissä
            await pg.evaluate("(function(){var t=APP.P.b['%s'];t.tx=KK.toIds(APP.P,'Nopeus {käyrä}');APP.renderAll();})()"%tid)
            # --- 3. Käyräikkuna: muoto, portaat, veto, kirjoitus ---
            await pg.click('#insp [data-do="kayraed"] >> nth=0');await pg.wait_for_timeout(200)
            assert await pg.is_visible('#kdg')
            await pg.click('#sheet [data-kdp="kiihtyy"]');await pg.wait_for_timeout(150)
            pw=await P(pg,"P.b['%s'].pw"%kid);print(W,'3 kiihtyy:',pw);assert pw[0]==0 and pw[-1]==100 and pw[2]<40
            y=await P(pg,"E().val('%s')"%kid);assert y<40,y
            await pg.click('#sheet [data-kdn="7"]');await pg.wait_for_timeout(150)
            assert await P(pg,"[P.b['%s'].pn,P.b['%s'].pw.length]"%(kid,kid))==[7,7]
            assert await pg.locator('#kdg circle.sdp').count()==7
            # Veto: porras 4 (keskellä) ylös
            c=await pg.locator('#kdg circle[data-kdi="3"]').bounding_box();cx,cy=c['x']+c['width']/2,c['y']+c['height']/2
            g=await pg.locator('#kdg').bounding_box()
            await veda(pg,[cx,cy],[cx,g['y']+g['height']*0.2])
            p4=await P(pg,"P.b['%s'].pw[3]"%kid);print(W,'3 veto: porras 4 =',p4);assert p4>80
            yv=await P(pg,"E().val('%s')"%kid);assert abs(yv-p4)<1e-6,'x=5 on keskimmäinen porras'
            # Kirjoitus y-arvona
            await pg.fill('#sheet input[data-kdw="3"]','60');await pg.wait_for_timeout(150)
            assert abs(await P(pg,"P.b['%s'].pw[3]"%kid)-60)<1e-9 and abs(await P(pg,"E().val('%s')"%kid)-60)<1e-9
            # Kokeile-säädin ei muuta oikeaa syötettä
            await pg.evaluate("(function(){var r=document.querySelector('#kdt');r.value=r.max;r.dispatchEvent(new Event('input',{bubbles:true}));})()");await pg.wait_for_timeout(100)
            tv=await pg.inner_text('#kdtv');print(W,'3 kokeile:',tv);assert 'x 10 → y 100' in tv
            assert abs(await P(pg,"E().val('%s')"%kid)-60)<1e-9
            await pg.screenshot(path='pajakone2_kayra_ikkuna_%d.png'%W)
            # Kumoa palauttaa edellisen portaan
            await pg.click('#sheet [data-x="close"]');await pg.wait_for_timeout(100)
            await pg.click('#undobtn');await pg.wait_for_timeout(150)
            assert abs(await P(pg,"P.b['%s'].pw[3]"%kid)-60)>1e-6,'kumoa'
            await pg.click('#redobtn');await pg.wait_for_timeout(150)
            # --- 4. Tarkkuus ---
            await pg.click('#lworld [data-nid="%s"] .lt'%kn);await pg.wait_for_timeout(150)
            await pg.click('#insp [data-seg="dec"][data-v="0"]');await pg.wait_for_timeout(120)
            assert await P(pg,"P.b['%s'].dec"%kid)==0
            # --- 5. Lukittu näkymä: säädin muuttaa tekstiä ---
            await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(150)
            await pg.click('#lockbtn');await pg.wait_for_timeout(200)
            await pg.evaluate("(function(){var r=document.querySelector('.ue[data-id=\"%s\"] input[type=range]');r.value=10;r.dispatchEvent(new Event('input',{bubbles:true}));r.dispatchEvent(new Event('change',{bubbles:true}));})()"%sid);await pg.wait_for_timeout(150)
            t=await pg.inner_text('.ue[data-id="%s"]'%tid);print(W,'5 teksti:',t);assert 'Nopeus 100' in t
            await pg.evaluate("(function(){var r=document.querySelector('.ue[data-id=\"%s\"] input[type=range]');r.value=0;r.dispatchEvent(new Event('input',{bubbles:true}));r.dispatchEvent(new Event('change',{bubbles:true}));})()"%sid);await pg.wait_for_timeout(150)
            t=await pg.inner_text('.ue[data-id="%s"]'%tid);assert 'Nopeus 0' in t,t
            await pg.screenshot(path='pajakone2_kayra_kaytto_%d.png'%W)
            # --- 6. Tallennus ---
            await pg.evaluate("APP.saveNow&&APP.saveNow()");await pg.reload();await pg.wait_for_timeout(300)
            r=await P(pg,"[P.b['%s'].k,P.b['%s'].pn,P.b['%s'].dec]"%(kid,kid,kid));assert r==['kayra',7,0],r
            print(W,'errs',errs);assert not errs;await b.close()
asyncio.run(main())
