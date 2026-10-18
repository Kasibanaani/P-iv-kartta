# Jonon 16 (F35 vaihe A): Alueen osio Painovoima (suljettu ilman painovoimaa, auki kun annettu), suunta ja ilmanvastus,
# Liikkeen osio Painovoima (painovoima %, nyt maassa / ilmassa), lukittuna hahmo putoaa lattialle ja on maassa, tallennus
# säilyy. Tietokone 1440 ja 1280 px, 390 px savutestinä. Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0].id;
 function U(k,o,x,y,w,h,nm){var b=KK.addBlock(P,k,o);b.x=x;b.y=y;b.w=w;b.h=h;KK.setName(P,b.id,nm);return b;}
 var a=U('alue',{v:v},0,0,360,600,'Maailma'),f=U('muoto',{v:v,laji:'laatikko'},0,500,360,40,'Lattia'),h=U('muoto',{v:v,laji:'laatikko'},150,40,40,40,'Pelaaja');
 f.este=true;h.este=true;var l=KK.addBlock(P,'liike',{o:h.id});KK.setName(P,l.id,'Hahmon liike');KK.addNode(P,l.id,0,0);
 KK.repair(P);APP.renderAll();return {a:a.id,f:f.id,h:h.id,l:l.id};})()"""
SEL="(i)=>{APP.S.sel={t:'b',id:i};APP.S.multi=[];APP.renderAll();}"
async def main():
    async with async_playwright() as p:
        for W in (1440,1280,390):
            b,pg,errs=await avaa(p,W,900 if W>500 else 844)
            await pg.fill('#wname','Painovoima');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(200)
            if W>500:
                # 1 Alueen osio Painovoima: suljettu ilman painovoimaa
                await pg.evaluate(SEL,I['a']);await pg.wait_for_timeout(150)
                assert await pg.locator('#pvsec').count()==1,'Alueella osio Painovoima'
                assert not await pg.evaluate("document.querySelector('#pvsec').open"),'suljettu, kun painovoimaa ei ole'
                assert await pg.locator('#insp [data-k="pvk"]').count()==0
                await pg.evaluate("document.querySelector('#pvsec').open=true");await pg.wait_for_timeout(100)
                await pg.fill('#insp input[data-k="pv"]','2000');await pg.wait_for_timeout(200)
                assert await P(pg,"P.b['%s'].pv"%I['a'])==2000
                await pg.evaluate("document.activeElement&&document.activeElement.blur()");await pg.evaluate(SEL,I['a']);await pg.wait_for_timeout(150)
                assert await pg.evaluate("document.querySelector('#pvsec').open"),'auki, kun painovoima on annettu'
                txt=await pg.inner_text('#pvsec')
                assert 'putoaa 100 px 0,32 s:ssa' in txt,txt
                await pg.click('#pvsec [data-seg="pvs"][data-v="ylos"]');await pg.wait_for_timeout(150)
                assert await P(pg,"P.b['%s'].pvs"%I['a'])=='ylos'
                await pg.click('#pvsec [data-seg="pvs"][data-v="alas"]');await pg.wait_for_timeout(150)
                await pg.fill('#insp input[data-k="ilv"]','0');await pg.wait_for_timeout(150)
                await pg.screenshot(path='painovoima_alue_%d.png'%W)
                # 2 Liikkeen osio Painovoima
                await pg.evaluate(SEL,I['l']);await pg.wait_for_timeout(150)
                assert await pg.input_value('#insp input[data-k="pvk"]')=='100','Liikkeen painovoima % oletus 100'
                assert 'ilmassa tai ei painovoimaa' in await pg.inner_text('#insp')
            else:
                await pg.evaluate("(i)=>{APP.P.b[i].pv=2000;KK.repair(APP.P);APP.renderAll();}",I['a'])
            # 3 Lukittuna hahmo putoaa lattialle ja on maassa
            await pg.click('#lockbtn');await pg.wait_for_timeout(1500)
            st=await pg.evaluate("(I)=>{var E=KK.Ev(APP.P,APP.ctx());return [E.omiNum(I.h,'y',0),E.val(I.l,'maa'),E.val(I.l,'alla')];}",I)
            assert abs(st[0]-460)<0.01 and st[1] is True and st[2]=='Lattia',st
            top=await pg.evaluate("(i)=>document.querySelector('.ue[data-id=\"'+i+'\"]').getBoundingClientRect().bottom",I['h'])
            flo=await pg.evaluate("(i)=>document.querySelector('.ue[data-id=\"'+i+'\"]').getBoundingClientRect().top",I['f'])
            assert abs(top-flo)<1.5,('hahmo piirtyy lattian päälle',top,flo)
            await pg.screenshot(path='painovoima_maassa_%d.png'%W)
            if W<500:
                print(W,'ok (savutesti)','errs',errs);await b.close();continue
            await pg.click('#lockbtn');await pg.wait_for_timeout(200)
            await pg.evaluate(SEL,I['l']);await pg.wait_for_timeout(150)
            assert 'maassa (”Lattia”)' in await pg.inner_text('#insp'),await pg.inner_text('#insp')
            # 4 Tallennus säilyy
            await pg.evaluate("APP.saveNow()");await pg.reload();await pg.wait_for_timeout(400)
            assert await P(pg,"P.b['%s'].pv"%I['a'])==2000 and await P(pg,"P.b['%s'].pvs===undefined&&P.b['%s'].ilv===undefined"%(I['a'],I['a']))
            print(W,'ok','errs',errs);await b.close()
asyncio.run(main())
