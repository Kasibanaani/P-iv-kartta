# Jonon 29: rakennusympäristön viivakuvakkeet (a) ja paneelien valikot Appipaja 2.0 -ilmeeseen (b).
# Yläpalkissa, lapuissa ja kerrosriveillä ei värikkäitä emojeja vaan spriten viivakuvakkeet (currentColor, 16 px), jotka vaihtuvat
# tilan mukaan (Lukitse/Muokkaa, Kokeile/Lopeta kokeilu); paneelin valikoilla oma nuoli (appearance none) vaaleassa ja tummassa
# teemassa; lyhyt kiinteä valikko (Muutos ajassa: Yksikkö) on segmentit ja toimii. Tietokone 1440 ja 1280, 390 savutestinä.
# Ei oikeaa iPhonea.
import asyncio, re
from playwright.async_api import async_playwright
from yhteinen import *
EMOJI="/[\\u{1F300}-\\u{1FAFF}\\u{2600}-\\u{27BF}\\u{2B00}-\\u{2BFF}\\u{23E9}-\\u{23FA}]/u"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W,dark in ((1440,False),(1280,True),(390,False)):
            mob=W<500;ctx=await b.new_context(viewport={'width':W,'height':844 if mob else 900},has_touch=mob,is_mobile=mob,reduced_motion='reduce',color_scheme='dark' if dark else 'light')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
            await pg.goto(U);await pg.wait_for_timeout(250)
            async def tap(sel):
                # puhelimella savutesti: yläpalkki vierii ja paneeli on suljettu arkki, joten painetaan suoraan
                if mob:await pg.evaluate("(s)=>document.querySelector(s).click()",sel)
                else:await pg.click(sel)
                await pg.wait_for_timeout(150)
            await pg.fill('#wname','Kuvakkeet');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            # sprite: jokainen use-viittaus löytyy
            puuttuu=await pg.evaluate("[...document.querySelectorAll('use')].map(u=>u.getAttribute('href')).filter(h=>!document.querySelector(h))")
            assert not puuttuu,puuttuu
            # yläpalkki: ei emojeja, kuvakkeet 16 px tekstin värissä (puhelimella osa napeista on valikossa, ei palkissa)
            t=await pg.evaluate("document.querySelector('#top').textContent")
            assert not await pg.evaluate("(t)=>%s.test(t)"%EMOJI,t),(W,t)
            for s,n in (('#lapmbtn','muisti'),('#lapvbtn','viesti'),('#bkbtn','tallenna'),('#listbtn','lista'),('#undobtn','kumoa'),('#redobtn','uudelleen'),('#koebtn','kokeile'),('#lockbtn','lukko'),('#setbtn','asetukset')):
                r=await pg.evaluate("(s)=>{var e=document.querySelector(s+' svg.ico');if(!e)return null;var c=getComputedStyle(e),bb=e.getBoundingClientRect();var nb=document.querySelector(s).getBoundingClientRect();return [e.querySelector('use').getAttribute('href'),nb.width?Math.round(bb.width):16,c.stroke===getComputedStyle(document.querySelector(s)).color,c.fill]}",s)
                assert r and r[0]=='#i-'+n and r[1]==16 and r[2] and r[3]=='none',(W,s,r)
            if not mob:
                o=await pg.evaluate("(()=>{var t=document.querySelector('#top');return [t.scrollWidth,t.clientWidth]})()");assert o[0]<=o[1]+1,(W,o)
            # tila vaihtaa kuvakkeen
            await tap('#lockbtn')
            assert await pg.evaluate("document.querySelector('#lockbtn use').getAttribute('href')")=='#i-muokkaa'
            await tap('#lockbtn')
            assert await pg.evaluate("document.querySelector('#lockbtn use').getAttribute('href')")=='#i-lukko'
            await tap('#koebtn')
            assert await pg.evaluate("document.querySelector('#koebtn use').getAttribute('href')")=='#i-lopeta'
            await tap('#koebtn')
            assert await pg.evaluate("document.querySelector('#koebtn use').getAttribute('href')")=='#i-kokeile'
            # lapun otsikko
            await tap('#lapmbtn');await pg.evaluate("document.activeElement&&document.activeElement.blur()")
            assert await pg.evaluate("document.querySelector('#laput .lap .lapi use').getAttribute('href')")=='#i-muisti'
            # kerrosrivit (Näkymä, ei valintaa)
            await pg.evaluate("(function(){var P=APP.P,v=P.views[0];KK.addBlock(P,'muoto',{v:v.id});KK.repair(P);APP.S.sel=null;APP.S.multi=[];APP.S.tab='nakyma';APP.renderAll();})()");await pg.wait_for_timeout(150)
            kr=await pg.evaluate("(()=>{var r=document.querySelector('#insp .krr');if(!r)return null;return {ico:[...r.querySelectorAll('use')].map(u=>u.getAttribute('href')),txt:r.textContent}})()")
            if kr is not None:
                assert '#i-silma' in kr['ico'] and '#i-lukko' in kr['ico'],kr
                assert not await pg.evaluate("(t)=>%s.test(t)"%EMOJI,kr['txt']),kr
            # paneelin valikko: oma nuoli; lyhyt kiinteä valikko segmentteinä
            await pg.evaluate("(function(){var P=APP.P;var t=KK.addBlock(P,'tee',{});KK.addNode(P,t.id,40,40);var m=KK.addBlock(P,'muutos',{});KK.addNode(P,m.id,40,200);KK.repair(P);window.__t=t.id;window.__m=m.id;APP.S.tab='logiikka';APP.S.sel={t:'b',id:t.id};APP.S.multi=[];APP.renderAll();})()");await pg.wait_for_timeout(150)
            s=await pg.evaluate("(()=>{var e=document.querySelector('#insp select[data-k=\"do\"]'),c=getComputedStyle(e);return [c.appearance,c.backgroundImage.indexOf('linear-gradient')>=0,parseFloat(c.paddingRight),parseFloat(c.borderTopLeftRadius)]})()")
            assert s[0]=='none' and s[1] and s[2]>=20 and s[3]>=9,(W,s)
            await pg.evaluate("APP.S.sel={t:'b',id:__m};APP.renderAll()");await pg.wait_for_timeout(120)
            assert await pg.evaluate("!document.querySelector('#insp select[data-k=\"yks\"]')&&document.querySelectorAll('#insp [data-seg=\"yks\"]').length===3")
            await tap('#insp [data-seg="yks"][data-v="min"]')
            assert await pg.evaluate("APP.P.b[__m].yks")=='min'
            assert await pg.evaluate("document.querySelector('#insp [data-seg=\"yks\"][data-v=\"min\"]').classList.contains('on')")
            if W==1440:await pg.screenshot(path='appiappi_kuvakkeet_1440.png')
            if W==1280:await pg.screenshot(path='appiappi_kuvakkeet_1280_tumma.png')
            print(W,'tumma' if dark else 'vaalea','ok')
            print(W,'errs',errs);assert not errs,errs
            await ctx.close()
        await b.close()
asyncio.run(main())
