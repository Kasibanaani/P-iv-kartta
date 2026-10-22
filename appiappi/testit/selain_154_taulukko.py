# Jono 42g selaimessa: paletin Taulukko (Näyttö) tekee Listan sarakkeilla. Otsikkorivi, solun muokkaus (luku), virheellinen arvo
# ilmoituksena, painike-sarake laukaisee tapahtuman, pystyviivat, paneelin sarakkeet (lisäys, siirto, poisto), lähteeksi
# Tietotaulukko (rasti kirjoittaa taulukkoon). Vanha Lista näyttää ennallaan (ei otsikkoriviä). 1440 ja 1280.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
async def main():
    async with async_playwright() as p:
        for W in (1440,1280):
            b,pg,errs=await avaa(p,W,900)
            await pg.fill('#wname','Taulukko');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            n0=await P(pg,"Object.keys(P.b).length")
            st=await keskus(pg,'#stage');await paletti(pg,'Taulukko',st[0],st[1]);await pg.wait_for_timeout(250)
            tid=await P(pg,"Object.values(P.b).filter(function(x){return x.k==='lista'&&x.sar;}).map(function(x){return x.id;})[0]")
            assert tid,'taulukko syntyi';L='#uels .ue[data-id="%s"]'%tid
            hd=await pg.evaluate("(s)=>Array.from(document.querySelectorAll(s+' .tgrid .th .td')).map(e=>e.textContent)",L);print(W,'otsikot:',hd);assert hd[:2]==['Nimi','Määrä'],hd
            # paneeli: pystyviivat ja painike
            await pg.click('#insp [data-lsdo="add:painike"]');await pg.wait_for_timeout(200)
            await pg.click('#insp input[data-k="pvv"]');await pg.wait_for_timeout(200)
            r=await P(pg,"[P.b[%r].sar.map(function(c){return c.laji;}),P.b[%r].pvv,KK.ports(P.b[%r]).outs.map(function(o){return o.p;})]"%(tid,tid,tid));print(W,'sarakkeet:',r);assert r[0]==['teksti','luku','painike'] and r[1]==True and 'pain' in r[2],r
            # siirto vasemmalle ja poisto + kumoa
            pid=await P(pg,"P.b[%r].sar[2].id"%tid);await pg.click('#insp [data-lsdo="up:%s"]'%pid);await pg.wait_for_timeout(200)
            r=await P(pg,"P.b[%r].sar.map(function(c){return c.laji;})"%tid);assert r==['teksti','painike','luku'],r
            await pg.click('#insp [data-lsdo="dn:%s"]'%pid);await pg.wait_for_timeout(200)
            # käyttöön: rivi, solu, painike
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            await pg.fill(L+' .ladd','Omena');await pg.press(L+' .ladd','Enter');await pg.wait_for_timeout(250)
            rid=await P(pg,"KK.listRows(P,%r)[0].id"%tid);c2=await P(pg,"P.b[%r].sar[1].id"%tid)
            await pg.click(L+' [data-row="%s"] [data-col="%s"]'%(rid,c2));await pg.wait_for_timeout(150);await pg.keyboard.type('3,5');await pg.keyboard.press('Enter');await pg.wait_for_timeout(250)
            r=await P(pg,"[KK.listRows(P,%r)[0].s,APP.ev().prop(%r,'rivi1.määrä')]"%(tid,tid));print(W,'solu:',r);assert r[1]==3.5,r
            txt=await pg.evaluate("(a)=>document.querySelector(a[0]+' [data-row=\"'+a[1]+'\"] [data-col=\"'+a[2]+'\"]').textContent",[L,rid,c2]);assert txt=='3,5' or txt=='3.5',txt
            await pg.click(L+' [data-row="%s"] [data-col="%s"]'%(rid,c2));await pg.wait_for_timeout(150);await pg.keyboard.press('Control+A');await pg.keyboard.type('paljon');await pg.keyboard.press('Enter');await pg.wait_for_timeout(250)
            r=await P(pg,"APP.ev().prop(%r,'rivi1.määrä')"%tid);t=await pg.evaluate("()=>{var e=document.querySelector('#toast');return e?e.textContent:'';}");print(W,'virhe:',r,t);assert r==3.5 and 'ei ole luku' in t,(r,t)
            await pg.keyboard.press('Escape');await pg.wait_for_timeout(150)
            # painike laukaisee tapahtuman (tapahtuma.uusi = rivin teksti)
            await pg.evaluate("(id)=>{var P=APP.P,m=KK.addBlock(P,'muisti',{v:''});KK.setName(P,m.id,'Valittu');KK.addNode(P,m.id,0,600);var tp=KK.addBlock(P,'tapaht');KK.addNode(P,tp.id,0,700);var t=KK.addBlock(P,'tee',{do:'aseta',o:m.id,v:'{#'+tp.id+'.uusi}'});var tn=KK.addNode(P,t.id,200,600);KK.addLink(P,KK.nodesOfBlock(P,id)[0]?KK.nodesOfBlock(P,id)[0].id:KK.addNode(P,id,400,400).id,'pain',tn.id,'e');KK.repair(P);APP.renderAll();}",tid);await pg.wait_for_timeout(200)
            await pg.click(L+' [data-row="%s"] .tcb'%rid);await pg.wait_for_timeout(250)
            r=await P(pg,"APP.ev().val(B('Valittu').id)");print(W,'painike:',r);assert r=='Omena',r
            # pystyviivat näkyvät
            bl=await pg.evaluate("(s)=>{var e=document.querySelectorAll(s+' .tgrid .tr[data-row] .td')[1];return getComputedStyle(e).borderLeftWidth;}",L);assert bl!='0px',bl
            # lähteeksi Tietotaulukko: rasti kirjoittaa taulukkoon
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            tt=await pg.evaluate("()=>{var P=APP.P,t=KK.addBlock(P,'taulu',{});KK.setName(P,t.id,'Ostokset');var a=KK.addCol(t,'Tuote','teksti'),k=KK.addCol(t,'Ostettu','kylla');t.rv=[{id:'r1',a:{}}];t.rv[0].a[a.id]='Kahvi';KK.addNode(P,t.id,0,800);KK.repair(P);APP.renderAll();return t.id;}")
            await pg.click(L);await pg.wait_for_timeout(200);await pg.select_option('#insp [data-lsl]','t:'+tt);await pg.wait_for_timeout(250)
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            hd=await pg.evaluate("(s)=>Array.from(document.querySelectorAll(s+' .tgrid .tr[data-row] .td')).map(e=>e.textContent)",L);print(W,'taulukosta:',hd);assert 'Kahvi' in hd,hd
            # omat sarakkeet säilyvät: Nimi → Tuote (teksti); rasti-sarake lisätään paneelista
            await pg.click('#lockbtn');await pg.wait_for_timeout(300);await pg.click(L);await pg.wait_for_timeout(200)
            await pg.click('#insp [data-lsdo="add:teksti"]');await pg.wait_for_timeout(200)
            nc=await P(pg,"P.b[%r].sar[P.b[%r].sar.length-1].id"%(tid,tid));await pg.select_option('#insp [data-lsc="%s:laji"]'%nc,'rasti');await pg.wait_for_timeout(200)
            r=await P(pg,"P.b[%r].sar.map(function(c){return c.laji+':'+c.lk;})"%tid);print(W,'sarakkeet taulukosta:',r)
            await pg.click('#lockbtn');await pg.wait_for_timeout(300)
            bx=L+' [data-row="r1"] [data-col="%s"]'%nc
            await pg.click(bx);await pg.wait_for_timeout(250)
            r=await P(pg,"[KK.tRow(P,%r,'r1').a,APP.ev().val(%r)]"%(tt,tid));print(W,'taulukon rasti:',r);ok=await P(pg,"KK.tSar(P.b[%r])[1].id"%tt);assert r[0].get(ok)==True and r[0].get('c1')=='Kahvi' and r[1]==1,r
            print(W,'virheet:',errs);assert not errs,errs
            await b.close()
asyncio.run(main())
