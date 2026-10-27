"""Vaihepankki: luonti, jaettu muokkaus, paikalliset kuittaukset, irrotus ja vienti/tuonti."""
import asyncio,os,json
from playwright.async_api import async_playwright
from apu import tab,menu
U='file://'+os.path.abspath(os.path.join(os.path.dirname(__file__),'..','index.html'))
K="JSON.parse(localStorage.getItem('paatospuu:v1')).kokonaisuudet[0]"
async def run(p,w,h):
 b=await p.chromium.launch();pg=await b.new_page(viewport={'width':w,'height':h});errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
 await pg.goto(U);await tab(pg,'use');await pg.fill('#firstproj','Test');await pg.keyboard.press('Enter')
 await pg.evaluate("""()=>{let o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0];k.termit=['a','b','c'].map((id,i)=>({id,name:['Aloitus','Tavoite','Jatko'][i],yes:[],no:[]}));localStorage.setItem('paatospuu:v1',JSON.stringify(o));}""")
 await pg.reload();await tab(pg,'list');await pg.click('#chlist-pick');await pg.fill('#ws-new','Suppea');await pg.click('#ws-add')
 await pg.click('#newnote');assert await pg.is_visible('#phsheet');await pg.click('#ph-new');await pg.fill('#ks-name','Tavoitteet');await pg.click('#ks-f [data-tid="a"]');await pg.click('#ks-f [data-tid="b"]');await pg.click('#ksheet .sx')
 g=await pg.evaluate(K+'.ryhmat.find(g=>g.phase)');assert g['m']==['a','b'];gid=g['id'];r=await pg.evaluate(K+'.tarkistuslista[0]');rid=r['id'];assert r['sg']==gid
 await pg.click('.crow[data-id="'+rid+'"] .cpill[data-tid="a"]')
 # second workflow selects an existing phase, starts without receipts
 await pg.click('#chlist-pick');await pg.fill('#ws-new','Laaja');await pg.click('#ws-add');await pg.click('#newnote');await pg.click('#phase-list .crow[data-gid="'+gid+'"] .ph-add')
 rows=await pg.evaluate(K+'.tarkistuslista');r2=rows[1];rid2=r2['id'];assert r2['sg']==gid and not r2['it']
 assert await pg.locator('.crow[data-id="'+rid2+'"] .cpill.ok').count()==0
 await pg.click('.crow[data-id="'+rid2+'"] .cedit');assert '2 listassa' in await pg.inner_text('#ks-shared');assert await pg.locator('#ksheet').evaluate('(e)=>e.scrollWidth<=e.clientWidth');await pg.wait_for_timeout(220);await pg.screenshot(path='/tmp/juuri-195-editor-'+str(w)+'.png');await pg.fill('#ks-name','Yhteiset tavoitteet');await pg.click('#ks-f [data-tid="c"]');await pg.click('#ks-any [data-ka="1"]');await pg.click('#ksheet .sx')
 rows=await pg.evaluate(K+'.tarkistuslista');assert all(r['name']=='Yhteiset tavoitteet' and r.get('any') for r in rows);assert rows[0]['it'][0]['ok'];assert not rows[1]['it']
 # bank same row structure and shared members
 await pg.click('#phase-bank');await pg.click('#phase-list .chd');assert await pg.locator('#phase-list .crow.open .cpill').count()==3
 await pg.wait_for_timeout(250);await pg.screenshot(path='/tmp/juuri-195-bank-'+str(w)+'.png');await pg.click('#phsheet .sx')
 # detach copy affects only this row and keeps state local
 await pg.click('.crow[data-id="'+rid2+'"] .cedit');await pg.click('#ks-phase-copy');await pg.fill('#ks-name','Oma vaihe');await pg.click('#ks-f [data-tid="b"]');await pg.click('#ksheet .sx')
 rows=await pg.evaluate(K+'.tarkistuslista');assert rows[0]['sg']!=rows[1]['sg'];assert rows[0]['name']=='Yhteiset tavoitteet' and rows[1]['name']=='Oma vaihe'
 assert (await pg.evaluate(K+'.ryhmat.find(g=>g.id==='+json.dumps(gid)+').m'))==['a','b','c']
 # new row creation even after detach, bank create without attaching
 await tab(pg,'terms');await pg.click('#tt-phases');await pg.click('#ph-new');await pg.fill('#ks-name','Käyttämätön');await pg.click('#ks-f [data-tid="c"]');await pg.click('#ksheet .sx')
 assert await pg.evaluate(K+'.tarkistuslista.length')==2;assert await pg.evaluate(K+'.ryhmat.filter(g=>g.phase).length')==3
 await pg.reload();await tab(pg,'list');rows=await pg.evaluate(K+'.tarkistuslista');assert rows[0]['it'][0]['ok'];assert rows[1]['name']=='Oma vaihe'
 # import round trip via the real UI
 backup=await pg.evaluate("localStorage.getItem('paatospuu:v1')")
 await menu(pg,'#m-x');await pg.click('#imptextbtn');await pg.fill('#imptext',backup);await pg.click('#impcheck');await pg.click('#impok');await pg.click('#vsheet .sx');await tab(pg,'list')
 rows=await pg.evaluate(K+'.tarkistuslista');assert rows[0]['it'][0]['ok'];assert rows[1]['sg']!=rows[0]['sg']
 # unused definitions can be removed; definitions in use have no delete action
 await tab(pg,'terms');await pg.click('#tt-phases');unused=await pg.evaluate(K+".ryhmat.find(g=>g.name==='Käyttämätön').id")
 await pg.click('#phase-list .crow[data-gid="'+unused+'"] .chd');await pg.click('#phase-list .crow[data-gid="'+unused+'"] .ph-delete');await pg.click('#phase-list .delok')
 assert await pg.evaluate(K+'.ryhmat.filter(g=>g.phase).length')==2
 assert await pg.locator('#phase-list .ph-delete').count()==0
 await pg.click('#phsheet .sx')
 # legacy workflow migration keeps rules referring to the original group working
 await pg.evaluate("""()=>{let o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0];k.listat=[{id:'oldwf',name:'Vanha',wf:1,eh:1}];k.ryhmat=[{id:'legacy',name:'Alkuvaihe',m:['a'],all:1}];k.ehdot=[{id:'e',k:['legacy'],on:['b'],off:[]}];k.tarkistuslista=[{id:'rOld',name:'Alku',l:'oldwf',g:['legacy'],it:[{id:'a',g:1,ok:new Date().toISOString()}]},{id:'rTarget',name:'Seuraava',l:'oldwf',it:[{id:'b'}]}];localStorage.setItem('paatospuu:v1',JSON.stringify(o));localStorage.setItem('paatospuu:lista:'+k.id,'oldwf');}""")
 await pg.reload();await tab(pg,'list');await pg.click('.crow[data-id="rTarget"] .chd');assert not await pg.locator('.crow[data-id="rTarget"] .cpill[data-tid="b"]').is_disabled()
 await pg.click('.crow[data-id="rOld"] .chd');assert await pg.locator('.crow[data-id="rOld"] .cpill.ok[data-tid="a"]').count()==1
 # overall overflow and runtime errors
 assert await pg.evaluate("document.documentElement.scrollWidth<=innerWidth")
 assert not errors,errors
 await b.close();print('1.95',w,'OK',flush=True)
async def main():
 async with async_playwright() as p:
  for w,h in [(390,844),(320,640),(1280,850),(1440,900)]:await run(p,w,h)
asyncio.run(main())
