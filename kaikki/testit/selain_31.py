"""Kaikki 0.31 (Emil 22.11.2026, A0.3–A0.6): rivinäkymän pystyviivat, matalampi rivi, sarakkeen leveys ja järjestys raahaamalla
(laitteelle, säilyy uudelleenlatauksessa), otsikon napautus järjestää edelleen, Cmd/Ctrl-napsautus avaa valintatilan, Shift-napsautus
valitsee välin, osoitettaessa näkyvä valintaruutu. Leveydet 1440 ja 1280 (tietokone) sekä 390 (rivit puhelimella, ei virheitä).
Käyttö: python3 testit/selain_31.py"""
import asyncio, os, sys, json, threading, functools, http.server
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
# http-palvelin eikä file:// (0.61): Chromium antaa file://-sivulle uudelleenladattaessa välillä vanhan selaimen muistin
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
SRV=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Q,directory=os.path.abspath(os.path.join(D,'..'))))
threading.Thread(target=SRV.serve_forever,daemon=True).start()
U='http://127.0.0.1:%d/index.html'%SRV.server_address[1]
FAKE=open(os.path.join(D,'fakegh.js'),encoding='utf8').read()
def md(i): return '---\ntyyppi: projekti\notsikko: Rivi %d\nkuvaus: \nluotu: 2026-11-%02d\nlahde: emil\n---\n# Rivi %d\n\nTeksti.\n'%(i,10+i,i)
SEED={'projektit/a/r%d.md'%i:md(i) for i in range(1,6)}
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    ctx=await b.new_context(viewport={'width':w,'height':h})
    pg=await ctx.new_page()
    await pg.add_init_script(FAKE+";(function(){var S=%s;if(!window.__repo.kept)for(var k in S)window.__repo.put(k,S[k]);try{localStorage.setItem('kaikki:gh',JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));localStorage.setItem('kaikki:nmode','rows')}catch(e){}})();"%json.dumps(SEED))
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond,info=''):
        print('  %-56s %s %s'%(label,'ok' if cond else 'VIRHE',info if not cond else ''))
        if not cond: bad.append(label)
    async def heads(): return await pg.evaluate("Array.from(document.querySelectorAll('.rvhead .rvc[data-k]')).map(function(c){return c.textContent.trim();})")
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(1500)
    want('rivit näkyvät',await pg.evaluate("document.querySelectorAll('#nlist .rvr').length")==5)
    v=await pg.evaluate("(function(){var r=document.querySelector('#nlist .rvr');return {bl:getComputedStyle(r.children[1]).borderLeftWidth,h:r.getBoundingClientRect().height};})()")
    want('pystyviivat sarakkeiden välissä',v['bl']=='1px',v)
    if w<1000:
        want('ei sivuvirheitä',not errs,errs); await b.close(); return bad
    want('matalampi rivi koneella',v['h']<=40,v)
    want('otsikkorivin Otsikko pysyy jäädytettynä',await pg.evaluate("getComputedStyle(document.querySelector('.rvhead .rvt')).position")=='sticky')
    # leveys
    i=(await heads()).index('Kansio')
    cell=pg.locator('.rvhead .rvc').nth(i); bb=await cell.bounding_box(); w0=bb['width']
    rz=pg.locator('.rvhead .rvc').nth(i).locator('.rv-rz'); rb=await rz.bounding_box()
    await pg.mouse.move(rb['x']+3,rb['y']+5); await pg.mouse.down(); await pg.mouse.move(rb['x']+93,rb['y']+5,steps=5); await pg.mouse.up(); await pg.wait_for_timeout(150)
    w1=(await pg.locator('.rvhead .rvc').nth(i).bounding_box())['width']; r1=(await pg.locator('#nlist .rvr').first.locator('.rvc').nth(i).bounding_box())['width']
    want('sarakkeen leveys raahaamalla, rivit seuraavat',w1>=w0+80 and abs(r1-w1)<2,(w0,w1,r1))
    # järjestys
    hs=await heads(); a=hs.index('Luotu'); k=hs.index('Kansio')
    s0=await pg.locator('.rvhead .rvc').nth(a).locator('.rv-head-sort').bounding_box(); t0=await pg.locator('.rvhead .rvc').nth(k).bounding_box()
    await pg.mouse.move(s0['x']+10,s0['y']+8); await pg.mouse.down(); await pg.mouse.move(t0['x']+20,t0['y']+8,steps=8); await pg.mouse.up(); await pg.wait_for_timeout(300)
    hs2=await heads()
    want('sarakkeen järjestys raahaamalla',hs2.index('Luotu')<hs2.index('Kansio') and hs2[0]=='Otsikko',hs2)
    await pg.reload(); await pg.wait_for_timeout(1500)
    hs3=await heads(); w2=(await pg.locator('.rvhead .rvc').nth(hs3.index('Kansio')).bounding_box())['width']
    want('järjestys ja leveys säilyvät laitteella',hs3==hs2 and abs(w2-w1)<3,(hs3,w2,w1))
    # järjestys napautuksella toimii yhä
    await pg.locator('.rvhead .rvc').nth(0).locator('.rv-head-sort').click(); await pg.wait_for_timeout(200)
    want('otsikon napautus järjestää yhä',await pg.evaluate("!!document.querySelector('.rvhead .rv-direction')"))
    # monivalinta
    await pg.locator('#nlist .rvr').first.hover(); await pg.wait_for_timeout(100)
    want('osoitettaessa ei valintaruutua (Emil 23.11.: vain Valitse-napista)',await pg.evaluate("!Array.from(document.querySelectorAll('#nlist .rvr .rv-pick,#nlist .rvr input[type=checkbox]')).some(function(x){return getComputedStyle(x).display!=='none';})"))
    await pg.locator('#nlist .rvr').nth(1).click(modifiers=['ControlOrMeta']); await pg.wait_for_timeout(200)
    want('Cmd/Ctrl-napsautus avaa valintatilan',await pg.evaluate("document.getElementById('note-select-count')&&document.getElementById('note-select-count').textContent")=='Valittu 1')
    want('muistiinpano ei auennut',not await pg.evaluate("document.getElementById('nsheet').open"))
    await pg.locator('#nlist .rvr').nth(3).click(modifiers=['Shift']); await pg.wait_for_timeout(200)
    want('Shift-napsautus valitsee välin',await pg.evaluate("document.getElementById('note-select-count').textContent")=='Valittu 3')
    want('ei sivuttaisvieritystä (sivu)',await pg.evaluate("document.documentElement.scrollWidth<=innerWidth"))
    want('ei sivuvirheitä',not errs,errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((1440,900),(1280,800),(390,844)): bad+=await run(p,w,h)
    print('KAIKKI OK' if not bad else 'VIRHEITÄ: '+', '.join(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
