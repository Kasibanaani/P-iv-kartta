# Jonon 1p (keveys): tekoprojekti (ei Emilin projekteja: repo on julkinen), jossa ~400 seinää, hahmo, tatti ja seuraava
# kamera sekä ~130 logiikan solmua. Rajat: lukitussa käytössä tattia pidettäessä vähintään 30 kuvaa/s ja moottori alle
# 8 ms kuvassa, logiikan uudelleenpiirto ilman muutosta alle 15 ms (ennen 1p:tä 22 ms). Lisäksi oikeellisuus: ruudun ulkopuoliset seinät
# ohitetaan, kaukainen seinä piirtyy oikeaan kohtaan, kun hahmo menee sen luo, ja muuttumaton logiikan solmu jää
# paikalleen, muuttunut vaihtuu. Tietokone 1440 ja 1280 hiirellä, 390 savutestinä (vain oikeellisuus). Ei oikeaa iPhonea.
# Jonon 1s: sama 400 seinää joukon jäseninä ja Joukko-palikan sääntö (jäsen.x), sama raja.
# Pilvikoneen luvut ovat suuntaa antavia; raja on väljä, jotta se kertoo hidastumisesta eikä koneen kuormasta.
import asyncio, os, math, time
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0],vw=v.id;
 v.laite='puhelin';v.kr=[{id:'pohja',n:'Pohja'},{id:'k1',n:'Seinät',este:true},{id:'k2',n:'Kojelauta',rv:0}];
 var h=KK.addBlock(P,'muoto',{v:vw});KK.setName(P,h.id,'Hahmo');h.x=185;h.y=400;h.w=20;h.h=20;
 var t=KK.addBlock(P,'tatti',{v:vw});KK.setName(P,t.id,'Tatti');t.kr='k2';t.x=115;t.y=620;t.w=160;t.h=160;
 var li=KK.addBlock(P,'liike',{o:h.id,ohj:'tatti',tt:t.id,vm:220});KK.setName(P,li.id,'Kävely');KK.addNode(P,li.id,20,20);
 v.kam={o:h.id,ka:0,pe:0};
 var n=0,far=null;for(var gx=-2000;gx<=2000&&n<400;gx+=200)for(var gy=-2000;gy<=2000&&n<400;gy+=200){if(Math.abs(gx-185)<300&&Math.abs(gy-400)<300)continue;
   var s=KK.addBlock(P,'muoto',{v:vw});s.kr='k1';s.x=gx;s.y=gy;s.w=60;s.h=12;s.hue=n%8;n++;if(gx===1800&&gy===-1800)far=s.id;}
 var mem=[];for(var i=0;i<100;i++){var m=KK.addBlock(P,'muisti',{v:String(i)});KK.addNode(P,m.id,300+(i%10)*190,40+Math.floor(i/10)*70);mem.push(m.id);}
 var kv=KK.addBlock(P,'kaava',{});KK.addNode(P,kv.id,20,120);kv.f=KK.kaavaToIds(P,'hahmo.x + hahmo.y');
 for(var c=0;c<3;c++){var k=KK.addBlock(P,'ketju');var kn=KK.addNode(P,k.id,20+c*420,800);var prev=null;
   for(var j=0;j<10;j++){var a=KK.addBlock(P,'tee',{do:'lisaa',o:mem[c],v:'1'});var an=KK.addNode(P,a.id,40+c*420+(j%2)*170,840+j*60,kn.id);if(prev)KK.addLink(P,prev.id,'sitten',an.id,'e');prev=an;}}
 P.lcam={x:0,y:0,z:0.5};KK.repair(P);KK.tick(P,{now:function(){return new Date();}});APP.saveNow();APP.renderAll();
 return {h:h.id,t:t.id,far:far,mem:mem[50],memN:KK.nodesOfBlock(P,mem[50])[0].id,mem2N:KK.nodesOfBlock(P,mem[51])[0].id,n:n};})()"""
KERAA="""window.__fr=[];window.__on=true;(function f(t){if(!window.__on)return;window.__fr.push(t);requestAnimationFrame(f);})(performance.now());
window.__kf=0;window.__kn=0;if(!window.__of){window.__of=KK.frame;KK.frame=function(){var a=performance.now();var r=window.__of.apply(this,arguments);window.__kf+=performance.now()-a;window.__kn++;return r;};}0;"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();tulos={}
        for W in ((int(os.environ['VAIN']),) if os.environ.get('VAIN') else (1440,1280,390)):
            mob=W<500;H=844 if mob else 900
            ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Keveys');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(200);assert I['n']==400 and I['far'],I
            # 1 Logiikka: muuttumaton solmu jää paikalleen, muuttunut vaihtuu; uudelleenpiirto nopea
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(300)
            r=await pg.evaluate("""(function(){var q=function(id){return document.querySelector('#lworld [data-nid="'+id+'"]');};var a=q('%s'),c=q('%s');APP.renderLogicStage();
              var same=q('%s')===a&&q('%s')===c;APP.P.st['%s']=777;KK.tick(APP.P,APP.ctx());APP.renderLogicStage();var vaihtui=q('%s')!==a,pysyi=q('%s')===c,txt=q('%s').textContent;
              var t=[];for(var i=0;i<7;i++){var s=performance.now();APP.renderLogicStage();t.push(performance.now()-s);}t.sort(function(x,y){return x-y;});
              return {same:same,vaihtui:vaihtui,pysyi:pysyi,txt:txt,ms:t[3],solmuja:document.querySelectorAll('#lels > [data-nid]').length};})()"""%(I['memN'],I['mem2N'],I['memN'],I['mem2N'],I['mem'],I['memN'],I['mem2N'],I['memN']))
            assert r['same'],('muuttumaton solmu vaihtui',r);assert r['vaihtui'] and r['pysyi'],r;assert '777' in r['txt'],r
            assert r['solmuja']>=130,r
            if not mob:assert r['ms']<15,('logiikan piirto liian hidas',r)
            tulos['logiikka_ms_%d'%W]=round(r['ms'],1)
            await pg.screenshot(path='appiappi_1p_logiikka_%d.png'%W)
            # 2 Lukittu käyttö: tattia pidetään, kamera seuraa; ruudun ulkopuoliset seinät ohitetaan
            await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(200)
            await pg.click('#lockbtn');await pg.wait_for_timeout(400)
            x0=await pg.evaluate("KK.rectNow(APP.P,APP.ev(),APP.P.b['%s']).x"%I['h'])
            await pg.evaluate(KERAA)
            bb=await pg.locator('.ue[data-id="%s"]'%I['t']).bounding_box();cx,cy=bb['x']+bb['width']/2,bb['y']+bb['height']/2
            await pg.mouse.move(cx,cy);await pg.mouse.down();T=3.0 if not mob else 1.0;t0=time.time();i=0
            while time.time()-t0<T:
                a=i*0.05;await pg.mouse.move(cx+bb['width']*0.4*math.cos(a),cy-bb['height']*0.4*abs(math.sin(a)));i+=1;await pg.wait_for_timeout(30)
            await pg.mouse.up();await pg.evaluate("window.__on=false")
            fr=await pg.evaluate("window.__fr");kf=await pg.evaluate("[window.__kf,window.__kn]")
            fps=(len(fr)-1)/((fr[-1]-fr[0])/1000);kms=kf[0]/max(1,kf[1])
            x1=await pg.evaluate("KK.rectNow(APP.P,APP.ev(),APP.P.b['%s']).x"%I['h']);assert abs(x1-x0)>20,('hahmo ei liikkunut',x0,x1)
            off=await pg.evaluate("Array.prototype.filter.call(document.querySelectorAll('#uels .ue'),function(e){return e._off;}).length")
            assert off>300,('ruudun ulkopuoliset piirretään',off)
            if not mob:
                assert fps>=30,('liian vähän kuvia sekunnissa',round(fps,1))
                assert kms<8,('moottori liian hidas kuvassa',round(kms,2))
            tulos['kuvaa_s_%d'%W]=round(fps,1);tulos['moottori_ms_%d'%W]=round(kms,2)
            # 3 Kaukainen seinä piirtyy oikeaan kohtaan, kun hahmo siirretään sen luo (kamera seuraa heti)
            fx=await pg.evaluate("APP.P.b['%s'].x"%I['far']);fy=await pg.evaluate("APP.P.b['%s'].y"%I['far'])
            ennen=await pg.evaluate("document.querySelector('.ue[data-id=\"%s\"]')._off"%I['far']);assert ennen,'kaukainen seinä ohitettu alussa'
            await pg.evaluate("(function(){var P=APP.P;KK.setOmi(P,'%s','x',%d);KK.setOmi(P,'%s','y',%d);KK.tick(P,APP.ctx());APP.renderAll();APP.runFrames();})()"%(I['h'],fx+20,I['h'],fy+60))
            await pg.wait_for_timeout(500)
            el=await pg.evaluate("(function(){var e=document.querySelector('.ue[data-id=\"%s\"]');var r=e.getBoundingClientRect(),v=document.querySelector('#uvp').getBoundingClientRect();return {off:!!e._off,left:e.style.left,top:e.style.top,nak:r.right>v.left&&r.left<v.right&&r.bottom>v.top&&r.top<v.bottom};})()"%I['far'])
            assert not el['off'] and el['left']=='%dpx'%fx and el['top']=='%dpx'%fy and el['nak'],el
            await pg.screenshot(path='appiappi_1p_kaytto_%d.png'%W)
            # 4 (jonon 1s, kartoitus 9 S4): samat 400 seinää joukon jäseninä ja Joukko-palikalla säännöt näkyy kun ja siirto x, jotka lukevat jäsentä.
            #   Raja sama: vähintään 30 kuvaa/s ja moottori alle 8 ms (ennen 1s:ää 39 kuvaa/s ja 12 ms).
            if not mob:
                await pg.click('#lockbtn');await pg.wait_for_timeout(200)
                nj=await pg.evaluate("""(function(){var P=APP.P,J=KK.jkLuo(P,'seinat'),n=0;Object.keys(P.b).forEach(function(i){var b=P.b[i];if(b.k==='muoto'&&b.kr==='k1'){b.jkt=[J];n++;}});
                  var pj=KK.addBlock(P,'pjoukko',{jj:J});KK.addNode(P,pj.id,20,300);pj.jsr=[{p:'nk',f:KK.kaavaToIds(P,'jäsen.x > -5000')},{p:'dx',f:KK.kaavaToIds(P,'jäsen.y / 1000')}];KK.repair(P);KK.tick(P,APP.ctx());APP.saveNow();APP.renderAll();
                  return [n,APP.ev().jkJasenet(J).length,KK.isErr(APP.ev().val(pj.id))];})()""")
                assert nj[0]==400 and nj[1]==400 and not nj[2],nj
                await pg.click('#lockbtn');await pg.wait_for_timeout(400)
                await pg.evaluate("(function(){var P=APP.P;KK.setOmi(P,'%s','x',185);KK.setOmi(P,'%s','y',400);KK.tick(P,APP.ctx());APP.renderAll();})()"%(I['h'],I['h']));await pg.wait_for_timeout(200)
                await pg.evaluate("window.__kf=0;window.__kn=0;window.__fr=[];window.__on=true;(function f(t){if(!window.__on)return;window.__fr.push(t);requestAnimationFrame(f);})(performance.now());")
                bb=await pg.locator('.ue[data-id="%s"]'%I['t']).bounding_box();cx,cy=bb['x']+bb['width']/2,bb['y']+bb['height']/2
                await pg.mouse.move(cx,cy);await pg.mouse.down();t0=time.time();i=0
                while time.time()-t0<3.0:
                    a=i*0.05;await pg.mouse.move(cx+bb['width']*0.4*math.cos(a),cy-bb['height']*0.4*abs(math.sin(a)));i+=1;await pg.wait_for_timeout(30)
                await pg.mouse.up();await pg.evaluate("window.__on=false")
                fr=await pg.evaluate("window.__fr");kf=await pg.evaluate("[window.__kf,window.__kn]")
                fps2=(len(fr)-1)/((fr[-1]-fr[0])/1000);kms2=kf[0]/max(1,kf[1])
                assert fps2>=30,('joukon säännöllä liian vähän kuvia sekunnissa',round(fps2,1))
                assert kms2<8,('joukon säännöllä moottori liian hidas',round(kms2,2))
                tulos['joukko_kuvaa_s_%d'%W]=round(fps2,1);tulos['joukko_moottori_ms_%d'%W]=round(kms2,2)
            await ctx.close()
            print('ok',W,'errs',errs);assert not errs,errs
        print('keveys',tulos)
        await b.close()
asyncio.run(main())
