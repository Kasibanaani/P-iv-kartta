# Versio 2: tekstikenttä, laskuri, valikoista koottu arvo (yhdistä ja jos–niin), palautuva painike, pitkä painallus,
# kun–niin-toiminnot, kumoa ja ohjeet. Lopuksi viety appi puhelinleveydellä.
import asyncio, json, os
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
async def run(w,h,scheme,shots,tag):
    async with async_playwright() as p:
        b=await p.chromium.launch(); errs=[]
        ctx=await b.new_context(viewport={'width':w,'height':h},color_scheme=scheme,accept_downloads=True)
        pg=await ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(U); await pg.wait_for_timeout(300)
        print('==== %dx%d %s ====' % (w,h,scheme))
        store=lambda q: pg.evaluate("(function(){var d=JSON.parse(localStorage.getItem('master:v1')),P=d.projects.filter(function(x){return x.id===d.cur;})[0];function O(n){return P.objs.filter(function(o){return o.n===n;})[0];}return JSON.stringify(%s);})()" % q)
        phone=lambda: pg.evaluate("[...document.querySelectorAll('#pscreen .ua-list>*')].filter(e=>!e.hidden).map(e=>e.classList.contains('ua-row')?e.querySelector('.t').textContent+(e.classList.contains('sel')?'*':''):(e.classList.contains('ua-tbox')?'['+e.innerText.replace(/\\n+/g,' / ')+']':(e.classList.contains('ua-in')?'<'+e.querySelector('label').textContent+': '+e.querySelector('input,textarea').value+'>':e.innerText.replace(/\\n/g,' ')))).join(' | ')")
        info=lambda: pg.evaluate("document.querySelector('#pscreen .ua-itext').innerText.replace(/\\s+/g,' ')")
        async def add(kind,name):
            await pg.click('[data-add="%s"]' % kind); await pg.wait_for_timeout(80); await pg.fill('#f-name',name); await pg.press('#f-name','Tab'); await pg.wait_for_timeout(80)
        async def pick(name): await pg.click('.oname:has(.on:text-is("%s"))' % name); await pg.wait_for_timeout(80)
        async def selopt(sel,text):
            v=await pg.evaluate("(a)=>{var s=document.querySelector(a[0]);var o=[...s.options].filter(x=>x.text.split(' · ')[0]===a[1])[0];return o?o.value:null;}",[sel,text]); await pg.select_option(sel,v); await pg.wait_for_timeout(80)
        async def addrule(tag_,ref,op=None,v=None):
            sec='#insp [data-rules="%s"]' % tag_
            await selopt(sec+'>select:last-of-type',ref)
            rows=sec+' .rule'
            if op: await pg.select_option('%s >> nth=-1 >> select >> nth=1' % rows, op); await pg.wait_for_timeout(60)
            if v is not None: await pg.fill('%s >> nth=-1 >> input.val >> nth=0' % rows, str(v)); await pg.press('%s >> nth=-1 >> input.val >> nth=0' % rows,'Tab'); await pg.wait_for_timeout(60)
        async def addact(f,kind,target=None,v=None,t=None):
            sec='#insp [data-acts="%s"]' % f
            await pg.select_option(sec+'>select', kind); await pg.wait_for_timeout(80)
            rows=sec+' .rule'
            if target: await selopt('#insp [data-acts="%s"] .rule:last-of-type select:nth-of-type(2)' % f, target)
            if v is not None: await pg.fill('%s >> nth=-1 >> input.val' % rows, str(v)); await pg.press('%s >> nth=-1 >> input.val' % rows,'Tab'); await pg.wait_for_timeout(60)
            if t is not None: await pg.fill('%s >> nth=-1 >> input' % rows, t); await pg.press('%s >> nth=-1 >> input' % rows,'Tab'); await pg.wait_for_timeout(60)
        async def slide(name,v):
            await pg.evaluate("(a)=>{var x=[...document.querySelectorAll('#pscreen .ua-sl')].filter(e=>e.querySelector('.ua-slh span').textContent===a[0])[0].querySelector('input');x.value=a[1];x.dispatchEvent(new Event('input',{bubbles:true}));}",[name,v]); await pg.wait_for_timeout(60)
        async def hold(page,selector,ms):
            bx=await page.locator(selector).bounding_box(); await page.mouse.move(bx['x']+bx['width']/2,bx['y']+bx['height']/2); await page.mouse.down(); await page.wait_for_timeout(ms)
        # 1 esimerkkiprojekti: palautuva painike ja pitkä painallus
        await pg.click('text=Luo esimerkkiprojekti'); await pg.wait_for_timeout(300)
        print('1 ohje ilman valintaa:', (await pg.inner_text('#insp .help summary')), '| avoinna:', await pg.evaluate("document.querySelector('#insp .help').open"))
        await pg.click('#pscreen .ua-tabs button:text-is("Hengitys")'); await pg.wait_for_timeout(150); print('  hengitys-ruutu:', await phone())
        await hold(pg,'#pscreen .ua-row:has-text("Pidä pohjassa")',150); print('  pohjassa:', await phone())
        if shots: await pg.screenshot(path='t%s_hold.png' % tag)
        await pg.mouse.up(); await pg.wait_for_timeout(120); print('  irrotettu:', await phone())
        await hold(pg,'#pscreen .ua-row:has-text("Pidä pohjassa")',800); print('  pitkä painallus:', await info()); await pg.mouse.up(); await pg.wait_for_timeout(120)
        print('  laskuri:', await phone())
        await pg.click('#pscreen .ua-row:has-text("Nollaa")'); await pg.wait_for_timeout(120); print('  nollaus (napautus):', await phone())
        # 2 ehto alkaa täyttyä -> laskuri ja viesti, tekstikenttä, tyhjennys
        await pg.click('#pscreen .ua-tabs button:text-is("Tsekki")'); await pg.wait_for_timeout(150)
        await slide('Energia',9); await slide('Mieliala',8); print('2 hyvä vire:', await info(), '|', await phone())
        await pg.click('#pscreen .ua-in textarea'); await pg.keyboard.type('Kävely metsässä'); await pg.wait_for_timeout(150)
        print('  kirjoitettu:', await phone())
        if shots: await pg.screenshot(path='t%s_input.png' % tag)
        await pg.click('#pscreen .ua-row:has-text("Uusi vastaus")'); await pg.wait_for_timeout(150); print('  uusi vastaus:', await phone())
        await slide('Energia',2); await slide('Energia',9); print('  uudelleen hyvä vire:', await info())
        await pg.click('#pscreen .ua-dnav button[data-act="next"]'); await pg.wait_for_timeout(200); print('  seuraava päivä (laskuri muistaa):', await phone())
        await pg.click('#pscreen .ua-dnav button[data-act="pick"]'); await pg.wait_for_timeout(200)
        # 3 tyhjästä valikoilla
        await pg.click('#pnew'); await pg.fill('#mdlg input','Valikot'); await pg.click('#mdlg .mb:text-is("Luo")'); await pg.wait_for_timeout(200)
        await add('slider','Energia'); await add('slider','Uni'); await pg.fill('#f-start','8'); await pg.press('#f-start','Tab')
        await add('calc','Vire'); print('3 uusi laskettu arvo:', await pg.evaluate("[...document.querySelectorAll('#f-mode button')].map(b=>b.textContent+(b.getAttribute('aria-pressed')==='true'?'*':'')).join(', ')"), '| ohje:', await pg.inner_text('#insp .help summary'))
        await pg.select_option('#insp select.inp >> nth=1','avg'); await pg.wait_for_timeout(60)
        await selopt('#f-aggadd','Energia'); await selopt('#f-aggadd','Uni')
        print('  keskiarvo:', await pg.inner_text('#f-res'), '|', await pg.inner_text('#insp .asf'))
        await pg.click('#f-mode [data-v="if"]'); await pg.wait_for_timeout(80); await pg.click('#insp .mb:text-is("+ Jos-rivi")'); await pg.wait_for_timeout(80)
        await addrule('case0','Uni','lt',5)
        await pg.select_option('#insp .case >> nth=0 >> .outrow select >> nth=0','txt'); await pg.wait_for_timeout(60); await pg.fill('#insp .case >> nth=0 >> .outrow input','väsynyt'); await pg.press('#insp .case >> nth=0 >> .outrow input','Tab')
        await pg.click('#insp .mb:text-is("+ Muuten jos -rivi")'); await pg.wait_for_timeout(80); await addrule('case1','Energia','ge',7)
        await pg.select_option('#insp .case >> nth=1 >> .outrow select >> nth=0','txt'); await pg.wait_for_timeout(60); await pg.fill('#insp .case >> nth=1 >> .outrow input','virkeä'); await pg.press('#insp .case >> nth=1 >> .outrow input','Tab')
        await pg.select_option('#insp .case >> nth=2 >> .outrow select >> nth=0','txt'); await pg.wait_for_timeout(60); await pg.fill('#insp .case >> nth=2 >> .outrow input','tavallinen'); await pg.press('#insp .case >> nth=2 >> .outrow input','Tab')
        print('  jos–niin:', await pg.inner_text('#f-res'), '|', await pg.inner_text('#insp .asf'))
        await slide('Uni',3); print('  uni 3:', await pg.inner_text('#f-res'))
        await slide('Uni',9); await slide('Energia',8); print('  uni 9 energia 8:', await pg.inner_text('#f-res'))
        if shots: await pg.screenshot(path='t%s_if.png' % tag)
        await pg.click('text=Muuta kirjoitettavaksi kaavaksi'); await pg.wait_for_timeout(100); print('  kaavaksi:', await pg.input_value('#f-f'), '|', await pg.inner_text('#f-res'))
        # 4 tekstikenttä ja ehto
        await add('input','Mitä teit?'); await pg.fill('#f-ph','Kirjoita lyhyesti'); await pg.press('#f-ph','Tab')
        await add('text','Palaute'); await pg.fill('#f-body','Teit: {Mitä teit?}'); await pg.wait_for_timeout(60); await addrule('req','Mitä teit?','filled')
        await add('cond','Mainitsee unen'); await addrule('req','Mitä teit?','has','nukuin')
        print('4 kenttä tyhjänä:', await phone())
        await pg.fill('#pscreen .ua-in input','Nukuin päiväunet'); await pg.wait_for_timeout(150); print('  kirjoitettu:', await phone(), '|', await store("[O('Mainitsee unen').req]"))
        # 5 laskuri, palautuva painike ja toiminnot
        await add('counter','Pisteet'); await pg.fill('#f-max','5'); await pg.press('#f-max','Tab')
        await add('choice','+1'); await pg.click('#insp .seg button:text-is("Palautuu irrottaessa")'); await pg.wait_for_timeout(80)
        await addact('act','add','Pisteet',1); await addact('lact','set','Pisteet',0); await addact('lact','msg',None,None,'Nollattu, pisteet {Pisteet}.')
        await add('cond','Viisi'); await addrule('req','Pisteet','ge',5); await addact('act','msg',None,None,'Täysi kymppi! Pisteet {Pisteet}.')
        for i in range(6): await pg.click('#pscreen .ua-row:has-text("+1")'); await pg.wait_for_timeout(60)
        print('5 kuusi painallusta (raja 5):', await phone(), '|', await info())
        await hold(pg,'#pscreen .ua-row:has-text("+1")',800); await pg.mouse.up(); await pg.wait_for_timeout(150); print('  pitkä painallus:', await info(), '|', await phone())
        await pick('+1'); print('  painikkeen tila:', await pg.inner_text('#insp-status'), '| toimintoja:', await pg.locator('#insp [data-acts] .rule').count())
        if shots: await pg.screenshot(path='t%s_acts.png' % tag); await pg.evaluate("document.getElementById('insp').scrollTop=900"); await pg.screenshot(path='t%s_acts2.png' % tag)
        # 6 kumoa
        n0=await pg.locator('.oname').count(); await pg.click('#insp .mb.danger:text-is("Poista")'); await pg.click('#mdlg .mb:text-is("Poista")'); await pg.wait_for_timeout(100)
        n1=await pg.locator('.oname').count(); await pg.click('#mundo'); await pg.wait_for_timeout(150); n2=await pg.locator('.oname').count()
        print('6 kumoa: ennen', n0, 'poiston jälkeen', n1, 'kumoamisen jälkeen', n2, '| valittuna:', await pg.inner_text('#insp h2'))
        await pg.fill('#f-name','Plus yksi'); await pg.press('#f-name','Tab'); await pg.wait_for_timeout(80); await pg.click('#mundo'); await pg.wait_for_timeout(100); print('  nimen vaihto kumottu:', await pg.input_value('#f-name'))
        # 7 ohjeet joka lajille
        hs=[]
        for nm in ['Energia','Vire','Mitä teit?','Palaute','Pisteet','Viisi','+1']:
            await pick(nm); hs.append(await pg.inner_text('#insp > .help summary'))
        print('7 ohjeet:', ' | '.join(hs))
        await pg.click('#insp > .help summary'); await pick('Energia'); print('  suljettu ohje pysyy suljettuna:', not await pg.evaluate("document.querySelector('#insp > .help').open"))
        await pg.click('#insp > .help summary')
        # 8 taulukko ja viety appi
        await pg.click('[data-v="table"]'); await pg.wait_for_timeout(100)
        print('8 taulukko:', await pg.evaluate("[...document.querySelectorAll('#v-table tbody tr')].map(r=>r.children[0].textContent+'='+r.children[4].textContent+' ['+r.children[5].textContent.slice(0,40)+']').join(' | ')"))
        if shots: await pg.screenshot(path='t%s_table.png' % tag)
        await pg.click('[data-v="proj"]'); await pg.select_option('#v-proj select >> nth=0','1'); await pg.wait_for_timeout(100)
        async with pg.expect_download() as dl: await pg.click('text=Vie käyttäjä-appina (HTML)')
        f=await dl.value; path=os.path.join(os.getcwd(),'appi2_%s.html' % tag); await f.save_as(path)
        ap=await ctx.new_page(); ap.on('pageerror',lambda e:errs.append('appi: '+str(e))); await ap.set_viewport_size({'width':390,'height':844}); await ap.goto('file://'+path); await ap.wait_for_timeout(300)
        aph=lambda: ap.evaluate("[...document.querySelectorAll('.ua-list>*')].filter(e=>!e.hidden).map(e=>e.classList.contains('ua-in')?'<'+e.querySelector('input,textarea').value+'>':e.innerText.replace(/\\n/g,' ')).join(' | ')")
        print('  appi:', await aph())
        for i in range(3): await ap.click('.ua-row:has-text("+1")'); await ap.wait_for_timeout(50)
        await ap.fill('.ua-in input','Nukuin hyvin'); await ap.wait_for_timeout(100); print('  appissa painettu ja kirjoitettu:', await aph())
        await ap.reload(); await ap.wait_for_timeout(300); print('  säilyy:', await aph())
        if shots: await ap.screenshot(path='t%s_appi.png' % tag)
        await ap.close()
        print('  leveys', await pg.evaluate("[document.documentElement.scrollWidth, window.innerWidth]"), 'errs', errs)
        await b.close()
asyncio.run(run(1440,900,'light',True,'')); asyncio.run(run(1280,800,'dark',True,'_n'))
