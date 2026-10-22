# Jono 21 jatko (21.10.2026): rakennuslaatikon Kuolema-alue (Alueet), Avain ja ovi sekä Portti (Esineet). Ilman pelaajaa ei lisätä
# mitään; pelaaja = ohjattu tai Reititön Liikkeen kohde (Reitin vihollinen ohitetaan, vaikka se on lähempänä). Moottorilla kuljetettu
# hahmo: portti siirtää kohteeseen, avain avaa oven (ovi ei enää este), kuolema-alue palauttaa alkuun ja vähentää Elämät.
# Tietokone 1440 ja 1280. Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
NM="(n=>Object.values(P.b).filter(x=>x.nm===n)[0])"
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Ovet');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            await pg.evaluate("APP.rl.avaa(true)");await pg.wait_for_timeout(150)
            n0=await P(pg,"Object.keys(P.b).length")
            for it in ('kuolema','avain','portti'):
                await pg.evaluate("APP.rl.lisaa('"+it+"',{x:300,y:300})")
            assert await P(pg,"Object.keys(P.b).length")==n0,'ilman pelaajaa ei lisätä'
            await pg.locator('#rlbox [data-rlhy="esineet"]').click();await pg.wait_for_timeout(100)
            assert await pg.locator('#rlbox [data-rli="avain"]').count()==1 and await pg.locator('#rlbox [data-rli="portti"]').count()==1
            await pg.locator('#rlbox [data-rlhy="alueet"]').click();await pg.wait_for_timeout(100)
            assert await pg.locator('#rlbox [data-rli="kuolema"]').count()==1
            await pg.evaluate("""(function(){var P=APP.P,v=P.views[0].id;
              var a=KK.addBlock(P,'alue',{v:v,nm:'Maailma'});a.x=-200;a.y=-200;a.w=3000;a.h=1400;a.pv=2000;
              var f=KK.addBlock(P,'muoto',{v:v,nm:'Lattia'});f.x=0;f.y=300;f.w=2800;f.h=20;f.este=true;
              var h=KK.addBlock(P,'muoto',{v:v,nm:'Sankari'});h.x=100;h.y=272;h.w=28;h.h=28;var li=KK.addBlock(P,'liike',{o:h.id});li.vx='200';KK.addNode(P,li.id,0,900);
              KK.repair(P);APP.renderAll();})()""")
            await pg.evaluate("APP.rl.lisaa('vihollinen',{x:2400,y:-1500})")
            await pg.evaluate("APP.rl.lisaa('elamat',{x:600,y:-600})")
            await pg.evaluate("APP.rl.lisaa('portti',{x:400,y:276})");await pg.evaluate("APP.rl.lisaa('avain',{x:1700,y:288})")
            await pg.evaluate("APP.rl.lisaa('kuolema',{x:2300,y:288})");await pg.wait_for_timeout(100)
            ku=await P(pg,"""(()=>{var h="""+NM+"""('Sankari');return ['Kuolema-alue: alue','Avain: alue','Portti: alue'].map(n=>"""+NM+"""(n).kuka===h.id);})()""")
            assert ku==[True,True,True],'pelaaja on Sankari, ei vihollinen %s'%ku
            lo=await P(pg,"""(()=>{var a="""+NM+"""('Kuolema-alue: alue'),an=P.lg.n.filter(n=>n.p===a.id).map(n=>n.id);
              return P.lg.l.filter(l=>an.indexOf(l.f)>=0).map(l=>{var b=P.b[P.lg.n.find(n=>n.id===l.t).p];return b.do+(b.om||'');}).sort();})()""")
            print(W,'kuolema',lo);assert lo==['lisaa','palautax','palautay'],lo
            mu=await P(pg,"""(()=>{var m="""+NM+"""('Avain löydetty'),k=Object.values(P.b).filter(x=>x.k==='kaava');return [m&&m.k,m&&m.v,"""+NM+"""('Ovi').este,k.length];})()""")
            print(W,'avain',mu);assert mu==['muisti',False,True,1],mu
            await pg.evaluate("(()=>{var q="+NM.replace('P.b','APP.P.b')+"('Portti: kohde');q.x=1500;q.y=250;})()")
            ST="(s=>{var C={now:()=>new Date(),toast:()=>{},nav:()=>{}};for(var i=0;i<s*60;i++)KK.frame(APP.P,1/60,C);var E=KK.Ev(APP.P),h="+NM.replace('P.b','APP.P.b')+"('Sankari'),m="+NM.replace('P.b','APP.P.b')+"('Avain löydetty'),e="+NM.replace('P.b','APP.P.b')+"('Elämät');return [Math.round(E.omiNum(h.id,'x')),!!E.val(m.id),E.val(e.id)];})"
            r1=await pg.evaluate(ST+"(1.6)");print(W,'portti',r1);assert r1[0]>=1500 and not r1[1] and r1[2]==3,r1
            r2=await pg.evaluate(ST+"(1.0)");print(W,'avain',r2);assert r2[1] and r2[0]>1650,r2
            r3=await pg.evaluate(ST+"(1.0)");print(W,'ovi',r3);assert r3[0]>1900,'ovi ei estä %s'%r3
            r4=await pg.evaluate(ST+"(2.0)");print(W,'kuolema',r4);assert r4[0]<600 and r4[2]==2,r4
            # Toinen avain saa omat nimet ja muistin
            await pg.evaluate("APP.rl.lisaa('avain',{x:900,y:-300})");await pg.wait_for_timeout(100)
            n2=await P(pg,"['Avain 2','Ovi 2','Avain 2 löydetty','Avain ja ovi 2'].map(n=>!!"+NM+"(n))");assert n2==[True]*4,n2
            print(W,'ok','errs',errs);assert not errs
            await b.close()
asyncio.run(main())
