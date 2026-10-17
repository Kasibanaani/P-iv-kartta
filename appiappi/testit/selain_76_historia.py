# F08 rakenteinen historia selaimessa (1440 ja 1280 hiirellä, 390 ja 320 kosketuksella). Taulukon paneelin nappi
# Tee kirjaushistoria lisää Aika- ja Id-sarakkeet; Kirjaa-toiminnon paneelissa kentät ilman Id:tä ja aika "tyhjä = nyt";
# painikkeen painallus kirjaa rivin; teksti {loki.tänään} ja {loki.viimeisin.kohde}; Aikajana näyttää taulukkoa (lähde),
# Kalenteri merkitsee päivän ja listaa kirjauksen kellonaikoineen; taulukkoikkunan Id ei ole muokattavissa; Asetusten
# päivän raja; vanhan aikajanan Muunna historiaksi. Kuvat appiappi_historia_*.png. Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0],vw=v.id;if(W0<500)v.laite='puhelin';
 function U(k,o,x,y,w,h,nm){o.v=vw;var b=KK.addBlock(P,k,o);b.x=x;b.y=y;b.w=w;b.h=h;KK.setName(P,b.id,nm);return b;}
 var t=KK.addBlock(P,'taulu',{});KK.setName(P,t.id,'Loki');var tn=KK.addNode(P,t.id,40,40);var cK=KK.addCol(t,'Kohde','teksti'),cM=KK.addCol(t,'Määrä','luku');
 var bt=U('nappi',{tx:'Kahvi',beh:'kerta'},20,20,140,44,'Kahvinappi');var bn=KK.addNode(P,bt.id,40,200);
 var ki=KK.addBlock(P,'tee',{do:'kirjaa',o:t.id});ki.kv={};ki.kv[cK.id]='"Kahvi"';ki.kv[cM.id]='1';var kn=KK.addNode(P,ki.id,300,200);KK.addLink(P,bn.id,'e',kn.id,'e');
 var tx=U('nayta',{tx:''},20,74,300,40,'Tila');tx.tx=KK.toIds(P,'Tänään {loki.tänään}, viimeksi {loki.viimeisin.kohde}');
 var aj=U('aika',{tx:'Loki'},20,120,300,200,'Aikajana');
 var ca=U('kalenteri',{tx:'',lahteet:[t.id]},20,330,320,330,'Kalenteri');
 var va=U('aika',{tx:'Vanha'},20,680,300,120,'Vanha');P.st[va.id]=[{t:Date.now()-3600000,tx:'Tauko'}];var vk=KK.addBlock(P,'tee',{do:'kirjaa',o:va.id,tx:'Tauko'});KK.addNode(P,vk.id,300,320);
 KK.repair(P);APP.renderAll();return {t:t.id,tn:tn.id,cK:cK.id,cM:cM.id,bt:bt.id,ki:ki.id,kn:kn.id,tx:tx.id,aj:aj.id,ca:ca.id,va:va.id,vk:vk.id,d:KK.iso(new Date())};})()"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in (1440,1280,390,320):
            mob=W<500;H=844 if mob else 900
            ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce',color_scheme='dark' if W==1280 else 'light')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            async def tap(sel):
                if mob:await pg.tap(sel)
                else:await pg.click(sel)
                await pg.wait_for_timeout(150)
            async def J(js):return await pg.evaluate(js)
            await pg.fill('#wname','Historia');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP.replace('W0',str(W)))
            async def sel(t,i):await J("APP.S.sel={t:'%s',id:'%s'};APP.S.multi=[];APP.renderAll()"%(t,i));await pg.wait_for_timeout(150)
            await J("APP.S.tab='logiikka';APP.renderAll()");await pg.wait_for_timeout(150)
            # 1 taulukon paneeli: Tee kirjaushistoria
            await sel('n',I['tn']);t=await pg.inner_text('#insp');assert 'Tee kirjaushistoria' in t,t
            await J("document.querySelector('#insp [data-tdo=\"hist\"]').click()");await pg.wait_for_timeout(150)
            sar=await J("APP.P.b['%s'].sar.map(c=>[c.nm,c.laji,c.auto||''])"%I['t']);print(W,'1 sarakkeet',sar)
            assert sar==[['Aika','aika','aika'],['Id','teksti','id'],['Kohde','teksti',''],['Määrä','luku','']],sar
            t=await pg.inner_text('#insp');assert 'loki.viimeisin' in t and 'loki.tänään' in t and 'automaattinen' in t,t
            idc=await J("KK.colAuto(APP.P.b['%s'],'id').id"%I['t']);ac=await J("KK.colAuto(APP.P.b['%s'],'aika').id"%I['t'])
            # 2 Kirjaa-toiminnon paneeli
            await sel('n',I['kn']);t=await pg.inner_text('#insp')
            assert await J("document.querySelector('#insp [data-k=\"kv_%s\"]')===null"%idc),'Id ei ole kenttä'
            ph=await J("document.querySelector('#insp [data-k=\"kv_%s\"]').placeholder"%ac);print(W,'2 aika',ph);assert 'tyhjä = nyt' in ph
            assert await J("document.querySelector('#insp select[data-k=\"do\"] option:checked').textContent")=='Kirjaa'
            assert 'kirjaushetken' in t
            desc=await pg.inner_text('#lworld [data-nid="%s"]'%I['kn']);assert 'Kirjaa → Loki' in desc,desc
            # 3 Aikajanan lähde
            await sel('b',I['aj']);opts=await J("[...document.querySelectorAll('#insp select[data-k=\"lh\"] option')].map(o=>o.value)");assert I['t'] in opts,opts
            await pg.select_option('#insp select[data-k="lh"]',I['t']);await pg.wait_for_timeout(150);assert await J("APP.P.b['%s'].lh"%I['aj'])==I['t']
            # 4 käyttö: kaksi painallusta kirjaa kaksi riviä
            await J("APP.S.tab='nakyma';APP.renderAll()");await pg.wait_for_timeout(150)
            await tap('#lockbtn');await pg.wait_for_timeout(200)
            for i in range(2):await tap('#uvp [data-id="%s"]'%I['bt'])
            n=await J("KK.tRows(APP.P,'%s').length"%I['t']);tx=(await pg.inner_text('#uvp [data-id="%s"]'%I['tx'])).strip();print(W,'4 rivit',n,tx)
            assert n==2 and tx=='Tänään 2, viimeksi Kahvi',tx
            ae=await pg.locator('#uvp [data-id="%s"] .ae'%I['aj']).all_inner_texts();print(W,'4 aikajana',ae)
            assert len(ae)==2 and 'Kahvi' in ae[0] and 'Määrä 1 · ' in ae[0] and 'klo' in ae[0]
            day='#uvp [data-id="%s"] [data-d="%s"]'%(I['ca'],I['d'])
            assert await pg.locator(day+'.mk').count()==1,'kalenteri merkitsee päivän'
            await tap(day);li=await pg.locator('#uvp [data-id="%s"] .cl .cli'%I['ca']).all_inner_texts();print(W,'4 kalenteri',li);assert len(li)==2 and all('Kahvi' in x for x in li),li
            sw=await J("document.documentElement.scrollWidth");assert sw<=W,('ei vaakavieritystä',sw)
            await pg.screenshot(path='appiappi_historia_kaytto_%d.png'%W)
            await tap('#lockbtn');await pg.wait_for_timeout(200)
            # 5 taulukkoikkuna: Id luku, aika muokattavissa
            await J("APP.S.tab='logiikka';APP.S.sel={t:'n',id:'%s'};APP.renderAll();document.querySelector('#insp [data-tdo=\"open\"]').click()"%I['tn']);await pg.wait_for_timeout(250)
            ids=await pg.locator('#sheet .tdid').all_inner_texts();print(W,'5 id',ids);assert ids==['u1','u2'],ids
            assert await pg.locator('#sheet [data-tcell="u1|%s"]'%ac).count()==1
            await pg.screenshot(path='appiappi_historia_taulukko_%d.png'%W)
            await J("document.querySelector('#sheet [data-tdx=\"close\"]').click()");await pg.wait_for_timeout(150)
            # 6 päivän raja Asetuksista
            await J("document.querySelector('#setbtn').click()");await pg.wait_for_timeout(200)
            await pg.select_option('#sheet select[data-praja]','4');await pg.wait_for_timeout(150);assert await J("APP.P.praja")==4
            await pg.select_option('#sheet select[data-praja]','0');await pg.wait_for_timeout(150);assert await J("'praja' in APP.P")==False
            await J("document.querySelector('#sheet [data-x=\"close\"]').click()");await pg.wait_for_timeout(150)
            # 7 vanhan aikajanan muunnos napista
            await sel('b',I['va']);t=await pg.inner_text('#insp');assert 'Muunna historiaksi' in t
            await J("document.querySelector('#insp [data-do=\"ajmuunna\"]').click()");await pg.wait_for_timeout(200)
            r=await J("(function(){var P=APP.P,a=P.b['%s'],t=P.b[a.lh];return [t&&t.nm,KK.tRows(P,a.lh).length,P.b['%s'].o===a.lh,P.st['%s'].length,KK.nodesOfBlock(P,a.lh).length];})()"%(I['va'],I['vk'],I['va']));print(W,'7 muunnos',r)
            assert r==['Vanha historia',1,True,1,1],r
            sw=await J("document.documentElement.scrollWidth");assert sw<=W,('ei vaakavieritystä',sw)
            await pg.screenshot(path='appiappi_historia_paneeli_%d.png'%W)
            print(W,'errs',errs);assert not errs,errs
            await ctx.close()
        await b.close()
asyncio.run(main())
