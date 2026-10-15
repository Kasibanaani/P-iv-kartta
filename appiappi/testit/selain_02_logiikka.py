# Logiikka: näkymän palikat kanvaasille, laskut ja vertailut, nuolen veto pisteestä pisteeseen ja palikan päälle (valikko),
# ikkuna ja palikan pudotus sen sisään (ikkuna kasvaa), ikkunan tyypin vaihto, toiminto painikkeesta, elävät arvot,
# nuolen irrotus kärjestä, kumoa, lukittu käyttö. Kuvakaappaukset logiikka_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
async def main():
    async with async_playwright() as p:
        b,pg,errs=await avaa(p)
        await pg.fill('#wname','Logiikkatesti');await pg.click('#wcreate');await pg.wait_for_timeout(150)
        for t,x,y in [('Säädin',450,200),('Ilmoitus',450,320),('Painike',450,420),('Lukukenttä',700,420)]:
            await paletti(pg,t,x,y)
        await pg.click('.ue.k-nappi');await pg.click('#insp [data-seg="beh"][data-v="kerta"]');await pg.wait_for_timeout(80)
        await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(200)
        print('1 tyhjä logiikka:',await pg.is_visible('#lempty'),'| palikkalista:',await pg.locator('#plist .chip').count())
        async def inst(name,x,y):
            c=await pg.locator('#plist .chip',has_text=name).first.bounding_box();await veda(pg,[c['x']+40,c['y']+c['height']/2],[x,y])
        await inst('Säädin',420,200);await inst('Ilmoitus',900,260);await inst('Painike',420,520);await inst('Lukukenttä',900,520)
        await paletti(pg,'≤',640,200)
        n=await P(pg,"P.lg.n.map(n=>P.b[n.p].nm)");print('2 solmut:',n)
        def nsel(nm): return "#lworld .ln[data-nid=\"%s\"]"
        ids=await P(pg,"Object.fromEntries(P.lg.n.map(n=>[P.b[n.p].nm,n.id]))")
        S='#lworld [data-nid="%s"]'
        # säädin → vertailun A (piste pisteeseen)
        a=await keskus(pg,(S%ids['Säädin'])+' .pins.o .pt[data-p="v"]');t=await keskus(pg,(S%ids['Vertailu'])+' .pins.i .pt[data-p="a"]')
        await veda(pg,a,t)
        print('3 nuoli säädin → A:',await P(pg,"P.lg.l.map(l=>[P.b[P.lg.n.find(n=>n.id===l.f).p].nm,l.fp,P.b[P.lg.n.find(n=>n.id===l.t).p].nm,l.tp])"))
        # B = 3 tarkastelijassa
        await pg.click(S%ids['Vertailu']);await pg.fill('#insp input[data-k="b"]','3');await pg.wait_for_timeout(100)
        print('4 vertailu:',await pg.inner_text((S%ids['Vertailu'])+' .lt'),'=',await pg.inner_text((S%ids['Vertailu'])+' .lv'))
        # vertailu → ilmoituksen päälle → valikko → näkyy kun
        a=await keskus(pg,(S%ids['Vertailu'])+' .pins.o .pt[data-p="v"]');t=await keskus(pg,(S%ids['Ilmoitus'])+' .lb')
        await veda(pg,a,t);await pg.wait_for_timeout(100)
        items=await pg.evaluate("[...document.querySelectorAll('#menu button')].map(b=>b.textContent)");print('5 valikko:',items)
        await pg.click('#menu button:has-text("näkyy kun")');await pg.wait_for_timeout(150)
        vis=await P(pg,"E().visible(B('Ilmoitus').id)");print('6 ilmoitus näkyy (säädin 5 ≤ 3?):',vis);assert vis==False
        # ikkuna ja pudotus sisään
        await paletti(pg,'JA',640,360);await pg.wait_for_timeout(100)
        ids=await P(pg,"Object.fromEntries(P.lg.n.map(n=>[P.b[n.p].nm,n.id]))")
        w0=await P(pg,"(function(){var n=P.lg.n.find(n=>P.b[n.p].k==='ikkuna');return [n.w,n.h];})()")
        c=await keskus(pg,(S%ids['Vertailu'])+' .lb');wr=await pg.locator(S%ids['Ja-ikkuna']).bounding_box()
        await veda(pg,[c[0]-30,c[1]],[wr['x']+70,wr['y']+wr['height']-35])
        g=await P(pg,"(function(){var v=P.lg.n.find(n=>P.b[n.p].k==='vert');return [v.g===P.lg.n.find(n=>P.b[n.p].k==='ikkuna').id];})()")
        w1=await P(pg,"(function(){var n=P.lg.n.find(n=>P.b[n.p].k==='ikkuna');return [n.w,n.h];})()")
        print('7 vertailu ikkunassa:',g,'| ikkunan koko',w0,'→',w1,'| tulos:',await pg.inner_text((S%ids['Ja-ikkuna'])+' .wh .lv'))
        # tyypin vaihto valikosta: EI MIKÄÄN → tulos kyllä
        await pg.click((S%ids['Ja-ikkuna'])+' [data-wmb]');await pg.click('#menu button:has-text("EI MIKÄÄN")');await pg.wait_for_timeout(120)
        print('8 ikkunan tyyppi:',await P(pg,"P.b[P.lg.n.find(n=>P.b[n.p].k==='ikkuna').p].m"),'| tulos:',await P(pg,"E().val(P.lg.n.find(n=>P.b[n.p].k==='ikkuna').p)"))
        # toiminto: painike painettu → lisää lukukenttään 5
        await paletti(pg,'Lisää',660,560);await pg.wait_for_timeout(100)
        ids=await P(pg,"Object.fromEntries(P.lg.n.map(n=>[P.b[n.p].nm,n.id]))")
        await pg.select_option('#insp select[data-k="o"]',label='Lukukenttä');await pg.fill('#insp input[data-k="v"]','5');await pg.wait_for_timeout(80)
        a=await keskus(pg,(S%ids['Painike'])+' .pins.o .pt[data-p="e"]');t=await keskus(pg,(S%ids['Lisää'])+' .pins.i .pt[data-p="e"]');await veda(pg,a,t)
        print('9 toiminto:',await pg.inner_text((S%ids['Lisää'])+' .lt'),'| nuolia:',await P(pg,"P.lg.l.length"))
        await pg.screenshot(path='logiikka_rakennettu.png')
        # nuolen irrotus kärjestä ja kumoa
        t=await keskus(pg,(S%ids['Lisää'])+' .pins.i .pt[data-p="e"]');await veda(pg,t,[t[0]+0,t[1]+160])
        l1=await P(pg,"P.lg.l.length");await pg.keyboard.press('Control+z');await pg.wait_for_timeout(150);l2=await P(pg,"P.lg.l.length")
        print('10 irrotus ja kumoa:',l1,'→',l2);assert l2==l1+1
        # käyttö: lukitse näkymä, paina kahdesti, säädin 2
        await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(120);await pg.click('#lockbtn');await pg.wait_for_timeout(120)
        await pg.click('.ue.k-nappi .w-btn');await pg.click('.ue.k-nappi .w-btn');await pg.wait_for_timeout(80)
        sl=await pg.locator('.ue.k-saadin input[type=range]').bounding_box();await pg.mouse.click(sl['x']+sl['width']*0.2,sl['y']+sl['height']/2);await pg.wait_for_timeout(100)
        r=await P(pg,"[E().val(B('Lukukenttä').id),E().val(B('Säädin').id),E().visible(B('Ilmoitus').id)]");print('11 käyttö:',r);assert r[0]==10 and r[1]<=3 and r[2]==True
        await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(200)
        on=await pg.locator('#lsvg path.lk.on').count();print('12 vihreitä nuolia:',on)
        await pg.click('.zoomc [data-z="fit"]');await pg.wait_for_timeout(100)
        await pg.screenshot(path='logiikka_elava.png')
        # poisto: solmu Delete-näppäimellä
        await pg.click(S%ids['Lisää']);await pg.keyboard.press('Delete');await pg.wait_for_timeout(100)
        print('13 toiminto poistettu:',await P(pg,"Object.values(P.b).some(b=>b.k==='tee')"))
        print('errs',errs);await b.close()
asyncio.run(main())
