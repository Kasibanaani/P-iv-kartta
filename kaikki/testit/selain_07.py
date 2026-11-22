"""Kaikki 0.7 (Emil 22.11.2026): Kojelauta vaultin data-kansiosta (data/mittarit.json + data/paiva.csv, vaultin ohje ohjeet/data.md).
Tarkistaa: osio löytyy, jokaiselle kuvaajalliselle sarakkeelle kortti, asteikossa pisteet ja 7 päivän keskiarvo, kyllä/ei pylväinä viikoittain,
luku viivana, aikaväli vaihtuu ja muistetaan, osoitus näyttää päivän arvon, kirjaukseton sarake ei kaada, ilman mittareita selkeä viesti,
pelkkä katselu ei kirjoita GitHubiin. Leveydet 390, 320 (puhelin) ja 1440, 1280 (tietokone). Käyttö: python3 testit/selain_07.py [kuvat]"""
import asyncio, os, sys, json, datetime
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from apu import tab
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
FAKE=open(os.path.join(D,'fakegh.js'),encoding='utf8').read()
SHOT=len(sys.argv)>1
M={"versio":1,"taulukot":[{"id":"paiva","tiedosto":"data/paiva.csv","nimi":"Päivä","avain":"pvm","sarakkeet":[
  {"id":"energia","nimi":"Energia","laji":"asteikko","min":1,"max":5},
  {"id":"uni","nimi":"Uni","laji":"valinta","arvot":[["1","Huono"],["2","Ok"],["3","Hyvä"]]},
  {"id":"treeni","nimi":"Treeni","laji":"kylla-ei"},
  {"id":"tyhja","nimi":"Tyhjä","laji":"luku"},
  {"id":"piilo","nimi":"Piilo","laji":"luku","kuvaaja":False},
  {"id":"paino","nimi":"Paino","laji":"luku","yksikko":"kg"}]}]}
T=datetime.date.today();R=['pvm,energia,uni,treeni,tyhja,piilo,paino']
for i in range(60,-1,-1):
    d=T-datetime.timedelta(days=i)
    R.append('%s,%s,%s,%s,,1,%s'%(d.isoformat(),1+(i*7)%5,1+i%3,'1' if i%3==0 else '0','%.1f'%(110-i*0.05) if i%4==0 else ''))
SEED={'data/mittarit.json':json.dumps(M,ensure_ascii=False),'data/paiva.csv':'\n'.join(R)+'\n','inbox/a.md':'---\ntyyppi: inbox\notsikko: A\nkuvaus: \nluotu: 2026-11-20\nlahde: emil\n---\n# A\n\nTeksti.\n'}
async def run(p,w,h,seed=SEED):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h})).new_page()
    await pg.add_init_script(FAKE+";(function(){var S=%s;if(!window.__repo.kept)for(var k in S)window.__repo.put(k,S[k]);try{localStorage.setItem('kaikki:gh',JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}))}catch(e){}})();"%json.dumps(seed))
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond,info=''):
        print('  %-46s %s %s'%(label,'ok' if cond else 'VIRHE',info if not cond else ''))
        if not cond: bad.append(label)
    print('leveys',w,'' if seed is SEED else '(ei mittareita)')
    await pg.goto(U); await pg.wait_for_timeout(1500)
    if w<1000:
        await pg.click('#roll'); await pg.wait_for_timeout(60)
        want('osiovalikossa Kojelauta',await pg.is_visible('#section-dash'))
        await pg.click('#section-dash'); await pg.wait_for_timeout(200)
    else:
        want('sivupalkissa Kojelauta',await pg.is_visible('#nav [data-tab="dash"]'))
        await pg.click('#nav [data-tab="dash"]'); await pg.wait_for_timeout(200)
    if seed is not SEED:
        want('ilman mittareita viesti',await pg.evaluate("document.getElementById('p-dash').textContent.indexOf('Vaultissa ei ole mittareita')>=0"))
        want('ei sivuvirheitä',not errs,errs); await b.close(); return bad
    cards=await pg.evaluate("Array.from(document.querySelectorAll('#p-dash .dcard')).map(function(c){return c.dataset.c;})")
    want('kortti jokaiselle kuvaajalliselle sarakkeelle',cards==['energia','uni','treeni','tyhja','paino'],cards)
    e=await pg.evaluate("(function(){var c=document.querySelector('.dcard[data-c=energia]');return {p:c.querySelectorAll('.dpt').length,l:c.querySelectorAll('.dln').length,avg:c.querySelectorAll('.dln:not(.soft)').length};})()")
    want('asteikko: pisteet ja keskiarvoviiva',e['p']==61 and e['avg']==1,e)
    want('kyllä/ei viikkopylväinä',await pg.evaluate("document.querySelectorAll('.dcard[data-c=treeni] .dbr').length>=9&&getComputedStyle(document.querySelector('.dcard[data-c=treeni] .dbr')).display!=='none'"))
    want('luku viivana, arvo yksikön kanssa',await pg.evaluate("!!document.querySelector('.dcard[data-c=paino] .dln')&&/kg$/.test(document.querySelector('.dcard[data-c=paino] .dval').textContent)"))
    want('valinnan arvo nimellä',await pg.evaluate("['Huono','Ok','Hyvä'].indexOf(document.querySelector('.dcard[data-c=uni] .dval').textContent)>=0"))
    want('kirjaukseton sarake: viesti',await pg.evaluate("!!document.querySelector('.dcard[data-c=tyhja] .dnone')"))
    n90=await pg.evaluate("document.querySelectorAll('.dcard[data-c=energia] .dpt').length")
    await pg.click('#dashrange [data-r="30"]'); await pg.wait_for_timeout(150)
    n30=await pg.evaluate("document.querySelectorAll('.dcard[data-c=energia] .dpt').length")
    want('aikaväli 30 pv rajaa',n30==30 and n90==61,(n30,n90))
    want('aikaväli muistetaan',await pg.evaluate("localStorage.getItem('kaikki:dashr')==='30'"))
    if w<1000: want('aikaväli alapalkissa',await pg.evaluate("!!document.querySelector('#sbar #dashrange')"))
    await pg.evaluate("document.querySelector('.dcard[data-c=paino]').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(50)
    bx=await pg.evaluate("(function(){var r=document.querySelector('.dcard[data-c=paino] .dsvg').getBoundingClientRect();return [r.left+r.width*0.6,r.top+r.height/2];})()")
    await pg.mouse.move(bx[0],bx[1]); await pg.wait_for_timeout(80)
    t=await pg.evaluate("document.querySelector('.dcard[data-c=paino] .dval').textContent")
    want('osoitus näyttää päivän arvon',bool(__import__('re').match(r'^\d+\.\d+\. \d+',t)),t)
    want('ei sivuttaisvieritystä',await pg.evaluate("document.documentElement.scrollWidth<=innerWidth"))
    if SHOT: await pg.screenshot(path=os.path.join(os.environ.get('SHOTDIR','/tmp'),'dash%d.png'%w))
    log=await pg.evaluate("__repo.log.filter(function(x){return !/^GET/.test(x);})")
    want('katselu ei kirjoita GitHubiin',log==[],log)
    want('ei sivuvirheitä',not errs,errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((390,844),(320,640),(1440,900),(1280,800)): bad+=await run(p,w,h)
        bad+=await run(p,390,844,{'inbox/a.md':'---\ntyyppi: inbox\n---\n# A\n'})
    print('KAIKKI OK' if not bad else 'VIRHEITÄ: '+', '.join(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
