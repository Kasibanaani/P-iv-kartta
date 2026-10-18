# Jonon 5 (F27 kohta 1): viite-ehdotukset ja Luo Arvo (1440 ja 1280 hiirellä, 390 ja 320 kosketuksella).
# Kaavan tuntematon nimi saa napin ＋ Luo Arvo; luotu Arvo näkyy logiikassa, kaava toimii heti ja Kumoa poistaa sen.
# Varattu sana ei tarjoa luontia, keskeneräinen sana ei kun palikka sopii. Tekstipohjan ehdotus muuttaa sanan {viite}ksi
# vasta napautuksesta. Suora kirjoitus logiikan palikkaan, Viitevirheiden uusi kohde ja Lisää rivi -kenttä. Synteettinen sisältö, ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P;var vw=P.views[0].id;
 var u=KK.addBlock(P,'muisti',{v:'8'});KK.setName(P,u.id,'Uni');KK.addNode(P,u.id,20,40);
 var k=KK.addBlock(P,'kaava',{});k.f=KK.kaavaToIds(P,'uni > 7');var kn=KK.addNode(P,k.id,20,140);
 var t=KK.addBlock(P,'nayta',{v:vw,tx:'Hei'});t.x=20;t.y=20;t.w=200;t.h=40;KK.setName(P,t.id,'Rivi');KK.addNode(P,t.id,20,330);
 P.lcam={x:0,y:0,z:1};KK.repair(P);APP.renderAll();return {u:u.id,k:k.id,kn:kn.id,t:t.id};})()"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in (1440,1280,390,320):
            mob=W<500;H=844 if mob else 900
            ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Ehdotus');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            await pg.evaluate("APP.data.cfg.viit='{'")  # jonon 12f: tämä testi tarkistaa { }-viittaustavan (oletus on @, ks. selain_94)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            if mob:await pg.tap('#tabs [data-t="logiikka"]')
            else:await pg.click('#tabs [data-t="logiikka"]')
            await pg.wait_for_timeout(200)
            async def sel(i):await pg.evaluate("APP.S.sel={t:'b',id:'%s'};APP.S.multi=[];APP.renderAll()"%i);await pg.wait_for_timeout(200)
            async def typ(t,v):
                await pg.fill(t,v);await pg.focus(t);await pg.press(t,'End');await pg.wait_for_timeout(150)
            async def arvot():return await P(pg,"Object.values(P.b).filter(b=>b.k==='arvo').map(b=>b.nm)")
            await sel(I['k']);ta='#insp textarea[data-kaava]'
            # 1 tuntematon nimi: nappi, keskeneräinen ei (palikka sopii), yksi kirjain ei, varattu sana ei
            await typ(ta,'un');assert await pg.locator('#ksug [data-ksug="uni"]').count()==1;assert await pg.locator('#ksug [data-kluo]').count()==0
            await typ(ta,'y');assert await pg.locator('#ksug [data-kluo]').count()==0,'yksi kirjain'
            await typ(ta,'tänään + 1');assert await pg.locator('#ksug [data-kluo]').count()==0,'varattu sana'
            await typ(ta,'uni + yöuni');l=pg.locator('#ksug [data-kluo="yöuni"]');assert await l.count()==1
            print(W,'1 nappi:',await l.inner_text());assert 'Luo Arvo' in await l.inner_text()
            await pg.screenshot(path='appiappi_luo_%d.png'%W)
            # 2 napautus luo Arvon logiikkaan, kaava toimii heti
            u0=await pg.evaluate("APP.S.undo.length")
            await l.dispatch_event('pointerdown');await pg.wait_for_timeout(250)
            un=await pg.evaluate("APP.S.undo.length");assert un==u0+1,('yksi Kumoa-askel',u0,un)
            assert await arvot()==['yöuni'],await arvot()
            nb=await P(pg,"Object.values(P.b).filter(b=>b.k==='arvo')[0]");assert nb['vt']=='yöuni' and nb['v']==''
            assert await P(pg,"KK.nodesOfBlock(P,'%s').length"%nb['id'])==1
            assert await pg.locator('#lels .ln .lb',has_text='yöuni').count()>=1,'näkyy logiikassa'
            f=await P(pg,"P.b['%s'].f"%I['k']);assert '{#%s}'%nb['id'] in f,f
            assert await pg.locator('#insp [data-kluo]').count()==0,'nappi poistui'
            assert '⚠' not in await pg.inner_text('#kres'),await pg.inner_text('#kres')
            await pg.evaluate("APP.P.b['%s'].v='2';KK.repair(APP.P)"%nb['id']);await pg.wait_for_timeout(150)
            assert await P(pg,"E().val('%s')"%I['k'])==10
            # 3 Kumoa poistaa luodun palikan
            await pg.evaluate("document.getElementById('undobtn').click()");await pg.wait_for_timeout(200)
            assert await arvot()==[],await arvot()
            # 4 tekstipohja: tavallinen sana pysyy, ehdotus muuttaa viitteeksi vasta napautuksesta
            await sel(I['t']);tx='#insp input[data-k="tx"]'
            await typ(tx,'Unta ');assert await pg.locator('#insp .fsug button').count()==0
            await typ(tx,'Unta un');s=pg.locator('#insp .fsug [data-fsug="{uni}"]');assert await s.count()==1,'ehdotus {uni}'
            assert await pg.input_value(tx)=='Unta un'
            await pg.screenshot(path='appiappi_tekstiehdotus_%d.png'%W)
            await s.dispatch_event('pointerdown');await pg.wait_for_timeout(200)
            v=await pg.input_value(tx);print(W,'4 teksti:',v);assert v=='Unta {uni}',v
            assert await P(pg,"P.b['%s'].tx"%I['t'])=='Unta {#%s}'%I['u']
            assert await P(pg,"E().tpl(P.b['%s'].tx)"%I['t'])=='Unta 8'
            # aaltosulku: {u → {uni}
            await typ(tx,'Unta {u');s=pg.locator('#insp .fsug [data-fsug="{uni}"]');assert await s.count()==1
            await s.dispatch_event('pointerdown');await pg.wait_for_timeout(200);assert await pg.input_value(tx)=='Unta {uni}'
            # 5 suora kirjoitus logiikan palikkaan: Luo Arvo ja Esc
            await pg.evaluate("APP.S.sel={t:'n',id:'%s'};APP.renderAll()"%I['kn']);await pg.wait_for_timeout(150)
            if mob and await pg.locator('#insp [data-mclose]').count():await pg.evaluate("document.querySelector('#insp [data-mclose]').click()");await pg.wait_for_timeout(200)
            cdp=await ctx.new_cdp_session(pg)
            async def tapxy(x,y):
                if mob:
                    await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y}]});await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
                else:await pg.mouse.click(x,y)
                await pg.wait_for_timeout(250)
            for _ in range(1):
                r=await pg.locator('#lels .ln[data-nid="%s"] .lb'%I['kn']).bounding_box();await tapxy(r['x']+r['width']/2,r['y']+r['height']/2);assert await pg.locator('#kedit textarea').count()==1,('kirjoituskenttä',await pg.evaluate("(function(){var r=document.querySelector('#lels .ln[data-nid=\\'%s\\'] .lb').getBoundingClientRect();var e=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return [e&&e.outerHTML.slice(0,120),JSON.stringify(APP.S.sel)];})()"%I['kn']))
            await pg.fill('#kedit textarea','uni + askel');await pg.wait_for_timeout(150)
            l=pg.locator('#ksug2 [data-kluo="askel"]');assert await l.count()==1
            await l.dispatch_event('pointerdown');await pg.wait_for_timeout(200)
            assert await arvot()==['askel'],await arvot()
            assert await pg.locator('#kedit textarea').count()==1,'kenttä pysyy auki'
            await pg.press('#kedit textarea','Enter');await pg.wait_for_timeout(200)
            f=await P(pg,"P.b['%s'].f"%I['k']);assert '{?' not in f,f
            # 6 Viitevirheet: poistetun tilalle Luo Arvo
            await pg.evaluate("(function(){var P=APP.P;var a=Object.values(P.b).filter(b=>b.k==='arvo')[0];KK.removeBlock(P,a.id);APP.renderAll();})()")
            await sel(I['k']);o=pg.locator('#insp select[data-relink] option[value="+luo"]');assert await o.count()==1
            print(W,'6 valinta:',await o.inner_text())
            await pg.select_option('#insp select[data-relink]','+luo');await pg.wait_for_timeout(250)
            assert await arvot()==['askel'],await arvot()
            assert await P(pg,"KK.brokenRefs(P).length")==0
            # 7 Lisää rivi -toiminnon sarakekenttä on kaava: Luo Arvo sielläkin
            I2=await pg.evaluate("""(function(){var P=APP.P;var t=KK.addBlock(P,'taulu',{});KK.setName(P,t.id,'Kirjaus');KK.addNode(P,t.id,20,420);var c=KK.addCol(t,'Paino','luku');
             var e=KK.addBlock(P,'tee',{do:'lisaarivi',o:t.id});KK.addNode(P,e.id,20,500);KK.repair(P);APP.renderAll();return {e:e.id,c:typeof c==='string'?c:c.id};})()""")
            await sel(I2['e']);kv='#insp input[data-k="kv_%s"]'%I2['c']
            await typ(kv,'paino + 1');l=pg.locator('#insp .fsug [data-kluo="paino"]');assert await l.count()==1,'Luo Arvo sarakekentässä'
            await l.dispatch_event('pointerdown');await pg.wait_for_timeout(250)
            assert 'paino' in await arvot(),await arvot()
            kvv=await P(pg,"P.b['%s'].kv['%s']"%(I2['e'],I2['c']));assert kvv.startswith('{#') and '{?' not in kvv,kvv
            print(W,'errs',errs);assert not errs,errs
            await ctx.close()
        await b.close()
asyncio.run(main())
