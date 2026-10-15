# Pajakone 1: näkymän laitemuoto (Vapaa / Puhelin / iPad pysty / iPad vaaka) ja tuonti Kytköskartasta.
# 1440 ja 1280 px: laitteen valinta näkymän asetuksista, kehys kanvaasilla, Näytä koko ruutu, Kumoa,
# lukittuna laitteen muotoinen ikkuna keskellä (skaalattuna), rullaus vain alaspäin sisällön alareunaan,
# ei sivuttain eikä zoomausta, avaus ylhäältä, logiikka-välilehdellä ei laitetaustaa.
# 390 px (puhelin): lukittu puhelinnäkymä täyttää ruudun (ei kehystä).
# Tuonti: Kytköskartan projektit samasta selaimesta, ei tuplia, Kytköskartan tiedot ennallaan, oma tallennusavain.
# Kuvakaappaukset pajakone1_*.png.
import asyncio, json
from playwright.async_api import async_playwright
from yhteinen import *

async def cam(pg):
    return await pg.evaluate("(function(){var c=APP.P.cam[APP.S.vw];return [c.x,c.y,c.z];})()")
async def vpbox(pg):
    return await pg.evaluate("(function(){var r=document.querySelector('#uvp').getBoundingClientRect();return [r.left,r.top,r.width,r.height];})()")
async def stbox(pg):
    return await pg.evaluate("(function(){var r=document.querySelector('#stage').getBoundingClientRect();return [r.left,r.top,r.width,r.height];})()")
async def lisaa(pg,k,x,y,w=None,h=None,nm=None):
    return await pg.evaluate("""(function(){var b=KK.addBlock(APP.P,'%s',{v:APP.S.vw});b.x=%d;b.y=%d;%s%s%s APP.saveNow&&APP.saveNow();APP.renderAll();return b.id;})()"""%(
        k,x,y,('b.w=%d;'%w) if w else '',('b.h=%d;'%h) if h else '',("KK.setName(APP.P,b,'%s');"%nm) if nm else ''))

async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Puhelinappi');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            # --- 1. Laitteen valinta näkymän asetuksista ---
            await pg.click('#stage');await pg.wait_for_timeout(80)
            segs=await pg.eval_on_selector_all('#insp [data-vseg="laite"]','e=>e.map(x=>x.textContent)')
            print(W,'1 laitevaihtoehdot:',segs)
            assert segs==['Vapaa','Puhelin','iPad pysty','iPad vaaka']
            assert not await pg.is_visible('#dframe')
            await pg.click('#insp [data-vseg="laite"][data-v="puhelin"]');await pg.wait_for_timeout(150)
            r=await P(pg,"[P.views[0].laite, KK.laite(P,P.views[0].id)]")
            assert r[0]=='puhelin' and r[1]['w']==390 and r[1]['h']==844,r
            fr=await pg.evaluate("(function(){var f=document.querySelector('#dframe');return [f.offsetLeft,f.offsetTop,f.offsetWidth,f.offsetHeight,f.textContent];})()")
            print(W,'1 kehys:',fr)
            assert fr[:4]==[0,0,390,844] and '390 × 844' in fr[4]
            # Näytä koko ruutu: kehys mahtuu näkyviin
            await pg.click('#insp [data-do="fitdev"]');await pg.wait_for_timeout(120)
            c=await cam(pg);v=await vpbox(pg)
            assert c[0]>=-1 and c[1]>=-1 and c[0]+390*c[2]<=v[2]+1 and c[1]+844*c[2]<=v[3]+1,(c,v)
            # Rullausvalinnat eivät näy laitemuodossa
            assert await pg.locator('#insp [data-vseg="rul"]').count()==0
            # Kumoa palauttaa vapaan
            await pg.click('#undobtn');await pg.wait_for_timeout(120)
            assert await P(pg,"P.views[0].laite||''")=='' and not await pg.is_visible('#dframe')
            await pg.click('#redobtn');await pg.wait_for_timeout(120)
            assert await P(pg,"P.views[0].laite||''")=='puhelin'
            # --- 2. Palikat: yksi ylhäällä, yksi ruudun alapuolella, yksi kehyksen ulkopuolella sivulla ---
            await lisaa(pg,'nappi',40,60,nm='Ylä')
            await lisaa(pg,'nayta',40,1200,w=300,h=40,nm='Alhaalla')
            await lisaa(pg,'nappi',600,2000,nm='Sivulla')
            await pg.screenshot(path='pajakone1_muokkaus_%d.png'%W)
            # --- 3. Lukitus: laitteen muotoinen ikkuna keskellä ---
            await pg.click('#lockbtn');await pg.wait_for_timeout(250)
            cls=await pg.evaluate("document.querySelector('#uvp').className")
            v=await vpbox(pg);s=await stbox(pg);c=await cam(pg)
            print(W,'3 lukittu:',cls,'ikkuna',[round(x) for x in v],'kamera',[round(x,3) for x in c])
            assert 'dev' in cls and 'devfull' not in cls
            z=c[2];assert abs(v[2]-390*z)<=1.5 and abs(v[3]-844*z)<=1.5,'mittasuhde'
            assert abs((v[0]-s[0])+v[2]/2-s[2]/2)<=2,'keskellä vaakasuunnassa'
            assert c[0]==0 and c[1]==0,'alkaa ylhäältä'
            assert await pg.evaluate("document.querySelector('#stage').classList.contains('devstage')")
            assert not await pg.is_visible('.zoomc')
            await pg.screenshot(path='pajakone1_puhelin_lukittu_%d.png'%W)
            # Rullaus alaspäin sisällön alareunaan asti, ei pidemmälle
            await pg.mouse.move(v[0]+v[2]/2,v[1]+v[3]/2)
            for i in range(8):
                await pg.mouse.wheel(300,500);await pg.wait_for_timeout(40)
            c=await cam(pg);vis=v[3]/z
            print(W,'3 rullattu:',[round(x,1) for x in c],'näkyvä korkeus',round(vis))
            assert c[0]==0,'ei sivuttain'
            assert abs(c[1]-(-(1240-vis)*z))<=1,'alareunaan asti'
            # Zoomaus ei muuta
            await pg.keyboard.down('Control');await pg.mouse.wheel(0,-300);await pg.keyboard.up('Control');await pg.wait_for_timeout(80)
            assert abs((await cam(pg))[2]-z)<1e-6
            # Ikkunan koon muutos säilyttää muodon
            await pg.set_viewport_size({'width':W-200,'height':760});await pg.wait_for_timeout(200)
            v2=await vpbox(pg);z2=(await cam(pg))[2]
            assert abs(v2[2]-390*z2)<=1.5 and abs(v2[3]-844*z2)<=1.5
            await pg.set_viewport_size({'width':W,'height':900});await pg.wait_for_timeout(200)
            # --- 4. Logiikka-välilehdellä ei laitetaustaa; takaisin näkymään ---
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(150)
            assert not await pg.evaluate("document.querySelector('#stage').classList.contains('devstage')")
            await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(150)
            assert 'dev' in await pg.evaluate("document.querySelector('#uvp').className")
            # --- 5. Avaus: muokattavaksi kehys takaisin, ikkuna normaali ---
            await pg.click('#lockbtn');await pg.wait_for_timeout(200)
            cls=await pg.evaluate("document.querySelector('#uvp').className")
            assert 'dev' not in cls.split() and await pg.is_visible('#dframe')
            st=await pg.evaluate("document.querySelector('#uvp').getAttribute('style')||''")
            assert 'width' not in st,st
            # --- 6. iPad vaaka: kehys skaalautuu ---
            await pg.click('#stage',position={'x':5,'y':300});await pg.wait_for_timeout(80)
            await pg.click('#insp [data-vseg="laite"][data-v="ipadv"]');await pg.wait_for_timeout(120)
            await pg.click('#lockbtn');await pg.wait_for_timeout(250)
            v=await vpbox(pg);z=(await cam(pg))[2]
            print(W,'6 iPad vaaka:',[round(x) for x in v],round(z,3))
            assert abs(v[2]-1180*z)<=1.5 and abs(v[3]-820*z)<=1.5 and z<1
            await pg.screenshot(path='pajakone1_ipad_vaaka_%d.png'%W)
            await pg.click('#lockbtn');await pg.wait_for_timeout(150)
            # --- 7. Tallennus omalla avaimella; Kytköskartan avainta ei luoda ---
            await pg.evaluate("APP.saveNow&&APP.saveNow()")
            ks=await pg.evaluate("[!!localStorage.getItem('pajakone.v1'),localStorage.getItem('kytkoskartta.v1')]")
            assert ks[0] and ks[1] is None,ks
            await pg.reload();await pg.wait_for_timeout(300)
            assert await P(pg,"P.views[0].laite")=='ipadv'
            print(W,'errs',errs);await b.close()

        # --- 8. Oikea puhelin (390 px): lukittu puhelinnäkymä täyttää ruudun ---
        b,pg,errs=await avaa(p,390,844)
        await pg.fill('#wname','Puhelin');await pg.click('#wcreate');await pg.wait_for_timeout(150)
        await pg.evaluate("(function(){APP.P.views[0].laite='puhelin';APP.saveNow&&APP.saveNow();APP.renderAll();})()")
        await lisaa(pg,'nappi',20,40,w=350,nm='Iso')
        await lisaa(pg,'nayta',20,1100,w=300,nm='Pohja')
        await pg.click('#lockbtn');await pg.wait_for_timeout(250)
        cls=await pg.evaluate("document.querySelector('#uvp').className");v=await vpbox(pg);s=await stbox(pg);c=await cam(pg)
        print('390 8 puhelimessa:',cls,[round(x) for x in v],[round(x) for x in s],[round(x,3) for x in c])
        assert 'devfull' in cls and abs(v[2]-s[2])<=1 and abs(c[2]-s[2]/390)<1e-3
        btn=await pg.evaluate("document.querySelector('.ue[data-id] .w-btn').getBoundingClientRect().width")
        assert abs(btn-350*c[2])<=2,'painike koko leveydellä'
        await pg.screenshot(path='pajakone1_puhelimessa_390.png')
        print('390 errs',errs);await b.close()

        # --- 9. Tuonti Kytköskartasta samasta selaimesta ---
        b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':1440,'height':900});errs=[]
        kkp={'id':'pkk1','name':'Kytköskartan projekti','seq':1,'views':[{'id':'v1','n':'Näkymä 1'}],'vseq':1,
             'b':{'b1':{'id':'b1','k':'nappi','nm':'Nappi','v':'v1','x':40,'y':40,'w':160,'h':44,'tx':'Hei','beh':'pohjaan'}},
             'lg':{'n':[],'l':[]},'deco':[],'st':{},'mem':{},'cam':{},'lcam':{'x':40,'y':40,'z':1},'lock':False,'_gh':{'sha':'abc','at':'x','dirty':False,'remote':False}}
        kk=json.dumps({'app':'kytkoskartta','ver':8,'projects':[kkp],'cur':'pkk1','cfg':{}})
        await ctx.add_init_script("if(!localStorage.getItem('testi:kk')){localStorage.setItem('testi:kk','1');localStorage.setItem('kytkoskartta.v1',%s);}"%json.dumps(kk))
        pg=await ctx.new_page();pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(U);await pg.wait_for_timeout(300)
        await pg.fill('#wname','Oma');await pg.click('#wcreate');await pg.wait_for_timeout(150)
        await pg.click('#projbtn');await pg.wait_for_timeout(120)
        await pg.click('[data-x="fromkk"]');await pg.wait_for_timeout(200)
        r=await pg.evaluate("[APP.data.projects.map(p=>p.name),APP.P.name,!!APP.P._gh&&!!APP.P._gh.sha]")
        print('9 tuotu:',r)
        assert r[0]==['Oma','Kytköskartan projekti'] and r[1]=='Kytköskartan projekti' and not r[2]
        await pg.click('#projbtn');await pg.wait_for_timeout(120)
        await pg.click('[data-x="fromkk"]');await pg.wait_for_timeout(200)
        assert await pg.evaluate("APP.data.projects.length")==2,'ei tuplia'
        assert await pg.evaluate("localStorage.getItem('kytkoskartta.v1')")==kk,'Kytköskartta ennallaan'
        print('9 errs',errs);assert not errs;await b.close()
asyncio.run(main())
