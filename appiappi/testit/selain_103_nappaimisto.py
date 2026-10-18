# F33 vaihe 4: näppäimistö pelaajan 1 ohjaimena selaimessa. Tietokone 1440 ja 1280 px, puhelinleveys 390 px savutestinä.
# Muokatessa nuoli siirtää valittua palikkaa kuten ennen eikä ohjain yhdisty; lukittuna nuoli kääntää Tattia ja Liike
# kuljettaa hahmoa, irrotus pysäyttää, välilyönti painaa Painiketta (tapahtuma.nappi = alanappi, ei panorointia),
# ikkunan blur ja lukituksen avaus päästävät näppäimet irti, paneelin taulukossa Näppäin-sarake. Kuvat nappaimisto_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0].id;P.views[0].laite='puhelin';
 function U(k,o,x,y,w,h,nm){var b=KK.addBlock(P,k,o);b.x=x;b.y=y;if(w)b.w=w;if(h)b.h=h;if(nm)KK.setName(P,b.id,nm);return b;}
 function N(b,x,y){return KK.addNode(P,b.id,x,y);}
 var tj=U('tatti',{v:v,pad:'vasen'},115,620,160,160,'Tatti'),hm=U('muoto',{v:v,laji:'ympyra',hue:1},175,300,40,40,'Hahmo');
 var nb=U('nappi',{v:v,tx:'Hyppää',beh:'kerta',padn:'alanappi'},20,40,160,44,'Hyppy');
 var hmn=N(hm,900,0);var li=KK.addBlock(P,'liike',{ohj:'tatti',tt:tj.id,vm:200,x0:0,y0:0});var lin=N(li,600,0);
 KK.addLink(P,lin.id,'v',hmn.id,'dx');KK.addLink(P,lin.id,'y',hmn.id,'dy');
 var oh=KK.addBlock(P,'pohj',{});KK.setName(P,oh.id,'Ohjain');var ohn=N(oh,0,300);
 var tp=KK.addBlock(P,'tapaht',{});KK.setName(P,tp.id,'Tapahtuma');N(tp,0,600);
 var kv=KK.addBlock(P,'kaava');N(kv,300,600);kv.f=KK.kaavaToIds(P,'tapahtuma.nappi');
 var mem=KK.addBlock(P,'muisti',{v:''});KK.setName(P,mem.id,'Viimeisin');N(mem,900,300);var t=KK.addBlock(P,'tee',{do:'aseta',o:mem.id,v:{r:kv.id}});var tn=N(t,600,300);KK.addLink(P,ohn.id,'pa',tn.id,'e');
 KK.repair(P);APP.renderAll();window.__doc=0;document.addEventListener('keydown',function(){window.__doc++;});
 return {tj:tj.id,hm:hm.id,nb:nb.id,li:li.id,oh:oh.id,mem:mem.id};})()"""
async def main():
    async with async_playwright() as p:
        for W in (1440,1280,390):
            b,pg,errs=await avaa(p,W,900 if W>400 else 844)
            await pg.fill('#wname','Näppäinpeli');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP)
            # --- 1. Muokatessa: nuoli siirtää valittua palikkaa, ohjain ei yhdisty ---
            await pg.evaluate("APP.S.sel={t:'b',id:'%s'};APP.S.multi=[];APP.renderAll()"%I['hm']);await pg.wait_for_timeout(150)
            x0=await P(pg,"APP.P.b['%s'].x"%I['hm']);await pg.keyboard.press('ArrowRight');await pg.wait_for_timeout(100)
            assert await P(pg,"APP.P.b['%s'].x"%I['hm'])==x0+1,'nuoli siirtää muokatessa'
            assert await P(pg,"E().val('%s')"%I['oh'])==False,'muokatessa ei ohjainta';assert await pg.evaluate("__doc")>=1
            # --- 2. Lukittuna: nuoli pohjassa, Tatti ja Liike ---
            await pg.click('#lockbtn');await pg.wait_for_timeout(250);d0=await pg.evaluate("__doc")
            await pg.keyboard.down('ArrowRight');await pg.wait_for_timeout(500)
            knob=await pg.evaluate("document.querySelector('.ue[data-id=\"%s\"] .tk').style.left"%I['tj'])
            x1=await P(pg,"E().val('%s')"%I['li']);await pg.wait_for_timeout(300);x2=await P(pg,"E().val('%s')"%I['li'])
            print(W,'2 näppäin:',knob,round(x1,1),round(x2,1));assert float(knob.rstrip('%'))>70 and x1>20 and x2>x1+20
            assert await P(pg,"E().val('%s')"%I['oh'])==True and await P(pg,"E().prop('%s','nimi')"%I['oh'])=='Näppäimistö'
            assert await P(pg,"E().prop('%s','oikea')"%I['oh'])==True
            assert await pg.evaluate("__doc")==d0,'ohjaimen näppäin ei mene rakentajan pikanäppäimille'
            await pg.screenshot(path='nappaimisto_kaytto_%d.png'%W)
            await pg.keyboard.up('ArrowRight');await pg.wait_for_timeout(200)
            assert await P(pg,"E().val('%s')"%I['tj'])==0;x3=await P(pg,"E().val('%s')"%I['li']);await pg.wait_for_timeout(300)
            assert await P(pg,"E().val('%s')"%I['li'])==x3,'irrotus pysäyttää'
            assert await P(pg,"E().val('%s')"%I['oh'])==True,'yhdistetty pysyy'
            # --- 3. Välilyönti painaa Painiketta, ei panorointia ---
            await pg.keyboard.down('Space');await pg.wait_for_timeout(150)
            assert await P(pg,"E().val('%s')"%I['nb'])==1,'painalluksia 1'
            mv=await P(pg,"E().val('%s')"%I['mem']);assert mv=='alanappi',mv
            assert await P(pg,"!!APP.S.space")==False,'välilyönti ei panoroi'
            assert await pg.evaluate("document.querySelector('.ue[data-id=\"%s\"] .w-btn').classList.contains('padin')"%I['nb']),'ilme pohjassa'
            await pg.keyboard.up('Space');await pg.wait_for_timeout(150)
            await pg.keyboard.press('KeyK');await pg.wait_for_timeout(150);assert await P(pg,"E().val('%s')"%I['nb'])==2,'K = alanappi'
            # --- 4. Ikkunan blur päästää irti ---
            await pg.keyboard.down('KeyD');await pg.wait_for_timeout(200);assert await P(pg,"E().val('%s')"%I['tj'])>0
            await pg.evaluate("window.dispatchEvent(new Event('blur'))");await pg.wait_for_timeout(200)
            assert await P(pg,"E().val('%s')"%I['tj'])==0,'blur palauttaa tatin'
            await pg.keyboard.up('KeyD')
            # --- 5. Lukituksen avaus kesken: lepoon, nuoli taas muokkaukselle ---
            await pg.keyboard.down('KeyW');await pg.wait_for_timeout(200);assert await P(pg,"E().val('%s')"%I['tj'])>0
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            assert await P(pg,"E().val('%s')"%I['tj'])==0 and await P(pg,"E().val('%s')"%I['oh'])==False,'avaus irrottaa'
            await pg.keyboard.up('KeyW')
            if W>400:
                # --- 6. Paneeli: Näppäin-sarake ja ohje ---
                await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(150)
                await pg.evaluate("APP.S.sel={t:'b',id:'%s'};APP.S.multi=[];APP.renderAll()"%I['oh']);await pg.wait_for_timeout(250)
                th=await pg.evaluate("[].map.call(document.querySelectorAll('#insp table.padt th'),function(x){return x.textContent;})")
                assert th[-1]=='Näppäin',th
                assert 'Välilyönti tai K' in await pg.evaluate("document.querySelector('#insp table.padt').textContent")
                assert 'nuolet tai WASD' in await pg.evaluate("document.querySelector('#insp').textContent")
                await pg.screenshot(path='nappaimisto_paneeli_%d.png'%W)
                await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(150)
            await pg.evaluate("APP.saveNow()");assert 'Näppäimistö' not in await pg.evaluate("JSON.stringify(localStorage)")
            print(W,'ok, errs',errs);assert not errs
            await b.close()
asyncio.run(main())
