# Käy appin läpi puhelinleveydellä: pelaaja ja peli, tekstituonti, kierros voittoon ja häviöön, kortin korjaus,
# keskeytyneen pelin jatko, toinen pelaaja, palkit ennen vastausta, asetukset, vienti ja tuonti. Lopuksi 320 px tummana.
import asyncio, json, os, sys
from playwright.async_api import async_playwright
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
KEY='oppikartta:v1'
DECK='''```json
{"oppikartta":"peli","nimi":"Englannin sanoja","sanat":[
["dog","koira","The dog is sleeping on the sofa."],["house","talo","Our house is small."],["water","vesi","I drink water every morning."],
["book","kirja","She reads a book."],["car","auto","The car is red."],["tree","puu","The tree is tall."],["window","ikkuna","Open the window."],
["bread","leipä","We eat bread."],["friend","ystävä","He is my friend."],["school","koulu","The school is near."],["chair","tuoli","Sit on the chair."],["sun","aurinko","The sun is bright."]
],"kortit":[{"kysymys":"Mikä näistä on verbi?","oikea":"run","vaarat":["table","blue","quickly"],"selitys":"Run tarkoittaa juosta.","selitykset":{"quickly":"Quickly on adverbi."}}]}
```'''
W={'dog':'koira','house':'talo','water':'vesi','book':'kirja','car':'auto','tree':'puu','window':'ikkuna','bread':'leipä','friend':'ystävä','school':'koulu','chair':'tuoli','sun':'aurinko','moon':'kuu','star':'tähti'}
ANS=dict(W); ANS.update({v:k for k,v in W.items()}); ANS['Mikä näistä on verbi?']='run'
fails=[]
def flat(s): return ' '.join(s.split())
def chk(label,cond,extra=''):
    print(('ok   ' if cond else 'FAIL ')+label+((' | '+str(extra)) if extra!='' else ''))
    if not cond: fails.append(label)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); errs=[]
        ctx=await b.new_context(viewport={'width':390,'height':760},device_scale_factor=2)
        pg=await ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
        store=lambda q: pg.evaluate("(function(){var d=JSON.parse(localStorage.getItem('%s'));return %s})()"%(KEY,q))
        async def ow(): return await pg.evaluate("[document.documentElement.scrollWidth,document.getElementById('main').scrollWidth,document.getElementById('main').clientWidth]")
        async def turn(right, shot=None):
            q=await pg.inner_text('#q'); opts=await pg.locator('#opts .opt .t').all_inner_texts(); kind=await pg.inner_text('#qlabel')
            i=[k for k,o in enumerate(opts) if (o==ANS[q])==right][0]
            await pg.locator('#opts .opt').nth(i).click(); await pg.wait_for_timeout(750)
            if shot: await pg.screenshot(path=shot)
            return {'q':q,'opts':opts,'kind':kind,'pick':opts[i],'label':await pg.inner_text('#qlabel'),'fb':(await pg.inner_text('#fb')).replace('\n',' / '),'cap':await pg.inner_text('#field .fcap'),'hud':await pg.inner_text('#hud-n')}
        async def go(): await pg.click('#next'); await pg.wait_for_timeout(120)

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
        await pg.screenshot(path='ok2_peli_ikkuna.png')
        await pg.fill('#gs-text','moon ; kuu ; The moon is full.\nstar\ttähti\ndog;koira;A new example.\nroska'); await pg.click('#gs-add'); await pg.wait_for_timeout(150)
        chk('  lisäys riveittäin: uudet, päivitetty ja ohitettu',(await pg.inner_text('#gs-msg'))=='Lisätty 2 sanaa. Päivitetty 1. Ohitettu 1 puutteellinen rivi.', await pg.inner_text('#gs-info'))
        await pg.click('#gs-copy'); await pg.wait_for_timeout(200); print('  kopiointi:', await pg.inner_text('#gs-msg'))
        await pg.click('#gs-ok'); await pg.wait_for_timeout(150); await pg.screenshot(path='ok3_valinta.png')
        chk('  valintanäkymä',(await pg.inner_text('#gm-list')).replace('\n',' ')=='Englannin sanoja 29 korttia' and 'Nähty 0/29' in await pg.inner_text('#pairinfo'))
        # 3 aloitus
        await pg.click('#to-play'); await pg.wait_for_timeout(150); await pg.screenshot(path='ok4_aloitus.png')
        chk('3 aloitusnäkymä kertoo päivän tilanteen',flat(await pg.inner_text('#today'))=='Tänään Ei kertattavia kortteja. Uusia tulee enintään 10. Pelissä on 29 korttia. Yhtään ei ole vielä nähty.', await pg.inner_text('#today'))
        await pg.click('#lv [data-lv="helppo"]'); await pg.click('#len [data-len="20"]')
        chk('  vaikeustaso ja pituus tallentuvat pelaajalle ja pelille',await store('[d.prog["p1|g1"].lv,d.prog["p1|g1"].len]')==['helppo',20] and (await pg.inner_text('#picked'))=='Helppo, 20 banaania. Voit vaihtaa näitä alla.', await pg.inner_text('#lvdesc'))
        await pg.click('#lv [data-lv="tavallinen"]'); await pg.click('#len [data-len="10"]'); await pg.click('#start'); await pg.wait_for_timeout(300); await pg.screenshot(path='ok5_kysymys.png')
        chk('  kierros alkaa: kenttä, kysymys ja neljä vaihtoehtoa',await pg.locator('#field .mon').count()==1 and await pg.locator('#opts .opt').count()==4 and (await pg.inner_text('#ctx')).replace('\n',' ')=='Aino · Tavallinen 0/10' and not await pg.is_visible('#gobar'), await pg.get_attribute('#field','aria-label'))
        # 4 vastaukset
        r=await turn(True,'ok6_oikein.png'); chk('4 oikea vastaus: banaani ja palaute',r['label']=='Oikein' and r['hud']=='1/10' and 'Esimerkki' in r['fb'] and await pg.is_visible('#gobar'), r)
        chk('  oikea rivi merkitty, vaihtoehdot lukittu',await pg.locator('#opts .opt.ok').count()==1 and await pg.locator('#opts .opt:disabled').count()==4 and await pg.locator('#opts .opt.bad').count()==0)
        await go(); r=await turn(False,'ok7_vaarin_uusi.png')
        chk('  uuden kortin väärä vastaus ei liikuta hirviöitä',r['label'].startswith('Väärin. Oikea vastaus: ') and 'ei liikuttanut hirviöitä' in r['fb'] and await store('d.prog["p1|g1"].round.miss')==0, r)
        chk('  väärä ja oikea rivi merkitty',await pg.locator('#opts .opt.bad').count()==1 and await pg.locator('#opts .opt.ok').count()==1, await pg.locator('#opts .opt.bad').get_attribute('aria-label'))
        first_wrong=r['q']
        # kortin korjaus
        await pg.click('#fix'); await pg.fill('#cs-ex','Korjattu esimerkki.'); await pg.click('#cs-ok'); await pg.wait_for_timeout(150)
        chk('  kortin korjaus tallentuu',(await pg.inner_text('#fixmsg')).startswith('Kortti korjattu') and await store('d.games[0].items.filter(function(x){return x.ex==="Korjattu esimerkki."}).length')==1)
        await go(); await turn(True); await go(); await turn(True); await go(); await turn(True); await go()
        r=await turn(False,'ok8_vaarin_kertaus.png')
        chk('  väärin mennyt kortti palaa kolmen muun jälkeen ja nyt virhe lasketaan',r['q']==first_wrong and r['kind']=='Kertaus: meni viimeksi väärin' and await store('d.prog["p1|g1"].round.miss')==1 and 'Korjattu esimerkki.' in r['fb'], r)
        # välilehden vaihto palautteen aikana ei riko mitään
        await pg.click('[data-tab="sel"]'); chk('  Jatka-palkki ei näy muilla välilehdillä',not await pg.is_visible('#gobar')); await pg.click('[data-tab="play"]'); await pg.wait_for_timeout(150)
        chk('  paluu peliin: uusi kysymys, sama kierros',await pg.is_visible('#q') and await store('d.prog["p1|g1"].round.hits')==4)
        # 5 kesken jääneen pelin jatko latauksen jälkeen
        await pg.reload(); await pg.wait_for_timeout(300); await pg.screenshot(path='ok9_kesken.png')
        chk('5 lataus: peli kesken -kortti',flat(await pg.inner_text('#resume'))=='Peli kesken Banaaneja 4/10, tavallinen.' and (await pg.inner_text('#start'))=='Aloita uusi peli')
        await pg.click('#resume-go'); await pg.wait_for_timeout(200); chk('  jatko samasta tilanteesta',(await pg.inner_text('#hud-n'))=='4/10' and await pg.locator('#field .mon').count()==await store('d.prog["p1|g1"].round.mons.length'))
        # 6 voittoon
        n=0
        while await pg.is_visible('#q') and n<30:
            r=await turn(True, 'ok10_voitto.png' if (await pg.inner_text('#hud-n'))=='9/10' else None); n+=1
            if (await pg.inner_text('#next'))=='Näytä tulos': chk('6 viimeinen banaani: voitto',r['cap']=='Voitto' and 'voitit pelin' in r['fb'] and await pg.locator('#field .mon').count()==0, r)
            await go()
        await pg.screenshot(path='ok11_tulos.png')
        chk('  tuloskortti ja tilasto',(await pg.inner_text('#result')).startswith('Voitto: kaikki banaanit heitetty') and 'Pisteet 10/10. Virheitä 1. Tavallinen.' in await pg.inner_text('#result') and await store('[d.prog["p1|g1"].st,d.prog["p1|g1"].round]')==[{'r':1,'w':1,'p':10},None], await pg.inner_text('#result'))
        chk('  päiväraja täynnä: aloitus kertoo lisäkierroksesta','Peli jatkuu jo opituilla korteilla' in await pg.inner_text('#today') or 'Vuorossa' in await pg.inner_text('#today'), flat(await pg.inner_text('#today')))
        # 7 häviöön vaikealla
        await pg.click('#lv [data-lv="vaikea"]'); await pg.click('#start'); await pg.wait_for_timeout(250); n=0; r=None
        while await pg.is_visible('#q') and n<40:
            r=await turn(False, None); n+=1
            if (await pg.inner_text('#next'))=='Näytä tulos': await pg.screenshot(path='ok12_havio.png'); break
            await go()
        chk('7 pelkät virheet: hirviö saa kiinni',r['cap']=='Kiinni jäit' and 'peli päättyi' in r['fb'] and await pg.locator('#field .chimp.down').count()==1, str(n)+' vastausta | '+r['fb'][:90])
        await go(); chk('  häviön tuloskortti; eteneminen säilyy',(await pg.inner_text('#result')).startswith('Hirviö sai kiinni') and await store('d.prog["p1|g1"].st.r')==2 and await store('Object.keys(d.prog["p1|g1"].cards).length')>=10, flat(await pg.inner_text('#result')))
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
        chk('9 kortti pois kierrosta',await store('d.games[0].items.filter(function(x){return x.off}).length')==1 and (await pg.inner_text('#fixmsg'))=='Kortti poistettu kierrosta.')
        await go(); await pg.click('#quit'); await pg.click('#quit'); await pg.click('[data-tab="sel"]'); await pg.click('#gm-list [data-edit="g1"]'); await pg.wait_for_timeout(150)
        chk('  pelin muokkaus näyttää poistetun',(await pg.inner_text('#gs-offsum'))=='Kierrosta poistetut kortit (1)' and 'Kierrosta poistettu 1.' in await pg.inner_text('#gs-info'))
        await pg.click('#gs-offsum'); await pg.click('#gs-off .btn'); chk('  palautus',await store('d.games[0].items.filter(function(x){return x.off}).length')==0 and not await pg.is_visible('#gs-offbox'))
        await pg.fill('#gs-name','Englanti 1'); await pg.click('#gs-ok'); chk('  pelin nimen vaihto näkyy yläpalkissa',(await pg.inner_text('#tname'))=='Englanti 1')
        # 10 palkit ennen vastausta: historia, jossa vastaukset jakautuvat
        await pg.evaluate("(function(){var d=JSON.parse(localStorage.getItem('%s')),S=d.prog['p1|g1'];Object.keys(S.cards).forEach(function(id){var c=S.cards[id];c.l=1;c.d='2999-01-01';});var c=S.cards['i1>'];c.l=0;c.d='2020-01-01';c.t=0;c.h={'\\t':3,'talo':3,'vesi':1};localStorage.setItem('%s',JSON.stringify(d));})()"%(KEY,KEY))
        await pg.reload(); await pg.wait_for_timeout(250); await pg.click('#start'); await pg.wait_for_timeout(250); await pg.screenshot(path='ok13_palkit_ennen.png')
        tags=await pg.evaluate("[...document.querySelectorAll('#opts .opt')].map(function(b){return b.querySelector('.t').textContent+':'+b.querySelector('.tag').textContent+':'+b.style.getPropertyValue('--f')}).sort()")
        chk('10 palkit näkyvät ennen vastausta, kun historia on jakautunut',(await pg.inner_text('#q'))=='dog' and await pg.is_visible('#prenote') and 'koira:43 %:0.429' in tags and 'talo:43 %:0.429' in tags and 'vesi:14 %:0.143' in tags, tags)
        r=await turn(True,'ok14_palkit_jalkeen.png'); chk('  vastauksen jälkeen jakauma päivittyy ja näkyminen kirjataan',await store('d.prog["p1|g1"].pre')==[1,1] and not await pg.is_visible('#prenote') and '50 %' in await pg.inner_text('#opts .opt.ok'), await pg.inner_text('#opts'))
        await go(); r=await turn(True); chk('  muut kortit: lisäkierros ilman palkkeja etukäteen',r['kind']=='Lisäkierros: jo opittu kortti', r['kind'])
        await go(); await pg.click('#quit'); await pg.click('#quit')
        chk('  ei vaakavieritystä (390 px)',(await ow())[0]==390 and (await ow())[1]==(await ow())[2], await ow())
        # 11 asetukset
        await pg.click('[data-tab="set"]'); await pg.wait_for_timeout(150); await pg.screenshot(path='ok15_asetukset.png')
        chk('11 asetusten otsikot',await pg.locator('#p-set h2').all_inner_texts()==['Ulkoasu','Kertaus','Peli tekoälyn avulla','Tiedot'], await pg.locator('#p-set h2, #p-set h3').all_inner_texts())
        await pg.click('#set-tint [data-v="vihrea"]'); await pg.click('#set-mode [data-v="dark"]'); await pg.click('#set-newPerDay [data-v="20"]'); await pg.click('#set-bars summary'); await pg.click('#set-preMin [data-v="3"]')
        chk('  asetukset tallentuvat ja väri vaihtuu',await store('[d.cfg.tint,d.cfg.mode,d.cfg.newPerDay,d.cfg.preMin]')==['vihrea','dark',20,3] and (await pg.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()"))=='#30D158')
        await pg.screenshot(path='ok16_tumma.png'); await pg.click('#set-mode [data-v="auto"]')
        await pg.click('#ai-show summary'); guide=await pg.input_value('#ai-show textarea'); chk('  aloitusviesti tekoälylle',guide.startswith('Haluan tehdä kanssasi pelin') and '"sanat"' in guide and guide.endswith('Aiheeni on: '), str(len(guide))+' merkkiä')
        # aloitusviestin esimerkki kelpaa sellaisenaan
        ex=guide[guide.index('MUOTO')+6:guide.index('- "sanat" ja')]
        chk('  aloitusviestin esimerkkimuoto on appin luettavissa',await pg.evaluate("(function(t){var r=parseGameText(t);return r.ok&&r.items.length===3&&r.name==='Pelin nimi'})(%s)"%json.dumps(ex)))
        # 12 vienti ja tuonti tekstinä
        await pg.click('#exptext summary'); txt=await pg.input_value('#textout textarea'); o=json.loads(txt)
        chk('12 vienti tekstinä',o['app']=='oppikartta' and len(o['players'])==1 and len(o['games'][0]['items'])==15 and 'p1|g1' in o['prog'], str(len(txt))+' merkkiä')
        await pg.click('#wipe'); await pg.click('#wipe'); await pg.wait_for_timeout(150); chk('  tyhjennys',await store('[d.players.length,d.games.length,d.cfg.tint]')==[0,0,'vihrea'] and (await pg.inner_text('#datamsg'))=='Kaikki tiedot poistettu.')
        await pg.click('#imptextbox summary'); await pg.fill('#imptext','{"oppikartta":"peli","sanat":[["a","b"],["c","d"]]}'); await pg.click('#imptextgo'); chk('  yksittäinen peli ei kelpaa varmuuskopioksi','yksittäinen peli' in await pg.inner_text('#datamsg'))
        await pg.fill('#imptext',txt); await pg.click('#imptextgo'); await pg.wait_for_timeout(150); print('  tuonnin kysymys:', await pg.inner_text('#dataout .confirm p'))
        await pg.click('#imp-yes'); await pg.wait_for_timeout(150)
        chk('  tuonti palauttaa pelaajat, pelit ja etenemisen',await store('[d.players.length,d.games[0].name,d.games[0].items.length,Object.keys(d.prog["p1|g1"].cards).length>=10,d.prog["p1|g1"].st.r]')==[1,'Englanti 1',15,True,2] and (await pg.inner_text('#datamsg'))=='Tiedot tuotu.')
        await pg.click('[data-tab="play"]'); chk('  tuonnin jälkeen peli aukeaa',await pg.is_visible('#start') and (await pg.inner_text('#tname'))=='Englanti 1')
        # 13 pelin poisto
        state=await pg.evaluate("localStorage.getItem('%s')"%KEY)
        await pg.click('[data-tab="sel"]'); await pg.click('#gm-list [data-edit="g1"]'); await pg.click('#gs-del'); await pg.click('#gs-del'); await pg.wait_for_timeout(150)
        chk('13 pelin poisto vie myös etenemisen',await store('[d.games.length,Object.keys(d.prog).length,d.cur.g]')==[0,0,None])
        await pg.click('[data-tab="play"]'); chk('  ilman peliä: ohje','Valitse tai lisää peli' in await pg.inner_text('#p-play'))
        await ctx.close()

        # 14 kapea näyttö, tumma tila, pitkät tekstit
        ctx=await b.new_context(viewport={'width':320,'height':568},device_scale_factor=2,color_scheme='dark')
        await ctx.add_init_script("if(!localStorage.getItem('%s'))localStorage.setItem('%s', %s);"%(KEY,KEY,json.dumps(state)))
        pg=await ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(U); await pg.wait_for_timeout(300)
        await pg.evaluate("(function(){var d=JSON.parse(localStorage.getItem('%s'));d.cfg.mode='auto';d.games[0].name='Hyvin pitkä pelin nimi joka ei mahdu yhdelle riville millään';d.games[0].items.push({id:'i99',k:'m',q:'Mikä seuraavista väittämistä kuvaa parhaiten sitä, miten pitkä kysymys rivittyy kapealla näytöllä?',c:'Teksti rivittyy eikä levitä sivua',w:['Sivua pitää vierittää sivusuunnassa','Teksti leikkautuu näkymättömiin','Fonttikoko pienenee lukukelvottomaksi'],ex:'Pitkä selitys, joka kertoo perusteellisesti, miksi oikea vastaus on oikea ja väärät vääriä.'});d.games[0].items.unshift(d.games[0].items.pop());d.prog['p1|g1'].cards={};d.prog['p1|g1'].nd=0;localStorage.setItem('%s',JSON.stringify(d));})()"%(KEY,KEY))
        await pg.reload(); await pg.wait_for_timeout(300); await pg.screenshot(path='ok17_kapea_aloitus.png')
        o1=await pg.evaluate("[document.documentElement.scrollWidth,document.getElementById('main').scrollWidth,document.getElementById('main').clientWidth]")
        await pg.click('#start'); await pg.wait_for_timeout(300); await pg.screenshot(path='ok18_kapea_kysymys.png')
        o2=await pg.evaluate("[document.documentElement.scrollWidth,document.getElementById('main').scrollWidth,document.getElementById('main').clientWidth]")
        await pg.locator('#opts .opt').nth(0).click(); await pg.wait_for_timeout(900); await pg.screenshot(path='ok19_kapea_palaute.png')
        o3=await pg.evaluate("[document.documentElement.scrollWidth,document.getElementById('main').scrollWidth,document.getElementById('main').clientWidth]")
        vis=await pg.evaluate("(function(){var g=document.getElementById('gobar').getBoundingClientRect(),n=document.getElementById('nav').getBoundingClientRect(),f=document.getElementById('fix').getBoundingClientRect();return [Math.round(g.bottom)<=Math.round(n.top)+1,f.bottom<=g.top+1]})()")
        chk('14 kapea näyttö (320 px, tumma): ei vaakavieritystä, Jatka välilehtien yläpuolella, palaute näkyvissä',o1[0]==320 and o2[0]==320 and o3[0]==320 and o1[1]==o1[2] and o2[1]==o2[2] and o3[1]==o3[2] and vis==[True,True], [o1,o2,o3,vis])
        await pg.click('#next'); await pg.click('[data-tab="sel"]'); await pg.wait_for_timeout(150); await pg.screenshot(path='ok20_kapea_valinta.png')
        await pg.click('#gm-list [data-edit="g1"]'); await pg.wait_for_timeout(200); await pg.screenshot(path='ok21_kapea_peli_ikkuna.png')
        o4=await pg.evaluate("[document.documentElement.scrollWidth,document.getElementById('gsheet').scrollWidth,document.getElementById('gsheet').clientWidth]")
        chk('  valinta ja pelin ikkuna kapealla',o4[0]==320 and o4[1]==o4[2], o4)
        chk('sivuvirheitä ei tullut',errs==[], errs)
        print('errs',errs); await b.close()
    print('KAIKKI OK' if not fails else 'VIRHEITÄ: '+'; '.join(fails)); sys.exit(1 if fails else 0)
asyncio.run(main())
