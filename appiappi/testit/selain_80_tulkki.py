# Jonon 6 (F27 kohta 2): tulkki (1440 ja 1280 hiirellä, 390 ja 320 sormella). Paletista Tulkki…: rivit kuviolla
# palikoiksi (esikatselu, virhe ohitetaan, Hyväksy, Kumoa poistaa), Excel-taulukko sarkaimella uudeksi taulukoksi,
# taulukkoikkunasta Liitä tekstiä… avaimella (päivitys + uusi rivi, paluu taulukkoon) ja kuvion tallennus projektiin.
# Ikkuna ei vieritä sivuttain. Synteettinen sisältö, ei oikeaa iPhonea. Kuvat appiappi_tulkki_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
import os
WS=tuple(int(x) for x in os.environ["WS"].split(",")) if os.environ.get("WS") else (1440,1280,390,320)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in WS:
            mob=W<500;H=844 if mob else 900
            ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            pg.on('dialog',lambda d:asyncio.ensure_future(d.accept('Sanakortit') if d.type=='prompt' else d.accept()))
            await pg.goto(U);await pg.wait_for_timeout(250)
            async def tap(sel):
                l=pg.locator(sel).first;await l.scroll_into_view_if_needed()
                if mob:
                    bb=await l.bounding_box();await pg.touchscreen.tap(bb['x']+bb['width']/2,bb['y']+bb['height']/2)
                else:await l.click()
                await pg.wait_for_timeout(180)
            async def pal():
                if mob and await pg.evaluate("document.body.classList.contains('inspopen')"):await tap('#insp [data-mclose]')
                if mob and not await pg.evaluate("document.body.classList.contains('palopen')"):await tap('#mpal')
            async def sheet():return await pg.locator('#sheet').inner_text()
            async def leveys():
                w=await pg.evaluate("(function(){var s=document.getElementById('sheet');return [s.scrollWidth,s.clientWidth,document.documentElement.scrollWidth,innerWidth];})()")
                assert w[0]<=w[1]+1 and w[2]<=w[3]+1,('sivuttaisvieritys',W,w)
            await pg.fill('#wname','Tulkki');await tap('#wcreate')
            await tap('#tabs [data-t="logiikka"]')
            # 1 paletista Tulkki…, rivit kuviolla palikoiksi
            await pal();await tap('#pal [data-quick="tulkki"]')
            sh=await sheet();assert 'Tulkki' in sh and 'Palikoiksi' in sh,sh
            await pg.fill('#tkt','yöuni: 8\nmieliala:\nrikki rivi\n\nPaino: 72,5');await pg.wait_for_timeout(150)
            sm=await pg.locator('#tkpre .tksum').inner_text();print(W,'1 esikatselu:',sm)
            assert '3 uutta' in sm and '1 virhe' in sm and '1 tyhjää' in sm,sm
            assert await pg.locator('#tkpre tr.tk-virhe').count()==1;assert 'erotinta' in await pg.locator('#tkpre tr.tk-virhe').inner_text()
            assert await P(pg,"Object.keys(P.b).length")==0,'esikatselu ei luo'
            await leveys()
            if W==390:await pg.screenshot(path='appiappi_tulkki_palikat_%d.png'%W)
            u0=await pg.evaluate("APP.S.undo.length")
            await tap('#tkpre [data-tkx="ok"]')
            assert not await pg.evaluate("document.getElementById('sheetbg').classList.contains('show')"),'ikkuna sulkeutui'
            nm=await P(pg,"Object.values(P.b).map(b=>[b.k,b.nm,b.v])");print(W,'1 luotu:',nm)
            assert sorted(nm)==[['arvo','Paino','72,5'],['arvo','mieliala',''],['arvo','yöuni','8']],nm
            assert await pg.evaluate("APP.S.undo.length")==u0+1,'yksi Kumoa-askel'
            assert await pg.locator('#lels .ln',has_text='yöuni').count()>=1,'näkyy logiikassa'
            # Kumoa poistaa
            await pg.evaluate("document.getElementById('undobtn').click()");await pg.wait_for_timeout(200)
            assert await P(pg,"Object.keys(P.b).length")==0,'Kumoa poisti'
            # 2 Excel-taulukko sarkaimella uudeksi taulukoksi
            await pal();await tap('#pal [data-quick="tulkki"]')
            await tap('#sheet [data-tks="tapa"][data-v="taulukko"]');await tap('#sheet [data-tks="kohde"][data-v="rivit"]')
            await pg.fill('#tknm','Kortit');await pg.fill('#tkt','Etu\tTaka\tPisteet\nkissa\tcat\t1\nkoira\t"dog\nhund"\t2,5')
            await pg.wait_for_timeout(150);sm=await pg.locator('#tkpre .tksum').inner_text();assert '2 uutta' in sm,sm
            pre=await pg.locator('#tkpre').inner_text();assert 'Pisteet (luku)' in pre,pre
            await leveys()
            if W==390:await pg.screenshot(path='appiappi_tulkki_taulukko_%d.png'%W)
            await tap('#tkpre [data-tkx="ok"]')
            t=await P(pg,"(function(){var t=Object.values(P.b).filter(b=>b.k==='taulu')[0];return {id:t.id,nm:t.nm,sar:t.sar.map(c=>c.nm+':'+c.laji),rv:t.rv.map(r=>r.a)};})()");print(W,'2 taulukko:',t)
            assert t['nm']=='Kortit' and t['sar']==['Etu:teksti','Taka:teksti','Pisteet:luku'] and t['rv'][1]=={'c1':'koira','c2':'dog\nhund','c3':2.5},t
            # 3 taulukkoikkunasta Liitä tekstiä… avaimella, paluu taulukkoon
            await pg.evaluate("APP.S.sel={t:'b',id:'%s'};APP.S.multi=[];APP.renderAll()"%t['id']);await pg.wait_for_timeout(150)
            if mob and not await pg.evaluate("document.body.classList.contains('inspopen')"):await tap('#mins')
            await tap('#insp [data-tdo="open"]');await tap('#sheet [data-tdx="tulkki"]')
            assert await pg.input_value('#tkk')=='{etu} = {taka}';assert await pg.input_value('#tktt')==t['id']
            await pg.fill('#tkt','kissa = katze\nhevonen = horse');await pg.wait_for_timeout(120)
            await pg.select_option('#tkavs','etu');await pg.wait_for_timeout(150)
            sm=await pg.locator('#tkpre .tksum').inner_text();assert '1 uutta' in sm and '1 muuttuu' in sm,sm
            # 4 kuvion tallennus projektiin
            await tap('#sheet [data-tkx="save"]');assert await P(pg,"P.kuviot")==[{'nm':'Sanakortit','k':'{etu} = {taka}'}]
            assert await pg.locator('#sheet [data-tkdel="Sanakortit"]').count()==1
            await pg.select_option('#tkavs','etu');await pg.wait_for_timeout(120)
            await tap('#tkpre [data-tkx="ok"]')
            sh=await sheet();assert 'Käyttötieto' not in sh and '⊞ Kortit' in sh,('paluu taulukkoikkunaan',sh[:200])
            rv=await P(pg,"Object.values(P.b).filter(b=>b.k==='taulu')[0].rv.map(r=>[r.a.c1,r.a.c2,r.a.c3||null])");print(W,'3 rivit:',rv)
            assert rv==[['kissa','katze',1],['koira','dog\nhund',2.5],['hevonen','horse',None]],rv
            assert await pg.locator('#sheet tr[data-trow]').count()==3
            await leveys()
            print(W,'errs',errs);assert not errs,errs
            await ctx.close()
        await b.close()
asyncio.run(main())
