"""Kaikki 0.103 (Emil 26.11.2026): tietokoneella ei pysyvää sivupalkkia. Osiot avautuvat yläreunan osionapista sivun päälle,
ja kalenteri ja Muistio ovat koko sivun levyisiä. Puhelimella osionappia ei näy (alapalkki ennallaan). Leveydet 1280, 1440 ja 390."""
import json
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

D = Path(__file__).resolve().parent
URL = (D.parent / 'index.html').as_uri()
FAKE = (D / 'fakegh.js').read_text()
SEED = {'inbox/a.md': '---\ntyyppi: muistiinpano\notsikko: Eka\nlahde: emil\n---\n# Eka\n\nTekstiä.\n'}


def open_page(browser, width):
    phone = width < 500
    ctx = browser.new_context(viewport={'width': width, 'height': 800}, has_touch=phone, is_mobile=phone)
    page = ctx.new_page()
    page.set_default_timeout(8000)
    page.add_init_script(FAKE + ";(function(){var S=%s;if(!window.__repo.kept)for(var k in S)window.__repo.put(k,S[k]);"
                         "localStorage.setItem('kaikki:gh',JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));"
                         "localStorage.setItem('kaikki:nmode','cards');})();" % json.dumps(SEED))
    page.goto(URL)
    page.wait_for_timeout(1200)
    page.wait_for_selector('#nlist')
    return page


def run(browser, width):
    page = open_page(browser, width)
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    btn, nav = page.locator('#navbtn'), page.locator('#nav')
    if width < 1000:
        expect(btn).to_be_hidden()
        expect(nav).to_be_hidden()
        expect(page.locator('#roll')).to_be_visible()
        assert not errors, errors
        page.context.close()
        return

    # Ei pysyvää sivupalkkia: osiot piilossa, sisältö alkaa vasemmasta reunasta.
    expect(nav.locator('[data-tab="cal"]')).to_be_hidden()
    expect(btn).to_be_visible()
    expect(btn).to_have_text('Muistio')
    expect(btn).to_have_attribute('aria-expanded', 'false')
    left = page.evaluate("document.querySelector('#nlist').getBoundingClientRect().left")
    assert left < 80, left
    expect(btn.locator('svg')).to_have_count(1)

    # Avaus: paneeli sivun päällä, valittu osio kohdistettuna.
    btn.click()
    expect(nav.locator('[data-tab="cal"]')).to_be_visible()
    expect(btn).to_have_attribute('aria-expanded', 'true')
    expect(nav.locator('[data-tab="notes"]')).to_be_focused()
    page.wait_for_function("document.getElementById('nav').getBoundingClientRect().left >= -1")
    box = nav.bounding_box()
    assert box['x'] >= -1 and box['width'] < 300, box
    bf = page.evaluate("getComputedStyle(document.getElementById('nav')).backdropFilter")
    assert 'blur' in bf, bf

    # Osion valinta sulkee paneelin, nappi näyttää uuden osion ja kohdistus palaa napille.
    nav.locator('[data-tab="cal"]').click()
    expect(nav.locator('[data-tab="cal"]')).to_be_hidden()
    expect(btn).to_have_text('Kalenteri')
    expect(btn).to_be_focused()
    expect(page.locator('#p-cal')).to_be_visible()
    cal = page.evaluate("(() => { const r = document.querySelector('#p-cal').getBoundingClientRect(); return [r.left, r.width]; })()")
    assert cal[0] < 80 and cal[1] > width - 140, cal

    # Esc ja ulkopuolinen napsautus sulkevat.
    btn.click()
    expect(nav.locator('[data-tab="cal"]')).to_be_visible()
    page.keyboard.press('Escape')
    expect(nav.locator('[data-tab="cal"]')).to_be_hidden()
    expect(btn).to_be_focused()
    btn.click()
    page.mouse.click(width - 50, 500)
    expect(nav.locator('[data-tab="cal"]')).to_be_hidden()
    expect(btn).to_have_text('Kalenteri')

    assert page.evaluate('document.documentElement.scrollWidth') <= width
    assert not errors, errors
    page.context.close()


if __name__ == '__main__':
    with sync_playwright() as p:
        browser = p.chromium.launch()
        try:
            for width in (1280, 1440, 390):
                run(browser, width)
                print(f'{width} px: OK')
        finally:
            browser.close()
