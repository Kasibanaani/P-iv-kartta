import asyncio, json
from playwright.async_api import async_playwright
import os
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
old={'tseq':1,'cur':'t1','trees':[{'id':'t1','name':'Työpäivä','oseq':3,'opts':[{'id':'o1','n':'Maanantai','note':''},{'id':'o2','n':'Tiistai','note':''},{'id':'o3','n':'Sali','note':'Muista avaimet'}],
  'suf':{'o3':['o1']},'req':{},'rec':{'o1':['o3']},'close':{'o1':['o2'],'o2':['o1']},'sel':[]}],'cfg':{'tint':'sininen','mode':'auto','vis':'lukitutpois'},'meta':{}}
SEED="if(!localStorage.getItem('paatoskartta:v1'))localStorage.setItem('paatoskartta:v1', %s);"
TREE={"paatoskartta":"puu","nimi":"Lääkearvio","tekijat":[{"nimi":"Uusi potilas"},{"nimi":"Seurantakäynti"},{"nimi":"Tilanne valittu","nakymaton":True,"pullonkaula":True,"riittaa":["Uusi potilas","Seurantakäynti"]},
  {"nimi":"Tarkista lääkelista","suosittelijat":["Uusi potilas"],"huomio":"Käy läpi myös itsehoitolääkkeet.\nKirjaa muutokset."},{"nimi":"Kysy sivuvaikutuksista","suosittelijat":["Seurantakäynti"]},{"nimi":"Yhteisvaikutukset","vaatii":["Tarkista lääkelista"]}],"ei_sovi_yhteen":[["Uusi potilas","Seurantakäynti"]]}
AI_REPLY='Tässä on päätöspuu sovitun rakenteen mukaan:\n\n```json\n'+json.dumps(TREE,ensure_ascii=False,indent=1)+'\n```\n\nKerro, jos haluat muutoksia.'
BAD=json.dumps({"paatoskartta":"puu","nimi":"Viallinen","tekijat":[{"nimi":"A","vaatii":["Olematon"]},{"nimi":"Ehto","nakymaton":True},{"nimi":"B","vaatii":["Ehto"]}]},ensure_ascii=False)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        ctx = await b.new_context(viewport={'width':390,'height':800}, device_scale_factor=2, accept_downloads=True, permissions=['clipboard-read','clipboard-write'])
        await ctx.add_init_script(SEED % json.dumps(json.dumps(old)))
        pg = await ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(U); await pg.wait_for_timeout(300)
        trees = lambda: pg.evaluate("JSON.parse(localStorage.getItem('paatoskartta:v1')).trees.map(function(t){return t.id+':'+t.name+' ('+t.opts.length+')'}).join(', ')")
        clip = lambda: pg.evaluate("navigator.clipboard.readText()")
        vis = lambda: pg.evaluate("[...document.querySelectorAll('#p-use .row')].filter(b=>!b.hidden).map(b=>b.querySelector('.t').textContent+'='+(b.className.replace('row','').trim()||'neutraali')).join(', ')")
        async def openimport():
            await pg.click('#title'); await pg.wait_for_timeout(150)
            if not await pg.is_visible('#ti-text'): await pg.click('#ti-box summary')
        # asetukset: aloitusviesti
        await pg.click('[data-tab="set"]'); print('1 otsikot:', ', '.join(await pg.locator('#p-set h2').all_inner_texts()))
        await pg.locator('#sec-ai').scroll_into_view_if_needed(); await pg.screenshot(path='pt11_set.png')
        await pg.click('#ai-copy'); await pg.wait_for_timeout(200); c=await clip(); print('  kopioitu:', await pg.inner_text('#ai-msg'), '|', len(c), 'merkkiä |', c[:60].replace('\n',' '), '…', c[-70:].replace('\n',' '))
        await pg.click('#ai-show summary'); print('  näytä:', len(await pg.input_value('#ai-show textarea')), '| sama kuin kopioitu:', c==await pg.input_value('#ai-show textarea')); await pg.click('#ai-show summary')
        # tuonti tekstinä
        await pg.click('#ai-import'); await pg.wait_for_timeout(200); print('2 ikkuna auki, tuontikenttä näkyvissä:', await pg.is_visible('#ti-text'))
        await pg.click('#ti-check'); print('  tyhjä:', await pg.inner_text('#ti-msg'))
        await pg.fill('#ti-text', AI_REPLY); await pg.click('#ti-check'); await pg.wait_for_timeout(200); print('  yhteenveto:', (await pg.inner_text('#ti-out')).replace('\n',' | ')); await pg.locator('#ti-out').scroll_into_view_if_needed(); await pg.screenshot(path='pt11_offer.png')
        await pg.click('#ti-out [data-act="add"]'); await pg.wait_for_timeout(300)
        print('  lisätty:', await trees(), '| valittuna:', await pg.inner_text('#tname'), '| ikkuna kiinni:', not await pg.is_visible('#tsheet'), '| piste:', await pg.evaluate("!document.getElementById('setdot').hidden"))
        await pg.click('[data-tab="use"]'); print('  käyttö:', await vis()); await pg.click('#p-use .row:has-text("Uusi potilas")'); print('  valinta:', await vis())
        await pg.click('#p-use .row:has-text("Tarkista lääkelista")'); print('  huomio:', (await pg.inner_text('#info-text')).replace('\n',' / '), '|', await vis())
        # sama nimi: korvaa tai lisää uutena
        await openimport(); await pg.fill('#ti-text', AI_REPLY.replace('Kysy sivuvaikutuksista','Kysy haitoista')); await pg.click('#ti-check'); print('3 sama nimi:', (await pg.inner_text('#ti-out')).replace('\n',' | ')[-190:])
        await pg.click('#ti-out [data-act="replace"]'); await pg.wait_for_timeout(200); print('  korvattu:', await trees(), '|', await pg.evaluate("JSON.parse(localStorage.getItem('paatoskartta:v1')).trees[1].opts[4].n"))
        await openimport(); await pg.fill('#ti-text', AI_REPLY); await pg.click('#ti-check'); await pg.click('#ti-out [data-act="add"]'); await pg.wait_for_timeout(200); print('  uutena:', await trees(), '| valittuna:', await pg.inner_text('#tname'))
        # virheet
        await openimport(); await pg.fill('#ti-text', 'moi'); await pg.click('#ti-check'); print('4 roska:', await pg.inner_text('#ti-msg'))
        full=await pg.evaluate("(function(){var d=JSON.parse(localStorage.getItem('paatoskartta:v1'));return JSON.stringify({app:'paatoskartta',version:6,trees:d.trees.map(function(T){return {id:T.id,name:T.name,options:T.opts.map(function(o){return {id:o.id,name:o.n}}),sufs:T.suf,reqs:T.req,recs:T.rec,closes:T.close,sel:[]}})})})()")
        await pg.fill('#ti-text', full); await pg.click('#ti-check'); print('  varmuuskopio väärässä paikassa:', await pg.inner_text('#ti-msg'))
        await pg.fill('#ti-text', BAD); await pg.click('#ti-check'); await pg.wait_for_timeout(200); print('  huomautuksia:', (await pg.inner_text('#ti-out')).replace('\n',' | ')[:420]); await pg.click('#ti-out [data-act="cancel"]'); print('  peruttu:', await trees()); await pg.click('#ts-close')
        # kopioi tekstinä ja tuo takaisin
        await pg.click('#title'); await pg.click('#ts-list [data-edit="t1"]'); await pg.click('#ns-copy'); await pg.wait_for_timeout(200); t1=await clip(); print('5 kopioi tekstinä:', await pg.inner_text('#ns-msg'), '|', json.dumps(json.loads(t1),ensure_ascii=False)); await pg.click('#ns-ok')
        # asetusten tuonti tunnistaa yksittäisen puun
        await pg.click('[data-tab="set"]'); await pg.click('summary:has-text("Tuo liittämällä")'); await pg.fill('#imptext', t1.replace('"Työpäivä"','"Työpäivä kopio"')); await pg.click('text=Tuo teksti'); await pg.wait_for_timeout(200)
        print('6 asetusten tuonti:', await pg.inner_text('#datamsg'), '|', (await pg.inner_text('#dataout')).replace('\n',' | ')[:150]); await pg.click('#dataout [data-act="add"]'); await pg.wait_for_timeout(200); print('  ->', await pg.inner_text('#datamsg'), '|', await trees())
        same=await pg.evaluate("(function(){var d=JSON.parse(localStorage.getItem('paatoskartta:v1')),a=d.trees[0],b=d.trees[d.trees.length-1];function k(t){return JSON.stringify([t.opts,t.suf,t.req,t.rec,t.close])}return k(a)===k(b)})()"); print('  kopio vastaa alkuperäistä:', same)
        async with pg.expect_download() as dl:
            await pg.click('.btn:has-text("Vie tiedosto")')
        obj=json.load(open(await (await dl.value).path(),encoding='utf8')); print('7 varmuuskopiossa:', [t['name'] for t in obj['trees']])
        await pg.fill('#imptext', json.dumps(obj)); await pg.click('text=Tuo teksti'); print('  varmuuskopion tuonti kysyy korvaamista:', 'korvataan' in await pg.inner_text('#dataout')); await pg.click('text=Korvaa tiedot'); print('  ', await pg.inner_text('#datamsg'), await trees())
        ow = await pg.evaluate("[document.documentElement.scrollWidth, document.getElementById('main').scrollWidth, document.getElementById('main').clientWidth]"); print(ow)
        state = await pg.evaluate("localStorage.getItem('paatoskartta:v1')")
        await ctx.close()
        # kapea, tumma, ei leikepöytälupaa
        ctx = await b.new_context(viewport={'width':320,'height':640}, device_scale_factor=2, color_scheme='dark')
        await ctx.add_init_script("navigator.clipboard.writeText=function(){return Promise.reject(new Error('x'))};"+SEED % json.dumps(state))
        pg = await ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(U); await pg.click('[data-tab="set"]'); await pg.click('#ai-copy'); await pg.wait_for_timeout(200); print('8 ilman leikepöytää:', await pg.inner_text('#ai-msg'), '|', len(await pg.input_value('#ai-out textarea')))
        await pg.locator('#sec-ai').scroll_into_view_if_needed(); await pg.screenshot(path='pt11_n_set.png')
        ow=[await pg.evaluate("[document.documentElement.scrollWidth, document.getElementById('main').scrollWidth, document.getElementById('main').clientWidth]")]
        await pg.click('#ai-import'); await pg.fill('#ti-text', BAD); await pg.click('#ti-check'); await pg.wait_for_timeout(200); await pg.locator('#ti-out .btnrow').scroll_into_view_if_needed(); await pg.screenshot(path='pt11_n_offer.png')
        print(ow, await pg.evaluate("[document.getElementById('tsheet').scrollWidth,document.getElementById('tsheet').clientWidth]"))
        print('errs',errs); await b.close()
asyncio.run(main())
