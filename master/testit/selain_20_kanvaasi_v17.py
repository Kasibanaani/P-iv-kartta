# Versio 17: Ketjut-kanvaasin sivupaneeli. Palikan omat toiminnot lappuna solmussa ja muokattavina paneelissa, Miksi? (sääntö lauseena,
# ✓/✗ sisäkkäin, ikkunan sisältö korostuu kanvaasilla, rivistä siirtyy palikkaan), Käytössä-valinta JOS-ikkunalle ja toiminnolle,
# virheet (jako nollalla ⚠, virhe kulkee eteenpäin oranssina reunana) ja viety appi 390 px. Kuvakaappaukset kanvaasi17_*.png.
import asyncio, os, json
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
def ob(i,t,n,**kw):
    x={'id':'o%d'%i,'t':t,'n':n,'s':'s1','req':[],'suf':[]}
    if t=='choice':x.update(v=1,note='',ex=[],hl=[],beh='toggle',act=[],lact=[])
    if t=='counter':x.update(start=0,min='',max='',show='number',keep=False,unit='')
    if t=='slider':x.update(min=0,max=10,step=1,start=5,lo='',hi='',unit='')
    x.update(kw);return x
objs=[ob(1,'choice','Nappi',act=[{'do':'add','o':'o2','v':1},{'do':'msg','t':'Plus yksi'}]),ob(2,'counter','Pisteet'),ob(3,'slider','Säädin'),ob(4,'counter','Bonus'),
 ob(5,'slider','Nolla',start=0),ob(6,'counter','Tulos')]
KV={'n':[{'id':'n1','k':'w','x':40,'y':40,'g':'','m':'and','j':'jos','w':300,'h':150,'nm':'Iso säädin'},
  {'id':'n2','k':'p','o':'o3','x':60,'y':100,'g':'n1'},{'id':'n3','k':'op','op':'ge','b':8,'x':200,'y':100,'g':'n1'},
  {'id':'n4','k':'a','a':{'do':'add','o':'o4','v':1},'x':420,'y':60,'g':''},
  {'id':'n5','k':'p','o':'o3','x':40,'y':280,'g':''},{'id':'n7','k':'p','o':'o5','x':40,'y':360,'g':''},{'id':'n6','k':'op','op':'div','x':220,'y':300,'g':''},
  {'id':'n8','k':'a','a':{'do':'set','o':'o6','v':0},'x':420,'y':300,'g':''},{'id':'n9','k':'p','o':'o1','x':40,'y':460,'g':''}],
 'l':[{'id':'l1','f':'n2','fp':'v','t':'n3','tp':'a'},{'id':'l2','f':'n1','fp':'e','t':'n4','tp':'e'},{'id':'l3','f':'n5','fp':'v','t':'n6','tp':'a'},
  {'id':'l4','f':'n7','fp':'v','t':'n6','tp':'b'},{'id':'l5','f':'n6','fp':'v','t':'n8','tp':'v'},{'id':'l6','f':'n9','fp':'act','t':'n8','tp':'e'}],'seq':12}
PK={'app':'master','projekti':{'name':'V17','screens':[{'id':'s1','n':'Peli'}],'objs':objs,'cfg':{'days':False,'vis':'lukitutpois','tint':'sininen'},'state':{'sel':[],'vals':{}},'seq':6,'sseq':1,'kv':KV}}
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); errs=[]
        for W in (1440,1280):
            ctx=await b.new_context(reduced_motion='reduce',viewport={'width':W,'height':900})
            pg=await ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
            await pg.goto(U); await pg.wait_for_timeout(300)
            print('==== master %d ===='%W)
            await pg.fill('#mempty input','x'); await pg.click('#mempty .mb:text-is("Luo projekti")'); await pg.wait_for_timeout(200)
            await pg.click('#mtabs [data-v="proj"]'); await pg.fill('#v-proj textarea',json.dumps(PK,ensure_ascii=False)); await pg.click('text=Tuo uutena projektina'); await pg.wait_for_timeout(300)
            async def P(js): return json.loads(await pg.evaluate("(function(){var P=MASTER.data.projects.filter(x=>x.name==='V17')[0];function O(n){return P.objs.filter(o=>o.n===n)[0];}var KV=P.kv||{n:[],l:[]};function N(id){return KV.n.filter(x=>x.id===id)[0];}return JSON.stringify("+js+");})()"))
            await pg.click('#mtabs [data-v="ketjut"]'); await pg.wait_for_timeout(300)
            await pg.click('.kvbar .mb:text-is("Sovita")'); await pg.wait_for_timeout(150)
            S='#kv-world .kvn[data-nid="%s"]'
            # 1 omat toiminnot lappuna
            chip=await pg.inner_text((S%'n9')+' .kvownb');print('1 omat toiminnot solmussa:',chip.replace('\n',' | '));assert 'Kun valitaan · 2 toimintoa' in chip and 'Pisteet +1' in chip
            print('   paneeli piilossa ilman valintaa:',await pg.is_hidden('#kv-side'))
            await pg.click((S%'n9')+' .kvownb');await pg.wait_for_timeout(250)
            print('2 paneeli auki:',await pg.is_visible('#kv-side'),'| otsikko:',await pg.inner_text('#kv-side .kvsideh b'),'| toimintorivejä:',await pg.locator('#kv-side .kvown .rule').count())
            await pg.screenshot(path='kanvaasi17_omat_%d.png'%W)
            # poista toinen toiminto paneelista
            await pg.locator('#kv-side .kvown .rule').nth(1).locator('button.x[title="Poista toiminto"]').click();await pg.wait_for_timeout(250)
            n=await P("O('Nappi').act.length");print('3 poisto paneelista tallentui palikkaan:',n,'| lappu:',(await pg.inner_text((S%'n9')+' .kvownh')));assert n==1
            print('   paneeli pysyi auki muokkauksen jälkeen:',await pg.is_visible('#kv-side .kvown'))
            # 4 Miksi: JOS-ikkuna
            await pg.click((S%'n1')+' .kvwn',position={'x':5,'y':5});await pg.wait_for_timeout(250)
            why=await pg.inner_text('#kv-why');print('4 Miksi JOS-ikkunasta:',why.replace('\n',' | '))
            assert 'JOS-ikkuna' in why and 'Säädin' in why
            print('   ikkunan sisältö korostuu (ei totta):',await pg.locator('#kv-world .kvn.why-no').count())
            # 5 Käytössä pois
            await pg.click('#kv-side .kvon input');await pg.wait_for_timeout(250)
            off=await P("N('n1').off");print('5 JOS-ikkuna pois käytöstä:',off,'| luokka:',await pg.locator((S%'n1')+'.off').count());assert off==True
            await pg.click('#kv-side .kvon input');await pg.wait_for_timeout(250)
            print('   takaisin käyttöön:',await P("'off' in N('n1')"))
            # 6 virhe: jako nollalla
            v=await pg.inner_text((S%'n6')+' .kvval');cls=await pg.get_attribute(S%'n6','class');down=await pg.get_attribute(S%'n8','class')
            print('6 jako nollalla:',v,'| virhe:', 'kverr' in cls,'| eteenpäin:', 'kverrd' in down);assert v=='⚠' and 'kverr' in cls and 'kverrd' in down
            await pg.click('#kv-side .kvsx');await pg.wait_for_timeout(150)
            await pg.click((S%'n6')+' .kvopw');await pg.wait_for_timeout(200)
            print('   Miksi laskusta:',(await pg.inner_text('#kv-why')).replace('\n',' | '))
            # 7 rivistä palikkaan
            await pg.locator('#kv-why .kvwr.go').first.click();await pg.wait_for_timeout(200)
            print('7 rivistä siirtyi palikkaan:',await pg.inner_text('#kv-side .kvsideh b'))
            await pg.screenshot(path='kanvaasi17_miksi_%d.png'%W)
            # 8 toiminto pois käytöstä
            await pg.click('#kv-side .kvsx');await pg.wait_for_timeout(150);print('   paneeli suljettu:',await pg.is_hidden('#kv-side'))
            await pg.click((S%'n4')+' .kvplay');await pg.wait_for_timeout(200)
            await pg.click('#kv-side .kvon input');await pg.wait_for_timeout(200)
            print('8 toiminto pois käytöstä:',await P("N('n4').off"))
            await ctx.close()
        # viety appi 390 px
        ctx=await b.new_context(reduced_motion='reduce',viewport={'width':1440,'height':900});pg=await ctx.new_page();pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(U);await pg.wait_for_timeout(300)
        await pg.fill('#mempty input','x'); await pg.click('#mempty .mb:text-is("Luo projekti")'); await pg.wait_for_timeout(200)
        await pg.click('#mtabs [data-v="proj"]'); await pg.fill('#v-proj textarea',json.dumps(PK,ensure_ascii=False)); await pg.click('text=Tuo uutena projektina'); await pg.wait_for_timeout(300)
        html=await pg.evaluate("MASTER.appHtml?MASTER.appHtml():null")
        if html:
            ap=await (await b.new_context(viewport={'width':390,'height':800})).new_page();ap.on('pageerror',lambda e:errs.append('appi: '+str(e)))
            await ap.set_content(html);await ap.wait_for_timeout(300)
            await ap.locator('text=Nappi').first.click();await ap.wait_for_timeout(200)
            print('9 viety appi: Nappi lisäsi pisteen, näkyvä teksti:',(await ap.inner_text('body'))[:120].replace('\n',' | '))
        else: print('9 vientiä ei voitu ajaa tästä testistä (MASTER.appHtml puuttuu)')
        print('errs',errs)
        await b.close()
asyncio.run(main())
