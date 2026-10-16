# Appi-appi 10: zoomaus käytössä. Puhelinnäkymä (maailma kaikkiin suuntiin): kojelautakerros lukittuna (painikkeet),
# hahmo ja puu pohjalla, tausta 50 %:n kerroksessa. 1440: paneelin Zoomaus-asetus ja Ohjaa logiikasta, ⌘/Ctrl + rulla.
# 390 ja 320: kahden sormen nipistys (CDP-kosketus). Tarkistetaan: sormien kohta pysyy paikallaan, rajat (pienin, suurin),
# kojelauta ei zoomaudu (sama paikka ja koko ruudulla), napautus kohteeseen osuu zoomattuna oikeaan kohtaan maailmassa,
# nipistys ei lähetä hahmoa liikkeelle, Kamera-palikka: Aseta zoomaus painikkeesta (ruudun keskikohta pysyy), Palauta,
# nuoli lukitsee sormet, seurattava pysyy keskellä zoomatessa, alkukohta palauttaa sormien zoomauksen, pystyrullaus
# zoomattuna sallii vaakarullauksen laitteen leveydellä. Kuvat appiappi10_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0];v.laite='puhelin';v.lrul='kaikki';var vw=v.id;
 v.kr=[{id:'k2',n:'Tausta',rv:50},{id:'pohja',n:'Pohja'},{id:'k1',n:'Kojelauta',rv:0}];
 function U(k,o,x,y,w,h,nm){var b=KK.addBlock(P,k,o);b.x=x;b.y=y;if(w)b.w=w;if(h)b.h=h;if(nm)KK.setName(P,b.id,nm);return b;}
 function N(b,x,y){return KK.addNode(P,b.id,x||0,y||0);}
 var hm=U('muoto',{v:vw,laji:'ympyra',hue:1},175,402,40,40,'Hahmo');
 var puu=U('muoto',{v:vw,laji:'laatikko',hue:2},300,200,50,50,'Puu');
 var ta=U('muoto',{v:vw,laji:'laatikko',hue:3},100,100,60,60,'Kaukana');ta.kr='k2';
 var maa=U('alue',{v:vw},-800,-800,2000,2400,'Maa');
 var la=U('nappi',{v:vw,tx:'Lähennä',beh:'kerta'},20,740,160,50,'Lähennä');la.kr='k1';
 var pa=U('nappi',{v:vw,tx:'Palauta',beh:'kerta'},210,740,160,50,'Palauta');pa.kr='k1';
 var li=KK.addBlock(P,'liike',{o:hm.id,ohj:'napautus',vm:20});N(li);
 KK.repair(P);APP.renderAll();return {hm:hm.id,puu:puu.id,ta:ta.id,la:la.id,pa:pa.id,li:li.id,maa:maa.id};})()"""
async def rect(pg,id):
    return await pg.evaluate("""(id)=>{var e=document.querySelector('.ue[data-id="'+id+'"]').getBoundingClientRect();return [e.left,e.top,e.width,e.height];}""",id)
async def cam(pg):
    return await pg.evaluate("(function(){var c=APP.P.cam[APP.S.vw];return {x:c.x,y:c.y,z:c.z,zf:c.zf||1,zm:c.zm};})()")
async def maailmaan(pg,sx,sy):
    """Ruudun kohta maailman koordinaateiksi (kuten sovellus laskee)."""
    return await pg.evaluate("""([sx,sy])=>{var r=document.querySelector('#uvp').getBoundingClientRect(),c=APP.P.cam[APP.S.vw];return [(sx-r.left-c.x)/c.z,(sy-r.top-c.y)/c.z];}""",[sx,sy])
def lahella(a,b,e=1.5):
    return all(abs(x-y)<=e for x,y in zip(a,b))
async def main():
    async with async_playwright() as p:
        for W in (1440,390,320):
            touch=W<500
            if touch:
                b=await p.chromium.launch();errs=[]
                ctx=await b.new_context(viewport={'width':W,'height':844},has_touch=True,is_mobile=True,reduced_motion='reduce')
                pg=await ctx.new_page();pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
                await pg.goto(U);await pg.wait_for_timeout(250)
                cdp=await ctx.new_cdp_session(pg)
                async def T(typ,pts):await cdp.send('Input.dispatchTouchEvent',{'type':typ,'touchPoints':[{'x':x,'y':y,'id':i} for i,(x,y) in enumerate(pts)]})
                async def nipista(c,d0,d1,steps=6,siirto=(0,0)):
                    """Kaksi sormea vaakaan kohdan c ympärillä: väli d0 → d1, keskikohta siirtyy (siirto)."""
                    await T('touchStart',[(c[0]-d0/2,c[1]),(c[0]+d0/2,c[1])]);await pg.wait_for_timeout(30)
                    for i in range(1,steps+1):
                        d=d0+(d1-d0)*i/steps;ox=siirto[0]*i/steps;oy=siirto[1]*i/steps
                        await T('touchMove',[(c[0]+ox-d/2,c[1]+oy),(c[0]+ox+d/2,c[1]+oy)]);await pg.wait_for_timeout(16)
                    await T('touchEnd',[]);await pg.wait_for_timeout(150)
                async def napauta(x,y):
                    await T('touchStart',[(x,y)]);await pg.wait_for_timeout(40);await T('touchEnd',[]);await pg.wait_for_timeout(150)
            else:
                b,pg,errs=await avaa(p,W,900)
                async def nipista(c,d0,d1,steps=6,siirto=(0,0)):
                    await pg.mouse.move(c[0],c[1]);await pg.keyboard.down('Control');await pg.mouse.wheel(0,-100*__import__('math').log(d1/d0));await pg.keyboard.up('Control');await pg.wait_for_timeout(150)
                async def napauta(x,y):
                    await pg.mouse.click(x,y);await pg.wait_for_timeout(150)
            await pg.fill('#wname','Zoom');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP)
            if W>500:
                # --- 0. Paneeli: Zoomaus sormilla, rajat ---
                await pg.evaluate("(function(){APP.S.sel=null;APP.S.multi=[];APP.renderAll();})()");await pg.wait_for_timeout(100)
                assert await pg.locator('#insp [data-vzm="min"]').count()==0,'rajat vasta kun sormilla päällä'
                await pg.check('#insp [data-vzm="s"]');await pg.wait_for_timeout(150)
                assert await P(pg,"P.views[0].zm")=={'s':True}
                await pg.fill('#insp [data-vzm="min"]','40');await pg.dispatch_event('#insp [data-vzm="min"]','change');await pg.wait_for_timeout(100)
                await pg.fill('#insp [data-vzm="max"]','250');await pg.dispatch_event('#insp [data-vzm="max"]','change');await pg.wait_for_timeout(100)
                zm=await P(pg,"P.views[0].zm");print(W,'0 paneelista:',zm);assert zm=={'s':True,'min':40,'max':250}
                assert 'kojelauta' in (await pg.inner_text('#insp')).lower()
                await pg.screenshot(path='appiappi10_paneeli_%d.png'%W)
            else:
                await pg.evaluate("(function(){APP.P.views[0].zm={s:true,min:40,max:250};APP.renderAll();})()")
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            vb=await pg.locator('#uvp').bounding_box();s1=(await cam(pg))['z']
            la0=await rect(pg,I['la']);puu0=await rect(pg,I['puu'])
            # --- 1. Zoomaus sormien kohdalta: kohta pysyy paikallaan, puu kasvaa, kojelauta ei ---
            c=[vb['x']+vb['width']*0.5,vb['y']+vb['height']*0.3]
            w0=await maailmaan(pg,*c)
            await nipista(c,100,200)
            k=await cam(pg);w1=await maailmaan(pg,*c);puu1=await rect(pg,I['puu']);la1=await rect(pg,I['la'])
            print(W,'1 zoomaus',round(k['zf'],3),'kohta',[round(x,1) for x in w0],'→',[round(x,1) for x in w1],'puu',round(puu1[2],1),'kojelauta',[round(x,1) for x in la1])
            assert 1.8<k['zf']<2.2,k;assert abs(k['z']-s1*k['zf'])<1e-6
            assert lahella(w0,w1,1.5),'sormien kohta pysyy'
            assert abs(puu1[2]-puu0[2]*k['zf'])<1,'puu zoomautuu'
            assert lahella(la0,la1,0.6),'kojelauta pysyy paikallaan ja samankokoisena'
            assert abs(k['zm']-k['zf']*100)<0.11,'ilman Kamera-palikkaa sormien zoomaus käyttöliittymässä'
            await pg.screenshot(path='appiappi10_zoomattu_%d.png'%W)
            # Kojelauta toimii zoomattuna: napautus osuu painikkeeseen (ei kohdetta maailmaan)
            # --- 2. Rajat: suurin 250 %, pienin 40 % ---
            await nipista(c,50,300);k=await cam(pg);print(W,'2 suurin',k['zf']);assert abs(k['zf']-2.5)<1e-6
            await nipista(c,300,30);await nipista(c,300,30);k=await cam(pg);print(W,'  pienin',k['zf']);assert abs(k['zf']-0.4)<1e-6
            await pg.screenshot(path='appiappi10_loitonnettu_%d.png'%W)
            assert lahella(la0,await rect(pg,I['la']),0.6),'kojelauta ennallaan loitonnettuna'
            # Loitonnettuna maailma (2000 × 2400 alue) mahtuu ruutuun: keskitetään
            # --- 3. Napautus kohteeseen zoomattuna osuu puuhun; nipistys ei aseta kohdetta ---
            await nipista(c,100,200);k=await cam(pg)
            pr=await rect(pg,I['puu']);px,py=pr[0]+pr[2]/2,pr[1]+pr[3]/2
            if px<vb['x']+5 or px>vb['x']+vb['width']-5 or py<vb['y']+5 or py>vb['y']+vb['height']-200:
                print(W,'  puu ruudun ulkopuolella:',pr);assert False
            await pg.evaluate("(function(){delete APP.P.st['%s'];})()"%I['li'])
            await nipista(c,150,180);st=await P(pg,"P.st['%s']||{}"%I['li'])
            print(W,'3 nipistyksen jälkeen kohde:',st.get('tx'),st.get('ty'));assert st.get('tx') is None,'nipistys ei lähetä hahmoa'
            pr=await rect(pg,I['puu']);px,py=pr[0]+pr[2]/2,pr[1]+pr[3]/2
            await napauta(px,py);st=await P(pg,"P.st['%s']||{}"%I['li'])
            print(W,'  napautus puuhun → kohde',st.get('tx'),st.get('ty'));assert abs(st['tx']-325)<2 and abs(st['ty']-225)<2,st
            await pg.wait_for_timeout(500)
            # --- 4. Alkukohta palauttaa sormien zoomauksen (ilman Kamera-palikkaa) ---
            await pg.evaluate("(function(){APP.goStart(APP.S.vw);APP.renderAll();})()");await pg.wait_for_timeout(100)
            k=await cam(pg);print(W,'4 alkukohdassa',k['zf']);assert k['zf']==1 and k.get('zm') is None
            # --- 5. Kamera-palikka: Aseta zoomaus painikkeesta, ruudun keskikohta pysyy; Palauta ---
            if W>500:
                await pg.click('#lockbtn');await pg.wait_for_timeout(200)
                await pg.evaluate("(function(){APP.S.sel=null;APP.S.multi=[];APP.renderAll();})()");await pg.wait_for_timeout(100)
                await pg.click('#insp [data-kamlog]');await pg.wait_for_timeout(200)
                kid=await P(pg,"Object.keys(P.b).filter(i=>P.b[i].k==='kamera')[0]");assert kid,'Ohjaa logiikasta teki Kamera-palikan'
                assert await P(pg,"P.b['%s'].vw===P.views[0].id"%kid)
                assert 'Näytä logiikassa' in await pg.inner_text('#insp [data-kamlog]')
                await pg.click('#insp [data-kamlog]');await pg.wait_for_timeout(300)
                assert 'ZOOMAUS ALUSSA' in (await pg.inner_text('#insp')).upper(),'Kamera-palikan paneeli'
                await pg.screenshot(path='appiappi10_kamerapalikka_%d.png'%W)
                assert await pg.locator('#pal .chip',has_text='Kamera').count()>=1,'Kamera logiikan paletissa'
                await pg.evaluate("(function(){APP.S.tab='nakyma';APP.renderAll();})()");await pg.wait_for_timeout(150)
                if not await P(pg,"APP.S.tab==='nakyma'"):pass
                await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            else:
                kid=await pg.evaluate("(function(){var P=APP.P,b=KK.addBlock(P,'kamera',{vw:P.views[0].id});KK.addNode(P,b.id,0,300);KK.repair(P);APP.renderAll();return b.id;})()")
            await pg.evaluate("""(function(){var P=APP.P;function N(id){return KK.addNode(P,id,0,0);}
              var a=KK.addBlock(P,'tee',{do:'aseta',o:'%s',om:'zoomaus',v:'200'}),r=KK.addBlock(P,'tee',{do:'palauta',o:'%s'});
              KK.addLink(P,N('%s').id,'e',N(a.id).id,'e');KK.addLink(P,N('%s').id,'e',N(r.id).id,'e');KK.repair(P);APP.renderAll();})()"""%(kid,kid,I['la'],I['pa']))
            await pg.wait_for_timeout(150)
            mid=[vb['x']+vb['width']/2,vb['y']+vb['height']/2];wm0=await maailmaan(pg,*mid);la0=await rect(pg,I['la'])
            await pg.click('.ue[data-id="%s"] button'%I['la']);await pg.wait_for_timeout(250)
            k=await cam(pg);wm1=await maailmaan(pg,*mid);zv=await P(pg,"E().val('%s')"%kid)
            print(W,'5 Aseta 200 %:',k['zf'],'arvo',zv,'keskikohta',[round(x,1) for x in wm0],'→',[round(x,1) for x in wm1])
            assert k['zf']==2 and zv==200;assert lahella(wm0,wm1,1),'ruudun keskikohta pysyy'
            assert lahella(la0,await rect(pg,I['la']),0.6),'kojelauta ennallaan'
            assert await P(pg,"E().val('%s','lev')"%kid)==195
            # Sormet asettavat Kamera-palikan arvon
            await nipista(c,100,150);zv=await P(pg,"E().val('%s')"%kid);k=await cam(pg);print(W,'  sormilla →',zv);assert abs(zv-k['zf']*100)<0.11 and zv>250-1e-9 or abs(zv-250)<0.11
            await pg.click('.ue[data-id="%s"] button'%I['pa']);await pg.wait_for_timeout(250)
            k=await cam(pg);print(W,'  Palauta:',k['zf']);assert k['zf']==1
            # --- 6. Nuoli lukitsee sormet ---
            await pg.evaluate("""(function(){var P=APP.P,ar=KK.addBlock(P,'arvo',{v:'150'});var n=KK.addNode(P,ar.id,0,0);
              KK.addLink(P,n.id,'v',KK.nodesOfBlock(P,'%s')[0].id,'o_zoomaus');KK.repair(P);KK.tick(P,APP.ctx());APP.renderAll();})()"""%kid)
            await pg.wait_for_timeout(150);k=await cam(pg);assert k['zf']==1.5,k
            await nipista(c,100,250);k=await cam(pg);print(W,'6 nuoli: zoomaus',k['zf']);assert k['zf']==1.5,'sormet lukittu'
            await pg.evaluate("""(function(){var P=APP.P,n=KK.nodesOfBlock(P,'%s')[0].id;P.lg.l=P.lg.l.filter(function(l){return l.t!==n;});KK.tick(P,APP.ctx());APP.renderAll();})()"""%kid)
            await pg.wait_for_timeout(150)
            # --- 7. Kamera seuraa: zoomatessa seurattava pysyy keskellä ---
            await pg.evaluate("(function(){var v=APP.P.views[0];v.kam={o:'%s',ka:0,pe:0};APP.goStart(APP.S.vw);APP.renderAll();})()"%I['hm']);await pg.wait_for_timeout(300)
            await nipista([vb['x']+vb['width']*0.3,vb['y']+vb['height']*0.2],100,160);await pg.wait_for_timeout(300)
            h=await rect(pg,I['hm']);k=await cam(pg);hc=[h[0]+h[2]/2-vb['x'],h[1]+h[3]/2-vb['y']]
            print(W,'7 seuratessa zoomaus',round(k['zf'],2),'hahmo',[round(x) for x in hc],'ruutu',round(vb['width']),round(vb['height']))
            assert k['zf']>1.5 and abs(hc[0]-vb['width']/2)<2 and abs(hc[1]-vb['height']/2)<2
            await pg.screenshot(path='appiappi10_seuraa_%d.png'%W)
            # --- 8. Pystyrullaus zoomattuna: vaakaan voi rullata laitteen leveydellä ---
            await pg.evaluate("(function(){var v=APP.P.views[0];delete v.kam;delete v.lrul;KK.removeBlock(APP.P,'%s');KK.removeBlock(APP.P,'%s');KK.repair(APP.P);APP.goStart(APP.S.vw);APP.renderAll();})()"%(kid,I['li']))
            await pg.wait_for_timeout(150)
            await nipista(c,100,200);k=await cam(pg);assert 1.8<k['zf']<2.2,k
            a=[vb['x']+vb['width']*0.5,vb['y']+vb['height']*0.4]
            if touch:
                await T('touchStart',[a]);
                for i in range(1,9):await T('touchMove',[(a[0]-400*i/8,a[1])]);await pg.wait_for_timeout(16)
                await T('touchEnd',[]);await pg.wait_for_timeout(200)
            else:await veda(pg,a,[a[0]-400,a[1]])
            k=await cam(pg);wx=-k['x']/k['z'];sw=vb['width']/k['z']
            print(W,'8 pystyrullaus zoomattuna: vasen reuna',round(wx,1),'näkyvä leveys',round(sw,1));assert abs(wx-(390-sw))<1.5,'oikeaan reunaan asti'
            print(W,'errs',errs);assert not errs;await b.close()
asyncio.run(main())
