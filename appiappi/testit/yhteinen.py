# Selaintestien yhteiset apurit.
import os, json
D=os.path.dirname(os.path.abspath(__file__))
# Jonon 1o (kartoitus 6): sivu avataan paikalliselta palvelimelta, ei file://-osoitteesta. Tiedostosta ajettu Chromium
# näki selaimen muistin joskus tyhjänä uudelleenlatauksen jälkeen (selain_83_hae jumittui). aja.sh käynnistää palvelimen
# ja antaa osoitteen APPI_URL:ssa; yksittäin ajettuna testi käynnistää oman palvelimen repon juuresta.
def _palvelin():
    import http.server, threading
    root=os.path.abspath(os.path.join(D,'..','..'))
    class Q(http.server.SimpleHTTPRequestHandler):
        def __init__(self,*a,**k):super().__init__(*a,directory=root,**k)
        def log_message(self,*a):pass
    srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),Q)
    threading.Thread(target=srv.serve_forever,daemon=True).start()
    return 'http://127.0.0.1:%d'%srv.server_address[1]
U=(os.environ.get('APPI_URL') or _palvelin()).rstrip('/')+'/appiappi/index.html'
async def avaa(p,w=1440,h=900,dark=False,rm='reduce'):
    b=await p.chromium.launch();errs=[]
    ctx=await b.new_context(viewport={'width':w,'height':h},color_scheme='dark' if dark else 'light',reduced_motion=rm)
    pg=await ctx.new_page();pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
    await pg.goto(U);await pg.wait_for_timeout(250)
    return b,pg,errs
async def keskus(pg,sel):
    return await pg.evaluate("(s)=>{var e=document.querySelector(s).getBoundingClientRect();return [e.left+e.width/2,e.top+e.height/2];}",sel)
async def veda(pg,a,t,steps=8):
    await pg.mouse.move(a[0],a[1]);await pg.mouse.down();await pg.mouse.move((a[0]+t[0])/2,(a[1]+t[1])/2,steps=steps);await pg.mouse.move(t[0],t[1],steps=steps);await pg.mouse.up();await pg.wait_for_timeout(200)
async def P(pg,js):
    return json.loads(await pg.evaluate("(function(){var P=APP.P;function B(n){return Object.values(P.b).filter(b=>b.nm===n)[0];}function E(){return APP.ev();}return JSON.stringify("+js+");})()"))
async def paletti(pg,teksti,x,y):
    """Raahaa paletin palikka kanvaasille kohtaan (x, y) ruudulla."""
    l=pg.locator('#pal .chip',has_text=teksti).first
    await l.scroll_into_view_if_needed();c=await l.bounding_box()
    await veda(pg,[c['x']+c['width']/2,c['y']+c['height']/2],[x,y])
