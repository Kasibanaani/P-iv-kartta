"""Juuri 1.77: lista kuin päätöspuu (Emil 24.10.2026). Suljetulla rivillä tärkein kuittaamaton kohde nappina, kuittaus suoraan;
järjestys muuttuu vasta 0,6 s kuluttua tai kun avattu rivi suljetaan, ja siirtynyt rivi hehkuu. Kierroslistan kytkin Vain kuitattavat
piilottaa rivit, joihin ehdot eivät ole vielä tuoneet kohteita. Leveydet 390 ja 320 px. Käyttö: python3 testit/selain_177.py"""
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
    order=lambda: pg.evaluate("Array.prototype.map.call(document.querySelectorAll('#chlist .crow'),function(c){return c.dataset.id;})")
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(200)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0];
      k.termit=[{id:'ta',name:'Kipu',yes:[],no:[]},{id:'tb',name:'Kuume',yes:[],no:[]},{id:'tc',name:'Lääkäri',yes:[],no:[]},{id:'td',name:'Soitto',yes:[],no:[]},{id:'te',name:'Käynti',yes:[],no:[]}];k.tarkeat=['ta','tb','tc'];
      k.tarkistuslista=[{id:'r1',name:'Eka',created:'2026-10-01T00:00:00.000Z',it:[{id:'ta'}]},{id:'r2',name:'Toka',created:'2026-10-02T00:00:00.000Z',it:[{id:'tb'}]},{id:'r3',name:'Kolmas',created:'2026-10-03T00:00:00.000Z',it:[{id:'tc'}]},
        {id:'r4',name:'Soita',l:'L1',created:'2026-10-04T00:00:00.000Z',it:[{id:'td'}]},{id:'r5',name:'Käy',l:'L1',created:'2026-10-05T00:00:00.000Z',it:[{id:'te'}]}];
      k.listat=[{id:'L1',name:'Kierros',created:'2026-10-01T00:00:00.000Z',eh:1,vk:1}];k.ehdot=[{id:'e1',k:['td'],on:['te'],off:[]}];
      localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()""")
    await pg.reload(); await pg.wait_for_timeout(200); await tab(pg,'list'); await pg.wait_for_timeout(100)
    o0=await order()
    want('alussa tärkeysjärjestys', o0==['r1','r2','r3'])
    q=await pg.evaluate("Array.prototype.map.call(document.querySelectorAll('#chlist .crow .cquick .cpill'),function(b){return b.dataset.tid;})")
    want('suljetulla rivillä tärkein kohde nappina', q==['ta','tb','tc'])
    await pg.click('#chlist .crow[data-id="r1"] .cquick .cpill'); await pg.wait_for_timeout(80)
    it=json.loads(await pg.evaluate("JSON.stringify("+K+".tarkistuslista[0].it)"))
    want('kuittaus suoraan suljetulta riviltä', bool(it[0].get('ok')) and await pg.is_visible('#undo-b') and await pg.locator('#chlist .crow[data-id="r1"].open').count()==0)
    want('järjestys ei muutu heti', await order()==['r1','r2','r3'])
    await pg.wait_for_timeout(750)
    want('0,6 s jälkeen kuitattu rivi siirtyy', await order()==['r2','r3','r1'])
    want('siirtynyt rivi hehkuu', 'glow' in (await pg.get_attribute('#chlist .crow[data-id="r1"]','class')))
    want('kuitatulla rivillä ei pikanappia', await pg.locator('#chlist .crow[data-id="r1"] .cquick').count()==0)
    # Avattu rivi: järjestys pysyy, kunnes rivi suljetaan
    await pg.click('#chlist .crow[data-id="r2"] .chd'); await pg.wait_for_timeout(80)
    want('avatulla rivillä ei pikanappia', await pg.locator('#chlist .crow[data-id="r2"] .cquick').count()==0)
    await pg.click('#chlist .crow[data-id="r2"] .cpills .cpill[data-tid="tb"]'); await pg.wait_for_timeout(900)
    want('avatun rivin kuittaus ei siirrä', await order()==['r2','r3','r1'] and await pg.locator('#chlist .crow[data-id="r2"].open').count()==1)
    await pg.click('#chlist .crow[data-id="r2"] .chd'); await pg.wait_for_timeout(120)
    oo=await order()
    want('sulkeminen järjestää', oo[0]=='r3' and 'glow' in (await pg.get_attribute('#chlist .crow[data-id="r2"]','class')))
    # Kumoa palauttaa kuittauksen
    # Kierroslista: Vain kuitattavat
    await pg.click('#chlist-pick'); await pg.wait_for_timeout(80); await pg.click('#ws-list .row[data-l="L1"]'); await pg.wait_for_timeout(120)
    want('Vain kuitattavat: ehtoa odottava rivi piilossa', await order()==['r4'] and '1 rivi odottaa' in await pg.inner_text('#chk-hid'))
    await pg.click('#chlist .crow[data-id="r4"] .cquick .cpill'); await pg.wait_for_timeout(800)
    want('ehto tuo rivin esiin', 'r5' in await order() and await pg.locator('#chk-hid').count()==0)
    await pg.click('#chlist-pick'); await pg.wait_for_timeout(80)
    want('kytkin listan ikkunassa', await pg.get_attribute('#ws-vk','aria-checked')=='true')
    await pg.click('#ws-vk'); await pg.wait_for_timeout(60)
    want('kytkin pois', await pg.get_attribute('#ws-vk','aria-checked')=='false' and not json.loads(await pg.evaluate("JSON.stringify("+K+".listat[0])")).get('vk'))
    await pg.click('#ws-vk'); await pg.wait_for_timeout(60); await pg.click('#wsheet .sx'); await pg.wait_for_timeout(80)
    await pg.reload(); await pg.wait_for_timeout(200)
    want('kytkin säilyy tallennuksessa', json.loads(await pg.evaluate("JSON.stringify("+K+".listat[0])")).get('vk')==1)
    await pg.click('#chlist-pick') if await pg.is_visible('#chlist-pick') else None
    await pg.wait_for_timeout(60)
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640)): bad+=await run(p,w,h)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
