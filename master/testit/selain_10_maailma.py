# Versio 9: maailmat. Maailma-kenttä lisätään Rakenteeseen (maailma syntyy samalla), Maailmat-välilehdellä maalataan este ja
# näkymätön tekijä, annetaan tekijälle toiminto ja esteelle sääntö (ovi aukeaa avaimella), ⚑-sivellin asettaa aloituksen.
# Puhelimessa napautus kävelyttää hahmon: tekijä laukeaa, este pysäyttää, avaimen jälkeen pääsee läpi. Muut välilehdet aukeavat.
# Viety appi 390 ja 320 px: napautus liikuttaa hahmoa. Kuvakaappaukset maailma_*.png.
import asyncio, os, json
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
async def run(w,h,scheme,tag):
    async with async_playwright() as p:
        b=await p.chromium.launch(); errs=[]
        ctx=await b.new_context(reduced_motion='reduce',viewport={'width':w,'height':h},color_scheme=scheme)
        pg=await ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(U); await pg.wait_for_timeout(300)
        print('==== %dx%d %s ====' % (w,h,scheme))
        P=lambda q: pg.evaluate("(function(){var d=MASTER.data,P=d.projects.filter(function(x){return x.id===d.cur;})[0];function O(n){return P.objs.filter(function(o){return o.n===n;})[0];}function F(n){var r=null;(P.maps||[]).forEach(function(M){M.fx.forEach(function(f){if(f.n===n)r=f;});});return r;}return JSON.stringify(%s);})()" % q)
        J=lambda q: P(q).then(json.loads) if False else None
        async def val(q): return json.loads(await P(q))
        async def add(kind,name):
            await pg.click('[data-add="%s"]' % kind); await pg.wait_for_timeout(60); await pg.fill('#f-name',name); await pg.press('#f-name','Tab'); await pg.wait_for_timeout(80)
        async def cell(x,y,Z=24):
            r=await pg.evaluate("(function(){var r=document.getElementById('wcv').getBoundingClientRect();return [r.left,r.top];})()")
            return r[0]+x*Z+Z/2, r[1]+y*Z+Z/2
        async def walk(dx,dy,ms=2200,sel='#pscreen'):
            c=await pg.evaluate("(function(){var r=document.querySelector('%s .ua-map canvas').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];})()" % sel)
            await pg.mouse.click(c[0]+dx*32,c[1]+dy*32); await pg.wait_for_timeout(ms)
        await pg.fill('#mempty input','Seikkailu'); await pg.click('#mempty .mb:text-is("Luo projekti")'); await pg.wait_for_timeout(250)
        await add('counter','Pisteet'); await add('choice','Avain'); await add('map','Metsä')
        print('1 kenttä ja maailma:', await P("[O('Metsä').t,O('Metsä').m,P.maps.length,P.maps[0].n]"), '| puhelimessa:', await pg.evaluate("(function(){var c=document.querySelector('#pscreen .ua-map canvas');return c?[c.clientWidth>200,c.clientHeight]:null;})()"))
        await pg.fill('#f-mh','280'); await pg.press('#f-mh','Tab'); await pg.wait_for_timeout(150)
        print('  korkeus:', await P("O('Metsä').h"), await pg.evaluate("document.querySelector('#pscreen .ua-map').clientHeight"))
        # 2 Maailmat: este pystyriviksi x=3, y=0..5
        await pg.click('#mtabs [data-v="maps"]'); await pg.wait_for_timeout(200)
        await pg.click('#v-maps [data-addfx="wall"]'); await pg.wait_for_timeout(150)
        a=await cell(3,0); z=await cell(3,5)
        await pg.mouse.move(*a); await pg.mouse.down(); await pg.mouse.move(z[0],z[1],steps=4); await pg.mouse.up(); await pg.wait_for_timeout(200)
        print('2 este:', await P("F('Este 1').cells.length"), await P("F('Este 1').cells.sort()"))
        # vedon aloitus maalatusta ruudusta pyyhkii
        a=await cell(3,5); await pg.mouse.click(*a); await pg.wait_for_timeout(150); print('  pyyhintä:', await P("F('Este 1').cells.length"))
        await pg.mouse.click(*a); await pg.wait_for_timeout(150)
        # 3 näkymätön tekijä ruutuun 1,4 ja toiminto
        await pg.click('#v-maps [data-addfx="zone"]'); await pg.wait_for_timeout(150)
        await pg.fill('#fx-name','Kyltti'); await pg.press('#fx-name','Tab'); await pg.wait_for_timeout(150)
        await pg.mouse.click(*(await cell(1,4))); await pg.wait_for_timeout(150)
        await pg.select_option('#v-maps .winfo [data-acts="act"] select','add'); await pg.wait_for_timeout(150)
        print('3 tekijä:', await P("[F('Kyltti').k,F('Kyltti').vis,F('Kyltti').cells,F('Kyltti').act]"))
        await pg.click('#v-maps .winfo button:text-is("Kun pysähtyy ruutuun")'); await pg.wait_for_timeout(100); await pg.click('#v-maps .winfo button:text-is("Kun astuu alueelle")'); await pg.wait_for_timeout(100)
        # 4 aloitus ⚑-siveltimellä ruutuun 1,1
        await pg.click('#v-maps [data-start]'); await pg.wait_for_timeout(100); await pg.mouse.click(*(await cell(1,1))); await pg.wait_for_timeout(200)
        print('4 aloitus:', await P("O('Metsä').start"))
        # 5 ovi: este voimassa, kun Avain ei ole valittu
        await pg.click('#v-maps [data-fx="f1"]'); await pg.wait_for_timeout(100); await pg.click('#v-maps [data-fx="f1"]'); await pg.wait_for_timeout(100)
        await pg.select_option('#v-maps .winfo [data-rules="fxreq"] select',label='Avain · valinta'); await pg.wait_for_timeout(150)
        await pg.select_option('#v-maps .winfo [data-rules="fxreq"] .rule select >> nth=1','off'); await pg.wait_for_timeout(150)
        print('5 ovi:', await P("F('Este 1').req.map(function(c){return [O('Avain').id===c.o,c.op];})"))
        if tag=='': await pg.screenshot(path='maailma_editori.png')
        # 6 puhelimessa: kävely tekijälle, este pysäyttää, avaimella läpi
        await pg.click('#mtabs [data-v="build"]'); await pg.wait_for_timeout(250)
        print('6 alussa:', await pg.evaluate("(function(){var m=MASTER.data;return 1;})()"), await P("P.state.vals[O('Metsä').id]||null"))
        await walk(0,3)
        print('  kyltille:', await P("[P.state.vals[O('Metsä').id],P.state.vals[O('Pisteet').id]]"))
        await walk(0,0.6,900); await walk(0,-0.6,900)
        print('  alueella pysyminen ei laukaise uudestaan, paluu laukaisee:', await P("P.state.vals[O('Pisteet').id]"))
        await walk(5,0,2600)
        print('  este pysäyttää:', await P("P.state.vals[O('Metsä').id].x<3"))
        if tag=='': await pg.screenshot(path='maailma_puhelin.png')
        await pg.click('#pscreen .ua-row'); await pg.wait_for_timeout(200)
        await walk(4,0,2400)
        print('  avaimella läpi:', await P("P.state.vals[O('Metsä').id].x>4"))
        # 7 valitse muokattavaksi -tila: napautus valitsee kentän eikä liikuta
        before=await P("P.state.vals[O('Metsä').id]")
        await pg.click('#pmode [data-m="pick"]'); await pg.wait_for_timeout(100); await walk(-2,0,600); await pg.click('#pmode [data-m="use"]')
        print('7 valintatila:', (await pg.inner_text('#insp h2')).strip(), '| ei liikkunut:', before==await P("P.state.vals[O('Metsä').id]"))
        # 8 kaikki välilehdet aukeavat
        for v in ['kartta','maps','table','style','wish','stats','proj','build']:
            await pg.click('#mtabs [data-v="%s"]' % v); await pg.wait_for_timeout(150)
        print('8 välilehdet ok | kumoa:', await pg.is_enabled('#mundo'))
        html=await pg.evaluate("MASTER.appHtml()"); ap=os.path.join(os.getcwd(),'maailma_%s.html' % (tag or 'a')); open(ap,'w',encoding='utf8').write(html)
        for pw,ph in ((390,844),(320,640)):
            c2=await b.new_context(reduced_motion='reduce',viewport={'width':pw,'height':ph},color_scheme=scheme,has_touch=True); p2=await c2.new_page(); p2.on('pageerror',lambda e:errs.append('app: '+str(e)))
            await p2.goto('file://'+ap); await p2.wait_for_timeout(300)
            cv=await p2.evaluate("(function(){var c=document.querySelector('#app .ua-map canvas');return c?[c.clientWidth,c.clientHeight]:null;})()")
            c=await p2.evaluate("(function(){var r=document.querySelector('#app .ua-map canvas').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];})()")
            await p2.mouse.click(c[0],c[1]+64); await p2.wait_for_timeout(1500)
            pos=await p2.evaluate("(function(){var k=Object.keys(localStorage);for(var i=0;i<k.length;i++){var v=localStorage.getItem(k[i]);if(v&&v.indexOf('\"x\"')>=0)return v.slice(0,200);}return null;})()")
            print('9 viety appi %d px: kenttä' % pw, cv, '| sijainti tallessa:', bool(pos), '| leveys', await p2.evaluate("[document.documentElement.scrollWidth, window.innerWidth]"))
            if tag=='' and pw==390: await p2.screenshot(path='maailma_appi.png')
            await c2.close()
        print('  errs', errs)
        await b.close()
asyncio.run(run(1440,900,'light','')); asyncio.run(run(1280,800,'dark','d'))
