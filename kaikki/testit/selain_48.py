"""Muistiinpanon tarkenteet avautuvat Ajankohta ja tiedot -ikkunaan."""
import asyncio
import datetime
import json

from playwright.async_api import async_playwright, expect

from selain_22 import APP, FAKE

DAY = datetime.date.today()
DATE = f'{DAY.day}.{DAY.month}.{DAY.year}'
HEADER = f'---\ntyyppi: inbox\nluotu: {DAY.isoformat()}\nlahde: emil\n'
SEED = {
    'inbox/muistiinpano.md':
        HEADER + 'otsikko: Muistiinpano\njuuri: {"pin":1,"time":{"s":"08:00"}}\n---\n'
        f'# Muistiinpano\nSanavalinta {DATE} klo 13–14\n',
    'inbox/rinnakkainen.md':
        HEADER + 'otsikko: Rinnakkainen\n---\n' + f'# Rinnakkainen\n{DATE} klo 13.30–14.30\n',
}


async def check(browser, width):
    context = await browser.new_context(viewport={'width': width, 'height': 860})
    page = await context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    await page.add_init_script(FAKE + '''
      for (const [path, text] of Object.entries(%s)) __repo.put(path, text);
      localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
    ''' % json.dumps(SEED))
    await page.goto(APP)
    if width >= 1000:
        await page.get_by_role('tab', name='Muistio', exact=True).click()
    else:
        await page.locator('#roll').click()
        await page.locator('#section-notes').click()
        await page.locator('#nviewbtn').click()
    await page.locator('#nlist').get_by_text('Muistiinpano', exact=True).click()
    note = page.locator('#nsheet')
    await expect(note).to_be_visible()
    await expect(note.locator('#ns-pin')).to_be_hidden()
    text = note.get_by_role('textbox', name='Muistiinpanon teksti')
    await text.evaluate('field => { const pos = field.value.indexOf("Sanavalinta"); field.setSelectionRange(pos, pos + 11); }')
    await note.locator('#ns-when').click()
    details = note.get_by_role('dialog', name='Ajankohta ja tiedot')
    await expect(details.locator('#ns-pin')).to_be_visible()
    await expect(details.get_by_role('button', name='Liitä ”Sanavalinta” asiasanaan')).to_be_visible()
    await details.locator('#ns-link').click()
    await expect(details.locator('#ns-word')).to_have_value('Sanavalinta')
    await details.locator('#ns-linkclose').click()
    await details.locator('#ns-found .ov').first.click()
    await expect(details.locator('#ns-ov')).to_contain_text('Rinnakkainen')
    await page.keyboard.press('Escape')
    await expect(details).to_be_hidden()
    await expect(note).to_be_visible()
    assert not errors, errors
    await context.close()
    print(f'{width} px: valitun sanan liitos, kiinnitys ja päällekkäisyys')


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
