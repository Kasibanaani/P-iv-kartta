# Jono 20b (F35 vaihe E2, 21.10.2026): paneelin osio Ilme (Tavallinen / Piirros), Painikkeen tilakohtaiset piirrokset (perus,
# painettu kopiona perusta, valittu kirjastosta), Teksti näkyy, Myös yleinen painallus, valittu-tila käytössä, Aseta ilme vaihtaa
# piirroksen, Säätimen kisko, Tavallinen ja Kumoa. Tietokone 1440 ja 1280. Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
NAP="Object.values(APP.P.b).filter(x=>x.nm==='Hyppää')[0]"
async def ue(pg):return await pg.evaluate("(()=>{var b=%s,e=document.querySelector('#uels .ue[data-id=\"'+b.id+'\"]');return [e.className,e.style.getPropertyValue('--pxa').slice(0,30),e.style.getPropertyValue('--pxp').slice(0,30)];})()"%NAP)
async def url(pg,id):return await pg.evaluate("'url(\"'+APP.px.url('%s')+'\")'"%id)
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Ilme');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            await pg.evaluate("""(()=>{var P=APP.P,v=P.views[0].id,n=KK.addBlock(P,'nappi',{v:v,tx:'Hyppää',nm:'Hyppää'});n.nm='Hyppää';n.x=40;n.y=40;n.w=160;n.h=64;
              var s=KK.addBlock(P,'saadin',{v:v});s.nm='Voima';s.x=40;s.y=200;s.w=240;s.h=80;KK.repair(P);APP.S.sel={t:'b',id:n.id};APP.renderAll();})()""");await pg.wait_for_timeout(150)
            assert await pg.locator('#insp [data-ilm="piirros"]').count()==1,'osio Ilme'
            await pg.click('#insp [data-ilm="piirros"]');await pg.wait_for_timeout(100)
            assert await P(pg,"B('Hyppää').il")=={'t':{}}
            assert [await pg.locator('#insp [data-ilnew="%s"]'%t).count() for t in ('perus','painettu','valittu','harmaa')]==[1,1,1,1]
            await pg.click('#insp [data-ilnew="perus"]');await pg.wait_for_timeout(150);assert await pg.locator('#pxcv').count()==1
            x=await P(pg,"[B('Hyppää').il.t.perus,P.px[B('Hyppää').il.t.perus].w,P.px[B('Hyppää').il.t.perus].h,P.px[B('Hyppää').il.t.perus].n]");print(W,'perus',x)
            assert x==['d1',32,16,'Hyppää: perus'],x
            r=await pg.evaluate("(()=>{var c=document.querySelector('#pxcv').getBoundingClientRect();return [c.left+c.width/64,c.top+c.height/32];})()");await pg.mouse.click(r[0],r[1])
            await pg.click('#sheet [data-x="close"]');await pg.wait_for_timeout(150)
            c=await ue(pg);assert 'pxil' in c[0] and 'pxbg' in c[0] and c[1]==(await url(pg,'d1'))[:30],c
            # Painettu: kopio perusta, ei yleistä painallusta oletuksena
            await pg.click('#insp [data-ilnew="painettu"]');await pg.wait_for_timeout(150);await pg.click('#sheet [data-x="close"]');await pg.wait_for_timeout(100)
            assert await P(pg,"[B('Hyppää').il.t.painettu,P.px.d2.d===P.px.d1.d]")==['d2',True]
            c=await ue(pg);assert 'pxnoyp' in c[0] and c[2]==(await url(pg,'d2'))[:30],c
            await pg.locator('#insp input[data-k="ilyp"]').check();await pg.wait_for_timeout(100);assert await P(pg,"B('Hyppää').il.yp")==True;c=await ue(pg);assert 'pxnoyp' not in c[0]
            await pg.locator('#insp input[data-k="ilnt"]').uncheck();await pg.wait_for_timeout(100);assert await P(pg,"B('Hyppää').il.nt")==True;c=await ue(pg);assert 'pxnt' in c[0]
            # Valittu kirjastosta (toinen piirros), käytössä painallus valitsee
            await pg.select_option('#insp select[data-ilsel="valittu"]','d2');await pg.wait_for_timeout(100);assert await P(pg,"B('Hyppää').il.t.valittu")=='d2'
            assert await pg.locator('#insp code',has_text='.ilme').count()>=1
            await pg.click('#lockbtn');await pg.wait_for_timeout(200)
            c=await ue(pg);assert c[1]==(await url(pg,'d1'))[:30],c
            bx=await keskus(pg,'#uels .ue.k-nappi');await pg.mouse.click(bx[0],bx[1]);await pg.wait_for_timeout(200)
            c=await ue(pg);print(W,'valittu',c[1]);assert c[1]==(await url(pg,'d2'))[:30],c
            # Aseta ilme = "Hyppää: painettu" toisesta painikkeesta
            await pg.click('#lockbtn');await pg.wait_for_timeout(150)
            await pg.evaluate("""(()=>{var P=APP.P,v=P.views[0].id,n=%s;n.beh='kerta';var q=KK.addBlock(P,'nappi',{v:v});q.x=300;q.y=40;var a=KK.addNode(P,q.id,0,0),t=KK.addBlock(P,'tee',{do:'aseta',o:n.id,om:'ilme',v:'Hyppää: painettu'}),tn=KK.addNode(P,t.id,300,0);
              KK.addLink(P,a.id,'e',tn.id,'e');KK.repair(P);APP.renderAll();window._q=q.id;})()"""%NAP)
            await pg.click('#lockbtn');await pg.wait_for_timeout(200);c=await ue(pg);assert c[1]==(await url(pg,'d1'))[:30],c
            await pg.evaluate("KK.fire(APP.P,window._q,'e',{now:()=>new Date(),toast:()=>{},nav:()=>{}});APP.renderAll()");await pg.wait_for_timeout(150)
            c=await ue(pg);print(W,'aseta ilme',c[1]);assert c[1]==(await url(pg,'d2'))[:30],c
            await pg.click('#lockbtn');await pg.wait_for_timeout(150)
            # Säädin: kisko kirjastosta
            await pg.evaluate("(()=>{var s=Object.values(APP.P.b).filter(x=>x.nm==='Voima')[0];APP.S.sel={t:'b',id:s.id};APP.renderAll();})()");await pg.wait_for_timeout(100)
            await pg.click('#insp [data-ilm="piirros"]');await pg.wait_for_timeout(100)
            assert [await pg.locator('#insp [data-ilnew="%s"]'%t).count() for t in ('kisko','tayto','nuppi','perus')]==[1,1,1,0]
            await pg.select_option('#insp select[data-ilsel="kisko"]','d1');await pg.wait_for_timeout(100)
            cs=await pg.evaluate("document.querySelector('#uels .ue.k-saadin').className");assert 'pxkk' in cs and 'pxbg' not in cs,cs
            # Tavallinen ja Kumoa
            await pg.click('#insp [data-ilm=""]');await pg.wait_for_timeout(100);assert await P(pg,"'il' in B('Voima')")==False
            cs=await pg.evaluate("document.querySelector('#uels .ue.k-saadin').className");assert 'pxil' not in cs and 'pxkk' not in cs,cs
            await pg.keyboard.press('Control+z');await pg.wait_for_timeout(150);assert await P(pg,"B('Voima').il.t.kisko")=='d1'
            print(W,'ok','errs',errs);assert not errs
            await b.close()
asyncio.run(main())
