# Käy pelin läpi puhelinleveydellä: pelaaja, vaikeustaso, lukittu pelinäkymä, napautus kentälle kolmella eläimellä,
# tauko, pelin loppu ja ennätys, toinen pelaaja, varmuuskopio tekstinä. Lopuksi 320 px tummana ja korkea näyttö.
# Aikaa siirretään testikoukulla (__vv.advance), jottei tarvitse odottaa.
import asyncio, json, os, sys
from playwright.async_api import async_playwright
U='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html'))
KEY='viidakkovahti:v1'
fails=[]
def flat(s): return ' '.join(s.split())
def chk(label,cond,extra=''):
    print(('ok   ' if cond else 'FAIL ')+label+((' | '+str(extra)) if extra!='' else ''))
    if not cond: fails.append(label)
FITS="(function(){var m=document.getElementById('main'),a=document.getElementById('ammo').getBoundingClientRect(),s=document.getElementById('stage').getBoundingClientRect();return [document.documentElement.scrollWidth,m.scrollHeight-m.clientHeight,Math.round(a.bottom)<=innerHeight,Math.round(s.height)>innerHeight*0.6]})()"
ST="(function(){var G=__vv.game();return G?{score:G.score,lives:G.lives,sel:G.sel,holes:G.holesLeft,nh:G.holes.length,shots:G.shots.map(function(s){return s.k}),n:G.enemies.length,over:G.over,paused:G.paused,t:Math.round(G.t*10)/10,H:Math.round(G.H),obst:G.obst.length}:null})()"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); errs=[]
        ctx=await b.new_context(viewport={'width':390,'height':760},device_scale_factor=2,has_touch=True)
        pg=await ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
        store=lambda q: pg.evaluate("(function(){var d=JSON.parse(localStorage.getItem('%s'));return %s})()"%(KEY,q))
        st=lambda: pg.evaluate(ST)
        async def tapw(x,y):   # napautus kentän kohtaan (kentän omissa yksiköissä)
            t=await pg.evaluate("__vv.tap(%f,%f)"%(x,y)); await pg.touchscreen.tap(t['x'],t['y']); await pg.wait_for_timeout(60)
        async def clear():      # kenttä tyhjäksi ja uudet viholliset pois, jotta tilanne on hallittu
            await pg.evaluate("(function(){var G=__vv.game();G.enemies=[];G.shots=[];G.obst=[];G.spawnT=1e9;})()")
        async def put(type,x,y):
            await pg.evaluate("(function(){var G=__vv.game();G.seq++;G.enemies.push({id:G.seq,type:'%s',x:%f,y:%f,hp:%d,r:5,spd:0,amp:0,f:1,ph:0});})()"%(type,x,y,3 if type=='jarea' else 1))

        # 1 aloitus
        await pg.goto(U); await pg.wait_for_timeout(300); await pg.screenshot(path='vv1_alku.png')
        chk('1 alussa pyydetään lisäämään pelaaja','Lisää pelaaja' in await pg.inner_text('#p-start') and not await pg.is_visible('#p-game'))
        await pg.click('#start'); chk('  peli ei ala ilman pelaajaa',(await pg.inner_text('#start-msg'))=='Lisää ensin pelaaja.' and not await pg.is_visible('#p-game'))
        await pg.click('#pl-add'); chk('  tyhjä nimi hylätään',(await pg.inner_text('#pl-msg'))=='Kirjoita pelaajan nimi.')
        await pg.fill('#pl-new','Aino'); await pg.keyboard.press('Enter'); await pg.fill('#pl-new','aino'); await pg.click('#pl-add')
        chk('  sama nimi hylätään',(await pg.inner_text('#pl-msg'))=='Tämän niminen pelaaja on jo.' and await store('d.players.length')==1)
        await pg.click('#lv [data-lv="helppo"]'); chk('  vaikeustaso tallentuu',await store('d.lv')=='helppo' and (await pg.get_attribute('#lv [data-lv="helppo"]','aria-pressed'))=='true', await pg.inner_text('#lvdesc'))
        await pg.click('#lv [data-lv="tavallinen"]'); await pg.screenshot(path='vv2_valmis.png')
        chk('  ohje kertoo pisteytyksen','Ohi mennyt banaani vie pisteen' in await pg.inner_text('.how') and 'kaksi 4, kolme 9' in await pg.inner_text('.how') and 'pisteitä siitä ei saa' in await pg.inner_text('.how'))
        chk('  ohje kertoo kolme eläintä',await pg.locator('.how li').count()==3 and 'Simpanssi' in await pg.inner_text('.how') and 'Elefantti' in await pg.inner_text('.how') and 'Myyrä' in await pg.inner_text('.how'))
        # 2 peli alkaa
        await pg.evaluate("__vv.seed(11)"); await pg.click('#start'); await pg.wait_for_timeout(300); await pg.screenshot(path='vv3_peli.png')
        s=await st(); fit=await pg.evaluate(FITS)
        chk('2 peli alkaa: kenttä täyttää ruudun, mikään ei vieri, alla kolme painiketta',fit==[390,0,True,True] and await pg.locator('#ammo .am').count()==3 and s['lives']==3 and s['sel']=='ban' and 4<=s['obst']<=7, [fit,s])
        chk('  yläpalkissa pelaaja, taso, elämät ja pisteet',flat(await pg.inner_text('#tname'))=='Aino Tavallinen' and (await pg.get_attribute('#lives','aria-label'))=='Elämiä 3/3' and (await pg.inner_text('#score'))=='0')
        await pg.evaluate("__vv.advance(8)"); s2=await st(); chk('  viholliset tulevat ylhäältä',s2['n']>=3 and s2['lives']==3, s2)
        # 3 banaani
        await clear(); await tapw(20,30); await pg.evaluate("__vv.advance(1.6)"); await pg.wait_for_timeout(60); await pg.screenshot(path='vv3b_ohi.png'); s=await st()
        chk('3 ohi mennyt banaani vie pisteen',s['score']==-1 and (await pg.inner_text('#score'))=='-1' and s['shots']==[], s)
        await put('perus',50,40); await tapw(50,90); s=await st(); chk('  napautus heittää banaanin',s['shots']==['ban'], s)
        await pg.evaluate("__vv.advance(1.1)"); s=await st(); chk('  banaani jatkaa napautetun kohdan ohi ja osuu takana olevaan: piste',s['n']==0 and s['score']==0 and (await pg.inner_text('#score'))=='0', s)
        await put('jarea',50,40)
        for i in range(3): await tapw(50,40); await pg.evaluate("__vv.advance(0.9)")
        s=await st(); chk('  järeä kaatuu kolmannella banaanilla: kolme pistettä, osumista ei miinusta',s['n']==0 and s['score']==3, s)
        # 4 vesimeloni ja elefantti
        await put('jarea',50,60); await put('perus',55,63); await pg.evaluate("__vv.game().obst=[{x:50,y:100,r:7}]")
        await pg.click('#ammo [data-a="mel"]'); await pg.wait_for_timeout(60); await tapw(50,60); await pg.wait_for_timeout(150); await pg.screenshot(path='vv4_meloni.png')
        s=await st(); chk('4 elefantti heittää vesimelonin',s['sel']=='mel' and s['shots']==['mel'] and (await pg.get_attribute('#ammo [data-a="mel"]','aria-pressed'))=='true' and s['n']==2, s)
        await pg.evaluate("__vv.advance(1.2)"); await pg.wait_for_timeout(60); await pg.screenshot(path='vv5_plasahdys.png'); s=await st()
        chk('  meloni putoaa napautettuun kohtaan kiven yli ja vie järeänkin kerralla: kaksi vihollista on neljä pistettä',s['n']==0 and s['score']==7, s)
        # 5 myyrä ja kolot
        await pg.click('#ammo [data-a="mole"]'); await pg.wait_for_timeout(60); await tapw(50,100); s=await st()
        chk('5 koloa ei voi kaivaa kiveen',s['holes']==3 and s['nh']==0, s)
        await tapw(30,80); await pg.wait_for_timeout(120); await pg.screenshot(path='vv6_kolo.png'); s=await st()
        chk('  kolo tulee napautettuun kohtaan ja laskuri vähenee',s['holes']==2 and s['nh']==1 and (await pg.inner_text('#holes'))=='2' and s['sel']=='mole', s)
        await pg.evaluate("(function(){var G=__vv.game();G.seq++;G.enemies.push({id:G.seq,type:'perus',x:30,y:70,hp:1,r:4.6,spd:9.5,amp:0,f:1,ph:0});})()"); await pg.evaluate("__vv.advance(2)"); s=await st()
        chk('  koloon kävelevä vihollinen putoaa pois, pisteitä ei tule',s['n']==0 and s['score']==7, s)
        await tapw(70,80); await tapw(50,50); s=await st()
        chk('  kolmannen kolon jälkeen myyräpainike sammuu ja simpanssi palaa',s['holes']==0 and s['nh']==3 and s['sel']=='ban' and await pg.is_disabled('#ammo [data-a="mole"]') and (await pg.get_attribute('#ammo [data-a="ban"]','aria-pressed'))=='true', s)
        # 6 tauko
        await pg.click('#pause'); await pg.wait_for_timeout(80); t0=(await st())['t']; await pg.evaluate("__vv.advance(2)"); s=await st()
        chk('6 tauko pysäyttää pelin',s['paused'] and s['t']==t0 and await pg.is_visible('#ov') and 'Tauko' in await pg.inner_text('#ovbox'), s)
        await tapw(50,50); chk('  tauolla napautus ei ammu',(await st())['shots']==[])
        await pg.click('#resume'); await pg.wait_for_timeout(80); chk('  jatko',not (await st())['paused'] and not await pg.is_visible('#ov'))
        # 7 pelin loppu ja ennätys
        for x in (10,40,90): await put('nopea',x,5)   # kolojen ohi
        await pg.evaluate("(function(){var G=__vv.game();G.enemies.forEach(function(e){e.spd=16;});})()"); await pg.evaluate("__vv.advance(12)"); await pg.wait_for_timeout(120); await pg.screenshot(path='vv7_loppu.png'); s=await st()
        chk('7 kolme läpi päässyttä päättää pelin',s['over'] and s['lives']==0 and (await pg.get_attribute('#lives','aria-label'))=='Elämiä 0/3', s)
        chk('  tulos ja uusi ennätys',flat(await pg.inner_text('#ovbox')).startswith('Peli päättyi 7 Uusi ennätys! Vihollisia pysäytetty 5. Banaaneja ohi 1.') and await store('d.players[0]')=={'id':'p1','name':'Aino','total':7,'games':1,'best':{'helppo':0,'tavallinen':7,'vaikea':0}}, flat(await pg.inner_text('#ovbox')))
        await pg.click('#again'); await pg.wait_for_timeout(250); s=await st(); chk('  uusi peli: uusi kenttä, pisteet nollassa',not s['over'] and s['score']==0 and s['lives']==3 and s['holes']==3 and not await pg.is_visible('#ov'), s)
        await pg.click('#pause'); await pg.click('#quit'); await pg.wait_for_timeout(120)
        chk('  kesken lopetettu peli ei kirjaudu, alkunäkymä vierii taas',await store('d.players[0].games')==1 and await pg.is_visible('#start') and await pg.evaluate("!document.getElementById('main').classList.contains('lock')"))
        chk('  ennätykset näkyvät alussa',flat(await pg.inner_text('#best'))=='Ennätykset: Aino Helppo 0 · Tavallinen 7 · Vaikea 0 Pelejä 1, pisteitä yhteensä 7.', flat(await pg.inner_text('#best')))
        # 8 toinen pelaaja
        await pg.fill('#pl-new','Toinen'); await pg.click('#pl-add'); await pg.wait_for_timeout(80)
        chk('8 toisella pelaajalla omat pisteet',await store('d.cur')=='p2' and 'Ei vielä pelattuja pelejä' in await pg.inner_text('#best') and flat(await pg.inner_text('#pl-list'))=='Aino 7 pistettä Toinen 0 pistettä')
        await pg.click('#pl-list [data-edit="p2"]'); await pg.fill('#ps-name','Vieras'); await pg.click('#ps-ok'); chk('  nimen vaihto',await store('d.players[1].name')=='Vieras')
        # 9 varmuuskopio tekstinä
        await pg.click('#data summary'); await pg.click('#exp'); txt=await pg.input_value('#datatext'); o=json.loads(txt)
        chk('9 tiedot tekstinä',o['app']=='viidakkovahti' and len(o['players'])==2 and o['players'][0]['best']['tavallinen']==7)
        await pg.click('#wipe'); await pg.click('#wipe'); await pg.wait_for_timeout(80); chk('  tyhjennys',await store('d.players.length')==0 and (await pg.inner_text('#datamsg'))=='Kaikki tiedot poistettu.')
        await pg.fill('#datatext','roskaa'); await pg.click('#imp'); chk('  kelvoton teksti hylätään',(await pg.inner_text('#datamsg'))=='Teksti ei ole Viidakkovahdin varmuuskopio.')
        await pg.fill('#datatext',txt); await pg.click('#imp'); await pg.wait_for_timeout(80); chk('  tuonti palauttaa pelaajat ja ennätykset',await store('[d.players.length,d.players[0].best.tavallinen,d.cur]')==[2,7,'p2'] and (await pg.inner_text('#datamsg'))=='Tiedot tuotu: 2 pelaajaa.')
        await pg.click('#pl-list [data-edit="p2"]'); await pg.click('#ps-del'); await pg.click('#ps-del'); await pg.wait_for_timeout(80); chk('  pelaajan poisto',await store('[d.players.length,d.cur]')==[1,'p1'])
        state=await pg.evaluate("localStorage.getItem('%s')"%KEY); await ctx.close()

        # 10 kapea näyttö tummana ja korkea näyttö: kaikki mahtuu
        for (w,h,cs,tag,label) in [(320,568,'dark','vv8_kapea','10 kapea näyttö (320 x 568, tumma)'),(430,932,'light','vv9_korkea','11 korkea näyttö (430 x 932)')]:
            ctx=await b.new_context(viewport={'width':w,'height':h},device_scale_factor=2,color_scheme=cs,has_touch=True)
            await ctx.add_init_script("if(!localStorage.getItem('%s'))localStorage.setItem('%s', %s);"%(KEY,KEY,json.dumps(state)))
            pg=await ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
            await pg.goto(U); await pg.wait_for_timeout(300); o1=await pg.evaluate("[document.documentElement.scrollWidth,document.getElementById('main').scrollWidth,document.getElementById('main').clientWidth]")
            await pg.evaluate("__vv.seed(5)"); await pg.click('#lv [data-lv="vaikea"]'); await pg.click('#start'); await pg.wait_for_timeout(300); await pg.evaluate("__vv.advance(7)"); await pg.wait_for_timeout(80); await pg.screenshot(path=tag+'.png')
            fit=await pg.evaluate(FITS); s=await pg.evaluate(ST)
            t=await pg.evaluate("__vv.tap(50,60)"); await pg.touchscreen.tap(t['x'],t['y']); await pg.wait_for_timeout(60); s2=await pg.evaluate(ST)
            chk(label+': aloitus ei vieri sivulle, peli mahtuu ruutuun, napautus osuu oikeaan kohtaan',o1[0]==w and o1[1]==o1[2] and fit==[w,0,True,True] and s2['shots']==['ban'] and s['n']>0, [fit,s['H'],s['n']])
            await ctx.close()
        chk('sivuvirheitä ei tullut',errs==[], errs)
        print('errs',errs); await b.close()
    print('KAIKKI OK' if not fails else 'VIRHEITÄ: '+'; '.join(fails)); sys.exit(1 if fails else 0)
asyncio.run(main())
