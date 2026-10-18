# Jonon 15d: Joukko-palikka selaimessa (tietokone 1440 ja 1280, 390 savutestinä). Paletin Joukko tekee uuden joukon, Ota mukaan
# -laji, Vain jos (jäsen.x), Pois/Palauta, sääntö näkyy kun jäsenille, jäsenen paneeli kertoo syyn ja ohjauksen, nimeäminen,
# paletin ⁂ siirtyy palikkaan, jäsenet korostuvat näkymässä, Kumoa. Ei oikeaa iPhonea eikä Safaria.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0].id,o={};
 [['A',60],['B',200],['C',300]].forEach(function(x){var b=KK.addBlock(P,'muoto',{v:v});KK.setName(P,b.id,x[0]);b.x=x[1];b.y=100;b.w=40;b.h=40;o[x[0]]=b.id;});
 var m=KK.addBlock(P,'muisti',{v:'5'});KK.setName(P,m.id,'Luku');KK.addNode(P,m.id,10,40);o.m=m.id;
 P.lcam={x:0,y:0,z:1};KK.repair(P);APP.renderAll();return o;})()"""
async def main():
    async with async_playwright() as p:
        br=await p.chromium.launch()
        for W in (1440,1280,390):
            mob=W<500;H=844 if mob else 900
            ctx=await br.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Joukko-palikka');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            if mob:await pg.tap('#tabs [data-t="logiikka"]')
            else:await pg.click('#tabs [data-t="logiikka"]')
            await pg.wait_for_timeout(200)
            if mob:
                r=await pg.evaluate("!!document.querySelector('#pal .chip[data-make*=\"pjoukko\"]')");print(W,'paletissa Joukko:',r);assert r
                print(W,'errs',errs);assert not errs,errs;await ctx.close();continue
            # 1 paletista Joukko: uusi joukko #joukko ja palikka valittuna
            vp=await pg.evaluate("(function(){var r=document.getElementById('lvp').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];})()")
            l=pg.locator('#pal .chip[data-make*="pjoukko"]');await l.scroll_into_view_if_needed();c=await l.bounding_box()
            await veda(pg,[c['x']+c['width']/2,c['y']+c['height']/2],[vp[0]+60,vp[1]+80]);await pg.wait_for_timeout(200)
            r=await P(pg,"(function(){var b=Object.values(P.b).filter(x=>x.k==='pjoukko')[0];return {id:b&&b.id,nm:b&&b.nm,j:b&&b.jj,sel:APP.S.sel&&(APP.S.sel.t==='n'?KK.nodeOf(P,APP.S.sel.id).p:APP.S.sel.id),nj:KK.jkList(P).length};})()")
            print(W,'1',r);assert r['nm']=='#joukko' and r['sel']==r['id'] and r['nj']==1,r
            PJ=r['id'];J=r['j']
            # 2 Ota mukaan: laji Muoto → 3 jäsentä, solmussa sirut, paletissa 3 jäsentä
            await pg.select_option('#insp select[data-k="otl"]','muoto');await pg.wait_for_timeout(200)
            n=await pg.locator('#insp .pjm.on').count();ch=await pg.locator('#lvp .jkchp i[data-jgo]').count();pal=await pg.inner_text('#pal .jkrow')
            print(W,'2',n,ch,pal.replace('\n',' '));assert n==3 and ch==3 and '3 jäsentä' in pal,(n,ch,pal)
            # 3 Vain jos jäsen.x > 100 → B ja C
            ta='#insp textarea[data-k="pjf_vjf"]';await pg.click(ta);await pg.type(ta,'jäsen.x > 100');await pg.wait_for_timeout(250)
            r=await P(pg,"E().jkJasenet('%s').map(i=>P.b[i].nm)"%J);t=await pg.inner_text('#insp .pjms');print(W,'3',r,'|',t.replace('\n',' '))
            assert r==['B','C'] and 'Vain jos ei päde' in t,(r,t)
            # 4 Pois ja Palauta
            await pg.locator('#insp .pjm',has_text='C').locator('[data-jex]').click();await pg.wait_for_timeout(200)
            r=await P(pg,"[E().jkJasenet('%s').map(i=>P.b[i].nm),P.b['%s'].jex]"%(J,PJ));print(W,'4',r);assert r[0]==['B'] and r[1]==[I['C']],r
            await pg.locator('#insp [data-jexpois]').click();await pg.wait_for_timeout(200)
            r=await P(pg,"[E().jkJasenet('%s').length,P.b['%s'].jex||null]"%(J,PJ));assert r==[2,None],r
            # 5 sääntö näkyy kun: jäsen.x < 250 → C piiloon käytössä
            await pg.click('#insp [data-jsradd]');await pg.wait_for_timeout(200)
            sv=await pg.input_value('#insp select[data-jsrp="0"]');assert sv=='nk',sv
            ta='#insp textarea[data-k="pjf_jsr_0"]';await pg.click(ta);await pg.type(ta,'jäsen.x < 250');await pg.wait_for_timeout(250)
            r=await P(pg,"[P.b['%s'].jsr,E().visible('%s'),E().visible('%s'),E().visible('%s')]"%(PJ,I['A'],I['B'],I['C']));print(W,'5',r)
            assert r[1] is True and r[2] is True and r[3] is False,r
            # 6 jäsenen paneeli: syy ja ohjaus
            await pg.evaluate("APP.S.sel={t:'b',id:'%s'};APP.S.multi=[];APP.renderAll()"%I['B']);await pg.wait_for_timeout(150)
            t=await pg.inner_text('#insp .jkchips');print(W,'6',t.replace('\n',' '));assert 'Ota mukaan' in t and 'ohjaa: näkyy kun' in t,t
            await pg.evaluate("APP.S.sel={t:'b',id:'%s'};APP.S.multi=[];APP.renderAll()"%I['A']);await pg.wait_for_timeout(150)
            t=await pg.inner_text('#insp .jkchips');print(W,'6b',t.replace('\n',' '));assert 'Vain jos ei päde' in t,t
            # 7 nimeäminen palikan Nimi-kentästä
            await pg.evaluate("APP.S.sel={t:'b',id:'%s'};APP.S.multi=[];APP.renderAll()"%PJ);await pg.wait_for_timeout(150)
            await pg.fill('#insp input[data-k="nm"]','hahmot');await pg.wait_for_timeout(200)
            r=await P(pg,"[KK.jkFind(P,'hahmot'),P.b['%s'].nm,document.getElementById('pal').innerText.indexOf('#hahmot')>=0]"%PJ);print(W,'7',r);assert r==[J,'#hahmot',True],r
            # 8 paletin ⁂ siirtyy palikkaan
            await pg.evaluate("APP.S.sel=null;APP.renderAll()");await pg.wait_for_timeout(100)
            await pg.click('#pal [data-jkpal="%s"]'%J);await pg.wait_for_timeout(200)
            r=await P(pg,"APP.S.sel&&(APP.S.sel.t==='n'?KK.nodeOf(P,APP.S.sel.id).p:APP.S.sel.id)");assert r==PJ,r
            # 9 Molemmat-näkymässä jäsenet korostuvat
            await pg.click('#tabs [data-t="molemmat"]');await pg.wait_for_timeout(250)
            await pg.evaluate("APP.S.sel={t:'b',id:'%s'};APP.S.multi=[];APP.renderAll()"%PJ);await pg.wait_for_timeout(200)
            r=await pg.evaluate("Array.from(document.querySelectorAll('.ue.jkhi')).length");print(W,'9 korostettu',r);assert r==2,r
            # 10 Kumoa (nimeäminen ja sääntö kumoutuvat askel kerrallaan)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(150)
            await pg.evaluate("document.activeElement&&document.activeElement.blur()")
            for i in range(20):
                if await P(pg,"Object.values(P.b).filter(x=>x.k==='pjoukko').length")==0:break
                await pg.keyboard.press('Control+z');await pg.wait_for_timeout(60)
            r=await P(pg,"[Object.values(P.b).filter(x=>x.k==='pjoukko').length,KK.jkList(P).length]");print(W,'10 kumottu',i,'askelta',r);assert r==[0,0],r
            print(W,'errs',errs);assert not errs,errs
            await ctx.close()
        await br.close()
asyncio.run(main())
