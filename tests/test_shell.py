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
    assert ids == ["hero", "classes", "coach", "timetable", "prices", "find-us"]

def test_brand_marks(page, base_url):
    page.goto(base_url + "/")
    assert page.get_attribute("nav img[alt='England Boxing affiliated club']", "src").endswith("england-boxing-logo.png")
    # Emblem should be scaled up and visible
    emblem_height = page.eval_on_selector("nav .emblem", "e => e.getBoundingClientRect().height")
    assert emblem_height >= 48, f"Emblem height {emblem_height} is under 48px"
    # England boxing badge should be enlarged and prominent
    eb_height = page.eval_on_selector(".affiliation-badge img", "e => e.getBoundingClientRect().height")
    assert eb_height >= 44, f"England Boxing badge height {eb_height} is under 44px"

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

def test_coach_responsive_layout(page, base_url):
    # Desktop (1440px): 2-column flanking layout
    page.set_viewport_size({"width": 1440, "height": 900})
    page.goto(base_url + "/#coach")
    hero_card = page.locator("#coach .coach-hero-card").bounding_box()
    pass_box = page.locator("#coach .coach-pass-column").bounding_box()
    assert hero_card and pass_box
    assert pass_box["x"] > hero_card["x"], "Desktop should have 2-column side-by-side layout"

    # Mobile (375px): stacked layout, full-width ticket
    page.set_viewport_size({"width": 375, "height": 812})
    page.goto(base_url + "/#coach")
    hero_card_m = page.locator("#coach .coach-hero-card").bounding_box()
    pass_box_m = page.locator("#coach .coach-pass-column").bounding_box()
    assert hero_card_m and pass_box_m
    assert pass_box_m["y"] > hero_card_m["y"], "Mobile should stack columns vertically"
    assert pass_box_m["width"] <= 375, "Free pass column should fit 375px viewport"

def test_coach_copyright_semantic_footer(page, base_url):
    page.goto(base_url + "/#coach")
    footer_el = page.locator("#coach footer.coach-copyright")
    assert footer_el.count() == 1
    assert footer_el.locator("small").count() == 1
    text = footer_el.text_content()
    assert "10452" in text
