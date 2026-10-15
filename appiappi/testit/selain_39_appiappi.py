# Appi-appi 0 (nimenvaihto): Pajakoneen tiedot siirtyvät samasta selaimesta (pajakone.v1 → appiappi.v1, ilme, GitHub-avain)
# ja GitHubista (pajakone/ → appiappi/, valepalvelin) kerran. Pajakoneen omat tiedot jäävät ennalleen. Vanha osoite ohjaa uuteen.
import asyncio, json, base64, re, os, threading, http.server, functools
from playwright.async_api import async_playwright
from yhteinen import *
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
        if p in ('appiappi','pajakone'):
            l=[{'name':k.split('/')[-1],'path':k} for k in REPO if k.startswith(p+'/')];return await js(200 if l else 404,l)
        if p in REPO:return await js(200,{'content':b64(REPO[p][0]),'sha':REPO[p][1]})
        return await js(404,{})
    if request.method=='PUT':
        b=json.loads(request.post_data);cur=REPO.get(p)
        if cur and b.get('sha')!=cur[1]:return await js(409,{})
        N[0]+=1;REPO[p]=[base64.b64decode(b['content']).decode('utf8'),'sha%d'%N[0]]
        return await js(201 if not cur else 200,{'content':{'sha':REPO[p][1]}})
    return await js(405,{})
async def uusi(b,init=None,w=1440):
    ctx=await b.new_context(viewport={'width':w,'height':900},reduced_motion='reduce')
    await ctx.route('https://api.github.com/**',gh);pg=await ctx.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and 'Failed to load resource' not in m.text and errs.append(m.text))
    await pg.goto(U);await pg.wait_for_timeout(150)
    if init:await pg.evaluate("window.addEventListener('beforeunload',function(){localStorage.clear();"+init+"})");await pg.reload()
    await pg.wait_for_timeout(500);return ctx,pg,errs
def projekti(pid,nm):
    return {'id':pid,'name':nm,'b':{},'lg':{'n':[],'l':[]},'views':[{'id':'v1','nm':'Näkymä'}],'st':{},'mem':{}}
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in (1440,390):
            REPO.clear()
            # --- 1 selaimen tiedot ---
            old={'app':'pajakone','ver':8,'projects':[projekti('pA','Vanha A'),projekti('pB','Vanha B')],'cur':'pB','cfg':{},'meta':{'ghGone':[]}}
            old['projects'][0]['_gh']={'sha':'vanha','at':'','dirty':False,'remote':False}
            init="localStorage.setItem('pajakone.v1',%s);localStorage.setItem('pajakone:appearance',JSON.stringify({theme:'plum',mode:'dark'}));"%json.dumps(json.dumps(old))
            ctx,pg,errs=await uusi(b,init,W)
            r=await pg.evaluate("[APP.data.projects.map(p=>p.name),APP.P.name,!!localStorage.getItem('appiappi.v1'),JSON.parse(localStorage.getItem('pajakone.v1')).projects.length,document.title,APP.data.projects[0]._gh&&APP.data.projects[0]._gh.sha,JSON.parse(localStorage.getItem('pajakone.v1')).projects[0]._gh.sha]")
            print(W,'1 selaimesta siirtyi:',r);assert r[0]==['Vanha A','Vanha B'] and r[1]=='Vanha B' and r[2] and r[3]==2 and r[4]=='Appi-appi' and not r[5] and r[6]=='vanha'
            th=await pg.evaluate("[document.documentElement.dataset.appearanceMode,document.documentElement.dataset.appearanceTheme]");print(W,'  ilme otettu:',th)
            assert th==['dark','plum']
            toast=await pg.evaluate("(document.querySelector('#toast')||{}).textContent||''");print(W,'  ilmoitus:',toast);assert 'Appi-appi' in toast
            # toinen avaus ei siirrä uudelleen eikä ilmoita
            await pg.evaluate("APP.data.projects.pop();APP.saveNow()");await pg.reload();await pg.wait_for_timeout(400)
            n=await pg.evaluate("APP.data.projects.length");print(W,'  toinen avaus ei siirrä uudelleen:',n);assert n==1
            assert not errs,errs;await ctx.close()
            # --- 2 GitHub-avain ja kansio ---
            REPO.clear()
            REPO['pajakone/pG.json']=[json.dumps({'app':'pajakone','ver':8,'savedAt':'x','projekti':projekti('pG','GitHubista')}),'s1']
            REPO['pajakone/pA.json']=[json.dumps({'app':'pajakone','ver':8,'savedAt':'x','projekti':projekti('pA','Vanha A')}),'s2']
            init2=init+"localStorage.setItem('pajakone:gh',JSON.stringify({repo:'Testi/master-tiedot',token:'github_pat_TESTI',auto:true}));"
            ctx,pg,errs=await uusi(b,init2,W)
            await pg.wait_for_timeout(5500)
            r=await pg.evaluate("[APP.gh.repo,!!localStorage.getItem('appiappi:gh'),APP.data.projects.map(p=>p.name).sort(),APP.data.meta.pajaGh?1:0]")
            print(W,'2 GitHubista siirtyi:',r,sorted(REPO));assert r[0]=='Testi/master-tiedot' and r[1] and r[2]==['GitHubista','Vanha A','Vanha B'] and r[3]==1
            await pg.evaluate("APP.ghFlush()");await pg.wait_for_timeout(1500);await pg.evaluate("APP.ghFlush()");await pg.wait_for_timeout(1500);await pg.evaluate("APP.ghFlush()");await pg.wait_for_timeout(1500)
            ok=all(('appiappi/%s.json'%i) in REPO for i in ('pA','pB','pG'));print(W,'  tallentui kansioon appiappi/:',sorted(k for k in REPO if k.startswith('appiappi/')));assert ok
            o=json.loads(REPO['appiappi/pG.json'][0]);assert o['app']=='appiappi'
            assert 'pajakone/pG.json' in REPO and REPO['pajakone/pG.json'][1]=='s1'
            # poistettu projekti ei tule takaisin pajakone/-kansiosta
            await pg.evaluate("(function(){var d=APP.data;d.projects=d.projects.filter(p=>p.id!=='pG');d.meta.ghGone.push('pG');APP.saveNow();})()")
            del REPO['appiappi/pG.json']
            n=await pg.evaluate("APP.ghNew()");print(W,'  siirto vain kerran:',n);assert n==0
            assert not errs,errs;await ctx.close()
        # --- 3 vanha osoite ohjaa uuteen ---
        root=os.path.abspath(os.path.join(D,'..','..'))
        class Q(http.server.SimpleHTTPRequestHandler):
            def __init__(self,*a,**k):super().__init__(*a,directory=root,**k)
            def log_message(self,*a):pass
        srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),Q)
        threading.Thread(target=srv.serve_forever,daemon=True).start()
        ctx=await b.new_context();pg=await ctx.new_page()
        await pg.goto('http://127.0.0.1:%d/pajakone/'%srv.server_address[1]);await pg.wait_for_timeout(800)
        print('3 ohjaus:',pg.url,await pg.title());assert pg.url.endswith('/appiappi/') and await pg.title()=='Appi-appi'
        srv.shutdown();await b.close()
asyncio.run(main())
