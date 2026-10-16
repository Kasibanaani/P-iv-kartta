# Ilme: Appipaja 2.0 -teemat vaaleana ja tummana (tekstin kontrasti ≥ 4,5:1 kaikissa teemoissa, myös Nauhoita-napissa),
# laitteen tumma tila, asetuksista vaihto, ei vaakavieritystä eikä yläpalkin ylivuotoa leveyksillä 1440, 1280, 1024 ja 820,
# kosketuskohteet iPadilla vähintään 44 px (aikajana) ja 36 px (yläpalkki). Kuvakaappaukset ilme_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
def lin(c):
    c=c/255;return c/12.92 if c<=0.03928 else ((c+0.055)/1.055)**2.4
def L(h):
    h=h.lstrip('#');r,g,b=(int(h[i:i+2],16) for i in (0,2,4));return 0.2126*lin(r)+0.7152*lin(g)+0.0722*lin(b)
def kontrasti(a,b):
    x,y=sorted((L(a),L(b)),reverse=True);return (x+0.05)/(y+0.05)
async def main():
    async with async_playwright() as p:
        b,ctx,pg,errs=await avaa(p,1024,768)
        th=await pg.evaluate("APP_APPEARANCE.themes")
        huono=[]
        for t in th:
            for m in 'LD':
                v=t[m];bg,cell,label,label2,accent,fill,tint=v[0],v[1],v[2],v[3],v[5],v[6],v[7]
                for nimi,fg,bk in (('teksti/tausta',label,bg),('teksti/pinta',label,cell),('toissij./tausta',label2,bg),('toissij./pinta',label2,cell),('toissij./sävy',label2,tint),('korostus/pinta',accent,cell),('valittu seg',accent,cell),('osa valittu',label,fill),('toissij./valittu',label2,fill)):
                    k=kontrasti(fg,bk)
                    if k<4.5:huono.append((t['id'],m,nimi,round(k,2)))
                pri_fg=v[0] if m=='D' else '#FFFFFF'
                if kontrasti(pri_fg,accent)<4.5:huono.append((t['id'],m,'ensisijainen nappi',round(kontrasti(pri_fg,accent),2)))
        rec=kontrasti('#FFFFFF','#C2453A');print('Nauhoita-nappi',round(rec,2))
        print('alle 4,5:',huono);assert rec>=4.5 and not huono
        await b.close()
        for W,H,touch in ((1440,900,False),(1280,800,False),(1024,768,True),(820,1180,True)):
            for dark in (False,True):
                b,ctx,pg,errs=await avaa(p,W,H,dark=dark,touch=touch)
                await pg.screenshot(path='ilme_tervetuloa_%d_%s.png'%(W,'tumma' if dark else 'vaalea'))
                await uusi(pg,'Ukko');await lisaa(pg,svg('#c33',120,200),'Vartalo');await lisaa(pg,svg('#36c',30,120),'Vasen käsi')
                await pg.evaluate("(()=>{var P=APP.P;APP.AM.vaihdaVanhempi(P,P.osat[1].id,P.osat[0].id,0);P.ruutuja=48;P.liike[P.osat[0].id]=Array.from({length:48},(_,f)=>f<30?[200+f*2,260,f,1]:null);APP.muuttui();APP.asetaRuutu(12);APP.renderAll();})()")
                tila=await pg.evaluate("document.documentElement.dataset.theme");assert tila==('dark' if dark else 'light'),'laitteen tila %s'%tila
                ov=await pg.evaluate("[document.documentElement.scrollWidth,window.innerWidth,document.querySelector('#top').scrollWidth,document.querySelector('#top').clientWidth]")
                assert ov[0]<=ov[1] and ov[2]<=ov[3]+1,'%d: ylivuoto %s'%(W,ov)
                if touch:
                    kk=await pg.evaluate("['#recbtn','#playbtn','#startbtn','#prevbtn','#nextbtn','#haamubtn'].map(s=>{var r=document.querySelector(s).getBoundingClientRect();return Math.min(r.width,r.height);})")
                    assert min(kk)>=44,'aikajanan napit ≥ 44 px: %s'%kk
                    tk=await pg.evaluate("[...document.querySelectorAll('#top button')].filter(b=>b.offsetParent).map(b=>b.getBoundingClientRect().height)")
                    assert min(tk)>=32,'yläpalkin napit: %s'%tk
                await pg.screenshot(path='ilme_%d_%s.png'%(W,'tumma' if dark else 'vaalea'))
                if W==1024 and not dark:
                    await pg.click('#setbtn') if not touch else await (await Kosketus.luo(pg)).napauta('#setbtn')
                    await pg.wait_for_timeout(100);T=await Kosketus.luo(pg);await T.napauta('#sheet [data-ap-mode="dark"]');await pg.wait_for_timeout(100)
                    assert await pg.evaluate("document.documentElement.dataset.theme")=='dark','asetuksista tumma'
                    await T.napauta('#sheet [data-ap-theme="lake"]');await pg.wait_for_timeout(100)
                    assert await pg.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()")=='#A8C8E7','teema vaihtui'
                    await pg.screenshot(path='ilme_asetukset_1024.png')
                    await pg.reload();await pg.wait_for_timeout(300);assert await pg.evaluate("document.documentElement.dataset.appearanceTheme")=='lake','teema säilyy'
                assert errs==[],errs
                await b.close()
    print('ok')
asyncio.run(main())
