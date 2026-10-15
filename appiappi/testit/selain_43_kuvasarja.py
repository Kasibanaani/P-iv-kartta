# Appi-appi 4: kuvasarja-animaatio Kuva-palikassa selaimessa. Paneeli: liitä SVG sarjaan, lisää kuvatiedostoja (monta,
# nimen mukaan järjestyksessä), järjestys ↑↓, poisto ✕, 🎞-merkki muokatessa, nopeus ja Pyörii-valinta. Lukittuna:
# Aina → kuva vaihtuu, Kun liikkuu → pyörii vain tatilla liikuttaessa ja pysähtyneenä näkyy pääkuva. Kuvat appiappi4_*.png.
import asyncio, os
from playwright.async_api import async_playwright
from yhteinen import *
def svg(c):return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="%s"/></svg>'%c
SETUP="""(function(S1){var P=APP.P,v=P.views[0];v.laite='puhelin';var vw=v.id;
 v.kr=[{id:'pohja',n:'Pohja'},{id:'k1',n:'Kojelauta',rv:0}];
 function U(k,o,x,y,w,h,nm){var b=KK.addBlock(P,k,o);b.x=x;b.y=y;if(w)b.w=w;if(h)b.h=h;if(nm)KK.setName(P,b.id,nm);return b;}
 var tj=U('tatti',{v:vw},115,660,160,160,'Tatti');tj.kr='k1';
 var k=U('pkuva',{v:vw,src:S1},150,300,80,80,'Ukko');
 var li=KK.addBlock(P,'liike',{o:k.id,ohj:'tatti',tt:tj.id,vm:150});KK.addNode(P,li.id,600,0);
 KK.repair(P);APP.renderAll();return {tj:tj.id,k:k.id,li:li.id};})"""
async def src(pg,id):
    return await pg.evaluate("document.querySelector('.ue[data-id=\"%s\"] img').getAttribute('src')"%id)
async def kerää(pg,id,n=12,ms=60):
    o=set()
    for i in range(n):o.add(await src(pg,id));await pg.wait_for_timeout(ms)
    return o
async def main():
    D=os.getcwd()
    for i,c in enumerate(['#f00','#0f0']):open(os.path.join(D,'ks_%d.svg'%(i+1)),'w').write(svg(c))
    async with async_playwright() as p:
        for W in (1440,390):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Kuvasarja');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP,svg('#00f'))
            if W>500:
                await pg.evaluate("(function(){APP.S.sel={t:'b',id:'%s'};APP.renderAll();})()"%I['k']);await pg.wait_for_timeout(120)
                assert await pg.locator('#insp .ksr').count()==1
                await pg.fill('#ksuusi',svg('#ff0'));await pg.click('#insp [data-do="sarjateksti"]');await pg.wait_for_timeout(120)
                assert await pg.locator('#insp .ksr').count()==2 and await pg.locator('.ue[data-id="%s"] .ksbadge'%I['k']).count()==1
                async with pg.expect_file_chooser() as fc:await pg.click('#insp [data-do="sarjafile"]')
                ch=await fc.value;await ch.set_files([os.path.join(D,'ks_2.svg'),os.path.join(D,'ks_1.svg')]);await pg.wait_for_timeout(400)
                sar=await P(pg,"P.b['%s'].sarja.map(x=>x.match(/fill=\"([^\"]+)\"/)[1])"%I['k']);print(W,'0 sarja:',sar);assert sar==['#ff0','#f00','#0f0'],'tiedostot nimen mukaan'
                await pg.click('#insp .ksr:nth-child(2) [data-ksm="d"]');await pg.wait_for_timeout(100)
                await pg.click('#insp .ksr:nth-child(4) [data-ksm="x"]');await pg.wait_for_timeout(100)
                sar=await P(pg,"P.b['%s'].sarja.map(x=>x.match(/fill=\"([^\"]+)\"/)[1])"%I['k']);print(W,'  järjestys ja poisto:',sar);assert sar==['#f00','#ff0']
                await pg.fill('#insp input[data-k="fps"]','12');await pg.dispatch_event('#insp input[data-k="fps"]','input')
                await pg.click('#insp [data-seg="pyor"][data-v="aina"]');await pg.wait_for_timeout(120)
                assert await P(pg,"[String(P.b['%s'].fps),P.b['%s'].pyor]"%(I['k'],I['k']))==['12','aina']
                await pg.screenshot(path='appiappi4_paneeli_%d.png'%W)
            else:
                await pg.evaluate("(function(){var b=APP.P.b['%s'];b.sarja=['%s','%s'];b.fps=12;b.pyor='aina';APP.renderAll();})()"%(I['k'],svg('#f00').replace('"','\\"'),svg('#ff0').replace('"','\\"')))
            e0=await src(pg,I['k'])
            assert e0==await src(pg,I['k']),'muokatessa pääkuva'
            await pg.click('#lockbtn');await pg.wait_for_timeout(250)
            s=await kerää(pg,I['k']);print(W,'1 aina: eri kuvia',len(s));assert len(s)==3
            # Kun liikkuu
            await pg.evaluate("(function(){APP.P.b['%s'].pyor='liikkuu';KK.repair(APP.P);APP.renderAll();})()"%I['k']);await pg.wait_for_timeout(300)
            s=await kerää(pg,I['k'],6);print(W,'2 paikallaan:',len(s));assert s=={e0},'pysähtyneenä pääkuva'
            tb=await pg.locator('.ue[data-id="%s"] .w-tatti'%I['tj']).bounding_box();cx,cy=tb['x']+tb['width']/2,tb['y']+tb['height']/2
            await pg.mouse.move(cx,cy);await pg.mouse.down();await pg.mouse.move(cx+tb['width']*0.4,cy,steps=3);await pg.wait_for_timeout(100)
            s=await kerää(pg,I['k']);await pg.screenshot(path='appiappi4_kavelee_%d.png'%W);await pg.mouse.up();await pg.wait_for_timeout(300)
            print(W,'  liikkuessa:',len(s));assert len(s)==3
            s=await kerää(pg,I['k'],5);assert s=={e0},'pysähtyi pääkuvaan'
            print(W,'errs',errs);assert not errs;await b.close()
asyncio.run(main())
