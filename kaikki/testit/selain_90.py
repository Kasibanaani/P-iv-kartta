"""Pikakirjaus pysyy paikoillaan ja mahtuu näppäimistön yläpuolelle."""
from playwright.sync_api import expect, sync_playwright

from selain_19 import APP, FAKE


def boundaries(page, selector):
    return page.locator(selector).evaluate("""node => {
      const {top, bottom} = node.getBoundingClientRect();
      return [top, bottom];
    }""")


def visible_viewport(page, height, top):
    page.evaluate("""([height, top]) => {
      Object.defineProperties(visualViewport, {
        height: {value: height, configurable: true},
        offsetTop: {value: top, configurable: true}
      });
      visualViewport.dispatchEvent(new Event('resize'));
      visualViewport.dispatchEvent(new Event('scroll'));
    }""", [height, top])


def run(browser, width):
    mobile = width < 1000
    landscape = 500 <= width < 1000
    height = 390 if landscape else 844
    page = browser.new_page(
        viewport={'width': width, 'height': height},
        is_mobile=mobile,
        has_touch=mobile,
    )
    page.add_init_script(FAKE + r"""
      __repo.put('pohjat/pikakirjaus.md', '## Seuranta\n- Arvio | 1-5\n');
      localStorage.setItem('kaikki:gh', '{"repo":"testi/vault","token":"x","branch":"main"}');
    """)
    page.goto(APP)
    page.wait_for_function("() => KaikkiTesti.vault().files['pohjat/pikakirjaus.md']")
    page.get_by_role('button', name='Pikakirjaus', exact=True).click()
    quick = page.get_by_role('dialog', name='Pikakirjaus')
    whole = boundaries(page, '#quick-entry')
    heading = boundaries(page, '.quick-head')
    done = boundaries(page, '#quick-done')
    assert whole[0] < 100 and whole[1] < height

    quick.get_by_role('button', name='Muistutus', exact=True).click()
    expect(quick.locator('#quick-help')).to_contain_text('Esiasetuksia ei löytynyt')
    assert boundaries(page, '#quick-entry') == whole
    assert boundaries(page, '.quick-head') == heading
    assert boundaries(page, '#quick-done') == done

    quick.get_by_role('button', name='+ Uusi nappi', exact=True).click()
    expect(quick.get_by_label('Nimi', exact=True)).to_be_focused()
    expect(quick.get_by_role('button', name='Valmis', exact=True)).to_be_hidden()
    submit = quick.get_by_role('button', name='Lisää nappi', exact=True)
    cancel = quick.get_by_role('button', name='Peru', exact=True)
    actions = [submit.bounding_box()['y'], cancel.bounding_box()['y'], done[0]]
    assert max(actions) - min(actions) < 1, actions
    assert boundaries(page, '#quick-entry') == whole
    cancel.click()

    if mobile:
        quick.get_by_role('button', name='Seuranta', exact=True).click()
        quick.get_by_role('button', name='+ Uusi nappi', exact=True).click()
        available, offset = (195, 25) if landscape else (290, 55)
        visible_viewport(page, available, offset)
        bottom = available + offset
        page.wait_for_function("y => document.querySelector('#quick-entry').getBoundingClientRect().bottom < y", arg=bottom)
        keyboard_layout = boundaries(page, '#quick-entry')
        assert keyboard_layout[0] >= offset
        assert submit.bounding_box()['y'] + submit.bounding_box()['height'] < bottom
        expect(cancel).to_be_visible()

        # Laajenna lomaketta ja kohdista alimpaan kenttään pienessä näkymässä.
        quick.get_by_label('Arvolaji').select_option('valinta')
        quick.get_by_label('Tunnisteet').focus()
        page.wait_for_function("""() => {
          const field = document.querySelector('#quick-new-tags').getBoundingClientRect();
          const area = document.querySelector('#quick-body').getBoundingClientRect();
          return field.top >= area.top && field.bottom <= area.bottom;
        }""")
        assert boundaries(page, '#quick-entry') == keyboard_layout
        assert page.locator('#quick-body').evaluate('node => node.scrollTop') > 0

        # Myös monirivinen virheilmoitus jättää toimintorivin paikalleen.
        quick.get_by_label('Nimi', exact=True).fill('Arvio')
        action_y = submit.bounding_box()['y']
        submit.click()
        expect(quick.get_by_role('status')).to_contain_text('Tarkista nimi, valinnat ja tunnisteet.')
        assert submit.bounding_box()['y'] == action_y
        assert boundaries(page, '#quick-entry') == keyboard_layout

        # Safari voi ilmoittaa vanhan yläsiirtymän vielä näppäimistön sulkeuduttua.
        visible_viewport(page, height, offset)
        page.wait_for_function("y => document.querySelector('#quick-entry').getBoundingClientRect().top === y", arg=whole[0])
        assert boundaries(page, '#quick-entry') == whole
        cancel.click()

    quick.get_by_role('button', name='Valmis', exact=True).click()
    expect(quick).to_be_hidden()
    page.context.close()
    print(f'{width} px: OK')


if __name__ == '__main__':
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        try:
            for width in (320, 390, 700, 1280, 1440):
                run(browser, width)
        finally:
            browser.close()
