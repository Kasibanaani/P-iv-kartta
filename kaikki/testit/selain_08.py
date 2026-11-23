"""Kaikki 0.8 (Emil 22.11.2026): koko vault ZIP-tiedostona, aina sama nimi Kaikki-vault.zip.
Tarkistaa: nappi Vienti ja tuonti -ikkunassa vain vaultin ollessa käytössä, ZIP avautuu (Pythonin zipfile, CRC tarkistetaan),
mukana kaikki vaultin tekstitiedostot myös piilotetuista kansioista, ääkköset nimissä ja sisällössä, juuri tehty oma muutos uusimpana,
VARMUUSKOPIO.txt. Leveydet 390 ja 1280 px. Käyttö: python3 testit/selain_08.py"""
import asyncio, os, sys, json, io, zipfile, base64
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
FAKE=open(os.path.join(D,'fakegh.js'),encoding='utf8').read()
def md(t,body): return '---\ntyyppi: tieto\notsikko: %s\nkuvaus: \nluotu: 2026-11-20\nlahde: emil\n---\n# %s\n\n%s\n'%(t,t,body)
SEED={'AGENTS.md':'# Ohje\n','ohjeet/data.md':'---\ntyyppi: ohje\n---\n# Data\n','arkisto/vanha.md':md('Vanha','Arkistoitu.'),
      'data/paiva.csv':'pvm,energia\n2026-11-20,3\n','tieto/äänet-ja-värit.md':md('Äänet ja värit','Hyvää yötä, öljyä ja ääkkösiä.'),
      'inbox/muokattava.md':md('Muokattava','Alkuperäinen teksti.')}
GRAB="""(function(){window.__zip=null;try{delete navigator.canShare;}catch(e){}navigator.canShare=undefined;window.showSaveFilePicker=undefined;
  var oc=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){if(this.download==='Kaikki-vault.zip'){var name=this.download;fetch(this.href).then(function(r){return r.arrayBuffer();}).then(function(b){var u=new Uint8Array(b),s='';for(var i=0;i<u.length;i++)s+=String.fromCharCode(u[i]);window.__zip={name:name,b64:btoa(s)};});return;}return oc.apply(this,arguments);};})()"""
async def run(p,w,h):
    try: b=await p.chromium.launch()
    except Exception: b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    errs=[]; bad=[]
    pg=await (await b.new_context(viewport={'width':w,'height':h})).new_page()
    await pg.add_init_script(FAKE+";(function(){var S=%s;if(!window.__repo.kept)for(var k in S)window.__repo.put(k,S[k]);try{localStorage.setItem('kaikki:gh',JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}))}catch(e){}})();"%json.dumps(SEED))
    pg.on('pageerror',lambda e:(errs.append(str(e)),print('  PAGEERR',e)))
    def want(label,cond,info=''):
        print('  %-48s %s %s'%(label,'ok' if cond else 'VIRHE',info if not cond else ''))
        if not cond: bad.append(label)
    print('leveys',w)
    await pg.goto(U); await pg.wait_for_timeout(1500)
    # Paikallista sisältöä, jota tavallinen tallennus ei ole vielä jonottanut.
    await pg.evaluate(r"""() => {
      const notes = KaikkiTesti.notes();
      const note = notes.find(n => n.vp === 'inbox/muokattava.md');
      note.text = note.text.replace('Alkuperäinen teksti.', 'Muokattu apissa.');
      const date = '2026-11-20T10:00:00.000Z';
      notes.push({id:'luonnos-testi', created:date, edited:date, text:'Uusi luonnos\nSisältö testiin.'});
      window.__beforeZip = __repo.log.length;
    }""")
    await pg.evaluate(GRAB)
    await pg.evaluate("document.getElementById('xbtn').click()"); await pg.wait_for_timeout(200)
    want('ZIP-nappi näkyy Vienti ja tuonti -ikkunassa',await pg.is_visible('#vs-zip'))
    await pg.click('#vs-zip')
    try: await pg.wait_for_function('window.__zip',timeout=8000)
    except Exception: pass
    z=await pg.evaluate("window.__zip")
    want('tiedosto annettu tallennettavaksi',z is not None)
    if z:
        want('nimi aina Kaikki-vault.zip',z['name']=='Kaikki-vault.zip',z['name'])
        try:
            zf=zipfile.ZipFile(io.BytesIO(base64.b64decode(z['b64'])))
            want('ZIP ehjä (CRC)',zf.testzip() is None)
            names=set(zf.namelist())
            want('kaikki vaultin tiedostot mukana',set(SEED)<=names,sorted(set(SEED)-names))
            want('ääkköset nimessä ja sisällössä',zf.read('tieto/äänet-ja-värit.md').decode('utf8').find('öljyä')>=0)
            want('oma muutos uusimpana',zf.read('inbox/muokattava.md').decode('utf8').find('Muokattu apissa.')>=0)
            drafts=[path for path in names if path.startswith('inbox/') and path.endswith('-uusi-luonnos.md')]
            want('uusi luonnos mukana',len(drafts)==1 and 'Sisältö testiin.' in zf.read(drafts[0]).decode('utf8'),drafts)
            info=zf.read('VARMUUSKOPIO.txt').decode('utf8')
            want('VARMUUSKOPIO.txt: repo ja määrä','testi/vault' in info and 'Tiedostoja: %d'%(len(SEED)+1) in info,info)
        except Exception as e: want('ZIP avautuu',False,str(e))
    sent=await pg.evaluate('() => __repo.log.slice(__beforeZip).filter(line => /^(PUT|DELETE|PATCH|POST) /.test(line))')
    want('ZIP ei lähetä muutoksia Vaultiin',not sent,sent)
    want('ZIP ei vaihda luonnoksen paikallista tilaa',
         await pg.evaluate("!KaikkiTesti.notes().find(n => n.id === 'luonnos-testi').vp"))
    want('ilmoitus ikkunassa',await pg.evaluate("/Kaikki-vault\\.zip/.test(document.getElementById('vs-msg').textContent)"))
    # ilman vaultia nappi piilossa (uusi ikkuna ilman yhteystietoja)
    pg2=await (await b.new_context(viewport={'width':w,'height':h})).new_page()
    await pg2.goto(U); await pg2.wait_for_timeout(800)
    await pg2.evaluate("document.getElementById('xbtn').click()"); await pg2.wait_for_timeout(200)
    want('ilman vaultia ZIP-nappi piilossa',not await pg2.is_visible('#vs-zip'))
    want('ei sivuvirheitä',not errs,errs)
    await b.close(); return bad
async def main():
    async with async_playwright() as p:
        bad=[]
        for w,h in ((1440,900),(1280,800),(390,844),(320,700)): bad+=await run(p,w,h)
    print('KAIKKI OK' if not bad else 'VIRHEITÄ: '+', '.join(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
