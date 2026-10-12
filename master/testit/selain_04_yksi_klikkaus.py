# Yksi klikkaus riittää: kun kenttää on muokattu ja sitten klikataan muualle, klikkaus ei saa hukkua
# (muutos tallentuu kentästä poistuttaessa, ja näkymä piirretään uudelleen vasta klikkauksen jälkeen).
import asyncio, os
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); errs=[]
        pg=await b.new_page(viewport={'width':1440,'height':900}); pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(U); await pg.wait_for_timeout(300)
        await pg.click('text=Luo esimerkkiprojekti'); await pg.wait_for_timeout(300)
        h=lambda: pg.inner_text('#insp h2')
        async def click(sel):
            bx=await pg.locator(sel).first.bounding_box(); await pg.mouse.click(bx['x']+bx['width']/2,bx['y']+bx['height']/2); await pg.wait_for_timeout(200)
        names=await pg.evaluate("[...document.querySelectorAll('.oname .on')].map(e=>e.textContent)")
        a,b2,c=names[0],names[1],names[2]
        await click('.oname:has(.on:text-is("%s"))' % a)
        await pg.locator('#f-name').click(); await pg.keyboard.type('X')
        await click('.oname:has(.on:text-is("%s"))' % b2)
        print('1 nimen muokkaus + yksi klikkaus listaan:', await h()==b2, '| nimi tallentui:', (a+'X') in await pg.evaluate("[...document.querySelectorAll('.oname .on')].map(e=>e.textContent).join('|')"))
        await pg.locator('#f-name').click(); await pg.keyboard.type('Y')
        await click('#mtabs [data-v="table"]')
        print('2 nimen muokkaus + yksi klikkaus välilehteen:', await pg.evaluate("document.querySelector('#mtabs [aria-selected=true]').textContent"))
        await click('#mtabs [data-v="build"]'); await click('.oname:has(.on:text-is("%s"))' % c)
        await pg.locator('#f-name').click(); await pg.keyboard.type('Z')
        await click('[data-add="choice"]')
        print('3 nimen muokkaus + yksi klikkaus lisäysnappiin:', (await h()).startswith('Valinta'))
        await pg.keyboard.type('Uusi nimi')
        await click('#insp textarea, #insp input[type=text]:not(#f-name)')
        await pg.keyboard.type('abc'); await pg.wait_for_timeout(100)
        print('4 nimen muokkaus + klikkaus toiseen kenttään, kursori säilyy:', await pg.evaluate("document.activeElement.tagName"), '| otsikko:', await h(), '| listassa:', 'Uusi nimi' in await pg.evaluate("[...document.querySelectorAll('.oname .on')].map(e=>e.textContent).join('|')"))
        print('errs', errs)
        await b.close()
asyncio.run(main())
