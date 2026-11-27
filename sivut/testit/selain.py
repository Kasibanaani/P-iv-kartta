"""Sivun käyttö, paikallinen tallennus, rajattu Vault ja rinnakkaismuutos."""

import base64
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
from urllib.parse import unquote, urlparse

from playwright.sync_api import expect, sync_playwright

HTML = Path(__file__).resolve().parents[1] / 'index.html'
APP = 'https://sivut.test/'
REPO = 'Kasibanaani/vault123'
API = 'https://api.github.com/repos/' + REPO
REGISTRY = 'data/sivut-lahteet.json'
TRAINING = 'sivut/treeni.md'
SOURCE = 'alueet/treeni/voimadata.md'
UNRELATED = 'tieto/vanha.md'
SCOPED_PROSE = 'alueet/treeni/yleinen.md'
NEXT = 'sivut/seuranta.md'
TODAY = '2026-11-28'


def note(title, body):
    return '---\ntyyppi: tieto\notsikko: '+title+'\nluotu: '+TODAY+'\nlahde: emil\n---\n# '+title+'\n\n'+body+'\n'


def sha(text):
    return hashlib.sha1(text.encode()).hexdigest()


def setup(browser, width):
    page = browser.new_page(viewport={'width':width,'height':850}, is_mobile=width<500, has_touch=width<500)
    page.clock.set_fixed_time(datetime(2026,11,28,8,tzinfo=timezone.utc))
    errors = []
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.route(APP+'**',lambda route:route.fulfill(path=HTML,content_type='text/html; charset=utf-8'))
    return page, errors


def create(page,title,kind='page'):
    if kind=='page':
        page.get_by_role('button',name='Sivut',exact=True).click()
        page.get_by_role('button',name='Uusi sivu',exact=True).last.click()
    else:
        page.get_by_role('button',name='Muistiinpanot',exact=True).click()
        page.get_by_role('button',name='Uusi',exact=True).click()
    page.get_by_role('textbox',name='Nimi',exact=True).fill(title)
    page.get_by_role('button',name='Luo',exact=True).click()
    return page.get_by_role('textbox',name='Muistiinpanon teksti')


def offline(browser,width):
    page, errors=setup(browser,width)
    page.goto(APP)
    expect(page.get_by_role('heading',name='Omat sivut')).to_be_visible()
    editor=create(page,'Treeni')
    editor.fill('''## Tänään
**Oma merkintä**

((määrä: =LIUKUSÄÄDIN(min = 0; max = 10; askel = 1; alku = 4; tallenna = "ei")))
((Kaksin: =määrä * 2))
((ohje: =NÄYTÄ(määrä > 5; "Anna palaa!")))
((rauha: =KYTKIN("Rauhoita ilta")))
((vastaus: =VALINTA(true; false; tyhjä = "Kirjaamatta")))
((luku: =LUKUKENTTÄ(min = 0; max = 20; alku = 6)))
((askel: =ASKELLUS(min = 0; max = 10)))
((lista: =TARKISTUSLISTA("Tiskit"; "Eväät")))
((=KOKEILU()))
((=PAINIKE("Kirjaa sarja"; KIRJAA("Penkki"; toistot = määrä))))
((Summa: =SUMMA(SARJA("Penkki"; "toistot"))))
((Viiva: =KUVAAJA(SARJA("Penkki"; "toistot"); aika = "7 päivää"; esitys = "viiva")))
((Pylväät: =KUVAAJA(SARJA("Penkki"; "toistot"); aika = "7 päivää"; esitys = "pylväät")))
''')
    page.get_by_role('button',name='Käyttötila',exact=True).click()
    expect(page.locator('main h1')).to_have_text('Treeni')
    expect(page.locator('main strong')).to_have_text('Oma merkintä')
    expect(page.locator('[data-layout="nimi:kaksin:1"] .card-value')).to_have_text('8')
    slider=page.get_by_role('slider',name='määrä')
    slider.fill('7')
    expect(page.get_by_text('Anna palaa!',exact=True)).to_be_visible()
    expect(page.locator('[data-layout="nimi:kaksin:1"] .card-value')).to_have_text('14')
    page.get_by_role('switch',name='Rauhoita ilta').check()
    page.get_by_role('button',name='Ei',exact=True).click()
    page.get_by_role('button',name='askel lisää').click()
    page.get_by_role('checkbox',name='Tiskit').check()
    expect(page.get_by_text('1 / 2',exact=True)).to_be_visible()
    page.get_by_role('button',name='Kokeile arvoja',exact=True).click()
    slider.fill('6')
    expect(page.get_by_role('button',name='Kirjaa sarja')).to_be_disabled()
    page.get_by_role('button',name='Palaa aiempiin arvoihin').click()
    expect(page.locator('[data-layout="nimi:kaksin:1"] .card-value')).to_have_text('14')
    page.get_by_role('button',name='Kirjaa sarja').click()
    expect(page.locator('[data-layout="nimi:summa:1"] .card-value')).to_have_text('7')
    expect(page.locator('[data-layout="nimi:pylväät:1"] svg rect')).to_have_count(1)
    expect(page.locator('[data-layout="nimi:viiva:1"] svg circle').first).to_be_visible()
    page.get_by_role('button',name='Kumoa',exact=True).click()
    expect(page.locator('[data-layout="nimi:summa:1"] .card-value')).to_have_text('0')
    page.get_by_role('button',name='Kirjaa sarja').click()
    page.locator('#more summary').click()
    page.get_by_role('button',name='Asettelu',exact=True).click()
    card=page.locator('[data-layout="nimi:kaksin:1"]')
    card.get_by_role('button',name='Siirrä ruutua').press('ArrowLeft')
    card.get_by_role('button',name='Muuta ruudun kokoa').press('ArrowDown')
    expect(card).to_have_attribute('style',__import__('re').compile(r'--(?:mobile-)?height:'))
    page.get_by_role('button',name='Valmis',exact=True).click()
    editor=create(page,'Salipäiväkirja','note')
    editor.fill('Vapaa teksti\n\n((' + TODAY + '; Soutu: toistot = 9))')
    page.get_by_role('button',name='Käyttötila',exact=True).click()
    expect(page.get_by_text('Vapaa teksti',exact=True)).to_be_visible()
    page.get_by_role('button',name='Tietokanta',exact=True).click()
    expect(page.locator('tbody tr')).to_have_count(2)
    page.get_by_role('button',name='Kohteet',exact=True).click()
    page.get_by_role('button',name='Soutu',exact=True).click()
    expect(page.locator('tbody tr')).to_have_count(1)
    expect(page.locator('tbody')).to_contain_text('9')
    page.get_by_role('button',name='Tyhjennä',exact=True).click()
    page.get_by_role('button',name='Arvo',exact=True).click()
    expect(page.locator('tbody tr').first).to_contain_text('7')
    assert page.evaluate('document.documentElement.scrollWidth === innerWidth')
    page.reload()
    expect(page.locator('tbody tr')).to_have_count(2)
    assert not errors, errors
    page.close()


def vault_works(browser):
    folder='alueet/treeni/'
    files={
        REGISTRY:json.dumps({'paths':[],'folders':[folder],'pages':[]}),
        TRAINING:note('Treeni','((Kirjattu: =SUMMA(SARJA("Penkki"; "toistot"))))\n((=PAINIKE("Kirjaa sarja"; KIRJAA("Penkki"; toistot = 2))))'),
        NEXT:note('Seuranta','((Jaettu: =[[treeni]].kirjattu))'),
        SOURCE:note('Voimadata','Tämä yleinen proosa ei kuulu välimuistiin.\n\n((' + TODAY + '; Penkki: toistot = 11))'),
        UNRELATED:note('Vanhaa proosaa','Tätä polkua ei haeta.'),
        SCOPED_PROSE:note('Yleinen proosa','Tätä ei tuoda tietokantaan.'),
    }
    page,errors=setup(browser,390)
    reads=[]
    def respond(route):
        request=route.request
        method=request.method
        path=unquote(urlparse(request.url).path.split(REPO)[-1])
        if path=='': result={'private':True,'full_name':REPO}
        elif path=='/git/trees/main':
            result={'truncated':False,'tree':[{'type':'blob','path':name,'sha':sha(text),'size':len(text)} for name,text in files.items()]}
        elif path.startswith('/git/blobs/'):
            found=next((name for name,text in files.items() if sha(text)==path.rsplit('/',1)[-1]),None)
            if not found:return route.fulfill(status=404,json={})
            reads.append(found)
            result={'content':base64.b64encode(files[found].encode()).decode(),'encoding':'base64'}
        elif path.startswith('/contents/'):
            file=path[len('/contents/'):]
            if method=='PUT':
                payload=request.post_data_json
                if (file in files and payload.get('sha') != sha(files[file])) or (file not in files and payload.get('sha')):
                    return route.fulfill(status=409,json={})
                files[file]=base64.b64decode(payload['content']).decode()
                result={'content':{'sha':sha(files[file])}}
            elif file in files:
                result={'sha':sha(files[file]), 'encoding':'base64','content':base64.b64encode(files[file].encode()).decode()}
            else:return route.fulfill(status=404,json={})
        else:raise AssertionError(path)
        route.fulfill(status=200,json=result,headers={'access-control-allow-origin':'*'})
    page.route(API+'**',respond)
    page.goto(APP)
    page.get_by_role('button',name='Yhdistä Vault').click()
    page.get_by_role('textbox',name='GitHub-token').fill('test-token')
    page.get_by_role('button',name='Yhdistä',exact=True).click()
    expect(page.get_by_text('Haettu klo',exact=False)).to_be_visible()
    assert UNRELATED not in reads
    assert {REGISTRY,TRAINING,NEXT,SOURCE,SCOPED_PROSE}.issubset(reads)
    assert page.evaluate("!currentFile(%s).text && !!currentFile(%s).projection" %(json.dumps(SOURCE),json.dumps(SOURCE)))
    assert not page.evaluate('!!currentFile('+json.dumps(SCOPED_PROSE)+')')
    page.get_by_role('button',name='Sulje',exact=True).click()
    page.get_by_role('button',name='Sivut',exact=True).click()
    page.get_by_role('button',name='Seuranta',exact=True).click()
    expect(page.locator('[data-layout="nimi:jaettu:1"] .card-value')).to_have_text('11')
    page.get_by_role('button',name='Sivut',exact=True).click()
    page.get_by_role('button',name='Treeni',exact=True).click()
    page.get_by_role('button',name='Kirjaa sarja').click()
    expect(page.locator('[data-layout="nimi:kirjattu:1"] .card-value')).to_have_text('13')
    page.get_by_role('button',name='Sivut',exact=True).click()
    page.get_by_role('button',name='Seuranta',exact=True).click()
    expect(page.locator('[data-layout="nimi:jaettu:1"] .card-value')).to_have_text('13')
    page.wait_for_function('state.drafts.size === 0')
    assert 'toistot = 2' in files[TRAINING]
    files[SOURCE]=files[SOURCE].replace('toistot = 11','toistot = 12')
    page.evaluate('synchronize(true)')
    expect(page.locator('[data-layout="nimi:jaettu:1"] .card-value')).to_have_text('14')
    assert reads.count(SCOPED_PROSE)==1
    page.get_by_role('button',name='Muokkaa',exact=True).click()
    editor=page.get_by_role('textbox',name='Muistiinpanon teksti')
    editor.fill('Oma uusi versio')
    files[NEXT]=files[NEXT].replace('Jaettu','Holvin uusi versio')
    page.evaluate('synchronize(true)')
    page.wait_for_function('state.conflicts.size === 1')
    assert 'Holvin uusi versio' in files[NEXT]
    assert page.evaluate('state.drafts.get('+json.dumps(NEXT)+').text.includes("Oma uusi versio")')
    assert not errors, errors
    page.close()


with sync_playwright() as playwright:
    browser=playwright.chromium.launch(executable_path=os.environ.get('SIVUT_CHROMIUM') or None,args=['--no-sandbox'])
    for width in (320,390,1440):
        offline(browser,width)
        print(f'Paikallinen käyttö {width} px OK')
    vault_works(browser)
    print('Rajattu Vault, sivuviittaus, synkka ja rinnakkaismuutos OK')
    browser.close()
