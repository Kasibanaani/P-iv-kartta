"""Juuri 1.73: osion ohjainrivi alhaalla alapalkin yläpuolella (Emil 24.10.2026, kuva 2). Muistio: Avoimet/Kuitatut/Toistuvat,
Listat: Lista ⌄, Kalenteri: kuukausi vasemmalla ja ‹ Tänään › oikealla. Asioissa ei riviä. Tietokoneella rivit ennallaan ylhäällä.
Leveydet 390 ja 320 px, tietokone 1280 px. Käyttö: python3 testit/selain_173.py"""
import asyncio, os, sys, json, datetime
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from apu import tab, menu, tsx
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
GEO="""(function(){var s=document.getElementById('sbar'),p=document.getElementById('pbar'),m=document.getElementById('main');
  var a=s.getBoundingClientRect(),b=p.getBoundingClientRect(),c=m.getBoundingClientRect(),w=document.documentElement.clientWidth,o=[];
  s.querySelectorAll('button').forEach(function(e){var r=e.getBoundingClientRect();if(r.right>w+.5||r.left<-.5||r.bottom>b.top+.5)o.push(e.id||e.textContent);});
  return {vis:!s.hidden&&!!s.offsetParent,gap:Math.round(b.top-a.bottom),mainEnd:Math.round(a.top-c.bottom),yli:o,ids:Array.prototype.map.call(s.querySelectorAll('[id]'),function(e){return e.id;})};})()"""
async def phone(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h})).new_page()
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond):
        print('  %-48s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(200)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await tab(pg,'notes'); await pg.wait_for_timeout(60)
    g=json.loads(json.dumps(await pg.evaluate(GEO)))
    want('Muistio: valitsin alhaalla', g['vis'] and 'noteview' in g['ids'] and g['gap']==0 and g['mainEnd']>=0 and not g['yli'])
    want('Muistio: suodatinrivi jää ylös', await pg.is_visible('#filterpick') and (await pg.locator('#filterpick').bounding_box())['y']<120)
    await pg.click('#noteview [data-nv="done"]'); await pg.wait_for_timeout(60)
    want('valitsin toimii alhaalla', await pg.get_attribute('#noteview [data-nv="done"]','aria-pressed')=='true' or 'on' in (await pg.get_attribute('#noteview [data-nv="done"]','class') or ''))
    want('yksi valitsin', await pg.locator('#noteview').count()==1)
    await pg.click('#noteview [data-nv="open"]'); await pg.wait_for_timeout(40)
    await tab(pg,'list'); await pg.wait_for_timeout(60)
    g=await pg.evaluate(GEO)
    want('Listat: Lista ⌄ alhaalla', g['vis'] and 'chlist-pick' in g['ids'] and 'chplan-t' in g['ids'] and not g['yli'])
    want('Listat: tyhjä yläpalkki piiloon', not await pg.is_visible('#nbar'))
    await pg.click('#chlist-pick'); await pg.wait_for_timeout(60)
    want('Lista ⌄ avaa listat', await pg.is_visible('#wsheet')); await pg.click('#wsheet .sx'); await pg.wait_for_timeout(40)
    await tab(pg,'cal'); await pg.wait_for_timeout(80)
    g=await pg.evaluate(GEO)
    want('Kalenteri: kuukausi ja nuolet alhaalla', g['vis'] and 'calmonth' in g['ids'] and 'caltoday' in g['ids'] and not g['yli'])
    o=await pg.evaluate("(function(){function x(e){return e.getBoundingClientRect().left;}var h=document.querySelector('#sbar .calhead'),bs=h.querySelectorAll(':scope>button');return [x(document.getElementById('calmonth')),x(bs[0]),x(document.getElementById('caltoday')),x(bs[bs.length-1]),bs[0].textContent,bs[bs.length-1].textContent];})()")
    want('järjestys: kuukausi, ‹, Tänään, ›', o[0]<o[1]<o[2]<o[3] and o[4]=='‹' and o[5]=='›')
    want('viikkonauha jää ylös', (await pg.locator('#week').bounding_box())['y']<80)
    d0=await pg.get_attribute('#week .cday.on','data-day')
    await pg.locator('#sbar .calhead > button').last.click(); await pg.wait_for_timeout(60)
    d1=await pg.get_attribute('#week .cday.on','data-day')
    want('› siirtää viikon', (datetime.date.fromisoformat(d1)-datetime.date.fromisoformat(d0)).days==7)
    await pg.click('#caltoday'); await pg.wait_for_timeout(60)
    want('Tänään palaa', await pg.get_attribute('#week .cday.on','data-day')==d0 and await pg.is_disabled('#caltoday'))
    await pg.click('#calmonth'); await pg.wait_for_timeout(60)
    want('kuukausi avaa kuukausinäkymän', await pg.locator('dialog[open]').count()==1); await pg.keyboard.press('Escape'); await pg.wait_for_timeout(60)
    await tab(pg,'terms'); await pg.wait_for_timeout(60)
    want('Asiat: ei ohjainriviä', not await pg.is_visible('#sbar'))
    await menu(pg,'#m-tree'); await pg.wait_for_timeout(60)
    want('Päätöspuu: ei ohjainriviä', not await pg.is_visible('#sbar'))
    await tab(pg,'notes'); await pg.wait_for_timeout(40)
    await pg.click('#newnote'); await pg.wait_for_timeout(120); await pg.fill('#ns-text','Kokeilu'); await pg.dispatch_event('#ns-text','input')
    r=await pg.evaluate("(function(){var d=document.getElementById('nsheet').getBoundingClientRect();return Math.round(innerHeight-d.bottom);})()")
    want('iso ikkuna peittää ohjainrivin ja alapalkin (1.74)', abs(r)<=1)
    await pg.click('#nsheet .sx'); await pg.wait_for_timeout(60)
    await pg.locator('#nlist .ncard .ncheck').first.click(); await pg.wait_for_timeout(60)
    r=await pg.evaluate("(function(){var u=document.getElementById('undo').getBoundingClientRect(),s=document.getElementById('sbar').getBoundingClientRect();return [u.bottom<=s.top,u.height>0];})()")
    want('Kumoa ohjainrivin yläpuolella', all(r))
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def desk(p):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':1280,'height':800})).new_page()
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond):
        print('  %-48s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    print('leveys 1280')
    await pg.goto(U); await pg.wait_for_timeout(200)
    await pg.click('[data-tab="use"]'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    for t,sel in (('notes','#noteview'),('cal','#calsticky .calhead'),('list','#nbar #chlist-pick')):
        await pg.click('[data-tab="%s"]'%t); await pg.wait_for_timeout(60)
        want('tietokone %s: rivi ylhäällä'%t, not await pg.is_visible('#sbar') and await pg.is_visible(sel) and (await pg.locator(sel).bounding_box())['y']<200)
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640)): bad+=await phone(p,w,h)
        bad+=await desk(p)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
