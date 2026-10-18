# Jonon 15c: joukot tageina selaimessa (tietokone 1440 ja 1280, 390 savutestinä). Tunnus-kenttä (@viite #joukko), uusi
# #nimi luo joukon, #-ehdotus Tunnuksessa, kaavassa summa(#x) → #x.summa heti, #x.-ehdotukset (koosteet), ＋ Luo joukko,
# Toiminnon kohde #joukko (jokainen jäsen), ⚡ kuuluu kun -kohta logiikan palikassa, paletin Joukot: nimeä ja poista.
# Ei oikeaa iPhonea eikä Safaria.
import asyncio, json
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P;
 function A(n,v,x,y){var b=KK.addBlock(P,'muisti',{v:v});KK.setName(P,b.id,n);KK.addNode(P,b.id,x,y);return b;}
 var a=A('Eka','5',10,40),b=A('Toka','7',10,120),c=A('Kolmas','2',10,200);
 var k=KK.addBlock(P,'kaava',{});var kn=KK.addNode(P,k.id,260,120);
 var t=KK.addBlock(P,'tee',{do:'aseta',v:'1'});KK.addNode(P,t.id,260,260);
 P.lcam={x:0,y:0,z:1};KK.repair(P);APP.renderAll();return {a:a.id,b:b.id,c:c.id,k:k.id,t:t.id};})()"""
async def valitse(pg,i):
    await pg.evaluate("APP.S.sel={t:'b',id:'%s'};APP.S.multi=[];APP.renderAll()"%i);await pg.wait_for_timeout(150)
async def main():
    async with async_playwright() as p:
        br=await p.chromium.launch()
        for W in (1440,1280,390):
            mob=W<500;H=844 if mob else 900
            ctx=await br.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Joukot');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            if mob:await pg.tap('#tabs [data-t="logiikka"]')
            else:await pg.click('#tabs [data-t="logiikka"]')
            await pg.wait_for_timeout(200)
            tu='#insp input[data-tunnus]'
            # 1 Tunnus: viite ja uusi joukko
            await valitse(pg,I['a'])
            v=await pg.input_value(tu);print(W,'1 Tunnus alussa:',v);assert v=='@eka',v
            await pg.fill(tu,'@eka #kol');await pg.wait_for_timeout(150)
            s=await pg.inner_text('#insp .fsug');print(W,'1 ehdotus:',s);assert 'uusi joukko syntyy' in s,s
            await pg.press(tu,'Enter');await pg.wait_for_timeout(200)
            r=await P(pg,"{j:KK.jkFind(P,'kol'),t:P.b['%s'].jkt,c:document.querySelector('#insp .jkchips').innerText}"%I['a']);print(W,'1',r)
            assert r['j'] and r['t']==[r['j']] and '#kol' in r['c'] and 'jäsen (tagi)' in r['c'],r
            J=r['j']
            if mob:
                print(W,'errs',errs);assert not errs,errs;await ctx.close();continue
            # 2 #-ehdotus Tunnuksessa olemassa olevasta joukosta
            await valitse(pg,I['b'])
            await pg.click(tu);await pg.press(tu,'End');await pg.type(tu,' #k');await pg.wait_for_timeout(150)
            await pg.locator('#insp .fsug button[data-fsug="#kol "]').click();await pg.wait_for_timeout(100)
            v=await pg.input_value(tu);print(W,'2 Tunnus:',v);assert v=='@toka #kol ',v
            await pg.press(tu,'Enter');await pg.wait_for_timeout(200)
            r=await P(pg,"P.b['%s'].jkt"%I['b']);assert r==[J],r
            # 3 kaava: summa(#kol) kääntyy heti, tulos 12
            await valitse(pg,I['k']);ta='#insp textarea[data-kaava]'
            await pg.click(ta);await pg.type(ta,'summa(#kol)');await pg.wait_for_timeout(150)
            v=await pg.input_value(ta);r=await pg.inner_text('#kres');print(W,'3',v,'|',r);assert v=='#kol.summa',v;assert '12' in r,r
            # 4 #kol. → koosteet ehdotuksina
            await pg.fill(ta,'#kol.');await pg.press(ta,'End');await pg.wait_for_timeout(150)
            s=await pg.inner_text('#ksug');print(W,'4 ehdotukset:',s.replace('\n',' ')[:160]);assert 'keskiarvo' in s and 'jäsenet' in s,s
            await pg.locator('#ksug button[data-ksug="keskiarvo"]').click();await pg.wait_for_timeout(150)
            v=await pg.input_value(ta);r=await pg.inner_text('#kres');print(W,'4',v,'|',r);assert v=='#kol.keskiarvo' and '6' in r,(v,r)
            # 5 tuntematon joukko: virhe ja ＋ Luo joukko
            await pg.fill(ta,'#uusi.summa + 1');await pg.wait_for_timeout(150)
            r=await pg.inner_text('#kres');assert 'ei joukkoa' in r,r
            await pg.locator('#insp [data-jluo="uusi"]').first.click();await pg.wait_for_timeout(200)
            r=await pg.inner_text('#kres');f=await P(pg,"P.b['%s'].f"%I['k']);print(W,'5',r,f);assert '1' in r and 'ei joukkoa' not in r and '{%' in f,(r,f)
            await pg.fill(ta,'#kol.summa');await pg.wait_for_timeout(100);await pg.press(ta,'Enter');await pg.wait_for_timeout(150)
            # 6 Toiminto kohteena joukko
            await valitse(pg,I['t'])
            await pg.select_option('#insp select[data-k="o"]','%'+J);await pg.wait_for_timeout(200)
            h=await pg.inner_text('#insp');assert 'jokaiselle joukon #kol jäsenelle' in h and '(nyt 2)' in h,h[:400]
            r=await P(pg,"(function(){var t=P.b['%s'];KK.runAction(P,t.id,APP.ctx());return {o:t.o,oj:t.oj,a:E().val('%s'),b:E().val('%s'),c:E().val('%s')};})()"%(I['t'],I['a'],I['b'],I['c']));print(W,'6',r)
            assert r['o']=='' and r['oj']==J and r['a']==1 and r['b']==1 and r['c']==2,r
            # 7 ⚡ kuuluu kun avaa kohdan palikkaan
            await valitse(pg,I['a'])
            await pg.locator('#insp [data-jkk="%s"]'%J).click();await pg.wait_for_timeout(200)
            r=await P(pg,"(function(){var n=KK.nodesOfBlock(P,'%s')[0],el=document.querySelector('#lworld [data-nid=\"'+n.id+'\"] .pt[data-p=\"jk_%s\"]');return {jkk:P.b['%s'].jkk,pt:!!el,tun:document.querySelector('#insp input[data-tunnus]').value};})()"%(I['a'],J,I['a']));print(W,'7',r)
            assert r['jkk']==[J] and r['pt'] and r['tun']=='@eka #kol⚡',r
            # 8 paletti: Joukot-lista, nimeä (kaava seuraa) ja poista (kaava näyttää ⚠)
            t=await pg.inner_text('#pal');assert '#kol' in t and '2 jäsentä' in t and '#uusi' in t,t[-300:]
            pg.once('dialog',lambda d:asyncio.ensure_future(d.accept('#kolikot')))
            await pg.locator('#pal [data-jkre="%s"]'%J).click();await pg.wait_for_timeout(250)
            await valitse(pg,I['k']);v=await pg.input_value(ta);print(W,'8 nimetty:',v);assert v=='#kolikot.summa',v
            pg.once('dialog',lambda d:asyncio.ensure_future(d.accept()))
            await pg.locator('#pal [data-jkdel="%s"]'%J).click();await pg.wait_for_timeout(250)
            await valitse(pg,I['k']);v=await pg.input_value(ta);r=await pg.inner_text('#kres');print(W,'8 poistettu:',v,'|',r)
            assert v=='#⚠kolikot.summa' and 'poistettu' in r,(v,r)
            r=await P(pg,"[P.b['%s'].jkt||null,P.b['%s'].jkk||null]"%(I['a'],I['a']));assert r==[None,None],r
            # 9 Kumoa palauttaa joukon
            await pg.evaluate("document.activeElement&&document.activeElement.blur()");await pg.keyboard.press('Control+z');await pg.wait_for_timeout(250)
            r=await P(pg,"[P.b['%s'].jkt||null,KK.jkFind(P,'kolikot')]"%I['a']);print(W,'9 kumottu:',r);assert r==[[J],J],r
            print(W,'errs',errs);assert not errs,errs
            await ctx.close()
        await br.close()
asyncio.run(main())
