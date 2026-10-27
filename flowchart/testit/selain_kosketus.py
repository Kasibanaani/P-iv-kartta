"""Kosketuspolku puhelinleveyksillä 390 ja 320 px (tietokoneen Chromium, kosketus CDP:llä):
uusi palikka, kuittaus, jälkeen/edelle, valinnan purku, tyhjä poistuu, pitkä painallus, veto, kartan paluu, tallennus."""
import asyncio, os, sys, pathlib
from playwright.async_api import async_playwright
URL=pathlib.Path(__file__).resolve().parent.parent.joinpath('index.html').as_uri()
OUT=os.environ.get('FC_KUVAT')
virheet=[]
def ok(c,m):
    if not c: virheet.append(m); print('  VIRHE:',m)
async def touch(cdp,typ,pts):
    await cdp.send('Input.dispatchTouchEvent',{'type':typ,'touchPoints':[{'x':x,'y':y} for x,y in pts]})
async def tap(pg,cdp,x,y,hold=40):
    await touch(cdp,'touchStart',[(x,y)]); await pg.wait_for_timeout(hold); await touch(cdp,'touchEnd',[]); await pg.wait_for_timeout(80)
async def drag(pg,cdp,x,y,dx,dy,steps=8,before=None):
    await touch(cdp,'touchStart',[(x,y)])
    for i in range(1,steps+1):
        await touch(cdp,'touchMove',[(x+dx*i/steps,y+dy*i/steps)]); await pg.wait_for_timeout(16)
    r=await before() if before else None
    await touch(cdp,'touchEnd',[]); await pg.wait_for_timeout(400)
    return r
async def st(pg): return await pg.evaluate("({n:FCUI.P.n.map(o=>({id:o.id,t:o.t,x:o.x,y:o.y})),l:FCUI.P.l.slice(),sel:FCUI.sel,edit:FCUI.edit,act:document.activeElement.tagName})")
async def emptyspot(pg,side):
    await pg.wait_for_timeout(320)
    return await pg.evaluate("""side=>{const W=innerWidth,H=innerHeight;
      for(let y=H-60;y>80;y-=23)for(let k=0;k<6;k++){const x=side<0?20+k*12:(side>0?W-20-k*12:W/2+(k-3)*30);
        const e=document.elementFromPoint(x,y);if(e&&(e.id==='stage'||e.id==='world'||e.id==='lines')&&!document.querySelector('.side:not([hidden])')?.contains(e))return [x,y]}
      return null}""",side)
async def center(pg,id,fx=0):
    await pg.wait_for_timeout(320)
    return await pg.evaluate("id=>{const r=document.querySelector('.node[data-id=\"'+id+'\"]').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2,r.width]}",id)
async def overlaps(pg):
    return await pg.evaluate("""()=>{const r=[...document.querySelectorAll('.node')].map(e=>e.getBoundingClientRect());let c=0;
      for(let i=0;i<r.length;i++)for(let j=i+1;j<r.length;j++){const a=r[i],b=r[j];if(a.left<b.right&&b.left<a.right&&a.top<b.bottom&&b.top<a.bottom)c++}return c}""")
async def run(w):
    async with async_playwright() as p:
        b=await p.chromium.launch()
        ctx=await b.new_context(viewport={'width':w,'height':844 if w==390 else 640},has_touch=True,is_mobile=True,device_scale_factor=2)
        pg=await ctx.new_page(); errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(URL); cdp=await ctx.new_cdp_session(pg)
        ok(await pg.is_visible('#empty'),f'{w}: tyhjän kartan vihje')
        # 1 uusi palikka tyhjään
        await tap(pg,cdp,w/2,300); s=await st(pg)
        ok(len(s['n'])==1 and s['edit'] and s['act']=='TEXTAREA',f'{w}: napautus tyhjään avaa uuden palikan kursori valmiina {s}')
        await pg.keyboard.insert_text('Alku')
        x,y=await emptyspot(pg,0); await tap(pg,cdp,x,y); s=await st(pg)
        a=s['n'][0]['id']
        ok(s['edit'] is None and s['n'][0]['t']=='Alku' and s['sel']==a,f'{w}: kuittaus ulos napauttamalla, palikka jää valituksi {s}')
        ok(await pg.is_visible('#hintR') and await pg.is_visible('#hintL'),f'{w}: edelle/jälkeen-vihjeet näkyvät')
        # 2 jälkeen
        x,y=await emptyspot(pg,1); await tap(pg,cdp,x,y); s=await st(pg)
        bnew=s['edit']; ok(len(s['n'])==2 and {'a':a,'b':bnew} in s['l'] and s['act']=='TEXTAREA',f'{w}: oikea puoli = uusi jälkeen viivalla {s}')
        await pg.keyboard.insert_text('Toinen vaihe pidemmällä tekstillä')
        x,y=await emptyspot(pg,0); await tap(pg,cdp,x,y); s=await st(pg)
        na={o['id']:o for o in s['n']}
        ok(s['sel']==bnew and na[bnew]['x']>na[a]['x'] and abs(na[bnew]['y']-na[a]['y'])<1,f'{w}: jälkeen = oikealle samalle riville {s}')
        # 3 edelle (paikka vasemmalla on Alku → siirtyy pystyyn)
        x,y=await emptyspot(pg,-1); await tap(pg,cdp,x,y); s=await st(pg)
        c=s['edit']; ok({'a':c,'b':bnew} in s['l'],f'{w}: vasen puoli = uusi edelle viivalla {s}')
        await pg.keyboard.insert_text('Haara')
        x,y=await emptyspot(pg,0); await tap(pg,cdp,x,y)
        ok(await overlaps(pg)==0,f'{w}: palikat eivät mene päällekkäin')
        # 4 valinnan purku ja tyhjä palikka poistuu
        s=await st(pg); cx,cy,_=await center(pg,s['sel']); await tap(pg,cdp,cx,cy); s=await st(pg)
        ok(s['sel'] is None and await pg.is_hidden('#hintR'),f'{w}: napautus valittuun purkaa valinnan')
        x,y=await emptyspot(pg,0); await tap(pg,cdp,x,y); s=await st(pg); ok(len(s['n'])==4 and s['edit'],f'{w}: vapaa uusi')
        x,y=await emptyspot(pg,1); await tap(pg,cdp,x,y); s=await st(pg); ok(len(s['n'])==3 and s['edit'] is None,f'{w}: tyhjäksi jätetty poistuu {s}')
        # 5 napautus palikkaan valitsee, pitkä painallus muokkaa
        cx,cy,_=await center(pg,a); await tap(pg,cdp,cx,cy); s=await st(pg); ok(s['sel']==a and not s['edit'],f'{w}: napautus valitsee, ei muokkausta')
        await tap(pg,cdp,cx,cy); await tap(pg,cdp,cx,cy,hold=650); s=await st(pg)
        ok(s['edit']==a and s['act']=='TEXTAREA' and await pg.input_value('.node.edit textarea')=='Alku',f'{w}: pitkä painallus avaa muokkauksen {s}')
        await pg.keyboard.press('End'); await pg.keyboard.insert_text('!')
        x,y=await emptyspot(pg,0); await tap(pg,cdp,x,y); s=await st(pg)
        ok([o['t'] for o in s['n'] if o['id']==a]==['Alku!'],f'{w}: muokkaus tallentui')
        # 6 vapaa palikka: veto ilman kohdetta ei yhdistä, magneetti/ruudukko, ei päällekkäin
        cx,cy,_=await center(pg,a); await tap(pg,cdp,cx,cy)
        x,y=await emptyspot(pg,0); await tap(pg,cdp,x,y); await pg.keyboard.insert_text('Vapaa')
        s=await st(pg); v=s['edit']; x2,y2=await emptyspot(pg,1); await tap(pg,cdp,x2,y2)
        cx,cy,_=await center(pg,v); await tap(pg,cdp,cx,cy); s=await st(pg); ok(s['sel'] is None,f'{w}: valinta pois')
        await drag(pg,cdp,cx,cy,6,-50); s=await st(pg); V={o['id']:o for o in s['n']}[v]
        ok(len(s['l'])==2 and await overlaps(pg)==0,f'{w}: veto tyhjään ei yhdistä {s}')
        ok(V['y']%8==0 or any(o['y']==V['y'] for o in s['n'] if o['id']!=v),f'{w}: magneetti tai ruudukko {V}')
        # 6b pudotus toisen päälle: oikea puoli = jälkeen, vihje ennen irtipäästöä, palikka luiskahtaa pois
        tid=bnew; tx,ty,tw=await center(pg,tid); cx,cy,_=await center(pg,v)
        pill=await drag(pg,cdp,cx,cy,tx+tw/4-cx,ty-cy,10,before=lambda: pg.evaluate("[document.getElementById('drop').hidden,document.getElementById('drop').textContent]"))
        ok(pill and not pill[0] and 'Jälkeen' in pill[1],f'{w}: vihje ennen pudotusta {pill}')
        s=await st(pg); ok({'a':tid,'b':v} in s['l'] and await overlaps(pg)==0,f'{w}: pudotus oikealle = jälkeen, ei jää päälle {s}')
        ok(await pg.is_hidden('#drop'),f'{w}: vihje pois pudotuksen jälkeen')
        # 6c vasen puoli = ennen: Haara ennen Vapaata
        hx,hy,hw=await center(pg,c); cx,cy,_=await center(pg,v)
        pill=await drag(pg,cdp,cx,cy,hx-hw/4-cx,hy-cy,10,before=lambda: pg.evaluate("document.getElementById('drop').textContent"))
        s=await st(pg); ok('Ennen' in (pill or '') and {'a':v,'b':c} in s['l'] and await overlaps(pg)==0,f'{w}: pudotus vasemmalle = ennen {pill} {s}')
        # 6d sama yhteys uudelleen = irrota
        tx,ty,tw=await center(pg,tid); cx,cy,_=await center(pg,v)
        pill=await drag(pg,cdp,cx,cy,tx+tw/4-cx,ty-cy,10,before=lambda: pg.evaluate("document.getElementById('drop').textContent"))
        s=await st(pg); ok('Irrota' in (pill or '') and {'a':tid,'b':v} not in s['l'] and await overlaps(pg)==0,f'{w}: irrotus {pill} {s}')
        nl=len(s['l'])
        # 7 kartta ei huku
        x,y=await emptyspot(pg,0); await drag(pg,cdp,x,y,-1500,-1500,10)
        vis=await pg.evaluate("[...document.querySelectorAll('.node')].some(e=>{const r=e.getBoundingClientRect();return r.right>0&&r.left<innerWidth&&r.bottom>0&&r.top<innerHeight})")
        ok(vis,f'{w}: rajaton kanvas palaa karttaan vedon jälkeen')
        ok(await overlaps(pg)==0,f'{w}: ei päällekkäisyyksiä lopussa')
        if OUT: await pg.screenshot(path=f'{OUT}/fc_{w}.png')
        # 8 tallennus
        await pg.reload(); s2=await st(pg)
        ok(len(s2['n'])==4 and len(s2['l'])==nl,f'{w}: kartta säilyy uudelleenlatauksessa {s2}')
        ok(not errs,f'{w}: sivun virheet {errs}')
        await b.close()
async def main():
    for w in (390,320): await run(w)
asyncio.run(main())
sys.exit(1 if virheet else 0)
