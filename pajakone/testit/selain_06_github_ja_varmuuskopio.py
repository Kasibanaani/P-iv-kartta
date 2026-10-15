# GitHub-tallennus (masterin malli) ja varmuuskopio omalle laitteelle. GitHub korvataan testissä valepalvelimella:
# oikeaan repoon ei kosketa. Tarkistaa: Masterin asetukset otetaan käyttöön, automaattinen tallennus muutoksen jälkeen,
# käyttötiedotkin menevät GitHubiin (Emil 14.10.2026, kamerat eivät), uudempi GitHub-versio haetaan itsestään ja käyttötiedot säilyvät, ristiriidassa valinta,
# uudet projektit haetaan toiseen selaimeen, poistettua ei haeta itsestään, varmuuskopio ladataan eikä siinä ole avainta.
import asyncio, json, base64, re
from playwright.async_api import async_playwright
from yhteinen import *

REPO={}  # polku -> [teksti, sha]
N=[0]
def b64(t):return base64.b64encode(t.encode('utf8')).decode()
def put_file(path,text):
    N[0]+=1;REPO[path]=[text,'sha%d'%N[0]];return REPO[path][1]
CORS={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Authorization, Accept, Content-Type','Access-Control-Allow-Methods':'GET, PUT, OPTIONS'}
async def gh(route,request):
    u=re.sub(r'\?.*$','',request.url);m=re.match(r'https://api.github.com/repos/([^/]+/[^/]+)(?:/contents/(.*))?$',u)
    if request.method=='OPTIONS':return await route.fulfill(status=204,headers=CORS)
    def js(st,o):return route.fulfill(status=st,headers=dict(CORS,**{'Content-Type':'application/json'}),body=json.dumps(o))
    if not m or m.group(1)!='Testi/master-tiedot':return await js(404,{})
    p=m.group(2)
    if p is None:return await js(200,{'full_name':'Testi/master-tiedot','private':True,'permissions':{'push':True}})
    if request.method=='GET':
        if p=='pajakone':
            l=[{'name':k.split('/')[-1],'path':k} for k in REPO if k.startswith('pajakone/')]
            return await js(200 if l else 404,l)
        if p in REPO:return await js(200,{'content':b64(REPO[p][0]),'sha':REPO[p][1]})
        return await js(404,{})
    if request.method=='PUT':
        b=json.loads(request.post_data);cur=REPO.get(p)
        if cur and b.get('sha')!=cur[1]:return await js(409,{})
        if not cur and b.get('sha'):return await js(422,{})
        sha=put_file(p,base64.b64decode(b['content']).decode('utf8'))
        return await js(201 if not cur else 200,{'content':{'sha':sha}})
    return await js(405,{})

async def uusi(b,w=1440):
    ctx=await b.new_context(viewport={'width':w,'height':860},accept_downloads=True,reduced_motion='reduce')
    await ctx.route('https://api.github.com/**',gh);pg=await ctx.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    return ctx,pg,errs

async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        # 1 ilman GitHubia: tila ja varmuuskopio
        ctx,pg,errs=await uusi(b);await pg.goto(U);await pg.wait_for_timeout(250)
        print('1 GitHub-tila piilossa:',await pg.is_hidden('#ghbtn'),'| tila:',await pg.inner_text('#kstat'))
        await pg.click('#wexample');await pg.wait_for_timeout(400)
        print('2 muutoksen jälkeen:',await pg.inner_text('#kstat'),'| punainen:',await pg.evaluate("document.querySelector('#kstat').classList.contains('dirty')"))
        async with pg.expect_download() as d:await pg.click('#bkbtn')
        dl=await d.value;txt=open(await dl.path(),encoding='utf8').read();o=json.loads(txt)
        print('3 varmuuskopio:',dl.suggested_filename.startswith('pajakone-varmuuskopio-'),'| projekteja:',len(o['projects']),'| tila:',await pg.inner_text('#kstat'))
        await ctx.close()
        # 2 Masterin asetukset samassa selaimessa → käyttöön, automaattinen tallennus
        ctx,pg,errs2=await uusi(b);errs+=errs2
        await pg.add_init_script("localStorage.setItem('master:gh',JSON.stringify({repo:'Testi/master-tiedot',token:'github_pat_TESTI',auto:true}))")
        await pg.goto(U);await pg.wait_for_timeout(300)
        print('4 masterin asetukset käytössä:',await pg.evaluate("APP.gh.repo"),'| tila näkyy:',await pg.is_visible('#ghbtn'))
        await pg.click('#wexample');await pg.wait_for_timeout(3300)
        pid=await pg.evaluate("APP.P.id");path='pajakone/'+pid+'.json'
        f=json.loads(REPO[path][0]) if path in REPO else {}
        print('5 tallennettu GitHubiin:',path in REPO,'| app:',f.get('app'),'| palikoita:',len(f.get('projekti',{}).get('b',{})),'| ei kameroita:', 'cam' not in f.get('projekti',{}) and 'lcam' not in f.get('projekti',{}),'| tila:',await pg.inner_text('#ghbtn'))
        # käyttö tallentuu GitHubiin
        sha0=REPO[path][1];await pg.click('#lockbtn');await pg.wait_for_timeout(100)
        await pg.click('.ue.k-kytkin .w-sw');await pg.click('.w-btn:has-text("Kirjaa tauko")');await pg.wait_for_timeout(3000)
        st=await pg.evaluate("Object.keys(APP.P.st).length")
        gst=json.loads(REPO[path][0])['projekti'].get('st',{})
        print('6 käyttö tallentui GitHubiin:',REPO[path][1]!=sha0,'| käyttötietoja selaimessa:',st>0,'| samat GitHubissa:',len(gst)==st and st>0)
        sha1=REPO[path][1];await pg.wait_for_timeout(2700);print('7 ei turhia tallennuksia:',REPO[path][1]==sha1)
        # 3 tekoäly muuttaa GitHubissa → haetaan itsestään, käyttötiedot säilyvät
        o=json.loads(REPO[path][0]);o['projekti']['name']='Tekoälyn muokkaama';put_file(path,json.dumps(o))
        await pg.evaluate("APP.ghCheck()");await pg.wait_for_timeout(300)
        print('8 uudempi haettu:',await pg.evaluate("APP.P.name"),'| käyttötiedot säilyivät:',await pg.evaluate("Object.keys(APP.P.st).length")==st,'| kumottavissa:',await pg.evaluate("APP.S.undo.length>0"))
        # 4 ristiriita: oma muutos tallentamatta + GitHubissa uudempi
        await pg.evaluate("APP.gh.auto=false");await pg.click('#lockbtn');await pg.wait_for_timeout(400)
        o=json.loads(REPO[path][0]);o['projekti']['name']='Toinen muutos';put_file(path,json.dumps(o))
        await pg.evaluate("APP.ghCheck()");await pg.wait_for_timeout(300)
        print('9 ristiriita näkyy:',await pg.inner_text('#ghbtn'),'| oma nimi säilyi:',await pg.evaluate("APP.P.name"))
        pg.once('dialog',lambda d:asyncio.ensure_future(d.accept()))
        await pg.click('#ghbtn');await pg.wait_for_timeout(400)
        print('10 haettu valinnalla:',await pg.evaluate("APP.P.name"),'| tila:',await pg.inner_text('#ghbtn'))
        # asetukset-osio
        await pg.click('#setbtn');await pg.wait_for_timeout(150)
        print('11 asetuksissa GitHub-osio:',await pg.is_visible('#sec-gh'),'| repo-kenttä:',await pg.input_value('#gh-repo'))
        await pg.click('[data-gh="test"]');await pg.wait_for_timeout(300);print('12 testaa yhteys:',await pg.inner_text('#gh-msg'))
        await pg.screenshot(path='github_asetukset.png');await pg.click('#sheet [data-x="close"]')
        async with pg.expect_download() as d:await pg.click('#bkbtn')
        txt=open(await (await d.value).path(),encoding='utf8').read()
        print('13 avain ei varmuuskopiossa:','github_pat' not in txt)
        await pg.screenshot(path='github_ylapalkki.png',clip={'x':0,'y':0,'width':1440,'height':60})
        await ctx.close()
        # 5 toinen selain: pelkät asetukset → projekti haetaan itsestään; poistettua ei haeta uudelleen
        ctx,pg,errs2=await uusi(b,1280);errs+=errs2
        await pg.add_init_script("if(!localStorage.getItem('pajakone:gh'))localStorage.setItem('pajakone:gh',JSON.stringify({repo:'Testi/master-tiedot',token:'github_pat_TESTI',auto:true}))")
        await pg.goto(U);await pg.wait_for_timeout(500)
        print('14 haettu uuteen selaimeen:',await pg.evaluate("APP.data.projects.map(p=>p.name)"),'| käyttötiedot mukana:',await pg.evaluate("Object.keys(APP.data.projects[0].st).length")==st,'| sama id:',await pg.evaluate("APP.data.projects.some(p=>p.id===%s)"%json.dumps(pid)))
        pg.once('dialog',lambda d:asyncio.ensure_future(d.accept()))
        await pg.click('#projbtn');await pg.click('[data-x="delete"]');await pg.wait_for_timeout(200)
        await pg.reload();await pg.wait_for_timeout(500)
        print('15 poistettu ei palaa itsestään:',await pg.evaluate("APP.data.projects.length")==0)
        n=await pg.evaluate("APP.ghNew(true)");await pg.wait_for_timeout(200)
        print('16 Hae uudet projektit palauttaa:',n,await pg.evaluate("APP.data.projects.length"))
        vw=await pg.evaluate("[document.documentElement.scrollWidth,innerWidth]");print('17 ei vaakavieritystä 1280:',vw)
        print('errs',errs);await b.close()
asyncio.run(main())
