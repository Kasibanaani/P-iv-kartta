# Jonon 14c (F38 kohta 6): Muodon kulmat. Vanha Laatikko, Kehys ja Lappu näyttävät täsmälleen samalta (16 px; Lappu
# 3/3/18/3). Paneelin Kulmat (px): 0 = terävä, iso = pyöreä, Lappu skaalautuu samassa suhteessa, Ympyrällä ja Pillerillä
# ei kenttää. Kumoa palauttaa, tallennus säilyy uudelleenlatauksessa, Ulkoasun kopiointi vie kulmat. Lukittuna Säädin
# ohjaa muoto.kulmat-kohtaa kaavan kautta. Tietokone 1440 ja 1280 px, 390 px savutestinä. Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0].id;
 function U(k,o,x,y,w,h,nm){var b=KK.addBlock(P,k,o);b.x=x;b.y=y;b.w=w;b.h=h;KK.setName(P,b.id,nm);return b;}
 var a=U('muoto',{v:v,laji:'laatikko',tx:'A'},20,20,160,90,'Laatikko'),l=U('muoto',{v:v,laji:'lappu',tx:'L'},200,20,160,90,'Lappu'),
  k=U('muoto',{v:v,laji:'kehys',tx:'K'},20,130,160,90,'Kehys'),y=U('muoto',{v:v,laji:'ympyra',tx:'Y'},200,130,90,90,'Pallo'),
  b=U('muoto',{v:v,laji:'laatikko',tx:'B'},20,240,160,90,'Toinen');
 KK.repair(P);APP.renderAll();return {a:a.id,l:l.id,k:k.id,y:y.id,b:b.id,v:v};})()"""
RAD="""(i)=>{var e=document.querySelector('.ue[data-id="'+i+'"] .w-shape'),c=getComputedStyle(e);return [c.borderTopLeftRadius,c.borderTopRightRadius,c.borderBottomRightRadius,c.borderBottomLeftRadius].join(' ');}"""
async def main():
    async with async_playwright() as p:
        for W in (1440,1280,390):
            b,pg,errs=await avaa(p,W,900 if W>500 else 844)
            await pg.fill('#wname','Kulmat');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(200)
            r=lambda k:pg.evaluate(RAD,I[k])
            # 1 vanhat ennallaan
            assert await r('a')=='16px 16px 16px 16px',await r('a')
            assert await r('k')=='16px 16px 16px 16px',await r('k')
            assert await r('l')=='3px 3px 18px 3px',await r('l')
            assert await r('y')=='50% 50% 50% 50%',await r('y')
            assert await pg.evaluate("Object.values(APP.P.b).every(b=>b.kpy===undefined)")
            await pg.screenshot(path='kulmat_vanha_%d.png'%W)
            if W<500:
                print(W,'ok (savutesti)','errs',errs);await b.close();continue
            # 2 paneeli: Kulmat-kenttä, 0 ja iso luku
            await pg.evaluate("(i)=>{APP.S.sel={t:'b',id:i};APP.S.multi=[];APP.renderAll();}",I['a']);await pg.wait_for_timeout(150)
            f='#insp input[data-k="kpy"]'
            assert await pg.input_value(f)=='16'
            await pg.fill(f,'0');await pg.wait_for_timeout(150)
            assert await P(pg,"P.b['%s'].kpy"%I['a'])==0 and await r('a')=='0px 0px 0px 0px'
            await pg.fill(f,'40');await pg.wait_for_timeout(150);assert await r('a')=='40px 40px 40px 40px'
            await pg.fill(f,'16');await pg.wait_for_timeout(150)
            assert await P(pg,"P.b['%s'].kpy===undefined"%I['a']),'16 = oletus, ei kenttää'
            await pg.fill(f,'30');await pg.wait_for_timeout(150)
            # 3 Kumoa palauttaa ennen muokkausta olleen
            await pg.evaluate("document.activeElement&&document.activeElement.blur()")
            await pg.keyboard.press('Control+z');await pg.wait_for_timeout(200)
            assert await r('a')=='16px 16px 16px 16px',('kumoa',await r('a'))
            await pg.keyboard.press('Control+Shift+z');await pg.wait_for_timeout(200)
            if await r('a')!='30px 30px 30px 30px':
                await pg.evaluate("(i)=>{APP.S.sel={t:'b',id:i};APP.renderAll();}",I['a']);await pg.fill(f,'30');await pg.wait_for_timeout(150)
            assert await r('a')=='30px 30px 30px 30px'
            # 4 Lappu samassa suhteessa, Ympyrällä ei kenttää
            await pg.evaluate("(i)=>{APP.S.sel={t:'b',id:i};APP.S.multi=[];APP.renderAll();}",I['l']);await pg.wait_for_timeout(150)
            await pg.fill(f,'32');await pg.wait_for_timeout(150);assert await r('l')=='6px 6px 36px 6px',await r('l')
            await pg.evaluate("(i)=>{APP.S.sel={t:'b',id:i};APP.S.multi=[];APP.renderAll();}",I['y']);await pg.wait_for_timeout(150)
            assert await pg.locator(f).count()==0,'ympyrällä ei kulmia'
            # 5 Ulkoasun kopiointi vie kulmat samalle lajille
            await pg.evaluate("(i)=>{APP.S.sel={t:'b',id:i};APP.S.multi=[];APP.renderAll();}",I['a']);await pg.wait_for_timeout(150)
            await pg.click('#insp [data-look="copy"]');await pg.wait_for_timeout(100)
            await pg.evaluate("(i)=>{APP.S.sel={t:'b',id:i};APP.S.multi=[];APP.renderAll();}",I['b']);await pg.wait_for_timeout(150)
            await pg.click('#insp [data-look="paste"]');await pg.wait_for_timeout(150)
            assert await P(pg,"P.b['%s'].kpy"%I['b'])==30 and await r('b')=='30px 30px 30px 30px'
            # 6 tallennus säilyy
            await pg.evaluate("APP.saveNow()");await pg.reload();await pg.wait_for_timeout(400)
            assert await r('a')=='30px 30px 30px 30px' and await r('l')=='6px 6px 36px 6px' and await r('k')=='16px 16px 16px 16px'
            # 7 Säädin ohjaa muoto.kulmat lukittuna
            await pg.evaluate("""(I)=>{var P=APP.P,s=KK.addBlock(P,'saadin',{v:I.v,min:0,max:100,start:10});s.x=20;s.y=360;s.w=240;s.h=60;KK.setName(P,s.id,'Pyöreys');
             KK.addNode(P,s.id,0,0);var a=P.b[I.a];a.ohk=['kulmat'];var k=KK.addBlock(P,'kaava',{});k.f=KK.kaavaToIds(P,'pyöreys * 2');var kn=KK.addNode(P,k.id,200,0);
             var an=KK.nodesOfBlock(P,a.id)[0]||KK.addNode(P,a.id,400,0);KK.addLink(P,kn.id,'v',an.id,'o_kulmat');KK.repair(P);APP.renderAll();}""",I)
            await pg.wait_for_timeout(150)
            assert await r('a')=='30px 30px 30px 30px','muokatessa perusarvo'
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            assert await r('a')=='20px 20px 20px 20px',('lukittuna ohjattu',await r('a'))
            await pg.evaluate("(i)=>{KK.userSet(APP.P,i,45,APP.ctx());APP.renderAll();}",await P(pg,"B('Pyöreys').id"));await pg.wait_for_timeout(200)
            assert await r('a')=='90px 90px 90px 90px',await r('a')
            await pg.screenshot(path='kulmat_ohjattu_%d.png'%W)
            print(W,'ok','errs',errs);await b.close()
asyncio.run(main())
