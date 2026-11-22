"""Kaikki 0.38 (Emil 22.11.2026, A3.1: laskentataulukko, tietokantanäkymä ja kojelauta yhteen): välilehti näkymänä muistiinpanoista.
Tarkistaa: välilehti, jonka alkutiedoissa `mista:` ja `sarakkeet:`, näyttää ehdon täyttävät muistiinpanot riveinä järjestyksessä, kaavasarake
lasketaan riveittäin, toinen välilehti laskee näkymän soluista (SUMMA([[remontti]]!B1:B3)), kirjoittaminen ei muuta mitään (viesti), Enter
avaa muistiinpanon, muistiinpanon muutos päivittää näkymän ja summan, + Välilehti → Sisältö: Näkymä luo tiedoston samassa muodossa
kuin nakymat/. Leveydet 1440 ja 390. Käyttö: python3 testit/selain_38.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
FAKE=open(os.path.join(D,'fakegh.js'),encoding='utf8').read()
OHJE='---\ntyyppi: ohje\notsikko: Muistiinpanot\n---\n# M\n\n### Omat kentät (Emil)\n\n- Sovitut kentät: `hinta`, `tila`.\n'
def md(t,extra): return '---\ntyyppi: projekti\notsikko: %s\nkuvaus: \nluotu: 2026-11-20\nlahde: emil\ntagit: [remontti]\n%s---\n# %s\n\nTeksti.\n'%(t,extra,t,)
VIEW='taulukot/remontti/remontti.md'; SUM='taulukot/remontti/yhteenveto.md'
SEED={'ohjeet/muistiinpanot.md':OHJE,
      'projektit/r/keittio.md':md('Keittiö','hinta: 1200\n'),
      'projektit/r/eteinen.md':md('Eteinen','hinta: 300\n'),
      'projektit/r/teippi.md':md('Teippi','hinta: 50\n'),
      'projektit/muu.md':'---\ntyyppi: projekti\notsikko: Muu\nkuvaus: \nluotu: 2026-11-20\nlahde: emil\nhinta: 999\n---\n# Muu\n\nEi tunnistetta.\n',
      'nakymat/kalliit.md':'---\ntyyppi: nakyma\notsikko: Kalliit\nmista: hinta > 100\njarjestys: hinta laskeva\nsarakkeet:\n  - otsikko\n  - hinta | luku | €\nnakyy: ei\n---\n# Kalliit\n',
      VIEW:'---\ntyyppi: taulukko\notsikko: Remontti\ntaulukko: Remontti\nmista: tunniste = remontti\njarjestys: hinta laskeva\nsarakkeet:\n  - otsikko\n  - hinta | luku | €\n  - =hinta*1.24 | luku | €\n---\n# Remontti\n',
      SUM:'---\ntyyppi: taulukko\notsikko: Yhteenveto\ntaulukko: Remontti\n---\n# Yhteenveto\n\n| Asia | Summa |\n| --- | --- |\n| Yhteensä | =SUMMA([[remontti]]!B1:B3) |\n'}
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]; phone=w<1000
    ctx=await b.new_context(viewport={'width':w,'height':h},has_touch=phone)
    pg=await ctx.new_page()
    await pg.add_init_script(FAKE+";(function(){var S=%s;if(!window.__repo.kept)for(var k in S)window.__repo.put(k,S[k]);try{localStorage.setItem('kaikki:gh',JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));localStorage.setItem('kaikki:taulukko','%s')}catch(e){}})();"%(json.dumps(SEED),VIEW))
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond,info=''):
        print('  %-62s %s %s'%(label,'ok' if cond else 'VIRHE',info if not cond else ''))
        if not cond: bad.append(label)
    async def grid(): return await pg.evaluate("Array.from(document.querySelectorAll('#sg-wrap tbody tr:not(.sg-sp)')).map(function(tr){return Array.from(tr.querySelectorAll('td')).map(function(td){return td.textContent.trim();});})")
    async def tabto(name): await pg.evaluate("(n)=>Array.from(document.querySelectorAll('.sg-tab')).filter(function(b){return b.textContent===n;})[0].click()",name); await pg.wait_for_timeout(150)
    async def sheets():
        if phone: await pg.click('#roll'); await pg.click('#section-sheets')
        else: await pg.click('#nav [data-tab="sheets"]')
        await pg.wait_for_timeout(250)
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(1300)
    n0=await pg.evaluate("__repo.log.filter(function(x){return !/^GET/.test(x);}).length")
    await sheets()
    g=await grid()
    want('näkymän rivit muistiinpanoista, järjestys hinta laskeva',[r[0] for r in g]==['Keittiö','Eteinen','Teippi'],g)
    want('kaavasarake riveittäin (1200*1.24)',g and g[0][1]=='1200' and g[0][2]=='1488',g)
    hd=await pg.evaluate("Array.from(document.querySelectorAll('#sg-wrap thead th.sg-ch span')).map(function(s){return s.textContent;})")
    want('sarakkeiden otsikot',hd[:2]==['Otsikko','Hinta'] or hd[:2]==['Otsikko','hinta'] or 'Hinta' in hd,hd)
    st=await pg.evaluate("document.getElementById('sg-status').textContent")
    want('tila kertoo näkymän ja määrän','3 muistiinpanoa' in st,st)
    # kirjoittaminen ei muuta
    await pg.click('#sg-wrap td[data-r="1"][data-c="1"]'); await pg.keyboard.type('5'); await pg.wait_for_timeout(150)
    msg=await pg.evaluate("document.getElementById('sg-status').textContent")
    want('kirjoittaminen ei avaa muokkausta, viesti näkyy',await pg.evaluate("!document.querySelector('#sg-wrap .sg-ed')") and 'muistiinpanoista' in msg,msg)
    await pg.keyboard.press('Delete'); await pg.wait_for_timeout(1200)
    want('pelkkä katselu ja yritykset eivät kirjoita',await pg.evaluate("__repo.log.filter(function(x){return !/^GET/.test(x);}).length")==n0)
    # toinen välilehti laskee näkymästä
    await tabto('Yhteenveto'); g2=await grid()
    want('toinen välilehti summaa näkymän solut (1550)',g2 and g2[0][1]=='1550',g2)
    # muistiinpanon muutos
    await pg.evaluate("window.__repo.put('projektit/r/teippi.md',%s)"%json.dumps(md('Teippi','hinta: 2000\n'))); await pg.evaluate("KaikkiTesti.pull()"); await pg.wait_for_timeout(900)
    if not await pg.is_visible('#sg-wrap'): await sheets()
    g2=await grid()
    want('muistiinpanon muutos päivittää summan (3500)',g2 and g2[0][1]=='3500',g2)
    await tabto('Remontti'); g=await grid()
    want('ja näkymän järjestyksen',[r[0] for r in g]==['Teippi','Keittiö','Eteinen'],g)
    # Enter avaa muistiinpanon
    await pg.click('#sg-wrap td[data-r="1"][data-c="0"]'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(300)
    op=await pg.evaluate("document.getElementById('nsheet').open&&document.getElementById('ns-text').value")
    want('Enter avaa rivin muistiinpanon',bool(op) and 'Keittiö' in op,op)
    await pg.keyboard.press('Escape'); await pg.wait_for_timeout(200)
    if await pg.evaluate("document.getElementById('nsheet').open"): await pg.evaluate("document.querySelector('#nsheet .sx').click()")
    await pg.wait_for_timeout(200)
    # uusi välilehti näkymästä
    if not await pg.is_visible('#sg-wrap'): await sheets()
    await pg.click('#sg-more'); await pg.click('#sgm-tab'); await pg.wait_for_timeout(150)
    await pg.fill('#sheet-tab-name','Kalliit lista'); await pg.select_option('#sheet-src','nakymat/kalliit.md')
    await pg.click('#sheet-new-form button[type=submit]')
    try: await pg.wait_for_function("(__repo.get('taulukot/remontti/kalliit-lista.md')||'').length>0",timeout=8000)
    except Exception: pass
    t=await pg.evaluate("__repo.get('taulukot/remontti/kalliit-lista.md')||''")
    want('Näkymästä luotu välilehti samassa muodossa','tyyppi: taulukko' in t and 'mista: hinta > 100' in t and 'jarjestys: hinta laskeva' in t and '  - hinta | luku | €' in t,t)
    await pg.wait_for_timeout(400); g=await grid()
    want('uusi välilehti näyttää rivit heti',[r[0] for r in g]==['Teippi','Keittiö','Muu','Eteinen'],g)
    want('ei sivuttaisvieritystä (sivu)',await pg.evaluate("document.documentElement.scrollWidth<=innerWidth"))
    want('ei sivuvirheitä',not errs,errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((1440,900),(390,844)): bad+=await run(p,w,h)
    print('KAIKKI OK' if not bad else 'VIRHEITÄ: '+', '.join(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
