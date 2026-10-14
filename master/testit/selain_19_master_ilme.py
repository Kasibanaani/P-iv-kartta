"""Masterin teema pysyy erillään projektista, puhelinesikatselusta ja viennistä."""
import asyncio, json, os
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
U='file://'+os.path.abspath(os.path.join(D,'..','index.html'))
async def run():
    async with async_playwright() as p:
        browser=await p.chromium.launch()
        ctx=await browser.new_context(viewport={'width':1440,'height':1000},reduced_motion='reduce',color_scheme='light')
        page=await ctx.new_page(); errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        await page.goto(U)
        assert await page.get_attribute('html','data-master-theme')=='forest'
        await page.click('text=Luo esimerkkiprojekti')
        await page.wait_for_timeout(100)
        baseline=await page.evaluate("JSON.stringify(MASTER.data)")
        exported=await page.evaluate("MASTER.appHtml()")
        r=await page.locator('#pscreen').bounding_box()
        clip={'x':r['x']+35,'y':r['y'],'width':r['width']-70,'height':r['height']}
        phone=await page.screenshot(clip=clip)
        await page.click('#master-settings-open')
        assert await page.locator('#master-settings').is_visible()
        for mode in ['light','dark']:
            await page.click('[data-master-mode="'+mode+'"]')
            for theme in ['forest','lake','plum','sand','rose']:
                await page.click('button[data-master-theme="'+theme+'"]')
                assert await page.get_attribute('html','data-theme')==mode
                assert await page.locator('button[data-master-theme="'+theme+'"]').get_attribute('aria-pressed')=='true'
                assert await page.evaluate("JSON.stringify(MASTER.data)")==baseline
                assert await page.evaluate("MASTER.appHtml()")==exported
                # Label, muted label and accent must remain readable on both master surfaces.
                contrast=await page.evaluate("""() => {
                  const s=getComputedStyle(document.documentElement),lum=h=>{const v=h.trim().slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*v[0]+.7152*v[1]+.0722*v[2]},ratio=(a,b)=>{a=lum(s.getPropertyValue(a));b=lum(s.getPropertyValue(b));return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
                  return ['--bg','--cell'].flatMap(b=>['--label','--label2','--accent'].map(a=>ratio(a,b))).concat(ratio('--on-solid','--solid'));
                }""")
                assert min(contrast)>=4.5,(theme,mode,contrast)
        await page.press('#ms-close','Escape')
        assert not await page.locator('#master-settings').is_visible()
        # The rounded screen's outside corners intentionally expose the master background.
        assert await page.screenshot(clip=clip)==phone
        assert await page.evaluate("JSON.parse(localStorage.getItem('master:appearance'))")=={'theme':'rose','mode':'dark'}
        await page.reload()
        assert await page.get_attribute('html','data-master-theme')=='rose'
        assert await page.get_attribute('html','data-theme')=='dark'
        await page.click('#master-settings-open');await page.click('[data-master-mode="auto"]')
        await page.emulate_media(color_scheme='light');await page.wait_for_function("document.documentElement.dataset.theme==='light'")
        await page.emulate_media(color_scheme='dark');await page.wait_for_function("document.documentElement.dataset.theme==='dark'")
        await page.click('#ms-close')
        for view in ['build','kartta','ketjut','maps','table','style','wish','stats','proj']:
            await page.click('#mtabs [data-v="'+view+'"]')
            assert await page.locator('#v-'+view).is_visible()
        for w in [390,320]:
            await page.set_viewport_size({'width':w,'height':844})
            await page.evaluate("document.getElementById('master-settings-open').click()")
            rect=await page.locator('#master-settings').bounding_box()
            assert rect['x']>=0 and rect['x']+rect['width']<=w+1,(w,rect)
            await page.click('button[data-master-theme="forest"]');await page.click('#ms-close')
        assert not errors,errors
        await ctx.close()
        # Invalid settings and unavailable storage must not prevent launch.
        for init in ["localStorage.setItem('master:appearance','broken')", "Storage.prototype.getItem=function(){throw Error('blocked')};Storage.prototype.setItem=function(){throw Error('blocked')}"]:
            c=await browser.new_context(viewport={'width':1440,'height':900})
            await c.add_init_script(init);q=await c.new_page();await q.goto(U)
            await q.click('#master-settings-open');await q.click('button[data-master-theme="lake"]')
            assert await q.get_attribute('html','data-master-theme')=='lake'
            await c.close()
        await browser.close()
        print('OK: 10 palette/mode combinations, contrast, exact phone pixels, project/export isolation, persistence, auto mode, views, 390/320 px dialog and blocked/invalid storage.')
asyncio.run(run())
