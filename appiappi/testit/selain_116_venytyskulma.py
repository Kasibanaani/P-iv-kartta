# Jonon 27: venytyskulma näkyvämmäksi. Kaikki venytyskahvat (logiikan palikka ja ikkuna, näkymän palikka, lappu):
# osuma-alue vähintään 20 × 20 px, kahva päällimmäisenä koko alueeltaan (elementFromPoint), osoitin nwse-resize,
# osoittimen alla väkänen kasvaa ja vedon ajan kahvalla on luokka rzon (korostus), veto muuttaa kokoa.
# Lyhyen palikan oikea kohta osuu yhä kahvan vieressä. 1440 ja 1280 hiirellä, 390 kosketuksella savutestinä. Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P;var vw=P.views[0].id;
 var k=KK.addBlock(P,'kaava',{});k.f=KK.kaavaToIds(P,'1 > 0');var kn=KK.addNode(P,k.id,60,140);
 var t=KK.addBlock(P,'nayta',{v:vw,tx:'Hei'});t.x=20;t.y=20;t.w=200;t.h=40;KK.setName(P,t.id,'Rivi');
 KK.repair(P);APP.renderAll();return {kn:kn.id,t:t.id};})()"""
HIT="""(h)=>{var r=h.getBoundingClientRect();var pts=[[r.left+r.width/2,r.top+r.height/2],[r.right-1.5,r.bottom-1.5],[r.left+1.5,r.top+1.5],[r.right-1.5,r.top+1.5],[r.left+1.5,r.bottom-1.5]];
 return {w:r.width,h:r.height,cur:getComputedStyle(h).cursor,ok:pts.every(function(p){return document.elementFromPoint(p[0],p[1])===h;}),at:pts.map(function(p){var e=document.elementFromPoint(p[0],p[1]);return e===h?'':(e?e.tagName+'#'+e.id+'.'+e.className:'null')+'@'+(p[0]|0)+','+(p[1]|0);})};}"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in (1440,1280,390):
            mob=W<500;H=844 if mob else 900
            ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Kulma');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            async def tarkista(sel,nimi,minimi=20):
                h=await pg.locator(sel).first.evaluate(HIT)
                print(W,nimi,h);assert h['w']>=minimi and h['h']>=minimi,(W,nimi,h);assert h['ok'],(W,nimi,'jokin peittää kahvan',h)
                assert h['cur']=='nwse-resize',(W,nimi,h)
            async def korostus(sel,nimi,mitta=True):
                bb=await pg.locator(sel).first.bounding_box();c=(bb['x']+bb['width']/2,bb['y']+bb['height']/2)
                if mitta:
                    w0=await pg.locator(sel).first.evaluate("h=>parseFloat(getComputedStyle(h,'::before').width)")
                    await pg.mouse.move(*c);await pg.wait_for_timeout(150)
                    w1=await pg.locator(sel).first.evaluate("h=>parseFloat(getComputedStyle(h,'::before').width)")
                    assert w1>w0,(W,nimi,'osoitin ei vahvista',w0,w1)
                await pg.mouse.move(*c);await pg.mouse.down();await pg.mouse.move(c[0]+30,c[1]+20,steps=4)
                assert await pg.locator(sel+'.rzon').count()==1,(W,nimi,'veto ei korosta')
                await pg.mouse.up();await pg.wait_for_timeout(150)
                assert await pg.locator('.rzon').count()==0,(W,nimi,'korostus jäi päälle')
            # näkymän palikka (valittuna)
            await pg.click('#uels .ue[data-id="%s"]'%I['t']);await pg.wait_for_timeout(150)
            await tarkista('.ue.sel .rh','näkymä')
            if not mob:
                w0=await pg.evaluate("APP.P.b['%s'].w"%I['t'])
                await korostus('.ue.sel .rh','näkymä')
                assert await pg.evaluate("APP.P.b['%s'].w"%I['t'])>w0,'näkymän palikka ei venynyt'
            # ristiin jonon 17c kanssa: syvässä (300) ja etualan (−50) kerroksessa kahva pysyy normaalikokoisena ja toimii
            if not mob:
                S2=await pg.evaluate("""(function(){var P=APP.P,v=P.views[0];v.kr=[{id:'k3',n:'Syva',sy:300},{id:'k4',n:'Etu',sy:-50},{id:'pohja',n:'Pohja'}];var r={};
                 [['k3',300],['k4',500]].forEach(function(q){var b=KK.addBlock(P,'muoto',{v:v.id,laji:'laatikko'});b.x=q[1];b.y=300;b.w=120;b.h=80;b.kr=q[0];r[q[0]]=b.id;});
                 KK.repair(P);APP.renderAll();return r;})()""");await pg.wait_for_timeout(150)
                for kr,nimi in (('k3','syvä 300'),('k4','etuala −50')):
                    await pg.evaluate("APP.S.sel={t:'b',id:'%s'};APP.renderAll()"%S2[kr]);await pg.wait_for_timeout(150)
                    bb=await pg.locator('.ue.sel .rh').bounding_box();assert 18<=bb['width']<=26,(W,nimi,bb)
                    await tarkista('.ue.sel .rh',nimi,minimi=18)
                    w0=await pg.evaluate("APP.P.b['%s'].w"%S2[kr])
                    await korostus('.ue.sel .rh',nimi,mitta=False)
                    assert await pg.evaluate("APP.P.b['%s'].w"%S2[kr])>w0,(W,nimi,'ei venynyt')
            # logiikka: palikka ja ikkuna
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            if not mob:
                lv=await pg.locator('#lvp').bounding_box()
                l=pg.locator('#pal .chip[data-make*="ketju"]').first;await l.scroll_into_view_if_needed();c0=await l.bounding_box()
                await veda(pg,[c0['x']+c0['width']/2,c0['y']+c0['height']/2],[lv['x']+min(500,lv['width']-420),lv['y']+330])
                await tarkista('.lw .rs','ikkuna')
                await korostus('.lw .rs','ikkuna')
            K='#lels .ln[data-nid="%s"]'%I['kn']
            await pg.evaluate("APP.S.sel={t:'n',id:'%s'};APP.renderAll()"%I['kn']);await pg.wait_for_timeout(150)
            await tarkista(K+' .rs','palikka')
            # lyhyen palikan oikea kohta osuu yhä (kohdat kahvan päällä)
            pt=await pg.locator(K+' .pins.o .pt').first.bounding_box()
            hit=await pg.evaluate("([x,y])=>{var e=document.elementFromPoint(x,y);return e&&e.closest('.pt')?1:0}",[pt['x']+pt['width']/2,pt['y']+pt['height']-2])
            assert hit==1,(W,'kohta peittyi kahvan alle')
            if not mob:
                kw0=(await pg.locator(K).bounding_box())['width']
                await korostus(K+' .rs','palikka')
                kw=await pg.evaluate("KK.nodeOf(APP.P,'%s').kw"%I['kn']);assert kw and kw>=kw0+20,(kw0,kw)
            # lappu
            await pg.click('#lapmbtn');await pg.wait_for_timeout(200)
            await tarkista('.laprz','lappu')
            if not mob:await korostus('.laprz','lappu',mitta=False)
            await pg.screenshot(path='appiappi_venytyskulma_%d.png'%W)
            print(W,'errs',errs);await ctx.close()
        await b.close()
asyncio.run(main())
