# Vienti ja tuonti: animaatiotiedosto (JSON) latauksena (testiselaimessa ei ole jakovalikkoa, joten tulee Lataa-nappi),
# sprite sheet 100 % ja 50 % (PNG:n koko = ruututiedot, ruutujen pikselit oikeissa kohdissa, läpinäkyvä tausta),
# rajaus osien alueeseen, teksti varalla, tuonti tiedostosta ja tekstinä (kuvat, liike ja kiinnitykset palaavat),
# virheellinen tiedosto, uudelleenlataus (kuvat selaimen tietokannasta). iPad 1024 kosketuksella ja 1280 hiirellä.
import asyncio, os, json, base64
from playwright.async_api import async_playwright
from yhteinen import *
async def rakenna(pg):
    await uusi(pg,'Heiluri')
    await lisaa(pg,svg('#c33',40,40),'Pallo')
    await pg.evaluate("""(()=>{var P=APP.P,o=P.osat[0];o.perus={x:100,y:100,kulma:0,koko:1};o.kp=[20,20];o.tas=0;P.lava={w:200,h:200,tausta:'valkoinen'};
      P.ruutuja=24;var a=[];for(var f=0;f<24;f++)a.push(f<12?[60+f*5,100,0,1]:null);P.liike[o.id]=a;APP.muuttui();APP.S.nak.sovita=true;APP.renderAll();APP.tallennaNyt();})()""")
async def lataus(pg,T,sel):
    async with pg.expect_download() as dl:
        if T:await T.napauta(sel)
        else:await pg.click(sel)
    d=await dl.value;pth=await d.path();return d.suggested_filename,open(pth,'rb').read()
async def main():
    async with async_playwright() as p:
        for W,H,touch in ((1024,768,True),(1280,800,False)):
            b,ctx,pg,errs=await avaa(p,W,H,touch=touch);T=await Kosketus.luo(pg) if touch else None
            async def klik(sel):
                if T:await T.napauta(sel)
                else:await pg.click(sel)
                await pg.wait_for_timeout(60)
            await rakenna(pg);await pg.wait_for_function("Object.values(APP.IM).every(i=>i.naturalWidth>0)")
            # Animaatiotiedosto
            await klik('#viebtn');await klik('#sheet [data-x="vjson"]')
            assert 'Lataa' in await pg.inner_text('#vtulos'),'ei jakovalikkoa testiselaimessa → Lataa'
            nimi,data=await lataus(pg,T,'#vtulos [data-x="jaa"]');o=json.loads(data);print(W,nimi,len(data))
            assert nimi=='Heiluri.animappi.json' and o['muoto']=='animappi' and o['ruutuja']==24 and len(o['laatikot'][o['osat'][0]['id']]['x'])==24
            kuva=list(o['kuvat'].values())[0];assert kuva['data'].startswith('<svg') and kuva['w']==40,'kuva mukana SVG-tekstinä'
            assert o['liike'][o['osat'][0]['id']]['x'][11]==115 and o['liike'][o['osat'][0]['id']]['x'][20]==115,'liike täytetty'
            # Sprite sheet 100 %, koko lava
            await pg.click('#sheet [data-vs="mk"][data-v="1"]') if not T else await T.napauta('#sheet [data-vs="mk"][data-v="1"]')
            await klik('#sheet [data-x="varkki"]');await pg.wait_for_selector('#vtulos .vrow')
            lad=[];pg.on('download',lambda d:lad.append(d))
            if T:await T.napauta('#vtulos [data-x="jaa"]')
            else:await pg.click('#vtulos [data-x="jaa"]')
            for _ in range(40):
                if len(lad)>=2:break
                await pg.wait_for_timeout(100)
            tied={}
            for d in lad:tied[d.suggested_filename]=open(await d.path(),'rb').read()
            print(W,sorted(tied))
            info=json.loads(tied['Heiluri-sprite.json']);png=tied['Heiluri-sprite.png']
            import struct;pw,ph=struct.unpack('>II',png[16:24]);print(W,'arkki',pw,ph,info['sarakkeet'],info['rivit'])
            assert info['muoto']=='animappi-sprite' and info['ruutuja']==24 and info['ruutu']=={'w':200,'h':200} and [pw,ph]==[info['koko']['w'],info['koko']['h']]
            assert info['sarakkeet']*info['rivit']>=24 and info['kuva']=='Heiluri-sprite.png'
            # Pikselit: ruudussa 5 pallon keskipiste x = 60+25 = 85, y = 100; tausta läpinäkyvä
            u='data:image/png;base64,'+base64.b64encode(png).decode()
            px=await pg.evaluate("""([u,info])=>new Promise(r=>{var im=new Image();im.onload=()=>{var c=document.createElement('canvas');c.width=im.width;c.height=im.height;var g=c.getContext('2d');g.drawImage(im,0,0);
              function p(f,x,y){var q=info.ruudut[f];return Array.from(g.getImageData(q.x+x,q.y+y,1,1).data);}r({pallo5:p(5,85,100),tyhja5:p(5,140,100),pallo20:p(20,115,100),ohi20:p(20,85,100)});};im.src=u;})""",[u,info])
            print(W,'pikselit',px)
            assert px['pallo5'][0]>200 and px['pallo5'][3]==255 and px['tyhja5'][3]==0 and px['pallo20'][3]==255 and px['ohi20'][3]==0,'ruudut oikein, tausta läpinäkyvä'
            # 50 % ja rajaus osien alueeseen
            await (T.napauta('#sheet [data-vs="mk"][data-v="0.5"]') if T else pg.click('#sheet [data-vs="mk"][data-v="0.5"]'))
            await (T.napauta('#sheet [data-vs="raj"][data-v="liike"]') if T else pg.click('#sheet [data-vs="raj"][data-v="liike"]'))
            info2=await pg.evaluate("APP.teeArkki(0.5,'liike').then(r=>r.files[1].blob.text()).then(JSON.parse)")
            print(W,'rajattu',info2['ruutu'],info2['rajaus'])
            assert info2['rajaus']['w']<=200 and info2['rajaus']['x']>=30 and info2['ruutu']['w']==round(info2['rajaus']['w']*0.5),'rajaus ja 50 %'
            # Teksti varalla
            await klik('#sheet [data-x="vteksti"]');tx=await pg.input_value('#vtext');assert json.loads(tx)['muoto']=='animappi','teksti'
            await klik('#sheet [data-x="close"]')
            # Tuonti tiedostosta: uusi animaatio, samat ruudut
            pth=os.path.join(os.getcwd(),'tuonti_%d.animappi.json'%W);open(pth,'wb').write(data)
            await klik('#projbtn')
            async with pg.expect_file_chooser() as fc:
                if T:await T.napauta('#sheet [data-x="import"]')
                else:await pg.click('#sheet [data-x="import"]')
            await (await fc.value).set_files(pth);await pg.wait_for_timeout(400)
            r=await P(pg,"[APP.Dt.projektit.length,P.nimi,P.ruutuja,P.osat.length,S.tila,P.liike[P.osat[0].id][11][0]]");print(W,'tuonti',r)
            assert r==[2,'Heiluri',24,1,'animoi',115],'tuotu uutena animaationa'
            await pg.wait_for_function("APP.IM[APP.P.osat[0].kuva]&&APP.IM[APP.P.osat[0].kuva].naturalWidth>0")
            # Tuonti tekstinä ja virheellinen teksti
            await klik('#projbtn');await pg.fill('#imptext','{"muoto":"jotain"}');await klik('#sheet [data-x="importtext"]')
            assert 'ei ole Animappin' in await pg.inner_text('#toast') and await P(pg,"APP.Dt.projektit.length")==2,'virheellinen teksti'
            await pg.fill('#imptext',data.decode('utf8'));await klik('#sheet [data-x="importtext"]');assert await P(pg,"APP.Dt.projektit.length")==3,'tekstinä'
            # Uudelleenlataus: kuvat selaimen tietokannasta
            await pg.evaluate("APP.tallennaNyt()");await pg.reload();await pg.wait_for_timeout(400)
            await pg.wait_for_function("APP.S.kuvatLadattu&&Object.values(APP.IM).length>=3&&Object.values(APP.IM).every(i=>i.naturalWidth>0)")
            assert await P(pg,"[APP.Dt.projektit.length,P.ruutuja]")==[3,24]
            # Poisto ja käyttämättömien kuvien siivous seuraavalla avauksella
            pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
            await klik('#projbtn');await klik('#sheet [data-x="delete"]');await pg.wait_for_timeout(200);assert await P(pg,"APP.Dt.projektit.length")==2,'poisto'
            await pg.reload();await pg.wait_for_timeout(400);await pg.wait_for_function("APP.S.kuvatLadattu")
            n=await pg.evaluate("new Promise(r=>{var q=indexedDB.open('animappi',1);q.onsuccess=()=>{var c=q.result.transaction('kuvat').objectStore('kuvat').count();c.onsuccess=()=>r(c.result);};})")
            assert n==2,'poistetun animaation kuva siivottu tietokannasta (%d)'%n
            assert errs==[],errs
            await b.close()
    print('ok')
asyncio.run(main())
