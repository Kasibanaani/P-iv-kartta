"""Kaikki 0.1: GitHub-vaultin synkka testirepoa vasten (fakegh.js). Leveydet 390 ja 320 px.
Tarkistaa: pelkkä haku ei kirjoita mitään, piilotetut kansiot eivät tule muistiinpanoiksi, tekoälyn muistiinpanon päivämäärä
näkyy kalenterissa, uusi muistiinpano menee Inboxiin, tekoälyn muutos tulee appiin, oma muokkaus menee GitHubiin oikealla
versiolla, poisto siirtää arkistoon ja samanaikainen muutos säilyttää molemmat versiot. Käyttö: python3 testit/selain_vault.py"""
import asyncio, os, sys, json, datetime
T=datetime.date.today();TD='%d.%d.'%(T.day,T.month)
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from apu import tab
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
FAKE=open(os.path.join(D,'fakegh.js'),encoding='utf8').read()
STOP=('---\ntyyppi: tieto\notsikko: STOP-taito\nkuvaus: Kriisinsietotaito.\nluotu: 2026-11-20\nlahde: claude\n---\n# STOP-taito\n\nKoulutus aiheesta '+TD+' klo 13-15.\n')
PAIVA='---\ntyyppi: paiva\notsikko: Su 22.11.2026\nkuvaus: \nluotu: 2026-11-22\nlahde: emil+claude\n---\n# Su 22.11.2026\n\n## Mikä toimi\n\nAamulenkki.\n'
SEED={'AGENTS.md':'# Ohje\n','ohjeet/data.md':'---\ntyyppi: ohje\n---\n# Data\n','inbox/_hakemisto.md':'---\ntyyppi: hakemisto\n---\n# Inbox\n',
      'data/paiva.csv':'pvm,energia\n','tieto/dkt/stop-taito.md':STOP,'paivat/2026/2026-11-22.md':PAIVA,'alueet/tyo/tyo-alue.md':'---\ntyyppi: alue\nnakyy: ei\n---\n# Työ\n'}
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    ctx=await b.new_context(viewport={'width':w,'height':h},device_scale_factor=2)
    pg=await ctx.new_page()
    await pg.add_init_script(FAKE+";(function(){var S=%s;if(!window.__repo.kept)for(var k in S)window.__repo.put(k,S[k]);try{localStorage.setItem('kaikki:gh',JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}))}catch(e){}})();"%json.dumps(SEED))
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond,info=''):
        print('  %-44s %s %s'%(label,'ok' if cond else 'VIRHE',info if not cond else ''))
        if not cond: bad.append(label)
    async def settle(ms=2500):
        await pg.wait_for_timeout(ms)
    async def sync():
        await pg.evaluate("KaikkiTesti.collect()"); await settle(800)
    print('leveys',w)
    await pg.goto(U); await settle(1500)
    st=await pg.evaluate("KaikkiTesti.status()")
    want('haku valmis',st.startswith('ajan tasalla'),st)
    notes=await pg.evaluate("KaikkiTesti.notes().map(function(n){return n.vp;}).sort()")
    want('vain näkyvät muistiinpanot',notes==['paivat/2026/2026-11-22.md','tieto/dkt/stop-taito.md'],notes)
    await settle(2000)
    log=await pg.evaluate("__repo.log.filter(function(x){return !/^GET/.test(x);})")
    want('pelkkä haku ei kirjoita',log==[],log)
    t=await pg.evaluate("KaikkiTesti.notes().filter(function(n){return n.vp==='tieto/dkt/stop-taito.md';})[0].text")
    want('otsikko ilman #-merkkiä',t.startswith('STOP-taito\n\nKoulutus'),repr(t[:30]))
    # siisti teksti: otsikko ilman merkkejä listassa, merkit haaleina kirjoittaessa ja piilossa lukunäkymässä
    want('listassa otsikko ilman #-merkkejä',await pg.evaluate("document.body.innerText.indexOf('Su 22.11.2026')>=0&&document.body.innerText.indexOf('# Su')<0"))
    await pg.evaluate("(function(){var n=KaikkiTesti.notes().filter(function(n){return n.vp==='paivat/2026/2026-11-22.md';})[0];var r=Array.prototype.filter.call(document.querySelectorAll('#notes button,.row,[data-id]'),function(e){return e.textContent.indexOf('Su 22.11.2026')>=0;})[0];if(r)r.click();})()"); await settle(300)
    if await pg.evaluate("document.getElementById('nsheet').open"):
        r=await pg.evaluate("(function(){var m=document.querySelectorAll('#ns-hl .mdm');return {n:m.length,hid:m.length?getComputedStyle(m[0]).display:'',reading:document.getElementById('nsheet').classList.contains('reading'),h:document.querySelectorAll('#ns-hl .mdh').length};})()")
        want('lukunäkymä oletuksena, ## piilossa',r['reading'] and r['n']>=1 and r['hid']=='none' and r['h']>=1,r)
        await pg.evaluate("document.getElementById('ns-text').readOnly=false;document.getElementById('nsheet').classList.remove('reading')")
        want('kirjoittaessa merkit haaleina',await pg.evaluate("getComputedStyle(document.querySelector('#ns-hl .mdm')).display!=='none'"))
        await pg.click('#nsheet .sx'); await settle(300)
    else: want('päivän muistiinpano aukesi',False)
    # kalenteri: tekoälyn kirjoittama päivämäärä näkyy
    await tab(pg,'cal'); await settle(200)
    cal=await pg.evaluate("String(document.body.innerText.indexOf('STOP')>=0)")
    want('kalenterissa näkyy tekoälyn merkintä',cal=='true')
    # uusi muistiinpano apista -> Inbox
    await tab(pg,'notes'); await settle(100)
    await pg.click('#newnote'); await pg.fill('#ns-text','Soita hammaslääkärille huomenna'); await pg.dispatch_event('#ns-text','input')
    await pg.click('#nsheet .sx'); await settle(300); await sync()
    newp=await pg.evaluate("Object.keys(__repo.files).filter(function(p){return /^inbox\\/.*soita/.test(p);})")
    want('uusi muistiinpano Inboxiin',len(newp)==1,newp)
    if newp:
        md=await pg.evaluate("__repo.get(%s)"%json.dumps(newp[0]))
        want('alkutiedot ja teksti',('tyyppi: inbox' in md and 'lahde: emil' in md and 'otsikko: Soita hammaslääkärille huomenna' in md and md.rstrip().endswith('Soita hammaslääkärille huomenna')),md)
    await settle(2000); n0=len(await pg.evaluate("__repo.log"))
    await pg.evaluate("KaikkiTesti.pull()"); await settle(800); await sync()
    log=await pg.evaluate("__repo.log.slice(%d).filter(function(x){return !/^GET/.test(x);})"%n0)
    want('oma muistiinpano ei kirjoitu uudelleen',log==[],log)
    # tekoäly muuttaa tiedostoa -> appi hakee
    await pg.evaluate("__repo.put('tieto/dkt/stop-taito.md',__repo.get('tieto/dkt/stop-taito.md').replace('klo 13-15','klo 12-14'))")
    await pg.evaluate("__repo.put('alueet/tyo/uusi.md','---\\ntyyppi: muistiinpano\\notsikko: Uusi\\nluotu: 2026-11-22\\nlahde: claude\\n---\\n# Uusi asia\\n\\nma 30.11. palaveri\\n')")
    await pg.evaluate("KaikkiTesti.pull()"); await settle(800)
    t=await pg.evaluate("KaikkiTesti.notes().filter(function(n){return n.vp==='tieto/dkt/stop-taito.md';})[0].text")
    want('tekoälyn muutos tuli appiin','klo 12-14' in t,t)
    await pg.evaluate("__repo.put('alueet/tyo/uusi.md',__repo.get('alueet/tyo/uusi.md'))")
    want('tekoälyn uusi tiedosto tuli appiin',await pg.evaluate("KaikkiTesti.notes().some(function(n){return n.vp==='alueet/tyo/uusi.md';})"))
    # oma muokkaus olemassa olevaan -> PUT oikealla versiolla, alkutiedot säilyvät
    await pg.evaluate("(function(){var n=KaikkiTesti.notes().filter(function(n){return n.vp==='alueet/tyo/uusi.md';})[0];n.text=n.text+'\\nLisäys apista';n.edited=new Date().toISOString();})()")
    await pg.evaluate("JuuriTesti.listView&&0"); await pg.evaluate("KaikkiTesti.collect()"); await settle(800)
    md=await pg.evaluate("__repo.get('alueet/tyo/uusi.md')")
    want('muokkaus GitHubiin, alkutiedot säilyivät','Lisäys apista' in md and 'lahde: claude' in md and '# Uusi asia' in md,md)
    # poisto -> arkistoon
    await tab(pg,'notes'); await settle(100)
    await pg.evaluate("(function(){var L=KaikkiTesti.notes(),i=L.findIndex(function(n){return n.vp==='alueet/tyo/uusi.md';});L.splice(i,1);})()")
    await sync()
    want('poisto siirsi arkistoon',await pg.evaluate("!__repo.get('alueet/tyo/uusi.md')&&!!__repo.get('arkisto/alueet/tyo/uusi.md')"))
    # nakyy: ei piilottaa ilman arkistointia
    await pg.evaluate("__repo.put('paivat/2026/2026-11-22.md',__repo.get('paivat/2026/2026-11-22.md').replace('lahde: emil+claude','lahde: emil+claude\\nnakyy: ei'))")
    await pg.evaluate("KaikkiTesti.pull()"); await settle(800); await sync()
    r=await pg.evaluate("({inApp:KaikkiTesti.notes().some(function(n){return n.vp==='paivat/2026/2026-11-22.md';}),file:!!__repo.get('paivat/2026/2026-11-22.md'),arch:!!__repo.get('arkisto/paivat/2026/2026-11-22.md')})")
    want('nakyy: ei piilottaa, ei arkistoi',(not r['inApp']) and r['file'] and not r['arch'],r)
    # samanaikainen muutos: molemmat versiot säilyvät
    await pg.evaluate("__repo.put('tieto/dkt/stop-taito.md',__repo.get('tieto/dkt/stop-taito.md')+'Tekoälyn lisäys\\n')")
    await pg.evaluate("(function(){var n=KaikkiTesti.notes().filter(function(n){return n.vp==='tieto/dkt/stop-taito.md';})[0];n.text=n.text+'\\nOma lisäys';})()")
    await sync(); await settle(1500)
    both=await pg.evaluate("(function(){var ks=Object.keys(__repo.files),c=ks.filter(function(p){return /stop-taito-ristiriita/.test(p);});return {c:c,ai:__repo.get('tieto/dkt/stop-taito.md').indexOf('Tekoälyn lisäys')>=0,own:c.length?__repo.get(c[0]).indexOf('Oma lisäys')>=0:false};})()")
    want('ristiriidassa molemmat säilyvät',both['ai'] and both['own'] and len(both['c'])==1,both)
    want('jono tyhjä lopuksi',await pg.evaluate("Object.keys(KaikkiTesti.vault().q).length===0"),await pg.evaluate("JSON.stringify(Object.keys(KaikkiTesti.vault().q))"))
    # uudelleenlataus: jokaisella näkyvällä tiedostolla tasan yksi muistiinpano, ei kaksoiskappaleita
    await pg.reload(); await settle(2000)
    r=await pg.evaluate("(function(){var vis=Object.keys(__repo.files).filter(function(p){return VAULT.shown(p,__repo.get(p));}).sort(),n=KaikkiTesti.notes().map(function(x){return x.vp;}).sort();return {vis:vis,n:n};})()")
    want('uudelleenlataus: tiedostot = muistiinpanot',r['vis']==r['n'],r)
    await settle(1500)
    want('uudelleenlataus ei kirjoita',await pg.evaluate("Object.keys(KaikkiTesti.vault().q).length===0"))
    want('ei sivuvirheitä',not errs,errs)
    await b.close()
    return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640)): bad+=await run(p,w,h)
    print('VIRHEITÄ: '+', '.join(bad) if bad else 'kaikki ok'); sys.exit(1 if bad else 0)
asyncio.run(main())
