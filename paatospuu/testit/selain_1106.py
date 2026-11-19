"""Juuri 1.106 (Emil 18.11.2026): päivän napit kalenterissa (Asiat-taulukon Päivä-sarake, päivän otsikon nappi avaa ikkunan, palkki + prosentti + nuoli,
ulkopuolinen napautus sulkee). Päätöspuun testit siirtyivät Flow’n mukana tiedostoon selain_1109.py. Vanhat puut Valikossa. 390 ja 320 px kosketuksella, 1280 hiirellä."""
import asyncio, os, sys, datetime
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import apu
from apu import tab, menu
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
K="JSON.parse(localStorage.getItem('paatospuu:v1')).kokonaisuudet[0]"
OVER="""(function(){var w=document.documentElement.clientWidth,out=[];document.querySelectorAll('input,textarea,select,button').forEach(function(e){var r=e.getBoundingClientRect();
 if(r.width&&r.height&&e.offsetParent!==null&&!e.closest('.hscroll,.lwv')&&(r.right>w+0.5||r.left<-0.5))out.push((e.id||e.className||e.tagName)+' '+Math.round(r.left)+'..'+Math.round(r.right));});return JSON.stringify(out);})()"""
async def run(p,w,h,touch):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h},has_touch=touch,is_mobile=touch)).new_page()
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond):
        print('  %-56s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    async def tap(sel):
        if touch: await pg.tap(sel)
        else: await pg.click(sel)
        await pg.wait_for_timeout(120)
    async def box(sel):
        r=await pg.locator(sel).first.bounding_box(); return (round(r['x']),round(r['y']),round(r['width']),round(r['height'])) if r else None
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(300)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    today=datetime.date.today(); iso=lambda d:d.isoformat()
    days={}
    for i in range(1,31):
        d=today-datetime.timedelta(days=i); L=['t2']
        if i%3==0: L+=['t1','t3']
        elif i%3==1: L+=['t1']
        days[iso(d)]=L
    import json
    await pg.evaluate("""(function(D){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0];
      k.termit=[{id:'t1',name:'Juoksu',yes:[],no:[]},{id:'t2',name:'Kahvi',yes:[],no:[]},{id:'t3',name:'Uni',yes:[],no:[]},{id:'t4',name:'Sauna',yes:[],no:[]}];k.tarkeat=['t1','t2','t3','t4'];
      k.paivanapit={napit:['t1','t2','t3'],alkaen:{},paivat:D};localStorage.setItem('paatospuu:v1',JSON.stringify(o));})(%s)"""%json.dumps(days))
    await pg.reload(); await pg.wait_for_timeout(300)
    # Asiat: Päivä-sarake
    await tab(pg,'terms'); await pg.wait_for_timeout(200)
    want('Päivä-nappi Kerran-napin jälkeen', (await pg.locator('#implist .drow').first.locator('.evc').nth(2).text_content())=='Päivä')
    want('Päivä-ruudut valittuina', await pg.get_attribute('#implist .evc.pvc[data-pv="t1"]','aria-pressed')=='true' and await pg.get_attribute('#implist .evc.pvc[data-pv="t4"]','aria-pressed')=='false')
    await tap('#implist .evc.pvc[data-pv="t4"]')
    want('Päivä tallentuu ja alkamispäivä', await pg.evaluate(K+".paivanapit.napit.join()")=='t1,t2,t3,t4' and await pg.evaluate(K+".paivanapit.alkaen.t4")==iso(today))
    await tap('#implist .evc.pvc[data-pv="t4"]')
    want('uusi napautus poistaa', await pg.evaluate(K+".paivanapit.napit.join()")=='t1,t2,t3')
    # Kalenteri: päivän nappi
    await tab(pg,'cal'); await pg.wait_for_timeout(250)
    if await pg.locator('#calview [data-v="w"]').count() and await pg.get_attribute('#calview [data-v="w"]','aria-pressed')!='true': await tap('#calview [data-v="w"]')
    tsel='.wkday[data-day="%s"]'%iso(today)
    want('päivän otsikossa nappi', await pg.locator(tsel+' .pvday').count()==1 and (await pg.inner_text(tsel+' .pvday'))=='Päivä')
    y0=await box(tsel+' .wkh')
    await tap(tsel+' .pvday')
    want('nappi avaa pienen ikkunan', await pg.evaluate("document.getElementById('pvsheet').open") and await pg.locator('#pvsheet .sx').count()==0)
    want('napit taulukon järjestyksessä', await pg.evaluate("[].map.call(document.querySelectorAll('#pv-opts .pvopt .t'),function(e){return e.textContent;}).join()")=='Juoksu,Kahvi,Uni')
    want('prosentti ja palkki', '%' in await pg.inner_text('#pv-opts [data-t="t3"] .pct') and await pg.evaluate("parseFloat(document.querySelector('#pv-opts [data-t=\"t2\"]').style.getPropertyValue('--f'))")>0.8)
    u0=await pg.evaluate("parseFloat(document.querySelector('#pv-opts [data-t=\"t3\"]').style.getPropertyValue('--f'))")
    b0=await box('#pv-opts [data-t="t3"]')
    await tap('#pv-opts [data-t="t1"]')
    want('valinta tallentuu päivälle', await pg.evaluate(K+".paivanapit.paivat['%s'].join()"%iso(today))=='t1')
    want('valittu näkyy painettuna', await pg.get_attribute('#pv-opts [data-t="t1"]','aria-pressed')=='true')
    u1=await pg.evaluate("parseFloat(document.querySelector('#pv-opts [data-t=\"t3\"]').style.getPropertyValue('--f'))")
    want('valinta muuttaa muiden arviota', abs(u1-u0)>0.01)
    want('napit eivät liiku', await box('#pv-opts [data-t="t3"]')==b0)
    want('ei sivun vaakavieritystä ikkunassa', await pg.evaluate(OVER)=='[]')
    await pg.mouse.click(w//2,12); await pg.wait_for_timeout(200)
    want('ulkopuolinen napautus sulkee', not await pg.evaluate("document.getElementById('pvsheet').open"))
    want('päivän nappi näyttää valinnan', (await pg.inner_text(tsel+' .pvday'))=='Juoksu' and await box(tsel+' .wkh')==y0)
    await tap(tsel+' .pvday'); await tap('#pv-opts [data-t="t1"]')
    want('toinen napautus poistaa valinnan', await pg.evaluate("!%s.paivanapit.paivat['%s']"%(K,iso(today))))
    await pg.mouse.click(w//2,12); await pg.wait_for_timeout(150)
    # 1.109: Päätöspuu korvautui Flow’lla (selain_1109.py)
    # Vanhat puut ennallaan
    await menu(pg,'#m-tree'); await pg.wait_for_timeout(150)
    want('Vanhat puut Valikosta', await pg.is_visible('#p-use'))
    want('ei virheitä', not errs)
    await b.close()
    return bad,errs
async def main():
    allbad=[]
    async with async_playwright() as p:
        for w,h,t in [(390,844,True),(320,640,True),(1280,800,False)]:
            bad,errs=await run(p,w,h,t); allbad+=['%d: %s'%(w,x) for x in bad]+['%d: virhe %s'%(w,e) for e in errs]
    if allbad: print('\n'.join(allbad)); sys.exit(1)
    print('selain_1106 ok')
asyncio.run(main())
