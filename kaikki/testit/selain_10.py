"""Kaikki 0.10 (Emil 22.11.2026): muistiinpanot riveinä ja sarakkeina.
Tarkistaa: Kortit/Rivit-valinta (oletus rivit koneella, kortit puhelimella, muistetaan), oletusnäkymän sarakkeet (otsikko, kansio, kuka,
luotu, seuraava ajankohta), otsikkosarake jäädytetty sivuvierityksessä, otsikkorivi seuraa sivuvieritystä, rivin napautus avaa muistiinpanon,
haku suodattaa rivejä, vaultin näkymätiedosto (nakymat/, tyyppi: nakyma): rajaus kansiolla, järjestys, sarakkeet laji ja asetus
(siru, palkki, luku, kylla-ei), näkymän valinta muistetaan. Leveydet 390, 320, 1440, 1280. Käyttö: python3 testit/selain_10.py [kuvat]"""
import asyncio, os, sys, json, datetime
from playwright.async_api import async_playwright
T=datetime.date.today();TD='%d.%d.'%(T.day,T.month)
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
FAKE=open(os.path.join(D,'fakegh.js'),encoding='utf8').read()
SHOT=len(sys.argv)>1
def md(t,lahde='emil',extra='',body='Teksti.'): return '---\ntyyppi: projekti\notsikko: %s\nkuvaus: \nluotu: 2026-11-%02d\nlahde: %s\n%s---\n# %s\n\n%s\n'%(t,10+len(t)%9,lahde,extra,t,body)
SEED={'projektit/remontti/keittio.md':md('Keittiö','emil','tila: kesken\nedistys: 40\nhinta: 1200.5\nvalmis: ei\n','Asentaja '+TD+' klo 9.'),
      'projektit/remontti/kylpyhuone.md':md('Kylpyhuone','emil+claude','tila: valmis\nedistys: 100\nhinta: 3400\nvalmis: kylla\n'),
      'projektit/remontti/eteinen.md':md('Eteinen','claude','tila: idea\nedistys: 5\n'),
      'tieto/muuta/irrallinen.md':md('Irrallinen tieto','claude'),
      'nakymat/remontti.md':'---\ntyyppi: nakyma\notsikko: Remontti\nkuvaus: Remontin työt.\nluotu: 2026-11-22\nlahde: claude\nnakyy: ei\nmista: kansio = projektit/remontti\njarjestys: edistys laskeva\nsarakkeet:\n  - otsikko\n  - tila | siru\n  - edistys | palkki | 0-100\n  - hinta | luku | €\n  - valmis | kylla-ei\n---\n# Remontti\n'}
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h})).new_page()
    await pg.add_init_script(FAKE+";(function(){var S=%s;if(!window.__repo.kept)for(var k in S)window.__repo.put(k,S[k]);try{localStorage.setItem('kaikki:gh',JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}))}catch(e){}})();"%json.dumps(SEED))
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond,info=''):
        print('  %-50s %s %s'%(label,'ok' if cond else 'VIRHE',info if not cond else ''))
        if not cond: bad.append(label)
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(1500)
    rows=await pg.evaluate("document.querySelectorAll('#nlist .rvr').length")
    if w>=1000: want('koneella oletus rivit',rows>=4,rows)
    else:
        want('puhelimella oletus kortit',rows==0 and await pg.evaluate("document.querySelectorAll('#nlist .ncard').length>=4"))
        await pg.click('#nviewbtn'); await pg.wait_for_timeout(200)
        want('vaihto riveiksi',await pg.evaluate("document.querySelectorAll('#nlist .rvr').length>=4"))
    want('valinta muistetaan',await pg.evaluate("localStorage.getItem('kaikki:nmode')")==('rows' if w<1000 else None) or w>=1000)
    hd=await pg.evaluate("Array.from(document.querySelectorAll('.rvhead .rvc[data-k]')).map(function(c){return c.textContent;})")
    want('oletusnäkymän sarakkeet',hd==['Otsikko','Kansio','Kuka kirjoitti','Luotu','Seuraava ajankohta'],hd)
    r=await pg.evaluate("(function(){var r=Array.from(document.querySelectorAll('#nlist .rvr')).filter(function(x){return x.textContent.indexOf('Keittiö')>=0;})[0];return r?Array.from(r.children).map(function(c){return c.textContent;}):null;})()")
    want('rivin solut täyttyvät',r and r[1]=='projektit/remontti' and r[2]=='oma' and 'Tänään' in r[4],r)
    # sivuvieritys: otsikkosarake pysyy, otsikkorivi seuraa
    sc=await pg.evaluate("(function(){var l=document.getElementById('nlist');l.scrollLeft=200;var t=l.querySelector('.rvr .rvt').getBoundingClientRect().left-l.getBoundingClientRect().left;return {can:l.scrollWidth>l.clientWidth,t:Math.round(t),dx:Math.abs(l.querySelector('.rvhead .rvc:nth-child(3)').getBoundingClientRect().left-l.querySelector('.rvr .rvc:nth-child(3)').getBoundingClientRect().left)};})()")
    if sc['can']: want('otsikkosarake jäädytetty, otsikkorivi seuraa',abs(sc['t'])<=1 and sc['dx']<=1,sc)
    await pg.evaluate("document.getElementById('nlist').scrollLeft=0")
    await pg.fill('#nsearch','kylpy'); await pg.wait_for_timeout(100)
    want('haku suodattaa rivejä',await pg.evaluate("Array.from(document.querySelectorAll('#nlist .rvr')).filter(function(r){return !r.hidden;}).length")==1)
    await pg.fill('#nsearch',''); await pg.wait_for_timeout(100)
    # näkymätiedosto
    want('näkymävalinta näkyy, kun näkymiä on',await pg.is_visible('#nvpick'))
    await pg.click('#nvpick'); await pg.wait_for_timeout(80); await pg.click('#nv-nakymat-remontti-md'); await pg.wait_for_timeout(200)
    hd=await pg.evaluate("Array.from(document.querySelectorAll('.rvhead .rvc[data-k]')).map(function(c){return c.textContent;})")
    want('näkymän sarakkeet',hd==['Otsikko','Tila','Edistys','Hinta','Valmis'],hd)
    names=await pg.evaluate("Array.from(document.querySelectorAll('#nlist .rvr .rvt')).map(function(c){return c.textContent;})")
    want('rajaus kansiolla ja järjestys edistys laskeva',names==['Kylpyhuone','Keittiö','Eteinen'],names)
    c=await pg.evaluate("(function(){var r=document.querySelectorAll('#nlist .rvr')[1];return {siru:!!r.children[1].querySelector('.rvchip'),pb:r.children[2].querySelector('.rvpb i').style.width,luku:r.children[3].textContent,kyl:r.children[4].getAttribute('aria-label')};})()")
    want('lajit: siru, palkki, luku, kylla-ei',c['siru'] and c['pb']=='40%' and c['luku']=='1200,5 €' and c['kyl']=='ei',c)
    want('näkymä muistetaan',await pg.evaluate("localStorage.getItem('kaikki:nview')")=='nakymat/remontti.md')
    want('näkymätiedosto ei näy muistiinpanona',await pg.evaluate("!KaikkiTesti.notes().some(function(n){return n.vp==='nakymat/remontti.md';})"))
    if SHOT: await pg.screenshot(path=os.path.join(os.environ.get('SHOTDIR','/tmp'),'rows%d.png'%w))
    await pg.evaluate("Array.from(document.querySelectorAll('#nlist .rvr'))[0].click()"); await pg.wait_for_timeout(300)
    want('rivin napautus avaa muistiinpanon',await pg.evaluate("document.getElementById('nsheet').open&&document.getElementById('ns-text').value.indexOf('Kylpyhuone')>=0"))
    want('ei sivuttaisvieritystä (sivu)',await pg.evaluate("document.documentElement.scrollWidth<=innerWidth"))
    log=await pg.evaluate("__repo.log.filter(function(x){return !/^GET/.test(x);})")
    want('katselu ei kirjoita GitHubiin',log==[],log)
    want('ei sivuvirheitä',not errs,errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640),(1440,900),(1280,800)): bad+=await run(p,w,h)
    print('KAIKKI OK' if not bad else 'VIRHEITÄ: '+', '.join(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
