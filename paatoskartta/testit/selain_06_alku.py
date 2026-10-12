import asyncio, json
from playwright.async_api import async_playwright
import os
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        ctx = await b.new_context(viewport={'width':390,'height':800}, device_scale_factor=2)
        pg = await ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(U); await pg.wait_for_timeout(300)
        store = lambda q: pg.evaluate("(function(){var d=JSON.parse(localStorage.getItem('paatoskartta:v1')),t=d.trees[0];return JSON.stringify(%s)})()" % q)
        lst = lambda: pg.evaluate("[...document.querySelectorAll('#teach-list .row')].map(b=>b.querySelector('.t').firstChild.textContent).join(', ')")
        await pg.fill('#p-use input','Työpäivä'); await pg.click('#p-use .btn:has-text("Luo")')
        print('1 tyhjä käyttö:', (await pg.inner_text('#p-use')).replace('\n',' | '))
        await pg.click('#p-use .btn:has-text("Lisää vaihtoehtoja")'); await pg.wait_for_timeout(200)
        print('2 opetus tyhjänä:', (await pg.inner_text('#info-text')), '| linkit:', await pg.evaluate("[...document.querySelectorAll('#teach-links .mini')].filter(b=>!b.hidden).map(b=>b.textContent).join(', ')||'-'")); await pg.screenshot(path='pt6_empty.png')
        await pg.click('#newopt')
        for n in ['Maanantai','Tiistai','DKT-tiimi']:
            await pg.keyboard.type(n); await pg.keyboard.press('Enter')
        print('3 lisätty enterillä:', await lst(), '|', await pg.inner_text('#info-text'), '| kohdistus kentässä:', await pg.evaluate("document.activeElement.id"), '| kenttä tyhjä:', await pg.input_value('#newopt')=='')
        await pg.fill('#newopt','Sali'); await pg.click('#addplain'); print('  painikkeella:', await lst(), '| kohdistus:', await pg.evaluate("document.activeElement.id"))
        await pg.fill('#newopt','sali'); await pg.keyboard.press('Enter'); print('  sama nimi:', await pg.inner_text('#info-text'))
        await pg.fill('#newopt',''); await pg.click('#addcond'); print('  tyhjä ehto:', await pg.inner_text('#info-text'))
        await pg.fill('#newopt','Päivä valittu'); await pg.click('#addcond'); await pg.wait_for_timeout(200); print('4 ehto:', await pg.inner_text('#ctx-name'), '|', await store('t.opts.map(function(o){return o.n+(o.c?"*":"")})'))
        await pg.click('#ctx-back'); await pg.wait_for_timeout(200); await pg.screenshot(path='pt6_list.png')
        print('  linkit:', await pg.evaluate("[...document.querySelectorAll('#teach-links .mini')].filter(b=>!b.hidden).map(b=>b.textContent).join(', ')"))
        # järjestys ja muokkaus
        await pg.click('#teach-order'); await pg.wait_for_timeout(200); await pg.screenshot(path='pt6_order.png')
        await pg.click('#optlist [data-up="o4"]'); await pg.click('#optlist [data-up="o4"]'); print('5 sali ylös x2:', await store('t.opts.map(function(o){return o.n})'), '| kohdistus:', await pg.evaluate("document.activeElement.getAttribute('aria-label')"))
        await pg.click('#optlist .oname:has-text("Tiistai")'); await pg.fill('#os-name','Tiistai (etä)'); await pg.fill('#os-pos','1'); await pg.click('#os-ok'); await pg.wait_for_timeout(200)
        print('  nimi ja paikka:', await pg.evaluate("[...document.querySelectorAll('#optlist .oname')].map(b=>b.innerText.replace(/\\n/g,' ')).join('; ')"))
        await pg.click('#p-teach .btn:has-text("Valmis")'); print('  takaisin listaan:', await lst())
        # vaihtoehdon sivulta muokkaus ja poisto
        await pg.click('#teach-list .row:has-text("Sali")'); await pg.click('#item-edit'); await pg.fill('#os-name','Kuntosali'); await pg.click('#os-ok'); await pg.wait_for_timeout(200)
        print('6 sivulta nimeäminen:', await pg.inner_text('#ctx-name'))
        await pg.click('#item-edit'); await pg.click('#os-del'); await pg.click('#os-del'); await pg.wait_for_timeout(200)
        print('  poisto:', await pg.is_visible('#ctx'), '|', await lst())
        # asetukset ilman vaihtoehtoja
        await pg.click('[data-tab="set"]'); print('7 asetusten otsikot:', ', '.join(await pg.locator('#p-set h2, #p-set h3').all_inner_texts()))
        await pg.screenshot(path='pt6_set.png')
        await pg.click('[data-tab="use"]'); print('8 käyttö:', await pg.evaluate("[...document.querySelectorAll('#p-use .row')].filter(b=>!b.hidden).map(b=>b.querySelector('.t').textContent).join(', ')"))
        # puun vaihto nollaa järjestystilan
        await pg.click('[data-tab="teach"]'); await pg.click('#teach-order'); await pg.click('#title'); await pg.fill('#ts-new','Toinen'); await pg.click('#ts-add'); await pg.wait_for_timeout(200)
        print('9 uusi puu:', await pg.inner_text('#tname'), await pg.inner_text('#mode'), '|', await pg.inner_text('#info-text'))
        ow = await pg.evaluate("[document.documentElement.scrollWidth, document.getElementById('main').scrollWidth, document.getElementById('main').clientWidth]"); print(ow)
        state = await pg.evaluate("localStorage.getItem('paatoskartta:v1')")
        await ctx.close()
        ctx = await b.new_context(viewport={'width':320,'height':640}, device_scale_factor=2, color_scheme='dark')
        await ctx.add_init_script("if(!localStorage.getItem('paatoskartta:v1'))localStorage.setItem('paatoskartta:v1', %s);" % json.dumps(state))
        pg = await ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(U); await pg.click('#title'); await pg.click('#ts-list .oname:has-text("Työpäivä")'); await pg.click('[data-tab="teach"]'); await pg.wait_for_timeout(300); await pg.screenshot(path='pt6_n_list.png')
        ow = await pg.evaluate("[document.documentElement.scrollWidth, document.getElementById('main').scrollWidth, document.getElementById('main').clientWidth]"); print(ow)
        await pg.click('#teach-order'); await pg.wait_for_timeout(200); ow = await pg.evaluate("[document.documentElement.scrollWidth, document.getElementById('main').scrollWidth, document.getElementById('main').clientWidth]"); print(ow)
        print('errs',errs); await b.close()
asyncio.run(main())
