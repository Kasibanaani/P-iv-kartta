# Jonon 1w (linjakkuuskartoitus 12): S2 lukukenttä punertuu ja neuvoo nuoleen tai Aseta-toimintoon, kun siihen kirjoitetaan muuta
# kuin luku (arvo ennallaan); S3 syvyysvaroitus kerrosrivillä Laattakartalle ja palikan Oma syvyys -kentän alla.
# Tietokone 1440 ja 1280 px, 390 px savutestinä. Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,V=P.views[0];V.laite='puhelin';var v=V.id;V.kr=[{id:'k1',n:'Tausta',sy:300},{id:'pohja',n:'Pohja'}];
 function U(k,o,x,y,w,h,nm){o.v=v;var b=KK.addBlock(P,k,o);b.x=x;b.y=y;b.w=w;b.h=h;KK.setName(P,b.id,nm);return b;}
 var a=U('alue',{},0,0,360,600,'Maailma');a.pv=2000;var h=U('muoto',{laji:'laatikko'},150,420,40,40,'Pelaaja');
 var k=KK.addBlock(P,'laatat',{v:v,kr:'k1'});k.x=0;k.y=500;k.lw=4;k.lh2=1;k.rk=32;k.lj=[{c:'1',n:'Seinä',hue:0,t:'kiintea'},{c:'2',n:'Koriste',hue:4,t:'lapi'}];k.lrt=['2222'];KK.setName(P,k.id,'Kartta');
 var e=U('muoto',{laji:'laatikko'},250,300,40,40,'Kivi');e.este=true;
 var l=KK.addBlock(P,'liike',{o:h.id});KK.setName(P,l.id,'Hahmon liike');KK.addNode(P,l.id,300,0);
 KK.repair(P);APP.S.sel=null;APP.S.multi=[];APP.renderAll();return {h:h.id,k:k.id,e:e.id,l:l.id};})()"""
SEL="(i)=>{APP.S.tab='nakyma';APP.S.sel={t:'b',id:i};APP.S.multi=[];APP.renderAll();}"
NOSEL="(()=>{APP.S.sel=null;APP.S.multi=[];APP.renderAll();})()"
async def main():
    async with async_playwright() as p:
        for W in (1440,1280,390):
            b,pg,errs=await avaa(p,W,900 if W>500 else 844)
            await pg.fill('#wname','Korjaukset');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(200)
            # S3 kerrosrivi: pelkkä läpi-laji ei ole este; kiinteä laji syvässä kerroksessa → varoitus
            tx=await pg.inner_text('#insp');assert 'Este on eri syvyydellä' not in tx,'läpi-laji ei ole este'
            await pg.evaluate("(i)=>{APP.P.b[i].lrt=['1111'];KK.repair(APP.P);APP.renderAll();}",I['k']);await pg.wait_for_timeout(120)
            tx=await pg.inner_text('#insp');assert 'Este on eri syvyydellä kuin ”Pelaaja”' in tx,'laattakartan varoitus kerrosrivillä'
            # S3 paneeli: Este-palikka pohjakerroksessa, Oma syvyys 300 → varoitus kentän alla; sama syvyys → ei
            await pg.evaluate(SEL,I['e']);await pg.wait_for_timeout(150);assert await pg.locator('#syvaro').count()==0,'sama syvyys'
            await pg.fill('#insp input[data-k="sy"]','300');await pg.press('#insp input[data-k="sy"]','Tab');await pg.wait_for_timeout(150)
            assert await P(pg,"P.b['%s'].sy"%I['e'])==300
            await pg.evaluate(SEL,I['e']);await pg.wait_for_timeout(150)
            assert 'Este on eri syvyydellä kuin ”Pelaaja”' in await pg.inner_text('#syvaro'),'esteen paneeli'
            await pg.evaluate(SEL,I['h']);await pg.wait_for_timeout(150)
            assert 'Este ”Kartta” on eri syvyydellä kuin tämä palikka' in await pg.inner_text('#syvaro'),'liikkujan paneeli'
            await pg.evaluate("(I)=>{APP.P.b[I.h].sy=300;KK.repair(APP.P);}",I);await pg.evaluate(SEL,I['h']);await pg.wait_for_timeout(150)
            assert await pg.locator('#syvaro').count()==0,'liikkuja samalla syvyydellä'
            # S2: Hypyn korkeus @x → punainen + ohje, arvo ennallaan; luku tallentuu ja ohje katoaa
            await pg.evaluate(SEL,I['l']);await pg.wait_for_timeout(150)
            await pg.evaluate("(()=>{var d=document.querySelector('#hysec');if(d)d.open=true;})()")
            f='#insp input[data-k="hyk"]';await pg.fill(f,'120');await pg.wait_for_timeout(100);assert await P(pg,"P.b['%s'].hyk"%I['l'])==120
            await pg.fill(f,'@x');await pg.wait_for_timeout(100)
            assert await pg.evaluate("(s)=>document.querySelector(s).classList.contains('bad')",f),'punainen'
            vh=await pg.inner_text('#insp [data-numvihje]');print(W,vh)
            assert vh=='Tähän vain luku. Viitteen tai laskun saat nuolella kohtaan ”hyppy” tai Aseta-toiminnolla.',vh
            assert await P(pg,"P.b['%s'].hyk"%I['l'])==120,'arvo ennallaan'
            await pg.fill(f,'90');await pg.wait_for_timeout(100);assert await P(pg,"P.b['%s'].hyk"%I['l'])==90
            assert await pg.locator('#insp [data-numvihje]').count()==0 and not await pg.evaluate("(s)=>document.querySelector(s).classList.contains('bad')",f)
            # Alueen Painovoima samoin
            await pg.evaluate(SEL,I['k']);await pg.wait_for_timeout(100)
            al=await pg.evaluate("(()=>Object.values(APP.P.b).filter(b=>b.nm==='Maailma')[0].id)()");await pg.evaluate(SEL,al);await pg.wait_for_timeout(150)
            await pg.evaluate("(()=>{document.querySelectorAll('#insp details').forEach(d=>d.open=true);})()")
            g='#insp input[data-k="pv"]';await pg.fill(g,'@pelaaja.y');await pg.wait_for_timeout(100)
            assert 'kohtaan ”painovoima”' in await pg.inner_text('#insp [data-numvihje]');assert await P(pg,"P.b['%s'].pv"%al)==2000
            await pg.screenshot(path='selain_korjaukset_1w_%d.png'%W)
            print(W,'ok','errs',errs);assert not errs;await b.close()
asyncio.run(main())
