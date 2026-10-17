# F26 suosikit ja presetit (1440 ja 1280 hiirellä, 390 ja 320 sormella). Lähdeprojektissa valitaan näkymän palikat,
# tallennusikkunasta otetaan mukaan toiminto ja muisti, kerroin jätetään pois. Suosikki valitaan tähdellä. Uudessa projektissa
# suosikki ja presetti näkyvät, presetti liitetään napautuksella: palikat uusina, nuoli ja painallus toimivat, kerroin näkyy
# Kytke nämä -listassa eikä sitoudu kohteen samannimiseen. Hylly: nimeä, poista. Varmuuskopio sisältää molemmat. Kuvat appiappi22_*.png.
import asyncio, json
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0];v.laite='puhelin';var vw=v.id;
 function U(k,o,x,y,w,h,nm){o.v=vw;var b=KK.addBlock(P,k,o);b.x=x;b.y=y;b.w=w;b.h=h;KK.setName(P,b.id,nm);return b;}
 var nap=U('nappi',{tx:'Plus'},20,40,120,44,'Plus'),txt=U('nayta',{},20,100,240,40,'Pisteteksti');
 var m=KK.addBlock(P,'muisti',{});KK.setName(P,m.id,'Pisteet');KK.addNode(P,m.id,600,0);
 var k=KK.addBlock(P,'arvo',{v:'3'});KK.setName(P,k.id,'Kerroin');KK.addNode(P,k.id,600,120);
 txt.tx=KK.toIds(P,'Pisteet: {pisteet}');
 var te=KK.addBlock(P,'tee',{do:'lisaa',o:m.id});te.v=KK.kaavaToIds(P,'kerroin');var nt=KK.addNode(P,te.id,300,0);
 var nn=KK.addNode(P,nap.id,0,0);KK.addLink(P,nn.id,'e',nt.id,'e');
 KK.repair(P);APP.S.sel={t:'b',id:txt.id};APP.S.multi=[{t:'b',id:nap.id},{t:'b',id:txt.id}];APP.renderAll();return {nap:nap.id,txt:txt.id,te:te.id,m:m.id,k:k.id};})()"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in (1440,1280,390,320):
            mob=W<500;H=844 if mob else 900
            ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            pg.on('dialog',lambda d:asyncio.ensure_future(d.accept('Laskuri') if d.type=='prompt' else d.accept()))
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
            async def insp():
                if mob and not await pg.evaluate("document.body.classList.contains('inspopen')"):await tap('#mins')
            await pg.fill('#wname','Lähde');await tap('#wcreate')
            I=await pg.evaluate(SETUP)
            # 1 tallennus: kaksi näkymän palikkaa valittuna → paneelin nappi → otetaan mukaan toiminto ja muisti
            await insp();await tap('#insp [data-do="preset"]')
            sh=await pg.locator('#sheet').inner_text();assert 'TALLENNA PRESETIKSI' in sh.upper() and 'MUKANA 2' in sh.upper(),sh
            for nm in ('Lisää','Pisteet'):
                await tap('#sheet .prneed:has-text("%s") [data-prsadd]'%nm)
            sh=await pg.locator('#sheet').inner_text();assert 'MUKANA 4' in sh.upper() and 'Kerroin' in sh and 'Ota mukaan' in sh,sh
            await pg.fill('#prnm','Pistelaskuri')
            if W==390:await pg.screenshot(path='appiappi22_tallennus_%d.png'%W)
            await tap('#sheet [data-prsave]')
            pr=await pg.evaluate("APP.data.presetit.map(p=>[p.nm,Object.keys(p.b).length,Object.keys(p.ext).length,p.sis])");print(W,'1 tallennettu:',pr);assert pr==[['Pistelaskuri',4,1,False]]
            # 2 suosikki: Valitse suosikit → Painike ★ → Valmis
            await pal();await tap('#pal [data-favedit]')
            assert await pg.locator('#pal .favbar').count()==1
            await tap('#pal .chip[data-make*=\'"k":"nappi"\']')
            st=await pg.evaluate("[APP.data.suos.length,APP.data.suos[0].k,APP.data.suos[0].l,Object.keys(APP.P.b).length]");print(W,'2 suosikki:',st);assert st[:3]==[1,'nappi','Painike'] and st[3]==5,'ei luonut palikkaa'
            await tap('#pal .favbar [data-favedit]')
            await pal();h=await pg.locator('#pal').inner_text();assert 'SUOSIKIT' in h.upper() and 'PRESETIT' in h.upper(),h
            # 3 uusi projekti; suosikki ja presetti ovat siellä
            await tap('#projbtn');await pg.fill('#newpname','Kohde');await tap('#sheet [data-x="new"]')
            T=await pg.evaluate("""(function(){var P=APP.P,k=KK.addBlock(P,'arvo',{v:'10'});KK.setName(P,k.id,'Kerroin');KK.addNode(P,k.id,0,0);KK.repair(P);APP.renderAll();return {k:k.id,n:APP.P.name};})()""")
            assert T['n']=='Kohde'
            await pal();assert await pg.locator('#pal .pt-h:has-text("Suosikit") + .chips .chip[data-make*=\'"k":"nappi"\']').count()==1
            await tap('#pal .chip[data-preset]')
            sh=await pg.locator('#sheet').inner_text();assert 'KYTKE NÄMÄ' in sh.upper() and 'kerroin' in sh,sh
            if W==390:await pg.screenshot(path='appiappi22_kytke_%d.png'%W)
            r=await P(pg,"""(function(){var nap=B('Plus'),tx=B('Pisteteksti'),m=B('Pisteet'),te=Object.values(P.b).filter(b=>b.k==='tee')[0];var br=KK.brokenRefs(P);
              return {ui:[!!nap,!!tx,nap&&nap.v===APP.S.vw],sel:APP.S.multi.length,lk:P.lg.l.length,o:te.o===m.id,tx:tx.tx.indexOf('{#'+m.id+'}')>=0,br:br.map(x=>[P.b[x.id].k,x.nm]),k:te.v}; })()""")
            print(W,'3 liitetty:',r);assert r['ui']==[True,True,True] and r['sel']==2 and r['lk']==1 and r['o'] and r['tx'] and r['br']==[['tee','kerroin']] and r['k']!='{#%s}'%T['k']
            # 4 Kytke nämä → palikka → Viitevirheet → kohteen Kerroin; painallus lisää 10
            await tap('#sheet tr[data-goto]');await insp()
            gone=await P(pg,"KK.brokenRefs(P)[0].gone")
            await pg.select_option('#insp select[data-relink="%s"]'%gone,T['k']);await pg.wait_for_timeout(200)
            await pg.evaluate("(function(){var P=APP.P,n=Object.values(P.b).filter(b=>b.nm==='Plus')[0];KK.press(P,n.id,APP.ctx());KK.tick(P,APP.ctx());APP.renderAll();})()")
            v=await P(pg,"[E().val(B('Pisteet').id),E().text(B('Pisteteksti').id),KK.brokenRefs(P).length]");print(W,'4 kytketty:',v);assert v==[10,'Pisteet: 10',0]
            # 5 toinen liitäntä on itsenäinen, ja nimet eroavat
            await pal();await tap('#pal .chip[data-preset]')
            if await pg.locator('#sheetbg.show').count():await tap('#sheet [data-x="close"]')
            n=await P(pg,"[Object.values(P.b).filter(b=>b.k==='muisti').map(b=>b.nm).sort(),E().val(B('Pisteet').id)]");print(W,'5 toinen:',n);assert n==[['Pisteet','Pisteet 2'],10]
            # 6 hylly: nimeä ja varmuuskopio
            await pal();await tap('#pal [data-hylly]')
            await tap('#sheet [data-prh="ren"]');assert await pg.evaluate("APP.data.presetit[0].nm")=='Laskuri'
            bk=await pg.evaluate("(function(){var d=JSON.parse(JSON.stringify(APP.data));return [d.presetit.length,d.suos.length];})()");assert bk==[1,1]
            await tap('#sheet [data-prh="del"]');assert await pg.evaluate("APP.data.presetit.length")==0
            await tap('#sheet [data-x="close"]')
            # 7 tuonti varmuuskopiosta palauttaa presetin (ei tuplana)
            raw=json.dumps({'presetit':[{'id':'prX','nm':'Tuotu','b':{},'n':[],'l':[]}],'suos':[{'k':'nappi','p':{}}]})
            await pg.evaluate("(t)=>{var f=new File([t],'v.json');var dt=new DataTransfer();dt.items.add(f);var i=document.querySelector('#filein');i.files=dt.files;i.dispatchEvent(new Event('change'));}",raw);await pg.wait_for_timeout(300)
            im=await pg.evaluate("[APP.data.presetit.map(p=>p.nm),APP.data.suos.length]");print(W,'7 tuonti:',im);assert im==[['Tuotu'],1]
            await pal();assert 'Tuotu' in await pg.locator('#pal').inner_text()
            if W in (1440,390):await pg.screenshot(path='appiappi22_paletti_%d.png'%W)
            print(W,'errs',errs);await ctx.close()
        await b.close()
asyncio.run(main())
