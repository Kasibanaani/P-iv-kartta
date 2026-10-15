# Versio 2: Rinnakkain-näkymä ja valinnan korostus molemmilla puolilla, pikatoiminnot painikkeen asetuksista,
# Miksi?-paneeli ja Yhteydet, palikkalista, ikkunan tiivistys, monivalinta ja tasaus, käytössä / pois, virhe näkyviin.
# Kuvakaappaukset versio2_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Versio 2');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            for t,x,y in [('Painike',420,200),('Lukukenttä',700,200),('Ilmoitus',420,320),('Valintaruutu',420,420)]:
                await paletti(pg,t,x,y)
            # --- pikatoiminto: Kun painetaan → Lisää → Lukukenttä ---
            await pg.click('.ue.k-nappi');await pg.wait_for_timeout(80)
            await pg.select_option('#insp select[data-qadd="e"]','lisaa');await pg.wait_for_timeout(150)
            hd=await pg.inner_text('#insp .ih b');print(W,'1 pikatoiminto avautui:',hd,'| takaisin-nappi:',await pg.is_visible('#insp .backb'))
            await pg.select_option('#insp select[data-k="o"]',label='Lukukenttä');await pg.fill('#insp input[data-k="v"]','3');await pg.wait_for_timeout(80)
            await pg.click('#insp .backb');await pg.wait_for_timeout(100)
            qa=await pg.inner_text('#insp .qa .qt');print(W,'2 painikkeen toiminnot:',qa);assert qa=='Lukukenttä + 3'
            n=await P(pg,"[P.lg.n.length,P.lg.l.length]");print(W,'3 logiikkaan syntyi solmut ja nuoli:',n);assert n==[2,1]
            # --- Rinnakkain ---
            await pg.click('#tabs [data-t="molemmat"]');await pg.wait_for_timeout(250)
            both=[await pg.is_visible('#uvp'),await pg.is_visible('#lvp')];print(W,'4 rinnakkain näkyy molemmat:',both);assert both==[True,True]
            await pg.click('.ue.k-nappi');await pg.wait_for_timeout(120)
            print(W,'5 näkymän valinta korostaa logiikassa:',await pg.locator('#lworld .ln.same').count(),'| nuoli korostettu:',await pg.locator('#lsvg path.lk.hl').count())
            # vedä Valintaruutu logiikkaan ja vertailu
            print(W,'5b paletti seuraa puolta:',await pg.is_visible('#pal .chip:has-text("Laatikko")'));await pg.click('#pal [data-pk="logiikka"]');await pg.wait_for_timeout(80)
            c=await pg.locator('#plist .chip',has_text='Valintaruutu').first.bounding_box()
            lv=await pg.locator('#lvp').bounding_box()
            await veda(pg,[c['x']+40,c['y']+c['height']/2],[lv['x']+80,lv['y']+360])
            await pg.wait_for_timeout(120)
            print(W,'6 rinnakkain pudotus logiikkaan:',await P(pg,"P.lg.n.map(n=>P.b[n.p].nm)"))
            # logiikan valinta korostaa näkymässä (sel2)
            ids=await P(pg,"Object.fromEntries(P.lg.n.map(n=>[P.b[n.p].nm,n.id]))")
            await pg.click('#lworld [data-nid="%s"] .lb'%ids['Valintaruutu']);await pg.wait_for_timeout(100)
            print(W,'7 logiikan valinta korostaa näkymässä:',await pg.locator('#uels .ue.sel2').count())
            await pg.screenshot(path='versio2_rinnakkain_%d.png'%W)
            # --- JA-ikkuna, Miksi? ---
            await paletti(pg,'JA',lv['x']+300,lv['y']+300);await pg.wait_for_timeout(150)
            ids=await P(pg,"Object.fromEntries(P.lg.n.map(n=>[P.b[n.p].nm,n.id]))")
            wr=await pg.locator('#lworld [data-nid="%s"]'%ids['Ja-ikkuna']).bounding_box()
            cr=await keskus(pg,'#lworld [data-nid="%s"] .lb'%ids['Valintaruutu'])
            await veda(pg,[cr[0]-30,cr[1]],[wr['x']+70,wr['y']+wr['height']-35]);await pg.wait_for_timeout(150)
            await pg.click('#lworld [data-nid="%s"] .wh'%ids['Ja-ikkuna'],position={'x':150,'y':10});await pg.wait_for_timeout(150)
            why=await pg.inner_text('#insp .why');print(W,'8 Miksi:',why.replace('\n',' | '))
            assert 'kaikki' in why and 'Valintaruutu' in why
            print(W,'9 jäsenen korostus (ei päde):',await pg.locator('#lworld .ln.why-no').count())
            # Yhteydet
            await pg.click('.ue.k-luku');await pg.wait_for_timeout(100)
            rel=await pg.inner_text('#insp');print(W,'10 yhteydet näkyy:','Käytetään' in rel);assert 'Käytetään' in rel
            # --- tiivistys ---
            await pg.click('#lworld [data-nid="%s"] [data-col]'%ids['Ja-ikkuna']);await pg.wait_for_timeout(150)
            col=await P(pg,"P.lg.n.find(n=>P.b[n.p].k==='ikkuna').col");vis=await pg.locator('#lworld [data-nid="%s"]'%ids['Valintaruutu']).count()
            print(W,'11 tiivistetty:',col,'| sisältö piilossa:',vis==0);assert col and vis==0
            await pg.dblclick('#lworld [data-nid="%s"] .wname'%ids['Ja-ikkuna']);await pg.wait_for_timeout(150)
            print(W,'12 avattu kaksoisnapautuksella:',not await P(pg,"P.lg.n.find(n=>P.b[n.p].k==='ikkuna').col"))
            # --- monivalinta ja tasaus näkymässä ---
            await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(200)
            await pg.click('.ue.k-nappi');await pg.click('.ue.k-luku',modifiers=['Shift']);await pg.click('.ue.k-ilmo',modifiers=['Shift'])
            await pg.wait_for_timeout(100)
            print(W,'13 monivalinta:',await pg.inner_text('#insp .ih b'),'| valittuja:',await pg.locator('.ue.sel').count())
            await pg.click('#insp [data-al="left"]');await pg.wait_for_timeout(100)
            xs=await P(pg,"[B('Painike').x,B('Lukukenttä').x,B('Ilmoitus').x]");print(W,'14 tasattu vasemmalle:',xs);assert len(set(xs))==1
            await pg.click('#insp [data-al="dv"]');await pg.wait_for_timeout(100)
            ys=await P(pg,"[B('Painike'),B('Lukukenttä'),B('Ilmoitus')].sort((a,b)=>a.y-b.y).map(b=>[b.y,b.h])")
            gaps=[ys[1][0]-(ys[0][0]+ys[0][1]),ys[2][0]-(ys[1][0]+ys[1][1])];print(W,'15 tasavälit pystyyn:',gaps);assert abs(gaps[0]-gaps[1])<=1 and min(gaps)>=10
            # alueen valinta ⇧ + veto
            await pg.keyboard.press('Escape');await pg.wait_for_timeout(80)
            vp=await pg.locator('#uvp').bounding_box()
            await pg.keyboard.down('Shift');await veda(pg,[vp['x']+vp['width']-260,vp['y']+vp['height']-90],[vp['x']+5,vp['y']+5]);await pg.keyboard.up('Shift')
            print(W,'16 alueelta valittu:',await pg.locator('.ue.sel').count())
            await pg.screenshot(path='versio2_monivalinta_%d.png'%W)
            await pg.keyboard.press('Escape')
            # --- käyttö: painike lisää 3 ---
            await pg.click('#lockbtn');await pg.wait_for_timeout(120)
            await pg.click('.ue.k-nappi .w-btn');await pg.click('.ue.k-nappi .w-btn');await pg.wait_for_timeout(80)
            v=await P(pg,"E().val(B('Lukukenttä').id)");print(W,'17 käytössä painike lisäsi:',v);assert v==6
            # --- pois käytöstä ---
            await pg.click('#lockbtn');await pg.wait_for_timeout(100)
            await pg.click('.ue.k-nappi');await pg.click('#insp .qa .qt');await pg.wait_for_timeout(100)
            await pg.click('#insp input[data-k="on"]');await pg.wait_for_timeout(100)
            await pg.click('#lockbtn');await pg.click('.ue.k-nappi .w-btn');await pg.wait_for_timeout(80)
            v2=await P(pg,"E().val(B('Lukukenttä').id)");print(W,'18 pois käytöstä, ei lisää:',v2);assert v2==6
            # --- virhe näkyy: jako nollalla ---
            await pg.click('#lockbtn');await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(150)
            await paletti(pg,'÷',700,640);await pg.wait_for_timeout(100)
            await pg.fill('#insp input[data-k="a"]','5');await pg.fill('#insp input[data-k="b"]','0');await pg.wait_for_timeout(100)
            print(W,'19 virhe palikassa:',await pg.locator('#lworld .ln.has-err .lv.err').count(),'|',await pg.inner_text('#insp .ih small'))
            # --- palikkalista ---
            await pg.click('#listbtn');await pg.wait_for_timeout(120)
            rows=await pg.locator('#bltab tbody tr').count();print(W,'20 palikkalistassa rivejä:',rows)
            await pg.fill('#blq','luku');await pg.wait_for_timeout(80);print(W,'21 haku "luku":',await pg.locator('#bltab tbody tr').count())
            await pg.screenshot(path='versio2_palikat_%d.png'%W)
            await pg.click('#bltab tbody tr');await pg.wait_for_timeout(150)
            print(W,'22 rivistä palikkaan:',await pg.inner_text('#insp .ih b'),'| välilehti:',await P(pg,"APP.S.tab"))
            await pg.click('.zoomc [data-z="fit"]');await pg.wait_for_timeout(100)
            await pg.screenshot(path='versio2_logiikka_%d.png'%W)
            # uudelleenlataus säilyttää
            await pg.evaluate('APP.saveNow()');await pg.reload();await pg.wait_for_timeout(250)
            print(W,'23 latauksen jälkeen palikoita:',await P(pg,"Object.keys(P.b).length"))
            print('errs',errs)
            await b.close()
asyncio.run(main())
