"""Juuri 1.85: kuvitus taustana ja panorointi osioiden välillä (Emil 24.10.2026).
Kuva on koko taustalla (taivaan väri jatkuu ylös) tai yläosassa häivyttäen. Muistio näyttää maiseman vasemman reunan, Asiat oikean,
ja vaihdossa kuva liukuu (vähennetty liike: ei liukumaa). Paljas teksti saa taustavärisen hehkun. Leveydet 390 ja 320 px.
Käyttö: python3 testit/selain_185.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from apu import tab, menu
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
K="JSON.parse(localStorage.getItem('paatospuu:v1')).kokonaisuudet[0]"
ST="""(function(){var L=document.getElementById('artband'),g=L.querySelector('svg'),m=new DOMMatrix(getComputedStyle(g).transform);
 return {hid:L.hidden,x:Math.round(m.m41),w:g.getBoundingClientRect().width,lw:L.clientWidth,top:L.classList.contains('top'),z:getComputedStyle(L).zIndex,
  bg:L.style.backgroundColor,tr:getComputedStyle(g).transitionDuration,halo:getComputedStyle(document.getElementById('main')).textShadow!=='none'};})()"""
async def run(p,w,h,reduce=False):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    ctx=await b.new_context(viewport={'width':w,'height':h},reduced_motion='reduce' if reduce else 'no-preference'); pg=await ctx.new_page()
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond):
        print('  %-48s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    print('leveys',w,'(vähennetty liike)' if reduce else '')
    await pg.goto(U); await pg.wait_for_timeout(200)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await tab(pg,'notes'); await pg.wait_for_timeout(80)
    want('ei kuvitusta oletuksena', await pg.evaluate("document.getElementById('artband').hidden"))
    await menu(pg,'#m-proj'); await pg.wait_for_timeout(150)
    l=pg.locator('#set-art button[data-v="satu"]'); await l.scroll_into_view_if_needed(); await l.click(); await pg.wait_for_timeout(100)
    want('paikan valinta näkyy kuvan kanssa', await pg.locator('#set-artpos button').count()==2)
    await pg.click('#psheet .sx'); await pg.wait_for_timeout(200)
    xs=[]
    for t in ['notes','cal','list','terms']:
        await tab(pg,t); await pg.wait_for_timeout(700 if not reduce else 80)
        s=await pg.evaluate(ST); xs.append(s['x'])
    want('tausta näkyy koko alueella, sisällön alla', not s['hid'] and s['z']=='-1' and not s['top'] and s['bg']!='')
    want('maisema leveämpi kuin ruutu', s['w']>s['lw']*1.5)
    want('panorointi: Muistio vasen reuna, Asiat oikea', xs[0]==0 and xs[0]>xs[1]>xs[2]>xs[3] and abs(xs[3]+(s['w']-s['lw']))<=1)
    want('liukuma vain ilman vähennettyä liikettä', (s['tr']=='0s') if reduce else (s['tr']!='0s'))
    want('paljas teksti hehkulla', s['halo'])
    if os.environ.get('KUVA'): await pg.screenshot(path=os.environ['KUVA']+'/e185_%d.png'%w)
    # Yläosa, häivytys
    await menu(pg,'#m-proj'); await pg.wait_for_timeout(150)
    l=pg.locator('#set-artpos button[data-v="top"]'); await l.scroll_into_view_if_needed(); await l.click(); await pg.wait_for_timeout(100)
    await pg.click('#psheet .sx'); await pg.wait_for_timeout(200)
    s=await pg.evaluate(ST)
    want('yläosa: kuva ylhäällä, häivytys', s['top'] and await pg.evaluate("getComputedStyle(document.getElementById('artband')).maskImage!=='none'||getComputedStyle(document.getElementById('artband')).webkitMaskImage!=='none'"))
    want('asetus tallentuu projektille', await pg.evaluate(K+".asetukset.artpos")=='top' and await pg.evaluate(K+".asetukset.art")=='satu')
    await pg.reload(); await pg.wait_for_timeout(300)
    want('säilyy uudelleenlatauksessa', (await pg.evaluate(ST))['top'])
    # Ei kuvitusta: kerros pois
    await menu(pg,'#m-proj'); await pg.wait_for_timeout(150)
    l=pg.locator('#set-art button[data-v=""]'); await l.scroll_into_view_if_needed(); await l.click(); await pg.wait_for_timeout(100)
    want('ei kuvitusta: kerros ja paikan valinta pois', await pg.evaluate("document.getElementById('artband').hidden") and await pg.locator('#set-artpos').count()==0)
    await pg.click('#psheet .sx'); await pg.wait_for_timeout(100)
    want('ei hehkua ilman kuvaa', await pg.evaluate("getComputedStyle(document.getElementById('main')).textShadow")=='none')
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h,r in ((390,844,False),(320,640,False),(390,844,True)): bad+=await run(p,w,h,r)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
