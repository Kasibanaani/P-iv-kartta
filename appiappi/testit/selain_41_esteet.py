# Appi-appi 2: Liike liikuttaa suoraan valittua palikkaa, esteet ja alueet selaimessa. Puhelinnäkymä: tatti kojelaudalla,
# hahmo, seinä (este), kivi kerroksessa, joka on este (🧱), maali-alue. Paneelista: Liikutettava palikka, Este-valinta,
# osuma-alue ja sen katkoviiva, kerroksen 🧱, Alueen Tunnistaa. Lukittuna tatti oikealle → hahmo pysähtyy seinään,
# vino tatti → liukuu seinää pitkin alas maali-alueelle → astuttu-tapahtuma kasvattaa laskuria, sisällä näkyy tekstissä.
# Alue on logiikan paletissa. Kuvat appiappi2_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0];v.laite='puhelin';var vw=v.id;
 v.kr=[{id:'pohja',n:'Pohja'},{id:'k2',n:'Kivet'},{id:'k1',n:'Kojelauta',rv:0}];
 function U(k,o,x,y,w,h,nm){var b=KK.addBlock(P,k,o);b.x=x;b.y=y;if(w)b.w=w;if(h)b.h=h;if(nm)KK.setName(P,b.id,nm);return b;}
 function N(b,x,y){return KK.addNode(P,b.id,x,y);}
 var tj=U('tatti',{v:vw},115,660,160,160,'Tatti');tj.kr='k1';
 var hm=U('muoto',{v:vw,laji:'ympyra',hue:1},60,100,40,40,'Hahmo');
 var se=U('muoto',{v:vw,laji:'laatikko',hue:3},240,0,30,600,'Seinä');
 var ki=U('muoto',{v:vw,laji:'ympyra',hue:2},40,300,60,60,'Kivi');ki.kr='k2';
 var ma=U('alue',{v:vw},150,420,90,120,'Maali');
 var tx=U('nayta',{v:vw,tx:''},20,20,300,40,'Tila');
 var tjn=N(tj,0,0);
 var li=KK.addBlock(P,'liike',{x0:0,y0:0});var lin=N(li,600,0);
 var mx=KK.addBlock(P,'lasku',{op:'mul',b:300}),my=KK.addBlock(P,'lasku',{op:'mul',b:300});var mxn=N(mx,300,0),myn=N(my,300,80);
 KK.addLink(P,tjn.id,'x',mxn.id,'a');KK.addLink(P,tjn.id,'y',myn.id,'a');KK.addLink(P,mxn.id,'v',lin.id,'vx');KK.addLink(P,myn.id,'v',lin.id,'vy');
 var mem=KK.addBlock(P,'muisti',{v:'0'});N(mem,900,500);var t=KK.addBlock(P,'tee',{do:'lisaa',o:mem.id});var tn=N(t,600,500);KK.addLink(P,N(ma,300,500).id,'e',tn.id,'e');
 tx.tx='Maalissa: {'+ma.vt+'}';
 KK.repair(P);APP.renderAll();return {tj:tj.id,hm:hm.id,se:se.id,ki:ki.id,ma:ma.id,li:li.id,mem:mem.id,tx:tx.id};})()"""
async def valitse(pg,id):
    await pg.evaluate("(function(){APP.S.sel={t:'b',id:'%s'};APP.S.multi=[];APP.renderAll();})()"%id);await pg.wait_for_timeout(120)
async def left(pg,id):
    return await pg.evaluate("[parseFloat(document.querySelector('.ue[data-id=\"%s\"]').style.left),parseFloat(document.querySelector('.ue[data-id=\"%s\"]').style.top)]"%(id,id))
async def main():
    async with async_playwright() as p:
        for W in (1440,390):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Esteet');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP)
            if W>500:
                # --- 0. Paneelit ---
                await valitse(pg,I['li'])
                await pg.select_option('#insp select[data-k="o"]',I['hm']);await pg.wait_for_timeout(120)
                assert await P(pg,"P.b['%s'].o"%I['li'])==I['hm']
                assert 'Liikuttaa palikkaa' in await P(pg,"KK.why(P,E(),'%s',1).txt"%I['li'])
                await valitse(pg,I['se'])
                assert await pg.locator('.ue[data-id="%s"] .hitb'%I['se']).count()==0,'ei vielä este'
                await pg.check('#insp input[data-k="este"]');await pg.wait_for_timeout(120)
                assert await P(pg,"P.b['%s'].este"%I['se'])==True
                assert await pg.locator('.ue[data-id="%s"] .hitb'%I['se']).count()==1,'osuma-alue näkyy'
                await pg.click('#insp [data-seg="osu"][data-v="laatikko"]');await pg.wait_for_timeout(100)
                assert await P(pg,"P.b['%s'].osu"%I['se'])=='laatikko'
                await valitse(pg,I['hm'])
                assert await pg.locator('.ue[data-id="%s"] .hitb.mv'%I['hm']).count()==1,'liikkuvan osuma-alue'
                assert 'Liikkuu: Liike-palikka' in await pg.inner_text('#insp')
                await pg.fill('#insp input[data-k="osk"]','90');await pg.dispatch_event('#insp input[data-k="osk"]','input');await pg.wait_for_timeout(100)
                assert str(await P(pg,"P.b['%s'].osk"%I['hm']))=='90'
                await pg.evaluate("(function(){APP.S.sel=null;APP.S.multi=[];APP.renderAll();})()");await pg.wait_for_timeout(100)
                await pg.click('#insp [data-kre="k2"]');await pg.wait_for_timeout(100)
                assert await P(pg,"P.views[0].kr.find(k=>k.id==='k2').este")==True
                await valitse(pg,I['ma'])
                await pg.select_option('#insp select[data-k="kuka"]',I['hm']);await pg.wait_for_timeout(100)
                assert await P(pg,"P.b['%s'].kuka"%I['ma'])==I['hm']
                await pg.screenshot(path='appiappi2_paneeli_%d.png'%W)
                # Alue logiikan paletissa
                await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(150)
                assert await pg.locator('#pal .chip',has_text='Maali').count()>=1,'alue logiikan paletissa'
                await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(150)
            else:
                await pg.evaluate("(function(){var P=APP.P;P.b['%s'].o='%s';P.b['%s'].este=true;P.b['%s'].osu='laatikko';P.views[0].kr[1].este=true;P.b['%s'].kuka='%s';APP.renderAll();})()"%(I['li'],I['hm'],I['se'],I['se'],I['ma'],I['hm']))
            r=20*(0.9 if W>500 else 1);ex=240-r-20
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            # --- 1. Tatti oikealle: pysähtyy seinään (hahmon oikea reuna 240) ---
            tb=await pg.locator('.ue[data-id="%s"] .w-tatti'%I['tj']).bounding_box();cx,cy=tb['x']+tb['width']/2,tb['y']+tb['height']/2
            await pg.mouse.move(cx,cy);await pg.mouse.down();await pg.mouse.move(cx+tb['width']*0.45,cy,steps=4);await pg.wait_for_timeout(1000)
            l=await left(pg,I['hm']);osuu=await P(pg,"E().val('%s','osuu')"%I['li'])
            print(W,'1 seinässä:',l,osuu);assert abs(l[0]-ex)<0.6 and abs(l[1]-100)<1 and osuu
            await pg.screenshot(path='appiappi2_seina_%d.png'%W)
            # --- 2. Vino (oikea-alas): liukuu seinää pitkin alas ja astuu maaliin ---
            await pg.mouse.move(cx+tb['width']*0.3,cy+tb['height']*0.3,steps=3);await pg.wait_for_timeout(1800)
            await pg.mouse.up();await pg.wait_for_timeout(300)
            l=await left(pg,I['hm']);m=await P(pg,"E().val('%s')"%I['mem']);sis=await P(pg,"E().val('%s')"%I['ma'])
            txt=await pg.inner_text('.ue[data-id="%s"]'%I['tx'])
            print(W,'2 liukui:',l,'astuttu',m,'sisällä',sis,txt)
            assert abs(l[0]-ex)<0.6 and l[1]>400,'liukui seinää pitkin'
            assert m==1 and sis==True and 'kyllä' in txt,'maali tunnistettu'
            await pg.screenshot(path='appiappi2_maali_%d.png'%W)
            # --- 3. Kivi (kerros on este): hahmo vasemmalle alas kohti kiveä ei mene sisään ---
            await pg.evaluate("(function(){APP.P.st['o:%s']={x:50,y:200};KK.tick(APP.P,APP.ctx());APP.renderAll();APP.runFrames();})()"%I['hm'])
            await pg.mouse.move(cx,cy);await pg.mouse.down();await pg.mouse.move(cx,cy+tb['height']*0.45,steps=4);await pg.wait_for_timeout(900);await pg.mouse.up();await pg.wait_for_timeout(200)
            l=await left(pg,I['hm']);d=((l[0]+20-70)**2+(l[1]+20-330)**2)**0.5
            print(W,'3 kiven päällä, etäisyys keskipisteistä',round(d,1));assert d>=30+r-0.6 and l[1]<300,'kivi pysäytti'
            assert await P(pg,"E().val('%s')"%I['ma'])==False,'poistui maalista'
            print(W,'errs',errs);assert not errs;await b.close()
asyncio.run(main())
