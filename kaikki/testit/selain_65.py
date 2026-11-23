"""Kaikki 0.65 (Emil 23.11.2026): tekstimuuttujat !!nimi: arvo!! muistiinpanossa.
Tarkistaa testivaultilla:
- Tunnistus näkyy: lukutilassa !! piilossa, arvo lihavoituna (erottuu ilman väriä), kevyt pohja; muokatessa korostuskerroksen teksti on
  täsmälleen sama kuin tekstikentässä (kursori ei karkaa) ja !! näkyy haaleana.
- Merkinnän päivä ei tee kalenterin ajankohtaa eikä aikalinkkiä; osion tavallisen tekstin päivä toimii kuten ennen.
- Lukutilassa napsautus/napautus merkintään avaa infoikkunan: nimi, arvo, päivä ja lähde (osion tekstistä / merkinnästä) tai päivätön ja syy.
- Muokatessa infoikkuna ei avaudu.
- Infoikkunasta ja Valikosta avautuva Muuttujat-luettelo: nimet aakkosjärjestyksessä, kirjainkoko yhdistyy, merkinnät, keskiarvo,
  päivättömät viimeisinä; rivistä avautuu lähdemuistiinpano.
Leveydet 1440, 1280, 390 ja 320 (390 myös kosketuksella). Käyttö: python3 testit/selain_65.py"""
import asyncio, os, json
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
FAKE=open(os.path.join(D,'fakegh.js'),encoding='utf8').read()
def md(slug,title,body,luotu='2026-11-23'):
    return 'inbox/%s.md'%slug,'---\ntyyppi: inbox\notsikko: %s\nkuvaus: \nluotu: %s\nlahde: emil\n---\n# %s\n\n%s\n'%(title,luotu,title,body)
SEED=dict([
  md('uniseuranta','Uniseuranta','La 21.11.2026 nukuin hyvin !!Uni (h): 8!!\n---\nEdellinen yö !!20.11.: Uni (h): 6,5!! ja !!Mieliala: hyvä!! ennen palaveria ma 30.11. klo 10.\n---\nIlman päivää !!Fiilis: ok!!'),
  md('toinen','Toinen muistiinpano','Kirjaus !!uni (h): 7!! tänään.'),
  md('koodi','Koodiesimerkki','Esimerkki `!!Uni (h): 99!!` ei ole kirjaus.'),
])
INIT=FAKE+";(function(){var S=%s;if(!window.__repo.kept)for(var k in S)window.__repo.put(k,S[k]);try{localStorage.setItem('kaikki:gh',JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));localStorage.setItem('kaikki:nmode','cards');}catch(e){}})();"%json.dumps(SEED)
POS="(function(i,c){var m=document.querySelectorAll('#ns-hl .mvr')[i];if(!m)return null;var x=c?m.querySelector(c):m;var r=x.getClientRects()[0];return {x:r.left+r.width/2,y:r.top+r.height/2};})"
TM="(function(){var b=document.getElementById('ns-tm');return {open:!b.hidden,t:b.innerText};})()"
async def launch(p):
    try: return await p.chromium.launch()
    except Exception: return await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
async def run(p,w,h,touch=False):
    b=await launch(p); bad=[]; errs=[]
    ctx=await b.new_context(viewport={'width':w,'height':h},has_touch=touch,is_mobile=touch)
    pg=await ctx.new_page(); await pg.add_init_script(INIT)
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond,info=''):
        print('  %-66s %s %s'%(label,'ok' if cond else 'VIRHE',info if not cond else ''))
        if not cond: bad.append(label)
    async def tap(pos):
        if touch: await pg.touchscreen.tap(pos['x'],pos['y'])
        else: await pg.mouse.click(pos['x'],pos['y'])
        await pg.wait_for_timeout(350)
    print('leveys',w,'kosketus' if touch else '')
    await pg.goto(U); await pg.wait_for_timeout(3500)
    async def avaa(nimi,haku):
        await pg.fill('input[type=search]',haku); await pg.wait_for_timeout(500)
        loc=pg.locator('#main >> text=/%s/i >> visible=true'%haku.split()[0]).first
        if touch: await loc.tap()
        else: await loc.click()
        await pg.wait_for_timeout(600)
        return await pg.evaluate("document.getElementById('nsheet').open&&document.getElementById('ns-text').readOnly")
    want('muistiinpano avautuu lukutilaan',await avaa('Uniseuranta','nukuin hyvin'))
    st=await pg.evaluate("""(function(){var M=document.querySelectorAll('#ns-hl .mvr'),m=M[0];if(!m)return {n:0};var cs=getComputedStyle(m.querySelector('.mvm')),cv=getComputedStyle(m.querySelector('.mvv'));
      return {n:M.length,mvm:cs.display,fw:cv.fontWeight,bg:getComputedStyle(m).backgroundColor,txt:Array.prototype.map.call(M,function(x){return x.innerText;})};})()""")
    want('neljä merkintää tunnistettu',st['n']==4,st)
    want('lukutilassa !! piilossa ja arvo lihavoitu',st.get('mvm')=='none' and int(st.get('fw','400'))>=600,st)
    want('lukutilassa näkyy nimi: arvo',st.get('txt',[''])[0].replace('\n','')=='Uni (h): 8',st.get('txt'))
    want('kevyt pohja (ei läpinäkyvä)',st.get('bg') not in (None,'rgba(0, 0, 0, 0)'),st.get('bg'))
    cal=await pg.evaluate("""(function(){var N={text:document.getElementById('ns-text').value,created:'2026-11-23T12:00:00'};return {ds:noteDates(N).map(function(o){return o.a;}),marks:document.querySelectorAll('#ns-hl .mvr mark').length,mk:document.querySelectorAll('#ns-hl mark').length};})()""")
    want('merkinnän päivä 20.11. ei ole kalenterin ajankohta',all(d!='2026-11-20' for d in cal['ds']) and '2026-11-30' in cal['ds'],cal)
    want('merkinnän sisällä ei aikalinkkejä, tavallinen päivä on linkki',cal['marks']==0 and cal['mk']>=1,cal)
    await tap(await pg.evaluate(POS+"(0,'.mvv')"))
    tm=await pg.evaluate(TM)
    want('infoikkuna: nimi, arvo ja osion päivä',tm['open'] and 'Uni (h)' in tm['t'] and 'Arvo: 8 (luku)' in tm['t'] and 'la 21.11.2026' in tm['t'] and 'osion tekstistä' in tm['t'],tm)
    want('napautus ei avaa muokkausta eikä näppäimistöä',await pg.evaluate("document.getElementById('ns-text').readOnly&&document.activeElement!==document.getElementById('ns-text')"))
    await pg.evaluate("document.getElementById('ns-tm').hidden=true")
    await tap(await pg.evaluate(POS+"(1,'.mvn')"))
    tm=await pg.evaluate(TM)
    want('infoikkuna: merkinnän oma päivä',tm['open'] and 'Arvo: 6,5 (luku)' in tm['t'] and 'pe 20.11.2026' in tm['t'] and 'merkinnästä' in tm['t'],tm)
    await pg.evaluate("document.getElementById('ns-tm').hidden=true")
    await tap(await pg.evaluate(POS+"(2,'.mvv')"))
    tm=await pg.evaluate(TM)
    want('infoikkuna: tekstiarvo ja osion päivä 30.11.',tm['open'] and 'Arvo: hyvä (teksti)' in tm['t'] and 'ma 30.11.2026' in tm['t'],tm)
    await pg.evaluate("document.getElementById('ns-tm').hidden=true")
    await tap(await pg.evaluate(POS+"(3,'.mvv')"))
    tm=await pg.evaluate(TM)
    want('infoikkuna: päivätön ja syy',tm['open'] and 'Päivätön: osiossa ei ole päivää.' in tm['t'],tm)
    await pg.evaluate("document.getElementById('ns-tm').hidden=true")
    # luettelo infoikkunasta
    await tap(await pg.evaluate(POS+"(0,'.mvv')"))
    await pg.click('#tm-mv') if not touch else await pg.tap('#tm-mv')
    await pg.wait_for_timeout(400)
    ls=await pg.evaluate("""(function(){var d=document.getElementById('mv-sheet');if(!d||!d.open)return null;return {h:d.querySelector('h2').textContent,rows:Array.prototype.map.call(d.querySelectorAll('#mv-obs .mvrow'),function(b){return b.innerText.replace(/\\n/g,' | ');}),sum:d.querySelector('.mvsum').textContent,w:d.scrollWidth<=d.clientWidth+1};})()""")
    want('luettelo: Uni (h), kolme merkintää eri muistiinpanoista',ls and ls['h']=='Uni (h)' and len(ls['rows'])==3,ls)
    want('luettelo: keskiarvo 7,17, pienin 6,5, suurin 8',ls and 'keskiarvo 7,17' in ls['sum'] and 'pienin 6,5' in ls['sum'] and 'suurin 8' in ls['sum'],ls)
    want('luettelo: uusin päivä ensin (tänään = luontipäivä), koodin esimerkki ei mukana',ls and ls['rows'][0].startswith('7 | ma 23.11.2026') and ls['rows'][2].startswith('6,5') and all('99' not in r for r in ls['rows']),ls)
    want('luettelo ei vieri sivuttain',ls and ls['w'],ls)
    # rivistä toiseen muistiinpanoon
    row=pg.locator('#mv-obs .mvrow',has_text='Toinen muistiinpano').first
    if touch: await row.tap()
    else: await row.click()
    await pg.wait_for_timeout(600)
    want('rivi avaa lähdemuistiinpanon',await pg.evaluate("document.getElementById('nsheet').open&&/uni \\(h\\): 7/.test(document.getElementById('ns-text').value)&&!document.getElementById('mv-sheet').open"))
    # muokkaustila: sama teksti kerroksessa, ei infoikkunaa
    box=await pg.locator('#ns-text').bounding_box()
    await tap({'x':box['x']+20,'y':box['y']+10})
    want('muokkaustila',await pg.evaluate("!document.getElementById('ns-text').readOnly"))
    same=await pg.evaluate("(function(){var t=document.getElementById('ns-text'),h=document.getElementById('ns-hl');return h.textContent.replace(/\\u200b/g,'')===t.value&&getComputedStyle(h.querySelector('.mvr .mvm')).display!=='none';})()")
    want('muokatessa korostuskerros = tekstikenttä, !! näkyvissä',same)
    al=await pg.evaluate("""(function(){var t=document.getElementById('ns-text'),m=document.querySelector('#ns-hl .mvr .mvv');var i=t.value.indexOf('7!!');
      var c=document.createElement('div'),cs=getComputedStyle(t);['fontFamily','fontSize','lineHeight','letterSpacing','padding','border','boxSizing','whiteSpace','wordWrap','overflowWrap','width','tabSize'].forEach(function(k){c.style[k]=cs[k];});
      c.style.position='absolute';c.style.visibility='hidden';c.style.top='0';c.style.left='0';document.body.appendChild(c);c.textContent=t.value.slice(0,i);var s=document.createElement('span');s.textContent='7';c.appendChild(s);
      var r1=s.getBoundingClientRect(),r0=c.getBoundingClientRect(),r2=m.getBoundingClientRect(),h0=document.getElementById('ns-hl').getBoundingClientRect();c.remove();
      return {dx:Math.abs((r1.left-r0.left)-(r2.left-h0.left)),dy:Math.abs((r1.top-r0.top)-(r2.top-h0.top))};})()""")
    want('muokatessa arvo on samassa kohdassa kuin tekstikentässä (≤1 px)',al['dx']<=1 and al['dy']<=1,al)
    await tap(await pg.evaluate(POS+"(0,'.mvv')"))
    want('muokatessa napautus merkintään ei avaa infoikkunaa',not (await pg.evaluate(TM))['open'])
    want('kohdistus säilyy tekstikentässä',await pg.evaluate("document.activeElement===document.getElementById('ns-text')"))
    # sulje ja avaa luettelo Valikosta
    await pg.evaluate("document.getElementById('ns-ok').click()"); await pg.wait_for_timeout(500)
    await pg.evaluate("document.getElementById(innerWidth>=1000&&document.getElementById('deskmenu').offsetParent?'deskmenu':'menu').click()"); await pg.wait_for_timeout(300)
    if touch: await pg.tap('#m-mv')
    else: await pg.click('#m-mv')
    await pg.wait_for_timeout(400)
    L=await pg.evaluate("""(function(){var d=document.getElementById('mv-sheet');return d&&d.open?Array.prototype.map.call(d.querySelectorAll('#mv-list .mvrow'),function(b){return b.innerText.replace(/\\n/g,' | ');}):null;})()""")
    want('Valikko → Muuttujat: Fiilis, Mieliala, Uni (h) aakkosjärjestyksessä',L and [x.split(' | ')[0] for x in L]==['Fiilis','Mieliala','Uni (h)'],L)
    want('Uni (h): 3 merkintää, viimeisin 7 ma 23.11.2026',L and len(L)==3 and '3 merkintää' in L[2] and 'viimeisin 7 · ma 23.11.2026' in L[2],L)
    want('Fiilis: päivätön',L and 'päivätön' in L[0],L)
    wide=await pg.evaluate("document.documentElement.scrollWidth<=innerWidth+1")
    want('ei vaakavieritystä',wide)
    want('ei sivuvirheitä',not errs,errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h,t in ((1440,900,False),(1280,800,False),(390,844,False),(320,640,False),(390,844,True)):
            bad+=await run(p,w,h,t)
        dark=await run_dark(p)
        bad+=dark
    print('OK' if not bad else 'VIRHEITÄ: %d'%len(bad)); raise SystemExit(1 if bad else 0)
async def run_dark(p):
    b=await launch(p); bad=[]
    pg=await (await b.new_context(viewport={'width':390,'height':844},color_scheme='dark')).new_page(); await pg.add_init_script(INIT)
    await pg.goto(U); await pg.wait_for_timeout(3500)
    await pg.fill('input[type=search]','nukuin hyvin'); await pg.wait_for_timeout(500)
    await pg.locator('#main >> text=/nukuin/i >> visible=true').first.click(); await pg.wait_for_timeout(600)
    r=await pg.evaluate("""(function(){function rgb(s){var m=s.match(/[\\d.]+/g).map(Number);return m;}function lum(c){var a=c.slice(0,3).map(function(v){v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2];}
      var m=document.querySelector('#ns-hl .mvr .mvv'),d=document.getElementById('nsheet'),fg=rgb(getComputedStyle(m).color),bg=rgb(getComputedStyle(d).backgroundColor),tint=rgb(getComputedStyle(m.parentNode).backgroundColor);
      var a=tint[3]==null?1:tint[3],mix=[0,1,2].map(function(i){return tint[i]*a+bg[i]*(1-a);});var L1=lum(fg),L2=lum(mix);return (Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);})()""")
    print('tumma 390'); ok=r>=4.5; print('  %-66s %s %s'%('tumma: arvon kontrasti pohjaa vasten ≥ 4,5:1',('ok' if ok else 'VIRHE'),round(r,2)))
    if not ok: bad.append('tumma kontrasti')
    await b.close(); return bad
asyncio.run(main())
