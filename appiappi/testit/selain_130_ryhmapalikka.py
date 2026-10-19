# Jonon 37g (F45, suunnitelma 29 kohta 9): ryhmä on palikka. Yleispalikan kentässä omalla rivillä #eläin = kuuluu eläimeen,
# @koira = koira kuuluu tähän; linkki näkyy molemmissa päissä ja tallentuu, kun kirjoitus vahvistetaan (Esc ei tallenna).
# Uusi #nimi tekee yleispalikan kirjoittajan viereen. Pelkät jäsenet: arvo on määrä. Tietokone 1440 ja 1280.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
async def uusi(pg,x,y,nimi,teksti):
    await paletti(pg,'Yleispalikka',x,y);await pg.fill('#yedit [data-ynm]',nimi);await pg.fill('#yedit textarea',teksti);await pg.wait_for_timeout(80)
    await pg.focus('#yedit textarea');await pg.keyboard.press('Enter');await pg.wait_for_timeout(150)
async def teksti(pg,nm):
    return await P(pg,"KK.ylTeksti(P,B(%r),'@')"%nm)
async def arvo(pg,nm):
    return await P(pg,"(function(){var v=E().val(B(%r).id);return v&&v.err?'ERR':v;})()"%nm)
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Ryhmät');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            r=await pg.evaluate("()=>{var e=document.querySelector('#lvp').getBoundingClientRect();return [e.left+e.width*0.3,e.top+e.height*0.25];}")
            await uusi(pg,r[0],r[1],'Eläin','')
            await uusi(pg,r[0],r[1]+120,'Koira','Hau\n#eläin')
            t=[await teksti(pg,'Eläin'),await teksti(pg,'Koira'),await arvo(pg,'Eläin'),await arvo(pg,'Koira')]
            print(W,'1 #eläin Koirassa:',t);assert t==['@koira','Hau\n#eläin',1,'Hau'],t
            await uusi(pg,r[0],r[1]+240,'Kissa','Miau')
            # 2 Eläimen päästä: @kissa lisää kissan, näkyy Kissassa #eläin
            c=await keskus(pg,'#lworld .ln.yl[data-nid="%s"]'%await P(pg,"KK.nodesOfBlock(P,B('Eläin').id)[0].id"))
            await pg.mouse.dblclick(c[0],c[1]);await pg.wait_for_timeout(200)
            tv=await pg.input_value('#yedit textarea');assert tv=='@koira',tv
            await pg.fill('#yedit textarea','Kotieläimet\n@koira @kissa');await pg.wait_for_timeout(80)
            t0=await teksti(pg,'Kissa');assert t0=='Miau','linkki ei tallennu kesken kirjoituksen: '+t0
            await pg.focus('#yedit textarea');await pg.keyboard.press('Enter');await pg.wait_for_timeout(150)
            t=[await teksti(pg,'Eläin'),await teksti(pg,'Kissa'),await arvo(pg,'Eläin')]
            print(W,'2 @kissa Eläimessä:',t);assert t==['Kotieläimet\n@koira @kissa','Miau\n#eläin','Kotieläimet'],t
            # 3 Esc ei tallenna linkkiä
            await pg.mouse.dblclick(c[0],c[1]);await pg.wait_for_timeout(200)
            await pg.fill('#yedit textarea','Kotieläimet\n@koira');await pg.keyboard.press('Escape');await pg.wait_for_timeout(150)
            t=await teksti(pg,'Kissa');print(W,'3 Esc:',t);assert t=='Miau\n#eläin',t
            # 4 Koiran päästä poisto + uusi #ryhmä tekee palikan
            k=await keskus(pg,'#lworld .ln.yl[data-nid="%s"]'%await P(pg,"KK.nodesOfBlock(P,B('Koira').id)[0].id"))
            await pg.mouse.dblclick(k[0],k[1]);await pg.wait_for_timeout(200)
            await pg.fill('#yedit textarea','Hau\n#lemmikit');await pg.focus('#yedit textarea');await pg.keyboard.press('Enter');await pg.wait_for_timeout(200)
            t=[await teksti(pg,'Eläin'),await teksti(pg,'Lemmikit'),await P(pg,"KK.nodesOfBlock(P,B('Lemmikit').id).length")]
            print(W,'4 Koira #lemmikit:',t);assert t==['Kotieläimet\n@kissa','@koira',1],t
            # 5 paneelista: Lemmikit-kenttään @kissa, tallentuu kun kenttä jätetään
            l=await keskus(pg,'#lworld .ln.yl[data-nid="%s"]'%await P(pg,"KK.nodesOfBlock(P,B('Lemmikit').id)[0].id"))
            await pg.mouse.click(l[0],l[1]);await pg.wait_for_timeout(200)
            await pg.fill('#insp [data-yl]','@koira @kissa');await pg.click('#insp [data-k="nm"]');await pg.wait_for_timeout(200)
            t=[await teksti(pg,'Kissa'),await arvo(pg,'Lemmikit')];print(W,'5 paneeli:',t);assert t==['Miau\n#eläin #lemmikit',2],t
            await pg.click('.zoomc [data-z="fit"]');await pg.wait_for_timeout(300);await pg.screenshot(path='ryhmapalikka_%d.png'%W)
            # 6 tallennus ja lataus
            await pg.reload();await pg.wait_for_function("window.APP&&APP.P");await pg.wait_for_timeout(300)
            t=await teksti(pg,'Kissa');print(W,'6 lataus:',t);assert t=='Miau\n#eläin #lemmikit',t
            print(W,'virheet:',errs);assert not errs,errs
            await b.close()
asyncio.run(main())
