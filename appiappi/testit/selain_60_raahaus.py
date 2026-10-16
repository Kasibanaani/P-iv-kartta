# Appi-appi 19 (F12): käyttöraahaus selaimessa. Leveydet 1440 ja 1280 (hiiri) sekä 390 ja 320 (sormi CDP:llä).
# Lukittuna raahattava palikka seuraa osoitinta tartuntakohdasta (ei hyppää), pudotus kirjoittaa käyttötietoon (rakenne
# ennallaan), raahattava painike toimii napautuksella eikä laukea raahattaessa, Vain alueisiin: Alueeseen pudotus antaa
# tapahtuma.kohde, muualle pudotettu palaa ja tulee raahaus peruttu. Sormella keskeytynyt kosketus perii raahauksen.
# Rakentajan Käyttöraahaus-osio (tietokone). Kuvat appiappi19_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0];v.laite='puhelin';var vw=v.id;
 function U(k,o,x,y,w,h,nm){o.v=vw;var b=KK.addBlock(P,k,o);b.x=x;b.y=y;b.w=w;b.h=h;KK.setName(P,b.id,nm);return b;}
 function N(b,x,y){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,x||0,y||0);}
 function laskuri(b,port,y){var m=KK.addBlock(P,'muisti',{v:'0'});N(m,900,y);var t=KK.addBlock(P,'tee',{do:'lisaa',o:m.id});KK.addLink(P,N(b,300,y).id,port,N(t,600,y).id,'e');return m;}
 var pa=U('muoto',{laji:'laatikko',hue:2},40,160,60,60,'Pala');pa.raah=true;
 var na=U('nappi',{tx:'Paina'},40,300,120,44,'Paina');na.raah=true;
 var al=U('alue',{},180,420,160,160,'Kori');
 var tp=KK.addBlock(P,'tapaht',{});KK.setName(P,tp.id,'Tapahtuma');N(tp,0,800);
 var cN=laskuri(na,'e',0),cPu=laskuri(pa,'rpu',200),cPe=laskuri(pa,'rpe',400);
 var mk=KK.addBlock(P,'muisti',{v:''});N(mk,900,600);var k=KK.addBlock(P,'kaava');N(k,300,700);k.f=KK.kaavaToIds(P,'tapahtuma.kohde');
 var t=KK.addBlock(P,'tee',{do:'aseta',o:mk.id,v:{r:k.id}});KK.addLink(P,N(pa).id,'rpu',N(t,600,600).id,'e');
 KK.repair(P);APP.renderAll();return {pa:pa.id,na:na.id,al:al.id,cN:cN.id,cPu:cPu.id,cPe:cPe.id,mk:mk.id};})()"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in (1440,1280,390,320):
            mob=W<500;H=844 if mob else 900
            ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            cdp=await ctx.new_cdp_session(pg)
            async def T(typ,pts):await cdp.send('Input.dispatchTouchEvent',{'type':typ,'touchPoints':[{'x':x,'y':y,'id':i} for i,(x,y) in enumerate(pts)]})
            async def drag(a,t,steps=10,peru=False):
                if mob:
                    await T('touchStart',[a])
                    for i in range(1,steps+1):await T('touchMove',[(a[0]+(t[0]-a[0])*i/steps,a[1]+(t[1]-a[1])*i/steps)])
                    await T('touchCancel' if peru else 'touchEnd',[]);await pg.wait_for_timeout(200)
                else:await veda(pg,a,t,steps)
            async def tap(sel):
                if mob:await pg.tap(sel)
                else:await pg.click(sel)
                await pg.wait_for_timeout(150)
            await pg.fill('#wname','Raahaus');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP)
            def S(i):return '#uels .ue[data-id="%s"]'%i
            async def bb(i):return await pg.locator(S(i)).bounding_box()
            async def val(i):return await pg.evaluate("APP.ev().val('%s')"%i)
            async def omi(i,k):return await pg.evaluate("APP.ev().omiNum('%s','%s',-1)"%(i,k))
            if not mob:
                await pg.click(S(I['pa']));await pg.wait_for_timeout(150)
                assert await pg.locator('#insp #raahsec').count()==1,'Käyttöraahaus-osio'
                assert await pg.locator('#insp #raahsec input[data-k="raah"]').is_checked()
                assert await pg.locator('#insp #raahsec [data-seg="rpa"]').count()==2
                await pg.evaluate("APP.S.sel=null;APP.renderAll()")
            assert await pg.locator(S(I['pa'])+'.raah').count()==0,'muokatessa ei raahausluokkaa'
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            assert await pg.locator(S(I['pa'])+'.raah').count()==1,'lukittuna raahattava'
            # 1 vapaa raahaus: seuraa tartuntakohdasta, ei hyppää
            r0=await bb(I['pa']);a=[r0['x']+12,r0['y']+12]
            await drag(a,[a[0]+90,a[1]+40])
            r1=await bb(I['pa'])
            assert abs(r1['x']-r0['x']-90)<2.5 and abs(r1['y']-r0['y']-40)<2.5,(W,r0,r1)
            assert await val(I['cPu'])==1,'pudotettu'
            x1=await omi(I['pa'],'x');assert x1>40,x1
            assert await pg.evaluate("APP.P.b['%s'].x"%I['pa'])==40,'rakenne ennallaan'
            # 2 painike: napautus toimii, raahaus ei paina
            await tap(S(I['na']));assert await val(I['cN'])==1,'napautus painaa'
            n0=await bb(I['na']);c=[n0['x']+n0['width']/2,n0['y']+n0['height']/2]
            await drag(c,[c[0]+30,c[1]+60]);await pg.wait_for_timeout(100)
            assert await val(I['cN'])==1,'raahaus ei paina'
            n1=await bb(I['na']);assert abs(n1['y']-n0['y']-60)<2.5,(n0,n1)
            # 3 vain alueisiin
            await pg.evaluate("APP.P.b['%s'].rpa='alue'"%I['pa'])
            # Alue ei näy käytössä: sen ruutupaikka lasketaan Palan paikasta ja mittakaavasta.
            r1=await bb(I['pa']);k=r1['width']/60;px=await omi(I['pa'],'x');py=await omi(I['pa'],'y')
            kb={'x':r1['x']+(180-px)*k,'y':r1['y']+(420-py)*k,'width':160*k,'height':160*k}
            await drag([r1['x']+r1['width']/2,r1['y']+r1['height']/2],[kb['x']+kb['width']/2,kb['y']+kb['height']/2])
            assert await val(I['mk'])=='Kori','tapahtuma.kohde'
            r2=await bb(I['pa']);assert abs((r2['x']+r2['width']/2)-(kb['x']+kb['width']/2))<2.5,(r2,kb)
            await pg.screenshot(path='appiappi19_raahaus_%d.png'%W)
            pe0=await val(I['cPe'])
            await drag([r2['x']+30,r2['y']+30],[r2['x']+30,max(5,kb['y']-120)])
            r3=await bb(I['pa']);assert abs(r3['y']-r2['y'])<1 and abs(r3['x']-r2['x'])<1,'hylätty palaa (%s %s)'%(r2,r3)
            assert await val(I['cPe'])==pe0+1,'raahaus peruttu'
            # 4 sormella keskeytynyt kosketus perii
            if mob:
                pe1=await val(I['cPe']);xb=await omi(I['pa'],'x')
                await drag([r3['x']+30,r3['y']+30],[r3['x']+90,r3['y']+30],peru=True)
                assert await val(I['cPe'])==pe1+1,'keskeytys = peruttu'
                assert await omi(I['pa'],'x')==xb,'keskeytys ei siirrä'
                r4=await bb(I['pa']);assert abs(r4['x']-r3['x'])<1,(r3,r4)
            # 5 lukitus pois: rakenne ennallaan
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            assert await pg.evaluate("APP.P.b['%s'].x"%I['pa'])==40
            print(W,'ok');assert not errs,errs
            await ctx.close()
        await b.close()
asyncio.run(main())
