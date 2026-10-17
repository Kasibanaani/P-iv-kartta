# Jonon 9 (F32 vaihe 1, Appi-appi 43): Hae rivitiedosto (tietokone 1440 ja 1280, hiiri). GitHub-valepalvelin, synteettinen
# terveys.json. Taulukon paneelin Lähde: polku, Hae nyt kysyy tiedoston uudet sarakkeet (Lisää sarakkeet ja hae),
# toinen haku päivittää avaimella eikä kahdenna, appin oma sarake säilyy; virheellinen polku näyttää virheen eikä
# muuta rivejä; lukitussa näkymässä painike + toiminto Hae tiedostosta hakee ja haettu-tapahtuma laskee. Kuvat
# appiappi_hae_*.png. Ei oikeaa iPhonea.
import asyncio, json, base64, re
from playwright.async_api import async_playwright
from yhteinen import *
FILE={'tuonnit/terveys.json':json.dumps({'muoto':'rivit','ver':1,'avain':'paiva','rivit':[{'paiva':'2026-10-16','askeleet':8412,'uni_h':7.2},{'paiva':'2026-10-17','askeleet':1203,'uni_h':6.4}]})}
CORS={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Authorization, Accept, Content-Type','Access-Control-Allow-Methods':'GET, PUT, OPTIONS'}
HAUT=[]
async def gh(route,request):
    u=re.sub(r'\?.*$','',request.url);m=re.match(r'https://api.github.com/repos/([^/]+/[^/]+)(?:/contents/(.*))?$',u)
    if request.method=='OPTIONS':return await route.fulfill(status=204,headers=CORS)
    def js(st,o):return route.fulfill(status=st,headers=dict(CORS,**{'Content-Type':'application/json'}),body=json.dumps(o))
    if not m or m.group(1)!='Testi/master-tiedot':return await js(404,{})
    p=m.group(2)
    if p is None:return await js(200,{'full_name':'Testi/master-tiedot','private':True,'permissions':{'push':True}})
    if request.method=='GET':
        if p=='appiappi':return await js(200,[])
        if p in FILE:
            HAUT.append(p);return await js(200,{'type':'file','encoding':'base64','content':base64.b64encode(FILE[p].encode('utf8')).decode(),'sha':'s%d'%len(HAUT)})
        return await js(404,{})
    return await js(201,{'content':{'sha':'s2'}})
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            FILE['tuonnit/terveys.json']=json.dumps({'muoto':'rivit','ver':1,'avain':'paiva','rivit':[{'paiva':'2026-10-16','askeleet':8412,'uni_h':7.2},{'paiva':'2026-10-17','askeleet':1203,'uni_h':6.4}]})
            b=await p.chromium.launch();errs=[]
            ctx=await b.new_context(viewport={'width':W,'height':900},reduced_motion='reduce')
            await ctx.route('https://api.github.com/**',gh)
            await ctx.add_init_script("localStorage.getItem('appiappi:gh')||localStorage.setItem('appiappi:gh',JSON.stringify({repo:'Testi/master-tiedot',token:'x',auto:false}))")
            pg=await ctx.new_page();pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and 'Failed to load resource' not in m.text and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(400)
            await pg.fill('#wname','Terveys');await pg.click('#wcreate');await pg.wait_for_timeout(200)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(150)
            I=await P(pg,"""(function(){var t=KK.addBlock(P,'taulu',{});KK.setName(P,t.id,'Terveys');KK.addNode(P,t.id,120,80,'');
              KK.addCol(t,'paiva','pvm');KK.addCol(t,'askeleet','luku');KK.addCol(t,'Mieliala','teksti');
              var m=KK.addBlock(P,'muisti',{nm:'Hakuja',v:0});KK.addNode(P,m.id,520,60,'');var l=KK.addBlock(P,'tee',{do:'lisaa',o:m.id});KK.addNode(P,l.id,360,60,'');
              var n=KK.addBlock(P,'nappi',{nm:'Hae',v:P.views[0].id,x:20,y:20});var h=KK.addBlock(P,'tee',{do:'hae',o:t.id});KK.addNode(P,n.id,120,300,'');KK.addNode(P,h.id,320,300,'');
              KK.addLink(P,KK.nodesOfBlock(P,n.id)[0].id,'e',KK.nodesOfBlock(P,h.id)[0].id,'e');KK.repair(P);return {t:t.id,m:m.id,n:n.id,h:h.id,l:l.id};})()""")
            await pg.evaluate("APP.renderAll()");await pg.wait_for_timeout(200)
            await pg.click('#lels .ln:has-text("Terveys")');await pg.wait_for_timeout(200)
            ins=await pg.inner_text('#insp');assert 'LÄHDE' in ins.upper() and 'TIEDOSTO' in ins.upper() and 'Hae nyt' not in ins,ins
            # 1 polku paneeliin: tapahtumat, Hae nyt ja ohje
            await pg.fill('#insp [data-k="lp"]','tuonnit/terveys.json');await pg.press('#insp [data-k="lp"]','Tab');await pg.wait_for_timeout(250)
            assert await P(pg,"P.b['%s'].lp"%I['t'])=='tuonnit/terveys.json'
            assert await P(pg,"KK.ports(P.b['%s']).outs.map(x=>x.n)"%I['t'])==['rivejä','valitun rivin nro','rivit','haettu','hakuvirhe']
            # tapahtuma haettu → Lisää (portti on olemassa vasta, kun lähde on)
            await P(pg,"(function(){KK.addLink(P,KK.nodesOfBlock(P,'%s')[0].id,'hok',KK.nodesOfBlock(P,'%s')[0].id,'e');KK.repair(P);return 1;})()"%(I['t'],I['l']))
            ins=await pg.inner_text('#insp');assert 'Hae nyt' in ins and 'Hae tiedostosta' in ins,ins
            # 2 Hae nyt: uusi sarake kysytään
            await pg.click('#insp [data-tdo="hae"]');await pg.wait_for_timeout(500)
            sh=await pg.inner_text('#sheet');print(W,'2 kysely:',re.sub(r'\s+',' ',sh)[:160]);assert 'Uusia sarakkeita' in sh and 'uni_h' in sh,sh
            assert await pg.eval_on_selector('#sheet [data-hael="0"]','e=>e.value')=='luku'
            assert await P(pg,"KK.tRows(P,'%s').length"%I['t'])==0,'ei vielä rivejä'
            if W==1440:await pg.screenshot(path='appiappi_hae_sarakkeet_%d.png'%W)
            await pg.click('#sheet [data-hae="lisaa"]');await pg.wait_for_timeout(300)
            R=await P(pg,"KK.tRows(P,'%s').map(r=>r.a)"%I['t']);print(W,'2 rivit:',R)
            assert len(R)==2 and R[0]['c2']==8412 and R[0]['c4']==7.2 and R[0]['c1']['d']=='2026-10-16',R
            assert await P(pg,"KK.tSar(P.b['%s']).map(c=>c.nm+':'+c.laji)"%I['t'])==['paiva:pvm','askeleet:luku','Mieliala:teksti','uni_h:luku']
            assert await P(pg,"KK.Ev(P,APP.ctx()).val('%s')"%I['m'])==1,'haettu-tapahtuma'
            ins=await pg.inner_text('#insp');print(W,'2 paneeli:',re.sub(r'\s+',' ',ins[ins.upper().find('LÄHDE'):])[:300]);assert '2 uutta' in ins,ins
            # 3 oma sarake käsin, uusi tiedosto: 17. päivittyy, 18. uusi, 16. säilyy omineen
            await P(pg,"(function(){KK.tRows(P,'%s')[0].a.c3='hyvä';return 1;})()"%I['t'])
            FILE['tuonnit/terveys.json']=json.dumps({'muoto':'rivit','avain':'paiva','rivit':[{'paiva':'2026-10-17','askeleet':9050,'uni_h':6.4},{'paiva':'2026-10-18','askeleet':300}]})
            await pg.click('#insp [data-tdo="hae"]');await pg.wait_for_timeout(500)
            assert not await pg.evaluate("document.getElementById('sheetbg').classList.contains('show')"),'ei kyselyä, kun sarakkeet ovat jo'
            R=await P(pg,"KK.tRows(P,'%s').map(r=>[r.a.c1.d,r.a.c2,r.a.c3||''])"%I['t']);print(W,'3 rivit:',R)
            assert R==[['2026-10-16',8412,'hyvä'],['2026-10-17',9050,''],['2026-10-18',300,'']],R
            await pg.click('#insp [data-tdo="hae"]');await pg.wait_for_timeout(500)
            assert await P(pg,"KK.tRows(P,'%s').length"%I['t'])==3,'sama tiedosto kahdesti ei kahdenna'
            if W==1440:await pg.screenshot(path='appiappi_hae_paneeli_%d.png'%W)
            # 4 väärä polku: virhe näkyy, rivit ennallaan
            await pg.fill('#insp [data-k="lp"]','tuonnit/eiole.json');await pg.press('#insp [data-k="lp"]','Tab');await pg.wait_for_timeout(200)
            await pg.click('#insp [data-tdo="hae"]');await pg.wait_for_timeout(500)
            ins=await pg.inner_text('#insp');assert 'ei löydy' in ins,ins;assert await P(pg,"KK.tRows(P,'%s').length"%I['t'])==3
            assert 'ei löydy' in await P(pg,"KK.Ev(P,APP.ctx()).prop('%s','hakuvirhe')"%I['t'])
            await pg.fill('#insp [data-k="lp"]','tuonnit/terveys.json');await pg.press('#insp [data-k="lp"]','Tab');await pg.wait_for_timeout(200)
            # 5 Toiminnon paneeli ja kuvaus
            await pg.click('#lels .ln:has-text("Hae tiedostosta")');await pg.wait_for_timeout(200)
            ins=await pg.inner_text('#insp');assert 'tapahtumina haettu ja hakuvirhe' in ins,ins
            # 6 lukittuna painike hakee
            FILE['tuonnit/terveys.json']=json.dumps({'avain':'paiva','rivit':[{'paiva':'2026-10-19','askeleet':42}]})
            n0=len(HAUT);await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(150)
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            await pg.click('#uels [data-id="%s"] button'%I['n']);await pg.wait_for_timeout(600)
            assert len(HAUT)==n0+1,HAUT;assert await P(pg,"KK.tRows(P,'%s').length"%I['t'])==4
            assert await P(pg,"KK.Ev(P,APP.ctx()).val('%s')"%I['m'])==4,'haettu-tapahtuma lukittuna'
            # 7 tallennus ja uudelleenavaus: tila säilyy
            await pg.evaluate("APP.saveNow()");await pg.reload();await pg.wait_for_function("window.APP&&APP.P&&APP.P.b")
            assert await P(pg,"KK.tRows(P,'%s').length"%I['t'])==4;assert await P(pg,"!!P.st['hk:%s'].ok"%I['t'])
            print(W,'errs',errs);assert not errs,errs
            await b.close()
asyncio.run(main())
