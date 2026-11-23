"""Kalenterin viikkonauha, maanantaivalinta ja yhtenäiset kuittausruudut testivaultilla."""
import asyncio
import datetime
import json
from pathlib import Path

from playwright.async_api import async_playwright, expect
from apu import tab

HERE = Path(__file__).resolve().parent
URL = (HERE.parent / "index.html").as_uri()
FAKE = (HERE / "fakegh.js").read_text(encoding="utf8")
ALL_DAY = "Retken valmistelu ja mukana kulkevien varusteiden tarkistus"
TODAY = datetime.datetime(2026, 11, 23, 12, tzinfo=datetime.timezone.utc)


def event(title, when="", all_day=None):
    schedule = f"juuri: {json.dumps({'date': all_day})}\n" if all_day else ""
    body = f"{title} {when}.\n" if when else ""
    return f"---\ntyyppi: tapahtuma\notsikko: {title}\nlahde: emil\n{schedule}---\n# {title}\n\n{body}"


SEED = {
    "kalenteri/lyhyt.md": event("Lyhyt tapaaminen", "23.11. klo 9-9.15"),
    "kalenteri/pitka.md": event("Pidempi tapaaminen", "23.11. klo 10-12"),
    "kalenteri/retki.md": event(ALL_DAY, all_day="2026-11-23"),
}


async def run(browser, width, height):
    mobile = width < 1000
    ctx = await browser.new_context(viewport={"width": width, "height": height},
                                    has_touch=mobile, timezone_id="Europe/Helsinki")
    page = await ctx.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    await page.clock.set_fixed_time(TODAY)
    await page.add_init_script(FAKE + """
        ;(function(){
          var notes=%s;
          for(var path in notes)window.__repo.put(path,notes[path]);
          localStorage.setItem('kaikki:gh',JSON.stringify({repo:'testi/vault',token:'x',branch:'main'}));
          localStorage.setItem('kaikki:calview','d');
        })();
    """ % json.dumps(SEED))
    await page.goto(URL)
    await tab(page, "cal")
    await expect(page.locator(".ev")).to_have_count(2)
    selected = page.locator("#week button[aria-pressed=true]")
    await expect(selected).to_have_attribute("data-day", "2026-11-23")
    previous = page.get_by_role("button", name="Edellinen viikko")
    next_week = page.get_by_role("button", name="Seuraava viikko")
    month = page.get_by_role("button", name="Kuukausi", exact=True)

    if mobile:
        left, days, right = [await item.bounding_box() for item in (previous, page.locator("#week"), next_week)]
        assert 0 <= left["x"] < days["x"] < right["x"] < width, (left, days, right)
        assert left["y"] == days["y"] == right["y"], (left, days, right)
        assert right["x"] + right["width"] <= width
        assert (await month.bounding_box())["y"] < days["y"]
        await expect(page.locator("#pbar #calmonth, #pbar .calweek-step")).to_have_count(0)
        today = await page.locator("#caltoday").bounding_box()
        view = await page.locator("#calview").bounding_box()
        await expect(page.locator("#vref2")).to_be_visible()
        refresh = await page.locator("#vref2").bounding_box()
        quick = await page.locator("#quick-entry-mobile").bounding_box()
        center = today["y"] + today["height"] / 2
        assert all(abs(center - (box["y"] + box["height"] / 2)) <= 2
                   for box in (view, refresh, quick)), (today, view, refresh, quick)
    else:
        assert await page.locator("#week").evaluate("el=>el.classList.contains('wk7')")

    await page.locator('#week [data-day="2026-11-29"]').click()
    await next_week.click()
    await expect(selected).to_have_attribute("data-day", "2026-11-30")
    await page.locator('#week [data-day="2026-12-01"]').click()
    await expect(month).to_contain_text("Joulukuu")
    await month.click()
    await expect(page.locator("#csheet")).to_be_visible()
    await page.keyboard.press("Escape")
    await expect(page.locator("#csheet")).to_be_hidden()
    await previous.click()
    await expect(selected).to_have_attribute("data-day", "2026-11-23")
    await expect(month).to_contain_text("Marraskuu")

    untimed = page.locator("#untimed .uline")
    title = untimed.get_by_role("button", name=ALL_DAY, exact=True)
    checkbox = untimed.get_by_role("button", name=f"Kuittaa: {ALL_DAY}")
    await expect(title).to_have_css("text-overflow", "ellipsis")
    await checkbox.click()
    await expect(checkbox).to_have_count(0)
    await expect(untimed.get_by_role("button", name=f"Kuitattu: {ALL_DAY}")).to_have_attribute("aria-pressed", "true")
    await expect(page.locator("#nsheet")).to_be_hidden()
    await title.click()
    await expect(page.locator("#nsheet")).to_be_visible()
    await page.locator("#nsheet .sx").click()
    await expect(page.locator("#nsheet")).to_be_hidden()

    marks = await page.locator(".evck, #untimed .wck").evaluate_all("""buttons=>buttons.map(button=>{
        const mark=getComputedStyle(button,'::before');
        return [mark.width, mark.height, mark.borderRadius];
    })""")
    assert len(marks) == 3 and marks[0][:2] == ["16px", "16px"] and all(mark == marks[0] for mark in marks), marks

    short = page.locator(".ev.short .evck")
    await short.press("Enter")
    await expect(short).to_have_attribute("aria-pressed", "true")
    await expect(page.locator("#nsheet")).to_be_hidden()
    await page.locator('#calview [data-v="w"]').click()
    weekly = page.locator("#wklist .wline .wck").first
    await expect(weekly).to_be_attached()
    assert await weekly.evaluate("b=>getComputedStyle(b,'::before').width") == "16px"
    await next_week.click()
    await expect(selected).to_have_attribute("data-day", "2026-11-30")
    assert await page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    assert not errors, errors
    await ctx.close()
    print(f"OK {width}×{height}")


async def main():
    async with async_playwright() as playwright:
        try:
            browser = await playwright.chromium.launch()
        except Exception:
            browser = await playwright.chromium.launch(executable_path="/opt/pw-browsers/chromium")
        for width, height in ((390, 844), (320, 640), (1440, 900), (1280, 800)):
            await run(browser, width, height)
        await browser.close()


asyncio.run(main())
