# Jonon 21 jatko (Appi-appi 86): rakennuslaatikon kamera. Laitenäkymässä pelaaja saa kameran seuraamaan itseään (vain jos kukaan
# ei ole seurattavana), ja ohjaimet menevät lukittuun kerrokseen Ohjaimet ruudun alareunaan; lukittuna putoava hahmo pysyy
# ruudulla ja Tatti paikallaan. Kameran rajat tekee maailman kokoisen Alueen ja valitsee sen rajaksi; Kamera seuraa asettaa
# klikatun tai lähimmän liikkuvan seurattavaksi ja lopettaa lisäämisen (kertakohde). Tavallisessa näkymässä ennallaan.
# Tallennusmuoto ei muutu. 1440 ja 1280 px; 390 px savutestinä. Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
async def main():
    async with async_playwright() as p:
        for W in (1440,1280,390):
            H=900 if W>500 else 844
            b,pg,errs=await avaa(p,W,H)
            await pg.fill('#wname','Laatikko kamera');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            ver0=await P(pg,"APP.data.ver||null")
            await pg.evaluate("(function(){var P=APP.P;P.views[0].laite='puhelin';P.views.push({id:'v2',n:'Tavallinen'});APP.renderAll();APP.rl.avaa(true);})()");await pg.wait_for_timeout(150)
            # 1 tasoloikka: kamera seuraa, ohjaimet lukittuun kerrokseen ruudun alareunaan
            n=await pg.evaluate("APP.rl.lisaa('tasoloikka',{x:300,y:300})");assert n>=5,n
            r=await P(pg,"(function(){var v=P.views[0],k=v.kr.filter(q=>q.rv===0),t=Object.values(P.b).filter(x=>x.k==='tatti')[0],n=Object.values(P.b).filter(x=>x.k==='nappi')[0],h=B('Pelaaja');"
                     "return [v.kam&&v.kam.o===h.id,k.length,k[0].n,t.kr===k[0].id,n.kr===k[0].id,t.x,t.y,n.x,n.y,h.kr||null];})()")
            assert r==[True,1,'Ohjaimet',True,True,24,664,246,728,None],r
            # 2 toinen pelaaja ei vie kameraa eikä tee toista kerrosta
            await pg.evaluate("APP.rl.lisaa('lentaja',{x:560,y:300})")
            r=await P(pg,"[P.views[0].kam.o===B('Pelaaja').id,P.views[0].kr.filter(q=>q.rv===0).length,Object.values(P.b).filter(x=>x.k==='tatti'&&x.kr==='k1').length]")
            assert r==[True,1,2],r
            if W>500:
                # klik hyllystä: Kamera seuraa klikattuun ja lopettaa lisäämisen (laatikko pois tieltä alas)
                await pg.evaluate("APP.S.rl.x=8;APP.S.rl.y=innerHeight-160;APP.renderAll()")
                await pg.locator('#rlbox [data-rlhy="nakyma"]').click();await pg.locator('#rlbox [data-rli="kamseuraa"]').click()
                cx=await pg.evaluate("(function(){var b=Object.values(APP.P.b).filter(x=>x.nm==='Lentäjä')[0],e=document.querySelector('.ue[data-id=\"'+b.id+'\"]').getBoundingClientRect();return [e.left+e.width/2,e.top+e.height/2];})()")
                await pg.mouse.click(cx[0],cx[1]);await pg.wait_for_timeout(150)
                assert await P(pg,"P.views[0].kam.o===B('Lentäjä').id")
                assert await pg.evaluate("APP.S.rl.pick")==None
                assert 'Kamera seuraa: Lentäjä' in await pg.inner_text('#toast')
                await pg.evaluate("APP.rl.lisaa('kamseuraa',{x:300,y:300})")
            if W>500:
                # 3 lukittuna hahmo putoaa ruudun alapuolella olevalle lattialle, kamera seuraa: hahmo ja Tatti pysyvät ruudulla
                hid=await P(pg,"B('Pelaaja').id")
                y0=await pg.evaluate("(h)=>KK.Ev(APP.P,APP.ctx()).omiNum(h,'y',0)",hid)
                await pg.evaluate("APP.rl.lisaa('lattia',{x:300,y:1600})")
                await pg.evaluate("APP.rl.avaa(false)");await pg.click('#lockbtn');await pg.wait_for_timeout(2500)
                y1=await pg.evaluate("(h)=>KK.Ev(APP.P,APP.ctx()).omiNum(h,'y',0)",hid)
                assert y1-y0>1000,('putosi lattialle ruudun alapuolelle',y0,y1)
                sc=await pg.evaluate("(h)=>{var u=document.querySelector('#uvp').getBoundingClientRect(),t=Object.values(APP.P.b).filter(x=>x.k==='tatti')[0];function q(id){var e=document.querySelector('.ue[data-id=\"'+id+'\"]').getBoundingClientRect();return e.top>=u.top-1&&e.bottom<=u.bottom+1&&e.left>=u.left-1&&e.right<=u.right+1;}return [q(h),q(t.id)];}",hid)
                assert sc==[True,True],sc
                await pg.click('#lockbtn');await pg.wait_for_timeout(200);await pg.evaluate("APP.rl.avaa(true)")
            # 4 Kameran rajat: maailman kokoinen Alue rajaksi, toinen korvaa
            n=await pg.evaluate("APP.rl.lisaa('kamrajat',{x:0,y:0})");assert n==1,n
            r=await P(pg,"(function(){var a=B('Kameran rajat'),v=P.views[0],ui=Object.values(P.b).filter(x=>x.v===v.id&&KK.pinnalla(P,x)&&x.k!=='alue'&&x.k!=='merkki'&&KK.K[x.k].g==='ui');"
                     "return [v.kam.ra===a.id,ui.every(o=>o.x>=a.x&&o.y>=a.y&&o.x+o.w<=a.x+a.w&&o.y+o.h<=a.y+a.h),a.w>=390&&a.h>=844,KK.kameraRajat(P,v.id,APP.ctx()).x1===a.x+a.w];})()")
            assert r==[True,True,True,True],r
            await pg.evaluate("APP.rl.lisaa('kamrajat',{x:0,y:0})")
            r=await P(pg,"[Object.values(P.b).filter(x=>x.nm.indexOf('Kameran rajat')==0).length,P.views[0].kam.ra===Object.values(P.b).filter(x=>x.nm.indexOf('Kameran rajat')==0)[1].id]")
            assert r==[2,True],r
            # 5 Kamera seuraa: klikattu palikka, ohi klikattaessa lähin liikkuva; klik hyllystä lopettaa lisäämisen
            await pg.evaluate("APP.rl.lisaa('kamseuraa',{x:340,y:200})")
            assert await P(pg,"P.views[0].kam.o===B('Pelaaja').id")
            await pg.evaluate("APP.rl.lisaa('kamseuraa',{x:582,y:322})")
            assert await P(pg,"P.views[0].kam.o===B('Lentäjä').id")
            # 6 tavallinen näkymä: ei kameraa, ohjaimet hahmon viereen kuten ennen, kertakohteet eivät tee mitään
            await pg.evaluate("APP.S.vw='v2';APP.renderAll()");u0=await P(pg,"APP.S.undo.length")
            await pg.evaluate("APP.rl.lisaa('pelaaja_tatti',{x:300,y:300})")
            r=await P(pg,"(function(){var v=P.views[1],t=Object.values(P.b).filter(x=>x.k==='tatti'&&x.v==='v2')[0];return [!!v.kam,!!v.kr,t.kr||null];})()")
            assert r==[False,False,None],r
            u1=await P(pg,"APP.S.undo.length")
            assert await pg.evaluate("APP.rl.lisaa('kamrajat',{x:0,y:0})+APP.rl.lisaa('kamseuraa',{x:300,y:300})")==0
            assert await P(pg,"[APP.S.undo.length,!!P.views[1].kam,Object.values(P.b).filter(x=>x.v==='v2'&&x.k==='alue').length]")==[u1,False,0]
            # 7 tallennus ja lataus säilyttävät kameran ja kerroksen; tallennusmuoto ennallaan
            await pg.evaluate("APP.saveNow()");await pg.reload();await pg.wait_for_timeout(400)
            r=await P(pg,"[P.views[0].kam.o===B(%s).id,P.views[0].kam.ra"%"'Lentäjä'"+"===Object.values(P.b).filter(x=>x.nm.indexOf('Kameran rajat')==0)[1].id,P.views[0].kr.filter(q=>q.rv===0).length,APP.data.ver||null]")
            assert r==[True,True,1,ver0],r
            await pg.screenshot(path='laatikko_kamera_%d.png'%W)
            print(W,'ok','errs',errs);assert not errs;await b.close()
asyncio.run(main())
