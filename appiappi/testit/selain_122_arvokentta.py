# Jonon 26 b: kenttäparin arvo yhtenä kaavakenttänä paneelissa (tietokone 1440 ja 1280). Ei ”tai palikka…”-valikkoa, vanha
# valikkoviite näkyy @viitteenä, @alku + 5 lasketaan ja tulos näkyy kentän alla, ehdotukset @:sta, virhe tuntemattomasta,
# teksti pysyy tekstinä, Liikkeen nopeus kaavasta. Ei oikeaa iPhonea eikä Safaria.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P;
 var a=KK.addBlock(P,'arvo',{v:'1234,5678'});KK.setName(P,a.id,'Alku');KK.addNode(P,a.id,10,60);
 var l=KK.addBlock(P,'lasku',{op:'add',a:{r:a.id},b:'1'});KK.setName(P,l.id,'Summa');KK.addNode(P,l.id,260,60);
 P.lcam={x:0,y:0,z:1};KK.repair(P);APP.renderAll();return {a:a.id,l:l.id};})()"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in (1440,1280):
            ctx=await b.new_context(viewport={'width':W,'height':900},reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Arvokenttä');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(200)
            await pg.evaluate("APP.S.sel={t:'b',id:'%s'};APP.S.multi=[];APP.renderAll()"%I['l']);await pg.wait_for_timeout(200)
            fa='#insp input[data-k="a"][data-lit]'
            assert await pg.locator('#insp select[data-ref]').count()==0,'ei palikkavalikkoa'
            v=await pg.input_value(fa);print(W,'1 vanha viite:',v);assert v=='@alku',v
            # 2 kaava ja tulos kentän alla
            await pg.fill(fa,'@alku + 5');await pg.wait_for_timeout(150)
            r=await pg.inner_text('#insp [data-fverr="a"]');print(W,'2 tulos:',r);assert r.startswith('= 1') and '239,57' in r.replace(' ',' ').replace(' ',''),r
            val=await pg.evaluate("KK.Ev(APP.P,APP.ctx()).val('%s')"%I['l']);assert abs(val-1240.5678)<1e-9,val
            st=await pg.evaluate("JSON.stringify(APP.P.b['%s'].a)"%I['l']);assert '"f"' in st,st
            # 3 ehdotukset @:sta
            await pg.fill(fa,'@al');await pg.focus(fa);await pg.press(fa,'End');await pg.wait_for_timeout(150)
            n=await pg.locator('#insp .fsug [data-ksug]').count();print(W,'3 ehdotuksia:',n);assert n>=1
            # 4 tuntematon viite: virhe näkyy, kenttä punainen
            await pg.fill(fa,'@tuntematon * 2');await pg.wait_for_timeout(150)
            assert 'bad' in (await pg.get_attribute(fa,'class')),'bad'
            r=await pg.inner_text('#insp [data-fverr="a"]');print(W,'4 virhe:',r);assert r and not r.startswith('='),r
            # 5 teksti pysyy tekstinä, ei tulosriviä
            await pg.fill(fa,'Valmis');await pg.wait_for_timeout(150)
            st=await pg.evaluate("APP.P.b['%s'].a"%I['l']);assert st=='Valmis',st
            assert await pg.locator('#insp [data-fverr="a"]').is_hidden()
            # 6 tallentuu ja näkyy uudelleen avattaessa
            await pg.fill(fa,'(@alku - 34,5678) * 2');await pg.wait_for_timeout(150)
            await pg.evaluate("APP.S.sel=null;APP.renderAll()");await pg.reload();await pg.wait_for_timeout(300)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(150)
            await pg.evaluate("APP.S.sel={t:'b',id:'%s'};APP.S.multi=[];APP.renderAll()"%I['l']);await pg.wait_for_timeout(200)
            v=await pg.input_value(fa);print(W,'6 uudelleen:',v);assert v=='(@alku - 34,5678) * 2',v
            val=await pg.evaluate("KK.Ev(APP.P,APP.ctx()).val('%s')"%I['l']);assert abs(val-2401)<1e-9,val
            await pg.screenshot(path='arvokentta_%d.png'%W)
            print(W,'errs',errs);assert not errs,errs;await ctx.close()
        await b.close()
asyncio.run(main())
print('selain_122_arvokentta ok')
