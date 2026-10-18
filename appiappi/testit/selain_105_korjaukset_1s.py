# Jonon 1s (kartoitus 9) selaimessa (tietokone 1440 ja 1280, 390 savutestinä): Joukko-palikan säännön laskuvirhe näkyy säännön
# alla ⚠-merkillä ja jäsenen paneelissa (S1), jäsen.-ehdotukset Joukko-palikan kentissä (S7), Jäsenten laji Muoto listaa Liikkeen
# tapahtumat (S3), rakennuslaatikon Kolikko joukolla: yksi yhteinen Ryhmä ja Joukko #kolikot, kolikko kerätään oikeasti (R1).
# Ei oikeaa iPhonea eikä Safaria.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0].id,o={},J=KK.jkLuo(P,'seinat');
 [['Eka',60],['Toka',200]].forEach(function(x){var b=KK.addBlock(P,'muoto',{v:v});KK.setName(P,b.id,x[0]);b.x=x[1];b.y=100;b.w=40;b.h=40;b.jkt=[J];o[x[0]]=b.id;});
 var pj=KK.addBlock(P,'pjoukko',{jj:J});KK.addNode(P,pj.id,40,40);o.pj=pj.id;o.J=J;
 P.lcam={x:0,y:0,z:1};KK.repair(P);APP.renderAll();return o;})()"""
async def valitse(pg,id):
    await pg.evaluate("APP.S.sel={t:'b',id:'%s'};APP.S.multi=[];APP.renderAll()"%id);await pg.wait_for_timeout(150)
async def main():
    async with async_playwright() as p:
        br=await p.chromium.launch()
        for W in (1440,1280,390):
            mob=W<500;H=844 if mob else 900
            ctx=await br.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Korjaukset 1s');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            if mob:
                await valitse(pg,I['pj']);n=await pg.locator('#insp [data-jsradd]').count();print(W,'savutesti',n);assert n==1
                print(W,'errs',errs);assert not errs,errs;await ctx.close();continue
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(200)
            await valitse(pg,I['pj'])
            # 1 S7: jäsen.-ehdotukset sääntökentässä (Muodon ominaisuudet, molemmilla jäsenillä)
            await pg.click('#insp [data-jsradd]');await pg.wait_for_timeout(200)
            ta='#insp textarea[data-k="pjf_jsr_0"]';await pg.click(ta);await pg.type(ta,'jäsen.');await pg.wait_for_timeout(250)
            sug=await pg.evaluate("[...document.querySelectorAll('#insp .fsug [data-ksug]')].map(e=>e.getAttribute('data-ksug'))")
            print(W,'1',sug[:8]);assert 'x' in sug and 'y' in sug,sug
            await pg.locator('#insp .fsug [data-ksug="x"]').dispatch_event('pointerdown');await pg.wait_for_timeout(150)
            v=await pg.input_value(ta);assert v.startswith('jäsen.x'),v
            # 2 S1: säännön laskuvirhe näkyy säännön alla, Joukko-palikka on virheessä, jäsenen paneeli kertoo
            await pg.type(ta,' > puuttuva');await pg.wait_for_timeout(300)
            t=await pg.inner_text('#insp [data-jsrv="nk"]');r=await P(pg,"[KK.isErr(E().val('%s')),E().visible('%s')]"%(I['pj'],I['Eka']))
            print(W,'2',t,r);assert t.startswith('⚠ jäsen') and r==[True,False],(t,r)
            await valitse(pg,I['Eka']);t=await pg.inner_text('#insp .jkchips');print(W,'2b',t.replace('\n',' '));assert '⚠ joukon #seinat sääntö (näkyy kun): virhe' in t,t
            # korjattu sääntö: virhe poistuu
            await valitse(pg,I['pj']);await pg.fill(ta,'jäsen.x > 100');await pg.dispatch_event(ta,'input');await pg.wait_for_timeout(250)
            t=await pg.inner_text('#insp [data-jsrv="nk"]');r=await P(pg,"[E().val('%s'),E().visible('%s'),E().visible('%s')]"%(I['pj'],I['Eka'],I['Toka']))
            print(W,'2c',repr(t),r);assert t=='' and r==[2,False,True],(t,r)
            # 3 S3: Jäsenten laji Muoto → jäsen törmäsi listassa
            await pg.select_option('#insp select[data-k="jlj"]','muoto');await pg.wait_for_timeout(200)
            t=await pg.inner_text('#insp');assert 'jäsen törmäsi' in t,t[-600:]
            r=await P(pg,"KK.ports(P.b['%s']).outs.map(o=>o.p)"%I['pj']);assert 'j_tor' in r,r
            # 4 R1: kaksi kolikkoa rakennuslaatikosta → yksi Ryhmä Kolikot, yksi #kolikot-Joukko, kolikko kerätään
            await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(200)
            await pg.evaluate("APP.rl.lisaa('kolikko',{x:300,y:400});APP.rl.lisaa('kolikko',{x:380,y:400})");await pg.wait_for_timeout(200)
            r=await P(pg,"""(function(){var J=KK.jkFind(P,'kolikot'),rs=Object.values(P.b).filter(b=>b.k==='ryhma'),pj=Object.values(P.b).filter(b=>b.k==='pjoukko'&&b.jj===J);
              var al=Object.values(P.b).filter(b=>b.k==='alue'&&KK.jkHas(b,J));var g=KK.nodesOfBlock(P,rs[0].id)[0],inG=P.lg.n.filter(n=>n.g===g.id).length;
              var ys=P.lg.n.filter(n=>n.g===g.id).map(n=>n.y);return {J:!!J,ryhmat:rs.map(b=>b.nm),pj:pj.length,alueet:al.length,pisteet:Object.values(P.b).filter(b=>b.vt==='pisteet').length,inG:inG,
                eri:new Set(P.lg.n.filter(n=>n.g===g.id).map(n=>n.x+','+n.y)).size,gh:g.h,maxy:Math.max.apply(null,ys)-g.y};})()""")
            print(W,'4',r);assert r['J'] and r['ryhmat']==['Kolikot'] and r['pj']==1 and r['alueet']==2 and r['pisteet']==1,r
            assert r['eri']==r['inG'],('solmut päällekkäin',r);assert r['gh']>r['maxy'],('ryhmä ei kasvanut',r)
            await pg.evaluate("""(function(){var P=APP.P,k=Object.values(P.b).filter(b=>b.k==='muoto'&&b.nm.indexOf('Kolikko')==0)[0];
              var p=KK.addBlock(P,'muoto',{laji:'ympyra',nm:'Testipelaaja',v:APP.S.vw});p.w=p.h=20;p.x=k.x-120;p.y=k.y+4;
              var l=KK.addBlock(P,'liike',{o:p.id,vx:'300',xmax:String(k.x+40)});KK.addNode(P,l.id,1400,40);KK.repair(P);APP.renderAll();})()""")
            await pg.click('#lockbtn');await pg.wait_for_timeout(1200)
            st=await P(pg,"(function(){var e=E(),p=Object.values(P.b).filter(b=>b.vt=='pisteet')[0],k=Object.values(P.b).filter(b=>b.nm.indexOf('Kolikko')==0&&b.k=='muoto');return [e.val(p.id),k.map(b=>e.visible(b.id))];})()")
            print(W,'5',st);assert st[0]==1 and st[1]==[False,True],st
            await pg.screenshot(path='appiappi_1s_kolikot_%d.png'%W)
            print(W,'errs',errs);assert not errs,errs
            await ctx.close()
        await br.close()
asyncio.run(main())
