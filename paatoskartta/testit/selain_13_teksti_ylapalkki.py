# Versio 13: kiinteä yläpalkki (lista ei liiku), kaikki toiminnot painikkeen näköisiä, uusi laji teksti.
import asyncio, json
from playwright.async_api import async_playwright
import os
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
PITKA='Tämä on tarkoituksella pitkä huomio, joka ei mahdu yläpalkin kahdelle riville. '*4+'LOPPU.'
old={'tseq':1,'cur':'t1','trees':[{'id':'t1','name':'Ilta','oseq':8,'opts':[
  {'id':'o1','n':'Väsynyt','note':'Mene ajoissa nukkumaan.'},{'id':'o2','n':'Virkeä','note':''},{'id':'o3','n':'Pitkä huomio','note':PITKA},
  {'id':'o4','n':'Muista juoda vettä','note':'','t':True},
  {'id':'o5','n':'Ohje väsyneelle','note':'Sammuta näytöt tuntia ennen.\nLue hetki paperikirjaa.','t':True},
  {'id':'o6','n':'Lenkki','note':''},
  {'id':'o7','n':'Vireys valittu','note':'','c':'any'},
  {'id':'o8','n':'Ehdon takana oleva teksti','note':'','t':True}],
  'suf':{'o7':['o1','o2']},'req':{'o5':['o1'],'o6':['o2'],'o8':['o7']},'rec':{},'close':{'o1':['o2'],'o2':['o1']},'days':{},'sel':[]}],'cfg':{'tint':'sininen','mode':'auto','vis':'lukitutpois'},'meta':{}}
SEED="if(!localStorage.getItem('paatoskartta:v1'))localStorage.setItem('paatoskartta:v1', %s);"
# painikkeet, joilla ei ole taustaa, kehystä eikä varjoa, eli jotka näyttäisivät pelkältä tekstiltä
AUD="""(function(){var out=[];[].slice.call(document.querySelectorAll('button,summary')).forEach(function(b){
  if(b.closest('nav')||b.closest('.dnav'))return; // välilehdet ja päivän valitsimen osat ovat oman kehyksensä sisällä
  var r=b.getBoundingClientRect();if(!r.width||!r.height)return;
  var cs=getComputedStyle(b),m=/rgba?\\(([^)]+)\\)/.exec(cs.backgroundColor),al=1;if(m){var p=m[1].split(',');al=p.length>3?parseFloat(p[3]):1;}
  var border=parseFloat(cs.borderTopWidth)>0&&cs.borderTopStyle!=='none';
  if(al<0.05&&cs.boxShadow==='none'&&!border)out.push((b.id||b.className||b.tagName)+': '+b.textContent.trim().slice(0,30));});
  return out;})()"""
USE="""(function(){var l=document.getElementById('use-list'),t=document.getElementById('top');
  return {palkki:t.offsetHeight,lista:l?Math.round(l.getBoundingClientRect().top):null,
    ohje:document.getElementById('info-text').innerText.replace(/\\s+/g,' ').trim(),kumoa:!document.getElementById('info-undo').hidden,lisaa:!document.getElementById('info-more').hidden,
    nakyvat:[].slice.call(l?l.children:[]).filter(function(e){return !e.hidden;}).map(function(e){return e.classList.contains('tbox')?'['+e.innerText.replace(/\\n+/g,' / ')+']':e.querySelector('.t').textContent+(e.classList.contains('sel')?'*':(e.classList.contains('excl')?'~':''));})};})()"""
async def run(w,h,scheme,shots,tag):
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]
        ctx = await b.new_context(viewport={'width':w,'height':h}, device_scale_factor=2, color_scheme=scheme)
        await ctx.add_init_script(SEED % json.dumps(json.dumps(old)))
        pg = await ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(U); await pg.wait_for_timeout(300)
        store = lambda q: pg.evaluate("(function(){var d=JSON.parse(localStorage.getItem('paatoskartta:v1')),t=d.trees[0];return JSON.stringify(%s)})()" % q)
        async def use(): return await pg.evaluate(USE)
        async def aud(name):
            a=await pg.evaluate(AUD); print('   tekstin näköisiä painikkeita,', name+':', a if a else 'ei yhtään')
        FIND="(n)=>[...document.querySelectorAll('#p-teach .trow')].filter(r=>r.querySelector('.t').textContent===n)[0]"
        async def tap(name, n=1):
            out=[]
            for i in range(n):
                await pg.evaluate("(n)=>{var b=("+FIND+")(n).querySelector('.row');b.scrollIntoView({block:'center'});b.click();}", name); await pg.wait_for_timeout(40)
                out.append(await pg.evaluate("(n)=>("+FIND+")(n).querySelector('.tag').textContent||'-'", name))
            return out
        async def tolist():
            await pg.click('[data-tab="teach"]'); await pg.wait_for_timeout(100)
            if await pg.is_visible('#ctx-back'): await pg.click('#ctx-back')
        async def page(name):
            await tolist(); await pg.evaluate("(n)=>{[...document.querySelectorAll('#teach-list .row')].filter(b=>b.querySelector('.t').firstChild.textContent===n)[0].click()}", name); await pg.wait_for_timeout(150)
        print('==== %dx%d %s ====' % (w,h,scheme))
        # ---- 1 Käyttö: lista ei liiku, kun yläreunan tieto vaihtuu ----
        tops=[]; pal=[]
        async def step(label):
            u=await use(); tops.append(u['lista']); pal.append(u['palkki'])
            print(' ', label, '| ohjerivi:', u['ohje'] or '(tyhjä)', '| kumoa:', u['kumoa'], '| ei mahdu:', u['lisaa'], '|', ', '.join(u['nakyvat']))
        await step('1 alku')
        if shots: await pg.screenshot(path='pt13%s_u0.png' % tag)
        await aud('käyttö alussa')
        await pg.click('#p-use .row:has-text("Väsynyt")'); await pg.wait_for_timeout(350); await step('  väsynyt')
        if shots: await pg.screenshot(path='pt13%s_u1.png' % tag)
        before=await store('t.days'); await pg.click('#p-use .tbox:has-text("Ohje väsyneelle")'); await pg.click('#p-use .tbox:has-text("Muista juoda vettä")'); await pg.wait_for_timeout(100)
        print('  tekstin napautus ei muuta mitään:', before==await store('t.days'), '| tekstin rooli:', await pg.get_attribute('#p-use .tbox','role'), '| tekstillä data-id:', await pg.evaluate("document.querySelectorAll('#p-use .tbox[data-id]').length"))
        st=await pg.evaluate("(function(){var t=getComputedStyle(document.querySelector('#p-use .tbox')),r=getComputedStyle(document.querySelector('#p-use .row'));return {teksti:[t.borderTopLeftRadius,t.borderLeftWidth,t.backgroundColor,t.fontSize,t.cursor],painike:[r.borderTopLeftRadius,r.borderLeftWidth,r.backgroundColor,r.fontSize,r.cursor]};})()")
        print('  ulkoasu (kulma, vasen reuna, tausta, koko, osoitin): teksti', st['teksti'], '| painike', st['painike'])
        await pg.click('#p-use .row:has-text("Pitkä huomio")'); await pg.wait_for_timeout(350); await step('  pitkä huomio')
        if shots: await pg.screenshot(path='pt13%s_u2.png' % tag)
        await pg.click('#info-more'); await pg.wait_for_timeout(300)
        full=(await pg.inner_text('#is-body')).strip()
        print('  koko teksti avautuu:', await pg.inner_text('#is-h'), '|', len(full), 'merkkiä, loppu mukana:', full.endswith('LOPPU.'))
        if shots: await pg.screenshot(path='pt13%s_isheet.png' % tag)
        await pg.click('#is-close'); await pg.wait_for_timeout(200)
        await pg.click('#info-text'); await pg.wait_for_timeout(200); print('  myös tekstin napautus avaa sen:', await pg.evaluate("document.getElementById('isheet').open")); await pg.click('#is-close')
        await pg.click('#use-showall'); await pg.wait_for_timeout(100); await step('  näytä kaikki')
        if shots: await pg.screenshot(path='pt13%s_u3.png' % tag)
        await pg.click('#p-use .row:has-text("Lenkki")'); await step('  lukitun napautus')
        await aud('käyttö, kaikki näkyvissä')
        await pg.click('#use-showall'); await pg.wait_for_timeout(100)
        await pg.click('#p-use .row:has-text("Virkeä")'); await pg.wait_for_timeout(350); await step('  vaihto virkeään')
        await pg.click('#info-undo'); await pg.wait_for_timeout(350); await step('  kumoa')
        await pg.click('#ctx .pchip.reset'); await pg.wait_for_timeout(350); await step('  alusta')
        print('  lista pysyy paikallaan:', len(set(tops))==1, sorted(set(tops)), '| palkin korkeus sama:', len(set(pal))==1, sorted(set(pal)))
        # ---- 2 Opetus: tekstin lisäys ----
        await tolist(); await pg.wait_for_timeout(200)
        print('2 opetus, lista:', (await pg.inner_text('#ctx')).strip(), '| ohjerivi:', await pg.inner_text('#info-text'))
        print('  rivit:', await pg.evaluate("[...document.querySelectorAll('#teach-list .row')].map(b=>b.querySelector('.t').firstChild.textContent+' ('+b.querySelector('.tag').textContent.replace(' ›','').trim()+'; '+b.querySelector('small').textContent+')').join(' | ')"))
        print('  lisäyspainikkeet:', await pg.evaluate("[...document.querySelectorAll('#addbox .btn')].map(b=>b.textContent+' '+Math.round(b.getBoundingClientRect().width)+'x'+Math.round(b.getBoundingClientRect().height)+(b.scrollWidth>b.clientWidth?' YLI':'')).join(', ')"), '| linkit:', await pg.evaluate("[...document.querySelectorAll('#teach-links .mini')].filter(b=>!b.hidden).map(b=>b.textContent).join(', ')"))
        if shots: await pg.screenshot(path='pt13%s_list.png' % tag)
        await aud('opetus, lista')
        y0=await pg.evaluate("Math.round(document.getElementById('teach-list').getBoundingClientRect().top)")
        await pg.fill('#newopt',''); await pg.click('#addtext'); print('  tyhjä nimi:', await pg.inner_text('#info-text'), '| lista paikallaan:', y0==await pg.evaluate("Math.round(document.getElementById('teach-list').getBoundingClientRect().top)"))
        await pg.fill('#newopt','lenkki'); await pg.click('#addtext'); print('  sama nimi:', await pg.inner_text('#info-text'))
        await pg.fill('#newopt','Ohje virkeälle'); await pg.click('#addtext'); await pg.wait_for_timeout(350)
        print('  + Teksti avaa ikkunan:', await pg.evaluate("document.getElementById('osheet').open"), '|', await pg.inner_text('#os-h'), '| laji:', await pg.evaluate("[...document.querySelectorAll('#os-kind button')].map(b=>b.textContent+(b.getAttribute('aria-pressed')==='true'?'*':'')).join(', ')"),
              '| pullonkaula piilossa:', await pg.evaluate("document.getElementById('os-bnbox').hidden"), '|', await pg.inner_text('#os-namel'), '|', await pg.inner_text('#os-notel'), '| kohdistus:', await pg.evaluate("document.activeElement.id"), '| poisto:', await pg.inner_text('#os-del'))
        if shots: await pg.screenshot(path='pt13%s_sheet.png' % tag)
        await pg.fill('#os-note','Lähde ulos ennen kuutta.\nOta avaimet.'); await pg.click('#os-ok'); await pg.wait_for_timeout(300)
        print('  tekstin sivu:', (await pg.inner_text('#ctx')).replace('\n',' '), '| ohjerivi:', await pg.inner_text('#info-text'), '| tallessa:', await store('t.opts[t.opts.length-1]'))
        print('  rivit (ei muita tekstejä):', await pg.evaluate("[...document.querySelectorAll('#p-teach .trow')].map(r=>r.querySelector('.t').textContent+(r.querySelector('.star')?' ☆':'')).join(', ')"), '| pullonkaulapainike:', await pg.locator('#bn-toggle').count(), '|', (await pg.inner_text('#teach-inc')).replace('\n',' '))
        print('  kierto Virkeä:', await tap('Virkeä',3), '| kierto Vireys valittu:', await tap('Vireys valittu',3), '| palkki:', (await pg.inner_text('#ctx-brush')).replace('\n',' '))
        await tap('Virkeä',2); print('  Virkeä vaadituksi:', await store('[t.req.o9,t.suf.o9||[]]'), '|', (await pg.inner_text('#teach-inc')).replace('\n',' '))
        if shots: await pg.screenshot(path='pt13%s_item.png' % tag)
        await aud('opetus, tekstin sivu')
        await pg.click('#teach-legend summary'); print('  selitteet:', await pg.evaluate("[...document.querySelectorAll('#teach-legend .cyc')].map(p=>p.textContent.split(':')[0].slice(0,24)).join(' | ')")); await pg.click('#teach-legend summary')
        # ---- 3 vaihtoehdon sivu: tekstirivit ----
        await page('Väsynyt')
        print('3 vaihtoehdon sivu, rivit:', await pg.evaluate("[...document.querySelectorAll('#p-teach .trow')].map(r=>r.querySelector('.t').textContent+(r.querySelector('.row').classList.contains('txt')?' [teksti]':'')+(r.querySelector('.star')?' ☆':'')).join(', ')"))
        print('  tekstirivi Ohje väsyneelle on jo:', await pg.evaluate("(n)=>("+FIND+")(n).querySelector('.tag').textContent", 'Ohje väsyneelle'), '| kierto Muista juoda vettä:', await tap('Muista juoda vettä',3), '| kierto vaihtoehtorivi Lenkki:', await tap('Lenkki',6))
        await tap('Muista juoda vettä',1); print('  Muista riittää-merkinnällä:', await store('[t.suf.o4,t.req.o4||[]]'))
        if shots: await pg.screenshot(path='pt13%s_opt.png' % tag)
        await pg.click('#teach-legend summary'); print('  selitteissä maininta tekstiriveistä:', await pg.evaluate("[...document.querySelectorAll('#teach-legend .cyc')].some(p=>p.textContent.indexOf('Tekstirivillä')===0)")); await pg.click('#teach-legend summary')
        # ---- 4 Käyttö uusilla säännöillä ----
        await pg.click('[data-tab="use"]'); await pg.wait_for_timeout(200); await step('4 käyttö alussa')
        await pg.click('#p-use .row:has-text("Virkeä")'); await pg.wait_for_timeout(350); await step('  virkeä')
        if shots: await pg.screenshot(path='pt13%s_u4.png' % tag)
        await pg.click('#p-use .row:has-text("Väsynyt")'); await pg.wait_for_timeout(350); await step('  vaihto väsyneeseen')
        print('  kirjaus ilman tekstejä:', await store('Object.keys(t.days).map(function(d){return t.days[d];})'))
        await pg.click('#ctx .pchip.reset'); await pg.wait_for_timeout(200)
        # ---- 5 lajin vaihto muokkausikkunassa ----
        await page('Lenkki'); print('5 Lenkki ennen:', await store('[t.req.o6,t.opts[5]]'))
        await pg.click('#item-edit'); await pg.wait_for_timeout(250); await pg.click('#os-kind [data-k2="t"]'); print('  vihje:', (await pg.inner_text('#os-kindhint'))[:60], '| pullonkaula piilossa:', await pg.evaluate("document.getElementById('os-bnbox').hidden"))
        await pg.fill('#os-note','Kierrä järvi.'); await pg.click('#os-ok'); await pg.wait_for_timeout(300)
        print('  Lenkki tekstinä:', await store('[t.opts[5],t.req.o6]'), '| sivun rivit:', await pg.evaluate("[...document.querySelectorAll('#p-teach .trow')].map(r=>r.querySelector('.t').textContent+(r.querySelector('.star')?' ☆':'')+':'+(r.querySelector('.tag').textContent||'-')).join(', ')"))
        await pg.click('#item-edit'); await pg.wait_for_timeout(250); await pg.click('#os-kind [data-k2=""]'); print('  takaisin vaihtoehdoksi, pullonkaula näkyy:', not await pg.evaluate("document.getElementById('os-bnbox').hidden"), '|', await pg.inner_text('#os-notel')); await pg.click('#os-ok'); await pg.wait_for_timeout(300)
        print('  Lenkki vaihtoehtona:', await store('[t.opts[5],t.req.o6]'))
        await tolist(); await pg.click('#teach-order'); await pg.wait_for_timeout(200)
        print('  järjestysnäkymä:', await pg.evaluate("[...document.querySelectorAll('#optlist .oname')].map(b=>b.textContent.replace(/\\s+/g,' ').trim()).join(' | ')"), '| ohjerivi:', await pg.inner_text('#info-text'))
        await aud('järjestys'); await pg.click('#p-teach .btn:has-text("Valmis")')
        await pg.click('#teach-group'); print('  ryhmässä vain vaihtoehdot:', await pg.evaluate("[...document.querySelectorAll('#p-teach .row')].map(b=>b.textContent).join(', ')")); await pg.click('#p-teach .btn:has-text("Peru")')
        # ---- 6 Seuranta, Asetukset, vienti ja tuonti ----
        await pg.click('[data-tab="use"]'); await pg.wait_for_timeout(150); await pg.click('#p-use .row:has-text("Väsynyt")'); await pg.wait_for_timeout(200)
        await pg.click('[data-tab="stat"]'); await pg.wait_for_timeout(200)
        print('6 seuranta:', (await pg.inner_text('#ctx')).strip(), '| ohjerivi:', await pg.inner_text('#info-text'), '| kortit:', await pg.evaluate("[...document.querySelectorAll('#stat-list .scard b, #stat-conds .scard b')].map(b=>b.textContent).join(', ')"))
        await aud('seuranta')
        await pg.click('[data-tab="set"]'); await pg.wait_for_timeout(200)
        print('  asetukset:', await pg.inner_text('#datainfo'))
        await aud('asetukset')
        exp=json.loads(await pg.evaluate("(function(){var d=document.querySelectorAll('#p-set details.more');d[1].open=true;d[1].dispatchEvent(new Event('toggle'));return document.querySelector('#textout textarea').value;})()"))
        print('  vienti: versio', exp['version'], '| tekstit:', [(o['name'],o.get('text'),o['note'][:14]) for o in exp['trees'][0]['options'] if o.get('text')], '| vaihtoehdolla ei text-kenttää:', 'text' not in exp['trees'][0]['options'][0])
        await pg.click('#p-set summary:has-text("Tuo liittämällä")'); await pg.fill('#imptext', json.dumps(exp)); await pg.click('#p-set .btn:has-text("Tuo teksti")'); await pg.wait_for_timeout(200)
        print('  tuonnin kysymys:', (await pg.inner_text('#dataout .confirm p')))
        await pg.click('#dataout .btn:has-text("Korvaa tiedot")'); await pg.wait_for_timeout(300)
        print('  tuonnin jälkeen sama:', await store('[t.opts.map(function(o){return [o.id,o.t?"t":(o.c?"c":""),o.note.length];}),t.req,t.suf]'))
        await pg.click('#title'); await pg.wait_for_timeout(250); await pg.evaluate("document.getElementById('ti-box').open=true")
        await pg.fill('#ti-text', json.dumps({'paatoskartta':'puu','nimi':'Tuotu','tekijat':[{'nimi':'Alku'},{'nimi':'Lue tämä','teksti':'Tekoälyn kirjoittama ohje.','vaatii':['Alku']},{'nimi':'Väärin','vaatii':['Lue tämä']}]}, ensure_ascii=False))
        await pg.click('#ti-check'); await pg.wait_for_timeout(200); print('  tekstituonti:', (await pg.inner_text('#ti-out')).replace('\n',' | ')[:330])
        if shots: await pg.screenshot(path='pt13%s_tuonti.png' % tag)
        await aud('päätöspuut-ikkuna')
        await pg.click('#ti-out .btn:has-text("Lisää päätöspuu")'); await pg.wait_for_timeout(300)
        await pg.click('[data-tab="use"]'); await pg.wait_for_timeout(200); await pg.click('#p-use .row:has-text("Alku")'); await pg.wait_for_timeout(350); u=await use(); print('  tuotu puu käytössä:', ', '.join(u['nakyvat']), '| ohjerivi:', u['ohje'])
        ow = await pg.evaluate("[document.documentElement.scrollWidth, document.getElementById('main').scrollWidth, document.getElementById('main').clientWidth]"); print('   leveys', ow, 'errs', errs)
        await b.close()
asyncio.run(run(390,800,'light',True,'')); asyncio.run(run(320,640,'dark',True,'_n'))
