"""Kaikki 0.61 (SUUNNITELMA: Ulkoasuvaihtoehdot, Emilin palaute 23.11.2026): valittava ilme Lehto (vaalea) ja Hiillos (tumma).
Tarkistaa leveyksillä 1440, 1280, 390 ja 320, vaalealla ja tummalla laitteella:
- oletus ei muutu: ilman valintaa ei data-ilme- eikä data-hfont-merkintää, ja värit ovat samat ennen ja jälkeen edestakaisen valinnan
- Lehto ja Hiillos: kiinteät pinnat (#F7F3EC / #222429), jokainen aksentti vaihtaa --accent-värin, otsikkofontti tulee isoon otsikkoon
- kontrasti vähintään 4,5:1: teksti, haalea teksti, aksentti pintoja ja valintapintaa vasten sekä umpinapin teksti, jokaisella aksentilla
- kuittaus ja virhe eivät vaihdu aksentin mukana
- Tila Tumma näyttää vain Hiilloksen valinnat; valinta säilyy uudelleenlatauksessa; ei sivuttaisvieritystä eikä sivuvirheitä
Käyttö: python3 testit/selain_61.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from apu import menu
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
FAKE=open(os.path.join(D,'fakegh.js'),encoding='utf8').read()
def md(i): return '---\ntyyppi: projekti\notsikko: Muistiinpano %d\nkuvaus: \nluotu: 2026-11-%02d\nlahde: emil\n---\n# Muistiinpano %d\n\nTeksti %d, hinta 120.\n'%(i,1+i,i,i)
SEED={'projektit/m%02d.md'%i:md(i) for i in range(8)}
VARS="(function(){var c=getComputedStyle(document.documentElement),o={};['--bg','--cell','--fill2','--dlg','--label','--label2','--accent','--fill','--solid','--on-solid','--okbg','--okfg','--red'].forEach(function(k){o[k]=c.getPropertyValue(k).trim().toUpperCase();});o.ilme=document.documentElement.dataset.ilme||'';o.hfont=document.documentElement.dataset.hfont||'';return o;})()"
def lum(h):
    h=h.lstrip('#'); v=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    v=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in v]
    return .2126*v[0]+.7152*v[1]+.0722*v[2]
def cr(a,b):
    x,y=lum(a),lum(b); return (max(x,y)+.05)/(min(x,y)+.05)
async def run(p,w,h,scheme):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    ctx=await b.new_context(viewport={'width':w,'height':h},color_scheme=scheme)
    pg=await ctx.new_page()
    await pg.add_init_script(FAKE+";(function(){var S=%s;if(!window.__repo.kept)for(var k in S)window.__repo.put(k,S[k]);try{localStorage.setItem('kaikki:gh',JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));}catch(e){}})();"%json.dumps(SEED))
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond,info=''):
        print('  %-62s %s %s'%(label,'ok' if cond else 'VIRHE',info if not cond else ''))
        if not cond: bad.append('%d %s: %s'%(w,scheme,label))
    print('leveys',w,scheme)
    await pg.goto(U); await pg.wait_for_timeout(1500)
    v0=await pg.evaluate(VARS)
    want('oletus: ei ilmettä eikä otsikkofonttia',v0['ilme']=='' and v0['hfont']=='',v0)
    await menu(pg,'#m-proj'); await pg.wait_for_timeout(250)
    want('asetuksissa Ilme-valinta, oletuksena Oma värisäätö',await pg.get_attribute('#set-ilme [data-v=""]','aria-pressed')=='true')
    want('värikoneen säätimet näkyvät ilman ilmettä',await pg.locator('#k-h').count()==1)
    await pg.click('#set-ilme [data-v="lh"]'); await pg.wait_for_timeout(150)
    dark=scheme=='dark'
    v=await pg.evaluate(VARS)
    want('ilme päällä: %s'%('hiillos' if dark else 'lehto'),v['ilme']==('hiillos' if dark else 'lehto'),v['ilme'])
    want('kiinteä pinta',v['--bg']==('#222429' if dark else '#F7F3EC'),v['--bg'])
    want('värikoneen säätimet piilossa',await pg.locator('#k-h').count()==0)
    want('laitteen mukaan: molempien asujen aksentit näkyvät',await pg.locator('#set-lacc').count()==1 and await pg.locator('#set-dacc').count()==1)
    key='#set-dacc' if dark else '#set-lacc'
    vals=await pg.evaluate("Array.from(document.querySelectorAll('%s [data-v]')).map(function(b){return b.dataset.v;})"%key)
    want('aksentteja %d'%(3 if dark else 2),len(vals)==(3 if dark else 2),vals)
    seen=set(); ok0=v['--okbg']; red0=v['--red']
    for a in vals:
        await pg.click('%s [data-v="%s"]'%(key,a)); await pg.wait_for_timeout(120)
        c=await pg.evaluate(VARS); seen.add(c['--accent'])
        surf=[c['--bg'],c['--cell'],c['--dlg']]
        low=[]
        for nm,fg,bgs in (('teksti',c['--label'],surf+[c['--fill2'],c['--fill']]),('haalea',c['--label2'],surf+[c['--fill2']]),('aksentti',c['--accent'],surf+[c['--fill']]),('umpinappi',c['--on-solid'],[c['--solid']])):
            for bg in bgs:
                r=cr(fg,bg)
                if r<4.5: low.append('%s %s/%s %.2f'%(nm,fg,bg,r))
        want('kontrasti ≥ 4,5 aksentilla %s'%a,not low,low)
        want('kuittaus ja virhe ennallaan aksentilla %s'%a,c['--okbg']==ok0 and c['--red']==red0,(c['--okbg'],c['--red']))
        sel=await pg.get_attribute('%s [data-v="%s"]'%(key,a),'aria-pressed')
        want('valittu aksentti merkitty (%s)'%a,sel=='true')
    want('jokainen aksentti antaa oman värin',len(seen)==len(vals),seen)
    fkey='#set-dhf' if dark else '#set-lhf'
    await pg.click('%s [data-v="didot"]'%fkey); await pg.wait_for_timeout(120)
    c=await pg.evaluate(VARS)
    ff=await pg.evaluate("getComputedStyle(document.querySelector('#psheet h2')||document.querySelector('h2')).fontFamily")
    want('otsikkofontti Didot otsikossa',c['hfont']=='didot' and 'Didot' in ff,(c['hfont'],ff))
    sample=await pg.evaluate("getComputedStyle(document.querySelector('%s [data-v=\"didot\"]')).fontFamily"%fkey)
    want('fonttinäyte omalla fontillaan',"Didot" in sample,sample)
    dayf=await pg.evaluate("(function(){var h=document.querySelector('#psheet h3');return h?getComputedStyle(h).fontFamily:'';})()")
    want('pieni otsikko (h3) pysyy järjestelmäfontissa','Didot' not in dayf,dayf)
    await pg.click('%s [data-v="system"]'%fkey); await pg.wait_for_timeout(120)
    c=await pg.evaluate(VARS)
    want('Järjestelmä: ei otsikkofonttia',c['hfont']=='',c['hfont'])
    await pg.click('%s [data-v="ny"]'%fkey); await pg.wait_for_timeout(120)
    want('ei sivuttaisvieritystä asetuksissa',await pg.evaluate("document.documentElement.scrollWidth<=innerWidth"))
    # Tila Tumma: vain Hiilloksen valinnat
    await pg.click('#set-mode [data-v="dark"]'); await pg.wait_for_timeout(150)
    c=await pg.evaluate(VARS)
    want('Tumma: Hiillos ja vain sen valinnat',c['ilme']=='hiillos' and await pg.locator('#set-lacc').count()==0 and await pg.locator('#set-dacc').count()==1,(c['ilme'],))
    await pg.click('#set-mode [data-v="auto"]'); await pg.wait_for_timeout(150)
    # uudelleenlataus säilyttää valinnan
    await pg.reload(); await pg.wait_for_timeout(1500)
    c=await pg.evaluate(VARS)
    want('uudelleenlatauksen jälkeen ilme ja fontti säilyvät',c['ilme']==('hiillos' if dark else 'lehto') and c['hfont']=='ny',(c['ilme'],c['hfont']))
    want('ei sivuttaisvieritystä Muistiossa',await pg.evaluate("document.documentElement.scrollWidth<=innerWidth"))
    # takaisin omaan: värit samat kuin alussa
    await menu(pg,'#m-proj'); await pg.wait_for_timeout(250)
    await pg.click('#set-ilme [data-v=""]'); await pg.wait_for_timeout(150)
    v1=await pg.evaluate(VARS)
    want('Oma värisäätö palauttaa täsmälleen alkuperäiset värit',v1==v0,[(k,v0[k],v1[k]) for k in v0 if v0[k]!=v1[k]])
    want('ei sivuvirheitä',not errs,errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((1440,900),(1280,800),(390,844),(320,640)):
            for s in ('light','dark'): bad+=await run(p,w,h,s)
    print('KAIKKI OK' if not bad else 'VIRHEITÄ: '+'; '.join(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
