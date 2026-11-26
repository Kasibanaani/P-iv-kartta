"""Kaikki 0.40 (Emil 22.11.2026, A3.3): rivien ja sarakkeiden lisäys, poisto ja siirto, kaavaviittaukset päivittyvät.
Tarkistaa: rivinumeron napsautus + ⋯ → Lisää rivi yläpuolelle lisää tyhjän rivin, saman välilehden kaavat, toisen välilehden alue ja
kojelaudan kortin osoite siirtyvät ja tulokset pysyvät samoina; Siirrä alas vaihtaa rivit; Poista vaatii vahvistuksen; sarakkeen otsikon
hiiren oikea → Lisää sarake vasemmalle siirtää kaavat ja leveydet; sarakkeen poisto. Leveydet 1440 ja 390 (puhelimella ⋯-valikosta).
Käyttö: python3 testit/selain_40.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
FAKE=open(os.path.join(D,'fakegh.js'),encoding='utf8').read()
K='taulukot/budjetti/kulut.md'; Y='taulukot/budjetti/yhteenveto.md'; B='taulukot/budjetti/_nakyma.md'
SEED={K:'---\ntyyppi: taulukko\notsikko: Kulut\ntaulukko: Budjetti\nleveydet: 160, 90, 80, 100\n---\n# Kulut\n\n| Asia | Hinta | Määrä | Yht |\n| --- | --- | --- | --- |\n| Maali | 25 | 4 | =B1*C1 |\n| Pensselit | 8 | 3 | =B2*C2 |\n| Teippi | 4.5 | 2 | =B3*C3 |\n| Summa |  |  | =SUMMA(D1:D3) |\n',
      Y:'---\ntyyppi: taulukko\notsikko: Yhteenveto\ntaulukko: Budjetti\n---\n# Yhteenveto\n\n| Mitä | Arvo |\n| --- | --- |\n| Kaikki | =SUMMA([[kulut]]!D1:D3) |\n| Teippi | =[[kulut]]!D3 |\n',
      B:'---\ntyyppi: kojelauta\notsikko: Kojelauta\nlahde: emil\n---\n# Kojelauta\n\n## Kortit\n\n| id | otsikko | laji | solu | min | max |\n| --- | --- | --- | --- | --- | --- |\n| k1 | Teippi | luku | [[kulut]]!D3 |  |  |\n'}
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]; phone=w<1000
    ctx=await b.new_context(viewport={'width':w,'height':h},has_touch=phone)
    pg=await ctx.new_page()
    await pg.add_init_script(FAKE+";(function(){var S=%s;if(!window.__repo.kept)for(var k in S)window.__repo.put(k,S[k]);try{localStorage.setItem('kaikki:gh',JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));localStorage.setItem('kaikki:taulukko','%s')}catch(e){}})();"%(json.dumps(SEED),K))
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond,info=''):
        print('  %-62s %s %s'%(label,'ok' if cond else 'VIRHE',info if not cond else ''))
        if not cond: bad.append(label)
    def get(p): return pg.evaluate("__repo.get(%s)"%json.dumps(p))
    async def until(p,txt):
        try: await pg.wait_for_function("([p,t])=>(__repo.get(p)||'').indexOf(t)>=0",arg=[p,txt],timeout=8000); return True
        except Exception: return False
    async def menu(item):
        await pg.click('#sg-more'); await pg.wait_for_timeout(100); await pg.click('#'+item); await pg.wait_for_timeout(100)
    async def vals(): return await pg.evaluate("Array.from(document.querySelectorAll('#sg-wrap tbody tr:not(.sg-sp)')).map(function(tr){return Array.from(tr.querySelectorAll('td')).map(function(td){return td.textContent.trim();});})")
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(1300)
    if phone: await pg.click('#roll'); await pg.click('#section-sheets')
    else: await pg.click('#navbtn'); await pg.click('#nav [data-tab="sheets"]')
    await pg.wait_for_timeout(300)
    # rivi 2: lisää yläpuolelle
    await pg.click('#sg-wrap th.sg-rn[data-r="1"]'); await menu('sgs-row-ib')
    ok=await until(K,'| Maali | 25 | 4 | =B1*C1 |\n|  |  |  |  |\n| Pensselit | 8 | 3 | =B3*C3 |')
    t=await get(K)
    want('rivi lisätty ja saman välilehden kaavat siirtyivät',ok and '=B4*C4' in t and '=SUMMA(D1:D4)' in t,t)
    ok=await until(Y,'D1:D4')
    y=await get(Y)
    want('toisen välilehden viittaukset siirtyivät',ok and '=SUMMA([[kulut]]!D1:D4)' in y and '=[[kulut]]!D4' in y,y)
    ok=await until(B,'[[kulut]]!D4')
    want('kojelaudan kortin osoite siirtyi',ok,await get(B))
    await pg.wait_for_timeout(500)
    v=await vals()
    want('tulokset ennallaan (summa 133)',v and v[4][3]=='133',v)
    # siirrä rivi 1 alas
    await pg.click('#sg-wrap th.sg-rn[data-r="0"]'); await menu('sgs-row-dn')
    ok=await until(K,'|  |  |  |  |\n| Maali | 25 | 4 | =B2*C2 |')
    want('Siirrä alas vaihtaa rivit, kaava seuraa',ok,await get(K))
    await pg.wait_for_timeout(500)
    # poista tyhjä rivi 1 (vahvistus)
    await pg.click('#sg-wrap th.sg-rn[data-r="0"]'); await pg.click('#sg-more'); await pg.wait_for_timeout(100)
    await pg.click('#sgs-row-del'); await pg.wait_for_timeout(100)
    still=await pg.evaluate("document.getElementById('sgs-row-del')&&document.getElementById('sgs-row-del').textContent")
    want('poisto pyytää vahvistuksen',still and still.startswith('Vahvista'),still)
    await pg.click('#sgs-row-del')
    ok=await until(K,'| Asia | Hinta | Määrä | Yht |\n| --- | --- | --- | --- |\n| Maali | 25 | 4 | =B1*C1 |')
    want('rivin poisto palauttaa alkuperäisen järjestyksen',ok and '=SUMMA(D1:D3)' in (await get(K)),await get(K))
    ok=await until(Y,'D1:D3)')
    want('ja viittaukset muualla',ok and '=[[kulut]]!D3' in (await get(Y)),await get(Y))
    await pg.wait_for_timeout(500)
    # sarake B: lisää vasemmalle
    if phone:
        await pg.click('#sg-wrap th.sg-ch[data-c="1"]'); await menu('sgs-col-ib')
    else:
        await pg.click('#sg-wrap th.sg-ch[data-c="1"]',button='right'); await pg.wait_for_timeout(100)
        want('hiiren oikea avaa sarakkeen valikon',await pg.is_visible('#sgs-col-ib'))
        await pg.click('#sgs-col-ib')
    ok=await until(K,'| Asia | B | Hinta | Määrä | Yht |')
    t=await get(K)
    want('sarake lisätty, kaavat ja leveydet siirtyivät',ok and '=C1*D1' in t and '=SUMMA(E1:E3)' in t and 'leveydet: 160, 110, 90, 80, 100' in t,t)
    ok=await until(Y,'[[kulut]]!E1:E3')
    want('toisen välilehden sarakeviittaus',ok,await get(Y))
    await pg.wait_for_timeout(500)
    # poista lisätty sarake
    await pg.click('#sg-wrap th.sg-ch[data-c="1"]'); await pg.click('#sg-more'); await pg.wait_for_timeout(100)
    await pg.click('#sgs-col-del'); await pg.click('#sgs-col-del')
    ok=await until(K,'| Asia | Hinta | Määrä | Yht |')
    t=await get(K)
    want('sarakkeen poisto palauttaa',ok and '=B1*C1' in t and 'leveydet: 160, 90, 80, 100' in t,t)
    await pg.wait_for_timeout(500)
    v=await vals()
    want('näkymä ajan tasalla',v and v[0][3]=='100' and v[3][3]=='133',v)
    want('ei sivuttaisvieritystä (sivu)',await pg.evaluate("document.documentElement.scrollWidth<=innerWidth"))
    want('ei sivuvirheitä',not errs,errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((1440,900),(390,844)): bad+=await run(p,w,h)
    print('KAIKKI OK' if not bad else 'VIRHEITÄ: '+', '.join(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
