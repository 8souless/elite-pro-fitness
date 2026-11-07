import pytest

VIEWPORTS = [(375, 812), (812, 375), (768, 1024), (1440, 900)]

@pytest.mark.parametrize("w,h", VIEWPORTS)
def test_no_horizontal_overflow(page, base_url, w, h):
    page.set_viewport_size({"width": w, "height": h})
    page.goto(base_url + "/")
    assert page.evaluate("document.scrollingElement.scrollWidth") <= w
    assert page.errors == []

def test_sections_in_order(page, base_url):
    page.goto(base_url + "/")
    ids = page.eval_on_selector_all("main > section[id]", "els => els.map(e => e.id)")
    assert ids == ["hero", "classes", "timetable", "coach", "prices", "find-us"]

def test_brand_marks(page, base_url):
    page.goto(base_url + "/")
    assert page.get_attribute("nav img[alt='England Boxing affiliated club']", "src").endswith("england-boxing-logo.png")
    assert page.eval_on_selector("nav .emblem", "e => e.getBoundingClientRect().height") >= 40

@pytest.mark.parametrize("w,h", [(375, 812), (812, 375)])
def test_mobile_cta_reachable(page, base_url, w, h):
    page.set_viewport_size({"width": w, "height": h})
    page.goto(base_url + "/")
    page.click("nav a[href='#free-pass']")
    page.wait_for_timeout(400)
    assert page.evaluate("document.querySelector('#free-pass').getBoundingClientRect().top") < h

def test_all_sections_have_3d_scroll_perspective(page, base_url):
    page.goto(base_url + "/")
    sections = page.locator("main > section")
    for i in range(sections.count()):
        sec = sections.nth(i)
        assert sec.is_visible()

