"""Juuri 1.80: päättely muistiossa (Kipu + Kuume → Flunssa haaleampana), projektikohtainen tunnistuskytkin ja lukunäkymä (kokeilu).
Leveydet 390 ja 320 px. Käyttö: python3 testit/selain_180.py"""
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
    pg=await (await b.new_context(viewport={'width':w,'height':h})).new_page()
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond):
        print('  %-48s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    card=lambda nid: pg.evaluate("(function(){var c=document.querySelector('#nlist .ncard[data-id=\"%s\"] .nf');return c?Array.prototype.map.call(c.querySelectorAll('i'),function(i){return i.textContent+(i.classList.contains('inf')?'~':'');}):null;})()"%nid)
    async def setting(key,v):
        await menu(pg,'#m-proj'); await pg.wait_for_timeout(150)
        await pg.locator('#set-%s button[data-v="%s"]'%(key,v)).click(); await pg.wait_for_timeout(60)
        await pg.click('#psheet .sx'); await pg.wait_for_timeout(120)
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(200)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0];
      k.termit=[{id:'ta',name:'Kipu',yes:[],no:[]},{id:'tb',name:'Kuume',yes:[],no:[]},{id:'tf',name:'Flunssa',yes:[],no:[]}];
      k.ehdot=[{id:'e1',k:['ta','tb'],all:1,on:['tf'],off:[]}];
      k.muistiinpanot=[{id:'n1',created:'2026-10-20T08:00:00.000Z',edited:'2026-10-20T08:00:00.000Z',teksti:'Kipu ja kuume alkoi eilen',text:'Kipu ja kuume alkoi eilen',paiva:'',date:''},
        {id:'n2',created:'2026-10-21T08:00:00.000Z',edited:'2026-10-21T08:00:00.000Z',teksti:'Vain kipu',text:'Vain kipu',paiva:'',date:''}];
      localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()""")
    await pg.reload(); await pg.wait_for_timeout(200); await tab(pg,'notes'); await pg.wait_for_timeout(80)
    c1=await card('n1'); c2=await card('n2')
    want('päätelty asiasana kortissa haaleampana', c1 is not None and 'Flunssa~' in c1 and 'Kipu' in c1 and 'Kuume' in c1)
    want('yksi syy ei riitä', c2 is not None and not any(x.startswith('Flunssa') for x in c2))
    await pg.locator('#nlist .ncard[data-id="n1"]').click(); await pg.wait_for_timeout(200)
    want('muistiinpanossa Päätelty-rivi', 'Päätelty' in await pg.inner_text('#ns-found') and await pg.locator('#ns-found i.th.inf[data-tid="tf"]').count()==1)
    want('ei lukunäkymää oletuksena', not await pg.evaluate("document.getElementById('ns-text').readOnly"))
    await pg.click('#nsheet .sx'); await pg.wait_for_timeout(120)
    # Tunnistus pois
    await setting('tun','off')
    want('tunnistus pois: ei asiasanoja korteissa', (await card('n1')) in (None,[]))
    await pg.locator('#nlist .ncard[data-id="n1"]').click(); await pg.wait_for_timeout(200)
    want('tunnistus pois: ei tulkintaa eikä linkkejä', 'Asiasanat' not in await pg.inner_text('#ns-found') and await pg.locator('#ns-hl .th').count()==0)
    await pg.click('#nsheet .sx'); await pg.wait_for_timeout(120)
    want('asetus tallentuu projektille', await pg.evaluate(K+".asetukset.tun")=='off')
    await setting('tun','on')
    want('tunnistus takaisin', 'Kipu' in (await card('n1') or []))
    # Lukunäkymä
    await setting('read','read')
    await pg.locator('#nlist .ncard[data-id="n1"]').click(); await pg.wait_for_timeout(250)
    r=await pg.evaluate("(function(){var t=document.getElementById('ns-text');return [t.readOnly,document.getElementById('nsheet').classList.contains('reading'),document.activeElement===t];})()")
    want('lukunäkymä: lukittu, ei fokusta', r==[True,True,False])
    want('lukunäkymä: linkit nappeina', await pg.evaluate("getComputedStyle(document.querySelector('#ns-hl .th')).backgroundColor")!='rgba(0, 0, 0, 0)')
    if os.environ.get('KUVA'): await pg.screenshot(path=os.environ['KUVA']+'/e180_%d.png'%w)
    await pg.evaluate("(function(){var t=document.getElementById('ns-text');t.setSelectionRange(1,1);t.dispatchEvent(new MouseEvent('click',{bubbles:true}));})()"); await pg.wait_for_timeout(80)
    want('linkin napautus ei avaa muokkausta', await pg.evaluate("document.getElementById('ns-text').readOnly") and await pg.is_visible('#ns-tm'))
    await pg.evaluate("(function(){var t=document.getElementById('ns-text');t.setSelectionRange(16,16);t.dispatchEvent(new MouseEvent('click',{bubbles:true}));})()"); await pg.wait_for_timeout(80)
    r=await pg.evaluate("(function(){var t=document.getElementById('ns-text');return [t.readOnly,document.getElementById('nsheet').classList.contains('reading'),document.activeElement===t];})()")
    want('napautus tekstiin: muokkaus ja fokus', r==[False,False,True])
    await pg.click('#nsheet .sx'); await pg.wait_for_timeout(120)
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640)): bad+=await run(p,w,h)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
