# Jonon 13: kun palikan pistokkeet ovat piilossa, teksti rivittyy enintään kahdelle riville ja palikka saa olla
# leveämpi (enintään 320 px). Pistokkeet näkyvissä: yksi rivi, enintään 240 px, kolme pistettä. Ketjussa, ikkunassa
# ja venytetyssä Kaavassa ennallaan. 1440 ja 1280 px; 390 px vain savutestinä. Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
PITKA='Tämä on hyvin pitkä palikan nimi, joka ei mahdu yhdelle riville eikä oikeastaan kahdellekaan, vaan katkeaa lopulta kolmeen pisteeseen'
SETUP="""(function(){var P=APP.P;var vw=P.views[0].id;
 function nd(k,o,nm,x,y){var b=KK.addBlock(P,k,o||{});if(nm)KK.setName(P,b.id,nm);var n=KK.addNode(P,b.id,x,y);return {b:b.id,n:n.id};}
 var t=nd('nayta',{v:vw,tx:'Hei'},'%s',40,40);
 var s=nd('nayta',{v:vw,tx:'Moi'},'Lyhyt',40,200);
 var k=KK.addBlock(P,'kaava',{});k.f=KK.kaavaToIds(P,'1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10 + 11 + 12 + 13 + 14 + 15 + 16 + 17 + 18 + 19 + 20');var kn=KK.addNode(P,k.id,40,300);
 var kz=KK.addBlock(P,'kaava',{});kz.f=KK.kaavaToIds(P,'1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10 + 11 + 12 + 13 + 14 + 15 + 16 + 17 + 18 + 19 + 20');var kzn=KK.addNode(P,kz.id,40,420);kzn.kw=200;kzn.kh=34;
 var ch=KK.addBlock(P,'ketju',{});KK.setName(P,ch.id,'Aamu');var chn=KK.addNode(P,ch.id,520,40);
 var aj=KK.addBlock(P,'ajastin',{kesto:1});KK.setName(P,aj.id,'%s');var ajn=KK.addNode(P,aj.id,540,100,chn.id);
 P.lcam={x:0,y:0,z:1};KK.repair(P);APP.renderAll();return {t:t.n,s:s.n,kn:kn.id,kzn:kzn.id,ajn:ajn.id};})()"""%(PITKA,PITKA)
MIT="""(function(id){var e=document.querySelector('#lels .ln[data-nid="'+id+'"]'),lt=e.querySelector('.lt'),cs=getComputedStyle(lt);
 var lh=parseFloat(cs.lineHeight)||parseFloat(cs.fontSize)*1.3;return {w:e.offsetWidth,h:e.offsetHeight,lh:lh,lth:lt.getBoundingClientRect().height,
 rivit:Math.round(lt.getBoundingClientRect().height/lh),yli:lt.scrollHeight>lt.clientHeight+1||lt.scrollWidth>lt.clientWidth+1,cls:e.className};})"""
async def main():
    async with async_playwright() as p:
        for W in (1440,1280,390):
            b,pg,errs=await avaa(p,W,900 if W>500 else 844)
            await pg.fill('#wname','Tila');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            await pg.evaluate("APP.S.tab='logiikka';APP.renderAll()");await pg.wait_for_timeout(250)
            async def m(k):return await pg.evaluate(MIT+"('%s')"%I[k])
            # 1 pistokkeet näkyvät: yksi rivi, enintään 240 px, katkeaa
            a=await m('t');assert 'nopin' not in a['cls'] and a['w']<=240 and a['rivit']==1 and a['yli'],a
            k0=await m('kn');assert k0['rivit']==1 and k0['w']<=240,k0
            kz0=await m('kzn');aj0=await m('ajn');s0=await m('s')
            await pg.screenshot(path='tekstitila_nakyvat_%d.png'%W)
            # 2 piiloon: kaksi riviä, leveämpi kuin 240, enintään 320, yhä katkeaa (ei kolmatta riviä)
            await pg.evaluate("APP.P.lg.pin='h';APP.renderAll()");await pg.wait_for_timeout(250)
            a=await m('t');assert 'nopin' in a['cls'] and 240<a['w']<=320 and a['rivit']==2 and a['yli'],a
            k1=await m('kn');assert 'nopin' in k1['cls'] and k1['rivit']==2 and 240<k1['w']<=320,k1
            s1=await m('s');assert s1['rivit']==1 and s1['w']<=s0['w'],(s0,s1)
            # 3 venytetty Kaava ja ketjun palikka ennallaan
            kz1=await m('kzn');assert kz1['w']==kz0['w'] and kz1['h']==kz0['h'],(kz0,kz1)
            aj1=await m('ajn');assert 'nopin' not in aj1['cls'] and aj1['w']==aj0['w'] and aj1['h']==aj0['h'],(aj0,aj1)
            # 4 nuolet ja valinta toimivat yhä: palikan napautus valitsee sen
            c=await keskus(pg,'#lels .ln[data-nid="%s"] .lb'%I['t']);await pg.mouse.click(*c);await pg.wait_for_timeout(200)
            assert await pg.evaluate("APP.S.sel&&APP.S.sel.id")==I['t']
            await pg.screenshot(path='tekstitila_piilossa_%d.png'%W)
            # 5 palikan oma Näkyvät palauttaa yhden rivin
            await pg.evaluate("APP.P.b[KK.nodeOf(APP.P,'%s').p].lpin='n';APP.renderAll()"%I['t']);await pg.wait_for_timeout(200)
            a=await m('t');assert 'nopin' not in a['cls'] and a['rivit']==1 and a['w']<=240,a
            print(W,'ok','errs',errs);await b.close()
asyncio.run(main())
