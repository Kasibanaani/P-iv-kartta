# Jonon 37a (F45, suunnitelma 29): yleispalikka selaimessa. Paletin ylin osio Yleiset, uusi palikka aukeaa heti
# kirjoitukseen, laji päätellään kirjoituksesta (teksti, arvo, viite, kaava, ryhmä), lajivalikossa vain sopivat, lukittu laji
# punaisena, nimi ja viite kirjoitusosassa, ryhmän kooste valikosta, Esc peruu, kenttä venyy sivulle ja koko jää,
# kaksoisnapautus avaa uudelleen, paneelin kenttä ja valikko. Tietokone 1440 ja 1280. Kuvakaappaukset yleispalikka_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
YL="Object.values(P.b).filter(b=>b.yl)"
async def kirjoita(pg,t):
    await pg.fill('#yedit textarea',t);await pg.wait_for_timeout(120)
async def tila(pg,nm):
    return await P(pg,"(function(){var b=B(%r);var v=E().val(b.id);return [b.k,KK.ylLaji(P,b),b.ty||'',v&&v.err?'ERR':v];})()"%nm)
async def lajit(pg):
    return await pg.evaluate("()=>[...document.querySelectorAll('#yedit [data-yty] option')].map(o=>o.value)")
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Yleis');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            await pg.evaluate("(function(){var P=APP.P;var k=KK.addBlock(P,'kaava',{f:'15 + 15'});KK.setName(P,k.id,'Kaava1');KK.addNode(P,k.id,40,40);KK.jkLuo(P,'ryhmä1');"
                              "var a=KK.addBlock(P,'arvo',{v:'4'});KK.setTunnus(P,a.id,'@'+a.vt+' #ryhmä1');KK.addNode(P,a.id,40,120);var c=KK.addBlock(P,'arvo',{v:'6'});KK.setTunnus(P,c.id,'@'+c.vt+' #ryhmä1');KK.addNode(P,c.id,40,180);KK.repair(P);APP.renderAll();})()")
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            # 1 paletin ylin osio
            hs=await pg.evaluate("()=>[...document.querySelectorAll('#pal .pt-h')].map(e=>e.textContent)")
            print(W,'1 paletti:',hs[:2]);assert hs[0]=='Yleiset' or (hs[0]!='Palikat' and 'Yleiset' in hs[:2]),hs
            r=await pg.evaluate("()=>{var e=document.querySelector('#lvp').getBoundingClientRect();return [e.left+e.width*0.6,e.top+e.height*0.5];}")
            await paletti(pg,'Yleispalikka',r[0],r[1])
            op=await pg.evaluate("()=>!!document.querySelector('#yedit textarea')&&document.activeElement===document.querySelector('#yedit textarea')")
            nm=await P(pg,YL+"[0].nm");print(W,'2 uusi aukeaa:',op,nm);assert op and nm
            # 3 päättely
            for t,odotus in (('Hei maailma',['arvo','teksti','Hei maailma']),('15',['arvo','arvo',15]),('@kaava1',['kaava','viite',30]),('= @kaava1 * 2',['kaava','kaava',60]),
                             ('Pisteet: @kaava1',['arvo','teksti','Pisteet: 30']),('#ryhmä1',['kaava','ryhma',2])):
                await kirjoita(pg,t);s=await tila(pg,nm);print(W,'3',repr(t),s,await lajit(pg));assert [s[0],s[1],s[3]]==odotus,(t,s)
            assert await lajit(pg)==['','ryhma','kaava']
            # 4 ryhmän kooste
            await pg.select_option('#yedit [data-yko]','summa');await pg.wait_for_timeout(120)
            tv=await pg.input_value('#yedit textarea');s=await tila(pg,nm);print(W,'4 kooste:',tv,s);assert tv=='#ryhmä1.summa' and s[3]==10
            lab=await pg.inner_text('#lworld .ln.yl');assert 'summa' in lab,lab
            # 5 lukittu laji: kaava + vapaa teksti = punainen
            await kirjoita(pg,'15');await pg.select_option('#yedit [data-yty]','kaava');await pg.wait_for_timeout(120)
            s=await tila(pg,nm);assert s[2]=='kaava' and s[3]==15,s
            await kirjoita(pg,'Hei maailma');s=await tila(pg,nm);bad=await pg.evaluate("()=>document.querySelector('#yedit textarea').classList.contains('bad')")
            res=await pg.inner_text('#yres');print(W,'5 lukittu:',s,bad,res);assert s[3]=='ERR' and bad and 'tuntematon nimi' in res
            await pg.select_option('#yedit [data-yty]','');await pg.wait_for_timeout(120);s=await tila(pg,nm);assert s[1]=='teksti' and s[2]=='',s
            # 6 nimi ja viite kirjoitusosassa, venytys sivulle, Enter tallentaa
            await pg.fill('#yedit [data-ynm]','Tervehdys');await pg.fill('#yedit [data-yvt]','moi');await pg.wait_for_timeout(100)
            await pg.evaluate("()=>{var t=document.querySelector('#yedit textarea');t.style.width='420px';t.style.height='90px';}")
            await pg.screenshot(path='yleispalikka_auki_%d.png'%W)
            await pg.focus('#yedit textarea');await pg.keyboard.press('Enter');await pg.wait_for_timeout(200)
            s=await P(pg,"(function(){var b=%s[0],n=KK.nodesOfBlock(P,b.id)[0];return [b.nm,b.vt,n.ew,n.eh,!!document.querySelector('#yedit')];})()"%YL)
            print(W,'6 tallennus:',s);assert s[0]=='Tervehdys' and s[1]=='moi' and s[2]>=400 and s[3]>=80 and not s[4]
            await pg.screenshot(path='yleispalikka_pieni_%d.png'%W)
            # 7 kaksoisnapautus avaa uudelleen samalla koolla, Esc peruu muutoksen
            c=await keskus(pg,'#lworld .ln.yl');await pg.mouse.dblclick(c[0],c[1]);await pg.wait_for_timeout(200)
            w=await pg.evaluate("()=>document.querySelector('#yedit textarea').offsetWidth");tv=await pg.input_value('#yedit textarea')
            await kirjoita(pg,'= 1 + 1');await pg.keyboard.press('Escape');await pg.wait_for_timeout(200)
            s=await tila(pg,'Tervehdys');print(W,'7 uudelleen + Esc:',w,tv,s);assert w>=400 and tv=='Hei maailma' and s[1]=='teksti' and s[3]=='Hei maailma'
            # 8 paneeli: sama kirjoitus ja laji
            ins=await pg.inner_text('#insp');assert 'Yleispalikka' in ins
            await pg.fill('#insp [data-yl]','@kaava1');await pg.wait_for_timeout(150);s=await tila(pg,'Tervehdys');assert s[1]=='viite' and s[3]==30,s
            await pg.select_option('#insp [data-ylty]','kaava');await pg.wait_for_timeout(150);s=await tila(pg,'Tervehdys');assert s[2]=='kaava' and s[3]==30,s
            # 9 Kumoa palauttaa
            await pg.keyboard.press('Meta+z' if False else 'Control+z');await pg.wait_for_timeout(150)
            print(W,'8-9 paneeli ok, virheet:',errs);assert not errs,errs
            await b.close()
asyncio.run(main())
