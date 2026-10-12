import asyncio, json
from playwright.async_api import async_playwright
import os
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
# edellisen version tallennus: ei päiviä, polku tallessa
old={'tseq':2,'cur':'t1','trees':[{'id':'t1','name':'Työpäivä','oseq':7,'opts':[{'id':'o1','n':'Maanantai','note':''},{'id':'o2','n':'Tiistai','note':''},{'id':'o3','n':'Päivä valittu','note':'','c':'any','b':True},{'id':'o4','n':'DKT-tiimi','note':''},{'id':'o5','n':'Valmistaudu tiimiin','note':''},{'id':'o6','n':'Hoitosuunnitelma','note':''},{'id':'o7','n':'Sali','note':''}],
  'suf':{'o3':['o1','o2']},'req':{'o5':['o4']},'rec':{'o4':['o5'],'o1':['o6']},'close':{'o1':['o2'],'o2':['o1']},'sel':['o1','o4']},
  {'id':'t2','name':'Toinen','oseq':2,'opts':[{'id':'o1','n':'A','note':''},{'id':'o2','n':'B','note':''}],'suf':{},'req':{},'rec':{},'close':{},'sel':['o2']}],'cfg':{'tint':'sininen','mode':'auto','vis':'lukitutpois'},'meta':{}}
SEED="if(!localStorage.getItem('paatoskartta:v1'))localStorage.setItem('paatoskartta:v1', %s);"
GEO="(function(){function r(id){var e=document.getElementById(id);var q=e.getBoundingClientRect();return [Math.round(q.left),Math.round(q.top),Math.round(q.width),Math.round(q.height)];}return JSON.stringify([document.getElementById('top').offsetHeight,r('tname').slice(0,2),r('mode'),r('ctx')]);})()"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        ctx = await b.new_context(viewport={'width':390,'height':800}, device_scale_factor=2, accept_downloads=True)
        await ctx.add_init_script(SEED % json.dumps(json.dumps(old)))
        pg = await ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(U); await pg.wait_for_timeout(300)
        vis = lambda: pg.evaluate("[...document.querySelectorAll('#p-use .row')].filter(b=>!b.hidden).map(b=>b.querySelector('.t').textContent+'='+(b.className.replace('row','').trim()||'neutraali')).join(', ')")
        ctxt = lambda: pg.evaluate("document.getElementById('ctx').innerText.replace(/\\n/g,' ')")
        days = lambda i=0: pg.evaluate("(i)=>{var d=JSON.parse(localStorage.getItem('paatoskartta:v1')).trees[i].days,o={};Object.keys(d).sort().forEach(function(k){o[k]=d[k].s.join('+')});return JSON.stringify(o)}", i)
        today = await pg.evaluate("(function(){var d=new Date();function p(n){return n<10?'0'+n:''+n}return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())})()")
        geo={}
        print('1 siirto: tänään', today, '| t1', await days(0), '| t2', await days(1)); print('  rivi2:', await ctxt(), '|', await vis()); geo['käyttö']=await pg.evaluate(GEO); await pg.screenshot(path='pt12_u0.png')
        print('  päivänappi:', await pg.get_attribute('#day-label','aria-label'), '| luokka:', await pg.get_attribute('.dnav','class'))
        # edellinen päivä: tyhjä, tehdään valintoja
        await pg.click('.dnav [data-day="-1"]'); await pg.wait_for_timeout(200); print('2 eilinen:', await ctxt(), '|', await vis(), '| luokka:', await pg.get_attribute('.dnav','class'))
        await pg.click('#p-use .row:has-text("Tiistai")'); await pg.click('#p-use .row:has-text("Sali")'); await pg.wait_for_timeout(300); print('  valinnat:', await ctxt(), '|', await days(0)); geo['käyttö eilinen']=await pg.evaluate(GEO); await pg.screenshot(path='pt12_u1.png')
        await pg.click('.dnav [data-day="-1"]'); await pg.click('#p-use .row:has-text("Maanantai")'); await pg.click('#p-use .row:has-text("Hoitosuunnitelma")'); print('  toissapäivä:', await days(0))
        await pg.click('.dnav [data-day="1"]'); await pg.click('.dnav [data-day="1"]'); await pg.wait_for_timeout(200); print('3 takaisin tähän päivään:', await ctxt(), '|', await vis())
        # kalenteri
        await pg.click('#day-label'); await pg.wait_for_timeout(250); await pg.screenshot(path='pt12_cal.png')
        print('4 kalenteri:', await pg.inner_text('#ds-h'), '| kirjatut:', await pg.evaluate("[...document.querySelectorAll('.cday.has')].map(b=>b.textContent).join(',')"), '| tänään:', await pg.evaluate("document.querySelector('.cday.today').textContent"), '| valittu:', await pg.evaluate("document.querySelector('.cday.on').textContent"))
        await pg.click('#ds-prev'); m1=await pg.inner_text('#ds-h'); await pg.click('#ds-next'); await pg.click('#ds-next'); print('  kuukaudet:', m1, '->', await pg.inner_text('#ds-h')); await pg.click('#ds-prev')
        yd=await pg.evaluate("(function(){var d=new Date();d.setDate(d.getDate()-1);function p(n){return n<10?'0'+n:''+n}return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())})()")
        if yd[:7]!=today[:7]: await pg.click('#ds-prev')
        await pg.click('.cday[data-d="%s"]' % yd); await pg.wait_for_timeout(200); print('  kalenterista eiliseen:', await ctxt(), '| ikkuna kiinni:', not await pg.is_visible('#dsheet'))
        await pg.click('#day-label'); await pg.click('#ds-today'); await pg.wait_for_timeout(200); print('  Tänään-painike:', await ctxt())
        # poisto tyhjentää päivän kirjauksen; kumoa palauttaa
        await pg.click('#ctx .pchip.reset'); print('5 alusta:', await days(0)); await pg.click('#info-undo'); print('  kumoa:', await days(0))
        # opetus ei näytä päivää
        await pg.click('[data-tab="teach"]'); await pg.wait_for_timeout(200); print('6 opetus rivi2:', await ctxt(), '| päivänappi näkyvissä:', await pg.locator('.dnav').count()); geo['opetus']=await pg.evaluate(GEO)
        await pg.evaluate("[...document.querySelectorAll('#teach-list .row')].filter(b=>b.querySelector('.t').firstChild.textContent==='Sali')[0].click()"); await pg.wait_for_timeout(200); print('  tekijän sivu rivi2:', await ctxt(), '| päivänappi:', await pg.locator('.dnav').count())
        # toinen puu: omat päivänsä
        await pg.click('#title'); await pg.click('#ts-list [data-tree="t2"]'); await pg.click('[data-tab="use"]'); await pg.wait_for_timeout(200); print('7 toinen puu:', await ctxt(), '|', await vis(), '|', await days(1))
        await pg.click('#p-use .row:has-text("A")'); print('  valinta:', await days(1), '| t1 ennallaan:', await days(0))
        await pg.click('#title'); await pg.click('#ts-list [data-tree="t1"]'); await pg.wait_for_timeout(200); print('  takaisin:', await ctxt())
        # seuranta
        await pg.click('[data-tab="stat"]'); await pg.wait_for_timeout(300); geo['seuranta']=await pg.evaluate(GEO); print('8 seuranta rivi2:', await ctxt()); await pg.screenshot(path='pt12_stat.png', full_page=False)
        print('  kortit:', await pg.evaluate("[...document.querySelectorAll('#stat-list .scard,#stat-conds .scard')].map(c=>c.innerText.replace(/\\n/g,' ')).join(' || ')"))
        await pg.click('#stat-span [data-span="7"]'); print('  7 päivää:', await ctxt()); await pg.click('#stat-span [data-span="all"]')
        await pg.click('[data-tab="set"]'); geo['asetukset']=await pg.evaluate(GEO); print('9 tiedot:', await pg.inner_text('#datainfo'))
        async with pg.expect_download() as dl:
            await pg.click('.btn:has-text("Vie tiedosto")')
        obj=json.load(open(await (await dl.value).path(),encoding='utf8')); print('  vienti:', obj['version'], sorted(obj['trees'][0]['days'].keys())==sorted(json.loads(await days(0)).keys()), list(obj['trees'][0]['days'].values())[0])
        before=await pg.evaluate("JSON.stringify(JSON.parse(localStorage.getItem('paatoskartta:v1')).trees.map(function(t){return t.days}))")
        await pg.click('summary:has-text("Tuo liittämällä")'); await pg.fill('#imptext', json.dumps(obj)); await pg.click('text=Tuo teksti'); await pg.click('text=Korvaa tiedot'); print('  tuonti: päivät samat:', before==await pg.evaluate("JSON.stringify(JSON.parse(localStorage.getItem('paatoskartta:v1')).trees.map(function(t){return t.days}))"))
        await pg.click('[data-tab="use"]'); await pg.wait_for_timeout(200); print('  tuonnin jälkeen käyttö:', await ctxt())
        # puun korvaus tekstinä säilyttää kirjaukset nimien perusteella
        await pg.click('#title'); await pg.click('#ts-list [data-edit="t1"]'); 
        txt=await pg.evaluate("(function(){var d=JSON.parse(localStorage.getItem('paatoskartta:v1'));return 1})()")
        await pg.click('#ns-ok')
        tr={"paatoskartta":"puu","nimi":"Työpäivä","tekijat":[{"nimi":"Uusi alku"},{"nimi":"Maanantai"},{"nimi":"Tiistai"},{"nimi":"Sali"}],"ei_sovi_yhteen":[["Maanantai","Tiistai"]]}
        await pg.click('#title'); await pg.click('#ti-box summary'); await pg.fill('#ti-text', json.dumps(tr,ensure_ascii=False)); await pg.click('#ti-check'); await pg.click('#ti-out [data-act="replace"]'); await pg.wait_for_timeout(300)
        print('10 korvaus säilyttää päivät:', await pg.evaluate("(function(){var t=JSON.parse(localStorage.getItem('paatoskartta:v1')).trees[0],nm={};t.opts.forEach(function(o){nm[o.id]=o.n});var o={};Object.keys(t.days).sort().forEach(function(k){o[k]=t.days[k].s.map(function(x){return nm[x]}).join('+')});return JSON.stringify(o)})()"))
        hs=set(geo.values()); print('palkki sama kaikissa:', len(hs)==1, list(hs)[0] if len(hs)==1 else geo)
        ow = await pg.evaluate("[document.documentElement.scrollWidth, document.getElementById('main').scrollWidth, document.getElementById('main').clientWidth]"); print(ow)
        state = await pg.evaluate("localStorage.getItem('paatoskartta:v1')")
        await ctx.close()
        ctx = await b.new_context(viewport={'width':320,'height':640}, device_scale_factor=2, color_scheme='dark')
        await ctx.add_init_script(SEED % json.dumps(state))
        pg = await ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(U); await pg.click('#p-use .row:has-text("Maanantai")'); await pg.click('#p-use .row:has-text("Sali")'); await pg.wait_for_timeout(300); await pg.screenshot(path='pt12_n_u.png')
        ow=[await pg.evaluate("[document.documentElement.scrollWidth, document.getElementById('main').scrollWidth, document.getElementById('main').clientWidth, document.getElementById('top').offsetHeight]")]
        await pg.click('#day-label'); await pg.wait_for_timeout(250); await pg.screenshot(path='pt12_n_cal.png'); print('kalenteri 320:', await pg.evaluate("[document.getElementById('dsheet').scrollWidth,document.getElementById('dsheet').clientWidth]")); await pg.click('#ds-close')
        await pg.click('[data-tab="stat"]'); await pg.wait_for_timeout(300); await pg.screenshot(path='pt12_n_stat.png'); ow.append(await pg.evaluate("[document.documentElement.scrollWidth, document.getElementById('main').scrollWidth, document.getElementById('main').clientWidth, document.getElementById('top').offsetHeight]")); print(ow)
        print('välilehdet:', await pg.evaluate("[...document.querySelectorAll('.tab')].map(b=>b.textContent.trim()+' '+Math.round(b.getBoundingClientRect().width)).join(' | ')"))
        print('errs',errs); await b.close()
asyncio.run(main())
