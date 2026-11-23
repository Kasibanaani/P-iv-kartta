"""Kaikki 0.66 (Emil 23.11.2026): kojelaudan muuttujaruudut tekstimuuttujista (!!nimi: arvo!!).
Tarkistaa testivaultilla leveyksillä 1440, 1280, 390 ja 320:
- Valmis ruutu tiedostosta data/kojelauta.md: keskiarvo 30 pv yksikössä h min, havaintomäärä, päiväkuvaaja, jossa puuttuva päivä on aukko.
- Lähteet-nappi listaa muistiinpanot ja rivi avaa muistiinpanon.
- Muokkaus: uusi ruutu (tekstimuuttuja, viimeisin), tunnisterajaus, ruudun muutos ja poisto. Tiedoston muu sisältö säilyy.
- Ristiriita: jos ruutua muutettiin toisaalla, tallennus ei kirjoita päälle vaan kertoo siitä.
- Lukittuna ruuduissa ei ole Muokkaa-nappia; ei vaakavieritystä.
Käyttö: python3 testit/selain_66.py"""
import asyncio, os, json
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
FAKE=open(os.path.join(D,'fakegh.js'),encoding='utf8').read()
def md(path,title,body,luotu='2026-11-23',tags=''):
    return path,'---\ntyyppi: muistiinpano\notsikko: %s\nkuvaus: \n%sluotu: %s\nlahde: emil\n---\n# %s\n\n%s\n'%(title,('tagit: [%s]\n'%tags) if tags else '',luotu,title,body)
KOJE='---\ntyyppi: kojelauta\notsikko: Kojelaudan muuttujaruudut\nnakyy: ei\nlahde: emil\n---\n# Kojelaudan muuttujaruudut\n\n| id | otsikko | muuttuja | laske | aika | tunniste | kansio | yksikko | nayta |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- |\n| r1 | Uni | Uni | keskiarvo | 30 |  |  | h min | kuvaaja |\n\nOma huomautus säilyy.\n'
TODAY='''(function(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})()'''
async def launch(p):
    try: return await p.chromium.launch()
    except Exception: return await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
async def run(p,w,h):
    b=await launch(p); bad=[]; errs=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h})).new_page()
    # päivät suhteessa testin ajopäivään: tänään-1, -2 ja -4 (päivä -3 puuttuu = aukko)
    await pg.add_init_script(FAKE+""";(function(){function iso(k){var d=new Date();d.setDate(d.getDate()-k);return d.getDate()+'.'+(d.getMonth()+1)+'.'+d.getFullYear();}
      var M=function(p,t){if(!window.__repo.kept)window.__repo.put(p,t);};var S=%s;for(var k in S)M(k,S[k].replace(/D(\\d)/g,function(x,n){return iso(+n);}));
      try{localStorage.setItem('kaikki:gh',JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));}catch(e){}})();"""%json.dumps(dict([
        md('paivat/2026/a.md','Päivä A','!!D1: Uni: 8!! ja !!D1: Fiilis: väsynyt!!',tags='arki'),
        md('paivat/2026/b.md','Päivä B','!!D2: Uni: 6,5!! !!D2: Fiilis: hyvä!!'),
        md('inbox/c.md','Päivä C','!!D4: Uni: 7!!'),
        ('data/kojelauta.md',KOJE)])))
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond,info=''):
        print('  %-66s %s %s'%(label,'ok' if cond else 'VIRHE',info if not cond else ''))
        if not cond: bad.append(label)
    print('leveys',w)
    await pg.goto(U)
    await pg.wait_for_function("window.KaikkiTesti?.vault().files['data/kojelauta.md']")
    await pg.wait_for_timeout(800)
    if w>=1000: await pg.get_by_role('tab',name='Kojelauta',exact=True).click()
    else:
        await pg.locator('#roll').click(); await pg.locator('#section-dash').click()
    await pg.wait_for_timeout(500)
    card=pg.locator('.mvb-card[data-id=r1]')
    want('valmis ruutu näkyy',await card.count()==1)
    v=await card.locator('.dval').inner_text(); sub=await card.locator('.mvb-sub').inner_text()
    want('keskiarvo (8+6,5+7)/3 = 7 h 10 min',v=='7 h 10 min',v)
    want('alaotsikko: keskiarvo · 30 pv · 3 havaintoa',sub=='keskiarvo · 30 pv · 3 havaintoa',sub)
    path=await card.locator('svg path.dln').get_attribute('d')
    want('kuvaaja: puuttuva päivä on aukko (kaksi osaa)',path and path.count('M')==2,path)
    want('lukittuna ei Muokkaa-nappia ruudussa',await card.locator('text=Muokkaa').count()==0)
    await card.locator('.mvb-srcbtn').click(); await pg.wait_for_timeout(300)
    rows=await pg.locator('.mvb-card[data-id=r1] .mvb-src .mvrow').all_inner_texts()
    want('Lähteet: kolme muistiinpanoa, uusin ensin',len(rows)==3 and rows[0].startswith('8') and 'Päivä A' in rows[0],rows)
    await pg.locator('.mvb-card[data-id=r1] .mvb-src .mvrow').first.click(); await pg.wait_for_timeout(500)
    want('lähderivi avaa muistiinpanon',await pg.evaluate("document.getElementById('nsheet').open&&/Uni: 8/.test(document.getElementById('ns-text').value)"))
    await pg.evaluate("document.getElementById('ns-ok').click()"); await pg.wait_for_timeout(400)
    # muokkaus: uusi tekstiruutu
    await pg.locator('#mvb-lock').click(); await pg.wait_for_timeout(200)
    await pg.locator('#mvb-add').click(); await pg.wait_for_timeout(300)
    opts=await pg.locator('#mvb-var option').all_inner_texts()
    want('muuttujavalinta aakkosjärjestyksessä',opts==['Fiilis','Uni'],opts)
    await pg.select_option('#mvb-var','Fiilis'); await pg.select_option('#mvb-laske','viimeisin')
    await pg.locator('#mvb-save').click(); await pg.wait_for_timeout(900)
    f=await pg.evaluate("__repo.get('data/kojelauta.md')")
    want('uusi ruutu tiedostoon, muu sisältö säilyy','| Fiilis | viimeisin |' in f and 'Oma huomautus säilyy.' in f and '| r1 | Uni | Uni | keskiarvo | 30 |' in f,f)
    c2=pg.locator('.mvb-card').nth(1)
    want('tekstiruutu: viimeisin arvo väsynyt',(await c2.locator('.dval').inner_text())=='väsynyt')
    # muutos: summa, tunniste arki, yksikkö h
    await card.locator('text=Muokkaa').click(); await pg.wait_for_timeout(300)
    await pg.select_option('#mvb-laske','summa'); await pg.fill('#mvb-tag','#arki'); await pg.fill('#mvb-unit','h'); await pg.select_option('#mvb-show','luku')
    await pg.locator('#mvb-save').click(); await pg.wait_for_timeout(900)
    v=await pg.locator('.mvb-card[data-id=r1] .dval').inner_text(); sub=await pg.locator('.mvb-card[data-id=r1] .mvb-sub').inner_text()
    want('tunnisterajaus: summa 8 h, #arki alaotsikossa',v=='8 h' and '#arki' in sub,[v,sub])
    want('luku-näytössä ei kuvaajaa',await pg.locator('.mvb-card[data-id=r1] svg').count()==0)
    # ristiriita: toinen laite muuttaa ruudun
    await pg.locator('.mvb-card[data-id=r1] >> text=Muokkaa').click(); await pg.wait_for_timeout(300)
    await pg.evaluate("__repo.put('data/kojelauta.md',__repo.get('data/kojelauta.md').replace('| r1 | Uni | Uni | summa |','| r1 | Uni muualla | Uni | summa |'))")
    await pg.select_option('#mvb-laske','max'); await pg.locator('#mvb-save').click(); await pg.wait_for_timeout(1200)
    msg=await pg.locator('#mvb-msg').inner_text()
    want('ristiriita ei kirjoita päälle',('muutettiin muualla' in msg) and '| r1 | Uni muualla | Uni | summa |' in await pg.evaluate("__repo.get('data/kojelauta.md')"),msg)
    await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300)
    # poisto
    await pg.locator('.mvb-card').nth(1).locator('text=Muokkaa').click(); await pg.wait_for_timeout(300)
    await pg.locator('#mvb-del').click(); await pg.wait_for_timeout(900)
    f=await pg.evaluate("__repo.get('data/kojelauta.md')")
    want('poisto poistaa vain rivin','Fiilis' not in f and 'r1' in f and 'Oma huomautus säilyy.' in f,f)
    want('ei vaakavieritystä',await pg.evaluate("document.documentElement.scrollWidth<=innerWidth+1"))
    want('ei sivuvirheitä',not errs,errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((1440,900),(1280,800),(390,844),(320,640)): bad+=await run(p,w,h)
    print('OK' if not bad else 'VIRHEITÄ: %d'%len(bad)); raise SystemExit(1 if bad else 0)
asyncio.run(main())
