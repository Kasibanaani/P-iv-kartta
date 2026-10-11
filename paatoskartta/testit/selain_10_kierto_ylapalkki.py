import asyncio, json
from playwright.async_api import async_playwright
import os
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
old={'tseq':1,'cur':'t1','trees':[{'id':'t1','name':'Työpäivä','oseq':8,'opts':[{'id':'o1','n':'Maanantai','note':''},{'id':'o2','n':'Tiistai','note':''},{'id':'o3','n':'Keskiviikko','note':''},{'id':'o8','n':'Päivä valittu','note':'','c':'any','b':True},{'id':'o4','n':'DKT-tiimi','note':''},{'id':'o5','n':'Valmistaudu 15 min etukäteen','note':''},{'id':'o6','n':'Hoitosuunnitelma','note':''},{'id':'o7','n':'Sali','note':''}],
  'suf':{'o8':['o1','o2','o3'],'o5':['o4']},'req':{},'rec':{'o1':['o6'],'o4':['o5']},'close':{'o1':['o2','o3'],'o2':['o1','o3'],'o3':['o1','o2']},'sel':[]}],'cfg':{'tint':'sininen','mode':'auto','vis':'lukitutpois'},'meta':{}}
SEED="if(!localStorage.getItem('paatoskartta:v1'))localStorage.setItem('paatoskartta:v1', %s);"
GEO="(function(){function r(id){var e=document.getElementById(id);if(!e||e.hidden)return null;var q=e.getBoundingClientRect();return [Math.round(q.left),Math.round(q.top),Math.round(q.width),Math.round(q.height)];}var c=document.getElementById('ctx');return {palkki:document.getElementById('top').offsetHeight,nimi:r('tname'),tila:r('mode'),rivi2:r('ctx'),teksti:c.innerText.replace(/\\n/g,' ').trim()};})()"
async def run(w,h,scheme,shots):
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        ctx = await b.new_context(viewport={'width':w,'height':h}, device_scale_factor=2, color_scheme=scheme)
        await ctx.add_init_script(SEED % json.dumps(json.dumps(old)))
        pg = await ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(U); await pg.wait_for_timeout(300)
        store = lambda q: pg.evaluate("(function(){var d=JSON.parse(localStorage.getItem('paatoskartta:v1')),t=d.trees[0];return JSON.stringify(%s)})()" % q)
        FIND="(n)=>[...document.querySelectorAll('#p-teach .trow')].filter(r=>r.querySelector('.t').textContent===n)[0]"
        async def tag(name): return await pg.evaluate("(n)=>{var r=("+FIND+")(n),b=r.querySelector('.row');return (b.querySelector('.tag').textContent||'-')}", name)
        async def tap(name, n=1):
            out=[]
            for i in range(n):
                await pg.evaluate("(n)=>{var b=("+FIND+")(n).querySelector('.row');b.scrollIntoView({block:'center'});b.click();}", name); await pg.wait_for_timeout(40); out.append(await tag(name))
            return out
        async def tolist():
            await pg.click('[data-tab="teach"]'); await pg.wait_for_timeout(100)
            if await pg.is_visible('#ctx-back'): await pg.click('#ctx-back')
        async def page(name):
            await tolist(); await pg.evaluate("(n)=>{[...document.querySelectorAll('#teach-list .row')].filter(b=>b.querySelector('.t').firstChild.textContent===n)[0].click()}", name); await pg.wait_for_timeout(150)
        geo={}
        geo['käyttö tyhjä']=await pg.evaluate(GEO)
        if shots: await pg.screenshot(path='pt10_u0.png')
        await pg.click('#p-use .row:has-text("Maanantai")'); await pg.click('#p-use .row:has-text("DKT-tiimi")'); await pg.click('#p-use .row:has-text("Valmistaudu")'); await pg.wait_for_timeout(350); geo['käyttö polku']=await pg.evaluate(GEO)
        if shots: await pg.screenshot(path='pt10_u1.png')
        await tolist(); await pg.wait_for_timeout(300); geo['opetus lista']=await pg.evaluate(GEO)
        if shots: await pg.screenshot(path='pt10_list.png')
        await pg.click('#teach-order'); geo['järjestys']=await pg.evaluate(GEO); await pg.click('#p-teach .btn:has-text("Valmis")')
        await pg.click('#teach-group'); geo['ryhmä']=await pg.evaluate(GEO); await pg.click('#p-teach .btn:has-text("Peru")')
        await page('Hoitosuunnitelma'); await pg.wait_for_timeout(300); geo['tekijä']=await pg.evaluate(GEO)
        if shots:
            print('1 hoito, rivi Maanantai:', await tag('Maanantai'))
            print('  kierto Tiistai:', await tap('Tiistai',6), await store('[t.rec.o2||[],t.suf.o6||[],t.req.o6||[]]'))
            print('  Tiistai suosittelijaksi:', (await tap('Tiistai',5))[-1], '| Keskiviikko toistaa:', await tap('Keskiviikko',1), '| palkki:', (await pg.inner_text('#ctx-brush')).replace('\n',' '), '|', await store('[t.rec.o2,t.rec.o3]'))
            print('  Maanantai suosittelijasta eteenpäin:', await tap('Maanantai',2), await store('t.rec.o1'))
            await tap('Maanantai',5); print('  takaisin suosittelijaksi:', await tag('Maanantai'), await store('t.rec.o1')); await pg.screenshot(path='pt10_i.png')
            await pg.click('[data-tab="use"]'); await pg.click('#ctx .pchip.reset'); await pg.click('#p-use .row:has-text("Tiistai")'); print('  käyttö ti:', await pg.evaluate("[...document.querySelectorAll('#p-use .row')].filter(b=>!b.hidden).map(b=>b.querySelector('.t').textContent+'='+(b.className.replace('row','').trim()||'neutraali')).join(', ')"))
            await page('Valmistaudu 15 min etukäteen'); print('2 yhdistelmä, rivi DKT-tiimi:', await tag('DKT-tiimi'), '| kierto:', await tap('DKT-tiimi',3), await store('[t.rec.o4,t.suf.o5]'))
            await page('Päivä valittu'); print('3 ehdon sivu, kierto Sali:', await tap('Sali',5), '| palkki:', (await pg.inner_text('#ctx-brush')).replace('\n',' '))
        await pg.evaluate("(n)=>{var b=("+FIND+")(n).querySelector('.row');b.click();}", 'Sali'); await pg.wait_for_timeout(100); geo['tekijä merkinnän jälkeen']=await pg.evaluate(GEO)
        await pg.click('[data-tab="set"]'); await pg.wait_for_timeout(200); geo['asetukset']=await pg.evaluate(GEO)
        if shots: await pg.screenshot(path='pt10_set.png')
        hs=set(json.dumps([g['palkki'],g['nimi'][:2]+g['nimi'][3:],g['tila'],g['rivi2']]) for g in geo.values())
        print('%dx%d: palkin mitat samat kaikissa näkymissä:' % (w,h), len(hs)==1, '|', list(hs)[0] if len(hs)==1 else geo)
        if shots:
            for k,g in geo.items(): print('   ', k, '->', g['teksti'])
        ow = await pg.evaluate("[document.documentElement.scrollWidth, document.getElementById('main').scrollWidth, document.getElementById('main').clientWidth]"); print('   leveys', ow, 'errs', errs)
        await b.close()
asyncio.run(run(390,800,'light',True)); asyncio.run(run(320,640,'dark',False))
