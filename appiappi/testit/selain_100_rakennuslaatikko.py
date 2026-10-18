# Jonon 21 (F35 vaihe F): kelluva rakennuslaatikko. Avautuu palikkavalikon Pikaluonnista, kuusi hyllyä; napautus valitsee
# kohteen ja jokainen klikkaus näkymään lisää yhden (klik klik), Esc lopettaa; raahaus kanvaasille lisää yhden; otsikosta
# raahaus siirtää ja paikka säilyy uudelleenlatauksessa (selaimen muisti); piilotus ja palautus; Omat = presetit.
# Valmiit kohteet ovat tavallisia palikoita: kolikko kerätään oikeasti (Pisteet +1, kolikko katoaa), Pisteet tehdään kerran.
# Lukittuna ja Logiikka-välilehdellä laatikko on piilossa. Tallennusmuoto ei muutu. 1440 ja 1280 px; 390 px savutestinä.
# Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
async def klik(pg,x,y):
    await pg.mouse.click(x,y);await pg.wait_for_timeout(120)
async def main():
    async with async_playwright() as p:
        for W in (1440,1280,390):
            H=900 if W>500 else 844
            b,pg,errs=await avaa(p,W,H)
            await pg.fill('#wname','Laatikko');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            ver0=await P(pg,"APP.data.ver||null")
            if W<500:
                # savutesti: avautuu ja lisää, ei sivuvirheitä
                await pg.evaluate("APP.rl.avaa(true)");await pg.wait_for_timeout(150)
                r=await pg.evaluate("JSON.stringify(document.querySelector('#rlbox').getBoundingClientRect())")
                import json;r=json.loads(r);assert r['width']>=220 and r['left']>=-200 and r['left']<W,r
                n=await pg.evaluate("APP.rl.lisaa('seina',{x:100,y:100})");assert n==1
                await pg.screenshot(path='rakennuslaatikko_%d.png'%W)
                print(W,'ok','errs',errs);await b.close();continue
            # 1 avaus palikkavalikosta: näkyy, kuusi hyllyä, Rakenne oletuksena
            await pg.locator('#pal [data-rlauki]').click();await pg.wait_for_timeout(150)
            assert await pg.evaluate("!document.querySelector('#rlbox').hidden")
            tabs=await pg.evaluate("[...document.querySelectorAll('#rlbox [data-rlhy]')].map(e=>e.textContent)")
            assert tabs==['Rakenne','Hahmot','Alueet','Esineet','Näkymä','Omat'],tabs
            # 2 klik klik: Seinä valitaan, kolme klikkausta = kolme estettä klikkauskohtiin (keskipiste, 10 px kohdistus)
            await pg.locator('#rlbox [data-rli="seina"]').click();await pg.wait_for_timeout(120)
            assert await pg.evaluate("APP.S.rl.pick")=='seina'
            assert await pg.evaluate("document.body.classList.contains('rlpick')")
            q=await pg.evaluate("(function(){var r=document.querySelector('#uvp').getBoundingClientRect();return [r.left,r.top];})()")
            pts=[(q[0]+120,q[1]+200),(q[0]+220,q[1]+200),(q[0]+320,q[1]+260)]
            for x,y in pts:await klik(pg,x,y)
            s=await P(pg,"Object.values(P.b).filter(b=>b.nm.indexOf('Seinä')==0).map(b=>[b.x+b.w/2,b.y+b.h/2,b.este===true,b.k])")
            assert len(s)==3 and all(z[2] and z[3]=='muoto' for z in s),s
            cam=await pg.evaluate("(function(){var c=APP.P.cam[APP.S.vw];return [c.x,c.y,c.z];})()")
            for (x,y),z in zip(pts,s):
                wx=(x-q[0]-cam[0])/cam[2];wy=(y-q[1]-cam[1])/cam[2];assert abs(z[0]-wx)<=6 and abs(z[1]-wy)<=6,(z,wx,wy)
            # Esc lopettaa: klikkaus ei enää lisää
            await pg.keyboard.press('Escape');await pg.wait_for_timeout(100)
            assert await pg.evaluate("APP.S.rl.pick")==None
            await klik(pg,q[0]+420,q[1]+300)
            assert await P(pg,"Object.values(P.b).filter(b=>b.nm.indexOf('Seinä')==0).length")==3
            # sama nappi uudestaan lopettaa
            await pg.locator('#rlbox [data-rli="seina"]').click();await pg.locator('#rlbox [data-rli="seina"]').click();await pg.wait_for_timeout(100)
            assert await pg.evaluate("APP.S.rl.pick")==None
            # 3 kumoa poistaa yhden lisäyksen kerrallaan
            await pg.evaluate("document.activeElement&&document.activeElement.blur()")
            await pg.keyboard.press('Control+z');await pg.wait_for_timeout(150)
            assert await P(pg,"Object.values(P.b).filter(b=>b.nm.indexOf('Seinä')==0).length")==2
            # 4 raahaus laatikosta kanvaasille lisää yhden (Lattia)
            c=await keskus(pg,'#rlbox [data-rli="lattia"]');await veda(pg,c,[q[0]+200,q[1]+420])
            assert await P(pg,"Object.values(P.b).filter(b=>b.nm=='Lattia').length")==1
            assert await pg.evaluate("APP.S.rl.pick")==None
            # 5 kolikot ja pelaaja: Pisteet tehdään kerran, kolikko katoaa ja Pisteet kasvaa, kun pelaaja kulkee yli
            await pg.locator('#rlbox [data-rlhy="esineet"]').click();await pg.wait_for_timeout(100)
            await pg.locator('#rlbox [data-rli="kolikko"]').click()
            await klik(pg,q[0]+500,q[1]+600);await klik(pg,q[0]+580,q[1]+600)
            await pg.keyboard.press('Escape')
            k=await P(pg,"[Object.values(P.b).filter(b=>b.k=='muisti'&&b.vt=='pisteet').length,Object.values(P.b).filter(b=>b.k=='ryhma').length,Object.values(P.b).filter(b=>b.nm.indexOf('Kolikko')==0&&b.k=='muoto').map(b=>b.id)]")
            assert k[0]==1 and k[1]==2 and len(k[2])==2,k
            # pelaaja vasemmalle samalle riville; Liike nopeus x 300 kuljettaa sen ensimmäisen kolikon yli
            await pg.evaluate("""(function(){var P=APP.P,k=Object.values(P.b).filter(b=>b.nm=='Kolikko')[0];
              var p=KK.addBlock(P,'muoto',{laji:'ympyra',nm:'Testipelaaja',v:APP.S.vw});p.w=p.h=30;p.x=k.x-120;p.y=k.y-1;
              var l=KK.addBlock(P,'liike',{o:p.id,vx:'300',xmax:String(k.x+40)});KK.addNode(P,l.id,1400,40);KK.repair(P);APP.renderAll();})()""")
            await pg.evaluate("APP.rl.avaa(false)");await pg.click('#lockbtn') if await pg.locator('#lockbtn').count() else await pg.evaluate("APP.P.lock=true;APP.renderAll();APP.runFrames()")
            await pg.wait_for_timeout(1200)
            st=await P(pg,"(function(){var e=E(),p=Object.values(P.b).filter(b=>b.vt=='pisteet')[0],k=Object.values(P.b).filter(b=>b.nm.indexOf('Kolikko')==0&&b.k=='muoto');return [e.val(p.id),k.map(b=>e.visible(b.id))];})()")
            assert st[0]==1 and st[1]==[False,True],(st,await P(pg,'[P.lock,P.st,Object.values(P.b).filter(b=>b.k!="tee").map(b=>[b.nm,b.x,b.y,b.w,b.h,b.kr||""])]'))
            # 6 lukittuna laatikko on piilossa (avataan ensin uudelleen)
            await pg.evaluate("APP.rl.avaa(true)");await pg.wait_for_timeout(100)
            assert await pg.evaluate("document.querySelector('#rlbox').hidden")
            await pg.evaluate("APP.P.lock=false;APP.renderAll()");await pg.wait_for_timeout(150)
            assert await pg.evaluate("!document.querySelector('#rlbox').hidden")
            await pg.evaluate("APP.S.tab='logiikka';APP.renderAll()");await pg.wait_for_timeout(200)
            assert await pg.evaluate("document.querySelector('#rlbox').hidden")
            await pg.screenshot(path='rakennuslaatikko_logiikka_%d.png'%W)
            await pg.evaluate("APP.S.tab='nakyma';APP.renderAll()");await pg.wait_for_timeout(200)
            # 7 otsikosta raahaus siirtää; piilotus muokkaa-tilassa; molemmat säilyvät uudelleenlatauksessa
            h=await keskus(pg,'#rlbox .rlh b');await veda(pg,h,[h[0]-200,h[1]+150])
            pos=await pg.evaluate("(function(){var r=document.querySelector('#rlbox').getBoundingClientRect();return [Math.round(r.left),Math.round(r.top)];})()")
            await pg.locator('#rlbox [data-rlhy="rakenne"]').click();await pg.locator('#rlbox [data-rl="muok"]').click();await pg.wait_for_timeout(100)
            await pg.locator('#rlbox [data-rlpiilo="pallo"]').click();await pg.locator('#rlbox [data-rl="muok"]').click();await pg.wait_for_timeout(100)
            assert await pg.locator('#rlbox [data-rli="pallo"]').count()==0
            await pg.evaluate("APP.saveNow()");await pg.reload();await pg.wait_for_timeout(400)
            if await pg.evaluate("document.querySelector('#rlbox').hidden"):
                await pg.evaluate("APP.S.tab='nakyma';APP.renderAll()");await pg.wait_for_timeout(150)
            pos2=await pg.evaluate("(function(){var r=document.querySelector('#rlbox').getBoundingClientRect();return [Math.round(r.left),Math.round(r.top)];})()")
            assert pos2==pos,(pos,pos2)
            assert await pg.locator('#rlbox [data-rli="pallo"]').count()==0 and await pg.locator('#rlbox [data-rli="seina"]').count()==1
            await pg.locator('#rlbox [data-rl="muok"]').click();await pg.locator('#rlbox [data-rlpiilo="pallo"]').click();await pg.locator('#rlbox [data-rl="muok"]').click()
            assert await pg.locator('#rlbox [data-rli="pallo"]').count()==1
            # 8 Omat: presetti näkyy ja klik lisää kopion klikkauskohtaan
            await pg.evaluate("""(function(){var P=APP.P,s=Object.values(P.b).filter(b=>b.nm=='Lattia')[0];var pr=KK.presetMake(P,[s.id],[],{nm:'Oma lattia'});pr.id='prtesti';APP.data.presetit=[pr];APP.renderAll();})()""")
            await pg.locator('#rlbox [data-rlhy="omat"]').click();await pg.wait_for_timeout(100)
            await pg.locator('#rlbox [data-rli="pr:prtesti"]').click()
            q=await pg.evaluate("(function(){var r=document.querySelector('#uvp').getBoundingClientRect();return [r.left,r.top];})()")
            await klik(pg,q[0]+250,q[1]+520);await pg.keyboard.press('Escape')
            assert await P(pg,"Object.values(P.b).filter(b=>b.nm.indexOf('Lattia')==0).length")==2
            # 9 kaikki valmiit kohteet: lisäys ja tallennus/korjaus pitävät palikat, tallennusmuoto ennallaan
            n=await pg.evaluate("(function(){var t=0;APP.rl.kohteet.forEach(function(it,i){t+=APP.rl.lisaa(it.id,{x:60+(i%5)*240,y:900+Math.floor(i/5)*260});});return t;})()")
            c1=await P(pg,"[Object.keys(P.b).length,P.lg.n.length,P.lg.l.length]")
            await pg.evaluate("APP.saveNow()");await pg.reload();await pg.wait_for_timeout(400)
            c2=await P(pg,"[Object.keys(P.b).length,P.lg.n.length,P.lg.l.length]")
            assert c1==c2 and n>=25,(n,c1,c2)
            assert await P(pg,"APP.data.ver||null")==ver0
            assert await P(pg,"Object.keys(P).filter(k=>/^rl/.test(k)).length")==0
            await pg.screenshot(path='rakennuslaatikko_%d.png'%W)
            print(W,'ok','errs',errs);await b.close()
asyncio.run(main())
