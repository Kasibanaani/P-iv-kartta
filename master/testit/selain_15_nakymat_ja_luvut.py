# Versio 13: välilehdet ja näkymät sekä luku tai palikka. Näkymässä alapalkki on piilossa, Palaa takaisin vie sinne, mistä tultiin,
# ja käyttäjän oma välilehtivalinta nollaa paluuhistorian. Toiminnon arvo, ajastimen kesto ja todennäköisyys valitaan luvuksi tai palikaksi.
# Masterissa 1440 px ja viedyssä apissa 390 px. Kuvakaappaukset nakymat_*.png.
import asyncio, os, json
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
def ob(i,t,n,s,**kw):
    x={'id':'o%d'%i,'t':t,'n':n,'s':s,'req':[],'suf':[]}
    if t=='choice':x.update(v=1,note='',ex=[],hl=[],beh='hold',act=[],lact=[])
    x.update(kw);return x
objs=[ob(1,'slider','Vaikeus','s1',min=1,max=5,step=1,start=2,lo='',hi='',unit=''),
 ob(2,'calc','Kerroin','s1',mode='f',f='[Vaikeus]*3',show='number',agg={'op':'sum','ids':[]},cases=[],els={'k':'num','v':0},min=0,max=10,dec='',unit=''),
 ob(3,'choice','Pelaa','s1',act=[{'do':'goto','s':'s2'}]),
 ob(4,'counter','Pisteet','s2',start=0,min='',max='',show='number',keep=False,unit=''),
 ob(5,'choice','Lisää','s2',act=[{'do':'add','o':'o4','v':{'r':'o2'}}]),
 ob(6,'choice','Takaisin','s2',act=[{'do':'back'}]),
 ob(7,'choice','Pelaamaan','s3',act=[{'do':'goto','s':'s2'}]),
 ob(8,'timer','Kello','s2',dir='down',len=10,every=0,show='number',dec=0,unit='s',act=[],eact=[])]
PK={'app':'master','projekti':{'name':'Näkymät','screens':[{'id':'s1','n':'Koti'},{'id':'s3','n':'Tulokset'},{'id':'s2','n':'Peli','nav':False}],'objs':objs,
    'cfg':{'days':False,'vis':'lukitutpois','tint':'sininen'},'state':{'sel':[],'vals':{}},'seq':8,'sseq':3}}
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
        tabs=lambda q='#pscreen': pg.evaluate("(q)=>[...document.querySelectorAll(q+' .ua-tabs button')].map(b=>b.textContent+(b.getAttribute('aria-selected')==='true'?'*':''))",q)
        rows=lambda q='#pscreen': pg.evaluate("(q)=>[...document.querySelectorAll(q+' .ua-list>*')].filter(e=>!e.hidden).map(e=>e.innerText.replace(/\\n/g,' ').trim())",q)
        async def P(js): return json.loads(await pg.evaluate("(function(){var P=MASTER.data.projects.filter(x=>x.name==='Näkymät')[0];function O(n){return P.objs.filter(o=>o.n===n)[0];}return JSON.stringify("+js+");})()"))
        print('1 välilehdet:', await tabs())
        await pg.click('#pscreen .ua-row:has-text("Pelaa")'); await pg.wait_for_timeout(200)
        print('2 näkymässä: alapalkki', await tabs(), '| sisältö', await rows())
        await pg.click('#pscreen .ua-row:has-text("Lisää")'); await pg.wait_for_timeout(150)
        print('3 lisää palikan arvon (Kerroin = 2*3):', await P("P.state.vals.o4"))
        await pg.click('#pscreen .ua-row:has-text("Takaisin")'); await pg.wait_for_timeout(200)
        print('4 palaa takaisin:', await tabs())
        await pg.click('#pscreen .ua-tabs button:has-text("Tulokset")'); await pg.wait_for_timeout(150)
        await pg.click('#pscreen .ua-row:has-text("Pelaamaan")'); await pg.wait_for_timeout(150); await pg.click('#pscreen .ua-row:has-text("Takaisin")'); await pg.wait_for_timeout(150)
        print('5 palaa sinne, mistä tultiin:', await tabs())
        # muokkaus: toiminnon arvo luvuksi ja takaisin palikaksi
        await pg.click('.oname:has(.on:text-is("Lisää"))'); await pg.wait_for_timeout(150)
        sel='#insp [data-acts="act"] .rule >> nth=0'
        print('6 arvon lähde:', await pg.evaluate("(function(){var s=document.querySelector('#insp [data-acts=\"act\"] .rule [data-src] select');return s.options[s.selectedIndex].text;})()"))
        await pg.select_option('#insp [data-acts="act"] .rule [data-src] select','#'); await pg.wait_for_timeout(150)
        await pg.fill('#insp [data-acts="act"] .rule [data-src] input','4'); await pg.press('#insp [data-acts="act"] .rule [data-src] input','Tab'); await pg.wait_for_timeout(150)
        print('  luvuksi 4:', await P("O('Lisää').act[0]"))
        await pg.select_option('#insp [data-acts="act"] .rule [data-src] select','o1'); await pg.wait_for_timeout(150)
        print('  palikaksi Vaikeus:', await P("O('Lisää').act[0]"), '| lukukenttä piilossa:', await pg.locator('#insp [data-acts="act"] .rule [data-src] input').count()==0)
        await pg.select_option('#insp [data-acts="act"] .rule .nred.pw select','o1'); await pg.wait_for_timeout(150)
        print('  todennäköisyys palikasta:', await P("O('Lisää').act[0].p"))
        await pg.select_option('#insp [data-acts="act"] .rule .nred.pw select','#'); await pg.wait_for_timeout(150)
        print('  takaisin aina (ei todennäköisyyttä):', await P("O('Lisää').act[0]"))
        await pg.click('.oname:has(.on:text-is("Kello"))'); await pg.wait_for_timeout(150)
        await pg.select_option('#insp .nrrow select >> nth=0','o2'); await pg.wait_for_timeout(150)
        print('7 ajastimen kesto palikasta:', await P("O('Kello').len"), '| puhelimessa:', await pg.evaluate("document.querySelector('#pscreen .ua-timer')?'näkyy':'ei tällä ruudulla'"))
        await pg.click('[data-newview]'); await pg.wait_for_timeout(150)
        print('8 uusi näkymä:', await P("P.screens.map(s=>[s.n,s.nav===false])"), '| otsikon painike:', await pg.evaluate("[...document.querySelectorAll('.scr [data-nav]')].map(b=>b.textContent)"))
        await pg.click('[data-newscreen]'); await pg.wait_for_timeout(150)
        print('  uusi välilehti:', await P("P.screens.slice(-1).map(s=>[s.n,s.nav===false])"))
        for v in ['kartta','table']: await pg.click('#mtabs [data-v="%s"]' % v); await pg.wait_for_timeout(150)
        await pg.click('#mtabs [data-v="build"]'); await pg.wait_for_timeout(150)
        await pg.screenshot(path='nakymat_master.png')
        html=await pg.evaluate("MASTER.appHtml()"); ap=os.path.join(os.getcwd(),'nakymat.html'); open(ap,'w',encoding='utf8').write(html)
        c2=await b.new_context(reduced_motion='reduce',viewport={'width':390,'height':844},has_touch=True); p2=await c2.new_page(); p2.on('pageerror',lambda e:errs.append(str(e)))
        await p2.goto('file://'+ap); await p2.wait_for_timeout(300)
        t0=await p2.evaluate("[...document.querySelectorAll('.ua-tabs button')].map(b=>b.textContent)"); await p2.click('.ua-row:has-text("Pelaa")'); await p2.wait_for_timeout(200); t1=await p2.evaluate("document.querySelectorAll('.ua-tabs').length")
        await p2.click('.ua-row:has-text("Lisää")'); await p2.wait_for_timeout(150); v=await p2.inner_text('.ua-num b')
        await p2.screenshot(path='nakymat_390.png')
        await p2.click('.ua-row:has-text("Takaisin")'); await p2.wait_for_timeout(200)
        print('9 viety appi 390: välilehdet', len(t0), '| näkymässä alapalkkeja', t1, '| pisteet', v, '| takaisin:', await p2.evaluate("[...document.querySelectorAll('.ua-tabs button')].map(b=>b.textContent+(b.getAttribute('aria-selected')==='true'?'*':''))"))
        await c2.close()
        print('errs', errs)
        await b.close()
asyncio.run(main())
