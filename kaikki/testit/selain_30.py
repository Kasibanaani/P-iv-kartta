"""Kaikki 0.30 (Emil 22.11.2026, A0.1–A0.3): Taulukot kuin Sheets.
Tarkistaa: koko leveys ja kompakti rivi tietokoneella, valinta napsautuksella ja kaavarivi, nuolet, kirjoittaminen aloittaa muokkauksen ja
Enter vahvistaa ja siirtyy alas, Esc peruu, Tab oikealle, kaava lasketaan heti, Delete tyhjentää, alue vetämällä, ⌘C/⌘V sarkaineroteltuna
(myös rivien lisäys liitettäessä), ⌘Z ja ⇧⌘Z, muutokset tallentuvat vaultiin yhtenä eränä, sarakkeen leveys raahaamalla ja kaksoisnapsautuksella
sovitus (tallennus alkutietoihin), puhelimella napautus valitsee ja toinen napautus muokkaa. Leveydet 1440, 1280, 390, 320.
Käyttö: python3 testit/selain_30.py"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
FAKE=open(os.path.join(D,'fakegh.js'),encoding='utf8').read()
P='taulukot/budjetti/kulut.md'
SEED={P:'---\ntyyppi: taulukko\notsikko: Kulut\ntaulukko: Budjetti\n---\n# Kulut\n\n| Asia | Hinta | Määrä | Yht |\n| --- | --- | --- | --- |\n| Maali | 25 | 4 | =B1*C1 |\n| Pensselit | 8 | 3 | =B2*C2 |\n| Teippi | 4.5 | 2 | =B3*C3 |\n'}
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    phone=w<1000
    ctx=await b.new_context(viewport={'width':w,'height':h},has_touch=phone)
    await ctx.grant_permissions(['clipboard-read','clipboard-write'])
    pg=await ctx.new_page()
    await pg.add_init_script(FAKE+";(function(){var S=%s;if(!window.__repo.kept)for(var k in S)window.__repo.put(k,S[k]);try{localStorage.setItem('kaikki:gh',JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}))}catch(e){}})();"%json.dumps(SEED))
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond,info=''):
        print('  %-56s %s %s'%(label,'ok' if cond else 'VIRHE',info if not cond else ''))
        if not cond: bad.append(label)
    def cell(r,c): return pg.locator('#sg-wrap td[data-r="%d"][data-c="%d"]'%(r,c))
    async def txt(r,c): return (await cell(r,c).text_content()).strip()
    async def saved(t):
        try: await pg.wait_for_function('([p,t])=>(__repo.get(p)||"").includes(t)',arg=[P,t],timeout=8000); return True
        except Exception: return False
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(1200)
    if phone:
        await pg.click('#roll'); await pg.click('#section-sheets')
    else: await pg.click('#nav [data-tab="sheets"]')
    await pg.wait_for_timeout(300)
    if not phone:
        g=await pg.evaluate("(function(){var w=document.getElementById('sg-wrap').getBoundingClientRect(),m=document.getElementById('p-sheets');return {w:w.width,m:m.clientWidth,hh:w.height,h:document.querySelector('#sg-wrap td').getBoundingClientRect().height};})()")
        want('koko leveys, näkyvä korkeus ja kompakti rivi',g['w']>=g['m']-40 and g['hh']>100 and g['h']<=30,g)
    # valinta ja kaavarivi
    if phone: await cell(0,3).tap()
    else: await cell(0,3).click()
    want('valinta näkyy osoitteessa ja kaavarivillä',await pg.evaluate("[document.getElementById('sg-addr').textContent,document.getElementById('sg-fx').value]")==['D1','=B1*C1'])
    if phone:
        await cell(0,1).tap(); await cell(0,1).tap(); await pg.wait_for_timeout(100)
        want('puhelin: toinen napautus aloittaa muokkauksen',await pg.evaluate("!!document.querySelector('#sg-wrap .sg-ed')"))
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(100)
        want('Esc peruu muokkauksen',await pg.evaluate("!document.querySelector('#sg-wrap .sg-ed')") and await txt(0,1)=='25')
        await b.close();
        want_errs=not errs
        print('  %-56s %s'%('ei sivuvirheitä','ok' if want_errs else 'VIRHE'))
        return bad+([] if want_errs else ['sivuvirhe'])
    # nuolet + kirjoitus + Enter
    await pg.keyboard.press('ArrowLeft'); await pg.keyboard.press('ArrowLeft')
    want('nuolet siirtävät',await pg.evaluate("document.getElementById('sg-addr').textContent")=='B1')
    await pg.keyboard.type('30'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(150)
    want('kirjoitus + Enter: arvo ja kaava lasketaan heti',await txt(0,1)=='30' and await txt(0,3)=='120',[await txt(0,1),await txt(0,3)])
    want('Enter siirtää alas',await pg.evaluate("document.getElementById('sg-addr').textContent")=='B2')
    await pg.keyboard.type('99'); await pg.keyboard.press('Escape'); await pg.wait_for_timeout(100)
    want('Esc peruu',await txt(1,1)=='8')
    await pg.keyboard.press('Tab')
    want('Tab oikealle',await pg.evaluate("document.getElementById('sg-addr').textContent")=='C2')
    # kaavarivi
    await pg.click('#sg-fx'); await pg.fill('#sg-fx','5'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(150)
    want('kaavarivillä muokkaus',await txt(1,2)=='5' and await txt(1,3)=='40',[await txt(1,2),await txt(1,3)])
    want('tallentuu vaultiin erissä',await saved('| 30 |') and await saved('| 5 |'))
    want('tila Tallennettu',await pg.evaluate("document.getElementById('sg-status').textContent")=='Tallennettu')
    # alue vetämällä, Delete
    b0=await cell(2,1).bounding_box(); b1=await cell(2,2).bounding_box()
    await pg.mouse.move(b0['x']+5,b0['y']+5); await pg.mouse.down(); await pg.mouse.move(b1['x']+5,b1['y']+5,steps=4); await pg.mouse.up()
    want('alue vetämällä',await pg.evaluate("document.getElementById('sg-addr').textContent")=='B3:C3')
    await pg.keyboard.press('Delete'); await pg.wait_for_timeout(150)
    want('Delete tyhjentää alueen',await txt(2,1)=='' and await txt(2,2)=='')
    await pg.keyboard.press('ControlOrMeta+z'); await pg.wait_for_timeout(150)
    want('⌘Z kumoaa',await txt(2,1)=='4,5' or await txt(2,1)=='4.5',await txt(2,1))
    await pg.keyboard.press('ControlOrMeta+Shift+z'); await pg.wait_for_timeout(150)
    want('⇧⌘Z tekee uudelleen',await txt(2,1)=='')
    await pg.keyboard.press('ControlOrMeta+z'); await pg.wait_for_timeout(150)
    # kopioi ja liitä (sarkaineroteltu, rivejä lisää)
    await cell(0,0).click(); await pg.keyboard.press('Shift+ArrowDown'); await pg.keyboard.press('ControlOrMeta+c')
    clip=await pg.evaluate("navigator.clipboard.readText()")
    want('⌘C kopioi sarkaineroteltuna',clip=='Maali\nPensselit',repr(clip))
    await pg.evaluate("navigator.clipboard.writeText('Rulla\\t12\\t1\\nSuoja\\t3\\t2')")
    await cell(2,0).click(); await pg.keyboard.press('ArrowDown') if False else None
    await pg.evaluate("(function(){var w=document.getElementById('sg-wrap');var dt=new DataTransfer();dt.setData('text/plain','Rulla\\t12\\t1\\nSuoja\\t3\\t2');w.dispatchEvent(new ClipboardEvent('paste',{clipboardData:dt,bubbles:true}));})()")
    await pg.wait_for_timeout(200)
    want('⌘V liittää ja lisää rivin',await txt(2,0)=='Rulla' and await txt(3,0)=='Suoja' and await txt(3,1)=='3',[await txt(2,0),await txt(3,0)])
    want('liitetty tallentuu',await saved('| Suoja | 3 | 2 |'))
    # sarakkeen leveys
    col0=await pg.evaluate("document.querySelectorAll('#sg-wrap col')[2].style.width")
    hb=await pg.locator('#sg-wrap th.sg-ch[data-c="1"] .sg-rz').bounding_box()
    await pg.mouse.move(hb['x']+4,hb['y']+5); await pg.mouse.down(); await pg.mouse.move(hb['x']+84,hb['y']+5,steps=5); await pg.mouse.up(); await pg.wait_for_timeout(200)
    col1=await pg.evaluate("document.querySelectorAll('#sg-wrap col')[2].style.width")
    want('sarakkeen leveys raahaamalla',col1!=col0 and int(col1[:-2])>=int(col0[:-2])+70,(col0,col1))
    want('leveydet tallentuvat alkutietoihin',await saved('leveydet: 160, '))
    await pg.locator('#sg-wrap th.sg-ch[data-c="0"] .sg-rz').dblclick(); await pg.wait_for_timeout(300)
    c0=await pg.evaluate("parseInt(document.querySelectorAll('#sg-wrap col')[1].style.width)")
    want('kaksoisnapsautus sovittaa sisältöön',c0<160,c0)
    want('ei sivuttaisvieritystä (sivu)',await pg.evaluate("document.documentElement.scrollWidth<=innerWidth"))
    want('ei sivuvirheitä',not errs,errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((1440,900),(1280,800),(390,844),(320,640)): bad+=await run(p,w,h)
    print('KAIKKI OK' if not bad else 'VIRHEITÄ: '+', '.join(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
