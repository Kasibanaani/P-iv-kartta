# Versio 6.10: muokkaus ketjuikkunassa. Kopioi ja liitä (⌘C / ⌘V ja paneelin napit) tapahtumalle ja koko ketjulle,
# Kumoa ja Tee uudelleen (↷-nappi ja ⇧⌘Z), ketjun viivan valinta, uudelleenkytkentä paneelista (Vaihda kohde / lähtö)
# ja poisto ⌫-näppäimellä. Kuvat versio610_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P;
 var k=KK.addBlock(P,'ketju',{nm:'Muokkaus'});var w=KK.addNode(P,k.id,330,60);
 var a=KK.addBlock(P,'tee',{do:'ilmoita',tx:'A',nm:'A'}),b=KK.addBlock(P,'tee',{do:'ilmoita',tx:'B',nm:'B'}),c=KK.addBlock(P,'tee',{do:'ilmoita',tx:'C',nm:'C'});
 var na=KK.addNode(P,a.id,370,110,w.id),nb=KK.addNode(P,b.id,370,200,w.id),nc=KK.addNode(P,c.id,620,200,w.id);var l=KK.addLink(P,na.id,'e',nb.id,'e');
 APP.renderAll();return [k.id,w.id,na.id,nb.id,nc.id,l.id];})()"""
async def pt_on(pg,lid):
    return await pg.evaluate("""(id)=>{var p=document.querySelector('#lworld path.hit[data-lid="'+id+'"]');var L=p.getTotalLength();var q=p.getPointAtLength(L/2);var m=p.getScreenCTM();return [q.x*m.a+q.y*m.c+m.e,q.x*m.b+q.y*m.d+m.f];}""",lid)
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Muokkaus');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            kid,wid,na,nb,nc,lid=await pg.evaluate(SETUP)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            steps=lambda:P(pg,"KK.chainSteps(P,'%s').length"%kid)
            rd=await pg.is_disabled('#redobtn');print(W,'0 ↷ aluksi pois:',rd);assert rd
            # viivan valinta ja uudelleenkytkentä
            x,y=await pt_on(pg,lid);await pg.mouse.click(x,y);await pg.wait_for_timeout(150)
            ih=await pg.inner_text('#insp .ih');print(W,'4 valittu:',ih.replace('\n',' '));assert 'Ketjun viiva' in ih
            await pg.click('#insp [data-relink="t"]');await pg.wait_for_timeout(100)
            await pg.locator('#menu button',has_text='C').first.click();await pg.wait_for_timeout(150)
            tl=await P(pg,"P.lg.l.filter(l=>l.f==='%s').map(l=>l.t)"%na);print(W,'5 uusi kohde:',tl,nc);assert tl==[nc]
            await pg.screenshot(path='versio610_muokkaus_%d.png'%W)
            # poisto ⌫
            await pg.keyboard.press('Backspace');await pg.wait_for_timeout(150)
            tl=await P(pg,"P.lg.l.filter(l=>l.f==='%s').length"%na);print(W,'6 poistettu:',tl);assert tl==0
            await pg.keyboard.press('Control+z');await pg.wait_for_timeout(150)
            tl=await P(pg,"P.lg.l.filter(l=>l.f==='%s').length"%na);assert tl==1
            # tapahtuman kopiointi ja liittäminen samaan ketjuun
            await pg.click('#lworld [data-nid="%s"] .lb'%na);await pg.wait_for_timeout(100)
            await pg.keyboard.press('Control+c');await pg.wait_for_timeout(100);t=await pg.inner_text('#toast');assert 'Kopioitu: 1' in t
            await pg.keyboard.press('Control+v');await pg.wait_for_timeout(200)
            n=await steps();print(W,'1 liitetty:',n);assert n==4
            ks=None
            # Kumoa ja Tee uudelleen
            await pg.click('#undobtn');await pg.wait_for_timeout(150);n1=await steps()
            rd=await pg.is_disabled('#redobtn');await pg.click('#redobtn');await pg.wait_for_timeout(150);n2=await steps()
            await pg.keyboard.press('Control+z');await pg.wait_for_timeout(150);n3=await steps();await pg.keyboard.press('Control+Shift+z');await pg.wait_for_timeout(150);n4=await steps()
            print(W,'2 kumoa / uudelleen:',n1,rd,n2,n3,n4);assert (n1,rd,n2,n3,n4)==(3,False,4,3,4)
            # koko ketjun kopiointi paneelin napeista
            await pg.click('#lworld [data-nid="%s"] .ktl'%wid);await pg.wait_for_timeout(150)
            await pg.click('#insp [data-do="copy"]');await pg.wait_for_timeout(100);await pg.click('#insp [data-do="paste"]');await pg.wait_for_timeout(250)
            ks=await P(pg,"Object.values(P.b).filter(b=>b.k==='ketju').map(b=>[b.nm,KK.chainSteps(P,b.id).length])");print(W,'3 ketju kopioitu:',ks);assert len(ks)==2 and ks[1]==['Muokkaus 2',4]
            print(W,'errs',errs);assert not errs
            await b.close()
asyncio.run(main())
