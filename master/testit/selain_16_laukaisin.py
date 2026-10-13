# Versio 14: laukaisin ja lippu maailmassa. Hahmo kävelee tekijöiden läpi: päällä vain alueella -laukaisin on 1 vain alueella,
# jää päälle -laukaisin pysyy, lippu ja laukaisin toimivat säännöissä. Hahmon nopeus palikasta (Juokse). Maailmat-välilehdellä
# tekijälle luodaan uusi laukaisin, säätimen loppu valitaan palikaksi. Viety appi 390 px. Kuvakaappaukset laukaisin_*.png.
import asyncio, os, json
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
def ob(i,t,n,**kw):
    x={'id':'o%d'%i,'t':t,'n':n,'s':'s1','req':[],'suf':[]}
    if t=='choice':x.update(v=1,note='',ex=[],hl=[],beh='toggle',act=[],lact=[])
    x.update(kw);return x
objs=[ob(1,'trig','Huone',mode='inside',act=[]),ob(2,'trig','Käytävä',mode='latch',act=[{'do':'select','o':'o3'}]),ob(3,'flag','Ohitettu',init=False),
 ob(4,'choice','Juokse'),ob(5,'calc','Nopeus',mode='f',f='JOS([Juokse];12;3)',show='hidden',agg={'op':'sum','ids':[]},cases=[],els={'k':'num','v':0},min=0,max=10,dec='',unit=''),
 ob(6,'text','Tila',title=False,body='Sisällä {Huone} · Kuljettu {Käytävä} · Lippu {Ohitettu} · Nopeus {Nopeus}'),
 ob(7,'map','Ikkuna',m='k1',h=200,w=100,start={'k':'xy','x':1,'y':2},zm='px',ts=28,spd={'r':'o5'}),
 ob(8,'text','Ovi auki',body='Lippu on päällä.',req=[{'o':'o3','op':'on'}])]
maps=[{'id':'k1','n':'Käytävä','w':12,'h':5,'fx':[{'id':'f1','n':'Huoneen ovi','k':'zone','vis':True,'trig':'enter','cells':['4,%d'%y for y in range(5)]+['5,%d'%y for y in range(5)],'req':[],'act':[],'tr':'o1'},
  {'id':'f2','n':'Käytävän pää','k':'zone','vis':True,'trig':'enter','cells':['9,%d'%y for y in range(5)],'req':[],'act':[],'tr':'o2'}]}]
PK={'app':'master','projekti':{'name':'Laukaisimet','screens':[{'id':'s1','n':'Peli'}],'objs':objs,'maps':maps,'cfg':{'days':False,'vis':'lukitutpois','tint':'sininen'},'state':{'sel':[],'vals':{}},'seq':8,'sseq':1}}
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); errs=[]
        ctx=await b.new_context(reduced_motion='reduce',viewport={'width':1440,'height':950})
        pg=await ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(U); await pg.wait_for_timeout(300)
        print('==== master 1440 ====')
        await pg.fill('#mempty input','x'); await pg.click('#mempty .mb:text-is("Luo projekti")'); await pg.wait_for_timeout(200)
        await pg.click('#mtabs [data-v="proj"]'); await pg.fill('#v-proj textarea',json.dumps(PK,ensure_ascii=False)); await pg.click('text=Tuo uutena projektina'); await pg.wait_for_timeout(300)
        await pg.click('#mtabs [data-v="build"]'); await pg.wait_for_timeout(200)
        async def P(js): return json.loads(await pg.evaluate("(function(){var P=MASTER.data.projects.filter(x=>x.name==='Laukaisimet')[0];function O(n){return P.objs.filter(o=>o.n===n)[0];}return JSON.stringify("+js+");})()"))
        tila=lambda q='#pscreen': pg.evaluate("(q)=>[...document.querySelectorAll(q+' .ua-tbox')].filter(e=>!e.hidden).map(e=>e.innerText).join(' / ')",q)
        async def walk_to(x,y,page=None,sel='#pscreen',ms=1800):
            page=page or pg
            c=await page.evaluate("(function(){var c=document.querySelector('%s .ua-map canvas'),r=c.getBoundingClientRect();return [r.left,r.top,r.width,r.height];})()" % sel)
            pos=await page.evaluate("(function(){var cs=[...document.querySelectorAll('%s .ua-map canvas')];return null;})()" % sel)
            return c
        def cell(c,hx,hy,x,y,ts=28): return c[0]+c[2]/2+(x+0.5-hx)*ts, c[1]+c[3]/2+(y+0.5-hy)*ts
        print('1 alussa:', await tila(), '| ikkunan nopeus', await pg.evaluate("Object.values(MASTER.maps())[0].spd"))
        c=await walk_to(0,0)
        hx,hy=1.5,2.5
        x,y=cell(c,hx,hy,4,2); await pg.mouse.click(x,y); await pg.wait_for_timeout(1600)
        print('2 huoneen ovella:', await tila())
        mp=await pg.evaluate("(function(){var m=Object.values(MASTER.maps())[0];return [m.pos.x,m.pos.y];})()")
        x,y=cell(c,mp[0],mp[1],7,2); await pg.mouse.click(x,y); await pg.wait_for_timeout(1600)
        print('3 ovelta pois:', await tila())
        await pg.click('#pscreen .ua-row:has-text("Juokse")'); await pg.wait_for_timeout(200)
        print('4 juoksu: nopeus', await pg.evaluate("Object.values(MASTER.maps())[0].spd"))
        mp=await pg.evaluate("(function(){var m=Object.values(MASTER.maps())[0];return [m.pos.x,m.pos.y];})()")
        x,y=cell(c,mp[0],mp[1],10,2); await pg.mouse.click(x,y); await pg.wait_for_timeout(500)
        mp2=await pg.evaluate("(function(){var m=Object.values(MASTER.maps())[0];return [m.pos.x,m.pos.y];})()")
        print('5 juostu käytävän päähän nopeasti (0,5 s):', round(mp2[0],1)>=9.9, '|', await tila())
        await pg.screenshot(path='laukaisin_master.png')
        # editori: tekijälle uusi laukaisin, laukaisimen kortti, säätimen loppu palikasta
        await pg.click('#mtabs [data-v="maps"]'); await pg.wait_for_timeout(200)
        await pg.click('#v-maps [data-addfx="zone"]'); await pg.wait_for_timeout(200)
        await pg.select_option('#fx-tr','+'); await pg.wait_for_timeout(200)
        print('6 uusi laukaisin tekijälle:', await P("[P.maps[0].fx.slice(-1)[0].tr, P.objs.filter(o=>o.t==='trig').map(o=>o.n)]"))
        await pg.click('#v-maps .mb:has-text("Muokkaa laukaisinta")'); await pg.wait_for_timeout(200)
        await pg.click('#f-tmode button[data-v="count"]'); await pg.wait_for_timeout(150)
        await pg.click('#insp .mb:text-is("Laukaise kokeilussa")'); await pg.wait_for_timeout(150); await pg.click('#insp .mb:text-is("Laukaise kokeilussa")'); await pg.wait_for_timeout(150)
        print('7 laskee kerrat:', await P("[O('Tekijä 3').mode,P.state.vals[O('Tekijä 3').id]]"), '| näkyy kortissa:', await pg.evaluate("document.getElementById('insp-status').innerText.slice(0,60)"))
        await pg.click('[data-add="slider"]'); await pg.wait_for_timeout(150)
        await pg.select_option('#insp .nred.nrinl >> nth=1 >> select','o5'); await pg.wait_for_timeout(150)
        print('8 säätimen loppu palikasta:', await P("P.objs.filter(o=>o.t==='slider')[0].max"))
        await pg.click('[data-add="flag"]'); await pg.wait_for_timeout(150)
        print('  lippu lisätty, ei näy puhelimessa:', await pg.evaluate("document.querySelectorAll('#pscreen .ua-list>[data-oid]').length"), '| kortti:', await pg.evaluate("!!document.querySelector('#insp .check')"))
        for v in ['kartta','table']: await pg.click('#mtabs [data-v="%s"]' % v); await pg.wait_for_timeout(150)
        html=await pg.evaluate("MASTER.appHtml()"); ap=os.path.join(os.getcwd(),'laukaisin.html'); open(ap,'w',encoding='utf8').write(html)
        c2=await b.new_context(reduced_motion='reduce',viewport={'width':390,'height':844},has_touch=True); p2=await c2.new_page(); p2.on('pageerror',lambda e:errs.append(str(e)))
        await p2.goto('file://'+ap); await p2.wait_for_timeout(300)
        await p2.click('.ua-row:has-text("Juokse")'); await p2.wait_for_timeout(200)
        cc=await p2.evaluate("(function(){var c=document.querySelector('.ua-map canvas'),r=c.getBoundingClientRect();return [r.left,r.top,r.width,r.height];})()")
        x,y=cell(cc,1.5,2.5,6,2)
        for k in range(2): await p2.mouse.click(x,y); await p2.wait_for_timeout(700)  # hahmo pysyy keskellä: kaksi viiden ruudun askelta
        print('9 viety appi 390:', await p2.evaluate("[...document.querySelectorAll('.ua-tbox')].filter(e=>!e.hidden).map(e=>e.innerText).join(' / ')"), '| leveys', await p2.evaluate("[document.documentElement.scrollWidth,innerWidth]"))
        await p2.screenshot(path='laukaisin_390.png'); await c2.close()
        print('errs', errs)
        await b.close()
asyncio.run(main())
