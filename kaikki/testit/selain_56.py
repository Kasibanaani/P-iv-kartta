"""Kaikki 0.56 (korjaussuunnitelma 2, 23.11.2026): Muistion yläpalkin ja sarakeotsikon väliin ei jää rakoa.
Ennen: leveällä näytöllä palkki liimautui kohtaan -14 px mutta otsikko laski -10 px, joten väliin jäi 4 px, josta osuma meni vierivään sisältöön.
Tarkistaa 100 muistiinpanon rivinäkymässä leveyksillä 320, 390, 1280 ja 1440, vaalealla ja tummalla teemalla sekä isolla tekstillä:
vieritys alussa, keskellä, lopussa ja vinottain; palkin alareuna = otsikon yläreuna (ero enintään 1 px); osuma välistä ei ole listarivi;
otsikon ja solun vasen reuna samassa kohdassa (enintään 1 px) vaakavierityksen jälkeen; palkin korkeuden muutos (iso teksti) seurataan.
Käyttö: python3 testit/selain_56.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
FAKE=open(os.path.join(D,'fakegh.js'),encoding='utf8').read()
def md(i): return '---\ntyyppi: projekti\notsikko: Muistiinpano %d\nkuvaus: \nluotu: 2026-11-%02d\nlahde: emil\ntila: %s\ntagit: [aihe%d, toinen-pitka-tunniste]\n---\n# Muistiinpano %d\n\nTeksti %d.\n'%(i,1+i%28,['kesken','valmis','idea'][i%3],i%7,i,i)
SEED={'projektit/k%02d/m%03d.md'%(i%9,i):md(i) for i in range(100)}
SEED['nakymat/leveat.md']='---\ntyyppi: nakyma\notsikko: Leveät\nnakyy: ei\nsarakkeet:\n  - otsikko\n  - kansio\n  - tila | siru\n  - luotu\n  - tunnisteet\n  - kuka\n  - takaisinlinkit\n---\n# Leveät\n'
MEASURE="""(function(){var nb=document.getElementById('nbar'),h=document.querySelector('#nlist .rvh')||document.querySelector('.rvh');
  if(!nb||!h)return null;var a=nb.getBoundingClientRect(),b=h.getBoundingClientRect(),x=Math.round(b.left+Math.min(b.width,innerWidth-b.left)/2),y=a.bottom+0.5;
  var hit=document.elementFromPoint(x,Math.min(y,b.top+0.5)),rowHit=!!(hit&&hit.closest('.rvr:not(.rvhead)'));
  var hc=h.querySelectorAll('.rvc'),row=document.querySelector('#nlist .rvr:not(.rvhead)'),rc=row?row.querySelectorAll('.rvc'):[],dx=0;
  for(var i=0;i<Math.min(hc.length,rc.length);i++)dx=Math.max(dx,Math.abs(hc[i].getBoundingClientRect().left-rc[i].getBoundingClientRect().left));
  return {nb:a.bottom,h:b.top,gap:b.top-a.bottom,rowHit:rowHit,hit:hit?hit.className:'',dx:dx};})()"""
async def run(p,w,h,theme,big):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h},color_scheme=theme)).new_page()
    await pg.add_init_script(FAKE+";(function(){var S=%s;if(!window.__repo.kept)for(var k in S)window.__repo.put(k,S[k]);try{localStorage.setItem('kaikki:gh',JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));localStorage.setItem('kaikki:nmode','rows');localStorage.setItem('kaikki:nview','nakymat/leveat.md');}catch(e){}})();"%json.dumps(SEED))
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond,info=''):
        print('  %-56s %s %s'%(label,'ok' if cond else 'VIRHE',info if not cond else ''))
        if not cond: bad.append(label)
    print('leveys',w,theme,'iso teksti' if big else '')
    await pg.goto(U); await pg.wait_for_timeout(1800)
    if big:
        await pg.evaluate("document.querySelectorAll('#nbar button,#nbar input').forEach(function(x){x.style.fontSize='22px';x.style.minHeight='52px';})"); await pg.wait_for_timeout(300)
    rows=await pg.evaluate("document.querySelectorAll('#nlist .rvr:not(.rvhead)').length")
    want('rivinäkymässä rivejä',rows>=50,rows)
    sc="(function(){var m=document.getElementById('main');return m.scrollHeight>m.clientHeight?m:document.scrollingElement;})()"
    maxy=await pg.evaluate(sc+".scrollHeight-"+sc+".clientHeight")
    for name,y,x in (('alussa',300,0),('keskellä',maxy//2,0),('lopussa',maxy,0),('vinottain',maxy//3,160)):
        await pg.evaluate("(function(){var m=%s;m.scrollTop=%d;var l=document.getElementById('nlist');if(l)l.scrollLeft=%d;})()"%(sc,y,x)); await pg.wait_for_timeout(250)
        r=await pg.evaluate(MEASURE)
        want('vieritys %s: palkki ja otsikko vierekkäin (≤1 px)'%name,r and abs(r['gap'])<=1,r)
        want('vieritys %s: osuma välistä ei ole listarivi'%name,r and not r['rowHit'],r)
        want('vieritys %s: otsikon ja solun reunat (≤1 px)'%name,r and r['dx']<=1,r)
    want('ei sivuttaisvieritystä',await pg.evaluate("document.documentElement.scrollWidth<=innerWidth"))
    want('ei sivuvirheitä',not errs,errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((1440,900),(1280,800),(390,844),(320,640)):
            for theme in ('light','dark'): bad+=await run(p,w,h,theme,False)
        for w,h in ((1440,900),(390,844)): bad+=await run(p,w,h,'light',True)
    print('KAIKKI OK' if not bad else 'VIRHEITÄ: '+', '.join(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
