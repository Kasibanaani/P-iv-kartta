# Jono 20 (F35 vaihe E1, 21.10.2026): piirtoruudukko ja piirroskirjasto. Rakennuslaatikon ＋ Piirrä uusi palikka (Kuva + piirtoikkuna),
# kynä (napautus, veto, oikea painike pyyhkii, ⇧-viiva), Täyttö, peilaus, koko, Kumoa yksi veto kerrallaan, Kuvan kuva terävänä,
# kirjastovalikko, kuvasarjan seuraava kuva, laattalajin ilme (kartta piirtyy tarkempana), paletin vaihto vaihtaa kuvan ja näkymän
# Pikselitarkka (kokonaiset pikselit käytössä). Tietokone 1440 ja 1280. Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
PX="APP.P.px[APP.S.px.id]"
async def solu(pg,i,j):
    r=await pg.evaluate("(()=>{var c=document.querySelector('#pxcv').getBoundingClientRect(),x=%s;return [c.left,c.top,c.width/x.w,c.height/x.h];})()"%PX)
    return [r[0]+(i+0.5)*r[2],r[1]+(j+0.5)*r[3]]
async def d(pg):return await pg.evaluate(PX+".d")
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Piirto');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            await pg.evaluate("APP.rl.avaa(true)");await pg.wait_for_timeout(100)
            assert await pg.locator('#rlbox [data-rli="piirros"]').count()==1,'Rakenne-hyllyssä ＋ Piirrä uusi palikka'
            await pg.evaluate("APP.rl.lisaa('piirros',{x:200,y:200})");await pg.wait_for_timeout(200)
            assert await pg.locator('#pxcv').count()==1,'piirtoikkuna aukesi'
            k=await P(pg,"Object.values(P.b).filter(x=>x.k==='pkuva').map(x=>[x.src,x.w,x.h])");assert k==[['px:d1',64,64]],k
            assert await pg.evaluate(PX+".w")==16
            u0=len(await pg.evaluate("APP.S.undo.length"))if False else await pg.evaluate("APP.S.undo.length")
            # Napautus maalaa, toinen napautus samaan pyyhkii (ensimmäinen ruutu päättää)
            c=await solu(pg,0,0);await pg.mouse.click(c[0],c[1]);await pg.wait_for_timeout(50);s=await d(pg);assert s[0]=='e',s[:4]
            await pg.mouse.click(c[0],c[1]);await pg.wait_for_timeout(50);assert (await d(pg))[0]=='.'
            # Veto rivillä 2 ruudusta 1 ruutuun 6 = yksi Kumoa
            a=await solu(pg,1,2);t=await solu(pg,6,2);await veda(pg,a,t,steps=10);s=await d(pg);assert s[32+1:32+7]=='eeeeee',s[32:48]
            n1=await pg.evaluate("APP.S.undo.length")
            # ⇧ + napautus vetää viivan edellisestä ruudusta
            c=await solu(pg,6,5);await pg.keyboard.down('Shift');await pg.mouse.click(c[0],c[1]);await pg.keyboard.up('Shift');await pg.wait_for_timeout(50)
            s=await d(pg);assert all(s[y*16+6]=='e' for y in (2,3,4,5)),[s[y*16+6] for y in range(6)]
            # Oikea painike pyyhkii
            c=await solu(pg,6,5);await pg.mouse.click(c[0],c[1],button='right');await pg.wait_for_timeout(50);assert (await d(pg))[5*16+6]=='.'
            # Kumoa: oikea painike, viiva ja veto yksi kerrallaan
            await pg.keyboard.press('Control+z');await pg.keyboard.press('Control+z');await pg.wait_for_timeout(100);s=await d(pg)
            assert s[32+1:32+7]=='eeeeee' and s[3*16+6]=='.',s[32:64]
            await pg.keyboard.press('Control+z');await pg.wait_for_timeout(100);assert (await d(pg))[32+1:32+7]=='......','veto kumoutui kerralla'
            assert await pg.locator('#pxcv').count()==1,'ikkuna pysyy auki Kumoa jälkeen'
            # Väri, peilaus ja Täyttö
            await pg.click('#pxroot [data-pxc="o"]');await pg.click('#pxroot [data-pxpe]');c=await solu(pg,2,7);await pg.mouse.click(c[0],c[1]);await pg.wait_for_timeout(50)
            s=await d(pg);assert s[7*16+2]=='o' and s[7*16+13]=='o',s[7*16:8*16]
            await pg.click('#pxroot [data-pxpe]');await pg.click('#pxroot [data-pxty="tayta"]');await pg.click('#pxroot [data-pxc="v"]');c=await solu(pg,0,0);await pg.mouse.click(c[0],c[1]);await pg.wait_for_timeout(50)
            s=await d(pg);assert s.count('v')==254 and s.count('o')==2,(s.count('v'),s.count('o'))
            # Koko 32 × 8 (vasen yläkulma säilyy), Käännä
            await pg.click('#pxroot [data-pxw="32"]');await pg.click('#pxroot [data-pxh="8"]');await pg.wait_for_timeout(50)
            x=await pg.evaluate("[%s.w,%s.h,%s.d.length]"%(PX,PX,PX));assert x==[32,8,256],x
            s=await d(pg);assert s[7*32+2]=='o' and s[7*32+16:7*32+32]=='.'*16
            await pg.click('#pxroot [data-pxflip]');s=await d(pg);assert s[7*32+29]=='o',s[7*32:8*32]
            # Nimi
            await pg.fill('#pxroot input[data-pxn]','Hahmo');await pg.locator('#pxroot input[data-pxn]').dispatch_event('change');assert await pg.evaluate(PX+".n")=='Hahmo'
            await pg.click('#sheet [data-x="close"]');await pg.wait_for_timeout(100)
            # Kuva näyttää piirroksen terävänä
            im=await pg.evaluate("(()=>{var i=document.querySelector('#uels .ue.k-pkuva img');return i?[i.className,i.src.slice(0,22),getComputedStyle(i).imageRendering]:null;})()")
            print(W,'kuva',im);assert im and im[0]=='pxi' and im[1]=='data:image/png;base64,' and im[2]=='pixelated',im
            # Paneeli: piirroksen rivi, kuvasarjan seuraava kuva (kopio), kirjastovalikko
            await pg.evaluate("(()=>{var k=Object.values(APP.P.b).filter(x=>x.k==='pkuva')[0];APP.S.sel={t:'b',id:k.id};APP.renderAll();})()");await pg.wait_for_timeout(150)
            assert await pg.locator('#insp .pxrow',has_text='Hahmo').count()>=1
            await pg.click('#insp [data-pxnew="sarja"]');await pg.wait_for_timeout(150);assert await pg.locator('#pxcv').count()==1
            sa=await P(pg,"[Object.values(P.b).filter(x=>x.k==='pkuva')[0].sarja,Object.keys(P.px).length,P.px.d2.d===P.px.d1.d,P.px.d2.n]");print(W,'sarja',sa)
            assert sa[0]==['px:d2'] and sa[1]==2 and sa[2] and sa[3]=='Hahmo 2',sa
            await pg.click('#sheet [data-x="close"]');await pg.wait_for_timeout(100)
            assert await pg.locator('#insp select[data-pxk="src"] option').count()==3,'kirjastovalikko: tyhjä + 2'
            # Laattakartta: lajin ilme piirroksena
            await pg.evaluate("APP.rl.lisaa('laattakartta',{x:500,y:500})");await pg.wait_for_timeout(100)
            await pg.evaluate("(()=>{var m=Object.values(APP.P.b).filter(x=>x.k==='laatat')[0];m.lrt=m.lrt.map((r,i)=>i===0?'1'.repeat(m.lw):r);APP.S.sel={t:'b',id:m.id};APP.renderAll();})()");await pg.wait_for_timeout(150)
            w0=await pg.evaluate("document.querySelector('canvas.w-laatat').width")
            await pg.click('#insp [data-pxnew="laji"][data-i="0"]');await pg.wait_for_timeout(150)
            lj=await P(pg,"[Object.values(P.b).filter(x=>x.k==='laatat')[0].lj[0].px,P.px.d3.n]");assert lj==['d3','Seinä'],lj
            assert await pg.evaluate("APP.S.px.c")=='b','oletusväri lajin väristä (perus)'
            c=await solu(pg,3,3);await pg.mouse.click(c[0],c[1]);await pg.click('#sheet [data-x="close"]');await pg.wait_for_timeout(150)
            w1=await pg.evaluate("document.querySelector('canvas.w-laatat').width");print(W,'kartta',w0,w1);assert w1==16*16 and w0==16*4,(w0,w1)
            px=await pg.evaluate("(()=>{var c=document.querySelector('canvas.w-laatat'),g=c.getContext('2d');return [g.getImageData(3,3,1,1).data[3],g.getImageData(0,0,1,1).data[3]];})()")
            assert px==[255,0],px
            assert await pg.locator('#insp .pxrow b',has_text='Seinä').count()==1
            await pg.click('#insp [data-ltpx0="0"]');await pg.wait_for_timeout(100);assert await P(pg,"!('px' in Object.values(P.b).filter(x=>x.k==='laatat')[0].lj[0])")
            # Paletin vaihto tekee uuden kuvan
            u1=await pg.evaluate("APP.px.url('d1')");await pg.evaluate("document.documentElement.style.setProperty('--h7','#000000')");u2=await pg.evaluate("APP.px.url('d1')");assert u1!=u2,'kuva seuraa palettia'
            await pg.evaluate("document.documentElement.style.removeProperty('--h7')")
            # Pikselitarkka
            await pg.evaluate("APP.S.sel=null;APP.renderAll()");await pg.wait_for_timeout(100)
            await pg.locator('#insp input[data-vpxt]').check();await pg.wait_for_timeout(100);assert await P(pg,"P.views[0].pxt")==True
            await pg.evaluate("(()=>{var k=Object.values(APP.P.b).filter(x=>x.k==='pkuva')[0];k.x=200.4;k.y=100.6;APP.renderAll();})()")
            await pg.evaluate("APP.rl.avaa(false)");await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            r=await pg.evaluate("(()=>{var e=document.querySelector('#uels .ue.k-pkuva');return [e.style.left,e.style.top,document.querySelector('#uvp').classList.contains('pxt')];})()");print(W,'pikselitarkka',r)
            assert r==['200px','101px',True],r
            await pg.click('#lockbtn');await pg.wait_for_timeout(150)
            # Poisto kirjastosta tyhjentää viitteet
            await pg.evaluate("APP.px.avaa('d1')");await pg.click('#pxroot [data-pxdel]');await pg.wait_for_timeout(100)
            assert await P(pg,"[Object.keys(P.px),Object.values(P.b).filter(x=>x.k==='pkuva')[0].src]")==[['d2','d3'],''],await P(pg,"Object.keys(P.px)")
            await pg.keyboard.press('Control+z');await pg.wait_for_timeout(100);assert await P(pg,"Object.values(P.b).filter(x=>x.k==='pkuva')[0].src")=='px:d1','Kumoa palauttaa'
            print(W,'ok','errs',errs);assert not errs
            await b.close()
asyncio.run(main())
