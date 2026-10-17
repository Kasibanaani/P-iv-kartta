# Keveysmittaus (ei kuulu aja.sh:hon). Avaa projektin lukittuna, pitää tattia 6 s ja kertoo kuvat/s,
# pääsäikeen kuormituksen ja moottorin (KK.frame) ajan kuvaa kohden.
# Käyttö: python3 appiappi/testit/mittaa_keveys.py <projekti.json> <näkymä-id> <tatin palikka-id> [cpu-hidastus, esim. 4]
# Projektitiedostot ovat yksityisessä master-tiedot-repossa; älä tuo niitä tähän repoon.
import asyncio,json,math,os,sys,time,threading,http.server,functools,socketserver
from playwright.async_api import async_playwright
JUURI=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..'))
KERAA="""window.__fr=[];(function f(t){window.__fr.push(t);requestAnimationFrame(f);})(performance.now());
window.__kf=0;window.__kn=0;var of=KK.frame;KK.frame=function(){var a=performance.now();var r=of.apply(this,arguments);window.__kf+=performance.now()-a;window.__kn++;return r;};0;"""
def palvelin():
    h=functools.partial(http.server.SimpleHTTPRequestHandler,directory=JUURI);h.log_message=lambda *a:None
    s=socketserver.TCPServer(('127.0.0.1',0),h);threading.Thread(target=s.serve_forever,daemon=True).start();return s.server_address[1]
async def mittaa(polku,vw,tatti,hid=1):
    portti=palvelin();pj=json.load(open(polku));pj=pj.get('projekti',pj)
    async with async_playwright() as p:
        exe='/opt/pw-browsers/chromium' if os.path.exists('/opt/pw-browsers/chromium') else None
        b=await p.chromium.launch(executable_path=exe);ctx=await b.new_context(viewport={'width':1440,'height':900})
        await ctx.add_init_script("if(!sessionStorage.x){sessionStorage.x=1;localStorage.setItem('appiappi.v1',JSON.stringify({projects:[%s],cur:%s}));}"%(json.dumps(pj),json.dumps(pj['id'])))
        pg=await ctx.new_page();virheet=[];pg.on('pageerror',lambda e:virheet.append(str(e)))
        cdp=await ctx.new_cdp_session(pg);await cdp.send('Performance.enable')
        if hid>1:await cdp.send('Emulation.setCPUThrottlingRate',{'rate':hid})
        await pg.goto('http://127.0.0.1:%d/appiappi/index.html'%portti);await pg.wait_for_load_state('load')
        lat=await pg.evaluate("performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd")
        await pg.evaluate("(function(){var t=document.querySelector('#vtabs [data-vw=%s]');t&&t.click();})()"%vw);await pg.wait_for_timeout(200)
        await pg.click('#lockbtn');await pg.wait_for_timeout(300);await pg.evaluate(KERAA)
        async def mt():return {x['name']:x['value'] for x in (await cdp.send('Performance.getMetrics'))['metrics']}
        m0=await mt();bb=await pg.locator('.ue[data-id="%s"]'%tatti).bounding_box();cx,cy=bb['x']+bb['width']/2,bb['y']+bb['height']/2
        await pg.mouse.move(cx,cy);await pg.mouse.down();T=6.0;t0=time.time();i=0
        while time.time()-t0<T:
            a=i*0.05;await pg.mouse.move(cx+bb['width']*0.4*math.cos(a),cy-bb['height']*0.4*abs(math.sin(a)));i+=1;await pg.wait_for_timeout(30)
        await pg.mouse.up();m1=await mt()
        fr=await pg.evaluate("window.__fr");kf=await pg.evaluate("[window.__kf,window.__kn]");n=await pg.evaluate("document.querySelectorAll('.ue').length")
        v=sorted(fr[i+1]-fr[i] for i in range(len(fr)-1))
        print(json.dumps({'projekti':pj.get('name'),'hidastus':hid,'palikoita_näkymässä':n,'lataus_ms':round(lat),'kuvaa_s':round(len(v)/((fr[-1]-fr[0])/1000),1),
          'p95_ms':round(v[int(len(v)*.95)],1),'kuormitus_pct':round((m1['TaskDuration']-m0['TaskDuration'])/T*100),'moottori_ms_kuva':round(kf[0]/max(1,kf[1]),2),
          'muisti_mt':round(m1['JSHeapUsedSize']/1e6,1),'virheet':virheet[:3]},ensure_ascii=False))
        await b.close()
if __name__=='__main__':
    a=sys.argv[1:]
    if len(a)<3:print(__doc__ or 'Käyttö: mittaa_keveys.py projekti.json näkymä tatti [hidastus]');sys.exit(1)
    asyncio.run(mittaa(a[0],a[1],a[2],int(a[3]) if len(a)>3 else 1))
