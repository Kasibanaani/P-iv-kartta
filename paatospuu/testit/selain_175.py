"""Juuri 1.75: uusi asiasana pidolla Asioissa (Emil 24.10.2026). Pito tuo vihreän viivan lähimpään väliin, veto siirtää,
sivuveto peruu, nosto avaa kentän viivan kohtaan. Tärkeät-alueella uusi saa tähden ja sijan, Muut-alueella ei tähteä.
Tärkeät-rivin pito siirtää riviä kuten ennen. Kosketus CDP:llä. Leveydet 390 ja 320 px. Käyttö: python3 testit/selain_175.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from apu import tab, menu, tsx
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
K="JSON.parse(localStorage.getItem('paatospuu:v1')).kokonaisuudet[0]"
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    ctx=await b.new_context(viewport={'width':w,'height':h},has_touch=True,is_mobile=True)
    pg=await ctx.new_page(); cdp=await ctx.new_cdp_session(pg)
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond):
        print('  %-48s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    async def touch(kind,x,y):
        await cdp.send('Input.dispatchTouchEvent',{'type':kind,'touchPoints':([] if kind=='touchEnd' else [{'x':x,'y':y}])})
    async def hold(x,y,moves=(),wait=400):
        await touch('touchStart',x,y); await pg.wait_for_timeout(wait)
        for (mx,my) in moves:
            await touch('touchMove',mx,my); await pg.wait_for_timeout(30)
        lab=await pg.evaluate("(function(){var l=document.querySelector('.tline');return l?[l.textContent,l.classList.contains('fade')]:null;})()")
        await touch('touchEnd',x,y); await pg.wait_for_timeout(120); return lab
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(200)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0];
      k.termit=[{id:'ta',name:'Kipu',yes:[],no:[]},{id:'tb',name:'Kuume',yes:[],no:[]},{id:'tc',name:'Lääkäri',yes:[],no:[]}];k.tarkeat=['ta','tb'];
      localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()""")
    await pg.reload(); await pg.wait_for_timeout(200); await tab(pg,'terms'); await pg.wait_for_timeout(80)
    imp=lambda: pg.evaluate(K+".tarkeat")
    r=await pg.evaluate("(function(){var a=document.querySelectorAll('#implist .drow'),n=a[0].querySelector('.num').getBoundingClientRect(),q=a[1].getBoundingClientRect(),m=document.querySelector('#termlist .drow .row').getBoundingClientRect();return {nx:n.left+n.width/2,ny:n.top+n.height/2,gap:(a[0].getBoundingClientRect().bottom+q.top)/2,mx:m.left+40,my:m.top+m.height/2,b:q.bottom};})()")
    # Pito numerosarakkeessa: viiva, veto rivien väliin, nosto -> kenttä
    lab=await hold(r['nx'],r['ny'],moves=[(r['nx'],r['gap']-2),(r['nx'],r['gap'])])
    want('pito tuo viivan, veto rivien väliin', lab is not None and lab[0]=='2. tärkeä' and not lab[1])
    want('nosto avaa kentän kohtaan, fokus', await pg.is_visible('#tnew-in') and await pg.evaluate("document.activeElement.id")=='tnew-in')
    pos=await pg.evaluate("(function(){var i=document.getElementById('tnew-in').closest('.tnew'),a=document.querySelectorAll('#implist .drow');return [a[0].getBoundingClientRect().bottom<=i.getBoundingClientRect().top+1,i.getBoundingClientRect().bottom<=a[1].getBoundingClientRect().top+1];})()")
    want('kenttä rivien 1 ja 2 välissä', all(pos))
    await pg.fill('#tnew-in','Huimaus'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(120)
    # Pito ja nosto paikallaan (ei vetoa): kenttä jää auki ja fokukseen
    r2=await pg.evaluate("(function(){var a=document.querySelector('#implist .num').getBoundingClientRect();return {x:a.left+a.width/2,y:a.top+a.height/2};})()")
    await hold(r2['x'],r2['y']); await pg.wait_for_timeout(200)
    want('nosto paikallaan: kenttä auki, fokus', await pg.is_visible('#tnew-in') and await pg.evaluate("document.activeElement.id")=='tnew-in')
    await pg.keyboard.press('Escape'); await pg.wait_for_timeout(100)
    ids=await imp(); tt=json.loads(await pg.evaluate("JSON.stringify("+K+".termit)")); nid=[t['id'] for t in tt if t['name']=='Huimaus']
    want('uusi tähdellä toiselle sijalle', len(nid)==1 and ids[:3]==['ta',nid[0],'tb'])
    want('näkyy Tärkeissä', (await pg.locator('#implist .drow').nth(1).inner_text()).find('Huimaus')>=0)
    # Pito Muut-rivin päällä: viiva Muut, ei avaa korttia
    r=await pg.evaluate("(function(){var m=document.querySelector('#termlist .drow .row').getBoundingClientRect();return {x:m.left+40,y:m.top+m.height/2};})()")
    lab=await hold(r['x'],r['y'])
    want('Muut-rivin pito: viiva Muut, ei korttia', lab is not None and lab[0]=='Muut' and not await pg.is_visible('#tsheet') and await pg.is_visible('#tnew-in'))
    await pg.fill('#tnew-in','Yskä'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(120)
    tt=json.loads(await pg.evaluate("JSON.stringify("+K+".termit)")); nid=[t['id'] for t in tt if t['name']=='Yskä']
    want('Muut: ilman tähteä', len(nid)==1 and nid[0] not in await imp() and await pg.locator('#termlist .row:has-text("Yskä")').count()==1)
    # Sivuveto peruu
    r=await pg.evaluate("(function(){var m=document.querySelector('#termlist button.row[data-id=\"tc\"]').getBoundingClientRect();return {x:m.left+40,y:m.top+m.height/2};})()")
    lab=await hold(r['x'],r['y'],moves=[(r['x']+40,r['y']),(r['x']+90,r['y'])])
    want('sivuveto peruu', not await pg.is_visible('#tnew-in') and not await pg.is_visible('#tsheet') and await pg.locator('.tline').count()==0)
    # Lyhyt napautus avaa kortin kuten ennen
    await pg.touchscreen.tap(r['x'],r['y']); await pg.wait_for_timeout(250)
    want('napautus avaa kortin', await pg.is_visible('#tsheet')); await tsx(pg); await pg.wait_for_timeout(120)
    # Tyhjä kenttä ei tee mitään
    n0=len(json.loads(await pg.evaluate("JSON.stringify("+K+".termit)")))
    r=await pg.evaluate("(function(){var a=document.querySelector('#implist .num').getBoundingClientRect();return {x:a.left+a.width/2,y:a.top+a.height/2};})()")
    await hold(r['x'],r['y']); await pg.keyboard.press('Escape'); await pg.wait_for_timeout(120)
    want('tyhjä peruu', not await pg.is_visible('#tnew-in') and len(json.loads(await pg.evaluate("JSON.stringify("+K+".termit)")))==n0)
    # Tärkeät-rivin pito siirtää edelleen riviä
    r=await pg.evaluate("(function(){var a=document.querySelectorAll('#implist .drow .row');return {x:a[0].getBoundingClientRect().left+60,y:a[0].getBoundingClientRect().top+20,y2:a[1].getBoundingClientRect().bottom+6};})()")
    before=await imp()
    await touch('touchStart',r['x'],r['y']); await pg.wait_for_timeout(500)
    want('Tärkeät-rivin pito ei tuo viivaa', await pg.locator('.tline').count()==0)
    for k in range(1,8): await touch('touchMove',r['x'],r['y']+(r['y2']-r['y'])*k/7); await pg.wait_for_timeout(25)
    await touch('touchEnd',r['x'],r['y2']); await pg.wait_for_timeout(150)
    want('Tärkeät-rivin pito siirtää riviä', (await imp())[:2]==[before[1],before[0]])
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640)): bad+=await run(p,w,h)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
