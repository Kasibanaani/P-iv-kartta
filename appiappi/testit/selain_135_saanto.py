# Jono 40 (suunnitelma 30): Sääntö selaimessa. Yleispalikkaan kirjoitettu jos-sääntö: laji Sääntö ♛, palikassa kohde,
# tila kirjoitusosassa (ei voimassa / voimassa), kohteen paneelissa ♛-rivi ja Siirry, toinen sääntö samaan kohteeseen näkyy
# ristiriitana, virheellinen kirjoitus punaisena. kun-sääntö saa kohdan silloin. Tietokone 1440 ja 1280. Kuvat saanto_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
async def kirjoita(pg,t):
    await pg.fill('#yedit textarea',t);await pg.wait_for_timeout(150)
async def uusiYl(pg,x,y):
    r=await pg.evaluate("()=>{var e=document.querySelector('#lvp').getBoundingClientRect();return [e.left+e.width*%s,e.top+e.height*%s];}"%(x,y))
    await paletti(pg,'Yleispalikka',r[0],r[1]);await pg.wait_for_timeout(150)
    if not await pg.evaluate("()=>!!document.querySelector('#yedit')"):
        await pg.mouse.dblclick(r[0],r[1]);await pg.wait_for_timeout(200)
async def aseta(pg,v):
    await pg.evaluate("(v)=>{var P=APP.P,m=Object.values(P.b).filter(b=>b.nm==='Määrä')[0];KK.setVal(P,m.id,v,APP.ctx());KK.tick(P,APP.ctx());APP.renderAll();}",v);await pg.wait_for_timeout(150)
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Sääntö');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            await pg.evaluate("(function(){var P=APP.P,v=P.views[0].id;var l=KK.addBlock(P,'muoto',{v:v,laji:'laatikko',x:40,y:40,w:80,h:60,hue:0});KK.setName(P,l.id,'Lamppu');"
                              "var m=KK.addBlock(P,'muisti',{v:'0'});KK.setName(P,m.id,'Määrä');KK.addNode(P,m.id,40,40);KK.repair(P);APP.renderAll();})()")
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            await uusiYl(pg,0.6,0.4)
            await kirjoita(pg,'jos @määrä > 5 niin @lamppu.väri = 3')
            ls=await pg.evaluate("()=>[...document.querySelectorAll('#yedit [data-yty]')].map(o=>o.getAttribute('data-yty'))")
            res=await pg.inner_text('#yres');bad=await pg.evaluate("()=>document.querySelector('#yedit textarea').classList.contains('bad')")
            print(W,'1 sääntö:',ls,res,bad);assert 'saanto' in ls and 'Ei voimassa' in res and not bad,(ls,res)
            await pg.screenshot(path='saanto_auki_%d.png'%W)
            await pg.focus('#yedit textarea');await pg.keyboard.press('Enter');await pg.wait_for_timeout(200)
            s=await P(pg,"(function(){var b=Object.values(P.b).filter(b=>b.yl)[0];return [b.nm,KK.ylLaji(P,b),b.sa&&b.sa.p];})()")
            lab=await pg.inner_text('#lworld .ln.yl');print(W,'2 tallennus:',s,repr(lab));assert s==['Sääntö','saanto','o_vari'] and '→ Lamppu.väri' in lab,(s,lab)
            # 3 voimassa: paneelin tila ja kohteen väri
            await aseta(pg,7);c=await keskus(pg,'#lworld .ln.yl');await pg.mouse.click(c[0],c[1]);await pg.wait_for_timeout(200)
            pr=await pg.inner_text('#ylres');vr=await P(pg,"E().omi(B('Lamppu').id,'väri')");print(W,'3 voimassa:',pr,vr);assert 'Voimassa' in pr and vr==3,(pr,vr)
            # 4 toinen sääntö samaan kohteeseen: ristiriita näkyy
            await uusiYl(pg,0.35,0.85);await kirjoita(pg,'jos @määrä > 1 niin @lamppu.väri = 5');res=await pg.inner_text('#yres')
            print(W,'4 ristiriita:',res);assert 'Ristiriita' in res,res
            await pg.focus('#yedit textarea');await pg.keyboard.press('Enter');await pg.wait_for_timeout(200)
            # 5 kohteen paneeli: ♛-rivit ja Siirry
            await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(250)
            c=await keskus(pg,'#uels [data-id="%s"]'%(await P(pg,"B('Lamppu').id")));await pg.mouse.click(c[0],c[1]);await pg.wait_for_timeout(250)
            ins=await pg.inner_text('#insp');print(W,'5 kohde:',[x for x in ins.split('\n') if '♛' in x or 'Voimassa' in x or 'Ristiriita' in x][:4])
            assert '♛ Sääntö' in ins and 'Voimassa' in ins and 'Ristiriita' in ins,ins[:600]
            await pg.screenshot(path='saanto_kohde_%d.png'%W)
            await pg.click('#insp [data-jgo]');await pg.wait_for_timeout(250)
            t=await pg.evaluate("()=>document.querySelector('#tabs .on')&&document.querySelector('#tabs .on').getAttribute('data-t')");print(W,'6 siirry:',t)
            # 7 virheellinen kirjoitus punaisena, kun-sääntö saa silloin-kohdan
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(200)
            await uusiYl(pg,0.8,0.85);await kirjoita(pg,'jos @määrä > 5 niin @lamppu.lentää = 3')
            bad=await pg.evaluate("()=>document.querySelector('#yedit textarea').classList.contains('bad')");res=await pg.inner_text('#yres');print(W,'7 virhe:',bad,res);assert bad and 'ei ole ominaisuus' in res
            await kirjoita(pg,'kun @määrä > 8');await pg.focus('#yedit textarea');await pg.keyboard.press('Enter');await pg.wait_for_timeout(200)
            ok=await P(pg,"(function(){var b=Object.values(P.b).filter(b=>b.yl&&b.sa&&b.sa.kerta)[0];return !!b&&KK.ports(b).outs.some(x=>x.p==='e');})()");print(W,'8 kun:',ok);assert ok
            print(W,'virheet:',errs);assert not errs,errs
            await b.close()
asyncio.run(main())
