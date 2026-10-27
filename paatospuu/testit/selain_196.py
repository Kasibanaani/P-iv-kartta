"""Työnkulku kuittaustapana: asetukset, jatkaminen, lähdekuittaus, kumoa, uusiutuminen ja kalenterin ohituksen esto."""
import asyncio,os,json
from playwright.async_api import async_playwright
from apu import tab,menu
U='file://'+os.path.abspath(os.path.join(os.path.dirname(__file__),'..','index.html'))
K="JSON.parse(localStorage.getItem('paatospuu:v1')).kokonaisuudet[0]"
async def run(p,w,h):
 b=await p.chromium.launch();pg=await b.new_page(viewport={'width':w,'height':h});errors=[];pg.set_default_timeout(10000);pg.on('pageerror',lambda e:errors.append(str(e)))
 await pg.goto(U);await tab(pg,'use');await pg.fill('#firstproj','Test');await pg.keyboard.press('Enter')
 await pg.evaluate("""()=>{let o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0];k.termit=[{id:'job',name:'Tarkistus',yes:[],no:[],ev:7},{id:'a',name:'Alku',yes:[],no:[]},{id:'b',name:'Jatko',yes:[],no:[]}];k.ryhmat=[{id:'g',name:'Vaihe',phase:1,m:['a','b'],all:1}];k.listat=[{id:'tpl',name:'Tarkistuksen työnkulku',wf:1,eh:1}];k.tarkistuslista=[{id:'tr',name:'Vaihe',l:'tpl',sg:'g',g:['g'],it:[{id:'a',g:1,ok:new Date().toISOString()}]},{id:'r1',name:'Ensimmäinen',it:[{id:'job'}]},{id:'r2',name:'Toinen',it:[{id:'job'}]}];k.muistiinpanot=[{id:'n',text:'Tarkistus',created:new Date().toISOString(),edited:new Date().toISOString(),date:''}];k.ehdot=[{id:'e',k:['a'],on:['b'],off:[]}];localStorage.setItem('paatospuu:v1',JSON.stringify(o));}""")
 await pg.reload();await tab(pg,'terms');await pg.locator('button.row[data-id="job"]:visible').first.click()
 await pg.locator('#tsec-lista summary').click();await pg.select_option('#tflow','tpl');await pg.locator('#tflow').scroll_into_view_if_needed();await pg.wait_for_timeout(180);assert await pg.locator('#tsheet').evaluate('(e)=>e.scrollWidth<=e.clientWidth');await pg.screenshot(path='/tmp/juuri-196-asetukset-'+str(w)+'.png');await pg.click('#tok');assert await pg.evaluate(K+".termit.find(t=>t.id==='job').wflow")=='tpl'
 await tab(pg,'list');await pg.click('.crow[data-id="r1"] .chd');await pg.click('.crow[data-id="r1"] .cpill[data-tid="job"]')
 L=await pg.evaluate(K+'.listat.find(L=>L.run)');lid=L['id'];assert not await pg.evaluate(K+".tarkistuslista.find(r=>r.id==='r1').it[0].ok||null")
 assert await pg.locator('#chk-end').is_disabled();assert await pg.locator('.cpill[data-tid="b"]').is_disabled();assert not await pg.locator('.cpill[data-tid="a"]').is_disabled()
 await pg.click('.cpill[data-tid="a"]');assert not await pg.locator('.cpill[data-tid="b"]').is_disabled()
 # Pause and resume after reload without copying template receipts or losing run receipts.
 await pg.click('#flow-back');await pg.click('.crow[data-id="r1"] .cpill[data-tid="job"]');assert await pg.evaluate(K+'.listat.filter(L=>L.run).length')==1
 await pg.reload();await tab(pg,'list');await pg.locator('#chlist .chd').first.click();assert await pg.locator('.cpill.ok[data-tid="a"]').count()==1;assert await pg.locator('#chk-end').is_disabled()
 await pg.click('.cpill[data-tid="b"]');assert not await pg.locator('#chk-end').is_disabled();await pg.wait_for_timeout(200);await pg.screenshot(path='/tmp/juuri-196-run-'+str(w)+'.png');assert await pg.evaluate('document.documentElement.scrollWidth<=innerWidth')
 await pg.click('#chk-end');assert await pg.evaluate(K+".tarkistuslista.find(r=>r.id==='r1').it[0].ok");assert not await pg.evaluate(K+".tarkistuslista.find(r=>r.id==='r2').it[0].ok||null");assert await pg.evaluate(K+'.listat.find(L=>L.run).run.done');assert await pg.evaluate(K+".tarkistuslista.find(r=>r.id==='tr').it[0].ok")
 # Undo completion restores both the run and its source. Completing it again is possible once.
 await pg.click('#undo-b');assert not await pg.evaluate(K+".tarkistuslista.find(r=>r.id==='r1').it[0].ok||null");await pg.click('.crow[data-id="r1"] .cpill[data-tid="job"]');assert not await pg.locator('#chk-end').is_disabled();await pg.click('#chk-end')
 # Second source is a new independent execution.
 await pg.click('.crow[data-id="r2"] .chd');await pg.click('.crow[data-id="r2"] .cpill[data-tid="job"]');assert await pg.evaluate(K+'.listat.filter(L=>L.run).length')==2;assert await pg.locator('.cpill.ok').count()==0;await pg.click('#flow-back')
 await pg.click('#chlist-pick');assert 'Ensimmäinen' in await pg.locator('#ws-list [data-l="'+lid+'"]').inner_text();await pg.click('#wsheet .sx')
 # Optional note launch leaves note unchecked and stays independent of the pending source run.
 await tab(pg,'notes');await pg.click('.ncard[data-id="n"] [data-flow="job"]');assert await pg.evaluate(K+'.listat.filter(L=>L.run).length')==3
 await pg.click('.cpill[data-tid="a"]');await pg.click('.cpill[data-tid="b"]');await pg.click('#chk-end');assert not await pg.evaluate(K+".muistiinpanot.find(n=>n.id==='n').done||null");assert not await pg.evaluate(K+".tarkistuslista.find(r=>r.id==='r2').it[0].ok||null")
 # Export/import through UI retains unfinished runs.
 backup=await pg.evaluate("localStorage.getItem('paatospuu:v1')");await menu(pg,'#m-x');await pg.click('#imptextbtn');await pg.fill('#imptext',backup);await pg.click('#impcheck');await pg.click('#impok');await pg.click('#vsheet .sx')
 assert await pg.evaluate(K+'.listat.filter(L=>L.run&&!L.run.done).length')==1
 # A calendar sign-off must not bypass a workflow requirement. Old receipt renewing creates a fresh execution.
 await pg.evaluate("""()=>{let o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0];k.tarkistuslista.find(r=>r.id==='r1').it[0].ok='2020-01-01T00:00:00Z';k.muistiinpanot.push({id:'plan',text:'Varaus',created:new Date().toISOString(),edited:new Date().toISOString(),date:'2026-10-27',done:new Date().toISOString(),pl:{r:'r1',i:'job'}});localStorage.setItem('paatospuu:v1',JSON.stringify(o));localStorage.removeItem('paatospuu:lista:'+k.id);}""")
 await pg.reload();await tab(pg,'list');assert await pg.evaluate(K+".tarkistuslista.find(r=>r.id==='r1').it[0].ok")=='2020-01-01T00:00:00Z'
 await pg.click('.crow[data-id="r1"] .chd');await pg.click('.crow[data-id="r1"] .cpill[data-tid="job"]');assert await pg.evaluate(K+'.listat.filter(L=>L.run).length')==4;assert await pg.locator('.cpill.ok').count()==0
 # A recursive requirement cannot create a second nested copy of the same workflow.
 await pg.evaluate("""()=>{let o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0];k.termit.find(t=>t.id==='a').wflow='tpl';localStorage.setItem('paatospuu:v1',JSON.stringify(o));}""")
 await pg.reload();await tab(pg,'list');await pg.locator('#chlist .chd').first.click();await pg.click('.cpill[data-tid="a"]');assert await pg.evaluate(K+'.listat.filter(L=>L.run).length')==4;assert 'kehä' in await pg.inner_text('#undo-t')
 # Source deletion while paused keeps the run usable, with no receipt sent elsewhere.
 await pg.evaluate("""()=>{let o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0];delete k.termit.find(t=>t.id==='a').wflow;k.tarkistuslista=k.tarkistuslista.filter(r=>r.id!=='r1');localStorage.setItem('paatospuu:v1',JSON.stringify(o));}""")
 await pg.reload();await tab(pg,'list');await pg.locator('#chlist .chd').first.click();await pg.click('.cpill[data-tid="a"]');await pg.click('.cpill[data-tid="b"]');await pg.click('#chk-end');assert not await pg.evaluate(K+".tarkistuslista.find(r=>r.id==='r2').it[0].ok||null");assert 'ei kuitattu' in await pg.inner_text('#undo-t')
 # Optional launch also works inside the note editor and saves the note first.
 await tab(pg,'notes');await pg.click('.ncard[data-id="n"]');await pg.click('#nsheet [data-flow="job"]');assert await pg.evaluate(K+'.listat.filter(L=>L.run).length')==5
 assert not await pg.is_visible('#nsheet');assert not await pg.is_visible('#newnote')
 await pg.click('#flow-back');await pg.click('#newnote');await pg.fill('#ns-text','Tarkistus uusi muistiinpano');await pg.click('#nsheet [data-flow="job"]');assert await pg.evaluate(K+'.listat.filter(L=>L.run).length')==6;assert await pg.evaluate(K+".muistiinpanot.some(n=>n.text==='Tarkistus uusi muistiinpano')")
 # Reset and deletion affect this execution only; completed executions remain read-only.
 await pg.click('.cpill[data-tid="a"]');await pg.click('#chlist-pick');await pg.click('#chk-reset');assert await pg.locator('.cpill.ok').count()==0
 await pg.click('#chlist-pick');await pg.click('#ws-del');await pg.click('#ws-cur .delno');assert await pg.is_visible('#ws-del');await pg.click('#ws-del');await pg.click('#ws-cur .delok');assert await pg.evaluate(K+'.listat.filter(L=>L.run).length')==5;assert await pg.evaluate(K+".muistiinpanot.some(n=>n.text==='Tarkistus uusi muistiinpano')")
 await tab(pg,'list');await pg.click('#chlist-pick');await pg.click('#ws-list [data-l="'+lid+'"]');await pg.locator('#chlist .chd').first.click();assert await pg.locator('#chk-end').is_disabled();assert await pg.locator('#chlist .cpill:enabled').count()==0;assert await pg.locator('#chlist .cedit').count()==0
 assert not errors,errors;await b.close();print('1.96',w,'OK',flush=True)
async def main():
 async with async_playwright() as p:
  for w,h in [(390,844),(320,640),(1280,850),(1440,900)]:await run(p,w,h)
asyncio.run(main())
