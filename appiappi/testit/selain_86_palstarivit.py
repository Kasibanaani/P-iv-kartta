# Jonon 12: logiikan Palikat-palstan (#plist) rivit ovat yksirivisiä. Viitenimi, sijainti ja määrä ovat vihjeessä (title),
# eivät rivin perässä; pitkä nimi katkeaa kolmeen pisteeseen; haku löytää yhä viitenimellä; kanvaasin viitenimi (.vtag) ennallaan.
# Tietokone 1440 ja 1280 hiirellä, 390 savutestinä. Ei oikeaa iPhonea.
import asyncio, os
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0].id;
 var n=KK.addBlock(P,'nappi',{v:v,tx:'Paina'});KK.setName(P,n.id,'Tosi pitkä painikkeen nimi joka ei mahdu palstaan');n.x=20;n.y=20;
 var m=KK.addBlock(P,'muisti',{v:'0'});KK.setName(P,m.id,'Univiime yön tunnit muistissa pitkään');KK.addNode(P,m.id,60,60);KK.addNode(P,m.id,60,200);
 KK.repair(P);APP.renderAll();return {n:n.id,m:m.id,mvt:m.vt,nvt:n.vt};})()"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in ((int(os.environ['VAIN']),) if os.environ.get('VAIN') else (1440,1280,390)):
            mob=W<500;H=844 if mob else 900
            ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Palsta');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(200)
            if mob:
                # Puhelimella palsta on laatikossa: vain savutesti, ettei rivi hajoa.
                await pg.evaluate("document.body.classList.add('palopen')");await pg.wait_for_timeout(200)
            assert await pg.locator('#plist .vtc').count()==0 and await pg.locator('#plist .chip small').count()==0,'ei viitettä rivillä'
            for bid,vt,paikka in ((I['m'],I['mvt'],'logiikka · 2×'),(I['n'],I['nvt'],None)):
                c=pg.locator('#plist [data-inst="%s"]'%bid)
                t=await c.get_attribute('title');assert t.startswith(vt+' · ') and (paikka is None or t.endswith(paikka)),t
                r=await c.evaluate("e=>{var b=e.getBoundingClientRect(),n=e.querySelector('.pn'),p=e.parentElement.getBoundingClientRect();return {h:b.height,r:b.right,pr:p.right,ov:n.scrollWidth>n.clientWidth,lh:n.getBoundingClientRect().height};}")
                print(W,bid,t,r)
                assert r['h']<40 and r['lh']<20,'yksirivinen'
                assert r['r']<=r['pr']+1,'ei yli palstan'
                if not mob: assert r['ov'],'pitkä nimi katkeaa (…)'
            # Haku viitenimellä löytää yhä
            await pg.fill('#psearch',I['mvt']);await pg.wait_for_timeout(100)
            assert await pg.locator('#plist .chip').count()==1 and await pg.locator('#plist [data-inst="%s"]'%I['m']).count()==1
            await pg.fill('#psearch','');await pg.wait_for_timeout(100)
            # Kanvaasin viitenimi ennallaan
            if mob: await pg.evaluate("document.body.classList.remove('palopen')");await pg.wait_for_timeout(100)
            vts=await pg.locator('#lworld .ln .vtag').all_inner_texts()
            assert vts.count(I['mvt'])>=1,vts
            if not mob: await pg.screenshot(path='palstarivit_%d.png'%W)
            print(W,'errs',errs);assert not errs
            await ctx.close()
        await b.close()
asyncio.run(main())
