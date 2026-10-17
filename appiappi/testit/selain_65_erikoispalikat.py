# Erikoispalikoiden ✦-merkki (1440 ja 1280 hiirellä, 390 ja 320 sormella): logiikan paletissa Kaavan tulos, Ajastin ja
# Kerros saavat ✦:n ja syyn vihjeeseen, Kaava ja Arvo eivät. Näkymän paletissa Sijainti ja Monitori saavat, Painike ei.
# Tarkastelijan otsikon alla on rivi "✦ Erikoispalikka." ja syy; tavallisella palikalla ei. Kuvat appiappi24_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in (1440,1280,390,320):
            mob=W<500;H=844 if mob else 900
            ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Erik');await pg.locator('#wcreate').click();await pg.wait_for_timeout(200)
            def chip(lbl):return "(function(){var c=[].slice.call(document.querySelectorAll('#pal .chip[data-make]')).filter(function(c){var t=c.textContent,ci=c.querySelector('.ci'),ek=c.querySelector('.ek');if(ci)t=t.slice(ci.textContent.length);if(ek)t=t.slice(0,t.length-ek.textContent.length);return t.trim()==='%s';})[0];return c?[!!c.querySelector('.ek'),c.title||'']:null;})()"%lbl
            # Näkymän paletti
            await pg.evaluate("APP.S.tab='nakyma';APP.S.pane='nakyma';APP.renderAll()")
            for lbl,want in (('Sijainti',True),('Monitori',True),('Painike',False)):
                r=await pg.evaluate(chip(lbl));assert r and r[0]==want,(W,lbl,r)
                if want:assert 'Erikoispalikka:' in r[1],r
            # Logiikan paletti
            await pg.evaluate("APP.S.tab='logiikka';APP.S.pane='logiikka';APP.renderAll()")
            for lbl,want in (('Kaavan tulos',True),('Ajastin',True),('Kerros',True),('Kaava',False),('Arvo',False),('Ketju',False)):
                r=await pg.evaluate(chip(lbl));assert r and r[0]==want,(W,lbl,r)
                if want:assert 'Erikoispalikka:' in r[1],r
            # Tarkastelija
            I=await pg.evaluate("""(function(){var P=APP.P;var t=KK.addBlock(P,'tulos',{});KK.addNode(P,t.id,40,40);var k=KK.addBlock(P,'kaava',{});KK.addNode(P,k.id,40,160);
              KK.repair(P);APP.S.sel={t:'b',id:t.id};APP.S.multi=[];APP.renderAll();return {t:t.id,k:k.id};})()""")
            txt=await pg.evaluate("(document.querySelector('#insp .erik')||{}).textContent||''")
            assert txt.startswith('✦ Erikoispalikka.') and 'tulos =' in txt,(W,txt)
            pk=await pg.evaluate("(function(){var e=document.querySelector('#insp .erik'),r=e.getBoundingClientRect(),i=document.querySelector('#insp').getBoundingClientRect();return [r.width>0,r.right<=i.right+1,getComputedStyle(e).color];})()")
            print(W,'paneeli',txt,pk)
            if mob:
                await pg.evaluate("document.body.classList.add('inspopen')");await pg.wait_for_timeout(200)
                pk=await pg.evaluate("(function(){var e=document.querySelector('#insp .erik'),r=e.getBoundingClientRect();return [r.width>0,r.left>=0,r.right<=innerWidth+1];})()");assert all(pk),(W,pk)
            if W in (1440,390):await pg.screenshot(path='appiappi24_paneeli_%d.png'%W)
            await pg.evaluate("APP.S.sel={t:'b',id:'%s'};APP.renderAll()"%I['k'])
            assert await pg.evaluate("!document.querySelector('#insp .erik')"),W
            if W==1440:
                await pg.evaluate("document.body.classList.remove('inspopen')")
                await pg.screenshot(path='appiappi24_paletti_%d.png'%W)
            print(W,'ok errs',errs);await ctx.close()
        await b.close()
asyncio.run(main())
