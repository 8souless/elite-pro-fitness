from helpers import run_module

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
    page.hover("#coach .shelf")
    page.mouse.wheel(0, 600)
    page.wait_for_timeout(400)
    assert page.evaluate("scrollY") > y0

def test_open_coach_reveals_pass(page, base_url):
    page.set_viewport_size({"width": 1440, "height": 900})
    page.goto(base_url + "/#coach")
    page.wait_for_timeout(600)
    page.click("#coach .tape.is-active")
    page.wait_for_timeout(1000)
    assert "is-open" in page.get_attribute("#coach", "class")
    assert page.is_visible("#free-pass form")

def test_roster_keyboard(page, base_url):
    page.goto(base_url + "/#coach")
    page.focus("#coach .shelf")
    page.keyboard.press("ArrowRight")
    page.wait_for_timeout(900)
    assert page.inner_text("#coach .caption .title") == "Adults (mixed)"
