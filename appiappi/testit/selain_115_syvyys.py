# Jonon 17c (F42 vaihe 1, suunnitelma 26): kerroksen syvyys. Puhelinnäkymä, kolme kerrosta (Vuoret 900, Puut 300, Pohja pinnassa),
# kussakin samankokoinen Muoto. Käytössä: koko 10 / 25 / 100 %, kameran siirto 100 px liikuttaa niitä 10 / 25 / 100 px,
# syvän kerroksen Alue ottaa napautuksen siitä, missä se näkyy. Muokatessa syvä kerros näkyy alkuhetken kuvana ja raahaus
# seuraa osoitinta; kerrosrivin valikko, oma syvyys, Säilytä näkyvä koko ja Kumoa; este eri syvyydellä -varoitus.
# Tietokone 1440 ja 1280 hiirellä, 390 kosketuksella savutestinä. Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0];v.laite='puhelin';var vw=v.id;
 v.kr=[{id:'k1',n:'Vuoret',sy:900},{id:'k2',n:'Puut',sy:300},{id:'pohja',n:'Pohja'}];
 function U(k,o,x,y,w,h,nm){o.v=vw;var b=KK.addBlock(P,k,o);b.x=x;b.y=y;b.w=w;b.h=h;KK.setName(P,b.id,nm);return b;}
 var a=U('muoto',{laji:'laatikko',hue:1},100,200,100,100,'Vuori');a.kr='k1';
 var b=U('muoto',{laji:'laatikko',hue:2},100,200,100,100,'Puu');b.kr='k2';
 var c=U('muoto',{laji:'laatikko',hue:3},100,200,100,100,'Kivi');
 var al=U('alue',{},100,500,200,200,'Kaukoalue');al.kr='k2';
 var maa=U('alue',{},-800,-800,2400,2400,'Maa');v.kam={ra:maa.id};v.lrul='kaikki';
 var y=0;function N(b){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,0,(y+=60));}
 var m=KK.addBlock(P,'muisti',{v:'0'});KK.setName(P,m.id,'Napautuksia');N(m);var t=KK.addBlock(P,'tee',{do:'lisaa',o:m.id});KK.addLink(P,N(al).id,'nap',N(t).id,'e');
 KK.repair(P);APP.renderAll();return {a:a.id,b:b.id,c:c.id,al:al.id};})()"""
RECT="(i)=>{var e=document.querySelector('.ue[data-id=\"'+i+'\"]'),r=e.getBoundingClientRect();return [r.left,r.top,r.width,r.height];}"
async def main():
    async with async_playwright() as p:
        for W in (1440,1280,390):
            mob=W<500
            b=await p.chromium.launch();errs=[]
            ctx=await b.new_context(viewport={'width':W,'height':844 if mob else 900},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_function("window.APP&&APP.P!==undefined")
            await pg.fill('#wname','Syvyys');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            # Muokatessa: syvät kerrokset pienempinä kehyksen keskikohtaa kohti
            ra=await pg.evaluate(RECT,I['a']);rb=await pg.evaluate(RECT,I['b']);rc=await pg.evaluate(RECT,I['c'])
            print(W,'muokatessa leveydet',round(ra[2],1),round(rb[2],1),round(rc[2],1))
            assert abs(ra[2]/rc[2]-0.1)<0.01 and abs(rb[2]/rc[2]-0.25)<0.01,'muokatessa alkuhetken kuva'
            await pg.click('#lockbtn');await pg.wait_for_timeout(400)
            ra=await pg.evaluate(RECT,I['a']);rb=await pg.evaluate(RECT,I['b']);rc=await pg.evaluate(RECT,I['c'])
            assert abs(ra[2]/rc[2]-0.1)<0.01 and abs(rb[2]/rc[2]-0.25)<0.01,'käytössä koko syvyydestä'
            # Kamera 100 px (ruudulla) oikealle: pinta liikkuu 100, Puut 25, Vuoret 10
            print(W,'kamera',await pg.evaluate("(()=>{var c=APP.P.cam[APP.P.views[0].id];c.x-=100;APP.renderUIStage();return c;})()"));await pg.wait_for_timeout(100)
            ra2=await pg.evaluate(RECT,I['a']);rb2=await pg.evaluate(RECT,I['b']);rc2=await pg.evaluate(RECT,I['c'])
            d=[ra[0]-ra2[0],rb[0]-rb2[0],rc[0]-rc2[0]];print(W,'siirtymät',[round(x,2) for x in d])
            assert abs(d[2]-100)<0.6 and abs(d[1]-25)<0.6 and abs(d[0]-10)<0.6,('parallaksi syvyydestä',d)
            # Napautus Alueeseen siellä, missä se näkyy (Alue on Puut-kerroksessa, 25 %)
            vis=await pg.evaluate("(i)=>{var b=APP.P.b[i],c=APP.P.cam[APP.P.views[0].id],vp=document.querySelector('#uvp'),nk={x:c.x,y:c.y,z:c.z,zf:c.zf||1,w:vp.clientWidth,h:vp.clientHeight},m=KK.palikkaMuunnos(APP.P,APP.ev(),b,nk),r=vp.getBoundingClientRect();"+
              "return [r.left+c.x+(b.x*m.s+m.x)*c.z,r.top+c.y+(b.y*m.s+m.y)*c.z,b.w*m.s*c.z,b.h*m.s*c.z];}",I['al'])
            kx,ky=vis[0]+vis[2]/2,vis[1]+vis[3]/2
            if mob:await pg.touchscreen.tap(kx,ky)
            else:await pg.mouse.click(kx,ky)
            await pg.wait_for_timeout(250);n=await P(pg,"E().val(B('Napautuksia').id)");print(W,'napautus näkyvään',n)
            assert n==1,'Alue ottaa napautuksen siitä, missä se näkyy'
            if mob:
                print(W,'ok (savutesti)','errs',errs);assert not errs;await b.close();continue
            # Takaisin muokkaukseen: raahaus syvässä kerroksessa seuraa osoitinta (40 px ruudulla = 40/z/0,25 kerroksessa)
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            z=await P(pg,"P.cam[P.views[0].id].z");x0=await P(pg,"B('Puu').x");rb=await pg.evaluate(RECT,I['b'])
            await veda(pg,[rb[0]+rb[2]/2,rb[1]+rb[3]/2],[rb[0]+rb[2]/2+40,rb[1]+rb[3]/2])
            x1=await P(pg,"B('Puu').x");rb3=await pg.evaluate(RECT,I['b']);print(W,'raahaus',x0,'→',x1,'ruudulla',round(rb3[0]-rb[0],1))
            assert abs(rb3[0]-rb[0]-40)<=2.5,'palikka pysyy osoittimen alla'
            # Kaista A:n ⇢ (Appi-appi 74) ja kahva pysyvät tavallisen kokoisina syvässäkin kerroksessa; ⌘C/⌘V pitää kerroksen
            tg=await pg.evaluate("(()=>{var t=document.querySelector('.ue.sel .tolg'),q=t.getBoundingClientRect(),h=document.elementFromPoint(q.left+q.width/2,q.top+q.height/2);return [q.width,!!(h&&h.closest('.tolg'))];})()")
            print(W,'⇢ syvässä kerroksessa',tg);assert abs(tg[0]-22)<1.5 and tg[1],'⇢ tavallisen kokoinen ja päällimmäisenä'
            await pg.keyboard.press('Control+c');await pg.keyboard.press('Control+v');await pg.wait_for_timeout(200)
            assert await P(pg,"Object.values(P.b).filter(b=>b.nm==='Puu 2').map(b=>b.kr)")==['k2'],'kopio samaan kerrokseen'
            await pg.keyboard.press('Control+z');await pg.wait_for_timeout(150)
            # Paneeli: kerrosrivin valikko ja oma syvyys
            await pg.evaluate("(()=>{APP.S.sel=null;APP.S.multi=[];APP.renderAll();})()");await pg.wait_for_timeout(100)
            await pg.select_option('select[data-krv="k2"]','sy100');await pg.wait_for_timeout(100)
            assert await P(pg,"P.views[0].kr.filter(k=>k.id==='k2')[0].sy")==100
            rb=await pg.evaluate(RECT,I['b']);rc=await pg.evaluate(RECT,I['c']);assert abs(rb[2]/rc[2]-0.5)<0.01,'100 = puolet'
            # Säilytä näkyvä koko: syvyys 100 → 300, alkukuva pysyy, palikka kasvaa kerroksessa
            await pg.check('input[data-krsk="k2"]');w0=await P(pg,"B('Puu').w")
            await pg.fill('input[data-krsy="k2"]','300');await pg.press('input[data-krsy="k2"]','Enter');await pg.wait_for_timeout(150)
            await pg.evaluate("document.activeElement&&document.activeElement.blur()");await pg.wait_for_timeout(100)
            rb2=await pg.evaluate(RECT,I['b']);w1=await P(pg,"B('Puu').w");print(W,'säilytä näkyvä koko',w0,'→',w1,'ruudulla',round(rb[2],1),round(rb2[2],1))
            assert await P(pg,"P.views[0].kr.filter(k=>k.id==='k2')[0].sy")==300
            assert abs(w1-w0*2)<0.02 and abs(rb2[2]-rb[2])<0.6 and abs(rb2[0]-rb[0])<0.6,'näkyvä koko ja paikka säilyivät'
            await pg.keyboard.press('Control+z');await pg.wait_for_timeout(150)
            assert await P(pg,"P.views[0].kr.filter(k=>k.id==='k2')[0].sy")==100 and abs(await P(pg,"B('Puu').w")-w0)<0.02,'Kumoa palauttaa'
            # Oma syvyys -valinta ja etuala
            await pg.evaluate("(()=>{APP.S.sel=null;APP.S.multi=[];APP.renderAll();})()")
            await pg.select_option('select[data-krv="k2"]','syoma');await pg.wait_for_timeout(100);await pg.uncheck('input[data-krsk="k2"]')
            await pg.fill('input[data-krsy="k2"]','-50');await pg.press('input[data-krsy="k2"]','Enter');await pg.wait_for_timeout(150)
            rb=await pg.evaluate(RECT,I['b']);rc=await pg.evaluate(RECT,I['c']);print(W,'etuala',round(rb[2]/rc[2],3))
            assert abs(rb[2]/rc[2]-2)<0.02,'etuala −50 = kaksinkertainen'
            # Takaisin rullausvauhtiin: syvyys pois
            await pg.select_option('select[data-krv="k2"]','50');await pg.wait_for_timeout(100)
            k2=await P(pg,"P.views[0].kr.filter(k=>k.id==='k2')[0]");assert k2.get('rv')==50 and 'sy' not in k2,k2
            # Este eri syvyydellä: Vuoret este, pinnan Kivi liikkuu
            await pg.evaluate("(()=>{var P=APP.P;P.views[0].kr[0].este=true;var l=KK.addBlock(P,'liike',{o:Object.values(P.b).filter(b=>b.nm==='Kivi')[0].id});KK.addNode(P,l.id,0,400);KK.repair(P);APP.S.sel=null;APP.S.multi=[];APP.renderAll();})()")
            await pg.wait_for_timeout(100);tx=await pg.inner_text('#insp');assert 'Este on eri syvyydellä kuin ”Kivi”' in tx,'varoitus'
            await pg.screenshot(path='selain_syvyys_%d.png'%W)
            print(W,'ok','errs',errs);assert not errs;await b.close()
asyncio.run(main())
