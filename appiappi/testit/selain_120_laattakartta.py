# Jonon 18 (F35 vaihe C, suunnitelma 19 kohta 5): Laattakartta. Paletista kanvaasille, Maalaa, työkalurivi, veto maalaa
# ja yksi Kumoa poistaa vedon, ensimmäinen ruutu päättää (napautus maalattuun pyyhkii), oikea painike pyyhkii, numero
# valitsee lajin, 2×2-sivellin, ⇧-viiva, Täyttö, canvas piirtää paletin värin, paneelin sarakkeet ja kulman venytys,
# lajin tapa ja nimi, käytössä hahmo putoaa laattalattialle, 200 × 200 kartan piirto ja kuva. Tietokone 1440 ja 1280
# hiirellä, 390 kosketuksella savutestinä (napautus maalaa). Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
RIVIT="(function(){var b=Object.values(APP.P.b).filter(x=>x.k==='laatat')[0];return b?b.lrt:null;})()"
async def rivit(pg):return await pg.evaluate(RIVIT)
def maara(r,c='1'):return sum(s.count(c) for s in r)
async def solu(pg,x,y):
    return await pg.evaluate("([x,y])=>{var b=Object.values(APP.P.b).filter(q=>q.k==='laatat')[0],e=document.querySelector('.ue[data-id=\"'+b.id+'\"]').getBoundingClientRect();return [e.left+(x+0.5)*e.width/b.lw,e.top+(y+0.5)*e.height/b.lh2];}",[x,y])
async def main():
    async with async_playwright() as p:
        for W in (1440,1280,390):
            mob=W<500
            b=await p.chromium.launch();errs=[]
            ctx=await b.new_context(viewport={'width':W,'height':844 if mob else 900},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_function("window.APP&&APP.P!==undefined")
            await pg.fill('#wname','Laatat');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            if mob:
                await pg.evaluate("(function(){var P=APP.P,v=P.views[0].id,b=KK.addBlock(P,'laatat',{v:v});b.x=20;b.y=120;b.rk=32;b.lw=8;b.lh2=4;KK.repair(P);APP.S.sel={t:'b',id:b.id};APP.renderAll();})()")
                await pg.wait_for_timeout(150);await pg.evaluate("(function(){var b=Object.values(APP.P.b).filter(x=>x.k==='laatat')[0];APP.S.tool='laatat';APP.S.ltid=b.id;APP.renderAll();})()")
                await pg.wait_for_timeout(100);c=await solu(pg,2,1);await pg.touchscreen.tap(c[0],c[1]);await pg.wait_for_timeout(150)
                r=await rivit(pg);print(W,'kosketus',r[1]);assert r[1][2]=='1','napautus maalaa kosketuksella'
                assert await pg.locator('#uhint.ltbar').count()==1
                print(W,'ok (savutesti)','errs',errs);assert not errs;await b.close();continue
            # Paletista kanvaasille
            vb=await pg.evaluate("(()=>{var r=document.querySelector('#uvp').getBoundingClientRect();return [r.left,r.top,r.width,r.height];})()")
            await paletti(pg,'Laattakartta',vb[0]+300,vb[1]+200)
            n=await P(pg,"Object.values(P.b).filter(x=>x.k==='laatat').length");assert n==1,'kartta tuli'
            bid=await P(pg,"Object.values(P.b).filter(x=>x.k==='laatat')[0].id")
            await pg.evaluate("(i)=>{APP.S.sel={t:'b',id:i};APP.renderAll();}",bid);await pg.wait_for_timeout(100)
            assert await pg.locator('#insp [data-do="ltmaalaa"] svg.ico use').count()==1,'Maalaa-napin kynäkuvake'
            await pg.click('#insp [data-do="ltmaalaa"]');await pg.wait_for_timeout(100)
            assert await pg.locator('#uhint.ltbar').count()==1,'työkalurivi'
            assert await pg.locator('#uhint.ltbar .ltlab svg.ico use').count()==1,'kynäkuvake (Appi-appi 80)'
            kr=await pg.evaluate("(()=>{var b=document.querySelector('#uhint.ltbar').getBoundingClientRect(),o=0;document.querySelectorAll('.krow,[data-krv]').forEach(function(e){var r=e.getBoundingClientRect();if(r.width&&r.bottom>b.top&&r.top<b.bottom&&r.right>b.left&&r.left<b.right)o++;});return o})()")
            assert kr==0,'työkalurivi kerrosrivin päällä'
            assert 'ltmaal' in (await pg.get_attribute('#uvp','class'))
            # Veto maalaa rivin, yksi Kumoa poistaa sen
            a=await solu(pg,1,8);t=await solu(pg,10,8)
            await veda(pg,a,t);r=await rivit(pg);print(W,'veto',r[8]);assert r[8][1:11]=='1'*10,'veto maalasi'
            await pg.keyboard.press('Control+z');await pg.wait_for_timeout(150);r=await rivit(pg);assert maara(r)==0,'yksi Kumoa poisti vedon'
            await pg.keyboard.press('Control+Shift+z');await pg.wait_for_timeout(150);r=await rivit(pg);assert maara(r)==10,'Tee uudelleen'
            # työkalu säilyy kumouksen yli? avataan uudelleen tarvittaessa
            if await pg.locator('#uhint.ltbar').count()==0:
                await pg.evaluate("(i)=>{APP.S.sel={t:'b',id:i};APP.S.tool='laatat';APP.S.ltid=i;APP.renderAll();}",bid);await pg.wait_for_timeout(100)
            # Ensimmäinen ruutu päättää: napautus maalattuun pyyhkii
            c=await solu(pg,5,8);await pg.mouse.click(c[0],c[1]);await pg.wait_for_timeout(100);r=await rivit(pg);assert r[8][5]=='.','napautus maalattuun pyyhki'
            # Oikea painike pyyhkii
            c=await solu(pg,6,8);await pg.mouse.click(c[0],c[1],button='right');await pg.wait_for_timeout(100);r=await rivit(pg);assert r[8][6]=='.' and maara(r)==8,'oikea pyyhki'
            # Numero 2 = Koriste, sivellin 2×2
            await pg.keyboard.press('2');await pg.click('#uhint [data-lts="2"]');c=await solu(pg,3,3);await pg.mouse.click(c[0],c[1]);await pg.wait_for_timeout(100)
            r=await rivit(pg);print(W,'2×2',r[3][2:6],r[4][2:6]);assert maara(r,'2')==4 and r[3][3:5]=='22' and r[4][3:5]=='22','2×2 koristetta'
            # ⇧-viiva edellisestä ruudusta
            await pg.click('#uhint [data-lts="1"]');await pg.keyboard.press('1');c=await solu(pg,12,0);await pg.mouse.click(c[0],c[1]);c=await solu(pg,12,6)
            await pg.keyboard.down('Shift');await pg.mouse.click(c[0],c[1]);await pg.keyboard.up('Shift');await pg.wait_for_timeout(100)
            r=await rivit(pg);print(W,'viiva',[s[12] for s in r]);assert all(r[y][12]=='1' for y in range(7)),'⇧ vetää viivan'
            # Täyttö
            await pg.click('#uhint [data-lts="t"]');await pg.click('#uhint [data-ltc="2"]');c=await solu(pg,15,9);await pg.mouse.click(c[0],c[1]);await pg.wait_for_timeout(100)
            r=await rivit(pg);print(W,'täyttö',maara(r,'2'));assert maara(r,'2')>100,'täyttö täytti tyhjän alueen'
            await pg.keyboard.press('Control+z');await pg.wait_for_timeout(150);r=await rivit(pg);assert maara(r,'2')==4,'täyttö on yksi Kumoa'
            # Canvas: maalattu ruutu paletin värillä (Seinä = väri 1)
            px=await pg.evaluate("(i)=>{var cv=document.querySelector('.ue[data-id=\"'+i+'\"] canvas.w-laatat'),g=cv.getContext('2d'),d=g.getImageData(1*4+1,8*4+1,1,1).data,e=g.getImageData(0,0,1,1).data;return [Array.from(d),e[3],getComputedStyle(document.documentElement).getPropertyValue('--h0').trim()];}",bid)
            print(W,'pikseli',px);h0=px[2].lstrip('#');assert px[0][3]==255 and px[1]==0,'maalattu peittää, tyhjä läpinäkyvä'
            assert abs(px[0][0]-int(h0[0:2],16))<3 and abs(px[0][2]-int(h0[4:6],16))<3,'väri paletista'
            # Esc lopettaa
            await pg.keyboard.press('Escape');await pg.wait_for_timeout(100);assert await pg.locator('#uhint.ltbar').count()==0
            # Paneeli: sarakkeet, lajin nimi ja tapa
            await pg.evaluate("(i)=>{APP.S.sel={t:'b',id:i};APP.renderAll();}",bid);await pg.wait_for_timeout(100)
            await pg.fill('#insp input[data-lt="lw"]','20');await pg.press('#insp input[data-lt="lw"]','Tab');await pg.wait_for_timeout(100)
            bb=await P(pg,"(function(){var b=Object.values(P.b).filter(x=>x.k==='laatat')[0];return [b.lw,b.w,b.lrt[0].length];})()");print(W,'sarakkeet',bb);assert bb==[20,640,20]
            await pg.fill('#insp input[data-ltj="0|n"]','Kivi');await pg.press('#insp input[data-ltj="0|n"]','Tab');await pg.wait_for_timeout(100)
            await pg.click('#insp [data-ltt="1"][data-v="taso"]');await pg.wait_for_timeout(100)
            lj=await P(pg,"Object.values(P.b).filter(x=>x.k==='laatat')[0].lj.map(l=>l.n+':'+l.t)");assert lj==['Kivi:kiintea','Koriste:taso'],lj
            await pg.click('#insp [data-do="ltuusi"]');await pg.wait_for_timeout(100);assert await P(pg,"Object.values(P.b).filter(x=>x.k==='laatat')[0].lj.length")==3
            assert await P(pg,"E().prop(B('"+(await P(pg,"P.b['"+bid+"'].nm"))+"').id,'määrä.kivi')")==await P(pg,"KK.ltMaarat(P.b['"+bid+"'])['1']")
            # Kulman venytys lisää ruutuja (pyöristys ruutuihin)
            rh=await pg.evaluate("(i)=>{var e=document.querySelector('.ue[data-id=\"'+i+'\"] .rh').getBoundingClientRect();return [e.left+e.width/2,e.top+e.height/2];}",bid)
            z=await pg.evaluate("APP.S.cams?1:1");await veda(pg,rh,[rh[0]+70,rh[1]+40])
            bb=await P(pg,"(function(){var b=Object.values(P.b).filter(x=>x.k==='laatat')[0];return [b.lw,b.lh2,b.w,b.h,b.lrt.length,b.lrt[0].length];})()");print(W,'venytys',bb)
            assert bb[0]>20 and bb[2]==bb[0]*32 and bb[3]==bb[1]*32 and bb[4]==bb[1] and bb[5]==bb[0],'venytys pyöristyy ruutuihin'
            # Käytössä hahmo putoaa laattalattialle
            await pg.evaluate("""(i)=>{var P=APP.P,v=P.views[0].id,m=P.b[i];var r=[];for(var y=0;y<m.lh2;y++){var s='';for(var x=0;x<m.lw;x++)s+=y===m.lh2-1?'1':'.';r.push(s);}m.lrt=r;
              var a=KK.addBlock(P,'alue',{v:v});a.x=m.x-200;a.y=m.y-400;a.w=m.w+400;a.h=m.h+800;a.pv=2000;var h=KK.addBlock(P,'muoto',{v:v});h.x=m.x+40;h.y=m.y+10;h.w=24;h.h=24;KK.setName(P,h.id,'Hyppijä');
              var li=KK.addBlock(P,'liike',{o:h.id});KK.addNode(P,li.id,0,0);KK.repair(P);APP.renderAll();}""",bid)
            await pg.click('#lockbtn');await pg.wait_for_timeout(900)
            yy=await P(pg,"[E().omiNum(B('Hyppijä').id,'y',0),P.b['"+bid+"'].y+P.b['"+bid+"'].h-32-24,E().val(Object.values(P.b).filter(x=>x.k==='liike')[0].id,'maa')]");print(W,'käytössä',yy)
            assert abs(yy[0]-yy[1])<1 and yy[2]==True,'hahmo seisoo laattalattialla'
            await pg.click('#lockbtn');await pg.wait_for_timeout(200)
            # 200 × 200: piirto ja kuva
            t=await pg.evaluate("""(i)=>{var P=APP.P,m=P.b[i];m.lw=200;m.lh2=200;var r=[];for(var y=0;y<200;y++){var s='';for(var x=0;x<200;x++)s+=(x+y)%3?'1':(x%5?'.':'2');r.push(s);}m.lrt=r;KK.repair(P);
              var t0=performance.now();APP.renderAll();var t1=performance.now();var C=APP.ctx(),n=60,t2=performance.now();for(var k=0;k<n;k++)KK.frame(P,1/60,C);var t3=performance.now();return [t1-t0,(t3-t2)/n];}""",bid)
            print(W,'200×200 piirto %.1f ms, kuva %.3f ms'%(t[0],t[1]));assert t[1]<4,'kuva alle 4 ms';assert t[0]<400,'piirto'
            print(W,'ok','errs',errs);assert not errs
            await b.close()
asyncio.run(main())
