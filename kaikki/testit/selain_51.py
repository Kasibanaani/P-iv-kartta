"""Rivinäkymän takaisinlinkit ja täydet tunnistelistat."""
import asyncio
import json

from playwright.async_api import async_playwright, expect

from selain_50 import APP, FAKE, note

ROOT = 'inbox/keskus.md'
ONE = 'tieto/ensimmainen.md'
TWO = 'inbox/toinen.md'
VIEW = 'nakymat/linkit.md'
TAGS = ['sama', 'erittäin-pitkä-tunniste', 'toinen-tunniste', 'kolmas-tunniste', 'neljäs-tunniste']
SEED = {
    ROOT: note('Keskus', 'Aihe #sama ja #sama.', 'tagit: [' + ', '.join(TAGS) + ']\n'),
    ONE: note('Ensimmäinen', '[[keskus]] [[inbox/keskus|Toistuva]]'),
    TWO: note('Toinen', '[[keskus|Katso myös]]'),
    'inbox/piilo.md': note('Piilo', '[[keskus]]', 'nakyy: ei\n'),
    'arkisto/vanha.md': note('Vanha', '[[keskus]]'),
    VIEW: '---\ntyyppi: nakyma\notsikko: Linkit\nnakyy: ei\nmista: tunniste = sama\n'
          'sarakkeet:\n  - otsikko\n  - takaisinlinkit\n  - tunnisteet\n---\n',
}


async def check(browser, width):
    context = await browser.new_context(viewport={'width': width, 'height': 850})
    page = await context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    await page.add_init_script(FAKE + '''
      for (const [path, text] of Object.entries(%s)) __repo.put(path, text);
      localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
      localStorage.setItem('kaikki:nmode','rows');
      localStorage.setItem('kaikki:nview', %s);
      localStorage.setItem('kaikki:nvlay:' + %s, JSON.stringify({w:{tunnisteet:140}}));
    ''' % (json.dumps(SEED), json.dumps(VIEW), json.dumps(VIEW)))
    await page.goto(APP)
    if width >= 1000:
        await page.get_by_role('tab', name='Muistio', exact=True).click()
    else:
        await page.locator('#roll').click()
        await page.locator('#section-notes').click()
    cover = page.locator('#nlist')
    await expect(cover.locator('.rvr')).to_have_count(1)
    counter = cover.get_by_role('button', name='Takaisinlinkit: Keskus, 2')
    await counter.click()
    menu = page.get_by_role('menu', name='Takaisinlinkit')
    await expect(menu.get_by_role('menuitem')).to_have_text(['Ensimmäinen', 'Toinen'])
    await page.keyboard.press('Escape')
    await expect(menu).to_be_hidden()
    await expect(counter).to_be_focused()
    await counter.click()
    await page.mouse.click(3, 3)
    await expect(menu).to_be_hidden()
    await counter.click()
    await menu.get_by_role('menuitem', name='Ensimmäinen').click()
    note_dialog = page.locator('#nsheet')
    await expect(note_dialog.get_by_role('textbox', name='Muistiinpanon teksti')).to_have_value('Ensimmäinen\n[[keskus]] [[inbox/keskus|Toistuva]]')
    await page.keyboard.press('Escape')
    await expect(note_dialog).to_be_hidden()
    await page.evaluate('([p, body]) => __repo.put(p, body)', [TWO, note('Toinen', 'Linkki poistui.')])
    await page.evaluate('KaikkiTesti.pull()')
    await expect(cover.get_by_role('button', name='Takaisinlinkit: Keskus, 1')).to_be_visible()

    more = cover.get_by_role('button', name='Näytä kaikki 5 tunnistetta')
    await expect(more).to_have_text('+4')
    await more.click()
    tags = page.get_by_role('menu', name='Tunnisteet')
    await expect(tags.get_by_role('menuitem')).to_have_text(['#' + tag for tag in TAGS])
    await tags.get_by_role('menuitem', name='#neljäs-tunniste').click()
    await expect(cover.get_by_text('Keskus', exact=True)).to_be_visible()
    await expect(page.locator('#filterpick')).to_contain_text('#neljäs-tunniste')

    await page.locator('#nvpick').click()
    await page.locator('#nv-edit').click()
    dialog = page.get_by_role('dialog', name='Muokkaa näkymää')
    await expect(dialog.get_by_role('checkbox', name='Näytä sarake Takaisinlinkit')).to_be_checked()
    await expect(dialog.get_by_role('checkbox', name='Näytä sarake Tunnisteet')).to_be_checked()
    assert not errors, errors
    overflow = await page.evaluate('''() => ({
      width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
      outside: Array.from(document.querySelectorAll('*')).filter(e => {
        const r = e.getBoundingClientRect();
        return r.width && r.right > innerWidth + 1;
      }).slice(-25).map(e => [e.id, String(e.className), Math.round(e.getBoundingClientRect().right)])
    })''')
    assert overflow['scrollWidth'] <= overflow['width'], overflow
    await context.close()
    print(f'{width} px: takaisinlinkit, lähteen avaus, tunnisteiden ylivuoto')


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
