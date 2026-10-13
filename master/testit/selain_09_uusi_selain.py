# Uusi selain tai kotinäytön appi (tyhjä selaimen muisti) ottaa GitHub-tallennuksen käyttöön.
# Varmistaa: 1) uudessa selaimessa tehty projekti tallentuu omaksi tiedostokseen eikä korvaa muita,
# 2) kun Repo ja Avain on täytetty (kumpi tahansa viimeisenä), GitHubin projektit haetaan itsestään,
# 3) Hae GitHubista hakee puuttuvat projektit eikä kehota tallentamaan, 4) paikallisen varmuuskopion merkki ei puhu GitHubista.
# GitHubin rajapinta on sama paikallinen jäljitelmä kuin testissä selain_03 (ei verkkoa).
import asyncio, json, os, re, base64
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
src=open(os.path.join(D,'selain_03_toiveet_github.py'),encoding='utf8').read()
exec(re.search(r'(TOKEN=.*?\n)(class FakeGH:.*?)\nasync def run',src,re.S).group(1)+re.search(r'(class FakeGH:.*?)\nasync def run',src,re.S).group(1))
VANHA={'app':'master','version':3,'projekti':{'name':'HEADMAZE','screens':[{'id':'s1','n':'Alku'}],'objs':[{'id':'o1','t':'text','n':'Minä','s':'s1','req':[],'suf':[],'body':'Teksti','title':True}],'cfg':{'days':False,'vis':'lukitutpois','tint':'vihrea'},'seq':1}}
async def run(w,h,scheme):
    async with async_playwright() as p:
        b=await p.chromium.launch(); errs=[]; G=FakeGH()
        G.put_json('projektit/mvanha1.json',VANHA); vanha_ennen=G.files['projektit/mvanha1.json']['text']
        ctx=await b.new_context(reduced_motion='reduce',viewport={'width':w,'height':h},color_scheme=scheme)
        await ctx.route('https://api.github.com/**',G.handle)
        pg=await ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(U); await pg.wait_for_timeout(300)
        print('==== %dx%d %s ====' % (w,h,scheme))
        names=lambda: pg.evaluate("[...document.getElementById('psel').options].map(o=>o.text).join(', ')")
        # 1 uudessa selaimessa tehdään ensin melkein tyhjä projekti
        await pg.fill('.welcome input','Testi123'); await pg.click('.welcome .mb.solid'); await pg.wait_for_timeout(200)
        print('1 merkki:', await pg.inner_text('#mstat'), '| selitys:', await pg.evaluate("document.getElementById('mstat').title"))
        # 2 avain ensin, repo viimeisenä: haku käynnistyy itsestään
        await pg.click('#mtabs [data-v="proj"]'); await pg.wait_for_timeout(100)
        await pg.fill('#gh-token',TOKEN); await pg.fill('#gh-repo','Kasibanaani/master-tiedot'); await pg.wait_for_timeout(1800)
        print('2 haettu itsestään:', await names(), '|', await pg.inner_text('#gh-msg'))
        await pg.wait_for_timeout(3000)
        await pg.evaluate("document.getElementById('psel').value=MASTER.data.projects[0].id;document.getElementById('psel').dispatchEvent(new Event('change'))"); await pg.wait_for_timeout(200)
        await pg.evaluate("MASTER.ghPush()"); await pg.wait_for_timeout(500)
        print('  Testi123 tallennettu:', len(G.files), 'tiedostoa GitHubissa | vanha ennallaan:', G.files['projektit/mvanha1.json']['text']==vanha_ennen, '| HEADMAZE vanhassa tiedostossa:', G.get_json('projektit/mvanha1.json')['projekti']['name'])
        G.put_json('projektit/mtupla.json',{'app':'master','version':3,'projekti':{'name':'Tupla','screens':[{'id':'s1','n':'Alku'}],'objs':[],'cfg':{'days':False},'seq':0}})
        await pg.evaluate("Promise.all([MASTER.ghNew(),MASTER.ghNew()])"); await pg.wait_for_timeout(500)
        print('  kaksi hakua yhtä aikaa, Tupla kertaa:', (await names()).split(', ').count('Tupla'))
        # 3 Hae GitHubista: ei uusia, avoin projekti ajan tasalla
        await pg.click('#sec-gh .mb:text-is("Hae GitHubista")'); await pg.wait_for_timeout(500)
        print('3 hae GitHubista:', await pg.inner_text('#gh-msg'))
        # 4 uusi projekti GitHubissa ja avoin projekti vain tässä selaimessa
        G.put_json('projektit/mtekoaly2.json',{'app':'master','version':3,'projekti':{'name':'Luonnos','screens':[{'id':'s1','n':'Alku'}],'objs':[],'cfg':{'days':False},'seq':0}})
        await pg.evaluate("MASTER.gh.auto=false"); await pg.click('#pnew'); await pg.wait_for_timeout(150); await pg.fill('#mdlg input','Vain täällä'); await pg.click('#mdlg .mb:text-is("Luo")'); await pg.wait_for_timeout(200)
        await pg.click('#mtabs [data-v="proj"]'); await pg.wait_for_timeout(100)
        await pg.click('#sec-gh .mb:text-is("Hae GitHubista")'); await pg.wait_for_timeout(600)
        print('4 hae GitHubista:', await names(), '|', await pg.inner_text('#gh-msg'), '| ei tallennettu:', not any('Vain' in f['text'] for f in G.files.values()))
        # 5 väärä avain: virhe näkyy, ei hiljaista epäonnistumista
        await pg.fill('#gh-token','github_pat_VAARA'); await pg.wait_for_timeout(1500)
        print('5 väärä avain:', await pg.inner_text('#gh-msg'))
        print('  vanha lopussakin ennallaan:', G.files['projektit/mvanha1.json']['text']==vanha_ennen, '| leveys', await pg.evaluate("[document.documentElement.scrollWidth, window.innerWidth]"), 'errs', errs)
        await b.close()
asyncio.run(run(1440,900,'light')); asyncio.run(run(1280,800,'dark'))
