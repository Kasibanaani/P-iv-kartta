"""Paikallinen graafi näyttää näkyvät wikilinkit enintään kahden askeleen päästä."""
import asyncio
import json

from playwright.async_api import async_playwright, expect

from selain_22 import APP, FAKE


def note(title, text, metadata=''):
    return f'---\ntyyppi: inbox\notsikko: {title}\nlahde: emil\n{metadata}---\n# {title}\n{text}\n'


SEED = {
    'inbox/keskus.md': note('Keskus', '[[suora]] [[suora|Toistuva linkki]] [[keskus]] [[piilo]] [[arkistoitu]]'),
    'inbox/suora.md': note('Suora', '[[inbox/kakkosaste]]', 'tagit: [yhteinen]\n'),
    'inbox/takaisin.md': note('Takaisin', 'Katso [[keskus|keskusta]].'),
    'inbox/kakkosaste.md': note('Kakkosaste', 'Päätepiste.'),
    'inbox/piilo.md': note('Piilo', '[[keskus]]', 'nakyy: ei\n'),
    'arkisto/arkistoitu.md': note('Arkistoitu', '[[keskus]]'),
    'nakymat/yhteinen.md':
        '---\ntyyppi: nakyma\notsikko: Yhteiset\nnakyy: ei\nmista: tunniste = yhteinen\n'
        'sarakkeet:\n  - otsikko\n---\n',
}


async def check(browser, width):
    phone = width < 1000
    context = await browser.new_context(viewport={'width': width, 'height': 850}, has_touch=phone)
    page = await context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    await page.add_init_script(FAKE + '''
      for (const [path, text] of Object.entries(%s)) __repo.put(path, text);
      localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
      localStorage.setItem('kaikki:nmode','rows');
    ''' % json.dumps(SEED))
    await page.goto(APP)
    if phone:
        await page.locator('#roll').click()
        await page.locator('#section-notes').click()
    else:
        await page.locator('#navbtn').click(); await page.get_by_role('tab', name='Muistio', exact=True).click()
    await page.locator('#nlist').get_by_text('Keskus', exact=True).click()
    note_dialog = page.locator('#nsheet')
    await note_dialog.locator('#ns-more').click()
    await note_dialog.get_by_role('menuitem', name='Paikallinen graafi').click()
    graph = page.get_by_role('dialog', name='Paikallinen graafi')
    links = graph.get_by_role('group', name='Linkitetyt muistiinpanot')
    await expect(graph.get_by_role('status')).to_have_text('Keskus · 2 yhteyttä')
    await expect(links.get_by_role('button')).to_have_count(2)
    await expect(links.get_by_role('button', name='Takaisin')).to_be_visible()
    await graph.get_by_role('button', name='2 askelta').click()
    await expect(links.get_by_role('button', name='Kakkosaste')).to_be_visible()
    await graph.get_by_role('combobox', name='Graafin rajaus').select_option(label='Yhteiset')
    await expect(links.get_by_role('button')).to_have_count(1)
    await expect(links.get_by_role('button', name='Suora')).to_be_visible()

    await graph.get_by_role('combobox', name='Graafin rajaus').select_option('')
    await page.evaluate('([p, body]) => __repo.put(p, body)', ['inbox/takaisin.md', note('Takaisin', 'Linkki poistettiin.')])
    await page.evaluate('KaikkiTesti.pull()')
    await expect(links.get_by_role('button', name='Takaisin')).to_have_count(0)

    canvas = page.locator('#note-graph-canvas')
    drawn = await canvas.evaluate('c => c.getContext("2d").getImageData(0, 0, c.width, c.height).data.some((v, i) => i % 4 === 3 && v > 0)')
    assert drawn
    await graph.get_by_role('button', name='Suurenna graafia').click()
    await graph.get_by_role('button', name='Keskitä').click()
    await links.get_by_role('button', name='Suora').click()
    await expect(graph.get_by_role('status')).to_have_text('Suora · 2 yhteyttä')
    await graph.get_by_role('button', name='Avaa muistiinpano').click()
    await expect(graph).to_be_hidden()
    await expect(note_dialog.get_by_role('textbox', name='Muistiinpanon teksti')).to_have_value('Suora\n[[inbox/kakkosaste]]')
    assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    assert not errors, errors
    await context.close()
    print(f'{width} px: paikallinen graafi, rajaus ja päivitys')


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
