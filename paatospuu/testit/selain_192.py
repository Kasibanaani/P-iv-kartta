"""Juuri 1.92 (Emil 26.10.2026): Asiat tekstinä -ikkunan Ohje tekoälylle kopioi ohjeen, jossa on nykyinen teksti; tekoälyn
koodilohkona palauttama teksti tuodaan sellaisenaan. Leveydet 390 ja 320 px. Käyttö: python3 testit/selain_192.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from apu import tab, menu
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
K="JSON.parse(localStorage.getItem('paatospuu:v1')).kokonaisuudet[0]"
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    ctx=await b.new_context(viewport={'width':w,'height':h})
    try: await ctx.grant_permissions(['clipboard-read','clipboard-write'])
    except Exception: pass
    pg=await ctx.new_page()
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond):
        print('  %-48s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(200)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0];
      k.termit=[{id:'ta',name:'Kipu',yes:['kipua'],no:[]}];k.tarkeat=['ta'];localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()""")
    await pg.reload(); await pg.wait_for_timeout(150)
    await tab(pg,'terms'); await pg.wait_for_timeout(60); await menu(pg,'#tt-open'); await pg.wait_for_timeout(60)
    want('nappi näkyy', await pg.is_visible('#tt-ai-b'))
    sw=await pg.evaluate("document.documentElement.scrollWidth<=innerWidth")
    want('ei vaakavieritystä', sw)
    await pg.click('#tt-ai-b'); await pg.wait_for_timeout(150)
    oh=await pg.input_value('#tt-ai')
    lab=await pg.inner_text('#tt-ai-b')
    want('ohje syntyi nykytekstillä', oh.startswith('# Ohje: Juuri') and '=Kipu*:\nkipua' in oh)
    want('kopioitu tai valittu', lab in ('Kopioitu','Valittu, kopioi'))
    # Tekoälyn vastaus koodilohkona takaisin kenttään
    await pg.fill('#tt-text',"```\n=Kipu*:\nkipua\n\nKuume*\nLepo\n\nEhdot:\nKun Kipu ja Kuume, niin Lepo esiin.\n```")
    await pg.click('#tt-ok'); await pg.wait_for_timeout(80)
    k=json.loads(await pg.evaluate("JSON.stringify("+K+")")); ids={x['name']:x['id'] for x in k['termit']}
    want('vastaus tuotiin', 'Kuume' in ids and 'Lepo' in ids and k['tarkeat']==[ids['Kipu'],ids['Kuume']] and len(k.get('ehdot',[]))==1 and '```' not in ids)
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640)): bad+=await run(p,w,h)
    sys.exit(1 if bad else 0)
asyncio.run(main())
