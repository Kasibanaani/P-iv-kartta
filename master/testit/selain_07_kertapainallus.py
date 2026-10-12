# Versio 7: palautuva painike, jonka yksi painallus riittää, masterissa ja viedyssä apissa (390 ja 320 px).
# Lisäksi: valikon valinnan jälkeen uudet kentät ilmestyvät heti (natiivi valikko nielee hiiren irrotuksen),
# ja Lisää ruudulle -palkki pysyy näkyvissä, kun objektilistaa vieritetään. Kuvakaappaukset kertapainallus_*.png.
import asyncio, os
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
async def run(w,h,scheme,tag):
    async with async_playwright() as p:
        b=await p.chromium.launch(); errs=[]
        ctx=await b.new_context(reduced_motion='reduce',viewport={'width':w,'height':h},color_scheme=scheme)
        pg=await ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(U); await pg.wait_for_timeout(300)
        print('==== %dx%d %s ====' % (w,h,scheme))
        phone=lambda q='#pscreen ',page=None: (page or pg).evaluate("(q)=>[...document.querySelectorAll(q+'.ua-list>*')].filter(e=>!e.hidden).map(e=>e.classList.contains('ua-row')?e.querySelector('.t').textContent+(e.classList.contains('done')?'✓':''):(e.classList.contains('ua-tbox')?'['+e.innerText.replace(/\\n+/g,' / ')+']':(e.classList.contains('ua-in')?'<'+e.querySelector('label').textContent+'>':e.innerText.replace(/\\n/g,' ')))).join(' | ')",q)
        async def add(kind,name):
            await pg.click('[data-add="%s"]' % kind); await pg.wait_for_timeout(80); await pg.fill('#f-name',name); await pg.press('#f-name','Tab'); await pg.wait_for_timeout(80)
        async def pick(name): await pg.click('.oname:has(.on:text-matches("^%s( ⏸)?$"))' % name); await pg.wait_for_timeout(80)
        async def natsel(sel,label):
            # kuten käyttäjä: hiiri alas valikon päällä, natiivi lista nielee irrotuksen, valinta tehdään listasta
            v=await pg.evaluate("(a)=>{var s=document.querySelector(a[0]);var o=[...s.options].filter(x=>x.text.split(' · ')[0]===a[1])[0];return o?o.value:null;}",[sel,label])
            await pg.dispatch_event(sel,'pointerdown',{'bubbles':True}); await pg.focus(sel); await pg.select_option(sel,v)
        async def hold(page,selector,ms):
            bx=await page.locator(selector).bounding_box(); await page.mouse.move(bx['x']+bx['width']/2,bx['y']+bx['height']/2); await page.mouse.down(); await page.wait_for_timeout(ms); await page.mouse.up(); await page.wait_for_timeout(120)
        await pg.fill('#mempty input','Kertapainallus'); await pg.click('#mempty .mb:text-is("Luo projekti")'); await pg.wait_for_timeout(250)
        # 1 rakenne: kysymys, kenttä, Vastaa-painike (palautuva, yksi painallus riittää, pullonkaula), jatko
        await add('text','Kysymys'); await pg.fill('#f-body','Kuka olet?'); await pg.press('#f-body','Tab')
        await add('input','Vastaus')
        await add('choice','Vastaa')
        await pg.click('#insp .seg button[data-v="hold"]'); await pg.wait_for_timeout(100)
        print('1 asetus näkyy palautuvalla:', await pg.locator('#f-once').count()==1)
        # säännöksi "Vastaus on kirjoitettu" valikoilla: uusi rivi ilmestyy heti ilman toista klikkausta
        t0=await pg.evaluate('performance.now()')
        await natsel('#insp [data-rules="req"]>select:last-of-type','Vastaus'); await pg.wait_for_timeout(40)
        n=await pg.evaluate("document.querySelectorAll('#insp [data-rules=\"req\"] .rule').length")
        print('  valikon jälkeen sääntörivi näkyy heti (40 ms):', n==1)
        await pg.select_option('#insp [data-rules="req"] .rule >> nth=0 >> select >> nth=1','filled'); await pg.wait_for_timeout(80)
        await pg.check('#f-once input'); await pg.wait_for_timeout(100)
        print('  pullonkaulateksti:', (await pg.inner_text('#insp label.check:has-text("Pullonkaula:")')).strip())
        await pg.check('#insp label.check:has-text("Pullonkaula:") input'); await pg.wait_for_timeout(100)
        await add('text','Jatko'); await pg.fill('#f-body','Katso kirjoittamaasi: {Vastaus}'); await pg.press('#f-body','Tab')
        await add('choice','Mielestäni'); await pg.click('#insp .seg button[data-v="hold"]'); await pg.wait_for_timeout(80); await pg.check('#f-once input'); await pg.wait_for_timeout(80)
        print('2 puhelin alussa:', await phone())
        await pg.click('#pscreen .ua-in textarea, #pscreen .ua-in input'); await pg.keyboard.type('Emil'); await pg.wait_for_timeout(150)
        print('  kirjoitettu:', await phone())
        await hold(pg,'#pscreen .ua-row:has(.t:text-is("Vastaa"))',150)
        print('  painettu ja irrotettu:', await phone())
        await pick('Vastaa'); print('  tila masterissa:', (await pg.inner_text('#insp-status')).strip(), '| lista:', (await pg.inner_text('.oname.sel .ov')).strip())
        if tag=='': await pg.screenshot(path='kertapainallus_master.png')
        await pg.click('#pscreen [data-act="reset"]'); await pg.wait_for_timeout(150); print('  alusta:', await phone())
        # 3 Lisää ruudulle -palkki pysyy näkyvissä vieritettäessä
        await pick('Mielestäni')
        for i in range(14): await add('choice','Täyte %d' % (i+1))
        top=await pg.evaluate("()=>{var l=document.querySelector('.olist');l.scrollTop=l.scrollHeight;return [l.scrollTop>0, Math.round(document.querySelector('.addbar').getBoundingClientRect().top-l.getBoundingClientRect().top)];}")
        await pg.wait_for_timeout(100); vis=await pg.evaluate("(()=>{var a=document.querySelector('.addbar').getBoundingClientRect(),b=document.querySelector('[data-add=\"choice\"]').getBoundingClientRect(),l=document.querySelector('.olist').getBoundingClientRect();return b.top>=l.top&&b.bottom<=l.bottom;})()")
        print('3 lista vieritetty:', top[0], '| palkin yläreuna listan yläreunasta', top[1], 'px | +Valinta näkyvissä:', vis)
        await pg.click('[data-add="text"]'); await pg.wait_for_timeout(100); print('  vieritettynä lisäys toimii:', (await pg.inner_text('#insp h2')).strip())
        if tag=='': await pg.screenshot(path='kertapainallus_palkki.png')
        # 4 viety appi puhelinleveyksillä
        html=await pg.evaluate("MASTER.appHtml()"); ap=os.path.join(os.getcwd(),'kertapainallus_%s.html' % (tag or 'v')); open(ap,'w',encoding='utf8').write(html)
        for pw in (390,320):
            m=await (await b.new_context(reduced_motion='reduce',viewport={'width':pw,'height':760},color_scheme=scheme)).new_page(); m.on('pageerror',lambda e:errs.append('appi: '+str(e)))
            await m.goto('file://'+ap); await m.wait_for_timeout(300)
            await m.fill('.ua-in textarea, .ua-in input','Emil'); await m.wait_for_timeout(100)
            await hold(m,'.ua-row:has(.t:text-is("Vastaa"))',120)
            await hold(m,'.ua-row:has(.t:text-is("Mielestäni"))',120)
            print('4 appi %d px:' % pw, ' | '.join(x for x in (await phone('',m)).split(' | ') if not x.startswith('Täyte')), '| leveys', await m.evaluate("document.documentElement.scrollWidth"))
            if tag=='' or pw==320: await m.screenshot(path='kertapainallus_appi_%d%s.png' % (pw,tag))
            await m.reload(); await m.wait_for_timeout(300); print('  säilyy uudelleenavauksessa:', 'Vastaa✓' in await phone('',m))
        print('  leveys', await pg.evaluate("[document.documentElement.scrollWidth, window.innerWidth]"), 'errs', errs)
        await b.close()
async def main():
    await run(1440,900,'light','')
    await run(1280,800,'dark','_n')
asyncio.run(main())
