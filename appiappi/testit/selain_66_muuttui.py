# Appi-appi 25 (L1): ohjainten muuttui-tapahtuma käytössä (1440 ja 1280 hiirellä, 390 ja 320 sormella).
# Säädin lähettää vedon aikana arvon vaihtuessa, Tekstikenttä vasta kun kirjoitus päättyy, Valintaruutu, Lukukenttä (+)
# ja Listan rastitus joka kerta. Logiikkakanvaasilla ohjaimen solmussa näkyy kohta muuttui. Kuvat appiappi25_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0];v.laite='puhelin';var vw=v.id;
 function U(k,o,x,y,w,h,nm){o.v=vw;var b=KK.addBlock(P,k,o);b.x=x;b.y=y;b.w=w;b.h=h;KK.setName(P,b.id,nm);return b;}
 function N(b,x,y){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,x||0,y||0);}
 var r={},yy=0;
 function rig(b,i){var m=KK.addBlock(P,'muisti',{v:'0'});KK.setName(P,m.id,'Laskuri '+b.nm);N(m,900,i*120);var te=KK.addBlock(P,'tee',{do:'lisaa',o:m.id});
   KK.addLink(P,N(b,300,i*120).id,'mu',N(te,600,i*120).id,'e');return m.id;}
 var sl=U('saadin',{tx:'Vauhti',min:0,max:10,start:0},20,20,300,76,'Vauhti');
 var tx=U('teksti',{tx:'Nimi'},20,110,300,84,'Nimi');
 var ru=U('ruutu',{tx:'Valmis'},20,210,300,40,'Valmis');
 var lu=U('luku',{tx:'Määrä',start:0},20,260,200,84,'Määrä');
 var li=U('lista',{tx:'Tehtävät'},20,360,300,160,'Tehtävät');P.st[li.id]={rows:[{id:'r1',tx:'Kauppa',c:false,d:''},{id:'r2',tx:'Posti',c:false,d:''}]};
 [sl,tx,ru,lu,li].forEach(function(b,i){r[b.nm]={id:b.id,m:rig(b,i)};});
 KK.repair(P);APP.renderAll();return r;})()"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in (1440,1280,390,320):
            mob=W<500;H=844 if mob else 900
            ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            async def tap(sel):
                if mob:await pg.tap(sel)
                else:await pg.click(sel)
                await pg.wait_for_timeout(150)
            await pg.fill('#wname','Muuttui');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP)
            def S(n):return '#uels .ue[data-id="%s"]'%I[n]['id']
            async def n(nm):return await pg.evaluate("APP.ev().val('%s')"%I[nm]['m'])
            if not mob:
                await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(200)
                mu=await pg.evaluate("Array.from(document.querySelectorAll('.pt.e[data-p=mu][data-d=o]')).map(function(e){return e.textContent;})")
                assert len(mu)==5 and all('muuttui' in x for x in mu),('logiikan solmuissa kohta muuttui',mu)
                await pg.screenshot(path='appiappi25_logiikka_%d.png'%W)
                await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(200)
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            # Säädin: kolme askelta näppäimillä tai raahaten → kolme tapahtumaa
            rng=S('Vauhti')+' input[type=range]'
            r=await pg.locator(rng).bounding_box()
            if mob:
                cdp=await ctx.new_cdp_session(pg)
                async def T(typ,pts):await cdp.send('Input.dispatchTouchEvent',{'type':typ,'touchPoints':[{'x':x,'y':y} for (x,y) in pts]})
                x0=r['x']+11;y0=r['y']+r['height']/2;w=r['width']-22
                await T('touchStart',[(x0,y0)])
                for i in range(1,4):await T('touchMove',[(x0+w*i/10,y0)])
                await T('touchEnd',[])
            else:
                await pg.focus(rng)
                for i in range(3):await pg.keyboard.press('ArrowRight')
            await pg.wait_for_timeout(200)
            v=await pg.evaluate("APP.ev().val('%s')"%I['Vauhti']['id'])
            assert v==3 and await n('Vauhti')==3,(W,v,await n('Vauhti'))
            # Tekstikenttä: ei joka merkistä, yksi kun kirjoitus päättyy
            fld=S('Nimi')+' .fld'
            await tap(fld);await pg.keyboard.type('Matti',delay=20);await pg.wait_for_timeout(100)
            assert await n('Nimi')==0,'ei kesken kirjoituksen'
            assert await pg.evaluate("APP.ev().val('%s')"%I['Nimi']['id'])=='Matti'
            await pg.evaluate("document.activeElement.blur()");await pg.wait_for_timeout(150)
            assert await n('Nimi')==1,(W,await n('Nimi'))
            await tap(fld);await pg.evaluate("document.activeElement.blur()");await pg.wait_for_timeout(150)
            assert await n('Nimi')==1,'kohdistus ilman muutosta ei lähetä'
            await tap(fld);await pg.keyboard.type('!');await pg.keyboard.press('Enter')
            await pg.evaluate("document.activeElement&&document.activeElement.blur()");await pg.wait_for_timeout(150)
            assert await n('Nimi')==2,(W,await n('Nimi'))
            # Valintaruutu, Lukukenttä +, Listan rastitus
            await tap(S('Valmis')+' [data-act=toggle]');await tap(S('Valmis')+' [data-act=toggle]')
            assert await n('Valmis')==2
            await tap(S('Määrä')+' [data-act=inc]');assert await n('Määrä')==1
            await tap(S('Tehtävät')+' [data-row="r1"] [data-act=rowchk]');assert await n('Tehtävät')==1
            await pg.screenshot(path='appiappi25_kaytto_%d.png'%W)
            print(W,'ok','errs',errs)
            await ctx.close()
        await b.close()
asyncio.run(main())
