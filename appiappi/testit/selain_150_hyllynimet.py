# Jono 21 (22.10.2026): rakennuslaatikon hyllyn nimen vaihto muokkaa-tilassa (vain tällä laitteella). Nimi näkyy välilehdessä,
# alkuperäinen vihjeenä, säilyy uudelleenlatauksessa, tyhjä palauttaa. Kirjoitus kenttään ei poista valittua palikkaa.
# Tietokone 1440 ja 1280. Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
TAB='#rlbox [data-rlhy="alueet"]'
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Hyllyt');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            await pg.evaluate("APP.rl.avaa(true)");await pg.wait_for_timeout(150)
            await pg.evaluate("APP.rl.lisaa('seina',{x:200,y:200})");await pg.wait_for_timeout(100)
            n0=await P(pg,"Object.keys(P.b).length")
            await pg.locator(TAB).click();await pg.locator('#rlbox [data-rl="muok"]').click();await pg.wait_for_timeout(100)
            inp=pg.locator('#rlbox input[data-rlnimi]');assert await inp.count()==1
            assert await inp.get_attribute('placeholder')=='Alueet'
            await inp.click();await pg.keyboard.press('Backspace');await pg.keyboard.press('Delete')
            await inp.fill('Paikat ');await inp.press('Enter');await pg.wait_for_timeout(100)
            assert await P(pg,"Object.keys(P.b).length")==n0,'kirjoitus ei poista palikkaa'
            assert (await pg.inner_text(TAB)).strip()=='Paikat' and await pg.get_attribute(TAB,'title')=='Alueet'
            assert await pg.locator('#rlbox [data-rli="kuolema"]').count()==1,'sisältö ennallaan'
            await pg.locator('#rlbox [data-rl="muok"]').click();await pg.wait_for_timeout(100)
            assert await pg.locator('#rlbox input[data-rlnimi]').count()==0,'kenttä vain muokkaa-tilassa'
            await pg.evaluate("APP.saveNow()");await pg.reload();await pg.wait_for_function("window.APP&&APP.P");await pg.wait_for_timeout(300)
            if await pg.evaluate("document.querySelector('#rlbox').hidden"):
                await pg.evaluate("APP.S.tab='nakyma';APP.renderAll()");await pg.wait_for_timeout(150)
            assert (await pg.inner_text(TAB)).strip()=='Paikat','säilyy uudelleenlatauksessa'
            await pg.locator(TAB).click();await pg.locator('#rlbox [data-rl="muok"]').click();await pg.wait_for_timeout(100)
            await pg.locator('#rlbox input[data-rlnimi]').fill('');await pg.locator('#rlbox input[data-rlnimi]').press('Enter');await pg.wait_for_timeout(100)
            assert (await pg.inner_text(TAB)).strip()=='Alueet' and await pg.get_attribute(TAB,'title') is None,'tyhjä palauttaa'
            print(W,'ok','errs',errs);assert not errs
            await b.close()
asyncio.run(main())
