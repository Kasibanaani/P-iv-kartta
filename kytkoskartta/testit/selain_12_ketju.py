# Versio 6.1: ketjuikkuna logiikan kanvaasilla. Ketju paletista, punainen reuna, tapahtumat sisään, automaattinen viiva
# edelliseen, punaiset viivat, lisäys paneelista, siirto ja koon muutos, poisto (ketju pysyy yhtenäisenä), Kumoa,
# tavallinen ikkuna ja tavalliset nuolet ennallaan, tallennus ja uudelleenavaus. Kuvakaappaukset versio6_*.png.
import asyncio,re
from playwright.async_api import async_playwright
from yhteinen import *
def rgb(s):
    m=re.findall(r'[\d.]+',s);return [float(x) for x in m[:3]]
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Ketjut');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            lv=await pg.locator('#lvp').bounding_box()
            async def chip(k,x,y,extra=''):
                l=pg.locator('#pal .chip[data-make*=\'"k":"%s"\']%s'%(k,extra)).first;await l.scroll_into_view_if_needed();c0=await l.bounding_box()
                await veda(pg,[c0['x']+c0['width']/2,c0['y']+c0['height']/2],[x,y]);await pg.wait_for_timeout(150)
            # --- ketju paletista ---
            await chip('ketju',lv['x']+300,lv['y']+200)
            kid=await P(pg,"Object.values(P.b).find(b=>b.k==='ketju').id")
            wn=await P(pg,"P.lg.n.find(n=>P.b[n.p].k==='ketju')")
            sel='#lworld [data-nid="%s"]'%wn['id']
            bc=await pg.evaluate("(s)=>getComputedStyle(document.querySelector(s)).borderTopColor",sel)
            c=rgb(bc);print(W,'1 ketju:',wn['w'],wn['h'],bc);assert c[0]>c[1]+60 and c[0]>c[2]+60,'reuna punainen'
            hd=await pg.inner_text(sel+' .wh');assert 'KETJU' in hd
            # --- tapahtumat sisään: toinen kytkeytyy ensimmäiseen ---
            r=await pg.locator(sel).bounding_box()
            await chip('tee',r['x']+120,r['y']+70,'[data-make*=\'"do":"aseta"\']')
            await chip('tee',r['x']+120,r['y']+150,'[data-make*=\'"do":"aseta"\']')
            st=await P(pg,"[P.lg.n.filter(n=>n.g==='%s').length,P.lg.l.length,P.lg.l.filter(l=>KK.isChainLink(P,l)).length]"%wn['id'])
            print(W,'2 sisällä, viivat:',st);assert st==[2,1,1]
            ch=await pg.locator('#lsvg path.lk.ch').count();assert ch==1
            sc=await pg.evaluate("()=>getComputedStyle(document.querySelector('#lsvg path.lk.ch')).stroke")
            c=rgb(sc);print(W,'3 viivan väri:',sc);assert c[0]>c[1]+60 and c[0]>c[2]+60,'viiva punainen'
            kv=await pg.locator('#lworld .ln.kv').count();assert kv==2,'tapahtumilla pystysuuntaiset kohdat'
            # --- lisäys paneelista loppuun ---
            await pg.click(sel+' .ktl');await pg.wait_for_timeout(150)
            ins=await pg.inner_text('#insp');assert 'tapahtumat järjestyksessä' in ins.lower()
            await pg.select_option('#insp select[data-kadd="end"]','tee:ilmoita');await pg.wait_for_timeout(200)
            order=await P(pg,"KK.chainOrder(P,'%s').map(id=>P.b[KK.nodeOf(P,id).p].do)"%kid);print(W,'4 järjestys:',order);assert order==['aseta','aseta','ilmoita']
            await pg.wait_for_timeout(100)
            # --- siirto: sisältö kulkee mukana; koon muutos ---
            before=await P(pg,"P.lg.n.filter(n=>n.g==='%s').map(n=>[n.x,n.y])"%wn['id'])
            w0=await P(pg,"KK.nodeOf(P,'%s')"%wn['id'])
            hb=await pg.locator(sel+' .ktl').bounding_box()
            await veda(pg,[hb['x']+10,hb['y']+8],[hb['x']+110,hb['y']+48])
            after=await P(pg,"P.lg.n.filter(n=>n.g==='%s').map(n=>[n.x,n.y])"%wn['id'])
            w1=await P(pg,"KK.nodeOf(P,'%s')"%wn['id'])
            print(W,'5 siirto:',w0['x'],w0['y'],'→',w1['x'],w1['y']);assert w1['x']-w0['x']==100 and w1['y']-w0['y']==40
            assert all(a[0]-b0[0]==100 and a[1]-b0[1]==40 for a,b0 in zip(after,before))
            rs=await pg.locator(sel+' .rs').bounding_box()
            await veda(pg,[rs['x']+8,rs['y']+8],[rs['x']+88,rs['y']+48])
            w2=await P(pg,"KK.nodeOf(P,'%s')"%wn['id']);print(W,'6 koko:',w1['w'],'→',w2['w']);assert w2['w']>=w1['w']+70
            # --- poisto: keskimmäinen pois, ketju pysyy yhtenäisenä ---
            await pg.click(sel+' .ktl');await pg.wait_for_timeout(150)
            await pg.locator('#insp [data-kdel]').nth(1).click();await pg.wait_for_timeout(200)
            st=await P(pg,"[KK.chainSteps(P,'%s').length,P.lg.l.filter(l=>KK.isChainLink(P,l)).length]"%kid);print(W,'7 poisto:',st);assert st==[2,1]
            # --- Kumoa ---
            await pg.click('#undobtn');await pg.wait_for_timeout(200)
            st=await P(pg,"[KK.chainSteps(P,'%s').length,P.lg.l.filter(l=>KK.isChainLink(P,l)).length]"%kid);print(W,'8 kumoa:',st);assert st==[3,2]
            await pg.screenshot(path='versio6_ketju_%d.png'%W)
            # --- tavallinen ikkuna ja nuolet ennallaan ---
            await chip('ikkuna',lv['x']+300,lv['y']+560,'[data-make*=\'"m":"and"\']')
            await chip('tee',lv['x']+560,lv['y']+560,'[data-make*=\'"do":"valitse"\']')
            await chip('tee',lv['x']+560,lv['y']+680,'[data-make*=\'"do":"vaihda"\']')
            st=await P(pg,"[Object.values(P.b).filter(b=>b.k==='ikkuna').length,P.lg.n.filter(n=>P.b[n.p].k==='tee'&&!n.g).length]");print(W,'9 muut:',st);assert st==[1,2]
            ns=await P(pg,"P.lg.n.filter(n=>P.b[n.p].k==='tee'&&!n.g).map(n=>n.id)")
            a=await pg.locator('#lworld [data-nid="%s"] .pins.o .pt'%ns[0]).bounding_box();t=await pg.locator('#lworld [data-nid="%s"] .pins.i .pt'%ns[1]).first.bounding_box()
            await veda(pg,[a['x']+6,a['y']+6],[t['x']+6,t['y']+6])
            st=await P(pg,"P.lg.l.filter(l=>!KK.isChainLink(P,l)).length");ev=await pg.locator('#lsvg path.lk.ev').count();print(W,'10 tavallinen nuoli:',st,ev);assert st==1 and ev==1
            # --- tallennus ja uudelleenavaus ---
            await pg.evaluate("APP.saveNow()");await pg.reload();await pg.wait_for_timeout(300)
            if await pg.locator('#tabs [data-t="logiikka"]').count():await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            st=await P(pg,"[Object.values(P.b).filter(b=>b.k==='ketju').length,KK.chainSteps(P,'%s').length,P.lg.l.filter(l=>KK.isChainLink(P,l)).length]"%kid);print(W,'11 uudelleen:',st);assert st==[1,3,2]
            ok=await pg.locator('#lworld .lw.kt').count();assert ok==1
            print(W,'errs',errs);assert not errs
            await b.close()
asyncio.run(main())
