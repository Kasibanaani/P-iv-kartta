"""Kaikki 0.5: vaultin linkit [[nimi]] ja [[nimi|teksti]]. Lukunäkymässä näkyy kohteen otsikko tai teksti ilman hakasulkeita,
napautus avaa kohteen; kortin tekstissä linkki näkyy otsikkona; puuttuva kohde ei kaada. Leveydet 390 ja 320 px."""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
FAKE=open(os.path.join(D,'fakegh.js'),encoding='utf8').read()
A='---\ntyyppi: tieto\notsikko: Aloitus\nluotu: 2026-11-20\nlahde: claude\n---\n# Aloitus\n\nKatso [[kohde-muistiinpano]] ja [[kohde-muistiinpano|lyhyesti]].\n\n## Liittyy\n- [[puuttuva-nimi]]\n'
B='---\ntyyppi: tieto\notsikko: Kohteen otsikko\nluotu: 2026-11-19\nlahde: claude\n---\n# Kohteen otsikko\n\nTämä on kohde.\n'
SEED={'tieto/a/aloitus.md':A,'tieto/a/kohde-muistiinpano.md':B}
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h},device_scale_factor=2,has_touch=True,is_mobile=True)).new_page()
    await pg.add_init_script(FAKE+";(function(){var S=%s;if(!window.__repo.kept)for(var k in S)window.__repo.put(k,S[k]);localStorage.setItem('kaikki:gh',JSON.stringify({repo:'t/v',token:'x',branch:'main'}));})();"%json.dumps(SEED))
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond,info=''):
        print('  %-44s %s %s'%(label,'ok' if cond else 'VIRHE',info if not cond else ''))
        if not cond: bad.append(label)
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(1500)
    card=await pg.evaluate("Array.prototype.map.call(document.querySelectorAll('.ncard'),function(c){return c.innerText;}).join('|')")
    want('kortissa linkki otsikkona','Kohteen otsikko ja lyhyesti' in card and '[[' not in card and '• puuttuva-nimi' in card,card[:200])
    await pg.evaluate("(function(){var c=Array.prototype.filter.call(document.querySelectorAll('.ncard'),function(c){return c.innerText.indexOf('Aloitus')>=0;})[0];c.click();})()"); await pg.wait_for_timeout(400)
    r=await pg.evaluate("""(function(){var s=document.querySelector('#ns-hl .lks');return {reading:document.getElementById('nsheet').classList.contains('reading'),t:s?s.dataset.t:'',after:s?getComputedStyle(s,'::after').content:'',
      br:Array.prototype.every.call(document.querySelectorAll('#ns-hl .lk.mdm'),function(e){return getComputedStyle(e).display==='none';}),x:document.querySelectorAll('#ns-hl .lkx').length};})()""")
    want('lukunäkymässä otsikko, hakasulkeet piilossa',r['reading'] and r['t']=='Kohteen otsikko' and 'Kohteen otsikko' in r['after'] and r['br'] and r['x']==1,r)
    box=await pg.evaluate("(function(){var R=document.querySelector('#ns-hl .lks').getBoundingClientRect();return [R.left+R.width/2,R.top+R.height/2,R.width];})()")
    want('linkillä on kokoa',box[2]>20,box)
    await pg.touchscreen.tap(box[0],box[1]); await pg.wait_for_timeout(400)
    v=await pg.input_value('#ns-text')
    want('napautus avasi kohteen',v.startswith('Kohteen otsikko'),v[:40])
    want('ei sivuvirheitä',not errs,errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640)): bad+=await run(p,w,h)
    print('VIRHEITÄ: '+', '.join(bad) if bad else 'kaikki ok'); sys.exit(1 if bad else 0)
asyncio.run(main())
