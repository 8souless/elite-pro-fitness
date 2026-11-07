from helpers import run_module

def test_coach_portrait_is_prominent_and_visible(page, base_url):
    page.set_viewport_size({"width": 1280, "height": 800})
    page.goto(base_url + "/#coach")
    coach_img = page.locator("#coach .coach-portrait")
    assert coach_img.is_visible()
    box = coach_img.bounding_box()
    assert box["height"] >= 520, f"Full-figure coach height ({box['height']}) is too small"
    # Ensure uncropped styling
    fit = page.evaluate("el => window.getComputedStyle(el).objectFit", coach_img.element_handle())
    assert fit == "contain"

def test_free_pass_form_flanks_coach(page, base_url):
    page.set_viewport_size({"width": 1280, "height": 800})
    page.goto(base_url + "/#coach")
    pass_form = page.locator("#free-pass")
    assert pass_form.is_visible()
    header_text = page.locator("#free-pass h2, #free-pass h3").first.text_content()
    assert "claim" in header_text.lower() or "free" in header_text.lower()

def test_arc_math(page, base_url):
    page.goto(base_url + "/tests/blank.html")
    r = run_module(page, "/js/roster/arc.js", """(() => {
      const dims = {H:900, ws:152.1, d:474, gap:31.5, U:1170, P:1400}, XS = m.buildXS(dims.U);
      const c = m.tapeTransform(0, dims, XS, {x:0,y:0}, 0), f = m.tapeTransform(3, dims, XS, {x:0,y:0}, 0);
      return [m.rel(35,0,36), m.B(0), m.B(2), m.scl(0,1170), c.o, Math.round(c.ry), f.o, f.x > 0, f.ry > 0];
    })()""")
    assert r == [-1, 0, 0.5, 1, 1, -90, 0, True, True]

def test_vertical_wheel_not_hijacked(page, base_url):
    page.goto(base_url + "/#coach")
    y0 = page.evaluate("scrollY")
    page.hover("#coach")
    page.mouse.wheel(0, 600)
    page.wait_for_timeout(400)
    assert page.evaluate("scrollY") > y0

def test_open_coach_reveals_pass(page, base_url):
    page.set_viewport_size({"width": 1440, "height": 900})
    page.goto(base_url + "/#coach")
    page.wait_for_timeout(300)
    assert page.is_visible("#free-pass form")
