"""Yhtenäinen kaavakieli muistiinpanossa ja Vault-synkassa."""
import json
import re
from datetime import datetime, timezone

from playwright.sync_api import expect, sync_playwright

from selain_104 import FAKE, URL, md
from selain_107 import close_outside

FOOD = 'tieto/ruuat.md'
STATE = 'projektit/tilanne.md'
PLAN = 'projektit/suunnitelma.md'
BODY = '''((ruoka: =RYHMÄ(kana; lihapulla; pinaattilettu)))
((Elokuun proteiini: =SUMMA(ruoka.proteiini; aika="2026-08")))
((Kooste: =UPOTA([[tilanne]]; "^arki")))
((Toimi näin:
  JOS [[Päivän tilanne]].Päivän ohje = "Anna palaa!": "Treenaa"
  MUUTEN: "Ota kevyesti"
))
((=PAINIKE("Merkitse tehty"; muuttuja = "Tehty"; arvo = 1)))

Ruudun lisäksi tekstissä ((=1 + 2)) pistettä.'''
STATE_BODY = '''((taso: =LIUKUSÄÄDIN(min = 0; max = 10; askel = 1)))
((Päivän ohje:
  JOS taso > 5: "Ota rennosti"
  JOS taso < 3: "Anna palaa!"
  MUUTEN: "Jatka"
))

## Päivän teksti ^arki
Teksti ennen muutosta.
## Muu osio
Tämä ei kuulu koosteeseen.
- ((26.11.2026 klo 17.00, taso = 2, ^muistion-saadin-1uo4eg0-2026-11-26))'''
FOOD_BODY = '''((1.8.2026; Kana: proteiini = 23,5 g; ^a))
((5.8.2026, Lihapulla: proteiini = 17 g))
((31.8.2026; Pinaattilettu: proteiini = 4 g))
((1.9.2026; Kana: proteiini = 29 g))'''
SEED = {
    FOOD: md('Ruokamuistio', FOOD_BODY),
    STATE: md('Päivän tilanne', STATE_BODY),
    PLAN: md('Päivän suunnitelma', BODY),
}


def open_note(page, name):
    card = page.locator('#nlist').get_by_role('button', name=re.compile(r'^' + re.escape(name) + r'(?:\s|$)'))
    expect(card).to_be_visible()
    card.click()


def run(browser, width):
    mobile = width < 500
    page = browser.new_page(viewport={'width': width, 'height': 820},
                            has_touch=mobile, is_mobile=mobile,
                            timezone_id='Europe/Helsinki')
    page.set_default_timeout(7000)
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.clock.set_fixed_time(datetime(2026, 11, 26, 18, tzinfo=timezone.utc))
    page.add_init_script(FAKE + '''
      if (!__repo.kept) for (const [path, text] of Object.entries(%s)) __repo.put(path, text);
      localStorage.setItem('kaikki:gh', JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
    ''' % json.dumps(SEED))
    page.goto(URL)
    sheet = page.locator('#nsheet')

    def box(name):
        return sheet.locator('.ns-cell').filter(has=page.get_by_text(name, exact=True))

    def value(name):
        return box(name).locator('.ns-cell-value')

    open_note(page, 'Päivän suunnitelma')
    expect(value('Elokuun proteiini')).to_have_text('44,5')
    expect(value('Toimi näin')).to_have_text('Treenaa')
    expect(value('Kooste')).to_have_text('Teksti ennen muutosta.')
    expect(sheet.locator('.formula-result-text')).to_have_text('3')
    expect(sheet.get_by_role('button', name='Muuta kokoa', exact=False)).to_have_count(0)

    sheet.locator('#ns-more').click()
    page.get_by_role('menuitem', name='Muuta ruutujen asettelua').click()
    expect(box('Elokuun proteiini').get_by_role('button', name='Muuta kokoa', exact=False)).to_be_visible()
    box('Elokuun proteiini').get_by_role('button', name='Siirrä aiemmaksi', exact=False).click()
    expect(sheet.locator('.ns-cell-name').first).to_have_text('Elokuun proteiini')
    box('Toimi näin').locator('summary[aria-label="Ruudun toiminnot"]').click()
    box('Toimi näin').get_by_role('button', name='Kopioi viittaus').click()
    expect(box('Toimi näin').get_by_role('textbox', name='Kaavaruudun viittaus')).to_have_value(
        '[[projektit/suunnitelma]]."Toimi näin"')
    expect(sheet.get_by_role('button', name='Merkitse tehty')).to_be_disabled()
    sheet.locator('#ns-more').click()
    page.get_by_role('menuitem', name='Lukitse ruutujen asettelu').click()
    expect(sheet.locator('summary[aria-label="Ruudun toiminnot"]').first).to_be_hidden()
    sheet.get_by_role('button', name='Merkitse tehty').click()
    page.wait_for_function('p => __repo.get(p).includes("; Tehty = 1; ^qh")', arg=PLAN)
    expect(sheet.locator('.ns-cell-name').first).to_have_text('Elokuun proteiini')

    # Muistiinpanon upotus ja ristiviittaus päivittyvät, kun lähde muuttuu holvissa.
    updated = md('Päivän tilanne', STATE_BODY.replace('Teksti ennen muutosta.', 'Teksti päivittyi.'))
    page.evaluate('([p, text]) => __repo.put(p, text)', [STATE, updated])
    page.evaluate('KaikkiTesti.pull()')
    expect(value('Kooste')).to_have_text('Teksti päivittyi.')
    close_outside(page)

    open_note(page, 'Päivän tilanne')
    slider = sheet.get_by_role('slider', name='taso')
    expect(slider).to_have_value('2')
    expect(value('Päivän ohje')).to_have_text('Anna palaa!')
    slider.press('ArrowRight')
    expect(value('Päivän ohje')).to_have_text('Jatka')
    close_outside(page)
    page.wait_for_function('p => __repo.get(p).includes("; taso = 3; ^muistion-saadin")', arg=STATE)
    saved = page.evaluate('p => __repo.get(p)', STATE)
    assert saved.count('^muistion-saadin') == 1
    open_note(page, 'Päivän suunnitelma')
    expect(value('Toimi näin')).to_have_text('Ota kevyesti')
    expect(sheet.locator('.ns-cell-name').first).to_have_text('Elokuun proteiini')
    expect(sheet.get_by_role('button', name='Muuta kokoa', exact=False)).to_have_count(0)
    assert not errors, errors
    page.context.close()


if __name__ == '__main__':
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for width in (320, 390, 1280, 1440):
            run(browser, width)
        browser.close()
    print('Yhtenäiset kaavat ja Vault-synkka toimivat kaikilla neljällä leveydellä.')
