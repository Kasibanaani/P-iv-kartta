"""Juuri 1.84: osionappi ja Valikko alakulmissa (Emil 24.10.2026).
Napissa vain nykyinen osio, yläpuolella alkukirjaimet M K L A kiinteässä järjestyksessä, nykyinen korostettuna. Koko ei muutu napautuksesta.
Valikko oikeassa alakulmassa samankokoisena. Kulmien pyöristys seuraa nappien muotoa. Ohjainrivi ja vienti kulmien välissä, mikään ei mene päällekkäin.
Vaakatasossa sivupalkki ennallaan. Leveydet 390 ja 320 px. Käyttö: python3 testit/selain_184.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from apu import tab, menu
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
BOX="""(function(id){var r=document.getElementById(id).getBoundingClientRect();return [Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)];})"""
# Kulmien välin näkyvät osat: eivät mene kulmien päälle eivätkä toistensa päälle
CLASH="""(function(){var R=document.getElementById('roll').getBoundingClientRect(),M=document.getElementById('menu').getBoundingClientRect(),out=[],B=[];
 document.querySelectorAll('#pbar .pmid button, #pbar .pmid h2').forEach(function(e){var r=e.getBoundingClientRect();if(!r.width||!r.height||e.closest('h2')&&e.tagName==='BUTTON')return;
  if(r.left<R.right-0.5||r.right>M.left+0.5)out.push('kulma:'+(e.id||e.textContent));
  if(e.scrollWidth>e.clientWidth+1&&e.tagName==='BUTTON'&&!e.closest('#noteview'))out.push('ei mahdu:'+(e.id||e.textContent));
  B.forEach(function(b){if(r.left<b.r.right-0.5&&b.r.left<r.right-0.5&&r.top<b.r.bottom-0.5&&b.r.top<r.bottom-0.5)out.push('päällekkäin:'+(e.id||e.textContent)+'/'+b.n);});B.push({r:r,n:e.id||e.textContent});});
 return JSON.stringify(out);})()"""
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    ctx=await b.new_context(viewport={'width':w,'height':h}); pg=await ctx.new_page()
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond):
        print('  %-48s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    box=lambda i: pg.evaluate(BOX+"('%s')"%i)
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(200)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await tab(pg,'notes'); await pg.wait_for_timeout(100)
    r0=await box('roll'); m0=await box('menu')
    want('kulmat samankokoiset, leveämpi kuin korkea', r0[2:]==m0[2:] and r0[2]>=60 and r0[3]>=70 and r0[2]<=r0[3]+12)
    want('vasen ja oikea alakulma symmetrisesti', abs(r0[0]-(w-m0[0]-m0[2]))<=1 and r0[1]==m0[1])
    want('ei seuraavan osion nimeä', not await pg.is_visible('#roll-next') and await pg.inner_text('#roll-now')=='Muistio')
    L=lambda: pg.evaluate("Array.prototype.map.call(document.querySelectorAll('#roll-let i'),function(i){return i.textContent+(i.classList.contains('on')?'*':'');}).join(' ')")
    want('kirjaimet M K L A, nykyinen korostettu', await L()=='M* K L A' and await pg.is_visible('#roll-let'))
    seen=[]; sizes=set()
    for k in range(4):
        sizes.add(tuple(await box('roll'))); seen.append((await pg.inner_text('#roll-now'),await L()))
        want('ei päällekkäisyyksiä: '+seen[-1][0], json.loads(await pg.evaluate(CLASH))==[])
        await pg.click('#roll'); await pg.wait_for_timeout(250)
    want('järjestys ei rullaa, korostus siirtyy', [s[1] for s in seen]==['M* K L A','M K* L A','M K L* A','M K L A*'] and [s[0] for s in seen]==['Muistio','Kalenteri','Listat','Asiat'])
    want('koko ei muutu napautuksesta', len(sizes)==1 and await pg.inner_text('#roll-now')=='Muistio')
    want('vienti kulmien välissä', (await box('qx'))[0]>r0[0]+r0[2] and (await box('qx'))[0]+40<=m0[0])
    await pg.click('#menu'); await pg.wait_for_timeout(100); ok=await pg.is_visible('#menupop'); await pg.mouse.click(5,40); await pg.wait_for_timeout(80)
    want('Valikko-napista valikko', ok)
    if os.environ.get('KUVA'): await pg.screenshot(path=os.environ['KUVA']+'/e184_%d.png'%w)
    # Muotokieli: Pilleri pyöristää kulmat, Terävä tekee lähes neliön
    await menu(pg,'#m-proj'); await pg.wait_for_timeout(150)
    async def pick(sel):
        await pg.locator(sel).scroll_into_view_if_needed(); await pg.locator(sel).click(); await pg.wait_for_timeout(60)
    await pick('#set-bshape button[data-v="999"]'); rad1=await pg.evaluate("getComputedStyle(document.getElementById('roll')).borderTopLeftRadius")
    await pick('#set-bshape button[data-v="2"]'); rad2=await pg.evaluate("getComputedStyle(document.getElementById('menu')).borderTopLeftRadius")
    await pg.click('#psheet .sx'); await pg.wait_for_timeout(120)
    want('pyöristys nappien muodon mukaan', rad1=='40px' and rad2=='2px')
    want('ei sivuvirheitä', not errs)
    await ctx.close()
    # Vaakataso: sivupalkki ennallaan
    if w==390:
        ctx=await b.new_context(viewport={'width':844,'height':390}); pg=await ctx.new_page(); await pg.goto(U); await pg.wait_for_timeout(200)
        await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(200)
        r=await box('roll')
        want('vaakataso: kapea osionappi sivupalkissa', r[2]==44 and not await pg.is_visible('#roll-let'))
        await ctx.close()
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640)): bad+=await run(p,w,h)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
