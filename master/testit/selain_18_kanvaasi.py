# Versio 16: Ketjut-kanvaasi. Rakennetaan sääntö raahaamalla ja nuolia vetämällä: TAI-ikkuna (A, B, C) → nimetty tulos, ikkunan sanan vaihto
# (VAIN YKSI), KUN-ikkuna (Ansa laukeaa, Liukusäädin ≠ 7) → Lisää Loukussa. Ikkunan siirto vie sisällön mukana, ikkuna toisen sisään
# (ulompi kasvaa), koon muutos kulmasta, tiivistys, poisto ja Kumoa, nuolen irrotus, Lista-näkymä ja viety appi 390 px.
# Kuvakaappaukset kanvaasi_*.png.
import asyncio, os, json
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
def ob(i,t,n,**kw):
    x={'id':'o%d'%i,'t':t,'n':n,'s':'s1','req':[],'suf':[]}
    if t=='choice':x.update(v=1,note='',ex=[],hl=[],beh='toggle',act=[],lact=[])
    if t=='counter':x.update(start=0,min='',max='',show='number',keep=False,unit='')
    x.update(kw);return x
objs=[ob(1,'choice','A'),ob(2,'choice','B'),ob(3,'choice','C'),ob(4,'slider','Liukusäädin',min=0,max=10,step=1,start=5,lo='',hi='',unit=''),
 ob(5,'trig','Ansa',mode='latch',act=[]),ob(6,'choice','Astu ansaan',beh='hold',act=[{'do':'fire','o':'o5'}]),ob(7,'counter','Loukussa')]
PK={'app':'master','projekti':{'name':'Kanvaasitesti','screens':[{'id':'s1','n':'Peli'}],'objs':objs,'cfg':{'days':False,'vis':'lukitutpois','tint':'sininen'},'state':{'sel':[],'vals':{}},'seq':7,'sseq':1}}
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); errs=[]
        ctx=await b.new_context(reduced_motion='reduce',viewport={'width':1600,'height':1000})
        pg=await ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(U); await pg.wait_for_timeout(300)
        print('==== master 1600 ====')
        await pg.fill('#mempty input','x'); await pg.click('#mempty .mb:text-is("Luo projekti")'); await pg.wait_for_timeout(200)
        await pg.click('#mtabs [data-v="proj"]'); await pg.fill('#v-proj textarea',json.dumps(PK,ensure_ascii=False)); await pg.click('text=Tuo uutena projektina'); await pg.wait_for_timeout(300)
        async def P(js): return json.loads(await pg.evaluate("(function(){var P=MASTER.data.projects.filter(x=>x.name==='Kanvaasitesti')[0];function O(n){return P.objs.filter(o=>o.n===n)[0];}var KV=P.kv||{n:[],l:[]};function N(id){return KV.n.filter(x=>x.id===id)[0];}return JSON.stringify("+js+");})()"))
        await pg.click('#mtabs [data-v="ketjut"]'); await pg.wait_for_timeout(300)
        vp=await pg.evaluate("(function(){var r=document.getElementById('kv-vp').getBoundingClientRect();return [r.left,r.top];})()")
        print('1 kanvaasi tyhjänä:', await pg.inner_text('.kvempty'), '| ikkunat paletissa:', await pg.evaluate("[...document.querySelectorAll('.kjpal .kjchips.kvwins .kjchip')].map(c=>c.textContent).join(', ')"))
        async def drop(chip,x,y):
            await pg.drag_and_drop(chip,'#kv-vp',target_position={'x':x,'y':y}); await pg.wait_for_timeout(250)
        async def last(): return (await P("KV.n.slice(-1)[0]"))
        async def node(id): return '#kv-world .kvn[data-nid="%s"]' % id
        async def center(sel):
            r=await pg.evaluate("(s)=>{var e=document.querySelector(s).getBoundingClientRect();return [e.left+e.width/2,e.top+e.height/2];}",sel); return r
        async def link(src_sel,dst_sel,dx=0,dy=0):
            a=await center(src_sel); t=await center(dst_sel)
            await pg.mouse.move(a[0],a[1]); await pg.mouse.down(); await pg.mouse.move((a[0]+t[0])/2,(a[1]+t[1])/2,steps=4); await pg.mouse.move(t[0]+dx,t[1]+dy,steps=4); await pg.mouse.up(); await pg.wait_for_timeout(250)
        async def drag(sel,dx,dy,grab=None):
            a=await center(sel) if not grab else grab
            await pg.mouse.move(a[0],a[1]); await pg.mouse.down(); await pg.mouse.move(a[0]+dx/2,a[1]+dy/2,steps=4); await pg.mouse.move(a[0]+dx,a[1]+dy,steps=4); await pg.mouse.up(); await pg.wait_for_timeout(250)
        # TAI-ikkuna ja sen sisään A, B, C
        await drop('.kjpal .kjchips.kvwins .kjchip:has-text("TAI")',120,80); w1=(await last())['id']
        await drop('.kjpal .kjchip[data-oid="o1"]',150,150); await drop('.kjpal .kjchip[data-oid="o2"]',150,250); await drop('.kjpal .kjchip[data-oid="o3"]',150,350)
        print('2 TAI-ikkuna ja sisältö:', await P("[N('%s').m, KV.n.filter(x=>x.k==='p').map(x=>[P.objs.filter(o=>o.id===x.o)[0].n,x.g==='%s'])]" % (w1,w1)), '| ikkuna kasvoi sisällön mukaan:', await pg.evaluate("(function(){var r=MASTER.kv().rects()['%s'];return r.h>=150&&r.y+r.h>=MASTER.kv().rects()[MASTER.data.projects.filter(x=>x.name==='Kanvaasitesti')[0].kv.n.slice(-1)[0].id].y;})()" % w1))
        # uusi tulos, nimetään heti
        await drop('.kjpal .kjchip:has-text("Uusi tulos")',580,120); tn=(await last())['id']
        await pg.keyboard.type('Joku painettu'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(250)
        print('3 uusi tulos:', await P("[O('Joku painettu').t, N('%s').o===O('Joku painettu').id]" % tn))
        await link((await node(w1))+' .kvwh .kvport.out', await node(tn))
        print('4 nuoli ikkunasta tulokseen:', await P("KV.l.map(l=>[l.f==='%s',l.fp,l.t==='%s',l.tp])" % (w1,tn)))
        # sanan vaihto: VAIN YKSI
        await pg.click((await node(w1))+' .kvgw'); await pg.wait_for_timeout(150); await pg.click('.kvpop button:has-text("VAIN YKSI")'); await pg.wait_for_timeout(250)
        print('5 ikkunan sana:', await P("N('%s').m" % w1), '| otsikko:', await pg.inner_text((await node(w1))+' .kvwh .kvwt'))
        # KUN-ikkuna: Ansa laukeaa ja Liukusäädin ≠ 7 → Lisää Loukussa
        await drop('.kjpal .kjchips.kvwins .kjchip:has-text("KUN")',120,520); w2=(await last())['id']
        await drop('.kjpal .kjchip[data-oid="o4"]',150,600); ns=(await last())['id']
        await drop('.kjpal .kjchips.kvops .kjchip[title="ei ole"]',380,590); ne=(await last())['id']
        await link((await node(ns))+' .kvport.out', await node(ne))
        await pg.fill((await node(ne))+' .kvopr:last-child input','7'); await pg.press((await node(ne))+' .kvopr:last-child input','Tab'); await pg.wait_for_timeout(250)
        print('6 vertailu ikkunassa:', await P("[N('%s').g==='%s',N('%s').g==='%s',N('%s').op,N('%s').b,KV.l.filter(l=>l.t==='%s').map(l=>l.tp)]" % (ns,w2,ne,w2,ne,ne,ne)))
        await drop('.kjpal .kjchip[data-oid="o5"]',20,800); na=(await last())['id']
        await link((await node(na))+' .kvevr .kvport.out', await node(w2))
        await drop('.kjpal .kjchip[data-act="add"]',800,520); aa=(await last())['id']
        await pg.drag_and_drop('.kjpal .kjchip[data-oid="o7"]',(await node(aa))+' .kvtgt'); await pg.wait_for_timeout(250)
        await link((await node(w2))+' .kvwhd .kvrow .kvport.out', await node(aa))
        print('7 KUN-ketju:', await P("[KV.l.filter(l=>l.t==='%s').map(l=>[l.fp,l.tp]), N('%s').a, KV.l.filter(l=>l.f==='%s').map(l=>[l.fp,l.tp])]" % (w2,aa,w2)))
        await pg.screenshot(path='kanvaasi_master.png')
        # puhelimessa
        async def live(id): return await pg.inner_text('#kv-world .kvval[data-vid="%s"]' % id)
        await pg.click('#pscreen .ua-row:has-text("A")'); await pg.wait_for_timeout(250); t1=await live(tn)
        await pg.click('#pscreen .ua-row:has-text("B")'); await pg.wait_for_timeout(250)
        print('8 puhelimesta A:', t1, '| A ja B (vain yksi):', await live(tn), '| vihreä nuoli:', await pg.evaluate("document.querySelectorAll('#kv-svg .kvl.on').length"))
        await pg.click('#pscreen .ua-row:has-text("Astu ansaan")'); await pg.wait_for_timeout(250); l1=await P("P.state.vals.o7||0")
        await pg.evaluate("(function(){var x=document.querySelector('#pscreen .ua-sl input');x.value=7;x.dispatchEvent(new Event('input',{bubbles:true}));x.dispatchEvent(new Event('change',{bubbles:true}));})()"); await pg.wait_for_timeout(250)
        await pg.click('#pscreen .ua-row:has-text("Astu ansaan")'); await pg.wait_for_timeout(250)
        print('9 ansa: säädin 5 →', l1, '| säädin 7 →', await P("P.state.vals.o7||0"), '| KUN-ikkunan tila:', await live(w2))
        # ikkunan siirto vie sisällön mukana
        p0=await P("[N('%s').y,N('%s').y]" % (w2,ns)); await drag((await node(w2))+' .kvwt',0,60)
        print('10 KUN-ikkuna siirretty: sisältö mukana', await P("[N('%s').y-%d,N('%s').y-%d]" % (w2,p0[0],ns,p0[1])), '(60 alaspäin)')
        # ikkuna toisen sisään: uusi JA-ikkuna raahataan TAI-ikkunan sisään
        h0=await pg.evaluate("MASTER.kv().rects()['%s'].h" % w1)
        await drop('.kjpal .kjchips.kvwins .kjchip:has-text("JA")',600,820); w3=(await last())['id']
        g=await center((await node(w3))+' .kvwt'); t=await pg.evaluate("(function(){var r=document.querySelector('#kv-world .kvn[data-nid=\"%s\"]').getBoundingClientRect();return [r.left+r.width/2,r.bottom-12];})()" % w1)
        await drag(None,t[0]-g[0],t[1]-g[1],grab=g)
        print('11 JA-ikkuna TAI-ikkunan sisään:', await P("N('%s').g==='%s'" % (w3,w1)), '| ulompi kasvoi:', await pg.evaluate("MASTER.kv().rects()['%s'].h" % w1)>h0+60)
        # koko kulmasta
        w0=await P("N('%s').w" % w2); await drag((await node(w2))+' .kvrs',90,40)
        print('12 koko kulmasta: leveys', w0, '→', await P("N('%s').w" % w2))
        # tiivistys
        await pg.click((await node(w1))+' .kvcol'); await pg.wait_for_timeout(250)
        print('13 tiivistetty:', await P("N('%s').col" % w1), '| sisältö piilossa:', await pg.evaluate("document.querySelector('#kv-world .kvn[data-nid=\"%s\"]').hidden" % w3), '| nuoli tulokseen yhä:', await pg.evaluate("document.querySelectorAll('#kv-svg .kvl').length"))
        await pg.click((await node(w1))+' .kvcol'); await pg.wait_for_timeout(250)
        # poisto ja kumoa
        await pg.click((await node(aa))+' .kvplay'); await pg.wait_for_timeout(150); await pg.keyboard.press('Delete'); await pg.wait_for_timeout(250)
        d1=await P("[!!N('%s'),KV.l.some(l=>l.t==='%s')]" % (aa,aa)); await pg.click('#mundo'); await pg.wait_for_timeout(300)
        print('14 poisto Deletellä:', d1, '| Kumoa palautti:', await P("[!!N('%s'),KV.l.some(l=>l.t==='%s')]" % (aa,aa)))
        # nuolen irrotus vetämällä kärjestä tyhjään
        await pg.click('#mtabs [data-v="ketjut"]'); await pg.wait_for_timeout(200)
        a=await center((await node(ne))+' .kvopr .kvport.in'); await drag(None,-160,120,grab=a)
        print('15 nuoli irrotettu:', await P("KV.l.filter(l=>l.t==='%s').length" % ne), '| paikka näyttää taas kentän:', await pg.evaluate("!!document.querySelector('#kv-world .kvn[data-nid=\"%s\"] .kvopr input')" % ne))
        await pg.click('#mundo'); await pg.wait_for_timeout(300)
        # Lista-näkymä
        await pg.click('#mtabs [data-v="ketjut"]'); await pg.wait_for_timeout(150); await pg.click('#kv-mode button[data-v="lista"]'); await pg.wait_for_timeout(200)
        print('16 Lista-näkymä:', await pg.evaluate("[...document.querySelectorAll('#v-ketjut .kjsec')].map(h=>h.textContent)"))
        await pg.click('#kv-mode button[data-v="kanva"]'); await pg.wait_for_timeout(200)
        for v in ['kartta','table','build']: await pg.click('#mtabs [data-v="%s"]' % v); await pg.wait_for_timeout(150)
        html=await pg.evaluate("MASTER.appHtml()"); ap=os.path.join(os.getcwd(),'kanvaasi.html'); open(ap,'w',encoding='utf8').write(html)
        c2=await b.new_context(reduced_motion='reduce',viewport={'width':390,'height':844},has_touch=True); p2=await c2.new_page(); p2.on('pageerror',lambda e:errs.append(str(e)))
        await p2.goto('file://'+ap); await p2.wait_for_timeout(300)
        await p2.click('.ua-row:has-text("Astu ansaan")'); await p2.wait_for_timeout(200)
        v1=await p2.evaluate("[...document.querySelectorAll('.ua-num')].map(e=>e.innerText.replace(/\\s+/g,' ')).join(' / ')")
        await p2.evaluate("(function(){var x=document.querySelector('.ua-sl input');x.value=7;x.dispatchEvent(new Event('input',{bubbles:true}));x.dispatchEvent(new Event('change',{bubbles:true}));})()"); await p2.wait_for_timeout(200)
        await p2.click('.ua-row:has-text("Astu ansaan")'); await p2.wait_for_timeout(200)
        print('17 viety appi 390: ansa →', v1, '| säädin 7 →', await p2.evaluate("[...document.querySelectorAll('.ua-num')].map(e=>e.innerText.replace(/\\s+/g,' ')).join(' / ')"), '| leveys', await p2.evaluate("[document.documentElement.scrollWidth,innerWidth]"))
        await p2.screenshot(path='kanvaasi_390.png'); await c2.close()
        print('errs', errs)
        await b.close()
asyncio.run(main())
