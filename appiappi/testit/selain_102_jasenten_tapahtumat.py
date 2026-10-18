# Jonon 15e: jäsenten tapahtumat selaimessa (tietokone 1440 ja 1280, 390 savutestinä). Joukko-palikan Jäsenten laji tuo
# tapahtuman jäsen painettu, nuoli siitä Toimintoon vedetään hiirellä, Toiminnon kohteeksi Tapahtuman jäsen, ikkuna Jäsenille
# paneelista, Toista jäsenille paneelista ja lukitussa käytössä jäsenen painallus kulkee Joukon kautta. Ei oikeaa iPhonea eikä Safaria.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0].id,o={},J=KK.jkLuo(P,'napit');o.J=J;
 [['A',60,100],['B',60,200],['C',60,300]].forEach(function(x){var b=KK.addBlock(P,'nappi',{v:v,beh:'kerta'});KK.setName(P,b.id,x[0]);b.x=x[1];b.y=x[2];b.w=160;b.h=44;if(x[0]!=='C')b.jkt=[J];o[x[0]]=b.id;});
 var m=KK.addBlock(P,'muisti',{v:'0'});KK.setName(P,m.id,'Laskuri');KK.addNode(P,m.id,10,20);o.m=m.id;
 var pj=KK.addBlock(P,'pjoukko',{jj:J});o.pj=pj.id;o.pjn=KK.addNode(P,pj.id,40,120).id;
 var t=KK.addBlock(P,'tee',{do:'lisaa',o:m.id});o.t=t.id;o.tn=KK.addNode(P,t.id,420,120).id;
 var s=KK.addBlock(P,'tee',{do:'valitse'});KK.setName(P,s.id,'Valitse jäsen');o.s=s.id;o.sn=KK.addNode(P,s.id,420,260).id;
 var w=KK.addBlock(P,'ikkuna',{m:'cnt'});o.w=w.id;var wn=KK.addNode(P,w.id,40,420);o.wn=wn.id;
 var k=KK.addBlock(P,'kaava');k.f=KK.kaavaToIds(P,'jäsen.y > 150');KK.addNode(P,k.id,60,460,wn.id);
 var kt=KK.addBlock(P,'ketju',{nm:'Ketju'});var ktn=KK.addNode(P,kt.id,700,420);var to=KK.addBlock(P,'toista',{});o.to=to.id;o.ton=KK.addNode(P,to.id,700,480,ktn.id).id;
 P.lcam={x:0,y:0,z:1};KK.repair(P);APP.renderAll();return o;})()"""
async def main():
    async with async_playwright() as p:
        br=await p.chromium.launch()
        for W in (1440,1280,390):
            mob=W<500;H=844 if mob else 900
            ctx=await br.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Jäsenten tapahtumat');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            if mob:
                await pg.tap('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(200)
                await pg.evaluate("APP.P.b['%s'].jlj='nappi';KK.repair(APP.P);APP.S.sel={t:'b',id:'%s'};APP.renderAll()"%(I['pj'],I['pj']));await pg.wait_for_timeout(200)
                r=await pg.locator('#insp').inner_text();print(W,'paneelissa jäsen painettu:','jäsen painettu' in r);assert 'jäsen painettu' in r
                print(W,'errs',errs);assert not errs,errs;await ctx.close();continue
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(200)
            # 1 Jäsenten laji Painike → kohta jäsen painettu solmussa ja paneelissa
            await pg.evaluate("APP.S.sel={t:'b',id:'%s'};APP.S.multi=[];APP.renderAll()"%I['pj']);await pg.wait_for_timeout(150)
            await pg.select_option('#insp select[data-k="jlj"]','nappi');await pg.wait_for_timeout(200)
            t=await pg.locator('#insp').inner_text();n=await pg.locator('#lels .ln[data-nid="%s"] .pt[data-p="j_e"]'%I['pjn']).count()
            print(W,'1',n,'jäsen painettu' in t);assert n==1 and 'jäsen painettu' in t and 'tapahtuma.jäsen' in t
            # 2 nuoli hiirellä: jäsen painettu → Lisää (Laskuri)
            a=await keskus(pg,'#lels .ln[data-nid="%s"] .pt[data-p="j_e"]'%I['pjn']);b=await keskus(pg,'#lels .ln[data-nid="%s"] .pt[data-p="e"][data-d="i"]'%I['tn'])
            await veda(pg,a,b);r=await P(pg,"P.lg.l.filter(l=>l.fp==='j_e').map(l=>KK.nodeOf(P,l.t).p)");print(W,'2',r);assert r==[I['t']],r
            # 3 Toiminnon kohde Tapahtuman jäsen paneelista
            await pg.evaluate("APP.S.sel={t:'b',id:'%s'};APP.renderAll()"%I['s']);await pg.wait_for_timeout(150)
            await pg.select_option('#insp select[data-k="o"]','^');await pg.wait_for_timeout(200)
            r=await P(pg,"[P.b['%s'].otj,P.b['%s'].o]"%(I['s'],I['s']));t=await pg.locator('#insp').inner_text();print(W,'3',r);assert r==[1,''] and 'Tehdään sille jäsenelle' in t,(r,t)
            await pg.evaluate("KK.addLink(APP.P,'%s','j_e','%s','e');KK.repair(APP.P);APP.renderAll()"%(I['pjn'],I['sn']))
            # 4 ikkuna Jäsenille paneelista + nuoli jäsenet → MONTAKO PÄTEE jäsen.y > 150 = 1 (B)
            await pg.evaluate("APP.S.sel={t:'b',id:'%s'};APP.renderAll()"%I['w']);await pg.wait_for_timeout(150)
            await pg.check('#insp input[data-k="jas"]');await pg.wait_for_timeout(200)
            await pg.evaluate("KK.addLink(APP.P,'%s','jm','%s','jm');KK.repair(APP.P);APP.renderAll();APP.S.sel={t:'b',id:'%s'};APP.renderAll()"%(I['pjn'],I['wn'],I['w']));await pg.wait_for_timeout(200)
            r=await P(pg,"[P.b['%s'].jas,E().val('%s')]"%(I['w'],I['w']));t=await pg.locator('#insp').inner_text();print(W,'4',r);assert r==[True,1] and '2 jäsentä' in t,(r,t)
            # 5 Toista jäsenille paneelista
            await pg.evaluate("APP.S.sel={t:'b',id:'%s'};APP.renderAll()"%I['to']);await pg.wait_for_timeout(150)
            await pg.click('#insp [data-seg="tapa"][data-v="jasenet"]');await pg.wait_for_timeout(200)
            r=await P(pg,"[P.b['%s'].tapa,KK.ports(P.b['%s']).ins.map(x=>x.p)]"%(I['to'],I['to']));lab=await pg.inner_text('#lels .ln[data-nid="%s"]'%I['ton'])
            print(W,'5',r,lab.replace('\n',' '));assert r==['jasenet',['e','jm']] and 'jäsenille' in lab,(r,lab)
            await pg.screenshot(path='jasenten_tapahtumat_%d.png'%W)
            # 6 lukittu käyttö: B:n painallus kulkee Joukon kautta, C ei
            await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(120);await pg.click('#lockbtn');await pg.wait_for_timeout(120)
            await pg.click('.ue[data-id="%s"] .w-btn'%I['B']);await pg.wait_for_timeout(100)
            await pg.click('.ue[data-id="%s"] .w-btn'%I['C']);await pg.wait_for_timeout(100)
            r=await P(pg,"[E().val('%s'),E().val('%s'),E().val('%s'),E().val('%s')]"%(I['m'],I['A'],I['B'],I['C']));print(W,'6 laskuri, A, B, C',r)
            assert r==[1,0,2,1],r
            print(W,'errs',errs);assert not errs,errs
            await ctx.close()
        await br.close()
asyncio.run(main())
