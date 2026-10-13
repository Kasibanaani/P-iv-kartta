# Versio 15: Ketjut-välilehti (versiosta 16 alkaen Lista-näkymä). Uusi ketju, palikoiden raahaus paletista JOS-, TAI- ja NIIN-kohtiin sekä vertailun arvoon,
# ruutu NIIN-kohtaan (Siirry ruutuun), laukaisimien nollaus, käytössä-kytkin, korostus paletista, tapahtumakortit
# (painike, laukaisin, maailman tekijä) ja raahaus Rakenteen listasta luvun kenttään. Ketju toimii puhelimessa ja viedyssä apissa 390 px.
# Kuvakaappaukset ketjut_*.png.
import asyncio, os, json
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
def ob(i,t,n,s='s1',**kw):
    x={'id':'o%d'%i,'t':t,'n':n,'s':s,'req':[],'suf':[]}
    if t=='choice':x.update(v=1,note='',ex=[],hl=[],beh='hold',act=[],lact=[])
    if t=='counter':x.update(start=0,min='',max='',show='number',keep=False,unit='')
    x.update(kw);return x
objs=[ob(1,'counter','Pisteet'),ob(2,'slider','Tavoite',min=0,max=10,step=1,start=3,lo='',hi='',unit=''),ob(3,'flag','Avain',init=False),ob(4,'trig','Ovi',mode='latch',act=[]),
 ob(5,'choice','Ota avain',act=[{'do':'select','o':'o3'}]),ob(6,'choice','Kulje ovesta',act=[{'do':'fire','o':'o4'}]),
 ob(7,'text','Palkinto',s='s2',body='Pääsit sisään!'),ob(8,'choice','Takaisin',s='s2',act=[{'do':'back'}]),
 ob(9,'map','Ikkuna',m='k1',h=160,w=100,start={'k':'xy','x':1,'y':1})]
maps=[{'id':'k1','n':'Piha','w':8,'h':3,'fx':[{'id':'f1','n':'Ovi','k':'zone','vis':True,'trig':'enter','cells':['5,0','5,1','5,2'],'req':[],'act':[],'tr':'o4'}]}]
PK={'app':'master','projekti':{'name':'Ketjutesti','screens':[{'id':'s1','n':'Piha'},{'id':'s2','n':'Sisällä','nav':False}],'objs':objs,'maps':maps,'cfg':{'days':False,'vis':'lukitutpois','tint':'sininen'},'state':{'sel':[],'vals':{}},'seq':9,'sseq':2}}
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); errs=[]
        ctx=await b.new_context(reduced_motion='reduce',viewport={'width':1440,'height':950})
        pg=await ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(U); await pg.wait_for_timeout(300)
        print('==== master 1440 ====')
        await pg.fill('#mempty input','x'); await pg.click('#mempty .mb:text-is("Luo projekti")'); await pg.wait_for_timeout(200)
        await pg.click('#mtabs [data-v="proj"]'); await pg.fill('#v-proj textarea',json.dumps(PK,ensure_ascii=False)); await pg.click('text=Tuo uutena projektina'); await pg.wait_for_timeout(300)
        async def P(js): return json.loads(await pg.evaluate("(function(){var P=MASTER.data.projects.filter(x=>x.name==='Ketjutesti')[0];function O(n){return P.objs.filter(o=>o.n===n)[0];}return JSON.stringify("+js+");})()"))
        await pg.click('#mtabs [data-v="ketjut"]'); await pg.wait_for_timeout(200); await pg.click('#kv-mode button[data-v="lista"]'); await pg.wait_for_timeout(200)
        print('1 tapahtumat:', await pg.evaluate("[...document.querySelectorAll('#v-ketjut .kje .kjhead')].map(h=>h.innerText.replace(/\\s+/g,' ').replace(/ (Rakenteessa|Maailmassa)$/,''))"))
        print('  paletin ryhmät:', await pg.evaluate("[...document.querySelectorAll('#v-ketjut .kjpal h4')].map(h=>h.textContent)"))
        await pg.click('#v-ketjut .mb:text-is("+ Uusi ketju")'); await pg.wait_for_timeout(250)
        card='#v-ketjut .kjc >> nth=0'
        print('2 uusi ketju:', await P("P.objs.filter(o=>o.t==='cond').map(o=>o.n)"), '| tila:', await pg.inner_text(card+' >> .kjst'))
        async def drag(src,dst): await pg.drag_and_drop(src,dst); await pg.wait_for_timeout(200)
        await drag('#v-ketjut .kjchip[data-oid="o4"]', card+' >> [data-drop="req"]')
        await drag('#v-ketjut .kjchip[data-oid="o3"]', card+' >> [data-drop="req"]')
        await drag('#v-ketjut .kjchip[data-scr="s2"]', card+' >> [data-drop="act"]')
        await drag('#v-ketjut .kjchip[data-oid="o1"]', card+' >> [data-drop="act"]')
        print('3 raahattu JOS: Ovi, Avain; NIIN: Sisällä, Pisteet:', await P("[O('Ketju').req,O('Ketju').act]"))
        await drag('#v-ketjut .kjchip[data-oid="o1"]', card+' >> [data-drop="suf"]')
        await drag('#v-ketjut .kjchip[data-oid="o2"]', card+' >> [data-drop="suf"] >> .nred')
        print('4 TAI: Pisteet ≥ [Tavoite] raahaamalla:', await P("O('Ketju').suf"), '| tekstinä:', await pg.evaluate("document.querySelector('#v-ketjut .kjc [data-drop=\"suf\"] .nred select').selectedOptions[0].text"))
        await pg.click(card+' >> [data-drop="suf"] .rule .x >> nth=-1'); await pg.wait_for_timeout(150)  # TAI-ehto pois, muuten sekin vaaditaan
        print('  TAI tyhjäksi:', await P("O('Ketju').suf"))
        await pg.click(card+' >> .kjrst input'); await pg.wait_for_timeout(150)
        await pg.click(card+' >> .kjon input'); await pg.wait_for_timeout(150)
        print('5 nollaus ja pois käytöstä:', await P("[O('Ketju').rst,O('Ketju').off]"), '| tila:', await pg.inner_text(card+' >> .kjst'), '| harmaa:', await pg.evaluate("document.querySelector('#v-ketjut .kjc').classList.contains('off')"))
        await pg.click('#v-ketjut .kjon input'); await pg.wait_for_timeout(150)
        await pg.click('#v-ketjut .kjchip[data-oid="o4"]'); await pg.wait_for_timeout(150)
        print('6 korostus Ovi:', await pg.evaluate("[...document.querySelectorAll('#v-ketjut .kjcard.mark')].map(c=>c.dataset.kj||c.dataset.ev)"))
        await pg.screenshot(path='ketjut_master.png')
        # puhelimessa: avain ja ovi → ketju laukeaa, siirtää näkymään, Pisteet +1, ovi nollautuu
        await pg.click('#pscreen .ua-row:has-text("Kulje ovesta")'); await pg.wait_for_timeout(150)
        t0=await P("[P.state.vals.o1||0,P.state.vals.o4||0]")
        await pg.click('#pscreen .ua-row:has-text("Ota avain")'); await pg.wait_for_timeout(250)
        print('7 ilman avainta', t0, '| avaimen jälkeen: ruutu', await pg.evaluate("document.querySelector('#pscreen .ua-tbox')?document.querySelector('#pscreen .ua-tbox').innerText:''"), '| pisteet ja ovi:', await P("[P.state.vals.o1,P.state.vals.o4||0]"), '| tila:', await pg.inner_text('#v-ketjut .kjc .kjst'))
        await pg.click('#pscreen .ua-row:has-text("Takaisin")'); await pg.wait_for_timeout(200)
        # Rakenne: raahaus listasta luvun kenttään
        await pg.click('#mtabs [data-v="build"]'); await pg.wait_for_timeout(150)
        await pg.click('.oname:has(.on:text-is("Ota avain"))'); await pg.wait_for_timeout(150)
        await pg.select_option('#insp [data-acts="act"]>select:last-of-type','add'); await pg.wait_for_timeout(150)
        await pg.drag_and_drop('.oname:has(.on:text-is("Tavoite"))','#insp [data-acts="act"] .rule >> nth=1 >> [data-src]'); await pg.wait_for_timeout(200)
        print('8 Rakenteesta raahattu arvoksi:', await P("O('Ota avain').act[1]"))
        await pg.click('#mtabs [data-v="kartta"]'); await pg.wait_for_timeout(150); await pg.click('#mtabs [data-v="table"]'); await pg.wait_for_timeout(150)
        print('  taulukossa ketju:', await pg.evaluate("[...document.querySelectorAll('#v-table tr')].filter(r=>r.innerText.indexOf('Ketju')===0).map(r=>r.innerText.replace(/\\s+/g,' ').slice(0,140))"))
        html=await pg.evaluate("MASTER.appHtml()"); ap=os.path.join(os.getcwd(),'ketjut.html'); open(ap,'w',encoding='utf8').write(html)
        c2=await b.new_context(reduced_motion='reduce',viewport={'width':390,'height':844},has_touch=True); p2=await c2.new_page(); p2.on('pageerror',lambda e:errs.append(str(e)))
        await p2.goto('file://'+ap); await p2.wait_for_timeout(300)
        await p2.click('.ua-row:has-text("Ota avain")'); await p2.wait_for_timeout(150)
        cc=await p2.evaluate("(function(){var c=document.querySelector('.ua-map canvas'),r=c.getBoundingClientRect();return [r.left,r.top,r.width,r.height];})()")
        await p2.mouse.click(cc[0]+cc[2]/2+4.5*32, cc[1]+cc[3]/2); await p2.wait_for_timeout(1500)
        print('9 viety appi 390: hahmo ovelle → ketju:', await p2.evaluate("[...document.querySelectorAll('.ua-tbox')].map(e=>e.innerText).join(' / ')"), '| alapalkki', await p2.evaluate("document.querySelectorAll('.ua-tabs').length"))
        await p2.screenshot(path='ketjut_390.png'); await c2.close()
        print('errs', errs)
        await b.close()
asyncio.run(main())
