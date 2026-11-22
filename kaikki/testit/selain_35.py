"""Kaikki 0.35 (Emil 22.11.2026, kohta 17.2): Listat ja Toistuvat vaultiin, kuittaukset ja muutokset synkkaavat laitteiden välillä.
Tarkistaa: ensimmäinen synkka vie laitteen listat, rivit, Asiat ja toistuvat vaultiin (listat/listat.json, toistuvat/<nimi>.md luettavana) ja tekee
varmuuskopion; toinen laite saa ne; rinnakkaiset muutokset eri kohteisiin yhdistyvät (kolmisuuntainen); listan rivin muistiinpanoviittaus kulkee
tiedostopolkuna ja osuu toisen laitteen muistiinpanoon; poisto merkitään poistettu-riviksi eikä tiedostoa poisteta; tekoälyn kirjoittama
toistuva luetaan; uusi synkka ilman muutoksia ei kirjoita; toistuvat-kansio ei näy muistiinpanoina. Käyttö: python3 testit/selain_35.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
FAKE=open(os.path.join(D,'fakegh.js'),encoding='utf8').read()
NOTE='---\ntyyppi: tieto\notsikko: Roskat\nkuvaus: \nluotu: 2026-11-20\nlahde: emil\n---\n# Roskat\n\nRoskat ulos.\n'
SEED={'tieto/roskat.md':NOTE,'toistuvat/kukat.md':'---\ntyyppi: toistuva\notsikko: Kastele kukat\nlahde: claude\nnakyy: ei\ntoisto: 1 viikko\nlaji: ajallaan\nalku: 2026-11-20\n---\nKastele kukat\n'}
async def mk(b,seed):
    pg=await (await b.new_context(viewport={'width':1280,'height':800})).new_page()
    await pg.add_init_script(FAKE+";(function(){var S=%s;if(!window.__repo.kept)for(var k in S)window.__repo.put(k,S[k]);try{localStorage.setItem('kaikki:gh',JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}))}catch(e){}})();"%json.dumps(seed))
    await pg.goto(U); await pg.wait_for_timeout(1500); return pg
async def sync(pg):
    await pg.evaluate("KaikkiTesti.lsSync()"); await pg.wait_for_timeout(300)
async def main():
    bad=[];errs=[]
    def want(label,cond,info=''):
        print('  %-62s %s %s'%(label,'ok' if cond else 'VIRHE',info if not cond else ''))
        if not cond: bad.append(label)
    async with async_playwright() as p:
        try: b=await p.chromium.launch()
        except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
        A=await mk(b,SEED); A.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR A',e)))
        await A.evaluate("""(function(){var N=KaikkiTesti.notes().filter(function(n){return n.vp==='tieto/roskat.md';})[0];
          KaikkiTesti.reps().push({id:'t1',text:'Kissan matolääke',mode:'rep',n:3,unit:'m',start:'2026-11-01',created:'2026-11-01T10:00:00Z'});
          KaikkiTesti.lists().push({id:'l1',name:'Arki'});KaikkiTesti.chk().push({id:'c1',l:'l1',name:'Roskat',nid:N.id,created:'2026-11-01T10:00:00Z'});})()""")
        await sync(A)
        lj=await A.evaluate("__repo.get('listat/listat.json')||''"); rm=await A.evaluate("__repo.get('toistuvat/kissan-matolaake.md')||''")
        want('listat vaultiin, rivin viittaus tiedostopolkuna','"id": "l1"' in lj and '"nvp": "tieto/roskat.md"' in lj and '"nid"' not in lj,lj[:300])
        want('toistuva luettavaksi tiedostoksi','toisto: 3 kuukausi' in rm and 'laji: ajallaan' in rm and 'Kissan matolääke' in rm and 'nakyy: ei' in rm,rm)
        want('tekoälyn kirjoittama toistuva luettiin',await A.evaluate("KaikkiTesti.reps().some(function(r){return r.text==='Kastele kukat'&&r.n===1&&r.unit==='w';})"))
        want('varmuuskopio ennen ensimmäistä synkkaa',await A.evaluate("!!localStorage.getItem('kaikki:sync:varmuus')"))
        want('toistuvat-kansio ei näy muistiinpanoina',await A.evaluate("!KaikkiTesti.notes().some(function(n){return /^toistuvat\\//.test(n.vp||'');})"))
        n0=await A.evaluate("__repo.log.filter(function(x){return /^PUT/.test(x);}).length"); await sync(A)
        want('uusi synkka ilman muutoksia ei kirjoita',await A.evaluate("__repo.log.filter(function(x){return /^PUT/.test(x);}).length")==n0)
        files=await A.evaluate("JSON.stringify(window.__repo.files)")
        # laite B
        B=await mk(b,{k:v['t'] for k,v in json.loads(files).items()}); B.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR B',e)))
        await sync(B)
        want('laite B sai listan, rivin ja toistuvat',await B.evaluate("KaikkiTesti.lists().some(function(l){return l.id==='l1';})&&KaikkiTesti.reps().some(function(r){return r.id==='t1';})"))
        want('rivin muistiinpanoviittaus osuu B:n muistiinpanoon',await B.evaluate("(function(){var c=KaikkiTesti.chk().filter(function(x){return x.id==='c1';})[0],N=KaikkiTesti.notes().filter(function(n){return n.vp==='tieto/roskat.md';})[0];return !!c&&!!N&&c.nid===N.id;})()"))
        # rinnakkaiset muutokset: B nimeää rivin, A merkitsee toistuvan tehdyksi
        await B.evaluate("KaikkiTesti.chk().filter(function(x){return x.id==='c1';})[0].name='Roskat ulos'"); await sync(B)
        await A.evaluate("KaikkiTesti.reps().filter(function(r){return r.id==='t1';})[0].lastDone='2026-11-22'")
        bl=await B.evaluate("__repo.get('listat/listat.json')"); await A.evaluate("t=>window.__repo.put('listat/listat.json',t)",bl)
        await A.evaluate("KaikkiTesti.pull()"); await A.wait_for_timeout(300); await sync(A)
        want('A sai B:n rivin muutoksen',await A.evaluate("KaikkiTesti.chk().filter(function(x){return x.id==='c1';})[0].name")=='Roskat ulos')
        want('A:n toistuvan muutos tallentui (tehty)','tehty: 2026-11-22' in await A.evaluate("__repo.get('toistuvat/kissan-matolaake.md')"))
        # poisto
        await A.evaluate("(function(){var R=KaikkiTesti.reps();for(var i=R.length-1;i>=0;i--)if(R[i].id==='t1')R.splice(i,1);})()"); await sync(A)
        rm=await A.evaluate("__repo.get('toistuvat/kissan-matolaake.md')||''")
        want('poisto merkitään poistettu-riviksi, tiedosto säilyy','poistettu: ' in rm,rm)
        await B.evaluate("t=>window.__repo.put('toistuvat/kissan-matolaake.md',t)",rm); await B.evaluate("KaikkiTesti.pull()"); await B.wait_for_timeout(300); await sync(B)
        want('B:ltä poistui toistuva',not await B.evaluate("KaikkiTesti.reps().some(function(r){return r.id==='t1';})"))
        want('ei sivuvirheitä',not errs,errs)
        await b.close()
    print('KAIKKI OK' if not bad else 'VIRHEITÄ: '+', '.join(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
