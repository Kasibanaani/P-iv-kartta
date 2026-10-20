# Jono 41 ja 40f selaimessa: paletin Kello on tavallinen yleispalikka (= nyt), kellonaikakaava näkyy h.mm-muodossa,
# säännön ketju (odota) näyttää etenemisen tilassa. Tietokone 1440 ja 1280. Kuvat kello_*.png.
import asyncio,re
from playwright.async_api import async_playwright
from yhteinen import *
async def raahaa(pg,ic,x,y):
    l=pg.locator('#pal .chip').filter(has_text=re.compile(r'^\s*'+ic)).first
    await l.scroll_into_view_if_needed();c=await l.bounding_box()
    await veda(pg,[c['x']+c['width']/2,c['y']+c['height']/2],[x,y])
async def paikka(pg,x,y):
    return await pg.evaluate("()=>{var e=document.querySelector('#lvp').getBoundingClientRect();return [e.left+e.width*%s,e.top+e.height*%s];}"%(x,y))
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Kello');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            # 1 paletin Kello
            r=await paikka(pg,0.5,0.3);await raahaa(pg,'◷',r[0],r[1]);await pg.wait_for_timeout(200)
            if await pg.evaluate("()=>!!document.querySelector('#yedit')"):
                await pg.focus('#yedit textarea');await pg.keyboard.press('Enter');await pg.wait_for_timeout(200)
            s=await P(pg,"(function(){var b=B('Kello');return b&&[b.k,!!b.yl,b.f,KK.ylLaji(P,b),E().val(b.id)];})()")
            print(W,'1 kello:',s);assert s and s[0]=='kaava' and s[1] and s[2].lstrip('= ')=='nyt' and s[3]=='kaava' and re.match(r'^\d{1,2}\.\d\d$',s[4]),s
            # 2 Päivä
            r=await paikka(pg,0.5,0.5);await raahaa(pg,'▦',r[0],r[1]);await pg.wait_for_timeout(200)
            if await pg.evaluate("()=>!!document.querySelector('#yedit')"):
                await pg.focus('#yedit textarea');await pg.keyboard.press('Enter');await pg.wait_for_timeout(200)
            s=await P(pg,"(function(){var b=B('Päivä');return b&&[b.f,E().val(b.id)];})()");print(W,'2 päivä:',s);assert s and s[0].lstrip('= ')=='tänään' and s[1]['d'],s
            # 3 kellonaikakaava h.mm palikassa ja kirjoitusosassa
            await pg.evaluate("(function(){var P=APP.P;var y=KK.addBlock(P,'arvo',{yl:1});KK.addNode(P,y.id,300,40);KK.ylAseta(P,y,'= klo 23.59 - klo 1.30','@');KK.setName(P,y.id,'Jäljellä');KK.repair(P);APP.renderAll();})()")
            lab=await pg.evaluate("()=>[...document.querySelectorAll('#lworld .ln')].map(e=>e.innerText).join('|')")
            print(W,'3 h.mm:',repr(lab[-200:]));assert '22.29' in lab,lab
            # 4 säännön ketju: tila näyttää etenemisen
            await pg.evaluate("(function(){var P=APP.P;var m=KK.addBlock(P,'muisti',{v:'0'});KK.setName(P,m.id,'Määrä');KK.addNode(P,m.id,40,300);"
                              "var s=KK.addBlock(P,'arvo',{yl:1});KK.addNode(P,s.id,300,300);KK.repair(P);KK.ylAseta(P,s,'kun @määrä > 5\\n@määrä = 1\\nodota 1 min\\n@määrä = 2','@');KK.setName(P,s.id,'Ketju');KK.repair(P);KK.tick(P,APP.ctx());"
                              "KK.setVal(P,m.id,7,APP.ctx());KK.tick(P,APP.ctx());APP.renderAll();})()")
            c=await keskus(pg,'#lworld .ln.yl:last-of-type');n=await P(pg,"B('Ketju').id")
            c=await keskus(pg,'#lworld .ln[data-nid="%s"]'%(await P(pg,"KK.nodesOfBlock(P,B('Ketju').id)[0].id")))
            await pg.mouse.click(c[0],c[1]);await pg.wait_for_timeout(250)
            ins=await pg.inner_text('#insp');v=await P(pg,"E().val(B('Määrä').id)");print(W,'4 ketju:',v,[x for x in ins.split('\n') if 'Ketju' in x][:2])
            assert v==1 and 'Ketju käynnissä: rivi 3 (odottaa vielä' in ins,(v,ins[:500])
            await pg.screenshot(path='kello_%d.png'%W)
            print(W,'virheet:',errs);assert not errs,errs
            await b.close()
asyncio.run(main())
