# Esimerkkiprojekti (vain pyynnöstä), Siirry-toiminnot näkymien välillä, kaavio ja kalenteri, tietokoneleveydet 1440 ja 1280,
# tumma tila, päivämäärämuoto pp.kk.vv, vienti tekstinä ja tuonti, projektin vaihto. Kuvakaappaukset esimerkki_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
async def main():
    async with async_playwright() as p:
        for w,dark in [(1440,False),(1280,True)]:
            b,pg,errs=await avaa(p,w,860,dark)
            print('==== %d px%s ===='%(w,' tumma' if dark else ''))
            print('1 projekteja alussa:',await P(pg,"APP.data.projects.length"))
            await pg.click('#wexample');await pg.wait_for_timeout(250)
            await pg.click('#lockbtn');await pg.wait_for_timeout(150)
            print('2 kiireilmoitus näkyy (eräpäivä +2):',await pg.is_visible('.ue.k-ilmo.h1'),'| Kirjaa tauko harmaana:',await pg.evaluate("document.querySelector('.ue.k-nappi.dim')!==null"))
            await pg.click('.ue.k-kytkin .w-sw');await pg.click('.w-btn:has-text("Kirjaa tauko")');await pg.wait_for_timeout(100)
            print('3 aikajana:',await pg.inner_text('.ue.k-aika .ae b'))
            for i in range(3):await pg.click('.ue.k-lista .lr .box >> nth=%d'%i)
            await pg.wait_for_timeout(100)
            print('4 kaikki tehty -ilmoitus:',await pg.is_visible('.ue.k-ilmo.h4'),'| kiire pois:',not await pg.is_visible('.ue.k-ilmo.h1'))
            await pg.screenshot(path='esimerkki_%d.png'%w)
            await pg.click('.w-btn:has-text("Yhteenvetoon")');await pg.wait_for_timeout(650)
            print('5 näkymä:',await P(pg,"APP.S.vw"),'| kaavion pylväitä:',await pg.locator('.ue.k-kaavio svg rect').count(),'| kalenterin merkittyjä päiviä:',await pg.locator('.cal .mk').count())
            await pg.screenshot(path='esimerkki_yhteenveto_%d.png'%w)
            await pg.click('.cal [data-act="calnext"]');print('6 kalenteri seuraava kuu:',await pg.inner_text('.cal .ch b'))
            await pg.click('.w-btn:has-text("Takaisin")');await pg.wait_for_timeout(650)
            print('7 takaisin:',await P(pg,"[APP.S.vw,APP.P.cam.v1.x,APP.P.cam.v1.y]"))
            # päivämäärämuoto
            await pg.click('#setbtn');await pg.click('[data-cfg="df"][data-v="pp.kk.vv"]');await pg.click('#sheet [data-x="close"]');await pg.wait_for_timeout(100)
            print('8 lyhyt muoto:',await pg.input_value('.ue.k-pvm input'))
            # logiikka 
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(200);await pg.click('.zoomc [data-z="fit"]');await pg.wait_for_timeout(100)
            await pg.screenshot(path='esimerkki_logiikka_%d.png'%w)
            # vienti ja tuonti tekstinä
            txt=await pg.evaluate("JSON.stringify({app:'kytkoskartta',projects:[APP.P]})")
            await pg.click('#projbtn');await pg.fill('#imptext',txt);await pg.click('[data-x="importtext"]');await pg.wait_for_timeout(200)
            n=await P(pg,"APP.data.projects.map(p=>p.name)");print('9 tuonnin jälkeen:',n,'| sama sisältö:',await P(pg,"Object.keys(APP.data.projects[1].b).length===Object.keys(APP.data.projects[0].b).length"))
            await pg.click('#projbtn');await pg.click('.plrow >> nth=0');await pg.wait_for_timeout(150)
            print('10 projekti vaihdettu:',await P(pg,"APP.data.cur===APP.data.projects[0].id"))
            vw=await pg.evaluate("[document.documentElement.scrollWidth,innerWidth]");print('11 ei vaakavieritystä:',vw)
            print('errs',errs);await b.close()
asyncio.run(main())
