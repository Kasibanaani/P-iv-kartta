"""Juuri 1.109 (Emil 19.11.2026): Flow. Ruutuparit (Aloitus, Tai, Ja, Pois, Loppu; laji rullaa pienestä napista), asiat ruutuihin pienestä
ikkunasta, käyttö (poissulku voittaa, peruminen, lopetus), asian Flow Asiat-kortilla (+ Uusi Flow -oikotie) ja Ruudun ikkunan Flow-nappi
rivikohtaisesti (vihreä, jälki muistiinpanoksi). Asiat-kortit: valinnat nimettyinä nappeina, rivit vierivät yhdessä.
390 ja 320 px kosketuksella, 1280 hiirellä."""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from apu import tab, menu
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
K="JSON.parse(localStorage.getItem('paatospuu:v1')).kokonaisuudet[0]"
OVER="""(function(){var w=document.documentElement.clientWidth,out=[];document.querySelectorAll('button,input').forEach(function(e){var r=e.getBoundingClientRect();
 if(r.width&&r.height&&e.offsetParent!==null&&!e.closest('.hscroll,.lwv')&&(r.right>w+0.5||r.left<-0.5))out.push((e.id||e.className||e.tagName)+' '+Math.round(r.left)+'..'+Math.round(r.right));});return JSON.stringify(out);})()"""
async def run(p,w,h,touch):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h},has_touch=touch,is_mobile=touch)).new_page()
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond):
        print('  %-56s %s'%(label,'ok' if cond else 'VIRHE'))
        if not cond: bad.append(label)
    async def tap(sel):
        if touch: await pg.tap(sel)
        else: await pg.click(sel)
        await pg.wait_for_timeout(120)
    async def out():
        await pg.mouse.click(6,h-6); await pg.wait_for_timeout(150)
    async def txts(sel): return await pg.evaluate("[].map.call(document.querySelectorAll('%s'),function(e){return e.textContent;}).join()"%sel)
    T=lambda:pg.evaluate(K+".yksinkertaisetPuut[0]")
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(300)
    await tab(pg,'use'); await pg.fill('#firstproj','Koe'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await pg.evaluate("""(function(){var o=JSON.parse(localStorage.getItem('paatospuu:v1')),k=o.kokonaisuudet[0],t='2026-11-01T08:00:00.000Z';
      k.termit=[{id:'t1',name:'Lääkkeet',yes:[],no:[],ev:7},{id:'t2',name:'Pyykit',yes:[],no:[],ev:7}];k.tarkeat=['t1','t2'];
      k.tarkistuslista=[{id:'c1',name:'Kettu',created:t,it:[{id:'t1'},{id:'t2'}]},{id:'c2',name:'Siili',created:t,it:[{id:'t1'},{id:'t2'}]}];k.jatkuvalista={tk:['t1','t2']};
      localStorage.setItem('paatospuu:v1',JSON.stringify(o));})()""")
    await pg.reload(); await pg.wait_for_timeout(300)
    # Asiat-kortit
    await tab(pg,'terms'); await pg.wait_for_timeout(200)
    want('ei otsikkoriviä, asiat kortteina', await pg.locator('#thead').count()==0 and await pg.locator('#implist .tcard').count()==2)
    lab=await txts('#implist .tcard[data-id="t1"] .tstrip .evc')
    want('valinnat lukevat napeissa (Flow, Kerran, Päivä, välit)', lab.startswith('Flow,Kerran,Päivä,1 pv,1 vk') and lab.endswith('12 kk'))
    want('väli näkyy valittuna napissa', await pg.get_attribute('#implist .tcard[data-id="t1"] .evc[data-ev="7"]','aria-pressed')=='true')
    await pg.evaluate("document.getElementById('implist').scrollLeft=120"); await pg.wait_for_timeout(120)
    sl=await pg.evaluate("[document.getElementById('implist').scrollLeft].concat([].map.call(document.querySelectorAll('#implist .tstrip .evc[data-ev=\"7\"]'),function(e){return Math.round(e.getBoundingClientRect().left);}))")
    nx=await pg.evaluate("[].map.call(document.querySelectorAll('#implist .tcard>.tfix'),function(e){return Math.round(e.getBoundingClientRect().left);})")
    want('valintarivit vierivät yhdessä (1.110 yksi taulukko), nimet paikallaan', len(set(sl[1:]))==1 and (sl[0]>0 or w>1000) and len(set(nx))==1)
    want('ei sivun vaakavieritystä (Asiat)', await pg.evaluate(OVER)=='[]')
    # Flow-osio
    await tab(pg,'puu'); await pg.wait_for_timeout(200)
    want('osion nimi Flow', await pg.evaluate("document.getElementById('roll-now')?document.getElementById('roll-now').textContent:''") in ('Flow','') and await pg.locator('#st-newtree').count()==1)
    await pg.fill('#st-newtree','Lääkekierto'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(150)
    want('uusi Flow: Rakenna päällä, Aloitus-pari valmiina', await pg.get_attribute('#st-build','aria-pressed')=='true' and await pg.locator('#st-rules .strule').count()==1 and await pg.locator('#st-rules .stbox.ty-a').count()==1)
    await tap('#st-rules .strule:nth-child(1) .stplus[data-side="c"]')
    want('lisäysikkuna aukeaa', await pg.is_visible('#stpop') and await pg.is_visible('#st-new'))
    for n in ['Annos','Ohita']:
        await pg.fill('#st-new',n); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
    await out(); want('ulkopuolinen napautus sulkee', not await pg.is_visible('#stpop'))
    t=await T(); F={x['n']:x['id'] for x in t['f']}
    want('Aloitusruutu sisältää Annos ja Ohita (1.111)', t['r'][0]['c']==[F['Annos'],F['Ohita']] and t['r'][0]['e']==[] and t['r'][0]['lg']=='tai')
    # pari 2: Tai Annos -> Tarkistettu; laji rullaa pienestä napista
    await tap('#st-addrule'); r2='#st-rules .strule:nth-child(2)'
    seq=[await pg.text_content(r2+' .sttyc')]
    for i in range(5):
        await tap(r2+' .sttyc'); seq.append(await pg.text_content(r2+' .sttyc'))
    want('laji rullaa: Tai, Ja, Pois, Loppu tai, Loppu ja, Tai', seq==['Tai','Ja','Pois','Loppu tai','Loppu ja','Tai'])
    want('tyhjällä parilla Poista', await pg.locator(r2+' .stdelp').count()==1)
    await tap(r2+' .stplus[data-side="c"]'); await tap('#st-exist [data-f="%s"]'%F['Annos']); await out()
    await tap(r2+' .stplus[data-side="e"]'); await pg.fill('#st-new','Tarkistettu'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100); await out()
    # pari 3: Loppu (Tarkistettu, Ohita); pari 4: Pois (Annos, Ohita)
    t=await T(); F={x['n']:x['id'] for x in t['f']}
    await tap('#st-addrule'); r3='#st-rules .strule:nth-child(3)'
    for i in range(3): await tap(r3+' .sttyc')
    want('Loppu-ruudulla ei seurausruutua', await pg.locator(r3+'.solo').count()==1 and await pg.locator(r3+' .stbox.eff').count()==0)
    await tap(r3+' .stplus[data-side="c"]'); await tap('#st-exist [data-f="%s"]'%F['Tarkistettu']); await tap('#st-exist [data-f="%s"]'%F['Ohita']); await out()
    await tap('#st-addrule'); r4='#st-rules .strule:nth-child(4)'
    for i in range(2): await tap(r4+' .sttyc')
    await tap(r4+' .stplus[data-side="c"]'); await tap('#st-exist [data-f="%s"]'%F['Annos']); await tap('#st-exist [data-f="%s"]'%F['Ohita']); await out()
    t=await T()
    want('säännöt tallessa', [(x['ty'],x['c'],x['e']) for x in t['r']]==[('a',[F['Annos'],F['Ohita']],[]),('tai',[F['Annos']],[F['Tarkistettu']]),('end',[F['Tarkistettu'],F['Ohita']],[]),('x',[F['Annos'],F['Ohita']],[])])
    want('ei sivun vaakavieritystä (Rakenna)', await pg.evaluate(OVER)=='[]')
    await tap('#st-addrule'); n0=await pg.locator('#st-rules .strule').count(); await tap('#st-rules .strule:last-child .stdelp')
    want('tyhjä pari poistuu', await pg.locator('#st-rules .strule').count()==n0-1)
    # 1.111: kopio sisältöineen, poisto vahvistuksella eri kohdasta, raahaus pitkällä painalluksella, aloituksen ja lopetuksen lajit
    await tap(r2+' .stcopy'); t=await T()
    want('kopio sisältöineen heti alle', len(t['r'])==5 and (t['r'][2]['ty'],t['r'][2]['c'],t['r'][2]['e'])==('tai',[F['Annos']],[F['Tarkistettu']]) and t['r'][2]['id']!=t['r'][1]['id'])
    await tap('#st-rules .strule:nth-child(3) .stdelp')
    want('täysi pari: ensin vahvistus vasemmassa kulmassa', await pg.locator('#st-rules .strule').count()==5 and await pg.is_visible('#st-rdelok'))
    await tap('#st-rdelok'); want('vahvistus poistaa', len((await T())['r'])==4 and await pg.locator('#st-rdelok').count()==0)
    bb=await pg.locator('#st-rules .strule:nth-child(4) .stbh').first.bounding_box(); x=bb['x']+bb['width']/2-30; y=bb['y']+bb['height']/2
    bb2=await pg.locator('#st-rules .strule:nth-child(2)').bounding_box()
    await pg.mouse.move(x,y); await pg.mouse.down(); await pg.wait_for_timeout(450)
    for k in range(1,11): await pg.mouse.move(x,y+(bb2['y']+5-y)*k/10); await pg.wait_for_timeout(15)
    await pg.mouse.up(); await pg.wait_for_timeout(200)
    want('pitkä painallus raahaa parin, Aloitus pysyy ensin', [x['ty'] for x in (await T())['r']]==['a','x','tai','end'])
    sq=[]
    for i in range(3): await tap('#st-rules .strule:nth-child(1) .sttyc'); sq.append(await pg.text_content('#st-rules .strule:nth-child(1) .sttyc'))
    want('Aloitus rullaa Ja, Pois, Tai; ei poistoa', sq==['Ja','Pois','Tai'] and await pg.locator('#st-rules .strule:nth-child(1) .stdelp').count()==0)
    # käyttö
    await tap('#st-build')
    want('käytössä Aloituksen vaihtoehdot', await txts('#st-opts .stopt .t')=='Annos,Ohita')
    await tap('#st-opts [data-f="%s"]'%F['Annos'])
    want('valinta tuo seuraukset, poissulku piilottaa', await txts('#st-opts .stopt .t')=='Annos,Tarkistettu')
    await tap('#st-opts [data-f="%s"]'%F['Tarkistettu'])
    want('lopetus päättää: Valmis ja polku', 'Valmis: Annos → Tarkistettu' in await pg.text_content('#st-end'))
    await tap('#st-opts [data-f="%s"]'%F['Annos'])
    want('peruminen pudottaa näkymättömät valinnat', (await T())['p']==[] and await txts('#st-opts .stopt .t')=='Annos,Ohita')
    # asian Flow Asiat-kortilta
    await tab(pg,'terms'); await pg.wait_for_timeout(150)
    await tap('#implist .flc[data-fl="t1"]'); want('Flow-valinta aukeaa', await pg.is_visible('#fl-trees'))
    await tap('#fl-trees [data-s="%s"]'%t['id'])
    want('Flow liitetty asiaan', await pg.evaluate(K+".flow.m.t1")==t['id'] and (await pg.text_content('#implist .flc[data-fl="t1"]'))=='Flow: Lääkekierto')
    await tap('#implist .flc[data-fl="t2"]'); await tap('#fl-new'); await pg.wait_for_timeout(150)
    want('+ Uusi Flow vie Flow-osioon', await pg.is_visible('#p-puu') and await pg.locator('#st-newtree').count()==1)
    await pg.fill('#st-newtree','Pyykkikierto'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(150)
    m=await pg.evaluate("(function(){var k=%s;return [k.flow.m.t2,k.yksinkertaisetPuut[1].id];})()"%K)
    want('uusi Flow liittyy asiaan', m[0]==m[1])
    # Ruudun ikkuna: Flow rivikohtaisesti
    if await pg.is_visible('#roll'): await pg.click('#roll'); await pg.click('#section-list')
    else: await pg.click('[data-tab="list"]')
    await pg.wait_for_timeout(100); await pg.evaluate("JuuriTesti.setListView('g')"); await pg.wait_for_timeout(200)
    await tap('#rtiles .rtile[data-id="c1"]')
    want('Flow-nappi vain asialla, jolla on Flow', await pg.locator('#lwpop .rtfl[data-fl="t1"]').count()==1)
    await tap('#lwpop .rtfl[data-fl="t1"]')
    want('Flow aukeaa ikkunaan', await pg.is_visible('#stpop') and await txts('#stpop .stopt .t')=='Annos,Ohita')
    await tap('#stpop .stopt[data-f="%s"]'%F['Annos']); await tap('#stpop .stopt[data-f="%s"]'%F['Tarkistettu'])
    nt=await pg.evaluate(K+".muistiinpanot.map(function(n){return n.text;})")
    want('jälki muistiinpanoksi', 'Kettu Lääkkeet: Annos → Tarkistettu' in nt)
    await out()
    want('Flow vihreä, OK erikseen', 'green' in (await pg.get_attribute('#lwpop .rtfl[data-fl="t1"]','class')) and (await pg.text_content('#lwpop .lwe[data-id="t1"] .okbtn'))=='OK')
    await pg.mouse.click(6,12); await pg.wait_for_timeout(150)
    await tap('#rtiles .rtile[data-id="c2"]'); await tap('#lwpop .rtfl[data-fl="t1"]')
    want('toisella rivillä oma kulku', await pg.locator('#stpop .stopt[aria-pressed="true"]').count()==0)
    await out(); want('kulkematon Flow punaisena, kun asia on tarkistettavana', 'due' in (await pg.get_attribute('#lwpop .rtfl[data-fl="t1"]','class')))
    await pg.mouse.click(6,12); await pg.wait_for_timeout(150)
    want('ei virheitä', not errs)
    await b.close()
    return bad,errs
async def main():
    allbad=[]
    async with async_playwright() as p:
        for w,h,t in [(390,844,True),(320,640,True),(1280,800,False)]:
            bad,errs=await run(p,w,h,t); allbad+=['%d: %s'%(w,x) for x in bad]+['%d: virhe %s'%(w,e) for e in errs]
    if allbad: print('\n'.join(allbad)); sys.exit(1)
    print('selain_1109 ok')
asyncio.run(main())
