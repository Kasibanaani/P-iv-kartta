# Versio 6.11: tallennus selaimessa. Versiolla 5.2 tallennettu kartta aukeaa (näkymä ja logiikka, ei virheitä, käyttö toimii),
# siihen lisätty ketju säilyy uudelleenlatauksessa, ketju ja sen ajotila menevät GitHubiin (valepalvelin, oikeaan repoon
# ei kosketa) ja jatkuvat toisessa selaimessa, ja varmuuskopiotiedosto tuo ketjut toiseen selaimeen. Kuvat versio611_*.png.
import asyncio, json, base64, re, os
from playwright.async_api import async_playwright
from yhteinen import *
OLD=open(os.path.join(D,'vanha_v5_esimerkki.json'),encoding='utf8').read()
REPO={};N=[0]
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
        if p=='kytkoskartta':
            l=[{'name':k.split('/')[-1],'path':k} for k in REPO if k.startswith('kytkoskartta/')];return await js(200 if l else 404,l)
        if p in REPO:return await js(200,{'content':b64(REPO[p][0]),'sha':REPO[p][1]})
        return await js(404,{})
    if request.method=='PUT':
        b=json.loads(request.post_data);cur=REPO.get(p)
        if cur and b.get('sha')!=cur[1]:return await js(409,{})
        N[0]+=1;REPO[p]=[base64.b64decode(b['content']).decode('utf8'),'sha%d'%N[0]]
        return await js(201 if not cur else 200,{'content':{'sha':REPO[p][1]}})
    return await js(405,{})
async def uusi(b,init=None,w=1440):
    ctx=await b.new_context(viewport={'width':w,'height':900},accept_downloads=True,reduced_motion='reduce')
    await ctx.route('https://api.github.com/**',gh);pg=await ctx.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and 'Failed to load resource' not in m.text and errs.append(m.text))
    if init:await pg.add_init_script(init)
    await pg.goto(U);await pg.wait_for_timeout(350);return ctx,pg,errs
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in (1440,1280):
            REPO.clear()
            # --- 1 vanha kartta aukeaa ---
            ctx,pg,errs=await uusi(b,"if(!localStorage.getItem('testi:x')){localStorage.setItem('testi:x','1');localStorage.setItem('kytkoskartta.v1',%s);}"%json.dumps(OLD),W)
            nm=await pg.inner_text('#projbtn');n=await pg.locator('#uels .ue').count();print(W,'1 vanha avautui:',nm.strip(),n);assert 'Esimerkki' in nm and n>=10
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(300);ln=await pg.locator('#lworld .ln').count();assert ln>=20
            await pg.screenshot(path='versio611_vanha_logiikka_%d.png'%W)
            await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(200);await pg.click('#lockbtn');await pg.wait_for_timeout(200)
            kyt=await P(pg,"B('Tarkka tila').id");await pg.click('.ue[data-id="%s"] [data-act="toggle"]'%kyt);await pg.wait_for_timeout(150)
            tid=await P(pg,"B('Taukonappi').id");await pg.click('.ue[data-id="%s"] [data-act="press"]'%tid);await pg.wait_for_timeout(200)
            cnt=await P(pg,"E().val(B('Taukoaikajana').id)");print(W,'2 käyttö toimii:',cnt);assert cnt==1
            await pg.click('#lockbtn');await pg.wait_for_timeout(150)
            # --- 2 ketju vanhaan karttaan, uudelleenlataus ---
            kid=await pg.evaluate("""(function(){var P=APP.P;var lst=Object.values(P.b).find(b=>b.k==='lista');var k=KK.addBlock(P,'ketju',{nm:'Muistutus'});var w=KK.addNode(P,k.id,40,900);
              var t=KK.addBlock(P,'ajastin',{kesto:4}),r=KK.addBlock(P,'tee',{do:'rivi',o:lst.id,tx:'Muista tauko'});var nt=KK.addNode(P,t.id,60,950,w.id),nr=KK.addNode(P,r.id,60,1020,w.id);KK.addLink(P,nt.id,'e',nr.id,'e');
              var bt=Object.values(P.b).find(b=>b.nm==='Taukonappi');KK.addLink(P,P.lg.n.find(n=>n.p===bt.id).id,'e',w.id,'e');APP.saveNow();return k.id;})()""")
            await pg.wait_for_timeout(1500);await pg.reload();await pg.wait_for_timeout(350)
            ks=await P(pg,"[KK.chainList(P).map(c=>c.nm),KK.chainSteps(P,'%s').length]"%kid);print(W,'3 ketju säilyi:',ks)
            assert ks==[['Muistutus'],2]
            # --- 3 GitHub: ketju ja ajotila ---
            await pg.evaluate("localStorage.setItem('kytkoskartta:gh',JSON.stringify({repo:'Testi/master-tiedot',token:'github_pat_TESTI',auto:true}))")
            await pg.wait_for_timeout(300);await pg.reload();await pg.wait_for_timeout(400)
            await pg.click('#lockbtn');await pg.wait_for_timeout(150);await pg.click('.ue[data-id="%s"] [data-act="press"]'%tid);await pg.wait_for_timeout(3200)
            pid=await pg.evaluate("APP.P.id");f=REPO.get('kytkoskartta/%s.json'%pid);assert f,'tallentui GitHubiin'
            pj=json.loads(f[0])['projekti'];run=pj['st'][kid]['run'];tk=pj['st'][kid]['tk'];print(W,'4 GitHubissa:',pj['b'][kid]['k'],run,len(tk),'u' in tk[0]);assert pj['b'][kid]['k']=='ketju' and run and 'u' in tk[0]
            await ctx.close()
            # toinen selain hakee projektin GitHubista ja ketju jatkuu
            ctx2,pg2,errs2=await uusi(b,"if(!localStorage.getItem('testi:y')){localStorage.setItem('testi:y','1');localStorage.setItem('kytkoskartta:gh',JSON.stringify({repo:'Testi/master-tiedot',token:'github_pat_TESTI',auto:false}));}",W)
            await pg2.wait_for_timeout(1500)
            got=await pg2.evaluate("APP.data.projects.map(p=>[p.name,Object.values(p.b).filter(b=>b.k==='ketju').length])");print(W,'5 toinen selain:',got);assert ['Esimerkki: viikon tehtävät',1] in got
            await pg2.evaluate("(function(){var d=APP.data;d.cur=d.projects.find(p=>p.name.indexOf('Esimerkki')===0).id;APP.saveNow();})()");await pg2.wait_for_timeout(300);await pg2.reload();await pg2.wait_for_timeout(1800)
            rows=await pg2.evaluate("(function(){var P=APP.data.projects.find(p=>p.name.indexOf('Esimerkki')===0);var l=Object.values(P.b).find(b=>b.k==='lista');return [KK.listRows(P,l.id).map(r=>r.tx).slice(-1)[0],P.st['%s'].run];})()"%kid)
            print(W,'6 jatkui toisessa selaimessa:',rows)
            assert rows==['Muista tauko',False]
            # --- 4 varmuuskopio toiseen selaimeen ---
            async with pg2.expect_download() as d:await pg2.click('#bkbtn')
            fp=await (await d.value).path()
            ctx3,pg3,errs3=await uusi(b,None,W);await pg3.set_input_files('#filein',fp);await pg3.wait_for_timeout(400)
            ks=await pg3.evaluate("APP.data.projects.map(p=>KK.chainList(p).map(c=>c.nm)).flat()");print(W,'7 varmuuskopiosta:',ks);assert 'Muistutus' in ks
            for c in (ctx2,ctx3):await c.close()
            allerr=errs+errs2+errs3;print(W,'errs',allerr);assert not allerr
        await b.close()
asyncio.run(main())
