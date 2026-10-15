"""Työkalujen teemat, luettavuus ja projektin Näkymän värien erillisyys."""
import asyncio, json
from playwright.async_api import async_playwright
from yhteinen import U
async def run():
 async with async_playwright() as p:
  b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':1440,'height':1000},reduced_motion='reduce',color_scheme='light');pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
  await pg.goto(U);await pg.click('#wexample');await pg.wait_for_timeout(300)
  baseline=await pg.evaluate('JSON.stringify(APP.data)')
  js="""() => [...document.querySelectorAll('.ue,.ue *')].map(e=>{const s=getComputedStyle(e);return ['color','backgroundColor','borderTopColor','borderRadius','boxShadow','fontSize','fontFamily','fill','stroke'].map(k=>s[k]);})"""
  look=await pg.evaluate(js)
  await pg.click('#setbtn')
  for mode in ['light','dark']:
   await pg.click('[data-ap-mode="'+mode+'"]')
   for theme in ['forest','lake','plum','sand','rose','graphite','lagoon','lavender','olive','copper']:
    await pg.click('[data-ap-theme="'+theme+'"]')
    assert await pg.evaluate('JSON.stringify(APP.data)')==baseline,(mode,theme,'project data')
    assert await pg.evaluate(js)==look,(mode,theme,'project widget colors')
    assert await pg.locator('[data-ap-theme="'+theme+'"]').get_attribute('aria-pressed')=='true'
    ratios=await pg.evaluate("""() => {const s=getComputedStyle(document.documentElement);const lum=h=>{const v=h.trim().slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*v[0]+.7152*v[1]+.0722*v[2]},ratio=(a,b)=>{a=lum(s.getPropertyValue('--ap-'+a));b=lum(s.getPropertyValue('--ap-'+b));return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)};return ['bg','cell'].flatMap(b=>['label','label2','label3','accent'].map(a=>ratio(a,b))).concat(ratio('on','accent'));}""")
    assert min(ratios)>=4.5,(mode,theme,ratios)
    assert await pg.evaluate("getComputedStyle(document.getElementById('toast')).color!==getComputedStyle(document.getElementById('toast')).backgroundColor")
  # Both sides share the same options, but choosing one does not change the other.
  assert await pg.locator('[data-ap-theme] strong').all_text_contents()==await pg.locator('button[data-view-theme] strong').all_text_contents()
  blocks=await pg.evaluate('JSON.stringify([APP.P.b,APP.P.st,APP.P.mem,APP.P.lg])')
  editor=await pg.evaluate("localStorage.getItem('appiappi:appearance')")
  for mode in ['light','dark']:
   await pg.click('[data-view-mode="'+mode+'"]')
   for theme in ['forest','lake','plum','sand','rose','graphite','lagoon','lavender','olive','copper']:
    editor=await pg.evaluate("localStorage.getItem('appiappi:appearance')")
    await pg.click('button[data-view-theme="'+theme+'"]')
    assert await pg.get_attribute('html','data-view-theme')==theme
    assert await pg.evaluate('JSON.stringify([APP.P.b,APP.P.st,APP.P.mem,APP.P.lg])')==blocks
    assert await pg.evaluate("localStorage.getItem('appiappi:appearance')")==editor
    assert await pg.evaluate('APP.P.appearance')=={'mode':mode,'theme':theme}
    await pg.click('[data-ap-mode="'+mode+'"]');await pg.click('[data-ap-theme="'+theme+'"]')
    assert await pg.evaluate("['bg','cell','label','label2','sep','accent','fill','tint'].every(k=>getComputedStyle(document.documentElement).getPropertyValue('--'+k)===getComputedStyle(document.documentElement).getPropertyValue('--ap-'+k))")
  # Project appearance travels with copies and imports without changing the schema.
  assert await pg.evaluate("KK.repair(KK.clone(APP.P)).appearance.theme")=='copper'
  await pg.reload();assert await pg.evaluate('APP.P.appearance')=={'mode':'dark','theme':'copper'}
  await pg.click('#setbtn')
  # Gray really neutralizes editor badges while leaving project samples colorful.
  await pg.click('[data-ap-theme="graphite"]');await pg.click('#sheet [data-x="close"]');await pg.click('#tabs [data-t="molemmat"]')
  assert await pg.evaluate('JSON.stringify([APP.P.b,APP.P.st,APP.P.mem,APP.P.lg])')==blocks
  await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(100)
  gray=await pg.evaluate(r"""() => [...document.querySelectorAll('#lvp .ln .lic')].every(e=>{const c=getComputedStyle(e).color.match(/\d+/g).map(Number);return c[0]===c[1]&&c[1]===c[2]||c[0]>c[1]&&c[0]>c[2];})""")
  assert gray
  await pg.click('#setbtn');await pg.click('[data-ap-theme="copper"]');await pg.click('#sheet [data-x="close"]');await pg.reload();assert await pg.get_attribute('html','data-appearance-theme')=='copper'
  await pg.click('#setbtn');await pg.click('[data-ap-mode="auto"]');await pg.emulate_media(color_scheme='dark');await pg.wait_for_function("document.documentElement.dataset.appearanceMode==='dark'")
  await pg.emulate_media(color_scheme='light');await pg.wait_for_function("document.documentElement.dataset.appearanceMode==='light'")
  # Existing project appearance and other settings remain operative.
  await pg.click('[data-view-mode="dark"]');await pg.click('[data-cfg="snap"][data-v="0"]');await pg.click('[data-cfg="df"][data-v="pp.kk.vv"]')
  assert await pg.evaluate("[APP.P.appearance.mode,APP.data.cfg.snap,APP.data.cfg.df]")==['dark',False,'pp.kk.vv']
  for w in [390,320]:
   await pg.set_viewport_size({'width':w,'height':844});await pg.click('[data-ap-theme="graphite"]');r=await pg.locator('#sheet').bounding_box();assert r['x']>=0 and r['x']+r['width']<=w+1
  assert not errs,errs
  await ctx.close()
  for init in ["localStorage.setItem('appiappi:appearance','broken')","Storage.prototype.getItem=function(){throw Error('blocked')};Storage.prototype.setItem=function(){throw Error('blocked')}"]:
   c=await b.new_context(viewport={'width':1440,'height':1000});await c.add_init_script(init);q=await c.new_page();await q.goto(U);await q.click('#wexample');await q.click('#setbtn');await q.click('[data-ap-theme="graphite"]');assert await q.get_attribute('html','data-appearance-theme')=='graphite';await c.close()
  await b.close();print('OK: 20 editor + 20 project theme/mode pairs, contrast >=4.5, project data and widget colors unchanged, neutral tools, saved settings, auto mode, existing settings, 390/320 px and blocked/invalid storage.')
asyncio.run(run())
