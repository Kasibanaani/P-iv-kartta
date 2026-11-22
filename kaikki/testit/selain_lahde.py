"""Kaikki 0.3: kenen kirjoittamat -suodatin (vaultin lahde, nakyy, tyyppi: ohje, ohjeet/) ja päivitysnappi.
Tarkistaa: oletuksena omat, yhdessä tehdyt ja tekoälyn kirjoittamat näkyvät, tekoälylle tarkoitetut eivät; valinnat rajaavat oikein;
kortissa pieni lähdetunniste; suodattimen vaihto ei kirjoita GitHubiin eikä arkistoi; päivitysnappi tuo GitHubiin tulleen uuden
muistiinpanon ja vie oman muutoksen. Leveydet 390 ja 320 px. Käyttö: python3 testit/selain_lahde.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
FAKE=open(os.path.join(D,'fakegh.js'),encoding='utf8').read()
def md(o,lahde,extra=''):return '---\ntyyppi: muistiinpano\notsikko: %s\nluotu: 2026-11-20\nlahde: %s\n%s---\n# %s\n\nTekstiä.\n'%(o,lahde,extra,o)
SEED={'tieto/oma.md':md('Omani','emil'),'tieto/yhd.md':md('Yhteinen','emil+claude'),'tieto/ai.md':md('Tekoalyn','claude'),
      'tieto/runko.md':md('Runko','claude','nakyy: ei\n'),'tieto/kenelle.md':md('Kenelle','emil+claude','tyyppi2: x\n').replace('tyyppi: muistiinpano','tyyppi: ohje'),
      'ohjeet/appi.md':md('Ohjeappi','claude'),'ohjeet/_hakemisto.md':md('Hakemisto','claude'),'AGENTS.md':'# Ohje\n'}
ALL={'std':['Omani','Tekoalyn','Yhteinen'],'oma':['Omani'],'emil':['Omani','Yhteinen'],'ai':['Tekoalyn'],'ohje':['Kenelle','Ohjeappi','Runko'],
     'all':['Kenelle','Ohjeappi','Omani','Runko','Tekoalyn','Yhteinen']}
async def run(p,w,bad):
    b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium') if os.path.exists('/opt/pw-browsers/chromium') else await p.chromium.launch()
    ctx=await b.new_context(viewport={'width':w,'height':800}); pg=await ctx.new_page(); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.add_init_script(FAKE+";(function(){var S=%s;if(!window.__repo.kept)for(var k in S)window.__repo.put(k,S[k]);try{localStorage.setItem('kaikki:gh',JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}))}catch(e){}})();"%json.dumps(SEED))
    await pg.goto(U); await pg.wait_for_timeout(2500)
    def want(l,c,i=''):
        print('  %-4s %-44s %s %s'%(w,l,'ok' if c else 'VIRHE',i if not c else ''))
        if not c: bad.append('%d %s'%(w,l))
    titles="KaikkiTesti.notes().map(function(n){return n.text.split('\\n')[0];}).sort()"
    for k in ['std','oma','emil','ai','ohje','all','std']:
        await pg.evaluate("KaikkiTesti.src('%s')"%k); await pg.wait_for_timeout(150)
        t=await pg.evaluate(titles); want('suodatin '+k,t==ALL[k],t)
    log=await pg.evaluate("__repo.log.filter(function(x){return !/^GET/.test(x);})")
    want('suodattimen vaihto ei kirjoita GitHubiin',log==[],log)
    # Muistion nappi ja valikko
    want('Kenen-nappi Muistiossa',await pg.is_visible('#srcpick'))
    await pg.click('#srcpick'); await pg.wait_for_timeout(100); await pg.click('#src-oma'); await pg.wait_for_timeout(200)
    want('valikosta Vain omat',await pg.evaluate(titles)==['Omani'])
    want('nappi korostuu',await pg.get_attribute('#srcpick','aria-pressed')=='true')
    await pg.evaluate("KaikkiTesti.src('std')"); await pg.wait_for_timeout(200)
    tags=await pg.evaluate("Array.prototype.map.call(document.querySelectorAll('#nlist .rtag.src'),function(e){return e.textContent;}).sort()")
    want('kortissa lähdetunniste (ei omissa)',tags==['tekoäly','yhdessä'],tags)
    # tila ei vuoda: leveys ok, ei vaakavieritystä
    want('ei vaakavieritystä',await pg.evaluate("document.documentElement.scrollWidth<=innerWidth"))
    # päivitysnappi
    want('päivitysnappi näkyy alapalkissa, pikavienti piilossa',await pg.is_visible('#vref2') and not await pg.is_visible('#qx'))
    await pg.evaluate("__repo.put('inbox/uusi.md',%s)"%json.dumps(md('Tekoaly kirjoitti juuri','claude')))
    await pg.click('#vref2'); await pg.wait_for_timeout(1500)
    t=await pg.evaluate(titles); want('päivitys tuo uuden muistiinpanon','Tekoaly kirjoitti juuri' in t,t)
    await pg.evaluate("(function(){var n=KaikkiTesti.notes().filter(function(n){return n.vp==='tieto/oma.md';})[0];n.text=n.text+' Lisäys.';})()")
    await pg.click('#vref2'); await pg.wait_for_timeout(1500)
    want('päivitys vie oman muutoksen','Lisäys.' in (await pg.evaluate("__repo.get('tieto/oma.md')") or ''))
    want('ei arkistoituja',not await pg.evaluate("Object.keys(__repo.files).some(function(p){return /^arkisto\\//.test(p);})"))
    want('ei sivuvirheitä',not errs,errs)
    await b.close()
async def main():
    bad=[]
    async with async_playwright() as p:
        for w in (390,320): await run(p,w,bad)
    print('KAIKKI OK' if not bad else 'VIRHEITÄ: %s'%bad); sys.exit(1 if bad else 0)
asyncio.run(main())
