# Rakenna-tila: kuvien tuonti (tiedostot nimen mukaan ja SVG-teksti), siirto hiirellä ja sormella, kahden sormen kierto ja koko
# kääntöpisteen ympäri, kääntöpisteen siirto (kuva pysyy paikallaan), kiertokahva ja kokokahva, kiinnitys toiseen osaan
# (pysyy paikallaan, nivel oletuksena), numerokentät, järjestys, piilotus, poisto ja Kumoa, tallennus ja kuvat uudelleenlatauksessa.
# Leveydet: 1280 (hiiri), 1024 ja 820 (iPad, kosketus). Kuvat rakenna_*.png.
import asyncio, os, math
from playwright.async_api import async_playwright
from yhteinen import *
async def main():
    D=os.getcwd()
    open(os.path.join(D,'b_kasi.svg'),'w').write(svg('#36c',40,140))
    open(os.path.join(D,'a_vartalo.svg'),'w').write(svg('#c33',120,200))
    async with async_playwright() as p:
        # ---------- Tietokone, hiiri ----------
        b,ctx,pg,errs=await avaa(p,1280,800)
        assert await pg.locator('#welcome.show').count()==1,'tervetuloa näkyy ilman animaatioita'
        await uusi(pg,'Ukko')
        async with pg.expect_file_chooser() as fc:await pg.click('#pal [data-x="tuokuva"]')
        ch=await fc.value;await ch.set_files([os.path.join(D,'b_kasi.svg'),os.path.join(D,'a_vartalo.svg')]);await pg.wait_for_timeout(500)
        nimet=await P(pg,"P.osat.map(o=>o.nimi)");print('osat',nimet);assert nimet==['a vartalo','b kasi'],'tiedostot nimen mukaan, viimeinen eteen'
        assert await P(pg,"P.osat.map(o=>[P.kuvat[o.kuva].w,P.kuvat[o.kuva].h])")==[[120,200],[40,140]]
        await pg.wait_for_function("Object.values(APP.IM).length==2&&Object.values(APP.IM).every(i=>i.naturalWidth>0)")
        assert await pg.locator('#pal .orow').count()==2 and await pg.locator('#pal .orow img').count()==2,'pikkukuvat listassa'
        # SVG-teksti
        await pg.click('#pal [data-x="liitasvg"]');await pg.fill('#svgnimi','Pää');await pg.fill('#svgtext',svg('#e9b',60,60,'ellipse').replace(' width="60" height="60"',''))
        await pg.click('#sheet [data-x="svglisaa"]');await pg.wait_for_timeout(300)
        assert await P(pg,"[P.osat.length,O('Pää').nimi,P.kuvat[O('Pää').kuva].w]")==[3,'Pää',60],'SVG ilman kokoa: koko viewBoxista'
        await pg.click('#pal [data-x="liitasvg"]');await pg.fill('#svgtext','tämä ei ole svg');await pg.click('#sheet [data-x="svglisaa"]');await pg.wait_for_timeout(100)
        assert await P(pg,"P.osat.length")==3,'virheellinen SVG ei lisää osaa';await pg.click('#sheet [data-x="close"]')
        # Siirto hiirellä (Rakenna): perusasento muuttuu, Kumoa palauttaa
        await pg.evaluate("APP.valitse(APP.P.osat.filter(o=>o.nimi=='a vartalo')[0].id)")
        v0=await P(pg,"O('a vartalo').perus")
        a=await ruutu(pg,v0['x']-40,v0['y']+60);s=await P(pg,"S.nak.s")
        await pg.mouse.move(*a);await pg.mouse.down();await pg.mouse.move(a[0]+50*s,a[1]+20*s,steps=6);await pg.mouse.up();await pg.wait_for_timeout(100)
        v1=await P(pg,"O('a vartalo').perus");print('siirto',v0,v1)
        assert abs(v1['x']-v0['x']-50)<0.6 and abs(v1['y']-v0['y']-20)<0.6 and v1['kulma']==0,'hiiren veto siirtää lavan pikseleinä'
        await pg.click('#undobtn');await pg.wait_for_timeout(100);assert await P(pg,"O('a vartalo').perus")==v0,'Kumoa'
        await pg.click('#redobtn');await pg.wait_for_timeout(100);assert abs((await P(pg,"O('a vartalo').perus"))['x']-v1['x'])<1e-6,'Tee uudelleen'
        # Kääntöpiste: risti raahataan, kuva pysyy paikallaan
        kul0=await P(pg,"AM.kulmat(P,O('a vartalo'),AM.maailma(P,0))")
        kh=await pg.evaluate("(()=>{var r=document.querySelector('#cv').getBoundingClientRect(),k=APP.S.kahvat;return {kp:[r.left+k.kp[0],r.top+k.kp[1]],ki:[r.left+k.kierto[0],r.top+k.kierto[1]],ko:[r.left+k.koko[0],r.top+k.koko[1]]};})()")
        await pg.mouse.move(*kh['kp']);await pg.mouse.down();await pg.mouse.move(kh['kp'][0],kh['kp'][1]-90*s,steps=5);await pg.mouse.up();await pg.wait_for_timeout(100)
        kp=await P(pg,"O('a vartalo').kp");kul1=await P(pg,"AM.kulmat(P,O('a vartalo'),AM.maailma(P,0))");print('kääntöpiste',kp)
        assert abs(kp[0]-60)<1 and abs(kp[1]-10)<1.5,'kääntöpiste yläreunan lähelle'
        assert all(abs(kul0[i][j]-kul1[i][j])<0.05 for i in range(4) for j in range(2)),'kuva pysyi paikallaan'
        # Kiertokahva: 90° myötäpäivään kääntöpisteen ympäri
        await pg.evaluate("APP.piirra()")
        kh=await pg.evaluate("(()=>{var r=document.querySelector('#cv').getBoundingClientRect(),k=APP.S.kahvat;return {kp:[r.left+k.kp[0],r.top+k.kp[1]],ki:[r.left+k.kierto[0],r.top+k.kierto[1]],ko:[r.left+k.koko[0],r.top+k.koko[1]]};})()")
        c=kh['kp'];R=math.hypot(kh['ki'][0]-c[0],kh['ki'][1]-c[1])
        await pg.mouse.move(*kh['ki']);await pg.mouse.down()
        for i in range(1,10):
            an=-math.pi/2+i*math.pi/18;await pg.mouse.move(c[0]+R*math.cos(an),c[1]+R*math.sin(an))
        await pg.mouse.up();await pg.wait_for_timeout(100)
        v2=await P(pg,"O('a vartalo').perus");print('kierto',v2);assert abs(v2['kulma']-90)<1,'kiertokahva kääntää 90°'
        piv=await P(pg,"AM.maailmaksi(P,O('a vartalo'),AM.maailma(P,0))");assert abs(piv['x']-v2['x'])<1e-6,'juuriosan kääntöpiste = perus x'
        # Kokokahva: etäisyys kääntöpisteestä kaksinkertaiseksi
        await pg.evaluate("APP.piirra()")
        kh=await pg.evaluate("(()=>{var r=document.querySelector('#cv').getBoundingClientRect(),k=APP.S.kahvat;return {kp:[r.left+k.kp[0],r.top+k.kp[1]],ko:[r.left+k.koko[0],r.top+k.koko[1]]};})()")
        c=kh['kp'];o=kh['ko'];await pg.mouse.move(*o);await pg.mouse.down();await pg.mouse.move(c[0]+(o[0]-c[0])*2,c[1]+(o[1]-c[1])*2,steps=6);await pg.mouse.up();await pg.wait_for_timeout(100)
        k3=await P(pg,"O('a vartalo').perus.koko");print('koko',k3);assert abs(k3-v2['koko']*2)<0.02,'kokokahva kaksinkertaistaa'
        await pg.fill('#i-s','100');await pg.press('#i-s','Enter');await pg.wait_for_timeout(100);assert abs(await P(pg,"O('a vartalo').perus.koko")-1)<1e-6,'koko-kenttä'
        await pg.fill('#i-k','0');await pg.press('#i-k','Enter');await pg.fill('#i-x','256');await pg.press('#i-x','Enter');await pg.fill('#i-y','300');await pg.press('#i-y','Enter');await pg.wait_for_timeout(100)
        assert await P(pg,"[O('a vartalo').perus.x,O('a vartalo').perus.y,O('a vartalo').perus.kulma]")==[256,300,0],'numerokentät'
        # Kiinnitys: käsi vartaloon, käsi pysyy paikallaan, nivel oletuksena
        await pg.evaluate("APP.valitse(APP.P.osat.filter(o=>o.nimi=='b kasi')[0].id)")
        w0=await P(pg,"AM.maailmaksi(P,O('b kasi'),AM.maailma(P,0))")
        vid=await P(pg,"O('a vartalo').id");await pg.select_option('#i-vanh',vid);await pg.wait_for_timeout(150)
        w1=await P(pg,"AM.maailmaksi(P,O('b kasi'),AM.maailma(P,0))");kk=await P(pg,"[O('b kasi').vanhempi,O('b kasi').liikkuu]")
        assert kk==[vid,'nivel'],'kiinnitetty, nivel oletuksena';assert abs(w0['x']-w1['x'])<0.02 and abs(w0['y']-w1['y'])<0.02,'pysyi paikallaan'
        assert 'a vartalo' in await pg.inner_text('#pal .orow.on small'),'listassa näkyy vanhempi'
        assert await pg.locator('#i-vanh option[value="%s"]'%(await P(pg,"O('b kasi').id"))).count()==0,'osa ei näy omassa vanhempilistassaan'
        await pg.evaluate("APP.valitse(APP.P.osat.filter(o=>o.nimi=='a vartalo')[0].id)")
        assert await pg.locator('#i-vanh option[value="%s"]'%(await P(pg,"O('b kasi').id"))).count()==0,'lasta ei voi valita vanhemmaksi'
        # Vartalo liikkuu → käsi seuraa
        await pg.fill('#i-x','300');await pg.press('#i-x','Enter');await pg.wait_for_timeout(100)
        w2=await P(pg,"AM.maailmaksi(P,O('b kasi'),AM.maailma(P,0))");assert abs(w2['x']-w1['x']-44)<0.02,'lapsi seuraa vanhempaa'
        # Järjestys, piilotus, poisto ja kumoa
        await pg.click('#insp [data-x="eteen"]');await pg.wait_for_timeout(80);assert await P(pg,"P.osat[P.osat.length-1].nimi")=='a vartalo','tuo eteen'
        await pg.click('#insp [data-x="taakse"]');await pg.wait_for_timeout(80);assert await P(pg,"P.osat[0].nimi")=='a vartalo','vie taakse'
        await pg.click('#pal .orow.on .eye');await pg.wait_for_timeout(80);assert await P(pg,"O('a vartalo').piilo")==True,'piilota silmästä'
        await pg.click('#pal .orow.on .eye');await pg.wait_for_timeout(80)
        await pg.screenshot(path='rakenna_1280.png')
        await pg.click('#insp [data-x="poista"]');await pg.wait_for_timeout(100)
        assert await P(pg,"[P.osat.length,O('b kasi').vanhempi]")==[2,None],'poisto: lapsi lavalle'
        w3=await P(pg,"AM.maailmaksi(P,O('b kasi'),AM.maailma(P,0))");assert abs(w3['x']-w2['x'])<0.02,'poisto: lapsi paikallaan'
        await pg.keyboard.press('Meta+z' if False else 'Control+z');await pg.wait_for_timeout(100);assert await P(pg,"P.osat.length")==3,'⌘Z / Ctrl+Z palauttaa poiston'
        # Tallennus ja kuvat uudelleenlatauksessa (IndexedDB)
        await pg.evaluate("APP.tallennaNyt()");await pg.reload();await pg.wait_for_timeout(500)
        await pg.wait_for_function("APP.S.kuvatLadattu&&Object.values(APP.IM).length==3&&Object.values(APP.IM).every(i=>i.naturalWidth>0)")
        assert await P(pg,"[P.nimi,P.osat.length,O('b kasi').vanhempi!=null]")==['Ukko',3,True],'tallennus säilyy'
        assert errs==[],errs
        await b.close()
        # ---------- iPad, kosketus ----------
        for W,H in ((1024,768),(820,1180)):
            b,ctx,pg,errs=await avaa(p,W,H,touch=True);T=await Kosketus.luo(pg)
            await uusi(pg,'Sormi');await lisaa(pg,svg('#c33',120,200),'Vartalo');await pg.wait_for_timeout(200)
            v0=await P(pg,"O('Vartalo').perus");s=await P(pg,"S.nak.s")
            a=await ruutu(pg,v0['x'],v0['y']+50)
            await T.t('touchStart',[(0,a)])
            for i in range(1,9):await T.t('touchMove',[(0,(a[0]+i*5*s,a[1]))])
            await T.t('touchEnd',[]);await pg.wait_for_timeout(100)
            v1=await P(pg,"O('Vartalo').perus");assert abs(v1['x']-v0['x']-40)<0.6,'%d: yksi sormi siirtää %s'%(W,v1)
            # Kaksi sormea: 30° ja 1,5 × kääntöpisteen ympäri; paikka seuraa keskikohtaa (tässä paikallaan)
            c=await ruutu(pg,v1['x'],v1['y']);d0=60
            pts=lambda an,d:[(0,(c[0]-d/2*math.cos(an),c[1]-d/2*math.sin(an))),(1,(c[0]+d/2*math.cos(an),c[1]+d/2*math.sin(an)))]
            await T.t('touchStart',pts(0,d0))
            for i in range(1,11):await T.t('touchMove',pts(math.radians(3*i),d0*(1+0.05*i)))
            await T.t('touchEnd',[]);await pg.wait_for_timeout(100)
            v2=await P(pg,"O('Vartalo').perus");print(W,'kaksi sormea',v2)
            assert abs(v2['kulma']-30)<0.5 and abs(v2['koko']-1.5)<0.01 and abs(v2['x']-v1['x'])<0.6,'%d: kaksi sormea kääntää ja muuttaa kokoa'%W
            # Kaksi sormea, joista toinen tyhjään kohtaan (esim. kynä osassa, sormi vieressä)
            rp=await P(pg,"AM.piste(AM.maailma(P,0)[O('Vartalo').id].m,60,170)");a=await ruutu(pg,rp[0],rp[1]);e=(a[0]+260,a[1])
            await T.t('touchStart',[(0,a)]);await T.t('touchStart',[(0,a),(1,e)])
            for i in range(1,7):an=math.radians(-5*i);await T.t('touchMove',[(0,a),(1,(a[0]+260*math.cos(an),a[1]+260*math.sin(an)))])
            await T.t('touchEnd',[]);await pg.wait_for_timeout(100)
            v3=await P(pg,"O('Vartalo').perus");assert abs(v3['kulma']-(v2['kulma']-30))<0.6,'%d: toinen sormi tyhjässä liittyy eleeseen %s'%(W,v3)
            # Tyhjä kohta: lavan siirto, ei osan
            n0=await P(pg,"S.nak");sr=await pg.evaluate("(()=>{var r=document.querySelector('#cv').getBoundingClientRect();return [r.left+20,r.top+60];})()");await T.t('touchStart',[(0,(sr[0],sr[1]))]);await T.t('touchMove',[(0,(sr[0]+50,sr[1]+30))]);await T.t('touchEnd',[]);await pg.wait_for_timeout(80)
            n1=await P(pg,"S.nak");print(n0,n1);assert abs(n1['ox']-n0['ox']-50)<1 and await P(pg,"O('Vartalo').perus")==v3,'tyhjästä vedosta siirtyy lava'
            if W<900:
                assert not await pg.locator('#insp').is_visible() or (await pg.evaluate("document.querySelector('#insp').getBoundingClientRect().left"))>=W-1,'pystyssä tiedot piilossa'
                await T.napauta('#inspbtn');await pg.wait_for_timeout(300);print(await pg.evaluate("[document.body.className,document.querySelector('#insp').getBoundingClientRect().right]"));assert (await pg.evaluate("document.querySelector('#insp').getBoundingClientRect().right"))<=W+1,'ⓘ avaa tiedot'
            await pg.screenshot(path='rakenna_%d.png'%W)
            assert errs==[],errs
            await b.close()
    print('ok')
asyncio.run(main())
