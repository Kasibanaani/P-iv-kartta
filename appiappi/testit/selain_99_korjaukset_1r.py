# Jonon 1r (kartoitus 8, S4 ja W1) selaimessa (tietokone 1440 ja 1280, 390 savutestinä): #x.-ehdotukset sekajoukossa
# (ensin kaikkien jäsenten yhteiset, sitten ”vain osalla jäsenistä”), Rivijoukon oletusnimi paletista Suodatus (viite suodatus).
# Ei oikeaa iPhonea eikä Safaria.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P;
 var m=KK.addBlock(P,'muisti',{v:'3'});KK.setName(P,m.id,'Eka');KK.addNode(P,m.id,10,40);
 var c=KK.addBlock(P,'kello',{});KK.setName(P,c.id,'Kello');KK.addNode(P,c.id,10,140);
 var k=KK.addBlock(P,'kaava',{});KK.addNode(P,k.id,260,120);
 KK.setTunnus(P,m.id,'#mix');KK.setTunnus(P,c.id,'#mix');
 P.lcam={x:0,y:0,z:1};KK.repair(P);APP.renderAll();return {m:m.id,c:c.id,k:k.id};})()"""
async def main():
    async with async_playwright() as p:
        br=await p.chromium.launch()
        for W in (1440,1280,390):
            mob=W<500;H=844 if mob else 900
            ctx=await br.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Korjaukset');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            if mob:await pg.tap('#tabs [data-t="logiikka"]')
            else:await pg.click('#tabs [data-t="logiikka"]')
            await pg.wait_for_timeout(200)
            if mob:
                r=await pg.evaluate("document.getElementById('pal').innerHTML.indexOf('Suodatus')>=0");print(W,'paletissa Suodatus:',r);assert r
                print(W,'errs',errs);assert not errs,errs;await ctx.close();continue
            # 1 #mix. → yhteiset ensin, Kellon omat merkinnällä
            await pg.evaluate("APP.S.sel={t:'b',id:'%s'};APP.S.multi=[];APP.renderAll()"%I['k']);await pg.wait_for_timeout(150)
            ta='#insp textarea[data-kaava]';await pg.click(ta);await pg.fill(ta,'#mix.');await pg.press(ta,'End');await pg.wait_for_timeout(150)
            bs=await pg.evaluate("Array.from(document.querySelectorAll('#ksug button[data-ksug]')).map(function(b){return [b.getAttribute('data-ksug'),b.innerText.replace(/\\n/g,' ')];})")
            print(W,'1 ehdotukset:',bs)
            props=[b for b in bs if b[0].endswith('.')]
            osa=[b for b in props if 'vain osalla' in b[1]];yht=[b for b in props if 'vain osalla' not in b[1]]
            assert any(b[0]=='käy.' for b in osa),bs
            assert all(props.index(y)<props.index(o) for y in yht for o in osa),'yhteiset ensin'
            assert all('1/2' in o[1] for o in osa),osa
            # 2 Rivijoukko paletista: nimi Suodatus, viite suodatus
            n0=await P(pg,"Object.keys(P.b).length")
            cv=await keskus(pg,'#lvp')
            await paletti(pg,'Rivijoukko',cv[0]+120,cv[1]+120);await pg.wait_for_timeout(200)
            r=await P(pg,"Object.values(P.b).filter(function(b){return b.k==='joukko';}).map(function(b){return [b.nm,b.vt];})");print(W,'2 Rivijoukko:',r)
            assert r==[['Suodatus','suodatus']],r
            print(W,'errs',errs);assert not errs,errs
            await ctx.close()
        await br.close()
asyncio.run(main())
