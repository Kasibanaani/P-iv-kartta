# F33 vaihe 1: Peliohjain selaimessa valeohjaimella (navigator.getGamepads korvataan). Tietokone 1440 ja 1280 px,
# puhelinleveys 390 px vain savutestinä. Lukittuna: Tatti seuraa ohjaimen vasenta tattia ja Liike kuljettaa hahmoa,
# alanappi painaa Painiketta (painettu, ilme pohjassa), Peliohjain-palikan ominaisuudet ja tapahtuma nappi, irtoaminen
# palauttaa tatin keskelle ja pysäyttää silmukan; muokatessa ohjain ei käytä logiikkaa; paneelin elävä esikatselu;
# Tatin ja Painikkeen paneelin valinnat; paletissa. Kuvat peliohjain_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
PADJS="""(function(){window.__pads=[];Object.defineProperty(navigator,'getGamepads',{configurable:true,value:function(){return window.__pads;}});
 window.__pad=function(n,a,id){var bs=[];for(var i=0;i<17;i++){var v=n&&n[i]||0;bs.push({pressed:v>=0.5,touched:v>0,value:v});}
   var g={id:id||'Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e)',index:0,connected:true,mapping:'standard',buttons:bs,axes:a||[0,0,0,0],timestamp:performance.now()};
   var uusi=!window.__pads.length;window.__pads=[g];if(uusi){var e=new Event('gamepadconnected');e.gamepad=g;window.dispatchEvent(e);}};
 window.__irti=function(){window.__pads=[];window.dispatchEvent(new Event('gamepaddisconnected'));};})()"""
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
 KK.repair(P);APP.renderAll();return {tj:tj.id,hm:hm.id,nb:nb.id,li:li.id,oh:oh.id,mem:mem.id};})()"""
async def main():
    async with async_playwright() as p:
        for W in (1440,1280,390):
            b,pg,errs=await avaa(p,W,900 if W>400 else 844)
            await pg.evaluate(PADJS)
            await pg.fill('#wname','Peli');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            if W>400:
                await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(150)
                assert await pg.locator('#pal .chip',has_text='Peliohjain').count()==1,'paletissa'
                await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP)
            # --- 1. Muokatessa ohjain ei käytä logiikkaa ---
            await pg.evaluate("__pad([1],[0.9,0,0,0])");await pg.wait_for_timeout(200)
            assert await P(pg,"E().val('%s')"%I['nb'])==0 and await P(pg,"E().val('%s')"%I['oh'])==False,'muokatessa ei'
            await pg.evaluate("__pad([0],[0,0,0,0])")
            # --- 2. Lukittuna: tatti oikealle, hahmo liikkuu ---
            await pg.click('#lockbtn');await pg.wait_for_timeout(250)
            await pg.evaluate("__pad([0],[0.9,0,0,0])");await pg.wait_for_timeout(500)
            knob=await pg.evaluate("document.querySelector('.ue[data-id=\"%s\"] .tk').style.left"%I['tj'])
            x1=await P(pg,"E().val('%s')"%I['li']);await pg.wait_for_timeout(300);x2=await P(pg,"E().val('%s')"%I['li'])
            print(W,'2 tatti:',knob,round(x1,1),round(x2,1));assert float(knob.rstrip('%'))>70 and x1>20 and x2>x1+20
            assert await P(pg,"E().val('%s')"%I['oh'])==True and await P(pg,"E().prop('%s','nimi')"%I['oh'])=='Xbox Wireless Controller'
            assert abs(await P(pg,"E().val('%s','x')"%I['oh'])-0.882)<0.01
            # --- 3. alanappi painaa Painiketta ---
            await pg.evaluate("__pad([1],[0.9,0,0,0])");await pg.wait_for_timeout(150)
            assert await P(pg,"E().val('%s')"%I['nb'])==1,'painalluksia 1'
            assert await P(pg,"E().val('%s')"%I['mem'])=='alanappi','tapahtuma.nappi'
            assert await pg.evaluate("document.querySelector('.ue[data-id=\"%s\"] .w-btn').classList.contains('padin')"%I['nb']),'ilme pohjassa'
            await pg.screenshot(path='peliohjain_kaytto_%d.png'%W)
            await pg.evaluate("__pad([0],[0.9,0,0,0])");await pg.wait_for_timeout(150)
            assert not await pg.evaluate("document.querySelector('.ue[data-id=\"%s\"] .w-btn').classList.contains('padin')"%I['nb'])
            assert await P(pg,"E().val('%s')"%I['nb'])==1,'pysyy 1'
            # --- 4. Irtoaminen: tatti keskelle, hahmo pysähtyy ---
            await pg.evaluate("__irti()");await pg.wait_for_timeout(300)
            assert await P(pg,"E().val('%s')"%I['tj'])==0 and await P(pg,"E().val('%s')"%I['oh'])==False
            x3=await P(pg,"E().val('%s')"%I['li']);await pg.wait_for_timeout(300);assert await P(pg,"E().val('%s')"%I['li'])==x3,'pysähtyy'
            knob=await pg.evaluate("document.querySelector('.ue[data-id=\"%s\"] .tk').style.left"%I['tj']);assert knob=='50%',knob
            # --- 5. Avaus lukosta irrottaa: ohjain kiinni, avataan muokkaus, tila lepoon ---
            await pg.evaluate("__pad([0],[0.9,0,0,0])");await pg.wait_for_timeout(250);assert await P(pg,"E().val('%s')"%I['tj'])>0
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            assert await P(pg,"E().val('%s')"%I['tj'])==0,'muokkaukseen siirtyminen palauttaa tatin';assert await P(pg,"E().val('%s')"%I['oh'])==False
            if W>400:
                # --- 6. Paneelit ---
                await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(150)
                await pg.evaluate("APP.S.sel={t:'b',id:'%s'};APP.S.multi=[];APP.renderAll()"%I['oh']);await pg.wait_for_timeout(250)
                await pg.evaluate("__pad([0,0,0,1],[0,0,0,0])");await pg.wait_for_timeout(250)
                t=await pg.evaluate("document.querySelector('#pohjnow').textContent");print(W,'6 esikatselu:',t[:60])
                assert 'Yhdistetty' in t and 'Xbox Wireless Controller' in t
                assert await pg.evaluate("document.querySelector('#pohjnow .padk.on').textContent")=='Y','ylänappi syttyy'
                assert await P(pg,"E().val('%s')"%I['mem'])=='alanappi','muokatessa ei tapahtumia'
                assert await pg.locator('#insp select[data-k="pel"]').count()==1 and await pg.locator('#insp table.padt').count()==1
                await pg.screenshot(path='peliohjain_paneeli_%d.png'%W)
                await pg.evaluate("__irti()");await pg.wait_for_timeout(200)
                assert 'Ei yhdistetty' in await pg.evaluate("document.querySelector('#pohjnow').textContent")
                await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(150)
                await pg.evaluate("APP.S.sel={t:'b',id:'%s'};APP.S.multi=[];APP.renderAll()"%I['nb']);await pg.wait_for_timeout(200)
                assert await pg.evaluate("document.querySelector('#insp select[data-k=\"padn\"]').value")=='alanappi'
                await pg.select_option('#insp select[data-k="padn"]','');await pg.wait_for_timeout(150)
                assert await P(pg,"'padn' in APP.P.b['%s']"%I['nb'])==False,'valinta pois poistaa kentän'
                await pg.evaluate("APP.S.sel={t:'b',id:'%s'};APP.S.multi=[];APP.renderAll()"%I['tj']);await pg.wait_for_timeout(200)
                await pg.click('#insp [data-seg="pad"][data-v="oikea"]');await pg.wait_for_timeout(150)
                await pg.select_option('#insp select[data-k="padp"]','2');await pg.wait_for_timeout(150)
                assert await P(pg,"[APP.P.b['%s'].pad,APP.P.b['%s'].padp]"%(I['tj'],I['tj']))==['oikea',2]
            # Tila ei tallennu
            await pg.evaluate("APP.saveNow()");assert 'Xbox' not in await pg.evaluate("localStorage.getItem('appiappi:data')||JSON.stringify(localStorage)")
            print(W,'ok, errs',errs);assert not errs
            await b.close()
asyncio.run(main())
