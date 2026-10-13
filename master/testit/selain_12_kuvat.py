# Versio 11: kuvat ja tarkkuus. Pohjakuvan lukitus muotoon, tarkkuus ×2/÷2 maalausten säilyessä, sivellin 3×3 ja täyttö,
# kuvakerros (+ Kuva, raahaus), tekijän kuvan muodot (pohjakuvan ja kerroksen nimetyt muodot) ja kosketus muotoon puhelimessa,
# ikkunan zoomaus, kamera reunaan ja nipistys (ctrl + rulla). Viety appi 390 px. Kuvakaappaukset kuvat_*.png.
import asyncio, os, json
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
BASE='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80"><rect width="120" height="80" fill="#dfeedd"/><rect id="ovi" x="0" y="0" width="20" height="40" fill="#8a5a2b"/><circle id="lampi" cx="90" cy="60" r="12" fill="#6fb3e0"/></svg>'
KIVI='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle id="kivi" cx="20" cy="20" r="18" fill="#999"/></svg>'
async def run(w,h,scheme,tag):
    async with async_playwright() as p:
        b=await p.chromium.launch(); errs=[]
        ctx=await b.new_context(reduced_motion='reduce',viewport={'width':w,'height':h},color_scheme=scheme)
        pg=await ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(U); await pg.wait_for_timeout(300)
        print('==== %dx%d %s ====' % (w,h,scheme))
        async def P(q): return json.loads(await pg.evaluate("(function(){var d=MASTER.data,P=d.projects.filter(function(x){return x.id===d.cur;})[0],M=(P.maps||[])[0];function O(n){return P.objs.filter(function(o){return o.n===n;})[0];}function F(n){return M.fx.filter(function(f){return f.n===n;})[0];}return JSON.stringify(%s);})()" % q))
        async def add(kind,name):
            await pg.click('[data-add="%s"]' % kind); await pg.wait_for_timeout(60); await pg.fill('#f-name',name); await pg.press('#f-name','Tab'); await pg.wait_for_timeout(80)
        async def setnum(i,v):
            await pg.fill(i,str(v)); await pg.press(i,'Tab'); await pg.wait_for_timeout(180)
        async def cell(x,y):
            Z=await pg.evaluate("(function(){var c=document.getElementById('wcv');return c.clientWidth/MASTER.data.projects.filter(function(x){return x.id===MASTER.data.cur;})[0].maps[0].w;})()")
            r=await pg.evaluate("(function(){var r=document.getElementById('wcv').getBoundingClientRect();return [r.left,r.top];})()"); return r[0]+(x+0.5)*Z, r[1]+(y+0.5)*Z
        await pg.fill('#mempty input','Kuvat'); await pg.click('#mempty .mb:text-is("Luo projekti")'); await pg.wait_for_timeout(250)
        await add('counter','Pisteet'); await add('map','Ikkuna')
        await pg.click('#mtabs [data-v="maps"]'); await pg.wait_for_timeout(150); await setnum('#w-w',6); await setnum('#w-h',3)
        # 1 pohjakuva ja lukitus
        await pg.click('#v-maps button:has-text("Pohjakuva")'); await pg.fill('#mdlg textarea',BASE); await pg.click('#mdlg .mb:text-is("Tallenna")'); await pg.wait_for_timeout(200)
        await pg.click('#w-lock input'); await pg.wait_for_timeout(150); print('1 lukitus kuvan muotoon:', await P("[M.w,M.h,M.lock]"))
        await setnum('#w-w',12); print('  leveys 12 → korkeus seuraa:', await P("[M.w,M.h]"))
        await pg.click('#v-maps [data-scale="0.5"]'); await pg.wait_for_timeout(100); await pg.click('#mdlg .mb:text-is("Harvenna")'); await pg.wait_for_timeout(200); print('  ÷2:', await P("[M.w,M.h]"))
        # 2 tekijä, ×2 säilyttää kohdan
        await pg.click('#v-maps [data-addfx="zone"]'); await pg.wait_for_timeout(150); await pg.fill('#fx-name','Alue'); await pg.press('#fx-name','Tab'); await pg.wait_for_timeout(120)
        await pg.mouse.click(*(await cell(2,2))); await pg.wait_for_timeout(150)
        await pg.click('#v-maps [data-scale="2"]'); await pg.wait_for_timeout(200); print('2 ×2 maalaus mukana:', await P("[M.w,M.h,F('Alue').cells.sort()]"))
        # 3 sivellin 3×3 ja täyttö
        await pg.click('#v-maps [data-addfx="wall"]'); await pg.wait_for_timeout(150); await pg.click('#w-tool button:text-is("3×3")'); await pg.wait_for_timeout(100)
        await pg.mouse.click(*(await cell(9,4))); await pg.wait_for_timeout(150); print('3 sivellin 3×3:', await P("F('Este 2').cells.length"))
        await pg.click('#v-maps [data-fx="f1"]'); await pg.wait_for_timeout(100); await pg.click('#w-tool button:text-is("Täyttö")'); await pg.wait_for_timeout(100)
        await pg.mouse.click(*(await cell(0,7))); await pg.wait_for_timeout(200); print('  täyttö (koko alue paitsi esteet ja alue itse):', await P("F('Alue').cells.length"), '=', await P("M.w*M.h-9"))
        await pg.mouse.click(*(await cell(0,7))); await pg.wait_for_timeout(200); print('  täyttö uudestaan pyyhkii:', await P("F('Alue').cells.length"))
        await pg.click('#w-tool button:text-is("1")'); await pg.wait_for_timeout(80)
        # 4 kuvakerros ja raahaus
        await pg.click('#v-maps [data-addlayer]'); await pg.fill('#mdlg textarea',KIVI); await pg.click('#mdlg .mb:text-is("Tallenna")'); await pg.wait_for_timeout(200)
        print('4 kerros:', await P("M.layers.map(function(L){return [L.id,L.x,L.y,L.w,L.h];})"))
        a=await cell(1,1); z=await cell(3,2)
        await pg.mouse.move(*a); await pg.mouse.down(); await pg.mouse.move(z[0],z[1],steps=4); await pg.mouse.up(); await pg.wait_for_timeout(200)
        print('  raahattu:', await P("[M.layers[0].x,M.layers[0].y]"))
        # 5 kosketustekijä muotoihin
        await pg.click('#v-maps [data-addfx="zone"]'); await pg.wait_for_timeout(150); await pg.fill('#fx-name','Koske'); await pg.press('#fx-name','Tab'); await pg.wait_for_timeout(100)
        await pg.click('#v-maps .winfo button:text-is("Kun kosketetaan")'); await pg.wait_for_timeout(150)
        await pg.select_option('#fx-shape-add','#ovi'); await pg.wait_for_timeout(150); await pg.select_option('#fx-shape-add','L1#kivi'); await pg.wait_for_timeout(150)
        await pg.select_option('#v-maps .winfo [data-acts="act"] select','add'); await pg.wait_for_timeout(150)
        print('5 muodot:', await P("F('Koske').sh"), '| toiminto:', await P("F('Koske').act.length"))
        if tag=='': await pg.screenshot(path='kuvat_editori.png')
        # 6 puhelin ilman hahmoa: kosketus oveen ja kiveen laukaisee, tyhjään ei
        await pg.click('#mtabs [data-v="build"]'); await pg.wait_for_timeout(150); await pg.click('#olist .oname:has(.on:text-is("Ikkuna"))'); await pg.wait_for_timeout(120)
        await pg.click('#insp button:text-is("Ei hahmoa")'); await pg.wait_for_timeout(250)
        async def tapw(wx,wy):
            r=await pg.evaluate("(function(){var r=document.querySelector('#pscreen .ua-map canvas').getBoundingClientRect();return [r.left,r.top,r.width];})()")
            ts=r[2]/(await P("M.w")); await pg.mouse.click(r[0]+wx*ts,r[1]+wy*ts); await pg.wait_for_timeout(200)
        await tapw(1,2); print('6 ovi:', await P("P.state.vals[O('Pisteet').id]||0"))
        L=await P("M.layers[0]"); await tapw(L['x']+L['w']/2,L['y']+L['h']/2); print('  kivi:', await P("P.state.vals[O('Pisteet').id]||0"))
        await tapw(L['x']+0.02,L['y']+0.02); print('  kiven kulma (kuvan sisällä, muodon ulkopuolella):', await P("P.state.vals[O('Pisteet').id]||0"))
        await tapw(7,1); print('  tyhjä kohta:', await P("P.state.vals[O('Pisteet').id]||0"))
        # 7 zoomaus, kamera, nipistys
        await pg.click('#insp button:text-is("Hahmo kävelee")'); await pg.wait_for_timeout(200)
        await pg.click('#f-zm button:text-is("Ruudun koko")'); await pg.wait_for_timeout(150); await setnum('#f-ts',20)
        await pg.click('#insp .check:has-text("Kamera pysähtyy") input'); await pg.wait_for_timeout(150); await pg.click('#insp .check:has-text("nipistyszoomaus") input'); await pg.wait_for_timeout(200)
        print('7 ikkuna:', await P("[O('Ikkuna').zm,O('Ikkuna').ts,O('Ikkuna').cam,O('Ikkuna').pinch]"))
        c=await pg.evaluate("(function(){var r=document.querySelector('#pscreen .ua-map canvas').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];})()")
        await pg.mouse.move(*c); await pg.keyboard.down('Control'); await pg.mouse.wheel(0,-120); await pg.keyboard.up('Control'); await pg.wait_for_timeout(150)
        print('  nipistys suurentaa:', await pg.evaluate("(function(){var m=MASTER.maps();var k=Object.keys(m)[0];return m[k].zk>1;})()"))
        for zm in ['Leveys','Korkeus','Koko maailma','Oletus']:
            await pg.click('#f-zm button:text-is("%s")' % zm); await pg.wait_for_timeout(120)
        for v in ['kartta','maps','table','style','wish','stats','proj','build']:
            await pg.click('#mtabs [data-v="%s"]' % v); await pg.wait_for_timeout(100)
        html=await pg.evaluate("MASTER.appHtml()"); ap=os.path.join(os.getcwd(),'kuvat_%s.html' % (tag or 'a')); open(ap,'w',encoding='utf8').write(html)
        c2=await b.new_context(reduced_motion='reduce',viewport={'width':390,'height':844},color_scheme=scheme,has_touch=True); p2=await c2.new_page(); p2.on('pageerror',lambda e:errs.append('app: '+str(e)))
        await p2.goto('file://'+ap); await p2.wait_for_timeout(500)
        print('8 viety appi: kuva mukana', 'kivi' in html, '| leveys', await p2.evaluate("[document.documentElement.scrollWidth,window.innerWidth]"))
        if tag=='': await p2.screenshot(path='kuvat_appi.png')
        await c2.close(); os.remove(ap); print('  errs', errs); await b.close()
asyncio.run(run(1440,900,'light','')); asyncio.run(run(1280,800,'dark','d'))
