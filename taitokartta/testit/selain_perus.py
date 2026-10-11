"""Taitokartan selaintesti puhelinleveyksillä 390 ja 320 px.
Käy läpi: alku, valinta, suositukset, vaihto, lukittu vaihtoehto, paluu polulla, tallennus, asetukset, kahden kartan vaihto.
Ajetaan aja.sh:n kautta kansiossa tulosteet/ (kuvakaappaukset ja kahden kartan koeversio jäävät sinne)."""
import asyncio, json, os, re, sys
from playwright.async_api import async_playwright
HERE=os.path.dirname(os.path.abspath(__file__))
SRC=os.path.join(HERE,'..','index.html')
U='file://'+os.path.abspath(SRC)
bad=[]
def check(label,got,want):
    ok=got==want; print(('  ok   ' if ok else '  FAIL ')+label+('' if ok else '\n       sain   %r\n       odotin %r'%(got,want)))
    if not ok: bad.append(label)
OVER="""(function(){var w=document.documentElement.clientWidth,out=[];
 document.querySelectorAll('button,dialog[open]').forEach(function(e){var r=e.getBoundingClientRect();
  if(r.width&&r.height&&e.offsetParent!==null&&!e.closest('.path')&&(r.right>w+0.5||r.left<-0.5))out.push((e.id||e.textContent.slice(0,20))+' '+Math.round(r.left)+'..'+Math.round(r.right));});
 var m=document.getElementById('main');return JSON.stringify({w:w,doc:document.documentElement.scrollWidth,main:[m.scrollWidth,m.clientWidth],yli:out});})()"""
ROWS="[...document.querySelectorAll('#uselist .row')].filter(b=>!b.hidden).map(b=>b.firstChild.firstChild.textContent+'='+(b.className.replace('row','').trim()||'neutraali')+(b.querySelector('.tag').textContent?'['+b.querySelector('.tag').textContent+']':''))"
async def fits(pg,label):
    r=json.loads(await pg.evaluate(OVER)); ok=not r['yli'] and r['doc']<=r['w'] and r['main'][0]<=r['main'][1]
    check('mahtuu ruutuun: '+label, r if not ok else 'ok','ok')
def two_tree_file():
    s=open(SRC,encoding='utf8').read()
    m=re.search(r'(<script type="application/json" id="sisalto">)([\s\S]*?)(</script>)',s)
    c=json.loads(m.group(2))
    c['puut'].append({'paatoskartta':'puu','nimi':'Koekartta','kuvaus':'Toinen kartta testiä varten.','tekijat':[{'nimi':'Yksi','huomio':'Ensimmäinen.'},{'nimi':'Kaksi','vaatii':['Yksi'],'suosittelijat':['Yksi']}]})
    out=os.path.abspath('kaksi_karttaa.html'); open(out,'w',encoding='utf8').write(s[:m.start(2)]+'\n'+json.dumps(c,ensure_ascii=False)+'\n'+s[m.end(2):]); return 'file://'+out
async def run(p,w,h,U2):
    print('leveys',w)
    b=await p.chromium.launch(); errs=[]
    ctx=await b.new_context(viewport={'width':w,'height':h},device_scale_factor=2)
    pg=await ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
    rows=lambda: pg.evaluate(ROWS)
    msg=lambda: pg.inner_text('#use-msg')
    ctxt=lambda: pg.evaluate("document.getElementById('ctx').innerText.replace(/\\n/g,' ')")
    stored=lambda: pg.evaluate("localStorage.getItem('taitokartta:v1')")
    geo=lambda: pg.evaluate("JSON.stringify([document.getElementById('top').offsetHeight,document.getElementById('ctx').offsetHeight])")
    await pg.goto(U); await pg.wait_for_timeout(300)
    # 1 alku
    check('otsikko on kartan nimi',await pg.inner_text('#tname'),'Mikä taito nyt?')
    check('yhdellä kartalla otsikko ei ole painike',[await pg.is_disabled('#title'),await pg.is_hidden('#chev')],[True,True])
    check('alussa kolme vaihtoehtoa, kaikki neutraaleja',await rows(),['Tunne ylivoimainen=neutraali','Tunne voimakas mutta hallittavissa=neutraali','Tunne lievä, haluan toimia viisaasti=neutraali'])
    check('polkurivi alussa',await ctxt(),'Ei valintoja vielä')
    check('kuvaus näkyy alussa',await pg.locator('#introbox .lead').count(),1)
    check('piilossa olevien määrä kerrotaan',(await pg.inner_text('#use-hidden')).startswith('16 vaihtoehtoa ei ole vielä näkyvissä'),True)
    g0=await geo(); await fits(pg,'alku'); await pg.screenshot(path='tk_%d_alku.png'%w)
    # 2 valinta ja suositukset
    await pg.click('#uselist .row:has-text("Tunne ylivoimainen")'); await pg.wait_for_timeout(350)
    r=await rows()
    check('valittu saa numeron, muut voimakkuudet merkitään pois',r[:3],['Tunne ylivoimainen=sel[1]','Tunne voimakas mutta hallittavissa=excl[pois]','Tunne lievä, haluan toimia viisaasti=excl[pois]'])
    check('neljä taitoa suositellaan',[x for x in r if 'rec' in x],['STOP=rec[suositus]','TIPP: kylmä, liike, hengitys=rec[suositus]','Huomio hetkeksi muualle=rec[suositus]','Rauhoita itseäsi aisteilla=rec[suositus]'])
    check('polussa valinta ja Alusta',await ctxt(),'1 Tunne ylivoimainen Alusta')
    check('kuvaus poistuu, kun valintoja on',await pg.locator('#introbox .lead').count(),0)
    check('yläpalkin koko ei muutu',await geo(),g0)
    check('taidon kuvaus näkyy rivillä',await pg.locator('#uselist .row:has-text("STOP") small').inner_text(),'Seis. Ota askel taaksepäin. Havainnoi, mitä sisällä ja ympärillä tapahtuu. Etene tietoisesti.')
    await fits(pg,'valinnan jälkeen'); await pg.screenshot(path='tk_%d_valinta.png'%w)
    await pg.click('#uselist .row:has-text("STOP")'); await pg.wait_for_timeout(250)
    check('toinen valinta polkuun',await ctxt(),'1 Tunne ylivoimainen 2 STOP Alusta')
    # 3 vaihto poissuljettuun
    await pg.click('#uselist .row:has-text("Tunne voimakas mutta hallittavissa")'); await pg.wait_for_timeout(300)
    check('vaihto kertoo, mikä poistui',await msg(),'Vaihdettu. Poistui: Tunne ylivoimainen.')
    check('vaihdettu valinta tulee poistuneen paikalle',await ctxt(),'1 Tunne voimakas mutta hallittavissa 2 STOP Alusta')
    check('kumoa on tarjolla',await pg.is_visible('#use-undo'),True)
    await pg.click('#use-undo'); await pg.wait_for_timeout(250)
    check('kumoa palauttaa polun',await ctxt(),'1 Tunne ylivoimainen 2 STOP Alusta')
    # 4 lukittu vaihtoehto
    await pg.click('#use-showall'); await pg.wait_for_timeout(200)
    check('näytä kaikki tuo lukitut näkyviin',len([x for x in await rows() if 'lock' in x])>0,True)
    await pg.click('#uselist .row:has-text("Ongelmanratkaisu")'); await pg.wait_for_timeout(200)
    check('lukittu kertoo, mitä puuttuu',await msg(),'Tarvitsee vielä: Tunne vastaa tosiasioita ja Tilanteen voi ratkaista.')
    await fits(pg,'kaikki näkyvissä')
    await pg.click('#use-showall'); await pg.wait_for_timeout(200)
    check('lukitut saa taas piiloon',len([x for x in await rows() if 'lock' in x]),0)
    # 5 tallennus: vain nimet, säilyy latauksen yli
    s=json.loads(await stored())
    check('muistissa on vain kartan nimi, valintojen nimet ja ulkoasu',s,{'cur':'Mikä taito nyt?','sel':{'Mikä taito nyt?':['Tunne ylivoimainen','STOP']},'cfg':{'tint':'vihrea','mode':'auto'}})
    await pg.reload(); await pg.wait_for_timeout(300)
    check('valinnat säilyvät latauksen yli',await ctxt(),'1 Tunne ylivoimainen 2 STOP Alusta')
    # 6 paluu polulla ja alusta
    await pg.click('#ctx .pchip[data-k="0"]'); await pg.wait_for_timeout(250)
    check('polun kohta palauttaa siihen',[await ctxt(),await msg()],['1 Tunne ylivoimainen Alusta','Palasit kohtaan 1.'])
    await pg.click('#ctx .pchip.reset'); await pg.wait_for_timeout(250)
    check('alusta tyhjentää',[await ctxt(),len(await rows())],['Ei valintoja vielä',3])
    # 7 polun loppu
    for n in ['Tunne lievä, haluan toimia viisaasti','Tilannetta ei voi nyt muuttaa','Kyse on toisesta ihmisestä','Tarkista tosiasiat','Tunne ei vastaa tosiasioita','Hyödyt ja haitat','Rauhoita itseäsi aisteilla','Vastakkainen toiminta','Radikaali hyväksyminen','DEAR MAN: pyydä tai kieltäydy','Suhde edellä vai itsekunnioitus edellä?','STOP','TIPP: kylmä, liike, hengitys','Huomio hetkeksi muualle']:
        loc=pg.locator('#uselist .row:not([hidden]) >> text="%s"'%n)
        if await loc.count(): await loc.first.click(); await pg.wait_for_timeout(60)
    await pg.wait_for_timeout(250)
    check('pitkä polku ei kasvata yläpalkkia',await geo(),g0)
    check('kun valittavaa ei ole, se kerrotaan',[await pg.is_visible('#use-end'),len([x for x in await rows() if 'neutraali' in x or 'rec' in x])],[True,0])
    await fits(pg,'pitkä polku'); await pg.screenshot(path='tk_%d_pitka.png'%w)
    # 8 asetukset
    await pg.click('[data-tab="set"]'); await pg.wait_for_timeout(250)
    check('asetuksissa yläpalkki on saman kokoinen',await geo(),g0)
    solid=lambda: pg.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--solid').trim()")
    s0=await solid(); await pg.click('#set-tint [data-v="sininen"]'); await pg.wait_for_timeout(150)
    check('korostusväri vaihtuu',[s0,await solid()],['#1F7A37','#0066E0'])
    await pg.click('#set-mode [data-v="dark"]'); await pg.wait_for_timeout(150)
    check('tumma tila vaihtaa taustan',await pg.evaluate("getComputedStyle(document.body).backgroundColor"),'rgb(0, 0, 0)')
    await fits(pg,'asetukset'); await pg.screenshot(path='tk_%d_asetukset_tumma.png'%w)
    check('sisällön tiedot näkyvät',(await pg.inner_text('#contentinfo')).endswith('Karttoja on yksi. Sisällön versio: 11.10.2026.'),True)
    await pg.click('#clear'); check('tyhjennys vaatii vahvistuksen',await pg.inner_text('#clear'),'Vahvista: tyhjennä')
    await pg.click('#clear'); await pg.wait_for_timeout(150)
    check('tyhjennys poistaa valinnat muistista',json.loads(await stored())['sel'],{})
    await pg.click('[data-tab="use"]'); await pg.wait_for_timeout(250)
    check('tyhjennyksen jälkeen kartta on alussa',[await ctxt(),len(await rows())],['Ei valintoja vielä',3])
    await pg.screenshot(path='tk_%d_alku_tumma.png'%w)
    await ctx.close()
    # 9 kaksi karttaa: vaihto ja omat valinnat kummallekin; vanhentunut nimi muistissa ei haittaa
    ctx=await b.new_context(viewport={'width':w,'height':h},device_scale_factor=2)
    seed={'cur':'Poistettu kartta','sel':{'Mikä taito nyt?':['Tunne ylivoimainen','Poistettu taito','STOP'],'Poistettu kartta':['x']},'cfg':{'tint':'outo','mode':'auto'}}
    await ctx.add_init_script("if(!localStorage.getItem('taitokartta:v1'))localStorage.setItem('taitokartta:v1', %s);"%json.dumps(json.dumps(seed)))
    pg=await ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(U2); await pg.wait_for_timeout(300)
    check('vanhentunut muisti: poistunut kartta ja taito putoavat, loput säilyvät',[await pg.inner_text('#tname'),await ctxt()],['Mikä taito nyt?','1 Tunne ylivoimainen 2 STOP Alusta'])
    check('kahdella kartalla otsikko on painike',[await pg.is_disabled('#title'),await pg.is_visible('#chev')],[False,True])
    await pg.click('#title'); await pg.wait_for_timeout(250)
    check('karttalista näyttää molemmat ja valintojen määrän',await pg.evaluate("[...document.querySelectorAll('#ts-list .row')].map(b=>b.firstChild.firstChild.textContent+'|'+b.querySelector('.tag').textContent+'|'+(b.classList.contains('pick')?'nyt':''))"),['Mikä taito nyt?|2 valintaa|nyt','Koekartta||'])
    await fits(pg,'karttalista'); await pg.screenshot(path='tk_%d_kartat.png'%w)
    await pg.click('#ts-list .row:has-text("Koekartta")'); await pg.wait_for_timeout(300)
    check('kartta vaihtuu',[await pg.inner_text('#tname'),await rows(),await ctxt()],['Koekartta',['Yksi=neutraali'],'Ei valintoja vielä'])
    await pg.click('#uselist .row:has-text("Yksi")'); await pg.wait_for_timeout(250)
    check('toisen kartan suositus toimii',await rows(),['Yksi=sel[1]','Kaksi=rec[suositus]'])
    await pg.click('#title'); await pg.wait_for_timeout(200); await pg.click('#ts-list .row:has-text("Mikä taito nyt?")'); await pg.wait_for_timeout(300)
    check('ensimmäisen kartan valinnat ovat tallella',await ctxt(),'1 Tunne ylivoimainen 2 STOP Alusta')
    s=json.loads(await pg.evaluate("localStorage.getItem('taitokartta:v1')"))
    check('kummankin kartan valinnat ovat erikseen muistissa',s['sel'],{'Mikä taito nyt?':['Tunne ylivoimainen','STOP'],'Koekartta':['Yksi']})
    check('sivuvirheitä ei ole',errs,[])
    await b.close()
async def main():
    U2=two_tree_file()
    async with async_playwright() as p:
        await run(p,390,800,U2); await run(p,320,640,U2)
    print('KAIKKI OK' if not bad else 'VIRHEITÄ: '+'; '.join(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
