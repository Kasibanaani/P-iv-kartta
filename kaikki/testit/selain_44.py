"""Valintajoukon tunniste säilyttää rinnakkaisen tekstin ja aiemmat tunnisteet."""
import asyncio
import json

from playwright.async_api import async_playwright, expect

from selain_22 import APP, FAKE, FIXTURES


async def check(browser, width):
    ctx = await browser.new_context(viewport={'width': width, 'height': 860})
    page = await ctx.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    seed = dict(FIXTURES)
    seed['inbox/1.md'] = seed['inbox/1.md'].replace('lahde: emil\n', 'lahde: emil\ntagit: [aikainen]\n')
    seed['inbox/2.md'] += 'Tekstissä #työ-vapaa\n'
    await page.add_init_script(FAKE + '''
      for (const [path, text] of Object.entries(%s)) __repo.put(path, text);
      localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
    ''' % json.dumps(seed))
    await page.goto(APP)
    if width >= 1000:
        await page.get_by_role('tab', name='Muistio', exact=True).click()
    else:
        await page.locator('#roll').click()
        await page.locator('#section-notes').click()
    notes = page.locator('#nlist')
    await expect(notes.get_by_text('Omena', exact=True)).to_be_visible()
    await page.locator('#note-select-toggle').click()
    await notes.get_by_role('checkbox', name='Valitse Omena', exact=True).check()
    await notes.get_by_role('checkbox', name='Valitse Päärynä', exact=True).check()
    await page.locator('#note-batch-tag-open').click()
    dialog = page.get_by_role('dialog', name='Lisää tunniste')
    await expect(dialog).to_contain_text('2 muistiinpanoa')
    await page.mouse.click(3, 3)
    await expect(dialog).to_be_hidden()
    await expect(page.locator('#note-select-count')).to_have_text('Valittu 2')
    await page.locator('#note-batch-tag-open').click()
    await dialog.get_by_role('textbox', name='Tunniste').fill('kaksi sanaa')
    await dialog.get_by_role('button', name='Lisää', exact=True).click()
    await expect(dialog.get_by_role('status')).to_contain_text('Anna yksi tunniste')

    await page.evaluate('() => __repo.put("inbox/1.md", __repo.get("inbox/1.md") + "Toisen laitteen lisäys.\\n")')
    await dialog.get_by_role('textbox', name='Tunniste').fill('#Työ-VAPAA')
    await dialog.get_by_role('button', name='Lisää', exact=True).click()
    await expect(dialog).to_be_hidden()
    expected = seed['inbox/1.md'].replace('[aikainen]', '[aikainen, työ-vapaa]') + 'Toisen laitteen lisäys.\n'
    assert await page.evaluate('() => __repo.get("inbox/1.md")') == expected
    assert await page.evaluate('() => __repo.get("inbox/2.md")') == seed['inbox/2.md']
    assert await page.evaluate('() => __repo.get("inbox/3.md")') == seed['inbox/3.md']
    assert not errors, errors
    assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    await ctx.close()
    print(f'{width} px: tunniste vain valituille, vanhat tiedot säilyivät')


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
