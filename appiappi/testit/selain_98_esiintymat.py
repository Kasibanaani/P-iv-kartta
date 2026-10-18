# Jonon 24: saman palikan esiintymien määrä näkyy logiikkakanvaasilla viitteen perässä (2×), merkin napautus siirtyy
# seuraavaan esiintymään kiertäen ja valitun esiintymän muut esiintymät saavat katkoviivareunan. Yksi esiintymä: ei merkkiä.
# Poistettu esiintymä vähentää lukua. 1440 ja 1280 px; 390 px savutestinä. Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P;
 var m=KK.addBlock(P,'muisti',{});KK.setName(P,m.id,'Pisteet');var a=KK.addNode(P,m.id,60,60),b=KK.addNode(P,m.id,420,260);
 var y=KK.addBlock(P,'muisti',{});KK.setName(P,y.id,'Yksin');var c=KK.addNode(P,y.id,60,360);
 P.lcam={x:0,y:0,z:1};KK.repair(P);APP.renderAll();return {m:m.id,a:a.id,b:b.id,c:c.id};})()"""
MERK="""(function(){var o={};document.querySelectorAll('#lels .ln').forEach(function(e){var q=e.querySelector('.vtag .ninst');o[e.getAttribute('data-nid')]=q?q.textContent:'';});return o;})()"""
async def main():
    async with async_playwright() as p:
        for W in (1440,1280,390):
            b,pg,errs=await avaa(p,W,900 if W>500 else 844)
            await pg.fill('#wname','Esiintymät');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            await pg.evaluate("APP.S.tab='logiikka';APP.renderAll()");await pg.wait_for_timeout(250)
            # 1 kaksi esiintymää: 2× molemmissa, yksin olevalla ei merkkiä
            m=await pg.evaluate(MERK);assert m[I['a']]=='2×' and m[I['b']]=='2×' and m[I['c']]=='',m
            # merkki on luettava: sama väri kuin viite, ei läpinäkyvä
            st=await pg.evaluate("(function(){var q=document.querySelector('#lels .ln[data-nid=\"%s\"] .ninst'),v=q.parentNode;var a=getComputedStyle(q),c=getComputedStyle(v);return {pe:a.pointerEvents,col:a.color,vc:c.color,t:q.title};})()"%I['a'])
            assert st['pe']=='auto' and st['col']==st['vc'] and 'Napauta' in st['t'],st
            # 2 merkin napautus: valinta ja kamera seuraavaan esiintymään, toinen saa katkoviivan
            c=await keskus(pg,'#lels .ln[data-nid="%s"] .ninst'%I['a']);await pg.mouse.click(*c);await pg.wait_for_timeout(650)
            sel=await pg.evaluate("APP.S.sel&&APP.S.sel.id");assert sel==I['b'],sel
            r=await pg.evaluate("(function(){var e=document.querySelector('#lels .ln[data-nid=\"%s\"]').getBoundingClientRect(),s=document.querySelector('#lvp').getBoundingClientRect();return [e.left+e.width/2-(s.left+s.width/2),e.top+e.height/2-(s.top+s.height/2)];})()"%I['b'])
            assert abs(r[0])<4 and abs(r[1])<4,r
            tw=await pg.evaluate("(function(){var e=document.querySelector('#lels .ln[data-nid=\"%s\"]');return [e.classList.contains('same'),getComputedStyle(e).borderTopStyle];})()"%I['a'])
            assert tw==[True,'dashed'],tw
            await pg.screenshot(path='esiintymat_%d.png'%W)
            # 3 uudelleen: kiertää takaisin ensimmäiseen
            c=await keskus(pg,'#lels .ln[data-nid="%s"] .ninst'%I['b']);await pg.mouse.click(*c);await pg.wait_for_timeout(650)
            assert await pg.evaluate("APP.S.sel&&APP.S.sel.id")==I['a']
            # 4 kolmas esiintymä → 3×, kaksi poistettu → merkki katoaa
            n3=await pg.evaluate("(function(){var n=KK.addNode(APP.P,'%s',700,60);APP.renderAll();return n.id;})()"%I['m']);await pg.wait_for_timeout(150)
            m=await pg.evaluate(MERK);assert m[I['a']]=='3×' and m[n3]=='3×',m
            await pg.evaluate("APP.S.sel=null;KK.removeNode(APP.P,'%s');KK.removeNode(APP.P,'%s');APP.renderAll()"%(I['b'],n3));await pg.wait_for_timeout(150)
            m=await pg.evaluate(MERK);assert m.get(I['a'])=='',m
            # 5 palikan tavallinen napautus valitsee yhä palikan (ei siirry)
            c=await keskus(pg,'#lels .ln[data-nid="%s"] .lb'%I['c']);await pg.mouse.click(*c);await pg.wait_for_timeout(200)
            assert await pg.evaluate("APP.S.sel&&APP.S.sel.id")==I['c']
            print(W,'ok','errs',errs);await b.close()
asyncio.run(main())
