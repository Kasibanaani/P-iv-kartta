# Appi-appi 11 (suunnitelma P1a): tekstin ominaisuusviite ja viitatun palikan poisto selaimessa. Tietokone 1440 ja 1280 (tumma).
# ＋ Viittaus -valikko: palikka → Arvo tai .ominaisuus; teksti näyttää saman arvon kuin kaava. Poisto Delete-näppäimellä:
# vaikutuslista (Peru säilyttää kaiken, Poista silti poistaa), ⚠-merkki logiikassa ja näkymässä, Palikat-napin ⚠-luku,
# Viitevirheet-lista, rivi vie palikkaan, uuden kohteen valinta korjaa, Kumoa palauttaa alkuperäisen. Viittaamaton poisto ilman kysymystä.
# Kuvat appiappi11_*.png. Testit ajetaan tietokoneen Chromiumissa, eivät oikealla iPhonella.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0].id;
 function U(k,o,x,y,w,h,nm){var b=KK.addBlock(P,k,o);b.x=x;b.y=y;if(w)b.w=w;if(h)b.h=h;if(nm)KK.setName(P,b.id,nm);return b;}
 function N(b,x,y){return KK.addNode(P,b.id,x,y);}
 var pis=KK.addBlock(P,'arvo',{v:'5'});KK.setName(P,pis.id,'Pisteet');N(pis,80,80);
 var ots=U('nayta',{v:v,tx:'Otsikko'},20,40,300,40,'Otsikko');
 var tu=U('nayta',{v:v,tx:''},20,120,320,40,'Tulostus');tu.tx=KK.toIds(P,'Pisteitä {pisteet.arvo}, otsikko näkyy: {otsikko.näkyy}');
 var kf=KK.addBlock(P,'kaava',{});kf.f=KK.kaavaToIds(P,'pisteet + 1');N(kf,320,80);
 var tee=KK.addBlock(P,'tee',{do:'aseta',o:pis.id,v:'3'});N(tee,320,200);
 var irto=KK.addBlock(P,'arvo',{v:'1'});KK.setName(P,irto.id,'Irto');N(irto,80,320);
 KK.repair(P);APP.renderAll();return {pis:pis.id,ots:ots.id,tu:tu.id,kf:kf.id,tee:tee.id,irto:irto.id};})()"""
def nsel(pg_ids,bid): return None
async def node(pg,bid):
    nid=await P(pg,"KK.nodesOfBlock(P,'%s')[0].id"%bid);return '#lworld .ln[data-nid="%s"]'%nid
async def main():
    async with async_playwright() as p:
        for W,dark in ((1440,False),(1280,True)):
            b,pg,errs=await avaa(p,W,900,dark)
            await pg.fill('#wname','Viitteet');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            await pg.evaluate("APP.data.cfg.viit='{'")  # jonon 12f: tämä testi tarkistaa { }-viittaustavan (oletus on @, ks. selain_94)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(150)
            # 1. Tekstin ominaisuusviite näyttää saman arvon kuin kaava
            t=await pg.inner_text('.ue[data-id="%s"]'%I['tu']);print(W,'1 teksti:',t);assert 'Pisteitä 5, otsikko näkyy: kyllä' in t
            # 2. ＋ Viittaus: palikka, sitten arvo tai ominaisuus
            await pg.click('.ue[data-id="%s"]'%I['ots']);await pg.wait_for_timeout(150)
            await pg.fill('#insp input[data-k="tx"]','Otsikko ');await pg.dispatch_event('#insp input[data-k="tx"]','change');await pg.wait_for_timeout(100)
            await pg.click('#insp [data-ins="tx"]');await pg.wait_for_timeout(100)
            await pg.click('#menu button:text-is("Pisteet")');await pg.wait_for_timeout(150)
            sub=await pg.evaluate("[...document.querySelectorAll('#menu .mh,#menu button')].map(e=>e.textContent)");print(W,'2 alavalikko:',sub[:6]);assert sub[0].startswith('Pisteet') and 'Arvo' in sub
            props=[x for x in sub if x.startswith('.')];assert props,'ominaisuuksia valikossa'
            await pg.click('#menu button:text-is("%s")'%props[0]);await pg.wait_for_timeout(150)
            tx=await P(pg,"P.b['%s'].tx"%I['ots']);print(W,'2 tallennettu:',tx);assert tx.startswith('Otsikko {#%s.'%I['pis'])
            shown=await pg.input_value('#insp input[data-k="tx"]');assert shown.startswith('Otsikko {pisteet.'),shown
            # 3. Poisto: viittaamaton heti, viitattu kysyy
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(200)
            await pg.click(await node(pg,I['irto']));await pg.keyboard.press('Delete');await pg.wait_for_timeout(150)
            assert not await pg.evaluate("document.querySelector('#sheetbg').classList.contains('show')"),'viittaamaton: ei kysymystä'
            assert await P(pg,"!P.b['%s']"%I['irto'])
            await pg.click(await node(pg,I['pis']));await pg.keyboard.press('Delete');await pg.wait_for_timeout(150)
            assert await pg.evaluate("document.querySelector('#sheetbg').classList.contains('show')")
            rows=await pg.evaluate("[...document.querySelectorAll('#sheet tbody tr')].map(r=>r.innerText.replace(/\\s+/g,' '))");print(W,'3 vaikutukset:',rows)
            assert len(rows)==4 and any('Tulostus' in r and 'tekstissä' in r for r in rows) and any('kaavassa' in r for r in rows) and any('toiminnon kohde' in r for r in rows)
            await pg.screenshot(path='appiappi11_poisto_%d.png'%W)
            await pg.click('#sheet [data-x="delno"]');await pg.wait_for_timeout(150)
            assert await P(pg,"!!P.b['%s']&&!P.pois"%I['pis']),'Peru säilyttää kaiken'
            await pg.click(await node(pg,I['pis']));await pg.keyboard.press('Delete');await pg.wait_for_timeout(150)
            await pg.click('#sheet [data-x="delok"]');await pg.wait_for_timeout(200)
            assert await P(pg,"!P.b['%s']&&P.pois['%s'].vt==='pisteet'"%(I['pis'],I['pis']))
            # 4. Merkit: logiikka, Palikat-nappi, näkymä
            assert await pg.locator('%s .brkm'%(await node(pg,I['kf']))).count()==1
            assert await pg.locator('%s .brkm'%(await node(pg,I['tee']))).count()==1
            lb=await pg.inner_text('#listbtn');print(W,'4 palikat-nappi:',lb);assert '⚠ 4' in lb
            kt=await pg.inner_text(await node(pg,I['kf']));assert '⚠pisteet' in kt,kt
            await pg.screenshot(path='appiappi11_logiikka_%d.png'%W)
            await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(150)
            t=await pg.inner_text('.ue[data-id="%s"]'%I['tu']);print(W,'4 teksti:',t);assert '⚠ kohde poistettu: pisteet' in t
            assert await pg.evaluate("document.querySelector('.ue[data-id=\"%s\"]').classList.contains('brk-ui')"%I['tu'])
            await pg.click('.ue[data-id="%s"]'%I['tu']);await pg.wait_for_timeout(150)
            assert await pg.input_value('#insp input[data-k="tx"]')=='Pisteitä {⚠pisteet.arvo}, otsikko näkyy: {otsikko.näkyy}'
            await pg.screenshot(path='appiappi11_nakyma_%d.png'%W)
            # 5. Kumoa palauttaa alkuperäisen tunnisteella; uudelleen poisto
            await pg.click('#undobtn');await pg.wait_for_timeout(200)
            assert await P(pg,"!!P.b['%s']&&KK.brokenRefs(P).length===0"%I['pis']);t=await pg.inner_text('.ue[data-id="%s"]'%I['tu']);assert 'Pisteitä 5' in t
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(200)
            await pg.click(await node(pg,I['pis']));await pg.keyboard.press('Delete');await pg.wait_for_timeout(150);await pg.click('#sheet [data-x="delok"]');await pg.wait_for_timeout(200)
            # 6. Viitevirheet-lista, rivi vie palikkaan, uusi kohde
            uusi=await pg.evaluate("(function(){var P=APP.P,b=KK.addBlock(P,'arvo',{v:'8'});KK.setName(P,b.id,'Pisteet');KK.addNode(P,b.id,80,420);APP.renderAll();return b.id;})()")
            assert await P(pg,"KK.brokenRefs(P).length")==4,'samanniminen ei peri'
            await pg.click('#listbtn');await pg.wait_for_timeout(200)
            br=await pg.evaluate("[...document.querySelectorAll('#bltab h4.errt + table tbody tr')].map(r=>r.innerText.replace(/\\s+/g,' '))");print(W,'6 viitevirheet:',br)
            assert len(br)==4 and all('Kohde poistettu: pisteet' in r for r in br)
            await pg.screenshot(path='appiappi11_lista_%d.png'%W)
            await pg.click('#bltab h4.errt + table tbody tr:has-text("Kaava")');await pg.wait_for_timeout(250)
            assert await pg.locator('#insp .brk').count()==1
            await pg.select_option('#insp select[data-relink]',uusi);await pg.wait_for_timeout(200)
            assert await P(pg,"E().val('%s')"%I['kf'])==9;assert await P(pg,"KK.brokenRefs(P).length")==3
            assert await pg.locator('#insp .brk').count()==0
            print('errs',errs);await b.close()
asyncio.run(main())
