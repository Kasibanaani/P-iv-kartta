# Lomake (jatkoa P3b:lle): tavallinen kenttä sidottuna Rivi-palikkaan ja sarakkeeseen. Tietokone 1440 ja 1280 (tumma),
# puhelin 390 ja 320 (kosketus). Tietokone: kentän paneelissa osio Rivin sarake vasta, kun on Tietotaulukko; nappi
# ＋ Rivi-palikka valittuun riviin tekee Rivi-palikan ja sitoo kentän, sarake valitaan; toinen kenttä sidotaan samaan
# Rivi-palikkaan valikosta. Käytössä ilman valittua riviä kentät ovat tyhjiä ja harmaita (ei käytettävissä), kortin
# Valitse-painike valitsee rivin ja kentät näyttävät sen, kirjoitus kenttään muuttaa riviä ja kortti näyttää muutoksen,
# valitun rivin poisto harmaannuttaa kentät. Puhelin: Seuraava-painike + sidottu lukukenttä, + ja − kirjoittavat riville.
# Kuvat appiappi16_*.png. Testit ajetaan tietokoneen Chromiumissa, eivät oikealla iPhonella.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0].id;
 var t=KK.addBlock(P,'taulu',{nm:'Tuotteet'});var tn=KK.addNode(P,t.id,60,60);var c1=KK.addCol(t,'Nimi','teksti'),c2=KK.addCol(t,'Määrä','luku');
 [['Maito','2'],['Leipä','0'],['Juusto','5']].forEach(function(x){var r=KK.tAddRow(P,t.id,false);KK.tEdit(P,t.id,false,r,c1.id,x[0]);KK.tEdit(P,t.id,false,r,c2.id,x[1]);});
 var k=KK.addBlock(P,'trivi',{nm:'Kohde',tt:t.id});KK.addNode(P,k.id,60,220);
 var T=KK.addBlock(P,'toistin',{v:v,kh:56,vali:6});T.x=40;T.y=40;T.w=300;T.h=200;var Tn=KK.addNode(P,T.id,320,60);KK.addLink(P,tn.id,'rj',Tn.id,'rv');
 var tx=KK.addBlock(P,'nayta',{v:v,tx:''});tx.x=46;tx.y=48;tx.w=170;tx.h=40;tx.tx=KK.toIds(P,'{kohde.nimi}: {kohde.määrä}');
 var bt=KK.addBlock(P,'nappi',{v:v,tx:'Valitse',beh:'kerta'});bt.x=226;bt.y=46;bt.w=100;bt.h=44;var bn=KK.addNode(P,bt.id,60,360);
 KK.tstAssign(P,[tx.id,bt.id]);
 var vr=KK.addBlock(P,'tee',{do:'valitserivi',o:t.id,rs:'tap'});var vn=KK.addNode(P,vr.id,300,360);KK.addLink(P,bn.id,'e',vn.id,'e');
 var lu=KK.addBlock(P,'luku',{v:v,tx:'Määrä'});lu.x=400;lu.y=40;lu.w=200;lu.h=80;
 var te=KK.addBlock(P,'teksti',{v:v,tx:'Nimi'});te.x=400;te.y=140;te.w=200;te.h=80;
 KK.repair(P);APP.renderAll();return {t:t.id,T:T.id,tx:tx.id,bt:bt.id,lu:lu.id,te:te.id,c1:c1.id,c2:c2.id};})()"""
async def insp(pg): return await pg.inner_text('#insp')
async def main():
    async with async_playwright() as p:
        for W,dark in ((1440,False),(1280,True)):
            b,pg,errs=await avaa(p,W,900,dark)
            await pg.fill('#wname','Lomake');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(150)
            # 0. Ilman taulukkoa kentän paneelissa ei ole rivin sidontaa
            L0=await pg.evaluate("(function(){var P=APP.P;var l=KK.addBlock(P,'luku',{v:P.views[0].id});l.x=700;l.y=400;APP.S.sel={t:'b',id:l.id};APP.renderAll();return l.id;})()");await pg.wait_for_timeout(150)
            t=await insp(pg);assert 'RIVIN SARAKE' not in t.upper(),'peruskäyttö ilman taulukkoa'
            await pg.evaluate("(l)=>{KK.removeBlock(APP.P,l);APP.S.sel=null;APP.renderAll();}",L0)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            # 1. Lukukenttä: osio Rivin sarake, nappi tekee Rivi-palikan (valittu rivi), sarake valikosta
            await pg.evaluate("(l)=>{APP.S.sel={t:'b',id:l};APP.renderAll();}",I['lu']);await pg.wait_for_timeout(150)
            t=await insp(pg);assert 'RIVIN SARAKE' in t.upper() and 'ei sidottu' in t,t
            await pg.click('#insp [data-do="trvuusi"]');await pg.wait_for_timeout(200)
            V=await P(pg,"P.b['%s'].trv"%I['lu']);assert V and await P(pg,"[P.b['%s'].k,P.b['%s'].ls,P.b['%s'].tt]"%(V,V,V))==['trivi','val',I['t']]
            assert await pg.locator('#insp [data-do="trvuusi"]').count()==0
            await pg.select_option('#insp select[data-k="tsar"]',I['c2']);await pg.wait_for_timeout(150)
            assert await P(pg,"P.b['%s'].tsar"%I['lu'])==I['c2']
            t=await insp(pg);print(W,'1 paneeli:',[l for l in t.split('\n') if 'Rivi' in l][:4]);assert 'ei riviä' in t,t
            # Muokatessa kenttä näkyy harmaana (ei valittua riviä)
            assert 'dim' in await pg.get_attribute('#uels > [data-id="%s"]'%I['lu'],'class')
            # 2. Tekstikenttä samaan Rivi-palikkaan valikosta
            await pg.evaluate("(l)=>{APP.S.sel={t:'b',id:l};APP.renderAll();}",I['te']);await pg.wait_for_timeout(150)
            await pg.select_option('#insp select[data-k="trv"]',V);await pg.wait_for_timeout(150)
            await pg.select_option('#insp select[data-k="tsar"]',I['c1']);await pg.wait_for_timeout(150)
            assert await P(pg,"[P.b['%s'].trv,P.b['%s'].tsar]"%(I['te'],I['te']))==[V,I['c1']]
            # Kortin painikkeen paneelissa ei sidontaa, kortin kentässä Rivi: kortin rivi
            await pg.screenshot(path='appiappi16_muokkaus_%d.png'%W)
            # 3. Käytössä ilman valittua riviä: tyhjät ja harmaat, ei käytettävissä
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            LU='#uels > [data-id="%s"]'%I['lu'];TE='#uels > [data-id="%s"]'%I['te']
            st=await pg.evaluate("(s)=>s.map(x=>{var e=document.querySelector(x),i=e.querySelector('input');return [e.classList.contains('dim'),i.disabled,i.value];})",[LU,TE]);print(W,'3 ei riviä:',st)
            assert st==[[True,True,''],[True,True,'']],st
            # 4. Kortin Valitse → rivi valittu, kentät näyttävät sen
            R=await pg.evaluate("[...document.querySelectorAll('#uels [data-id=\"%s\"] .tcard')].map(c=>c.getAttribute('data-row'))"%I['T']);assert len(R)==3,R
            def card(r,id): return '#uels .tcard[data-row="%s"] [data-id="%s"]'%(r,id)
            await pg.click(card(R[1],I['bt'])+' button');await pg.wait_for_timeout(200)
            assert await P(pg,"KK.tSel(P,'%s')"%I['t'])==R[1]
            st=await pg.evaluate("(s)=>s.map(x=>{var e=document.querySelector(x),i=e.querySelector('input');return [e.classList.contains('dim'),i.disabled,i.value];})",[LU,TE]);print(W,'4 valittu:',st)
            assert st==[[False,False,'0'],[False,False,'Leipä']],st
            # 5. Kirjoitus kenttiin muuttaa riviä; kortti näyttää saman
            await pg.fill(LU+' input','7');await pg.press(LU+' input','Enter');await pg.wait_for_timeout(200)
            await pg.click(LU+' [data-act="inc"]');await pg.wait_for_timeout(150)
            await pg.fill(TE+' input','Ruisleipä');await pg.wait_for_timeout(200)
            rows=await P(pg,"KK.tRows(P,'%s').map(r=>[r.a['%s'],r.a['%s']])"%(I['t'],I['c1'],I['c2']));print(W,'5 rivit:',rows);assert rows==[['Maito',2],['Ruisleipä',8],['Juusto',5]],rows
            ct=await pg.inner_text(card(R[1],I['tx']));assert 'Ruisleipä: 8' in ct,ct
            assert not await P(pg,"Object.keys(P.st).filter(k=>k==='%s'||k==='%s')"%(I['lu'],I['te'])),'kentillä ei omaa tilaa'
            # 6. Toinen kortti: kentät vaihtuvat
            await pg.click(card(R[2],I['bt'])+' button');await pg.wait_for_timeout(200)
            v=await pg.evaluate("(s)=>s.map(x=>document.querySelector(x+' input').value)",[LU,TE]);assert v==['5','Juusto'],v
            await pg.screenshot(path='appiappi16_kaytto_%d.png'%W)
            # 7. Valitun rivin poisto: harmaa ja tyhjä
            await pg.evaluate("(a)=>{KK.tDelRow(APP.P,a[0],true,a[1]);APP.renderAll();}",[I['t'],R[2]]);await pg.wait_for_timeout(200)
            st=await pg.evaluate("(s)=>s.map(x=>{var e=document.querySelector(x),i=e.querySelector('input');return [e.classList.contains('dim'),i.disabled,i.value];})",[LU,TE]);print(W,'7 poistettu:',st)
            assert st==[[True,True,''],[True,True,'']],st
            # 8. Tallennus ja uudelleenavaus: sidonta säilyy
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            q=await pg.evaluate("(a)=>{var Q=JSON.parse(JSON.stringify(APP.P));KK.repair(Q);return [Q.b[a[0]].trv,Q.b[a[0]].tsar,Q.b[a[1]].trv,KK.VER];}",[I['lu'],I['te']]);assert q==[V,I['c2'],V,10],q
            print(W,'errs',errs);assert not errs,errs
            await b.close()
        for W in (390,320):
            b=await p.chromium.launch();errs=[]
            ctx=await b.new_context(viewport={'width':W,'height':844},has_touch=True,is_mobile=True,reduced_motion='reduce')
            pg=await ctx.new_page();pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Puhelin');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate("""(function(){var P=APP.P,v=P.views[0].id;
              var t=KK.addBlock(P,'taulu',{nm:'Ostokset'});KK.addNode(P,t.id,40,40);var c1=KK.addCol(t,'Nimi','teksti'),c2=KK.addCol(t,'Kpl','luku');
              [['Maito','2'],['Leipä','1']].forEach(function(x){var r=KK.tAddRow(P,t.id,false);KK.tEdit(P,t.id,false,r,c1.id,x[0]);KK.tEdit(P,t.id,false,r,c2.id,x[1]);});
              var V=KK.addBlock(P,'trivi',{nm:'Valinta',tt:t.id,ls:'val'});KK.addNode(P,V.id,40,160);
              var bt=KK.addBlock(P,'nappi',{v:v,tx:'Seuraava',beh:'kerta'});bt.x=16;bt.y=16;bt.w=W0-32;bt.h=48;var bn=KK.addNode(P,bt.id,40,300);
              var vr=KK.addBlock(P,'tee',{do:'valitserivi',o:t.id,rs:'seur',kierto:true});var vn=KK.addNode(P,vr.id,260,300);KK.addLink(P,bn.id,'e',vn.id,'e');
              var nm=KK.addBlock(P,'teksti',{v:v,tx:'Nimi'});nm.x=16;nm.y=80;nm.w=W0-32;nm.h=80;nm.trv=V.id;nm.tsar=c1.id;
              var lu=KK.addBlock(P,'luku',{v:v,tx:'Kpl'});lu.x=16;lu.y=176;lu.w=W0-32;lu.h=80;lu.trv=V.id;lu.tsar=c2.id;
              KK.repair(P);APP.renderAll();return {t:t.id,bt:bt.id,nm:nm.id,lu:lu.id,c2:c2.id};})()""".replace('W0',str(W)))
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            LU='#uels > [data-id="%s"]'%I['lu'];NM='#uels > [data-id="%s"]'%I['nm']
            assert await pg.evaluate("(s)=>document.querySelector(s+' input').disabled",LU),'ilman riviä harmaa'
            await pg.tap('#uels > [data-id="%s"] button'%I['bt']);await pg.wait_for_timeout(200)
            v=await pg.evaluate("(s)=>s.map(x=>document.querySelector(x+' input').value)",[NM,LU]);print(W,'9 eka:',v);assert v==['Maito','2'],v
            await pg.tap(LU+' [data-act="inc"]');await pg.wait_for_timeout(200)
            await pg.tap('#uels > [data-id="%s"] button'%I['bt']);await pg.wait_for_timeout(200)
            v=await pg.evaluate("(s)=>s.map(x=>document.querySelector(x+' input').value)",[NM,LU]);assert v==['Leipä','1'],v
            await pg.tap(LU+' [data-act="dec"]');await pg.wait_for_timeout(200)
            m=await P(pg,"KK.tRows(P,'%s').map(r=>r.a['%s'])"%(I['t'],I['c2']));print(W,'9 kpl:',m);assert m==[3,0],m
            sw=await pg.evaluate("document.documentElement.scrollWidth");assert sw<=W,('ei vaakavieritystä',sw)
            await pg.screenshot(path='appiappi16_puhelin_%d.png'%W)
            print(W,'errs',errs);assert not errs,errs
            await b.close()
asyncio.run(main())
