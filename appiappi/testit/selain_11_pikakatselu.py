# Versio 5.2: viite näkyy aina jokaisessa logiikan palikassa ja ikkunassa viitevärillä, kaavan viitteet värillä,
# pikakatselu vakiopaikalla (nimi, viite, lisätieto) logiikassa ja näkymän muokkaustilassa, Lisätieto-kenttä.
# Kuvakaappaukset versio52_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            for dark in (False,True):
                b,pg,errs=await avaa(p,W,900,dark=dark)
                await pg.fill('#wname','Pikakatselu');await pg.click('#wcreate');await pg.wait_for_timeout(150)
                await paletti(pg,'Säädin',520,260);await pg.wait_for_timeout(150);await pg.fill('#insp input[data-k="nm"]','Uni');await pg.wait_for_timeout(60)
                await pg.fill('#insp textarea[data-k="info"]','Unen määrä tunteina, kirjataan aamulla.');await pg.wait_for_timeout(80)
                # näkymän muokkaustila: hiiri palikan päälle
                uid=await P(pg,"B('Uni').id");before=await pg.locator('#uqv').bounding_box()
                await pg.hover('.ue[data-id="%s"]'%uid);await pg.wait_for_timeout(80)
                t=await pg.inner_text('#uqv');after=await pg.locator('#uqv').bounding_box()
                print(W,dark,'1 näkymän pikakatselu:',t.replace('\n',' | '));assert 'Uni' in t and 'uni' in t and 'kirjataan aamulla' in t and before==after
                await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
                lv=await pg.locator('#lvp').bounding_box()
                l=pg.locator('#pal .chip[data-make*=\'"k":"kaava"\']').first;c0=await l.bounding_box()
                await veda(pg,[c0['x']+c0['width']/2,c0['y']+c0['height']/2],[lv['x']+200,lv['y']+200]);await pg.wait_for_timeout(150)
                await pg.fill('#insp textarea[data-kaava]','uni > 7');await pg.wait_for_timeout(100)
                l=pg.locator('#pal .chip[data-make=\'{"k":"ikkuna","p":{"m":"and"}}\']');c0=await l.bounding_box()
                await veda(pg,[c0['x']+c0['width']/2,c0['y']+c0['height']/2],[lv['x']+300,lv['y']+420]);await pg.wait_for_timeout(150)
                await paletti(pg,'Uni',lv['x']+200,lv['y']+300);await pg.wait_for_timeout(150)
                n=await pg.locator('#lworld .ln').count();v=await pg.locator('#lworld .ln .vtag').count();w=await pg.locator('#lworld .lw .wvt').count()
                print(W,dark,'2 viitteet:',n,v,w);assert n==v and n>=2 and w==1
                col=await pg.evaluate("getComputedStyle(document.querySelector('#lworld .ln .vtag')).color")
                kc=await pg.locator('#lworld .ln .kf .vtc').inner_text();print(W,dark,'3 väri:',col,'| kaavan viite:',kc);assert kc=='uni' and col not in ('rgb(138, 147, 139)','rgb(127, 139, 130)')
                kn=await P(pg,"P.lg.n.find(n=>P.b[n.p].k==='kaava').id")
                await pg.mouse.move(lv['x']+lv['width']-60,lv['y']+lv['height']-160);await pg.wait_for_timeout(80)
                t0=await pg.inner_text('#lqv');box0=await pg.locator('#lqv').bounding_box()
                await pg.hover('#lworld [data-nid="%s"] .lb'%kn);await pg.wait_for_timeout(80);t1=await pg.inner_text('#lqv')
                un=await P(pg,"P.lg.n.find(n=>P.b[n.p].nm==='Uni').id");await pg.hover('#lworld [data-nid="%s"] .lb'%un);await pg.wait_for_timeout(80);t2=await pg.inner_text('#lqv')
                box1=await pg.locator('#lqv').bounding_box()
                print(W,dark,'4 pikakatselu:',t0[:30],'|',t1.replace('\n',' '),'|',t2.replace('\n',' '));assert 'Vie hiiri' in t0 and 'Kaava' in t1 and 'kaava' in t1 and 'kirjataan aamulla' in t2 and box0==box1
                await pg.screenshot(path='versio52_%d_%s.png'%(W,'tumma' if dark else 'vaalea'))
                print(W,dark,'errs',errs);await b.close()
asyncio.run(main())
