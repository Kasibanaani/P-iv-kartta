# Jonon 17b: napautus ja pudotus hitaassa kerroksessa. Puhelinnäkymä, kamera seuraa oikealla olevaa hahmoa (kamera siirtyy
# ~400 px), Tausta-kerros 50 %:n rullausvauhdilla. Taustan Alue ottaa napautuksen siitä, missä se näkyy (sama kohta kuin saman
# kerroksen Muodolla), ei siirtämättömästä paikasta; käyttöraahattu kortti putoaa näkyvään Alueeseen; käytössä näkyvä kerroksen
# ruudukko siirtyy kerroksen mukana. Tietokone 1440 ja 1280 hiirellä, 390 kosketuksella savutestinä. Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0];v.laite='puhelin';var vw=v.id;
 v.kr=[{id:'k2',n:'Tausta',rv:50,rk:40,rkn:'aina'},{id:'pohja',n:'Pohja'}];
 function U(k,o,x,y,w,h,nm){o.v=vw;var b=KK.addBlock(P,k,o);b.x=x;b.y=y;b.w=w;b.h=h;KK.setName(P,b.id,nm);return b;}
 var hm=U('muoto',{laji:'ympyra',hue:1},575,402,40,40,'Hahmo');
 var mk=U('muoto',{laji:'laatikko',hue:3},400,240,120,120,'Merkki');mk.kr='k2';
 var al=U('alue',{},400,240,120,120,'Taustan alue');al.kr='k2';
 var kr=U('muoto',{laji:'laatikko',hue:2,tx:'Kortti'},420,600,60,40,'Kortti');kr.raah=true;kr.rpa='alue';
 var maa=U('alue',{},-400,-400,1600,1600,'Maa');
 var tp=KK.addBlock(P,'tapaht',{nm:'Tapahtuma'});KK.addNode(P,tp.id,0,900);
 var y=0;function N(b){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,0,(y+=60));}
 function las(b,port,nm){var m=KK.addBlock(P,'muisti',{v:'0'});KK.setName(P,m.id,nm);N(m);var t=KK.addBlock(P,'tee',{do:'lisaa',o:m.id});KK.addLink(P,N(b).id,port,N(t).id,'e');}
 function kir(b,port,f,nm){var m=KK.addBlock(P,'muisti',{v:''});KK.setName(P,m.id,nm);N(m);var k=KK.addBlock(P,'kaava');N(k);k.f=KK.kaavaToIds(P,f);
   var t=KK.addBlock(P,'tee',{do:'aseta',o:m.id,v:{r:k.id}});KK.addLink(P,N(b).id,port,N(t).id,'e');}
 las(al,'nap','Napautuksia');kir(al,'nap','tapahtuma.x','X');las(kr,'rpu','Pudotuksia');kir(kr,'rpu','tapahtuma.kohde','Kohde');
 v.kam={o:hm.id,ka:0,pe:0,ra:maa.id};
 KK.repair(P);APP.renderAll();return {al:al.id,mk:mk.id,kr:kr.id};})()"""
def val(nm):return "E().val(B('%s').id)"%nm
async def main():
    async with async_playwright() as p:
        for W in (1440,1280,390):
            mob=W<500
            b=await p.chromium.launch();errs=[]
            ctx=await b.new_context(viewport={'width':W,'height':844 if mob else 900},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_function("window.APP&&APP.P!==undefined")
            await pg.fill('#wname','Kerrossiirto');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            await pg.click('#lockbtn');await pg.wait_for_timeout(400)
            cam=await P(pg,"P.cam[P.views[0].id]");print(W,'kamera',cam)
            assert cam['x']<-150,'kamera siirtyi hahmon mukana'
            # Merkki (sama kerros ja paikka kuin Alue) näkyy siirrettynä; napautus sen keskelle osuu Alueeseen
            m=await pg.evaluate("(i)=>{var e=document.querySelector('.ue[data-id=\"'+i+'\"]'),r=e.getBoundingClientRect();return [r.left,r.top,r.width,r.height];}",I['mk'])
            vp=await pg.evaluate("(()=>{var r=document.querySelector('#uvp').getBoundingClientRect();return [r.left,r.top,r.width,r.height];})()")
            print(W,'merkki ruudulla',[round(x) for x in m],'näkymä',[round(x) for x in vp])
            kx,ky=m[0]+m[2]*0.25,m[1]+m[3]/2
            assert vp[0]<kx<vp[0]+vp[2] and vp[1]<ky<vp[1]+vp[3],'merkki näkyy ruudulla'
            if mob:await pg.touchscreen.tap(kx,ky)
            else:await pg.mouse.click(kx,ky)
            await pg.wait_for_timeout(250)
            n=await P(pg,val('Napautuksia'));x=await P(pg,val('X'));print(W,'napautus näkyvään kohtaan:',n,'tapahtuma.x',x)
            assert n==1,'Alue ottaa napautuksen siitä, missä se näkyy'
            assert abs(x-30)<=1.5,('tapahtuma.x alueen kulmasta',x)
            # Siirtämätön paikka (maailman 200–320 täydellä vauhdilla) ei enää osu
            z=cam['z'];sx=vp[0]+cam['x']+460*z;sy=vp[1]+cam['y']+300*z
            if vp[0]<sx<vp[0]+vp[2] and not (m[0]<=sx<=m[0]+m[2]):
                if mob:await pg.touchscreen.tap(sx,sy)
                else:await pg.mouse.click(sx,sy)
                await pg.wait_for_timeout(200);assert await P(pg,val('Napautuksia'))==1,'siirtämätön paikka ei osu';print(W,'siirtämätön paikka ei osu')
            else:raise AssertionError(('siirtämätön paikka ei ruudulla',sx))
            # Ruudukko kulkee kerroksen mukana: siirto sama kuin Merkillä
            gt=await pg.evaluate("(()=>{var d=document.querySelector('#uworld .rgrid[data-kr=\"k2\"]');return d?d.style.transform:null;})()")
            mt=await pg.evaluate("(i)=>document.querySelector('.ue[data-id=\"'+i+'\"]').style.transform",I['mk'])
            print(W,'ruudukko',gt,'merkki',mt);assert gt and gt==mt,'ruudukon siirto = kerroksen siirto'
            if mob:
                print(W,'ok (savutesti)','errs',errs);assert not errs;await b.close();continue
            # Käyttöraahaus: kortti (täysi vauhti) pudotetaan Merkin kohdalle → putoaa Taustan Alueeseen
            kc=await keskus(pg,'.ue[data-id="%s"]'%I['kr']);await veda(pg,kc,[m[0]+m[2]/2,m[1]+m[3]/2])
            await pg.wait_for_timeout(200)
            pu=await P(pg,val('Pudotuksia'));ko=await P(pg,val('Kohde'));print(W,'pudotus',pu,ko)
            assert pu==1 and ko=='Taustan alue',('pudotus näkyvään Alueeseen',pu,ko)
            await pg.screenshot(path='selain_111_%d.png'%W)
            print(W,'ok','errs',errs);assert not errs;await b.close()
asyncio.run(main())
