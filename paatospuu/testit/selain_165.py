"""Juuri 1.65: ‹ Takaisin linkin jälkeen (Emil 23.10.2026, arvion 12C). Asiasanalinkistä Muistioihin rajattuna, Takaisin palauttaa
näkymän, rajauksen, vierityksen ja avoinna olleen muistiinpanon. Välilehden vaihto poistaa napin. Leveydet 390 ja 320 px.
Käyttö: python3 testit/selain_165.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from apu import tab, menu, tsx
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h})).new_page()
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond):
        print('  %-44s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(200)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0];k.termit=[{id:'tk',name:'Kauppa',yes:['kauppa'],no:[]}];
      k.muistiinpanot=[];for(var i=0;i<30;i++){var t='Muistiinpano numero '+i+(i===25?' käy kauppa':'');k.muistiinpanot.push({id:'n'+i,created:'2026-10-0'+(1+i%9)+'T08:00:00.000Z',edited:'2026-10-01T08:00:00.000Z',text:t,teksti:t,date:'',paiva:''});}
      localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()""")
    await pg.reload(); await pg.wait_for_timeout(150); await tab(pg,'notes'); await pg.wait_for_timeout(60)
    card=pg.locator('#nlist .ncard:has-text("numero 25")'); await card.scroll_into_view_if_needed(); await pg.wait_for_timeout(50)
    st=await pg.evaluate("document.getElementById('main').scrollTop")
    want('lista vieritetty', st>0)
    await card.click(); await pg.wait_for_timeout(80)
    await pg.evaluate("(function(){var t=document.getElementById('ns-text'),i=t.value.indexOf('kauppa')+2;t.focus();t.setSelectionRange(i,i);t.click();})()"); await pg.wait_for_timeout(80)
    await pg.locator('#ns-tm .tmterm').first.click(); await pg.wait_for_timeout(100)
    want('linkki: Muistiot rajattuna', not await pg.is_visible('#nsheet') and await pg.locator('#nlist .ncard').count()==1)
    want('Takaisin näkyy', await pg.is_visible('#back'))
    r=await pg.evaluate("(function(){var u=document.getElementById('back').getBoundingClientRect(),n=(document.getElementById('pbar').offsetParent?document.getElementById('pbar'):document.getElementById('nav')).getBoundingClientRect();return [u.bottom<=n.top,u.left>=0,u.right<=innerWidth];})()")
    want('Takaisin alapalkin yllä ruudussa', all(r))
    await pg.click('#back'); await pg.wait_for_timeout(120)
    want('palaa muistiinpanoon', await pg.is_visible('#nsheet') and 'numero 25' in await pg.input_value('#ns-text'))
    want('ei näppäimistöä', await pg.evaluate("document.activeElement!==document.getElementById('ns-text')"))
    await pg.click('#nsheet .sx'); await pg.wait_for_timeout(80)
    want('rajaus ja vieritys palautuvat', await pg.locator('#nlist .ncard').count()==30 and abs(await pg.evaluate("document.getElementById('main').scrollTop")-st)<3)
    want('Takaisin poistui', not await pg.is_visible('#back'))
    # Välilehden vaihto poistaa napin
    await card.click(); await pg.wait_for_timeout(80)
    await pg.evaluate("(function(){var t=document.getElementById('ns-text'),i=t.value.indexOf('kauppa')+2;t.focus();t.setSelectionRange(i,i);t.click();})()"); await pg.wait_for_timeout(80)
    await pg.locator('#ns-tm .tmterm').first.click(); await pg.wait_for_timeout(100)
    await tab(pg,'cal') if await pg.locator('[data-tab="cal"]').count() else await pg.locator('#nav [data-tab]').first.click()
    await pg.wait_for_timeout(80)
    want('välilehden vaihto poistaa Takaisin', not await pg.is_visible('#back'))
    # 1.66 alapalkki: Listat oma välilehti
    await tab(pg,'list'); await pg.wait_for_timeout(80)
    want('Listat-välilehti: lista, otsikko, ei Muistioiden valitsinta', await pg.is_visible('#chlist-pick') and await pg.inner_text('#roll-now')=='Listat' and await pg.locator('#noteview').count()==0 and await pg.get_attribute('[data-tab="list"]','aria-selected')=='true')
    await tab(pg,'notes'); await pg.wait_for_timeout(80)
    want('Muistiot: ei Lista-valintaa', await pg.locator('#noteview [data-nv]').count()==3 and await pg.locator('#nlist').count()==1)
    r=await pg.evaluate("(function(){var o=[];document.querySelectorAll('#pbar>button,#pbar .prow>button').forEach(function(b){var r=b.getBoundingClientRect();o.push(r.left>=0&&r.right<=innerWidth+0.5&&b.scrollWidth<=b.clientWidth+1);});return o;})()")
    want('alapalkin napit mahtuvat (1.72)', len(r)==3 and all(r))
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640)): bad+=await run(p,w,h)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
