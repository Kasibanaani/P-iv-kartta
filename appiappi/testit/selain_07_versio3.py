# Versio 3: pikaluonti (vaihtoehtoryhmä lukuineen ja kyllä/ei-kysymys), käyttö lukittuna, hakutaulukko paletista
# ja paneelista, pikatoiminto ”Arvo, kun valittu”, piilotuksen vaihtoehdot (vain luettava, syy, pois laskuista)
# ja Kumoa. Kuvakaappaukset versio3_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Versio 3');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            # --- pikaluonti: vaihtoehtoryhmä lukuineen ---
            await pg.click('#pal [data-quick="ryhma"]');await pg.wait_for_timeout(120)
            await pg.fill('#qn','Mieliala');await pg.fill('#qo','Vähän = 1\nKohtalaisesti = 2\nPaljon = 3')
            await pg.click('[data-qmake]');await pg.wait_for_timeout(250)
            r=await P(pg,"{napit:Object.values(P.b).filter(b=>b.k==='nappi').map(b=>b.nm),otsikko:!!B('Mieliala: otsikko'),ik:[B('Mieliala').m,B('Mieliala').pakota],summa:B('Mieliala: pisteet').m,valitse:Object.values(P.b).filter(b=>b.k==='valitse').length,jasenet:E().members(B('Mieliala').id).length,valittu:APP.S.multi.length}")
            print(W,'1 vaihtoehtoryhmä:',r)
            assert r['napit']==['Mieliala: Vähän','Mieliala: Kohtalaisesti','Mieliala: Paljon'] and r['ik']==['one',True] and r['summa']=='sum' and r['valitse']==3 and r['jasenet']==3 and r['valittu']==4
            await pg.screenshot(path='versio3_ryhma_%d.png'%W)
            # --- pikaluonti: kyllä/ei ---
            await pg.click('#pal [data-quick="kylla"]');await pg.wait_for_timeout(120)
            await pg.fill('#qn','Onko aikaa?');await pg.click('[data-qmake]');await pg.wait_for_timeout(250)
            r=await P(pg,"[B('Onko aikaa?: Kyllä').tx,B('Onko aikaa?: Ei').tx,B('Onko aikaa?').m,B('Onko aikaa?').pakota,Object.values(P.b).filter(b=>b.k==='ikkuna').length]")
            print(W,'2 kyllä/ei:',r);assert r==['Kyllä','Ei','one',True,3]
            # siirretään kysymys sivuun, ettei se peitä ryhmää
            await P(pg,"(function(){var y=0;Object.values(P.b).filter(b=>b.nm.indexOf('Onko aikaa?')===0).forEach(b=>{b.x+=420;});APP.renderAll();return 1;})()")
            # --- käyttö lukittuna ---
            await pg.click('#lockbtn');await pg.wait_for_timeout(150)
            async def paina(nm):
                i=await P(pg,"B(%r).id"%nm);await pg.click('.ue[data-id="%s"] button'%i);await pg.wait_for_timeout(80)
            await paina('Mieliala: Paljon');s1=await P(pg,"E().val(B('Mieliala: pisteet').id)")
            await paina('Mieliala: Kohtalaisesti');s2=await P(pg,"[E().val(B('Mieliala: pisteet').id),E().val(B('Mieliala: Paljon').id)]")
            await paina('Onko aikaa?: Kyllä');s3=await P(pg,"E().val(B('Onko aikaa?').id)")
            print(W,'3 käyttö: pisteet',s1,'→',s2,'| vastaus annettu',s3);assert s1==3 and s2==[2,False] and s3 is True
            await pg.click('#lockbtn');await pg.wait_for_timeout(150)
            # --- pikatoiminto Arvo, kun valittu ---
            await paletti(pg,'Valintaruutu',420,600);await pg.wait_for_timeout(120)
            await pg.fill('#insp input[data-k="qv"]','5');await pg.press('#insp input[data-k="qv"]','Enter');await pg.wait_for_timeout(200)
            r=await P(pg,"(function(){var v=Object.values(P.b).find(b=>b.k==='valitse'&&b.nm==='Valintaruutu: arvo');if(!v)return null;var vn=P.lg.n.find(n=>n.p===v.id);var l=P.lg.l.find(l=>l.t===vn.id&&l.tp==='c');return [v.a,P.b[P.lg.n.find(n=>n.id===l.f).p].nm,E().val(v.id)];})()")
            print(W,'4 Arvo, kun valittu:',r);assert r==['5','Valintaruutu',False]
            hlp=await pg.inner_text('#insp');assert 'Valintaruutu: arvo' in hlp
            await pg.fill('#insp input[data-k="qv"]','7');await pg.wait_for_timeout(120)
            print(W,'5 arvon muutos päivittää samaa VALITSE-palikkaa:',await P(pg,"[Object.values(P.b).filter(b=>b.k==='valitse').length,B('Valintaruutu: arvo').a]"))
            # --- hakutaulukko logiikassa ---
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            lv=await pg.locator('#lvp').bounding_box()
            await paletti(pg,'Hakutaulukko',lv['x']+lv['width']/2,lv['y']+lv['height']-90);await pg.wait_for_timeout(150)
            # Jonon 26 b: arvokenttä on kaavakenttä (ei palikkavalikkoa): viite kirjoitetaan @-merkillä
            svt=await P(pg,"B('Mieliala: pisteet').vt");await pg.fill('#insp input[data-k="a"][data-lit]','@'+svt);await pg.wait_for_timeout(120)
            for i,(a,bb,t) in enumerate([('','2','Huono'),('2','3','Ok'),('3','','Hyvä')]):
                await pg.click('#insp [data-hradd]');await pg.wait_for_timeout(80)
                if a:await pg.fill('#insp input[data-k="hr_%d_a"]'%i,a)
                await pg.fill('#insp input[data-k="hr_%d_b"]'%i,bb) if bb else await pg.fill('#insp input[data-k="hr_%d_b"]'%i,'')
                await pg.fill('#insp input[data-k="hr_%d_t"]'%i,t);await pg.wait_for_timeout(60)
            g=await P(pg,"P.lg.n.find(n=>n.p===B('Hakutaulukko').id).g");assert g=='',g
            r=await P(pg,"[E().val(B('Hakutaulukko').id),B('Hakutaulukko').rivit.length]")
            on=await pg.locator('#insp .hrow.on').count();why=await pg.inner_text('#insp .why')
            print(W,'6 hakutaulukko:',r,'| osuva rivi korostuu:',on,'| Miksi:',why.split('\n')[0]);assert r==['Ok',3] and on==1 and 'osuu riviin 2' in why
            await pg.select_option('#insp select[data-k="hr_2_m"]','on');await pg.wait_for_timeout(120)
            print(W,'7 täsmälleen-rivillä ei ylärajaa:',await pg.locator('#insp input[data-k="hr_2_b"]').count()==0)
            await pg.click('#insp [data-hrup="2"]');await pg.wait_for_timeout(100)
            print(W,'8 rivin siirto ylös:',await P(pg,"B('Hakutaulukko').rivit.map(r=>r.t)"))
            node=await pg.inner_text('#lworld .ln.g-ehto:has-text("Hakutaulukko")');print(W,'9 solmu:',node.replace('\n',' '))
            await pg.screenshot(path='versio3_haku_%d.png'%W)
            # --- piilotuksen vaihtoehdot ---
            await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(200)
            await paletti(pg,'Lukukenttä',760,600);await pg.wait_for_timeout(120)
            await pg.click('#insp [data-seg="nkm"][data-v="kun"]');await pg.wait_for_timeout(80)
            await pg.select_option('#insp select[data-nkr]',await P(pg,"B('Onko aikaa?: Ei').id"));await pg.wait_for_timeout(80)
            await pg.click('#insp [data-seg="nkt"][data-v="luku"]');await pg.wait_for_timeout(80)
            await pg.fill('#insp input[data-k="nks"]','Vastaa ensin ei');await pg.wait_for_timeout(80)
            await pg.click('#insp [data-seg="nka"][data-v="pois"]');await pg.wait_for_timeout(80)
            lid=await P(pg,"B('Lukukenttä').id")
            await pg.click('#lockbtn');await pg.wait_for_timeout(150)
            cls=await pg.get_attribute('.ue[data-id="%s"]'%lid,'class');syy=await pg.is_visible('.ue[data-id="%s"] .nks'%lid)
            dis=await pg.locator('.ue[data-id="%s"] input'%lid).is_disabled()
            await pg.locator('.ue[data-id="%s"] [data-act="inc"]'%lid).click(force=True);await pg.wait_for_timeout(80)
            v=await P(pg,"[APP.P.st[B('Lukukenttä').id]===undefined,E().val(B('Lukukenttä').id)]")
            print(W,'10 vain luettava:','ro' in cls,'| syy näkyy:',syy,'| kenttä lukittu:',dis,'| arvo ei muuttunut, pois laskuista:',v)
            assert 'ro' in cls and syy and dis and v==[True,None]
            await pg.screenshot(path='versio3_piilotus_%d.png'%W)
            await paina('Onko aikaa?: Ei');cls=await pg.get_attribute('.ue[data-id="%s"]'%lid,'class')
            v=await P(pg,"E().val(B('Lukukenttä').id)");print(W,'11 ehto täyttyi: käytettävissä',' ro' not in cls,'| arvo',v);assert ' ro' not in cls and v==0
            await pg.locator('.ue[data-id="%s"] [data-act="inc"]'%lid).click();await pg.wait_for_timeout(80)
            print(W,'12 nyt muutettavissa:',await P(pg,"E().val(B('Lukukenttä').id)"))
            await pg.click('#lockbtn');await pg.wait_for_timeout(150)
            # --- Kumoa ---
            n0=await P(pg,"Object.keys(P.b).length");await pg.keyboard.press('Control+z');await pg.wait_for_timeout(150)
            n1=await P(pg,"[Object.keys(P.b).length,B('Lukukenttä').nka||'']")
            print(W,'13 Kumoa palauttaa edellisen muutoksen:',n0,'→',n1);assert n1[1]==''
            # Vie taakse -painike toimii (ennen se vei Takaisin-toimintoon)
            await pg.click('.ue[data-id="%s"]'%lid);await pg.wait_for_timeout(80)
            z0=await P(pg,"B('Lukukenttä').z||0");await pg.click('#insp [data-do="toback"]');await pg.wait_for_timeout(80)
            z1=await P(pg,"B('Lukukenttä').z||0");print(W,'14 Vie taakse:',z0,'→',z1);assert z1<z0 or z1<0
            print(W,'errs',errs)
            await b.close()
asyncio.run(main())
