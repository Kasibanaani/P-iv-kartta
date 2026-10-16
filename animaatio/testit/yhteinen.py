# Animappin selaintestien yhteiset apurit.
import os, json
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
def svg(vari,w=100,h=60,muoto='rect'):
    sis='<rect width="%d" height="%d" fill="%s"/>'%(w,h,vari) if muoto=='rect' else '<ellipse cx="%g" cy="%g" rx="%g" ry="%g" fill="%s"/>'%(w/2,h/2,w/2,h/2,vari)
    return '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d">%s</svg>'%(w,h,w,h,sis)
async def avaa(p,w=1024,h=768,dark=False,touch=False):
    """Avaa Animappin. touch=True: iPadin tapaan kosketus (has_touch, is_mobile), hiirtä ei käytetä."""
    b=await p.chromium.launch();errs=[]
    kw=dict(viewport={'width':w,'height':h},color_scheme='dark' if dark else 'light',reduced_motion='reduce',accept_downloads=True)
    if touch:kw.update(has_touch=True,is_mobile=True,device_scale_factor=2)
    ctx=await b.new_context(**kw)
    pg=await ctx.new_page();pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
    await pg.goto(U);await pg.wait_for_timeout(300)
    return b,ctx,pg,errs
async def uusi(pg,nimi='Testi'):
    await pg.fill('#wname',nimi);await pg.click('#wcreate');await pg.wait_for_timeout(150)
async def P(pg,js):
    return json.loads(await pg.evaluate("(function(){var P=APP.P,S=APP.S,AM=APP.AM;function O(n){return P.osat.filter(o=>o.nimi===n)[0];}return JSON.stringify("+js+");})()"))
async def lisaa(pg,svgteksti,nimi):
    return await pg.evaluate("([t,n])=>APP.lisaaSvg(t,n)",[svgteksti,nimi])
async def ruutu(pg,x,y):
    """Lavan piste (x, y) → sivun koordinaatit."""
    return await pg.evaluate("([x,y])=>{var r=document.querySelector('#cv').getBoundingClientRect(),q=APP.ruudulle(x,y);return [r.left+q[0],r.top+q[1]];}",[x,y])
class Kosketus:
    """Kosketus- ja kynätapahtumat Chromen DevTools-protokollalla (kuten oikea sormi tai Apple Pencil)."""
    def __init__(self,pg,cdp):self.pg=pg;self.cdp=cdp
    @classmethod
    async def luo(cls,pg):
        return cls(pg,await pg.context.new_cdp_session(pg))
    async def t(self,typ,pts):
        await self.cdp.send('Input.dispatchTouchEvent',{'type':typ,'touchPoints':[{'x':x,'y':y,'id':i} for i,(x,y) in pts]})
    async def nollaa(self,sel=None):
        """Testiselaimen oikku: veto touch-action:none-pinnalla jättää Chromen ele-tilan jumiin, eikä seuraava napautus tuota
        klikkausta. Napautus neutraaliin kohtaan (ei käsittelijää) nollaa sen. Oikealla laitteella tätä ei tarvita."""
        if sel is None:sel='#sheet h2' if await self.pg.evaluate("document.querySelector('#sheetbg').classList.contains('show')") else '#kstat'
        c=await self.pg.evaluate("(s)=>{var r=document.querySelector(s).getBoundingClientRect();return [r.left+Math.min(30,r.width/2),r.top+r.height/2];}",sel)
        await self.t('touchStart',[(0,c)]);await self.t('touchEnd',[])
    async def napauta(self,sel):
        await self.nollaa()
        c=await self.pg.evaluate("(s)=>{var r=document.querySelector(s).getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];}",sel)
        await self.t('touchStart',[(0,c)]);await self.t('touchEnd',[])
    async def kyna(self,typ,x,y,paine=0.5):
        await self.cdp.send('Input.dispatchMouseEvent',{'type':typ,'x':x,'y':y,'button':'left','buttons':1 if typ!='mouseReleased' else 0,'clickCount':1,'pointerType':'pen','force':paine})
async def kello(pg,ms):
    await pg.evaluate("(ms)=>{APP.kello(ms);APP.askel();}",ms)
