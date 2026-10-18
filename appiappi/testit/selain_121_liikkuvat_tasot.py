# Jonon 22 (F35 vaihe G): rakennuslaatikon Liikkuva taso (este, Reitti edestakaisin, Liike) ja lukittuna painovoimassa
# tason päällä seisova hahmo kulkee tason mukana eikä irtoa. Tietokone 1440 ja 1280 px, 390 px savutestinä. Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0].id;APP.rl.lisaa('taso',{x:100,y:400});
 function U(k,o,x,y,w,h,nm){var b=KK.addBlock(P,k,o);b.x=x;b.y=y;b.w=w;b.h=h;KK.setName(P,b.id,nm);return b;}
 var t=Object.values(P.b).filter(function(b){return b.nm==='Liikkuva taso';})[0],a=U('alue',{v:v},-400,-400,1600,1600,'Maailma'),
   h=U('muoto',{v:v,laji:'laatikko'},t.x+60,t.y-80,40,40,'Pelaaja');a.pv=2000;h.este=true;
 var l=KK.addBlock(P,'liike',{o:h.id});KK.setName(P,l.id,'Pelaajan liike');KK.addNode(P,l.id,300,0);KK.repair(P);APP.renderAll();
 var tl=Object.values(P.b).filter(function(b){return b.k==='liike'&&b.o===t.id;})[0],rt=P.b[tl.rt];
 return {t:t.id,h:h.id,l:l.id,tl:tl.id,rtt:tl.rtt,vm:tl.vm,este:t.este,rt:rt&&rt.k};})()"""
POS="(I)=>{var E=KK.Ev(APP.P,APP.ctx());return [E.omiNum(I.t,'x',0),E.omiNum(I.t,'y',0),E.omiNum(I.h,'x',0),E.omiNum(I.h,'y',0),E.val(I.l,'maa'),E.val(I.l,'alla')];}"
async def main():
    async with async_playwright() as p:
        for W in (1440,1280,390):
            b,pg,errs=await avaa(p,W,900 if W>500 else 844)
            await pg.fill('#wname','Tasot');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(200)
            assert I['este'] is True and I['rt']=='reitti' and I['rtt']=='edestakaisin' and I['vm']==80,I
            await pg.click('#lockbtn');await pg.wait_for_timeout(700)
            a=await pg.evaluate(POS,I)
            assert a[4] is True and a[5]=='Liikkuva taso' and abs(a[3]-(a[1]-40))<1.5,('seisoo tasolla',a)
            await pg.wait_for_timeout(1000)
            c=await pg.evaluate(POS,I)
            dt,dh=c[0]-a[0],c[2]-a[2]
            assert abs(dt)>30,('taso liikkui',a,c)
            assert abs(dh-dt)<3 and c[4] is True,('hahmo kulki tason mukana',a,c)
            await pg.screenshot(path='tasot_%d.png'%W)
            print(W,'ok','errs',errs);assert not errs,errs;await b.close()
asyncio.run(main())
