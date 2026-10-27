"""1.94: peukalovalikko, suora järjestys, työnkulun tilat ja valmistuminen."""
import asyncio, json, os
from playwright.async_api import async_playwright
from apu import tab
U='file://'+os.path.abspath(os.path.join(os.path.dirname(__file__),'..','index.html'))
async def run(p,w,h):
 b=await p.chromium.launch();pg=await b.new_page(viewport={'width':w,'height':h});errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
 await pg.goto(U);await tab(pg,'use');await pg.fill('#firstproj','Test');await pg.keyboard.press('Enter');await tab(pg,'notes')
 if w<1000:
  await pg.click('#roll');r=await pg.locator('#roll').bounding_box();m=await pg.locator('#sectionpop').bounding_box()
  assert m['x']>=0 and m['x']+m['width']<=w and m['y']>=0 and m['y']+m['height']<=h
  assert abs(m['x']-r['x'])<25 and abs(m['y']+m['height']-r['y'])<12
  await pg.keyboard.press('Escape');assert not await pg.is_visible('#sectionpop');assert await pg.locator('#roll').evaluate('(e)=>e===document.activeElement')
 await pg.click('#notesort');await pg.click('#sort-prio');assert await pg.get_attribute('#notesort','data-ns')=='prio'
 await tab(pg,'list');await pg.click('#chlist-pick');await pg.fill('#ws-new','Uusi');await pg.click('#ws-add');assert await pg.inner_text('#chk-end')=='Kuittaa työnkulku'
 await pg.evaluate("""()=>{let o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0];k.termit=['a','b','c','d'].map((id,i)=>({id,name:['Aloitus','Toimi','Vaihtoehto','Puuttuva'][i],yes:[],no:[]}));k.listat=[{id:'l',name:'Työnkulku',wf:1,eh:1}];k.ehdot=[{id:'e',k:['a'],on:['b','d'],off:[]},{id:'e2',k:['missing'],on:['c'],off:[]}];k.tarkistuslista=[{id:'r1',l:'l',name:'Alku',it:[{id:'a'}]},{id:'r2',l:'l',name:'Vaihe',it:[{id:'b'},{id:'c'}]}];localStorage.setItem('paatospuu:v1',JSON.stringify(o));localStorage.setItem('paatospuu:lista:'+k.id,'l');}""")
 await pg.reload();await tab(pg,'list');assert await pg.locator('#chk-end').is_disabled()
 await pg.click('.crow[data-id="r2"] .chd');assert await pg.locator('.cpill[data-tid="b"]').is_disabled();assert await pg.locator('.cpill[data-tid="c"]').is_disabled()
 assert await pg.locator('.cpill[data-tid="d"]').count()==0
 await pg.click('.crow[data-id="r1"] .cquick .cpill');assert not await pg.locator('.cpill[data-tid="b"]').is_disabled();assert await pg.locator('.cpill[data-tid="c"]').is_disabled()
 await pg.click('.cpill[data-tid="b"]');assert not await pg.locator('#chk-end').is_disabled()
 await pg.click('#undo-b');assert await pg.locator('#chk-end').is_disabled()
 await pg.click('.cpill[data-tid="b"]');await pg.reload();await tab(pg,'list');assert not await pg.locator('#chk-end').is_disabled()
 await pg.click('.crow[data-id="r2"] .chd')
 await pg.screenshot(path='/tmp/juuri-194-'+str(w)+'.png')
 await pg.click('#chk-end');assert await pg.locator('#chk-end').is_disabled()
 await pg.evaluate("""()=>{let o=JSON.parse(localStorage.getItem('paatospuu:v1'));if(!o.kokonaisuudet[0].muistiinpanot.some(n=>n.text.includes('Työnkulku')&&n.text.includes('Valinnat:')))throw Error('missing completion record');}""")
 await tab(pg,'terms');await pg.click('#p-terms .row[data-id="a"]');await pg.locator('#tsec-tun').evaluate('(e)=>{e.open=true}')
 await pg.click('#t-addeh-out');assert await pg.is_visible('#eh-pick');assert 'Aloitus' in await pg.inner_text('#eh-k')
 await pg.click('#eh-pick [data-tid="d"]');await pg.click('#eh-done');assert await pg.is_visible('#tsheet')
 assert not errors,errors
 await b.close();print('1.94',w,'OK',flush=True)
async def main():
 async with async_playwright() as p:
  for w,h in [(390,844),(320,640),(1280,850),(1440,900)]:await run(p,w,h)
asyncio.run(main())
