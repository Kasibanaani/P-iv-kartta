# Jonon 1x (kartoitus 13 S1, S4, S5) selaimessa: ryhmän ikkunan esiintymä, joka ei nyt ole jäsen (Poista joukosta), on himmeä
# eikä laske, käytössä lisätty näkyy rivinä ”+ n käytössä lisättyä”; yleispalikan paneelissa ei Tunnus-kenttää vaan viite tietona;
# uusi yleispalikka saa nimen kirjoituksesta (Hei, Kaava, Kaava 2), itse annettu nimi pysyy. Tietokone 1440 ja 1280.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Korjaukset 1x');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            await pg.evaluate("""(function(){var P=APP.P;function yl(nm,t,x,y){var b=KK.addBlock(P,'arvo',{yl:1});KK.addNode(P,b.id,x,y);KK.setName(P,b.id,nm);KK.ylAseta(P,b,t,'@');KK.ylLinkit(P,b,t);return b;}
              var el=yl('Eläin','',40,40);yl('Koira','4\\n#eläin',40,120);yl('Kissa','6\\n#eläin',40,200);yl('Hiiri','1',40,280);
              var w=KK.addBlock(P,'ikkuna',{m:'sum'});var wn=KK.addNode(P,w.id,400,40);wn.w=320;wn.h=260;w.wr=el.id;KK.repair(P);APP.renderAll();})()""")
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            wid=await P(pg,"P.lg.n.filter(n=>P.b[n.p].k==='ikkuna')[0].id")
            # 1 Poista joukosta: himmeä, ei laske; Lisää joukkoon: rivi
            await pg.evaluate("(function(){var P=APP.P;function B(n){return Object.values(P.b).filter(b=>b.nm===n)[0];}var g=KK.ylOma(P,B('Eläin'));P.st['jk:'+g]={};P.st['jk:'+g][B('Koira').id]=false;P.st['jk:'+g][B('Hiiri').id]=true;KK.tick(P,APP.ctx());APP.renderAll();})()")
            await pg.wait_for_timeout(200)
            kid=await P(pg,"P.lg.n.filter(n=>n.g===%r&&P.b[n.p].nm==='Koira')[0].id"%wid)
            dim=await pg.evaluate("()=>document.querySelector('#lworld .ln[data-nid=\"%s\"]').classList.contains('wrpois')"%kid)
            row=await pg.inner_text('#lworld .lw[data-nid="%s"] .wjk'%wid)
            v=[await P(pg,"E().val(KK.nodeOf(P,%r).p)"%wid),await P(pg,"E().val(B('Eläin').id)")]
            print(W,'1 ikkuna:',dim,row,v);assert dim and '+ 1 käytössä lisättyä' in row and v==[7,2],(dim,row,v)
            # 2 paneeli: ei Tunnus-kenttää, viite tietona
            await pg.click('#lworld .ln[data-nid="%s"]'%kid);await pg.wait_for_timeout(200)
            t=await pg.evaluate("()=>[!!document.querySelector('#insp [data-tunnus]'),(document.querySelector('#insp [data-ylvi]')||{}).textContent]")
            print(W,'2 paneeli:',t);assert t==[False,'@koira'],t
            await pg.fill('#insp [data-k="nm"]','Hauva');await pg.wait_for_timeout(150)
            t=await pg.evaluate("()=>document.querySelector('#insp [data-ylvi]').textContent");assert t=='@hauva',t
            await pg.keyboard.press('Escape');await pg.wait_for_timeout(100)
            # 3 nimi itsestään
            r=await pg.evaluate("()=>{var e=document.querySelector('#lvp').getBoundingClientRect();return [e.left+e.width*0.75,e.top+e.height*0.75];}")
            nimet=[]
            for i,teksti in enumerate(('Hei maailma','= 1 + 2','= 3 * 3')):
                await paletti(pg,'Yleispalikka',r[0]-i*30,r[1]-i*60);await pg.fill('#yedit textarea',teksti);await pg.keyboard.press('Enter');await pg.wait_for_timeout(200)
                nimet.append(await P(pg,"(function(){var y=Object.values(P.b).filter(b=>b.yl);var b=y[y.length-1];return b.nm+' '+b.vt;})()"))
            print(W,'3 nimet:',nimet);assert nimet==['Hei hei','Kaava kaava','Kaava 2 kaava2'],nimet
            print(W,'virheet:',errs);assert not errs,errs
            await pg.screenshot(path='korjaukset_1x_%d.png'%W)
            await b.close()
asyncio.run(main())
