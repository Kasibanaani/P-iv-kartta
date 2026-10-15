# Versio 7.1: Odota, kunnes selaimessa. Palikka paletista ketjuun, odotettava palikka paneelista, ▶ → haara odottaa
# (⏳ odottaa, otsikossa Odottaa: …), valinta lukitussa näkymässä jatkaa ketjua heti, aikaraja tuo aika loppui -kohdan,
# tapahtumanuolen pudotus palikan päälle kysyy kohdan (tapahtuma) ja painallus vapauttaa. Kuvat versio71_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0].id;
 var ru=KK.addBlock(P,'ruutu',{tx:'Valmis',nm:'Valmis',v:v});ru.x=60;ru.y=60;
 var bt=KK.addBlock(P,'nappi',{tx:'Jatka',nm:'Jatka',beh:'kerta',v:v});bt.x=60;bt.y=130;
 var lst=KK.addBlock(P,'lista',{tx:'Loki',nm:'Loki',v:v});lst.x=60;lst.y=200;
 var k=KK.addBlock(P,'ketju',{nm:'Odotus'});var w=KK.addNode(P,k.id,330,60);KK.addNode(P,bt.id,80,420);
 APP.renderAll();return [k.id,w.id,ru.id,bt.id,lst.id];})()"""
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Odota');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            kid,wid,ru,bt,lid=await pg.evaluate(SETUP)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            r=await pg.locator('#lworld [data-nid="%s"]'%wid).bounding_box()
            l=pg.locator('#pal .chip[data-make*=\'"k":"odota"\']').first;await l.scroll_into_view_if_needed();c0=await l.bounding_box()
            await veda(pg,[c0['x']+c0['width']/2,c0['y']+c0['height']/2],[r['x']+120,r['y']+80]);await pg.wait_for_timeout(200)
            on=await P(pg,"P.lg.n.find(n=>P.b[n.p].k==='odota').id")
            await pg.select_option('#insp select[data-k="o"]',ru);await pg.wait_for_timeout(150)
            lab=await pg.inner_text('#lworld [data-nid="%s"] .lt'%on);print(W,'1 nimi:',lab);assert lab.strip()=='Odota, kunnes Valmis valittu'
            await pg.select_option('#insp select[data-kadd="after"]','tee:rivi');await pg.wait_for_timeout(200)
            await pg.select_option('#insp select[data-k="o"]',lid);await pg.fill('#insp input[data-k="tx"]','Jatkui');await pg.wait_for_timeout(100)
            await pg.click('#lworld [data-nid="%s"] [data-kplay]'%wid);await pg.wait_for_timeout(250)
            chip=await pg.inner_text('#lworld [data-nid="%s"] .kleft'%on);hd=await pg.inner_text('#lworld [data-nid="%s"] .know'%wid)
            run=await pg.locator('#lworld [data-nid="%s"].krun'%on).count();print(W,'2 odottaa:',chip,'|',hd,run);assert 'odottaa' in chip and hd.startswith('Odottaa: Valmis valittu') and run==1
            await pg.click('#lworld [data-nid="%s"] .lb'%on);await pg.wait_for_timeout(150);ins=await pg.inner_text('#insp');assert 'Odottaa nyt' in ins
            await pg.screenshot(path='versio71_odottaa_%d.png'%W)
            # lukittu käyttö: valinta jatkaa heti
            await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(200);await pg.click('#lockbtn');await pg.wait_for_timeout(150)
            await pg.click('.ue[data-id="%s"] [data-act="toggle"]'%ru);await pg.wait_for_timeout(200)
            rr=await P(pg,"KK.listRows(P,'%s').map(r=>r.tx)"%lid);print(W,'3 valinta jatkoi:',rr);assert rr==['Jatkui']
            await pg.click('#lockbtn');await pg.wait_for_timeout(150);await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            # aikaraja tuo aika loppui -kohdan
            await pg.click('#lworld [data-nid="%s"] .lb'%on);await pg.wait_for_timeout(150);await pg.fill('#insp input[data-k="raja"]','5');await pg.wait_for_timeout(150)
            ems=await pg.locator('#lworld [data-nid="%s"] .pins.o .pw>em'%on).all_inner_texts();print(W,'4 kohdat:',ems);assert ems==['jatkuu','aika loppui']
            lab=await pg.inner_text('#lworld [data-nid="%s"] .lt'%on);assert 'enintään 5 min' in lab
            # tapahtumanuoli palikan päälle: valikko kysyy kohdan
            await pg.evaluate("APP.P.st['%s']=false"%ru)
            await pg.select_option('#insp select[data-k="o"]','');await pg.wait_for_timeout(150)
            bn=await P(pg,"P.lg.n.find(n=>n.p==='%s').id"%bt)
            a=await pg.locator('#lworld [data-nid="%s"] .pins.o .pt[data-p="e"]'%bn).bounding_box();t=await pg.locator('#lworld [data-nid="%s"] .lb'%on).bounding_box()
            await veda(pg,[a['x']+6,a['y']+6],[t['x']+t['width']/2,t['y']+t['height']/2]);await pg.wait_for_timeout(150)
            items=await pg.locator('#menu button').all_inner_texts();print(W,'5 valikko:',items);assert 'tapahtuma' in items
            await pg.locator('#menu button',has_text='tapahtuma').click();await pg.wait_for_timeout(150)
            ok=await P(pg,"P.lg.l.some(l=>l.t==='%s'&&l.tp==='x')"%on);lab=await pg.inner_text('#lworld [data-nid="%s"] .lt'%on);print(W,'6 tapahtuma:',ok,lab);assert ok and 'tapahtuma' in lab
            await pg.click('#lworld [data-nid="%s"] [data-kplay]'%wid);await pg.wait_for_timeout(200)
            await pg.evaluate("KK.press(APP.P,'%s',APP.ctx());APP.renderAll()"%bt);await pg.wait_for_timeout(150)
            rr=await P(pg,"KK.listRows(P,'%s').map(r=>r.tx)"%lid);print(W,'7 painallus jatkoi:',rr);assert rr==['Jatkui','Jatkui']
            print(W,'errs',errs);assert not errs
            await b.close()
asyncio.run(main())
