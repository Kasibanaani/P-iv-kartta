# Appi-appi 33, F22 (jonon kohta 1): testitila Kokeile selaimessa (1440 ja 1280 hiirellä, 390 ja 320 kosketuksella).
# Kokeilu alkaa kopiosta käyttötiedoista: painikkeen painallukset näkyvät kokeilussa, mutta selaimen muisti, GitHubiin
# menevä sisältö (structOf) ja varmuuskopio pitävät oikeat arvot. Raita ja teksti Kokeilu näkyvät koko ajan, myös
# lukitus vaihtuu käyttöön ja palaa. Taulukkoon käytössä lisätty rivi näkyy kokeilussa taulu.vika-kaavalle, ei oikeassa. Lopetus palauttaa oikeat arvot; sivun uudelleenlataus kesken kokeilun ei jätä
# kokeilua oikeaksi tiedoksi; toisen projektin avaus lopettaa kokeilun. Rakenteen muutos kokeilussa jää voimaan.
# Ei oikeaa iPhonea.
import asyncio, json
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,vw=P.views[0].id;
 var n=KK.addBlock(P,'nappi',{v:vw,tx:'Lisää'});n.x=20;n.y=20;n.w=160;n.h=44;KK.setName(P,n.id,'Lisää');
 var m=KK.addBlock(P,'muisti',{v:'5'});KK.setName(P,m.id,'Laskuri');KK.addNode(P,m.id,600,0);
 var t=KK.addBlock(P,'tee',{do:'lisaa',o:m.id});var nn=KK.nodesOfBlock(P,n.id)[0]||KK.addNode(P,n.id,0,0);
 KK.addLink(P,nn.id,'e',KK.addNode(P,t.id,300,0).id,'e');
 var t=KK.addBlock(P,'taulu',{});KK.setName(P,t.id,'Ostokset');KK.addNode(P,t.id,10,200);var cN=KK.addCol(t,'Nimi','teksti');
 ['Maito','Omena'].forEach(function(x){var r=KK.tAddRow(P,t.id,false);KK.tEdit(P,t.id,false,r,cN.id,x,new Date());});
 var k=KK.addBlock(P,'kaava',{});k.f=KK.kaavaToIds(P,'ostokset.vika.nimi');KK.addNode(P,k.id,130,320);
 KK.repair(P);APP.saveNow();APP.renderAll();return {n:n.id,m:m.id,t:t.id,cN:cN.id,k:k.id};})()"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in (1440,1280,390,320):
            mob=W<500;H=844 if mob else 900
            ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            async def tap(sel):
                if mob:await pg.tap(sel)
                else:await pg.click(sel)
                await pg.wait_for_timeout(200)
            async def nyt(i):return await pg.evaluate("String(APP.ev().val('%s'))"%i)
            async def tallessa(i):return await pg.evaluate("(function(){var d=JSON.parse(localStorage.getItem('appiappi.v1'));var p=d.projects.filter(function(x){return x.id===d.cur;})[0];var m=p.st['%s'];return m==null?null:(typeof m==='object'?JSON.stringify(m):String(m));})()"%i)
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Koe');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(300)
            pid=await pg.evaluate("APP.P.id")
            assert await pg.is_hidden('#koeraita')
            # 1 oikea käyttö: lukitse ja paina kerran, arvo 6 tallessa
            await tap('#lockbtn');await tap('.ue[data-id="%s"]'%I['n'])
            await pg.evaluate("APP.saveNow()")
            print(W,'1 oikea:',await nyt(I['m']),await tallessa(I['m']));assert await nyt(I['m'])=='6' and await tallessa(I['m'])=='6'
            await tap('#lockbtn')  # takaisin muokkaukseen
            assert await pg.evaluate("APP.P.lock")==False
            # 2 kokeilu alkaa: raita, teksti, lukitus käyttöön, napin teksti
            await tap('#koebtn')
            assert await pg.is_visible('#koeraita');rt=await pg.inner_text('#koeraita');assert 'Kokeilu' in rt,rt
            assert 'Lopeta' in await pg.inner_text('#koebtn')
            assert await pg.evaluate("APP.P.lock")==True,'kokeilu avautuu käyttöön'
            bt=await pg.evaluate("document.getElementById('body').getBoundingClientRect().top");assert bt>=80,bt
            # 3 painallukset kokeilussa: 6 -> 8, mutta tallessa ja GitHub-sisällössä 6, lukitus false
            await tap('.ue[data-id="%s"]'%I['n']);await tap('.ue[data-id="%s"]'%I['n'])
            await pg.evaluate("APP.saveNow()")
            print(W,'3 kokeilu:',await nyt(I['m']),await tallessa(I['m']))
            assert await nyt(I['m'])=='8' and await tallessa(I['m'])=='6'
            assert await pg.evaluate("(function(){var d=JSON.parse(localStorage.getItem('appiappi.v1'));return d.projects.filter(function(x){return x.id===d.cur;})[0].lock;})()")==False
            # 3b taulukko: käytössä lisätty rivi näkyy kokeilussa taulu.vika-kaavalle (Appi-appi 31), ei oikeassa
            assert await nyt(I['k'])=='Omena'
            await pg.evaluate("(function(){var r=KK.tAddRow(APP.P,'%s',true);KK.tEdit(APP.P,'%s',true,r,'%s','Kokeilu',new Date());APP.renderAll();APP.saveNow();})()"%(I['t'],I['t'],I['cN']))
            print(W,'3b vika:',await nyt(I['k']));assert await nyt(I['k'])=='Kokeilu'
            assert await pg.evaluate("localStorage.getItem('appiappi.v1').indexOf('Kokeilu')<0"),'kokeilun rivi ei tallessa'
            await pg.screenshot(path='appiappiF22_kokeilu_%d.png'%W)
            # 4 rakenteen muutos kokeilussa jää voimaan (nimi)
            await pg.evaluate("KK.setName(APP.P,'%s','Laskin');APP.saveNow()"%I['m'])
            # 5 lopetus raidan napista: oikea arvo 6 palaa, lukitus palaa, raita pois
            await tap('#koeend')
            print(W,'5 lopetus:',await nyt(I['m']));assert await nyt(I['m'])=='6'
            assert await nyt(I['k'])=='Omena','taulukko palasi'
            assert await pg.is_hidden('#koeraita') and await pg.evaluate("APP.P.lock")==False
            assert await pg.evaluate("APP.P.b['%s'].nm"%I['m'])=='Laskin','rakenne jäi'
            # 6 kokeilu kesken ja sivu ladataan uudelleen: oikea 6 säilyy, ei kokeilua
            await tap('#koebtn');await tap('.ue[data-id="%s"]'%I['n']);assert await nyt(I['m'])=='7'
            await pg.evaluate("APP.saveNow()")
            await pg.reload();await pg.wait_for_timeout(300)
            print(W,'6 uudelleen:',await nyt(I['m']));assert await nyt(I['m'])=='6' and await pg.is_hidden('#koeraita')
            assert await pg.evaluate("APP.P.lock")==False
            # 7 toisen projektin avaus lopettaa kokeilun ja palauttaa oikean
            await tap('#koebtn');await tap('.ue[data-id="%s"]'%I['n'])
            await pg.evaluate("(function(){var p=KK.newProject('Toinen');APP.data.projects.push(p);})()")
            await tap('#projbtn');await tap('[data-open]:not(.cur)')
            assert await pg.is_hidden('#koeraita')
            v=await pg.evaluate("(function(){var p=APP.data.projects.filter(function(x){return x.id==='%s';})[0];var m=p.st['%s'];return typeof m==='object'?JSON.stringify(m):String(m);})()"%(pid,I['m']))
            print(W,'7 vaihto:',v);assert v=='6'
            print(W,'errs',errs);assert not errs,errs
            await ctx.close()
        await b.close()
asyncio.run(main())
