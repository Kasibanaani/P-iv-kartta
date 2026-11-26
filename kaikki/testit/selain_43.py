"""Otsikon raahaaminen, peruminen ja puhelimen valikkosiirto."""
import asyncio
import json

from playwright.async_api import async_playwright, expect

from selain_41 import APP, FAKE, TARGET, OTHER, SUMMARY

SOURCE = '---\ntyyppi: taulukko\notsikko: Lähde\n---\n| Nimi | Hinta | Yhteensä |\n| --- | --- | --- |\n| Maali | 24 | =B1*2 |\n'


async def check(browser, width):
    phone = width < 1000
    context = await browser.new_context(viewport={'width': width, 'height': 850}, has_touch=phone)
    page = await context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    await page.add_init_script(FAKE + '''
      (() => {
        for (const [path, body] of Object.entries(%s)) __repo.put(path, body);
        localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
        localStorage.setItem('kaikki:taulukko', %s);
      })();
    ''' % (json.dumps({TARGET: SOURCE, OTHER: SUMMARY}), json.dumps(TARGET)))
    await page.goto(APP)
    if phone:
        await page.locator('#roll').click()
        await page.locator('#section-sheets').click()
    else:
        await page.locator('#navbtn').click()
        await page.locator('#nav [data-tab="sheets"]').click()
    header = page.locator('#sg-wrap th.sg-ch')
    await expect(header.first).to_contain_text('Nimi')
    if phone:
        await header.first.tap()
        await page.locator('#sg-more').tap()
        await page.locator('#sgs-col-dn').tap()
        moved_ref = 'B1'
        expected = '| Hinta | Nimi | Yhteensä |'
    else:
        a = await header.nth(0).bounding_box()
        c = await header.nth(2).bounding_box()

        async def drag():
            await page.mouse.move(a['x'] + a['width'] / 2, a['y'] + a['height'] / 2)
            await page.mouse.down()
            await page.mouse.move(c['x'] + c['width'] / 2, c['y'] + c['height'] / 2, steps=12)
            await expect(header.nth(2)).to_have_class('sg-ch sg-drop-after')

        await drag()
        await page.keyboard.press('Escape')
        await page.mouse.up()
        assert await page.evaluate('p => __repo.get(p)', TARGET) == SOURCE
        await drag()
        await page.mouse.up()
        moved_ref = 'C1'
        expected = '| Hinta | Yhteensä | Nimi |'
    await page.wait_for_function('([path, order]) => __repo.get(path).includes(order)', arg=[TARGET, expected])
    assert f'| =[[lahde]]!{moved_ref} |' in await page.evaluate('p => __repo.get(p)', OTHER)
    assert '=A1*2' in await page.evaluate('p => __repo.get(p)', TARGET)
    await expect(header.first).to_contain_text('Hinta')
    await expect(page.locator('#sg-wrap td[data-r="0"]').nth(2 if phone else 1)).to_have_text('48')
    assert not errors, errors
    await context.close()
    print(f'{width} px: sarakkeen siirto ja kaavaviitteet')


async def main():
    async with async_playwright() as playwright:
        try:
            browser = await playwright.chromium.launch()
        except Exception:
            browser = await playwright.chromium.launch(executable_path='/opt/pw-browsers/chromium')
        async with browser:
            for width in (1440, 1280, 390, 320):
                await check(browser, width)


if __name__ == '__main__':
    asyncio.run(main())
