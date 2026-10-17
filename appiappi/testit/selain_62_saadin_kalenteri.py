# Appi-appi 21 (1440 ja 1280 hiirellä, 390 ja 320 sormella CDP:llä). Säädin: vedetään yhdellä vedolla päästä päähän niin,
# ettei liukusäädin saa kohdistusta (iPhonen Safarin tapa); arvo ja luku kulkevat vedon aikana ja koko matkan.
# Kalenteri: päivän napautus valitsee (korostus, valitun päivän lista lähteistä kellonaikoineen, päivä valittu -tapahtuma),
# uusi napautus poistaa valinnan, valinta Näytä valitun päivän asiat pois piilottaa listan. Kuvat appiappi21_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0];v.laite='puhelin';var vw=v.id;
 function U(k,o,x,y,w,h,nm){o.v=vw;var b=KK.addBlock(P,k,o);b.x=x;b.y=y;b.w=w;b.h=h;KK.setName(P,b.id,nm);return b;}
 function N(b,x,y){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,x||0,y||0);}
 var sl=U('saadin',{tx:'Vauhti',min:0,max:10,start:0},20,20,300,76,'Vauhti');
 var li=U('lista',{tx:'Tehtävät'},20,600,300,120,'Tehtävät'),ai=U('aika',{tx:'Kirjaukset'},20,740,300,100,'Kirjaukset');
 var d=new Date(),t=KK.iso(d);d.setHours(9,5,0,0);var t9=d.getTime();d.setHours(17,30,0,0);
 P.st[li.id]={rows:[{id:'r1',tx:'Kauppa',c:false,d:t},{id:'r2',tx:'Posti',c:true,d:t},{id:'r3',tx:'Muu päivä',c:false,d:'2020-01-01'}]};
 P.st[ai.id]=[{t:d.getTime(),tx:'Lenkki'},{t:t9,tx:'Aamupala'}];
 var ca=U('kalenteri',{tx:'',lahteet:[li.id,ai.id]},20,110,330,380,'Kalenteri');
 var m=KK.addBlock(P,'muisti',{v:'0'});N(m,900,0);var te=KK.addBlock(P,'tee',{do:'lisaa',o:m.id});KK.addLink(P,N(ca,300,0).id,'e',N(te,600,0).id,'e');
 KK.repair(P);APP.renderAll();return {sl:sl.id,ca:ca.id,m:m.id,t:t};})()"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in (1440,1280,390,320):
            mob=W<500;H=844 if mob else 900
            ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            # Safarin tapa: liukusäädin ei saa kohdistusta.
            await pg.evaluate("document.addEventListener('focusin',function(e){if(e.target.type==='range')e.target.blur();},true)")
            cdp=await ctx.new_cdp_session(pg)
            async def T(typ,pts):await cdp.send('Input.dispatchTouchEvent',{'type':typ,'touchPoints':[{'x':x,'y':y} for (x,y) in pts]})
            async def tap(sel):
                if mob:await pg.tap(sel)
                else:await pg.click(sel)
                await pg.wait_for_timeout(150)
            await pg.fill('#wname','Kalenteri');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP)
            def S(i):return '#uels .ue[data-id="%s"]'%i
            async def val(i):return await pg.evaluate("(function(){var v=APP.ev().val('%s');return v&&v.d?v.d:v;})()"%i)
            if not mob:
                await pg.click(S(I['ca']));await pg.wait_for_timeout(150)
                assert await pg.locator('#insp input[data-k="cls"]').is_checked(),'Näytä valitun päivän asiat'
                assert 'kalenteri.valittu' in await pg.locator('#insp').inner_text()
                await pg.evaluate("APP.S.sel=null;APP.renderAll()")
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            # 1 säädin yhdellä vedolla
            r=await pg.locator(S(I['sl'])+' input[type=range]').bounding_box()
            a=[r['x']+11,r['y']+r['height']/2];t=[r['x']+r['width']-11,a[1]];n=20
            def pt(i):return (a[0]+(t[0]-a[0])*i/n,a[1])
            if mob:
                await T('touchStart',[a])
                for i in range(1,n//2+1):await T('touchMove',[pt(i)])
            else:
                await pg.mouse.move(*a);await pg.mouse.down()
                for i in range(1,n//2+1):await pg.mouse.move(*pt(i))
            await pg.wait_for_timeout(60)
            puoli=await val(I['sl']);luku=await pg.locator(S(I['sl'])+' .row b').inner_text()
            assert 4<=puoli<=6 and luku==str(puoli),(W,puoli,luku)
            if mob:
                for i in range(n//2+1,n+1):await T('touchMove',[pt(i)])
                await T('touchEnd',[])
            else:
                for i in range(n//2+1,n+1):await pg.mouse.move(*pt(i))
                await pg.mouse.up()
            await pg.wait_for_timeout(200)
            assert await val(I['sl'])==10,(W,await val(I['sl']))
            assert await pg.locator(S(I['sl'])+' .row b').inner_text()=='10'
            # 2 kalenteri: päivän valinta ja lista
            day=S(I['ca'])+' [data-d="%s"]'%I['t']
            assert await pg.locator(S(I['ca'])+' .cl').count()==0,'ei listaa ilman valintaa'
            await tap(day)
            assert await val(I['ca'])==I['t'];assert await val(I['m'])==1,'päivä valittu'
            assert await pg.locator(day+'.sel').count()==1,'korostus'
            rivit=await pg.locator(S(I['ca'])+' .cl .cli').all_inner_texts()
            assert [x.replace('\n',' ').strip() for x in rivit]==['Kauppa','Posti','09:05Aamupala','17:30Lenkki'] or [x.replace('\n','').replace(' ','') for x in rivit]==['Kauppa','Posti','09:05Aamupala','17:30Lenkki'],rivit
            assert await pg.locator(S(I['ca'])+' .cl .cli.c').count()==1,'rastitettu yliviivattu'
            await pg.screenshot(path='appiappi21_kalenteri_%d.png'%W)
            # toinen päivä ilman merkintöjä
            muu=await pg.evaluate("(function(){var d=new Date();d.setDate(d.getDate()===1?2:1);return KK.iso(d);})()")
            await tap(S(I['ca'])+' [data-d="%s"]'%muu)
            assert await val(I['ca'])==muu and await val(I['m'])==2
            assert 'Ei merkintöjä' in await pg.locator(S(I['ca'])+' .cl').inner_text()
            # sama päivä uudelleen: valinta pois, ei tapahtumaa
            await tap(S(I['ca'])+' [data-d="%s"]'%muu)
            assert await val(I['ca']) is None and await val(I['m'])==2
            assert await pg.locator(S(I['ca'])+' .cl').count()==0 and await pg.locator(S(I['ca'])+' .sel').count()==0
            # lista pois päältä
            await pg.evaluate("APP.P.b['%s'].cls=false;APP.renderAll()"%I['ca'])
            await tap(day);assert await val(I['ca'])==I['t'];assert await pg.locator(S(I['ca'])+' .cl').count()==0,'lista piilossa'
            print(W,'ok','errs',errs)
            await ctx.close()
        await b.close()
asyncio.run(main())
