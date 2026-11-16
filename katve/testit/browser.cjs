const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const runtime = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
const { chromium } = require(runtime ? path.join(runtime, 'playwright') : 'playwright');
const browserPath = process.env.CHROMIUM_PATH || execFileSync('which', ['chromium'], { encoding: 'utf8' }).trim();
const root = path.resolve(__dirname, '..');
const mime = { '.html': 'text/html', '.png': 'image/png', '.js': 'text/javascript', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  const relative = new URL(req.url, 'http://localhost').pathname.slice('/repo/katve/'.length) || 'index.html';
  const name = path.join(root, relative);
  if (!name.startsWith(root + path.sep) || !fs.existsSync(name)) return res.writeHead(404).end();
  res.writeHead(200, { 'Content-Type': mime[path.extname(name)] });
  fs.createReadStream(name).pipe(res);
});
const listen = () => new Promise(resolve => server.listen(0, '127.0.0.1', resolve));

(async () => {
  await listen();
  const base = 'http://localhost:' + server.address().port + '/repo/katve/';
  const browser = await chromium.launch({ executablePath: browserPath, args: ['--no-sandbox'] });
  const errors = [];
  try {
    for (const [width, height] of [[390,844],[320,568]]) {
      const phone = await browser.newContext({ viewport: { width, height }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
      const page = await phone.newPage();
      page.on('pageerror', err => errors.push(err.message));
      await page.goto(base);
      await page.getByRole('heading', { name: 'Katve', exact: true }).waitFor();
      assert(await page.locator('#play').isVisible());
      if (process.env.KATVE_SCREENSHOTS && width===390) await page.screenshot({path:process.env.KATVE_SCREENSHOTS+'/katve-menu.png'});
      await page.locator('#play').tap();
      await page.getByRole('heading', { name: 'Käännä puhelin' }).waitFor();
      assert.equal(await page.evaluate(() => game.time), 0);
      await page.setViewportSize({ width: height, height: width });
      await page.getByRole('heading', { name: 'Käännä puhelin' }).waitFor({ state: 'hidden' });
      await page.waitForFunction(() => game.time > .25);
      const cdp = await phone.newCDPSession(page);
      const left = await page.locator('#move').boundingBox();
      const right = await page.locator('#aim').boundingBox();
      const center = (rect, id) => ({x:rect.x+rect.width/2,y:rect.y+rect.height/2,id});
      const a = center(left, 1), b = center(right, 2);
      const initial = await page.evaluate(() => {
        game.player.x=650;
        game.player.y=950;
        return game.player.x;
      });
      const send = (type,touchPoints) => cdp.send('Input.dispatchTouchEvent', {type,touchPoints});
      await send('touchStart',[a,b]);
      await send('touchMove',[{...a,x:a.x+43},{...b,y:b.y-42}]);
      await page.waitForFunction(() => sticks[0].x>.8 && sticks[1].y<-.8 && game.player.speed>110);
      assert.equal(await page.evaluate(() => game.shots),0);
      if (process.env.KATVE_SCREENSHOTS && width===390) await page.screenshot({path:process.env.KATVE_SCREENSHOTS+'/katve-play.png'});
      await send('touchEnd',[]);
      await page.waitForFunction(() => game.shots===1 && sticks.every(s=>s.id===null));
      assert((await page.evaluate(() => game.player.x)) > initial);
      await page.waitForFunction(() => sticks.every(s=>s.id===null));
      await send('touchStart',[b]);
      await send('touchMove',[{...b,y:b.y-41}]);
      await send('touchCancel',[]);
      assert.equal(await page.evaluate(() => game.shots),1,'cancel never shoots');
      await page.locator('#miniButton').tap();
      await page.getByRole('heading',{name:'Aluekartta'}).waitFor();
      if (process.env.KATVE_SCREENSHOTS && width===390) await page.screenshot({path:process.env.KATVE_SCREENSHOTS+'/katve-map.png'});
      await page.locator('#closeMap').tap();
      await page.locator('#pause').tap();
      await page.getByRole('heading',{name:'Tauko'}).waitFor();
      await page.locator('#keepGoing').tap();

      // Aseta pelaaja kohteiden viereen ja viimeistele tehtävät oikeilla käyttöliittymän painikkeilla.
      for (let stage=0;stage<3;stage++) {
        await page.evaluate(() => {
          game.zombies=[];
          Object.assign(game.player,targetFor(game));
        });
        await page.getByRole('button',{name:/^Ota /}).tap();
        await page.evaluate(() => Object.assign(game.player,targetFor(game)));
        await page.getByRole('button',{name:'Kuittaa tehtävä'}).tap();
        assert.equal(await page.evaluate(() => saved.checkpoint.stage),stage+1);
        if (stage===0) {
          await page.reload();
          await page.locator('#resume').tap();
          assert.equal(await page.evaluate(() => game.stage),1);
        } else {
          await page.locator('#next').tap();
        }
      }
      await page.getByText('VAPAA TUTKIMINEN',{exact:true}).waitFor();
      await phone.close();
    }
    const desk=await browser.newContext({ viewport:{width:1280,height:720} });
    const page=await desk.newPage();
    page.on('pageerror',err=>errors.push(err.message));
    await page.goto(base);
    if (process.env.KATVE_SCREENSHOTS) await page.screenshot({path:process.env.KATVE_SCREENSHOTS+'/katve-desktop.png'});
    await page.locator('#settings').click();
    await page.locator('#mode').selectOption('light');
    assert.equal(await page.locator('html').getAttribute('data-mode'),'light');
    await page.locator('#backup').click();
    await page.locator('#exportText').click();
    assert.equal(JSON.parse(await page.locator('#saveText').inputValue()).app,'katve');
    await page.keyboard.press('Escape');
    await page.locator('#play').click();
    await page.keyboard.down('Shift');
    await page.keyboard.down('d');
    await page.waitForFunction(()=>game.player.speed>150);
    await page.keyboard.up('d');
    await page.keyboard.up('Shift');
    await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
    await desk.setOffline(true);
    await page.reload();
    await page.getByRole('heading',{name:'Katve',exact:true}).waitFor();
    assert(await page.locator('#play').isVisible());
    assert.deepEqual(errors,[]);
    console.log('Chromium: 320 ja 390 px, vaakapeli, yhtäaikaiset tatit, irrotus, peruutus, kartta, tarkistuspisteet, teema ja offline: OK');
  } finally {
    await browser.close();
  }
})().catch(err=>{console.error(err);process.exitCode=1;}).finally(()=>server.close());
