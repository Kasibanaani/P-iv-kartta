# Jonon 11: yläpalkin napit eivät rivity eivätkä valu palkin (52 px) yli. GitHub-tila lyhyesti napissa (”GitHub ✓ 22.24”),
# pitkä teksti vihjeessä. Kapeammalla tietokoneen ikkunalla napeista jää kuvake (nimi vihjeessä ja aria-labelissa), projektin nimi kutistuu.
# GitHub korvataan valepalvelimella. Tietokone 1440, 1280, 1024 ja 800 hiirellä, 390 savutestinä. Ei oikeaa iPhonea.
import asyncio, json, base64, re, os
from playwright.async_api import async_playwright
from yhteinen import *
REPO={}
CORS={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Authorization, Accept, Content-Type','Access-Control-Allow-Methods':'GET, PUT, OPTIONS'}
async def gh(route,request):
    u=re.sub(r'\?.*$','',request.url);m=re.match(r'https://api.github.com/repos/([^/]+/[^/]+)(?:/contents/(.*))?$',u)
    if request.method=='OPTIONS':return await route.fulfill(status=204,headers=CORS)
    def js(st,o):return route.fulfill(status=st,headers=dict(CORS,**{'Content-Type':'application/json'}),body=json.dumps(o))
    p=m.group(2) if m else None
    if not m:return await js(404,{})
    if p is None:return await js(200,{'full_name':m.group(1),'private':True,'permissions':{'push':True}})
    if request.method=='GET':
        if p in REPO:return await js(200,{'content':base64.b64encode(REPO[p].encode()).decode(),'sha':'s%d'%len(REPO[p])})
        return await js(404,{})
    if request.method=='PUT':
        b=json.loads(request.post_data);REPO[p]=base64.b64decode(b['content']).decode('utf8')
        return await js(201,{'content':{'sha':'s%d'%len(REPO[p])}})
    return await js(405,{})
MITTAA="""()=>{var t=document.querySelector('#top'),o=[];t.querySelectorAll(':scope>*').forEach(e=>{var r=e.getBoundingClientRect();if(!r.width)return;o.push({id:e.id||e.className,h:Math.round(r.height),b:Math.round(r.bottom),w:Math.round(r.width)});});
 return {sw:t.scrollWidth,cw:t.clientWidth,o:o,proj:Math.round(document.querySelector('#projbtn').getBoundingClientRect().width)};}"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();errs=[]
        for W in ((int(os.environ['VAIN']),) if os.environ.get('VAIN') else (1440,1280,1024,800,390)):
            mob=W<500;ctx=await b.new_context(viewport={'width':W,'height':844 if mob else 900},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            await ctx.route('https://api.github.com/**',gh);pg=await ctx.new_page()
            pg.on('pageerror',lambda e:errs.append(str(e)))
            await pg.add_init_script("localStorage.setItem('master:gh',JSON.stringify({repo:'Testi/master-tiedot',token:'github_pat_TESTI',auto:true}))")
            await pg.goto(U);await pg.wait_for_timeout(300)
            await pg.click('#wexample');await pg.wait_for_timeout(3300)
            gt=await pg.inner_text('#ghbtn');tt=await pg.get_attribute('#ghbtn','title')
            print(W,'1 GitHub-tila:',repr(gt),'| vihje:',tt)
            assert re.match(r'^GitHub ✓ \d\d?\.\d\d$',gt),gt
            assert tt.startswith('GitHub: tallennettu '),tt
            async def tarkista(vaihe):
                m=await pg.evaluate(MITTAA)
                yli=[x for x in m['o'] if x['h']>44 or x['b']>52]
                print(W,vaihe,'| leveys',m['sw'],'/',m['cw'],'| projekti',m['proj'],'px | yli palkin:',yli)
                assert not yli,yli
                if W>=1024:assert m['sw']<=m['cw'],m  # ei vieritystä tietokoneella
                if not mob:assert m['proj']>=90,m
                return m
            await tarkista('2 muokkaus')
            nimi=await pg.inner_text('#setbtn')
            if W>1360 or mob:assert 'Asetukset' in nimi,nimi
            else:
                assert 'Asetukset' not in nimi,nimi
                assert await pg.get_attribute('#setbtn','aria-label')=='Asetukset'
            # Lukitus ja kokeilu vaihtavat napin tekstin: nimi säilyy vihjeessä ja aria-labelissa
            await pg.click('#lockbtn');await pg.wait_for_timeout(150)
            assert await pg.get_attribute('#lockbtn','aria-label')=='Muokkaa'
            await tarkista('3 lukittu')
            await pg.click('#lockbtn');await pg.wait_for_timeout(150)
            await pg.click('#koebtn');await pg.wait_for_timeout(200)
            kt=await pg.inner_text('#koebtn');assert await pg.get_attribute('#koebtn','aria-label')=='Lopeta kokeilu'
            if W>1360 or mob:assert 'Lopeta' in kt,kt
            await tarkista('4 kokeilu')
            await pg.click('#koebtn');await pg.wait_for_timeout(200)
            await ctx.close()
        print('errs',errs);assert not errs
        await b.close()
asyncio.run(main())
