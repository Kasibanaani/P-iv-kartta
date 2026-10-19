# Jonon 37b (F45, suunnitelma 29 kohta 4): yleisikkuna. Paletin Yleiset → Yleisikkuna, otsikon valikossa Tarkoitus
# (tulos, JOS, KUN, päätöspuu), Miten sisältö yhdistyy ja Laske jokaiselle (jäsenille); väri tarkoituksen mukaan, ikkunat
# sisäkkäin, yleispalikka ikkunan sisällä (SUMMA kahdesta ryhmästä). Tietokone 1440 ja 1280. Kuvakaappaus yleisikkuna_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
async def valikko(pg,nid,teksti):
    await pg.click('#lworld .lw[data-nid="%s"] [data-wmb]'%nid);await pg.wait_for_timeout(120)
    h=await pg.evaluate("()=>[...document.querySelectorAll('#menu .mh')].map(e=>e.textContent)")
    await pg.locator('#menu button',has_text=teksti).first.click();await pg.wait_for_timeout(150);return h
async def ik(pg,nid):
    return await P(pg,"(function(){var n=KK.nodeOf(P,%r),b=P.b[n.p];var e=document.querySelector('#lworld .lw[data-nid=\"'+n.id+'\"]');return [b.m,b.j||'',!!b.jas,e.className.split(' ').filter(c=>/^[mj]-/.test(c)).join(' '),getComputedStyle(e).getPropertyValue('--wc').trim()];})()"%nid)
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Ikkuna');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            await pg.evaluate("(function(){var P=APP.P;KK.jkLuo(P,'a');KK.jkLuo(P,'b');[[1,'a'],[2,'a'],[10,'b']].forEach(function(x,i){var v=KK.addBlock(P,'arvo',{v:String(x[0])});KK.addNode(P,v.id,20,40+i*60);KK.setTunnus(P,v.id,'@'+v.vt+' #'+x[1]);});KK.repair(P);APP.renderAll();})()")
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            ch=await pg.evaluate("()=>[...document.querySelectorAll('#pal .chips')][0].innerText")
            print(W,'1 Yleiset:',ch.replace('\n',' | '));assert 'Yleispalikka' in ch and 'Yleisikkuna' in ch
            r=await pg.evaluate("()=>{var e=document.querySelector('#lvp').getBoundingClientRect();return [e.left+e.width*0.55,e.top+e.height*0.4];}")
            await veda(pg,await keskus(pg,'#pal .chip[data-make*="ikkuna"][data-make*="yl"]'),r)
            nid=await P(pg,"P.lg.n.filter(n=>P.b[n.p].k==='ikkuna')[0].id")
            s=await ik(pg,nid);print(W,'2 uusi:',s);assert s[:3]==['and','',False] and await P(pg,"!('yl' in P.b[KK.nodeOf(P,%r).p])"%nid)
            h=await valikko(pg,nid,'KUN:');s=await ik(pg,nid);print(W,'3 KUN:',h,s);assert h==['Tarkoitus','Miten sisältö yhdistyy','Laske jokaiselle'] and s[1]=='kun' and 'j-kun' in s[3]
            assert await pg.inner_text('#lworld .lw[data-nid="%s"] .wh'%nid)!=''
            await valikko(pg,nid,'Päätöspuu');s=await ik(pg,nid);print(W,'4 puu:',s);assert s[0]=='puu' and s[1]==''
            h=await valikko(pg,nid,'JOS:');s=await ik(pg,nid);print(W,'5 JOS:',h,s);assert h==['Tarkoitus'] and s[0]=='and' and s[1]=='jos' and 'j-jos' in s[3]
            await valikko(pg,nid,'SUMMA');s=await ik(pg,nid);assert s[0]=='sum' and s[1]=='jos',s
            await valikko(pg,nid,'Tulos');s=await ik(pg,nid);assert s[0]=='sum' and s[1]=='',s
            await valikko(pg,nid,'Jäsenille');s=await ik(pg,nid);assert s[2]==True,s
            await valikko(pg,nid,'Jäsenille');s=await ik(pg,nid);assert s[2]==False,s
            # sisäkkäin: toinen yleisikkuna ensimmäisen sisään
            c=await keskus(pg,'#lworld .lw[data-nid="%s"]'%nid)
            await veda(pg,await keskus(pg,'#pal .chip[data-make*="ikkuna"][data-make*="yl"]'),[c[0],c[1]+20])
            g=await P(pg,"P.lg.n.filter(n=>P.b[n.p].k==='ikkuna').map(n=>n.g)")
            print(W,'6 sisäkkäin:',g);assert len(g)==2 and g[1]==nid,g
            # yleispalikat ikkunaan: SUMMA kahdesta ryhmästä
            iid=await P(pg,"P.lg.n.filter(n=>P.b[n.p].k==='ikkuna')[1].id")
            await pg.evaluate("(function(){var P=APP.P,w=KK.nodeOf(P,%r);['#a.summa','#b.summa'].forEach(function(t,i){var y=KK.addBlock(P,'arvo',{yl:1});var n=KK.addNode(P,y.id,w.x+10,w.y+40+i*44);n.g=w.id;KK.ylAseta(P,y,t,'@');});var wb=P.b[w.p];wb.m='sum';KK.repair(P);KK.tick(P,APP.ctx());APP.renderAll();})()"%iid)
            v=await P(pg,"E().val(KK.nodeOf(P,%r).p)"%iid);print(W,'7 summien summa:',v);assert v==13,v
            await pg.click('.zoomc [data-z="fit"]');await pg.wait_for_timeout(300)
            await pg.screenshot(path='yleisikkuna_%d.png'%W)
            print(W,'virheet:',errs);assert not errs,errs
            await b.close()
asyncio.run(main())
