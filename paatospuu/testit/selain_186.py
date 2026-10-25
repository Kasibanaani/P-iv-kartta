"""Juuri 1.86: värikone (Emil 25.10.2026). Valmiit paletit ja vanhat teemat poissa; pohjaväri, luonne, kylläisyys, kontrasti ja taustan vaaleus.
Tumma asu seuraa vaaleaa, muutetut kohdat ovat tumman omia (Vaalean mukaan palauttaa). Vanhat valinnat muunnetaan. Teksti aina vähintään 4,5:1.
Taustakuvan sumennus (lasketaan kerran, reunat eivät haalistu) ja himmennys, omat kuvat (IndexedDB, varmuuskopiossa), uudet kuvat.
Leveydet 390 ja 320 px. Käyttö: python3 testit/selain_186.py"""
import asyncio, os, sys, json, zlib, struct
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from apu import tab, menu
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
K="JSON.parse(localStorage.getItem('paatospuu:v1')).kokonaisuudet[0].asetukset"
def png(w,h):
    raw=b''.join(b'\x00'+bytes(v for x in range(w) for v in (x*255//w,80,y*255//h)) for y in range(h))
    ch=lambda t,d: struct.pack('>I',len(d))+t+d+struct.pack('>I',zlib.crc32(t+d)&0xffffffff)
    return b'\x89PNG\r\n\x1a\n'+ch(b'IHDR',struct.pack('>IIBBBBB',w,h,8,2,0,0,0))+ch(b'IDAT',zlib.compress(raw))+ch(b'IEND',b'')
def lum(hx):
    v=[int(hx[i:i+2],16)/255 for i in (1,3,5)]; v=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in v]
    return .2126*v[0]+.7152*v[1]+.0722*v[2]
def cr(a,b):
    x,y=lum(a),lum(b); return (max(x,y)+.05)/(min(x,y)+.05)
VARS="(function(){var s=document.documentElement.style,o={};['--bg','--cell','--label','--label2','--fill2','--accent','--solid','--on-solid','--red','--dlg'].forEach(function(k){o[k]=s.getPropertyValue(k).trim().toUpperCase();});return o;})()"
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    ctx=await b.new_context(viewport={'width':w,'height':h},color_scheme='light',accept_downloads=True); pg=await ctx.new_page()
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond):
        print('  %-48s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    cfg=lambda: pg.evaluate("JSON.stringify(%s||{})"%K)
    async def opn(): await menu(pg,'#m-proj'); await pg.wait_for_timeout(150)
    async def shut(): await pg.click('#psheet .sx'); await pg.wait_for_timeout(150)
    async def pick(sel):
        await pg.locator(sel).scroll_into_view_if_needed(); await pg.locator(sel).click(); await pg.wait_for_timeout(80)
    async def slide(i,v,fin=True):
        await pg.evaluate("(function(){var i=document.getElementById('%s');i.value='%s';i.dispatchEvent(new Event('input',{bubbles:true}));%s})()"%(i,v,"i.dispatchEvent(new Event('change',{bubbles:true}));" if fin else ''))
        await pg.wait_for_timeout(60)
    print('leveys',w)
    # Vanha valinta muunnetaan: tummaa palettia käyttänyt projekti pysyy tummana, vaalea teema lähimmäksi sävyksi
    await pg.goto(U); await pg.wait_for_timeout(100)
    await pg.evaluate("""localStorage.setItem('paatospuu:v1',JSON.stringify({app:'paatospuu',ver:1,kcur:'a',kokonaisuudet:[{id:'a',name:'Eka',puut:[],muistiinpanot:[],asetukset:{pal:'piki0'}},{id:'b',name:'Toka',puut:[],muistiinpanot:[],asetukset:{tint:'lake'}}]}))""")
    await pg.reload(); await pg.wait_for_timeout(200)
    v=await pg.evaluate(VARS)
    want('vanha tumma paletti: tumma ja lähes musta', await pg.evaluate("document.documentElement.style.colorScheme")=='dark' and lum(v['--bg'])<.01)
    await opn()
    want('ei valmiita paletteja eikä teemoja', await pg.locator('#set-pals').count()==0 and await pg.locator('#set-pal').count()==0 and await pg.is_visible('#k-h'))
    want('tila Tumma valittuna', await pg.get_attribute('#set-mode button[data-v="dark"]','aria-pressed')=='true')
    await pick('#set-kh button[data-v="9"]')
    c=json.loads(await cfg())
    want('säätö kirjoittaa arvot auki, vanha avain pois', 'pal' not in c and c.get('mode')=='dark' and c.get('kc')=='vahavari' and c.get('dkh')=='200')
    await pg.click('#pk-list .row[data-k="b"]'); await pg.wait_for_timeout(150)
    v=await pg.evaluate(VARS)
    want('vanha Järvi-teema: vaalea, sininen sävy', await pg.evaluate("document.documentElement.style.colorScheme")=='light' and lum(v['--bg'])>.8 and int(v['--accent'][5:7],16)>int(v['--accent'][1:3],16))
    # Puhdas aloitus
    await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(200)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await tab(pg,'notes'); await pg.wait_for_timeout(80)
    await opn()
    # Säädin: vedon aikana värit muuttuvat ilman asetusten uudelleenpiirtoa, irrotus tallentaa
    b0=(await pg.evaluate(VARS))['--bg']; await pg.evaluate("document.getElementById('k-h').dataset.mark='1'")
    await slide('k-h',300,False)
    want('vedon aikana värit vaihtuvat heti', (await pg.evaluate(VARS))['--bg']!=b0 and await pg.evaluate("document.getElementById('k-h').dataset.mark")=='1')
    await slide('k-h',300)
    want('irrotus tallentaa', json.loads(await cfg()).get('kh')=='300')
    # Linkitetty tumma: seuraa vaaleaa, oma arvo ja palautus
    await pick('#set-asu button[data-v="dark"]')
    want('tumman asun esikatselu', await pg.evaluate("document.documentElement.style.colorScheme")=='dark' and 'Taustan tummuus' in await pg.inner_text('#pk-set'))
    want('tumma seuraa vaaleaa (ei palautuslinkkejä)', await pg.locator('#pk-set .kback').count()==0 and await pg.get_attribute('#set-kc button[data-v="murretut"]','aria-pressed')=='true')
    d0=(await pg.evaluate(VARS))['--bg']
    await pick('#set-kc button[data-v="pastelli"]')
    c=json.loads(await cfg())
    want('tumman muutos tumman omaksi', c.get('dkc')=='pastelli' and c.get('kc')=='murretut' and await pg.locator('#pk-set .kback[data-k="kc"]').count()==1)
    await pick('#set-bfx button[data-v="glow"]')
    want('nappien efekti tilakohtainen', json.loads(await cfg()).get('dbfx')=='glow' and await pg.evaluate("document.documentElement.dataset.bfx")=='glow')
    await pick('#pk-set .kback[data-k="kc"]')
    want('Vaalean mukaan palauttaa', 'dkc' not in json.loads(await cfg()) and await pg.get_attribute('#set-kc button[data-v="murretut"]','aria-pressed')=='true')
    await pick('#set-asu button[data-v="light"]')
    want('vaalealla oma efekti', await pg.evaluate("document.documentElement.dataset.bfx||''")!='glow' and await pg.evaluate("document.documentElement.style.colorScheme")=='light')
    await slide('k-h',120)
    await pick('#set-asu button[data-v="dark"]')
    want('tumma seuraa vaalean sävyä', (await pg.evaluate(VARS))['--bg']!=d0 and await pg.input_value('#k-h')=='120')
    await shut()
    want('ikkunan sulku palauttaa laitteen asun', await pg.evaluate("document.documentElement.style.colorScheme")=='light')
    # Kontrasti: teksti vähintään 4,5:1 ääriasetuksilla molemmissa asuissa
    await opn(); low=[]
    for asu in ('light','dark'):
        await pick('#set-asu button[data-v="%s"]'%asu)
        for ch in ('pastelli','murretut','vahavari','kaksi'):
            await pick('#set-kc button[data-v="%s"]'%ch)
            for s_,k_,p_ in ((100,0,0),(100,100,100),(0,0,50),(60,30,0)):
                await slide('k-s',s_,False); await slide('k-k',k_,False); await slide('k-p',p_,False)
                v=await pg.evaluate(VARS)
                for a,bg in (('--label','--bg'),('--label','--cell'),('--label2','--bg'),('--label2','--cell'),('--accent','--cell'),('--on-solid','--solid'),('--red','--cell')):
                    if cr(v[a],v[bg])<4.5: low.append((asu,ch,s_,k_,p_,a,bg,round(cr(v[a],v[bg]),2)))
    want('teksti vähintään 4,5:1 (%d yhdistelmää)'%(2*4*4*7), not low)
    if low: print('   ',low[:6])
    await slide('k-s',31); await slide('k-k',50); await slide('k-p',75)
    await pick('#set-asu button[data-v="light"]'); await pick('#set-kc button[data-v="murretut"]')
    # Taustakuva: uudet kuvat, sumennus ja himmennys
    for a in ('tihea','lehto','kettu','hirvi','pollo'):
        if not await pg.locator('#set-art button[data-v="%s"]'%a).count(): want('uusi kuva '+a, False)
    await pick('#set-art button[data-v="kettu"]')
    want('sumennus- ja himmennysvalinnat kuvan kanssa', await pg.locator('#set-blur button').count()==4 and await pg.locator('#set-dim button').count()==4)
    want('ilman sumennusta terävä SVG', await pg.evaluate("document.getElementById('artband').firstElementChild.tagName")=='svg')
    for lv in ('1','2','3'):
        await pick('#set-blur button[data-v="%s"]'%lv); await pg.wait_for_timeout(500)
        r=await pg.evaluate("""(function(){var c=document.querySelector('#artband canvas');if(!c||!c.dataset.done)return null;var x=c.getContext('2d'),w=c.width,h=c.height;
          function px(a,b){return Array.prototype.slice.call(x.getImageData(a,b,1,1).data);}
          var k=0,p0=px(Math.floor(w/2),Math.floor(h*.8));for(var i=1;i<6;i++){var q=px(Math.floor(w/2)+i,Math.floor(h*.8));k+=Math.abs(q[0]-p0[0]);}
          return {w:w,cw:c.getBoundingClientRect().width,c0:px(0,h-1)[3],c1:px(w-1,0)[3],c2:px(0,0)[3]};})()""")
        want('sumennus %s: laskettu kerran, reunat peittävät'%lv, r is not None and r['c0']==255 and r['c1']==255 and r['c2']==255)
        if r and lv=='3': want('vahva sumennus pienemmällä tarkkuudella', r['w']<r['cw'])
    await pick('#set-dim button[data-v="0"]')
    want('himmennys Ei', await pg.evaluate("getComputedStyle(document.getElementById('artband'),'::after').opacity")=='0')
    await pick('#set-asu button[data-v="dark"]')
    want('tummalla seuraa vaalean sumennusta', await pg.get_attribute('#set-blur button[data-v="3"]','aria-pressed')=='true')
    await pick('#set-blur button[data-v=""]')
    c=json.loads(await cfg())
    want('tumman sumennus omaksi', c.get('dblur')=='' and c.get('blur')=='3' and await pg.evaluate("document.getElementById('artband').firstElementChild.tagName")=='svg')
    await pick('#set-asu button[data-v="light"]')
    if os.environ.get('KUVA'): await pg.screenshot(path=os.environ['KUVA']+'/e186a_%d.png'%w)
    # Paneloinnin aikana kuva ei lasketa uudelleen
    await shut()
    k0=await pg.evaluate("document.querySelector('#artband canvas')._k")
    for t in ('cal','list','terms'): await tab(pg,t); await pg.wait_for_timeout(120)
    want('panorointi ei laske sumennusta uudelleen', await pg.evaluate("document.querySelector('#artband canvas')._k")==k0)
    if os.environ.get('KUVA'): await pg.screenshot(path=os.environ['KUVA']+'/e186b_%d.png'%w)
    # Oma kuva
    await tab(pg,'notes'); await opn()
    await pg.set_input_files('#art-file',{'name':'Metsälampi.png','mimeType':'image/png','buffer':png(300,200)}); await pg.wait_for_timeout(700)
    c=json.loads(await cfg())
    want('oma kuva valittu ja näkyy', c.get('art','').startswith('oma:') and await pg.evaluate("(function(){var c=document.querySelector('#artband canvas');return !!c&&c.dataset.kind==='photo';})()"))
    want('oma kuva valikoimassa nimellä', await pg.locator('#set-art button[data-v="%s"]'%c['art']).inner_text()=='Metsälampi')
    await shut(); await pg.reload(); await pg.wait_for_timeout(500)
    want('oma kuva säilyy (laitteen kuvamuisti)', await pg.evaluate("(function(){var c=document.querySelector('#artband canvas');return !!c&&c.dataset.kind==='photo'&&!!c.dataset.done;})()"))
    want('ei selaimen pieneen muistiin', 'data:image' not in await pg.evaluate("localStorage.getItem('paatospuu:v1')"))
    # Varmuuskopio: kuvat mukana koko appin viennissä
    await menu(pg,'#m-x'); await pg.wait_for_timeout(150)
    async with pg.expect_download() as dl: await pg.click('#vs-all')
    f=await (await dl.value).path(); o=json.load(open(f,encoding='utf8'))
    want('kuvat mukana varmuuskopiossa', len(o.get('kuvat',[]))==1 and o['kuvat'][0]['data'].startswith('data:image/jpeg'))
    if await pg.is_visible('#vsheet .sx'): await pg.click('#vsheet .sx'); await pg.wait_for_timeout(100)
    # Poisto vahvistuksella
    await opn(); await pick('#art-del button')
    want('poisto kysyy vahvistuksen', await pg.is_visible('#art-delok'))
    await pick('#art-delok'); await pg.wait_for_timeout(200)
    want('kuva poistettu', json.loads(await cfg()).get('art','')=='' and await pg.locator('#set-art button[data-v^="oma:"]').count()==0)
    await shut()
    # Tuonti toisella laitteella palauttaa kuvan
    pg2=await (await b.new_context(viewport={'width':w,'height':h})).new_page(); pg2.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    await pg2.goto(U); await pg2.wait_for_timeout(200)
    await pg2.set_input_files('#impfile',{'name':'Juuri.json','mimeType':'application/json','buffer':json.dumps(o).encode('utf8')}); await pg2.wait_for_timeout(300)
    await pg2.evaluate("document.getElementById('impok').click()"); await pg2.wait_for_timeout(800)
    want('tuonti palauttaa kuvan ja valinnan', await pg2.evaluate("(function(){var c=document.querySelector('#artband canvas');return !!c&&c.dataset.kind==='photo';})()"))
    # Leveys
    await opn()
    want('asetukset mahtuvat leveyteen', await pg.evaluate("document.documentElement.scrollWidth<=%d"%w) and await pg.evaluate("(function(){var w=document.documentElement.clientWidth,o=0;document.querySelectorAll('#psheet button,#psheet input').forEach(function(e){var r=e.getBoundingClientRect();if(r.width&&e.offsetParent&&r.right>w+.5)o++;});return o;})()")==0)
    if os.environ.get('KUVA'): await pg.screenshot(path=os.environ['KUVA']+'/e186c_%d.png'%w)
    want('ei sivuvirheitä', not errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640)): bad+=await run(p,w,h)
        print('OK' if not bad else 'VIRHEET',bad); sys.exit(1 if bad else 0)
asyncio.run(main())
