"""Kaikki 0.36 (Emil 22.11.2026, A1b): kalenterin merkinnät siistiksi.
Aikajanalla kuittausruutu ja keston kahva eivät leikkaa 15, 30, 45 ja 120 min merkinnöissä, kellonaika on otsikon kanssa samalla rivillä
eikä mene merkinnän alareunan yli; viikkolistassa kuittausruutu on rivin oikealla puolella ja enintään 22 px; kuittaus toimii yhä.
Leveydet 390 ja 320 (päivänäkymä) sekä 390 (viikkolista). Käyttö: python3 testit/selain_36.py"""
import asyncio, os, sys, json, datetime
from playwright.async_api import async_playwright
T=datetime.date.today();TD='%d.%d.'%(T.day,T.month)
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
FAKE=open(os.path.join(D,'fakegh.js'),encoding='utf8').read()
def md(n,t,when): return '---\ntyyppi: tapahtuma\notsikko: %s\nkuvaus: \nluotu: 2026-11-20\nlahde: emil\n---\n# %s\n\n%s %s klo %s.\n'%(t,t,t,TD,when)
SEED={'kalenteri/a.md':md(1,'Lyhyt','9-9.15'),'kalenteri/b.md':md(2,'Puolituntinen käynti ja muuta','10-10.30'),'kalenteri/c.md':md(3,'Kolme varttia','11-11.45'),'kalenteri/d.md':md(4,'Hoitosuunnitelmat','12-14')}
def inter(a,b): return not (a['x']+a['width']<=b['x'] or b['x']+b['width']<=a['x'] or a['y']+a['height']<=b['y'] or b['y']+b['height']<=a['y'])
async def run(p,w,h,view):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h})).new_page()
    await pg.add_init_script(FAKE+";(function(){var S=%s;if(!window.__repo.kept)for(var k in S)window.__repo.put(k,S[k]);try{localStorage.setItem('kaikki:gh',JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));localStorage.setItem('kaikki:calview','%s')}catch(e){}})();"%(json.dumps(SEED),view))
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond,info=''):
        print('  %-58s %s %s'%(label,'ok' if cond else 'VIRHE',info if not cond else ''))
        if not cond: bad.append(label)
    print('leveys',w,view)
    await pg.goto(U); await pg.wait_for_timeout(1500)
    await pg.click('#roll'); await pg.click('#section-cal'); await pg.wait_for_timeout(400)
    if view=='d':
        evs=await pg.evaluate("""Array.from(document.querySelectorAll('#timeline .ev')).map(function(e){var r=function(x){var q=x.getBoundingClientRect();return {x:q.x,y:q.y,width:q.width,height:q.height};};
          var s=e.querySelector('span'),bb=e.querySelector('b');return {t:bb.textContent,ev:r(e),ck:r(e.querySelector('.evck')),gr:r(e.querySelector('.grip')),sp:s?r(s):null,b:r(bb),spw:s?s.getBoundingClientRect().width:0};})""")
        want('neljä merkintää aikajanalla',len(evs)==4,len(evs))
        for e in evs:
            want('ruutu ja kahva eivät leikkaa: '+e['t'][:14],not inter(e['ck'],e['gr']),(e['ck'],e['gr']))
            if e['sp'] and e['spw']>0:
                want('aika samalla rivillä eikä yli alareunan: '+e['t'][:14],abs(e['sp']['y']-e['b']['y'])<6 and e['sp']['y']+e['sp']['height']<=e['ev']['y']+e['ev']['height']+1,(e['sp'],e['b'],e['ev']))
    else:
        r=await pg.evaluate("""(function(){var l=Array.from(document.querySelectorAll('.wline'))[0];if(!l)return null;var c=l.querySelector('.wck').getBoundingClientRect(),w=l.querySelector('.wrow').getBoundingClientRect();return {cl:c.left,wr:w.right,cw:c.width};})()""")
        want('viikkolistan ruutu oikealla ja pieni',r and r['cl']>=r['wr']-1 and r['cw']<=22,r)
        await pg.evaluate("document.querySelector('.wline .wck').click()"); await pg.wait_for_timeout(200)
        want('kuittaus toimii',await pg.evaluate("document.querySelector('.wline .wck').getAttribute('aria-pressed')")=='true')
    want('ei sivuttaisvieritystä',await pg.evaluate("document.documentElement.scrollWidth<=innerWidth"))
    want('ei sivuvirheitä',not errs,errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h,v in ((390,844,'d'),(320,640,'d'),(390,844,'w')): bad+=await run(p,w,h,v)
    print('KAIKKI OK' if not bad else 'VIRHEITÄ: '+', '.join(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
