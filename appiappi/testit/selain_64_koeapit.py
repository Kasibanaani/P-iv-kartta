# Koeapit C (kohdelista 100 rivillä) ja B (kysymysappi) selaimessa, puhelin 390 ja 320 (kosketus). Projektit rakennetaan
# koeapit.js:llä ja haetaan kuten Emilillä: GitHub-valepalvelimelta napin Hae uudet projektit reitillä (APP.ghNew).
# C: 100 korttia, kahden eri kortin plus ja miinus (miinus ei mene alle nollan), Eniten ensin -järjestys, Piilota
# nollat, uusi kohde saa kortin, toinen näkymä näyttää saman määrän ja oman rastin. B: kysymys ja vastausnapit
# riviltä, vastaus kirjautuu painettuun kysymykseen, vaikka seuraava ehtii näkyä, palaute ja pisteet, tilasto
# kysymyksittäin. Lopuksi tiedostosta tuonti GitHub-muotoisena (Appi-appi 23 korjaus). Kuvat koeappi_*.png. Testit ajetaan tietokoneen Chromiumissa, eivät oikealla iPhonella.
import asyncio, json, base64, re, os, subprocess, tempfile
from playwright.async_api import async_playwright
from yhteinen import *

TMP=tempfile.mkdtemp()
subprocess.run(['node',os.path.join(D,'koeapit.js'),TMP],check=True,cwd=D)
REPO={'appiappi/'+f:open(os.path.join(TMP,f),encoding='utf8').read() for f in os.listdir(TMP)}
CORS={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Authorization, Accept, Content-Type','Access-Control-Allow-Methods':'GET, PUT, OPTIONS'}
async def gh(route,request):
    u=re.sub(r'\?.*$','',request.url);m=re.match(r'https://api.github.com/repos/([^/]+/[^/]+)(?:/contents/(.*))?$',u)
    if request.method=='OPTIONS':return await route.fulfill(status=204,headers=CORS)
    def js(st,o):return route.fulfill(status=st,headers=dict(CORS,**{'Content-Type':'application/json'}),body=json.dumps(o))
    if not m or m.group(1)!='Testi/master-tiedot':return await js(404,{})
    p=m.group(2)
    if p is None:return await js(200,{'full_name':'Testi/master-tiedot','private':True,'permissions':{'push':True}})
    if request.method=='GET':
        if p=='appiappi':return await js(200,[{'name':k.split('/')[-1],'path':k,'type':'file'} for k in REPO])
        if p in REPO:return await js(200,{'content':base64.b64encode(REPO[p].encode('utf8')).decode(),'sha':'s1'})
        return await js(404,{})
    return await js(200,{'content':{'sha':'s2'}})
def B(nm):return "Object.values(P.b).filter(b=>b.nm==='%s')[0].id"%nm
async def tx(pg,sel):return re.sub(r'\s+',' ',await pg.inner_text(sel)).strip()
async def avaa_proj(pg,pid):
    await pg.evaluate("(id)=>{APP.data.cur=id;}",pid);await pg.reload();await pg.wait_for_timeout(400)
    if not await pg.evaluate("APP.P.lock"):await pg.click('#lockbtn');await pg.wait_for_timeout(400)

async def main():
    async with async_playwright() as p:
        for W in (390,320):
            b=await p.chromium.launch();errs=[]
            ctx=await b.new_context(viewport={'width':W,'height':844},has_touch=True,is_mobile=True,reduced_motion='reduce')
            await ctx.route('https://api.github.com/**',gh)
            await ctx.add_init_script("localStorage.getItem('appiappi:gh')||localStorage.setItem('appiappi:gh',JSON.stringify({repo:'Testi/master-tiedot',token:'x',auto:false}))")
            pg=await ctx.new_page();pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and 'Failed to load resource' not in m.text and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(500)
            await pg.evaluate("APP.ghNew(true)");await pg.wait_for_timeout(500)
            names=await pg.evaluate("APP.data.projects.map(p=>p.name).sort()");print(W,'haettu:',names);assert names==['Koeappi B: kysymykset','Koeappi C: kohdelista'],names
            await pg.evaluate("APP.saveNow()")
            # ---------- C ----------
            await avaa_proj(pg,'pkoeappic')
            I=await P(pg,"{T:%s,K:%s,R:%s,plus:%s,mi:%s,m:%s,ru:%s,mm:%s}"%(B('Kohteet'),B('Kortit'),B('Ruudukko'),B('Plus'),B('Miinus'),B('Kortin määrä'),B('Tarkistettu'),B('Ruudun määrä')))
            async def kortit(t):return await pg.evaluate("(t)=>[...document.querySelectorAll('#uels [data-id=\"'+t+'\"] .tcard')].sort((a,b)=>parseFloat(a.style.top)-parseFloat(b.style.top)||parseFloat(a.style.left)-parseFloat(b.style.left)).map(c=>[c.getAttribute('data-row'),c.innerText.replace(/\\s+/g,' ').trim()])",t)
            k=await kortit(I['K']);print(W,'C kortteja:',len(k),k[:3]);assert len(k)==100 and k[0][1].startswith('Ananas'),k[:3]
            yv=await tx(pg,'#uels [data-id="%s"]'%(await P(pg,B('Yhteenveto'))));print(W,'C yhteenveto:',yv);assert yv.startswith('100 näkyvissä'),yv
            def maara(r):return P(pg,"KK.tRow(P,'%s','%s').a.c2===undefined?null:KK.tRow(P,'%s','%s').a.c2"%(I['T'],r,I['T'],r))
            r0,r2=k[0][0],k[2][0];a0,a2=await maara(r0),await maara(r2)
            await pg.tap('#uels .tcard[data-row="%s"] [data-id="%s"] button'%(r0,I['plus']));await pg.wait_for_timeout(150)
            await pg.tap('#uels .tcard[data-row="%s"] [data-id="%s"] button'%(r2,I['plus']));await pg.wait_for_timeout(150)
            await pg.tap('#uels .tcard[data-row="%s"] [data-id="%s"] button'%(r2,I['plus']));await pg.wait_for_timeout(150)
            n0,n2=await maara(r0),await maara(r2);print(W,'C plus:',a0,'->',n0,'|',a2,'->',n2);assert n0==(a0 or 0)+1 and n2==(a2 or 0)+2
            v=await tx(pg,'#uels .tcard[data-row="%s"] [data-id="%s"]'%(r2,I['m']));assert v==str(n2),v
            for i in range(n0+1):
                await pg.tap('#uels .tcard[data-row="%s"] [data-id="%s"] button'%(r0,I['mi']));await pg.wait_for_timeout(120)
            print(W,'C miinus nollaan asti:',await maara(r0));assert await maara(r0)==0
            # Järjestys ja suodatus käyttäjän valinnoista
            await pg.tap('#uels [data-id="%s"]'%(await P(pg,B('Eniten ensin'))));await pg.wait_for_timeout(250)
            k=await kortit(I['K']);mx=await P(pg,"Math.max(...KK.tRows(P,'%s').map(r=>r.a.c2||0))"%I['T']);print(W,'C eniten ensin:',k[0][1],'suurin',mx);assert await maara(k[0][0])==mx,k[0]
            await pg.tap('#uels [data-id="%s"]'%(await P(pg,B('Piilota nollat'))));await pg.wait_for_timeout(250)
            k2=await kortit(I['K']);nz=await P(pg,"KK.tRows(P,'%s').filter(r=>r.a.c2>0).length"%I['T']);print(W,'C piilota nollat:',len(k2),nz);assert len(k2)==nz<100
            await pg.screenshot(path='koeappi_c_lista_%d.png'%W)
            # Uusi kohde saa kortin ilman uutta logiikkaa
            uk=await P(pg,B('Uusi kohde'));await pg.fill('#uels [data-id="%s"] input, #uels [data-id="%s"] textarea'%(uk,uk),'Kaurajuoma');await pg.wait_for_timeout(100)
            await pg.tap('#uels [data-id="%s"] button'%(await P(pg,B('Lisää kohde'))));await pg.wait_for_timeout(250)
            await pg.tap('#uels [data-id="%s"]'%(await P(pg,B('Piilota nollat'))));await pg.wait_for_timeout(250)
            k=await kortit(I['K']);uu=[c for c in k if c[1].startswith('Kaurajuoma')];print(W,'C uusi:',len(k),uu);assert len(k)==101 and uu,len(k)
            # Toinen näkymä: sama määrä, oma rasti
            await pg.tap('#uels [data-id="%s"] button'%(await P(pg,B('Toiseen näkymään'))));await pg.wait_for_timeout(600)
            k=await kortit(I['R']);print(W,'C toinen näkymä:',len(k),k[:2]);assert len(k)==101
            cols=await pg.evaluate("(t)=>new Set([...document.querySelectorAll('#uels [data-id=\"'+t+'\"] .tcard')].map(c=>c.style.left)).size",I['R']);print(W,'C sarakkeita:',cols)
            assert any(c[0]==r2 and ('%d kpl'%n2) in c[1] for c in k),[c for c in k if c[0]==r2]
            await pg.tap('#uels .tcard[data-row="%s"] [data-id="%s"] [data-act="toggle"]'%(r2,I['ru']));await pg.wait_for_timeout(200)
            st=await P(pg,"Object.keys(P.st).filter(k=>k.indexOf('ti:%s@')===0)"%I['ru']);print(W,'C oma rasti:',st);assert st==['ti:%s@%s'%(I['ru'],r2)],st
            sw=await pg.evaluate("document.documentElement.scrollWidth");assert sw<=W,('ei vaakavieritystä',sw)
            await pg.screenshot(path='koeappi_c_toinen_%d.png'%W)
            # ---------- B ----------
            await pg.evaluate("APP.saveNow()");await avaa_proj(pg,'pkoeappib')
            J=await P(pg,"{T:%s,H:%s,q:%s,a:%s,b:%s,pal:%s,pis:%s,ot:%s,TS:%s}"%(B('Kysymykset'),B('Vastaukset'),B('Kysymysteksti'),B('Vastaus A'),B('Vastaus B'),B('Palaute'),B('Pisteet'),B('Otsikko'),B('Kysymyskortit')))
            q1=await tx(pg,'#uels [data-id="%s"]'%J['q']);ab=await tx(pg,'#uels [data-id="%s"]'%J['b']);print(W,'B alku:',q1,'|',ab,'|',await tx(pg,'#uels [data-id="%s"]'%J['ot']))
            assert 'pääkaupunki' in q1 and 'Helsinki' in ab
            assert not await pg.locator('#uels [data-id="%s"]'%J['pal']).is_visible(),'palaute piilossa ennen vastausta'
            await pg.tap('#uels [data-id="%s"] button'%J['b']);await pg.wait_for_timeout(250)
            q2=await tx(pg,'#uels [data-id="%s"]'%J['q']);pal=await tx(pg,'#uels [data-id="%s"]'%J['pal']);print(W,'B vastattu B:',q2,'|',pal);assert 'karkausvuodessa' in q2 and 'Oikein' in pal
            await pg.tap('#uels [data-id="%s"] button'%J['a']);await pg.wait_for_timeout(250)
            pal=await tx(pg,'#uels [data-id="%s"]'%J['pal']);pis=await tx(pg,'#uels [data-id="%s"]'%J['pis']);print(W,'B vastattu A:',pal,'|',pis);assert 'Väärin. Oikea oli B' in pal and 'Oikein 1 / 2 · 50 %' in pis,(pal,pis)
            h=await P(pg,"KK.tRows(P,'%s').map(r=>[r.a.c2,r.a.c3,r.a.c4,r.a.c1.ri])"%J['H']);print(W,'B historia:',h);assert h==[['k1','B',True,'r1'],['k2','A',False,'r2']],h
            await pg.screenshot(path='koeappi_b_kysymys_%d.png'%W)
            await pg.tap('#uels [data-id="%s"] button'%(await P(pg,B('Tilastoon'))));await pg.wait_for_timeout(600)
            k=await kortit(J['TS']);print(W,'B tilasto:',k[:3]);assert len(k)==8 and 'Vastattu 1 · oikein 1' in k[0][1] and 'Vastattu 1 · oikein 0' in k[1][1] and 'Vastattu 0' in k[2][1],k[:3]
            sw=await pg.evaluate("document.documentElement.scrollWidth");assert sw<=W,('ei vaakavieritystä',sw)
            await pg.screenshot(path='koeappi_b_tilasto_%d.png'%W)
            print(W,'errs',errs);assert not errs,errs
            await b.close()
        # Tiedostosta tuonti ilman GitHubia: GitHub-muotoinen {app, ver, projekti}
        b,pg,errs=await avaa(p,1440,900)
        await pg.set_input_files('#filein',os.path.join(TMP,'pkoeappib.json'));await pg.wait_for_timeout(400)
        n=await pg.evaluate("APP.data.projects.map(p=>p.name)");print('tiedostosta tuotu:',n);assert n==['Koeappi B: kysymykset'],n
        assert await pg.evaluate("APP.P.name")=='Koeappi B: kysymykset'
        print('errs',errs);assert not errs,errs
        await b.close()
asyncio.run(main())
