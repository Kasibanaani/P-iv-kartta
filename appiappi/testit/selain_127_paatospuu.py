# Appi-appi 88 (F44, suunnitelma 28): päätöspuu selaimessa. Pikaluonti sisennetystä tekstistä, Alue allekkain,
# alussa näkyvät (silmukka ei piilota juurta), siirtymät logiikassa (piste ◦ → toisen päälle, ↔, poisto), Tab ja Enter,
# käyttötilan eteneminen ja Takaisin/Alkuun, kysymysikkuna, sisältö joukosta -valinta, 390 px ilman vaakavieritystä.
# Kuvakaappaukset paatospuu_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
PUU="Object.values(P.b).find(b=>b.k==='ikkuna'&&b.m==='puu')"
async def nappi(pg,tx):return await P(pg,"Object.values(P.b).find(b=>b.k==='nappi'&&b.tx===%r).id"%tx)
async def nakyvat(pg):
    return await pg.evaluate("()=>[...document.querySelectorAll('#uels .ue.k-nappi')].filter(e=>getComputedStyle(e).display!=='none'&&e.offsetParent).map(e=>[e.innerText.trim(),Math.round(e.getBoundingClientRect().top)]).sort((a,b)=>a[1]-b[1]).map(a=>a[0])")
async def luo(pg,W):
    await pg.fill('#wname','Puu');await pg.click('#wcreate');await pg.wait_for_timeout(150)
    await pg.click('#pal [data-quick="puu"]');await pg.wait_for_timeout(200)
    await pg.fill('#qn','Mitä teen');await pg.fill('#qo','Väsynyt\n  Lepää\n  Kävely\nPirteä\n  Treeni\n    -> Väsynyt')
    await pg.click('[data-pqmake]');await pg.wait_for_timeout(300)
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await luo(pg,W)
            st=await P(pg,"(function(){var b=%s,wn=KK.puuWn(P,b.id),al=P.b[b.pual];return [b.nm,(b.pus||[]).length,(b.pusa||[]).length,KK.puuNakyvat(P,b.id).map(id=>P.b[KK.nodeOf(P,id).p].tx),al.k,al.as,al.asl];})()"%PUU)
            print(W,'1 pikaluonti:',st);assert st==['Mitä teen',4,2,['Väsynyt','Pirteä'],'alue','pino','sovita']
            ins=await pg.inner_text('#insp');assert 'Alussa näkyvät' in ins and 'Päätöspuu' in ins
            # alussa näkyvät: Pirteä pois ja takaisin
            await pg.click('#insp [data-pusa]:has-text("Pirteä")');await pg.wait_for_timeout(150)
            a=await P(pg,"KK.puuNakyvat(P,%s.id).length"%PUU);await pg.click('#insp [data-pusa]:has-text("Pirteä")');await pg.wait_for_timeout(150)
            a2=await P(pg,"KK.puuNakyvat(P,%s.id).length"%PUU);print(W,'2 alussa näkyvät vaihto:',a,a2);assert a==1 and a2==2
            await pg.screenshot(path='paatospuu_paneeli_%d.png'%W)
            # logiikka: neljä siirtymää piirtyy
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250);await pg.click('.zoomc [data-z="fit"]');await pg.wait_for_timeout(400)
            hd=await pg.inner_text('#lworld .lw.m-puu .wh');n=await pg.locator('#lsvg path.lk.pu').count();print(W,'3 logiikka:',hd.split('\n')[0],n);assert 'PÄÄTÖSPUU' in hd and n==4
            await pg.screenshot(path='paatospuu_logiikka_%d.png'%W)
            # siirtymä pisteestä: Lepää → Treeni
            nid=lambda tx:P(pg,"P.lg.n.find(n=>P.b[n.p].tx===%r).id"%tx)
            le,tr=await nid('Lepää'),await nid('Treeni')
            pc=await keskus(pg,'#lworld [data-nid="%s"] .pup'%le);tc=await keskus(pg,'#lworld [data-nid="%s"]'%tr)
            await veda(pg,pc,tc);await pg.wait_for_timeout(250)
            e=await P(pg,"%s.pus.filter(e=>e.f===%r&&e.t===%r).length"%(PUU,le,tr));print(W,'4 uusi siirtymä:',e);assert e==1
            assert await pg.locator('#lsvg path.lk.pu').count()==5
            # napautus siirtymään: ↔ ja poisto
            i=await P(pg,"%s.pus.findIndex(e=>e.f===%r&&e.t===%r)"%(PUU,le,tr));bid=await P(pg,PUU+".id")
            hit='#lsvg2 [data-pul="%s|%d"]'%(bid,i)
            await pg.dispatch_event(hit,'pointerdown',{'button':0,'clientX':int(tc[0])-30,'clientY':int(tc[1])-30,'pointerId':1,'isPrimary':True});await pg.wait_for_timeout(200)
            await pg.click('#menu :text("Molempiin suuntiin")');await pg.wait_for_timeout(200)
            kk=await P(pg,"%s.pus[%d].kk"%(PUU,i));mk=await pg.locator('#lsvg path.lk.pu[marker-start]').count();print(W,'5 molempiin:',kk,mk);assert kk is True and mk==1
            await pg.dispatch_event(hit,'pointerdown',{'button':0,'clientX':int(tc[0])-30,'clientY':int(tc[1])-30,'pointerId':1,'isPrimary':True});await pg.wait_for_timeout(200)
            await pg.click('#menu :text("Poista siirtymä")');await pg.wait_for_timeout(200)
            assert await P(pg,PUU+".pus.length")==4
            # Tab = seuraava taso, Enter = rinnakkainen, Esc lopettaa (tyhjä uusi poistuu)
            pi=await nid('Pirteä');await pg.click('#lworld [data-nid="%s"]'%pi,position={'x':40,'y':12});await pg.wait_for_timeout(150)
            await pg.keyboard.press('Tab');await pg.wait_for_timeout(250);assert await pg.locator('#puin').count()==1
            await pg.keyboard.type('Juoksu');await pg.keyboard.press('Enter');await pg.wait_for_timeout(250)
            await pg.keyboard.type('Pyöräily');await pg.keyboard.press('Enter');await pg.wait_for_timeout(250);await pg.keyboard.press('Escape');await pg.wait_for_timeout(250)
            r=await P(pg,"(function(){var b=%s;return [Object.values(P.b).filter(o=>o.k==='nappi').length,KK.puuSeur(KK.puuSy(P,b,KK.puuWn(P,b.id)),%r).map(id=>P.b[KK.nodeOf(P,id).p].tx).sort()];})()"%(PUU,pi))
            print(W,'6 Tab/Enter:',r);assert r==[9,['Juoksu','Pyöräily','Treeni']]
            # käyttötila: allekkain, napautus etenee, Takaisin, silmukka, Alkuun
            await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(200);await pg.click('#lockbtn');await pg.wait_for_timeout(400)
            v0=await nakyvat(pg);print(W,'7 alussa:',v0);assert v0==['Väsynyt','Pirteä']
            al=await P(pg,"(function(){var a=P.b[%s.pual];return a.y;})()"%PUU)
            vy=await pg.evaluate("(id)=>document.querySelector('#uels [data-id=\"'+id+'\"]').getBoundingClientRect().top",await nappi(pg,'Väsynyt'))
            py=await pg.evaluate("(id)=>document.querySelector('#uels [data-id=\"'+id+'\"]').getBoundingClientRect().top",await nappi(pg,'Pirteä'))
            print(W,'8 Pirteä heti Väsyneen alla:',round(py-vy));assert 50<=py-vy<=58
            await pg.click('#uels [data-id="%s"]'%await nappi(pg,'Pirteä'));await pg.wait_for_timeout(300)
            v1=await nakyvat(pg);print(W,'9 Pirteä:',v1);assert sorted(v1[:3])==['Juoksu','Pyöräily','Treeni'] and v1[3:]==['↩ Takaisin','↺ Alkuun']
            await pg.screenshot(path='paatospuu_kaytto_%d.png'%W)
            await pg.click('#uels [data-id="%s"]'%await nappi(pg,'Treeni'));await pg.wait_for_timeout(300)
            v2=await nakyvat(pg);pl=await P(pg,"E().val(%s.id,'pl')"%PUU);print(W,'10 silmukka:',v2,pl);assert v2[0]=='Väsynyt' and pl=='Pirteä › Treeni'
            await pg.click('#uels [data-id="%s"]'%await nappi(pg,'↩ Takaisin'));await pg.wait_for_timeout(300)
            v3=await nakyvat(pg);print(W,'11 takaisin:',v3);assert 'Treeni' in v3 and 'Väsynyt' not in v3
            await pg.click('#uels [data-id="%s"]'%await nappi(pg,'↺ Alkuun'));await pg.wait_for_timeout(300)
            v4=await nakyvat(pg);print(W,'12 alkuun:',v4);assert v4==['Väsynyt','Pirteä']
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            # kysymysikkuna paneelista ja sisältö joukosta -valinta
            pw=await P(pg,"KK.puuWn(P,%s.id).id"%PUU);await pg.evaluate("(id)=>{APP.S.sel={t:'n',id:id};APP.renderAll();}",pw);await pg.wait_for_timeout(200)
            await pg.click('#insp [data-pua="kys1"]');await pg.wait_for_timeout(300)
            q=await P(pg,"(function(){var w=Object.values(P.b).filter(b=>b.k==='ikkuna'&&b.m==='one')[0],n=KK.nodeOf(P,KK.puuWn(P,w.id).id);return [w.pakota,P.lg.n.filter(o=>o.g===n.id).length,KK.puuWn(P,%s.id).id===n.g];})()"%PUU)
            print(W,'13 kysymys:',q);assert q==[True,4,True]
            await pg.evaluate("()=>{var P=APP.P,v=P.views[0].id;['Uinti','Sauna'].forEach((t,i)=>{var o=KK.addBlock(P,'ruutu',{v:v,tx:t,x:900,y:100+i*50});KK.setTunnus(P,o.id,'#vaihtoehdot');});APP.renderAll();}");await pg.wait_for_timeout(200)
            await pg.select_option('#insp select[data-k="sj"]',label='#vaihtoehdot');await pg.wait_for_timeout(200)
            j=await P(pg,"(function(){var w=Object.values(P.b).filter(b=>b.k==='ikkuna'&&b.m==='one')[0];return [!!w.sj,E().members(w.id).filter(m=>m.jk).length,document.querySelectorAll('#lworld .wjk').length];})()")
            print(W,'13b sisältö joukosta:',j);assert j[0] and j[1]==2
            vw=await pg.evaluate("[document.documentElement.scrollWidth,innerWidth]");assert vw[0]<=vw[1]
            print('errs',errs);assert not errs;await b.close()
        # kapea 390: käyttötilan lista mahtuu leveyteen
        # (rakennetaan koneella, käytetään kapealla ruudulla)
        b,pg,errs=await avaa(p,1440,900);await luo(pg,1440)
        await pg.evaluate("APP.S.sel=null;APP.renderAll()");await pg.click('#lockbtn');await pg.set_viewport_size({'width':390,'height':844});await pg.wait_for_timeout(400)
        v=await nakyvat(pg);vw=await pg.evaluate("[document.documentElement.scrollWidth,innerWidth]");print('390 14:',v,vw)
        assert v==['Väsynyt','Pirteä'] and vw[0]<=vw[1]
        await pg.screenshot(path='paatospuu_390.png');print('errs',errs);assert not errs;await b.close()
asyncio.run(main())
