# Jono 1z (kartoitus 15 S1–S2) selaimessa: ryhmälistassa laskeva jäsen (kaava) on lukurivi, jäsen ilman .rastia saa harmaan
# ruudun, säännön ohjaama rasti näyttää ♛ eikä vaihdu. Käytössä Arvo-jäsenen muokkaus on käyttöarvo (kirjoitus ennallaan),
# paneelin Palauta alkuarvoon palauttaa. 1440 ja 1280.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0];function Y(nm,t,y){var b=KK.addBlock(P,'arvo',{yl:1});KK.addNode(P,b.id,40,y);KK.setName(P,b.id,nm);KK.ylAseta(P,b,t,'@');KK.ylLinkit(P,b,t);KK.repair(P);return b.id;}
 var g=Y('Eläimet','',40),a=Y('Koira','Koira\\n#eläimet',120),c=Y('Kissa','Kissa\\n#eläimet',200),s=Y('Summa','= 2 + 3\\n#eläimet',280);
 var J=KK.jkFind(P,'eläimet');var m=KK.addBlock(P,'muoto',{v:v.id});m.x=400;m.y=300;m.w=60;m.h=60;KK.setName(P,m.id,'Pallo');m.jkt=[J];
 var r=Y('Koirasääntö','jos @summa > 1 niin @koira.rasti = kyllä',360);
 var li=KK.addBlock(P,'lista',{tx:'Eläimet',v:v.id,ryh:J});li.x=40;li.y=40;li.w=320;li.h=260;KK.setName(P,li.id,'Lista');KK.repair(P);KK.tick(P,APP.ctx?APP.ctx():{});APP.renderAll();return [li.id,a,c,s,m.id,J];})()"""
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Kartoitus15');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            lid,a,c,s,m,J=await pg.evaluate(SETUP);L='#uels .ue[data-id="%s"]'%lid
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            st=await pg.evaluate("""(a)=>{var L=a[0];function R(id){return document.querySelector(L+' [data-row="'+id+'"]');}
              return [R(a[1]).querySelector('.box').className,R(a[1]).querySelector('.box').getAttribute('title'),R(a[3]).querySelector('.lt').className,R(a[3]).querySelector('.lt').getAttribute('title'),
                R(a[4]).querySelector('.box').className,R(a[4]).querySelector('.box').getAttribute('title'),R(a[2]).querySelector('.lt').getAttribute('data-act')];}""",[L,a,c,s,m])
            print(W,'rivit:',st)
            assert 'sa' in st[0].split() and st[1]=='sääntö ohjaa: Koirasääntö',st
            assert 'ro' in st[2].split() and st[3]=='laskettu: muuta palikkaa logiikassa',st
            assert 'dis' in st[4].split() and st[5]=='rasti vain yleispalikalla',st
            assert st[6]=='rowedit',st
            # ♛ ja harmaa eivät vaihdu napautuksesta; laskettu rivi ei avaudu
            await pg.click(L+' [data-row="%s"] .box'%a);await pg.click(L+' [data-row="%s"] .box'%m);await pg.click(L+' [data-row="%s"] .lt'%s);await pg.wait_for_timeout(250)
            r=await P(pg,"[P.st['o:'+%r]&&P.st['o:'+%r].rasti,APP.ev().prop(%r,'rasti'),document.querySelectorAll('%s input.lt').length,APP.ev().val(%r)]"%(a,a,a,L,s))
            print(W,'napautukset:',r);assert r[0] in (None,False) and r[1]==True and r[2]==0 and r[3]==5,r
            # Arvo-jäsenen muokkaus käytössä = käyttöarvo
            await pg.click(L+' [data-row="%s"] .lt'%c);await pg.keyboard.press('End');await pg.keyboard.type(' Miuku');await pg.keyboard.press('Enter');await pg.wait_for_timeout(250)
            r=await P(pg,"[APP.ev().val(%r),P.st['ka:'+%r],KK.ylTeksti(P,P.b[%r],'@').split('\\n')[0]]"%(c,c,c))
            print(W,'käyttöarvo:',r);assert r==['Kissa Miuku','Kissa Miuku','Kissa'],r
            # Muokkaustila: paneelissa käyttöarvo ja Palauta alkuarvoon
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            await pg.evaluate("(id)=>{APP.S.sel={t:'n',id:KK.nodesOfBlock(APP.P,id)[0].id};APP.renderAll();}",c);await pg.wait_for_timeout(200)
            txt=await pg.evaluate("()=>document.querySelector('#insp').textContent");assert 'Käytössä muutettu' in txt and 'Kissa Miuku' in txt,txt[:300]
            await pg.click('#insp [data-do="clearst"]');await pg.wait_for_timeout(250)
            r=await P(pg,"[APP.ev().val(%r),'ka:'+%r in P.st]"%(c,c));print(W,'palauta:',r);assert r==['Kissa',False],r
            print(W,'virheet:',errs);assert not errs,errs
            await b.close()
asyncio.run(main())
