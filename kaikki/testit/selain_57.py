"""Kaikki 0.57 (korjaussuunnitelma 3, 23.11.2026): lajittelu, leveyden säätö ja sarakkeen siirto erillään.
Tarkistaa rivinäkymässä:
- Leveyden säätöalue osuu rajaviivan molemmin puolin (−6…+6 px), myös vaakavierityksen jälkeen; kiinteän otsikkosarakkeen alle vierinyt raja ei osu.
- Rajalta veto muuttaa vain leveyttä: ei lajittelua eikä järjestyksen muutosta; tallennus vasta vapautuksessa.
- Esc ja pointercancel kesken vedon palauttavat leveyden eikä mitään tallennu; oikea hiirinappi ei aloita vetoa.
- Otsikon napsautus lajittelee yhä; otsikkoa raahaamalla siirto toimii ja Esc peruu siirron.
- Sarakevalikko (hiiren oikea nappi ja Shift+F10): siirto oikealle/vasemmalle, leveämmäksi ja oletusleveys; kohdistus palaa siirrettyyn otsikkoon.
- Puhelin (kosketus): vaakapyyhkäisy otsikkorivillä vierittää taulukkoa, pitkä painallus avaa sarakevalikon, napautus lajittelee.
- Kursori: kiinteässä Otsikossa osoitin (pointer), siirrettävässä tartuntakäsi.
Leveydet 1440, 1280, 390 ja 320. Käyttö: python3 testit/selain_57.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
FAKE=open(os.path.join(D,'fakegh.js'),encoding='utf8').read()
def md(i): return '---\ntyyppi: projekti\notsikko: Muistiinpano %d\nkuvaus: \nluotu: 2026-11-%02d\nlahde: emil\ntila: %s\n---\n# Muistiinpano %d\n\nTeksti.\n'%(i,1+i%28,['kesken','valmis','idea'][i%3],i)
SEED={'projektit/k%d/m%02d.md'%(i%4,i):md(i) for i in range(30)}
SEED['nakymat/leveat.md']='---\ntyyppi: nakyma\notsikko: Leveät\nnakyy: ei\nsarakkeet:\n  - otsikko\n  - kansio\n  - tila | siru\n  - luotu\n  - kuka\n  - ajankohta\n---\n# Leveät\n'
LAY="JSON.parse(localStorage.getItem('kaikki:nvlay:nakymat/leveat.md')||'{}')"
HEADS="Array.from(document.querySelectorAll('.rvhead .rvc')).map(function(c){return c.dataset.k;})"
async def run(p,w,h,touch):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    ctx=await b.new_context(viewport={'width':w,'height':h},has_touch=touch,is_mobile=touch)
    pg=await ctx.new_page()
    await pg.add_init_script(FAKE+";(function(){var S=%s;if(!window.__repo.kept)for(var k in S)window.__repo.put(k,S[k]);try{localStorage.setItem('kaikki:gh',JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));localStorage.setItem('kaikki:nmode','rows');localStorage.setItem('kaikki:nview','nakymat/leveat.md');if(%s&&!sessionStorage.getItem('__l')){sessionStorage.setItem('__l','1');localStorage.setItem('kaikki:nvlay:nakymat/leveat.md',JSON.stringify({w:{'kansio':300,'tila|siru':300,'luotu':300,'kuka':300,'ajankohta':300}}));}}catch(e){}})();"%(json.dumps(SEED),'false' if touch else 'true'))
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond,info=''):
        print('  %-60s %s %s'%(label,'ok' if cond else 'VIRHE',info if not cond else ''))
        if not cond: bad.append(label)
    async def cellbox(i): return await pg.locator('.rvhead .rvc').nth(i).bounding_box()
    async def width(i): return (await cellbox(i))['width']
    async def sorted_(): return await pg.evaluate("!!document.querySelector('.rvhead .rv-direction')")
    print('leveys',w,'kosketus' if touch else '')
    await pg.goto(U); await pg.wait_for_timeout(1600)
    want('sarakkeet näkyvissä',await pg.evaluate("document.querySelectorAll('.rvhead .rvc').length")==6)
    if not touch:
        # osuma-alue rajaviivan molemmin puolin
        bx=await cellbox(1); edge=bx['x']+bx['width']; y=bx['y']+bx['height']/2
        hits=await pg.evaluate("(function(){var r=[];[-6,-3,-1,1,3,6].forEach(function(d){var e=document.elementFromPoint(%f+d,%f);r.push(!!(e&&e.classList.contains('rv-rz')));});return r;})()"%(edge,y))
        want('säätöalue −6…+6 px rajasta',all(hits),hits)
        await pg.evaluate("document.getElementById('nlist').scrollLeft=120"); await pg.wait_for_timeout(200)
        bx=await cellbox(2); edge=bx['x']+bx['width']
        hits=await pg.evaluate("(function(){var r=[];[-5,-1,1,5].forEach(function(d){var e=document.elementFromPoint(%f+d,%f);r.push(!!(e&&e.classList.contains('rv-rz')));});return r;})()"%(edge,y))
        want('säätöalue osuu myös vaakavierityksen jälkeen',all(hits),hits)
        await pg.evaluate("document.getElementById('nlist').scrollLeft=0"); await pg.wait_for_timeout(100)
        sl=(await cellbox(1))['width']+30
        await pg.evaluate("document.getElementById('nlist').scrollLeft=%f"%sl); await pg.wait_for_timeout(200)
        t=await cellbox(0); hb=await cellbox(1)
        want('vierityksessä toinen sarake menee otsikon alle',hb['x']+hb['width']<t['x']+t['width']-8,(t,hb))
        if hb['x']+hb['width']<t['x']+t['width']-8:
            e=await pg.evaluate("(function(){var e=document.elementFromPoint(%f,%f);return e?e.className+'|'+!!e.closest('.rvt'):'';})()"%(hb['x']+hb['width'],y))
            want('otsikon alle vierinyt raja ei osu',e.endswith('|true'),e)
        await pg.evaluate("document.getElementById('nlist').scrollLeft=0"); await pg.wait_for_timeout(200)
        cur=await pg.evaluate("[getComputedStyle(document.querySelectorAll('.rvhead .rv-head-sort')[0]).cursor,getComputedStyle(document.querySelectorAll('.rvhead .rv-head-sort')[1]).cursor]")
        want('kursori: Otsikko pointer, siirrettävä grab',cur==['pointer','grab'],cur)
        # veto rajalta: vain leveys
        order0=await pg.evaluate(HEADS); w0=await width(1); bx=await cellbox(1); edge=bx['x']+bx['width']; lay0=await pg.evaluate(LAY)
        await pg.mouse.move(edge-2,y); await pg.mouse.down(); await pg.mouse.move(edge+40,y,steps=6)
        mid=await pg.evaluate(LAY)
        await pg.mouse.up(); await pg.wait_for_timeout(250)
        w1=await width(1)
        want('veto rajalta leventää',abs(w1-(w0+42))<=3,(w0,w1))
        want('ei tallennusta kesken vedon',mid==lay0,mid)
        want('veto ei lajittele eikä siirrä',not await sorted_() and await pg.evaluate(HEADS)==order0)
        want('leveys tallentui vapautuksessa',(await pg.evaluate(LAY))['w'].get(order0[1])==round(w1),await pg.evaluate(LAY))
        # Esc kesken vedon
        bx=await cellbox(2); edge=bx['x']+bx['width']; w0=bx['width']; lay0=await pg.evaluate(LAY)
        await pg.mouse.move(edge-2,y); await pg.mouse.down(); await pg.mouse.move(edge+60,y,steps=5); await pg.wait_for_timeout(60)
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(60); await pg.mouse.move(edge+90,y,steps=3); await pg.mouse.up(); await pg.wait_for_timeout(200)
        want('Esc peruu leveyden',abs(await width(2)-w0)<=1 and await pg.evaluate(LAY)==lay0,(w0,await width(2)))
        # pointercancel kesken vedon
        await pg.mouse.move(edge-2,y); await pg.mouse.down(); await pg.mouse.move(edge+60,y,steps=5); await pg.wait_for_timeout(60)
        await pg.evaluate("window.dispatchEvent(new PointerEvent('pointercancel',{pointerId:1,bubbles:true}))"); await pg.mouse.up(); await pg.wait_for_timeout(200)
        want('pointercancel palauttaa leveyden',abs(await width(2)-w0)<=1 and await pg.evaluate(LAY)==lay0,(w0,await width(2)))
        # oikea nappi ei aloita vetoa
        await pg.mouse.move(edge-2,y); await pg.mouse.down(button='right'); await pg.mouse.move(edge+60,y,steps=5); await pg.mouse.up(button='right'); await pg.wait_for_timeout(150)
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(80)
        want('oikea nappi ei säädä leveyttä',abs(await width(2)-w0)<=1,(w0,await width(2)))
        # napsautus lajittelee
        await pg.locator('.rvhead .rvc').nth(3).locator('.rv-head-sort').click(); await pg.wait_for_timeout(200)
        want('otsikon napsautus lajittelee',await sorted_())
        # Näppäimistökohdistus tai napsautus voi vierittää otsikkoriviä kuten muitakin ruudukon soluja.
        await pg.locator('#nlist').evaluate('list => {list.scrollLeft = 0;}')
        # siirto raahaamalla ja Esc peruu
        order0=await pg.evaluate(HEADS); s0=await pg.locator('.rvhead .rvc').nth(1).locator('.rv-head-sort').bounding_box(); t0=await cellbox(3)
        await pg.mouse.move(s0['x']+10,s0['y']+8); await pg.mouse.down(); await pg.mouse.move(t0['x']+20,t0['y']+8,steps=8)
        await pg.keyboard.press('Escape'); await pg.mouse.up(); await pg.wait_for_timeout(250)
        want('Esc peruu siirron',await pg.evaluate(HEADS)==order0)
        await pg.mouse.move(s0['x']+10,s0['y']+8); await pg.mouse.down(); await pg.mouse.move(t0['x']+20,t0['y']+8,steps=8); await pg.mouse.up(); await pg.wait_for_timeout(300)
        o1=await pg.evaluate(HEADS)
        want('raahaus siirtää sarakkeen',o1!=order0 and o1.index(order0[1])==3,o1)
        # sarakevalikko hiiren oikealla
        await pg.locator('.rvhead .rvc').nth(2).locator('.rv-head-sort').click(button='right'); await pg.wait_for_timeout(150)
        want('oikea nappi avaa sarakevalikon',await pg.evaluate("!document.getElementById('sortpop').hidden&&!!document.getElementById('rvm-right')"))
        k2=o1[2]; await pg.click('#rvm-right'); await pg.wait_for_timeout(250)
        o2=await pg.evaluate(HEADS); fk=await pg.evaluate("(document.activeElement.closest('.rvc')||{dataset:{}}).dataset.k||''")
        want('Siirrä oikealle siirtää ja kohdistus palaa otsikkoon',o2.index(k2)==3 and fk==k2,(o2,fk))
        # näppäimistö: Shift+F10, Leveämmäksi, Oletusleveys
        w0=await width(3); await pg.keyboard.press('Shift+F10'); await pg.wait_for_timeout(150)
        want('Shift+F10 avaa valikon',await pg.evaluate("!document.getElementById('sortpop').hidden"))
        await pg.click('#rvm-wider'); await pg.wait_for_timeout(250)
        want('Leveämmäksi +40 px',abs(await width(3)-(w0+40))<=2,(w0,await width(3)))
        await pg.keyboard.press('Shift+F10'); await pg.wait_for_timeout(150)
        dis=await pg.evaluate("document.getElementById('rvm-default').disabled")
        await pg.click('#rvm-default'); await pg.wait_for_timeout(250)
        want('Oletusleveys palauttaa',not dis and k2 not in ((await pg.evaluate(LAY)).get('w') or {}),await pg.evaluate(LAY))
        await pg.locator('.rvhead .rvc').nth(0).locator('.rv-head-sort').click(button='right'); await pg.wait_for_timeout(150)
        want('Otsikkoa ei voi siirtää',await pg.evaluate("document.getElementById('rvm-left').disabled&&document.getElementById('rvm-right').disabled"))
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(100)
    else:
        sl0=await pg.evaluate("document.getElementById('nlist').scrollLeft")
        sw=await pg.evaluate("(function(){var l=document.getElementById('nlist');return l.scrollWidth-l.clientWidth;})()")
        bx=await cellbox(2); y=bx['y']+bx['height']/2; x=bx['x']+bx['width']/2
        # vaakapyyhkäisy otsikkorivillä
        session=await ctx.new_cdp_session(pg)
        start=(await pg.locator('#nlist').bounding_box())['x']+w-48
        await session.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':start,'y':y}]})
        for offset in range(15,151,15):
            await session.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':start-offset,'y':y}]})
        await session.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        await pg.wait_for_timeout(250)
        sl1=await pg.evaluate("document.getElementById('nlist').scrollLeft")
        dx=await pg.evaluate("""Math.abs(document.querySelector('.rvhead .rvc:nth-child(3)').getBoundingClientRect().left
            -document.querySelector('.rvb .rvc:nth-child(3)').getBoundingClientRect().left)""")
        want('pyyhkäisy otsikkorivillä vierittää taulukkoa',sw<10 or (sl1>sl0+60 and dx<=1),(sl0,sl1,dx,sw))
        want('pyyhkäisy ei lajittele',not await sorted_())
        await pg.wait_for_timeout(450)
        # pitkä painallus
        await pg.evaluate("""(function(x,y){var t=document.querySelectorAll('.rvhead .rv-head-sort')[2];t.dispatchEvent(new PointerEvent('pointerdown',{pointerId:8,pointerType:'touch',isPrimary:true,clientX:x,clientY:y,bubbles:true,button:0}));})(%f,%f)"""%(x,y))
        await pg.wait_for_timeout(700)
        await pg.evaluate("window.dispatchEvent(new PointerEvent('pointerup',{pointerId:8,pointerType:'touch',isPrimary:true,bubbles:true}))"); await pg.wait_for_timeout(100)
        want('pitkä painallus avaa sarakevalikon',await pg.evaluate("!document.getElementById('sortpop').hidden&&!!document.getElementById('rvm-left')"))
        want('pitkä painallus ei lajittele',not await sorted_())
        o0=await pg.evaluate(HEADS); k=o0[2]; await pg.click('#rvm-left'); await pg.wait_for_timeout(250)
        want('valikon siirto puhelimella',(await pg.evaluate(HEADS)).index(k)==1)
        await pg.wait_for_timeout(500)
        await pg.locator('.rvhead .rvc').nth(3).locator('.rv-head-sort').tap(); await pg.wait_for_timeout(250)
        want('napautus lajittelee',await sorted_())
    want('ei sivuttaisvieritystä (sivu)',await pg.evaluate("document.documentElement.scrollWidth<=innerWidth"))
    want('ei sivuvirheitä',not errs,errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h,t in ((1440,900,False),(1280,800,False),(390,844,True),(320,640,True)): bad+=await run(p,w,h,t)
    print('KAIKKI OK' if not bad else 'VIRHEITÄ: '+', '.join(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
