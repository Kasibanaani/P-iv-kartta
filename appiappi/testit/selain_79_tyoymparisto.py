# Jonon 1m (linjakkuuskartoitus 4: P2, P5, P7, P9, P13): työympäristön pienet korjaukset, 1440 ja 1280 hiirellä, 390 ja 320 kosketuksella.
# Toiminnon ƒ Arvo kaavasta (Kaava + nuoli kohtaan arvo), Arvon paneelin Muisti-ohje, ⌘Z/Ctrl+Z ei kumoa lukitussa näkymässä eikä kokeilussa,
# kokeilun raita kertoo kapeallakin, että rakenne tallentuu, Asetusten versioteksti. GitHub-osa (1440): Monista ja tuonti tiedostosta
# eivät vie vanhaa versiotunnistetta, joten kopio tallentuu GitHubiin ilman ristiriitaa. GitHub on valepalvelin. Synteettinen sisältö, ei oikeaa iPhonea.
import asyncio, json, base64, re
from playwright.async_api import async_playwright
from yhteinen import *

REPO={}
N=[0]
def b64(t):return base64.b64encode(t.encode('utf8')).decode()
CORS={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Authorization, Accept, Content-Type','Access-Control-Allow-Methods':'GET, PUT, OPTIONS'}
async def gh(route,request):
    u=re.sub(r'\?.*$','',request.url);m=re.match(r'https://api.github.com/repos/([^/]+/[^/]+)(?:/contents/(.*))?$',u)
    if request.method=='OPTIONS':return await route.fulfill(status=204,headers=CORS)
    def js(st,o):return route.fulfill(status=st,headers=dict(CORS,**{'Content-Type':'application/json'}),body=json.dumps(o))
    if not m or m.group(1)!='Testi/master-tiedot':return await js(404,{})
    p=m.group(2)
    if p is None:return await js(200,{'full_name':'Testi/master-tiedot','private':True,'permissions':{'push':True}})
    if request.method=='GET':
        if p in REPO:return await js(200,{'content':b64(REPO[p][0]),'sha':REPO[p][1]})
        return await js(404,{})
    if request.method=='PUT':
        b=json.loads(request.post_data);cur=REPO.get(p)
        if cur and b.get('sha')!=cur[1]:return await js(409,{})
        if not cur and b.get('sha'):return await js(422,{})
        N[0]+=1;REPO[p]=[base64.b64decode(b['content']).decode('utf8'),'sha%d'%N[0]]
        return await js(201 if not cur else 200,{'content':{'sha':REPO[p][1]}})
    return await js(405,{})

SETUP="""(function(){var P=APP.P;var vw=P.views[0].id;
 var a=KK.addBlock(P,'arvo',{v:'3'});KK.setName(P,a.id,'Pisteet');KK.addNode(P,a.id,20,40);
 var m=KK.addBlock(P,'muisti',{v:'1'});KK.setName(P,m.id,'Laskuri');KK.addNode(P,m.id,20,120);
 var t=KK.addBlock(P,'tee',{do:'aseta',o:m.id,v:'9'});var tn=KK.addNode(P,t.id,360,120);
 var k=KK.addBlock(P,'tee',{do:'kaynnista',o:''});KK.addNode(P,k.id,360,260);
 P.lcam={x:0,y:0,z:1};KK.repair(P);APP.renderAll();return {a:a.id,m:m.id,t:t.id,k:k.id};})()"""

async def github(b):
    ctx=await b.new_context(viewport={'width':1440,'height':900},reduced_motion='reduce',accept_downloads=True)
    await ctx.route('https://api.github.com/**',gh);pg=await ctx.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.add_init_script("localStorage.setItem('master:gh',JSON.stringify({repo:'Testi/master-tiedot',token:'github_pat_TESTI',auto:true}))")
    await pg.goto(U);await pg.wait_for_timeout(300)
    await pg.click('#wexample');await pg.wait_for_timeout(3300)
    p0=await pg.evaluate("APP.P.id");assert 'appiappi/'+p0+'.json' in REPO,list(REPO)
    # Monista: kopio saa uuden tunnisteen ilman vanhaa GitHub-kirjanpitoa
    await pg.click('#projbtn');await pg.wait_for_timeout(200);await pg.click('#sheet [data-x="copy"]');await pg.wait_for_timeout(300)
    p1=await pg.evaluate("APP.P.id");assert p1!=p0
    g=await pg.evaluate("JSON.stringify(APP.P._gh||null)");print('GH 1 kopion kirjanpito:',g)
    assert not json.loads(g) or not json.loads(g)['sha'],'kopiolla vanha sha'
    await pg.evaluate("APP.P.name='Kopio muutettu';APP.saveNow()");await pg.wait_for_timeout(3300)
    msg=await pg.inner_text('#kstat');print('GH 2 kopio GitHubissa:','appiappi/'+p1+'.json' in REPO,'| tila:',msg)
    assert 'appiappi/'+p1+'.json' in REPO,list(REPO)
    assert not await pg.evaluate("APP.ghMeta(APP.P).remote"),'kopio jäi ristiriitaan'
    # Vienti tiedostona ja tuonti takaisin: tiedostossa _gh, tuotu projekti ei peri sitä
    await pg.click('#projbtn');await pg.wait_for_timeout(200)
    async with pg.expect_download() as d:await pg.click('#sheet [data-x="export"]')
    dl=await d.value;txt=open(await dl.path(),encoding='utf8').read();print('GH 3 viennissä kirjanpito:','_gh' in txt)
    await pg.keyboard.press('Escape');await pg.wait_for_timeout(150)
    await pg.set_input_files('#filein',files=[{'name':'kopio.appiappi.json','mimeType':'application/json','buffer':txt.encode('utf8')}]);await pg.wait_for_timeout(400)
    p2=await pg.evaluate("APP.P.id");assert p2 not in (p0,p1)
    g=json.loads(await pg.evaluate("JSON.stringify(APP.P._gh||null)"));print('GH 4 tuodun kirjanpito:',g)
    assert not g or not g['sha']
    await pg.evaluate("APP.P.name='Tuotu muutettu';APP.saveNow()");await pg.wait_for_timeout(3300)
    print('GH 5 tuotu GitHubissa:','appiappi/'+p2+'.json' in REPO)
    assert 'appiappi/'+p2+'.json' in REPO and not await pg.evaluate("APP.ghMeta(APP.P).remote")
    print('errs',errs);await ctx.close()

async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        await github(b)
        for W in (1440,1280,390,320):
            mob=W<500;H=844 if mob else 900
            ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            async def tap(sel):
                if mob:await pg.tap(sel)
                else:await pg.click(sel)
                await pg.wait_for_timeout(200)
            async def sel(i):await pg.evaluate("APP.S.sel={t:'b',id:'%s'};APP.S.multi=[];APP.renderAll()"%i);await pg.wait_for_timeout(200)
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Ympäristö');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            await tap('#tabs [data-t="logiikka"]')
            # 1 Arvon paneeli kertoo Muistista
            await sel(I['a']);it=await pg.inner_text('#insp');assert 'Toiminnot eivät muuta Arvoa' in it and 'käytä Muistia' in it
            # 2 ƒ Arvo kaavasta: Kaava + nuoli kohtaan arvo, kaavan arvo menee toimintoon
            await sel(I['k']);assert await pg.locator('#insp [data-kto="v"]').count()==0,'Käynnistä ilman arvokenttää'
            await sel(I['t']);bt=pg.locator('#insp [data-kto="v"]');assert await bt.count()==1;assert 'Arvo kaavasta' in await bt.inner_text()
            if mob:await tap('#mins')  # puhelimella paneeli aukeaa napista
            await bt.scroll_into_view_if_needed();await tap('#insp [data-kto="v"]')
            r=await P(pg,"(function(){var k=Object.values(P.b).filter(b=>b.k==='kaava')[0];var kn=P.lg.n.filter(n=>n.p===k.id)[0];var l=P.lg.l.filter(l=>l.f===kn.id)[0];var tn=P.lg.n.filter(n=>n.id===l.t)[0];return {sel:APP.S.sel.id===k.id||APP.S.sel.id===kn.id,to:tn.p,port:l.tp,fokus:document.activeElement&&document.activeElement.hasAttribute('data-kaava')};})()")
            print(W,'2 Arvo kaavasta:',r);assert r['sel'] and r['to']==I['t'] and r['port']=='v' and r['fokus']
            await pg.fill('#insp textarea[data-kaava]','2 + 3');await pg.wait_for_timeout(200)
            assert await pg.evaluate("APP.ev().linked('%s','v')"%I['t'])
            await sel(I['t']);it=await pg.inner_text('#insp');assert 'Arvo tulee nuolesta' in it and await pg.locator('#insp [data-kto="v"]').count()==0
            await pg.evaluate("KK.runAction(APP.P,'%s',APP.ctx())"%I['t']);await pg.wait_for_timeout(100)
            v=await pg.evaluate("String(APP.ev().val('%s'))"%I['m']);print(W,'2 toiminto asetti:',v);assert v=='5'
            await pg.screenshot(path='appiappi_arvokaavasta_%d.png'%W)
            # 3 Ctrl+Z ja Ctrl+Y: lukitussa näkymässä ei, muokkauksessa kyllä
            await tap('#tabs [data-t="nakyma"]')
            nimi="APP.P.name"
            await pg.evaluate("(function(){var c={};for(var k in APP.P)if(k!=='st'&&k!=='mem'&&k!=='_gh')c[k]=APP.P[k];APP.S.undo.push(JSON.stringify(c));APP.P.name='Muutettu';})()")
            n0=await pg.evaluate("APP.S.undo.length")
            await tap('#lockbtn');assert await pg.evaluate("APP.P.lock")
            await pg.keyboard.press('Control+z');await pg.keyboard.press('Meta+z');await pg.keyboard.press('Control+y');await pg.wait_for_timeout(150)
            print(W,'3 lukittuna:',await pg.evaluate(nimi),await pg.evaluate("APP.S.undo.length"))
            assert await pg.evaluate(nimi)=='Muutettu' and await pg.evaluate("APP.S.undo.length")==n0
            await tap('#lockbtn');await pg.keyboard.press('Control+z');await pg.wait_for_timeout(150)
            assert await pg.evaluate(nimi)=='Ympäristö','muokkauksessa kumoaa'
            # 4 kokeilu: Ctrl+Z ei kumoa, raita kertoo rakenteen jäävän myös kapealla
            await pg.evaluate("(function(){var c={};for(var k in APP.P)if(k!=='st'&&k!=='mem'&&k!=='_gh')c[k]=APP.P[k];APP.S.undo.push(JSON.stringify(c));APP.P.name='Kokeilun aikana';})()")
            await tap('#koebtn');assert await pg.is_visible('#koeraita')
            await pg.keyboard.press('Control+z');await pg.wait_for_timeout(150);assert await pg.evaluate(nimi)=='Kokeilun aikana'
            pit=await pg.is_visible('#koeraita .pitka');lyh=await pg.is_visible('#koeraita .lyhyt')
            vis=await pg.inner_text('#koeraita .lyhyt' if lyh else '#koeraita .pitka')
            ok=await pg.evaluate("(function(){var s=document.querySelector('#koeinfo');return s.scrollWidth<=s.clientWidth+1;})()")
            print(W,'4 raita:',repr(vis),'| mahtuu:',ok);assert ok and ('rakenne' in vis.lower() or 'rakentee' in vis.lower())
            print(W,'4 pitka/lyhyt:',pit,lyh);assert (lyh and not pit) if W<760 else (pit and not lyh)
            await tap('#koeinfo');tt=await pg.inner_text('#toast');print(W,'4 ⓘ:',tt);assert 'Rakenteen muutokset' in tt and 'jäävät voimaan' in tt
            await pg.screenshot(path='appiappi_koeraita_%d.png'%W)
            await tap('#koeend')
            # 5 Asetusten versioteksti
            await tap('#setbtn');st=await pg.inner_text('#sheet');paja=await pg.evaluate("KK.PAJA")
            print(W,'5 versio:',paja);assert 'Appi-appi '+paja+' (entinen Pajakone, tallennusmuoto' in st and int(paja)>=37
            print(W,'errs',errs);assert not errs
            await ctx.close()
        await b.close()
asyncio.run(main())
