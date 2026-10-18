# Appi-appi 32 (jonon 1j, kartoituksen 2 M1, M2, T1, T2): savutesti, joka avaa jokaisen K-lajin paneelin 1440 ja 390 px.
# Ei sivuvirheitä; Miksi? näkyy paneelissa aina, kun moottorilla on selitys (ellei se vain toista otsikon vihjettä);
# VALITSE-palikan vihje on oma (ei Toiminto Valitse -vihje). Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
# Kartoituksen 2 M1: lajit, joiden selitys oli kirjoitettu mutta piilossa. Ne näkyvät nyt oletusasetuksilla.
PIILOSSA=['satu','muutos','kello','liike','kayra','tatti','alue','reitti','kerros','kamera','odota','monihaara','arpa','toista','ktulos','ilmesty','kuva','anim','nvaihto','tee','trivi','joukko']
# Lopeta ketju: selitys on sana sanalta sama kuin otsikon vihje, joten Miksi? jää pois (toisto karsitaan).
TOISTO=['lopeta']
SETUP="""(function(){var P=APP.P,vw=P.views[0].id,ids={},y=60;
 Object.keys(KK.K).forEach(function(k){var b=KK.addBlock(P,k,KK.K[k].g==='ui'?{v:vw}:{});if(KK.K[k].g!=='ui'){KK.addNode(P,b.id,20,y);y+=90;}ids[k]=b.id;});
 KK.repair(P);APP.renderAll();return ids;})()"""
PANEL="""(function(id){APP.S.sel={t:'b',id:id};APP.S.multi=[];APP.renderAll();
 var ins=document.querySelector('#insp'),ws=document.querySelector('#whysec'),E=APP.ev(),t=KK.why(APP.P,E,id,4),hi=document.querySelector('#insp .khint');
 return {ok:!!ins&&ins.textContent.length>0,why:!!(ws&&ws.querySelector('.why')),txt:t?t.txt:'',wtx:ws&&ws.querySelector('.wtx')?ws.querySelector('.wtx').textContent:'',hint:hi?hi.textContent:''};})"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in (1440,390):
            mob=W<500;H=844 if mob else 900
            ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Savu');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            ids=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            nayt=[];puuttuu=[]
            for tab in ('nakyma','logiikka'):
                if mob:await pg.tap('#tabs [data-t="%s"]'%tab)
                else:await pg.click('#tabs [data-t="%s"]'%tab)
                await pg.wait_for_timeout(150)
                for k,i in ids.items():
                    r=await pg.evaluate(PANEL,i)
                    assert r['ok'],(W,tab,k,'paneeli tyhjä')
                    if r['why']:assert r['wtx']==r['txt'],(k,r)
                    if r['why'] and k not in nayt:nayt.append(k)
                    assert not errs,(W,tab,k,errs)
                    if tab=='logiikka' and k in PIILOSSA and not r['why']:puuttuu.append((k,r['txt'],r['hint']))
                    if tab=='logiikka' and k in TOISTO:assert not r['why'] and r['txt'],(W,k,r)
                    if tab=='logiikka' and k=='valitse':
                        print(W,'VALITSE-vihje:',r['hint']);assert 'jos (' in r['hint'] and 'valituksi' not in r['hint'],r['hint']
            print(W,'puuttuu',puuttuu);assert not puuttuu,puuttuu
            print(W,'paneeleja',len(ids),'× 2 välilehteä; Miksi? näkyy:',len(nayt),sorted(nayt))
            # Toiminto Valitse pitää oman vihjeensä.
            await pg.evaluate("(function(id){APP.P.b[id].do='valitse';APP.S.sel={t:'b',id:id};APP.renderAll();})",ids['tee']);await pg.wait_for_timeout(100)
            h=await pg.evaluate("(document.querySelector('#insp .khint')||{}).textContent||''");print(W,'Toiminto Valitse -vihje:',h);assert 'valituksi' in h,h
            await pg.evaluate("(function(id){APP.S.sel={t:'b',id:id};APP.renderAll();})",ids['kayra']);await pg.wait_for_timeout(100)
            await pg.screenshot(path='appiappi32_miksi_kayra_%d.png'%W)
            print(W,'errs',errs);assert not errs,errs
            await ctx.close()
        await b.close()
asyncio.run(main())
