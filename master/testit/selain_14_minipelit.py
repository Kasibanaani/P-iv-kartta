# Versio 12: minipelien palikat. Ajastin (aikaraja, toistuva tapahtuma, aika loppuu, ennätys), sade-minipeli (kohteet putoavat,
# napautus vie vaiheen eteenpäin, sivupalkin varaus, pysähtyy ajan loppuessa), kohdelista (rivin avaus, väärä ja oikea vaihtoehto),
# alapalkista piilotettu ruutu, uusien lajien muokkausnäkymät masterissa ja viety appi puhelinleveyksillä 390 ja 320 px.
# Kuvakaappaukset minipelit_*.png.
import asyncio, os, json
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
def ob(i,t,n,s,**kw):
    x={'id':'o%d'%i,'t':t,'n':n,'s':s,'req':[],'suf':[]}
    if t=='choice':x.update(v=1,note='',ex=[],hl=[],beh='hold',act=[],lact=[])
    if t=='counter':x.update(start=0,min='',max='',show='hidden',keep=False,unit='')
    x.update(kw);return x
objs=[ob(1,'timer','Aika','s1',dir='down',len=30,every=5,show='bar',dec=0,unit='s',act=[],eact=[]),
 ob(2,'text','Tilanne','s1',title=False,body='Valmiit {Valmiit} · Ohi {Ohi} · Oikein {Oikein} · Väärin {Väärin} · Tikit {Tikit} · Ennätys {Ennätys}'),
 ob(3,'counter','Tikit','s1'),ob(4,'counter','Valmiit','s1'),ob(5,'counter','Ohi','s1'),ob(6,'counter','Oikein','s1'),ob(7,'counter','Väärin','s1'),ob(8,'counter','Tyhjät','s1'),
 ob(9,'counter','Ennätys','s1',start='',keep=True),
 ob(10,'choice','Aloita','s1',req=[{'o':'o1','op':'stop'}],act=[{'do':'clear','o':'o4'},{'do':'clear','o':'o1'},{'do':'tstart','o':'o1'}]),
 ob(11,'rain','Sade','s1',kinds=[{'id':'k1','n':'Puhelu','ic':'☎','st':['Vastaa','Kuittaa'],'w':1,'auto':True,'own':True},{'id':'k2','n':'Posti','ic':'✉','st':['Lue'],'w':1,'auto':True,'own':False}],
    rate={'k':'num','v':0.6},fall={'k':'num','v':8},lanes=4,h=300,run='o1',done=[{'do':'add','o':'o4','v':1}],miss=[{'do':'add','o':'o5','v':1}]),
 ob(12,'items','Lista','s1',rows='Eka\nToka\nKolmas',opts='A\nB\nC\nD\nE\nF',need=2,cols=3,life={'k':'num','v':20},run='o1',
    ok=[{'do':'add','o':'o6','v':1}],bad=[{'do':'add','o':'o7','v':1}],empty=[{'do':'add','o':'o8','v':1}],back=[{'do':'add','o':'o8','v':-1}]),
 ob(13,'choice','Minipeliin','s1',act=[{'do':'goto','s':'s2'}]),
 ob(14,'text','Piilotettu','s2',body='Tähän pääsee vain painikkeesta.'),
 ob(15,'choice','Takaisin','s2',act=[{'do':'goto','s':'s1'}])]
objs[0]['eact']=[{'do':'add','o':'o3','v':1}]
objs[0]['act']=[{'do':'best','o':'o9','from':'o4','dir':'max'},{'do':'msg','t':'Aika loppui: {Valmiit}.'}]
PK={'app':'master','projekti':{'name':'Minipelit','screens':[{'id':'s1','n':'Peli'},{'id':'s2','n':'Minipeli','nav':False}],'objs':objs,
    'cfg':{'days':False,'vis':'lukitutpois','tint':'sininen'},'state':{'sel':[],'vals':{}},'seq':15,'sseq':2}}
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
        txt=lambda q='#pscreen': pg.evaluate("(q)=>{var t=[...document.querySelectorAll(q+' .ua-tbox')].filter(e=>!e.hidden).map(e=>e.innerText);return t.join(' / ');}",q)
        print('1 alapalkki piilotettu (yksi näkyvä ruutu):', await pg.evaluate("document.querySelectorAll('#pscreen .ua-tabs').length"))
        await pg.click('#pscreen .ua-row:has-text("Minipeliin")'); await pg.wait_for_timeout(200)
        print('  piilotettu ruutu painikkeesta:', await txt())
        await pg.click('#pscreen .ua-row:has-text("Takaisin")'); await pg.wait_for_timeout(200)
        print('2 ennen aloitusta: sade odottaa:', await pg.evaluate("Object.values(MASTER.rains()).map(r=>[r.run,r.items.length])"), '| lista:', await pg.evaluate("Object.values(MASTER.items()).map(r=>[r.run,r.rows.length])"))
        await pg.click('#pscreen .ua-row:has-text("Aloita")'); await pg.wait_for_timeout(1300)
        t1=await pg.inner_text('#pscreen .ua-timer b')
        print('3 aloitettu: ajastin', t1, '| Aloita piilossa:', await pg.evaluate("[...document.querySelectorAll('#pscreen .ua-row')].filter(e=>!e.hidden).map(e=>e.innerText.trim())"))
        rs=await pg.evaluate("Object.values(MASTER.rains())[0].items.length")
        print('  sade käy, kohteita:', rs>0, '| lista käy:', await pg.evaluate("Object.values(MASTER.items())[0].run"))
        # napautetaan kohdetta niin monta kertaa kuin sillä on vaiheita
        async def tapItem():
            q=await pg.evaluate("""(function(){var rp=Object.values(MASTER.rains())[0],it=rp.items[0];if(!it)return null;var r=rp.cv.getBoundingClientRect(),L=rp.o.lanes,ih=Math.max(44,Math.min(78,r.width/L*0.82));
              var k=rp.o.kinds.filter(function(x){return x.id===it.k;})[0];return [r.left+(it.lane+0.5)*r.width/L,r.top+it.y*(r.height-ih)+ih/2,k.st.length-it.st];})()""")
            if not q: return False
            for i in range(q[2]): await pg.mouse.click(q[0],q[1]+i*1.5); await pg.wait_for_timeout(60)
            return True
        await tapItem(); await pg.wait_for_timeout(250)
        print('4 kohde kuitattu loppuun:', await txt())
        n0=await pg.evaluate("Object.values(MASTER.rains())[0].items.length")
        await pg.click('#pscreen .ua-rbook'); await pg.wait_for_timeout(120)
        n1=await pg.evaluate("Object.values(MASTER.rains())[0].items.length")
        print('  varaus sivupalkista lisää kohteen:', n1>=n0+1 or n1>=4)
        # kohdelista: väärä ja oikeat
        await pg.click('#pscreen .ua-irow >> nth=0'); await pg.wait_for_timeout(200)
        need=await pg.evaluate("[...document.querySelectorAll('#pscreen .ua-isheet:not([hidden]) .ua-ichip')].map(e=>e.textContent)")
        wrong=[x for x in 'ABCDEF' if x not in need][0]
        await pg.click('#pscreen .ua-isheet:not([hidden]) .ua-iopt:text-is("%s")' % wrong); await pg.wait_for_timeout(150)
        for n in need: await pg.click('#pscreen .ua-isheet:not([hidden]) .ua-iopt:text-is("%s")' % n); await pg.wait_for_timeout(120)
        print('5 lista: tarpeita', len(need), '| väärä ja oikeat:', await txt(), '| ikkuna sulkeutui:', await pg.evaluate("!document.querySelector('#pscreen .ua-isheet:not([hidden])')"))
        print('  palkki täynnä:', await pg.evaluate("Object.values(MASTER.items())[0].rows[0].lvl>0.97"))
        await pg.screenshot(path='minipelit_master.png')
        # toistuva tapahtuma ja aika loppuu: kello siirretään eteenpäin
        await pg.evaluate("ENG.setNow(Date.now()+11000)"); await pg.wait_for_timeout(400)
        print('6 toistuva tapahtuma (11 s): tikit', await pg.evaluate("MASTER.data.projects.filter(x=>x.name==='Minipelit')[0].state.vals.o3"))
        await pg.evaluate("ENG.setNow(Date.now()+40000)"); await pg.wait_for_timeout(500); await pg.evaluate("ENG.setNow(null)")
        print('7 aika loppui:', await pg.inner_text('#pscreen .ua-itext'), '|', await txt())
        print('  sade ja lista pysähtyivät:', await pg.evaluate("[Object.values(MASTER.rains())[0].run,Object.values(MASTER.rains())[0].items.length,Object.values(MASTER.items())[0].run]"), '| Aloita näkyy:', await pg.evaluate("!document.querySelector('#pscreen .ua-row[data-oid=\"o10\"]').hidden"))
        # muokkausnäkymät
        async def pick(n): await pg.click('.oname:has(.on:text-is("%s"))' % n); await pg.wait_for_timeout(150)
        await pick('Aika'); print('8 ajastimen kortti:', await pg.evaluate("[!!document.getElementById('f-dir'),!!document.getElementById('f-len'),!!document.getElementById('f-every'),document.querySelectorAll('#insp [data-acts]').length]"))
        await pg.click('#f-dir button[data-v="up"]'); await pg.wait_for_timeout(150)
        print('  laji sekuntikelloksi:', await pg.evaluate("MASTER.data.projects.filter(x=>x.name==='Minipelit')[0].objs[0].dir"))
        await pick('Sade'); k0=await pg.evaluate("document.querySelectorAll('#insp .kindrow').length")
        await pg.click('#insp .mb:text-is("+ Kohdetyyppi")'); await pg.wait_for_timeout(150)
        print('  sateen kohdetyypit:', k0, '→', await pg.evaluate("document.querySelectorAll('#insp .kindrow').length"), '| toimintolistat:', await pg.evaluate("[...document.querySelectorAll('#insp [data-acts]')].map(e=>e.dataset.acts)"))
        await pick('Lista'); print('  kohdelistan kortti:', await pg.evaluate("[!!document.getElementById('f-rows'),!!document.getElementById('f-opts'),[...document.querySelectorAll('#insp [data-acts]')].map(e=>e.dataset.acts)]"))
        await pick('Aloita')
        acts='#insp [data-acts="act"]'
        await pg.select_option(acts+'>select:last-of-type', 'best'); await pg.wait_for_timeout(150)
        await pg.fill(acts+' .rule:last-of-type input.pct','40'); await pg.press(acts+' .rule:last-of-type input.pct','Tab'); await pg.wait_for_timeout(150)
        print('  uusi toiminto Tallenna ennätys ja todennäköisyys:', await pg.evaluate("JSON.stringify(MASTER.data.projects.filter(x=>x.name==='Minipelit')[0].objs.filter(o=>o.n==='Aloita')[0].act.slice(-1))"))
        await pg.click('.scr [data-nav="s1"]'); await pg.wait_for_timeout(150)
        print('9 ruutu piilotettu alapalkista:', await pg.evaluate("MASTER.data.projects.filter(x=>x.name==='Minipelit')[0].screens.map(s=>s.nav)"))
        await pg.click('.scr [data-nav="s1"]'); await pg.click('.scr [data-nav="s2"]'); await pg.wait_for_timeout(150)
        print('  kaksi alapalkissa:', await pg.evaluate("[...document.querySelectorAll('#pscreen .ua-tabs button')].map(b=>b.textContent)"))
        await pg.click('.scr [data-nav="s2"]'); await pg.wait_for_timeout(100)
        for v in ['kartta','table','stats']: await pg.click('#mtabs [data-v="%s"]' % v); await pg.wait_for_timeout(150)
        print('  muut välilehdet aukeavat ilman virheitä')
        html=await pg.evaluate("MASTER.appHtml()"); ap=os.path.join(os.getcwd(),'minipelit.html'); open(ap,'w',encoding='utf8').write(html)
        for pw in (390,320):
            c2=await b.new_context(reduced_motion='reduce',viewport={'width':pw,'height':844},has_touch=True); p2=await c2.new_page(); p2.on('pageerror',lambda e:errs.append(str(e)))
            await p2.goto('file://'+ap); await p2.wait_for_timeout(300)
            await p2.evaluate("ENG.setRnd(function(){return 0;})")
            await p2.click('.ua-row:has-text("Aloita")'); await p2.wait_for_timeout(500)
            await p2.click('.ua-rbook'); await p2.wait_for_timeout(80)
            r=await p2.evaluate("(function(){var r=document.querySelector('.ua-rstage canvas').getBoundingClientRect();return [r.left,r.top,r.width,r.height];})()")
            await p2.mouse.click(r[0]+r[2]/8, r[1]+18); await p2.wait_for_timeout(60); await p2.mouse.click(r[0]+r[2]/8, r[1]+20); await p2.wait_for_timeout(250)
            t=await p2.evaluate("document.querySelector('.ua-tbox').innerText")
            await p2.click('.ua-irow >> nth=1'); await p2.wait_for_timeout(200)
            need=await p2.evaluate("[...document.querySelectorAll('.ua-isheet:not([hidden]) .ua-ichip')].map(e=>e.textContent)")
            await p2.screenshot(path='minipelit_%d_lista.png' % pw)
            for n in need: await p2.click('.ua-isheet:not([hidden]) .ua-iopt:text-is("%s")' % n); await p2.wait_for_timeout(120)
            t2=await p2.evaluate("document.querySelector('.ua-tbox').innerText")
            print('10 viety appi %d px: kohde kuitattu napauttamalla:' % pw, 'Valmiit 1' in t, '| lista uusittu:', 'Oikein 1' in t2, '| ajastin:', await p2.inner_text('.ua-timer b'),
                  '| leveys', await p2.evaluate("[document.documentElement.scrollWidth, window.innerWidth]"), '| alapalkki:', await p2.evaluate("document.querySelectorAll('.ua-tabs').length"))
            await p2.screenshot(path='minipelit_%d.png' % pw, full_page=True)
            await c2.close()
        print('errs', errs)
        await b.close()
asyncio.run(main())
