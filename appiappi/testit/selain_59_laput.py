# Appi-appi 18: rakentajan muisti- ja viestilaput. Leveydet 1440 ja 1280 (hiiri) sekä 390 ja 320 (sormi CDP:llä).
# Napit yläpalkissa, lappu osioonsa (Näkymä, Logiikka, Käyttö), kelluu asetusikkunan päällä, siirto, koko, pienennys
# (päivämäärä näkyy), [hakasulkuviite] palikkaan, viiva näkymän palikkaan, logiikan palikkaan, toiseen lappuun ja
# asetusikkunan kohtaan (katoaa, kun ikkuna suljetaan), tekoälyn vastaus ja merkki, poisto, säilyminen uudelleenlatauksessa.
# Lopuksi GitHub-valepalvelimella: tiedosto appiappi/laput/laput.json, tekoälyn vastaus haetaan, poistettu ei palaa.
# Kuvat appiappi18_*.png.
import asyncio, json, base64, re
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0];v.laite='puhelin';var vw=v.id;
 var t=KK.addBlock(P,'teksti',{v:vw,tx:'Hei'});t.x=40;t.y=120;t.w=140;t.h=50;KK.setName(P,t.id,'Otsikko');
 var m=KK.addBlock(P,'muisti',{v:'0'});KK.setName(P,m.id,'Laskuri');KK.addNode(P,m.id,80,120);
 KK.repair(P);APP.renderAll();return {t:t.id,m:m.id};})()"""
L="APP.data.laput"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in (1440,1280,390,320):
            mob=W<500;H=844 if mob else 900
            ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
            await pg.goto(U);await pg.wait_for_timeout(250)
            cdp=await ctx.new_cdp_session(pg)
            async def T(typ,pts):await cdp.send('Input.dispatchTouchEvent',{'type':typ,'touchPoints':[{'x':x,'y':y,'id':i} for i,(x,y) in enumerate(pts)]})
            async def drag(a,t,steps=10):
                if mob:
                    await T('touchStart',[a])
                    for i in range(1,steps+1):await T('touchMove',[(a[0]+(t[0]-a[0])*i/steps,a[1]+(t[1]-a[1])*i/steps)])
                    await T('touchEnd',[]);await pg.wait_for_timeout(200)
                else:await veda(pg,a,t,steps)
            async def tap(sel):
                if mob:await pg.tap(sel)
                else:await pg.click(sel)
                await pg.wait_for_timeout(150)
            await pg.fill('#wname','Laput');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP)
            # napit näkyvät yläpalkissa ilman vieritystä
            for bid in ('#lapmbtn','#lapvbtn'):
                bb=await pg.locator(bid).bounding_box();assert bb and bb['x']>=0 and bb['x']+bb['width']<=W+0.5,(W,bid,bb)
            # 1 muistilappu näkymään
            await tap('#lapmbtn')
            ls=await pg.evaluate(L);assert len(ls)==1 and ls[0]['laji']=='muisti' and ls[0]['osio']=='nakyma',ls
            mid=ls[0]['id'];M='#laput .lap[data-lap="%s"]'%mid
            assert await pg.evaluate("document.activeElement.classList.contains('lapx')"),'kirjoituskohta auki'
            await pg.locator(M+' .lapx').fill('Korjaa [Otsikko] ja [Ei ole] sekä [laskuri]')
            ft=pg.locator(M+' .lapft')
            assert await ft.locator('[data-lapgo="%s"]'%I['t']).count()==1,'hakasulkuviite Otsikkoon'
            assert await ft.locator('[data-lapgo="%s"]'%I['m']).count()==1,'viite toimii pienellä kirjoitettuna'
            assert await ft.locator('.lapc.ei',has_text='[Ei ole] ?').count()==1
            d0=await pg.locator(M+' .lapd').text_content();assert re.match(r'^\d+\.\d+\. \d+\.\d\d$',d0),d0
            # viiva näkymän palikkaan
            await drag(await keskus(pg,M+' [data-lapdo="viiva"]'),await keskus(pg,'#uels .ue[data-id="%s"]'%I['t']))
            v=(await pg.evaluate(L))[0]['viivat'];assert len(v)==1 and v[0]['kohde']=={'t':'palikka','id':I['t'],'puoli':'u'},v
            assert 'Otsikko' in v[0]['kuvaus'],v
            await pg.wait_for_timeout(100);assert await pg.locator('#lapsvg path.lapl.m').count()==1,'viiva piirretty'
            await pg.screenshot(path='appiappi18_muistilappu_%d.png'%W)
            # siirto otsikosta ja koko kulmasta
            x0=(await pg.evaluate(L))[0]['x'];hd=await pg.locator(M+' .lapi').bounding_box()
            await drag([hd['x']+5,hd['y']+hd['height']/2],[hd['x']-25,hd['y']+hd['height']/2+60])
            l=(await pg.evaluate(L))[0];assert abs(l['x']-(x0-30))<=2 and l['y']>=100,(x0,l['x'],l['y'])
            w0,h0=l['w'],l['h'];rz=await keskus(pg,M+' .laprz')
            await drag(rz,[rz[0]+(20 if mob else 60),rz[1]+40])
            l=(await pg.evaluate(L))[0];assert l['h']>h0+30 and l['w']>=w0,(w0,h0,l['w'],l['h'])
            # pienennys: teksti piiloon, päivämäärä näkyy, viiva säilyy
            await tap(M+' [data-lapdo="pieni"]')
            assert await pg.locator(M+'.pieni').count()==1 and await pg.locator(M+' .lapx').is_hidden() and await pg.locator(M+' .lapd').is_visible()
            await pg.wait_for_timeout(100);assert await pg.locator('#lapsvg path.lapl').count()==1
            await pg.screenshot(path='appiappi18_pieni_%d.png'%W)
            await tap(M+' [data-lapdo="pieni"]');assert await pg.locator(M+' .lapx').is_visible()
            # 2 Logiikka: muistilappu ei näy, viestilappu ja toinen muistilappu
            await tap('#tabs [data-t="logiikka"]')
            assert await pg.locator(M).count()==0,'lappu jää osioonsa'
            await tap('#lapvbtn');ls=await pg.evaluate(L);vid=ls[-1]['id'];V='#laput .lap[data-lap="%s"]'%vid
            assert ls[-1]['laji']=='viesti' and ls[-1]['osio']=='logiikka'
            await pg.locator(V+' .lapx').fill('Miksi [Laskuri] ei näy?')
            await pg.locator(V+' .lapx').blur()
            await drag(await keskus(pg,V+' [data-lapdo="viiva"]'),await keskus(pg,'#lworld [data-nid]'))
            await tap('#lapmbtn');m2=(await pg.evaluate(L))[-1]['id'];M2='#laput .lap[data-lap="%s"]'%m2
            # viestilappu muistilappuun: siirretään ensin erilleen
            hv=await pg.locator(V+' .lapi').bounding_box();await drag([hv['x']+5,hv['y']+10],[20 if mob else 300,H-260])
            await drag(await keskus(pg,V+' [data-lapdo="viiva"]'),await keskus(pg,M2+' .lapx'))
            vv=[x for x in await pg.evaluate(L) if x['id']==vid][0]['viivat']
            assert [x['kohde']['t'] for x in vv]==['palikka','lappu'] and vv[0]['kohde']['id']==I['m'] and vv[1]['kohde']['id']==m2,vv
            await pg.wait_for_timeout(100);assert await pg.locator('#lapsvg path.lapl.v').count()==2
            await pg.screenshot(path='appiappi18_logiikka_%d.png'%W)
            # asetukset: lappu kelluu ikkunan päällä, viiva asetuksen kohtaan, katoaa kun ikkuna suljetaan
            await tap('#setbtn');await pg.wait_for_timeout(150)
            tgt='#sheet [data-cfg="snap"][data-v="0"]';await pg.locator(tgt).scroll_into_view_if_needed()
            top=await pg.evaluate("(s)=>{var r=document.querySelector(s).getBoundingClientRect();var e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return !!e.closest('#laput')}",V+' .lapi')
            assert top,'lappu asetusikkunan päällä'
            await drag(await keskus(pg,V+' [data-lapdo="viiva"]'),await keskus(pg,tgt))
            vv=[x for x in await pg.evaluate(L) if x['id']==vid][0]['viivat'];u=vv[-1]
            assert u['kohde']['t']=='ui' and 'Ikkuna ”Asetukset”' in u['kuvaus'] and 'Muokkaus' in u['kuvaus'] and 'Ei' in u['kuvaus'],u
            await pg.wait_for_timeout(100);assert await pg.locator('#lapsvg path.lapl.v').count()==3
            await pg.screenshot(path='appiappi18_asetukset_%d.png'%W)
            await pg.evaluate("document.querySelector('#sheet [data-x=close]').click()");await pg.wait_for_timeout(150)
            assert await pg.locator('#lapsvg path.lapl.v').count()==2,'asetusviiva piiloon'
            await tap('#setbtn');await pg.wait_for_timeout(200)
            assert await pg.locator('#lapsvg path.lapl.v').count()==3,'asetusviiva takaisin'
            assert await pg.locator('#sec-lap tr[data-lapopen]').count()==3,'asetusten lappulista'
            await pg.evaluate("document.querySelector('#sheet [data-x=close]').click()");await pg.wait_for_timeout(100)
            # 3 tekoälyn vastaus Näkymä-osiossa: merkki napissa; logiikassa vastaus näkyy ja merkki poistuu
            await tap('#tabs [data-t="nakyma"]')
            assert await pg.locator(M).count()==1 and await pg.locator(V).count()==0
            r=await pg.evaluate("APP.laput.yhdista([{id:'%s',vastaus:'Laskuri on logiikassa.\\nRivi kaksi.',vastattu:'2026-10-16T19:00:00.000Z'}])"%vid);assert r=={'ch':1,'uudet':1},r
            await pg.evaluate("APP.laput.render()");assert await pg.locator('#lapvbtn .lapdot').is_visible(),'uusi vastaus -merkki'
            await tap('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(100)
            assert await pg.locator(V+' .lapv',has_text='Laskuri on logiikassa.').count()==1
            assert await pg.locator('#lapvbtn .lapdot').is_hidden(),'luettu'
            await pg.screenshot(path='appiappi18_vastaus_%d.png'%W)
            # poisto: muistilappu 2 pois, viestilapun viiva siihen poistuu
            await tap(M2+' [data-lapdo="pois"]');await pg.wait_for_timeout(150)
            ls=await pg.evaluate(L);assert m2 not in [x['id'] for x in ls] and m2 in await pg.evaluate("APP.data.lapPois")
            vv=[x for x in ls if x['id']==vid][0]['viivat'];assert [x['kohde']['t'] for x in vv]==['palikka','ui'],vv
            # tiedosto tekoälylle
            f=await pg.evaluate("APP.laput.tiedosto()");assert f['app']=='appiappi-laput' and 'vastaus' in f['ohje'] and len(f['laput'])==2
            fm=[x for x in f['laput'] if x['id']==mid][0]
            assert fm['osioNimi']=='Näkymä' and fm['projektiNimi']=='Laput' and [x.get('palikka',{}).get('nimi') for x in fm['viitteet']]==['Otsikko',None,'Laskuri'],fm['viitteet']
            # 4 lukittu käyttö on oma osionsa
            await tap('#tabs [data-t="nakyma"]');await tap('#lockbtn')
            assert await pg.evaluate("APP.laput.osio()")=='kaytto' and await pg.locator(M).count()==0
            await tap('#lapmbtn');assert (await pg.evaluate(L))[-1]['osio']=='kaytto'
            await tap('#lockbtn');assert await pg.locator(M).count()==1
            # 5 uudelleenlataus: laput säilyvät
            await pg.evaluate("APP.saveNow()");await pg.reload();await pg.wait_for_timeout(300)
            assert len(await pg.evaluate(L))==3 and await pg.locator(M).count()==1
            assert await pg.locator(M+' .lapx').input_value()=='Korjaa [Otsikko] ja [Ei ole] sekä [laskuri]'
            await pg.wait_for_timeout(100);assert await pg.locator('#lapsvg path.lapl.m').count()==1,'viiva latauksen jälkeen'
            print(W,'ok',errs);assert not errs,errs
            await ctx.close()
        # 6 GitHub (valepalvelin): tallennus, tekoälyn vastaus, poistettu ei palaa
        REPO={};N=[0]
        def b64(t):return base64.b64encode(t.encode('utf8')).decode()
        CORS={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Authorization, Accept, Content-Type','Access-Control-Allow-Methods':'GET, PUT, OPTIONS'}
        async def gh(route,request):
            u=re.sub(r'\?.*$','',request.url);m=re.match(r'https://api.github.com/repos/([^/]+/[^/]+)(?:/contents/(.*))?$',u)
            if request.method=='OPTIONS':return await route.fulfill(status=204,headers=CORS)
            def js(st,o):return route.fulfill(status=st,headers=dict(CORS,**{'Content-Type':'application/json'}),body=json.dumps(o))
            p=m and m.group(2)
            if not m:return await js(404,{})
            if p is None:return await js(200,{'full_name':'Testi/master-tiedot','private':True,'permissions':{'push':True}})
            if request.method=='GET':
                if p=='appiappi':
                    l=[{'name':k.split('/')[-1],'path':k} for k in REPO if k.count('/')==1 and k.startswith('appiappi/')]+([{'name':'laput','path':'appiappi/laput','type':'dir'}] if 'appiappi/laput/laput.json' in REPO else [])
                    return await js(200 if l else 404,l)
                if p in REPO:return await js(200,{'content':b64(REPO[p][0]),'sha':REPO[p][1]})
                return await js(404,{})
            if request.method=='PUT':
                bd=json.loads(request.post_data);cur=REPO.get(p)
                if cur and bd.get('sha')!=cur[1]:return await js(409,{})
                N[0]+=1;REPO[p]=[base64.b64decode(bd['content']).decode('utf8'),'sha%d'%N[0]]
                return await js(201 if not cur else 200,{'content':{'sha':REPO[p][1]}})
            return await js(405,{})
        ctx=await b.new_context(viewport={'width':1440,'height':900},reduced_motion='reduce');await ctx.route('https://api.github.com/**',gh)
        pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
        await pg.add_init_script("localStorage.setItem('appiappi:gh',JSON.stringify({repo:'Testi/master-tiedot',token:'github_pat_x',auto:true}))")
        await pg.goto(U);await pg.wait_for_timeout(300)
        await pg.fill('#wname','Laput');await pg.click('#wcreate');await pg.wait_for_timeout(150)
        await pg.click('#lapvbtn');await pg.keyboard.type('Tee tästä parempi');await pg.click('#lapmbtn');await pg.keyboard.type('Oma muistiinpano')
        await pg.wait_for_timeout(4200)
        assert 'appiappi/laput/laput.json' in REPO,list(REPO)
        f=json.loads(REPO['appiappi/laput/laput.json'][0]);assert [x['teksti'] for x in f['laput']]==['Tee tästä parempi','Oma muistiinpano'],f
        pid=await pg.evaluate("APP.P.id");assert f['laput'][0]['projekti']==pid and f['laput'][0]['laji']=='viesti'
        await pg.wait_for_timeout(3000)
        assert not [k for k in REPO if k.startswith('appiappi/laput') and k!='appiappi/laput/laput.json']
        assert await pg.evaluate("APP.data.projects.length")==1,'laput-kansio ei ole projekti'
        # tekoäly vastaa tiedostoon (vain vastaus ja vastattu)
        f['laput'][0]['vastaus']='Lisää painike.';f['laput'][0]['vastattu']='2026-10-16T20:00:00Z'
        N[0]+=1;REPO['appiappi/laput/laput.json']=[json.dumps(f),'sha%d'%N[0]]
        await pg.evaluate("APP.laput.pull()");await pg.wait_for_timeout(400)
        l0=(await pg.evaluate(L))[0];assert l0['vastaus']=='Lisää painike.',l0
        assert await pg.locator('#laput .lap.viesti .lapv',has_text='Lisää painike.').count()==1
        # muokkaus omalla laitteella ei hävitä vastausta GitHubista
        await pg.locator('#laput .lap.viesti .lapx').fill('Tee tästä parempi, kiitos');await pg.wait_for_timeout(4200)
        f2=json.loads(REPO['appiappi/laput/laput.json'][0]);v2=[x for x in f2['laput'] if x['laji']=='viesti'][0]
        assert v2['teksti']=='Tee tästä parempi, kiitos' and v2['vastaus']=='Lisää painike.',v2
        # poistettu lappu ei palaa GitHubista
        await pg.click('#laput .lap.muisti [data-lapdo="pois"]');await pg.wait_for_timeout(4200)
        f3=json.loads(REPO['appiappi/laput/laput.json'][0]);assert len(f3['laput'])==1,f3
        await pg.evaluate("APP.laput.yhdista(%s)"%json.dumps(f['laput']));assert len(await pg.evaluate(L))==1
        print('github ok',errs);assert not errs,errs
        await b.close()
asyncio.run(main())
