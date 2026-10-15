# Pajakone 3a: asettelutyökalut puhelinnäkymässä. Yksi palikka: täysi leveys, reunat (vasen, oikea, ylä, ala) reunuksella,
# reunuksen muutos muistetaan; monivalinta: jaa ruudun leveydelle (yhtä leveät, väli), toisen palikan sisään (keskelle
# vaaka ja pysty, täytä reunoin, nousee kehyksen eteen), ulkoasun kopiointi ja liittäminen monelle (koko, värit, saman
# lajin tekstikoko), monistus ruudukoksi, Kumoa. Kuvat pajakone3a_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0].id;P.views[0].laite='puhelin';
 function U(k,o,x,y,w,h,nm){var b=KK.addBlock(P,k,o);b.x=x;b.y=y;if(w)b.w=w;if(h)b.h=h;if(nm)KK.setName(P,b.id,nm);return b;}
 var a=U('nappi',{v:v,tx:'A'},100,300,160,44,'A'),bb=U('nappi',{v:v,tx:'B'},120,400,100,44,'B'),c=U('nappi',{v:v,tx:'C'},40,460,120,44,'C'),d=U('nappi',{v:v,tx:'D'},250,470,90,44,'D');
 var box=U('muoto',{v:v,laji:'laatikko'},40,560,300,120,'Laatikko');box.z=1;var t=U('nayta',{v:v,tx:'Otsikko',koko:'l',hue:3},10,10,100,40,'Otsikko');t.z=0;
 var t2=U('nayta',{v:v,tx:'Toinen'},200,700,80,30,'Toinen');
 APP.renderAll();return {a:a.id,b:bb.id,c:c.id,d:d.id,box:box.id,t:t.id,t2:t2.id};})()"""
async def sel(pg,ids):
    await pg.evaluate("(function(ids){APP.S.multi=ids.length>1?ids.map(i=>({t:'b',id:i})):[];APP.S.sel={t:'b',id:ids[ids.length-1]};APP.renderAll();})",[i.strip('"') for i in ids]);await pg.wait_for_timeout(120)
async def bl(pg,id,f='[b.x,b.y,b.w,b.h]'):
    return await P(pg,"(function(){var b=P.b['%s'];return %s;})()"%(id,f))
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Asettelu');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP)
            # --- 1. Yksi palikka laitteen ruudussa ---
            await sel(pg,['"%s"'%I['a']])
            for op,want in (('fw',[16,300,358,44]),('bot',[16,784,358,44]),('top',[16,16,358,44]),('rgt',[16,16,358,44]),('lft',[16,16,358,44])):
                await pg.click('#insp [data-scr="%s"]'%op);await pg.wait_for_timeout(80);r=await bl(pg,I['a']);assert r==want,(op,r)
            await pg.evaluate("(function(){var b=APP.P.b['%s'];b.w=100;APP.renderAll();})()"%I['a'])
            await pg.click('#insp [data-scr="rgt"]');await pg.wait_for_timeout(80);assert (await bl(pg,I['a']))[0]==390-16-100
            await pg.fill('#insp [data-lm="lmarg"]','0');await pg.wait_for_timeout(80);assert await P(pg,"APP.data.cfg.lmarg")==0
            await pg.click('#insp [data-scr="fw"]');await pg.wait_for_timeout(80);assert await bl(pg,I['a'])==[0,16,390,44]
            print(W,'1 yksi palikka ok')
            # --- 2. Jaa ruudun leveydelle (reunus 0, väli 6) ---
            await sel(pg,['"%s"'%x for x in (I['d'],I['b'],I['c'],I['a'])])
            await pg.fill('#insp [data-lm="lgap"]','6');await pg.wait_for_timeout(60)
            await pg.click('#insp [data-scr="dw"]');await pg.wait_for_timeout(100)
            r=[await bl(pg,I[k],'[b.x,b.w]') for k in ('a','c','b','d')];print(W,'2 jaettu:',r)
            assert r==[[0,93],[99,93],[198,93],[297,93]],r
            await pg.click('#insp [data-scr="bot"]');await pg.wait_for_timeout(80)
            ys=[await bl(pg,I[k],'b.y+b.h') for k in ('a','b','c','d')];assert max(ys)==844,ys
            await pg.screenshot(path='pajakone3a_palkki_%d.png'%W)
            # --- 3. Toisen palikan sisään (kehys = viimeksi valittu) ---
            await pg.fill('#insp [data-lm="lmarg"]','10');await pg.wait_for_timeout(60)
            await sel(pg,['"%s"'%I['t'],'"%s"'%I['box']])
            assert 'Laatikko' in await pg.inner_text('#insp')
            await pg.click('#insp [data-in="h"]');await pg.click('#insp [data-in="v"]');await pg.wait_for_timeout(100)
            assert await bl(pg,I['t'],'[b.x,b.y]')==[140,600],await bl(pg,I['t'])
            assert await bl(pg,I['t'],'b.z>P.b["%s"].z'%I['box']),'teksti nousee kehyksen eteen'
            await pg.click('#insp [data-in="f"]');await pg.wait_for_timeout(100)
            assert await bl(pg,I['t'])==[50,570,280,100],await bl(pg,I['t'])
            # --- 4. Ulkoasu: kopioi otsikosta, liitä toiseen tekstiin ja painikkeeseen ---
            await sel(pg,['"%s"'%I['t']]);await pg.click('#insp [data-look="copy"]');await pg.wait_for_timeout(80)
            await sel(pg,['"%s"'%I['t2'],'"%s"'%I['c']]);await pg.click('#insp [data-look="paste"]');await pg.wait_for_timeout(100)
            r2=await bl(pg,I['t2'],'[b.w,b.h,b.hue,b.koko]');rc=await bl(pg,I['c'],'[b.w,b.h,b.hue,b.koko===undefined]')
            print(W,'4 ulkoasu:',r2,rc);assert r2==[280,100,3,'l'] and rc==[280,100,3,True]
            await pg.click('#undobtn');await pg.wait_for_timeout(100);assert (await bl(pg,I['t2'],'b.w'))==80
            # --- 5. Monista ruudukoksi 2 × 3 ---
            await sel(pg,['"%s"'%I['b']]);await pg.evaluate("(function(){var b=APP.P.b['%s'];b.x=20;b.y=100;b.w=100;b.h=40;APP.renderAll();})()"%I['b']);await sel(pg,['"%s"'%I['b']])
            await pg.fill('#dupg','5');await pg.fill('#dupr','2');await pg.fill('#dupk','3');await pg.click('#insp [data-dupd="g"]');await pg.wait_for_timeout(150)
            ps=await P(pg,"Object.values(P.b).filter(b=>b.tx==='B').map(b=>[b.x,b.y]).sort((a,b)=>a[1]-b[1]||a[0]-b[0])")
            print(W,'5 ruudukko:',ps);assert ps==[[20,100],[125,100],[230,100],[20,145],[125,145],[230,145]]
            await pg.screenshot(path='pajakone3a_ruudukko_%d.png'%W)
            await pg.click('#undobtn');await pg.wait_for_timeout(100);assert await P(pg,"Object.values(P.b).filter(b=>b.tx==='B').length")==1
            print(W,'errs',errs);assert not errs;await b.close()
asyncio.run(main())
