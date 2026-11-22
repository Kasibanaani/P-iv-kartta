"""Kaikki 0.12: osioiden näkyvyys säilyy laitekohtaisesti."""
import asyncio
from pathlib import Path

from playwright.async_api import async_playwright, expect


APP = (Path(__file__).resolve().parents[1] / 'index.html').as_uri()


async def open_settings(page, wide):
    if wide:
        await page.locator('#deskmenu').click()
        await page.locator('#m-sections').click()
    else:
        await page.locator('#roll').click()
        await page.locator('#section-settings-item').click()
    await expect(page.locator('#section-settings')).to_be_visible()


async def run(browser, width):
    wide = width >= 1000
    context = await browser.new_context(viewport={'width': width, 'height': 800})
    page = await context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    await page.goto(APP)
    await open_settings(page, wide)

    choices = page.locator('#section-settings-list')
    assert await choices.locator('input:checked').count() == 7
    await choices.get_by_role('checkbox', name='Muistio', exact=True).uncheck()
    await expect(page.locator('#p-cal')).to_be_visible()
    await choices.get_by_role('checkbox', name='Kojelauta', exact=True).uncheck()
    for title in ('Taulukot', 'Listat', 'Flow', 'Asiat'):
        await choices.get_by_role('checkbox', name=title, exact=True).uncheck()
    await expect(choices.get_by_role('checkbox', name='Kalenteri', exact=True)).to_be_disabled()
    await page.keyboard.press('Escape')
    await expect(page.locator('#section-settings')).to_be_hidden()

    if wide:
        await expect(page.get_by_role('tab', name='Muistio', exact=True)).to_have_count(0)
        await expect(page.get_by_role('tab', name='Kalenteri', exact=True)).to_be_visible()
    else:
        await page.locator('#roll').click()
        await expect(page.locator('#section-notes')).to_have_count(0)
        await expect(page.locator('#section-cal')).to_be_visible()
        await page.keyboard.press('Escape')

    await page.reload()
    await expect(page.locator('#p-cal')).to_be_visible()
    await open_settings(page, wide)
    await expect(choices.get_by_role('checkbox', name='Muistio', exact=True)).not_to_be_checked()
    await choices.get_by_role('checkbox', name='Muistio', exact=True).check()
    await expect(choices.get_by_role('checkbox', name='Kalenteri', exact=True)).to_be_enabled()
    await page.mouse.click(3, 4)
    await expect(page.locator('#section-settings')).to_be_hidden()
    if wide:
        await expect(page.get_by_role('tab', name='Muistio', exact=True)).to_be_visible()
    else:
        await page.locator('#roll').click()
        await expect(page.locator('#section-notes')).to_be_visible()
    assert not errors, errors
    print(f'{width} px: osioiden piilottaminen ja palautus toimivat')
    await context.close()


async def main():
    async with async_playwright() as playwright:
        try:
            browser = await playwright.chromium.launch()
        except Exception:
            browser = await playwright.chromium.launch(executable_path='/opt/pw-browsers/chromium')
        async with browser:
            for width in (320, 390, 1280, 1440):
                await run(browser, width)


if __name__ == '__main__':
    asyncio.run(main())
