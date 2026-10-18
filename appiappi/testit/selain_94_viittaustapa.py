# Jonon 12f (F39/F41): viittaustapa. Oletus @: paneeli, viitelappu ja suora kirjoitus näyttävät @viite, @ tuo ehdotukset,
# tuntematon @sana tarjoaa Luo Arvo, ＋ Viittaus lisää @viite. ⚙︎ Asetukset → Muokkaus → Viittaus tekstissä: @, § tai { };
# vaihto näyttää vanhat tekstit heti uudella tavalla, valinta säilyy selaimessa uudelleenlatauksen yli, projekti ei muutu.
# Kaava hyväksyy @:n. Tietokone 1440 ja 1280, 390 savutestinä. Ei oikeaa iPhonea.
import asyncio, os, re
from playwright.async_api import async_playwright
from yhteinen import *
SETUP="""(function(){var P=APP.P,v1=P.views[0].id;
 var m=KK.addBlock(P,'muisti',{v:'7'});KK.setName(P,m.id,'Unipisteet');KK.addNode(P,m.id,60,180);
 var q=KK.addBlock(P,'arvo',{v:'hyvä'});KK.setName(P,q.id,'Laatu');KK.addNode(P,q.id,60,300);
 var a=KK.addBlock(P,'muoto',{v:v1,tx:'Unta {#'+m.id+'} h, {#'+q.id+'}'});a.x=60;a.y=120;
 var c=KK.addBlock(P,'nayta',{v:v1,tx:'Posti emil@x.fi'});c.x=60;c.y=300;
 KK.repair(P);KK.tick(P,APP.ctx());APP.renderAll();return {a:a.id,c:c.id,m:m.id,q:q.id};})()"""
def S(i,x=''):return '#uels .ue[data-id="%s"]%s'%(i,x)
async def tx(pg,i):return await pg.evaluate("(i)=>APP.P.b[i].tx",i)
async def lappu(pg,i):return await pg.evaluate("(i)=>{var e=document.querySelector('#uels .ue[data-id=\"'+i+'\"] .vlap');return e&&e.getAttribute('data-l');}",i)
async def valitse(pg,i):
    await pg.evaluate("(i)=>{APP.S.sel={t:'b',id:i};APP.S.multi=[];APP.renderAll();}",i);await pg.wait_for_timeout(150)
async def tapa(pg,v):
    await pg.click('#setbtn');await pg.wait_for_timeout(200)
    await pg.click('#sheet [data-cfg="viit"][data-v="%s"]'%v);await pg.wait_for_timeout(200)
    await pg.click('#sheet [data-x="close"]');await pg.wait_for_timeout(200)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for W in ((int(os.environ['VAIN']),) if os.environ.get('VAIN') else (1440,1280,390)):
            mob=W<500;H=844 if mob else 900
            ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,reduced_motion='reduce')
            pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
            await pg.goto(U);await pg.wait_for_timeout(250)
            await pg.fill('#wname','Viittaustapa');await pg.click('#wcreate');await pg.wait_for_timeout(150)
            I=await pg.evaluate(SETUP);await pg.wait_for_timeout(200)
            M,Q=I['m'],I['q']
            # 1) Oletus @: lappu ja paneeli näyttävät viitteen, arvo palikassa ennallaan, sähköposti ei muutu
            assert await lappu(pg,I['a'])=='@unipisteet, @laatu',await lappu(pg,I['a'])
            assert (await pg.inner_text(S(I['a'],' .in'))).strip()=='Unta 7 h, hyvä'
            await valitse(pg,I['a'])
            assert await pg.input_value('#insp [data-k="tx"]')=='Unta @unipisteet h, @laatu'
            if mob:
                print(W,'errs',errs);assert not errs;await ctx.close();continue
            # 2) Paneelissa @ tuo ehdotukset, valinta kirjoittaa @viite; tallennus tunnisteena
            f=pg.locator('#insp input[data-k="tx"]');await f.click();await f.press('End');await f.type(' ja @un');await pg.wait_for_timeout(150)
            sug=await pg.eval_on_selector_all('#insp .fsug [data-fsug]','e=>e.map(x=>x.getAttribute("data-fsug"))');print(W,'ehdotukset',sug)
            assert sug and sug[0]=='@unipisteet',sug
            await pg.click('#insp .fsug [data-fsug="@unipisteet"]');await pg.wait_for_timeout(150)
            assert await f.input_value()=='Unta @unipisteet h, @laatu ja @unipisteet'
            assert await tx(pg,I['a'])=='Unta {#%s} h, {#%s} ja {#%s}'%(M,Q,M)
            # 3) Tuntematon @sana jää tekstiksi; ehdotusrivillä Luo Arvo, joka tekee palikan ja viitteen
            await f.type(' @kesä');await pg.wait_for_timeout(150)
            assert await tx(pg,I['a'])=='Unta {#%s} h, {#%s} ja {#%s} @kesä'%(M,Q,M),'tuntematon jää tekstiksi'
            assert 'ei palikkaa' in await pg.inner_text('#insp .fsug')
            await pg.click('#insp .fsug [data-tluo="kesä"]');await pg.wait_for_timeout(250)
            ke=await P(pg,"B('kesä')&&B('kesä').id");assert ke,'Arvo kesä luotiin'
            assert await tx(pg,I['a'])=='Unta {#%s} h, {#%s} ja {#%s} {#%s}'%(M,Q,M,ke),await tx(pg,I['a'])
            # 4) @@ = merkki tekstinä
            await pg.fill('#insp input[data-k="tx"]','Kirjoita @@laatu');await pg.wait_for_timeout(150)
            assert await tx(pg,I['a'])=='Kirjoita @laatu' and (await pg.inner_text(S(I['a'],' .in'))).strip()=='Kirjoita @laatu'
            await valitse(pg,I['a']);assert await pg.input_value('#insp [data-k="tx"]')=='Kirjoita @@laatu'
            # 5) ＋ Viittaus lisää @viite
            await pg.fill('#insp input[data-k="tx"]','Laatu: ');await pg.wait_for_timeout(100)
            await pg.click('#insp [data-ins="tx"]');await pg.wait_for_timeout(200)
            await pg.locator('#menu button').filter(has_text=re.compile('^Laatu$')).first.click();await pg.wait_for_timeout(200)
            await pg.locator('#menu button').filter(has_text=re.compile('^Arvo$')).first.click();await pg.wait_for_timeout(200)
            assert await tx(pg,I['a'])=='Laatu: {#%s}'%Q,await tx(pg,I['a'])
            await valitse(pg,I['a']);assert await pg.input_value('#insp [data-k="tx"]')=='Laatu: @laatu'
            # 6) Suora kirjoitus: @ tuo ehdotukset, Enter ottaa ehdotuksen, täysi viite + Enter tallentaa
            await pg.dblclick(S(I['a']));await pg.wait_for_timeout(200)
            assert await pg.evaluate("document.querySelector('#uels textarea.tedit').value")=='Laatu: @laatu'
            assert '@ tuo viitteen' in await pg.inner_text('#tedbox')
            await pg.keyboard.type(' @uni');await pg.wait_for_timeout(150);await pg.keyboard.press('Enter');await pg.wait_for_timeout(150)
            assert await pg.evaluate("document.querySelector('#uels textarea.tedit').value")=='Laatu: @laatu @unipisteet'
            await pg.keyboard.press('Enter');await pg.wait_for_timeout(200)
            assert await pg.evaluate("!document.querySelector('#uels textarea.tedit')"),'täysi viite + Enter tallentaa'
            assert await tx(pg,I['a'])=='Laatu: {#%s} {#%s}'%(Q,M)
            # 7) Tapa { }: sama teksti näkyy nimin heti, projekti ei muutu; valinta säilyy uudelleenlatauksessa
            t0=await tx(pg,I['a'])
            await tapa(pg,'{');await valitse(pg,I['a'])
            assert await pg.input_value('#insp [data-k="tx"]')=='Laatu: {Laatu} {Unipisteet}'
            assert await lappu(pg,I['a'])=='{Laatu}, {Unipisteet}'
            assert await tx(pg,I['a'])==t0,'tallennus ennallaan'
            assert await pg.evaluate("APP.data.cfg.viit")=='{' and 'viit' not in await P(pg,"Object.keys(P)")
            await pg.evaluate("APP.saveNow&&APP.saveNow()");await pg.reload();await pg.wait_for_timeout(400)
            assert await pg.evaluate("APP.data.cfg.viit")=='{','valinta säilyy'
            await valitse(pg,I['a']);assert await pg.input_value('#insp [data-k="tx"]')=='Laatu: {Laatu} {Unipisteet}'
            # 8) Tapa §: §viite, ja @ on silloin tavallinen merkki
            await tapa(pg,'§');await valitse(pg,I['a'])
            assert await pg.input_value('#insp [data-k="tx"]')=='Laatu: §laatu §unipisteet'
            await pg.fill('#insp input[data-k="tx"]','§laatu @laatu');await pg.wait_for_timeout(150)
            assert await tx(pg,I['a'])=='{#%s} @laatu'%Q
            await tapa(pg,'@')
            # 9) Kaava hyväksyy @:n ja näyttää paljaan viitteen
            kf=await pg.evaluate("()=>{var P=APP.P,k=KK.addBlock(P,'kaava',{f:KK.kaavaToIds(P,'@unipisteet + 3')});KK.addNode(P,k.id,300,60);KK.tick(P,APP.ctx());APP.renderAll();return [APP.ev().val(k.id),KK.kaavaToText(P,k.f)];}")
            assert kf==[10,'unipisteet + 3'],kf
            print(W,'errs',errs);assert not errs
            await ctx.close()
        await b.close()
asyncio.run(main())
