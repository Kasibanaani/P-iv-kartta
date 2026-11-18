"""Yhteiset apufunktiot selaintesteille (1.72): puhelimella osiot vaihdetaan alapalkin rullausnapista ja projekti, vienti,
ohje ja Päätöspuu ovat Valikossa. Tietokoneella (leveä) käytetään sivupalkkia ja yläpalkkia kuten ennen."""
NAMES={'notes':'Muistio','cal':'Kalenteri','list':'Listat','terms':'Asiat','puu':'Päätöspuu','use':'Vanhat puut','teach':'Vanhat puut'}
DESK={'#m-puu':'[data-tab="puu"]','#m-proj':'#title','#m-x':'#xbtn','#m-help':'#hint','#m-tree':'[data-tab="use"]'}
async def menu(pg,sel):
    if await pg.is_visible('#menu'):
        await pg.click('#menu'); await pg.wait_for_timeout(40); await pg.click('#menupop '+sel); await pg.wait_for_timeout(40)
    else:
        await pg.click(DESK.get(sel,sel))
VIIKOT=False
async def rivit(pg):
    """1.104: Listat avautuu Viikot-näkymään; vanhemmat testit käyttävät Rivit-näkymää (valinta muistetaan laitteella)."""
    """1.105: Ruudut on oletus, Viikot alapalkissa ja vanha rivinäkymä Lista-ikkunassa (setListView)."""
    v='w' if VIIKOT else 'r'
    if await pg.evaluate("window.JuuriTesti&&JuuriTesti.listView()!=='%s'"%v): await pg.evaluate("JuuriTesti.setListView('%s')"%v); await pg.wait_for_timeout(60)
async def old(pg):
    """1.108: poistetut näkymät (Vanhat puut, rivinäkymä, kierroslistat, ryhmät…) avataan vanhoja testejä varten."""
    if await pg.evaluate("!!window.JuuriTesti&&!document.body.classList.contains('oldui')"): await pg.evaluate("JuuriTesti.old()"); await pg.wait_for_timeout(40)
async def tab(pg,t):
    if t in ('use','teach'): await old(pg)
    if not await pg.is_visible('#roll'):
        await pg.click('[data-tab="%s"]'%t)
        if t=='list': await rivit(pg)
        return
    if t in ('use','teach'):
        if await pg.evaluate("document.getElementById('roll-now').textContent")!='Vanhat puut': await menu(pg,'#m-tree'); await pg.wait_for_timeout(40)
        if await pg.locator('#build').count() and (await pg.get_attribute('#build','aria-pressed')=='true')!=(t=='teach'): await pg.click('#build'); await pg.wait_for_timeout(60)
        return
    if await pg.evaluate("document.getElementById('roll-now').textContent")!=NAMES[t]:
        await pg.click('#roll'); await pg.click('#section-'+t); await pg.wait_for_timeout(30)
    if t=='list': await rivit(pg)
async def tsx(pg):
    """Asiasanakortin sulku: 1.72:sta alkaen kortin Valmis sulkee ikkunan suoraan Asiat-osioon, joten ruksi vain, jos ikkuna on auki."""
    if await pg.is_visible('#tsheet .sx'): await pg.click('#tsheet .sx')
async def sulje(pg,d):
    """1.105: pienissä ikkunoissa ei ole ruksia; suljetaan napauttamalla ulkopuolelle."""
    await pg.mouse.click(3,3); await pg.wait_for_timeout(60)
    if await pg.evaluate("document.getElementById('%s').open"%d): raise Exception('ikkuna %s ei sulkeutunut ulkopuolelta'%d)
