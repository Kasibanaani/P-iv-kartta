import asyncio, json
from playwright.async_api import async_playwright
import os
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
old={'tseq':1,'cur':'t1','trees':[{'id':'t1','name':'Työpäivä','oseq':7,'opts':[{'id':'o1','n':'Maanantai','note':''},{'id':'o2','n':'Tiistai','note':''},{'id':'o3','n':'Päivä valittu','note':'','c':'any'},{'id':'o4','n':'DKT-tiimi','note':''},{'id':'o5','n':'Valmistaudu 15 min etukäteen','note':''},{'id':'o6','n':'Sali','note':''},{'id':'o7','n':'Ilta','note':''}],
  'suf':{'o3':['o1','o2'],'o5':['o4']},'req':{},'rec':{'o4':['o5']},'close':{'o1':['o2'],'o2':['o1']},'sel':[]}],'cfg':{'tint':'sininen','mode':'auto','vis':'lukitutpois'},'meta':{}}
SEED="if(!localStorage.getItem('paatoskartta:v1'))localStorage.setItem('paatoskartta:v1', %s);"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        ctx = await b.new_context(viewport={'width':390,'height':800}, device_scale_factor=2, accept_downloads=True)
        await ctx.add_init_script(SEED % json.dumps(json.dumps(old)))
        pg = await ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(U); await pg.wait_for_timeout(300)
        async def vis(): return await pg.evaluate("[...document.querySelectorAll('#p-use .row')].filter(b=>!b.hidden).map(b=>b.querySelector('.t').textContent+'='+(b.className.replace('row','').trim()||'neutraali')).join(', ')")
        async def msg(): return (await pg.inner_text('#use-msgrow')).replace('\n',' | ') if await pg.is_visible('#use-msgrow') else '(ei viestiä)'
        inc = lambda: pg.evaluate("document.getElementById('teach-inc').innerText.replace(/\\n/g,' ')")
        store = lambda q: pg.evaluate("(function(){var d=JSON.parse(localStorage.getItem('paatoskartta:v1')),t=d.trees[0];return JSON.stringify(%s)})()" % q)
        lst = lambda: pg.evaluate("[...document.querySelectorAll('#teach-list .row')].map(b=>b.querySelector('.t').firstChild.textContent+(b.classList.contains('bn')?' [bn]':'')+' ('+b.querySelector('small').textContent+')').join('; ')")
        rows = lambda: pg.evaluate("[...document.querySelectorAll('#p-teach .trow')].map(r=>r.querySelector('.t').textContent+': '+(r.querySelector('.tag').textContent||'-')).join(' ; ')")
        async def tolist():
            await pg.click('[data-tab="teach"]'); await pg.wait_for_timeout(100)
            if await pg.is_visible('#ctx-back'): await pg.click('#ctx-back')
            if await pg.locator('#p-teach .btn:has-text("Valmis")').count(): await pg.click('#p-teach .btn:has-text("Valmis")')
        async def page(name):
            await tolist(); await pg.evaluate("(n)=>{[...document.querySelectorAll('#teach-list .row')].filter(b=>b.querySelector('.t').firstChild.textContent===n)[0].click()}", name); await pg.wait_for_timeout(150)
        async def use(): await pg.click('[data-tab="use"]'); await pg.wait_for_timeout(150)
        print('1 ennen:', await vis())
        await page('Päivä valittu'); print('2 ehto ennen:', await inc()); await pg.click('#bn-toggle'); await pg.wait_for_timeout(300)
        print('  pullonkaulana:', await inc()); print('  rivit:', await rows()); await pg.screenshot(path='pt9_c.png')
        await tolist(); await pg.wait_for_timeout(300); print('  lista:', await lst()); await pg.screenshot(path='pt9_list.png')
        await use(); print('3 käyttö alussa:', await vis()); await pg.click('#p-use .row:has-text("Maanantai")'); print('  ma:', await vis())
        # vaihtoehto pullonkaulaksi muokkausikkunasta
        await tolist(); await pg.click('#teach-order'); await pg.click('#optlist .oname:has-text("DKT-tiimi")'); await pg.wait_for_timeout(200)
        print('4 ikkuna:', await pg.evaluate("[...document.querySelectorAll('#os-bn button')].map(b=>b.textContent+(b.getAttribute('aria-pressed')==='true'?'*':'')).join(' | ')"))
        await pg.click('#os-bn [data-b2="b"]'); print('  vihje:', await pg.inner_text('#os-bnhint')); await pg.screenshot(path='pt9_sheet.png'); await pg.click('#os-ok'); await pg.wait_for_timeout(200)
        print('  järjestyslista:', await pg.evaluate("[...document.querySelectorAll('#optlist .oname')].map(b=>b.innerText.replace(/\\n/g,' ')).join('; ')"), '| polku:', await store('t.sel'))
        await use(); print('  ma:', await vis()); await pg.click('#p-use .row:has-text("DKT-tiimi")'); await pg.wait_for_timeout(300); print('  ma+dkt:', await vis()); await pg.screenshot(path='pt9_use.png')
        await pg.click('#p-use .row:has-text("Sali")'); await pg.click('#p-use .row:has-text("DKT-tiimi")'); print('5 dkt pois:', (await pg.inner_text('#ctx')).replace('\n',' '), '|', await msg()); await pg.click('#use-undo')
        await pg.click('#ctx .pchip.reset'); await pg.click('#use-showall'); await pg.click('#p-use .row:has-text("Ilta")'); print('  lukittu:', await pg.inner_text('#use-msg')); await pg.click('#use-showall')
        for n in ['Maanantai','DKT-tiimi','Sali']: await pg.click('#p-use .row:has-text("%s")' % n)
        print('  polku:', await store('t.sel'))
        # järjestys ratkaisee: Sali pullonkaulan eteen -> polussa oleva Sali säilyy, Ilta jää taakse
        await tolist(); await pg.click('#teach-order'); await pg.click('#optlist [data-up="o6"]'); await pg.click('#optlist [data-up="o6"]'); await pg.click('#p-teach .btn:has-text("Valmis")')
        print('6 siirron jälkeen:', await store('t.opts.map(function(o){return o.n})')); print('  polku siirron jälkeen:', await store('t.sel')); await use(); await pg.click('#ctx .pchip.reset'); await pg.click('#p-use .row:has-text("Tiistai")'); print('  ti:', await vis())
        # sivulta: DKT-tiimin rivit ja pullonkaulan poisto
        await page('DKT-tiimi'); await pg.wait_for_timeout(300); print('7 dkt:', await inc()); print('  rivit:', await rows()); await pg.screenshot(path='pt9_i.png')
        await pg.click('#bn-toggle'); print('  poistettu:', await inc(), '|', await store('t.opts.map(function(o){return o.b?1:0})'))
        await use(); print('  ti:', await vis())
        await pg.click('[data-tab="set"]')
        async with pg.expect_download() as dl:
            await pg.click('.btn:has-text("Vie tiedosto")')
        obj=json.load(open(await (await dl.value).path(),encoding='utf8')); t=obj['trees'][0]; print('8 vienti:', [o['name'] for o in t['options'] if o.get('bottleneck')])
        before = await store('[t.opts,t.suf,t.req,t.rec,t.close]')
        await pg.click('summary:has-text("Tuo liittämällä")'); await pg.fill('#imptext', json.dumps(obj)); await pg.click('text=Tuo teksti'); await pg.click('text=Korvaa tiedot'); print('  tuonti sama:', before == await store('[t.opts,t.suf,t.req,t.rec,t.close]'))
        ow = await pg.evaluate("[document.documentElement.scrollWidth, document.getElementById('main').scrollWidth, document.getElementById('main').clientWidth]"); print(ow)
        state = await pg.evaluate("localStorage.getItem('paatoskartta:v1')")
        await ctx.close()
        ctx = await b.new_context(viewport={'width':320,'height':640}, device_scale_factor=2, color_scheme='dark')
        await ctx.add_init_script(SEED % json.dumps(state))
        pg = await ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(U); await pg.click('[data-tab="teach"]'); await pg.evaluate("[...document.querySelectorAll('#teach-list .row')].filter(b=>b.querySelector('.t').firstChild.textContent==='Päivä valittu')[0].click()"); await pg.wait_for_timeout(300); await pg.screenshot(path='pt9_n_c.png')
        ow=[await pg.evaluate("[document.documentElement.scrollWidth, document.getElementById('main').scrollWidth, document.getElementById('main').clientWidth]")]
        await pg.click('#p-teach .link:has-text("Nimeä uudelleen")'); await pg.wait_for_timeout(300); await pg.screenshot(path='pt9_n_sheet.png')
        print(ow, await pg.evaluate("[document.getElementById('osheet').scrollWidth,document.getElementById('osheet').clientWidth,document.getElementById('osheet').scrollHeight,document.getElementById('osheet').clientHeight]"))
        print('errs',errs); await b.close()
asyncio.run(main())
