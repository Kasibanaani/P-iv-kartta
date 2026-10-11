"""Projektikartan perustesti: appi aukeaa, projektin ja tekijän voi lisätä ja valita, eikä mikään mene ruudun yli.
Käyttö: python3 testit/selain_perus.py [polku index.html-tiedostoon]"""
import asyncio, os, sys
from playwright.async_api import async_playwright
U='file://'+os.path.abspath(sys.argv[1] if len(sys.argv)>1 else os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
OVER="""(function(){var w=document.documentElement.clientWidth,out=[];
 document.querySelectorAll('input,textarea,select,button').forEach(function(e){var r=e.getBoundingClientRect();
  if(r.width&&r.height&&e.offsetParent!==null&&e.type!=='file'&&(r.right>w+0.5||r.left<-0.5))out.push((e.id||e.tagName)+' '+Math.round(r.left)+'..'+Math.round(r.right));});
 var m=document.getElementById('main');
 return JSON.stringify({w:w,doc:document.documentElement.scrollWidth,main:[m.scrollWidth,m.clientWidth],yli:out});})()"""
async def run(p,w,h):
    b=await p.chromium.launch(); errs=[]; bad=[]
    ctx=await b.new_context(viewport={'width':w,'height':h},device_scale_factor=2)
    pg=await ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(U); await pg.wait_for_timeout(300)
    import json
    async def check(label):
        r=json.loads(await pg.evaluate(OVER)); ok=not r['yli'] and r['doc']<=r['w'] and r['main'][0]<=r['main'][1]
        print('  %-28s %s %s'%(label,'ok' if ok else 'YLI',r if not ok else ''))
        if not ok: bad.append(label)
    print('leveys',w)
    await check('alku')
    await pg.fill('#firstproj','Ensimmäinen projekti'); await pg.click('#p-day .addrow .btn'); await pg.wait_for_timeout(200)
    print('  projekti luotu:',await pg.inner_text('#wk'))
    await check('projekti luotu')
    await pg.click('[data-tab="set"]'); await pg.wait_for_timeout(200)
    for n in ['Nukuin hyvin','Liikuin','Pitkä vaihtoehdon nimi, joka rivittyy varmasti usealle riville kapealla näytöllä']:
        await pg.fill('#newopt',n); await pg.click('#addopt'); await pg.wait_for_timeout(80)
    n=await pg.locator('#optlist [data-edit]').count(); print('  tekijöitä listassa:',n)
    if n!=3: bad.append('lisäys')
    await check('asetukset')
    await pg.evaluate("document.querySelectorAll('#p-set details').forEach(function(d){d.open=true;})"); await pg.wait_for_timeout(200)
    await check('asetukset, osiot auki')
    await pg.locator('#optlist [data-edit]').first.click(); await pg.wait_for_timeout(250)
    await check('muokkausikkuna')
    await pg.click('#ed-ok'); await pg.wait_for_timeout(150)
    await pg.click('[data-tab="day"]'); await pg.wait_for_timeout(200)
    await pg.locator('#p-day .opt').first.click(); await pg.wait_for_timeout(150)
    sel=await pg.locator('#p-day .opt[aria-pressed="true"]').count(); print('  valittuna projektissa:',sel)
    if sel!=1: bad.append('valinta')
    await check('projekti')
    await pg.click('[data-tab="links"]'); await pg.wait_for_timeout(150); await check('yhteydet')
    await pg.reload(); await pg.wait_for_timeout(250)
    sel=await pg.locator('#p-day .opt[aria-pressed="true"]').count(); print('  valinta säilyi latauksen yli:',sel==1)
    if sel!=1: bad.append('tallennus')
    print('  errs',errs); await b.close(); return bad+errs
async def main():
    async with async_playwright() as p:
        bad=await run(p,390,800)+await run(p,320,640)
    print('KAIKKI OK' if not bad else 'VIRHEITÄ: '+', '.join(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
