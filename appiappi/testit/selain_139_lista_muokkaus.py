# Jonon 42a (F47 V1, suunnitelma 31): Listan valmiin rivin teksti aukeaa napautuksesta samanlaiseksi kentäksi kuin
# Lisää rivi -kenttä. Ennen napautusta rivi näyttää tavalliselta tekstiltä. Enter tallentaa (muuttui-tapahtuma, kaava
# lista.rivi1 näkee uuden tekstin), Esc peruu, tyhjäksi pyyhitty palaa ennalleen, napautus muualle tallentaa, rasti ja ×
# ennallaan, tallentuu ja säilyy uudelleenlatauksessa. 1440 ja 1280 hiirellä, 390 ja 320 sormella. Kuvat lista_muokkaus_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0];v.laite='puhelin';var vw=v.id;
 var li=KK.addBlock(P,'lista',{tx:'Tehtävät',v:vw});li.x=20;li.y=40;li.w=300;li.h=200;KK.setName(P,li.id,'Tehtävät');
 P.st[li.id]={rows:[{id:'r1',tx:'Kauppa',c:false,d:''},{id:'r2',tx:'Posti',c:false,d:''}]};
 var m=KK.addBlock(P,'muisti',{v:'0'});KK.setName(P,m.id,'Laskuri');KK.addNode(P,m.id,600,0);var te=KK.addBlock(P,'tee',{do:'lisaa',o:m.id});
 KK.addLink(P,KK.addNode(P,li.id,300,0).id,'mu',KK.addNode(P,te.id,450,0).id,'e');
 KK.repair(P);APP.renderAll();return {id:li.id,m:m.id};})()"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in (1440,1280,390,320):
            mob=W<500;H=844 if mob else 900
            ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            async def tap(sel):
                if mob:await pg.tap(sel)
                else:await pg.click(sel)
                await pg.wait_for_timeout(150)
            await pg.fill('#wname','Lista');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);L='#uels .ue[data-id="%s"]'%I['id'];R1=L+' [data-row="r1"]'
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            async def rivit():return await pg.evaluate("(id)=>KK.listRows(APP.P,id).map(r=>[r.tx,!!r.c])",I['id'])
            async def n():return await pg.evaluate("APP.ev().val('%s')"%I['m'])
            # 1 näyttää tekstiltä: ei kenttää ennen napautusta, sama korkeus kuin ennen
            h0=await pg.evaluate("(s)=>document.querySelector(s).getBoundingClientRect().height",R1)
            assert await pg.evaluate("(s)=>!document.querySelector(s+' input.lt')&&document.querySelector(s+' span.lt').textContent==='Kauppa'",R1)
            # 2 napautus avaa kentän, Enter tallentaa
            await tap(R1+' .lt');fo=await pg.evaluate("()=>document.activeElement.matches('input.lt')&&document.activeElement.value")
            h1=await pg.evaluate("(s)=>document.querySelector(s).getBoundingClientRect().height",R1)
            bs=await pg.evaluate("(s)=>getComputedStyle(document.querySelector(s+' input.lt')).borderTopColor",R1)
            await pg.screenshot(path='lista_muokkaus_auki_%d.png'%W)
            print(W,'2 auki:',fo,h0,h1,bs);assert fo=='Kauppa' and abs(h1-h0)<1.5
            await pg.keyboard.press('End');await pg.keyboard.type(' ja apteekki');await pg.keyboard.press('Enter');await pg.wait_for_timeout(200)
            r=await rivit();tx=await pg.evaluate("(s)=>document.querySelector(s+' .lt').tagName+':'+document.querySelector(s+' .lt').textContent",R1)
            print(W,'2 tallennus:',r,tx,await n());assert r[0]==['Kauppa ja apteekki',False] and tx=='SPAN:Kauppa ja apteekki' and await n()==1
            # 3 Esc peruu, tyhjä palaa, napautus muualle tallentaa
            await tap(R1+' .lt');await pg.keyboard.type(' X');await pg.keyboard.press('Escape');await pg.wait_for_timeout(200)
            assert (await rivit())[0][0]=='Kauppa ja apteekki' and await n()==1
            await tap(R1+' .lt');await pg.keyboard.press('Control+a');await pg.keyboard.press('Backspace');await pg.keyboard.press('Enter');await pg.wait_for_timeout(200)
            r=await rivit();print(W,'3 tyhjä:',r);assert r[0][0]=='Kauppa ja apteekki' and len(r)==2 and await n()==1
            await tap(L+' [data-row="r2"] .lt');await pg.keyboard.press('End');await pg.keyboard.type('kortti')
            await tap(L+' .ttl');await pg.wait_for_timeout(200)
            r=await rivit();print(W,'3 muualle:',r);assert r[1][0]=='Postikortti' and await n()==2
            # 4 rasti ja × ennallaan
            await tap(R1+' [data-act=rowchk]');r=await rivit();assert r[0][1] is True and await n()==3,r
            done=await pg.evaluate("(s)=>getComputedStyle(document.querySelector(s+' .lt')).textDecorationLine",R1);assert 'line-through' in done,done
            # 5 lisäys toimii yhä ja tallentuu
            await pg.fill(L+' .ladd','Uusi');await pg.press(L+' .ladd','Enter');await pg.wait_for_timeout(200)
            r=await rivit();assert [x[0] for x in r]==['Kauppa ja apteekki','Postikortti','Uusi'],r
            await pg.wait_for_timeout(700);await pg.reload();await pg.wait_for_function("window.APP&&APP.P");await pg.wait_for_timeout(300)
            r=await rivit();print(W,'5 lataus:',r);assert [x[0] for x in r]==['Kauppa ja apteekki','Postikortti','Uusi']
            print(W,'virheet:',errs);assert not errs,errs
            await ctx.close()
        await b.close()
asyncio.run(main())
