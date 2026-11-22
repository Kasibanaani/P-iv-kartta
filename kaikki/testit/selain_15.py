"""Kaikki 0.15: Markdown-puun haarat kokeilunäkymässä."""
import asyncio
from pathlib import Path

from playwright.async_api import async_playwright, expect


APP = (Path(__file__).resolve().parents[1] / 'index.html').as_uri()


async def test(browser, width):
    context = await browser.new_context(viewport={'width': width, 'height': 820})
    page = await context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    await page.goto(APP)
    if width >= 1000:
        await page.get_by_role('tab', name='Flow', exact=True).click()
    else:
        await page.locator('#roll').click()
        await page.locator('#section-puu').click()
    await page.locator('#flow-text-open').click()
    preview = page.locator('#flow-text-preview')
    read = preview.get_by_role('button', name='Näytä Flow', exact=True)
    step = preview.locator('#flow-text-step')
    await read.click()
    await expect(step).to_have_text('Onko minulla puoli tuntia?')
    await preview.get_by_role('button', name='On', exact=True).click()
    await expect(step).to_have_text('Mitä teen ensin?')
    await preview.get_by_role('button', name='Käyn kävelyllä.', exact=True).click()
    await expect(step).to_have_text('Käyn kävelyllä.')
    await preview.get_by_role('button', name='Edellinen', exact=True).click()
    await expect(step).to_have_text('Mitä teen ensin?')
    await preview.get_by_role('button', name='Alusta', exact=True).click()
    await expect(step).to_have_text('Onko minulla puoli tuntia?')
    await preview.get_by_text('Näytä koko puu', exact=True).click()
    assert await preview.locator('#flow-text-tree li').count() == 7

    source = preview.get_by_role('textbox', name='Sisennetty Markdown-luettelo')
    await source.fill('- Aloitus\n    - Ohitettu taso')
    await read.click()
    await expect(preview.locator('#flow-text-feedback')).to_contain_text('Rivi 2')
    await expect(step).to_be_hidden()
    await source.fill('# Otsikko\n- Aloitetaanko?\n  - Kyllä\n    - Lopputulos\n  - Myöhemmin')
    await read.click()
    await preview.get_by_role('button', name='Kyllä', exact=True).click()
    await expect(step).to_have_text('Lopputulos')
    await page.keyboard.press('Escape')
    await expect(preview).to_be_hidden()
    await page.locator('#flow-text-open').click()
    await expect(source).to_have_value('- Onko minulla puoli tuntia?\n  - On\n    - Mitä teen ensin?\n      - Käyn kävelyllä.\n      - Luen yhden luvun.\n  - Ei\n    - Päätän seuraavan pienen askeleen.')
    assert not errors, errors
    print(f'{width} px: tekstipuun kokeilu toimii')
    await context.close()


async def main():
    async with async_playwright() as playwright:
        try:
            browser = await playwright.chromium.launch()
        except Exception:
            browser = await playwright.chromium.launch(executable_path='/opt/pw-browsers/chromium')
        async with browser:
            for width in (320, 390, 1280, 1440):
                await test(browser, width)


if __name__ == '__main__':
    asyncio.run(main())
