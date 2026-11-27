"""Kotisivu, suuren Muistion vieritys ja lukutilan päivitys taustasynkan aikana."""
import json
from datetime import datetime, timezone

from playwright.sync_api import expect, sync_playwright

from selain_104 import FAKE, URL, md
from selain_107 import close_outside

NOTE = 'projektit/ohjain.md'
SOURCES = 'projektit/lahde.md'
COUNT = 240
BODY = '''((taso: =LIUKUSÄÄDIN(min = 0; max = 10; askel = 1; tallenna = "ei")))
((Kerroin: =taso * 2))
((Ketju: =JOS(taso > 2; Kerroin; 0)))
((Toistot: =SUMMA(Penkki.toistot)))
((Yhteensä: =Ketju + Toistot))
{liukusäädin: uni; kohde = "Minä"; muuttuja = "Uni"; min = 0; max = 12; askel = 1}
((Unitulos: =VIIMEISIN(Minä.Uni)))
((Viite: =[[lahde]].arvo + taso))
- ((27.11.2026 klo 12.00; Minä: Uni = 4))
'''
SEED = {
    NOTE: md('Valittu laskuri', BODY, 'chatgpt'),
    SOURCES: md('Laskurin lähde', '((arvo: =7))'),
    **{
        f'projektit/m{i:03}.md': md(
            f'Muistiinpano {i:03}', 'Penkki.\n\n((Penkki: toistot = 1))'
        )
        for i in range(COUNT)
    },
}


def section(page, name, width):
    if width >= 1000:
        page.locator('#navbtn').click()
        page.locator(f'#nav [data-tab="{name}"]').click()
    else:
        page.locator('#roll').click()
        page.locator(f'#section-{name}').click()


def check(browser, width):
    mobile = width < 500
    page = browser.new_page(viewport={'width': width, 'height': 844},
                            is_mobile=mobile, has_touch=mobile, timezone_id='Europe/Helsinki')
    errors = []
    page.on('pageerror', lambda err: errors.append(str(err)))
    page.clock.set_fixed_time(datetime(2026, 11, 27, 18, tzinfo=timezone.utc))
    page.add_init_script(FAKE + f'''
      if (!__repo.kept) {{
        for (const [path, text] of Object.entries({json.dumps(SEED)})) __repo.put(path, text);
        localStorage.setItem('kaikki:nmode', '{'cards' if mobile else 'rows'}');
      }}
      localStorage.setItem('kaikki:gh', JSON.stringify({{repo:'testi/vault',token:'x',branch:'main'}}));
    ''')
    page.goto(URL)
    page.wait_for_function(f"window.KaikkiTesti?.notes().length === {len(SEED)}")
    list_box = page.locator('#nlist')
    mounted = list_box.locator('.ncard,.rvb .rvr')
    expect(mounted.first).to_be_visible()
    assert 0 < mounted.count() < 80
    expect(list_box.get_by_text('Muistiinpano 220', exact=not mobile)).to_have_count(0)
    scroller = page.locator('#main' if mobile else '#nlist')
    scroller.evaluate('e => { e.scrollTop = e.scrollHeight; }')
    page.wait_for_function("""() => Array.from(document.querySelectorAll('#nlist [data-id]'))
      .some(row => row.textContent.includes('Muistiinpano 239'))""")
    assert mounted.count() < 80

    search = page.locator('#nsearch')
    search.fill('Muistiinpano 120')
    expect(mounted).to_have_count(1)
    expect(mounted.first).to_contain_text('Muistiinpano 120')
    search.fill('Valittu laskuri')
    expect(mounted).to_have_count(1)
    mounted.first.click()
    sheet = page.locator('#nsheet')
    def value(label):
        return sheet.locator('.ns-cell').filter(
            has=page.get_by_text(label, exact=True)
        ).locator('.ns-cell-value')
    expect(value('Toistot')).to_have_text(str(COUNT))
    expect(value('Viite')).to_have_text('7')
    expect(value('Unitulos')).to_have_text('4')
    page.locator('#ns-more').click()
    sheet.get_by_role('menuitem', name='Lisää Kotisivulle').click()
    close_outside(page)

    section(page, 'home', width)
    home = page.locator('#p-home')
    expect(home.locator('.home-open')).to_have_count(1)
    home.get_by_label('Avaa Kotisivu käynnistyessä').check()
    page.reload()
    expect(home.get_by_role('button', name='Valittu laskuri', exact=True)).to_be_visible()
    home.get_by_role('button', name='Valittu laskuri', exact=True).click()
    expect(value('Yhteensä')).to_have_text(str(COUNT))
    static_result = value('Toistot')
    static_result.evaluate("""node => {
      window.staticUpdates = 0;
      new MutationObserver(records => window.staticUpdates += records.length)
        .observe(node, {childList:true, characterData:true, subtree:true});
    }""")
    expect(static_result.locator('xpath=..').locator('.ns-cell-sources > div')).to_have_count(0)
    slider = sheet.get_by_role('slider', name='taso')
    slider.press('ArrowRight')
    expect(value('Viite')).to_have_text('8')
    for _ in range(2):
        slider.press('ArrowRight')
    expect(value('Ketju')).to_have_text('6')
    expect(value('Yhteensä')).to_have_text(str(COUNT + 6))
    assert page.evaluate('staticUpdates') == 0
    saved = sheet.get_by_role('slider', name='uni')
    saved.press('ArrowRight')
    expect(value('Unitulos')).to_have_text('5')
    assert 'muistion-saadin' not in page.evaluate('p => __repo.get(p)', NOTE)

    # Lähdesynkka ei vaihda kaavakontekstia kesken vedon.
    slider.dispatch_event('pointerdown', {'isPrimary': True, 'button': 0, 'pointerId': 21})
    page.evaluate('''([path, text]) => {
      __repo.put(path, text);
      window.syncDone = false;
      KaikkiTesti.pull().then(() => {window.syncDone = true;});
    }''', [SOURCES, md('Laskurin lähde', '((arvo: =17))')])
    expect(value('Viite')).to_have_text('10')
    slider.press('ArrowRight')
    expect(value('Viite')).to_have_text('11')
    assert not page.evaluate('syncDone')
    slider.dispatch_event('pointerup', {'isPrimary': True, 'button': 0, 'pointerId': 21})
    page.wait_for_function('window.syncDone')
    expect(value('Viite')).to_have_text('21')
    expect(value('Unitulos')).to_have_text('5')
    close_outside(page)
    page.wait_for_function("p => __repo.get(p).includes('muistion-saadin')", arg=NOTE)
    expect(home.get_by_role('button', name='Valittu laskuri', exact=True)).to_be_visible()
    home.get_by_role('button', name='Poista Kotisivulta: Valittu laskuri').click()
    expect(home.locator('.home-open')).to_have_count(0)
    expect(home.get_by_role('button', name='Avaa Muistio')).to_be_visible()
    assert not errors, errors
    page.context.close()


if __name__ == '__main__':
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for width in (320, 390, 1280, 1440):
            check(browser, width)
        browser.close()
    print('Kotisivu, suuren Muistion vieritys ja lukutilan taustasynkka toimivat.')
