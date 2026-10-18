# Jonon 28: lapun ⚡ Kiire (laput.json-kenttä kiire: true, säilyy yhdistämisessä ja poistuu, kun uudempi versio poistaa sen)
# sekä yläpalkin Näytä kaikki / Piilota kaikki kummallekin lappulajille (selainasetus, piilossa olevien määrä napissa,
# uusi lappu näkyy aina, säilyy uudelleenlatauksessa). Tietokone 1440 ja 1280 hiirellä, 390 savutestinä. Ei oikeaa iPhonea.
import asyncio, json
from playwright.async_api import async_playwright
from yhteinen import *
L="APP.data.laput"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in (1440,1280,390):
            mob=W<500;ctx=await b.new_context(viewport={'width':W,'height':844 if mob else 900},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
            await pg.goto(U);await pg.wait_for_timeout(250)
            async def tap(sel):
                if mob:await pg.tap(sel)
                else:await pg.click(sel)
                await pg.wait_for_timeout(120)
            await pg.fill('#wname','Kiire');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            # napit piilossa, kun lappuja ei ole
            assert await pg.evaluate("[document.querySelector('#lapmnak').hidden,document.querySelector('#lapvnak').hidden]")==[True,True]
            await tap('#lapmbtn');await tap('#lapmbtn');await tap('#lapvbtn')
            await pg.evaluate("document.activeElement&&document.activeElement.blur()")
            assert await pg.evaluate("[document.querySelector('#lapmnak').hidden,document.querySelector('#lapvnak').hidden]")==[False,False]
            # yläpalkki ei valu yli (puhelimella palkki vierii, kuten ennenkin)
            if not mob:
                o=await pg.evaluate("(()=>{var t=document.querySelector('#top');return [t.scrollWidth,t.clientWidth]})()");assert o[0]<=o[1]+1,(W,o)
            for s in ('#lapmnak','#lapvnak'):
                bb=await pg.locator(s).bounding_box();assert bb and bb['height']<=52 and (mob or bb['x']+bb['width']<=W+0.5),(W,s,bb)
            ls=await pg.evaluate(L);vid=[l['id'] for l in ls if l['laji']=='viesti'][0];V='#laput .lap[data-lap="%s"]'%vid
            # 1 kiire päälle ja pois
            await tap(V+' [data-lapdo="kiire"]')
            k=await pg.evaluate("(id)=>{var l=APP.data.laput.filter(x=>x.id===id)[0],e=document.querySelector('#laput .lap[data-lap=\"'+id+'\"]');return [l.kiire,e.classList.contains('kiire'),e.querySelector('[data-lapdo=kiire]').getAttribute('aria-pressed'),APP.laput.tiedosto().laput.filter(x=>x.id===id)[0].kiire]}",vid)
            assert k==[True,True,'true',True],k
            if W==1440:await pg.screenshot(path='appiappi_lappukiire_1.png')
            await tap(V+' [data-lapdo="kiire"]')
            k=await pg.evaluate("(id)=>{var l=APP.data.laput.filter(x=>x.id===id)[0];return ['kiire' in l,'kiire' in APP.laput.tiedosto().laput.filter(x=>x.id===id)[0],document.querySelector('#laput .lap[data-lap=\"'+id+'\"]').classList.contains('kiire')]}",vid)
            assert k==[False,False,False],k
            # 2 yhdistäminen: uudempi GitHub-versio tuo kiireen ja vie sen pois; vanhempi ei
            m=await pg.evaluate("""(id)=>{var l=APP.data.laput.filter(x=>x.id===id)[0],r=JSON.parse(JSON.stringify(APP.laput.puhdista(l))),o=[];
              r.kiire=true;r.paivitetty='2999-01-01T00:00:00.000Z';APP.laput.yhdista([r]);o.push(!!l.kiire);
              var r2=JSON.parse(JSON.stringify(APP.laput.puhdista(l)));delete r2.kiire;r2.paivitetty='1999-01-01T00:00:00.000Z';APP.laput.yhdista([r2]);o.push(!!l.kiire);
              r2.paivitetty='3000-01-01T00:00:00.000Z';APP.laput.yhdista([r2]);o.push('kiire' in l);
              o.push('kiire' in APP.laput.puhdista({id:'x',kiire:'joo'}));o.push(APP.laput.puhdista({id:'x',kiire:true}).kiire);return o;}""",vid)
            assert m==[True,True,False,False,True],m
            # 3 piilota kaikki muistilaput: viestilappu jää, määrä napissa
            await tap('#lapmnak')
            n=await pg.evaluate("[document.querySelectorAll('#laput .lap.muisti').length,document.querySelectorAll('#laput .lap.viesti').length,document.querySelector('#lapmnak').textContent,APP.data.laput.length,!!JSON.parse(localStorage.getItem('appiappi.lappupiilo')).muisti,document.querySelector('#lapmnak').title]")
            assert n[:5]==[0,1,'(2)',3,True] and n[5].startswith('Näytä kaikki muistilaput'),n
            # 4 uusi lappu näkyy aina
            await tap('#lapmbtn');await pg.evaluate("document.activeElement&&document.activeElement.blur()")
            n=await pg.evaluate("[document.querySelectorAll('#laput .lap.muisti').length,document.querySelector('#lapmnak').textContent]");assert n==[1,'(2)'],n
            if W==1440:await pg.screenshot(path='appiappi_lappukiire_2.png')
            # 5 säilyy uudelleenlatauksessa (selainasetus), ei projektiin
            await pg.wait_for_timeout(700);await pg.reload();await pg.wait_for_timeout(400)
            n=await pg.evaluate("[document.querySelectorAll('#laput .lap.muisti').length,document.querySelector('#lapmnak').textContent,JSON.stringify(APP.P).indexOf('lappupiilo')]");assert n==[1,'(2)',-1],n
            # 6 viestilaput piiloon ja takaisin; toisessa osiossa napit piilossa
            await tap('#lapvnak');assert await pg.evaluate("document.querySelectorAll('#laput .lap.viesti').length")==0
            await tap('#tabs [data-t="logiikka"]')
            assert await pg.evaluate("[document.querySelector('#lapmnak').hidden,document.querySelector('#lapvnak').hidden,document.querySelectorAll('#laput .lap').length]")==[True,True,0]
            await tap('#tabs [data-t="nakyma"]')
            await tap('#lapmnak');await tap('#lapvnak')
            n=await pg.evaluate("[document.querySelectorAll('#laput .lap.muisti').length,document.querySelectorAll('#laput .lap.viesti').length,document.querySelector('#lapmnak').textContent,localStorage.getItem('appiappi.lappupiilo')]")
            assert n==[3,1,'','{}'],n
            assert not errs,errs
            await ctx.close();print('ok',W)
        await b.close()
asyncio.run(main())
