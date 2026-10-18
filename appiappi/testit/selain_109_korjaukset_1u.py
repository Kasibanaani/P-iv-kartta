# Jonon 1u (kartoitus 10, S1–S5): Joukon jäsen napautettu toimii Alueella ilman omaa nuolta ja antaa tapahtuma.x/.y (px)
# kaikilta lähteiltä (Alue, napautettava, Painike); pitkä painallus korvaa painalluksen samalla säännöllä Painikkeella ja
# napautettavalla (oma nuoli tai jäsenyys Joukossa, jonka jäsen pitkä painallus on käytössä, ei koko projekti); Kaaviolla
# Napautus-osio; paneelin otsikon kuvake näkymäpalikalle projektin värein. Tietokone 1440 ja 1280 hiirellä, 390 kosketuksella
# savutestinä. Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0].id,y=0;
 function U(k,o,x,yy,w,h,nm){o.v=v;var b=KK.addBlock(P,k,o);b.x=x;b.y=yy;b.w=w;b.h=h;KK.setName(P,b.id,nm);return b;}
 function N(b){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,0,(y+=60));}
 function las(b,port,nm){var m=KK.addBlock(P,'muisti',{v:'0'});KK.setName(P,m.id,nm);N(m);var t=KK.addBlock(P,'tee',{do:'lisaa',o:m.id});KK.addLink(P,N(b).id,port,N(t).id,'e');}
 function kir(b,port,f,nm){var m=KK.addBlock(P,'muisti',{v:''});KK.setName(P,m.id,nm);N(m);var k=KK.addBlock(P,'kaava');N(k);k.f=KK.kaavaToIds(P,f);
   var t=KK.addBlock(P,'tee',{do:'aseta',o:m.id,v:{r:k.id}});KK.addLink(P,N(b).id,port,N(t).id,'e');}
 var J=KK.jkLuo(P,'kohteet'),J2=KK.jkLuo(P,'muut');
 var al=U('alue',{},40,40,200,120,'Kenttä'),nb=U('nappi',{beh:'kerta',ext:true,tx:'Nappi'},40,180,140,60,'Nappi'),
  mu=U('muoto',{laji:'laatikko',tx:'Ulkona'},40,260,160,80,'Ulkona'),m2=U('muoto',{laji:'laatikko',tx:'Muu'},220,260,120,60,'Muu'),
  kv=U('kaavio',{},40,360,200,120,'Kaavio');
 al.jkt=[J];nb.jkt=[J];mu.nap=true;m2.nap=true;m2.jkt=[J2];[al,nb,mu,m2,kv].forEach(N);
 var pj=KK.addBlock(P,'pjoukko',{jj:J});N(pj);var p2=KK.addBlock(P,'pjoukko',{jj:J2});N(p2);
 las(pj,'j_nap','Jnap');kir(pj,'j_nap','tapahtuma.x','JX');kir(pj,'j_nap','tapahtuma.y','JY');kir(pj,'j_nap','tapahtuma.jäsen','JM');las(pj,'j_pitka','Jpitka');
 las(nb,'e','Painalluksia');las(mu,'nap','UNap');las(p2,'j_pitka','Mpitka');
 var tp=KK.addBlock(P,'tapaht',{nm:'Tapahtuma'});N(tp);
 KK.repair(P);KK.tick(P,APP.ctx());APP.renderAll();return {al:al.id,nb:nb.id,mu:mu.id,kv:kv.id};})()"""
def val(nm):return "E().val(B('%s').id)"%nm
async def main():
    async with async_playwright() as p:
        for W in (1440,1280,390):
            mob=W<500
            b=await p.chromium.launch();errs=[]
            ctx=await b.new_context(viewport={'width':W,'height':844 if mob else 900},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_function("window.APP&&APP.P!==undefined")
            await pg.fill('#wname','Korjaukset 1u');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            if not mob:
                # S4: Kaaviolla Napautus-osio; S5: otsikon kuvake projektin värein
                await pg.evaluate("(i)=>{APP.S.sel={t:'b',id:i};APP.S.multi=[];APP.renderAll();}",I['kv']);await pg.wait_for_timeout(150)
                assert await pg.locator('#insp #napsec').count()==1,'Kaavion Napautus-osio'
                await pg.evaluate("(i)=>{APP.S.sel={t:'b',id:i};APP.S.multi=[];APP.renderAll();}",I['mu']);await pg.wait_for_timeout(150)
                vari=await pg.evaluate("""()=>{var h=document.querySelector('#insp .ih'),m=/\\bh(\\d)\\b/.exec(h.className),n=m[1],cs=getComputedStyle(h),rs=getComputedStyle(document.documentElement);
                  return [h.classList.contains('pcol'),cs.getPropertyValue('--hc').trim(),rs.getPropertyValue('--project-h'+n).trim()];}""")
                assert vari[0] and vari[1]==vari[2],('otsikon kuvake projektin värein',vari)
                await pg.evaluate("APP.S.sel=null;APP.renderAll()")
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            async def kohta(id,dx,dy):
                return await pg.evaluate("""([id,dx,dy])=>{var P=APP.P,b=P.b[id],vp=document.querySelector('#uvp'),w=document.querySelector('#uworld'),r=vp.getBoundingClientRect(),
                  m=new DOMMatrix(getComputedStyle(w).transform);return [r.left+m.e+(b.x+dx)*m.a,r.top+m.f+(b.y+dy)*m.d];}""",[id,dx,dy])
            async def napsauta(xy):
                if mob:await pg.touchscreen.tap(xy[0],xy[1])
                else:await pg.mouse.click(xy[0],xy[1])
                await pg.wait_for_timeout(250)
            # S1 + S2: Alue ilman omaa nuolta lähettää jäsen napautettu, tapahtuma.x/.y px
            await napsauta(await kohta(I['al'],30,20))
            assert await P(pg,val('Jnap'))==1,('Alue joukon kautta',await P(pg,val('Jnap')))
            x,y=await P(pg,val('JX')),await P(pg,val('JY'));assert abs(x-30)<=1 and abs(y-20)<=1,('Alueen tapahtuma.x',x,y)
            assert await P(pg,val('JM'))=='Kenttä'
            # S2: Painikkeen jäsen napautettu kantaa kohdan
            await napsauta(await kohta(I['nb'],50,25))
            assert await P(pg,val('Jnap'))==2 and await P(pg,val('Painalluksia'))==1,('Painike',await P(pg,val('Jnap')),await P(pg,val('Painalluksia')))
            x,y=await P(pg,val('JX')),await P(pg,val('JY'));assert abs(x-50)<=2 and abs(y-25)<=2,('Painikkeen kohta',x,y)
            assert await P(pg,val('JM'))=='Nappi'
            if mob:
                print(W,'ok (savutesti)','errs',errs);assert not errs;await b.close();continue
            async def pitka(xy):
                await pg.mouse.move(xy[0],xy[1]);await pg.mouse.down();await pg.wait_for_timeout(700);await pg.mouse.up();await pg.wait_for_timeout(250)
            # S3: Painikkeen pitkä korvaa painalluksen, kun Joukon jäsen pitkä painallus on käytössä
            await pitka(await kohta(I['nb'],50,25))
            assert await P(pg,val('Jpitka'))==1,('Painikkeen pitkä Joukosta',await P(pg,val('Jpitka')))
            assert await P(pg,val('Painalluksia'))==1,('pitkä korvaa painalluksen',await P(pg,val('Painalluksia')))
            # S3: joukon ulkopuolinen napautettava: toisen Joukon jäsen pitkä painallus ei vie napautusta
            await pitka(await kohta(I['mu'],40,30))
            assert await P(pg,val('UNap'))==1,('pitkä = napautus, kun pitkää ei käytetä',await P(pg,val('UNap')))
            assert await P(pg,val('Mpitka'))==0
            await pg.screenshot(path='korjaukset_1u_%d.png'%W)
            print(W,'ok','errs',errs);assert not errs;await b.close()
asyncio.run(main())
