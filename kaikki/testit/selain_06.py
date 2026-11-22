"""Kaikki 0.6 (Emil 22.11.2026): nopeus, tiivis kortti, kuittaus kalenterissa, ⋯-valikko, kuka kirjoitti -raita ja tekstikoko.
Tarkistaa leveyksillä 390 ja 320 px:
- Muistiossa ei Avoimet/Kuitatut-jakoa eikä kuittausympyrää; kortti on enintään 3 riviä ja sen teksti lyhennetty
- kuka kirjoitti: tekoälyn ja yhdessä kirjoitetun kortissa raita, omassa ei
- muistiinpanon alarivin napit ⋯-valikossa (alapalkissa), ulkopuolinen napautus sulkee valikon mutta ei ikkunaa, Poista kysyy varmistuksen
- päivä- ja aikarivi piilossa, kunnes valikosta Päivä ja aika
- kalenterin viikkolistassa kuittausympyrä: kuittaus ei poista eikä yliviivaa riviä, ja muistiinpanossa päivä näkyy kuitattuna (ei yliviivausta)
- päivämäärien jäsennys muistissa: sama tulos kuin ilman, eikä tuloksen muokkaus vuoda seuraavaan; kalenteri ei jäsennä uudelleen
- tekstikoko-asetus skaalaa korttien ja muistiinpanon tekstin, kenttä vähintään 16 px
Käyttö: python3 testit/selain_06.py"""
import asyncio, os, sys, json, datetime
T=datetime.date.today();TD='%d.%d.'%(T.day,T.month)
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from apu import tab
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
FAKE=open(os.path.join(D,'fakegh.js'),encoding='utf8').read()
def md(t,lahde,body): return '---\ntyyppi: tieto\notsikko: %s\nkuvaus: \nluotu: 2026-11-20\nlahde: %s\n---\n# %s\n\n%s\n'%(t,lahde,t,body)
PITKA=' '.join(['Pitkä kappale tekstiä, jonka ei kuulu näkyä kortissa kokonaan.']*40)
SEED={'tieto/tekoaly.md':md('Tekoälyn muistiinpano','claude','Koulutus '+TD+' klo 13-15.'),
      'tieto/yhdessa.md':md('Yhdessä kirjoitettu','emil+claude','Yhteinen pohdinta.'),
      'inbox/oma.md':md('Oma muistiinpano','emil','Rivi yksi\n\n\nRivi kaksi\nRivi kolme\nRivi neljä\n'+PITKA)}
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    ctx=await b.new_context(viewport={'width':w,'height':h})
    pg=await ctx.new_page()
    await pg.add_init_script(FAKE+";(function(){var S=%s;if(!window.__repo.kept)for(var k in S)window.__repo.put(k,S[k]);try{localStorage.setItem('kaikki:gh',JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}))}catch(e){}})();"%json.dumps(SEED))
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond,info=''):
        print('  %-52s %s %s'%(label,'ok' if cond else 'VIRHE',info if not cond else ''))
        if not cond: bad.append(label)
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(1800)
    await tab(pg,'notes'); await pg.wait_for_timeout(200)
    # Muistio: ei jakoa eikä ympyrää
    nv=await pg.evaluate("Array.from(document.querySelectorAll('#noteview button')).map(function(b){return b.dataset.nv;})")
    want('ei Avoimet/Kuitatut-jakoa',nv==['open','rep'],nv)
    want('korteissa ei kuittausympyrää',await pg.evaluate("document.querySelectorAll('#nlist .ncheck').length===0"))
    want('Arkisto ja Roskakori listan lopussa',await pg.evaluate("!!document.getElementById('nmore-arch')&&!!document.getElementById('nmore-trash')"))
    card=await pg.evaluate("""(function(){var c=Array.from(document.querySelectorAll('#nlist .ncard')).filter(function(c){return c.textContent.indexOf('Oma muistiinpano')>=0;})[0];if(!c)return null;
      var t=c.querySelector('.nt'),lh=parseFloat(getComputedStyle(t).lineHeight);return {len:t.textContent.length,h:t.getBoundingClientRect().height,lh:lh,cls:c.className,blank:/\\n\\s*\\n/.test(t.textContent),fw:getComputedStyle(t,'::first-line').fontWeight};})()""")
    want('oma kortti löytyy',card is not None)
    if card:
        want('kortin teksti lyhennetty',card['len']<=400,card['len'])
        want('kortti enintään 3 riviä',card['h']<=card['lh']*3+2,card)
        want('tyhjät rivit tiivistetty',not card['blank'])
        want('omassa ei raitaa',' src-' not in card['cls'],card['cls'])
    src=await pg.evaluate("""(function(){var o={};Array.from(document.querySelectorAll('#nlist .ncard')).forEach(function(c){if(c.textContent.indexOf('Tekoälyn muistiinpano')>=0)o.ai=c.className;if(c.textContent.indexOf('Yhdessä kirjoitettu')>=0)o.y=c.className;});return o;})()""")
    want('tekoälyn kortissa raita',' src-tekoaly' in (src.get('ai') or ''),src)
    want('yhdessä kirjoitetussa raita',' src-yhdessa' in (src.get('y') or ''),src)
    want('raita näkyy (::before)',await pg.evaluate("getComputedStyle(document.querySelector('#nlist .ncard.src-tekoaly'),'::before').width==='4px'"))
    # muistiinpanoikkuna ja ⋯-valikko
    await pg.evaluate("Array.from(document.querySelectorAll('#nlist .ncard')).filter(function(c){return c.textContent.indexOf('Oma muistiinpano')>=0;})[0].click()"); await pg.wait_for_timeout(300)
    want('alarivin napit piilossa',await pg.evaluate("getComputedStyle(document.getElementById('ns-delrow')).display==='none'"))
    want('päivärivi piilossa ilman päivää',await pg.evaluate("document.getElementById('ns-dtrow').offsetParent===null"))
    place=await pg.evaluate("(function(){var b=document.getElementById('ns-more');return {bar:!!b.closest('.dbar'),vis:b.getBoundingClientRect().width>0};})()")
    want('⋯ alapalkissa ja näkyvissä',place['bar'] and place['vis'],place)
    await pg.click('#ns-more'); await pg.wait_for_timeout(150)
    items=await pg.evaluate("Array.from(document.querySelectorAll('#ns-menu button')).map(function(b){return b.textContent;})")
    want('valikossa Päivä ja aika, Arkistoi, Poista',items==['Päivä ja aika','Arkistoi','Poista'],items)
    r=await pg.evaluate("(function(){var m=document.getElementById('ns-menu').getBoundingClientRect();return m.left>=0&&m.right<=innerWidth&&m.top>=0&&m.bottom<=innerHeight;})()")
    want('valikko ruudulla',r)
    await pg.mouse.click(w//2,140); await pg.wait_for_timeout(150)
    want('ulkopuolinen napautus sulkee valikon',await pg.evaluate("document.getElementById('ns-menu').hidden"))
    want('ikkuna jää auki',await pg.evaluate("document.getElementById('nsheet').open"))
    await pg.click('#ns-more'); await pg.click('#nsm-dt'); await pg.wait_for_timeout(100)
    want('Päivä ja aika näyttää rivin',await pg.evaluate("document.getElementById('ns-dtrow').offsetParent!==null"))
    await pg.mouse.click(w//2,h-200); await pg.wait_for_timeout(100)
    want('ulkopuolinen napautus sulkee ajankohtaikkunan',await pg.evaluate("document.getElementById('ns-datepop').hidden&&document.getElementById('nsheet').open"))
    await pg.click('#ns-more'); await pg.click('#nsm-del'); await pg.wait_for_timeout(100)
    want('Poista kysyy varmistuksen',await pg.evaluate("!document.getElementById('ns-delbox').hidden"))
    await pg.click('#ns-delno'); await pg.wait_for_timeout(100)
    want('Peruuta jättää muistiinpanon',await pg.evaluate("KaikkiTesti.notes().some(function(n){return n.vp==='inbox/oma.md';})"))
    want('tekstikenttä vähintään 16 px',await pg.evaluate("parseFloat(getComputedStyle(document.getElementById('ns-text')).fontSize)>=16"))
    await pg.click('#nsheet .sx'); await pg.wait_for_timeout(250)
    # kalenteri: kuittaus ympyrästä
    await tab(pg,'cal'); await pg.wait_for_timeout(300)
    if await pg.evaluate("document.querySelector('#calview [data-v=\"w\"]').getAttribute('aria-pressed')!=='true'"): await pg.click('#calview [data-v="w"]'); await pg.wait_for_timeout(200)
    sel="(function(){return Array.from(document.querySelectorAll('.wline')).filter(function(l){return l.textContent.indexOf('Tekoälyn muistiinpano')>=0;})[0];})()"
    has=await pg.evaluate("!!"+sel)
    want('tekoälyn merkintä viikkolistassa',has)
    if has:
        want('rivissä tekoälyn raita',await pg.evaluate(sel+".querySelector('.wrow').classList.contains('src-tekoaly')"))
        y0=await pg.evaluate(sel+".getBoundingClientRect().top")
        await pg.evaluate(sel+".querySelector('.wck').click()"); await pg.wait_for_timeout(200)
        st=await pg.evaluate("(function(){var l="+sel+";if(!l)return null;var r=l.querySelector('.wrow'),t=r.querySelector('.wtt');return {p:l.querySelector('.wck').getAttribute('aria-pressed'),done:r.classList.contains('done'),op:getComputedStyle(r).opacity,td:getComputedStyle(t).textDecorationLine,y:l.getBoundingClientRect().top};})()")
        want('kuittaus jättää rivin paikalleen',st is not None and abs(st['y']-y0)<1,st)
        if st:
            want('ympyrä vihreäksi (aria-pressed)',st['p']=='true' and st['done'],st)
            want('ei yliviivausta eikä himmennystä',st['td']=='none' and st['op']=='1',st)
        pts=await pg.evaluate("JSON.stringify(KaikkiTesti.notes().filter(function(n){return n.vp==='tieto/tekoaly.md';})[0].pts||{})")
        want('kuittaus tallentui päivälle (pts)',pts!='{}',pts)
        # muistiinpanossa päivä kuitattuna
        await pg.evaluate(sel+".querySelector('.wrow').click()"); await pg.wait_for_timeout(150)
        await pg.click('#wk-open'); await pg.wait_for_timeout(300)
        dn=await pg.evaluate("(function(){var d=document.querySelector('#ns-hl .dn');return d?getComputedStyle(d).textDecorationLine:null;})()")
        want('muistiinpanossa kuitattu päivä merkitty, ei yliviivausta',dn=='none',dn)
        want('Ajankohdat-kohdassa vihreä väkänen, ei nappia',await pg.evaluate("!!document.querySelector('#ns-found .dckv.on .okm')&&!document.querySelector('#ns-found button.dck')"))
        await pg.click('#ns-more'); await pg.wait_for_timeout(100)
        items=await pg.evaluate("Array.from(document.querySelectorAll('#ns-menu button')).map(function(b){return b.textContent;})")
        want('kalenterista avatussa valikossa Kumoa kuittaus',items[:1]==['Kumoa kuittaus'],items)
        await pg.click('#nsm-ok'); await pg.wait_for_timeout(100)
        pts=await pg.evaluate("JSON.stringify(KaikkiTesti.notes().filter(function(n){return n.vp==='tieto/tekoaly.md';})[0].pts||{})")
        want('Kumoa kuittaus poistaa kuittauksen',pts=='{}',pts)
        await pg.click('#nsheet .sx'); await pg.wait_for_timeout(250)
    # jäsennyksen muisti
    r=await pg.evaluate("""(function(){var b=new Date(2026,10,20,9,0),t='Palaveri ti 24.11. klo 10-11 ja pe klo 14';var a=JSON.stringify(parseDates0(t,b)),c1=parseDates(t,b);c1[0].R[0]='x';c1[0].muokattu=1;
      var c2=parseDates(t,b);return {same:JSON.stringify(c2)===a,n:c2.length};})()""")
    want('muistettu jäsennys = uusi jäsennys, muokkaus ei vuoda',r['same'] and r['n']>=2,r)
    n0=await pg.evaluate("(function(){var o=window.parseDates0,c=0;window.parseDates0=function(){c++;return o.apply(this,arguments);};KaikkiTesti.render();KaikkiTesti.render();window.parseDates0=o;return c;})()")
    want('toistuva piirto ei jäsennä tekstejä uudelleen',n0==0,n0)
    # tekstikoko
    await pg.evaluate("KaikkiTesti.tz('1.3')"); await tab(pg,'notes'); await pg.wait_for_timeout(200)
    fs=await pg.evaluate("[getComputedStyle(document.documentElement).getPropertyValue('--tz').trim(),parseFloat(getComputedStyle(document.querySelector('#nlist .ncard .nt')).fontSize)]")
    want('tekstikoko Isompi skaalaa kortin tekstin',fs[0]=='1.3' and abs(fs[1]-15.5*1.3)<0.2,fs)
    await pg.evaluate("KaikkiTesti.tz('0.9')")
    await pg.evaluate("Array.from(document.querySelectorAll('#nlist .ncard'))[0].click()"); await pg.wait_for_timeout(250)
    want('pienellä koolla kenttä silti 16 px',await pg.evaluate("parseFloat(getComputedStyle(document.getElementById('ns-text')).fontSize)>=16"))
    await pg.click('#nsheet .sx'); await pg.wait_for_timeout(200)
    await pg.evaluate("KaikkiTesti.tz(null)")
    want('Laitteen mukaan: tietokoneella kerroin 1',await pg.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--tz').trim()==='1'"))
    want('ei sivuttaisvieritystä',await pg.evaluate("document.documentElement.scrollWidth<=innerWidth"))
    want('ei sivuvirheitä',not errs,errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640)): bad+=await run(p,w,h)
    print('KAIKKI OK' if not bad else 'VIRHEITÄ: '+', '.join(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
