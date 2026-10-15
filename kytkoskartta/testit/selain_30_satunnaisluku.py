# Versio 8: Satunnaisluku selaimessa. Palikka paletista (arvottu heti), viite noppa, ⚂ Arvo nyt, tasainen → muotoiltu,
# jakaumaikkuna: painojen määrä, valmis muoto, pisteen veto hiirellä ylös ja alas, paino kirjoittamalla, todennäköisyydet
# ja koeheitto, Valmis; nuoli kaavasta painoon (valikko Mihin kohtaan?) → paino lukittu 🔒, veto estetty; nuoli painikkeesta
# kohtaan arvo uudelleen ja painallus lukitussa näkymässä arpoo, teksti {noppa} näyttää luvun; tallennus ja uudelleenavaus;
# Kumoa jakaumaikkunassa; toiminto Arvo uudelleen paneelista. Kuvat versio8_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v=P.views[0].id;
 var btn=KK.addBlock(P,'nappi',{beh:'kerta',tx:'Heitä',nm:'Heitä',v:v});btn.x=80;btn.y=80;
 var tx=KK.addBlock(P,'nayta',{tx:'Tulos',nm:'Tulos',v:v});tx.x=80;tx.y=160;
 var kv=KK.addBlock(P,'kaava',{f:'5 * 10'});KK.addNode(P,kv.id,40,420);
 KK.addNode(P,btn.id,40,60);APP.renderAll();return [btn.id,tx.id,kv.id];})()"""
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Noppapeli');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            bid,tid,kid=await pg.evaluate(SETUP)
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            # --- paletista ---
            l=pg.locator('#pal .chip[data-make*=\'"k":"satu"\']').first;await l.scroll_into_view_if_needed();c0=await l.bounding_box()
            st=await pg.locator('#lvp').bounding_box()
            await veda(pg,[c0['x']+c0['width']/2,c0['y']+c0['height']/2],[st['x']+st['width']*0.5,st['y']+180]);await pg.wait_for_timeout(200)
            sid=await P(pg,"Object.values(P.b).find(b=>b.k==='satu').id");sn=await P(pg,"P.lg.n.find(n=>P.b[n.p].k==='satu').id")
            v0=await P(pg,"E().val('%s')"%sid);print(W,'1 arvottu heti:',v0);assert v0 in (1,2,3,4,5,6)
            chip=await pg.inner_text('#lworld [data-nid="%s"] .lv'%sn);lab=await pg.inner_text('#lworld [data-nid="%s"] .lt'%sn);print(W,'  palikka:',lab,chip);assert '1–6' in lab and chip.strip()==str(v0)
            hint=await pg.get_attribute('#pal .chip[data-make*=\'"k":"satu"\']','title');assert 'Arpoo kokonaisluvun' in hint
            # --- viite ja arvonta paneelista ---
            await pg.fill('#insp input[data-k="vt"]','noppa');await pg.wait_for_timeout(100)
            seen=set()
            for i in range(25):
                await pg.click('#insp [data-do="saturoll"]');await pg.wait_for_timeout(20)
                seen.add(await P(pg,"E().val('%s')"%sid))
            print(W,'2 arvo nyt:',sorted(seen));assert seen<= {1,2,3,4,5,6} and len(seen)>=3
            now=await pg.inner_text('#insp .sdnow b');assert now.strip()==str(await P(pg,"E().val('%s')"%sid))
            ins=await pg.inner_text('#insp');assert 'noppa.min' in ins and 'Arvo uudelleen' in ins
            # --- muotoiltu ja jakaumaikkuna ---
            await pg.click('#insp [data-seg="jak"][data-v="muoto"]');await pg.wait_for_timeout(150)
            assert await pg.locator('#insp button.sdbox svg').count()==1
            assert await pg.locator('#lworld [data-nid="%s"] svg.sdmn'%sn).count()==1
            await pg.click('#insp .ibs [data-do="satued"]');await pg.wait_for_timeout(200)
            assert await pg.locator('#sheetbg.show #sdroot').count()==1
            await pg.click('#sheet [data-sdn="6"]');await pg.wait_for_timeout(120)
            pts=await pg.locator('#sdg circle.sdp').count();print(W,'3 pisteitä:',pts);assert pts==6
            await pg.click('#sheet [data-sdp="nousee"]');await pg.wait_for_timeout(120)
            pw=await P(pg,"P.b['%s'].pw"%sid);print(W,'4 nousee:',pw);assert pw==[10,28,46,64,82,100]
            # veto: p1 pohjaan, p4 ylös
            g=await pg.locator('#sdg').bounding_box()
            async def pt(i):
                bb=await pg.locator('#sdg circle.sdp[data-sdi="%d"]'%i).bounding_box();return [bb['x']+bb['width']/2,bb['y']+bb['height']/2]
            a=await pt(0);await veda(pg,a,[a[0],g['y']+g['height']-2])
            a=await pt(3);await veda(pg,a,[a[0]+3,g['y']+2])
            pw=await P(pg,"P.b['%s'].pw"%sid);print(W,'5 veto:',pw);assert pw[0]==0 and pw[3]==100 and pw[1]==28
            iv=await pg.input_value('#sheet input[data-sdw="3"]');assert iv=='100'
            # kirjoitus
            await pg.fill('#sheet input[data-sdw="2"]','70');await pg.wait_for_timeout(150)
            pw=await P(pg,"P.b['%s'].pw"%sid);assert pw[2]==70
            sm=await pg.inner_text('#sdsum');print(W,'6 yhteenveto:',sm);assert 'Todennäköisin 4' in sm and 'epätodennäköisin 1 (0 %)' in sm
            pr=await P(pg,"KK.satuDist(KK.satuSpec(P,'%s',APP.ctx())).items.map(i=>Math.round(i.p*1000)/10)"%sid);print(W,'  prosentit:',pr);assert pr[0]==0 and abs(sum(pr)-100)<0.3
            bars=await pg.locator('#sdbw rect.sdbar').count();assert bars==6
            await pg.click('#sheet [data-sd="koe"]');await pg.wait_for_timeout(150)
            ko=await pg.inner_text('#sdkoe');print(W,'7 koeheitto:',ko[:70]);assert 'Koeheitto 1000 kertaa' in ko and await pg.locator('#sdbw line.sdkoe').count()==6
            await pg.screenshot(path='versio8_jakauma_%d.png'%W)
            # Kumoa jakaumaikkunassa palauttaa painon ja ikkuna päivittyy
            await pg.keyboard.press('Control+z');await pg.wait_for_timeout(200)
            pw2=await P(pg,"P.b['%s'].pw"%sid);print(W,'8 kumoa:',pw2);assert pw2[2]==46
            assert (await pg.input_value('#sheet input[data-sdw="2"]'))=='46'
            await pg.click('#sheet [data-x="close"]');await pg.wait_for_timeout(150)
            assert await pg.locator('#sheetbg.show').count()==0
            # --- nuoli kaavasta painoon: valikko ---
            kn=await P(pg,"P.lg.n.find(n=>n.p==='%s').id"%kid)
            a=await pg.locator('#lworld [data-nid="%s"] .pins.o .pt[data-p="v"]'%kn).bounding_box();t=await pg.locator('#lworld [data-nid="%s"] .lb'%sn).bounding_box()
            await veda(pg,[a['x']+a['width']/2,a['y']+a['height']/2],[t['x']+t['width']/2,t['y']+t['height']/2])
            items=await pg.locator('#menu button').all_inner_texts()
            print(W,'9 valikko:',items);assert 'paino 6' in items and 'pienin' in items and 'suurin' in items
            await pg.locator('#menu').get_by_text('paino 6',exact=True).click();await pg.wait_for_timeout(200)
            ok=await P(pg,"P.lg.l.some(l=>l.tp==='p6')");assert ok
            sp=await P(pg,"KK.satuSpec(P,'%s',APP.ctx())"%sid);print(W,'10 lukittu:',sp['w'],sp['lk']);assert sp['w'][5]==50 and sp['lk'][5]
            pin=await pg.locator('#lworld [data-nid="%s"] .pins.i .pt[data-p="p6"]'%sn).count();assert pin==1
            await pg.click('#lworld [data-nid="%s"] .lb'%sn);await pg.wait_for_timeout(150)
            await pg.click('#insp .ibs [data-do="satued"]');await pg.wait_for_timeout(200)
            assert await pg.locator('#sheet input[data-sdw="5"]').is_disabled()
            assert '🔒' in await pg.inner_text('#sheet .sdins')
            a=await pt(5);await veda(pg,a,[a[0],a[1]+40])
            ts=await pg.inner_text('#toast');print(W,'11 veto estetty:',ts);assert 'nuolesta' in ts
            assert (await P(pg,"KK.satuSpec(P,'%s',APP.ctx()).w[5]"%sid))==50
            await pg.click('#sheet [data-x="close"]');await pg.wait_for_timeout(120)
            # --- painike → arvo uudelleen, teksti näyttää luvun ---
            bn=await P(pg,"P.lg.n.find(n=>n.p==='%s').id"%bid)
            a=await pg.locator('#lworld [data-nid="%s"] .pins.o .pt[data-p="e"]'%bn).bounding_box();t=await pg.locator('#lworld [data-nid="%s"] .pins.i .pt[data-p="e"]'%sn).bounding_box()
            await veda(pg,[a['x']+a['width']/2,a['y']+a['height']/2],[t['x']+t['width']/2,t['y']+t['height']/2])
            ok=await P(pg,"P.lg.l.some(l=>l.f==='%s'&&l.tp==='e'&&l.t==='%s')"%(bn,sn));print(W,'12 nuoli painikkeesta:',ok);assert ok
            await pg.evaluate("(function(){var b=APP.P.b['%s'];b.tx='Noppa: {#%s}';APP.renderAll();})()"%(tid,sid))
            await pg.click('#tabs [data-t="nakyma"]');await pg.wait_for_timeout(200);await pg.click('#lockbtn');await pg.wait_for_timeout(150)
            vals=set()
            for i in range(15):
                await pg.click('.ue[data-id="%s"] [data-act="press"]'%bid);await pg.wait_for_timeout(30)
                v=await P(pg,"E().val('%s')"%sid);vals.add(v)
                tt=await pg.inner_text('.ue[data-id="%s"]'%tid);assert tt.strip()=='Noppa: %d'%v,tt
            print(W,'13 painallukset:',sorted(vals));assert vals<= {1,2,3,4,5,6} and len(vals)>=2
            await pg.screenshot(path='versio8_kaytto_%d.png'%W)
            await pg.click('#lockbtn');await pg.wait_for_timeout(150)
            # --- tallennus ja uudelleenavaus ---
            await pg.wait_for_timeout(400)
            before=await P(pg,"[P.b['%s'].pw,E().val('%s'),P.b['%s'].vt,P.b['%s'].jak]"%(sid,sid,sid,sid))
            await pg.reload();await pg.wait_for_timeout(400)
            after=await P(pg,"[P.b['%s'].pw,E().val('%s'),P.b['%s'].vt,P.b['%s'].jak]"%(sid,sid,sid,sid));print(W,'14 tallennus:',before,after);assert before==after
            # --- toiminto Arvo uudelleen paletista ja paneelista ---
            await pg.click('#tabs [data-t="logiikka"]');await pg.wait_for_timeout(250)
            l=pg.locator('#pal .chip[data-make*=\'"do":"arvonta"\']').first;await l.scroll_into_view_if_needed();c0=await l.bounding_box();st=await pg.locator('#lvp').bounding_box()
            await veda(pg,[c0['x']+c0['width']/2,c0['y']+c0['height']/2],[st['x']+st['width']*0.5,st['y']+st['height']-120]);await pg.wait_for_timeout(200)
            opts=await pg.locator('#insp select[data-k="o"] option').all_inner_texts();print(W,'15 kohteet:',opts);assert 'Satunnaisluku' in opts and 'Heitä' not in opts
            await pg.select_option('#insp select[data-k="o"]',sid);await pg.wait_for_timeout(120)
            lab=await P(pg,"KK.descAct(P,Object.values(P.b).find(b=>b.k==='tee'&&b.do==='arvonta').id)");assert lab=='Arvo uudelleen: Satunnaisluku'
            ins=await pg.inner_text('#insp');assert 'Arpoo satunnaisluvulle uuden luvun' in ins
            print(W,'errs',errs);assert not errs
            await b.close()
asyncio.run(main())
