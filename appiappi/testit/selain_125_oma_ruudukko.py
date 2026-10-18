# Jonon 15b (F36, suunnitelma 20): palikan oma ruudukko käyttöliittymässä. Paneelin osio Oma ruudukko (rasti, sarakkeet,
# rivit, näkyy muokatessa / aina / ei), viivat palikan päällä (kiertyvät sisällön mukana), lukittuna napsautus antaa ruudun
# (ruutu napautettu, tapahtuma.ruutux/ruutuy, napautettu x/y), myös kierretyssä palikassa ja Painikkeessa; palikka ilman
# ruudukkoa ennallaan. Tietokone 1440 ja 1280 hiirellä, 390 kosketuksella savutestinä. Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0].id;
 function U(k,o,x,y,w,h,nm){o.v=v;var b=KK.addBlock(P,k,o);b.x=x;b.y=y;b.w=w;b.h=h;KK.setName(P,b.id,nm);return b;}
 var a=U('muoto',{laji:'laatikko'},40,40,180,240,'Lauta'),n=U('nappi',{tx:'Paina',beh:'kerta'},260,40,120,60,'Nappi'),t=U('muoto',{laji:'laatikko'},260,160,100,80,'Tavallinen');
 var tp=KK.addBlock(P,'tapaht',{nm:'Tapahtuma'});KK.addNode(P,tp.id,0,600);
 KK.repair(P);APP.renderAll();return {a:a.id,n:n.id,t:t.id};})()"""
LOGIC="""(I)=>{var P=APP.P,y=0;function N(b){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,0,(y+=60));}
 function las(id,port,nm){var m=KK.addBlock(P,'muisti',{v:'0'});KK.setName(P,m.id,nm);N(m);var t=KK.addBlock(P,'tee',{do:'lisaa',o:m.id});KK.addLink(P,N(P.b[id]).id,port,N(t).id,'e');}
 function kir(id,port,f,nm){var m=KK.addBlock(P,'muisti',{v:''});KK.setName(P,m.id,nm);N(m);var k=KK.addBlock(P,'kaava');N(k);k.f=KK.kaavaToIds(P,f);
   var t=KK.addBlock(P,'tee',{do:'aseta',o:m.id,v:{r:k.id}});KK.addLink(P,N(P.b[id]).id,port,N(t).id,'e');}
 las(I.a,'rnap','Ruutuja');kir(I.a,'rnap','tapahtuma.ruutux * 10 + tapahtuma.ruutuy','RX');
 P.b[I.n].ors=2;P.b[I.n].orr=1;las(I.n,'rnap','Nappiruutuja');kir(I.n,'rnap','tapahtuma.ruutux','NX');las(I.n,'e','Painalluksia');
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
            await pg.fill('#wname','Oma ruudukko');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            # 1 paneeli: osio kiinni, rasti tekee 3 × 3, sarakkeet ja rivit, näkyvyys
            await pg.evaluate("(i)=>{APP.S.sel={t:'b',id:i};APP.S.multi=[];APP.renderAll();}",I['a']);await pg.wait_for_timeout(150)
            if mob:await pg.evaluate("document.body.classList.add('inspopen')")
            assert await pg.locator('#insp #orsec').count()==1,'Oma ruudukko -osio'
            assert await pg.evaluate("!document.querySelector('#insp #orsec').open"),'kiinni oletuksena'
            assert await pg.locator('.ue[data-id="%s"] .orgr'%I['a']).count()==0,'ei viivoja ilman ruudukkoa'
            await pg.evaluate("document.querySelector('#insp #orsec').open=true");await pg.locator('#insp input[data-k="org"]').check();await pg.wait_for_timeout(200)
            assert await P(pg,"[P.b['%s'].ors,P.b['%s'].orr]"%(I['a'],I['a']))==[3,3],'rasti tekee 3 × 3'
            await pg.locator('#insp input[data-k="orr"]').fill('4');await pg.wait_for_timeout(150)
            assert await P(pg,"P.b['%s'].orr"%I['a'])==4
            await pg.locator('#insp input[data-k="ors"]').fill('99');await pg.wait_for_timeout(150)
            assert await P(pg,"P.b['%s'].ors"%I['a'])==64,'enintään 64'
            await pg.locator('#insp input[data-k="ors"]').fill('3');await pg.wait_for_timeout(150)
            g=await pg.evaluate("(i)=>{var e=document.querySelector('.ue[data-id=\"'+i+'\"] .orgr');return e&&[e.style.backgroundSize,getComputedStyle(e).pointerEvents];}",I['a'])
            assert g and g[0]=='calc(33.3333%) calc(25%)' and g[1]=='none',g
            assert await P(pg,"KK.ports(P.b['%s']).outs.map(o=>o.p).filter(p=>['onx','ony','rnap'].indexOf(p)>=0)"%I['a'])==['onx','ony','rnap']
            await pg.evaluate(LOGIC,I);await pg.wait_for_timeout(150)
            # muokatessa viivat näkyvät, lukittuna eivät (oletus Muokatessa); Tavallinen ilman viivoja eikä napa-luokkaa
            await pg.evaluate("APP.S.sel=null;APP.renderAll()");await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            assert await pg.locator('.ue[data-id="%s"] .orgr'%I['a']).count()==0,'lukittuna ei viivoja oletuksena'
            assert await pg.locator('.ue.napa[data-id="%s"]'%I['a']).count()==1,'napa, kun ruutu napautettu on kytketty'
            assert await pg.locator('.ue[data-id="%s"].napa'%I['t']).count()==0,'tavallinen ennallaan'
            async def napauta(i,fx,fy):
                bx=await pg.evaluate("(i)=>{var e=document.querySelector('.ue[data-id=\"'+i+'\"]'),r=e.getBoundingClientRect();return [r.left,r.top,r.width/e.offsetWidth];}",i)
                px,py=bx[0]+fx*bx[2],bx[1]+fy*bx[2]
                if mob:await pg.touchscreen.tap(px,py)
                else:await pg.mouse.click(px,py)
                await pg.wait_for_timeout(200)
            # 2 napautus: sarake 2 (60–120), rivi 3 (120–180)
            await napauta(I['a'],90,150)
            assert await P(pg,val('Ruutuja'))==1,('ruutu napautettu',await P(pg,val('Ruutuja')))
            assert await P(pg,val('RX'))==23,await P(pg,val('RX'))
            assert await P(pg,"[E().val('%s','onx'),E().val('%s','ony')]"%(I['a'],I['a']))==[2,3],'napautettu x ja y'
            if mob:
                print(W,'ok (savutesti)','errs',errs);assert not errs;await b.close();continue
            # 3 Painike: painallus ja ruutu samasta napsautuksesta
            await napauta(I['n'],90,30)
            assert await P(pg,val('Painalluksia'))==1 and await P(pg,val('Nappiruutuja'))==1 and await P(pg,val('NX'))==2,'Painike: painettu ja ruutu 2'
            # 4 kierretty 180° ja näkyy aina: vasen yläkulma = oikea alaruutu, viivat kiertyvät
            await pg.click('#lockbtn');await pg.wait_for_timeout(200)
            await pg.evaluate("(i)=>{var b=APP.P.b[i];b.kulma=180;b.orn='aina';KK.repair(APP.P);APP.renderAll();}",I['a']);await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            tf=await pg.evaluate("(i)=>{var e=document.querySelector('.ue[data-id=\"'+i+'\"] .orgr');return e&&e.style.transform;}",I['a'])
            assert tf and 'rotate(180deg)' in tf,('viivat näkyvät aina ja kiertyvät',tf)
            await napauta(I['a'],10,10)
            assert await P(pg,val('RX'))==34,('kierretty',await P(pg,val('RX')))
            # 5 näkyy ei: muokatessakaan ei viivoja
            await pg.click('#lockbtn');await pg.wait_for_timeout(200)
            await pg.evaluate("(i)=>{APP.S.sel={t:'b',id:i};APP.renderAll();document.querySelector('#insp #orsec').open=true;}",I['a']);await pg.wait_for_timeout(150)
            await pg.click('#insp [data-seg="orn"][data-v="ei"]');await pg.wait_for_timeout(150)
            assert await P(pg,"P.b['%s'].orn"%I['a'])=='ei'
            assert await pg.locator('.ue[data-id="%s"] .orgr'%I['a']).count()==0,'Ei: ei viivoja'
            # 6 rasti pois: kentät pois, palikka ennallaan
            await pg.locator('#insp input[data-k="org"]').uncheck();await pg.wait_for_timeout(150)
            assert await P(pg,"['ors','orr','orn'].filter(k=>k in P.b['%s'])"%I['a'])==[],'kentät poistuvat'
            print(W,'ok','errs',errs);assert not errs
            await b.close()
asyncio.run(main())
