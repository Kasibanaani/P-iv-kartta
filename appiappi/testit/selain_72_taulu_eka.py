# Appi-appi 31 (jonon 1i): Tietotaulukon eka ja vika selaimessa (1440 ja 1280 hiirellä, 390 ja 320 kosketuksella).
# Näkymän teksti {ostokset.vika.nimi}, kaavan paneelin tulos, taulukon paneelin ohje kertoo eka ja vika,
# uusi rivi muuttaa viimeisen. Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P;var vw=P.views[0].id;
 var t=KK.addBlock(P,'taulu',{});KK.setName(P,t.id,'Ostokset');KK.addNode(P,t.id,10,60);
 var cN=KK.addCol(t,'Nimi','teksti'),cM=KK.addCol(t,'Määrä','luku');
 [['Maito',2],['Leipä',1],['Omena',6]].forEach(function(x){var r=KK.tAddRow(P,t.id,false);KK.tEdit(P,t.id,false,r,cN.id,x[0],new Date());KK.tEdit(P,t.id,false,r,cM.id,x[1],new Date());});
 var k=KK.addBlock(P,'kaava',{});k.f=KK.kaavaToIds(P,'ostokset.eka.määrä + ostokset.vika.määrä');KK.addNode(P,k.id,130,260);
 var n=KK.addBlock(P,'nayta',{v:vw});n.tx=KK.toIds(P,'Viimeinen: {ostokset.vika.nimi}');n.x=20;n.y=20;n.w=240;n.h=40;KK.setName(P,n.id,'Teksti');KK.addNode(P,n.id,40,400);
 P.lcam={x:0,y:0,z:1};KK.repair(P);APP.renderAll();return {t:t.id,k:k.id,n:n.id,cN:cN.id};})()"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in (1440,1280,390,320):
            mob=W<500;H=844 if mob else 900
            ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Eka');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            # 1 näkymän teksti
            t=(await pg.inner_text('.ue[data-id="%s"]'%I['n'])).strip();print(W,'1 näkymä:',t);assert t=='Viimeinen: Omena',t
            # 2 uusi rivi muuttaa viimeisen
            await pg.evaluate("(function(){var P=APP.P,r=KK.tAddRow(P,'%s',false);KK.tEdit(P,'%s',false,r,'%s','Kahvi',new Date());APP.renderAll();})()"%(I['t'],I['t'],I['cN']));await pg.wait_for_timeout(150)
            t=(await pg.inner_text('.ue[data-id="%s"]'%I['n'])).strip();print(W,'2 uusi rivi:',t);assert t=='Viimeinen: Kahvi',t
            # 3 paneelit: kaavan tulos ja taulukon ominaisuudet
            if mob:await pg.tap('#tabs [data-t="logiikka"]')
            else:await pg.click('#tabs [data-t="logiikka"]')
            await pg.wait_for_timeout(200)
            await pg.evaluate("APP.S.sel={t:'b',id:'%s'};APP.S.multi=[];APP.renderAll()"%I['k']);await pg.wait_for_timeout(200)
            v=await pg.input_value('#insp textarea[data-kaava]');print(W,'3 kaava:',v);assert v=='ostokset.eka.määrä + ostokset.vika.määrä',v
            r=await pg.inner_text('#kres');print(W,'3 tulos:',r);assert '–' in r,r  # Kahvilla ei määrää: 2 + puuttuva = tuntematon
            await pg.evaluate("APP.S.sel={t:'b',id:'%s'};APP.S.multi=[];APP.renderAll()"%I['t']);await pg.wait_for_timeout(200)
            ins=await pg.inner_text('#insp');assert 'ostokset.eka' in ins and 'ostokset.vika.nimi' in ins,'ohje: eka ja vika'
            await pg.screenshot(path='appiappi31_paneeli_%d.png'%W)
            print(W,'errs',errs);assert not errs,errs
            await ctx.close()
        await b.close()
asyncio.run(main())
