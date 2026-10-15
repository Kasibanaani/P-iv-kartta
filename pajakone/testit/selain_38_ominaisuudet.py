# Pajakone 4: viitattavat ominaisuudet selaimessa. Tietokone (1440, tumma tila 1280) ja puhelin (390 ja 320, kosketus).
# Ominaisuudet-osio (kiinni oletuksena, viitteet, ƒ tekee kaavan kohtaan o_<avain>), ohjattu leveys käytössä mutta
# perusarvo muokatessa (ƒ-merkki nimilapussa), toiminto Aseta ominaisuuteen ja Palauta (Mitä muutetaan -valinta),
# läpinäkyvyys, väri logiikasta, kertapainalluksen kyllä ↔ ei (painike palautuu ylös), Arvo-palikan yksikkö (min → s),
# kyllä vihreänä ja ei sinisenä logiikan arvoruuduissa, ruutu.leveys laitenäkymässä. Kuvat pajakone4_*.png.
# Testit ajetaan tietokoneen Chromiumissa, eivät oikealla iPhonella.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0].id;P.views[0].laite='puhelin';
 function U(k,o,x,y,w,h,nm){var b=KK.addBlock(P,k,o);b.x=x;b.y=y;if(w)b.w=w;if(h)b.h=h;if(nm)KK.setName(P,b.id,nm);return b;}
 function N(b,x,y){return KK.addNode(P,b.id,x,y);}
 var ko=U('saadin',{v:v,tx:'Koko',min:0,max:300,start:100},20,40,300,76,'Koko'),pa=U('nappi',{v:v,tx:'Pallo'},20,140,160,44,'Pallo');
 var va=U('nappi',{v:v,tx:'Valo',beh:'kerta',kv:'vaihto'},20,220,160,44,'Valo'),ot=U('nayta',{v:v,tx:'Otsikko'},20,300,300,40,'Otsikko');
 var lev=U('nayta',{v:v,tx:'L'},20,360,300,40,'Leveysteksti');
 var kes=KK.addBlock(P,'arvo',{v:'2',yks:'min'});KK.setName(P,kes.id,'Kesto');N(kes,600,500);
 var vn=N(va,0,600),otn=N(ot,600,600);
 var t=KK.addBlock(P,'tee',{do:'aseta',o:ot.id,om:'lpn',v:'60'});var tn=N(t,300,600);KK.addLink(P,vn.id,'e',tn.id,'e');
 var kk=KK.addBlock(P,'kaava',{});kk.f=KK.kaavaToIds(P,'"Ruutu " + ruutu.leveys');var kkn=N(kk,300,700);var levn=N(lev,600,700);KK.addLink(P,kkn.id,'v',levn.id,'tx');
 KK.repair(P);APP.renderAll();return {ko:ko.id,pa:pa.id,va:va.id,ot:ot.id,kes:kes.id,t:t.id,lev:lev.id};})()"""
async def leveys(pg,id):
    return await pg.evaluate("parseFloat(document.querySelector('.ue[data-id=\"%s\"]').style.width)"%id)
async def main():
    async with async_playwright() as p:
        # --- Tietokone: koko kulku ---
        for W,dark in ((1440,False),(1280,True)):
            b,pg,errs=await avaa(p,W,900,dark)
            await pg.fill('#wname','Ominaisuudet');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            # 1. Ominaisuudet-osio kiinni, viitteet näkyvät
            await pg.click('.ue[data-id="%s"]'%I['pa']);await pg.wait_for_timeout(150)
            assert await pg.locator('#omsec').count()==1
            assert not await pg.evaluate("document.querySelector('#omsec').open"),'oletuksena kiinni'
            await pg.click('#omsec summary');await pg.wait_for_timeout(100)
            refs=await pg.evaluate("[...document.querySelectorAll('#omsec .omref')].map(e=>e.textContent)")
            print(W,'1 viitteet:',refs[:12]);assert 'pallo.leveys' in refs and 'pallo.läpinäkyvyys' in refs and 'pallo.väri' in refs
            # 2. ƒ leveys → kaava → kirjoita koko * 2
            await pg.click('#omsec [data-omf="w"]');await pg.wait_for_timeout(200)
            ta=pg.locator('#insp textarea[data-kaava]');assert await ta.count()==1
            await ta.fill('koko * 2');await pg.wait_for_timeout(150)
            lk=await P(pg,"P.lg.l.some(l=>l.tp==='o_w'&&KK.nodeOf(P,l.t).p==='%s')"%I['pa']);assert lk,'nuoli kohtaan leveys'
            assert await P(pg,"E().omi('%s','w')"%I['pa'])==200
            # muokatessa perusarvo ja ƒ-merkki
            assert await leveys(pg,I['pa'])==160
            assert await pg.evaluate("document.querySelector('.ue[data-id=\"%s\"]').classList.contains('omdrv')"%I['pa'])
            # 3. Käytössä: leveys kaavasta, kertapainallus vaihtaa, Aseta läpinäkyvyys
            await pg.click('#lockbtn');await pg.wait_for_timeout(250)
            assert await leveys(pg,I['pa'])==200,'käytössä ohjattu leveys'
            await pg.click('.ue[data-id="%s"] button'%I['va']);await pg.wait_for_timeout(150)
            assert await P(pg,"E().val('%s')"%I['va'])==True
            assert not await pg.evaluate("document.querySelector('.ue[data-id=\"%s\"] button').classList.contains('on')"%I['va']),'kertapainallus palautuu ylös'
            op=await pg.evaluate("document.querySelector('.ue[data-id=\"%s\"]').style.opacity"%I['ot']);print(W,'3 läpinäkyvyys 60 % →',op);assert op=='0.4'
            await pg.click('.ue[data-id="%s"] button'%I['va']);await pg.wait_for_timeout(150);assert await P(pg,"E().val('%s')"%I['va'])==False
            assert await P(pg,"E().prop('%s','painalluksia')"%I['va'])==2
            # ruutu.leveys laitenäkymässä
            assert 'Ruutu 390' in await pg.inner_text('.ue[data-id="%s"]'%I['lev'])
            await pg.screenshot(path='pajakone4_kaytto_%d.png'%W)
            await pg.click('#lockbtn');await pg.wait_for_timeout(200)
            assert await leveys(pg,I['pa'])==160
            # 4. Logiikka: toiminnon Mitä muutetaan, kyllä/ei-värit, Arvon yksikkö
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(200)
            tn=await P(pg,"P.lg.n.find(n=>n.p==='%s').id"%I['t']);await pg.click('#lworld [data-nid="%s"] .lt'%tn);await pg.wait_for_timeout(150)
            opts=await pg.evaluate("[...document.querySelectorAll('#insp select[data-k=om] option')].map(o=>o.value)");print(W,'4 om:',opts[:6]);assert 'lpn' in opts and 'w' in opts
            it=await pg.inner_text('#insp');ln=await pg.inner_text('#lworld [data-nid="%s"]'%tn);print(W,'4 kuvaus:',ln.replace('\n',' '));assert 'Otsikko.läpinäkyvyys = 60' in ln
            await pg.evaluate("APP.P.st['%s']=true;APP.renderAll();"%I['ko'] if False else "(function(){var P=APP.P;P.st['as:%s']=true;APP.renderAll();})()"%I['va']);await pg.wait_for_timeout(150)
            col=await pg.evaluate("(function(){var on=document.querySelector('#lworld .lv.on'),off=document.querySelector('#lworld .lv.off');return [on?getComputedStyle(on).color:'',off?getComputedStyle(off).color:'']})()")
            print(W,'4 kyllä/ei-värit:',col);assert col[0] in ('rgb(27, 113, 64)','rgb(127, 217, 160)'),col
            kn=await P(pg,"P.lg.n.find(n=>n.p==='%s').id"%I['kes']);await pg.click('#lworld [data-nid="%s"] .lt'%kn);await pg.wait_for_timeout(150)
            assert await pg.locator('#insp select[data-k=yks]').count()==1;assert await P(pg,"E().val('%s')"%I['kes'])==120
            assert await pg.input_value('#insp select[data-k=yks]')=='min'
            await pg.screenshot(path='pajakone4_logiikka_%d.png'%W)
            # 5. Palauta: Aseta → Palauta
            await pg.evaluate("(function(){var P=APP.P;KK.setOmi(P,'%s','lpn',80);var t=KK.addBlock(P,'tee',{do:'palauta',o:'%s'});KK.addNode(P,t.id,900,900);KK.runAction(P,t.id,APP.ctx(),0);})()"%(I['ot'],I['ot']))
            assert await P(pg,"P.st['o:%s']===undefined"%I['ot'])
            print(W,'errs',errs);assert not errs;await b.close()
        # --- Puhelin: käyttö ja paneeli kosketuksella ---
        b=await p.chromium.launch()
        for W in (390,320):
            ctx=await b.new_context(viewport={'width':W,'height':844},has_touch=True,is_mobile=True,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            async def tap(sel):
                bb=await pg.locator(sel).first.bounding_box();await pg.touchscreen.tap(bb['x']+bb['width']/2,bb['y']+bb['height']/2);await pg.wait_for_timeout(200)
            await pg.fill('#wname','Puhelin');await tap('#wcreate')
            I=await pg.evaluate(SETUP)
            await pg.evaluate("(function(){var P=APP.P,b=P.b['%s'];b.ohk=['w'];var k=KK.addBlock(P,'kaava',{});k.f=KK.kaavaToIds(P,'koko + 80');var kn=KK.addNode(P,k.id,0,900);var pn=KK.addNode(P,b.id,300,900);KK.addLink(P,kn.id,'v',pn.id,'o_w');KK.repair(P);APP.renderAll();})()"%I['pa'])
            await pg.evaluate("document.querySelector('#lockbtn').click()");await pg.wait_for_timeout(250);assert await P(pg,'P.lock')
            w=await leveys(pg,I['pa']);print(W,'puhelin leveys',w);assert w==180
            await tap('.ue[data-id="%s"] button'%I['va']);vv=await P(pg,"[E().val('%s'),P.st['%s'],P.lock]"%(I['va'],I['va']));print(W,'valo',vv);assert vv[0]==True
            await pg.screenshot(path='pajakone4_puhelin_%d.png'%W)
            await pg.evaluate("document.querySelector('#lockbtn').click()");await pg.wait_for_timeout(200)
            await pg.evaluate("APP.S.sel={t:'b',id:'%s'};APP.renderAll();"%I['pa']);await pg.wait_for_timeout(150)
            if await pg.locator('#mins').is_visible():await tap('#mins')
            assert await pg.locator('#omsec').count()==1
            await tap('#omsec summary');rows=await pg.locator('#omsec .omr').count();assert rows>8
            ow=await pg.evaluate("document.querySelector('#omsec').scrollWidth<=document.querySelector('#omsec').clientWidth+1");assert ow,'ei vaakavieritystä'
            await pg.screenshot(path='pajakone4_puhelin_paneeli_%d.png'%W)
            print(W,'errs',errs);assert not errs;await ctx.close()
        await b.close()
asyncio.run(main())
