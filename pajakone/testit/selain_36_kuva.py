# Pajakone 3c: Kuva-palikka ja näkymätön kosketusalue. Kuva paletista, SVG-teksti paneelista (img data-osoitteena),
# vaarallinen osoite ei näy, kuvatiedosto valitsimella (PNG data-osoitteena, SVG-tiedosto tekstiksi), sovitus, Poista kuva,
# kuva nuolesta (Arvo-palikasta); painikkeen ulkoasu Näkymätön kosketusalue: muokatessa katkoviiva, käytössä läpinäkyvä
# ilman tekstiä ja toimii painikkeena kuvan päällä; tallennus. Kuvat pajakone3c_*.png.
import asyncio, os, base64
from playwright.async_api import async_playwright
from yhteinen import *
SVG='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 60"><rect width="390" height="60" fill="#2F6449"/><circle cx="65" cy="30" r="16" fill="#F5A35C"/><circle cx="195" cy="30" r="16" fill="#fff"/><circle cx="325" cy="30" r="16" fill="#B4530A"/></svg>'
PNG=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==')
async def main():
    D=os.path.dirname(os.path.abspath(__file__));pp=os.path.join(D,'tulosteet','pikseli.png');sp=os.path.join(D,'tulosteet','palkki.svg')
    open(pp,'wb').write(PNG);open(sp,'w').write(SVG)
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Kuvat');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            await pg.evaluate("(function(){APP.P.views[0].laite='puhelin';APP.renderAll();})()")
            st=await pg.locator('#uvp').bounding_box()
            await paletti(pg,'Kuva',st['x']+200,st['y']+300);await pg.wait_for_timeout(150)
            kid=await P(pg,"APP.S.sel.id");assert await P(pg,"P.b['%s'].k"%kid)=='pkuva'
            assert 'lisää SVG' in await pg.inner_text('.ue[data-id="%s"]'%kid)
            # --- 1. SVG-teksti ---
            await pg.fill('#insp textarea[data-k="src"]',SVG);await pg.wait_for_timeout(150)
            src=await pg.get_attribute('.ue[data-id="%s"] img'%kid,'src');assert src.startswith('data:image/svg+xml'),src[:40]
            loaded=await pg.evaluate("document.querySelector('.ue[data-id=\"%s\"] img').naturalWidth>0"%kid);assert loaded,'SVG latautui kuvaksi'
            await pg.evaluate("(function(){var b=APP.P.b['%s'];b.x=0;b.y=784;b.w=390;b.h=60;APP.renderAll();})()"%kid)
            # Vaarallinen osoite ei näy
            await pg.fill('#insp textarea[data-k="src"]','javascript:alert(1)');await pg.wait_for_timeout(120)
            assert await pg.locator('.ue[data-id="%s"] img'%kid).count()==0
            await pg.fill('#insp textarea[data-k="src"]',SVG);await pg.wait_for_timeout(120)
            # Sovitus
            await pg.click('#insp [data-seg="sov"][data-v="cover"]');await pg.wait_for_timeout(120)
            assert 'cover' in await pg.get_attribute('.ue[data-id="%s"] img'%kid,'style')
            # --- 2. Kuvatiedostot ---
            async with pg.expect_file_chooser() as fc:
                await pg.click('#insp [data-do="kuvafile"]')
            await (await fc.value).set_files(pp);await pg.wait_for_timeout(300)
            assert (await P(pg,"P.b['%s'].src"%kid)).startswith('data:image/png;base64,')
            assert 'kt' in await pg.inner_text('#insp')
            async with pg.expect_file_chooser() as fc:
                await pg.click('#insp [data-do="kuvafile"]')
            await (await fc.value).set_files(sp);await pg.wait_for_timeout(300)
            assert (await P(pg,"P.b['%s'].src"%kid)).startswith('<svg'),'SVG-tiedosto tekstiksi'
            await pg.click('#insp [data-do="kuvaclr"]');await pg.wait_for_timeout(120);assert await P(pg,"P.b['%s'].src"%kid)==''
            await pg.click('#undobtn');await pg.wait_for_timeout(120);assert (await P(pg,"P.b['%s'].src"%kid)).startswith('<svg')
            # --- 3. Kosketusalueet kuvan päälle ---
            I=await pg.evaluate("""(function(){var P=APP.P,v=P.views[0].id;var m=KK.addBlock(P,'muisti',{v:'0'});KK.setName(P,m.id,'Painettu');KK.addNode(P,m.id,600,0);var out=[];
              [0,1,2].forEach(function(i){var b=KK.addBlock(P,'nappi',{v:v,beh:'kerta',ulk:'nakymaton',tx:'Kohta '+(i+1)});b.x=i*130;b.y=784;b.w=130;b.h=60;b.z=20;
                var n=KK.addNode(P,b.id,0,i*80);var t=KK.addBlock(P,'tee',{do:'lisaa',o:m.id,v:String(Math.pow(10,i))});var tn=KK.addNode(P,t.id,300,i*80);KK.addLink(P,n.id,'e',tn.id,'e');out.push(b.id);});
              KK.repair(P);APP.renderAll();return {m:m.id,z:out};})()""")
            el=await pg.evaluate("(function(){var e=document.querySelector('.ue[data-id=\"%s\"] button');var c=getComputedStyle(e);return [e.className,e.textContent,c.outlineStyle];})()"%I['z'][1])
            print(W,'3 muokatessa:',el);assert 'w-inv' in el[0] and el[1]=='Kohta 2' and el[2]=='dashed'
            await pg.screenshot(path='pajakone3c_muokkaus_%d.png'%W)
            await pg.click('#lockbtn');await pg.wait_for_timeout(250)
            el=await pg.evaluate("(function(){var e=document.querySelector('.ue[data-id=\"%s\"] button');var c=getComputedStyle(e);return [e.textContent,c.backgroundColor,c.outlineStyle];})()"%I['z'][1])
            print(W,'3 käytössä:',el);assert el[0]=='' and el[1] in ('rgba(0, 0, 0, 0)','transparent') and el[2]=='none'
            for i in (0,2,2):
                await pg.click('.ue[data-id="%s"] button'%I['z'][i]);await pg.wait_for_timeout(80)
            assert await P(pg,"E().val('%s')"%I['m'])==201
            await pg.screenshot(path='pajakone3c_kaytto_%d.png'%W)
            await pg.click('#lockbtn');await pg.wait_for_timeout(150)
            # --- 4. Kuva nuolesta ---
            await pg.evaluate("""(function(){var P=APP.P;var a=KK.addBlock(P,'arvo',{v:'https://example.com/kuva.png'});var an=KK.addNode(P,a.id,0,400);var kn=KK.addNode(P,'%s',300,400);KK.addLink(P,an.id,'v',kn.id,'src');APP.renderAll();})()"""%kid)
            await pg.wait_for_timeout(150)
            assert await pg.get_attribute('.ue[data-id="%s"] img'%kid,'src')=='https://example.com/kuva.png'
            # --- 5. Tallennus ---
            await pg.evaluate("APP.saveNow()");await pg.reload();await pg.wait_for_timeout(300)
            r=await P(pg,"[P.b['%s'].sov,P.b['%s'].src.slice(0,4),P.b['%s'].ulk]"%(kid,kid,I['z'][0]));assert r==['cover','<svg','nakymaton'],r
            errs=[e for e in errs if 'example.com' not in e and 'ERR_' not in e]
            print(W,'errs',errs);assert not errs;await b.close()
asyncio.run(main())
