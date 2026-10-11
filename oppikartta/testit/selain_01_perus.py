# Käy appin läpi puhelinleveydellä: pelaaja ja peli, tekstituonti, lukittu pelinäkymä ilman välivaihetta, kierros voittoon ja häviöön,
# kortin korjaus, keskeytyneen pelin jatko, toinen pelaaja, uusien korttien tulo, vanhan tallennuksen muunnos, asetukset, vienti ja tuonti.
# Lopuksi 320 px tummana pitkillä teksteillä.
import asyncio, json, os, sys
from playwright.async_api import async_playwright
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
KEY='oppikartta:v1'
DECK='''```json
{"oppikartta":"peli","nimi":"Englannin sanoja","sanat":[
["dog","koira"],["house","talo"],["water","vesi"],["book","kirja"],["car","auto"],["tree","puu"],["window","ikkuna"],
["bread","leipä"],["friend","ystävä"],["school","koulu"],["chair","tuoli"],["sun","aurinko"]
],"kortit":[{"kysymys":"Mikä näistä on verbi?","oikea":"run","vaarat":["table","blue","quickly"]}]}
```'''
W={'dog':'koira','house':'talo','water':'vesi','book':'kirja','car':'auto','tree':'puu','window':'ikkuna','bread':'leipä','friend':'ystävä','school':'koulu','chair':'tuoli','sun':'aurinko','moon':'kuu','star':'tähti'}
ANS=dict(W); ANS.update({v:k for k,v in W.items()}); ANS['Mikä näistä on verbi?']='run'
fails=[]
def flat(s): return ' '.join(s.split())
def chk(label,cond,extra=''):
    print(('ok   ' if cond else 'FAIL ')+label+((' | '+str(extra)) if extra!='' else ''))
    if not cond: fails.append(label)
RECTS="[...document.querySelectorAll('#field,.qcard,#opts .opt,#quit,#nav')].map(function(e){var r=e.getBoundingClientRect();return [Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)]})"
FITS="(function(){var m=document.getElementById('main'),n=document.getElementById('nav').getBoundingClientRect(),q=document.getElementById('quit').getBoundingClientRect();return [document.documentElement.scrollWidth,m.scrollHeight-m.clientHeight,m.scrollTop,q.bottom<=n.top+1,[...document.querySelectorAll('#q,#opts .opt:not(.none) .t')].every(function(e){return e.scrollHeight<=e.clientHeight+1})]})()"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); errs=[]
        ctx=await b.new_context(viewport={'width':390,'height':760},device_scale_factor=2)
        pg=await ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
        store=lambda q: pg.evaluate("(function(){var d=JSON.parse(localStorage.getItem('%s'));return %s})()"%(KEY,q))
        async def tap(right):
            q=await pg.inner_text('#q'); opts=await pg.locator('#opts .opt:not(.none) .t').all_inner_texts(); kind=await pg.inner_text('#qlabel')
            i=[k for k,o in enumerate(opts) if (o==ANS[q])==right][0]
            await pg.locator('#opts .opt').nth(i).click(); await pg.wait_for_timeout(120)
            return {'q':q,'opts':opts,'kind':kind,'pick':opts[i],'label':await pg.inner_text('#qlabel'),'ok':await pg.locator('#opts .opt.ok').count(),'bad':await pg.locator('#opts .opt.bad').count()}
        async def turn(right, shot=None):   # vastaa ja odottaa, että peli siirtyy itse eteenpäin
            r=await tap(right)
            if shot: await pg.screenshot(path=shot)
            await pg.wait_for_timeout(1700 if r['label'] in ('Voitto!','Hirviö sai kiinni') else 520 if right else 1080)
            return r

        # 1 tyhjä alku
        await pg.goto(U); await pg.wait_for_timeout(300); await pg.screenshot(path='ok1_tyhja.png')
        chk('1 tyhjä alku ohjaa lisäämään pelaajan ja pelin','Lisää ensin pelaaja ja peli' in await pg.inner_text('#p-play'))
        await pg.click('#go-sel'); await pg.click('#pl-add'); chk('  tyhjä nimi hylätään',(await pg.inner_text('#pl-msg'))=='Kirjoita pelaajan nimi.')
        await pg.fill('#pl-new','Aino'); await pg.keyboard.press('Enter'); await pg.fill('#pl-new','aino'); await pg.click('#pl-add')
        chk('  sama nimi hylätään',(await pg.inner_text('#pl-msg'))=='Tämän niminen pelaaja on jo.', await store('d.players.map(function(x){return x.name})'))
        # 2 peli tekstistä
        await pg.click('#gm-add'); chk('2 uuden pelin ikkuna',(await pg.inner_text('#gs-h'))=='Uusi peli' and not await pg.is_visible('#gs-del'))
        await pg.fill('#gs-text','ei mitään järkevää'); await pg.click('#gs-add'); chk('  kelvoton teksti: virhe eikä peliä',(await pg.get_attribute('#gs-msg','class'))=='msg warn' and await store('d.games.length')==0, await pg.inner_text('#gs-msg'))
        await pg.fill('#gs-text',DECK); await pg.click('#gs-add'); await pg.wait_for_timeout(150)
        chk('  peli luotu tekstistä',(await pg.inner_text('#gs-msg'))=='Lisätty 12 sanaa ja 1 monivalintakortti.' and (await pg.inner_text('#gs-info'))=='12 sanaa (24 korttia) ja 1 monivalintakortti.', await pg.inner_text('#gs-h')+' | '+await pg.input_value('#gs-name'))
        await pg.fill('#gs-text','moon ; kuu\nstar\ttähti\ndog;koira\nroska'); await pg.click('#gs-add'); await pg.wait_for_timeout(150)
        chk('  lisäys riveittäin: uudet, ennestään sama ja ohitettu',(await pg.inner_text('#gs-msg'))=='Lisätty 2 sanaa. Ennestään samanlaisia 1. Ohitettu 1 puutteellinen rivi.', await pg.inner_text('#gs-info'))
        await pg.click('#gs-ok'); await pg.wait_for_timeout(150); await pg.screenshot(path='ok2_valinta.png')
        chk('  valintanäkymä',flat(await pg.inner_text('#gm-list'))=='Englannin sanoja 29 korttia' and 'Nähty 0/29' in await pg.inner_text('#pairinfo'))
        # 3 aloitus
        await pg.click('#to-play'); await pg.wait_for_timeout(150); await pg.screenshot(path='ok3_aloitus.png')
        chk('3 aloitusnäkymä kertoo tilanteen',flat(await pg.inner_text('#today'))=='Tilanne Pelissä on 29 korttia. Yhtään ei ole vielä nähty.', flat(await pg.inner_text('#today')))
        await pg.click('#lv [data-lv="helppo"]'); await pg.click('#len [data-len="20"]')
        chk('  vaikeustaso ja pituus tallentuvat pelaajalle ja pelille',await store('[d.prog["p1|g1"].lv,d.prog["p1|g1"].len]')==['helppo',20] and (await pg.inner_text('#picked'))=='Helppo, 20 banaania. Voit vaihtaa näitä alla.', await pg.inner_text('#lvdesc'))
        await pg.click('#lv [data-lv="tavallinen"]'); await pg.click('#len [data-len="10"]'); await pg.click('#start'); await pg.wait_for_timeout(300); await pg.screenshot(path='ok4_kysymys.png')
        chk('  kierros alkaa: kenttä, kysymys ja neljä vaihtoehtoa',await pg.locator('#field .mon').count()==1 and await pg.locator('#opts .opt:not(.none)').count()==4 and flat(await pg.inner_text('#ctx'))=='Aino · Tavallinen 0/10', await pg.get_attribute('#field','aria-label'))
        # 4 lukittu näkymä ja vastaaminen ilman välivaihetta
        rects0=await pg.evaluate(RECTS); fit=await pg.evaluate(FITS)
        chk('4 pelinäkymä mahtuu ruutuun eikä vieri',fit==[390,0,0,True,True] and not await pg.is_visible('#fix'), fit)
        r=await tap(True); await pg.screenshot(path='ok5_oikein.png')
        chk('  oikea vastaus: lyhyt merkki, banaani lähtee',r['label']=='Oikein' and r['ok']==1 and r['bad']==0 and (await pg.inner_text('#hud-n'))=='1/10', r)
        chk('  merkin aikana mikään ei liiku',await pg.evaluate(RECTS)==rects0)
        await pg.wait_for_timeout(520); q2=await pg.inner_text('#q')
        chk('  seuraava kysymys tulee itsestään ilman napautusta',q2!=r['q'] and await pg.locator('#opts .opt.ok').count()==0 and (await pg.inner_text('#qlabel'))=='Uusi kortti: virhe ei haittaa' and await pg.evaluate(RECTS)==rects0, q2)
        chk('  Jatka-painiketta, selitystä ja prosentteja ei ole',await pg.locator('#next,#gobar,#fb,#explain,#prenote').count()==0 and '%' not in await pg.inner_text('#p-play'))
        r=await tap(False); await pg.screenshot(path='ok6_vaarin_uusi.png')
        chk('  uuden kortin väärä vastaus: oikea näkyy hetken, hirviöt eivät liiku',r['label']=='Väärin. Uusi kortti: ei haittaa' and r['ok']==1 and r['bad']==1 and await store('d.prog["p1|g1"].round.miss')==0 and await pg.evaluate(RECTS)==rects0, r)
        first_wrong=r['q']; await pg.wait_for_timeout(500); chk('  oikea vastaus näkyy vielä puolen sekunnin päästä',(await pg.inner_text('#q'))==first_wrong and await pg.locator('#opts .opt.ok').count()==1)
        await pg.wait_for_timeout(600); chk('  sekunnin jälkeen peli jatkuu',(await pg.inner_text('#q'))!=first_wrong and await pg.locator('#opts .opt.ok').count()==0)
        # napautus odotuksen aikana vie heti eteenpäin eikä vastaa uuteen kysymykseen
        n0=await store('d.prog["p1|g1"].n'); r=await tap(False); await pg.wait_for_timeout(220); await pg.locator('#opts .opt').nth(0).click(); await pg.wait_for_timeout(80)
        chk('  napautus odotuksen aikana ohittaa odotuksen',(await pg.inner_text('#q'))!=r['q'] and await pg.locator('#opts .opt.ok,#opts .opt.bad').count()==0 and await store('d.prog["p1|g1"].n')==n0+1, await pg.inner_text('#q'))
        r=await turn(True); r=await turn(True)
        r=await turn(False,'ok7_vaarin_kertaus.png')
        chk('  väärin mennyt kortti palaa kolmen muun jälkeen, ja nyt virhe liikuttaa hirviöitä',r['q']==first_wrong and r['kind']=='Meni viimeksi väärin' and r['label']=='Väärin' and await store('d.prog["p1|g1"].round.miss')==1, r)
        # edellisen kortin korjaus
        chk('  Korjaa edellinen kortti näkyy alarivillä samalla paikalla',await pg.is_visible('#fix') and await pg.evaluate(RECTS)==rects0)
        await pg.click('#fix'); old=await pg.input_value('#cs-a'); await pg.fill('#cs-a',old+'!'); await pg.click('#cs-ok'); await pg.wait_for_timeout(150)
        ANS[old+'!']=ANS[old]; ANS[ANS[old]]=old+'!'
        chk('  kortin korjaus tallentuu',old==first_wrong and await store('d.games[0].items.filter(function(x){return x.a==="%s!"}).length'%old)==1 and await pg.is_visible('#q'), old)
        # välilehden vaihto ei riko mitään
        await pg.click('[data-tab="sel"]'); chk('  toisella välilehdellä näkymä vierii taas normaalisti',await pg.evaluate("!document.getElementById('main').classList.contains('lock')")); await pg.click('[data-tab="play"]'); await pg.wait_for_timeout(150)
        hits=await store('d.prog["p1|g1"].round.hits'); chk('  paluu peliin: sama kierros, näkymä lukossa',await pg.is_visible('#q') and hits==3 and await pg.evaluate(FITS)==[390,0,0,True,True])
        # 5 kesken jääneen pelin jatko latauksen jälkeen
        await pg.reload(); await pg.wait_for_timeout(300); await pg.screenshot(path='ok8_kesken.png')
        chk('5 lataus: peli kesken -kortti',flat(await pg.inner_text('#resume'))=='Peli kesken Banaaneja 3/10, tavallinen.' and (await pg.inner_text('#start'))=='Aloita uusi peli')
        await pg.click('#resume-go'); await pg.wait_for_timeout(200); chk('  jatko samasta tilanteesta',(await pg.inner_text('#hud-n'))=='3/10' and await pg.locator('#field .mon').count()==await store('d.prog["p1|g1"].round.mons.length'))
        # 6 voittoon
        n=0; r=None
        while await pg.is_visible('#q') and n<30:
            last=(await pg.inner_text('#hud-n'))=='9/10'; r=await turn(True,'ok9_voitto.png' if last else None); n+=1
            if last: break
        chk('6 viimeinen banaani: voitto',r['label']=='Voitto!' and not await pg.is_visible('#q'), r)
        await pg.screenshot(path='ok10_tulos.png')
        chk('  tuloskortti ja tilasto',(await pg.inner_text('#result')).startswith('Voitto: kaikki banaanit heitetty') and 'Pisteet 10/10. Virheitä 1. Tavallinen.' in await pg.inner_text('#result') and await store('[d.prog["p1|g1"].st,d.prog["p1|g1"].round]')==[{'r':1,'w':1,'p':10},None], flat(await pg.inner_text('#result')))
        chk('  tuloksen jälkeen näkymä vierii taas ja tilanne näkyy',await pg.evaluate("!document.getElementById('main').classList.contains('lock')") and flat(await pg.inner_text('#today')).startswith('Tilanne Opettelussa '), flat(await pg.inner_text('#today')))
        # 7 häviöön vaikealla
        await pg.click('#lv [data-lv="vaikea"]'); await pg.click('#start'); await pg.wait_for_timeout(250); n=0; r=None
        while await pg.is_visible('#q') and n<40:
            r=await tap(False); n+=1
            if r['label']=='Hirviö sai kiinni': await pg.wait_for_timeout(500); await pg.screenshot(path='ok11_havio.png'); chk('7 pelkät virheet: hirviö saa kiinni',(await pg.inner_text('#field .fcap'))=='Kiinni jäit' and await pg.locator('#field .chimp.down').count()==1 and r['ok']==1, str(n)+' vastausta'); await pg.wait_for_timeout(1200); break
            await pg.wait_for_timeout(1080)
        chk('  häviön tuloskortti; eteneminen säilyy',(await pg.inner_text('#result')).startswith('Hirviö sai kiinni') and await store('d.prog["p1|g1"].st.r')==2 and await store('Object.keys(d.prog["p1|g1"].cards).length')>=8, flat(await pg.inner_text('#result')))
        # lopetus kesken
        await pg.click('#start'); await pg.wait_for_timeout(200); await pg.click('#quit'); chk('  lopetus vaatii vahvistuksen',(await pg.inner_text('#quit'))=='Vahvista: lopeta peli' and await pg.is_visible('#q'))
        await pg.click('#quit'); await pg.wait_for_timeout(150); chk('  lopetettu kierros ei kirjaudu',await store('[d.prog["p1|g1"].st.r,d.prog["p1|g1"].round]')==[2,None] and await pg.is_visible('#start'))
        # 8 toinen pelaaja: oma eteneminen
        await pg.click('[data-tab="sel"]'); await pg.fill('#pl-new','Toinen pelaaja'); await pg.click('#pl-add'); await pg.wait_for_timeout(150)
        chk('8 toisella pelaajalla oma eteneminen','Nähty 0/29' in await pg.inner_text('#pairinfo') and await store('d.cur.p')=='p2')
        await pg.click('#pl-list [data-pick="p1"]'); chk('  takaisin ensimmäiseen: eteneminen tallella','Nähty 0/29' not in await pg.inner_text('#pairinfo'), flat(await pg.inner_text('#pairinfo')))
        await pg.click('#pl-list [data-edit="p2"]'); await pg.fill('#ps-name','Vieras'); await pg.click('#ps-ok'); chk('  nimen vaihto',await store('d.players[1].name')=='Vieras')
        await pg.click('#pl-list [data-edit="p2"]'); await pg.click('#ps-del'); await pg.click('#ps-del'); await pg.wait_for_timeout(150); chk('  pelaajan poisto',await store('[d.players.length,Object.keys(d.prog)]')==[1,['p1|g1']])
        # 9 kortin poisto kierrosta ja palautus
        await pg.click('[data-tab="play"]'); await pg.click('#start'); await pg.wait_for_timeout(200); await turn(True); await pg.click('#fix'); await pg.click('#cs-off'); await pg.click('#cs-off'); await pg.wait_for_timeout(150)
        chk('9 kortti pois kierrosta',await store('d.games[0].items.filter(function(x){return x.off}).length')==1 and await pg.is_visible('#q'))
        await pg.click('#quit'); await pg.click('#quit'); await pg.click('[data-tab="sel"]'); await pg.click('#gm-list [data-edit="g1"]'); await pg.wait_for_timeout(150)
        chk('  pelin muokkaus näyttää poistetun',(await pg.inner_text('#gs-offsum'))=='Kierrosta poistetut kortit (1)' and 'Kierrosta poistettu 1.' in await pg.inner_text('#gs-info'))
        await pg.click('#gs-offsum'); await pg.click('#gs-off .btn'); chk('  palautus',await store('d.games[0].items.filter(function(x){return x.off}).length')==0 and not await pg.is_visible('#gs-offbox'))
        await pg.fill('#gs-name','Englanti 1'); await pg.click('#gs-ok'); chk('  pelin nimen vaihto näkyy yläpalkissa',(await pg.inner_text('#tname'))=='Englanti 1')
        # 10 uusia kortteja tulee sitä mukaa kuin vanhoja opitaan: 20 banaanin virheetön peli
        await pg.click('[data-tab="play"]'); seen0=await store('Object.keys(d.prog["p1|g1"].cards).length')
        await pg.click('#lv [data-lv="helppo"]'); await pg.click('#len [data-len="20"]'); await pg.click('#start'); await pg.wait_for_timeout(200); n=0
        while await pg.is_visible('#q') and n<25:
            await turn(True); n+=1
        s=await store('(function(){var c=d.prog["p1|g1"].cards,k=Object.keys(c);return [k.length,k.filter(function(i){return c[i].l>=3&&!c[i].q}).length,k.filter(function(i){return c[i].q||c[i].l<3}).length]})()')
        chk('10 virheetön 20 banaanin peli: kortteja siirtyy harvoin kerrattaviksi ja uusia tulee tilalle',s[0]>seen0 and s[1]>=5 and s[2]<=8, 'nähty %d -> %d, harvoin kerrattavia %d, opettelussa %d'%(seen0,s[0],s[1],s[2]))
        chk('  aloitusnäkymä kertoo saman',flat(await pg.inner_text('#today'))=='Tilanne Opettelussa %d, harvoin kerrattavia %d, näkemättä %d. Harvoin kerrattavista ei ole tänään yhtään vuorossa.'%(s[2],s[1],29-s[0]), flat(await pg.inner_text('#today')))
        # 11 asetukset
        await pg.click('[data-tab="set"]'); await pg.wait_for_timeout(150); await pg.screenshot(path='ok12_asetukset.png')
        chk('11 asetusten otsikot',await pg.locator('#p-set h2').all_inner_texts()==['Ulkoasu','Kertaus','Peli tekoälyn avulla','Tiedot'] and await pg.locator('#p-set h3').all_inner_texts()==['Korostusväri','Vaalea vai tumma','Opeteltavia kortteja kerralla','Oikea vastaus näkyy virheen jälkeen'], await pg.locator('#p-set h3').all_inner_texts())
        await pg.click('#set-tint [data-v="vihrea"]'); await pg.click('#set-mode [data-v="dark"]'); await pg.click('#set-maxOpen [data-v="12"]'); await pg.click('#set-show [data-v="0"]')
        chk('  asetukset tallentuvat ja väri vaihtuu',await store('[d.cfg.tint,d.cfg.mode,d.cfg.maxOpen,d.cfg.show]')==['vihrea','dark',12,0] and (await pg.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()"))=='#30D158')
        await pg.click('[data-tab="play"]'); await pg.click('#len [data-len="10"]'); await pg.click('#start'); await pg.wait_for_timeout(250); await pg.screenshot(path='ok13_tumma_peli.png')
        r=await tap(False); chk('  asetus Ei näytetä: virheen jälkeen ei merkkejä, peli jatkuu heti',r['ok']==0 and r['bad']==0 and r['label']==r['kind'], r)
        await pg.wait_for_timeout(350); chk('  seuraava kysymys alle puolessa sekunnissa',(await pg.inner_text('#q'))!=r['q'])
        await pg.click('#quit'); await pg.click('#quit'); await pg.click('[data-tab="set"]'); await pg.click('#set-mode [data-v="auto"]'); await pg.click('#set-show [data-v="1000"]')
        await pg.click('#ai-show summary'); guide=await pg.input_value('#ai-show textarea'); chk('  aloitusviesti tekoälylle',guide.startswith('Haluan tehdä kanssasi pelin') and '"sanat"' in guide and guide.endswith('Aiheeni on: ') and 'selitys' not in guide.split('MUOTO')[1], str(len(guide))+' merkkiä')
        ex=guide[guide.index('MUOTO')+6:guide.index('- "sanat" ja')]
        chk('  aloitusviestin esimerkkimuoto on appin luettavissa',await pg.evaluate("(function(t){var r=parseGameText(t);return r.ok&&r.items.length===3&&r.name==='Pelin nimi'})(%s)"%json.dumps(ex)))
        # 12 vienti ja tuonti tekstinä
        await pg.click('#exptext summary'); txt=await pg.input_value('#textout textarea'); o=json.loads(txt)
        chk('12 vienti tekstinä',o['app']=='oppikartta' and o['version']==2 and len(o['players'])==1 and len(o['games'][0]['items'])==15 and 'p1|g1' in o['prog'], str(len(txt))+' merkkiä')
        await pg.click('#wipe'); await pg.click('#wipe'); await pg.wait_for_timeout(150); chk('  tyhjennys',await store('[d.players.length,d.games.length,d.cfg.tint]')==[0,0,'vihrea'] and (await pg.inner_text('#datamsg'))=='Kaikki tiedot poistettu.')
        await pg.click('#imptextbox summary'); await pg.fill('#imptext','{"oppikartta":"peli","sanat":[["a","b"],["c","d"]]}'); await pg.click('#imptextgo'); chk('  yksittäinen peli ei kelpaa varmuuskopioksi','yksittäinen peli' in await pg.inner_text('#datamsg'))
        await pg.fill('#imptext',txt); await pg.click('#imptextgo'); await pg.wait_for_timeout(150); print('  tuonnin kysymys:', await pg.inner_text('#dataout .confirm p'))
        await pg.click('#imp-yes'); await pg.wait_for_timeout(150)
        chk('  tuonti palauttaa pelaajat, pelit ja etenemisen',await store('[d.players.length,d.games[0].name,d.games[0].items.length,Object.keys(d.prog["p1|g1"].cards).length,d.prog["p1|g1"].st.r,d.v]')==[1,'Englanti 1',15,s[0]+1,3,2] and (await pg.inner_text('#datamsg'))=='Tiedot tuotu.')
        await pg.click('[data-tab="play"]'); chk('  tuonnin jälkeen peli aukeaa',await pg.is_visible('#start') and (await pg.inner_text('#tname'))=='Englanti 1')
        state=await pg.evaluate("localStorage.getItem('%s')"%KEY)
        # 13 ensimmäisen version tallennus muunnetaan latauksessa
        v1={'v':1,'pseq':1,'gseq':1,'players':[{'id':'p1','name':'Aino'}],'games':[{'id':'g1','name':'Vanha','iseq':4,'items':[{'id':'i%d'%(k+1),'k':'s','a':a,'b':W[a],'ex':'x'} for k,a in enumerate(['dog','house','water','book'])]}],'cur':{'p':'p1','g':'g1'},
            'prog':{'p1|g1':{'n':9,'day':'2026-10-11','nd':3,'lv':'helppo','len':10,'st':{'r':1,'w':1,'p':6},'pre':[0,0],'gaps':{},'round':None,'cards':{'i1>':{'l':1,'d':'2999-01-01','t':5,'s':2,'h':{'\t':2}},'i2>':{'l':0,'d':'2026-10-11','t':9,'s':0,'h':{'koira':1}},'i3>':{'l':4,'d':'2999-01-09','t':2,'s':4,'h':{'\t':4}}}}},
            'cfg':{'tint':'oranssi','mode':'auto','newPerDay':10,'maxOpen':20,'preMin':5,'preTop':60,'preSecond':30},'meta':{'lastExport':None,'dirty':2}}
        await pg.evaluate("localStorage.setItem('%s',%s)"%(KEY,json.dumps(json.dumps(v1)))); await pg.reload(); await pg.wait_for_timeout(300)
        chk('13 vanha tallennus aukeaa ja muuntuu',flat(await pg.inner_text('#today'))=='Tilanne Opettelussa 1, harvoin kerrattavia 2, näkemättä 5. Harvoin kerrattavista ei ole tänään yhtään vuorossa.' and (await pg.inner_text('#picked'))=='Helppo, 10 banaania. Voit vaihtaa näitä alla.', flat(await pg.inner_text('#today')))
        await pg.click('#start'); await pg.wait_for_timeout(200); r=await turn(True)
        chk('  tallennus on uutta muotoa: päivävälit ovat harvoin kerrattavia, kesken ollut kortti odottaa vuoroaan',await store('[d.v,d.prog["p1|g1"].cards["i1>"].l,d.prog["p1|g1"].cards["i3>"].l,d.prog["p1|g1"].cards["i2>"].l,d.prog["p1|g1"].cards["i2>"].q,d.cfg.maxOpen]')==[2,3,6,0,1,8], r['q'])
        # 14 pelin poisto
        await pg.click('#quit'); await pg.click('#quit'); await pg.click('[data-tab="sel"]'); await pg.click('#gm-list [data-edit="g1"]'); await pg.click('#gs-del'); await pg.click('#gs-del'); await pg.wait_for_timeout(150)
        chk('14 pelin poisto vie myös etenemisen',await store('[d.games.length,Object.keys(d.prog).length,d.cur.g]')==[0,0,None])
        await pg.click('[data-tab="play"]'); chk('  ilman peliä: ohje','Valitse tai lisää peli' in await pg.inner_text('#p-play'))
        await ctx.close()

        # 15 kapea näyttö, tumma tila, pitkät tekstit: kaikki mahtuu yhä ruutuun
        ctx=await b.new_context(viewport={'width':320,'height':568},device_scale_factor=2,color_scheme='dark')
        await ctx.add_init_script("if(!localStorage.getItem('%s'))localStorage.setItem('%s', %s);"%(KEY,KEY,json.dumps(state)))
        pg=await ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(U); await pg.wait_for_timeout(300)
        await pg.evaluate("(function(){var d=JSON.parse(localStorage.getItem('%s'));d.cfg.mode='auto';d.games[0].name='Hyvin pitkä pelin nimi joka ei mahdu yhdelle riville millään';d.games[0].items=[{id:'i99',k:'m',q:'Mikä seuraavista väittämistä kuvaa parhaiten sitä, miten pitkä kysymys asettuu kapealle näytölle, kun tilaa on vähän?',c:'Teksti pienenee ja rivittyy omaan ruutuunsa',w:['Sivua pitää vierittää sivusuunnassa, jotta kaiken näkee','Teksti leikkautuu näkymättömiin','Ruutu kasvaa ja työntää muut alemmas'],ex:''},{id:'i98',k:'m',q:'Lyhyt?',c:'Kyllä',w:['Ei'],ex:''}].concat(d.games[0].items);d.prog['p1|g1'].cards={};d.prog['p1|g1'].round=null;localStorage.setItem('%s',JSON.stringify(d));})()"%(KEY,KEY))
        await pg.reload(); await pg.wait_for_timeout(300); await pg.screenshot(path='ok14_kapea_aloitus.png')
        o1=await pg.evaluate("[document.documentElement.scrollWidth,document.getElementById('main').scrollWidth,document.getElementById('main').clientWidth]")
        await pg.click('#lv [data-lv="tavallinen"]'); await pg.click('#start'); await pg.wait_for_timeout(300); await pg.screenshot(path='ok15_kapea_pitka.png')
        f1=await pg.evaluate(FITS); rc=await pg.evaluate(RECTS); sizes=await pg.evaluate("[...document.querySelectorAll('#q,#opts .opt .t')].map(function(e){return parseFloat(e.style.fontSize)})")
        chk('15 kapea näyttö (320 x 568, tumma): pitkä kysymys ja pitkät vaihtoehdot mahtuvat ruutuihinsa pienennettyinä',o1[0]==320 and o1[1]==o1[2] and f1==[320,0,0,True,True] and sizes[0]<22 and min(sizes[1:])<17, [f1,sizes])
        await pg.locator('#opts .opt').nth(0).click(); await pg.wait_for_timeout(1250); await pg.screenshot(path='ok16_kapea_lyhyt.png')
        f2=await pg.evaluate(FITS); sizes2=await pg.evaluate("[...document.querySelectorAll('#q,#opts .opt:not(.none) .t')].map(function(e){return parseFloat(e.style.fontSize)})")
        chk('  seuraava, lyhyt kortti: sama asettelu, kaksi vaihtoehtoa, teksti täysikokoisena',(await pg.inner_text('#q'))=='Lyhyt?' and await pg.evaluate(RECTS)==rc and await pg.locator('#opts .opt.none').count()==2 and f2==[320,0,0,True,True] and sizes2==[22,17,17], [f2,sizes2])
        await pg.click('[data-tab="sel"]'); await pg.wait_for_timeout(150); await pg.screenshot(path='ok17_kapea_valinta.png')
        await pg.click('#gm-list [data-edit="g1"]'); await pg.wait_for_timeout(200)
        o4=await pg.evaluate("[document.documentElement.scrollWidth,document.getElementById('gsheet').scrollWidth,document.getElementById('gsheet').clientWidth]")
        chk('  valinta ja pelin ikkuna kapealla',o4[0]==320 and o4[1]==o4[2], o4)
        await ctx.close()
        # 16 korkea näyttö: kenttä saa lisätilan, muu pysyy
        ctx=await b.new_context(viewport={'width':430,'height':932},device_scale_factor=2)
        await ctx.add_init_script("if(!localStorage.getItem('%s'))localStorage.setItem('%s', %s);"%(KEY,KEY,json.dumps(state)))
        pg=await ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(U); await pg.wait_for_timeout(300); await pg.click('#start'); await pg.wait_for_timeout(300); await pg.screenshot(path='ok18_korkea.png')
        f3=await pg.evaluate(FITS); fh=await pg.evaluate("document.getElementById('field').clientHeight")
        chk('16 korkea näyttö (430 x 932): kaikki ruudussa, kenttä käyttää lisätilan',f3==[430,0,0,True,True] and fh>300, [f3,fh])
        chk('sivuvirheitä ei tullut',errs==[], errs)
        print('errs',errs); await b.close()
    print('KAIKKI OK' if not fails else 'VIRHEITÄ: '+'; '.join(fails)); sys.exit(1 if fails else 0)
asyncio.run(main())
