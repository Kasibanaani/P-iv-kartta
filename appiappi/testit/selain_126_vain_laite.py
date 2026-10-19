# Vain tällä laitteella (Appi-appi 87): laitekohtainen tila ja projektikohtainen merkintä. GitHub korvataan valepalvelimella,
# joka kirjaa jokaisen pyynnön: tarkistetaan, ettei tilassa lähde yhtään pyyntöä. Osoitteen ?vainlaite kytkee tilan ennen
# kuin Masterin asetukset otetaan käyttöön; tila säilyy ilman osoitetta; avain poistuu; varmuuskopio toimii; sallinta palauttaa.
# Projektikohtainen: merkitty projekti ei mene GitHubiin, muut menevät; sen laput jäävät pois lappulistasta.
import asyncio, json, base64, re
from playwright.async_api import async_playwright
from yhteinen import *

REQ=[];REPO={}
CORS={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Authorization, Accept, Content-Type','Access-Control-Allow-Methods':'GET, PUT, OPTIONS'}
async def gh(route,request):
    if request.method=='OPTIONS':return await route.fulfill(status=204,headers=CORS)
    REQ.append((request.method,request.url))
    u=re.sub(r'\?.*$','',request.url);m=re.match(r'https://api.github.com/repos/Testi/master-tiedot(?:/contents/(.*))?$',u)
    def js(st,o):return route.fulfill(status=st,headers=dict(CORS,**{'Content-Type':'application/json'}),body=json.dumps(o))
    if not m:return await js(404,{})
    p=m.group(1)
    if p is None:return await js(200,{'full_name':'Testi/master-tiedot','private':True,'permissions':{'push':True}})
    if request.method=='PUT':
        b=json.loads(request.post_data);REPO[p]=base64.b64decode(b['content']).decode('utf8');return await js(201,{'content':{'sha':'s%d'%len(REQ)}})
    if p in REPO:return await js(200,{'content':base64.b64encode(REPO[p].encode()).decode(),'sha':'x'})
    return await js(404,{})
MASTER="localStorage.setItem('master:gh',JSON.stringify({repo:'Testi/master-tiedot',token:'github_pat_TESTI',auto:true}))"

async def uusi(b,init=None):
    ctx=await b.new_context(viewport={'width':1440,'height':860},accept_downloads=True,reduced_motion='reduce')
    await ctx.route('https://api.github.com/**',gh);pg=await ctx.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    if init:await pg.add_init_script(init)
    return ctx,pg,errs

async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        # 1 laitteen tila osoitteesta, vaikka Masterin asetukset ovat samassa selaimessa
        ctx,pg,errs=await uusi(b,MASTER);await pg.goto(U+'?vainlaite');await pg.wait_for_timeout(400)
        t=await pg.inner_text('#ghbtn');print('1 tila päällä:',await pg.evaluate("APP.vainLaite"),'| merkki:',t,'| avainta ei otettu:',await pg.evaluate("APP.gh.token")=='')
        assert await pg.evaluate("APP.vainLaite") and 'Vain tällä laitteella' in t and await pg.evaluate("APP.gh.token")==''
        await pg.click('#wexample');await pg.wait_for_timeout(3300)
        r=await pg.evaluate("APP.ghPush().then(function(x){return x;})");await pg.evaluate("APP.laput.push()");await pg.wait_for_timeout(300)
        print('2 ei yhtään GitHub-pyyntöä:',REQ,'| vienti:',r);assert REQ==[] and r is False
        print('3 varmuuskopio muistutus punaisena:',await pg.inner_text('#kstat'));assert await pg.evaluate("document.querySelector('#kstat').classList.contains('dirty')")
        async with pg.expect_download() as d:await pg.click('#bkbtn')
        print('4 varmuuskopio ladattu:',(await d.value).suggested_filename)
        await pg.click('#setbtn');await pg.wait_for_timeout(150)
        print('5 asetuksissa:',await pg.inner_text('#sec-gh h4'),'| ei avainkenttää:',await pg.locator('#gh-token').count()==0)
        assert await pg.locator('#gh-token').count()==0
        await pg.locator('#sec-gh').scroll_into_view_if_needed();await pg.screenshot(path='vain_laite_asetukset.png');await pg.click('#sheet [data-x="close"]')
        # 2 säilyy ilman osoitetta
        await pg.goto(U);await pg.wait_for_timeout(500)
        print('6 säilyy uudelleen avattaessa:',await pg.evaluate("APP.vainLaite"),'| pyyntöjä:',len(REQ));assert await pg.evaluate("APP.vainLaite") and REQ==[]
        # 3 sallinta palauttaa GitHubin (Masterin asetukset seuraavalla avauksella)
        await pg.click('#setbtn');await pg.wait_for_timeout(150)
        pg.once('dialog',lambda d:asyncio.ensure_future(d.accept()))
        await pg.click('[data-gh="vlpois"]');await pg.wait_for_timeout(200)
        print('7 sallittu:',not await pg.evaluate("APP.vainLaite"),'| repo-kenttä näkyy:',await pg.locator('#gh-repo').count()==1)
        assert not await pg.evaluate("APP.vainLaite")
        await ctx.close()
        # 4 tavallinen laite: kytkentä asetuksista poistaa avaimen ja katkaisee viennin
        ctx,pg,errs2=await uusi(b,"if(!localStorage.getItem('k1')){localStorage.setItem('k1','1');"+MASTER+"}");errs+=errs2
        await pg.goto(U);await pg.wait_for_timeout(400);await pg.click('#wexample');await pg.wait_for_timeout(3300)
        n0=len([r for r in REQ if r[0]=='PUT']);print('8 tavallisena vienti toimii:',n0>0);assert n0>0
        await pg.click('#setbtn');await pg.wait_for_timeout(150)
        pg.once('dialog',lambda d:asyncio.ensure_future(d.accept()))
        await pg.click('[data-gh="vlon"]');await pg.wait_for_timeout(200)
        print('9 avain poistettu:',await pg.evaluate("localStorage.getItem('appiappi:gh')"),await pg.evaluate("APP.gh.token"))
        assert await pg.evaluate("localStorage.getItem('appiappi:gh')") is None
        await pg.click('#sheet [data-x="close"]');k=len(REQ)
        await pg.click('#lockbtn');await pg.click('.ue.k-kytkin .w-sw');await pg.wait_for_timeout(3000);await pg.reload();await pg.wait_for_timeout(600)
        print('10 ei pyyntöjä kytkennän jälkeen:',REQ[k:]);assert REQ[k:]==[]
        await ctx.close()
        # 5 projektikohtainen merkintä
        REQ.clear();REPO.clear()
        ctx,pg,errs2=await uusi(b,"localStorage.setItem('appiappi:gh',JSON.stringify({repo:'Testi/master-tiedot',token:'github_pat_TESTI',auto:true}))");errs+=errs2
        await pg.goto(U);await pg.wait_for_timeout(400);await pg.click('#wexample');await pg.wait_for_timeout(300)
        await pg.click('#projbtn');pg.once('dialog',lambda d:asyncio.ensure_future(d.accept()))
        await pg.click('[data-x="vainlaite"]');await pg.wait_for_timeout(200)
        pid=await pg.evaluate("APP.P.id");print('11 merkitty:',await pg.evaluate("APP.P.vainLaite"),'| listassa:',await pg.inner_text('.plrow.cur small'))
        assert await pg.evaluate("APP.P.vainLaite") and 'vain tällä laitteella' in await pg.inner_text('.plrow.cur small')
        await pg.click('#sheet [data-x="close"]')
        await pg.evaluate("APP.laput.uusi&&0");await pg.wait_for_timeout(3300)
        print('12 merkittyä ei viety:',('appiappi/%s.json'%pid) not in REPO,'| vienti estetty:',await pg.evaluate("APP.ghPush()") is False)
        assert ('appiappi/%s.json'%pid) not in REPO
        lf=await pg.evaluate("(function(){var d=APP.data,c=APP.laput.puhdista;APP.laput.tiedosto();d.laput.push(c({id:'tl1',laji:'muisti',teksti:'salainen',projekti:APP.P.id}),c({id:'tl2',laji:'muisti',teksti:'yleinen',projekti:'muu'}));return APP.laput.tiedosto().laput.map(x=>x.id);})()")
        print('13 merkityn projektin lappu ei lappulistassa:',lf);assert 'tl1' not in lf and 'tl2' in lf
        # toinen projekti menee normaalisti
        await pg.click('#projbtn');await pg.fill('#newpname','Toinen');await pg.click('[data-x="new"]');await pg.wait_for_timeout(3300)
        p2=await pg.evaluate("APP.P.id");print('14 merkitsemätön viety:',('appiappi/%s.json'%p2) in REPO,'| tila:',await pg.inner_text('#ghbtn'))
        assert ('appiappi/%s.json'%p2) in REPO and ('appiappi/%s.json'%pid) not in REPO
        # Monista yksityisenä: GitHub-projektista kopio, joka ei käy GitHubissa hetkeäkään
        await pg.click('#projbtn');await pg.click('[data-x="copyvl"]');await pg.wait_for_timeout(3300)
        p3=await pg.evaluate("APP.P.id");print('15 yksityinen kopio:',await pg.evaluate("APP.P.name"),'| ei viety:',('appiappi/%s.json'%p3) not in REPO,'| lukko yläpalkissa:',await pg.locator('#projbtn use').count())
        assert await pg.evaluate("APP.P.vainLaite") and ('appiappi/%s.json'%p3) not in REPO and await pg.locator('#projbtn use').count()==1
        await pg.click('#projbtn');await pg.wait_for_timeout(150);await pg.screenshot(path='vain_laite_projektit.png')
        print('16 lukko listassa:',await pg.locator('.plrow.cur b use').count());assert await pg.locator('.plrow.cur b use').count()==1
        # tuonti tiedostosta GitHub-selaimeen: merkitty projekti pysyy yksityisenä heti
        await pg.click('#sheet [data-x="close"]')
        txt=await pg.evaluate("JSON.stringify({app:'appiappi',ver:12,projects:[Object.assign(JSON.parse(JSON.stringify(APP.P)),{id:'ptuotu',name:'Tuotu yksityinen'})]})")
        await pg.evaluate("t=>{document.querySelector('#projbtn').click();}",None)
        await pg.set_input_files('#filein',files=[{'name':'v.json','mimeType':'application/json','buffer':txt.encode()}]);await pg.wait_for_timeout(3300)
        tid=await pg.evaluate("APP.P.id");print('16b tuotu:',await pg.evaluate("APP.P.name"),'| merkitty:',await pg.evaluate("APP.P.vainLaite"),'| ei viety:',not any(k.startswith('appiappi/'+tid) for k in REPO))
        assert await pg.evaluate("APP.P.vainLaite") and not any(k.startswith('appiappi/'+tid) for k in REPO)
        vw=await pg.evaluate("[document.documentElement.scrollWidth,innerWidth]");print('17 ei vaakavieritystä:',vw)
        print('errs',errs);await b.close()
asyncio.run(main())
