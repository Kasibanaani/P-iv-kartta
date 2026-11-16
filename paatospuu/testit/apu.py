"""Yhteiset apufunktiot selaintesteille (1.72): puhelimella osiot vaihdetaan alapalkin rullausnapista ja projekti, vienti,
ohje ja Päätöspuu ovat Valikossa. Tietokoneella (leveä) käytetään sivupalkkia ja yläpalkkia kuten ennen."""
NAMES={'notes':'Muistio','cal':'Kalenteri','list':'Listat','terms':'Asiat','use':'Päätöspuu','teach':'Päätöspuu'}
DESK={'#m-proj':'#title','#m-x':'#xbtn','#m-help':'#hint','#m-tree':'[data-tab="use"]'}
async def menu(pg,sel):
    if await pg.is_visible('#menu'):
        await pg.click('#menu'); await pg.wait_for_timeout(40); await pg.click('#menupop '+sel); await pg.wait_for_timeout(40)
    else:
        await pg.click(DESK.get(sel,sel))
VIIKOT=False
async def rivit(pg):
    """1.104: Listat avautuu Viikot-näkymään; vanhemmat testit käyttävät Rivit-näkymää (valinta muistetaan laitteella)."""
    if VIIKOT: return
    b=pg.locator('#listview [data-v="r"]')
    if await b.count() and await b.get_attribute('aria-pressed')!='true': await b.click(); await pg.wait_for_timeout(60)
async def tab(pg,t):
    if not await pg.is_visible('#roll'):
        await pg.click('[data-tab="%s"]'%t)
        if t=='list': await rivit(pg)
        return
    if t in ('use','teach'):
        if await pg.evaluate("document.getElementById('roll-now').textContent")!='Päätöspuu': await menu(pg,'#m-tree'); await pg.wait_for_timeout(40)
        if await pg.locator('#build').count() and (await pg.get_attribute('#build','aria-pressed')=='true')!=(t=='teach'): await pg.click('#build'); await pg.wait_for_timeout(60)
        return
    if await pg.evaluate("document.getElementById('roll-now').textContent")!=NAMES[t]:
        await pg.click('#roll'); await pg.click('#section-'+t); await pg.wait_for_timeout(30)
    if t=='list': await rivit(pg)
async def tsx(pg):
    """Asiasanakortin sulku: 1.72:sta alkaen kortin Valmis sulkee ikkunan suoraan Asiat-osioon, joten ruksi vain, jos ikkuna on auki."""
    if await pg.is_visible('#tsheet .sx'): await pg.click('#tsheet .sx')
