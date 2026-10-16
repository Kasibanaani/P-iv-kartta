# Appi-appi 8: liike ruutu kerrallaan selaimessa. Paneeli: ohjaus Ruutu (askel = ruutu, Vauhti-osio piiloon, Tatti ja
# Pyyhkäisy ohjaa, kytkentäkohdat ylös/alas/vasen/oikea ja askel valmis). Lukittuna: nuolinappi → liukuu ruudun, seinä
# estää (törmäsi), pyyhkäisy alas → ruutu alas, lyhyt napautus ei liikuta. Leveydet 1440, 390 ja 320. Kuvat appiappi8_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0];v.laite='puhelin';var vw=v.id;v.kr=[{id:'pohja',n:'Pohja',rk:50,rkn:'aina'}];
 function U(k,o,x,y,w,h,nm){var b=KK.addBlock(P,k,o);b.x=x;b.y=y;if(w)b.w=w;if(h)b.h=h;if(nm)KK.setName(P,b.id,nm);return b;}
 var hm=U('muoto',{v:vw,laji:'ympyra',hue:1},55,105,40,40,'Nappula');
 var se=U('muoto',{v:vw,laji:'laatikko',hue:4},200,50,50,250,'Seinä');se.este=true;
 var li=KK.addBlock(P,'liike',{o:hm.id});var ln=KK.addNode(P,li.id,600,0);
 var ms=KK.addBlock(P,'muisti',{v:'0'});KK.addNode(P,ms.id,900,0);var tee=KK.addBlock(P,'tee',{do:'lisaa',o:ms.id});KK.addNode(P,tee.id,800,0);
 var nb={};[['yl','▲',150,620],['va','◀',90,680],['oi','▶',210,680],['al','▼',150,740]].forEach(function(q){var n=U('nappi',{v:vw,tx:q[1],beh:'kerta'},q[2],q[3],56,50,q[0]);nb[q[0]]=n.id;});
 KK.repair(P);APP.renderAll();return {hm:hm.id,li:li.id,ln:ln.id,nb:nb,ms:ms.id,tee:tee.id};})()"""
async def main():
    async with async_playwright() as p:
        for W in (1440,390,320):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Ruutuliike');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP)
            if W>500:
                await pg.evaluate("(function(){APP.S.sel={t:'b',id:'%s'};APP.S.multi=[];APP.renderAll();})()"%I['li']);await pg.wait_for_timeout(120)
                await pg.click('#insp [data-seg="ohj"][data-v="ruutu"]');await pg.wait_for_timeout(150)
                assert await P(pg,"P.b['%s'].ohj"%I['li'])=='ruutu'
                assert await pg.locator('#insp .help',has_text='Askel = kerroksen ruutu (50 px)').count()==1
                assert await pg.locator('#insp input[data-k="ka"]').count()==0,'Vauhti-osio piilossa'
                assert await pg.locator('#insp select[data-k="tt"]').count()==1
                await pg.check('#insp input[data-k="pyy"]');await pg.wait_for_timeout(150)
                assert await P(pg,"P.b['%s'].pyy"%I['li'])==True
                ins=await P(pg,"KK.ports(P.b['%s']).ins.map(x=>x.p)"%I['li']);assert ins==['vm','yl','al','va','oi','c','e'],ins
                assert 'ast' in await P(pg,"KK.ports(P.b['%s']).outs.map(x=>x.p)"%I['li'])
                await pg.locator('#insp input[data-k="pyy"]').scroll_into_view_if_needed()
                await pg.screenshot(path='appiappi8_paneeli_%d.png'%W)
            else:
                await pg.evaluate("(function(){var b=APP.P.b['%s'];b.ohj='ruutu';b.pyy=true;KK.repair(APP.P);APP.renderAll();})()"%I['li'])
            await pg.evaluate("""(function(){var P=APP.P,I=%s;['yl','al','va','oi'].forEach(function(s){KK.addLink(P,KK.addNode(P,I.nb[s],300,0).id,'e',I.ln,s);});
              KK.addLink(P,I.ln,'tor',KK.nodesOfBlock(P,I.tee)[0].id,'e');P.b[I.li].vm=250;KK.repair(P);APP.renderAll();})()"""%json.dumps(I))
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            async def pos():return await P(pg,"[E().omiNum('%s','x',0)+20,E().omiNum('%s','y',0)+20]"%(I['hm'],I['hm']))
            async def nappi(s,ms=450):await pg.click('.ue[data-id="%s"] button'%I['nb'][s]);await pg.wait_for_timeout(ms)
            assert await pos()==[75,125]
            await pg.click('.ue[data-id="%s"] button'%I['nb']['oi']);await pg.wait_for_timeout(90);mid=await pos()
            await pg.screenshot(path='appiappi8_liukuu_%d.png'%W);await pg.wait_for_timeout(400)
            q=await pos();print(W,'oikealle:',mid,'→',q);assert 75<mid[0]<125 and q==[125,125],q
            await nappi('oi');q=await pos();assert q==[175,125],'seinää vasten %s'%q
            await nappi('oi');q=await pos();t=await P(pg,"E().val('%s')"%I['ms']);print(W,'seinä:',q,'törmäsi',t);assert q==[175,125] and t==1
            # Pyyhkäisy alas tyhjästä kohdasta
            vb=await pg.locator('#uvp').bounding_box();z=vb['width']/390
            sx,sy=vb['x']+320*z,vb['y']+400*z
            await pg.mouse.move(sx,sy);await pg.mouse.down();await pg.mouse.move(sx+5*z,sy+30*z,steps=3);await pg.mouse.move(sx+6*z,sy+70*z,steps=3);await pg.mouse.up();await pg.wait_for_timeout(450)
            q=await pos();print(W,'pyyhkäisy alas:',q);assert q==[175,175],q
            await pg.mouse.click(sx,sy);await pg.wait_for_timeout(300);assert await pos()==[175,175],'napautus ei liikuta'
            await nappi('va');await nappi('yl');q=await pos();assert q==[125,125],q
            await pg.screenshot(path='appiappi8_lopussa_%d.png'%W)
            print(W,'errs',errs);assert not errs;await b.close()
asyncio.run(main())
