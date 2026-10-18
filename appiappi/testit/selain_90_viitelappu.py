# Jonon 12c (F38 kohta 3): viite näkyy muokatessa. Näkymäpalikan yläpuolella himmeä lappu: tekstin viitteet {Nimi}
# (pilkuin, ei toistoja) tai nuolesta tuleva teksti ⇐ Nimi. Arvo pysyy palikassa ennallaan eikä palikka liiku.
# Lukittuna ja kokeillessa ei lappua. ⚙︎ Asetukset → Muokkaus → Näytä viitteet muokatessa (selainasetus Dt.cfg.vlap).
# Lapun teksti on data-l-attribuutissa (::before), joten palikan innerText ei muutu. Tavallisessa tekstissä ja Alueella ei lappua. Tietokone 1440 ja 1280, 390 savutestinä. Ei oikeaa iPhonea.
import asyncio, os
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v1=P.views[0].id;
 var m=KK.addBlock(P,'muisti',{v:'7'});KK.setName(P,m.id,'Unipisteet');
 var q=KK.addBlock(P,'arvo',{v:'hyvä'});KK.setName(P,q.id,'Laatu');KK.addNode(P,m.id,60,180);KK.addNode(P,q.id,60,300);
 var a=KK.addBlock(P,'muoto',{v:v1,tx:'Unta {#'+m.id+'} h, {#'+q.id+'} ({#'+m.id+'})'});a.x=60;a.y=120;
 var t=KK.addBlock(P,'nayta',{v:v1,tx:''});t.x=60;t.y=300;
 var k=KK.addBlock(P,'kaava',{f:'"Moi"'});KK.setName(P,k.id,'Tervehdys');
 KK.addLink(P,KK.addNode(P,k.id,60,60).id,'v',KK.addNode(P,t.id,400,60).id,'tx');
 var c=KK.addBlock(P,'nayta',{v:v1,tx:'Pelkkä teksti'});c.x=60;c.y=420;
 var al=KK.addBlock(P,'alue',{v:v1});al.x=500;al.y=420;
 KK.repair(P);KK.tick(P,APP.ctx());APP.renderAll();return {a:a.id,t:t.id,c:c.id,al:al.id};})()"""
async def lappu(pg,i):
    return await pg.evaluate("(i)=>{var e=document.querySelector('#uels .ue[data-id=\"'+i+'\"] .vlap');if(!e)return null;var r=e.getBoundingClientRect(),u=e.parentNode.getBoundingClientRect();return {t:e.getAttribute('data-l'),ala:r.bottom<=u.top+1,vis:getComputedStyle(e).display!=='none'&&r.width>0};}",i)
async def laatikko(pg,i):
    return await pg.evaluate("(i)=>{var e=document.querySelector('#uels .ue[data-id=\"'+i+'\"]'),r=e.getBoundingClientRect(),w=e.querySelector('.in');return [e.style.left,e.style.top,Math.round(r.width),Math.round(r.height),w.textContent.trim()];}",i)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in ((int(os.environ['VAIN']),) if os.environ.get('VAIN') else (1440,1280,390)):
            mob=W<500;H=844 if mob else 900
            ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Viitelappu');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(200)
            # 1) Muokatessa: viitteet pilkuin ilman toistoa, arvo palikassa ennallaan, lappu palikan yläpuolella
            r=await lappu(pg,I['a']);print(W,r)
            assert r and r['t']=='{Unipisteet}, {Laatu}' and r['ala'] and r['vis'],r
            assert (await pg.inner_text('#uels .ue[data-id="%s"]'%I['a'])).strip()=='Unta 7 h, hyvä (7)','lappu ei sekoitu palikan tekstiin'
            ba=await laatikko(pg,I['a']);assert ba[4]=='Unta 7 h, hyvä (7)',ba
            r=await lappu(pg,I['t']);assert r and r['t']=='⇐ Tervehdys' and r['vis'],r
            bt=await laatikko(pg,I['t']);assert bt[4]=='Moi',bt
            assert await lappu(pg,I['c']) is None,'tavallisessa tekstissä ei lappua'
            assert await lappu(pg,I['al']) is None,'Alueella ei lappua'
            if mob:
                print(W,'errs',errs);assert not errs;await ctx.close();continue
            # 2) Valittuna nimilappu näkyy, viitelappu siirtyy sen yläpuolelle (ei päällekkäin)
            await pg.evaluate("(i)=>{APP.S.sel={t:'b',id:i};APP.renderAll();}",I['a']);await pg.wait_for_timeout(150)
            ov=await pg.evaluate("(i)=>{var u=document.querySelector('#uels .ue[data-id=\"'+i+'\"]'),a=u.querySelector('.vlap').getBoundingClientRect(),n=u.querySelector('.nmtag').getBoundingClientRect();return [a.bottom,n.top,getComputedStyle(u.querySelector('.nmtag')).display];}",I['a'])
            assert ov[2]=='block' and ov[0]<=ov[1]+0.5,'viitelappu nimilapun yläpuolella %s'%ov
            # 3) Lukittuna ei lappua, eikä palikka liiku
            await pg.click('#lockbtn');await pg.wait_for_timeout(250)
            assert await lappu(pg,I['a']) is None and await lappu(pg,I['t']) is None,'lukittuna ei lappua'
            b2=await laatikko(pg,I['a']);assert b2==ba,'asettelu ei hyppää %s %s'%(ba,b2)
            await pg.click('#lockbtn');await pg.wait_for_timeout(250)
            assert (await lappu(pg,I['a']))['t']=='{Unipisteet}, {Laatu}','avattuna lappu palaa'
            # 4) Kokeile-tilassa ei lappua
            await pg.click('#koebtn');await pg.wait_for_timeout(300)
            assert await lappu(pg,I['a']) is None,'kokeillessa ei lappua'
            await pg.click('#koebtn');await pg.wait_for_timeout(300)
            assert (await lappu(pg,I['a'])) is not None,'kokeilun jälkeen lappu palaa'
            # 5) Asetus pois: ei lappua; tallentuu selaimeen (Dt.cfg), ei projektiin
            await pg.click('#setbtn');await pg.wait_for_timeout(200)
            await pg.click('#sheet [data-cfg="vlap"][data-v="0"]');await pg.wait_for_timeout(200)
            await pg.click('#sheet [data-x="close"]');await pg.wait_for_timeout(200)
            assert await lappu(pg,I['a']) is None,'asetus pois'
            assert await pg.evaluate("APP.data.cfg.vlap")==False
            assert 'vlap' not in await P(pg,"Object.keys(P)"),'ei projektiin'
            await pg.click('#setbtn');await pg.wait_for_timeout(200)
            await pg.click('#sheet [data-cfg="vlap"][data-v="1"]');await pg.wait_for_timeout(200)
            await pg.click('#sheet [data-x="close"]');await pg.wait_for_timeout(200)
            assert (await lappu(pg,I['a']))['t']=='{Unipisteet}, {Laatu}','asetus päälle'
            # 6) Uudelleennimeäminen näkyy lapussa heti
            await pg.evaluate("()=>{var P=APP.P,m=Object.values(P.b).filter(b=>b.nm==='Laatu')[0];KK.setName(P,m.id,'Laatuarvio');APP.renderAll();}");await pg.wait_for_timeout(150)
            assert (await lappu(pg,I['a']))['t']=='{Unipisteet}, {Laatuarvio}'
            print(W,'errs',errs);assert not errs
            await ctx.close()
        await b.close()
asyncio.run(main())
