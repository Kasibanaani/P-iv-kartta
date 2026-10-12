# Versio 8: Kartta-välilehti ja täyttymisehto. Tekijät ruudukkona, muokattavan valinta (ruudukosta ja puhelimesta),
# suhteiden kierto napauttamalla, vertailun vaihto paneelista, laskun osat (arvo ja 1/0), täyttymisehto ja pullonkaula
# tekstikentälle. Tietokoneleveydet 1440 ja 1280 px, vaalea ja tumma; viety appi 390 px. Kuvakaappaukset kartta_*.png.
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
        phone=lambda page=None: (page or pg).evaluate("[...document.querySelectorAll('.ua-list>*')].filter(e=>!e.hidden&&e.closest('#pscreen,#app')).map(e=>e.classList.contains('ua-row')?e.querySelector('.t').textContent+(e.classList.contains('done')?'✓':'')+(e.classList.contains('sel')?'*':''):(e.classList.contains('ua-tbox')?'['+e.innerText.split('\\n')[0]+']':(e.classList.contains('ua-in')?'<'+e.querySelector('label').textContent+'>':e.innerText.replace(/\\n/g,' ')))).join(' | ')")
        store=lambda q: pg.evaluate("(function(){var d=JSON.parse(localStorage.getItem('master:v1')),P=d.projects.filter(function(x){return x.id===d.cur;})[0];function O(n){return P.objs.filter(function(o){return o.n===n;})[0];}return JSON.stringify(%s);})()" % q)
        async def add(kind,name):
            await pg.click('[data-add="%s"]' % kind); await pg.wait_for_timeout(60); await pg.fill('#f-name',name); await pg.press('#f-name','Tab'); await pg.wait_for_timeout(60)
        tile=lambda n: '#kgrid .ktile:has(.kn:text-matches("^%s( ⏸)?$")) .kmain' % n
        rel=lambda n: pg.inner_text('#kgrid .ktile:has(.kn:text-matches("^%s( ⏸)?$")) .kr' % n)
        async def tap(n,k=1):
            for i in range(k): await pg.click(tile(n)); await pg.wait_for_timeout(70)
        await pg.fill('#mempty input','Kartta'); await pg.click('#mempty .mb:text-is("Luo projekti")'); await pg.wait_for_timeout(250)
        await add('text','Kysymys')
        await add('input','Vastaus')
        await add('text','Jatko')
        await add('choice','Mielestäni'); await add('choice','En tiedä')
        await add('text','Kiitos')
        await add('counter','Pisteet')
        await add('calc','Yhteensä')
        # 1 Kartta ilman muokattavaa
        await pg.click('#mtabs [data-v="kartta"]'); await pg.wait_for_timeout(200)
        await pg.click('#kinfo button:text-is("Lopeta muokkaus")') if await pg.locator('#kinfo button:text-is("Lopeta muokkaus")').count() else None
        await pg.wait_for_timeout(100)
        print('1 tekijöitä ruudukossa:', await pg.locator('#kgrid .ktile').count(), '| ohje:', (await pg.inner_text('#kinfo h3')).strip())
        if tag=='': await pg.screenshot(path='kartta_alku.png')
        # 2 muokattavaksi Jatko; Vastaus vaaditaan tähän (Vastaus täyttyy = kirjoitettu)
        await tap('Jatko'); print('2 muokattavana:', (await pg.inner_text('#kinfo h2')).strip())
        await tap('Vastaus'); print('  Vastaus:', await rel('Vastaus'), '|', (await pg.inner_text('#kinfo .klast .ksent')).strip())
        print('  tallennettu:', await store("O('Jatko').req"))
        print('  puhelin:', await phone())
        await pg.click('#pscreen .ua-in input'); await pg.keyboard.type('Emil'); await pg.wait_for_timeout(150); print('  kirjoitettu:', await phone())
        # 3 kierto: riittää, vaadittu ehto, riittävä ehto, ei suhdetta
        seq=[]
        for i in range(4): await tap('Vastaus'); seq.append(await rel('Vastaus') or '–')
        print('3 kierto tekstikentälle:', ' → '.join(seq))
        # 4 valinnat: Mielestäni muokattavana, En tiedä: ei sovi yhteen (6 napautusta), Jatko vaadittu ehto
        await pg.click('#kgrid .ktile:has(.kn:text-is("Mielestäni")) .kpick'); await pg.wait_for_timeout(100)
        seq=[]
        for i in range(6): await tap('En tiedä'); seq.append(await rel('En tiedä') or '–')
        print('4 kierto valinnalle:', ' → '.join(seq))
        print('  ei sovi yhteen tallentuu molempiin:', await store("[O('Mielestäni').ex.length,O('En tiedä').ex.length]"))
        await tap('En tiedä'); print('  seuraava napautus poistaa:', (await rel('En tiedä')) or '–', await store("[O('Mielestäni').ex.length,O('En tiedä').ex.length,O('En tiedä').suf.length]"))
        # 5 laskuri ja vertailu paneelista: Kiitos näkyy, kun Pisteet on vähintään 3
        await pg.click('#kgrid .ktile:has(.kn:text-is("Kiitos")) .kpick'); await pg.wait_for_timeout(100)
        await tap('Pisteet'); print('5 laskuri:', await rel('Pisteet'), '|', (await pg.inner_text('#kinfo .klast .ksent')).strip())
        await pg.select_option('#kinfo .klast .oped select','ge'); await pg.wait_for_timeout(120)
        await pg.fill('#kinfo .klast .oped input.val','3'); await pg.press('#kinfo .klast .oped input.val','Tab'); await pg.wait_for_timeout(150)
        print('  vertailu:', await rel('Pisteet'), '|', (await pg.inner_text('#kinfo .klast .ksent')).strip())
        await tap('Pisteet'); print('  kierto säilyttää vertailun:', await rel('Pisteet'))
        # 6 laskun osat: Yhteensä = summa, Vastaus 1/0, Pisteet arvo, Mielestäni mukana
        await pg.click('#kgrid .ktile:has(.kn:text-is("Yhteensä")) .kpick'); await pg.wait_for_timeout(100)
        print('6 laskettu arvo:', (await pg.inner_text('#kinfo .card h3')).strip(), '| Jatko himmeä:', await pg.locator('#kgrid .ktile.k-dim:has(.kn:text-is("Jatko"))').count()==1)
        await tap('Vastaus'); await tap('Pisteet'); await tap('Mielestäni')
        print('  osat:', await rel('Vastaus'), '/', await rel('Pisteet'), '/', await rel('Mielestäni'), '| kaava:', (await pg.inner_text('#kinfo .card p.hint')).strip())
        print('  arvo:', await store("O('Yhteensä').agg"))
        # 7 täyttymisehto ja pullonkaula: Vastaus täyttyy, kun sisältää "metsä", ja on pullonkaula
        await pg.click('#kgrid .ktile:has(.kn:text-matches("^Vastaus")) .kpick'); await pg.wait_for_timeout(100)
        await pg.select_option('#kinfo .filled select','has'); await pg.wait_for_timeout(120)
        await pg.fill('#kinfo .filled input.val','metsä'); await pg.press('#kinfo .filled input.val','Tab'); await pg.wait_for_timeout(150)
        await pg.check('#kinfo label.check:has-text("Pullonkaula") input'); await pg.wait_for_timeout(150)
        print('7 täyttymisehto:', await store("O('Vastaus').fill"), '| b', await store("O('Vastaus').b"))
        print('  puhelin (Emil):', await phone())
        await pg.click('#pscreen .ua-in input'); await pg.keyboard.type(' metsässä'); await pg.wait_for_timeout(150); print('  puhelin (metsässä):', await phone())
        print('  ruudun tila:', (await pg.inner_text('#kgrid .ktile:has(.kn:text-matches("^Vastaus")) .kv')).strip())
        if tag=='': await pg.screenshot(path='kartta_laskuri.png')
        # 8 puhelimesta muokattavaksi
        await pg.click('#pmode button[data-m="pick"]'); await pg.wait_for_timeout(80)
        await pg.click('#pscreen .ua-row:has(.t:text-is("Mielestäni"))'); await pg.wait_for_timeout(150)
        print('8 puhelimesta valittu:', (await pg.inner_text('#kinfo h2')).strip(), '| näkymä yhä Kartta:', await pg.evaluate("!document.getElementById('v-kartta').hidden"))
        await pg.click('#pmode button[data-m="use"]'); await pg.wait_for_timeout(80)
        print('  muokkaustila näkyy: palkki', (await pg.inner_text('#kgrid .kbar')).replace('\n',' '), '| tausta sävytetty:', await pg.evaluate("document.getElementById('kgrid').classList.contains('editing')"))
        top=await pg.evaluate("()=>{var g=document.getElementById('kgrid');g.style.height='300px';g.scrollTop=g.scrollHeight;var t=Math.round(document.querySelector('#kgrid .khead').getBoundingClientRect().top-g.getBoundingClientRect().top);return [g.scrollTop>0,t];}")
        print('  palkki kiinni yläreunassa vieritettynä:', top)
        await pg.evaluate("document.getElementById('kgrid').style.height=''")
        if tag=='': await pg.screenshot(path='kartta_muokkaus.png')
        await tap('Mielestäni'); print('  muokattavan uusi napautus lopettaa:', await pg.locator('#kgrid .ktile.target').count()==0, '| palkki pois:', await pg.locator('#kgrid .kbar').count()==0, '| suhteita ei muuttunut:', await store("O('Mielestäni').ex.length+O('Mielestäni').req.length"))
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(80)
        await tap('Kiitos'); await pg.keyboard.press('Escape'); await pg.wait_for_timeout(100); print('  Esc ei enää lopeta:', await pg.locator('#kgrid .ktile.target').count()==1)
        await pg.click('#kgrid .kbar .kstop'); await pg.wait_for_timeout(100); print('  palkin Lopeta-painike:', await pg.locator('#kgrid .ktile.target').count()==0)
        # 9 Rakenne: täyttymisehto-kortti ja Kumoa
        await pg.click('#mtabs [data-v="build"]'); await pg.click('.oname:has(.on:text-matches("^Pisteet"))'); await pg.wait_for_timeout(100)
        print('9 Rakenne: täyttymisehto-kortti:', (await pg.inner_text('#fill-card')).replace('\n',' | ')[:160])
        print('  pullonkaula laskurille tarjolla:', await pg.locator('#insp label.check:has-text("Pullonkaula")').count()==1)
        await pg.click('#mtabs [data-v="kartta"]'); await pg.wait_for_timeout(100)
        await pg.click('#mundo'); await pg.wait_for_timeout(150); print('  Kumoa (pullonkaula pois):', await store("O('Vastaus').b"))
        if tag=='': await pg.screenshot(path='kartta_rakenne.png')
        # 10 viety appi
        html=await pg.evaluate("MASTER.appHtml()"); ap=os.path.join(os.getcwd(),'kartta_%s.html' % (tag or 'v')); open(ap,'w',encoding='utf8').write(html)
        m=await (await b.new_context(reduced_motion='reduce',viewport={'width':390,'height':800},color_scheme=scheme)).new_page(); m.on('pageerror',lambda e:errs.append('appi: '+str(e)))
        await m.goto('file://'+ap); await m.wait_for_timeout(300)
        print('10 appi alussa:', await phone(m))
        await m.fill('.ua-in input','Kävin metsässä'); await m.wait_for_timeout(150); print('  kirjoitettu:', await phone(m), '| leveys', await m.evaluate("document.documentElement.scrollWidth"))
        if tag=='_n': await m.screenshot(path='kartta_appi_n.png')
        print('  leveys', await pg.evaluate("[document.documentElement.scrollWidth, window.innerWidth]"), 'errs', errs)
        await b.close()
async def main():
    await run(1440,900,'light','')
    await run(1280,800,'dark','_n')
asyncio.run(main())
