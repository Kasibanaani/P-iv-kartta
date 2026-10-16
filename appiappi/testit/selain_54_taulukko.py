# P2: tietotaulukko, tapahtuman tiedot ja puuttuva tieto selaimessa. Tietokone 1440 ja 1280 (tumma), puhelin 390 ja 320 (kosketus).
# Paneeli: ＋ Sarake, nimi ja laji, viite kaavaan; taulukkoikkuna: ＋ Rivi, kentät lajin mukaan, väärä arvo punaisena eikä
# kirjoitettu, tyhjä = puuttuva; Koosteet-osio (täytetty, puuttuu, summa, keskiarvo); kaavan ehdotukset taulukon poluille ja
# tallennus sarakkeen tunnisteella; Lisää rivi -toiminnon kenttäkaavat, käyttötieto erillään lähtöaineistosta; Tapahtuman tiedot
# -paneeli; Valitse rivi -valinnat. Puhelin: lukitussa näkymässä painike valitsee seuraavan rivin, teksti näyttää valitun rivin
# kentät; taulukkoikkuna mahtuu ruutuun (vaakavieritys vain taulukon sisällä). Kuvat appiappi13_*.png.
# Testit ajetaan tietokoneen Chromiumissa, eivät oikealla iPhonella.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P;
 var t=KK.addBlock(P,'taulu',{nm:'Ostokset'});var tn=KK.addNode(P,t.id,60,60);
 var tp=KK.addBlock(P,'tapaht',{nm:'Tapahtuma'});var pn=KK.addNode(P,tp.id,60,260);
 KK.repair(P);APP.renderAll();return {t:t.id,tn:tn.id,tp:tp.id,pn:pn.id};})()"""
async def valitse(pg,nid):
    await pg.evaluate("(n)=>{APP.S.sel={t:'n',id:n};APP.S.multi=[];APP.renderAll();}",nid);await pg.wait_for_timeout(150)
async def insp(pg): return await pg.inner_text('#insp')
async def kirjoita(pg,sel,txt):
    await pg.click(sel);await pg.fill(sel,txt);await pg.wait_for_timeout(80)
async def main():
    async with async_playwright() as p:
        for W,dark in ((1440,False),(1280,True)):
            b,pg,errs=await avaa(p,W,900,dark)
            await pg.fill('#wname','Taulukko');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(200)
            # 1. Paneeli: sarakkeet
            await valitse(pg,I['tn']);t=await insp(pg);assert 'SARAKKEET' in t and '＋ Sarake' in t
            await pg.click('#insp [data-tdo="addcol"]');await pg.wait_for_timeout(150)
            await kirjoita(pg,'#insp [data-k="tc_c1_nm"]','Nimi')
            await pg.click('#insp [data-tdo="addcol"]');await pg.wait_for_timeout(150)
            await kirjoita(pg,'#insp [data-k="tc_c2_nm"]','Määrä');await pg.select_option('#insp [data-k="tc_c2_laji"]','luku');await pg.wait_for_timeout(150)
            sar=await P(pg,"P.b['%s'].sar.map(c=>[c.id,c.nm,c.vt,c.laji])"%I['t']);print(W,'1 sarakkeet:',sar)
            assert sar==[['c1','Nimi','nimi','teksti'],['c2','Määrä','määrä','luku']]
            t=await insp(pg);assert 'ostokset.valittu.määrä' in t and 'ostokset.määrä.summa' in t
            # 2. Taulukkoikkuna: rivit ja kentät
            await pg.click('#insp [data-tdo="open"]');await pg.wait_for_timeout(200)
            for i in range(3):
                await pg.click('#sheet [data-tdx="add"]');await pg.wait_for_timeout(120)
            async def solu(r,c,v):
                s='#sheet [data-tcell="%s|%s"]'%(r,c);await pg.click(s);await pg.fill(s,v);await pg.wait_for_timeout(100)
            await solu('r1','c1','Maito');await solu('r1','c2','0');await solu('r2','c1','Leipä');await solu('r2','c2','6');await solu('r3','c1','Juusto');await solu('r3','c2','-')
            bad=await pg.evaluate("document.querySelector('#sheet [data-tcell=\"r3|c2\"]').classList.contains('bad')");er=await pg.inner_text('#tderr');print(W,'2 väärä arvo:',bad,er)
            assert bad and 'ei ole luku' in er and 'ei kirjoitettu' in er
            await solu('r3','c2','')
            rv=await P(pg,"P.b['%s'].rv"%I['t']);print(W,'2 rivit:',rv)
            assert rv==[{'id':'r1','a':{'c1':'Maito','c2':0}},{'id':'r2','a':{'c1':'Leipä','c2':6}},{'id':'r3','a':{'c1':'Juusto'}}]
            assert not await pg.evaluate("document.querySelector('#sheet [data-tcell=\"r3|c2\"]').classList.contains('bad')")
            await pg.screenshot(path='appiappi13_taulukko_%d.png'%W)
            await pg.click('#sheet [data-tdx="close"]');await pg.wait_for_timeout(150)
            # 3. Koosteet näkyvät paneelissa
            t=await insp(pg);kl=[l for l in t.split('\n') if l.startswith('Määrä:')];print(W,'3 kooste:',kl)
            assert kl and '2 täytetty, 1 puuttuu' in kl[0] and 'summa 6' in kl[0] and 'keskiarvo 3' in kl[0]
            assert 'Rivejä\n3' in t or 'Rivejä 3' in t.replace('\n',' ')
            # 4. Kaava: ehdotukset taulukon poluille, tallessa sarakkeen tunniste
            kid=await pg.evaluate("(function(){var b=KK.addBlock(APP.P,'kaava',{});var n=KK.addNode(APP.P,b.id,360,60);KK.repair(APP.P);APP.renderAll();return [b.id,n.id];})()")
            await valitse(pg,kid[1]);ta='#insp textarea[data-kaava]'
            await pg.click(ta);await pg.keyboard.type('ostokset.valittu.m');await pg.wait_for_timeout(150)
            sug=await pg.evaluate("[...document.querySelectorAll('#ksug button')].map(b=>b.getAttribute('data-ksug'))");print(W,'4 ehdotukset:',sug)
            assert 'valittu.määrä' in sug
            await pg.fill(ta,'ostokset.määrä.keskiarvo');await pg.dispatch_event(ta,'input');await pg.wait_for_timeout(150)
            f=await P(pg,"P.b['%s'].f"%kid[0]);kr=await pg.inner_text('#kres');print(W,'4 kaava:',f,'|',kr)
            assert f.endswith('}.c2.keskiarvo') and '3' in kr
            # 5. Lisää rivi -toiminto: kenttäkaavat, valitse uusi; käyttötieto erillään lähtöaineistosta
            lid=await pg.evaluate("(function(i){var b=KK.addBlock(APP.P,'tee',{do:'lisaarivi',o:i});var n=KK.addNode(APP.P,b.id,360,200);KK.repair(APP.P);APP.renderAll();return [b.id,n.id];})('%s')"%I['t'])
            await valitse(pg,lid[1]);t=await insp(pg);assert 'Valitse uusi rivi' in t and 'tilannekuva' in t
            await kirjoita(pg,'#insp [data-k="kv_c1"]','"Kahvi"');await kirjoita(pg,'#insp [data-k="kv_c2"]','määrä')
            assert await pg.evaluate("document.querySelector('#insp [data-k=\"kv_c2\"]').classList.contains('bad')"),'tuntematon viite punaisena'
            await kirjoita(pg,'#insp [data-k="kv_c2"]','1 + 1');await pg.check('#insp [data-k="vl"]');await pg.wait_for_timeout(150)
            kv=await P(pg,"P.b['%s'].kv"%lid[0]);print(W,'5 kentät:',kv);assert kv=={'c1':'"Kahvi"','c2':'1 + 1'}
            desc=await pg.inner_text('#lworld [data-nid="%s"]'%lid[1]);assert 'Lisää rivi → Ostokset: Nimi = "Kahvi", Määrä = 1 + 1' in desc,desc
            await pg.evaluate("(i)=>{KK.runAction(APP.P,i,APP.ctx(),0);KK.tick(APP.P,APP.ctx());APP.renderAll();}",lid[0])
            u=await P(pg,"[KK.tRows(P,'%s').length,P.b['%s'].rv.length,KK.tSel(P,'%s'),E().prop('%s','valittu.c1')]"%(I['t'],I['t'],I['t'],I['t']));print(W,'5 käyttö:',u)
            assert u==[4,3,'u1','Kahvi']
            await valitse(pg,I['tn']);await pg.click('#insp [data-tdo="open"]');await pg.wait_for_timeout(200)
            segs=await pg.evaluate("[...document.querySelectorAll('#sheet [data-seg=\"tduse\"]')].map(b=>b.textContent+(b.classList.contains('on')?'*':''))");print(W,'5 ikkuna:',segs)
            assert segs==['Lähtöaineisto (3)','Käyttötieto nyt (4)*']
            on=await pg.evaluate("[...document.querySelectorAll('#sheet tr.on [data-tcell]')].map(x=>x.value)");assert on==['Kahvi','2'],on
            await pg.click('#sheet [data-tdx="close"]');await pg.wait_for_timeout(150)
            # 6. Tapahtuman tiedot -paneeli ja Valitse rivi -valinnat
            await valitse(pg,I['pn']);t=await insp(pg);assert 'tapahtuma.uusi' in t and 'tapahtuma.rivi' in t and 'ulkopuolella' in t
            vid=await pg.evaluate("(function(i){var b=KK.addBlock(APP.P,'tee',{do:'valitserivi',o:i});var n=KK.addNode(APP.P,b.id,360,320);KK.repair(APP.P);APP.renderAll();return n.id;})('%s')"%I['t'])
            await valitse(pg,vid);opts=await pg.evaluate("[...document.querySelectorAll('#insp select[data-k=\"rs\"] option')].map(o=>o.textContent)");print(W,'6 valitse rivi:',opts)
            assert opts==['ensimmäinen','seuraava','edellinen','viimeinen','tapahtuman rivi','arvosta (numero tai rivi)','ei mitään'] and 'Lopusta alkuun' in await insp(pg)
            await pg.screenshot(path='appiappi13_toiminto_%d.png'%W)
            print(W,'errs',errs);assert not errs,errs
            await b.close()
        for W in (390,320):
            b=await p.chromium.launch();errs=[]
            ctx=await b.new_context(viewport={'width':W,'height':844},has_touch=True,is_mobile=True,reduced_motion='reduce')
            pg=await ctx.new_page();pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Puhelin');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate("""(function(){var P=APP.P,v=P.views[0].id;
              var t=KK.addBlock(P,'taulu',{nm:'Kysymykset'});var tn=KK.addNode(P,t.id,40,40);var c1=KK.addCol(t,'Kysymys','teksti'),c2=KK.addCol(t,'Pisteet','luku');
              [['Mikä väri?','2'],['Montako?',''],['Missä?','5']].forEach(function(x){var r=KK.tAddRow(P,t.id,false);KK.tEdit(P,t.id,false,r,c1.id,x[0]);KK.tEdit(P,t.id,false,r,c2.id,x[1]);});
              var tx=KK.addBlock(P,'nayta',{v:v,tx:''});tx.x=20;tx.y=40;tx.w=W0-40;tx.h=40;tx.tx=KK.toIds(P,'{kysymykset.valittu.kysymys} ({kysymykset.valittunro}/{kysymykset.rivejä})');
              var tx2=KK.addBlock(P,'nayta',{v:v,tx:''});tx2.x=20;tx2.y=90;tx2.w=W0-40;tx2.h=40;tx2.tx=KK.toIds(P,'Pisteet: {kysymykset.valittu.pisteet}, ka {kysymykset.pisteet.keskiarvo}, puuttuu {kysymykset.pisteet.puuttuvia}');
              var bt=KK.addBlock(P,'nappi',{v:v,tx:'Seuraava',beh:'kerta'});bt.x=20;bt.y=150;bt.w=160;bt.h=44;var bn=KK.addNode(P,bt.id,40,200);
              var se=KK.addBlock(P,'tee',{do:'valitserivi',o:t.id,rs:'seur',kierto:true});var sn=KK.addNode(P,se.id,260,200);KK.addLink(P,bn.id,'e',sn.id,'e');
              KK.repair(P);APP.renderAll();return {t:t.id,tn:tn.id,tx:tx.id,tx2:tx2.id,bt:bt.id};})()""".replace('W0',str(W)))
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            async def teksti(id): return await pg.inner_text('#uvp [data-id="%s"]'%id)
            t0=await teksti(I['tx']);print(W,'7 alussa:',t0);assert t0.strip()=='– (0/3)'
            bb=await pg.locator('#uvp [data-id="%s"]'%I['bt']).bounding_box()
            for k,(q,pt) in enumerate((('Mikä väri? (1/3)','Pisteet: 2, ka 3,5, puuttuu 1'),('Montako? (2/3)','Pisteet: –, ka 3,5, puuttuu 1'),('Missä? (3/3)','Pisteet: 5, ka 3,5, puuttuu 1'),('Mikä väri? (1/3)','Pisteet: 2, ka 3,5, puuttuu 1'))):
                await pg.tap('#uvp [data-id="%s"]'%I['bt']);await pg.wait_for_timeout(200)
                a=(await teksti(I['tx'])).strip();c=(await teksti(I['tx2'])).strip();print(W,'7 napautus',k+1,':',a,'|',c);assert a==q and c==pt,(a,c)
            sw=await pg.evaluate("document.documentElement.scrollWidth");assert sw<=W,('ei vaakavieritystä',sw)
            await pg.screenshot(path='appiappi13_puhelin_%d.png'%W)
            # taulukkoikkuna rakentajassa puhelimella: mahtuu ruutuun
            await pg.click('#lockbtn');await pg.wait_for_timeout(200)
            await pg.evaluate("(n)=>{APP.S.tab='logiikka';APP.S.sel={t:'n',id:n};APP.renderAll();document.querySelector('#insp [data-tdo=\"open\"]').click();}",I['tn']);await pg.wait_for_timeout(250)
            r=await pg.evaluate("(function(){var s=document.querySelector('#sheet').getBoundingClientRect(),w=document.querySelector('.tdwrap');return [s.left,s.right,w.scrollWidth>w.clientWidth,document.documentElement.scrollWidth];})()");print(W,'8 ikkuna:',r)
            assert r[0]>=0 and r[1]<=W and r[3]<=W
            print(W,'errs',errs);assert not errs,errs
            await b.close()
asyncio.run(main())
