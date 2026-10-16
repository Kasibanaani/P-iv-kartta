# P3a: Rivi, Rivijoukko, ikkuna riveille ja Toista riveille selaimessa. Tietokone 1440 ja 1280 (tumma), puhelin 390 ja 320 (kosketus).
# Tietokone: paletin Rivi ja Rivijoukko kanvaasille vetämällä, Rivin paneeli (taulukko, mikä rivi, sarakkeet kaavaan), nuoli
# taulukon rivit-kohdasta joukkoon vetämällä, joukon paneeli (rivit, järjestys sarakkeen mukaan, suunta, enintään, tulos) ja
# kanvaasin otsikko, ehto riveittäin, kaavan ehdotukset kohde. ja joukko., ikkunan Riveille-valinta (rivit-kohta, tiedossa ja
# puuttuu, summa) ja Miksi?, Toista riveille -valinta ja ketjun ajo. Puhelin: lukitussa näkymässä painike lisää rivin ja teksti
# näyttää ikkunan summan ja joukon ensimmäisen, toinen painike käy rivit läpi ketjussa (Toista riveille) ja nollaa määrät.
# Kuvat appiappi14_*.png. Testit ajetaan tietokoneen Chromiumissa, eivät oikealla iPhonella.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P;
 var t=KK.addBlock(P,'taulu',{nm:'Tuotteet'});var tn=KK.addNode(P,t.id,60,60);var c1=KK.addCol(t,'Nimi','teksti'),c2=KK.addCol(t,'Määrä','luku'),c3=KK.addCol(t,'Hinta','luku');
 [['Maito','2','1,5'],['Leipä','0','3'],['Juusto','','6'],['Omena','6','0,5']].forEach(function(x){var r=KK.tAddRow(P,t.id,false);KK.tEdit(P,t.id,false,r,c1.id,x[0]);KK.tEdit(P,t.id,false,r,c2.id,x[1]);KK.tEdit(P,t.id,false,r,c3.id,x[2]);});
 KK.repair(P);APP.renderAll();return {t:t.id,tn:tn.id};})()"""
S='#lworld [data-nid="%s"]'
async def valitse(pg,nid):
    await pg.evaluate("(n)=>{APP.S.sel={t:'n',id:n};APP.S.multi=[];APP.renderAll();}",nid);await pg.wait_for_timeout(150)
async def insp(pg): return await pg.inner_text('#insp')
async def nid_of(pg,nm): return await P(pg,"P.lg.n.filter(n=>P.b[n.p].nm==='%s').map(n=>n.id)[0]"%nm)
async def main():
    async with async_playwright() as p:
        for W,dark in ((1440,False),(1280,True)):
            b,pg,errs=await avaa(p,W,900,dark)
            await pg.fill('#wname','Rivit');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(150)
            w0=await pg.evaluate("(function(){var b=KK.addBlock(APP.P,'ikkuna',{m:'sum'});var n=KK.addNode(APP.P,b.id,700,700);KK.repair(APP.P);APP.renderAll();return n.id;})()")
            await valitse(pg,w0);assert await pg.locator('#insp input[data-k="riv"]').count()==0,'ilman taulukkoa ei Riveille-valintaa'
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            await valitse(pg,w0);assert await pg.locator('#insp input[data-k="riv"]').count()==1,'taulukon kanssa Riveille-valinta'
            # 1. Paletti: Rivi ja Rivijoukko Tieto-ryhmässä, vedetään kanvaasille
            chips=await pg.evaluate("[...document.querySelectorAll('#pal .chip')].map(c=>c.textContent.trim())");assert any('Rivijoukko' in c for c in chips) and any(c.endswith('Rivi') for c in chips),chips
            box=await pg.locator('#lvp').bounding_box();X0=box['x'];Y0=box['y']
            await paletti(pg,'Rivijoukko',X0+520,Y0+80);await paletti(pg,'Rivi',X0+520,Y0+300)
            nms=await P(pg,"Object.values(P.b).map(b=>[b.k,b.nm,b.vt])");print(W,'1 palikat:',nms)
            assert ['trivi','Kohde','kohde'] in nms and ['joukko','Joukko','joukko'] in nms
            kn=await nid_of(pg,'Kohde');jn=await nid_of(pg,'Joukko')
            # 2. Rivin paneeli: taulukko, mikä rivi, sarakkeet kaavaan
            await valitse(pg,kn);await pg.select_option('#insp select[data-k="tt"]',I['t']);await pg.wait_for_timeout(150)
            t=await insp(pg);segs=await pg.evaluate("[...document.querySelectorAll('#insp [data-seg=\"ls\"]')].map(b=>b.textContent+(b.classList.contains('on')?'*':''))");print(W,'2 rivi:',segs)
            assert segs==['käsiteltävä rivi*','valittu rivi','tapahtuman rivi'] and 'kohde.määrä' in t and 'kohde.nro' in t and 'Nyt: ei riviä' in t.replace('\n',' ')
            lab=await pg.inner_text(S%kn);assert 'Tuotteet · käsiteltävä rivi' in lab,lab
            # 3. Nuoli taulukon rivit-kohdasta joukkoon vetämällä
            a=await keskus(pg,(S%I['tn'])+' .pins.o .pt[data-p="rj"]');z=await keskus(pg,(S%jn)+' .pins.i .pt[data-p="rv"]');await veda(pg,a,z)
            ls=await P(pg,"P.lg.l.map(l=>[l.fp,l.tp])");print(W,'3 nuolet:',ls);assert ['rj','rv'] in ls
            await valitse(pg,jn);t=await insp(pg);print(W,'3 joukko:',[l for l in t.split('\n') if 'Tulos' in l])
            assert 'Tulos: 4 riviä taulukosta ”Tuotteet”: Maito, Leipä, Juusto, Omena' in t
            # 4. Järjestys hinnan mukaan laskevasti, enintään 2
            await pg.select_option('#insp select[data-k="js"]','c3');await pg.wait_for_timeout(150);await pg.click('#insp [data-seg="su"][data-v="laskeva"]');await pg.wait_for_timeout(150)
            await pg.fill('#insp input[data-k="max"]','2');await pg.wait_for_timeout(200)
            t=await insp(pg);assert 'Tulos: 2 riviä taulukosta ”Tuotteet”: Juusto, Leipä' in t,t
            lab=await pg.inner_text(S%jn);print(W,'4 otsikko:',lab);assert '2/4 riviä' in lab
            await pg.fill('#insp input[data-k="max"]','');await pg.wait_for_timeout(150)
            # 5. Ehto riveittäin: kaava kohde.määrä > 0 → joukon ehto; kaavan ehdotukset kohde. ja joukko.
            kid=await pg.evaluate("(function(){var b=KK.addBlock(APP.P,'kaava',{});var n=KK.addNode(APP.P,b.id,360,430);KK.repair(APP.P);APP.renderAll();return [b.id,n.id];})()")
            await valitse(pg,kid[1]);ta='#insp textarea[data-kaava]'
            await pg.click(ta);await pg.keyboard.type('kohde.m');await pg.wait_for_timeout(150)
            sug=await pg.evaluate("[...document.querySelectorAll('#ksug button')].map(b=>b.getAttribute('data-ksug'))");print(W,'5 ehdotukset kohde:',sug);assert 'määrä' in sug
            await pg.fill(ta,'kohde.määrä > 0');await pg.dispatch_event(ta,'input');await pg.wait_for_timeout(150)
            f=await P(pg,"P.b['%s'].f"%kid[0]);assert f.endswith('}.c2 > 0'),f
            a=await keskus(pg,(S%kid[1])+' .pins.o .pt[data-p="v"]');z=await keskus(pg,(S%jn)+' .pins.i .pt[data-p="c"]');await veda(pg,a,z)
            await valitse(pg,jn);t=await insp(pg);assert 'Tulos: 2 riviä taulukosta ”Tuotteet”: Maito, Omena' in t,t
            ks=await pg.evaluate("(function(){var b=KK.addBlock(APP.P,'kaava',{});var n=KK.addNode(APP.P,b.id,360,530);KK.repair(APP.P);APP.renderAll();return n.id;})()")
            await valitse(pg,ks);await pg.click(ta);await pg.keyboard.type('joukko.');await pg.wait_for_timeout(150)
            sug=await pg.evaluate("[...document.querySelectorAll('#ksug button')].map(b=>b.getAttribute('data-ksug'))");print(W,'5 ehdotukset joukko:',sug[:8]);assert 'rivejä' in sug and 'eka' in sug and 'määrä.summa' in sug
            await pg.fill(ta,'joukko.eka.nimi');await pg.dispatch_event(ta,'input');await pg.wait_for_timeout(150);kr=await pg.inner_text('#kres');print(W,'5 tulos:',kr);assert 'Maito' in kr
            # 6. Ikkuna riveille: SUMMA kohde.määrä × kohde.hinta
            wi=await pg.evaluate("""(function(t){var P=APP.P;var w=KK.addBlock(P,'ikkuna',{m:'sum'});var wn=KK.addNode(P,w.id,40,300);var k=KK.addBlock(P,'kaava',{});var kn=KK.addNode(P,k.id,60,350,wn.id);
              k.f=KK.kaavaToIds(P,'kohde.määrä * kohde.hinta');KK.repair(P);APP.renderAll();return [w.id,wn.id];})('%s')"""%I['t'])
            await valitse(pg,wi[1]);await pg.check('#insp input[data-k="riv"]');await pg.wait_for_timeout(200)
            assert await pg.locator((S%wi[1])+' .pins.i .pt[data-p="rv"]').count()==1,'rivit-kohta näkyy'
            t=await insp(pg);assert 'Tuo rivit nuolella' in t
            a=await keskus(pg,(S%I['tn'])+' .pins.o .pt[data-p="rj"]');z=await keskus(pg,(S%wi[1])+' .pins.i .pt[data-p="rv"]');await veda(pg,a,z)
            await valitse(pg,wi[1]);t=await insp(pg);print(W,'6 ikkuna:',[l for l in t.split('\n') if 'tiedossa' in l or 'nyt' in l][:3])
            assert 'tiedossa 3, puuttuu 1' in t.replace('\n',' ') and 'Vaatii täydelliset tiedot' in t
            v=await P(pg,"E().val('%s')"%wi[0]);assert v==6,v
            hd=await pg.inner_text('#insp .ih small');assert '6' in hd,hd
            ws=await pg.inner_text('#whysec') if await pg.locator('#whysec').count() else ''
            print(W,'6 miksi:',ws[:200].replace('\n',' | '));assert 'riveille: 4 riviä' in ws and 'Maito' in ws
            await pg.screenshot(path='appiappi14_ikkuna_%d.png'%W)
            # 7. Toista riveille ketjussa: Lisää 10 määrään tapahtuman rivillä
            ki=await pg.evaluate("""(function(t,j){var P=APP.P;var k=KK.addBlock(P,'ketju',{nm:'Kay'});var kn=KK.addNode(P,k.id,40,640);var to=KK.addBlock(P,'toista',{});var ton=KK.addNode(P,to.id,60,680,kn.id);
              var a=KK.addBlock(P,'tee',{do:'lisaa',o:t,sk:'c2',rl:'tapahtuma',v:'10'});var an=KK.addNode(P,a.id,60,760,kn.id);KK.addLink(P,ton.id,'e',an.id,'e');KK.addLink(P,an.id,'e',ton.id,'e');
              KK.repair(P);APP.renderAll();return [k.id,kn.id,to.id,ton.id];})('%s')"""%I['t'])
            await valitse(pg,ki[3]);await pg.click('#insp [data-seg="tapa"][data-v="rivit"]');await pg.wait_for_timeout(200)
            t=await insp(pg);assert 'TOISTA RIVEILLE' in t.upper() and 'Tuo rivit nuolella' in t
            assert await pg.locator((S%ki[3])+' .pins.i .pt[data-p="rv"]').count()==1
            await pg.evaluate("(a)=>{var P=APP.P;KK.addLink(P,P.lg.n.find(n=>n.p===a[0]).id,'rj',a[1],'rv');KK.repair(P);APP.renderAll();}",[jn and (await P(pg,"P.lg.n.find(n=>n.id==='%s').p"%jn)),ki[3]])
            await valitse(pg,ki[3]);t=await insp(pg);assert 'Rivit: 2 riviä' in t,t
            lab=await pg.inner_text(S%ki[3]);assert 'riveille (2)' in lab,lab
            await pg.evaluate("(k)=>{KK.chainStart(APP.P,k,APP.ctx(),null,0);KK.tick(APP.P,APP.ctx());APP.renderAll();}",ki[0])
            m=await P(pg,"KK.tRows(P,'%s').map(r=>r.a.c2===undefined?null:r.a.c2)"%I['t']);print(W,'7 määrät:',m);assert m==[12,0,None,16],m
            v=await P(pg,"E().val('%s')"%wi[0]);assert v==26,v
            await pg.screenshot(path='appiappi14_toista_%d.png'%W)
            print(W,'errs',errs);assert not errs,errs
            await b.close()
        for W in (390,320):
            b=await p.chromium.launch();errs=[]
            ctx=await b.new_context(viewport={'width':W,'height':844},has_touch=True,is_mobile=True,reduced_motion='reduce')
            pg=await ctx.new_page();pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Puhelin');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate("""(function(){var P=APP.P,v=P.views[0].id;
              var t=KK.addBlock(P,'taulu',{nm:'Ostokset'});var tn=KK.addNode(P,t.id,40,40);var c1=KK.addCol(t,'Nimi','teksti'),c2=KK.addCol(t,'Kpl','luku');
              [['Maito','2'],['Leipä','']].forEach(function(x){var r=KK.tAddRow(P,t.id,false);KK.tEdit(P,t.id,false,r,c1.id,x[0]);KK.tEdit(P,t.id,false,r,c2.id,x[1]);});
              var ko=KK.addBlock(P,'trivi',{nm:'Kohde',tt:t.id});KK.addNode(P,ko.id,40,160);
              var w=KK.addBlock(P,'ikkuna',{m:'sum',riv:true,nm:'Yht'});var wn=KK.addNode(P,w.id,300,40);var k=KK.addBlock(P,'kaava',{});var kn=KK.addNode(P,k.id,320,80,wn.id);k.f=KK.kaavaToIds(P,'kohde.kpl');
              KK.addLink(P,tn.id,'rj',wn.id,'rv');
              var j=KK.addBlock(P,'joukko',{nm:'Eniten',js:c2.id,su:'laskeva'});var jn=KK.addNode(P,j.id,300,240);KK.addLink(P,tn.id,'rj',jn.id,'rv');
              var tx=KK.addBlock(P,'nayta',{v:v,tx:''});tx.x=20;tx.y=40;tx.w=W0-40;tx.h=40;tx.tx=KK.toIds(P,'Yhteensä {yht}, rivejä {ostokset.rivejä}');
              var tx2=KK.addBlock(P,'nayta',{v:v,tx:''});tx2.x=20;tx2.y=90;tx2.w=W0-40;tx2.h=40;tx2.tx=KK.toIds(P,'Eniten: {eniten.eka.nimi} ({eniten.eka.kpl})');
              var bt=KK.addBlock(P,'nappi',{v:v,tx:'Lisää',beh:'kerta'});bt.x=20;bt.y=150;bt.w=140;bt.h=44;var bn=KK.addNode(P,bt.id,40,300);
              var lr=KK.addBlock(P,'tee',{do:'lisaarivi',o:t.id,kv:{}});lr.kv[c1.id]=KK.kaavaToIds(P,'"Uusi"');lr.kv[c2.id]=KK.kaavaToIds(P,'5');var ln=KK.addNode(P,lr.id,260,300);KK.addLink(P,bn.id,'e',ln.id,'e');
              var b2=KK.addBlock(P,'nappi',{v:v,tx:'Nollaa',beh:'kerta'});b2.x=180;b2.y=150;b2.w=120;b2.h=44;var b2n=KK.addNode(P,b2.id,40,420);
              var kk=KK.addBlock(P,'ketju',{nm:'Nollaus'});var kkn=KK.addNode(P,kk.id,300,420);var to=KK.addBlock(P,'toista',{tapa:'rivit'});var ton=KK.addNode(P,to.id,320,460,kkn.id);
              var as=KK.addBlock(P,'tee',{do:'aseta',o:t.id,sk:c2.id,rl:'tapahtuma',v:'0'});var asn=KK.addNode(P,as.id,320,540,kkn.id);KK.addLink(P,ton.id,'e',asn.id,'e');KK.addLink(P,asn.id,'e',ton.id,'e');KK.addLink(P,tn.id,'rj',ton.id,'rv');
              KK.addLink(P,b2n.id,'e',kkn.id,'e');
              KK.repair(P);APP.renderAll();return {t:t.id,tx:tx.id,tx2:tx2.id,bt:bt.id,b2:b2.id};})()""".replace('W0',str(W)))
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            async def teksti(id): return (await pg.inner_text('#uvp [data-id="%s"]'%id)).strip()
            a=await teksti(I['tx']);c=await teksti(I['tx2']);print(W,'8 alussa:',a,'|',c);assert a=='Yhteensä 2, rivejä 2' and c=='Eniten: Maito (2)',(a,c)
            await pg.tap('#uvp [data-id="%s"]'%I['bt']);await pg.wait_for_timeout(200)
            a=await teksti(I['tx']);c=await teksti(I['tx2']);print(W,'8 lisätty:',a,'|',c);assert a=='Yhteensä 7, rivejä 3' and c=='Eniten: Uusi (5)',(a,c)
            await pg.tap('#uvp [data-id="%s"]'%I['b2']);await pg.wait_for_timeout(250)
            a=await teksti(I['tx']);c=await teksti(I['tx2']);print(W,'8 nollattu:',a,'|',c);assert a=='Yhteensä 0, rivejä 3' and c=='Eniten: Maito (0)',(a,c)
            sw=await pg.evaluate("document.documentElement.scrollWidth");assert sw<=W,('ei vaakavieritystä',sw)
            await pg.screenshot(path='appiappi14_puhelin_%d.png'%W)
            print(W,'errs',errs);assert not errs,errs
            await b.close()
asyncio.run(main())
