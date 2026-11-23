"""Kaikki 0.58 (Emil 23.11.2026): muistiinpanoikkuna ei pompi, kun kursori napsautetaan linkin kohdalle, eikä kirjoittaminen viivästy.
Tarkistaa testivaultilla:
- Muokkaustilassa napsautus aika- tai sanalinkkiin: valikko kelluu (position fixed) napsautuskohdan lähellä, ilman taustaa;
  tekstikentän, sen alla olevien tietojen ja ikkunan vierityksen paikka ei muutu; kursori jää napsautettuun kohtaan.
- Napsautus muualle tekstiin tai ikkunan ulkopuolelle sulkee valikon; kirjoittaminen sulkee sen.
- Lukutilassa linkin napautus avaa saman kelluvan valikon (ei asettelun muutosta).
- Kirjoitus: tekstin alla olevat tiedot (Ajankohdat) päivittyvät tauon jälkeen; heti painettu tallennus käyttää uusinta tekstiä.
- Nopeus: 300 muistiinpanon vaultissa ja 4x hidastetulla suorittimella näppäilyn käsittelyn mediaani alle 30 ms (ennen noin 40 ms;
  pitkässä muistiinpanossa ennen noin 240 ms, nyt noin 65 ms).
- Puhelin (kosketus): muokatessa linkin napautus vie kursorin, näppäimistö (kohdistus) säilyy eikä taustaa tule.
Leveydet 390, 320, 1440 ja 1280. Käyttö: python3 testit/selain_58.py"""
import asyncio, os, sys, json, random
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
FAKE=open(os.path.join(D,'fakegh.js'),encoding='utf8').read()
random.seed(3)
W='aamu ilta kokous projekti remontti keittiö lapset ryhmä taito tunne lista ostokset juna matka kirja elokuva kahvila sauna metsä järvi'.split()
def body(n): return ' '.join(random.choice(W) for _ in range(n))
SEED={}
for i in range(300):
    t='Muistiinpano %d'%i
    SEED['inbox/m%03d.md'%i]='---\ntyyppi: inbox\notsikko: %s\nkuvaus: \nluotu: 2026-11-20\nlahde: emil\n---\n# %s\n\n%s\n\nma 30.11. klo 10 %s.\n'%(t,t,body(80),body(4))
TXT='# Linkkitesti\n\n'+'\n'.join(body(12) for _ in range(6))+'\nTapaaminen ma 30.11. klo 10 keittiö remontti asia.\n'+'\n'.join(body(12) for _ in range(8))+'\n'
SEED['inbox/linkkitesti.md']='---\ntyyppi: inbox\notsikko: Linkkitesti\nkuvaus: \nluotu: 2026-11-20\nlahde: emil\n---\n'+TXT
GEOM="""(function(){var t=document.getElementById('ns-text'),f=document.getElementById('ns-found'),s=t.closest('dialog')||document.getElementById('nsheet'),sc=[];
  var x=t;while(x){if(x.scrollHeight>x.clientHeight+2)sc.push(x.scrollTop);x=x.parentElement;}
  return {t:Math.round(t.getBoundingClientRect().top),h:Math.round(t.getBoundingClientRect().height),f:f?Math.round(f.getBoundingClientRect().top):0,sc:sc,doc:document.scrollingElement.scrollTop};})()"""
async def touchcheck(p):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    bad=[]
    pg=await (await b.new_context(viewport={'width':390,'height':844},has_touch=True,is_mobile=True)).new_page()
    await pg.add_init_script(FAKE+";(function(){var S=%s;if(!window.__repo.kept)for(var k in S)window.__repo.put(k,S[k]);try{localStorage.setItem('kaikki:gh',JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));localStorage.setItem('kaikki:nmode','cards');}catch(e){}})();"%json.dumps(SEED))
    def want(label,cond,info=''):
        print('  %-62s %s %s'%(label,'ok' if cond else 'VIRHE',info if not cond else ''))
        if not cond: bad.append(label)
    print('kosketus 390')
    await pg.goto(U); await pg.wait_for_timeout(3500)
    await pg.fill('input[type=search]','Linkkitesti'); await pg.wait_for_timeout(500)
    await pg.locator('#main >> text=Linkkitesti').first.tap(); await pg.wait_for_timeout(600)
    box=await pg.locator('#ns-text').bounding_box()
    await pg.touchscreen.tap(box['x']+30,box['y']+12); await pg.wait_for_timeout(400)
    want('muokkaustila kosketuksella',await pg.evaluate("!document.getElementById('ns-text').readOnly&&document.activeElement===document.getElementById('ns-text')"))
    pos=await pg.evaluate("(function(){var m=document.querySelector('#ns-hl mark');var r=m.getClientRects()[0];return {x:r.left+r.width/2,y:r.top+r.height/2};})()")
    await pg.touchscreen.tap(pos['x'],pos['y']); await pg.wait_for_timeout(400)
    st=await pg.evaluate("(function(){var t=document.getElementById('ns-text'),b=document.getElementById('ns-tm');return {focus:document.activeElement===t,sel:t.selectionStart,bg:!document.getElementById('ns-tmbg').hidden,open:!b.hidden,float:b.classList.contains('float')};})()")
    idx=TXT.index('ma 30.11.')
    want('linkin napautus muokatessa: kohdistus säilyy, kursori linkkiin',st['focus'] and idx<=st['sel']<=idx+16,st)
    want('kelluva valikko ilman taustaa',st['open'] and st['float'] and not st['bg'],st)
    await b.close(); return bad
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h})).new_page()
    await pg.add_init_script(FAKE+";(function(){var S=%s;if(!window.__repo.kept)for(var k in S)window.__repo.put(k,S[k]);try{localStorage.setItem('kaikki:gh',JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));localStorage.setItem('kaikki:nmode','cards');}catch(e){}})();"%json.dumps(SEED))
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond,info=''):
        print('  %-62s %s %s'%(label,'ok' if cond else 'VIRHE',info if not cond else ''))
        if not cond: bad.append(label)
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(3500)
    async def avaa():
        await pg.fill('input[type=search]','Linkkitesti'); await pg.wait_for_timeout(500)
        await pg.locator('#main >> text=Linkkitesti').first.click(); await pg.wait_for_timeout(600)
        return await pg.evaluate("document.getElementById('nsheet').open")
    want('muistiinpano avautuu',await avaa())
    # muokkaustilaan: napsautus tavalliseen kohtaan tekstin alussa
    box=await pg.locator('#ns-text').bounding_box()
    await pg.mouse.click(box['x']+30,box['y']+12); await pg.wait_for_timeout(300)
    want('muokkaustila',await pg.evaluate("!document.getElementById('ns-text').readOnly"))
    # aikalinkin sijainti korostuskerroksesta
    pos=await pg.evaluate("(function(){var m=document.querySelector('#ns-hl mark');if(!m)return null;var r=m.getClientRects()[0];return {x:r.left+r.width/2,y:r.top+r.height/2};})()")
    want('aikalinkki korostettu',pos is not None)
    g0=await pg.evaluate(GEOM)
    await pg.mouse.click(pos['x'],pos['y']); await pg.wait_for_timeout(350)
    g1=await pg.evaluate(GEOM)
    tm=await pg.evaluate("(function(){var b=document.getElementById('ns-tm');var r=b.getBoundingClientRect();return {hidden:b.hidden,pos:getComputedStyle(b).position,float:b.classList.contains('float'),bg:!document.getElementById('ns-tmbg').hidden,top:r.top,bottom:r.bottom};})()")
    want('aikalinkin valikko auki ja kelluu',not tm['hidden'] and tm['pos']=='fixed' and tm['float'],tm)
    want('ei taustaa muokatessa',not tm['bg'],tm)
    want('valikko napsautuskohdan lähellä',tm['top']>pos['y'] and tm['top']-pos['y']<60 or tm['bottom']<pos['y'],(tm,pos))
    want('ikkuna ei pompi (teksti, tiedot, vieritys)',g0==g1,(g0,g1))
    sel=await pg.evaluate("document.getElementById('ns-text').selectionStart"); idx=TXT.index('ma 30.11.')
    want('kursori jäi linkin kohdalle',idx<=sel<=idx+len('ma 30.11. klo 10'),(sel,idx))
    # napsautus muualle tekstiin sulkee
    await pg.mouse.click(box['x']+30,box['y']+12); await pg.wait_for_timeout(300)
    want('napsautus muualle tekstiin sulkee',await pg.evaluate("document.getElementById('ns-tm').hidden"))
    want('ei pomppua sulkeutuessa',await pg.evaluate(GEOM)==g0,(g0,await pg.evaluate(GEOM)))
    # uudelleen auki ja kirjoitus sulkee
    await pg.mouse.click(pos['x'],pos['y']); await pg.wait_for_timeout(300)
    await pg.keyboard.type('x'); await pg.wait_for_timeout(100)
    want('kirjoitus sulkee valikon',await pg.evaluate("document.getElementById('ns-tm').hidden"))
    await pg.keyboard.press('Backspace')
    # Ajankohdat päivittyvät tauon jälkeen
    await pg.evaluate("(function(){var t=document.getElementById('ns-text');t.focus();t.setSelectionRange(t.value.length,t.value.length);})()")
    n0=await pg.evaluate("document.querySelectorAll('#ns-dlist .drow').length")
    await pg.keyboard.type('Uusi ti 1.12. klo 9 '); await pg.wait_for_timeout(700)
    n1=await pg.evaluate("document.querySelectorAll('#ns-dlist .drow').length")
    want('Ajankohdat päivittyvät tauon jälkeen',n1==n0+1,(n0,n1))
    # nopeus
    cdp=await pg.context.new_cdp_session(pg)
    await pg.evaluate("window.__lat=[];window.addEventListener('keydown',function(){window.__t0=performance.now();},true);document.addEventListener('input',function(){if(window.__t0!=null)window.__lat.push(performance.now()-window.__t0);window.__t0=null;});")
    await cdp.send('Emulation.setCPUThrottlingRate',{'rate':4})
    for ch in 'kirjoitan nopeasti uutta tekstia tahan ':
        await pg.keyboard.type(ch); await pg.wait_for_timeout(40)
    await cdp.send('Emulation.setCPUThrottlingRate',{'rate':1})
    lat=sorted(await pg.evaluate("window.__lat")); med=lat[len(lat)//2] if lat else 999
    want('näppäily 4x hidastuksella: mediaani alle 30 ms (ennen noin 40)',med<30,'%.0f ms'%med)
    print('    (mediaani %.0f ms, hitain %.0f ms)'%(med,lat[-1] if lat else 0))
    # heti painettu tallennus
    await pg.keyboard.type('LOPPU'); await pg.evaluate("document.getElementById('ns-ok').click()"); await pg.wait_for_timeout(300)
    await avaa(); t=await pg.evaluate("document.getElementById('ns-text').value")
    want('heti painettu tallennus sisältää uusimman tekstin',t.rstrip().endswith('LOPPU'),t[-60:])
    # lukutila: linkin napautus kelluva valikko
    if await pg.evaluate("document.getElementById('ns-text').readOnly"):
        pos=await pg.evaluate("(function(){var m=document.querySelector('#ns-hl mark');var r=m.getClientRects()[0];return {x:r.left+r.width/2,y:r.top+r.height/2};})()")
        g0=await pg.evaluate(GEOM); await pg.mouse.click(pos['x'],pos['y']); await pg.wait_for_timeout(350)
        want('lukutilassa linkki avaa kelluvan valikon ilman pomppua',await pg.evaluate("!document.getElementById('ns-tm').hidden&&getComputedStyle(document.getElementById('ns-tm')).position==='fixed'") and await pg.evaluate(GEOM)==g0)
        await pg.mouse.click(3,3); await pg.wait_for_timeout(200)
    want('ei sivuttaisvieritystä',await pg.evaluate("document.documentElement.scrollWidth<=innerWidth"))
    want('ei sivuvirheitä',not errs,errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640),(1440,900),(1280,800)): bad+=await run(p,w,h)
        bad+=await touchcheck(p)
    print('KAIKKI OK' if not bad else 'VIRHEITÄ: '+', '.join(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
