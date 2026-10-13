# Versio 10: koko ja sijainti sekä maailma ruudun taustana. Tarkistaa: tekijät ilman asetuksia ennallaan, korkeus, teksti kasvaa / pienenee,
# leveys ja tasaus virrassa, vapaa sijainti (ei hyppyä vaihdossa) ja raahaus valintatilassa 8 px ruudukkoon, maailmaikkuna taustaksi
# ilman reunoja ja hahmoa, kosketuksesta laukeava tekijä, esto (pullonkaula maailman päällä), hahmon kanssa kosketus ei kävelytä,
# SVG-pohjakuva ja viety appi 390 px. Kuvakaappaukset asettelu_*.png.
import asyncio, os, json
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
SVG='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 100"><rect width="60" height="100" fill="#cfe8c8"/><circle cx="30" cy="80" r="12" fill="#e9a23b"/></svg>'
async def run(w,h,scheme,tag):
    async with async_playwright() as p:
        b=await p.chromium.launch(); errs=[]
        ctx=await b.new_context(reduced_motion='reduce',viewport={'width':w,'height':h},color_scheme=scheme)
        pg=await ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(U); await pg.wait_for_timeout(300)
        print('==== %dx%d %s ====' % (w,h,scheme))
        async def P(q): return json.loads(await pg.evaluate("(function(){var d=MASTER.data,P=d.projects.filter(function(x){return x.id===d.cur;})[0];function O(n){return P.objs.filter(function(o){return o.n===n;})[0];}return JSON.stringify(%s);})()" % q))
        async def box(n,sel='#pscreen'): return await pg.evaluate("(function(){var o=MASTER.data.projects.filter(function(x){return x.id===MASTER.data.cur;})[0].objs.filter(function(o){return o.n===%s;})[0];var e=document.querySelector('%s [data-oid=\"'+o.id+'\"]');if(!e)return null;var cs=getComputedStyle(e);return {x:e.offsetLeft,y:e.offsetTop,w:e.offsetWidth,h:e.offsetHeight,lw:e.parentNode.clientWidth,fs:parseFloat(cs.fontSize),fit:e.scrollHeight<=e.clientHeight+2,st:e.getAttribute('style')||''};})()" % (json.dumps(n),sel))
        async def add(kind,name):
            await pg.click('[data-add="%s"]' % kind); await pg.wait_for_timeout(60); await pg.fill('#f-name',name); await pg.press('#f-name','Tab'); await pg.wait_for_timeout(80)
        async def setnum(i,v):
            await pg.fill(i,str(v)); await pg.press(i,'Tab'); await pg.wait_for_timeout(150)
        async def sel(n):
            await pg.click('#olist .oname:has(.on:text-is("%s"))' % n); await pg.wait_for_timeout(120)
        await pg.fill('#mempty input','Asettelu'); await pg.click('#mempty .mb:text-is("Luo projekti")'); await pg.wait_for_timeout(250)
        await add('choice','Avaa ovi'); await add('choice','Lähde pois'); await add('text','Kyltti'); await add('counter','Pisteet')
        a0=await box('Avaa ovi'); print('1 ilman asetuksia ei tyylejä:', a0['st']=='' or a0['st'].startswith('--i'), '| leveys koko rivi:', a0['w']==a0['lw'])
        # 2 korkeus ja teksti
        await sel('Avaa ovi'); await setnum('#f-bh',90); a=await box('Avaa ovi'); print('2 korkeus 90:', a['h']>=90)
        await pg.fill('#f-name','Avaa ovi, jonka takana odottaa pitkä ja mutkainen käytävä täynnä yllätyksiä ja vähän muutakin'); await pg.press('#f-name','Tab'); await pg.wait_for_timeout(150)
        await setnum('#f-bh',44); a=await box('Avaa ovi, jonka takana odottaa pitkä ja mutkainen käytävä täynnä yllätyksiä ja vähän muutakin'); print('  kasvaa:', a['h']>44)
        await pg.click('#lay-card button:text-is("Teksti pienenee")'); await pg.wait_for_timeout(200)
        a=await box('Avaa ovi, jonka takana odottaa pitkä ja mutkainen käytävä täynnä yllätyksiä ja vähän muutakin'); print('  pienenee:', a['h']==44, a['fs']<17, a['fit'])
        await pg.fill('#f-name','Avaa ovi'); await pg.press('#f-name','Tab'); await pg.wait_for_timeout(150)
        # 3 leveys ja tasaus
        await sel('Lähde pois'); await setnum('#f-bw',50); await pg.click('#lay-card button:text-is("Keski")'); await pg.wait_for_timeout(150)
        b2=await box('Lähde pois'); print('3 leveys 50 % keskellä:', abs(b2['w']-b2['lw']/2)<2, abs(b2['x']-(b2['lw']-b2['w'])/2)<3)
        # 4 vapaa sijainti ilman hyppyä, raahaus valintatilassa
        await sel('Kyltti'); k0=await box('Kyltti'); await pg.click('#lay-card button:text-is("Vapaa")'); await pg.wait_for_timeout(200); k1=await box('Kyltti')
        print('4 vapaaksi ilman hyppyä:', abs(k0['x']-k1['x'])<=8 and abs(k0['y']-k1['y'])<=8, '| tallennettu:', await P("[O('Kyltti').pos,O('Kyltti').x%8,O('Kyltti').y%8]"))
        await pg.click('#pmode [data-m="pick"]'); await pg.wait_for_timeout(100)
        e=await pg.evaluate("(function(){var r=document.querySelector('#pscreen [data-lay=free]').getBoundingClientRect();return [r.left+10,r.top+10];})()")
        await pg.mouse.move(*e); await pg.mouse.down(); await pg.mouse.move(e[0]+43,e[1]+70,steps=5); await pg.mouse.up(); await pg.wait_for_timeout(250)
        print('  raahaus:', await P("[O('Kyltti').x-%d,O('Kyltti').y-%d]" % (k1['x']-16 if False else 0,0)), '| ruudukossa:', await P("O('Kyltti').x%8===0&&O('Kyltti').y%8===0"), '| valittuna:', (await pg.inner_text('#insp h2')).strip())
        k2=await box('Kyltti'); print('  liikkui oikeaan kohtaan:', abs((k2['x']-k1['x'])-43)<=8 and abs((k2['y']-k1['y'])-70)<=8)
        await pg.click('#pmode [data-m="use"]'); await pg.wait_for_timeout(100)
        # 5 maailma taustaksi, ei reunoja, ei hahmoa, kosketus
        await add('map','Taustamaailma')
        await pg.click('#insp .check:has-text("Ruudun taustaksi") input'); await pg.wait_for_timeout(150)
        await pg.click('#insp button:text-is("Näkymättömät")'); await pg.wait_for_timeout(120); await pg.click('#insp button:text-is("Ei hahmoa")'); await pg.wait_for_timeout(150)
        print('5 tausta:', await P("[O('Taustamaailma').bg,O('Taustamaailma').frame,O('Taustamaailma').hero]"), await pg.evaluate("(function(){var m=document.querySelector('#pscreen .ua-mapbg'),mn=document.querySelector('#pscreen .ua-main');return m&&!m.closest('.ua-list')&&Math.abs(m.offsetHeight-mn.clientHeight)<2&&mn.classList.contains('hasbg');})()"))
        await pg.click('#mtabs [data-v="maps"]'); await pg.wait_for_timeout(150)
        await setnum('#w-w',6); await setnum('#w-h',10)
        await pg.click('#v-maps [data-addfx="zone"]'); await pg.wait_for_timeout(150); await pg.fill('#fx-name','Aarre'); await pg.press('#fx-name','Tab'); await pg.wait_for_timeout(100)
        await pg.click('#v-maps .winfo button:text-is("Kun kosketetaan")'); await pg.wait_for_timeout(120)
        await pg.select_option('#v-maps .winfo [data-acts="act"] select','add'); await pg.wait_for_timeout(150)
        r=await pg.evaluate("(function(){var r=document.getElementById('wcv').getBoundingClientRect();return [r.left,r.top];})()")
        await pg.mouse.click(r[0]+3*24+12,r[1]+8*24+12); await pg.wait_for_timeout(150)
        print('  tekijä:', await P("P.maps[0].fx.map(function(f){return [f.n,f.trig,f.vis,f.cells,f.act.length];})"))
        await pg.click('#v-maps button:has-text("Pohjakuva")'); await pg.wait_for_timeout(100); await pg.fill('#mdlg textarea',SVG); await pg.click('#mdlg .mb:text-is("Tallenna")'); await pg.wait_for_timeout(200)
        print('  pohjakuva:', await P("P.maps[0].img.indexOf('<svg')===0"))
        await pg.click('#mtabs [data-v="build"]'); await pg.wait_for_timeout(300)
        async def tapcell(cx,cy,sel='#pscreen'):
            c=await pg.evaluate("(function(){var r=document.querySelector('%s .ua-mapbg canvas').getBoundingClientRect();return [r.left,r.top,r.width];})()" % sel)
            ts=c[2]/6; await pg.mouse.click(c[0]+(cx+0.5)*ts,c[1]+(cy+0.5)*ts); await pg.wait_for_timeout(250)
        await tapcell(3,8); await tapcell(2,8)
        print('6 kosketus laukaisee vain omassa kohdassaan:', await P("P.state.vals[O('Pisteet').id]"))
        if tag=='': await pg.screenshot(path='asettelu_tausta.png')
        # 7 esto: Avaa ovi näkyvissä ja estää
        await sel('Avaa ovi'); await pg.click('#lay-card .check input'); await pg.wait_for_timeout(150); await tapcell(3,8)
        print('7 esto päällä, ei laukea:', await P("P.state.vals[O('Pisteet').id]"))
        await pg.click('#lay-card .check input'); await pg.wait_for_timeout(150); await tapcell(3,8); print('  esto pois, laukeaa:', await P("P.state.vals[O('Pisteet').id]"))
        # 8 hahmo päälle: kosketuskohta laukeaa eikä hahmo kävele siihen
        await sel('Taustamaailma'); await pg.click('#insp button:text-is("Hahmo kävelee")'); await pg.wait_for_timeout(200); await setnum('#f-sx',3); await setnum('#f-sy',6)
        pos0=await P("P.state.vals[O('Taustamaailma').id]||null")
        c=await pg.evaluate("(function(){var r=document.querySelector('#pscreen .ua-mapbg canvas').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];})()")
        await pg.mouse.click(c[0],c[1]+2*32); await pg.wait_for_timeout(900)
        print('8 hahmon kanssa kosketuskohta laukeaa eikä hahmo kävele:', await P("[P.state.vals[O('Pisteet').id],P.state.vals[O('Taustamaailma').id]||null]"), pos0)
        await pg.mouse.click(c[0]-64,c[1]+32); await pg.wait_for_timeout(1200)
        print('  muualle hahmo kävelee:', await P("P.state.vals[O('Taustamaailma').id]"))
        await pg.click('#pmode [data-m="use"]')
        for v in ['kartta','maps','table','style','wish','stats','proj','build']:
            await pg.click('#mtabs [data-v="%s"]' % v); await pg.wait_for_timeout(120)
        html=await pg.evaluate("MASTER.appHtml()"); ap=os.path.join(os.getcwd(),'asettelu_%s.html' % (tag or 'a')); open(ap,'w',encoding='utf8').write(html)
        c2=await b.new_context(reduced_motion='reduce',viewport={'width':390,'height':844},color_scheme=scheme,has_touch=True); p2=await c2.new_page(); p2.on('pageerror',lambda e:errs.append('app: '+str(e)))
        await p2.goto('file://'+ap); await p2.wait_for_timeout(400)
        info=await p2.evaluate("(function(){var f=document.querySelector('#app [data-lay=free]'),m=document.querySelector('#app .ua-mapbg');return [!!f&&f.style.left!=='',!!m,document.documentElement.scrollWidth];})()")
        print('9 viety appi: vapaa tekijä, taustamaailma, leveys', info)
        if tag=='': await p2.screenshot(path='asettelu_appi.png')
        await c2.close(); print('  errs', errs); await b.close()
asyncio.run(run(1440,900,'light','')); asyncio.run(run(1280,800,'dark','d'))
