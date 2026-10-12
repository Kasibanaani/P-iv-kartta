# Tyyli-välilehti: valmiit tyylit, yksittäisen ominaisuuden vaihto, sekoitus, kumoaminen, esikatselun vaalea/tumma,
# vanhan projektin korostusväri sekä viety appi puhelinleveyksillä vaaleassa ja tummassa tilassa.
# Vaihe 2: tausta, liike, oma väri, palikan sävy ja korostus, liukuva luku.
# Kuvakaappaukset: tyyli_*.png kansiossa tulosteet/.
import asyncio, os, json
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); errs=[]
        for W in (1440,1280):
            pg=await b.new_page(viewport={'width':W,'height':900},color_scheme='light'); pg.on('pageerror',lambda e:errs.append(str(e)))
            await pg.goto(U); await pg.wait_for_timeout(300)
            await pg.click('text=Luo esimerkkiprojekti'); await pg.wait_for_timeout(300)
            await pg.click('#mtabs [data-v="style"]'); await pg.wait_for_timeout(200)
            bg=lambda: pg.evaluate("getComputedStyle(document.querySelector('#pscreen .ua-app')).backgroundColor")
            now=lambda: pg.inner_text('.tnow b')
            print(W,'1 alussa:', await now(), '| tausta', await bg(), '| kortteja', await pg.locator('.tcard').count(), '| luettavuus:', (await pg.inner_text('.tchk >> nth=0'))[:60])
            if W==1440: await pg.screenshot(path='tyyli_master_1440.png')
            ov=await pg.evaluate("(()=>{const v=document.getElementById('v-style');return v.scrollWidth-v.clientWidth;})()")
            print(W,'  vaakavieritys Tyyli-näkymässä (0 = ei):', ov)
            if W==1280: await pg.close(); continue
            # jokainen valmis tyyli vaaleana ja tummana
            ids=await pg.evaluate("[...document.querySelectorAll('.tcard')].map(c=>c.dataset.preset)")
            for pid in ids:
                await pg.click('.tcard[data-preset="%s"]' % pid); await pg.wait_for_timeout(120)
                pressed=await pg.evaluate("document.querySelector('.tcard[aria-pressed=true]').dataset.preset")
                fam=await pg.evaluate("getComputedStyle(document.querySelector('#pscreen .ua-row')).fontFamily.split(',')[0]")
                rad=await pg.evaluate("getComputedStyle(document.querySelector('#pscreen .ua-row')).borderTopLeftRadius")
                print('2', pid.ljust(12), '| nimi', await now(), '| valittu', pressed==pid, '| tausta', await bg(), '| rivin kulma', rad, '| fontti', fam)
                await pg.locator('.phone').screenshot(path='tyyli_%s_vaalea.png' % pid)
            await pg.click('#v-style .seg button:text-is("Tumma")'); await pg.wait_for_timeout(150)
            print('3 esikatselu tumma: dark-luokka', await pg.evaluate("document.querySelector('#pscreen .ua-app').classList.contains('dark')"), '| tausta', await bg(), '| luettavuus:', (await pg.inner_text('.tchk >> nth=1'))[:60])
            for pid in ids:
                await pg.click('.tcard[data-preset="%s"]' % pid); await pg.wait_for_timeout(100)
                await pg.locator('.phone').screenshot(path='tyyli_%s_tumma.png' % pid)
            await pg.screenshot(path='tyyli_master_tumma.png')
            await pg.click('#v-style .seg button:text-is("Puhelimen mukaan")'); await pg.wait_for_timeout(100)
            print('  takaisin puhelimen mukaan: dark', await pg.evaluate("document.querySelector('#pscreen .ua-app').classList.contains('dark')"))
            # yksittäinen akseli, palautus, sekoitus, kumoa
            await pg.click('.tcard[data-preset="aamurusko"]'); await pg.wait_for_timeout(100)
            await pg.click('[data-ax="fontti"] button:text-is("Mono")'); await pg.wait_for_timeout(120)
            print('4 fontti vaihdettu:', await now(), '| fontti', await pg.evaluate("getComputedStyle(document.querySelector('#pscreen .ua-row')).fontFamily.split(',')[0]"), '| tausta ennallaan', await bg())
            await pg.click('.tpal[data-pal="meri"]'); await pg.wait_for_timeout(120)
            print('  paletti meri:', await now(), '| tausta', await bg())
            await pg.click('#v-style .mb:text-is("Palauta Aamurusko")'); await pg.wait_for_timeout(120)
            print('  palautettu:', await now(), '| tausta', await bg())
            await pg.click('#v-style .mb:text-is("Sekoita")'); await pg.wait_for_timeout(120)
            print('  sekoitettu:', await now())
            await pg.click('#mundo'); await pg.wait_for_timeout(150)
            await pg.click('#mtabs [data-v="style"]'); await pg.wait_for_timeout(100)
            print('5 kumoa palauttaa:', await now())
            # tyyli tallentuu ja säilyy uudelleenlatauksessa; Projekti-välilehti näyttää sen
            await pg.reload(); await pg.wait_for_timeout(400)
            await pg.click('#mtabs [data-v="proj"]'); await pg.wait_for_timeout(100)
            print('6 uudelleenlatauksen jälkeen Projekti-välilehdellä:', await pg.inner_text('#v-proj .fld:has(label:text-is("Tyyli")) span'))
            # vaihe 2: tausta, liike, oma väri, palikan sävy ja korostus
            await pg.click('#mtabs [data-v="style"]'); await pg.wait_for_timeout(100)
            app="document.querySelector('#pscreen .ua-app')"
            await pg.click('[data-ax="tausta"] button:text-is("Aallot")'); await pg.wait_for_timeout(120)
            print('9 tausta aallot:', (await pg.evaluate("getComputedStyle(%s).backgroundImage" % app))[:40], '| nimi', await now())
            await pg.click('[data-ax="tausta"] button:text-is("Läikät")'); await pg.wait_for_timeout(120)
            print('  läikät:', (await pg.evaluate("getComputedStyle(%s).backgroundImage" % app))[:40])
            await pg.click('[data-ax="liike"] button:text-is("Eloisa")'); await pg.wait_for_timeout(120)
            print('  liike:', await pg.evaluate("%s.dataset.liike" % app))
            await pg.evaluate("(()=>{const i=document.getElementById('t-oma');i.value='#d35400';i.dispatchEvent(new Event('change',{bubbles:true}));})()"); await pg.wait_for_timeout(150)
            print('  oma väri:', await now(), '| tallennettu', await pg.evaluate("JSON.stringify([MASTER.data.projects[0].cfg.style.paletti,MASTER.data.projects[0].cfg.style.oma])"), '| luettavuus:', (await pg.inner_text('.tchk >> nth=0'))[:70])
            await pg.locator('.phone').screenshot(path='tyyli_oma_vari.png')
            await pg.click('#mtabs [data-v="build"]'); await pg.wait_for_timeout(100)
            await pg.click('.oname:has(.on:text-is("Hyvät asiat"))'); await pg.wait_for_timeout(100)
            await pg.click('#look-card .huesel [data-hue="3"]'); await pg.wait_for_timeout(120)
            await pg.click('#f-look button:text-is("Korostettu")'); await pg.wait_for_timeout(120)
            await pg.click('.oname:has(.on:text-is("Kävely ulkona"))'); await pg.wait_for_timeout(100)
            await pg.click('#look-card .huesel [data-hue="0"]'); await pg.wait_for_timeout(120)
            await pg.click('.oname:has(.on:text-is("Liikuin tänään"))'); await pg.wait_for_timeout(100)
            await pg.click('#f-look button:text-is("Hiljainen")'); await pg.wait_for_timeout(120)
            js=("(()=>{const P=MASTER.data.projects[0],by=n=>P.objs.find(o=>o.n===n);const h=by('Hyvät asiat'),k=by('Kävely ulkona'),l=by('Liikuin tänään');"
                "const e=id=>document.querySelector('#pscreen [data-oid=\"'+id+'\"]');"
                "return {hyvat:[h.hue,h.look,e(h.id).className,e(h.id).style.getPropertyValue('--solid')],kavely:[k.hue,e(k.id)?e(k.id).style.getPropertyValue('--fill'):'piilossa'],liikuin:[l.look,e(l.id).className]};})()")
            print('10 palikan ulkoasu:', json.dumps(await pg.evaluate(js)))
            await pg.click('#pmode button:text-is("Käytä")')
            await pg.locator('#pscreen .ua-row:has-text("Söin kunnolla")').click(); await pg.wait_for_timeout(60)
            mid=await pg.evaluate("document.querySelector('#pscreen .ua-hero b').textContent"); await pg.wait_for_timeout(1000)
            print('  luku liukuu: kesken', mid, '| lopuksi', await pg.evaluate("document.querySelector('#pscreen .ua-hero b').textContent"))
            await pg.locator('.phone').screenshot(path='tyyli_palikat.png')
            await pg.click('#mtabs [data-v="style"]'); await pg.click('.tcard[data-preset="laguuni"]'); await pg.wait_for_timeout(150)
            await pg.locator('.phone').screenshot(path='tyyli_palikat_laguuni.png')
            await pg.click('#v-style .seg button:text-is("Tumma")'); await pg.wait_for_timeout(150)
            await pg.locator('.phone').screenshot(path='tyyli_palikat_laguuni_tumma.png')
            await pg.click('#v-style .seg button:text-is("Puhelimen mukaan")'); await pg.wait_for_timeout(100)
            # viety appi
            html=await pg.evaluate("MASTER.appHtml()")
            out=os.path.join(os.getcwd(),'tyyli_viety.html'); open(out,'w',encoding='utf8').write(html)
            print('7 viety appi: koko', len(html), '| muut paletit mukana:', 'laventeli' in html, '| tyyli projektissa:', '"style":{' in html, '| sävy ja korostus mukana:', '"hue":3' in html and '"look":"hero"' in html)
            for scheme in ('light','dark'):
                for w in (390,320):
                    ap=await b.new_page(viewport={'width':w,'height':760},color_scheme=scheme); ap.on('pageerror',lambda e:errs.append(str(e)))
                    await ap.goto('file://'+out); await ap.wait_for_timeout(300)
                    info=await ap.evaluate("(()=>{const a=document.querySelector('.ua-app');return {hero:!!document.querySelector('.ua-hero'),bgimg:getComputedStyle(a).backgroundImage.slice(0,16),bg:getComputedStyle(document.documentElement).backgroundColor,app:getComputedStyle(a).backgroundColor,dark:a.classList.contains('dark'),nap:a.dataset.nap,theme:document.querySelector('meta[name=theme-color]').content,ov:document.documentElement.scrollWidth-w}})()".replace('-w}', '-%d}' % w))
                    print('  ', scheme, w, json.dumps(info))
                    await ap.locator('.ua-row').first.click(); await ap.wait_for_timeout(150)
                    if w==390: await ap.screenshot(path='tyyli_viety_%s.png' % scheme)
                    await ap.close()
            await pg.close()
        # vanha projekti: korostusväri ilman tyyliä
        pg=await b.new_page(viewport={'width':1440,'height':900}); pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(U)
        await pg.evaluate("""localStorage.setItem('master:v1',JSON.stringify({seq:1,cur:'p1',projects:[{id:'p1',uid:'mvanha',name:'Vanha',screens:[{id:'s1',n:'Ruutu'}],
          objs:[{id:'o1',t:'choice',s:'s1',n:'Kyllä'}],cfg:{days:false,vis:'lukitutpois',tint:'vihrea'},state:{sel:['o1'],vals:{}},days:{},seq:1}],meta:{}}))""")
        await pg.reload(); await pg.wait_for_timeout(400)
        sel=await pg.evaluate("getComputedStyle(document.querySelector('#pscreen .ua-row.sel')).backgroundColor")
        await pg.click('#mtabs [data-v="style"]'); await pg.wait_for_timeout(100)
        print('8 vanha projekti (vihreä korostus): valittu rivi', sel, '| tyyli', await pg.inner_text('.tnow b'), '| tallennettu tyyli', await pg.evaluate("JSON.stringify(MASTER.data.projects[0].cfg.style||null)"))
        print('errs', errs)
        await b.close()
asyncio.run(main())
