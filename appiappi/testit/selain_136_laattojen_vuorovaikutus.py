# Jonon 19 (F35 vaihe D): laattojen vuorovaikutus selaimessa. Laattalajin Ilmoittaa-rasti paneelissa, toiminnon
# Maalaa laatta kentät (ruutu x/y, laji), käytössä hahmo kävelee kolikoiden yli ja ne katoavat kartasta (canvas),
# paneelin Palauta maalattu kartta tuo ne takaisin. Tietokone 1440 ja 1280. Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
ALFA="""(([x,y])=>{var b=Object.values(APP.P.b).filter(q=>q.k==='laatat')[0],cv=document.querySelector('.ue[data-id="'+b.id+'"] canvas.w-laatat');
  return cv.getContext('2d').getImageData(x*4+2,y*4+2,1,1).data[3];})"""
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Kolikot');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            await pg.evaluate("""(function(){var P=APP.P,v=P.views[0].id;var a=KK.addBlock(P,'alue',{v:v});a.x=-200;a.y=-400;a.w=1200;a.h=1200;a.pv=2000;
              var m=KK.addBlock(P,'laatat',{v:v});m.x=20;m.y=100;m.rk=32;m.lw=12;m.lh2=4;m.lj=[{c:'1',n:'Seinä',hue:0,t:'kiintea'},{c:'2',n:'Kolikko',hue:3,t:'lapi'}];
              m.lrt=['............','............','....2...2...','111111111111'];KK.setName(P,m.id,'Kartta');
              var h=KK.addBlock(P,'muoto',{v:v});h.x=30;h.y=140;h.w=28;h.h=28;var li=KK.addBlock(P,'liike',{o:h.id});li.vx='200';KK.addNode(P,li.id,0,0);
              var t=KK.addBlock(P,'tee',{do:'maalaa',o:m.id});KK.addLink(P,KK.addNode(P,m.id,200,0).id,'e',KK.addNode(P,t.id,400,0).id,'e');KK.repair(P);APP.S.sel={t:'b',id:m.id};APP.renderAll();})()""")
            await pg.wait_for_timeout(150)
            # Ilmoittaa-rasti
            n=await pg.locator('#insp [data-ltil]').count();assert n==2,'rasti jokaisella lajilla'
            await pg.locator('#insp [data-ltil="1"]').check();await pg.wait_for_timeout(100)
            il=await P(pg,"[!!Object.values(P.b).filter(x=>x.k==='laatat')[0].lj[0].il,Object.values(P.b).filter(x=>x.k==='laatat')[0].lj[1].il]");print(W,'ilmoittaa',il)
            assert il==[False,True],'rasti asettaa vain Kolikon'
            assert await pg.locator('#insp .help',has_text='tapahtuma.laji').count()==1,'ohje kertoo tapahtuman tiedot'
            # Toiminnon kentät
            tid=await P(pg,"Object.values(P.b).filter(x=>x.k==='tee')[0].id")
            await pg.evaluate("(i)=>{APP.S.view='logic';APP.S.sel={t:'b',id:i};APP.renderAll();}",tid);await pg.wait_for_timeout(150)
            assert await pg.locator('#insp input[data-k="kv_x"]').count()==1 and await pg.locator('#insp input[data-k="kv_y"]').count()==1,'ruutukentät'
            opts=await pg.evaluate("Array.from(document.querySelectorAll('#insp select[data-k=\"lc\"] option')).map(o=>o.textContent)");print(W,'lajit',opts)
            assert opts==['tyhjä (pyyhi laatta)','Seinä','Kolikko']
            await pg.select_option('#insp select[data-k="lc"]','1');await pg.wait_for_timeout(100);assert await P(pg,"P.b['"+tid+"'].lc")=='1','laji tallentui'
            await pg.select_option('#insp select[data-k="lc"]','');await pg.wait_for_timeout(100)
            await pg.fill('#insp input[data-k="kv_x"]','2 + 1');await pg.locator('#insp input[data-k="kv_x"]').dispatch_event('change');await pg.wait_for_timeout(100)
            assert await pg.locator('#insp input[data-k="kv_x"].bad').count()==0,'kaava kelpaa'
            assert await P(pg,"KK.descAct(P,'"+tid+"')")=='Maalaa laatta: Kartta (2 + 1, tapahtuman ruutu) → tyhjä',await P(pg,"KK.descAct(P,'"+tid+"')")
            await pg.fill('#insp input[data-k="kv_x"]','');await pg.locator('#insp input[data-k="kv_x"]').dispatch_event('change');await pg.wait_for_timeout(100)
            assert not await P(pg,"!!(P.b['"+tid+"'].kv&&P.b['"+tid+"'].kv.x)"),'tyhjä kenttä = tapahtuman ruutu'
            await pg.evaluate("(()=>{APP.S.view='ui';var m=Object.values(APP.P.b).filter(x=>x.k==='laatat')[0];APP.S.sel={t:'b',id:m.id};APP.renderAll();})()");await pg.wait_for_timeout(200)
            a0=[await pg.evaluate(ALFA,[4,2]),await pg.evaluate(ALFA,[8,2])];assert a0==[255,255],'kolikot piirretty %s'%a0
            # Käytössä kolikot kerätään
            await pg.click('#lockbtn');await pg.wait_for_timeout(2600)
            k=await P(pg,"KK.ltMaarat(KK.ltNyt(P,Object.values(P.b).filter(x=>x.k==='laatat')[0]))['2']||0");a1=[await pg.evaluate(ALFA,[4,2]),await pg.evaluate(ALFA,[8,2])];print(W,'käytössä',k,a1)
            assert k==0 and a1==[0,0],'kolikot kerätty ja kadonneet kuvasta'
            await pg.click('#lockbtn');await pg.wait_for_timeout(200)
            await pg.evaluate("(()=>{var m=Object.values(APP.P.b).filter(x=>x.k==='laatat')[0];APP.S.sel={t:'b',id:m.id};APP.renderAll();})()");await pg.wait_for_timeout(150)
            assert await pg.locator('#insp .help',has_text='Käytössä kartta on muuttunut').count()==1
            await pg.click('#insp [data-do="ltpalauta"]');await pg.wait_for_timeout(200)
            k=await P(pg,"KK.ltMaarat(KK.ltNyt(P,Object.values(P.b).filter(x=>x.k==='laatat')[0]))['2']||0");a2=await pg.evaluate(ALFA,[4,2]);print(W,'palautettu',k,a2)
            assert k==2 and a2==255,'Palauta toi kolikot takaisin'
            assert await pg.locator('#insp [data-do="ltpalauta"]').count()==0
            print(W,'ok','errs',errs);assert not errs
            await b.close()
asyncio.run(main())
