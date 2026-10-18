# Jonon 12b (F38 kohta 2): Tee näkymään. Arvollisen logiikkapalikan paneelin ▢ Tee näkymään tekee viimeksi auki olleeseen
# näkymään Laatikon, jonka teksti on {viite}; nimi ”… · näyttö”, viite ”…_n” (yksilöllinen); vasempaan reunaan alimman
# palikan alle; logiikka-välilehti pysyy; välähdyskupla vie palikan kohdalle. Pikanäppäin N, monivalinta allekkain,
# ▾ vain sopivat vaihtoehdot (Monitori luvulle, Ilmoitus kyllä/ei-arvolle), laitenäkymässä ruudun leveydeltä, ⌘Z kumoaa.
# Tietokone 1440 ja 1280 hiirellä, 390 savutestinä. Ei oikeaa iPhonea.
import asyncio, os
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v1=P.views[0].id;
 P.views.push({id:'v9',n:'Tulokset',laite:'puhelin'});
 var t=KK.addBlock(P,'nayta',{v:v1,tx:'Otsikko'});t.x=60;t.y=30;
 var a=KK.addBlock(P,'muoto',{v:v1,tx:'Iso'});a.x=300;a.y=100;a.h=120;
 var m=KK.addBlock(P,'muisti',{v:'7'});KK.setName(P,m.id,'Unipisteet');var mn=KK.addNode(P,m.id,60,60);
 var k=KK.addBlock(P,'kaava',{f:'{#'+m.id+'} > 5'});KK.setName(P,k.id,'Hyvä uni');var kn=KK.addNode(P,k.id,60,180);
 var w=KK.addBlock(P,'arvo',{v:'Moi'});KK.setName(P,w.id,'Tervehdys');var wn=KK.addNode(P,w.id,60,300);
 var n=KK.addBlock(P,'nappi',{v:v1,tx:'Paina'});n.x=60;n.y=400;var nn=KK.addNode(P,n.id,400,60);
 KK.repair(P);KK.tick(P,APP.ctx());APP.renderAll();return {m:m.id,mn:mn.id,k:k.id,kn:kn.id,w:w.id,wn:wn.id,nn:nn.id,v1:v1,mvt:m.vt};})()"""
UIB="Object.values(P.b).filter(b=>K(b)).map(b=>b.id)"
async def klik(pg,nid,shift=False):
    c=await keskus(pg,'#lworld [data-nid="%s"]'%nid)
    if shift: await pg.keyboard.down('Shift')
    await pg.mouse.click(c[0],c[1])
    if shift: await pg.keyboard.up('Shift')
    await pg.wait_for_timeout(120)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in ((int(os.environ['VAIN']),) if os.environ.get('VAIN') else (1440,1280,390)):
            mob=W<500;H=844 if mob else 900
            ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Näkymään');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(150)
            n0=await P(pg,"Object.keys(P.b).length")
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(200)
            if mob:
                # Puhelimella vain savutesti: paneelin nappi ja kupla eivät hajoa.
                await klik(pg,I['mn']);await pg.evaluate("document.body.classList.add('inspopen')");await pg.wait_for_timeout(150)
                await pg.click('#insp [data-tnv]');await pg.wait_for_timeout(200)
                r=await P(pg,"Object.values(P.b).filter(b=>b.nm==='Unipisteet · näyttö').map(b=>[b.k,b.tx,b.v])")
                assert r==[['muoto','{#%s}'%I['m'],I['v1']]],r
                print(W,'errs',errs);assert not errs;await ctx.close();continue
            # 1) Paneelin nappi: Laatikko näkymään v1, logiikkaan jäädään
            await klik(pg,I['mn'])
            assert await pg.locator('#insp [data-tnv]').count()==1,'nappi paneelissa'
            await pg.click('#insp [data-tnv]');await pg.wait_for_timeout(150)
            assert await pg.locator('.tnvb.show').count()==1,'välähdyskupla'
            kt=await pg.locator('.tnvb').inner_text();assert 'Unipisteet · näyttö' in kt,kt
            r=await P(pg,"(function(){var b=B('Unipisteet · näyttö');return {k:b.k,laji:b.laji,tx:b.tx,v:b.v,vt:b.vt,x:b.x,y:b.y,txt:E().text(b.id),tab:APP.S.tab,ln:P.lg.n.filter(n=>n.p===b.id).length};})()")
            print(W,r)
            assert r['k']=='muoto' and r['laji']=='laatikko' and r['tx']=='{#%s}'%I['m'] and r['v']==I['v1'],r
            assert r['vt']==I['mvt']+'_n' and r['txt']=='7' and r['tab']=='logiikka' and r['ln']==0,r
            ref=await P(pg,"(function(){var o=Object.values(P.b).filter(b=>b.v==='%s'&&b.nm.indexOf('näyttö')<0&&b.k!=='merkki'&&b.k!=='alue');return [Math.min.apply(0,o.map(b=>b.x)),Math.max.apply(0,o.map(b=>b.y+b.h))];})()"%I['v1'])
            assert r['x']==ref[0] and ref[1]+10<=r['y']<=ref[1]+30,'vasempaan reunaan alimman alle %s %s'%(r,ref)
            # 2) Toinen kerta: viite yksilöllinen; ⌘Z kumoaa yhdellä
            await klik(pg,I['mn']);await pg.click('#insp [data-tnv]');await pg.wait_for_timeout(150)
            r2=await P(pg,"Object.values(P.b).filter(b=>b.nm.indexOf('Unipisteet · näyttö')===0).map(b=>b.vt)")
            assert len(r2)==2 and len(set(r2))==2,r2
            await pg.keyboard.press('Control+z');await pg.wait_for_timeout(150)
            assert await P(pg,"Object.keys(P.b).length")==n0+1,'⌘Z poisti vain toisen'
            # 3) ▾: luvulle Monitori, ei Ilmoitusta; Arvolle (teksti) vain laatikko ja teksti
            await klik(pg,I['mn']);await pg.click('#insp [data-tnvm]');await pg.wait_for_timeout(120)
            opts=await pg.locator('#menu button').all_inner_texts();print(W,opts)
            assert opts==['Laatikko tekstillä','Pelkkä teksti','Monitori','Lukukenttä, joka asettaa tämän','Säädin, joka asettaa tämän'],opts  # jonon 12e: Muistille myös kentät
            await pg.locator('#menu button',has_text='Monitori').click();await pg.wait_for_timeout(150)
            r=await P(pg,"(function(){var b=Object.values(P.b).filter(b=>b.k==='mittari')[0];return {nm:b.nm,tx:b.tx};})()")
            print(W,r)
            assert r['nm'].startswith('Unipisteet · näyttö') and r['tx']=='Unipisteet',r
            assert await P(pg,"P.lg.l.some(l=>{var t=KK.nodeOf(P,l.t),f=KK.nodeOf(P,l.f);return t&&P.b[t.p].k==='mittari'&&f.p==='%s'&&l.tp==='o_arvo';})"%I['m']),'nuoli kohtaan arvo'
            await klik(pg,I['kn']);await pg.click('#insp [data-tnvm]');await pg.wait_for_timeout(120)
            opts=await pg.locator('#menu button').all_inner_texts()
            assert opts==['Laatikko tekstillä','Pelkkä teksti','Ilmoitus, joka näkyy kun tämä pätee'],opts
            await pg.locator('#menu button',has_text='Ilmoitus').click();await pg.wait_for_timeout(150)
            r=await P(pg,"(function(){var b=Object.values(P.b).filter(b=>b.k==='ilmo')[0];return {nk:b.nk};})()")
            assert r['nk']=={'m':'kun','r':I['k']},r
            await klik(pg,I['wn']);await pg.click('#insp [data-tnvm]');await pg.wait_for_timeout(120)
            opts=await pg.locator('#menu button').all_inner_texts();assert opts==['Laatikko tekstillä','Pelkkä teksti'],opts
            await pg.locator('#menu button',has_text='Pelkkä teksti').click();await pg.wait_for_timeout(150)
            assert await P(pg,"B('Tervehdys · näyttö').k")=='nayta'
            # 4) Näkymäpalikan logiikkasolmussa ei nappia
            await klik(pg,I['nn']);assert await pg.locator('#insp [data-tnv]').count()==0,'ei näkymäpalikalle'
            # 5) Viimeksi auki ollut näkymä (laite) + monivalinta + pikanäppäin N
            await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(150)
            await pg.click('button.vt[data-vw="v9"]');await pg.wait_for_timeout(150)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(200)
            await klik(pg,I['wn']);await klik(pg,I['mn'],True);await klik(pg,I['kn'],True)
            assert await pg.locator('#insp [data-tnv]').count()==1,'monivalinnan nappi'
            await pg.mouse.move(5,H-5);await pg.keyboard.press('n');await pg.wait_for_timeout(200)
            r=await P(pg,"Object.values(P.b).filter(b=>b.v==='v9').sort((a,b)=>a.y-b.y).map(b=>[b.nm,b.x,b.y,b.h])")
            print(W,r)
            assert len(r)==3,r
            assert r[0][0].startswith('Tervehdys') and r[1][0].startswith('Unipisteet') and r[2][0].startswith('Hyvä uni'),'valintajärjestys'
            assert all(x[1]==20 for x in r) and r[0][2]==20,r
            assert r[1][2]>=r[0][2]+r[0][3]+10 and r[2][2]>=r[1][2]+r[1][3]+10,'allekkain ilman päällekkäisyyttä %s'%r
            assert await P(pg,"APP.S.tab")=='logiikka'
            # 6) Kuplan napautus vie palikan kohdalle näkymään
            await pg.keyboard.press('Escape');await klik(pg,I['mn']);await pg.click('#insp [data-tnv]');await pg.wait_for_timeout(100)
            await pg.click('.tnvb');await pg.wait_for_timeout(250)
            r=await P(pg,"{tab:APP.S.tab,sel:APP.S.sel&&P.b[APP.S.sel.id].nm,vw:APP.S.vw}")
            assert r['tab']=='nakyma' and r['sel'].startswith('Unipisteet · näyttö') and r['vw']=='v9',r
            await pg.screenshot(path='tee_nakymaan_%d.png'%W)
            print(W,'errs',errs);assert not errs
            await ctx.close()
        await b.close()
asyncio.run(main())
