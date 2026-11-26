"""Kaikki 0.37 (Emil 22.11.2026: taulukkojen on toimittava sulavasti ja vakaasti): iso taulukko virtualisoituna.
Tarkistaa 300 rivin taulukolla: DOMissa vain osa riveistä, vieritys loppuun tuo viimeiset rivit oikeine kaava-arvoineen, nuolilla ja
⌘A-valinnalla ei hukata soluja, kaukaisen rivin muokkaus tallentuu ja päivittää kaavan paikallaan (ei koko taulukon uudelleenpiirtoa),
⌘Z ja ⇧⌘Z toimivat, vieritys säilyy muokkauksessa, avaus- ja muokkausaika tulostetaan. Pieni taulukko piirtyy kokonaan.
Leveydet 1440 ja 390. Käyttö: python3 testit/selain_37.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
FAKE=open(os.path.join(D,'fakegh.js'),encoding='utf8').read()
R=300
BIG='taulukot/iso/data.md'; SMALL='taulukot/iso/pieni.md'
rows=''.join('| %d | %d | =A%d*B%d |\n'%(i+1,2,i+1,i+1) for i in range(R))
SEED={BIG:'---\ntyyppi: taulukko\notsikko: Data\ntaulukko: Iso\n---\n# Data\n\n| A | B | C |\n| --- | --- | --- |\n'+rows+'',
      SMALL:'---\ntyyppi: taulukko\notsikko: Pieni\ntaulukko: Iso\n---\n# Pieni\n\n| X | Y |\n| --- | --- |\n'+''.join('| %d | =A%d+1 |\n'%(i,i+1) for i in range(30))}
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]; phone=w<1000
    ctx=await b.new_context(viewport={'width':w,'height':h},has_touch=phone)
    pg=await ctx.new_page()
    await pg.add_init_script(FAKE+";(function(){var S=%s;if(!window.__repo.kept)for(var k in S)window.__repo.put(k,S[k]);try{localStorage.setItem('kaikki:gh',JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}))}catch(e){}})();"%json.dumps(SEED))
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond,info=''):
        print('  %-60s %s %s'%(label,'ok' if cond else 'VIRHE',info if not cond else ''))
        if not cond: bad.append(label)
    def cell(r,c): return pg.locator('#sg-wrap td[data-r="%d"][data-c="%d"]'%(r,c))
    async def ntr(): return await pg.evaluate("document.querySelectorAll('#sg-wrap tbody tr:not(.sg-sp)').length")
    async def frame(): await pg.evaluate("new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))")
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(1200)
    t0=await pg.evaluate("performance.now()")
    if phone: await pg.click('#roll'); await pg.click('#section-sheets')
    else: await pg.click('#navbtn'); await pg.click('#nav [data-tab="sheets"]')
    await frame(); print('  (avaus %d ms)'%round(await pg.evaluate("performance.now()")-t0))
    if await pg.evaluate("!document.querySelector('#sg-wrap td[data-r=\"0\"][data-c=\"2\"]')||document.querySelector('.sg-tab[aria-pressed=\"true\"]').textContent!=='Data'"):
        await pg.evaluate("Array.from(document.querySelectorAll('.sg-tab')).filter(function(b){return b.textContent==='Data';})[0].click()"); await frame()
    n=await ntr()
    want('DOMissa vain osa 300 rivistä',0<n<200,n)
    want('ensimmäinen kaava laskettu',(await cell(0,2).text_content()).strip()=='2')
    sh=await pg.evaluate("(function(){var w=document.getElementById('sg-wrap');return w.scrollHeight;})()")
    want('vieritettävä korkeus vastaa koko taulukkoa',sh>R*26,sh)
    await pg.evaluate("document.getElementById('sg-wrap').scrollTop=1e6"); await frame(); await pg.wait_for_timeout(100)
    last=await pg.evaluate("(function(){var e=document.querySelector('#sg-wrap td[data-r=\"%d\"][data-c=\"2\"]');if(!e)return null;var r=e.getBoundingClientRect(),w=document.getElementById('sg-wrap').getBoundingClientRect();return {t:e.textContent,vis:r.bottom<=w.bottom+1&&r.top>=w.top};})()"%(R-1))
    want('vieritys loppuun: viimeinen rivi näkyy ja kaava oikein',last and last['t']=='%d'%(R*2) and last['vis'],last)
    want('ikkunan koko pysyy pienenä',await ntr()<200)
    # muokkaus kaukana alhaalla
    await cell(R-1,0).click(); await pg.keyboard.type('1000'); await pg.keyboard.press('Enter'); await frame()
    want('kaava päivittyi paikallaan',(await cell(R-1,2).text_content()).strip()=='2000')
    st=await pg.evaluate("document.getElementById('sg-wrap').scrollTop")
    want('vieritys säilyi muokkauksessa',st>R*20,st)
    try: await pg.wait_for_function('([p,t])=>(__repo.get(p)||"").includes(t)',arg=[BIG,'| 1000 | 2 |'],timeout=8000); ok=True
    except Exception: ok=False
    want('muutos tallentui vaultiin',ok)
    # nuolet ylös ikkunan reunan yli
    for _ in range(120): await pg.keyboard.press('ArrowUp')
    await frame()
    act=await pg.evaluate("(function(){var a=document.querySelector('#sg-wrap td.sg-act');if(!a)return null;var r=a.getBoundingClientRect(),w=document.getElementById('sg-wrap').getBoundingClientRect();return {r:a.dataset.r,vis:r.top>=w.top-1&&r.bottom<=w.bottom+1};})()")
    want('nuolet ikkunan yli: aktiivinen solu näkyvissä',act and act['r']==str(R-1-120) and act['vis'],act)
    # hyppy alkuun ja ⌘A
    await pg.evaluate("document.getElementById('sg-wrap').scrollTop=0"); await frame(); await pg.wait_for_timeout(50)
    await cell(0,0).click(); await pg.keyboard.press('ControlOrMeta+a'); await frame()
    sel=await pg.evaluate("document.querySelectorAll('#sg-wrap td.sg-sel').length")
    want('⌘A: näkyvät solut valittuina',sel==(await ntr())*3,sel)
    await pg.evaluate("document.getElementById('sg-wrap').scrollTop=4000"); await frame(); await pg.wait_for_timeout(50)
    sel2=await pg.evaluate("(function(){var t=document.querySelectorAll('#sg-wrap tbody tr:not(.sg-sp) td');return [t.length,document.querySelectorAll('#sg-wrap td.sg-sel').length];})()")
    want('⌘A: valinta säilyy vieritettäessä',sel2[0]==sel2[1] and sel2[0]>0,sel2)
    # kumoa ja tee uudelleen
    await cell(int(4000/28)+5,0).click(); await pg.keyboard.press('ControlOrMeta+z'); await frame()
    await pg.evaluate("document.getElementById('sg-wrap').scrollTop=1e6"); await frame(); await pg.wait_for_timeout(50)
    want('⌘Z palauttaa kaukaisen solun',(await cell(R-1,2).text_content()).strip()=='%d'%(R*2))
    await pg.keyboard.press('ControlOrMeta+Shift+z'); await frame()
    await pg.evaluate("document.getElementById('sg-wrap').scrollTop=1e6"); await frame(); await pg.wait_for_timeout(50)
    want('⇧⌘Z tekee uudelleen',(await cell(R-1,2).text_content()).strip()=='2000')
    # pieni taulukko kokonaan
    await pg.evaluate("Array.from(document.querySelectorAll('.sg-tab')).filter(function(b){return b.textContent==='Pieni';})[0].click()"); await frame()
    want('pieni taulukko piirtyy kokonaan',await ntr()==30 and await pg.evaluate("document.querySelectorAll('#sg-wrap tr.sg-sp').length")==0)
    want('ei sivuttaisvieritystä (sivu)',await pg.evaluate("document.documentElement.scrollWidth<=innerWidth"))
    want('ei sivuvirheitä',not errs,errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((1440,900),(390,844)): bad+=await run(p,w,h)
    print('KAIKKI OK' if not bad else 'VIRHEITÄ: '+', '.join(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
