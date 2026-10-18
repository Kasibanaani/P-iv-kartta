# Jonon 21 jatko (Appi-appi 84): rakennuslaatikon 2D-hyllyt. Laatat-hylly: Tasoloikkakartta klik klik, sen lajit hyllyyn,
# laji aloittaa tavallisen maalauksen (työkalurivi, laji valittuna) ja maalaa, sama laji lopettaa, Pyyhi pyyhkii.
# Pelaaja: tasoloikka tekee painovoima-Alueen vain kerran, Hyppää-painike hyppää ja lopettaa hypyn nuolilla, välilyönti
# hyppää (peliohjaimen alanappi) ja nuolinäppäin kävelee lukittuna. Vesi ja Tikkaat menevät painovoima-Alueen päälle (z),
# joten niiden painovoima ratkaisee. Lentäjän Liikkeen painovoima 0 %. Tallennusmuoto ei muutu. 1440 ja 1280 px; 390 px
# savutestinä. Ei oikeaa iPhonea.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
async def main():
    async with async_playwright() as p:
        for W in (1440,1280,390):
            H=900 if W>500 else 844
            b,pg,errs=await avaa(p,W,H)
            await pg.fill('#wname','Laatikko 2D');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            ver0=await P(pg,"APP.data.ver||null")
            await pg.evaluate("APP.rl.avaa(true)");await pg.wait_for_timeout(150)
            if W<500:
                n=await pg.evaluate("APP.rl.lisaa('tasoloikka',{x:150,y:200})");assert n>=5,n
                await pg.evaluate("APP.S.rl.hy='laatat';APP.rl.lisaa('laattakartta',{x:200,y:500})");await pg.evaluate("APP.renderAll()");await pg.wait_for_timeout(150)
                assert await pg.locator('#rlbox [data-rllt]').count()==3
                await pg.screenshot(path='laatikko_2d_%d.png'%W)
                print(W,'ok (savutesti)','errs',errs);assert not errs;await b.close();continue
            q=await pg.evaluate("(function(){var r=document.querySelector('#uvp').getBoundingClientRect();return [r.left,r.top];})()")
            # 1 Laatat-hylly: ennen karttaa ohje, klik lisää Tasoloikkakartan, Esc lopettaa lisäämisen
            await pg.locator('#rlbox [data-rlhy="laatat"]').click();await pg.wait_for_timeout(100)
            assert await pg.locator('#rlbox [data-rllt]').count()==0
            assert 'Lisää kartta' in await pg.inner_text('#rlbox')
            await pg.locator('#rlbox [data-rli="tasokartta"]').click()
            await pg.mouse.click(q[0]+300,q[1]+330);await pg.wait_for_timeout(150);await pg.keyboard.press('Escape')
            k=await P(pg,"(function(){var b=Object.values(P.b).filter(x=>x.k==='laatat')[0];return [b.lw,b.lh2,b.w,b.h,b.lj.map(l=>[l.n,l.t,l.kim||0])];})()")
            assert k[:4]==[30,16,960,512] and [l[0] for l in k[4]]==['Seinä','Taso','Pomppu','Koriste'] and k[4][2][2]==150,k
            names=await pg.evaluate("[...document.querySelectorAll('#rlbox [data-rllt]')].map(e=>e.textContent)")
            assert names==['■Seinä','▔Taso','■Pomppu','░Koriste','⌫Pyyhi'],names
            # 2 laji aloittaa maalauksen; napautus maalaa; sama laji lopettaa; Pyyhi pyyhkii
            await pg.locator('#rlbox [data-rllt="2"]').click();await pg.wait_for_timeout(120)
            assert await pg.evaluate("[APP.S.tool,APP.S.ltc]")==['laatat','2']
            assert await pg.locator('#uhint.ltbar').count()==1
            assert await pg.locator('#uhint [data-ltc="2"].on').count()==1
            assert await pg.locator('#rlbox [data-rllt="2"].on').count()==1
            c=await pg.evaluate("(function(){var b=Object.values(APP.P.b).filter(q=>q.k==='laatat')[0],e=document.querySelector('.ue[data-id=\"'+b.id+'\"]').getBoundingClientRect();return [e.left+15.5*e.width/b.lw,e.top+8.5*e.height/b.lh2];})()")
            await pg.mouse.click(c[0],c[1]);await pg.wait_for_timeout(120)
            assert await P(pg,"Object.values(P.b).filter(x=>x.k==='laatat')[0].lrt[8][15]")=='2'
            await pg.keyboard.press('1');await pg.wait_for_timeout(120)  # työkalurivin numero vaihtaa myös hyllyn korostuksen
            assert await pg.locator('#rlbox [data-rllt="1"].on').count()==1
            await pg.locator('#rlbox [data-rllt=""]').click();await pg.wait_for_timeout(100)
            await pg.mouse.click(c[0],c[1]);await pg.wait_for_timeout(120)
            assert await P(pg,"Object.values(P.b).filter(x=>x.k==='laatat')[0].lrt[8][15]")=='.'
            await pg.locator('#rlbox [data-rllt=""]').click();await pg.wait_for_timeout(100)
            assert await pg.evaluate("APP.S.tool")==None and await pg.locator('#uhint.ltbar').count()==0
            await pg.screenshot(path='laatikko_2d_laatat_%d.png'%W)
            # 3 tasoloikka: lattia ja kaksi pelaajaa, painovoima-Alue vain kerran; nuolet painikkeesta Liikkeen hyppyyn
            await pg.evaluate("(function(){var P=APP.P;Object.values(P.b).filter(x=>x.k==='laatat').forEach(b=>KK.removeBlock?KK.removeBlock(P,b.id):delete P.b[b.id]);KK.repair(P);APP.renderAll();})()")
            await pg.evaluate("APP.rl.lisaa('lattia',{x:300,y:600})")
            await pg.evaluate("APP.rl.lisaa('tasoloikka',{x:300,y:400})")
            await pg.evaluate("APP.rl.lisaa('tasoloikka',{x:2600,y:400})")
            r=await P(pg,"(function(){var al=Object.values(P.b).filter(x=>x.k==='alue'&&x.pv!=null),l=Object.values(P.b).filter(x=>x.k==='liike'&&x.nm.indexOf('Pelaaja')==0)[0],n=Object.values(P.b).filter(x=>x.k==='nappi')[0],t=Object.values(P.b).filter(x=>x.k==='tatti')[0];"
                     "return [al.length,al[0].pv,l.ohj,l.tt===t.id,l.hyk,l.ilo,n.beh,n.padn,t.pad,P.lg.l.filter(k=>k.tb===l.id||k.b===l.id||k.to===l.id).length,l.id,Object.values(P.b).filter(x=>x.nm==='Pelaaja')[0].id];})()")
            assert r[0]==1 and r[1]==2000 and r[2]=='tatti' and r[3] and r[4]==160 and r[5]==60 and r[6]=='pida' and r[7]=='alanappi' and r[8]=='vasen',r
            lid,hid=r[10],r[11]
            lk=await P(pg,"P.lg.l.map(k=>JSON.stringify(k)).filter(s=>s.indexOf('hyp')>=0||s.indexOf('hyx')>=0)")
            assert len(lk)==4 and sum('"irti"' in s for s in lk)==2,lk
            # 4 lukittuna: putoaa lattialle, välilyönti hyppää, nuoli oikealle kävelee
            await pg.evaluate("APP.rl.avaa(false)");await pg.click('#lockbtn');await pg.wait_for_timeout(1500)
            st=await pg.evaluate("(I)=>{var E=KK.Ev(APP.P,APP.ctx());return [E.omiNum(I[1],'y',0),E.omiNum(I[1],'x',0),E.val(I[0],'maa')];}",[lid,hid])
            assert st[2] is True,('maassa',st)
            await pg.keyboard.down('Space');ys=[]
            for i in range(12):
                await pg.wait_for_timeout(30);ys.append(await pg.evaluate("(h)=>KK.Ev(APP.P,APP.ctx()).omiNum(h,'y',0)",hid))
            await pg.keyboard.up('Space');await pg.wait_for_timeout(1300)
            assert st[0]-min(ys)>60,('välilyönti hyppäsi',st[0],min(ys))
            await pg.keyboard.down('ArrowRight');await pg.wait_for_timeout(500);await pg.keyboard.up('ArrowRight');await pg.wait_for_timeout(400)
            x2=await pg.evaluate("(h)=>KK.Ev(APP.P,APP.ctx()).omiNum(h,'x',0)",hid)
            assert x2-st[1]>40,('nuoli käveli',st[1],x2)
            await pg.click('#lockbtn');await pg.wait_for_timeout(200)
            # 5 Vesi ja Tikkaat painovoima-Alueen päälle; Painovoima-alue ja Lentäjä
            await pg.evaluate("APP.rl.lisaa('vesi',{x:700,y:500});APP.rl.lisaa('tikkaat',{x:900,y:400});APP.rl.lisaa('painovoima',{x:600,y:1600});APP.rl.lisaa('lentaja',{x:1300,y:300})")
            z=await P(pg,"(function(){var A=n=>Object.values(P.b).filter(x=>x.nm===n)[0];return [A('Painovoima').z,A('Vesi: alue').z,A('Vesi: alue').pv,A('Vesi: alue').ilv,A('Tikkaat: alue').z,A('Tikkaat: alue').pv,A('Vesi').z,"
                     "Object.values(P.b).filter(x=>x.k==='alue'&&x.pv===2000).length,Object.values(P.b).filter(x=>x.k==='liike'&&x.nm==='Lentäjä: liike')[0].pvk,'pinta' in A('Vesi: alue')];})()")
            assert z[1]>z[0] and z[4]>z[0] and z[2]==400 and z[3]==60 and z[5]==0 and z[6]<z[1] and z[7]==2 and z[8]==0 and z[9] is False,z
            # moottori: vesi-alueen keskellä oleva kappale saa veden painovoiman
            g=await pg.evaluate("""(function(){var P=APP.P,v=Object.values(P.b).filter(x=>x.nm==='Vesi: alue')[0],t=KK.addBlock(P,'muoto',{v:v.v});t.w=t.h=20;t.x=v.x+v.w/2-10;t.y=v.y+v.h/2-10;
              var l=KK.addBlock(P,'liike',{o:t.id});KK.addNode(P,l.id,2000,2000);KK.repair(P);APP.renderAll();P.lock=true;APP.runFrames&&APP.runFrames();return [t.id,l.id];})()""")
            await pg.wait_for_timeout(600)
            vy=await pg.evaluate("(I)=>{var E=KK.Ev(APP.P,APP.ctx());return E.omiNum(I[1],'putoamisvauhti',0);}",g)
            assert 0<vy<300,('vedessä vajoaa hitaasti',vy)
            await pg.evaluate("APP.P.lock=false;APP.renderAll()")
            # 6 tallennus säilyy, tallennusmuoto ennallaan, ei rl-kenttiä projektiin
            c1=await P(pg,"[Object.keys(P.b).length,P.lg.n.length,P.lg.l.length]")
            await pg.evaluate("APP.saveNow()");await pg.reload();await pg.wait_for_timeout(400)
            assert await P(pg,"[Object.keys(P.b).length,P.lg.n.length,P.lg.l.length]")==c1
            assert await P(pg,"APP.data.ver||null")==ver0
            assert await P(pg,"Object.keys(P).filter(k=>/^rl/.test(k)).length")==0
            print(W,'ok','errs',errs);assert not errs;await b.close()
asyncio.run(main())
