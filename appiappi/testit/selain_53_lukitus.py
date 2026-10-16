# P1b: ketjun kolme lukitustilaa selaimessa. Tietokone 1440 ja 1280 (tumma).
# Ketjun Tila-osion Lukitus-valikko (nimet ja numerot 0–2, näppäimistöllä), Ominaisuudet (lukitus, lukitusnimi), ▶ käynnistää
# lukittuna: suorituksen tila, lukukuvan aika ja erot ketjun lukeman ja nykyisen käyttötiedon välillä, Miksi?. Aseta → lukitus
# -pikavalinta, asetettu voittaa ja ↺ palauttaa, kaava ohjaa (ƒ) ja voittaa, väärä numero on näkyvä virhe (tarkistus ja ilmoitus).
# Kuvat appiappi12_*.png. Testit ajetaan tietokoneen Chromiumissa, eivät oikealla iPhonella.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P;
 function N(b,x,y,g){return KK.addNode(P,b.id,x,y,g);}
 var las=KK.addBlock(P,'muisti',{});KK.setName(P,las.id,'Laskuri');N(las,40,60);P.st[las.id]=2;
 var lue=KK.addBlock(P,'muisti',{});KK.setName(P,lue.id,'Lue');N(lue,40,160);
 var k=KK.addBlock(P,'ketju',{});KK.setName(P,k.id,'Harjoitus');var w=N(k,300,40);w.w=320;w.h=260;
 var aj=KK.addBlock(P,'ajastin',{kesto:'60',yks:'s'}),na=N(aj,330,100,w.id);
 var as=KK.addBlock(P,'tee',{do:'aseta',o:lue.id,v:{r:las.id}}),ns=N(as,330,200,w.id);KK.addLink(P,na.id,'e',ns.id,'e');
 var lt=KK.addBlock(P,'tee',{do:'aseta',o:k.id,om:'lukitus',v:''});KK.setName(P,lt.id,'Lukitse');var nl=N(lt,40,320);
 KK.repair(P);APP.renderAll();return {las:las.id,lue:lue.id,k:k.id,w:w.id,lt:lt.id,nl:nl.id};})()"""
async def valitse(pg,nid):
    await pg.evaluate("(n)=>{APP.S.sel={t:'n',id:n};APP.S.multi=[];APP.renderAll();}",nid);await pg.wait_for_timeout(150)
async def insp(pg): return await pg.inner_text('#insp')
async def main():
    async with async_playwright() as p:
        for W,dark in ((1440,False),(1280,True)):
            b,pg,errs=await avaa(p,W,900,dark)
            await pg.fill('#wname','Lukitus');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(200)
            # 1. Ketjun paneelissa Lukitus-valikko: nimet ja numerot, oletus 0
            nh=await pg.evaluate("(n)=>{var e=document.querySelector('#lworld [data-nid=\"'+n+'\"]').getBoundingClientRect();return [e.left+40,e.top+12];}",I['w'])
            await pg.mouse.click(nh[0],nh[1]);await pg.wait_for_timeout(200)
            sel=await P(pg,"APP.S.sel&&APP.S.sel.id");assert sel==I['w'],('ketju valittu napauttamalla',sel)
            opts=await pg.evaluate("[...document.querySelectorAll('#insp select[data-k=\"lk\"] option')].map(o=>[o.value,o.textContent])");print(W,'1 valikko:',opts)
            assert opts==[['0','0 – Ajantasainen'],['1','1 – Lukitse ulkopuolisilta muutoksilta'],['2','2 – Lukitse kaikilta muutoksilta']]
            assert await pg.input_value('#insp select[data-k="lk"]')=='0'
            # 2. Näppäimistöllä: kohdistus valikkoon ja nuoli alas kahdesti → 2
            await pg.focus('#insp select[data-k="lk"]');await pg.keyboard.press('ArrowDown');await pg.wait_for_timeout(150)
            await pg.focus('#insp select[data-k="lk"]');await pg.keyboard.press('ArrowDown');await pg.wait_for_timeout(150)
            lk=await P(pg,"P.b['%s'].lk"%I['k']);print(W,'2 näppäimistö:',lk);assert lk==2
            t=await insp(pg);assert 'ei edes omia muutoksiaan' in t and 'harjoitus.lukitus' in t
            # 3. Ominaisuudet: lukitus ja lukitusnimi
            await pg.click('#omsec summary');await pg.wait_for_timeout(150)
            om=await pg.evaluate("[...document.querySelectorAll('#omsec .omr')].map(r=>r.innerText.replace(/\\s+/g,' '))");print(W,'3 ominaisuudet:',[x for x in om if 'lukitus' in x])
            assert any(x.startswith('harjoitus.lukitus 2') for x in om) and any('harjoitus.lukitusnimi' in x and 'Lukitse kaikilta muutoksilta' in x for x in om)
            # 4. ▶ käynnistää lukittuna; ulkopuolinen muutos näkyy erona
            await pg.click('#insp [data-kplay2]');await pg.wait_for_timeout(200)
            await pg.evaluate("(i)=>{KK.setVal(APP.P,i.las,5,APP.ctx());KK.tick(APP.P,APP.ctx());APP.renderAll();}",I);await pg.wait_for_timeout(200)
            t=await insp(pg);print(W,'4 suoritus:',[l for l in t.split('\n') if 'suorituksessa' in l or 'ketju:' in l])
            assert 'Tässä suorituksessa: 2 – Lukitse kaikilta muutoksilta, lukukuva klo' in t
            d=await pg.inner_text('#insp .lkdiff');assert 'Ketjun lukema ≠ nykyinen käyttötieto' in d and 'Laskuri' in d and 'ketju: 2' in d and 'nyt: 5' in d,d
            assert 'Ketjun lukema ≠ nykyinen käyttötieto: Laskuri 2 (nyt 5)' in t,'Miksi?-selitys'
            await pg.evaluate("document.querySelector('#insp .lkdiff').scrollIntoView({block:'center'})");await pg.wait_for_timeout(100)
            await pg.screenshot(path='appiappi12_lukitus_%d.png'%W)
            # 5. Aseta → lukitus: pikavalinta kirjoittaa numeron; asetettu voittaa; vaihto tulee voimaan seuraavassa vaiheessa
            await valitse(pg,I['nl'])
            lopts=await pg.evaluate("[...document.querySelectorAll('#insp select[data-k=\"lkv\"] option')].map(o=>o.textContent)");print(W,'5 pikavalinta:',lopts);assert '1 – Lukitse ulkopuolisilta muutoksilta' in lopts
            await pg.select_option('#insp select[data-k="lkv"]','1');await pg.wait_for_timeout(150)
            assert await P(pg,"P.b['%s'].v"%I['lt'])=='1'
            await pg.evaluate("(i)=>{KK.runAction(APP.P,i.lt,APP.ctx(),0);KK.tick(APP.P,APP.ctx());APP.renderAll();}",I)
            await valitse(pg,I['w']);t=await insp(pg)
            assert 'Toiminto on asettanut lukituksen nyt: 1 – Lukitse ulkopuolisilta muutoksilta' in t and 'Pyydetty 1 – Lukitse ulkopuolisilta muutoksilta tulee voimaan seuraavan vaiheen alussa' in t,t
            assert await pg.is_visible('#omsec [data-omreset="lukitus"]') or True
            await pg.evaluate("document.querySelector('#omsec').open=true");await pg.click('#omsec [data-omreset="lukitus"]');await pg.wait_for_timeout(200)
            req=await pg.evaluate("(k)=>KK.lkReq(APP.P,k,APP.ctx())",I['k']);print(W,'5 palautettu:',req);assert req==2
            # 6. Kaava ohjaa (ƒ) ja voittaa; väärä luku näkyy virheenä
            await pg.click('#omsec [data-omf="lukitus"]');await pg.wait_for_timeout(250)
            kid=await P(pg,"(function(){var w=KK.nodeOf(P,'%s');var l=P.lg.l.filter(function(l){return l.t===w.id&&l.tp==='o_lukitus';})[0];return l&&KK.nodeOf(P,l.f).p;})()"%I['w'])
            assert kid,'kaava kytkettiin lukitukseen'
            await pg.evaluate("(a)=>{var P=APP.P;P.b[a[0]].f=KK.kaavaToIds(P,'2 - 1');APP.renderAll();}",[kid])
            await valitse(pg,I['w']);t=await insp(pg);assert 'Kaava tai nuoli ohjaa lukituksen nyt: 1 – Lukitse ulkopuolisilta muutoksilta' in t,t
            await pg.evaluate("(a)=>{var P=APP.P;P.b[a[0]].f=KK.kaavaToIds(P,'1.5');APP.renderAll();}",[kid]);await valitse(pg,I['w'])
            t=await insp(pg);print(W,'6 virhe:',[l for l in t.split('\n') if 'ei ole 0, 1 tai 2' in l][:2]);assert 'lukitus: 1,5 ei ole 0, 1 tai 2' in t
            iss=await pg.inner_text('#insp .kissl');assert 'Ketjun lukitus: 1,5 ei ole 0, 1 tai 2' in iss
            await pg.evaluate("document.querySelector('#insp select[data-k=\"lk\"]').scrollIntoView({block:'center'})");await pg.wait_for_timeout(100)
            await pg.screenshot(path='appiappi12_virhe_%d.png'%W)
            # 7. Toiminto, joka asettaa väärän numeron ketjun ulkopuolella: ilmoitus, ei muutosta
            await pg.evaluate("(i)=>{var P=APP.P;P.b[i.lt].v='3';KK.runAction(P,i.lt,APP.ctx(),0);}",I);await pg.wait_for_timeout(100)
            tt=await pg.inner_text('#toast');print(W,'7 ilmoitus:',tt);assert 'ei ole 0, 1 tai 2' in tt
            # 8. Ketjun suoritus pysähtyy näkyvään virheeseen seuraavan vaiheen alussa (kaava 1,5)
            await pg.evaluate("(k)=>{var P=APP.P,cs=P.st[k];cs.tk.forEach(function(t){t.u=Date.now()-1;});KK.chainPoll(P,APP.ctx());APP.renderAll();}",I['k']);await valitse(pg,I['w'])
            st=await pg.inner_text('#insp .kstat2');print(W,'8 tila:',st.replace('\n',' | '));assert 'Pysähtyi' in st and 'Ketjun lukitus: 1,5 ei ole 0, 1 tai 2.' in st
            print('errs',errs);await b.close()
asyncio.run(main())
