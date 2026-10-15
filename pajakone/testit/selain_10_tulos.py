# Versio 5.1: Kaavan tulos. Kaava ”uni = a + b” tarjoaa napin, joka luo tuloksen ”uni”; katkoviiva kaavasta tulokseen;
# tuloksen paneeli (Arvo tulee kaavasta, Kirjoita kaava tälle), tulos toisessa kaavassa ja tekstissä {uni},
# toinen kaava samaan tulokseen näyttää virheen, == vertaa. Kuvakaappaukset versio51_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Tulokset');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            async def chip(k,x,y,extra=''):
                l=pg.locator('#pal .chip[data-make*=\'"k":"%s"\']%s'%(k,extra)).first;c0=await l.bounding_box()
                await veda(pg,[c0['x']+c0['width']/2,c0['y']+c0['height']/2],[x,y]);await pg.wait_for_timeout(150)
            await chip('luku',520,260);await pg.fill('#insp input[data-k="nm"]','A');await pg.fill('#insp input[data-k="start"]','3')
            await chip('luku',520,400);await pg.fill('#insp input[data-k="nm"]','B');await pg.fill('#insp input[data-k="start"]','7')
            await chip('nayta',860,260);await pg.fill('#insp input[data-k="tx"]','Unta {uni} h');await pg.wait_for_timeout(100)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            lv=await pg.locator('#lvp').bounding_box()
            # --- kaava tulokselle, jota ei vielä ole: nappi luo sen ---
            await chip('kaava',lv['x']+200,lv['y']+150)
            await pg.fill('#insp textarea[data-kaava]','uni = a + b');await pg.wait_for_timeout(150)
            btn=await pg.locator('#kres [data-mktulos]').inner_text();print(W,'1 nappi:',btn);assert 'Luo kaavan tulos ”uni”' in btn
            await pg.click('#kres [data-mktulos]');await pg.wait_for_timeout(250)
            r=await P(pg,"(function(){var t=Object.values(P.b).find(b=>b.k==='tulos');return [t.nm,t.vt,E().val(t.id),!!P.lg.n.find(n=>n.p===t.id)];})()")
            kres=await pg.inner_text('#kres');print(W,'2 tulos:',r,'|',kres.replace('\n',' '));assert r==['Uni','uni',10,True] and 'Antaa arvon' in kres
            dash=await pg.locator('#lsvg path.asg').count();print(W,'3 katkoviiva:',dash);assert dash==1
            # --- tuloksen paneeli ---
            tn=await P(pg,"P.lg.n.find(n=>P.b[n.p].k==='tulos').id");await pg.click('#lworld [data-nid="%s"] .lb'%tn);await pg.wait_for_timeout(150)
            ins=await pg.inner_text('#insp');print(W,'4 paneeli:',ins[:160].replace('\n',' | '));assert 'Arvo tulee kaavasta' in ins and 'uni = a + b' in ins
            why=await pg.inner_text('#insp .why');assert 'Arvo tulee kaavasta' in why
            # --- uusi tulos ja Kirjoita kaava tälle ---
            await chip('tulos',lv['x']+200,lv['y']+330);await pg.fill('#insp input[data-k="nm"]','Pisteet');await pg.wait_for_timeout(80)
            await pg.click('#insp [data-newkaava]');await pg.wait_for_timeout(200)
            v0=await pg.input_value('#insp textarea[data-kaava]');print(W,'5 valmis alku:',repr(v0));assert v0=='pisteet = '
            await pg.keyboard.type('uni * 2');await pg.wait_for_timeout(150)
            r=await P(pg,"E().val(B('Pisteet').id)");print(W,'6 pisteet:',r);assert r==20
            # --- toinen kaava samaan tulokseen ---
            await chip('kaava',lv['x']+200,lv['y']+480);await pg.fill('#insp textarea[data-kaava]','uni = 1');await pg.wait_for_timeout(150)
            kres=await pg.inner_text('#kres');print(W,'7 toinen kaava:',kres.replace('\n',' '));assert 'saa arvonsa jo kaavasta' in kres
            await pg.fill('#insp textarea[data-kaava]','uni == 10');await pg.wait_for_timeout(150)
            kres=await pg.inner_text('#kres');print(W,'8 == vertaa:',kres.replace('\n',' '));assert 'pätee' in kres and 'Antaa arvon' not in kres
            await pg.screenshot(path='versio51_logiikka_%d.png'%W)
            # --- teksti näkymässä ja käyttö ---
            await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(250)
            tid=await P(pg,"B('Teksti').id");t=await pg.inner_text('.ue[data-id="%s"] .w-txt'%tid);print(W,'9 teksti:',t);assert t.strip()=='Unta 10 h'
            await pg.click('#lockbtn');await pg.wait_for_timeout(150)
            aid=await P(pg,"B('A').id");await pg.click('.ue[data-id="%s"] [data-act="inc"]'%aid);await pg.wait_for_timeout(150)
            t=await pg.inner_text('.ue[data-id="%s"] .w-txt'%tid);r=await P(pg,"[E().val(B('Uni').id),E().val(B('Pisteet').id)]");print(W,'10 käytössä +1:',t,r);assert t.strip()=='Unta 11 h' and r==[11,22]
            await pg.screenshot(path='versio51_kaytto_%d.png'%W)
            print(W,'errs',errs);await b.close()
asyncio.run(main())
