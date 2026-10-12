# Master: projektin rakentaminen alusta, kaavat osoittamalla, säännöt, arvotaulukko, seuranta, julkaisu käyttäjä-appiksi ja tuonnit.
import asyncio, json, os
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
async def run(w,h,scheme,shots,tag):
    async with async_playwright() as p:
        b=await p.chromium.launch(); errs=[]
        ctx=await b.new_context(viewport={'width':w,'height':h},color_scheme=scheme,accept_downloads=True)
        pg=await ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(U); await pg.wait_for_timeout(300)
        print('==== %dx%d %s ====' % (w,h,scheme))
        store=lambda q: pg.evaluate("(function(){var d=JSON.parse(localStorage.getItem('master:v1')),P=d.projects.filter(function(x){return x.id===d.cur;})[0];function O(n){return P.objs.filter(function(o){return o.n===n;})[0];}return JSON.stringify(%s);})()" % q)
        phone=lambda: pg.evaluate("[...document.querySelectorAll('#pscreen .ua-list>*')].filter(e=>!e.hidden).map(e=>e.classList.contains('ua-row')?e.querySelector('.t').textContent+({'ua-row sel':'*','ua-row excl':'~','ua-row rec':'!','ua-row lock':'#'}[e.className]||''):(e.classList.contains('ua-tbox')?'['+e.innerText.replace(/\\n/g,' / ')+']':e.innerText.replace(/\\n/g,' '))).join(' | ')")
        info=lambda: pg.evaluate("document.querySelector('#pscreen .ua-itext').innerText.replace(/\\s+/g,' ')")
        async def add(kind,name):
            await pg.click('[data-add="%s"]' % kind); await pg.wait_for_timeout(80); await pg.fill('#f-name',name); await pg.press('#f-name','Tab'); await pg.wait_for_timeout(80)
        async def pick(name): await pg.click('.oname:has(.on:text-is("%s"))' % name); await pg.wait_for_timeout(80)
        async def addrule(f,ref,op=None,v=None):
            sec='#insp [data-rules="%s"]' % f
            val=await pg.evaluate("(a)=>{var s=[...document.querySelectorAll(a[0]+'>select')].pop();var o=[...s.options].filter(x=>x.text.split(' · ')[0]===a[1])[0];return o?o.value:null;}",[sec,ref])
            await pg.select_option(sec+'>select',val); await pg.wait_for_timeout(80)
            rows=sec+' .rule'
            if op: await pg.select_option('%s >> nth=-1 >> select >> nth=1' % rows, op); await pg.wait_for_timeout(60)
            if v is not None: await pg.fill('%s >> nth=-1 >> input.val >> nth=0' % rows, str(v)); await pg.press('%s >> nth=-1 >> input.val >> nth=0' % rows,'Tab'); await pg.wait_for_timeout(60)
        async def slide(name,v):
            await pg.evaluate("(a)=>{var x=[...document.querySelectorAll('#pscreen .ua-sl')].filter(e=>e.querySelector('.ua-slh span').textContent===a[0])[0].querySelector('input');x.value=a[1];x.dispatchEvent(new Event('input',{bubbles:true}));}",[name,v]); await pg.wait_for_timeout(60)
        async def tap(name): await pg.click('#pscreen .ua-row:has(.t:text-is("%s"))' % name); await pg.wait_for_timeout(120)
        # 1 tyhjästä projektiin
        print('1 tervetuloa:', (await pg.inner_text('.welcome h1')), '| projekteja:', await pg.evaluate("JSON.parse(localStorage.getItem('master:v1')||'null')"))
        if shots: await pg.screenshot(path='m%s_0.png' % tag)
        await pg.fill('.welcome input','Testi'); await pg.click('.welcome .mb.solid'); await pg.wait_for_timeout(200)
        await add('slider','Energia'); await add('slider','Mieliala')
        await pick('Mieliala'); await pg.fill('#f-start','3'); await pg.press('#f-start','Tab'); await pg.fill('#f-lo','raskas'); await pg.press('#f-lo','Tab')
        # 2 kaava osoittamalla
        await add('calc','Summa'); await pg.click('#insp .fnbar .mb:text-is("SUMMA( )")')
        await pg.click('text=Osoita puhelimesta'); await pg.wait_for_timeout(80)
        print('2 osoitustila:', await pg.is_visible('#pointbar'), '| säädin ei liiku osoittaessa:', await pg.evaluate("getComputedStyle(document.querySelector('#pscreen input')).pointerEvents"))
        await pg.click('#pscreen .ua-sl:has-text("Energia")'); await pg.click('#insp .fnbar .mb:text-is(";")'); await pg.click('#pscreen .ua-sl:has-text("Mieliala")'); await pg.click('#pointdone'); await pg.wait_for_timeout(100)
        print('  kaava:', await pg.input_value('#f-f'), '|', await pg.inner_text('#f-res'), '| puhelimessa:', await phone())
        await pg.fill('#f-f','SUMMA([Energia];[Mieliala]'); await pg.wait_for_timeout(80); print('  rikkinäinen kaava:', await pg.inner_text('#f-res'), '| listassa:', await pg.inner_text('.oname:has(.on:text-is("Summa")) .ov'))
        await pg.fill('#f-f','SUMMA([Energia];[Mieliala])'); await pg.wait_for_timeout(80)
        # 3 ehto, teksti ja valinnat
        await add('cond','Korkea'); await addrule('req','Summa','ge',14)
        print('3 ehto:', await pg.inner_text('#insp-status'))
        await add('text','Palaute'); await pg.fill('#f-body','Summa on {Summa}. Energia {Energia}.'); await pg.wait_for_timeout(60); await addrule('req','Korkea')
        await add('choice','A'); await pg.fill('#f-note','Valitsit A:n, summa {Summa}.'); await pg.wait_for_timeout(60)
        await add('choice','B'); await pg.select_option('#insp [data-ex] select', await pg.evaluate("[...document.querySelectorAll('#insp [data-ex] option')].filter(o=>o.text==='A')[0].value")); await pg.wait_for_timeout(80)
        await add('choice','C'); await addrule('hl','A','off')
        await add('calc','Näkyvä luku'); await pg.fill('#f-f','JOS([Korkea];"hyvä";"matala")'); await pg.wait_for_timeout(60)
        print('  puhelin alussa:', await phone())
        if shots: await pg.screenshot(path='m%s_1.png' % tag)
        await slide('Energia',9); await slide('Mieliala',8)
        print('4 säätimet 9 ja 8:', await phone())
        await tap('A'); print('  A valittu:', await phone(), '| tietorivi:', await info())
        await tap('B'); print('  B poissuljetusta:', await phone(), '| tietorivi:', await info())
        await slide('Energia',2); print('  energia 2:', await phone())
        # 5 arvotaulukko
        await pg.click('[data-v="table"]'); await pg.wait_for_timeout(150)
        print('5 taulukko:', await pg.evaluate("[...document.querySelectorAll('#v-table tbody tr')].map(r=>[...r.children].map(c=>c.textContent).slice(0,5).join(' / ')).join(' || ')"))
        await slide('Energia',7); await pg.wait_for_timeout(100); print('  päivittyy heti:', await pg.evaluate("[...document.querySelectorAll('#v-table tbody tr')].filter(r=>r.children[0].textContent==='Summa')[0].children[4].textContent"))
        if shots: await pg.screenshot(path='m%s_table.png' % tag)
        await pg.click('#v-table tbody tr:has(td:text-is("Korkea"))'); await pg.wait_for_timeout(100); print('  rivin napautus avaa:', await pg.inner_text('#insp h2'))
        # 6 valitse puhelimesta, nimen vaihto, lajin vaihto
        await pg.click('[data-m="pick"]'); await pg.click('#pscreen .ua-num:has-text("Summa")'); await pg.wait_for_timeout(100); print('6 valittu puhelimesta:', await pg.inner_text('#insp h2'))
        await pg.click('[data-m="use"]')
        await pg.fill('#f-name','Yhteensä'); await pg.press('#f-name','Tab'); await pg.wait_for_timeout(100)
        print('  nimen vaihto päivitti:', await store("[O('Palaute').body,O('Korkea').req]"), await pg.evaluate("document.querySelector('#v-table')?1:0"))
        await pick('A'); await pg.select_option('#insp .card >> nth=0 >> select >> nth=0','text'); await pg.wait_for_timeout(100); print('  lajin vaihto kysyy:', await pg.inner_text('#mdlg h3')); await pg.click('#mdlg .mb:text-is("Vaihda")'); await pg.wait_for_timeout(150)
        print('  A tekstiksi:', await store("[O('A').t,O('A').body,O('B').ex,O('C').hl]"), '|', await phone())
        # 7 pullonkaula ja ruudut
        await pick('C'); await pg.check('#insp .check input'); await pg.wait_for_timeout(100); print('7 pullonkaula C:', await phone())
        await pg.click('[data-add="choice"]'); await pg.wait_for_timeout(80); print('  uusi valinta C:n jälkeen lukittu:', await pg.evaluate("[...document.querySelectorAll('.oname .on')].map(e=>e.textContent).join(', ')"), '|', await pg.inner_text('#insp-status'))
        await pg.click('[data-add="text"]'); await pg.click('text=+ Ruutu'); await pg.wait_for_timeout(150)
        await pick('Teksti 11') if await pg.locator('.oname:has(.on:text-is("Teksti 11"))').count() else None
        print('  ruudut:', await pg.evaluate("[...document.querySelectorAll('.scr b')].map(e=>e.textContent).join(', ')"), '| välilehdet puhelimessa:', await pg.evaluate("[...document.querySelectorAll('#pscreen .ua-tabs button')].map(e=>e.textContent).join(', ')"))
        # 8 seuranta
        await pg.click('[data-v="stats"]'); await pg.wait_for_timeout(100); print('8 seuranta ilman päiviä:', (await pg.inner_text('#v-stats .lead'))[:50])
        await pg.click('text=Ota päiväkohtainen kirjaus käyttöön'); await pg.wait_for_timeout(150)
        await pg.click('text=Luo 30 satunnaista testipäivää'); await pg.wait_for_timeout(300)
        print('  testipäivät:', await pg.inner_text('#v-stats .row2 .msg'), '| kortteja:', await pg.locator('#v-stats .scard').count(), '| käyriä:', await pg.locator('#v-stats svg.spark').count(), '| yhteydet-rivejä:', await pg.locator('#v-stats table tbody tr').count())
        print('  päivä puhelimessa:', await pg.inner_text('#pscreen .ua-r2'))
        if shots: await pg.screenshot(path='m%s_stats.png' % tag, full_page=False)
        await pg.click('#v-stats .mb.danger'); await pg.wait_for_timeout(100); print('  testipäivät poistettu:', await store("Object.keys(P.days).length"))
        # 9 julkaisu käyttäjä-appiksi
        await pg.click('[data-v="proj"]'); await pg.wait_for_timeout(100)
        if shots: await pg.screenshot(path='m%s_proj.png' % tag)
        async with pg.expect_download() as dl: await pg.click('text=Vie käyttäjä-appina (HTML)')
        f=await dl.value; path=os.path.join(os.getcwd(),'appi_%s.html' % tag); await f.save_as(path); print('9 appi:', f.suggested_filename, os.path.getsize(path),'tavua')
        ap=await ctx.new_page(); ap.on('pageerror',lambda e:errs.append('appi: '+str(e))); await ap.set_viewport_size({'width':390,'height':844}); await ap.goto('file://'+path); await ap.wait_for_timeout(300)
        aphone=lambda: ap.evaluate("[...document.querySelectorAll('.ua-list>*')].filter(e=>!e.hidden).map(e=>e.classList.contains('ua-row')?e.querySelector('.t').textContent+({'ua-row sel':'*'}[e.className]||''):e.innerText.replace(/\\n/g,' ')).join(' | ')")
        print('  appi aukeaa:', await ap.title(), '|', await aphone())
        await ap.evaluate("(()=>{var x=document.querySelectorAll('.ua-sl input')[0];x.value=10;x.dispatchEvent(new Event('input',{bubbles:true}));var y=document.querySelectorAll('.ua-sl input')[1];y.value=9;y.dispatchEvent(new Event('input',{bubbles:true}));})()")
        await ap.click('.ua-row:has(.t:text-is("B"))'); await ap.wait_for_timeout(100); print('  käyttäjä valitsee:', await aphone())
        await ap.reload(); await ap.wait_for_timeout(300); print('  säilyy uudelleenlatauksessa:', await aphone(), '| leveys', await ap.evaluate("document.documentElement.scrollWidth"))
        if shots: await ap.screenshot(path='m%s_appi.png' % tag)
        await ap.close()
        # 10 tuonnit
        pk={'paatoskartta':'puu','nimi':'Työpäivä','tekijat':[{'nimi':'Ma'},{'nimi':'Ti'},{'nimi':'Päivä','nakymaton':True,'pullonkaula':True,'riittaa':['Ma','Ti']},{'nimi':'Tiimi'},{'nimi':'Valmistaudu','vaatii':['Tiimi'],'suosittelijat':['Tiimi'],'huomio':'Lue lista'},{'nimi':'Ohje','teksti':'Tiimi alkaa','vaatii':['Tiimi']}],'ei_sovi_yhteen':[['Ma','Ti']]}
        await pg.fill('#v-proj textarea', json.dumps(pk,ensure_ascii=False)); await pg.click('text=Tuo uutena projektina'); await pg.wait_for_timeout(300)
        print('10 päätöskartan tuonti:', await pg.evaluate("document.getElementById('psel').selectedOptions[0].text"), '|', await phone())
        await tap('Ma'); await tap('Tiimi'); print('  ma + tiimi:', await phone())
        async with pg.expect_download() as dl2: await pg.click('#mbackup')
        f2=await dl2.value; bp=os.path.join(os.getcwd(),'varmuus_%s.json' % tag); await f2.save_as(bp); bk=json.load(open(bp,encoding='utf8'))
        print('  varmuuskopio:', bk['app'], len(bk['projects']),'projektia | tila:', await pg.inner_text('#mstat'))
        # 11 poisto
        await pg.click('[data-v="build"]'); await pick('Ohje'); await pg.click('#insp .mb.danger'); print('11 poisto kysyy:', await pg.inner_text('#mdlg h3')); await pg.click('#mdlg .mb:text-is("Poista")'); await pg.wait_for_timeout(100)
        print('  jäljellä:', await pg.evaluate("[...document.querySelectorAll('.oname .on')].map(e=>e.textContent).join(', ')"))
        # 12 esimerkkiprojekti
        await pg.click('#pnew'); await pg.click('#mdlg .mb:text-is("Luo esimerkkiprojekti")'); await pg.wait_for_timeout(300)
        await slide('Energia',2); await slide('Mieliala',3); print('12 esimerkki matalalla vireellä:', await phone())
        await tap('Kävely ulkona'); print('  tietorivi:', await info())
        if shots: await pg.screenshot(path='m%s_ex.png' % tag)
        await pg.click('[data-m="pick"]'); await pg.click('#pscreen .ua-row:has-text("Kävely")'); await pg.wait_for_timeout(100)
        if shots: await pg.screenshot(path='m%s_rules.png' % tag); await pg.evaluate("document.getElementById('insp').scrollTop=600"); await pg.screenshot(path='m%s_rules2.png' % tag)
        print('  leveys', await pg.evaluate("[document.documentElement.scrollWidth, window.innerWidth]"), 'errs', errs)
        await b.close()
asyncio.run(run(1440,900,'light',True,'')); asyncio.run(run(1280,800,'dark',True,'_n'))
