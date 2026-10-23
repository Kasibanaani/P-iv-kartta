"""Juuri 1.64: tekstin aika- ja asiasanalinkki kuin nappi (Emil 23.10.2026). Kosketus linkkiin ei vie kursoria eikä avaa
näppäimistöä (tekstikenttä ei saa fokusta), valikko avautuu päälle, tausta lukittuu, ulkopuolen napautus sulkee.
Varareitti: Ajankohdat-rivin kellonaika avaa saman valikon. Hiirellä ennallaan. Leveydet 390 ja 320 px, kosketus päällä.
Käyttö: python3 testit/selain_164.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
K="JSON.parse(localStorage.getItem('paatospuu:v1')).kokonaisuudet[0]"
LINK="""(function(){var m=document.querySelector('#ns-hl mark');var r=m.getClientRects()[0];return [r.left+r.width/2,r.top+r.height/2];})()"""
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h},has_touch=True,is_mobile=True)).new_page()
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond):
        print('  %-44s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(200)
    await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await pg.click('[data-tab="notes"]'); await pg.wait_for_timeout(50)
    await pg.click('#newnote'); await pg.fill('#ns-text','Palaveri 30.10.2026 klo 14 ja sitten muuta tekstiä'); await pg.dispatch_event('#ns-text','input'); await pg.click('#nsheet .sx'); await pg.wait_for_timeout(60)
    await pg.locator('#nlist .ncard:has-text("Palaveri")').click(); await pg.wait_for_timeout(80)
    await pg.evaluate("document.activeElement&&document.activeElement.blur()")
    x,y=await pg.evaluate(LINK)
    await pg.touchscreen.tap(x,y); await pg.wait_for_timeout(120)
    want('linkin napautus avaa valikon päälle', await pg.is_visible('#ns-tm.pop') and await pg.is_visible('#tm-unlink'))
    want('ei kursoria eikä näppäimistöä', await pg.evaluate("document.activeElement!==document.getElementById('ns-text')"))
    want('tausta peitetty', await pg.is_visible('#ns-tmbg'))
    r=json.loads(await pg.evaluate("JSON.stringify(document.getElementById('ns-tm').getBoundingClientRect())"))
    want('valikko ruudulla', r['left']>=0 and r['right']<=w and r['top']>=0 and r['bottom']<=h)
    await pg.click('#tm-done'); await pg.wait_for_timeout(80)
    want('kuittaus valikosta, valikko pysyy', await pg.is_visible('#ns-tm.pop') and 'Kuitattu' in await pg.inner_text('#tm-done'))
    await pg.touchscreen.tap(w/2,8); await pg.wait_for_timeout(100)
    want('ulkopuolen napautus sulkee', not await pg.is_visible('#ns-tm') and not await pg.is_visible('#ns-tmbg'))
    want('ikkuna jäi auki', await pg.is_visible('#nsheet'))
    # Tavallinen napautus tekstiin (ei linkkiin) toimii kuten ennen: kenttä saa fokuksen
    bx=json.loads(await pg.evaluate("JSON.stringify(document.getElementById('ns-text').getBoundingClientRect())"))
    await pg.touchscreen.tap(bx['left']+bx['width']-30,bx['top']+bx['height']-30); await pg.wait_for_timeout(100)
    want('muu teksti: kursori kuten ennen', await pg.evaluate("document.activeElement===document.getElementById('ns-text')") and not await pg.is_visible('#ns-tmbg'))
    await pg.evaluate("document.activeElement.blur()")
    # Varareitti: Ajankohdat-rivin kellonaika
    await pg.locator('#ns-found i.tml').first.click(); await pg.wait_for_timeout(100)
    want('varareitti: aikarivi avaa valikon', await pg.is_visible('#ns-tm.pop') and await pg.is_visible('#tm-unlink'))
    await pg.click('#tm-unlink'); await pg.wait_for_timeout(80)
    want('purettu: valikko tarjoaa palautuksen', await pg.is_visible('#ns-tm.pop') and 'Palauta' in await pg.inner_text('#ns-tm'))
    await pg.touchscreen.tap(w/2,8); await pg.wait_for_timeout(80)
    want('purku valikosta toimii', await pg.locator('#ns-hl mark').count()==0)
    await pg.click('#nsheet .sx'); await pg.wait_for_timeout(80)
    nl=json.loads(await pg.evaluate("JSON.stringify("+K+".muistiinpanot[0].nl||null)"))
    want('purku tallentui', bool(nl))
    # Asiasanalinkki samoin
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0];k.termit=[{id:'tk',name:'Kauppa',yes:['kauppa'],no:[]}];localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()""")
    await pg.reload(); await pg.wait_for_timeout(150); await pg.click('[data-tab="notes"]'); await pg.wait_for_timeout(50)
    await pg.click('#newnote'); await pg.fill('#ns-text','Käy kauppa huomenna'); await pg.dispatch_event('#ns-text','input'); await pg.wait_for_timeout(60); await pg.evaluate("document.activeElement.blur()")
    x,y=await pg.evaluate("""(function(){var r=document.querySelector('#ns-hl .th').getClientRects()[0];return [r.left+r.width/2,r.top+r.height/2];})()""")
    await pg.touchscreen.tap(x,y); await pg.wait_for_timeout(120)
    want('asiasanalinkki: valikko päälle, ei näppäimistöä', await pg.is_visible('#ns-tm.pop') and 'asiasanalla' in await pg.inner_text('#ns-tm') and await pg.evaluate("document.activeElement!==document.getElementById('ns-text')"))
    await pg.touchscreen.tap(w/2,8); await pg.wait_for_timeout(80); await pg.click('#nsheet .sx'); await pg.wait_for_timeout(60)
    # Näppäimistö: tekstikentän napautus ei vieritä sivua eikä ikkunaa kentän yläpuolelta (iOS:n vieritys jäljitellään)
    await pg.click('#newnote'); await pg.wait_for_timeout(80); await pg.evaluate("document.activeElement&&document.activeElement.blur()")
    bx=json.loads(await pg.evaluate("JSON.stringify(document.getElementById('ns-text').getBoundingClientRect())"))
    await pg.evaluate("var z=document.createElement('div');z.id='zz';z.style.height='2000px';document.getElementById('nsheet').appendChild(z)")
    await pg.evaluate("document.getElementById('ns-text').addEventListener('focus',function(){var d=document.getElementById('nsheet');d.scrollTop+=120;window.scrollTo(0,40);},{once:true})")
    await pg.touchscreen.tap(bx['left']+40,bx['top']+20); await pg.wait_for_timeout(900)
    y=await pg.evaluate("document.getElementById('ns-text').getBoundingClientRect().top")
    want('tekstikenttä pysyy paikallaan', abs(y-bx['top'])<2 and await pg.evaluate("window.scrollY")==0)
    await pg.evaluate("document.activeElement.blur()"); await pg.evaluate("document.getElementById('zz').remove()"); await pg.click('#nsheet .sx'); await pg.wait_for_timeout(60)
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640)): bad+=await run(p,w,h)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
