# Jonon 12e (F38 kohta 7): muut pikaluonnit logiikasta näkymään. Tee näkymään ja ▾ lähteen lajin mukaan:
# Toiminto → Painike (painettu → tee kun), Ketju → Käynnistysnappi, Satunnaisluku → Arvo uudelleen -nappi,
# Muisti → Lukukenttä/Tekstikenttä/Säädin/Kytkin (muuttui → Aseta), Tietotaulukko → Toistin (rivit-nuoli, Rivi-palikka,
# kortin teksti), Sekuntikello → Monitori + Käynnistä/Pysäytä. Kaikki tavallisia palikoita ja nuolia; ⌘Z kumoaa yhdellä.
# Tietokone 1440 ja 1280 hiirellä, 390 savutestinä. Ei oikeaa iPhonea.
import asyncio, os
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v1=P.views[0].id;
 var t=KK.addBlock(P,'nayta',{v:v1,tx:'Otsikko'});t.x=60;t.y=30;
 var m=KK.addBlock(P,'muisti',{v:'3'});KK.setName(P,m.id,'Pisteet');var mn=KK.addNode(P,m.id,600,60);
 var tx=KK.addBlock(P,'muisti',{v:'moi'});KK.setName(P,tx.id,'Viesti');var txn=KK.addNode(P,tx.id,600,160);
 var a=KK.addBlock(P,'tee',{do:'lisaa',o:m.id,v:'1'});KK.setName(P,a.id,'Lisää piste');var an=KK.addNode(P,a.id,600,260);
 var k=KK.addBlock(P,'ketju',{});KK.setName(P,k.id,'Kierros');var kn=KK.addNode(P,k.id,40,560);
 var s=KK.addBlock(P,'satu',{min:1,max:6});KK.setName(P,s.id,'Noppa');var sn=KK.addNode(P,s.id,600,480);
 var c=KK.addBlock(P,'kello',{});KK.setName(P,c.id,'Kello');var cn=KK.addNode(P,c.id,600,580);
 var tb=KK.addBlock(P,'taulu',{nm:'Tuotteet'});var tbn=KK.addNode(P,tb.id,600,680);var c1=KK.addCol(tb,'Nimi','teksti'),c2=KK.addCol(tb,'Määrä','luku');
 [['Maito','2'],['Leipä','5']].forEach(function(x){var r=KK.tAddRow(P,tb.id,false);KK.tEdit(P,tb.id,false,r,c1.id,x[0]);KK.tEdit(P,tb.id,false,r,c2.id,x[1]);});
 KK.repair(P);KK.tick(P,APP.ctx());APP.renderAll();
 return {v1:v1,m:m.id,mn:mn.id,tx:tx.id,txn:txn.id,a:a.id,an:an.id,k:k.id,kn:kn.id,s:s.id,sn:sn.id,c:c.id,cn:cn.id,tb:tb.id,tbn:tbn.id};})()"""
# Nuoli (lähde-palikka, lähtöportti) → (kohde-palikka, tuloportti)
LINKS="P.lg.l.map(l=>{var f=KK.nodeOf(P,l.f),t=KK.nodeOf(P,l.t);return [P.b[f.p].nm,l.fp,P.b[t.p].nm,l.tp];})"
async def klik(pg,nid):
    c=await keskus(pg,'#lworld [data-nid="%s"]'%nid);await pg.mouse.click(c[0],c[1]);await pg.wait_for_timeout(120)
async def valikko(pg,nid):
    # Valinta suoraan (kanvaasin solmut voivat olla ruudun ulkopuolella kapeammalla leveydellä); napautus testattu kohdassa 1.
    await pg.evaluate("(n)=>{APP.S.sel={t:'n',id:n};APP.S.multi=[];APP.renderAll();}",nid);await pg.wait_for_timeout(120)
    await pg.click('#insp [data-tnvm]');await pg.wait_for_timeout(120)
    return await pg.locator('#menu button').all_inner_texts()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in ((int(os.environ['VAIN']),) if os.environ.get('VAIN') else (1440,1280,390)):
            mob=W<500;H=844 if mob else 900
            ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Pikaluonnit');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(200)
            if mob:
                # Puhelimella savutesti: Toiminnon paneelin nappi tekee painikkeen.
                await pg.evaluate("(n)=>{APP.S.sel={t:'n',id:n};APP.S.multi=[];APP.renderAll();document.body.classList.add('inspopen');}",I['an']);await pg.wait_for_timeout(150)
                await pg.click('#insp [data-tnv]');await pg.wait_for_timeout(200)
                assert await P(pg,"B('Lisää piste · painike').k")=='nappi'
                print(W,'errs',errs);assert not errs;await ctx.close();continue
            # 1) Toiminto: paneelissa nappi ilman ▾:tä, tekee painikkeen, jonka painettu → tee kun
            await klik(pg,I['an'])
            assert await pg.locator('#insp [data-tnv]').count()==1 and await pg.locator('#insp [data-tnvm]').count()==0,'Toiminnolle nappi, ei ▾'
            await pg.click('#insp [data-tnv]');await pg.wait_for_timeout(150)
            r=await P(pg,"(function(){var b=B('Lisää piste · painike');return {k:b.k,tx:b.tx,beh:b.beh,v:b.v,tab:APP.S.tab};})()");print(W,r)
            assert r=={'k':'nappi','tx':'Lisää piste','beh':'kerta','v':I['v1'],'tab':'logiikka'},r
            L=await P(pg,LINKS);assert ['Lisää piste · painike','e','Lisää piste','e'] in L,L
            await pg.evaluate("KK.press(APP.P,Object.values(APP.P.b).filter(b=>b.nm==='Lisää piste · painike')[0].id,APP.ctx())")
            assert await P(pg,"E().val('%s')"%I['m'])==4,'painallus lisäsi pisteen'
            await pg.keyboard.press('Control+z');await pg.wait_for_timeout(150)
            # (⌘Z kumoaa luonnin; painalluksen käyttötieto ei ole rakennetta)
            assert await P(pg,"!B('Lisää piste · painike')"),'⌘Z kumosi painikkeen'
            # 2) Ketju: oletus käynnistysnappi, ▾:ssä myös arvon vaihtoehdot
            opts=await valikko(pg,I['kn']);print(W,opts)
            assert opts[0]=='Käynnistysnappi' and 'Laatikko tekstillä' in opts,opts
            await pg.locator('#menu button',has_text='Käynnistysnappi').click();await pg.wait_for_timeout(150)
            L=await P(pg,LINKS);assert ['Kierros · painike','e','Kierros','e'] in L,L
            assert await P(pg,"B('Kierros · painike').tx")=='Käynnistä Kierros'
            # 3) Satunnaisluku: Arvo uudelleen -nappi
            opts=await valikko(pg,I['sn']);assert opts[-1]=='Arvo uudelleen -nappi' and opts[0]=='Laatikko tekstillä',opts
            await pg.locator('#menu button',has_text='Arvo uudelleen').click();await pg.wait_for_timeout(150)
            L=await P(pg,LINKS);assert ['Noppa · painike','e','Noppa','e'] in L,L
            # 4) Muisti (luku): Lukukenttä, joka asettaa; alkuarvo nykyinen, muuttui → Aseta
            opts=await valikko(pg,I['mn']);print(W,opts)
            assert opts==['Laatikko tekstillä','Pelkkä teksti','Monitori','Lukukenttä, joka asettaa tämän','Säädin, joka asettaa tämän'],opts
            await pg.locator('#menu button',has_text='Lukukenttä').click();await pg.wait_for_timeout(150)
            r=await P(pg,"(function(){var b=B('Pisteet · kenttä'),t=Object.values(P.b).filter(o=>o.k==='tee'&&o.do==='aseta'&&o.o==='%s')[0];return {k:b.k,v:E().val(b.id),tv:t&&t.v,bid:b.id};})()"%I['m']);print(W,r)
            assert r['k']=='luku' and r['v']==4 and r['tv']=={'r':r['bid']},r
            L=await P(pg,LINKS);assert any(x[0]=='Pisteet · kenttä' and x[1]=='mu' and x[3]=='e' for x in L),L
            await pg.evaluate("KK.userSet(APP.P,'%s',9,APP.ctx())"%r['bid'])
            assert await P(pg,"E().val('%s')"%I['m'])==9,'kenttä asetti Muistin'
            # Säädin: rajat kattavat arvon
            await valikko(pg,I['mn']);await pg.locator('#menu button',has_text='Säädin').click();await pg.wait_for_timeout(150)
            r=await P(pg,"(function(){var b=Object.values(P.b).filter(o=>o.k==='saadin')[0];return [b.min,b.max,E().val(b.id)];})()")
            assert r==[0,10,9],r
            # Muisti (teksti): Tekstikenttä, alkuarvo nykyinen
            opts=await valikko(pg,I['txn']);assert 'Tekstikenttä, joka asettaa tämän' in opts and 'Monitori' not in opts,opts
            await pg.locator('#menu button',has_text='Tekstikenttä').click();await pg.wait_for_timeout(150)
            r=await P(pg,"(function(){var b=B('Viesti · kenttä');return [b.k,E().val(b.id)];})()");assert r==['teksti','moi'],r
            # 5) Sekuntikello: Monitori + Käynnistä/Pysäytä rinnakkain monitorin alla
            opts=await valikko(pg,I['cn']);assert opts[-1]=='Monitori + Käynnistä ja Pysäytä',opts
            await pg.locator('#menu button',has_text='Monitori + Käynnistä').click();await pg.wait_for_timeout(150)
            L=await P(pg,LINKS)
            assert ['Kello','v','Kello · näyttö','o_arvo'] in L and ['Kello · käynnistä','e','Kello','e'] in L and ['Kello · pysäytä','e','Kello','x'] in L,L
            r=await P(pg,"['Kello · näyttö','Kello · käynnistä','Kello · pysäytä'].map(n=>{var b=B(n);return [b.x,b.y,b.w,b.h];})");print(W,r)
            assert r[1][1]==r[2][1]>=r[0][1]+r[0][3] and r[2][0]>=r[1][0]+r[1][2],'napit rinnakkain monitorin alla %s'%r
            # 6) Tietotaulukko: Toistin, rivit-nuoli, Rivi-palikka, kortin teksti sarakkeista
            opts=await valikko(pg,I['tbn']);assert opts[-1]=='Toistin: kortti jokaiselle riville',opts
            await pg.locator('#menu button',has_text='Toistin').click();await pg.wait_for_timeout(150)
            L=await P(pg,LINKS);assert ['Tuotteet','rj','Tuotteet · toistin','rv'] in L,L
            r=await P(pg,"(function(){var t=B('Tuotteet · toistin'),c=B('Tuotteet · kortin teksti'),rv=Object.values(P.b).filter(o=>o.k==='trivi'&&o.tt==='%s');return {kort:E().val(t.id),tst:c.tst===t.id,tx:KK.toNames(P,c.tx),rv:rv.length,rvn:P.lg.n.some(n=>rv[0]&&n.p===rv[0].id)};})()"%I['tb']);print(W,r)
            assert r['kort']==2 and r['tst'] and r['tx']=='{kohde.nimi} · {kohde.määrä}' and r['rv']==1 and r['rvn'],r
            # toinen toistin käyttää samaa Rivi-palikkaa
            await valikko(pg,I['tbn']);await pg.locator('#menu button',has_text='Toistin').click();await pg.wait_for_timeout(150)
            assert await P(pg,"Object.values(P.b).filter(o=>o.k==='trivi').length")==1,'Rivi-palikka uudelleen'
            # 7) Näkymässä kortit näyttävät rivit
            await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(250)
            st=await pg.locator('#stage').inner_text();assert 'Maito · 2' in st and 'Leipä · 5' in st,st[:400]
            await pg.screenshot(path='pikaluonnit_%d.png'%W)
            print(W,'errs',errs);assert not errs
            await ctx.close()
        await b.close()
asyncio.run(main())
