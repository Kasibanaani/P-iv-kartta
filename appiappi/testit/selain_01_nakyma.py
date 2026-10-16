# Näkymä: tervetuloa → projekti, palikat paletista (veto ja napautus), siirto ja koko, nimi, näkyvyysehto, vaihtoväri,
# lukitus ja käyttö (painike, kytkin, säädin, teksti, luku, päivämäärä, lista), uusi näkymä, koristeviiva, kumoa.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
async def main():
    async with async_playwright() as p:
        b,pg,errs=await avaa(p)
        print('1 tervetuloa näkyy:',await pg.is_visible('#welcome'))
        await pg.fill('#wname','Testi');await pg.click('#wcreate');await pg.wait_for_timeout(200)
        print('2 projekti:',await P(pg,"P.name"),'| tyhjä näkymä:',await pg.is_visible('#uempty'))
        await paletti(pg,'Painike',500,250)
        await paletti(pg,'Ilmoitus',700,400)
        await pg.click('#pal .chip:has-text("Kytkin")');await pg.wait_for_timeout(150)
        st=await P(pg,"Object.values(P.b).map(b=>[b.k,b.nm,b.x,b.y])")
        print('3 palikat:',st)
        assert [x[0] for x in st]==['nappi','ilmo','kytkin']
        # siirto ja koko
        c=await keskus(pg,'.ue.k-nappi');await veda(pg,c,[c[0]+103,c[1]+47])
        r=await P(pg,"[B('Painike').x,B('Painike').y]");print('4 siirretty (ruudukko 10):',r);assert r[0]%10==0 and r[1]%10==0
        rh=await keskus(pg,'.ue.k-nappi .rh');await veda(pg,rh,[rh[0]+60,rh[1]+20])
        print('5 koko:',await P(pg,"[B('Painike').w,B('Painike').h]"))
        # nimi ja teksti
        await pg.fill('#insp input[data-k="nm"]','Avaa');await pg.fill('#insp input[data-k="tx"]','Näytä viesti');await pg.wait_for_timeout(100)
        print('6 nimi ja teksti:',await P(pg,"[B('Avaa').nm,B('Avaa').tx]"),'| näkyy:',await pg.inner_text('.ue.k-nappi .w-btn'))
        # ilmoitus näkyy kun Avaa pätee
        await pg.click('.ue.k-ilmo');await pg.wait_for_timeout(100)
        await pg.click('#insp [data-seg="nkm"][data-v="kun"]');await pg.wait_for_timeout(100)
        await pg.select_option('#insp select[data-nkr]',label='Avaa');await pg.wait_for_timeout(100)
        await pg.fill('#insp input[data-k="tx"]','Avaa on {Avaa}');await pg.wait_for_timeout(100)
        print('7 ilmo:',await P(pg,"[B('Ilmoitus').nk.m,P.b[B('Ilmoitus').nk.r].nm,B('Ilmoitus').tx.indexOf('{#')>=0]"),'| piilossa muokatessa näkyy haaleana:',await pg.evaluate("document.querySelector('.ue.k-ilmo').classList.contains('hid')"))
        # kytkin vaihtaa painikkeen värin
        await pg.click('.ue.k-nappi');await pg.wait_for_timeout(80)
        await pg.select_option('#insp select[data-vrr]',label='Kytkin');await pg.wait_for_timeout(80)
        await pg.click('#lockbtn');await pg.wait_for_timeout(200)
        print('8 lukittu: paneelit piilossa',await pg.evaluate("document.body.classList.contains('hidepanels')"),'| ilmo näkyy:',await pg.is_visible('.ue.k-ilmo'))
        await pg.click('.ue.k-nappi .w-btn');await pg.wait_for_timeout(120)
        print('9 painettu: ilmo näkyy',await pg.is_visible('.ue.k-ilmo'),'| teksti:',await pg.inner_text('.ue.k-ilmo'))
        assert 'kyllä' in await pg.inner_text('.ue.k-ilmo')
        h1=await pg.evaluate("document.querySelector('.ue.k-nappi').className")
        await pg.click('.ue.k-kytkin .w-sw');await pg.wait_for_timeout(100)
        h2=await pg.evaluate("document.querySelector('.ue.k-nappi').className")
        print('10 vaihtoväri:',h1,'→',h2);assert h1!=h2
        # muut ohjaimet
        await pg.click('#lockbtn');await pg.wait_for_timeout(150)
        for t,x,y in [('Säädin',300,560),('Lukukenttä',600,560),('Päivämäärä',860,560),('Tekstikenttä',300,700),('Lista',650,720)]:
            await paletti(pg,t,x,y)
        await pg.click('#lockbtn');await pg.wait_for_timeout(150)
        sl=await pg.locator('.ue.k-saadin input[type=range]').bounding_box()
        await pg.mouse.click(sl['x']+sl['width']*0.9,sl['y']+sl['height']/2);await pg.wait_for_timeout(100)
        await pg.click('.ue.k-luku [data-act="inc"]');await pg.click('.ue.k-luku [data-act="inc"]')
        await pg.fill('.ue.k-pvm input','24.12.');await pg.press('.ue.k-pvm input','Enter');await pg.wait_for_timeout(100)
        await pg.click('.ue.k-teksti input');await pg.keyboard.type('Moi',delay=20)
        print('   tekstikenttä säilytti kohdistuksen kirjoittaessa:',await pg.evaluate("document.activeElement&&document.activeElement.getAttribute('data-act')"))
        await pg.fill('.ue.k-lista .ladd','Rivi A');await pg.press('.ue.k-lista .ladd','Enter');await pg.wait_for_timeout(80)
        await pg.fill('.ue.k-lista .ladd','Rivi B');await pg.press('.ue.k-lista .ladd','Enter');await pg.wait_for_timeout(80)
        await pg.click('.ue.k-lista .lr .box');await pg.wait_for_timeout(80)
        v=await P(pg,"[E().val(B('Säädin').id),E().val(B('Lukukenttä').id),E().fmt(E().val(B('Päivämäärä').id)),E().val(B('Tekstikenttä').id),E().val(B('Lista').id),E().val(B('Lista').id,'n')]")
        print('11 käyttö:',v,'| pvm-alarivi:',await pg.inner_text('.ue.k-pvm .dsub'))
        assert v[0]>=8 and v[1]==2 and v[2].startswith('24.12.') and v[3]=='Moi' and v[4]==1 and v[5]==2
        await pg.screenshot(path='nakyma_kaytto.png')
        # uusi näkymä ja koristeviiva
        await pg.click('#lockbtn');await pg.wait_for_timeout(150)
        await pg.click('#pal #linetool');a=await keskus(pg,'.ue.k-nappi');t=await keskus(pg,'.ue.k-ilmo');await veda(pg,a,t)
        print('12 koristeviiva:',await P(pg,"P.deco.map(d=>[P.b[d.a].nm,P.b[d.b].nm,d.st])"))
        await pg.click('#insp [data-seg="dst"][data-v="nuoli"]');await pg.keyboard.press('Escape')
        await pg.click('#addvw');await pg.wait_for_timeout(150)
        print('13 näkymät:',await P(pg,"P.views.map(v=>v.n)"),'| uusi on tyhjä:',await pg.is_visible('#uempty'))
        await pg.dblclick('#vtabs [data-vw="v2"]');await pg.fill('#vwname','Toinen');await pg.press('#vwname','Enter');await pg.wait_for_timeout(100)
        print('   nimetty:',await P(pg,"P.views.map(v=>v.n)"))
        await pg.click('#vtabs [data-vw="v1"]');await pg.wait_for_timeout(100)
        # poisto ja kumoa
        await pg.click('.ue.k-kytkin');await pg.keyboard.press('Backspace');await pg.wait_for_timeout(100)
        # Appi-appi 11: kytkintä käytetään muualla, joten poisto kysyy ensin (vaikutuslista)
        kys=await pg.evaluate("document.querySelector('#sheetbg').classList.contains('show')");print('14 poisto kysyy:',kys)
        if kys:await pg.click('#sheet [data-x="delok"]');await pg.wait_for_timeout(150)
        n1=await P(pg,"Object.values(P.b).length");await pg.keyboard.press('Control+z');await pg.wait_for_timeout(150);n2=await P(pg,"Object.values(P.b).length")
        print('14 poisto ja kumoa:',n1,'→',n2);assert n2==n1+1
        await pg.screenshot(path='nakyma_muokkaus.png')
        # tallentuu ja latautuu
        await pg.evaluate("APP.saveNow()");await pg.reload();await pg.wait_for_timeout(250)
        print('15 uudelleenlataus:',await P(pg,"[P.name,Object.values(P.b).length,P.views.length]"))
        print('errs',errs);await b.close()
asyncio.run(main())
