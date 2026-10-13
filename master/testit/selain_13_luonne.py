# Tyyli-välilehti: Appipaja 1.0 -tyyli, lähtöväri (perusväri ja värikoodi) ja paletin luonne.
# Tarkistaa, että valinnat tallentuvat, esikatselu vaihtuu ja luettavuus pysyy kunnossa. Kuvat: luonne_*.png.
import asyncio, os
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); errs=[]
        pg=await b.new_page(viewport={'width':1440,'height':900},color_scheme='light'); pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(U); await pg.wait_for_timeout(300)
        await pg.click('text=Luo esimerkkiprojekti'); await pg.wait_for_timeout(300)
        await pg.click('#mtabs [data-v="style"]'); await pg.wait_for_timeout(200)
        bg=lambda: pg.evaluate("getComputedStyle(document.querySelector('#pscreen .ua-app')).backgroundColor")
        st=lambda: pg.evaluate("JSON.stringify(MASTER.data.projects[0].cfg.style)")
        chk=lambda: pg.inner_text('.tchk >> nth=0')
        await pg.click('.tcard[data-preset="appipaja"]'); await pg.wait_for_timeout(150)
        print('1 Appipaja 1.0:', await pg.inner_text('.tnow b'), '| tausta', await bg(), '| rivin kulma', await pg.evaluate("getComputedStyle(document.querySelector('#pscreen .ua-row')).borderTopLeftRadius"), '|', (await chk())[:50])
        await pg.locator('.phone').screenshot(path='luonne_appipaja.png')
        await pg.click('.tlu[data-lu="pastelli"]'); await pg.wait_for_timeout(150)
        print('2 luonne valmiista paletista:', await st(), '| tausta', await bg())
        await pg.click('.tsq[aria-label="Lähtöväri #C2185B"]'); await pg.wait_for_timeout(150)
        print('3 perusväri säilyttää luonteen:', await st(), '|', (await chk())[:50])
        await pg.fill('#t-hex','1a7fa0'); await pg.press('#t-hex','Enter'); await pg.wait_for_timeout(150)
        print('4 värikoodi ilman #:', await st())
        await pg.fill('#t-hex','ei väri'); await pg.press('#t-hex','Enter'); await pg.wait_for_timeout(150)
        print('5 virheellinen koodi ei muuta:', await st(), '| kenttä', await pg.input_value('#t-hex'))
        for lu in ('tasapaino','rauha','lampo','pastelli','eloisa','kontrasti'):
            await pg.click('.tlu[data-lu="%s"]' % lu); await pg.wait_for_timeout(120)
            on=await pg.evaluate("document.querySelector('.tlu[aria-pressed=true]').dataset.lu")
            print('6', lu.ljust(9), '| valittu', on==lu, '| tausta', await bg(), '|', (await chk())[:45], '|', (await pg.inner_text('.tchk >> nth=1'))[:30])
            await pg.locator('.phone').screenshot(path='luonne_%s.png' % lu)
        await pg.reload(); await pg.wait_for_timeout(400)
        print('7 uudelleenlatauksen jälkeen:', await st())
        await pg.click('#mtabs [data-v="style"]'); await pg.wait_for_timeout(150)
        await pg.screenshot(path='luonne_master.png', full_page=True)
        ov=await pg.evaluate("(()=>{const v=document.getElementById('v-style');return v.scrollWidth-v.clientWidth;})()")
        print('8 vaakavieritys (0 = ei):', ov)
        print('errs', errs); await b.close()
asyncio.run(main())
