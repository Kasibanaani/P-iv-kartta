"""Kohdan 18 toistuvuuskokeilu testivaultilla, kellosta riippumatta."""
import asyncio
import datetime
import json

from playwright.async_api import async_playwright, expect

from selain_50 import APP, FAKE, note

DAY = '2026-11-23'
EARLY = 'inbox/ennakko.md'
FIXED = 'inbox/rytmi.md'
LATE = 'inbox/myohassa.md'
LEGACY = 'toistuvat/sailyva.md'
LEGACY_BODY = '---\ntyyppi: toistuva\notsikko: Säilyvä\nlaji: ajallaan\ntoisto: 1 viikko\nalku: 2027-01-01\n---\n# Säilyvä\n'
SEED = {
    EARLY: note('Ennakko', 'Muista alkuperäinen teksti.', 'toistuu: 2 viikkoa\nseuraava: 2026-11-26\n'),
    FIXED: note('Rytmi', 'Muista alkuperäinen teksti.', 'toistuu: 1 viikko tasavälein\nseuraava: 2026-11-25\n'),
    LATE: note('Myöhässä', 'Muista alkuperäinen teksti.', 'toistuu: 1 päivä\nseuraava: 2026-11-20\n'),
    'inbox/tanaan.md': note('Tänään', 'Alkuperäinen teksti.', 'toistuu: 1 päivä\nseuraava: 2026-11-23\n'),
    'inbox/piilo.md': note('Piilo', 'Alkuperäinen teksti.', 'nakyy: ei\ntoistuu: 2 päivää\nseuraava: 2026-11-20\n'),
    LEGACY: LEGACY_BODY,
}


async def prepare(pg, data):
    await pg.clock.set_fixed_time(datetime.datetime.fromisoformat('2026-11-23T12:00:00+02:00'))
    await pg.add_init_script(FAKE + '''
      for (const [path, text] of Object.entries(%s)) __repo.put(path, text);
      localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
      localStorage.setItem('kaikki:calview','w');
    ''' % json.dumps(data))
    await pg.goto(APP)
    await pg.wait_for_function('KaikkiTesti.notes().length >= 4')


async def section(pg, width, name, key):
    if width >= 1000:
        await pg.get_by_role('tab', name=name, exact=True).click()
    else:
        if await pg.locator('#roll-now').text_content() == name:
            return
        await pg.locator('#roll').click()
        await pg.locator('#section-' + key).click()


async def check(browser, width):
    context = await browser.new_context(viewport={'width': width, 'height': 870}, timezone_id='Europe/Helsinki')
    pg = await context.new_page()
    errors = []
    pg.on('pageerror', lambda error: errors.append(str(error)))
    await prepare(pg, SEED)
    await section(pg, width, 'Muistio', 'notes')
    await pg.locator('#noteview [data-nv=rep]').click()
    task_list = pg.locator('#note-repeat-list')
    await expect(task_list.locator('.wtt')).to_have_text(['Myöhässä', 'Tänään', 'Rytmi', 'Ennakko'])
    await expect(task_list.locator('.is-overdue .wtt')).to_have_text(['Myöhässä'])
    assert not await pg.evaluate('() => __repo.log.some(l => l.includes("inbox/") && l.startsWith("PUT "))')
    await pg.evaluate('p => __repo.put(p,__repo.get(p)+"Toisen laitteen lisäys.\\n")', EARLY)
    await task_list.get_by_role('button', name='Kuittaa toistuva: Ennakko').click()
    await expect(task_list.get_by_role('button', name='Kuitattu tänään: Ennakko')).to_be_disabled()
    fields = await pg.evaluate('p => __repo.get(p)', EARLY)
    assert 'seuraava: 2026-12-07' in fields and f'kuitattu: {DAY}' in fields
    assert fields.endswith('# Ennakko\nMuista alkuperäinen teksti.\nToisen laitteen lisäys.\n'), fields
    await task_list.get_by_role('button', name='Kuittaa toistuva: Rytmi').click()
    await expect(task_list.get_by_role('button', name='Kuitattu tänään: Rytmi')).to_be_disabled()
    assert 'seuraava: 2026-12-02' in await pg.evaluate('p => __repo.get(p)', FIXED)
    assert await pg.evaluate('p => __repo.get(p)', LEGACY) == LEGACY_BODY

    # Toisen laitteen päivittämä sääntö estää vanhaan tilaan perustuvan kuittauksen.
    await pg.evaluate('p => __repo.put(p,__repo.get(p).replace("seuraava: 2026-11-20","seuraava: 2026-11-21"))', LATE)
    await task_list.get_by_role('button', name='Kuittaa toistuva: Myöhässä').click()
    await expect(pg.locator('#undo-t')).to_contain_text('muuttui toisella laitteella')
    assert 'kuitattu:' not in await pg.evaluate('p => __repo.get(p)', LATE)
    await pg.evaluate('KaikkiTesti.pull()')
    await expect(task_list.locator('.is-overdue')).to_have_attribute('data-repeat-day', '2026-11-21')

    await section(pg, width, 'Kalenteri', 'cal')
    today = pg.locator('.wkday[data-day="' + DAY + '"]')
    await expect(today.get_by_role('button', name='Kuittaa toistuva: Tänään')).to_be_visible()
    await today.get_by_role('button', name='Kuittaa toistuva: Tänään').click()
    await expect(pg.locator('.wkday[data-day="2026-11-24"]').get_by_role('button', name='Kuitattu tänään: Tänään')).to_be_disabled()

    await pg.locator('#quick-entry-mobile' if width < 1000 else '#quick-entry-desktop').click()
    await pg.locator('#quick-remind').click()
    await pg.locator('#quick-new-repeat').click()
    dialog = pg.locator('#note-repeat-new')
    await expect(dialog.get_by_role('textbox', name='Nimi')).to_be_focused()
    await pg.mouse.click(3, 3)
    await expect(dialog).to_be_hidden()
    await expect(pg.locator('#quick-entry')).to_be_visible()
    await pg.locator('#quick-new-repeat').click()
    await dialog.get_by_role('textbox', name='Nimi').fill('Uusi muistutus')
    await dialog.locator('#note-repeat-day').fill('2026-11-27')
    await dialog.get_by_role('button', name='Tallenna').click()
    await expect(dialog).to_be_hidden()
    await expect(pg.locator('.wkday[data-day="2026-11-27"]').get_by_role('button', name='Kuittaa toistuva: Uusi muistutus')).to_be_visible()
    await pg.locator('#week [data-day="2026-11-27"]').click()
    await pg.locator('#calview [data-v=d]').click()
    await expect(pg.locator('#untimed').get_by_role('button', name='Kuittaa toistuva: Uusi muistutus')).to_be_visible()
    assert await pg.evaluate('document.documentElement.scrollWidth <= innerWidth')
    assert not errors, errors

    if width == 1440:
        data = await pg.evaluate('Object.fromEntries(Object.entries(__repo.files).map(([path,file])=>[path,file.t]))')
        other = await browser.new_context(viewport={'width': width, 'height': 870}, timezone_id='Europe/Helsinki')
        second = await other.new_page()
        await prepare(second, data)
        await section(second, width, 'Muistio', 'notes')
        await second.locator('#noteview [data-nv=rep]').click()
        row = second.locator('#note-repeat-list .note-repeat-row').filter(has_text='Ennakko')
        await expect(row).to_have_attribute('data-repeat-day', '2026-12-07')
        await expect(row.get_by_role('button', name='Kuitattu tänään: Ennakko')).to_be_disabled()
        dates = await second.evaluate('''() => {
            const rule = (raw, next) => VAULT.repeatRule(['toistuu: '+raw, 'seuraava: '+next]);
            return [
              VAULT.repeatNext(rule('1 kuukausi', '2026-01-31'), '2026-01-31'),
              VAULT.repeatNext(rule('1 vuosi', '2028-02-29'), '2028-02-29'),
              VAULT.repeatNext(rule('2 viikkoa tasavälein', '2026-01-01'), '2026-03-01'),
              VAULT.repeatRule(['toistuu: 1 päivä', 'seuraava: 2026-02-29'])
            ];
        }''')
        assert dates == ['2026-02-28', '2029-02-28', '2026-03-12', None], dates
        await other.close()
    await context.close()
    print(f'{width} px: toistuvuuden lista, kuittaus, kalenteri ja pikamuistutus')


async def main():
    async with async_playwright() as playwright:
        async with await playwright.chromium.launch() as browser:
            for width in (1440, 1280, 390, 320):
                await check(browser, width)


if __name__ == '__main__':
    asyncio.run(main())
