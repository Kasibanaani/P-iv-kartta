"""Juuri 1.62: kierroslistat (Emil 23.10.2026). Useampi lista, kierros alkaa kuittaamattomana, tärkein kärkeen,
rivi tai/ja, Alusta, Lopeta → muistiinpano, Kumoa, keskeneräinen säilyy, vienti. Leveydet 390 ja 320 px.
Käyttö: python3 testit/selain_162.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from apu import tab, menu, tsx
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
K="JSON.parse(localStorage.getItem('paatospuu:v1')).kokonaisuudet[0]"
OVER="""(function(){var w=document.documentElement.clientWidth,out=[];document.querySelectorAll('input,textarea,select,button').forEach(function(e){var r=e.getBoundingClientRect();
 if(r.width&&r.height&&e.offsetParent!==null&&e.type!=='file'&&(r.right>w+0.5||r.left<-0.5))out.push((e.id||e.className||e.tagName)+' '+Math.round(r.left)+'..'+Math.round(r.right));});return JSON.stringify({doc:document.documentElement.scrollWidth<=w,yli:out});})()"""
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h})).new_page()
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond):
        print('  %-44s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    async def fits(label):
        r=json.loads(await pg.evaluate(OVER)); want(label+' mahtuu',r['doc'] and not r['yli'])
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(200)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    # Asiasanat: A tärkein, B, C, D; jatkuvalla listalla yksi rivi
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0];
      k.termit=[{id:'ta',name:'Arvio',yes:[],no:[]},{id:'tb',name:'Turva',yes:[],no:[]},{id:'tc',name:'Soitto',yes:[],no:[]},{id:'td',name:'Kirje',yes:[],no:[]}];k.tarkeat=['ta','tb'];
      k.tarkistuslista=[{id:'j1',name:'Keittiö',created:'2026-10-01T00:00:00.000Z',it:[{id:'tc',ok:new Date().toISOString()}]}];localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()""")
    await pg.reload(); await pg.wait_for_timeout(150); await tab(pg,'notes'); await pg.wait_for_timeout(40); await tab(pg,'list'); await pg.wait_for_timeout(60)
    want('listavalitsin näkyy', await pg.is_visible('#chlist-pick') and 'Lista' in await pg.inner_text('#chlist-pick'))
    await fits('Listan ylärivi')
    # Uusi kierroslista
    await pg.click('#chlist-pick'); await pg.wait_for_timeout(60); want('listat-ikkuna', await pg.is_visible('#wsheet')); await fits('Listat-ikkuna')
    await pg.fill('#ws-new','Kotikäynti'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(80)
    want('uusi lista valittuna ja tyhjä', 'Kotikäynti' in await pg.inner_text('#chlist-pick') and await pg.locator('#chlist .crow').count()==0)
    want('Lopeta, ei aikaehdotuksia', await pg.is_visible('#chk-end') and await pg.locator('#chplan-t').count()==0)
    await fits('Kierroslistan ylärivi')
    lid=await pg.evaluate(K+".listat[0].id")
    # Rivit kierroslistalle: R1 (ja: Soitto, Kirje), R2 (tai: Turva, Kirje), R3 (Arvio)
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0],L='%s';
      delete k.listat[0].wf; /* legacy round mode remains available */ k.tarkistuslista=k.tarkistuslista.concat([{id:'r1',name:'Kirjaukset',l:L,created:'2026-10-02T00:00:00.000Z',it:[{id:'tc'},{id:'td'}]},
        {id:'r2',name:'Turvallisuus',l:L,any:1,created:'2026-10-03T00:00:00.000Z',it:[{id:'tb'},{id:'td'}]},{id:'r3',name:'Arviointi',l:L,created:'2026-10-04T00:00:00.000Z',it:[{id:'ta'}]}]);
      localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()"""%lid)
    await pg.reload(); await pg.wait_for_timeout(150); await tab(pg,'notes'); await pg.wait_for_timeout(40); await tab(pg,'list'); await pg.wait_for_timeout(60)
    want('valittu lista muistuu', 'Kotikäynti' in await pg.inner_text('#chlist-pick'))
    order=await pg.evaluate("Array.prototype.map.call(document.querySelectorAll('#chlist .crow'),function(c){return c.dataset.id;})")
    want('tärkein kärkeen, vain tämän listan rivit', order==['r3','r2','r1'])
    want('jatkuvan listan pallero ei kierroksesta', await pg.locator('[data-tab="list"] .segdot').count()==0)
    async def openrow(i):
        c=pg.locator('#chlist .crow[data-id="%s"]'%i)
        if 'open' not in (await c.get_attribute('class')): await c.locator('.chd').click(); await pg.wait_for_timeout(50)
        return c
    c=await openrow('r3'); await c.locator('.cpill:has-text("Arvio")').click(); await pg.wait_for_timeout(60); await pg.click('#chlist .crow[data-id="r3"] .chd'); await pg.wait_for_timeout(80)
    order=await pg.evaluate("Array.prototype.map.call(document.querySelectorAll('#chlist .crow'),function(c){return c.dataset.id;})")
    want('kuitattu rivi loppuun, kun rivi suljetaan (1.77)', order==['r2','r1','r3'])
    c=await openrow('r2'); await c.locator('.cpill:has-text("Kirje")').click(); await pg.wait_for_timeout(60)
    c=await openrow('r2')
    want('tai-rivi valmis yhdellä, muut harmaina', await c.locator('.cpill.cno:has-text("Turva")').count()==1)
    await pg.click('#chlist .crow[data-id="r2"] .chd'); await pg.wait_for_timeout(80)
    order=await pg.evaluate("Array.prototype.map.call(document.querySelectorAll('#chlist .crow'),function(c){return c.dataset.id;})")
    want('ja-rivi edelleen kesken kärjessä', order[0]=='r1')
    want('kuittaus ei uusiudu (ei ev)', await pg.evaluate(K+".tarkistuslista.filter(function(r){return r.id==='r2';})[0].it.filter(function(x){return x.id==='td';})[0].ev===undefined"))
    # Keskeneräinen säilyy uudelleenlatauksessa
    await pg.reload(); await pg.wait_for_timeout(150); await tab(pg,'notes'); await pg.wait_for_timeout(40); await tab(pg,'list'); await pg.wait_for_timeout(60)
    want('keskeneräinen kierros säilyy', await pg.locator('#chlist .cpill.ok').count()>=0 and await pg.evaluate("%s.tarkistuslista.filter(function(r){return r.l;}).reduce(function(a,r){return a+r.it.filter(function(x){return x.ok;}).length;},0)"%K)==2)
    # Uusi rivi Muokkaa-ikkunasta kuuluu kierroslistaan ja ikkuna puhuu kierroksen kieltä
    await pg.click('#newnote'); await pg.wait_for_timeout(60)
    want('rivin ryhmäsanat kierroksessa', await pg.inner_text('#ks-anyl')=='Rivi valmis, kun' and 'Yksi kuitattu' in await pg.inner_text('#ks-any'))
    await pg.fill('#ks-name','Lisärivi'); await pg.click('#ksheet .sx'); await pg.wait_for_timeout(80)
    want('uusi rivi tälle listalle', await pg.evaluate(K+".tarkistuslista.filter(function(r){return r.name==='Lisärivi';})[0].l")==lid)
    # Lopeta: muistiinpano ja alusta; Kumoa palauttaa
    n0=await pg.evaluate(K+".muistiinpanot.length")
    await pg.click('#chk-end'); await pg.wait_for_timeout(80)
    note=await pg.evaluate(K+".muistiinpanot[0].text||"+K+".muistiinpanot[0].teksti")
    want('lopetus tekee muistiinpanon', await pg.evaluate(K+".muistiinpanot.length")==n0+1 and note.startswith('Kotikäynti') and 'Kunnossa: ' in note and 'Hoidettavat: 1. Kirjaukset (Soitto' in note)
    want('lopetus alustaa kierroksen', await pg.evaluate("%s.tarkistuslista.filter(function(r){return r.l;}).reduce(function(a,r){return a+r.it.filter(function(x){return x.ok;}).length;},0)"%K)==0)
    want('Kumoa tarjolla', await pg.is_visible('#undo'))
    await pg.click('#undo-b'); await pg.wait_for_timeout(80)
    want('Kumoa palauttaa kuittaukset ja poistaa muistiinpanon', await pg.evaluate(K+".muistiinpanot.length")==n0 and await pg.evaluate("%s.tarkistuslista.filter(function(r){return r.l;}).reduce(function(a,r){return a+r.it.filter(function(x){return x.ok;}).length;},0)"%K)==2)
    await pg.click('#chlist-pick'); await pg.wait_for_timeout(60); await pg.click('#chk-reset'); await pg.wait_for_timeout(80)
    want('Alusta tyhjentää ilman muistiinpanoa', await pg.evaluate("%s.tarkistuslista.filter(function(r){return r.l;}).reduce(function(a,r){return a+r.it.filter(function(x){return x.ok;}).length;},0)"%K)==0 and await pg.evaluate(K+".muistiinpanot.length")==n0)
    # Vaihto jatkuvaan listaan
    await pg.click('#chlist-pick'); await pg.wait_for_timeout(50); await pg.locator('#ws-list .row[data-l=""]').click(); await pg.wait_for_timeout(60)
    order=await pg.evaluate("Array.prototype.map.call(document.querySelectorAll('#chlist .crow'),function(c){return c.dataset.id;})")
    want('jatkuva lista ennallaan', order==['j1'] and await pg.is_visible('#chplan-t'))
    # Vienti sisältää listat ja rivien l:n
    want('tallennus: listat ja rivien lista', await pg.evaluate(K+".listat[0].name")=='Kotikäynti' and await pg.evaluate(K+".tarkistuslista.filter(function(r){return r.l;}).length")==4)
    # Nimeäminen ja poisto
    await pg.click('#chlist-pick'); await pg.wait_for_timeout(50); await pg.locator('#ws-list .row[data-l="%s"]'%lid).click(); await pg.wait_for_timeout(50)
    await pg.click('#chlist-pick'); await pg.wait_for_timeout(50); await pg.fill('#ws-name','Käynti'); await pg.click('#wsheet .sx'); await pg.wait_for_timeout(60)
    want('nimeäminen', 'Käynti' in await pg.inner_text('#chlist-pick'))
    await pg.click('#chlist-pick'); await pg.wait_for_timeout(50); await pg.click('#ws-del'); await pg.wait_for_timeout(40)
    await pg.locator('#wsheet .delbox button:has-text("Poista")').last.click(); await pg.wait_for_timeout(80)
    want('poisto: rivit pois, takaisin jatkuvaan', await pg.evaluate("(%s.listat||[]).length"%K)==0 and await pg.evaluate(K+".tarkistuslista.length")==1 and 'Käynti' not in await pg.inner_text('#chlist-pick'))
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640)): bad+=await run(p,w,h)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
