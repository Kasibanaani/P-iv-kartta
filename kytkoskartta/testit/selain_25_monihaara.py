# Versio 7.2: Monta haaraa selaimessa. Palikka paletista ketjuun, Haarat vaihtoehtoryhmästä (kolme painiketta VAIN YKSI
# -ikkunassa), kohtien nimet palikan alareunassa, ＋ Jatka haaraan … jokaiselle (sijoittuvat vierekkäin), ajo valinnan
# mukaan, osuva rivi korostuu paneelissa, haaran nimi, ＋ Lisää haara arvon vertailuun ja haaran poisto. Kuvat versio72_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0].id;
 var w=KK.addBlock(P,'ikkuna',{m:'one',pakota:true,nm:'Mieliala'});var wn=KK.addNode(P,w.id,40,500);wn.w=220;wn.h=200;
 ['Huono','Ok','Hyvä'].forEach(function(t,i){var b=KK.addBlock(P,'nappi',{tx:t,nm:t,v:v});b.x=60;b.y=60+i*60;KK.addNode(P,b.id,60,550+i*46,wn.id);});
 var lst=KK.addBlock(P,'lista',{tx:'Loki',nm:'Loki',v:v});lst.x=300;lst.y=60;
 var k=KK.addBlock(P,'ketju',{nm:'Päätös'});var kw=KK.addNode(P,k.id,330,40);kw.w=760;
 APP.renderAll();return [k.id,kw.id,w.id,lst.id];})()"""
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Haarat');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            kid,wid,gid,lid=await pg.evaluate(SETUP)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            r=await pg.locator('#lworld [data-nid="%s"]'%wid).bounding_box()
            l=pg.locator('#pal .chip[data-make*=\'"k":"monihaara"\']').first;await l.scroll_into_view_if_needed();c0=await l.bounding_box()
            await veda(pg,[c0['x']+c0['width']/2,c0['y']+c0['height']/2],[r['x']+200,r['y']+80]);await pg.wait_for_timeout(200)
            mn=await P(pg,"P.lg.n.find(n=>P.b[n.p].k==='monihaara').id")
            await pg.select_option('#insp select[data-mhgroup]',gid);await pg.wait_for_timeout(200)
            ems=await pg.locator('#lworld [data-nid="%s"] .pins.o .pw>em'%mn).all_inner_texts();print(W,'1 kohdat:',ems);assert ems==['Huono','Ok','Hyvä','muuten']
            for i,(port,tx) in enumerate([('h1','Huono valittu'),('h2','Ok valittu'),('h3','Hyvä valittu'),('m','Ei vastausta')]):
                await pg.click('#lworld [data-nid="%s"] .lb'%mn);await pg.wait_for_timeout(120)
                await pg.select_option('#insp select[data-kadd="after:%s"]'%port,'tee:rivi');await pg.wait_for_timeout(150)
                await pg.select_option('#insp select[data-k="o"]',lid);await pg.fill('#insp input[data-k="tx"]',tx);await pg.wait_for_timeout(80)
            xs=await P(pg,"P.lg.l.filter(l=>l.f==='%s').map(l=>[l.fp,KK.nodeOf(P,l.t).x])"%mn);print(W,'2 jatkot:',xs)
            assert [x[0] for x in xs]==['h1','h2','h3','m'] and all(xs[i+1][1]-xs[i][1]>=250 for i in range(3))
            await pg.click('#lworld [data-nid="%s"] [data-kplay]'%wid);await pg.wait_for_timeout(150)
            await pg.evaluate("KK.userSet(APP.P,Object.values(APP.P.b).find(b=>b.nm==='Ok').id,true,APP.ctx())");await pg.click('#lworld [data-nid="%s"] [data-kplay]'%wid);await pg.wait_for_timeout(150)
            rr=await P(pg,"KK.listRows(P,'%s').map(r=>r.tx)"%lid);print(W,'3 ajo:',rr);assert rr==['Ei vastausta','Ok valittu']
            await pg.click('#lworld [data-nid="%s"] .lb'%mn);await pg.wait_for_timeout(150)
            on=await pg.locator('#insp .mhrow.on').count();nw=await pg.inner_text('#insp .mhrow.on select[data-k$="_o"] option:checked');print(W,'4 osuva rivi:',on,nw);assert on==1 and nw=='Ok'
            await pg.fill('#insp input[data-k="mh_1_nm"]','Kohtalainen');await pg.wait_for_timeout(150)
            ems=await pg.locator('#lworld [data-nid="%s"] .pins.o .pw>em'%mn).all_inner_texts();assert ems[1]=='Kohtalainen'
            await pg.screenshot(path='versio72_monihaara_%d.png'%W)
            # lisää haara arvon vertailuun ja poista se
            await pg.click('#insp [data-mhadd]');await pg.wait_for_timeout(150);await pg.select_option('#insp select[data-k="mh_3_m"]','on');await pg.wait_for_timeout(150)
            await pg.fill('#insp input[data-k="mh_3_a"]','5');await pg.wait_for_timeout(100)
            ins=await pg.inner_text('#insp');assert 'Arvo, jota haarat vertaavat' in ins
            ems=await pg.locator('#lworld [data-nid="%s"] .pins.o .pw>em'%mn).all_inner_texts();print(W,'5 uusi haara:',ems);assert ems==['Huono','Kohtalainen','Hyvä','= 5','muuten']
            await pg.click('#insp [data-mhdel="0"]');await pg.wait_for_timeout(150)
            st=await P(pg,"[P.b[KK.nodeOf(P,'%s').p].haarat.length,P.lg.l.filter(l=>l.f==='%s').map(l=>l.fp)]"%(mn,mn));print(W,'6 poisto:',st);assert st==[3,['h2','h3','m']]
            await pg.click('#undobtn');await pg.wait_for_timeout(150);st=await P(pg,"P.b[KK.nodeOf(P,'%s').p].haarat.length"%mn);assert st==4
            print(W,'errs',errs);assert not errs
            await b.close()
asyncio.run(main())
