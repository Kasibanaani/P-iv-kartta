"""Kaikki 0.34 (Emil 22.11.2026, kohta 17): kuittaukset synkkaan ja metatieto erilleen.
Tarkistaa: kalenterin kuittaus kirjoittaa tiedostoon luettavan rivin `kuitattu: VVVV-KK-PP TT:MM` (ei JSONia), kuittaus siirtyy toiselle
laitteelle tiedoston kautta (laite B hakee saman tiedoston ja näkee kuittauksen), tekoälyn kirjoittama `kuitattu:`-rivi (myös muodossa 9.00)
näkyy kuitattuna eikä pelkkä lukeminen kirjoita mitään, vanha `juuri`-muoto säilyy koskemattomana kunnes kuittaus muuttuu, Tiedot-osio näyttää
metatiedot tekstikentän ulkopuolella, omaa kenttää voi muokata ja tekstin kenttärivin voi siirtää tietoihin. Leveydet 1440 ja 390.
Käyttö: python3 testit/selain_34.py"""
import asyncio, os, sys, json, datetime
from playwright.async_api import async_playwright
T=datetime.date.today();TD='%d.%d.'%(T.day,T.month);TI=T.isoformat()
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
FAKE=open(os.path.join(D,'fakegh.js'),encoding='utf8').read()
OHJE='---\ntyyppi: ohje\notsikko: Muistiinpanot\n---\n# M\n\n### Omat kentät (Emil)\n\n- Sovitut kentät: `tila`, `hinta`.\n'
PYY='kalenteri/2026/pyykit.md'
SEED={'ohjeet/muistiinpanot.md':OHJE,
      PYY:'---\ntyyppi: tapahtuma\notsikko: Pyykit\nkuvaus: \nluotu: 2026-11-20\nlahde: emil\n---\n# Pyykit\n\nPyykit '+TD+' klo 16-18.\n',
      'kalenteri/2026/ai.md':'---\ntyyppi: tapahtuma\notsikko: Hammaslääkäri\nkuvaus: \nluotu: 2026-11-20\nlahde: claude\nkuitattu: '+TI+' 9.00\n---\n# Hammaslääkäri\n\nHammaslääkäri '+TD+' klo 9.\n',
      'kalenteri/2026/vanha.md':'---\ntyyppi: tapahtuma\notsikko: Vanha\nkuvaus: \nluotu: 2026-11-20\nlahde: emil\njuuri: {"pts":{"'+TI+' 12:00":"2026-11-22T10:00:00.000Z"}}\n---\n# Vanha\n\nVanha '+TD+' klo 12.\n',
      'projektit/r/remontti.md':'---\ntyyppi: projekti\notsikko: Remontti\nkuvaus: \nluotu: 2026-11-20\nlahde: emil\ntila: kesken\n---\n# Remontti\n\nMaalit ostettu.\nhinta: 120\n'}
async def page(b,w,h,seed):
    pg=await (await b.new_context(viewport={'width':w,'height':h})).new_page()
    await pg.add_init_script(FAKE+";(function(){var S=%s;if(!window.__repo.kept)for(var k in S)window.__repo.put(k,S[k]);try{localStorage.setItem('kaikki:gh',JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));localStorage.setItem('kaikki:calview','w')}catch(e){}})();"%json.dumps(seed))
    return pg
async def cal(pg,w):
    if w>=1000: await pg.click('#navbtn'); await pg.click('#nav [data-tab="cal"]')
    else: await pg.click('#roll'); await pg.click('#section-cal')
    await pg.wait_for_timeout(300)
def ck(name): return "(function(){var l=Array.from(document.querySelectorAll('.wline')).filter(function(x){return x.textContent.indexOf('%s')>=0;})[0];return l?l.querySelector('.wck').getAttribute('aria-pressed'):null;})()"%name
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    def want(label,cond,info=''):
        print('  %-60s %s %s'%(label,'ok' if cond else 'VIRHE',info if not cond else ''))
        if not cond: bad.append(label)
    print('leveys',w)
    A=await page(b,w,h,SEED); A.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    await A.goto(U); await A.wait_for_timeout(1500)
    want('pelkkä lukeminen ei kirjoita (myös tekoälyn ja vanhan muodon rivit)',await A.evaluate("__repo.log.filter(function(x){return !/^GET/.test(x);}).length")==0)
    await cal(A,w)
    want('tekoälyn kuitattu-rivi (9.00) näkyy kuitattuna',await A.evaluate(ck('Hammaslääkäri'))=='true')
    want('vanha juuri-muoto näkyy kuitattuna',await A.evaluate(ck('Vanha'))=='true')
    await A.evaluate("(function(){var l=Array.from(document.querySelectorAll('.wline')).filter(function(x){return x.textContent.indexOf('Pyykit')>=0;})[0];l.querySelector('.wck').click();})()")
    try: await A.wait_for_function("(__repo.get('%s')||'').indexOf('kuitattu: ')>=0"%PYY,timeout=8000)
    except Exception: pass
    t=await A.evaluate("__repo.get('%s')"%PYY)
    want('kuittaus kirjoittaa luettavan rivin, ei JSONia',('kuitattu: %s 16:00'%TI) in t and '"pts"' not in t,t)
    # laite B saa saman tiedoston
    B=await page(b,w,h,SEED); B.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR B',e)))
    await B.goto(U); await B.wait_for_timeout(1500); await cal(B,w)
    want('laite B: ei vielä kuitattu',await B.evaluate(ck('Pyykit'))=='false')
    await B.evaluate("([p,t])=>window.__repo.put(p,t)",[PYY,t]); await B.evaluate("KaikkiTesti.pull()"); await B.wait_for_timeout(800)
    await cal(B,w)
    want('laite B näkee kuittauksen haun jälkeen',await B.evaluate(ck('Pyykit'))=='true')
    # Tiedot-osio
    if w>=1000: await A.click('#navbtn'); await A.click('#nav [data-tab="notes"]')
    else: await A.click('#roll'); await A.click('#section-notes')
    await A.wait_for_timeout(300)
    await A.evaluate("Array.from(document.querySelectorAll('#nlist [data-id]')).filter(function(c){return c.textContent.indexOf('Remontti')>=0;})[0].click()"); await A.wait_for_timeout(300)
    await A.click('#ns-when'); await A.wait_for_timeout(200)
    info=await A.evaluate("document.getElementById('ns-info').innerText")
    want('Tiedot-osio näyttää metatiedot tekstikentän ulkopuolella','Kuka kirjoitti' in info and 'tila' in info and 'Tekstissä' in info,info)
    want('metatieto ei näy tekstikentässä',await A.evaluate("document.getElementById('ns-text').value.indexOf('tyyppi:')<0"))
    await A.click('#ns-info .nsi-mv'); await A.wait_for_timeout(200)
    txt=await A.evaluate("document.getElementById('ns-text').value")
    want('Siirrä tietoihin poistaa rivin tekstistä','hinta:' not in txt,txt)
    inp=A.locator('#ns-info input.nsi-in[aria-label="tila"]')
    await inp.fill('valmis'); await inp.press('Enter'); await inp.evaluate("e=>e.dispatchEvent(new Event('change'))"); await A.wait_for_timeout(200)
    await A.keyboard.press('Escape'); await A.wait_for_timeout(100)
    if await A.evaluate("document.getElementById('nsheet').open"):
        await A.evaluate("document.querySelector('#nsheet .sx').click()")
    try: await A.wait_for_function("(__repo.get('projektit/r/remontti.md')||'').indexOf('hinta: 120\\n---')>=0||/hinta: 120[\\s\\S]*---/.test(__repo.get('projektit/r/remontti.md')||'')",timeout=8000)
    except Exception: pass
    r=await A.evaluate("__repo.get('projektit/r/remontti.md')")
    fm=r.split('---')[1] if r.count('---')>=2 else ''
    want('kenttä siirtyi alkutietoihin ja muokkaus tallentui','hinta: 120' in fm and 'tila: valmis' in fm and 'Maalit ostettu.' in r,r)
    want('ei sivuvirheitä',not errs,errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((1440,900),(390,844)): bad+=await run(p,w,h)
    print('KAIKKI OK' if not bad else 'VIRHEITÄ: '+', '.join(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
