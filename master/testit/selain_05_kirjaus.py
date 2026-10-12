# Versio 4: kirjaus ja painalluksen kesto. Rakennetaan masterissa painike, joka kirjaa irrottaessa painalluksen keston,
# pidetään sitä eri pituisia aikoja, tarkistetaan puhelin, Seuranta, uudelleenlataus, Alusta ja viety appi (390 px).
# Liike pois (reduced_motion): luvut näkyvät heti lopullisina, jotta tulosteet ovat vertailukelpoisia.
import asyncio, os
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
async def run(w,h,scheme,shots,tag):
    async with async_playwright() as p:
        b=await p.chromium.launch(); errs=[]
        ctx=await b.new_context(reduced_motion='reduce',viewport={'width':w,'height':h},color_scheme=scheme,accept_downloads=True)
        pg=await ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(U); await pg.wait_for_timeout(300)
        print('==== %dx%d %s ====' % (w,h,scheme))
        await pg.fill('.welcome input',"Kirjauskoe") if await pg.locator('.welcome input').count() else None
        await pg.click('.welcome .mb.solid') if await pg.locator('.welcome .mb.solid').count() else None
        await pg.wait_for_timeout(200)
        async def add(kind,name):
            await pg.click('[data-add="%s"]' % kind); await pg.wait_for_timeout(80); await pg.fill('#f-name',name); await pg.press('#f-name','Tab'); await pg.wait_for_timeout(80)
        async def selopt(sel,text):
            v=await pg.evaluate("(a)=>{var s=document.querySelector(a[0]);var o=[...s.options].filter(x=>x.text.split(' · ')[0]===a[1])[0];return o?o.value:null;}",[sel,text]); await pg.select_option(sel,v); await pg.wait_for_timeout(80)
        async def hold(sel,ms):
            bx=await pg.locator(sel).bounding_box(); await pg.mouse.move(bx['x']+bx['width']/2,bx['y']+bx['height']/2); await pg.mouse.down(); await pg.wait_for_timeout(ms); await pg.mouse.up(); await pg.wait_for_timeout(150)
        await add('log','Uloshengitykset')
        print('1 kirjaus:', await pg.inner_text('#insp .kind'), '| ohje:', await pg.inner_text('#insp > .help summary'), '| puhelimessa:', await pg.inner_text('#pscreen .ua-log'))
        await add('counter','Sekunnit yhteensä')
        await add('choice','Hengitä ulos')
        await pg.click('#insp .seg button:text-is("Palautuu irrottaessa")'); await pg.wait_for_timeout(120)
        print('2 kun irrotetaan -kohta:', await pg.locator('#insp [data-acts="ract"]').count()==1)
        await selopt('#insp [data-acts="ract"]>select','Kirjaa')
        print('  kirjaa: kohde ja arvo:', await pg.evaluate("[...document.querySelectorAll('#insp [data-acts=\"ract\"] .rule select')].map(s=>s.selectedOptions[0].text).join(' | ')"))
        await selopt('#insp [data-acts="ract"]>select','Lisää laskuriin')
        r2='#insp [data-acts="ract"] .rule >> nth=1'
        await pg.select_option(r2+' >> select >> nth=2','dur'); await pg.wait_for_timeout(100)
        print('  lisää laskuriin:', await pg.evaluate("[...document.querySelectorAll('#insp [data-acts=\"ract\"] .rule')][1].innerText.replace(/\\s+/g,' ')"), '| arvokenttä piilossa:', await pg.locator(r2+' >> input.val').count()==0)
        btn='#pscreen .ua-row:has(.t:text-is("Hengitä ulos"))'
        for ms in (700,1500,1100): await hold(btn,ms)
        lg=await pg.inner_text('#pscreen .ua-log'); print('3 puhelin 3 painalluksen jälkeen:', lg.replace('\n',' | '), '| pylväitä:', await pg.locator('#pscreen .ua-chart i').count())
        print('  laskuri:', await pg.inner_text('#pscreen .ua-num'), '| lista:', await pg.inner_text('.oname:has(.on:text-is("Uloshengitykset")) .ov'))
        vals=await pg.evaluate("(function(){var P=MASTER.data.projects.filter(x=>x.id===MASTER.data.cur)[0];var o=P.objs.filter(x=>x.t==='log')[0];return P.state.vals[o.id].map(e=>e.v);})()")
        print('  kestot:', vals, '| järkevät:', len(vals)==3 and 0.6<=vals[0]<=1.2 and 1.4<=vals[1]<=2.1 and vals[1]>vals[2]>vals[0])
        await pg.click('#mtabs [data-v="stats"]'); await pg.wait_for_timeout(150)
        print('4 seuranta:', (await pg.inner_text('#v-stats .scard')).replace('\n',' | ')[:200])
        if shots: await pg.screenshot(path='k%s_stats.png' % tag)
        await pg.click('#mtabs [data-v="build"]')
        await pg.reload(); await pg.wait_for_timeout(400)
        print('5 uudelleenlatauksen jälkeen:', (await pg.inner_text('#pscreen .ua-log')).split('\n')[-1], '| laskuri:', await pg.inner_text('#pscreen .ua-num b'))
        await pg.click('#pscreen [data-act="reset"]'); await pg.wait_for_timeout(150)
        print('  alusta säilyttää kirjauksen:', (await pg.inner_text('#pscreen .ua-log')).split('\n')[-1])
        await pg.click('.oname:has(.on:text-is("Hengitä ulos"))'); await pg.wait_for_timeout(100)
        if shots: await pg.screenshot(path='k%s_insp.png' % tag)
        # rakenteen muokkaus ei nollaa kokeiluarvoja
        await add('text','Ohje'); print('6 muokkaus ei nollaa:', (await pg.inner_text('#pscreen .ua-log')).split('\n')[-1])
        # viety appi
        html=await pg.evaluate("MASTER.appHtml()"); ap=os.path.join(os.getcwd(),'kirjaus_%s.html' % tag); open(ap,'w',encoding='utf8').write(html)
        m=await (await b.new_context(reduced_motion='reduce',viewport={'width':390,'height':844},color_scheme=scheme,has_touch=False)).new_page(); m.on('pageerror',lambda e:errs.append('appi: '+str(e)))
        await m.goto('file://'+ap); await m.wait_for_timeout(300)
        print('7 viety appi alussa:', (await m.inner_text('.ua-log')).replace('\n',' | '))
        bx=await m.locator('.ua-row:has(.t:text-is("Hengitä ulos"))').bounding_box(); await m.mouse.move(bx['x']+20,bx['y']+20); await m.mouse.down(); await m.wait_for_timeout(900); await m.mouse.up(); await m.wait_for_timeout(150)
        print('  painalluksen jälkeen:', (await m.inner_text('.ua-log')).replace('\n',' | '))
        await m.reload(); await m.wait_for_timeout(300); print('  säilyy apissa:', (await m.inner_text('.ua-log')).split('\n')[-1], '| leveys', await m.evaluate("document.documentElement.scrollWidth"))
        if shots: await m.screenshot(path='k%s_appi.png' % tag)
        print('  leveys', await pg.evaluate("[document.documentElement.scrollWidth, window.innerWidth]"), 'errs', errs)
        await b.close()
async def main():
    await run(1440,900,'light',True,'')
    await run(1280,800,'dark',True,'_n')
asyncio.run(main())
