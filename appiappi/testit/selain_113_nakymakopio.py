# Jonon 25: (a) valitun näkymäpalikan ⇢-nappi = Näytä logiikassa, Rinnakkain-tilassa veto suoraan logiikkaan; Palikat-listassa
# valittu ja juuri tehdyt ylimpänä. (b) ⌘C/⌘V näkymässä ja ⌘D monivalinnalle: uudet nimet, viittaukset kopioitujen välillä
# uusiin. (c) ”Nappi 1” → ”Nappi 2”. 1440 ja 1280 px; 390 px savutestinä. Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0].id;
 var n=KK.addBlock(P,'nappi',{v:v});KK.setName(P,n.id,'Nappi 1');n.x=60;n.y=80;n.w=140;n.h=44;
 var t=KK.addBlock(P,'teksti',{v:v,t:'Tila: {#'+n.id+'.tila}'});KK.setName(P,t.id,'Otsikko');t.x=60;t.y=160;t.w=200;t.h=40;
 var m=KK.addBlock(P,'muisti',{});KK.setName(P,m.id,'Aakkoset');KK.addNode(P,m.id,600,600);
 P.cam={};KK.repair(P);APP.S.tab='nakyma';APP.renderAll();return {n:n.id,t:t.id};})()"""
UI="Object.keys(APP.P.b).filter(function(i){return APP.P.b[i].v;}).length"
async def main():
    async with async_playwright() as p:
        for W in (1440,1280,390):
            b,pg,errs=await avaa(p,W,900 if W>500 else 844)
            await pg.fill('#wname','Kopio');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(200)
            if W<500:
                await pg.evaluate("APP.S.sel={t:'b',id:'%s'};APP.S.multi=[{t:'b',id:'%s'},{t:'b',id:'%s'}];APP.renderAll()"%(I['t'],I['n'],I['t']))
                await pg.keyboard.press('Control+c');await pg.keyboard.press('Control+v');await pg.wait_for_timeout(150)
                assert await pg.evaluate(UI)==4
                print(W,'ok','errs',errs);await b.close();continue
            # (b) monivalinta, ⌘C ja ⌘V
            c=await keskus(pg,'#uels .ue[data-id="%s"]'%I['n']);await pg.mouse.click(*c)
            c=await keskus(pg,'#uels .ue[data-id="%s"]'%I['t']);await pg.keyboard.down('Shift');await pg.mouse.click(*c);await pg.keyboard.up('Shift')
            assert await pg.evaluate("APP.S.multi.length")==2
            await pg.keyboard.press('Control+c');await pg.keyboard.press('Control+v');await pg.wait_for_timeout(200)
            r=await pg.evaluate("""(function(){var P=APP.P,s=APP.S.multi.map(function(m){return P.b[m.id];});
              var n=s.filter(function(b){return b.k==='nappi';})[0],t=s.filter(function(b){return b.k==='teksti';})[0];
              return {len:s.length,nn:n.nm,nv:n.vt,tn:t.nm,ok:t.t==='Tila: {#'+n.id+'.tila}',dx:n.x-%d,nodes:KK.nodesOfBlock(P,n.id).length};})()"""%60)
            assert r=={'len':2,'nn':'Nappi 2','nv':'nappi2','tn':'Otsikko 2','ok':True,'dx':20,'nodes':0},r
            # ⌘D monivalinnalle: kaksi lisää, Kumoa poistaa ne
            await pg.keyboard.press('Control+d');await pg.wait_for_timeout(150)
            assert await pg.evaluate(UI)==6
            assert await pg.evaluate("APP.S.multi.map(function(m){return APP.P.b[m.id].nm;}).sort().join('|')")=='Nappi 3|Otsikko 3'
            await pg.keyboard.press('Control+z');await pg.wait_for_timeout(150);assert await pg.evaluate(UI)==4
            # (a) ⇢-nappi valitulla palikalla: päällimmäisenä, napautus vie logiikkaan esiintymän kohdalle
            await pg.keyboard.press('Escape');c=await pg.evaluate("(function(){var r=document.querySelector('#uels .ue[data-id=\"%s\"]').getBoundingClientRect();return [r.left+8,r.top+8];})()"%I['n']);await pg.mouse.click(*c);await pg.wait_for_timeout(100)
            q=await keskus(pg,'#uels .ue[data-id="%s"] .tolg'%I['n'])
            top=await pg.evaluate("(function(){var e=document.elementFromPoint(%f,%f);var t=document.querySelector('#uels .ue.sel .tolg');return [e&&e.className,e&&e.tagName,!!t,t&&getComputedStyle(t).display,%f,%f];})()"%(q[0],q[1],q[0],q[1]));assert top[0]=="tolg",top
            await pg.screenshot(path='nakymakopio_%d.png'%W)
            await pg.mouse.click(*q);await pg.wait_for_timeout(250)
            r=await pg.evaluate("(function(){var s=APP.S.sel,n=s&&KK.nodeOf(APP.P,s.id);return [APP.S.tab,s&&s.t,n&&n.p];})()")
            assert r==['logiikka','n',I['n']],r
            # Palikat-listassa valittu ylimpänä, sitten juuri tehdyt; muisti alempana
            await pg.evaluate("APP.renderAll()");await pg.wait_for_timeout(100)
            l=await pg.evaluate("Array.prototype.map.call(document.querySelectorAll('#plist [data-inst]'),function(e){return e.querySelector('.pn').textContent;})")
            assert l[0]=='Nappi 1' and l[1]=='Otsikko 2' and l[2]=='Nappi 2' and 'Aakkoset' in l and l.index('Aakkoset')>l.index('Otsikko'),(l,await pg.evaluate('Object.values(APP.P.b).map(function(b){return b.nm+":"+b.k;})'))
            # Rinnakkain: veto ⇢-napista logiikan puolelle = esiintymä pudotuskohtaan
            await pg.evaluate("APP.S.tab='molemmat';APP.S.sel={t:'b',id:'%s'};APP.S.multi=[];APP.renderAll()"%I['t']);await pg.wait_for_timeout(300)
            q=await keskus(pg,'#uels .ue[data-id="%s"] .tolg'%I['t']);L=await pg.evaluate("(function(){var r=document.querySelector('#lvp').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];})()")
            await veda(pg,q,L);await pg.wait_for_timeout(250)
            r=await pg.evaluate("(function(){var ns=KK.nodesOfBlock(APP.P,'%s');if(!ns.length)return null;var e=document.querySelector('#lels .ln[data-nid=\"'+ns[0].id+'\"]').getBoundingClientRect();return [ns.length,e.left+60,e.top+17];})()"%I['t'])
            assert r and r[0]==1 and abs(r[1]-L[0])<40 and abs(r[2]-L[1])<40,(r,L)
            # Rinnakkain: viimeisin kopio ratkaisee, mihin ⌘V liittää
            await pg.evaluate("APP.S.sel={t:'b',id:'%s'};APP.S.multi=[];APP.renderAll()"%I['n']);await pg.keyboard.press('Control+c');await pg.keyboard.press('Control+v');await pg.wait_for_timeout(150)
            assert await pg.evaluate(UI)==5
            print(W,'ok','errs',errs);await b.close()
asyncio.run(main())
