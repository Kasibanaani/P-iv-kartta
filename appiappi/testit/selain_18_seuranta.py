# Versio 6.7: ketjun seuranta. Ajon aikana odottava tapahtuma korostuu, ajastimessa näkyy jäljellä oleva aika ja palkki,
# ketjun otsikossa näkyy, mitä odotetaan, kuljettu reitti ja menossa oleva viiva korostuvat, paneelissa Nyt menossa.
# Sekunnin välein päivittyvät vain ajat (kanvaasia ei piirretä uudelleen). Rinnakkaiset haarat näkyvät molemmat. Kuvat versio67_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P;
 var k=KK.addBlock(P,'ketju',{nm:'Seuranta'});var w=KK.addNode(P,k.id,330,60);
 var a=KK.addBlock(P,'tee',{do:'ilmoita',tx:'A',nm:'A'}),t1=KK.addBlock(P,'ajastin',{kesto:3}),t2=KK.addBlock(P,'ajastin',{kesto:5}),b=KK.addBlock(P,'tee',{do:'ilmoita',tx:'B',nm:'B'});
 var na=KK.addNode(P,a.id,400,110,w.id),n1=KK.addNode(P,t1.id,360,200,w.id),n2=KK.addNode(P,t2.id,560,200,w.id),nb=KK.addNode(P,b.id,400,290,w.id);
 KK.addLink(P,na.id,'e',n1.id,'e');KK.addLink(P,na.id,'e',n2.id,'e');KK.addLink(P,n1.id,'e',nb.id,'e');
 APP.renderAll();return [k.id,w.id,n1.id,n2.id,nb.id];})()"""
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Seuranta');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            kid,wid,n1,n2,nb=await pg.evaluate(SETUP)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            await pg.evaluate("(function(){var c=APP.P.lcam;c.x=-250;c.y=0;c.z=1;APP.renderAll();})()")
            await pg.click('#lworld [data-nid="%s"] .ktl'%wid);await pg.wait_for_timeout(100)
            await pg.click('#insp [data-kplay2]');await pg.wait_for_timeout(300)
            run=await pg.locator('#lworld .ln.kv.krun').count();print(W,'1 korostus:',run);assert run==2,'molemmat haarat odottavat'
            l1=await pg.inner_text('#lworld [data-nid="%s"] .kleft'%n1);know=await pg.inner_text('#lworld [data-nid="%s"] .know'%wid)
            print(W,'2 jäljellä:',l1,'| otsikko:',know);assert l1.startswith('⏳ 0:0') and know.startswith('Odota · 0:0') and '(+1)' in know
            kact=await pg.locator('#lsvg path.lk.ch.kact').count();print(W,'3 menossa olevat viivat:',kact);assert kact==2
            ins=await pg.inner_text('#insp .know2');print(W,'4 nyt menossa:',ins.replace('\n',' | '));assert 'Odota 3 s' in ins and 'Odota 5 s' in ins
            await pg.evaluate("document.querySelector('#lworld [data-nid=\"%s\"]').dataset.merkki='1'"%n1)
            w0=await pg.evaluate("parseFloat(document.querySelector('#lworld [data-nid=\"%s\"] .kbar>b').style.width)"%n1)
            await pg.screenshot(path='versio67_seuranta_%d.png'%W)
            await pg.wait_for_timeout(1300)
            same=await pg.evaluate("document.querySelector('#lworld [data-nid=\"%s\"]').dataset.merkki"%n1)
            w1=await pg.evaluate("parseFloat(document.querySelector('#lworld [data-nid=\"%s\"] .kbar>b').style.width)"%n1)
            l2=await pg.inner_text('#lworld [data-nid="%s"] .kleft'%n1);print(W,'5 päivittyy:',w0,'→',w1,l1,'→',l2,'sama elementti',same)
            assert same=='1' and w1>w0 and l2!=l1
            await pg.wait_for_timeout(2000)
            st=await P(pg,"[P.lg.n.filter(n=>document.querySelector('#lworld [data-nid=\"'+n.id+'\"].krun')).length]")
            kd=await pg.locator('#lsvg path.lk.ch.kd').count();print(W,'6 ensimmäinen haara valmis:',st,'kuljettu',kd);assert st==[1] and kd>=2
            await pg.wait_for_timeout(2200)
            run=await pg.locator('#lworld .ln.kv.krun').count();kact=await pg.locator('#lsvg path.lk.ch.kact').count();hd=await pg.inner_text('#lworld [data-nid="%s"] .wh'%wid)
            print(W,'7 valmis:',run,kact,hd.replace('\n',' '));assert run==0 and kact==0 and 'käynnissä' not in hd
            print(W,'errs',errs);assert not errs
            await b.close()
asyncio.run(main())
