# Jonon 1t: kaavan tuntematon #joukko tai nimi kysyy vahvistettaessa ”Tehdäänkö? OK / Peruuta” (tietokone 1440 ja 1280,
# 390 savutestinä). OK tekee joukon + Joukko-palikan tai Arvon kaavan viereen, yksi Kumoa palauttaa; Peruuta ei kysy samasta
# tekstistä uudestaan; Tunnus-kenttä ja tulos-kohde (x = …) eivät kysy; ＋ Luo joukko tekee myös Joukko-palikan; suora
# kirjoitus logiikkaan ja Joukko-palikan Ehto-kenttä kysyvät samoin. Ei oikeaa iPhonea eikä Safaria.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P;
 var a=KK.addBlock(P,'muisti',{v:'5'});KK.setName(P,a.id,'Eka');KK.addNode(P,a.id,10,40);
 var k=KK.addBlock(P,'kaava',{});var kn=KK.addNode(P,k.id,420,140);
 P.lcam={x:0,y:0,z:1};KK.repair(P);APP.renderAll();return {a:a.id,k:k.id,kn:kn.id};})()"""
NOW="{jk:KK.jkList(P).map(function(j){return KK.jkNm(P,j);}),pj:Object.values(P.b).filter(function(b){return b.k==='pjoukko';}).map(function(b){return KK.jkNm(P,b.jj);}),ar:Object.values(P.b).filter(function(b){return b.k==='arvo';}).map(function(b){return b.vt;})}"
async def main():
    async with async_playwright() as p:
        br=await p.chromium.launch()
        for W in (1440,1280,390):
            mob=W<500;H=844 if mob else 900
            ctx=await br.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Puuttuvat');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            if mob:await pg.tap('#tabs [data-t="logiikka"]')
            else:await pg.click('#tabs [data-t="logiikka"]')
            await pg.wait_for_timeout(200)
            async def sel(i,t='b'):
                await pg.evaluate("APP.S.sel={t:'%s',id:'%s'};APP.S.multi=[];APP.renderAll()"%(t,i));await pg.wait_for_timeout(150)
            async def nakyy():return await pg.evaluate("!document.getElementById('kysy').hidden")
            async def teksti():return await pg.inner_text('#kysy span')
            ta='#insp textarea[data-kaava]'
            # 1 tuntematon #joukko: vahvistus (Enter) kysyy, OK tekee joukon ja Joukko-palikan kaavan viereen
            await sel(I['kn'],'n')
            assert not await nakyy()
            # puhelimella paneeli on alalaatikossa: kohdistus ja vahvistus suoraan (savutesti)
            await pg.focus(ta);await pg.fill(ta,'#vihut.jäseniä + 1');await pg.wait_for_timeout(100)
            assert not await nakyy(),'ei kysytä kirjoittaessa'
            await pg.press(ta,'Enter');await pg.wait_for_timeout(200)
            assert await nakyy(),'kysymys näkyy';s=await teksti();print(W,'1',s);assert s=='Joukkoa #vihut ei ole. Tehdäänkö?',s
            u0=await pg.evaluate("APP.S.undo.length")
            if mob:await pg.tap('#kysy [data-kysy="ok"]')
            else:await pg.click('#kysy [data-kysy="ok"]')
            await pg.wait_for_timeout(250)
            assert not await nakyy()
            r=await P(pg,NOW);print(W,'1 OK',r);assert r=={'jk':['vihut'],'pj':['vihut'],'ar':[]},r
            assert await pg.evaluate("APP.S.undo.length")==u0+1,'yksi Kumoa-askel'
            r=await P(pg,"(function(){var pj=Object.values(P.b).filter(function(b){return b.k==='pjoukko';})[0],n=KK.nodesOfBlock(P,pj.id)[0],k=KK.nodeOf(P,'%s');return {f:P.b['%s'].f,v:E().val('%s'),dx:n.x-k.x,dy:Math.abs(n.y-k.y),nd:!!document.querySelector('#lels .ln[data-nid=\"'+n.id+'\"]')};})()"%(I['kn'],I['k'],I['k']))
            print(W,'1 palikka',r);assert '{%' in r['f'] and '{%?' not in r['f'] and r['v']==1 and r['dx']<0 and r['dy']<120 and r['nd'],r
            # Kumoa palauttaa kaiken, minkä OK teki
            await pg.evaluate("document.getElementById('undobtn').click()");await pg.wait_for_timeout(200)
            r=await P(pg,NOW);print(W,'1 Kumoa',r);assert r=={'jk':[],'pj':[],'ar':[]},r
            assert '{%?vihut}' in await P(pg,"P.b['%s'].f"%I['k'])
            if mob:
                print(W,'errs',errs);assert not errs,errs;await ctx.close();continue
            # 2 Peruuta: sama teksti ei kysy uudestaan, muutettu kysyy; muu toimi sulkee kysymyksen
            await sel(I['kn'],'n')
            await pg.click(ta);await pg.fill(ta,'#toinen.jäseniä + 1');await pg.press(ta,'Enter');await pg.wait_for_timeout(200)
            assert await nakyy();await pg.click('#kysy [data-kysy="ei"]');await pg.wait_for_timeout(150)
            assert not await nakyy();r=await P(pg,NOW);assert r['jk']==[],r
            assert 'ei joukkoa' in await pg.inner_text('#kres'),'virhe jää'
            await pg.click(ta);await pg.press(ta,'Enter');await pg.wait_for_timeout(200)
            assert not await nakyy(),'samaa ei kysytä uudestaan'
            await pg.click(ta);await pg.fill(ta,'#toinen.jäseniä + 2');await pg.press(ta,'Enter');await pg.wait_for_timeout(200)
            assert await nakyy(),'muuttunut teksti kysyy'
            await pg.mouse.click(W-60,300);await pg.wait_for_timeout(200)
            assert not await nakyy(),'napautus muualle sulkee';r=await P(pg,NOW);assert r['jk']==[],r
            # 3 joukko ja nimi samassa: yksi kysymys, OK tekee molemmat yhdellä Kumoa-askeleella
            await sel(I['kn'],'n')
            await pg.click(ta);await pg.fill(ta,'#kolmas.jäseniä + yöuni + eka');await pg.press(ta,'Enter');await pg.wait_for_timeout(200)
            s=await teksti();print(W,'3',s);assert s=='Ei ole: #kolmas, yöuni. Tehdäänkö?',s
            u0=await pg.evaluate("APP.S.undo.length")
            await pg.keyboard.press('Enter');await pg.wait_for_timeout(250)
            r=await P(pg,NOW);print(W,'3 Enter = OK',r);assert r=={'jk':['kolmas'],'pj':['kolmas'],'ar':['yöuni']},r
            assert await pg.evaluate("APP.S.undo.length")==u0+1
            assert '⚠' not in await pg.inner_text('#kres'),await pg.inner_text('#kres')
            await pg.evaluate("document.getElementById('undobtn').click()");await pg.wait_for_timeout(200)
            r=await P(pg,NOW);assert r=={'jk':[],'pj':[],'ar':[]},r
            # 4 tulos-kohde x = … ei kysy (tulos syntyy kaavasta); Esc sulkee kysymyksen
            await sel(I['kn'],'n')
            await pg.click(ta);await pg.fill(ta,'uusitulos = eka + 1');await pg.press(ta,'Enter');await pg.wait_for_timeout(200)
            assert not await nakyy(),'tulos-kohde ei kysy'
            await pg.click(ta);await pg.fill(ta,'vielä + 1');await pg.press(ta,'Enter');await pg.wait_for_timeout(200)
            s=await teksti();assert s=='Nimeä vielä ei ole. Tehdäänkö?',s
            await pg.keyboard.press('Escape');await pg.wait_for_timeout(150);assert not await nakyy()
            # 5 Tunnus-kentän uusi #tagi: joukko ilman kysymystä ja ilman Joukko-palikkaa
            await sel(I['a']);tu='#insp input[data-tunnus]'
            await pg.fill(tu,'@eka #tagi');await pg.press(tu,'Enter');await pg.wait_for_timeout(200)
            assert not await nakyy();r=await P(pg,NOW);print(W,'5',r);assert r['jk']==['tagi'] and r['pj']==[],r
            # 6 ＋ Luo joukko tekee saman kuin OK (joukko + Joukko-palikka), yksi Kumoa-askel
            await sel(I['kn'],'n')
            await pg.click(ta);await pg.fill(ta,'#nappi.jäseniä + 1');await pg.wait_for_timeout(150)
            u0=await pg.evaluate("APP.S.undo.length")
            await pg.locator('#insp [data-jluo="nappi"]').first.click();await pg.wait_for_timeout(250)
            r=await P(pg,NOW);print(W,'6',r);assert 'nappi' in r['jk'] and r['pj']==['nappi'],r
            assert await pg.evaluate("APP.S.undo.length")==u0+1
            await pg.press(ta,'Enter');await pg.wait_for_timeout(200);assert not await nakyy()
            # 7 suora kirjoitus logiikan palikkaan kysyy samoin
            await pg.evaluate("APP.S.sel=null;APP.renderAll()");await pg.wait_for_timeout(150)
            b=await pg.locator('#lels .ln[data-nid="%s"] .lb'%I['kn']).bounding_box()
            await pg.mouse.dblclick(b['x']+b['width']/2,b['y']+b['height']/2);await pg.wait_for_timeout(250)
            if not await pg.locator('#kedit textarea').count():
                await pg.mouse.click(b['x']+b['width']/2,b['y']+b['height']/2);await pg.wait_for_timeout(250)
            assert await pg.locator('#kedit textarea').count()==1,'kirjoituskenttä'
            await pg.fill('#kedit textarea','#suora.jäseniä');await pg.press('#kedit textarea','Enter');await pg.wait_for_timeout(200)
            s=await teksti();print(W,'7',s);assert s=='Joukkoa #suora ei ole. Tehdäänkö?',s
            await pg.click('#kysy [data-kysy="ok"]');await pg.wait_for_timeout(250)
            r=await P(pg,NOW);assert 'suora' in r['pj'],r
            # 8 Joukko-palikan Ehto: jäsen ei ole puuttuva nimi, tuntematon raja on
            pj=await P(pg,"Object.values(P.b).filter(function(b){return b.k==='pjoukko'&&KK.jkNm(P,b.jj)==='suora';})[0].id")
            await sel(pj);ef='#insp textarea[data-k="pjf_otf"]'
            await pg.click(ef);await pg.fill(ef,'jäsen.x > 100');await pg.press(ef,'Tab');await pg.wait_for_timeout(200)
            assert not await nakyy(),'jäsen ei kysy'
            await pg.click(ef);await pg.fill(ef,'jäsen.x > raja');await pg.press(ef,'Tab');await pg.wait_for_timeout(200)
            s=await teksti();print(W,'8',s);assert s=='Nimeä raja ei ole. Tehdäänkö?',s
            await pg.click('#kysy [data-kysy="ok"]');await pg.wait_for_timeout(250)
            r=await P(pg,NOW);assert 'raja' in r['ar'],r
            await pg.screenshot(path='appiappi_puuttuvat_%d.png'%W)
            print(W,'errs',errs);assert not errs,errs
            await ctx.close()
        await br.close()
asyncio.run(main())
