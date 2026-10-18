# F34 vaihe 1 (jonon 14): projektin käyttönäkymän oma teema yhdestä väristä ja paletti = tapa × lähtöväri + omat paikat.
# Vanha projekti ilman kenttiä näyttää täsmälleen entiset värit (Metsä vaalea/tumma, Harmaa). Jokainen tapa × lähtöväri
# (musta, valkoinen, harmaa, kirkas keltainen, …) × teema × tila: kahdeksan erottuvaa sävyä (OKLab-etäisyys ≥ 0,02),
# sävy pinnalla ≥ 3:1, teksti pohjalla ≥ 4,5:1; oman teeman roolit ≥ 4,5:1. Valitsimen kulku (Oma väri, heksa, tapa,
# lähtöväri, paikan oma väri, palautus ↺, Kumoa), tallennus säilyy uudelleenlatauksessa, värinäytteet seuraavat,
# virhemerkki pysyy punaisena. Tietokone 1440 ja 1280 px, 390 px savutestinä. Kuvat varit_*.png.
import asyncio
from playwright.async_api import async_playwright
from yhteinen import *
CLASSIC_L=['#68716C','#C2453A','#AE5517','#87670B','#39775A','#1F7275','#39775A','#765399']
CLASSIC_D=['#A9B3AC','#FF8A7E','#F5A25E','#E8C454','#A2C9B6','#6FD0D2','#A2C9B6','#C5A6EA']
SWEEP="""(function(){var A=APP_APPEARANCE,out=[],cols=['#000000','#FFFFFF','#808080','#FFFF00','#3A7CA5','#C2453A','#00FF00','#FF00FF','#5C4033'];
function d(a,b){var x=A.toOk(a),y=A.toOk(b),r=Math.PI/180;return Math.hypot(x.L-y.L,x.C*Math.cos(x.H*r)-y.C*Math.cos(y.H*r),x.C*Math.sin(x.H*r)-y.C*Math.sin(y.H*r));}
A.TAVAT.forEach(function(t){cols.forEach(function(c){['forest','oma','graphite','sand'].forEach(function(th){[false,true].forEach(function(dk){
 var P={appearance:{theme:th,oma:c,pal:{t:t,c:c}}},pl=A.palette(P,dk),v=A.roles(P,dk),mind=9,minr=99,mins=99;
 for(var i=0;i<8;i++){for(var j=i+1;j<8;j++)mind=Math.min(mind,d(pl.h[i],pl.h[j]));minr=Math.min(minr,A.ratio(pl.h[i],v[0]),A.ratio(pl.h[i],v[1]));mins=Math.min(mins,A.ratio(v[2],pl.s[i]));}
 var on=dk?v[0]:'#FFFFFF',rr=Math.min(A.ratio(v[2],v[0]),A.ratio(v[2],v[1]),A.ratio(v[3],v[0]),A.ratio(v[3],v[1]),A.ratio(v[3],v[6]),A.ratio(v[5],v[0]),A.ratio(v[5],v[1]),A.ratio(on,v[5]));
 out.push([t,c,th,dk?'D':'L',mind,minr,mins,rr,pl.h.every(function(x){return /^#[0-9A-F]{6}$/.test(x);})]);});});});});return out;})()"""
def css(k):return "getComputedStyle(document.documentElement).getPropertyValue('--%s').trim()"%k
async def main():
    async with async_playwright() as p:
        # --- 1. Vanha projekti: entiset värit ---
        for dark,EX in ((False,CLASSIC_L),(True,CLASSIC_D)):
            b,pg,errs=await avaa(p,1440,900,dark=dark)
            await pg.fill('#wname','Vanha');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            got=await pg.evaluate("[0,1,2,3,4,5,6,7].map(i=>%s)"%css("h'+i+'"))
            assert got==EX,(dark,got)
            await pg.evaluate("APP.P.appearance={theme:'graphite'};APP.renderAll()")
            g=await pg.evaluate("[0,1,2,3,4,5,6,7].map(i=>%s)"%css("h'+i+'"))
            assert g[1]==EX[1] and len(set(g[i] for i in (0,2,3,4,5,6,7)))==1,('Harmaa',g)
            await b.close()
        # --- 2. Laskin: kaikki tavat × lähtövärit × teemat × tilat ---
        b,pg,errs=await avaa(p,1440,900)
        r=await pg.evaluate(SWEEP)
        uudet=[x for x in r if x[0]!='sateenkaari']
        assert all(x[8] for x in r),'heksat'
        bad=[x for x in uudet if x[4]<0.02];assert not bad,bad[:5]
        bad=[x for x in r if x[5]<3 or x[6]<4.5];assert not bad,bad[:5]
        bad=[x for x in r if x[2]=='oma' and x[7]<4.5];assert not bad,bad[:5]
        print('2 laskin:',len(r),'yhdistelmää, pienin etäisyys %.3f, sävy/pinta %.2f, teksti/pohja %.2f'%(min(x[4] for x in uudet),min(x[5] for x in r),min(x[6] for x in r)))
        ms=await pg.evaluate("(function(){var t=performance.now();for(var i=0;i<40;i++)APP_APPEARANCE.palette({appearance:{theme:'oma',oma:'#'+(1000000+i*12345).toString(16).slice(-6),pal:{t:'kolmikko',c:'#12'+(10+i)+'AB'}}},i%2==1);return (performance.now()-t)/40;})()")
        print('2 yksi laskenta %.2f ms'%ms);assert ms<15
        await b.close()
        # --- 3. Valitsin, tallennus ja Kumoa ---
        for W in (1440,1280,390):
            b,pg,errs=await avaa(p,W,900 if W>400 else 844)
            await pg.fill('#wname','Värit');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            ids=await pg.evaluate("(function(){var P=APP.P,v=P.views[0].id,r=[];for(var i=0;i<8;i++){var b=KK.addBlock(P,'muoto',{v:v,hue:i});b.x=10+i*44;b.y=90;b.w=40;b.h=40;r.push(b.id);}APP.renderAll();return r;})()")
            await pg.click('#setbtn');await pg.wait_for_timeout(200)
            await pg.click('button[data-view-theme="oma"]');await pg.wait_for_timeout(100)
            assert await pg.evaluate("APP.P.appearance.theme")=='oma' and await pg.evaluate("APP.P.appearance.oma")=='#3A7CA5'
            await pg.fill('[data-ap-hex="oma"]','8d642c');await pg.dispatch_event('[data-ap-hex="oma"]','change');await pg.wait_for_timeout(100)
            assert await pg.evaluate("APP.P.appearance.oma")=='#8D642C'
            assert await pg.evaluate(css('accent'))==await pg.evaluate("APP_APPEARANCE.roles(APP.P,false)[5]")
            await pg.fill('[data-ap-hex="oma"]','ei väri');await pg.dispatch_event('[data-ap-hex="oma"]','change');await pg.wait_for_timeout(50)
            assert await pg.evaluate("APP.P.appearance.oma")=='#8D642C' and await pg.input_value('[data-ap-hex="oma"]')=='#8D642C','virheellinen heksa ei muuta'
            # Tapa: lähtöväri = oman teeman väri
            await pg.click('[data-ap-pal="vastavarit"]');await pg.wait_for_timeout(100)
            assert await pg.evaluate("APP.P.appearance.pal")=={'t':'vastavarit','c':'#8D642C'}
            assert await pg.locator('[data-ap-pal="vastavarit"]').get_attribute('aria-pressed')=='true'
            await pg.fill('[data-ap-hex="c"]','#1F7275');await pg.dispatch_event('[data-ap-hex="c"]','change');await pg.wait_for_timeout(100)
            assert await pg.evaluate("APP.P.appearance.pal.c")=='#1F7275'
            pl=await pg.evaluate("APP_APPEARANCE.palette(APP.P,false)")
            assert await pg.evaluate("[0,1,2,3,4,5,6,7].map(i=>%s)"%css("h'+i+'"))==pl['h']
            assert await pg.evaluate("[0,1,2,3,4,5,6,7].map(i=>%s)"%css("project-h'+i+'"))==pl['h'],'värinäytteet seuraavat'
            # Palikka näyttää paikan värin
            bc=await pg.evaluate("getComputedStyle(document.querySelector('.ue[data-id=\"%s\"]')).getPropertyValue('--hc').trim()"%ids[3])
            assert bc in (pl['h'][3],'var(--h3)'),bc
            if W==1440:
                el=await pg.query_selector('#view-appearance-settings');await el.screenshot(path='varit_valitsin.png')
            # Paikka 3 omaksi väriksi ja takaisin
            await pg.evaluate("(function(){var c=document.querySelector('.ap-slotc');c.dataset.i='2';c.value='#7a1f5c';c.dispatchEvent(new Event('change',{bubbles:true}));})()");await pg.wait_for_timeout(100)
            assert await pg.evaluate("APP.P.appearance.pal.x")==[None,None,'#7A1F5C',None,None,None,None,None]
            assert await pg.evaluate(css('h2'))=='#7A1F5C'
            assert await pg.locator('[data-ap-sx="2"]').count()==1
            await pg.click('[data-ap-sx="2"]');await pg.wait_for_timeout(100)
            assert 'x' not in await pg.evaluate("APP.P.appearance.pal") and await pg.evaluate(css('h2'))==pl['h'][2]
            # Kumoa palauttaa edellisen valinnan
            await pg.click('#sheet [data-x="close"]');await pg.wait_for_timeout(100)
            await pg.keyboard.press('Meta+z' if False else 'Control+z');await pg.wait_for_timeout(150)
            assert await pg.evaluate("APP.P.appearance.pal.x[2]")=='#7A1F5C','Kumoa'
            await pg.keyboard.press('Control+Shift+z');await pg.wait_for_timeout(150)
            # Sateenkaari ilman omia paikkoja = ei kenttää; virhemerkki pysyy punaisena
            await pg.click('#setbtn');await pg.wait_for_timeout(150)
            await pg.click('[data-ap-pal="yksi"]');await pg.wait_for_timeout(100)
            assert await pg.evaluate(css('er'))=='#C2453A'
            ow=await pg.evaluate("(function(){var s=document.getElementById('sheet');return s.scrollWidth-s.clientWidth;})()");assert ow<=1,('vaakavieritys',W,ow)
            if W==1440:
                el=await pg.query_selector('#view-appearance-settings');await el.screenshot(path='varit_yksi.png')
            await pg.click('#sheet [data-x="close"]');await pg.wait_for_timeout(100)
            if W!=390:await pg.screenshot(path='varit_nakyma_%d.png'%W)
            before=await pg.evaluate("JSON.stringify(APP.P.appearance)")
            await pg.evaluate("APP.saveNow&&APP.saveNow()");await pg.wait_for_timeout(300)
            await pg.reload();await pg.wait_for_timeout(400)
            assert await pg.evaluate("JSON.stringify(APP.P.appearance)")==before,'tallennus säilyy'
            assert await pg.evaluate(css('h5'))==await pg.evaluate("APP_APPEARANCE.palette(APP.P,false).h[5]")
            await pg.click('#setbtn');await pg.wait_for_timeout(150)
            await pg.click('[data-ap-pal="sateenkaari"]');await pg.wait_for_timeout(100)
            assert 'pal' not in await pg.evaluate("APP.P.appearance")
            print(W,'3 valitsin ok',before)
            print('errs',errs);assert not errs
            await b.close()
asyncio.run(main())
