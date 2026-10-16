# Appi-appi 9: Monitori ja Sekuntikello selaimessa. Paneeli (1440 ja 1280): Monitori paletissa, muoto ja esitys
# paneelista, Sekuntikellon ▶ / ⏸ / ↺ ja kulunut. Lukittuna (1440, 390, 320): kuusi monitoria (luku-aika, palkki, pylväs,
# rengas-prosentti, kaari, pisteet) samasta sekuntikellosta elävät reaaliajassa; Pysäytä jäädyttää. Kuvat appiappi9_monitori_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0];v.laite='puhelin';var vw=v.id;
 function U(k,o,x,y,w,h,nm){var b=KK.addBlock(P,k,o);b.x=x;b.y=y;if(w)b.w=w;if(h)b.h=h;if(nm)KK.setName(P,b.id,nm);return b;}
 var kl=KK.addBlock(P,'kello',{});KK.setName(P,kl.id,'Kello');var kn=KK.addNode(P,kl.id,40,40);
 var M=[['luku','aika','Aika',20,20,170,90],['palkki','luku','Palkki',200,20,170,90],['pylvas','luku','Pylväs',20,130,80,200],['rengas','pros','Rengas',110,130,130,130],['kaari','luku','Kaari',250,130,130,130],['pisteet','luku','Pisteet',20,350,340,70]];
 var ids={};M.forEach(function(m,i){var b=U('mittari',{v:vw,muoto:m[0],esit:m[1],max:m[0]==='pisteet'?'5':'10',dec:m[0]==='kaari'?'1':'',tx:m[2],hue:i%8},m[3],m[4],m[5],m[6],m[2]);ids[m[0]]=b.id;KK.addLink(P,kn.id,'v',KK.addNode(P,b.id,300,80*i).id,'o_arvo');});
 var go=U('nappi',{v:vw,tx:'Käynnistä',beh:'kerta'},20,460,160,50,'Go'),st=U('nappi',{v:vw,tx:'Pysäytä',beh:'kerta'},200,460,160,50,'Stop');
 KK.addLink(P,KK.addNode(P,go.id,0,300).id,'e',kn.id,'e');KK.addLink(P,KK.addNode(P,st.id,0,380).id,'e',kn.id,'x');
 KK.repair(P);APP.renderAll();return {kl:kl.id,kn:kn.id,ids:ids,go:go.id,st:st.id};})()"""
async def main():
    async with async_playwright() as p:
        for W in (1440,1280,390,320):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Monitori');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            if W>500:
                assert await pg.locator('#pal .chip',has_text='Monitori').count()==1
            I=await pg.evaluate(SETUP)
            if W>500:
                await pg.evaluate("(function(){APP.S.sel={t:'b',id:'%s'};APP.renderAll();})()"%I['ids']['palkki']);await pg.wait_for_timeout(120)
                await pg.click('#insp [data-seg="muoto"][data-v="rengas"]');await pg.wait_for_timeout(120)
                assert await P(pg,"P.b['%s'].muoto"%I['ids']['palkki'])=='rengas'
                assert await pg.locator('.ue[data-id="%s"] svg path.mtk'%I['ids']['palkki']).count()==1
                await pg.click('#insp [data-seg="muoto"][data-v="palkki"]');await pg.wait_for_timeout(120)
                await pg.click('#insp [data-seg="esit"][data-v="pros"]');await pg.wait_for_timeout(120);assert await P(pg,"P.b['%s'].esit"%I['ids']['palkki'])=='pros'
                await pg.click('#insp [data-seg="esit"][data-v="luku"]');await pg.wait_for_timeout(120)
                await pg.screenshot(path='appiappi9_monitori_paneeli_%d.png'%W)
                await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(200)
                assert await pg.locator('#pal .chip',has_text='Sekuntikello').count()==1
                await pg.evaluate("(function(){APP.S.sel={t:'n',id:'%s'};APP.renderAll();})()"%I['kn']);await pg.wait_for_timeout(150)
                await pg.click('#insp [data-do="kellogo"]');await pg.wait_for_timeout(1100);await pg.click('#insp [data-do="kellostop"]');await pg.wait_for_timeout(100)
                k=await P(pg,"E().val('%s')"%I['kl']);print(W,'kello paneelista:',k);assert 0.9<k<1.6,k
                await pg.click('#insp [data-do="kellonolla"]');await pg.wait_for_timeout(100);assert await P(pg,"E().val('%s')"%I['kl'])==0
                await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(200)
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            async def txt(k):return (await pg.inner_text('.ue[data-id="%s"] .w-mit'%I['ids'][k])).replace('\n',' | ')
            async def bar():return await pg.evaluate("parseFloat(document.querySelector('.ue[data-id=\"%s\"] .mtr>i').style.width)"%I['ids']['palkki'])
            assert await txt('luku')=='Aika | 0:00',await txt('luku')
            await pg.click('.ue[data-id="%s"] button'%I['go']);await pg.wait_for_timeout(700);b1=await bar()
            await pg.wait_for_timeout(1500);b2=await bar()
            print(W,'palkki elää:',b1,'→',b2,'|',await txt('luku'),'|',await txt('rengas'),'|',await txt('kaari'),'|',await txt('pisteet'))
            assert 3<b1<b2<40,(b1,b2)
            assert await txt('luku')=='Aika | 0:02',await txt('luku')
            assert (await txt('rengas')).endswith('%')
            fills=await pg.locator('.ue[data-id="%s"] .mps span:not(.e)'%I['ids']['pisteet']).count();assert fills==2,fills
            assert await pg.locator('.ue[data-id="%s"] .mfi'%I['ids']['rengas']).count()==1
            await pg.screenshot(path='appiappi9_monitori_kay_%d.png'%W)
            await pg.click('.ue[data-id="%s"] button'%I['st']);await pg.wait_for_timeout(200);s1=await bar();await pg.wait_for_timeout(600);s2=await bar()
            assert s1==s2,'pysäytetty ei elä %s %s'%(s1,s2)
            print(W,'errs',errs);assert not errs;await b.close()
asyncio.run(main())
