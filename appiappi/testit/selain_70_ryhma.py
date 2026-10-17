# Appi-appi 29 (F30 kohta 5): Ryhmä logiikassa (1440 ja 1280 hiirellä, 390 ja 320 kosketuksella CDP:llä).
# Ryhmä liikuttaa sisältöään, palikka ja ikkuna pudotetaan ryhmään, ryhmä ei mene ikkunaan, sävy ja nimi paneelista,
# tiivistys, paletin palikka (tietokoneella) ja tallennus. Kuvat appiappi29_*.png. Ei oikeaa iPhonea.
import asyncio, os
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P;
 var r=KK.addBlock(P,'ryhma',{}),rn=KK.addNode(P,r.id,20,40);
 var u=KK.addBlock(P,'muisti',{v:'8'});KK.setName(P,u.id,'Uni');var un=KK.addNode(P,u.id,50,100,rn.id);
 var w=KK.addBlock(P,'ikkuna',{m:'and'}),wn=KK.addNode(P,w.id,20,330);
 var a=KK.addBlock(P,'muisti',{v:'1'});KK.setName(P,a.id,'Irto');var an=KK.addNode(P,a.id,170,270);
 var r2=KK.addBlock(P,'ryhma',{}),r2n=KK.addNode(P,r2.id,20,500);r2n.w=150;r2n.h=90;
 P.lcam={x:0,y:0,z:1};KK.repair(P);APP.renderAll();return {r:r.id,rn:rn.id,un:un.id,wn:wn.id,an:an.id,r2n:r2n.id};})()"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in ((320,) if os.environ.get('VAIN') else (1440,1280,390,320)):
            mob=W<500;H=844 if mob else 900
            ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            cdp=await ctx.new_cdp_session(pg)
            async def T(typ,pts):await cdp.send('Input.dispatchTouchEvent',{'type':typ,'touchPoints':[{'x':x,'y':y} for (x,y) in pts]})
            async def tapxy(x,y):
                if mob:await T('touchStart',[(x,y)]);await T('touchEnd',[])
                else:await pg.mouse.click(x,y)
                await pg.wait_for_timeout(200)
            async def tap(sel):
                if mob:await pg.tap(sel)
                else:await pg.click(sel)
                await pg.wait_for_timeout(200)
            async def dragxy(a,t,n=12):
                if mob:
                    await T('touchStart',[a])
                    for i in range(1,n+1):await T('touchMove',[(a[0]+(t[0]-a[0])*i/n,a[1]+(t[1]-a[1])*i/n)])
                    await T('touchEnd',[])
                else:
                    await pg.mouse.move(*a);await pg.mouse.down();await pg.mouse.move(t[0],t[1],steps=n);await pg.mouse.up()
                await pg.wait_for_timeout(250)
            def N(nid):return '#lels [data-nid="%s"]'%nid
            async def head(nid,f=0.55):
                r=await pg.locator(N(nid)).bounding_box();return (r['x']+min(r['width']*f,120),r['y']+12)
            async def node(nid):return await pg.evaluate("(function(){var n=KK.nodeOf(APP.P,'%s');return {x:n.x,y:n.y,g:n.g,col:!!n.col};})()"%nid)
            await pg.fill('#wname','Ryhmät');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            await tap('#tabs [data-t="logiikka"]')
            R=N(I['rn'])
            # 1 ulkoasu: reunaviiva, himmeä Ryhmä-teksti, ei pistokkeita eikä arvoa
            cls=await pg.locator(R).get_attribute('class');assert 'ry' in cls.split() and 'sv' not in cls,cls
            assert await pg.locator(R+' .pt').count()==0,'ei pistokkeita'
            assert (await pg.locator(R+' .wname').inner_text()).strip()=='Ryhmä'
            await pg.screenshot(path='appiappi29_ryhma_%d.png'%W)
            # 2 ryhmä liikkuu sisältöineen
            r0=await node(I['rn']);u0=await node(I['un'])
            h=await head(I['rn']);await dragxy(h,(h[0]+30,h[1]+20))
            r1=await node(I['rn']);u1=await node(I['un'])
            dx=r1['x']-r0['x'];dy=r1['y']-r0['y'];assert dx>20 and dy>5,(r0,r1)
            assert (u1['x']-u0['x'],u1['y']-u0['y'])==(dx,dy),(u0,u1,dx,dy)
            assert u1['g']==I['rn']
            # 3 ryhmä ei mene ikkunaan
            wb=await pg.locator(N(I['wn'])).bounding_box();h=await head(I['r2n']);r20=await node(I['r2n'])
            await dragxy(h,(wb['x']+60,wb['y']+60));assert (await node(I['r2n']))['y']<r20['y']-100,'ryhmä siirtyi'
            assert (await node(I['r2n']))['g']=='','ryhmä ei ikkunaan'
            # 4 palikka ja ikkuna ryhmään
            rb=await pg.locator(R).bounding_box()
            ab=await pg.locator(N(I['an'])).bounding_box()
            await dragxy((ab['x']+20,ab['y']+12),(rb['x']+150,rb['y']+rb['height']-30))
            if (await node(I['an']))['g']!=I['rn']:
                await pg.screenshot(path='appiappi29_virhe_%d.png'%W);print('ab',ab,'rb',rb,await node(I['an']),await node(I['rn']))
            assert (await node(I['an']))['g']==I['rn'],'palikka ryhmään'
            # suurenna ryhmä, jotta ikkuna mahtuu
            await pg.evaluate("(function(){var n=KK.nodeOf(APP.P,'%s');n.w=700;n.h=520;APP.renderAll();})()"%I['rn']);await pg.wait_for_timeout(150)
            rb=await pg.locator(R).bounding_box();h=await head(I['wn'])
            await dragxy(h,(rb['x']+min(rb['width']-200,200),rb['y']+rb['height']-120))
            assert (await node(I['wn']))['g']==I['rn'],('ikkuna ryhmään',await node(I['wn']))
            # 5 paneeli: sävy, ei viitettä eikä pistokeasetusta
            h=await head(I['rn']);await tapxy(*h)
            assert await pg.evaluate("APP.S.sel&&APP.S.sel.id")==I['rn']
            ih=await pg.inner_text('#insp');assert 'Sävy' in ih and 'Erikoispalikka' in ih,ih[:400]
            assert 'Ulkonäkö logiikassa' not in ih and await pg.locator('#insp input[data-k="vt"]').count()==0
            await pg.evaluate("document.querySelector('#insp [data-sw=\"sav\"][data-v=\"2\"]').click()");await pg.wait_for_timeout(200)
            assert await pg.evaluate("APP.P.b['%s'].sav"%I['r'])==2
            cls=await pg.locator(R).get_attribute('class');assert 'sv' in cls.split() and 'h2' in cls.split(),cls
            bg=await pg.evaluate("getComputedStyle(document.querySelector('%s')).backgroundColor"%R);assert bg not in ('rgba(0, 0, 0, 0)','transparent'),bg
            await pg.screenshot(path='appiappi29_savy_%d.png'%W)
            await pg.evaluate("document.querySelector('#insp [data-sw=\"sav\"][data-v=\"-1\"]').click()");await pg.wait_for_timeout(200)
            assert await pg.evaluate("'sav' in APP.P.b['%s']"%I['r'])==False
            await pg.evaluate("document.querySelector('#insp [data-sw=\"sav\"][data-v=\"5\"]').click()");await pg.wait_for_timeout(200)
            # nimi
            await pg.fill('#insp input[data-k="nm"]','Aamun asiat');await pg.dispatch_event('#insp input[data-k="nm"]','change');await pg.wait_for_timeout(250)
            t=(await pg.locator(R+' .wname').inner_text()).strip();assert t=='Aamun asiat',t
            # 6 tiivistys
            await tap(R+' [data-col]');n=await node(I['rn']);assert n['col']
            assert '3 sisällä' in await pg.locator(R).inner_text(),await pg.locator(R).inner_text()
            assert await pg.locator(N(I['un'])).count()==0,'sisältö piilossa'
            await tap(R+' [data-col]');assert not (await node(I['rn']))['col']
            # 7 paletti (tietokone): Ryhmä Järjestys-otsikon alla, veto luo ryhmän
            if not mob:
                ch='#pal .chip[data-make*="ryhma"]';assert await pg.locator(ch).count()==1
                n0=await pg.evaluate("Object.values(APP.P.b).filter(b=>b.k==='ryhma').length")
                await pg.locator(ch).scroll_into_view_if_needed();vb=await pg.locator('#lvp').bounding_box();c=await pg.locator(ch).bounding_box()
                await veda(pg,[c['x']+c['width']/2,c['y']+c['height']/2],[vb['x']+vb['width']-200,vb['y']+vb['height']-150])
                assert await pg.evaluate("Object.values(APP.P.b).filter(b=>b.k==='ryhma').length")==n0+1
            # 8 tallennus
            await pg.wait_for_timeout(400);await pg.reload();await pg.wait_for_timeout(400)
            v=await pg.evaluate("(function(){var b=APP.P.b['%s'];return [b.sav,b.nm,KK.nodeOf(APP.P,'%s').g,KK.nodeOf(APP.P,'%s').g];})()"%(I['r'],I['wn'],I['un']))
            assert v==[5,'Aamun asiat',I['rn'],I['rn']],v
            print(W,'ok');print('errs',errs);await ctx.close()
        await b.close()
asyncio.run(main())
