# Appi-appi 16: kentän sidonta riviin (muokkauslomake) selaimessa. Tietokone 1440 ja 1280 (tumma), puhelin 390 ja 320
# (kosketus). Tietokone: ilman Tietotaulukkoa kentän paneelissa ei ole Arvo sarakkeesta -osiota; taulukon jälkeen on,
# ja napista ”＋ Rivi-palikka: valittu rivi” syntyy Rivi-palikka logiikkaan ja kenttä sitoutuu ensimmäiseen sarakkeeseen;
# muut kentät sidotaan valikosta. Ilman valittua riviä kentät ovat tyhjiä ja harmaita (muokatessa ja käytössä); painike
# Seuraava (Valitse rivi) täyttää lomakkeen, kirjoitus ja rastitus muuttavat valittua riviä, valinnan vaihto näyttää
# toisen rivin ja edellinen säilyy. Miksi? kertoo sidonnan. Rivi-palikan poisto: vaikutuslista ja ⚠ kentässä, Kumoa.
# Puhelin: lomake napautuksilla, ei vaakavieritystä. Kuvat appiappi16_*.png. Testit ajetaan tietokoneen Chromiumissa,
# eivät oikealla iPhonella.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
TAULU="""(function(){var P=APP.P;
 var t=KK.addBlock(P,'taulu',{nm:'Tehtävät'});var tn=KK.addNode(P,t.id,60,60);var c1=KK.addCol(t,'Nimi','teksti'),c2=KK.addCol(t,'Määrä','luku'),c3=KK.addCol(t,'Valmis','kylla');
 [['Pyykit','2',''],['Kauppa','5','kyllä'],['Posti','','']].forEach(function(x){var r=KK.tAddRow(P,t.id,false);KK.tEdit(P,t.id,false,r,c1.id,x[0]);if(x[1])KK.tEdit(P,t.id,false,r,c2.id,x[1]);if(x[2])KK.tEdit(P,t.id,false,r,c3.id,x[2]);});
 KK.repair(P);APP.renderAll();return {t:t.id,c1:c1.id,c2:c2.id,c3:c3.id,r:t.rv.map(function(r){return r.id;})};})()"""
# Painikkeet Seuraava ja Ei valintaa: Valitse rivi -toiminnot (seuraava, ei mitään)
NAPIT="""(a)=>{var P=APP.P,v=P.views[0].id;function nappi(tx,x,rs){var b=KK.addBlock(P,'nappi',{v:v,tx:tx,beh:'kerta'});b.x=x;b.y=a[1];b.w=a[2];b.h=44;var bn=KK.addNode(P,b.id,40,300+x);
   var t=KK.addBlock(P,'tee',{do:'valitserivi',o:a[0],rs:rs});var tn=KK.addNode(P,t.id,300,300+x);KK.addLink(P,bn.id,'e',tn.id,'e');return b.id;}
 var s=nappi('Seuraava',20,'seur'),e=nappi('Ei valintaa',30+a[2],'ei');KK.repair(P);APP.renderAll();return [s,e];}"""
async def insp(pg): return await pg.inner_text('#insp')
async def valitse(pg,id):
    await pg.evaluate("(i)=>{APP.S.sel={t:'b',id:i};APP.renderAll();}",id);await pg.wait_for_timeout(150)
async def rivit(pg,I): return await P(pg,"KK.tRows(P,'%s').map(r=>[r.a['%s']||'',r.a['%s']===undefined?null:r.a['%s'],!!r.a['%s']])"%(I['t'],I['c1'],I['c2'],I['c2'],I['c3']))
async def main():
    async with async_playwright() as p:
        for W,dark in ((1440,False),(1280,True)):
            b,pg,errs=await avaa(p,W,900,dark)
            await pg.fill('#wname','Lomake');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(150)
            box=await pg.locator('#uvp').bounding_box();X0=box['x'];Y0=box['y']
            # 1. Tekstikenttä paletista; ilman taulukkoa ei sidontaa
            await paletti(pg,'Tekstikenttä',X0+200,Y0+120)
            FN=await P(pg,"Object.values(P.b).filter(b=>b.k==='teksti').map(b=>b.id)[0]");assert FN
            await valitse(pg,FN);t=await insp(pg);assert 'Arvo sarakkeesta' not in t,'ilman taulukkoa ei sidontaa'
            I=await pg.evaluate(TAULU);await pg.wait_for_timeout(150)
            await valitse(pg,FN);t=await insp(pg);print(W,'1 paneeli:',[l for l in t.split('\n') if 'sarakkeesta' in l.lower() or 'Rivi-palikka' in l][:4])
            assert 'Arvo sarakkeesta' in t and 'Rivi-palikka: valittu rivi (Tehtävät)' in t,t
            # 2. Pikanappi: Rivi-palikka (valittu rivi) logiikkaan ja kenttä sidotuksi ensimmäiseen sarakkeeseen
            await pg.click('#insp [data-do="bindval"]');await pg.wait_for_timeout(200)
            RV=await P(pg,"Object.values(P.b).filter(b=>b.k==='trivi').map(b=>[b.id,b.ls,b.tt])");print(W,'2 rivi:',RV);assert len(RV)==1 and RV[0][1]=='val' and RV[0][2]==I['t'],RV
            RV=RV[0][0];assert await P(pg,"[P.b['%s'].trv,P.b['%s'].tsar]"%(FN,FN))==[RV,I['c1']]
            assert await P(pg,"P.lg.n.some(n=>n.p==='%s')"%RV),'Rivi-palikka logiikassa'
            t=await insp(pg);assert 'Rivi nyt\nei riviä' in t or 'Rivi nyt ei riviä' in t.replace('\n',' '),t;assert 'Rivi-palikka: valittu rivi' not in t
            # Lukukenttä ja valintaruutu sidotaan valikosta
            ids=await pg.evaluate("""()=>{var P=APP.P,v=P.views[0].id;var l=KK.addBlock(P,'luku',{v:v,tx:'Määrä'});l.x=200;l.y=200;var r=KK.addBlock(P,'ruutu',{v:v,tx:'Valmis'});r.x=200;r.y=300;
              var f=P.b[Object.values(P.b).filter(b=>b.k==='teksti')[0].id];f.x=200;f.y=100;KK.repair(P);APP.renderAll();return [l.id,r.id];}""");LU,RU=ids
            await valitse(pg,LU);opts=await pg.evaluate("[...document.querySelectorAll('#insp select[data-k=\"tsar\"] option')].map(o=>[o.value,o.textContent])");print(W,'2 valikko:',opts)
            assert ['',  'ei sidottu: kentän oma arvo'] in opts and [RV+'|'+I['c2'],'Valittu: Määrä (valittu rivi, Tehtävät)'] in opts,opts
            await pg.select_option('#insp select[data-k="tsar"]',RV+'|'+I['c2']);await pg.wait_for_timeout(150)
            await valitse(pg,RU);await pg.select_option('#insp select[data-k="tsar"]',RV+'|'+I['c3']);await pg.wait_for_timeout(150)
            assert await P(pg,"[P.b['%s'].trv,P.b['%s'].tsar,P.b['%s'].tsar]"%(LU,LU,RU))==[RV,I['c2'],I['c3']]
            S,EI=await pg.evaluate(NAPIT,[I['t'],420,140]);await pg.wait_for_timeout(150)
            # 3. Muokatessa ilman valittua riviä: harmaat (dim)
            dims=await pg.evaluate("(a)=>a.map(i=>document.querySelector('#uels > [data-id=\"'+i+'\"]').classList.contains('dim'))",[FN,LU,RU]);assert dims==[True,True,True],dims
            await pg.screenshot(path='appiappi16_muokkaus_%d.png'%W)
            # 4. Käytössä: tyhjät, harmaat ja lukitut; Seuraava täyttää lomakkeen
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            st=await pg.evaluate("(a)=>[document.querySelector('#uels [data-id=\"'+a[0]+'\"] input').value,document.querySelector('#uels [data-id=\"'+a[0]+'\"] input').disabled,document.querySelector('#uels [data-id=\"'+a[1]+'\"] input').value,document.querySelector('#uels [data-id=\"'+a[2]+'\"]').classList.contains('dim')]",[FN,LU,RU])
            print(W,'4 ei riviä:',st);assert st==['',True,'',True],st
            await pg.click('#uels [data-id="%s"] button'%S);await pg.wait_for_timeout(200)
            st=await pg.evaluate("(a)=>[document.querySelector('#uels [data-id=\"'+a[0]+'\"] input').value,document.querySelector('#uels [data-id=\"'+a[0]+'\"] input').disabled,document.querySelector('#uels [data-id=\"'+a[1]+'\"] input').value,!!document.querySelector('#uels [data-id=\"'+a[2]+'\"] .box.on')]",[FN,LU,RU])
            print(W,'4 rivi 1:',st);assert st==['Pyykit',False,'2',False],st
            # 5. Kirjoitus ja rastitus muuttavat valittua riviä
            await pg.fill('#uels [data-id="%s"] input'%FN,'Pyykit ja lakanat');await pg.wait_for_timeout(150)
            await pg.click('#uels [data-id="%s"] [data-act="inc"]'%LU);await pg.wait_for_timeout(150)
            await pg.click('#uels [data-id="%s"] [data-act="toggle"]'%RU);await pg.wait_for_timeout(150)
            rs=await rivit(pg,I);print(W,'5 rivit:',rs);assert rs==[['Pyykit ja lakanat',3,True],['Kauppa',5,True],['Posti',None,False]],rs
            assert await P(pg,"P.b['%s'].rv[0].a['%s']"%(I['t'],I['c1']))=='Pyykit','lähtöaineisto säilyy'
            # 6. Valinnan vaihto: toinen rivi, edellinen säilyy
            await pg.click('#uels [data-id="%s"] button'%S);await pg.wait_for_timeout(200)
            st=await pg.evaluate("(a)=>[document.querySelector('#uels [data-id=\"'+a[0]+'\"] input').value,document.querySelector('#uels [data-id=\"'+a[1]+'\"] input').value,!!document.querySelector('#uels [data-id=\"'+a[2]+'\"] .box.on')]",[FN,LU,RU])
            print(W,'6 rivi 2:',st);assert st==['Kauppa','5',True],st
            await pg.fill('#uels [data-id="%s"] input'%LU,'8');await pg.press('#uels [data-id="%s"] input'%LU,'Enter');await pg.wait_for_timeout(150)
            rs=await rivit(pg,I);assert rs[0][1]==3 and rs[1][1]==8,rs
            await pg.screenshot(path='appiappi16_kaytto_%d.png'%W)
            # Ei valintaa: takaisin tyhjäksi ja harmaaksi
            await pg.click('#uels [data-id="%s"] button'%EI);await pg.wait_for_timeout(200)
            st=await pg.evaluate("(a)=>[document.querySelector('#uels [data-id=\"'+a+'\"] input').value,document.querySelector('#uels [data-id=\"'+a+'\"] input').disabled]",FN);assert st==['',True],st
            # 7. Miksi? ja Rivi-palikan poisto (vaikutuslista, ⚠, Kumoa)
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            await valitse(pg,FN);ws=await pg.inner_text('#whysec') if await pg.locator('#whysec').count() else ''
            print(W,'7 miksi:',ws[:160].replace('\n',' | '));assert 'Arvo sarakkeesta ”Nimi”' in ws and 'Valittu' in ws,ws
            refs=await P(pg,"KK.refsTo(P,['%s']).filter(r=>r.how==='sidonta').length"%RV);assert refs==3,refs
            await pg.evaluate("(r)=>{APP.S.sel={t:'b',id:r};APP.renderAll();}",RV);await pg.wait_for_timeout(100)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(200)
            await pg.evaluate("(r)=>{APP.S.sel={t:'n',id:APP.P.lg.n.find(n=>n.p===r).id};APP.renderAll();}",RV);await pg.wait_for_timeout(100)
            await pg.keyboard.press('Delete');await pg.wait_for_timeout(250)
            dl=await pg.inner_text('body');print(W,'7 vaikutus:',[l for l in dl.split('\n') if 'sarakkeesta' in l][:3]);assert 'arvo sarakkeesta' in dl,'vaikutuslistassa sidonta'
            await pg.get_by_role('button',name='Poista silti').click();await pg.wait_for_timeout(250)
            assert await P(pg,"!P.b['%s']&&P.b['%s'].trv==='%s'"%(RV,FN,RV)),'viite jää'
            await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(200)
            err=await pg.evaluate("(i)=>document.querySelector('#uels > [data-id=\"'+i+'\"]').classList.contains('has-err')",FN);assert err,'⚠ kentässä'
            await pg.click('#undobtn');await pg.wait_for_timeout(250)
            assert await P(pg,"!!P.b['%s']&&!E().val('%s').err"%(RV,FN)),'Kumoa palauttaa'
            print(W,'errs',errs);assert not errs,errs
            await b.close()
        for W in (390,320):
            b=await p.chromium.launch();errs=[]
            ctx=await b.new_context(viewport={'width':W,'height':844},has_touch=True,is_mobile=True,reduced_motion='reduce')
            pg=await ctx.new_page();pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Puhelin');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(TAULU)
            F=await pg.evaluate("""(a)=>{var P=APP.P,v=P.views[0].id,w=a[1]-40;var r=KK.addBlock(P,'trivi',{nm:'Valittu',tt:a[0].t,ls:'val'});KK.addNode(P,r.id,40,200);
              function k(laji,tx,y,c){var b=KK.addBlock(P,laji,{v:v,tx:tx});b.x=20;b.y=y;b.w=w;b.trv=r.id;b.tsar=c;return b.id;}
              var f=[k('teksti','Nimi',20,a[0].c1),k('luku','Määrä',120,a[0].c2),k('ruutu','Valmis',220,a[0].c3)];KK.repair(P);APP.renderAll();return f;}""",[I,W])
            S,EI=await pg.evaluate(NAPIT,[I['t'],320,(W-50)//2])
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            assert await pg.evaluate("(i)=>document.querySelector('#uels [data-id=\"'+i+'\"] input').disabled",F[0])
            await pg.tap('#uels [data-id="%s"] button'%S);await pg.wait_for_timeout(200)
            await pg.tap('#uels [data-id="%s"] button'%S);await pg.wait_for_timeout(200)
            v=await pg.evaluate("(i)=>document.querySelector('#uels [data-id=\"'+i+'\"] input').value",F[0]);assert v=='Kauppa',v
            await pg.tap('#uels [data-id="%s"] [data-act="toggle"]'%F[2]);await pg.wait_for_timeout(200)
            await pg.tap('#uels [data-id="%s"] [data-act="inc"]'%F[1]);await pg.wait_for_timeout(200)
            await pg.tap('#uels [data-id="%s"] input'%F[0]);await pg.fill('#uels [data-id="%s"] input'%F[0],'Kauppa ja apteekki');await pg.wait_for_timeout(200)
            rs=await rivit(pg,I);print(W,'8 rivit:',rs);assert rs==[['Pyykit',2,False],['Kauppa ja apteekki',6,False],['Posti',None,False]],rs
            sw=await pg.evaluate("document.documentElement.scrollWidth");assert sw<=W,('ei vaakavieritystä',sw)
            await pg.screenshot(path='appiappi16_puhelin_%d.png'%W)
            print(W,'errs',errs);assert not errs,errs
            await b.close()
asyncio.run(main())
