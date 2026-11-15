"""Päiväkartan selaintesti (2.0): appi aukeaa, asian voi lisätä paikan päällä ja valita, ennuste ja nousu/lasku-merkki
näkyvät, napautus ei siirrä nappeja, pitkä painallus avaa asian ikkunan, ulkopuolinen napautus sulkee eikä mene läpi,
kalenteri vaihtaa päivän, alapalkin napit pysyvät paikallaan, raahaus järjestää, muokkaus tallentuu ilman nappia,
vanha tallennus luetaan, eikä mikään mene ruudun yli. Käyttö: python3 testit/selain_perus.py [polku index.html]"""
import asyncio, os, sys, json, datetime, random
from playwright.async_api import async_playwright
U='file://'+os.path.abspath(sys.argv[1] if len(sys.argv)>1 else os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
OVER="""(function(){var w=document.documentElement.clientWidth,out=[];
 document.querySelectorAll('input,textarea,select,button').forEach(function(e){var r=e.getBoundingClientRect();
  if(r.width&&r.height&&e.offsetParent!==null&&e.type!=='file'&&!e.closest('.kkg')&&(r.right>w+0.5||r.left<-0.5))out.push((e.id||e.dataset.act||e.tagName)+' '+Math.round(r.left)+'..'+Math.round(r.right));});
 return JSON.stringify({w:w,doc:document.documentElement.scrollWidth,yli:out});})()"""
POS="""Array.prototype.map.call(document.querySelectorAll('#app button,#bar button'),function(b){var r=b.getBoundingClientRect();return [b.dataset.id||b.dataset.act||b.textContent.trim(),Math.round(r.top),Math.round(r.left),Math.round(r.height)];})"""

def seed():
    """Kolme viikkoa tekaistua dataa vanhassa tallennusmuodossa: A:n päivinä B on lähes aina, C harvoin."""
    rnd=random.Random(4); t=datetime.date.today(); days={}
    for i in range(1,25):
        d=(t-datetime.timedelta(days=i)).isoformat(); a=rnd.random()<0.5
        s=[]
        if a: s.append('o1')
        if (a and rnd.random()<0.9) or (not a and rnd.random()<0.2): s.append('o2')
        if (not a and rnd.random()<0.7) or (a and rnd.random()<0.1): s.append('o3')
        if not s: s=['o4']
        days[d]={'s':s,'v':['o1','o2','o3','o4'],'x':[]}
    return {'seq':4,'opts':[{'id':'o1','n':'Aamulenkki','h':False},{'id':'o2','n':'Hyvä keskittyminen','h':False},
        {'id':'o3','n':'Myöhäinen ruutuaika','h':False},{'id':'o4','n':'Pitkä asian nimi, joka rivittyy varmasti usealle riville kapealla näytöllä','h':False}],
        'days':days,'cfg':{'pal':'forest','mode':'auto','font':'oletus','layout':'rivit'},'meta':{'lastExport':None,'dirty':3}}

async def run(p,w,hgt):
    b=await p.chromium.launch(); errs=[]; bad=[]
    ctx=await b.new_context(viewport={'width':w,'height':hgt},device_scale_factor=1,has_touch=False)
    pg=await ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
    def fail(t): print('  VIRHE:',t); bad.append(t)
    async def check(label):
        r=json.loads(await pg.evaluate(OVER)); ok=not r['yli'] and r['doc']<=r['w']
        print('  %-30s %s %s'%(label,'ok' if ok else 'YLI',r if not ok else ''))
        if not ok: bad.append(label)
    async def bar(): return await pg.evaluate("""Array.prototype.map.call(document.querySelectorAll('#bar [data-act=vie],#bar [data-act=valikko]'),function(b){var r=b.getBoundingClientRect();return [Math.round(r.left),Math.round(r.top)];})""")
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(250)
    await check('tyhjä alku')
    # lisäys paikan päällä: sama napautus avaa kentän ja kohdistaa sen
    await pg.click('[data-act=add]')
    if not await pg.evaluate("document.activeElement&&document.activeElement.id==='newopt'"): fail('kenttä ei kohdistu')
    for n in ['Nukuin hyvin','Liikuin','Pitkä asian nimi, joka rivittyy varmasti usealle riville kapealla näytöllä']:
        await pg.fill('#newopt',n); await pg.press('#newopt','Enter'); await pg.wait_for_timeout(60)
    n=await pg.locator('#opts .opt').count(); print('  asioita päivällä:',n)
    if n!=3: fail('lisäys')
    await pg.locator('#opts .opt').first.click(); await pg.wait_for_timeout(80)
    if await pg.locator('#opts .opt[aria-pressed=true]').count()!=1: fail('valinta')
    await check('päivä, kolme asiaa')
    b0=await bar()
    await pg.reload(); await pg.wait_for_timeout(250)
    if await pg.locator('#opts .opt[aria-pressed=true]').count()!=1: fail('tallennus latauksen yli')

    # vanha tallennus + data: ennuste ja nousumerkki
    await pg.evaluate("d=>{localStorage.setItem('paivakartta:v1',JSON.stringify(d));}",seed()); await pg.reload(); await pg.wait_for_timeout(300)
    pcts=await pg.locator('#opts .pct').all_text_contents(); print('  ennusteet:',pcts)
    if not all('%' in x for x in pcts): fail('ennuste puuttuu')
    before=await pg.evaluate(POS)
    await pg.locator('#opts .opt[data-id=o1]').click(); await pg.wait_for_timeout(120)
    after=await pg.evaluate(POS)
    moved=[x for x,y in zip(before,after) if x[1:]!=y[1:]]
    if len(before)!=len(after) or moved: fail('napautus siirsi nappeja: '+str(moved[:4]))
    up=await pg.locator('#opts .opt[data-id=o2] .pct i.up').count(); dn=await pg.locator('#opts .opt[data-id=o3] .pct i.dn').count()
    print('  B nousi:',bool(up),' C laski:',bool(dn), ' meta:',await pg.text_content('#hdmeta'))
    if not up or not dn: fail('nousu/lasku-merkki')
    await check('päivä, data')

    # pitkä painallus avaa asian ikkunan; ulkopuolinen napautus sulkee eikä valitse alla olevaa
    box=await pg.locator('#opts .opt[data-id=o3]').bounding_box()
    await pg.mouse.move(box['x']+20,box['y']+box['height']/2); await pg.mouse.down(); await pg.wait_for_timeout(700); await pg.mouse.up(); await pg.wait_for_timeout(120)
    if not await pg.locator('.pkd').count(): fail('pitkä painallus ei avannut ikkunaa')
    else:
        t=await pg.text_content('.pkd'); print('  asian ikkuna:',t[:90].replace('\n',' '))
        if await pg.locator('#opts .opt[data-id=o3][aria-pressed=true]').count(): fail('pitkä painallus valitsi asian')
        await check('asian ikkuna')
        b4=await pg.locator('#opts .opt[data-id=o1]').bounding_box()   # ylin asia: ei ikkunan alla
        await pg.mouse.click(b4['x']+30,b4['y']+b4['height']/2); await pg.wait_for_timeout(120)
        if await pg.locator('.pkd').count(): fail('ikkuna ei sulkeutunut')
        if not await pg.locator('#opts .opt[data-id=o1][aria-pressed=true]').count(): fail('ulkopuolinen napautus meni läpi')
    # Ei koske tätä päivää
    await pg.mouse.move(box['x']+20,box['y']+box['height']/2); await pg.mouse.down(); await pg.wait_for_timeout(700); await pg.mouse.up(); await pg.wait_for_timeout(120)
    await pg.click('.pkd [data-act=off]'); await pg.wait_for_timeout(120)
    if await pg.locator('#opts .opt[data-id=o3][data-off]').count()!=1: fail('ei koske tätä päivää')

    # kalenteri
    await pg.click('[data-act=kk]'); await pg.wait_for_timeout(100)
    cells=await pg.locator('.kkc').count()
    if cells!=42: fail('kalenterissa %d ruutua'%cells)
    await check('kalenteri')
    await pg.click('[data-act=kkm][data-n="-1"]'); await pg.wait_for_timeout(60)
    d=await pg.get_attribute('.kkc:not(.out) >> nth=9','data-d'); await pg.click('.kkc:not(.out) >> nth=9'); await pg.wait_for_timeout(120)
    sel=await pg.get_attribute('.daybtn[aria-pressed=true]','data-d'); print('  kalenterista valittu',d,'->',sel)
    if sel!=d: fail('kalenteri ei vaihtanut päivää')
    b1=await bar()
    await pg.click('[data-act=today]'); await pg.wait_for_timeout(80)

    # yhteydet
    await pg.click('[data-act=osiot]'); await pg.click('[data-act=osio][data-k=links]'); await pg.wait_for_timeout(150)
    if await pg.locator('#app .pair').count()<1: fail('yhteyksiä ei näy')
    await check('yhteydet')
    b2=await bar()
    await pg.select_option('#ksel','o1'); await pg.wait_for_timeout(120)
    if await pg.locator('#app .bar').count()<3: fail('kohteen yhteydet')
    await check('yhteydet, kohde')
    for v in ['combo','tree']:
        await pg.click('[data-act=lview][data-k=%s]'%v); await pg.wait_for_timeout(100); await check('yhteydet '+v)

    # valikko: asiat, raahaus, muokkaus
    await pg.click('[data-act=valikko]'); await pg.wait_for_timeout(100)
    b3=await bar()
    if not (b0==b1==b2==b3): fail('alapalkin napit siirtyvät: '+str([b0,b1,b2,b3]))
    await pg.click('[data-act=vsub][data-k=asiat]'); await pg.wait_for_timeout(120)
    await check('asiat')
    g=await pg.locator('#alist .vgrip').first.bounding_box(); r2=await pg.locator('#alist .arow').nth(2).bounding_box()
    await pg.mouse.move(g['x']+g['width']/2,g['y']+g['height']/2); await pg.mouse.down()
    for k in range(1,9): await pg.mouse.move(g['x']+g['width']/2,g['y']+g['height']/2+(r2['y']+r2['height']/2-g['y']-g['height']/2+4)*k/8); await pg.wait_for_timeout(20)
    await pg.mouse.up(); await pg.wait_for_timeout(150)
    order=await pg.eval_on_selector_all('#alist .arow','es=>es.map(e=>e.dataset.row)'); print('  järjestys raahauksen jälkeen:',order)
    if order[:3]!=['o2','o3','o1']: fail('raahaus')
    await pg.locator('#alist .aname').first.click(); await pg.wait_for_timeout(100)
    await check('muokkausikkuna')
    await pg.fill('#ed-name','Keskittyminen'); await pg.mouse.click(5,60); await pg.wait_for_timeout(150)
    if 'Keskittyminen' not in (await pg.text_content('#alist')): fail('nimen muokkaus ei tallentunut')
    await pg.click('[data-act=add]'); await pg.fill('#newopt','Uusi valikosta'); await pg.press('#newopt','Enter'); await pg.wait_for_timeout(100)
    if await pg.locator('#alist .arow').count()!=5: fail('lisäys valikossa')
    # poisto vahvistuksen takana
    await pg.locator('#alist .aname').last.click(); await pg.click('[data-act=del]'); await pg.wait_for_timeout(60)
    await pg.click('[data-act=del2]'); await pg.wait_for_timeout(100)
    if await pg.locator('#alist .arow').count()!=4: fail('poisto')

    await pg.click('[data-act=vback]'); await pg.click('[data-act=vsub][data-k=ulkoasu]'); await pg.wait_for_timeout(100)
    themes=await pg.locator('#set-pal [data-v]').evaluate_all("es=>es.map(e=>e.dataset.v).slice(-10)")
    if themes!=['forest','lake','plum','sand','rose','graphite','lagoon','lavender','olive','copper']: fail('yhteiset teemat')
    await pg.click('[data-act=cfg][data-k=mode][data-v=dark]'); await pg.wait_for_timeout(80)
    await check('ulkoasu, tumma')
    await pg.click('[data-act=cfg][data-k=layout][data-v=tiivis]')
    await pg.click('[data-act=vback]'); await pg.click('[data-act=vsub][data-k=tiedot]'); await pg.wait_for_timeout(80)
    await pg.click('[data-act=tview][data-k=vie]'); await pg.wait_for_timeout(80)
    txt=await pg.input_value('#exptext'); o=json.loads(txt)
    if o.get('app')!='paivakartta' or len(o['options'])!=4: fail('vienti tekstinä')
    await check('varmuuskopio')
    await pg.click('[data-act=vback]'); await pg.click('[data-act=osiot]'); await pg.click('[data-act=osio][data-k=day]'); await pg.wait_for_timeout(120)
    await check('päivä, tiivis ja tumma')
    print('  errs',errs); await b.close(); return bad+errs

async def main():
    async with async_playwright() as p:
        bad=await run(p,390,800)+await run(p,320,640)
    print('KAIKKI OK' if not bad else 'VIRHEITÄ: '+', '.join(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
