# Selaintestien yhteiset apurit.
import os, json
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
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
