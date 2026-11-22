"""Kaikki 0.2.1: sana- ja asiasanalinkkien teksti näkyy (0.2:ssa linkkisanat jäivät läpinäkyviksi, koska teksti piirtyy
korostuskerroksesta), sanalinkin viiva on hienovarainen ja lainausmerkki > on piilossa lukunäkymässä. Tumma ja vaalea teema,
leveydet 390 ja 320 px. Käyttö: python3 testit/selain_linkit.py   Kuvat: väliaikaiskansioon (tulostetaan lopuksi)."""
import asyncio, os, sys, json, tempfile
K=os.path.join(tempfile.gettempdir(),'kaikki-linkit')
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
FAKE=open(os.path.join(D,'fakegh.js'),encoding='utf8').read()
A='---\ntyyppi: tieto\nluotu: 2026-11-20\n---\n# Kahvihetki\n\n> **Kahvihetki on rauhoittava tauko.** Pieni kävely auttaa jaksamaan.\n\nTavallinen kappale: kävely ja tauko.\n'
B='---\ntyyppi: tieto\nluotu: 2026-11-20\n---\n# Muuta\n\nKävelyllä tauko ja rauhoittava musiikki, kahvihetki illalla, jaksaminen.\n'
SEED={'tieto/a.md':A,'tieto/b.md':B}
JS=r"""(function(){var hl=document.getElementById('ns-hl'),out=[];hl.querySelectorAll('.wl').forEach(function(e){var c=getComputedStyle(e);
 out.push({t:e.textContent,col:c.color,fill:c.webkitTextFillColor,dec:c.textDecorationColor,vis:e.getClientRects().length>0});});
 var bq=Array.prototype.filter.call(hl.querySelectorAll('.mdm'),function(e){return e.textContent.trim().charAt(0)==='>';});
 return {wl:out,bg:getComputedStyle(hl).backgroundColor,label:getComputedStyle(hl).color,bq:bq.map(function(e){return getComputedStyle(e).display;})};})()"""
def alpha(c):
    if c.startswith('rgba'): return float(c.rstrip(')').split(',')[-1])
    if c.startswith('color(') and '/' in c: return float(c.rstrip(')').split('/')[-1])
    return 1.0
async def run(p,w,theme,bad):
    b=await p.chromium.launch(executable_path="/opt/pw-browsers/chromium") if os.path.exists("/opt/pw-browsers/chromium") else await p.chromium.launch()
    ctx=await b.new_context(viewport={'width':w,'height':800},device_scale_factor=1,color_scheme=theme)
    pg=await ctx.new_page(); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.add_init_script(FAKE+";(function(){var S=%s;if(!window.__repo.kept)for(var k in S)window.__repo.put(k,S[k]);try{localStorage.setItem('kaikki:gh',JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}))}catch(e){}})();"%json.dumps(SEED))
    await pg.goto(U); await pg.wait_for_timeout(2500)
    def want(l,c,i=''):
        print('  %-4s %-6s %-40s %s %s'%(w,theme,l,'ok' if c else 'VIRHE',i if not c else ''))
        if not c: bad.append(l)
    await pg.evaluate("(function(){var r=Array.prototype.filter.call(document.querySelectorAll('#notes button,.row,[data-id]'),function(e){return e.textContent.indexOf('Kahvihetki')>=0;})[0];if(r)r.click();})()")
    await pg.wait_for_timeout(400)
    want('muistiinpano aukesi',await pg.evaluate("document.getElementById('nsheet').open"))
    for mode in ('reading','writing'):
        if mode=='writing': await pg.evaluate("document.getElementById('ns-text').readOnly=false;document.getElementById('nsheet').classList.remove('reading')"); await pg.wait_for_timeout(100)
        r=await pg.evaluate(JS)
        want(mode+': sanalinkkejä löytyi',len(r['wl'])>=3,r['wl'])
        inv=[x for x in r['wl'] if alpha(x['col'])<0.5 or x['col']!=r['label']]
        want(mode+': linkkisanat näkyvät tekstin värisinä',not inv,inv)
        want(mode+': viiva haalea',all(alpha(x['dec'])<0.6 for x in r['wl']),[x['dec'] for x in r['wl']][:2])
        if mode=='reading': want('lukunäkymä: > piilossa',r['bq'] and all(d=='none' for d in r['bq']),r['bq'])
        else: want('kirjoittaessa: > näkyy haaleana',r['bq'] and all(d!='none' for d in r['bq']),r['bq'])
        os.makedirs(K,exist_ok=True)
        await pg.locator('#nsheet .hlwrap').screenshot(path=os.path.join(K,'%s-%s-%d.png'%(theme,mode,w)))
    want('ei sivuvirheitä',not errs,errs)
    await b.close()
async def main():
    bad=[]
    async with async_playwright() as p:
        for w in (390,320):
            for t in ('dark','light'): await run(p,w,t,bad)
    print('KAIKKI OK' if not bad else 'VIRHEITÄ: %s'%bad); sys.exit(1 if bad else 0)
asyncio.run(main())
