"""Juuri 1.102 (Emil 31.10.2026): sanalinkit muistiinpanojen välille. Yhteinen 5 kirjaimen alku linkittyy, estetyt ja
yleiset eivät; kosketus avaa valikon, josta toinen muistiinpano aukeaa ja Takaisin palaa; Älä linkitä, Tee asiasanaksi,
asetukset (päällä/pois, 4/5, oma esto ja sallinta). 390 ja 320 px kosketuksella, 1280 hiirellä."""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from apu import tab, menu
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
K="JSON.parse(localStorage.getItem('paatospuu:v1')).kokonaisuudet[0]"
WL="Array.prototype.map.call(document.querySelectorAll('#ns-hl .wl'),function(e){return e.textContent;})"
def SPOT(word): return """(function(){var m=Array.prototype.filter.call(document.querySelectorAll('#ns-hl .wl'),function(e){return e.textContent==='%s';})[0];var r=m.getClientRects()[0];return [r.left+r.width/2,r.top+r.height/2];})()"""%word
async def run(p,w,h,touch):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h},has_touch=touch,is_mobile=touch)).new_page()
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond):
        print('  %-50s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(300)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0],t='2026-10-20T06:00:00.000Z';
      k.muistiinpanot=[{id:'a',created:t,edited:t,text:'Kokous tiimin kanssa ja kirja mukaan olisi hyvä ok',date:''},
        {id:'b',created:t,edited:'2026-10-21T06:00:00.000Z',text:'Kokouksen muistio\\nTiimi kasassa, olisivat paikalla',date:''},
        {id:'c',created:t,edited:t,text:'Kirje mummolle',date:''},{id:'d',created:t,edited:t,text:'Arkistossa kokousasia',date:'',arch:t}];
      localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()""")
    await pg.reload(); await pg.wait_for_timeout(400); await tab(pg,'notes'); await pg.wait_for_timeout(100)
    async def openA():
        await pg.locator('#nlist .ncard:has-text("Kokous tiimin")').click(); await pg.wait_for_timeout(120)
        await pg.evaluate("document.activeElement&&document.activeElement.blur()")
    async def hit(word):
        x,y=await pg.evaluate(SPOT(word))
        if touch: await pg.touchscreen.tap(x,y)
        else: await pg.mouse.click(x,y)
        await pg.wait_for_timeout(120)
    await openA()
    wl=await pg.evaluate(WL)
    want('Kokous ja tiimin linkkeinä', wl==['Kokous','tiimin'])
    want('kirja ≠ kirje, olisi estetty, lyhyt ok ei', 'kirja' not in wl and 'olisi' not in wl and 'ok' not in wl)
    await hit('Kokous')
    want('valikko avautuu', await pg.is_visible('#ns-tm') and '1 muu muistiinpano' in await pg.inner_text('#ns-tm'))
    want('arkistoitu ei listassa', await pg.locator('#ns-tm .tmnote').count()==1)
    if touch: want('ei näppäimistöä', await pg.evaluate("document.activeElement.id")!='ns-text')
    await pg.click('#ns-tm .tmnote'); await pg.wait_for_timeout(200)
    want('toinen muistiinpano aukeaa', await pg.is_visible('#nsheet') and (await pg.input_value('#ns-text')).startswith('Kokouksen'))
    await pg.evaluate("document.activeElement&&document.activeElement.blur()")
    want('linkit myös toisessa', 'Kokouksen' in await pg.evaluate(WL))
    await pg.click('#nsheet .sx'); await pg.wait_for_timeout(150)
    want('Takaisin näkyy', await pg.is_visible('#back'))
    await pg.click('#back'); await pg.wait_for_timeout(200)
    want('Takaisin palauttaa ensimmäisen', await pg.is_visible('#nsheet') and (await pg.input_value('#ns-text')).startswith('Kokous tiimin'))
    await pg.evaluate("document.activeElement&&document.activeElement.blur()")
    await hit('tiimin'); await pg.click('#tm-wlno'); await pg.wait_for_timeout(120)
    want('Älä linkitä poistaa linkin', await pg.evaluate(WL)==['Kokous'] and 'tiimin' in await pg.evaluate(K+".asetukset.wlno"))
    await hit('Kokous'); await pg.click('#tm-wlterm'); await pg.wait_for_timeout(150)
    tm=await pg.evaluate(K+".termit")
    want('Tee asiasanaksi: kokou tunnistussanaksi', any(t['name']=='Kokous' and t['yes']==['kokou'] for t in tm))
    want('sana muuttuu asiasanalinkiksi', await pg.evaluate(WL)==[] and await pg.locator('#ns-hl .th').count()>=1)
    if await pg.is_visible('#ns-tmbg'): await pg.click('#ns-tmbg',position={'x':5,'y':5}); await pg.wait_for_timeout(80)
    elif await pg.is_visible('#ns-tm'): await pg.evaluate("document.getElementById('ns-tm').hidden=true")
    await pg.click('#nsheet .sx'); await pg.wait_for_timeout(150)
    # Asetukset
    await menu(pg,'#m-proj'); await pg.wait_for_timeout(100)
    want('asetukset näkyvät', await pg.is_visible('#set-wl') and await pg.is_visible('#set-wlk') and await pg.is_visible('#set-wlno'))
    want('oma esto kentässä', 'tiimin' in await pg.input_value('#set-wlno'))
    await pg.fill('#set-wlno',''); await pg.dispatch_event('#set-wlno','change')
    await pg.fill('#set-wlyes','olisi'); await pg.dispatch_event('#set-wlyes','change')
    await pg.click('#set-wlk [data-v="4"]'); await pg.wait_for_timeout(100)
    r=await pg.evaluate("(function(){var w=document.documentElement.clientWidth,o=0;document.querySelectorAll('#psheet button,#psheet textarea').forEach(function(e){var r=e.getBoundingClientRect();if(r.width&&e.offsetParent&&r.right>w+.5)o++;});return o;})()")
    want('mahtuu', r==0)
    if await pg.is_visible('#psheet .sx'): await pg.click('#psheet .sx'); await pg.wait_for_timeout(150)
    await pg.reload(); await pg.wait_for_timeout(400); await tab(pg,'notes'); await pg.wait_for_timeout(100)
    await openA(); wl=await pg.evaluate(WL)
    want('4 kirjainta + sallinta + esto pois (säilyy)', 'kirja' in wl and 'olisi' in wl and 'tiimin' in wl)
    await pg.click('#nsheet .sx'); await pg.wait_for_timeout(150)
    await menu(pg,'#m-proj'); await pg.wait_for_timeout(100)
    await pg.click('#set-wl [data-v="off"]'); await pg.wait_for_timeout(100)
    want('pois päältä piilottaa lisäkentät', not await pg.is_visible('#set-wlk'))
    if await pg.is_visible('#psheet .sx'): await pg.click('#psheet .sx'); await pg.wait_for_timeout(150)
    await openA()
    want('pois päältä ei linkkejä', await pg.evaluate(WL)==[])
    want('ei virheitä', not errs)
    await b.close(); return bad
async def main():
    bad=[]
    async with async_playwright() as p:
        for w,h,t in ((390,844,True),(320,640,True),(1280,800,False)): bad+=await run(p,w,h,t)
    if bad: print('VIRHEET:',bad); sys.exit(1)
asyncio.run(main())
