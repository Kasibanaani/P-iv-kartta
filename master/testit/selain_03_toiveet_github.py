# Versio 3: toiveet tekoälylle ja GitHub-tallennus. GitHubin rajapinta korvataan testissä paikallisella jäljitelmällä
# (yksityinen repo muistissa), joten testi ei käytä verkkoa.
import asyncio, json, os, base64, re
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
TOKEN='github_pat_TESTI'
class FakeGH:
    def __init__(s): s.files={}; s.n=0; s.calls=[]; s.badheaders=set()
    def sha(s): s.n+=1; return 'sha%03d' % s.n
    def put_json(s,path,obj):
        s.files[path]={'sha':s.sha(),'text':json.dumps(obj,ensure_ascii=False)}
    def get_json(s,path): return json.loads(s.files[path]['text'])
    async def handle(s,route,request):
        bad=[k for k in request.headers if k.lower() not in ('authorization','accept','content-type','user-agent','referer','origin','sec-ch-ua','sec-ch-ua-mobile','sec-ch-ua-platform','accept-language','content-length') and not k.lower().startswith('sec-fetch')]
        if bad: s.badheaders.update(bad)
        url=request.url.split('?')[0]; m=re.match(r'https://api\.github\.com/repos/Kasibanaani/master-tiedot(/contents/(.*))?$',url)
        auth=request.headers.get('authorization','')
        s.calls.append((request.method,url.replace('https://api.github.com/repos/Kasibanaani/master-tiedot','')))
        H={'Access-Control-Allow-Origin':'*','Content-Type':'application/json'}
        if not m: return await route.fulfill(status=404,headers=H,body='{"message":"Not Found"}')
        if auth!='Bearer '+TOKEN: return await route.fulfill(status=401,headers=H,body='{"message":"Bad credentials"}')
        if not m.group(1): return await route.fulfill(status=200,headers=H,body=json.dumps({'full_name':'Kasibanaani/master-tiedot','private':True,'permissions':{'push':True}}))
        path=m.group(2)
        if request.method=='GET':
            if path=='projektit':
                l=[{'name':p.split('/')[-1],'path':p,'sha':f['sha']} for p,f in s.files.items() if p.startswith('projektit/')]
                return await route.fulfill(status=200 if l else 404,headers=H,body=json.dumps(l if l else {'message':'Not Found'}))
            if path in s.files:
                f=s.files[path]; return await route.fulfill(status=200,headers=H,body=json.dumps({'sha':f['sha'],'content':base64.b64encode(f['text'].encode()).decode()}))
            return await route.fulfill(status=404,headers=H,body='{"message":"Not Found"}')
        if request.method=='PUT':
            b=json.loads(request.post_data); cur=s.files.get(path)
            if cur and b.get('sha')!=cur['sha']: return await route.fulfill(status=409 if b.get('sha') else 422,headers=H,body='{"message":"sha mismatch"}')
            s.files[path]={'sha':s.sha(),'text':base64.b64decode(b['content']).decode()}
            return await route.fulfill(status=201 if not cur else 200,headers=H,body=json.dumps({'content':{'sha':s.files[path]['sha']}}))
        return await route.fulfill(status=405,headers=H,body='{}')
async def run(w,h,scheme,shots,tag):
    async with async_playwright() as p:
        b=await p.chromium.launch(); errs=[]; G=FakeGH()
        ctx=await b.new_context(viewport={'width':w,'height':h},color_scheme=scheme,accept_downloads=True)
        await ctx.route('https://api.github.com/**',G.handle)
        pg=await ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(U); await pg.wait_for_timeout(300)
        print('==== %dx%d %s ====' % (w,h,scheme))
        phone=lambda: pg.evaluate("[...document.querySelectorAll('#pscreen .ua-list>*')].filter(e=>!e.hidden).map(e=>e.classList.contains('ua-wish')?'{'+e.innerText.replace(/\\n+/g,' / ')+'}':e.innerText.replace(/\\n+/g,' ')).join(' | ')")
        chip=lambda: pg.evaluate("(()=>{var b=document.getElementById('mgh');return b.hidden?'(piilossa)':b.textContent+(b.classList.contains('bad')?' [!]':'');})()")
        async def add(kind,name):
            await pg.click('[data-add="%s"]' % kind); await pg.wait_for_timeout(80); await pg.fill('#f-name',name); await pg.press('#f-name','Tab'); await pg.wait_for_timeout(80)
        # 1 toive tekoälylle
        await pg.fill('.welcome input','Headmaze'); await pg.click('.welcome .mb.solid'); await pg.wait_for_timeout(200)
        await add('slider','Läsnäolo')
        await add('wish','Minä-välilehti'); await pg.fill('#f-wish','Tähän tulisi Minä-välilehden käsikirjoitus: ensin profiilin perustiedot, sitten paljastus.'); await pg.wait_for_timeout(100)
        await pg.select_option('#insp select >> nth=0','screen'); await pg.wait_for_timeout(80)
        print('1 toive:', await pg.inner_text('#insp h2'), '| ohje:', await pg.inner_text('#insp > .help summary'), '| vihje:', await pg.inner_text('#insp .wishcard .hint'))
        print('  puhelimessa:', await phone(), '| lista:', await pg.evaluate("[...document.querySelectorAll('.oname')].map(b=>b.querySelector('.badge').textContent+' '+b.querySelector('.on').textContent+' '+b.querySelector('.ov').textContent).join(', ')"))
        await pg.click('#pwish'); await pg.wait_for_timeout(100); print('  toiveet piiloon:', await phone(), '|', await pg.inner_text('#pwish')); await pg.click('#pwish'); await pg.wait_for_timeout(100)
        print('  välilehti:', await pg.inner_text('#mtabs [data-v="wish"]'), '| viety appi ilman toiveita:', 'Minä-välilehti' not in await pg.evaluate("MASTER.appHtml()"))
        await pg.click('#mtabs [data-v="wish"]'); await pg.wait_for_timeout(100)
        print('  toivelista:', (await pg.inner_text('#v-wish .sgrid')).replace('\n',' / '))
        if shots: await pg.screenshot(path='g%s_wish.png' % tag)
        await pg.click('#v-wish .wcard'); await pg.wait_for_timeout(100); print('  kortin napautus avaa:', await pg.inner_text('#insp h2'))
        if shots: await pg.screenshot(path='g%s_wishinsp.png' % tag)
        # 2 yhteyden asetus
        await pg.click('#mtabs [data-v="proj"]'); await pg.wait_for_timeout(100)
        print('2 ennen yhteyttä:', await chip(), '| github-kutsuja:', len(G.calls))
        await pg.fill('#gh-repo','Kasibanaani/master-tiedot'); await pg.press('#gh-repo','Tab'); await pg.fill('#gh-token','vaara_avain'); await pg.press('#gh-token','Tab'); await pg.wait_for_timeout(200)
        await pg.click('#sec-gh .mb:text-is("Testaa yhteys")'); await pg.wait_for_timeout(300); print('  väärä avain:', await pg.inner_text('#gh-msg'))
        await pg.fill('#gh-token',TOKEN); await pg.press('#gh-token','Tab'); await pg.wait_for_timeout(200)
        await pg.click('#sec-gh .mb:text-is("Testaa yhteys")'); await pg.wait_for_timeout(300); print('  oikea avain:', await pg.inner_text('#gh-msg'))
        if shots: await pg.screenshot(path='g%s_proj.png' % tag)
        await pg.click('#sec-gh .mb:text-is("Tallenna nyt")'); await pg.wait_for_timeout(400)
        path=[k for k in G.files][0]; js=G.get_json(path)
        print('  tallennettu:', path.split('/')[0], '| chip:', await chip(), '| toive mukana:', any(o['t']=='wish' for o in js['projekti']['objs']), '| päivät pois:', 'days' not in js['projekti'], '| avain ei tiedostossa:', TOKEN not in G.files[path]['text'])
        # 3 automaattinen tallennus muokkauksesta
        await pg.click('#mtabs [data-v="build"]'); await add('choice','Hengitä'); print('3 heti muokkauksen jälkeen:', await chip())
        await pg.wait_for_timeout(3200); js=G.get_json(path); print('  2,5 s myöhemmin:', await chip(), '| GitHubissa objekteja:', len(js['projekti']['objs']))
        # päiväkirjaus pysyy omana
        await pg.evaluate("(()=>{var x=document.querySelector('#pscreen .ua-sl input');x.value=8;x.dispatchEvent(new Event('input',{bubbles:true}));})()"); await pg.wait_for_timeout(3000)
        print('  säätimen liikutus ei tallenna GitHubiin:', G.get_json(path)['projekti']['state'], '| kutsuja yhteensä:', len(G.calls))
        # 4 tekoäly muuttaa GitHubissa -> master hakee
        js=G.get_json(path); P=js['projekti']
        for o in P['objs']:
            if o['t']=='wish': o['status']='tehty'; o['reply']='Lisäsin tekstin ”Profiili” ja säätimen alle. Käsikirjoitus jatkuu seuraavassa versiossa.'
        P['seq']=P.get('seq',0)+1; P['objs'].append({'id':'o%d' % P['seq'],'t':'text','n':'Profiili','s':P['screens'][0]['id'],'req':[],'suf':[],'body':'Nimi, ikä, kiinnostuksen kohteet…','title':True})
        G.put_json(path,js)
        await pg.evaluate("MASTER.ghCheck()"); await pg.wait_for_timeout(500)
        print('4 tekoälyn muutos haettu:', await phone(), '| chip:', await chip(), '| välilehti:', await pg.inner_text('#mtabs [data-v="wish"]'))
        print('  oma säädin säilyi:', await pg.evaluate("document.querySelector('#pscreen .ua-sl input').value"))
        await pg.click('.oname:has(.on:text-is("Minä-välilehti"))'); await pg.wait_for_timeout(100); print('  vastaus näkyy:', await pg.inner_text('#insp .wishcard .status'))
        if shots: await pg.screenshot(path='g%s_reply.png' % tag)
        # 5 ristiriita: oma muokkaus ja tekoälyn muokkaus yhtä aikaa
        js=G.get_json(path); js['projekti']['name']='Headmaze (tekoäly)'; G.put_json(path,js)
        await add('text','Oma lisäys'); await pg.wait_for_timeout(3200)
        print('5 ristiriita:', await chip(), '| viesti:', await pg.evaluate("document.getElementById('mgh').title"))
        await pg.click('#mgh'); await pg.wait_for_timeout(150); print('  kysymys:', await pg.inner_text('#mdlg h3')); await pg.click('#mdlg .mb:text-is("Hae GitHubin versio")'); await pg.wait_for_timeout(400)
        print('  haettu:', await pg.evaluate("document.getElementById('psel').selectedOptions[0].text"), '| oma lisäys poistui:', await pg.locator('.oname:has(.on:text-is("Oma lisäys"))').count()==0, '| chip:', await chip())
        await pg.click('#mundo'); await pg.wait_for_timeout(200); print('  kumoa palauttaa oman:', await pg.locator('.oname:has(.on:text-is("Oma lisäys"))').count()==1, '| chip:', await chip())
        await pg.wait_for_timeout(3200); print('  ja tallentaa:', await chip(), '| GitHubissa:', [o['n'] for o in G.get_json(path)['projekti']['objs']])
        # 6 uusi projekti GitHubissa
        G.put_json('projektit/mtekoaly1.json',{'app':'master','version':3,'projekti':{'name':'Tekoälyn luonnos','screens':[{'id':'s1','n':'Alku'}],'objs':[{'id':'o1','t':'text','n':'Tervetuloa','s':'s1','req':[],'suf':[],'body':'Luonnos','title':True}],'cfg':{'days':False,'vis':'lukitutpois','tint':'vihrea'},'seq':1}})
        await pg.click('#mtabs [data-v="proj"]'); await pg.click('#sec-gh .mb:text-is("Hae uudet projektit")'); await pg.wait_for_timeout(500)
        print('6 uudet projektit:', await pg.evaluate("[...document.getElementById('psel').options].map(o=>o.text).join(', ')"), '|', await pg.inner_text('#gh-msg'))
        # 7 avain ei mene varmuuskopioon
        async with pg.expect_download() as dl: await pg.click('#mbackup')
        f=await dl.value; bp=os.path.join(os.getcwd(),'gvarmuus_%s.json' % tag); await f.save_as(bp); txt=open(bp,encoding='utf8').read()
        print('7 avain ei varmuuskopiossa:', TOKEN not in txt, '| uid mukana:', '"uid"' in txt)
        # 8 uudelleenlataus: tarkistus käynnistyessä
        js=G.get_json(path); js['projekti']['objs'].append({'id':'o99','t':'text','n':'Lisätty taustalla','s':js['projekti']['screens'][0]['id'],'req':[],'suf':[],'body':'x','title':True}); G.put_json(path,js)
        await pg.evaluate("document.getElementById('psel').value=MASTER.data.projects[0].id;document.getElementById('psel').dispatchEvent(new Event('change'))"); await pg.wait_for_timeout(200)
        await pg.reload(); await pg.wait_for_timeout(800); await pg.click('#mtabs [data-v="build"]')
        print('8 latauksessa haettu:', await pg.locator('.oname:has(.on:text-is("Lisätty taustalla"))').count()==1, '| chip:', await chip())
        print('  kielletyt otsakkeet (CORS):', sorted(G.badheaders) or 'ei'); print('  leveys', await pg.evaluate("[document.documentElement.scrollWidth, window.innerWidth]"), 'errs', errs)
        await b.close()
asyncio.run(run(1440,900,'light',True,'')); asyncio.run(run(1280,800,'dark',True,'_n'))
