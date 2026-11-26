"""Aikajanan nimetyt vaiheet, ajoittamaton vaihe ja oikea kohta muistiinpanossa."""
import json
from datetime import datetime, timezone

from playwright.sync_api import expect, sync_playwright

from selain_104 import FAKE, URL, md


PROJECT = 'projektit/keittio.md'
BODY = """## Suunnittelu
28.11.2026–29.11.2026.

""" + "Suunnittelumuistio.\n\n" * 20 + """## Purku
27.11.2026–1.12.2026.

## Asennus
Aikaisintaan 7.12.2026.
Kesto: 2 viikkoa
Vaatii: Purku

```md
## Koodiesimerkin otsikko
28.11.2026–29.11.2026.
```
"""
SEED = {
    PROJECT: md('Keittiöremontti', BODY),
    'kalenteri/tavallinen.md': md('Tavallinen aikaväli', '24.11.2026–28.11.2026.'),
    'tieto/otsikot.md': md('Muu muistiinpano', '## Yleistä\n## Lisää tietoa\nEi ajoitusta.'),
    'projektit/erotin.md': md('Muu projekti', 'Johdanto.\n---\nTavallinen osio 22.11.2026–25.11.2026.'),
}


def app(browser, width):
    phone = width < 500
    ctx = browser.new_context(viewport={'width': width, 'height': 800}, has_touch=phone, is_mobile=phone)
    page = ctx.new_page()
    page.set_default_timeout(8000)
    page.clock.set_fixed_time(datetime(2026, 11, 26, 12, tzinfo=timezone.utc))
    page.add_init_script(FAKE + """
      for (const [path, text] of Object.entries(%s)) __repo.put(path, text);
      localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
      localStorage.setItem('kaikki:calview', 'a');
      localStorage.setItem('kaikki:ajzoom', 'kk');
    """ % json.dumps(SEED))
    page.goto(URL)
    expect(page.locator('#nlist').get_by_text('Keittiöremontti', exact=False).first).to_be_visible()
    if phone:
        page.locator('#roll').click()
        page.locator('#section-cal').click()
    else:
        page.locator('#navbtn').click()
        page.locator('#nav [data-tab="cal"]').click()
    return page


def run(browser, width):
    page = app(browser, width)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    group = page.locator('.ajgroup').filter(has_text='Keittiöremontti')
    expect(group).to_have_count(1)
    expect(group.get_by_role('heading')).to_have_text('Keittiöremontti')
    expect(group.locator('.ajbar b')).to_have_text(['Suunnittelu', 'Purku'])
    expect(group.locator('.ajundated')).to_have_text('AsennusEi aikaa')
    expect(page.locator('.ajbar')).to_have_count(4)
    expect(page.locator('.ajbar b', has_text='Tavallinen osio')).to_have_count(1)
    assert page.evaluate('document.documentElement.scrollWidth === innerWidth')

    purku = group.get_by_role('button', name='Purku,', exact=False)
    purku.press('Enter')
    expect(page.locator('#nsheet')).to_be_visible()
    expect(page.locator('#ns-hl .aj-target')).to_have_text('Purku')
    expect(page.locator('#ns-hl .aj-target')).to_be_in_viewport()
    expect(page.locator('#ns-hl .aj-date')).to_have_text(['28.11.2026–29.11.2026', '27.11.2026–1.12.2026'])
    page.keyboard.press('Escape')

    group.get_by_role('button', name='Asennus Ei aikaa', exact=False).click()
    expect(page.locator('#ns-hl .aj-target')).to_have_text('Asennus')
    page.keyboard.press('Escape')

    if width == 1280:
        # Nimistön muokkaus muistiinpanon normaalilla tallennuksella näkyy heti palkissa.
        purku.press('Space')
        editor = page.locator('#ns-text')
        expect(editor).to_be_visible()
        editor.click()
        editor.fill(editor.input_value().replace('## Purku', '## Purkutyö'))
        page.locator('#nsheet .sx').click()
        expect(group.locator('.ajbar b')).to_have_text(['Suunnittelu', 'Purkutyö'])
        renamed = group.get_by_role('button', name='Purkutyö,', exact=False)
        renamed.press('Alt+ArrowRight')
        expect(renamed).to_be_focused()
        page.wait_for_function("""p => __repo.get(p).includes('## Purkutyö\u005cn28.11.2026–2.12.2026')""", arg=PROJECT)
        assert '## Suunnittelu\n28.11.2026–29.11.2026.' in page.evaluate('p => __repo.get(p)', PROJECT)
        page.locator('#undo-b').click()
        page.wait_for_function("""p => __repo.get(p).includes('## Purkutyö\u005cn27.11.2026–1.12.2026')""", arg=PROJECT)

    assert not errors, errors
    page.context.close()


if __name__ == '__main__':
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for width in (1280, 1440, 390, 320):
            run(browser, width)
            print(f'{width} px: OK')
        browser.close()
