"""Kaikki 0.9 (Emil 22.11.2026): muistiinpanoikkunassa tila tekstille.
Tarkistaa: tekstikentän reuna näkyy myös ilman fokusta, kenttä vie suurimman osan ikkunasta, ylärivin siru näyttää ajankohdan
(kuitattuna väkänen) ja avaa ajankohtaikkunan (päivärivi ja Ajankohdat), ilman päivää siru on + Päivä, luotu-tieto on ⋯-valikossa
eikä näkymässä. Leveydet 390, 320, 1440 ja 1280 px. Käyttö: python3 testit/selain_09.py"""
import asyncio, os, sys, json, datetime
from playwright.async_api import async_playwright
T=datetime.date.today();TD='%d.%d.'%(T.day,T.month)
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
FAKE=open(os.path.join(D,'fakegh.js'),encoding='utf8').read()
def md(t,body,lahde='emil'): return '---\ntyyppi: tieto\notsikko: %s\nkuvaus: \nluotu: 2026-11-20\nlahde: %s\n---\n# %s\n\n%s\n'%(t,lahde,t,body)
SEED={'inbox/pyykit.md':md('Pyykit','Pese '+TD+' klo 16-18.'),'inbox/ilman.md':md('Ilman päivää','Pelkkää tekstiä.')}
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h})).new_page()
    await pg.add_init_script(FAKE+";(function(){var S=%s;if(!window.__repo.kept)for(var k in S)window.__repo.put(k,S[k]);try{localStorage.setItem('kaikki:gh',JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}))}catch(e){}})();"%json.dumps(SEED))
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond,info=''):
        print('  %-52s %s %s'%(label,'ok' if cond else 'VIRHE',info if not cond else ''))
        if not cond: bad.append(label)
    async def open_(name):
        await pg.evaluate("Array.from(document.querySelectorAll('#nlist .ncard')).filter(function(c){return c.textContent.indexOf('%s')>=0;})[0].click()"%name); await pg.wait_for_timeout(300)
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(1500)
    await open_('Pyykit')
    r=await pg.evaluate("""(function(){var d=document.getElementById('nsheet').getBoundingClientRect(),t=document.getElementById('ns-text').getBoundingClientRect(),wr=document.getElementById('ns-wrap');
      return {ratio:t.height/Math.min(d.height,innerHeight),border:getComputedStyle(wr).boxShadow,stamp:document.getElementById('ns-stamp').offsetParent===null};})()""")
    want('tekstikenttä vie yli puolet ikkunasta',r['ratio']>0.55,r)
    want('reuna näkyy ilman fokusta',r['border']!='none',r)
    want('luotu-tieto ei näkymässä',r['stamp'])
    chip=await pg.evaluate("document.getElementById('ns-when').textContent")
    want('siru näyttää ajankohdan',('klo 16.00' in chip) and ('Tänään' in chip),chip)
    await pg.click('#ns-when'); await pg.wait_for_timeout(150)
    v=await pg.evaluate("(function(){var p=document.getElementById('ns-datepop'),r=p.getBoundingClientRect();return {open:!p.hidden,dt:document.getElementById('ns-dtrow').offsetParent!==null,aj:document.querySelectorAll('#ns-datepop #ns-dlist .drow').length,in:r.left>=0&&r.right<=innerWidth&&r.top>=0};})()")
    want('siru avaa ajankohtaikkunan (päivärivi + Ajankohdat)',v['open'] and v['dt'] and v['aj']>=1 and v['in'],v)
    await pg.keyboard.press('Escape'); await pg.wait_for_timeout(100)
    want('Esc sulkee ajankohtaikkunan, ei muistiinpanoa',await pg.evaluate("document.getElementById('ns-datepop').hidden&&document.getElementById('nsheet').open"))
    await pg.click('#ns-more'); await pg.wait_for_timeout(100)
    want('luotu ⋯-valikon ylärivillä',await pg.evaluate("/^Luotu /.test(document.querySelector('#ns-menu .nsstamp').textContent)"))
    await pg.mouse.click(5,h//2); await pg.wait_for_timeout(100)
    # kuitattu ajankohta: väkänen sirussa
    await pg.evaluate("(function(){var n=KaikkiTesti.notes().filter(function(n){return n.vp==='inbox/pyykit.md';})[0];})()")
    if await pg.is_visible('#nsheet .sx'): await pg.click('#nsheet .sx')
    else: await pg.keyboard.press('Escape')
    await pg.wait_for_timeout(200)
    await open_('Ilman päivää')
    chip=await pg.evaluate("[document.getElementById('ns-when').textContent,document.getElementById('ns-when').classList.contains('add')]")
    want('ilman päivää siru on + Päivä',chip[0]=='+ Päivä' and chip[1],chip)
    want('ei sivuttaisvieritystä',await pg.evaluate("document.documentElement.scrollWidth<=innerWidth"))
    want('ei sivuvirheitä',not errs,errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640),(1440,900),(1280,800)): bad+=await run(p,w,h)
    print('KAIKKI OK' if not bad else 'VIRHEITÄ: '+', '.join(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
