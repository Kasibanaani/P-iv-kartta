# Jono 19 jatko (21.10.2026): laattalajin Liukkaus-kenttä paneelissa, rakennuslaatikon Laatat-hyllyn Jää-laji ja Kolikot
# laattoina (laji + KUN-logiikka + Pisteet + Tapahtuma; käytössä kolikot kerätään, painelaatta-laji ei katoa), Alueet-hyllyn
# Painelaatta (Muoto vaihtaa väriä Alueen sisällä). Tietokone 1440 ja 1280. Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
KARTTA="Object.values(P.b).filter(x=>x.k==='laatat')[0]"
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Liukas');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            await pg.evaluate("APP.rl.avaa(true)");await pg.wait_for_timeout(150)
            # Ilman karttaa Jää-laji kertoo, mitä puuttuu, eikä lisää mitään
            n0=await P(pg,"Object.keys(P.b).length")
            await pg.evaluate("APP.S.rl.hy='laatat';APP.rl.lisaa('ltjaa',{x:100,y:100})");assert await P(pg,"Object.keys(P.b).length")==n0
            await pg.evaluate("APP.rl.lisaa('laattakartta',{x:300,y:300})");await pg.evaluate("APP.renderAll()");await pg.wait_for_timeout(100)
            await pg.locator('#rlbox [data-rlhy="laatat"]').click();await pg.wait_for_timeout(100)
            assert await pg.locator('#rlbox [data-rli="ltjaa"]').count()==1 and await pg.locator('#rlbox [data-rli="ltkolikot"]').count()==1,'hyllyssä Jää-laji ja Kolikot laattoina'
            await pg.evaluate("APP.rl.lisaa('ltjaa',{x:100,y:100})");await pg.evaluate("APP.renderAll()");await pg.wait_for_timeout(100)
            lj=await P(pg,KARTTA+".lj.map(l=>[l.n,l.t,l.liu||0])");print(W,'lajit',lj)
            assert lj[-1]==['Jää','kiintea',85]
            await pg.evaluate("APP.rl.lisaa('ltjaa',{x:100,y:100})");assert len(await P(pg,KARTTA+".lj"))==3,'Jää vain kerran'
            names=await pg.evaluate("[...document.querySelectorAll('#rlbox [data-rllt]')].map(e=>e.textContent)");assert 'Jää' in names[2],names
            # Kolikot laattoina
            await pg.evaluate("APP.rl.lisaa('ltkolikot',{x:100,y:100})");await pg.wait_for_timeout(100)
            ko=await P(pg,KARTTA+".lj.filter(l=>l.n==='Kolikko').map(l=>[l.t,!!l.il])");assert ko==[['lapi',True]],ko
            lk=await P(pg,"['kun','tapaht','tee','kaava','muisti'].map(k=>Object.values(P.b).filter(x=>x.k===k).length)");print(W,'logiikka',lk)
            assert lk==[1,1,2,1,1],lk
            await pg.evaluate("APP.rl.lisaa('ltkolikot',{x:100,y:100})");assert await P(pg,"Object.values(P.b).filter(x=>x.k==='kun').length")==1,'toinen lisäys ei kahdenna'
            # Paneelin Liukkaus-kenttä
            await pg.evaluate("(()=>{var m="+KARTTA.replace('P.b','APP.P.b')+";APP.S.sel={t:'b',id:m.id};APP.renderAll();})()");await pg.wait_for_timeout(150)
            n=await pg.locator('#insp input[data-ltj$="|liu"]').count();assert n==4,'liukkaus jokaisella lajilla %d'%n
            await pg.fill('#insp input[data-ltj="0|liu"]','40');await pg.locator('#insp input[data-ltj="0|liu"]').dispatch_event('change');await pg.wait_for_timeout(100)
            assert await P(pg,KARTTA+".lj[0].liu")==40
            await pg.fill('#insp input[data-ltj="0|liu"]','250');await pg.locator('#insp input[data-ltj="0|liu"]').dispatch_event('change');await pg.wait_for_timeout(100)
            assert await P(pg,KARTTA+".lj[0].liu")==100,'enintään 100'
            await pg.fill('#insp input[data-ltj="0|liu"]','0');await pg.locator('#insp input[data-ltj="0|liu"]').dispatch_event('change');await pg.wait_for_timeout(100)
            assert await P(pg,"!('liu' in "+KARTTA+".lj[0])"),'0 poistaa'
            nh=await pg.locator('#insp .help',has_text='(jää)').count();assert nh==1,[x for x in (await pg.inner_text('#insp')).split(chr(10)) if 'iinte' in x or 'iukk' in x]
            # Käytössä: hahmo kävelee kolikoiden ja painelaatta-lajin yli
            await pg.evaluate("""(function(){var P=APP.P,v=P.views[0].id,m=Object.values(P.b).filter(x=>x.k==='laatat')[0],c=m.lj.filter(l=>l.n==='Kolikko')[0].c;
              m.lj=m.lj.concat([{c:'p',n:'Paine',hue:1,t:'lapi',il:true}]);m.x=20;m.y=100;m.lw=12;m.lh2=4;
              m.lrt=['............','............','....'+c+'.p.'+c+'...','111111111111'];KK.ltRepair(m);
              var a=KK.addBlock(P,'alue',{v:v});a.x=-200;a.y=-400;a.w=1200;a.h=1200;a.pv=2000;
              var h=KK.addBlock(P,'muoto',{v:v});h.x=30;h.y=140;h.w=28;h.h=28;var li=KK.addBlock(P,'liike',{o:h.id});li.vx='200';KK.addNode(P,li.id,0,900);KK.repair(P);APP.renderAll();})()""")
            await pg.evaluate("APP.rl.avaa(false)");await pg.click('#lockbtn');await pg.wait_for_timeout(2600)
            r=await P(pg,"[KK.ltMaarat(KK.ltNyt(P,"+KARTTA+")),KK.Ev(P).val(Object.values(P.b).filter(x=>x.k==='muisti')[0].id)]");print(W,'käytössä',r)
            c=await P(pg,KARTTA+".lj.filter(l=>l.n==='Kolikko')[0].c")
            assert (r[0].get(c) or 0)==0 and r[0].get('p')==1 and r[1]==2,r
            await pg.click('#lockbtn');await pg.wait_for_timeout(200)
            # Painelaatta
            await pg.evaluate("APP.rl.avaa(true)");await pg.evaluate("APP.S.rl.hy='alueet';APP.rl.lisaa('painelaatta',{x:600,y:600})");await pg.wait_for_timeout(100)
            pl=await P(pg,"""(()=>{var m=Object.values(P.b).filter(x=>x.nm==='Painelaatta')[0],a=Object.values(P.b).filter(x=>x.nm==='Painelaatta: alue')[0];
              var l=P.lg.l.filter(q=>{var f=P.lg.n.find(n=>n.id===q.f),t=P.lg.n.find(n=>n.id===q.t);return f&&t&&f.p===a.id&&t.p===m.id&&q.tp==='vr';});return [m.k,m.w,m.h,a.k,l.length];})()""")
            print(W,'painelaatta',pl);assert pl==['muoto',64,10,'alue',1],pl
            print(W,'ok','errs',errs);assert not errs
            await b.close()
asyncio.run(main())
