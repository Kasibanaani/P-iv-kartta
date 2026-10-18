# Jonon 14b (F38 kohta 5): napautettava näkymäpalikka. Paneelin osio Napautus (kiinni oletuksena) Muodolle, Tekstille ym.;
# rasti tekee kohdat napautettu ja pitkä painallus sekä pikatoiminnot Kun napautetaan. Lukittuna napsautus laukaisee
# napautettu (tapahtuma.x/y = kohta palikassa), pitkä painallus (0,5 s) korvaa napautuksen, kun siihen on kytketty jotain.
# Raahattava + napautettava: veto siirtää eikä napauta. Painuu painettaessa = luokka npai. Vanha palikka ennallaan, tallennus
# säilyy. Tietokone 1440 ja 1280 hiirellä, 390 kosketuksella savutestinä. Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0].id;
 function U(k,o,x,y,w,h,nm){o.v=v;var b=KK.addBlock(P,k,o);b.x=x;b.y=y;b.w=w;b.h=h;KK.setName(P,b.id,nm);return b;}
 var a=U('muoto',{laji:'laatikko',tx:'Paina minua'},40,40,200,80,'Laatikko'),t=U('nayta',{tx:'Vanha teksti'},40,160,200,40,'Teksti'),
  r=U('muoto',{laji:'ympyra',tx:'R'},300,40,80,80,'Raahattava');
 var tp=KK.addBlock(P,'tapaht',{nm:'Tapahtuma'});KK.addNode(P,tp.id,0,600);
 KK.repair(P);APP.renderAll();return {a:a.id,t:t.id,r:r.id,v:v};})()"""
LOGIC="""(I)=>{var P=APP.P,y=0;function N(b){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,0,(y+=60));}
 function las(id,port,nm){var m=KK.addBlock(P,'muisti',{v:'0'});KK.setName(P,m.id,nm);N(m);var t=KK.addBlock(P,'tee',{do:'lisaa',o:m.id});KK.addLink(P,N(P.b[id]).id,port,N(t).id,'e');}
 function kir(id,port,f,nm){var m=KK.addBlock(P,'muisti',{v:''});KK.setName(P,m.id,nm);N(m);var k=KK.addBlock(P,'kaava');N(k);k.f=KK.kaavaToIds(P,f);
   var t=KK.addBlock(P,'tee',{do:'aseta',o:m.id,v:{r:k.id}});KK.addLink(P,N(P.b[id]).id,port,N(t).id,'e');}
 las(I.a,'nap','Napautuksia');kir(I.a,'nap','tapahtuma.x','X');kir(I.a,'nap','tapahtuma.y','Y');las(I.r,'nap','R-napautuksia');
 KK.repair(P);KK.tick(P,APP.ctx());APP.renderAll();}"""
def val(nm):return "E().val(B('%s').id)"%nm
async def main():
    async with async_playwright() as p:
        for W in (1440,1280,390):
            mob=W<500
            b=await p.chromium.launch();errs=[]
            ctx=await b.new_context(viewport={'width':W,'height':844 if mob else 900},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_function("window.APP&&APP.P!==undefined")
            await pg.fill('#wname','Napautus');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            # 1 paneeli: osio kiinni, rasti, pikatoiminnot
            await pg.evaluate("(i)=>{APP.S.sel={t:'b',id:i};APP.S.multi=[];APP.renderAll();}",I['a']);await pg.wait_for_timeout(150)
            if mob:await pg.evaluate("document.body.classList.add('inspopen')")
            assert await pg.locator('#insp #napsec').count()==1,'Napautus-osio'
            assert await pg.evaluate("!document.querySelector('#insp #napsec').open"),'kiinni oletuksena'
            assert await pg.locator('#insp [data-qadd="nap"]').count()==0,'ei pikatoimintoja ennen rastia'
            await pg.evaluate("document.querySelector('#insp #napsec').open=true");await pg.locator('#insp input[data-k="nap"]').check();await pg.wait_for_timeout(200)
            assert await P(pg,"P.b['%s'].nap"%I['a'])==True
            assert await pg.locator('#insp [data-qadd="nap"]').count()==1,'Kun napautetaan -pikatoiminnot'
            await pg.locator('#insp input[data-k="npa"]').check();await pg.wait_for_timeout(150)
            assert await P(pg,"P.b['%s'].npa"%I['a'])==True
            assert await P(pg,"KK.ports(P.b['%s']).outs.map(o=>o.p).filter(p=>p==='nap'||p==='pitka')"%I['a'])==['nap','pitka']
            await pg.evaluate("(i)=>{var b=APP.P.b[i];b.nap=true;b.raah=true;KK.repair(APP.P);APP.renderAll();}",I['r'])
            await pg.evaluate(LOGIC,I);await pg.wait_for_timeout(150)
            # muokatessa ei napauteta
            c=await keskus(pg,'.ue[data-id="%s"]'%I['a'])
            assert await pg.locator('.ue.napa').count()==0,'muokatessa ei napa-luokkaa'
            # 2 lukittuna: napautus ja kohta
            await pg.evaluate("APP.S.sel=null;APP.renderAll()");await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            assert await pg.locator('.ue.napa[data-id="%s"].npai'%I['a']).count()==1,'napa + npai lukittuna'
            assert await pg.locator('.ue[data-id="%s"].napa'%I['t']).count()==0,'vanha teksti ei napautettava'
            assert await pg.evaluate("(i)=>getComputedStyle(document.querySelector('.ue[data-id=\"'+i+'\"]')).cursor",I['a'])=='pointer'
            bx=await pg.evaluate("(i)=>{var e=document.querySelector('.ue[data-id=\"'+i+'\"]'),r=e.getBoundingClientRect();return [r.left,r.top,r.width/e.offsetWidth];}",I['a'])
            px,py=bx[0]+30*bx[2],bx[1]+20*bx[2]
            if mob:await pg.touchscreen.tap(px,py)
            else:await pg.mouse.click(px,py)
            await pg.wait_for_timeout(200)
            assert await P(pg,val('Napautuksia'))==1,('napautus',await P(pg,val('Napautuksia')))
            x,y=await P(pg,val('X')),await P(pg,val('Y'));assert abs(x-30)<=1 and abs(y-20)<=1,(x,y)
            if mob:
                print(W,'ok (savutesti)','errs',errs);assert not errs;await b.close();continue
            c=await keskus(pg,'.ue[data-id="%s"]'%I['a'])
            # 3 pitkä painallus ilman kytkentää: myös napautus tulee (kuten Painikkeella); kytkettynä korvaa
            await pg.mouse.move(c[0],c[1]);await pg.mouse.down();await pg.wait_for_timeout(700);await pg.mouse.up();await pg.wait_for_timeout(200)
            assert await P(pg,val('Napautuksia'))==2,'pitkä ilman kytkentää = napautus myös'
            await pg.click('#lockbtn');await pg.wait_for_timeout(200)
            await pg.evaluate("""(I)=>{var P=APP.P,m=KK.addBlock(P,'muisti',{v:'0'});KK.setName(P,m.id,'Pitkiä');KK.addNode(P,m.id,600,0);var t=KK.addBlock(P,'tee',{do:'lisaa',o:m.id});
              KK.addLink(P,KK.nodesOfBlock(P,I.a)[0].id,'pitka',KK.addNode(P,t.id,600,80).id,'e');KK.repair(P);APP.renderAll();}""",I)
            await pg.click('#lockbtn');await pg.wait_for_timeout(300);c=await keskus(pg,'.ue[data-id="%s"]'%I['a'])
            await pg.mouse.move(c[0],c[1]);await pg.mouse.down();await pg.wait_for_timeout(700);await pg.mouse.up();await pg.wait_for_timeout(200)
            assert await P(pg,val('Pitkiä'))==1 and await P(pg,val('Napautuksia'))==2,('pitkä korvaa',await P(pg,val('Pitkiä')),await P(pg,val('Napautuksia')))
            await pg.mouse.click(c[0],c[1]);await pg.wait_for_timeout(200);assert await P(pg,val('Napautuksia'))==3
            # 4 raahattava + napautettava: veto siirtää, ei napautusta; napsautus napauttaa
            rc=await keskus(pg,'.ue[data-id="%s"]'%I['r'])
            await veda(pg,rc,[rc[0]+60,rc[1]+50])
            assert await P(pg,val('R-napautuksia'))==0,'veto ei napauta'
            moved=await P(pg,"E().omi('%s','x')"%I['r']);assert moved and moved>300,moved
            rc=await keskus(pg,'.ue[data-id="%s"]'%I['r']);await pg.mouse.click(rc[0],rc[1]);await pg.wait_for_timeout(200)
            assert await P(pg,val('R-napautuksia'))==1,'napsautus napauttaa'
            await pg.screenshot(path='napautus_%d.png'%W)
            # 5 tallennus säilyy
            await pg.evaluate("APP.saveNow()");await pg.reload();await pg.wait_for_function("window.APP&&APP.P")
            assert await P(pg,"[P.b['%s'].nap,P.b['%s'].npa,P.b['%s'].nap===undefined]"%(I['a'],I['a'],I['t']))==[True,True,True]
            print(W,'ok','errs',errs);assert not errs;await b.close()
asyncio.run(main())
