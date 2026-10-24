"""Juuri 1.70: Asiasanat tekstinä kertoo myös tärkeät (=Nimi*:, järjestys) ja ehdot (Ehdot: Kun A ja B, niin X esiin, Y pois.).
Kaksisuuntainen: teksti rakennetaan nykytilasta, Valmis kirjoittaa takaisin. Leveydet 390 ja 320 px. Käyttö: python3 testit/selain_170.py"""
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
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(200)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0];
      k.termit=[{id:'ta',name:'Kipu',yes:['kipua'],no:[]},{id:'tb',name:'Kuume',yes:[],no:[]},{id:'tc',name:'Lääkäri',yes:[],no:[]},{id:'td',name:'Odotus',yes:[],no:[]}];k.tarkeat=['tb','ta'];
      k.ehdot=[{id:'e1',k:['ta','tb'],all:1,on:['tc'],off:['td']}];localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()""")
    await pg.reload(); await pg.wait_for_timeout(150); await tab(pg,'list'); await pg.wait_for_timeout(60)
    async def opentext():
        await tab(pg,'terms'); await pg.wait_for_timeout(60); await menu(pg,'#tt-open'); await pg.wait_for_timeout(60)
        return await pg.input_value('#tt-text')
    t=await opentext()
    want('tähdelliset ensin tärkeysjärjestyksessä', t.index('=Kuume*:')<t.index('=Kipu*:')<t.index('=Lääkäri:'))
    want('ehdot tekstinä', 'Ehdot:\nKun Kipu ja Kuume, niin Lääkäri esiin, Odotus pois.' in t)
    # Muokkaus tekstissä: Kipu ensin, Kuume pois tärkeistä, Lääkäri tärkeäksi, uusi ehto uudella asiasanalla
    t2="=Kipu*:\nkipua\n\n=Lääkäri*:\n\n=Kuume:\n\n=Odotus:\n\nEhdot:\nKun Kipu tai Kuume, niin Lääkäri esiin, Lepo esiin, Odotus pois.\nKun Lääkäri, niin Soitto esiin."
    await pg.fill('#tt-text',t2); await pg.click('#tt-ok'); await pg.wait_for_timeout(80)
    k=json.loads(await pg.evaluate("JSON.stringify("+K+")"))
    ids={x['name']:x['id'] for x in k['termit']}
    want('tärkeysjärjestys tekstistä', k['tarkeat']==[ids['Kipu'],ids['Lääkäri']])
    want('uudet asiasanat ehdoista', 'Lepo' in ids and 'Soitto' in ids)
    E=k.get('ehdot',[])
    # 1.78: yksi ehto = yksi seuraus, joten Tuo- ja Poissulkee-osat ovat omat ehtonsa (tekstissä yhä yhdellä rivillä)
    want('ehdot tekstistä', len(E)==3 and E[0]['k']==[ids['Kipu'],ids['Kuume']] and not E[0].get('all') and E[0]['on']==[ids['Lääkäri'],ids['Lepo']] and E[1]['off']==[ids['Odotus']] and E[1]['k']==E[0]['k'] and E[2]['on']==[ids['Soitto']])
    want('sanat säilyvät', [x for x in k['termit'] if x['name']=='Kipu'][0]['yes']==['kipua'])
    # Muutos napeista näkyy tekstissä: Ehdot-ikkunasta uusi tärkeä asiasana ja ehdon poisto
    await pg.click('#tt-eh') if await pg.is_visible('#tt-eh') else None
    await pg.wait_for_timeout(60)
    if not await pg.is_visible('#ehsheet'):
        await tsx(pg); await pg.wait_for_timeout(40); await tab(pg,'terms'); await pg.wait_for_timeout(60); await pg.click('#tt-eh'); await pg.wait_for_timeout(60)
    await pg.locator('#eh-body .ehr[data-eh]').nth(2).click(); await pg.wait_for_timeout(50)
    await pg.click('#eh-del'); await pg.wait_for_timeout(40); await pg.locator('#ehsheet .delbox button:has-text("Poista")').last.click(); await pg.wait_for_timeout(60)
    await pg.click('#ehsheet .sx'); await pg.wait_for_timeout(60)
    t=await opentext()
    want('napeista tehty muutos tekstissä', 'Soitto esiin' not in t and 'Kun Kipu tai Kuume, niin Lääkäri esiin, Lepo esiin, Odotus pois.' in t and t.index('=Kipu*:')<t.index('=Lääkäri*:'))
    # Pelkät nimet riveittäin (Emilin bugi: ei tallentunut)
    await pg.fill('#tt-text',t+"\n\nUusi asia\nToinen tärkeä*\n=Kolmas"); await pg.click('#tt-ok'); await pg.wait_for_timeout(80)
    k=json.loads(await pg.evaluate("JSON.stringify("+K+")")); ids={x['name']:x['id'] for x in k['termit']}
    want('pelkät nimet tallentuvat asiasanoiksi', all(n in ids for n in ['Uusi asia','Toinen tärkeä','Kolmas']) and k['tarkeat'][-1]==ids['Toinen tärkeä'])
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640)): bad+=await run(p,w,h)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
