# Appi-appi 20 (F12, 2. osa) selaimessa. Leveydet 1440 ja 1280 (hiiri) sekä 390 ja 320 (sormi CDP:llä).
# Toistimen Järjestä raahaamalla: kortti raahataan uuteen paikkaan (hiirellä veto, sormella pitkä painallus), katkoviiva
# näyttää paikan, taulukon järjestys ja kortit vaihtuvat, tapahtuma rivi siirretty. Sormella nopea pyyhkäisy ei raahaa.
# Kortin painike Siirrä rivi alas (tapahtuman rivi) ei käynnistä raahausta. Vain alueisiin: alueet näkyvät raahatessa,
# kohdealue korostuu ja korostus poistuu pudotettaessa. Reunavieritys: kamera rullaa, kun palikkaa pidetään reunalla.
# Kuvat appiappi20_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0];v.laite='puhelin';var vw=v.id;
 function N(b,x,y){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,x||0,y||0);}
 function U(k,o,x,y,w,h,nm){o.v=vw;var b=KK.addBlock(P,k,o);b.x=x;b.y=y;b.w=w;b.h=h;KK.setName(P,b.id,nm);return b;}
 var t=KK.addBlock(P,'taulu',{nm:'Tehtävät'});N(t,0,0);var c1=KK.addCol(t,'Nimi','teksti');
 var R=['Yksi','Kaksi','Kolme','Neljä'].map(function(x){var r=KK.tAddRow(P,t.id,false);KK.tEdit(P,t.id,false,r,c1.id,x);return r;});
 var T=U('toistin',{tsu:'sarake',kh:60,vali:8,kw:0,tlaj:true},20,90,330,300,'Kortit');KK.addLink(P,N(t).id,'rj',N(T,300,0).id,'rv');
 var al=U('nappi',{tx:'Alas',tst:T.id},240,100,90,40,'Alas');
 var te=KK.addBlock(P,'tee',{do:'siirrarivi',o:t.id,rsu:'alas',rl:'tapahtuma'});KK.addLink(P,N(al,300,200).id,'e',N(te,600,200).id,'e');
 var m=KK.addBlock(P,'muisti',{v:'0'});N(m,900,0);var tl=KK.addBlock(P,'tee',{do:'lisaa',o:m.id});KK.addLink(P,N(T).id,'rsi',N(tl,600,0).id,'e');
 var pa=U('muoto',{laji:'laatikko',hue:2},30,470,50,50,'Pala');pa.raah=true;pa.rpa='alue';
 var ko=U('alue',{},200,450,110,110,'Kori');
 KK.repair(P);APP.renderAll();return {t:t.id,T:T.id,R:R,m:m.id,pa:pa.id,ko:ko.id};})()"""
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
            async def alas(a):
                if mob:await T('touchStart',[a])
                else:await pg.mouse.move(a[0],a[1]);await pg.mouse.down()
            async def liiku(a,t,steps=10):
                for i in range(1,steps+1):
                    q=(a[0]+(t[0]-a[0])*i/steps,a[1]+(t[1]-a[1])*i/steps)
                    if mob:await T('touchMove',[q])
                    else:await pg.mouse.move(q[0],q[1])
                await pg.wait_for_timeout(50)
            async def ylos():
                if mob:await T('touchEnd',[])
                else:await pg.mouse.up()
                await pg.wait_for_timeout(250)
            await pg.fill('#wname','Lajittelu');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP)
            R=I['R']
            async def jarj():return await pg.evaluate("KK.tRows(APP.P,'%s').map(r=>r.id)"%I['t'])
            async def kortit():return await pg.evaluate("[...document.querySelectorAll('#uels [data-id=\"%s\"] .tcard[data-row]')].sort((a,b)=>parseFloat(a.style.top)-parseFloat(b.style.top)).map(c=>c.getAttribute('data-row'))"%I['T'])
            async def val(i):return await pg.evaluate("APP.ev().val('%s')"%i)
            def C(r):return '#uels [data-id="%s"] .tcard[data-row="%s"]'%(I['T'],r)
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            assert await kortit()==R,await kortit()
            # 1 kortin raahaus kaksi paikkaa alas
            c=await pg.locator(C(R[0])).bounding_box();k=c['height']/60;a=[c['x']+30,c['y']+c['height']/2]
            await alas(a)
            if mob:await pg.wait_for_timeout(450)
            await liiku(a,[a[0],a[1]+136*k])
            assert await pg.locator('#uels .tslot').count()==1,'paikan katkoviiva'
            assert await pg.locator(C(R[0])+'.raahataan').count()==1
            await pg.screenshot(path='appiappi20_kortti_%d.png'%W)
            await ylos()
            assert await jarj()==[R[1],R[2],R[0],R[3]],await jarj()
            assert await kortit()==[R[1],R[2],R[0],R[3]],await kortit()
            assert await pg.locator('#uels .tslot').count()==0
            assert await val(I['m'])==1,'rivi siirretty'
            assert await pg.evaluate("APP.P.b['%s'].rv.map(r=>r.id)"%I['t'])==R,'lähtöaineisto ennallaan'
            # 2 sormella nopea pyyhkäisy ei raahaa
            if mob:
                c=await pg.locator(C(R[1])).bounding_box();a=[c['x']+30,c['y']+30]
                await T('touchStart',[a]);await liiku(a,[a[0],a[1]+120],5);await T('touchEnd',[]);await pg.wait_for_timeout(250)
                assert await jarj()==[R[1],R[2],R[0],R[3]],'pyyhkäisy ei raahaa'
                assert await pg.locator('#uels .tcard.raahataan').count()==0
            # 3 kortin painike Siirrä rivi alas (ensimmäinen kortti = Kaksi)
            bsel=C(R[1])+' .ue[data-id]'
            if mob:await pg.tap(bsel)
            else:await pg.click(bsel)
            await pg.wait_for_timeout(250)
            assert await jarj()==[R[2],R[1],R[0],R[3]],await jarj()
            assert await val(I['m'])==1,'painike ei ole raahaus'
            # 4 pudotusalueen korostus
            pb=await pg.locator('#uels .ue[data-id="%s"]'%I['pa']).bounding_box();z=pb['width']/50
            a=[pb['x']+pb['width']/2,pb['y']+pb['height']/2];ko=[a[0]+200*z,a[1]+10*z]
            await alas(a);await liiku(a,[a[0]+10,a[1]],3)
            assert await pg.locator('#uels .raahko').count()==1,'alue näkyy'
            assert await pg.locator('#uels .raahko.on').count()==0
            await liiku([a[0]+10,a[1]],ko)
            assert await pg.locator('#uels .raahko.on').count()==1,'kohdealue korostuu'
            await pg.screenshot(path='appiappi20_korostus_%d.png'%W)
            await ylos()
            assert await pg.locator('#uels .raahko').count()==0,'korostus pois'
            assert await pg.evaluate("APP.ev().omiNum('%s','x',0)"%I['pa'])>150,'pudotettu Koriin'
            # 5 reunavieritys: maailma rullaa kaikkiin suuntiin ja ulottuu ruudun alapuolelle
            await pg.evaluate("(function(){var P=APP.P,v=P.views[0];v.lrul='kaikki';var f=KK.addBlock(P,'muoto',{v:v.id});f.x=20;f.y=1600;f.w=40;f.h=40;KK.setName(P,f.id,'Kaukana');KK.repair(P);APP.renderAll();})()");await pg.wait_for_timeout(150)
            cy0=await pg.evaluate("APP.P.cam[APP.S.vw].y");y0=await pg.evaluate("APP.ev().omiNum('%s','y',0)"%I['pa'])
            await pg.evaluate("APP.P.b['%s'].rpa=''"%I['pa'])
            pb=await pg.locator('#uels .ue[data-id="%s"]'%I['pa']).bounding_box();vp=await pg.locator('#uvp').bounding_box()
            a=[pb['x']+pb['width']/2,pb['y']+pb['height']/2];e=[a[0],vp['y']+vp['height']-12]
            await alas(a);await liiku(a,e)
            for i in range(6):
                await pg.wait_for_timeout(100)
                if mob:await T('touchMove',[(e[0],e[1]+(i%2))])
                else:await pg.mouse.move(e[0],e[1]+(i%2))
            await ylos()
            cy1=await pg.evaluate("APP.P.cam[APP.S.vw].y");y1=await pg.evaluate("APP.ev().omiNum('%s','y',0)"%I['pa'])
            print(W,'reuna',cy0,cy1,y0,y1)
            assert cy1<cy0-20,'kamera rullasi (%s → %s)'%(cy0,cy1)
            assert y1-y0>(e[1]-a[1])/z+15,'palikka kulki kameran mukana (%s → %s)'%(y0,y1)
            print(W,'ok');assert not errs,errs
            await ctx.close()
        await b.close()
asyncio.run(main())
