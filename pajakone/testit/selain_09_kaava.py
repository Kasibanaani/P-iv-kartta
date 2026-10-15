# Versio 5: viite paneelissa (seuraa nimeä, tupla estetään), ƒ Näkyy kun kaava / Teksti kaavasta / Harmaana,
# kaavan ehdotukset ja elävä tulos, {viite} tekstissä, rajoittavin voittaa käytössä, kaava paletista ja
# siirtona palikan päälle (valikko kysyy kohdan), kaava ikkunassa, Miksi?, palikkalistan viite ja Kumoa.
# Kuvakaappaukset versio5_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Kaavat');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            async def aseta(nm,v):
                await P(pg,"(function(){KK.userSet(P,B(%r).id,%s,{now:function(){return new Date();}});APP.renderAll();return 1;})()"%(nm,v));await pg.wait_for_timeout(80)
            async def valitse(nm):
                i=await P(pg,"B(%r).id"%nm);await pg.click('#uels .ue[data-id="%s"]'%i,position={'x':6,'y':6});await pg.wait_for_timeout(120)
            # --- viite seuraa nimeä, oma viite, tupla estetään ---
            await paletti(pg,'Säädin',520,260);await pg.wait_for_timeout(120)
            await pg.fill('#insp input[data-k="nm"]','Uni');await pg.wait_for_timeout(80)
            vt=await pg.input_value('#insp input[data-k="vt"]');print(W,'1 viite nimestä:',vt);assert vt=='uni'
            await paletti(pg,'Säädin',520,380);await pg.wait_for_timeout(120)
            await pg.fill('#insp input[data-k="vt"]','uni');await pg.wait_for_timeout(80)
            er=await pg.inner_text('#vterr');print(W,'2 tupla:',er);assert 'käytössä' in er
            await pg.fill('#insp input[data-k="vt"]','u2');await pg.wait_for_timeout(80)
            r=await P(pg,"[B('Säädin').vt,B('Säädin').vtSet,B('Uni').vt]");print(W,'3 oma viite:',r);assert r==['u2',True,'uni']
            await pg.fill('#insp input[data-k="nm"]','Unen laatu');await pg.wait_for_timeout(80)
            assert await P(pg,"B('Unen laatu').vt")=='u2'
            # --- ƒ Näkyy, kun kaava pätee: ehdotus, elävä tulos ---
            await paletti(pg,'Painike',520,520);await pg.wait_for_timeout(120)
            await pg.fill('#insp input[data-k="nm"]','Jatka');await pg.wait_for_timeout(60)
            n0=await P(pg,"Object.keys(P.b).length")
            await pg.click('#insp [data-kto="nk"]');await pg.wait_for_timeout(200)
            await pg.locator('#insp textarea[data-kaava]').focus();await pg.keyboard.type('un');await pg.wait_for_timeout(120)
            sug=await pg.locator('#ksug button').all_inner_texts();print(W,'4 ehdotukset:',sug);assert any(s.startswith('uni') for s in sug)
            await pg.click('#ksug button:has-text("uni")');await pg.wait_for_timeout(80)
            await pg.keyboard.type(' > 7');await pg.wait_for_timeout(150)
            r=await P(pg,"(function(){var k=Object.values(P.b).find(b=>b.k==='kaava');var kn=P.lg.n.find(n=>n.p===k.id);var l=P.lg.l.find(l=>l.f===kn.id);return [KK.kaavaToText(P,k.f),P.b[P.lg.n.find(n=>n.id===l.t).p].nm,l.tp];})()")
            res=await pg.inner_text('#kres');print(W,'5 kaava:',r,'|',res);assert r==['uni > 7','Jatka','nk'] and 'ei päde' in res
            why=await pg.inner_text('#insp .why');print(W,'6 Miksi:',why.replace('\n',' | '));assert 'Kaava: uni > 7' in why and 'Uni' in why
            await pg.screenshot(path='versio5_kaava_%d.png'%W)
            # Kumoa poistaa luodun kaavan, ja tehdään uudelleen
            await pg.click('#undobtn');await pg.wait_for_timeout(80);await pg.click('#undobtn');await pg.wait_for_timeout(80)
            await pg.click('#undobtn');await pg.wait_for_timeout(150)
            un=await P(pg,"[Object.keys(P.b).length,Object.values(P.b).filter(b=>b.k==='kaava').length]");print(W,'7 kumoa:',un,n0);assert un==[n0,0]
            await valitse('Jatka');await pg.click('#insp [data-kto="nk"]');await pg.wait_for_timeout(150)
            await pg.fill('#insp textarea[data-kaava]','uni > 7');await pg.wait_for_timeout(120)
            # --- käyttö: piilossa, kunnes uni > 7 ---
            await pg.click('#lockbtn');await pg.wait_for_timeout(150)
            jid=await P(pg,"B('Jatka').id");cls=await pg.get_attribute('.ue[data-id="%s"]'%jid,'class');assert 'hid' in cls
            await aseta('Uni',8);cls2=await pg.get_attribute('.ue[data-id="%s"]'%jid,'class');print(W,'8 käyttö:',cls,'→',cls2);assert 'hid' not in cls2
            await pg.click('#lockbtn');await pg.wait_for_timeout(150)
            # --- Teksti kaavasta: arvo-palikka nimellä ja lyhyellä viitteellä ---
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            lv=await pg.locator('#lvp').bounding_box()
            await paletti(pg,'Arvo',lv['x']+120,lv['y']+lv['height']-120);await pg.wait_for_timeout(120)
            await pg.fill('#insp input[data-k="v"]','Kevyt päivä');await pg.fill('#insp input[data-k="nm"]','Kuinka kevyt päivä valitaan');await pg.fill('#insp input[data-k="vt"]','kevyt');await pg.wait_for_timeout(100)
            await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(250)
            await valitse('Jatka');await pg.click('#insp [data-kto="tx"]');await pg.wait_for_timeout(150)
            await pg.fill('#insp textarea[data-kaava]','kevyt');await pg.wait_for_timeout(150)
            await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(250)
            t=await pg.inner_text('.ue[data-id="%s"] .w-btn'%jid);print(W,'9 napin teksti kaavasta:',t);assert t.strip()=='Kevyt päivä'
            await valitse('Jatka');chips=await pg.locator('#insp .rels .relc').all_inner_texts();print(W,'10 tekstin lähde:',chips);assert any('kevyt' in c for c in chips)
            # --- {viite} tekstissä ---
            l=pg.locator('#pal .chip[data-make*="nayta"]').first;c0=await l.bounding_box();await veda(pg,[c0['x']+c0['width']/2,c0['y']+c0['height']/2],[900,260]);await pg.wait_for_timeout(120)
            await pg.fill('#insp input[data-k="tx"]','Unta {uni} h');await pg.wait_for_timeout(120)
            tid=await P(pg,"B('Teksti').id");t=await pg.inner_text('.ue[data-id="%s"]'%tid);print(W,'11 {viite}:',t.strip());assert t.strip().endswith('Unta 8 h')
            # --- Harmaana-asetus ja rajoittavin voittaa ---
            await paletti(pg,'Kytkin',900,400);await pg.wait_for_timeout(120);await pg.fill('#insp input[data-k="nm"]','Lukko');await pg.wait_for_timeout(60)
            await valitse('Jatka');lid=await P(pg,"B('Lukko').id")
            await pg.select_option('#insp select[data-hkr]',lid);await pg.wait_for_timeout(120)
            await aseta('Lukko','true');st=await P(pg,"E().state(B('Jatka').id)");cls=await pg.get_attribute('.ue[data-id="%s"]'%jid,'class')
            print(W,'12 harmaana:',st,cls);assert st=='harmaa' and ' dim' in cls
            await aseta('Uni',5);st2=await P(pg,"E().state(B('Jatka').id)");print(W,'13 piilossa voittaa:',st2);assert st2=='piilossa'
            await aseta('Uni',9)
            await pg.click('#lockbtn');await pg.wait_for_timeout(150)
            dis=await pg.locator('.ue[data-id="%s"] button'%jid).is_disabled();print(W,'14 lukittuna harmaa nappi pois käytöstä:',dis);assert dis
            await pg.screenshot(path='versio5_kaytto_%d.png'%W)
            await pg.click('#lockbtn');await pg.wait_for_timeout(150);await aseta('Lukko','false')
            # --- logiikka: kaava paletista palikan päälle → valikko kysyy kohdan ---
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            jn=await P(pg,"P.lg.n.find(n=>n.p===B('Jatka').id).id")
            c=await keskus(pg,'#lworld [data-nid="%s"] .lb'%jn)
            await paletti(pg,'Kaava',c[0],c[1]);await pg.wait_for_timeout(200)
            items=await pg.locator('#menu button').all_inner_texts();print(W,'15 valikko:',items)
            assert 'harmaana kun' in items and 'näkyy kun' in items
            await pg.click('#menu button:has-text("harmaana kun")');await pg.wait_for_timeout(200)
            r=await P(pg,"(function(){var jn=P.lg.n.find(n=>n.p===B('Jatka').id);var ls=P.lg.l.filter(l=>l.t===jn.id).map(l=>l.tp).sort();var kn=P.lg.n.find(n=>n.id===APP.S.sel.id);return [ls,kn.x<jn.x];})()")
            print(W,'16 nuolet napille:',r);assert r==[['hk','nk','tx'],True]
            await pg.fill('#insp textarea[data-kaava]','lukko');await pg.wait_for_timeout(100)
            assert await P(pg,"E().state(B('Jatka').id)")=='näkyy'
            # --- valmiin kaavan siirto palikan päälle ---
            await paletti(pg,'Kaava',lv['x']+lv['width']-160,lv['y']+90);await pg.wait_for_timeout(150)
            await pg.fill('#insp textarea[data-kaava]','"Uni: " + uni');await pg.wait_for_timeout(100)
            kn=await P(pg,"APP.S.sel.id");tn=await P(pg,"(function(){var t=P.lg.n.find(n=>n.p===B('Teksti').id);if(!t){t=KK.addNode(P,B('Teksti').id,500,420);APP.renderAll();}return t.id;})()")
            await pg.wait_for_timeout(150)
            a=await keskus(pg,'#lworld [data-nid="%s"] .lb'%kn);z=await keskus(pg,'#lworld [data-nid="%s"] .lb'%tn)
            await veda(pg,[a[0]-20,a[1]],z);await pg.wait_for_timeout(200)
            items=await pg.locator('#menu button').all_inner_texts();print(W,'17 siirto palikan päälle:',items);assert 'teksti' in items
            await pg.click('#menu button:has-text("teksti")');await pg.wait_for_timeout(200)
            await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(250)
            t=await pg.inner_text('.ue[data-id="%s"]'%tid);print(W,'18 teksti kaavasta:',t.strip());assert t.strip().endswith('Uni: 9')
            # --- kaava ikkunassa ---
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            l=pg.locator('#pal .chip[data-make=\'{"k":"ikkuna","p":{"m":"and"}}\']');await l.scroll_into_view_if_needed();c0=await l.bounding_box();await veda(pg,[c0['x']+c0['width']/2,c0['y']+c0['height']/2],[lv['x']+lv['width']/2,lv['y']+lv['height']-170]);await pg.wait_for_timeout(150)
            wn=await P(pg,"P.lg.n.find(n=>P.b[n.p].nm==='Ja-ikkuna').id");wr=await pg.locator('#lworld [data-nid="%s"]'%wn).bounding_box()
            await paletti(pg,'Kaava',wr['x']+70,wr['y']+wr['height']-40);await pg.wait_for_timeout(150)
            await pg.fill('#insp textarea[data-kaava]','u2 < 6');await pg.wait_for_timeout(100)
            r=await P(pg,"[E().members(B('Ja-ikkuna').id).length,E().val(B('Ja-ikkuna').id)]");print(W,'19 kaava ikkunassa:',r);assert r==[1,True]
            # sulkuvirhe näkyy selvällä suomella
            await pg.fill('#insp textarea[data-kaava]','(u2 + 1) < 6');await pg.wait_for_timeout(100)
            res=await pg.inner_text('#kres');print(W,'20 virhe:',res);assert 'ikkunaan' in res
            await pg.fill('#insp textarea[data-kaava]','u2 < 6');await pg.wait_for_timeout(100)
            # viite näkyy logiikan palikan kulmassa
            vtags=await pg.locator('#lworld .vtag').all_inner_texts();print(W,'21 viitteet kulmissa:',sorted(vtags));assert 'jatka' in vtags and 'kevyt' in vtags
            await pg.screenshot(path='versio5_logiikka_%d.png'%W)
            # --- palikkalista ---
            await pg.click('#listbtn');await pg.wait_for_timeout(150)
            head=await pg.locator('#bltab th').all_inner_texts();rows=await pg.inner_text('#bltab');print(W,'22 palikkalista:',head);assert 'VIITE' in [x.upper() for x in head] and 'kevyt' in rows
            await pg.fill('#blq','u2');await pg.wait_for_timeout(80);rows=await pg.locator('#bltab tbody tr').count();assert rows==1
            await pg.keyboard.press('Escape')
            # --- tallennus ja uudelleen avaus ---
            await P(pg,"(APP.saveNow&&APP.saveNow(),1)");await pg.wait_for_timeout(400)
            await pg.reload();await pg.wait_for_timeout(400)
            r=await P(pg,"[B('Unen laatu').vt,B('Unen laatu').vtSet,Object.values(P.b).filter(b=>b.k==='kaava').map(b=>KK.kaavaToText(P,b.f)).sort(),E().state(B('Jatka').id)]")
            print(W,'23 uudelleen avattuna:',r);assert r[0]=='u2' and r[1] is True and 'uni > 7' in r[2] and r[3]=='näkyy'
            print(W,'errs',errs);await b.close()
asyncio.run(main())
