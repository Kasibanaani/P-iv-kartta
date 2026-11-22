"""Kaikki 0.39 (Emil 22.11.2026, A3.2): kojelaudan kortti suoraan taulukosta, minigraafi alueesta.
Tarkistaa: taulukossa alue valitaan vetämällä, ⋯ → Kortiksi kojelautaan avaa kortti-ikkunan valmiiksi täytettynä (alue, Minigraafi,
otsikko sarakkeen nimestä), tallennus kirjoittaa `_nakyma.md`:hen rivin `minigraafi | [[paino]]!B1:B5` ilman lukituksen avaamista,
kojelaudalla minigraafi ja viimeisin arvo näkyvät, yksi solu → Luku-kortti, väärä yhdistelmä (alue + Luku) antaa viestin,
näkymävälilehden alue joustaa rivimäärän mukana. Leveydet 1440 ja 390. Käyttö: python3 testit/selain_39.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
FAKE=open(os.path.join(D,'fakegh.js'),encoding='utf8').read()
P='taulukot/seuranta/paino.md'; B='taulukot/seuranta/_nakyma.md'
OHJE='---\ntyyppi: ohje\notsikko: Muistiinpanot\n---\n# M\n\n### Omat kentät (Emil)\n\n- Sovitut kentät: `hinta`.\n'
def md(t,h): return '---\ntyyppi: projekti\notsikko: %s\nkuvaus: \nluotu: 2026-11-20\nlahde: emil\ntagit: [osto]\nhinta: %s\n---\n# %s\n\nTeksti.\n'%(t,h,t)
SEED={'ohjeet/muistiinpanot.md':OHJE,'projektit/a.md':md('Aa','10'),'projektit/b.md':md('Bb','20'),
      P:'---\ntyyppi: taulukko\notsikko: Paino\ntaulukko: Seuranta\n---\n# Paino\n\n| Pvm | Paino |\n| --- | --- |\n| 1.11. | 82 |\n| 8.11. | 81,5 |\n| 15.11. | 80,8 |\n| 22.11. | 80,1 |\n| 29.11. | =B4-0.5 |\n',
      'taulukot/seuranta/ostot.md':'---\ntyyppi: taulukko\notsikko: Ostot\ntaulukko: Seuranta\nmista: tunniste = osto\nsarakkeet:\n  - otsikko\n  - hinta | luku\n---\n# Ostot\n'}
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]; phone=w<1000
    ctx=await b.new_context(viewport={'width':w,'height':h},has_touch=phone)
    pg=await ctx.new_page()
    await pg.add_init_script(FAKE+";(function(){var S=%s;if(!window.__repo.kept)for(var k in S)window.__repo.put(k,S[k]);try{localStorage.setItem('kaikki:gh',JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));localStorage.setItem('kaikki:taulukko','%s')}catch(e){}})();"%(json.dumps(SEED),P))
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond,info=''):
        print('  %-62s %s %s'%(label,'ok' if cond else 'VIRHE',info if not cond else ''))
        if not cond: bad.append(label)
    async def go(t):
        if phone: await pg.click('#roll'); await pg.click('#section-'+t)
        else: await pg.click('#nav [data-tab="%s"]'%t)
        await pg.wait_for_timeout(250)
    async def tocard():
        await pg.click('#sg-more'); await pg.click('#sgm-card'); await pg.wait_for_timeout(150)
    async def board():
        try: await pg.wait_for_function("(__repo.get('%s')||'').length>0"%B,timeout=8000)
        except Exception: pass
        return await pg.evaluate("__repo.get('%s')||''"%B)
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(1300)
    await go('sheets')
    # valitse B1:B5 (vaihto+napsautus)
    await pg.evaluate("KaikkiTesti&&0")
    await pg.click('#sg-wrap td[data-r="0"][data-c="1"]'); await pg.keyboard.down('Shift'); await pg.click('#sg-wrap td[data-r="4"][data-c="1"]'); await pg.keyboard.up('Shift')
    if phone:  # kosketuksella vaihto ei valitse aluetta: nuolilla
        await pg.click('#sg-wrap td[data-r="0"][data-c="1"]'); await pg.focus('#sg-wrap')
        for _ in range(4): await pg.keyboard.press('Shift+ArrowDown')
    await tocard()
    f=await pg.evaluate("({open:document.getElementById('board-edit').open,cell:document.getElementById('board-card-cell').value,kind:document.getElementById('board-card-kind').value,title:document.getElementById('board-card-title').value,sheet:document.getElementById('board-card-sheet').value})")
    want('ikkuna täytetty valmiiksi (alue, minigraafi, otsikko)',f['open'] and f['cell']=='B1:B5' and f['kind']=='minigraafi' and f['title']=='Paino' and f['sheet']=='paino',f)
    # väärä yhdistelmä
    await pg.select_option('#board-card-kind','luku'); await pg.click('#board-edit-form button[type=submit]'); await pg.wait_for_timeout(150)
    m=await pg.evaluate("document.getElementById('board-edit-msg').textContent")
    want('alue + Luku antaa viestin','Minigraafi' in m,m)
    await pg.select_option('#board-card-kind','minigraafi'); await pg.click('#board-edit-form button[type=submit]')
    t=await board()
    want('tallentui ilman lukituksen avaamista','| Paino | minigraafi | [[paino]]!B1:B5 |' in t,t)
    await pg.wait_for_timeout(300)
    # yksi solu -> luku
    await pg.click('#sg-wrap td[data-r="4"][data-c="1"]'); await tocard()
    f=await pg.evaluate("({cell:document.getElementById('board-card-cell').value,kind:document.getElementById('board-card-kind').value})")
    want('yksi solu → Luku',f=={'cell':'B5','kind':'luku'},f)
    await pg.fill('#board-card-title','Nyt'); await pg.click('#board-edit-form button[type=submit]')
    try: await pg.wait_for_function("(__repo.get('%s')||'').indexOf('[[paino]]!B5 |')>=0"%B,timeout=8000)
    except Exception: pass
    await pg.wait_for_timeout(300)
    # näkymävälilehden alue
    await pg.evaluate("Array.from(document.querySelectorAll('.sg-tab')).filter(function(b){return b.textContent==='Ostot';})[0].click()"); await pg.wait_for_timeout(200)
    await pg.click('#sg-wrap td[data-r="0"][data-c="1"]'); await pg.focus('#sg-wrap'); await pg.keyboard.press('Shift+ArrowDown')
    await tocard(); await pg.fill('#board-card-title','Ostot'); await pg.click('#board-edit-form button[type=submit]')
    try: await pg.wait_for_function("(__repo.get('%s')||'').indexOf('[[ostot]]!B1:B2')>=0"%B,timeout=8000)
    except Exception: pass
    await pg.wait_for_timeout(300)
    # kojelauta
    await go('dash'); await pg.wait_for_timeout(200)
    cards=await pg.evaluate("Array.from(document.querySelectorAll('.board-card')).map(function(c){var s=c.querySelector('svg.board-spark');return {h:c.querySelector('h3').textContent,svg:!!s,pts:s&&s.querySelector('polyline')?s.querySelector('polyline').getAttribute('points').split(' ').length:0,out:(c.querySelector('output,.board-number')||{}).textContent,w:s?s.getBoundingClientRect().width:0,cw:c.getBoundingClientRect().width};})")
    c={x['h']:x for x in cards}
    want('minigraafi viidestä arvosta, viimeisin 79,6',c.get('Paino',{}).get('pts')==5 and c['Paino']['out'] in ('79,6','79.6'),cards)
    want('minigraafi täyttää kortin leveyden',c.get('Paino',{}).get('w',0)>c.get('Paino',{}).get('cw',1)*0.7,cards)
    want('Luku-kortti näyttää solun',c.get('Nyt',{}).get('out') in ('79,6','79.6'),cards)
    want('näkymän alue: 2 pistettä',c.get('Ostot',{}).get('pts')==2,cards)
    await pg.evaluate("window.__repo.put('projektit/c.md',%s)"%json.dumps(md('Cc','30'))); await pg.evaluate("KaikkiTesti.pull()"); await pg.wait_for_timeout(900)
    if not await pg.is_visible('.board-card'): await go('dash')
    n=await pg.evaluate("(function(){var c=Array.from(document.querySelectorAll('.board-card')).filter(function(c){return c.querySelector('h3').textContent==='Ostot';})[0];var l=c&&c.querySelector('polyline');return l?l.getAttribute('points').split(' ').length:0;})()")
    want('näkymän alue ei kasva itsestään (B1:B2 pysyy 2 pisteenä)',n==2,n)
    want('ei sivuttaisvieritystä (sivu)',await pg.evaluate("document.documentElement.scrollWidth<=innerWidth"))
    want('ei sivuvirheitä',not errs,errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((1440,900),(390,844)): bad+=await run(p,w,h)
    print('KAIKKI OK' if not bad else 'VIRHEITÄ: '+', '.join(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
