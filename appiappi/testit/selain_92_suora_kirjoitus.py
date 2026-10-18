# Jonon 12d (F38 kohta 4): suora kirjoitus näkymän palikkaan. Kaksoisnapautus tai Enter valitussa avaa palikan oman tekstin
# kirjoitettavaksi samalla fontilla ja paikalla; viitteet näkyvät {Nimi}, { tuo ehdotukset, Enter tai napautus muualle
# tallentaa, ⇧Enter rivi (Laatikko ja Teksti), Esc peruu, yksi ⌘Z kumoaa, paneelin kenttä päivittyy samaan. Nuolesta
# tuleva teksti ei avaudu (kupla vie lähteeseen). Uusi Laatikko ja Teksti paletista aukeavat heti kirjoitukseen; Laatikko
# myös Näyttö-ryhmän ensimmäisenä. Lukittuna ei kirjoitusta. Tietokone 1440 ja 1280, 390 savutestinä (kaksi napautusta). Ei oikeaa iPhonea.
import asyncio, os, re
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v1=P.views[0].id;
 var m=KK.addBlock(P,'muisti',{v:'7'});KK.setName(P,m.id,'Unipisteet');KK.addNode(P,m.id,60,180);
 var a=KK.addBlock(P,'muoto',{v:v1,tx:'Unta {#'+m.id+'} h'});a.x=60;a.y=100;
 var t=KK.addBlock(P,'nayta',{v:v1,tx:''});t.x=60;t.y=260;
 var k=KK.addBlock(P,'kaava',{f:'"Moi"'});KK.setName(P,k.id,'Tervehdys');
 KK.addLink(P,KK.addNode(P,k.id,60,60).id,'v',KK.addNode(P,t.id,400,60).id,'tx');
 var n=KK.addBlock(P,'nappi',{v:v1,tx:'Paina'});n.x=60;n.y=340;
 var l=KK.addBlock(P,'luku',{v:v1,tx:''});l.x=360;l.y=100;
 KK.repair(P);KK.tick(P,APP.ctx());APP.renderAll();return {a:a.id,t:t.id,n:n.id,l:l.id,m:m.id};})()"""
def S(i,x=''):return '#uels .ue[data-id="%s"]%s'%(i,x)
async def ta(pg):
    return await pg.evaluate("()=>{var t=document.querySelector('#uels textarea.tedit');if(!t)return null;return {v:t.value,f:document.activeElement===t,id:t.closest('.ue').getAttribute('data-id'),s:[t.selectionStart,t.selectionEnd],fs:getComputedStyle(t).fontSize};}")
async def tx(pg,i):return await pg.evaluate("(i)=>APP.P.b[i].tx",i)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in ((int(os.environ['VAIN']),) if os.environ.get('VAIN') else (1440,1280,390)):
            mob=W<500;H=844 if mob else 900
            ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Suora kirjoitus');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            await pg.evaluate("APP.data.cfg.viit='{'")  # jonon 12f: tämä testi tarkistaa { }-viittaustavan (oletus on @, ks. selain_94)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(200)
            if mob:
                # Kaksi napautusta samaan palikkaan avaa kirjoituksen, napautus muualle tallentaa.
                c=await keskus(pg,S(I['a']));await pg.touchscreen.tap(c[0],c[1]);await pg.wait_for_timeout(120);await pg.touchscreen.tap(c[0],c[1]);await pg.wait_for_timeout(200)
                r=await ta(pg);print(W,r);assert r and r['id']==I['a'] and r['v']=='Unta {Unipisteet} h',r
                await pg.keyboard.type('!');await pg.wait_for_timeout(100)
                await pg.touchscreen.tap(W-20,H-120);await pg.wait_for_timeout(250)
                assert await ta(pg) is None and (await tx(pg,I['a'])).endswith('} h!')
                print(W,'errs',errs);assert not errs;await ctx.close();continue
            # 1) Kaksoisnapautus Laatikkoon: kenttä samalla fontilla, viite {Nimi}; kirjoitus näkyy heti malliin ja paneeliin
            fs0=await pg.evaluate("(i)=>getComputedStyle(document.querySelector('#uels .ue[data-id=\"'+i+'\"] .w-txt')).fontSize",I['a'])
            await pg.dblclick(S(I['a']));await pg.wait_for_timeout(200)
            r=await ta(pg);print(W,r);assert r and r['f'] and r['v']=='Unta {Unipisteet} h' and r['fs']==fs0,r
            assert await pg.evaluate("(i)=>getComputedStyle(document.querySelector('#uels .ue[data-id=\"'+i+'\"] .w-txt')).color",I['a'])=='rgba(0, 0, 0, 0)','alkuperäinen teksti piilossa'
            u0=await pg.evaluate("APP.S.undo.length")
            await pg.keyboard.type(' unta');await pg.wait_for_timeout(150)
            assert await tx(pg,I['a'])=='Unta {#%s} h unta'%I['m']
            assert await pg.input_value('#insp [data-k="tx"]')=='Unta {Unipisteet} h unta','paneelin kenttä päivittyy'
            await pg.keyboard.press('Enter');await pg.wait_for_timeout(200)
            assert await ta(pg) is None and (await pg.inner_text(S(I['a'],' .in'))).strip()=='Unta 7 h unta'
            assert await pg.evaluate("APP.S.undo.length")==u0+1,'yksi Kumoa-askel'
            await pg.keyboard.press('Meta+z' if False else 'Control+z');await pg.wait_for_timeout(200)
            assert await tx(pg,I['a'])=='Unta {#%s} h'%I['m'],'⌘Z kumoaa'
            # 2) Esc peruu
            await pg.dblclick(S(I['a']));await pg.wait_for_timeout(150);await pg.keyboard.type('xyz');await pg.keyboard.press('Escape');await pg.wait_for_timeout(150)
            assert await ta(pg) is None and await tx(pg,I['a'])=='Unta {#%s} h'%I['m'] and await pg.evaluate("APP.S.undo.length")==u0,'Esc peruu ilman Kumoa-askelta'
            # 3) ⇧Enter = rivi Laatikossa; paneelin kenttä monirivinen
            await pg.dblclick(S(I['a']));await pg.wait_for_timeout(150);await pg.keyboard.press('Shift+Enter');await pg.keyboard.type('toka');await pg.keyboard.press('Enter');await pg.wait_for_timeout(200)
            assert await tx(pg,I['a'])=='Unta {#%s} h\ntoka'%I['m']
            assert await pg.evaluate("document.querySelector('#insp [data-k=\"tx\"]').tagName")=='TEXTAREA'
            # 4) { tuo ehdotukset; Enter hyväksyy ensimmäisen, toinen Enter tallentaa
            await pg.dblclick(S(I['a']));await pg.wait_for_timeout(150);await pg.keyboard.type(' {uni');await pg.wait_for_timeout(150)
            sg=await pg.evaluate("[...document.querySelectorAll('#tedsug button')].map(b=>b.getAttribute('data-fsug'))");assert sg and sg[0]=='{unipisteet}',sg
            await pg.keyboard.press('Enter');await pg.wait_for_timeout(120);r=await ta(pg);assert r and r['v'].endswith('toka {unipisteet}'),r
            await pg.keyboard.press('Enter');await pg.wait_for_timeout(200)
            assert (await tx(pg,I['a'])).endswith('toka {#%s}'%I['m']) and (await pg.inner_text(S(I['a'],' .in'))).strip().endswith('toka 7')
            # 5) Nuolesta tuleva teksti ei avaudu, kupla kertoo lähteen ja vie logiikkaan
            await pg.dblclick(S(I['t']));await pg.wait_for_timeout(200)
            assert await ta(pg) is None
            bub=await pg.inner_text('.tnvb');assert 'Teksti tulee kaavasta: Tervehdys' in bub,bub
            await pg.click('.tnvb');await pg.wait_for_timeout(300)
            assert await pg.evaluate("APP.S.tab")=='logiikka';await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(250)
            # 6) Enter valitussa Painikkeessa avaa; ⇧Enter tallentaa (ei riviä painikkeeseen)
            await pg.click(S(I['n']));await pg.wait_for_timeout(150);await pg.keyboard.press('Enter');await pg.wait_for_timeout(150)
            r=await ta(pg);assert r and r['id']==I['n'] and r['v']=='Paina',r
            await pg.keyboard.type('!');await pg.keyboard.press('Shift+Enter');await pg.wait_for_timeout(150)
            assert await ta(pg) is None and await tx(pg,I['n'])=='Paina!'
            # 7) Otsikoton Lukukenttä: kirjoitus otsikkoon
            await pg.dblclick(S(I['l']));await pg.wait_for_timeout(150);r=await ta(pg);assert r and r['v']=='',r
            await pg.keyboard.type('Ikä');await pg.wait_for_timeout(80)
            # napautus tyhjään kohtaan tallentaa
            await pg.mouse.click(W-380,H-60);await pg.wait_for_timeout(200)
            assert await ta(pg) is None and await tx(pg,I['l'])=='Ikä' and (await pg.inner_text(S(I['l'],' .wl'))).strip()=='Ikä'
            # 8) Paletti: Laatikko Näyttö-ryhmän ensimmäisenä; uusi Teksti aukeaa kirjoitukseen oletusteksti valittuna
            first=await pg.evaluate("()=>{var h=[...document.querySelectorAll('#pal .pt-h')].filter(x=>x.textContent==='Näyttö')[0];return h.nextElementSibling.querySelector('.chip').textContent;}")
            assert first.endswith('Laatikko'),first
            l=pg.locator('#pal .chip').filter(has_text=re.compile('^TTeksti$')).first;c=await l.bounding_box()
            await veda(pg,[c['x']+c['width']/2,c['y']+c['height']/2],[700,500]);await pg.wait_for_timeout(200)
            r=await ta(pg);assert r and r['v']=='Teksti' and r['s']==[0,6] and r['f'],r
            await pg.keyboard.type('Hei');await pg.keyboard.press('Enter');await pg.wait_for_timeout(200)
            assert await P(pg,"Object.values(P.b).filter(b=>b.k==='nayta'&&b.tx==='Hei').length")==1
            n0=await P(pg,"Object.values(P.b).filter(b=>b.k==='muoto').length")
            await pg.locator('#pal .chip',has_text='Laatikko').first.click();await pg.wait_for_timeout(250)
            r=await ta(pg);assert r and r['v']=='' and r['f'],r
            await pg.keyboard.press('Escape');await pg.wait_for_timeout(150)
            assert await P(pg,"Object.values(P.b).filter(b=>b.k==='muoto').length")==n0+1,'Laatikko tehtiin, Esc vain peruu kirjoituksen'
            # 9) Lukittuna kaksoisnapautus ei avaa kirjoitusta
            await pg.click('#lockbtn');await pg.wait_for_timeout(250)
            await pg.dblclick(S(I['a']));await pg.wait_for_timeout(150);assert await ta(pg) is None,'lukittuna ei kirjoitusta'
            await pg.click('#lockbtn');await pg.wait_for_timeout(200)
            print(W,'errs',errs);assert not errs
            await ctx.close()
        await b.close()
asyncio.run(main())
