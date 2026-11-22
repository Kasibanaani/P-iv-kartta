"""Kaikki 0.6.1 (Emil 22.11.2026): GitHub-vault tietokoneella. Leveällä näytöllä Valikkoa ei ole, joten yläpalkissa on pilvinappi,
joka avaa GitHub-vault-ikkunan; yhteys tallentuu ja haku toimii kuten puhelimella. Puhelimella nappi on piilossa (Valikko → GitHub-vault).
Leveydet 1440, 1280 ja 390 px. Käyttö: python3 testit/selain_0601.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
FAKE=open(os.path.join(D,'fakegh.js'),encoding='utf8').read()
SEED={'tieto/a.md':'---\ntyyppi: tieto\notsikko: Koneelta\nkuvaus: \nluotu: 2026-11-20\nlahde: emil\n---\n# Koneelta\n\nTeksti.\n'}
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h})).new_page()
    await pg.add_init_script(FAKE+";(function(){var S=%s;if(!window.__repo.kept)for(var k in S)window.__repo.put(k,S[k]);})();"%json.dumps(SEED))
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond,info=''):
        print('  %-44s %s %s'%(label,'ok' if cond else 'VIRHE',info if not cond else ''))
        if not cond: bad.append(label)
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(800)
    vis=await pg.is_visible('#deskmenu')
    if w<1000:
        want('puhelimella tietokoneen Valikko-nappi piilossa',not vis)
    else:
        want('tietokoneella Valikko-nappi näkyy (0.32: GitHub-vault Valikossa)',vis)
        await pg.click('#deskmenu'); await pg.click('#m-gh'); await pg.wait_for_timeout(200)
        want('nappi avaa GitHub-vault-ikkunan',await pg.evaluate("document.getElementById('gsheet').open"))
        await pg.fill('#gs-repo','testi/vault'); await pg.fill('#gs-tok','x')
        await pg.click('#gs-save'); await pg.wait_for_timeout(2000)
        st=await pg.evaluate("KaikkiTesti.status()")
        want('yhteys toimii koneelta',st.startswith('ajan tasalla'),st)
        want('vaultin muistiinpano tuli',await pg.evaluate("KaikkiTesti.notes().some(function(n){return n.vp==='tieto/a.md';})"))
        lab=await pg.get_attribute('#ghbtn','aria-label')
        want('napin nimessä yhteyden tila','GitHub-vault: ' in lab,lab)
    want('ei sivuvirheitä',not errs,errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((1440,900),(1280,800),(390,844)): bad+=await run(p,w,h)
    print('KAIKKI OK' if not bad else 'VIRHEITÄ: '+', '.join(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
