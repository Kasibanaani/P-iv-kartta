import asyncio, json
from playwright.async_api import async_playwright
import os
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
old={'tseq':1,'cur':'t1','trees':[{'id':'t1','name':'Työpäivä','oseq':9,'opts':[{'id':'o1','n':'Maanantai','note':''},{'id':'o2','n':'Tiistai','note':''},{'id':'o3','n':'Keskiviikko','note':''},{'id':'o4','n':'DKT-tiimi','note':''},{'id':'o5','n':'Valmistaudu 15 min etukäteen','note':''},{'id':'o6','n':'Hoitosuunnitelma','note':''},{'id':'o7','n':'Sali','note':''},{'id':'o8','n':'Päivä valittu','note':'','c':'any'},{'id':'o9','n':'Ma ja DKT','note':'','c':'any'}],
  'open':{'o4':['o5']},'close':{'o1':['o2','o3'],'o2':['o1','o3'],'o3':['o1','o2']},'rec':{'o1':['o6'],'o9':['o7']},'cond':{'o8':['o1','o2','o3'],'o9':[]},'req':{'o9':['o1','o4']},'gate':{'o8':['o4','o5','o6','o7']},'sel':[]}],'cfg':{'tint':'sininen','mode':'auto','vis':'lukitutpois'},'meta':{}}
v2={'tseq':1,'cur':'t1','trees':[{'id':'t1','name':'Vanha','oseq':3,'opts':[{'id':'o1','n':'A','note':''},{'id':'o2','n':'B','note':''},{'id':'o3','n':'C','note':''}],'open':{'o1':['o2']},'close':{'o1':['o3']},'sel':['o1']}],'cfg':{'tint':'vihrea','mode':'auto','show':'kaikki'},'meta':{}}
SEED="if(!localStorage.getItem('paatoskartta:v1'))localStorage.setItem('paatoskartta:v1', %s);"
def strip(j):
    v=json.loads(j); return [v[0]]+[{k:x for k,x in m.items() if x} for m in v[1:]]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        ctx = await b.new_context(viewport={'width':390,'height':800}, device_scale_factor=2, accept_downloads=True)
        await ctx.add_init_script(SEED % json.dumps(json.dumps(old)))
        pg = await ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(U); await pg.wait_for_timeout(300)
        async def vis(): return await pg.evaluate("[...document.querySelectorAll('#p-use .row')].filter(b=>!b.hidden).map(b=>b.querySelector('.t').textContent+'='+(b.className.replace('row','').trim()||'neutraali')).join(', ')")
        async def bar(): return await pg.evaluate("(function(){var t=document.getElementById('top'),c=document.getElementById('ctx');return t.dataset.mode+' | '+document.getElementById('mode').textContent+' | korkeus '+t.offsetHeight+' | tausta '+getComputedStyle(t).backgroundColor+' | rivi2: '+(c.hidden?'-':c.innerText.replace(/\\n/g,' ').trim())+' | teemaväri '+document.querySelector('meta[name=theme-color]').content+' | piste '+!document.getElementById('setdot').hidden})()")
        async def msg(): return (await pg.inner_text('#info')).replace('\n',' | ') if await pg.is_visible('#info') else '(ei viestiä)'
        inc = lambda: pg.evaluate("document.getElementById('teach-inc').innerText.replace(/\\n/g,' ')")
        store = lambda q: pg.evaluate("(function(){var d=JSON.parse(localStorage.getItem('paatoskartta:v1')),t=d.trees[0];return JSON.stringify(%s)})()" % q)
        lst = lambda: pg.evaluate("[...document.querySelectorAll('#teach-list .row')].map(b=>b.querySelector('.t').firstChild.textContent+' ('+b.querySelector('small').textContent+')').join('; ')")
        FIND="(n)=>[...document.querySelectorAll('#p-teach .trow')].filter(r=>r.querySelector('.t').textContent===n)[0]"
        async def tag(name): return await pg.evaluate("(n)=>{var r=("+FIND+")(n),b=r.querySelector('.row'),s=r.querySelector('.star');return (b.querySelector('.tag').textContent||'-')+(s?(s.getAttribute('aria-pressed')==='true'?' ★':' ☆'):' (ei tähteä)')}", name)
        async def tap(name, n=1):
            out=[]
            for i in range(n):
                await pg.evaluate("(n)=>{var b=("+FIND+")(n).querySelector('.row');b.scrollIntoView({block:'center'});b.click();}", name); await pg.wait_for_timeout(40)
                out.append((await tag(name)).rsplit(' ',1)[0] if '(ei' not in await tag(name) else (await tag(name)).replace(' (ei tähteä)',''))
            return out
        async def star(name): await pg.evaluate("(n)=>{("+FIND+")(n).querySelector('.star').click();}", name); await pg.wait_for_timeout(40)
        async def lp(name):
            box = await pg.evaluate("(n)=>{var b=("+FIND+")(n).querySelector('.row');b.scrollIntoView({block:'center'});var q=b.getBoundingClientRect();return [q.x+40,q.y+20]}", name)
            await pg.mouse.move(box[0],box[1]); await pg.mouse.down(); await pg.wait_for_timeout(700); await pg.mouse.up(); await pg.wait_for_timeout(200)
        async def tolist():
            await pg.click('[data-tab="teach"]'); await pg.wait_for_timeout(100)
            if await pg.is_visible('#ctx-back'): await pg.click('#ctx-back')
        async def page(name):
            await tolist(); await pg.evaluate("(n)=>{[...document.querySelectorAll('#teach-list .row')].filter(b=>b.querySelector('.t').firstChild.textContent===n)[0].click()}", name); await pg.wait_for_timeout(150)
        brush = lambda: pg.inner_text('#ctx-brush')
        print('1 siirto:', await store('[t.suf,t.req,t.rec,Object.keys(t).sort()]'))
        print('  palkki:', await bar()); print('  alku:', await vis()); await pg.screenshot(path='pt8_u0.png')
        await pg.click('#p-use .row:has-text("Maanantai")'); print('  ma:', await vis()); await pg.click('#p-use .row:has-text("DKT-tiimi")'); await pg.wait_for_timeout(350); print('  ma+dkt:', await vis()); print('  palkki:', await bar()); await pg.screenshot(path='pt8_u1.png')
        await tolist(); await pg.wait_for_timeout(300); print('2 opetus, palkki:', await bar()); print('  lista:', await lst()); await pg.screenshot(path='pt8_list.png')
        await page('DKT-tiimi'); await pg.wait_for_timeout(300); print('3 DKT-tiimi, palkki:', await bar()); print('  yhteenveto:', await inc())
        print('  rivit:', ' ; '.join([n+': '+await tag(n) for n in ['Maanantai','Valmistaudu 15 min etukäteen','Sali','Päivä valittu','Ma ja DKT']])); await pg.screenshot(path='pt8_i0.png')
        print('  kierto Sali:', await tap('Sali',6), await store('[t.suf.o7||[],t.req.o7,t.suf.o4||[],t.req.o4]'))
        print('  Hoito x2:', await tap('Hoitosuunnitelma',2), '| siveltimenä:', await brush())
        print('  Sali toistaa edellisen:', await tap('Sali',1), '| sitten:', await tap('Sali',5), '| sivellin:', await brush())
        print('  Keskiviikko toistaa:', await tap('Keskiviikko',1)); await tap('Keskiviikko',5); await tap('Hoitosuunnitelma',4)
        await star('Hoitosuunnitelma'); print('  tähti:', await tag('Hoitosuunnitelma'), await store('t.rec.o4')); await star('Hoitosuunnitelma'); print('  tähti pois:', await tag('Hoitosuunnitelma'), await store('t.rec.o4'))
        await lp('Sali'); print('  pitkä painallus:', await tag('Sali'), await store('[t.close.o4,t.close.o7]')); await lp('Sali'); print('  uudestaan:', await tag('Sali')); await lp('Päivä valittu'); print('  ehtoon ei vaikuta:', await tag('Päivä valittu'))
        print('  polku säilyi:', await store('t.sel'))
        await pg.evaluate("document.getElementById('main').scrollTop=600"); await pg.wait_for_timeout(200); await pg.screenshot(path='pt8_i1.png'); print('  palkki vieritettynä:', await pg.evaluate("document.getElementById('top').getBoundingClientRect().top+' / '+document.getElementById('ctx-name').textContent"))
        await page('Valmistaudu 15 min etukäteen'); print('4 peilikuva:', await tag('DKT-tiimi'), '|', await tag('Päivä valittu'), '|', await inc())
        await page('Päivä valittu'); await pg.wait_for_timeout(300); print('5 ehto:', await inc()); print('  rivit:', ' ; '.join([n+': '+await tag(n) for n in ['Maanantai','DKT-tiimi','Ma ja DKT']])); await pg.screenshot(path='pt8_c0.png')
        # uusi vaihtoehto ja sen merkintä ehdon sivulta toistolla
        await tolist(); await pg.fill('#newopt','Etäpäivä'); await pg.click('#addplain'); await pg.fill('#newopt','Lounas'); await pg.click('#addplain')
        await page('Päivä valittu'); print('6 uudet:', await tap('Etäpäivä',2), '| toisto:', await tap('Lounas',1), '|', await store('[t.req.o10,t.req.o11]'))
        await pg.click('[data-tab="use"]'); await pg.wait_for_timeout(200); print('  käyttö:', await vis())
        await pg.click('#p-use .row:has-text("Tiistai")'); print('  vaihto tiistaihin:', (await pg.inner_text('#ctx')).replace('\n',' '), '|', await msg(), '|', await vis())
        await pg.click('#p-use .row:has-text("Valmistaudu")'); await pg.click('#ctx .pchip >> nth=1'); print('  paluu kohtaan 2:', (await pg.inner_text('#ctx')).replace('\n',' '), '|', await msg())
        await pg.click('#ctx .pchip >> nth=0'); print('  paluu kohtaan 1:', (await pg.inner_text('#ctx')).replace('\n',' '), '|', await msg())
        await pg.click('#ctx .pchip.reset'); print('  alusta:', await bar(), '|', await msg()); await pg.click('#info-undo'); print('  kumoa:', (await pg.inner_text('#ctx')).replace('\n',' ')); await pg.click('#ctx .pchip.reset')
        await pg.click('#use-showall'); await pg.click('#p-use .row:has-text("Valmistaudu")'); print('  lukittu:', await pg.inner_text('#info-text')); await pg.click('#use-showall')
        # asetukset, vienti, tuonti
        await pg.click('[data-tab="set"]'); print('7 asetukset, palkki:', await bar())
        async with pg.expect_download() as dl:
            await pg.click('.btn:has-text("Vie tiedosto")')
        obj=json.load(open(await (await dl.value).path(),encoding='utf8')); t=obj['trees'][0]; print('  vienti:', obj['version'], sorted(t.keys()), json.dumps(t['sufs']), json.dumps(t['reqs']), json.dumps(t['recs']))
        print('  piste viennin jälkeen:', await pg.evaluate("!document.getElementById('setdot').hidden"))
        before = await store('[t.opts,t.suf,t.req,t.rec,t.close]')
        await pg.click('summary:has-text("Tuo liittämällä")'); await pg.fill('#imptext', json.dumps(obj)); await pg.click('text=Tuo teksti'); await pg.click('text=Korvaa tiedot'); print('  tuonti:', await pg.inner_text('#datamsg'), '|', await pg.inner_text('#datainfo'), '| sama:', strip(before) == strip(await store('[t.opts,t.suf,t.req,t.rec,t.close]')))
        ow = await pg.evaluate("[document.documentElement.scrollWidth, document.getElementById('main').scrollWidth, document.getElementById('main').clientWidth]"); print(ow)
        state = await pg.evaluate("localStorage.getItem('paatoskartta:v1')")
        await ctx.close()
        ctx = await b.new_context(viewport={'width':320,'height':640}, device_scale_factor=2, color_scheme='dark')
        await ctx.add_init_script(SEED % json.dumps(state))
        pg = await ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(U); await pg.click('#p-use .row:has-text("Maanantai")'); await pg.click('#p-use .row:has-text("DKT-tiimi")'); await pg.click('#p-use .row:has-text("Valmistaudu")'); await pg.wait_for_timeout(350); await pg.screenshot(path='pt8_n_u.png')
        ow=[await pg.evaluate("[document.documentElement.scrollWidth, document.getElementById('main').scrollWidth, document.getElementById('main').clientWidth, document.getElementById('top').offsetHeight]")]
        await pg.click('[data-tab="teach"]'); await pg.wait_for_timeout(300); await pg.screenshot(path='pt8_n_list.png'); ow.append(await pg.evaluate("[document.documentElement.scrollWidth, document.getElementById('main').scrollWidth, document.getElementById('main').clientWidth, document.getElementById('top').offsetHeight]"))
        await pg.evaluate("[...document.querySelectorAll('#teach-list .row')].filter(b=>b.querySelector('.t').firstChild.textContent==='Valmistaudu 15 min etukäteen')[0].click()"); await pg.wait_for_timeout(300)
        await pg.evaluate("[...document.querySelectorAll('#p-teach .trow')].filter(r=>r.querySelector('.t').textContent==='Sali')[0].querySelector('.row').click()"); await pg.wait_for_timeout(300); await pg.screenshot(path='pt8_n_i.png')
        ow.append(await pg.evaluate("[document.documentElement.scrollWidth, document.getElementById('main').scrollWidth, document.getElementById('main').clientWidth, document.getElementById('top').offsetHeight]")); print(ow)
        print('  rivit', await pg.evaluate("[...document.querySelectorAll('#p-teach .trow')].map(b=>[b.scrollWidth,b.clientWidth,b.offsetHeight])"))
        await ctx.close()
        # hyvin vanha tallennus
        ctx = await b.new_context(viewport={'width':390,'height':800})
        await ctx.add_init_script(SEED % json.dumps(json.dumps(v2)))
        pg = await ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(U); await pg.wait_for_timeout(300); print('8 vanha tallennus:', await pg.evaluate("[...document.querySelectorAll('#p-use .row')].filter(b=>!b.hidden).map(b=>b.querySelector('.t').textContent+'='+(b.className.replace('row','').trim()||'neutraali')).join(', ')"), '|', await pg.evaluate("localStorage.getItem('paatoskartta:v1')"))
        print('errs',errs); await b.close()
asyncio.run(main())
