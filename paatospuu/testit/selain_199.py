"""Juuri 1.99 (Emil 29.10.2026): listarivin Poimii tekstit (rivin nimi + asiasanat). Rivin ikkunan valinta, tekstit avatulla rivillä,
kuittaus = tekstin kuittaus, muokkaus listalla kirjoittuu muistiinpanoon, tiivistelmä suljetulla rivillä, Listalle-tieto muistiinpanossa,
arkistoitu ei poimiudu, kierroslistalla ei valintaa. 390, 320, 1280 ja 1440 px."""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from apu import tab
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
K="JSON.parse(localStorage.getItem('paatospuu:v1')).kokonaisuudet[0]"
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h})).new_page()
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond):
        print('  %-50s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    print('leveys',w)
    await pg.clock.install(time='2026-10-30T09:00:00+02:00')
    await pg.goto(U); await pg.wait_for_timeout(300)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0],t='2026-10-20T06:00:00.000Z';
      k.termit=[{id:'k',name:'Koira',yes:['koir'],no:[]}];
      k.muistiinpanot=[{id:'a',created:t,edited:t,text:'Vie koira ulos\\n---\\nOsta maitoa',date:''},{id:'b',created:'2026-10-21T06:00:00.000Z',edited:t,text:'Tiskikone: vaihda suodatin',date:''},
        {id:'c',created:'2026-10-22T06:00:00.000Z',edited:t,text:'Koiran rokotus 5.11.',date:''},{id:'d',created:t,edited:t,text:'Koira arkistossa',date:'',arch:t}];
      k.tarkistuslista=[{id:'r1',name:'Tiskikone',it:[]}];localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()""")
    await pg.reload(); await pg.wait_for_timeout(400); await tab(pg,'list'); await pg.wait_for_timeout(200)
    row='#chlist .crow[data-id="r1"]'
    want('ilman valintaa ei tekstejä', await pg.locator(row+' .ctxsum').count()==0)
    await pg.click(row+' .chd'); await pg.wait_for_timeout(100); await pg.click(row+' .cedit'); await pg.wait_for_timeout(150)
    want('Poimii tekstit -valinta näkyy', await pg.is_visible('#ks-mode'))
    await pg.click('#ks-mode [data-km="1"]'); await pg.wait_for_timeout(60)
    want('nimi ja asiasanat valittavina', await pg.is_visible('#ks-pxn') and await pg.locator('#ks-f [data-px="k"]').count()==1 and await pg.is_hidden('#ks-g'))
    await pg.click('#ks-pxn'); await pg.click('#ks-f [data-px="k"]'); await pg.wait_for_timeout(60)
    want('yhteenveto', 'rivin nimi, Koira' in await pg.inner_text('#ks-pxsum'))
    await pg.click('#ks-mode [data-km="0"]'); await pg.wait_for_timeout(60)
    want('kohteet-tila palaa', await pg.locator('#ks-f [data-px]').count()==0 and await pg.is_visible('#ks-g'))
    await pg.click('#ksheet .sx'); await pg.wait_for_timeout(200)
    px=json.loads(await pg.evaluate("JSON.stringify(%s.tarkistuslista[0].px||null)"%K))
    want('tallentuu riville', px=={'n':1,'t':['k']})
    if await pg.locator(row+'.open').count(): await pg.click(row+' .chd'); await pg.wait_for_timeout(100)
    want('suljetulla rivillä tärkein teksti ja +N', await pg.locator(row+' .ctxsum').count()==1 and '+2' in await pg.inner_text(row+' .ctxsum'))
    want('tilassa tekstien määrä', '3 tekstiä' in await pg.inner_text(row+' .cs'))
    await pg.click(row+' .ctxsum'); await pg.wait_for_timeout(150)
    items=await pg.evaluate("Array.prototype.map.call(document.querySelectorAll('#chlist .crow[data-id=\"r1\"] .ctx'),function(d){return d.dataset.nid+':'+d.dataset.pi;})")
    want('kolme tekstiä, ei arkistoitua eikä toista osaa', sorted(items)==['a:0','b:0','c:0'])
    await pg.click(row+' .ctx[data-nid="b"] .ncheck'); await pg.wait_for_timeout(200)
    want('ympyrä kuittaa tekstin', await pg.evaluate("!!%s.muistiinpanot.filter(function(n){return n.id==='b';})[0].done"%K) and await pg.locator(row+' .ctx.ok[data-nid="b"]').count()==1)
    await pg.click(row+' .ctx[data-nid="a"] .cxt'); await pg.wait_for_timeout(150)
    ta=pg.locator(row+' .ctx[data-nid="a"] textarea')
    want('teksti muokattavaksi', await ta.count()==1)
    await ta.fill('Vie koira lenkille'); await ta.dispatch_event('change'); await pg.wait_for_timeout(150)
    want('muokkaus muistiinpanoon oikeaan kohtaan', await pg.evaluate("%s.muistiinpanot.filter(function(n){return n.id==='a';})[0].text"%K)=='Vie koira lenkille\n---\nOsta maitoa')
    await pg.click(row+' .ctx[data-nid="c"] .clink'); await pg.wait_for_timeout(250)
    want('nuoli avaa muistiinpanon', await pg.is_visible('#nsheet') and 'rokotus' in await pg.input_value('#ns-text'))
    want('Listalle-tieto', 'Listalle: Tiskikone' in await pg.inner_text('#ns-found'))
    await pg.fill('#ns-text','Koiran rokotus 5.11. ja ruoka'); await pg.dispatch_event('#ns-text','input'); await pg.wait_for_timeout(60)
    await pg.fill('#ns-text','Pelkkä teksti'); await pg.dispatch_event('#ns-text','input'); await pg.wait_for_timeout(60)
    want('ei osumaa: ei Listalle-tietoa', await pg.locator('#ns-listalle').count()==0)
    await pg.fill('#ns-text','Koiran rokotus 5.11.'); await pg.dispatch_event('#ns-text','input'); await pg.click('#nsheet .sx'); await pg.wait_for_timeout(150)
    # Kierroslistalla ei Poimii tekstit -valintaa
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0];k.listat=[{id:'L',name:'Kierros'}];k.tarkistuslista.push({id:'r2',name:'K',l:'L',it:[]});localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()""")
    await pg.reload(); await pg.wait_for_timeout(400); await tab(pg,'list'); await pg.wait_for_timeout(150)
    await pg.click('#chlist-pick'); await pg.wait_for_timeout(120); await pg.click('#ws-list .row[data-l="L"]'); await pg.wait_for_timeout(150)
    await pg.click('#chlist .crow[data-id="r2"] .chd'); await pg.wait_for_timeout(100); await pg.click('#chlist .crow[data-id="r2"] .cedit'); await pg.wait_for_timeout(150)
    want('kierroslistalla ei valintaa', await pg.is_hidden('#ks-mode'))
    await pg.click('#ksheet .sx'); await pg.wait_for_timeout(100)
    want('ei vaakavieritystä', await pg.evaluate("document.documentElement.scrollWidth<=innerWidth"))
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640),(1280,800),(1440,900)): bad+=await run(p,w,h)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
