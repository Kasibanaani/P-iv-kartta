# Appi-appi 102 (Emilin bugi 20.10.): auki olevaan yleispalikkaan tarttuminen ei napsauta sitä pieneksi. Kirjoitusosan
# reunasta tai tyhjästä kohdasta raahaus siirtää palikkaa ja kirjoitusosaa yhdessä, kirjoitus pysyy auki ja Enter tallentaa.
# Kenttää painettaessa ei siirretä. Siirto zoomattuna ja pudotus ikkunaan. Kumoa palauttaa paikan. Tietokone 1440 ja 1280.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
YL="Object.values(P.b).filter(b=>b.yl)[0]"
NO="KK.nodesOfBlock(P,"+YL+".id)[0]"
async def auki(pg):return await pg.evaluate("()=>!!document.querySelector('#yedit')")
async def laatikko(pg,s='#yedit'):return await pg.evaluate("(s)=>{var e=document.querySelector(s).getBoundingClientRect();return [e.left,e.top,e.width,e.height];}",s)
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Siirto');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            r=await pg.evaluate("()=>{var e=document.querySelector('#lvp').getBoundingClientRect();return [e.left+e.width*0.35,e.top+e.height*0.35];}")
            await paletti(pg,'Yleispalikka',r[0],r[1])
            await pg.fill('#yedit textarea','Koira');await pg.wait_for_timeout(120)
            # 1 reunasta raahaus siirtää, kirjoitus pysyy auki
            n0=await P(pg,NO);bx=await laatikko(pg);x,y=bx[0]+5,bx[1]+5
            await pg.mouse.move(x,y);await pg.mouse.down();await pg.wait_for_timeout(60);a1=await auki(pg)
            await pg.mouse.move(x+90,y+50,steps=8);await pg.mouse.up();await pg.wait_for_timeout(200)
            n1=await P(pg,NO);bx1=await laatikko(pg);fo=await pg.evaluate("()=>document.activeElement===document.querySelector('#yedit textarea')")
            print(W,'1 reuna:',a1,await auki(pg),[n0['x'],n0['y']],[n1['x'],n1['y']],bx1[:2],fo)
            assert a1 and await auki(pg) and n1['x']-n0['x']==90 and n1['y']-n0['y']==50 and abs(bx1[0]-bx[0]-90)<2 and abs(bx1[1]-bx[1]-50)<2 and fo
            # 2 ohjetekstistä (tyhjä kohta) myös; kirjoitus jatkuu ja Enter tallentaa
            h=await laatikko(pg,'#yedit .kehelp');await veda(pg,[h[0]+h[2]-10,h[1]+h[3]/2],[h[0]+h[2]-40,h[1]+h[3]/2+30])
            n2=await P(pg,NO);print(W,'2 ohje:',await auki(pg),[n2['x'],n2['y']]);assert await auki(pg) and n2['x']==n1['x']-30 and n2['y']==n1['y']+30
            await pg.keyboard.type(' ja kissa');await pg.keyboard.press('Enter');await pg.wait_for_timeout(200)
            v=await P(pg,"[APP.ev().val("+YL+".id),!!document.querySelector('#yedit')]");print(W,'2 tallennus:',v);assert v==['Koira ja kissa',False],v
            # 3 kentän painaminen ei siirrä eikä sulje
            c=await keskus(pg,'#lworld .ln.yl');await pg.mouse.dblclick(c[0],c[1]);await pg.wait_for_timeout(200);assert await auki(pg)
            t=await laatikko(pg,'#yedit textarea');n3=await P(pg,NO)
            await veda(pg,[t[0]+20,t[1]+10],[t[0]+60,t[1]+30]);n4=await P(pg,NO)
            print(W,'3 kenttä:',await auki(pg),[n3['x'],n3['y']],[n4['x'],n4['y']]);assert await auki(pg) and [n3['x'],n3['y']]==[n4['x'],n4['y']]
            # 4 Kumoa palauttaa siirron (kirjoitus ennallaan); zoomattuna siirto kanvaasin mittakaavassa
            bx=await laatikko(pg);await veda(pg,[bx[0]+5,bx[1]+5],[bx[0]+65,bx[1]+5]);n5=await P(pg,NO)
            await pg.keyboard.press('Enter');await pg.wait_for_timeout(150);await pg.keyboard.press('Control+z');await pg.wait_for_timeout(200)
            n6=await P(pg,NO);v=await P(pg,"APP.ev().val("+YL+".id)");print(W,'4 kumoa:',[n5['x'],n6['x'],n4['x']],v);assert n5['x']==n4['x']+60 and n6['x']==n4['x'] and v=='Koira ja kissa'
            await pg.evaluate("()=>{APP.P.lcam.z=2;}");await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(100);await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            c=await keskus(pg,'#lworld .ln.yl');await pg.mouse.click(c[0],c[1]);await pg.wait_for_timeout(100);await pg.mouse.dblclick(c[0],c[1]);await pg.wait_for_timeout(200);assert await auki(pg)
            bx=await laatikko(pg);await veda(pg,[bx[0]+5,bx[1]+5],[bx[0]+85,bx[1]+45]);n7=await P(pg,NO)
            print(W,'4 zoom 2:',[n7['x']-n6['x'],n7['y']-n6['y']]);assert [n7['x']-n6['x'],n7['y']-n6['y']]==[40,20]
            await pg.keyboard.press('Enter');await pg.wait_for_timeout(100);await pg.evaluate("()=>{APP.P.lcam.z=1;APP.P.lcam.x=0;APP.P.lcam.y=0;}")
            # 5 zoomattuna siirto kanvaasin mittakaavassa ja pudotus ikkunaan
            await pg.evaluate("(function(){var P=APP.P;var w=KK.addBlock(P,'ikkuna',{});KK.setName(P,w.id,'Ikkuna1');var wn=KK.addNode(P,w.id,500,60);wn.w=260;wn.h=160;KK.repair(P);APP.render&&APP.render();})()")
            await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(100);await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            c=await keskus(pg,'#lworld .ln.yl');await pg.mouse.click(c[0],c[1]);await pg.wait_for_timeout(100);await pg.mouse.dblclick(c[0],c[1]);await pg.wait_for_timeout(200);assert await auki(pg)
            wb=await laatikko(pg,'#lworld .lw');nb=await laatikko(pg,'#lworld .ln.yl');bx=await laatikko(pg)
            dx,dy=wb[0]+30-nb[0],wb[1]+60-nb[1]
            await veda(pg,[bx[0]+5,bx[1]+5],[bx[0]+5+dx,bx[1]+5+dy],steps=12)
            g=await P(pg,"(function(){var n="+NO+";var w=KK.nodeOf(P,n.g);return [w?P.b[w.p].nm:'',!!document.querySelector('#yedit')];})()")
            print(W,'5 ikkunaan:',g);assert g==['Ikkuna1',True],g
            await pg.keyboard.press('Enter');await pg.wait_for_timeout(150)
            await pg.screenshot(path='yleispalikka_siirto_%d.png'%W)
            print(W,'virheet:',errs);assert not errs,errs
            await b.close()
asyncio.run(main())
