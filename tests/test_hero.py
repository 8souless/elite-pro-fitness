import json
import pytest
from helpers import run_module

def hs(page, p, **o):
    opts = {"portrait": False, "reduced": False, "age": 9, **o}
    return run_module(page, "/js/hero/timeline.js", f"m.heroState({p}, {json.dumps(opts)})")

def test_timeline_keyframes(page, base_url):
    page.goto(base_url + "/tests/blank.html")
    s0, s1, s2, s3 = hs(page, 0), hs(page, 0.33), hs(page, 0.87), hs(page, 1)
    assert (s0["stage"], s0["wordOpacity"]) == (0, 1)
    assert s1["stage"] == 1 and s1["listOpacity"] == 1 and s1["fog"] == 0
    assert hs(page, 0.58)["fog"] >= 0.99
    assert s2["stage"] == 2 and s2["barOpacity"] == 1
    assert s3["stage"] == 3 and s3["dim"] == 1 and s3["quoteOpacity"] == 0 and s3["barOpacity"] == 0

def test_timeline_reduced_has_no_dolly(page, base_url):
    page.goto(base_url + "/tests/blank.html")
    s = hs(page, 0.55, reduced=True)
    assert s["facadeScale"] == 1 and s["foreScale"] == 1 and s["emblemScale"] == 1

def test_native_wheel_scrolls_through_hero(page, base_url):
    page.set_viewport_size({"width": 1440, "height": 900})
    page.goto(base_url + "/")
    for _ in range(60):
        page.mouse.wheel(0, 400)
        page.wait_for_timeout(16)
    page.wait_for_timeout(500)
    assert page.evaluate("document.querySelector('#classes').getBoundingClientRect().top") < 900
    assert page.errors == []

def test_deep_link_and_reload_mid_hero(page, base_url):
    page.goto(base_url + "/#timetable")
    page.wait_for_timeout(300)
    assert page.evaluate("document.documentElement.dataset.heroStage") == "3"
    page.goto(base_url + "/")
    page.evaluate("scrollTo(0, document.querySelector('#hero').offsetHeight * 0.6)")
    page.wait_for_timeout(100)
    assert page.evaluate("document.documentElement.dataset.heroStage") == "2"

@pytest.mark.parametrize("launch_args", [["--disable-webgl", "--disable-3d-apis"]], indirect=True)
def test_no_webgl_fallback(page, base_url):
    page.goto(base_url + "/")
    page.wait_for_timeout(300)
    assert page.get_attribute("#hero", "data-webgl") == "off"
    assert page.is_visible(".emblem-fallback") and page.errors == []

def test_three_missing_and_image_404(page, base_url):
    page.route("**/three.min.js", lambda r: r.abort())
    page.route("**/interior-ring.webp", lambda r: r.fulfill(status=404))
    page.goto(base_url + "/")
    page.wait_for_timeout(300)
    assert [e for e in page.errors if "404" not in e and "Failed to load resource" not in e] == []

def test_reduced_motion(page, base_url):
    page.emulate_media(reduced_motion="reduce")
    page.goto(base_url + "/")
    page.evaluate("scrollTo(0, document.querySelector('#hero').offsetHeight * 0.5)")
    page.wait_for_timeout(50)
    assert page.evaluate("getComputedStyle(document.querySelector('#facade')).transform") in ("none", "matrix(1, 0, 0, 1, 0, 0)")

def test_bar_prefills_pass(page, base_url):
    page.set_default_timeout(3000)
    page.goto(base_url + "/")
    page.evaluate("scrollTo(0, document.querySelector('#hero').offsetHeight * 0.8)")
    page.wait_for_timeout(600)
    page.select_option("#bar select[name=class]", "ladies")
    page.eval_on_selector("#bar button", "b => b.click()")
    page.wait_for_timeout(900)
    assert page.input_value("#free-pass select[name=classKey]") == "ladies"

def test_dolly_transition_keyframes(page, base_url):
    page.goto(base_url + "/tests/blank.html")
    s_door = hs(page, 0.46)
    s_corridor = hs(page, 0.58)
    assert s_door["dollyDoorOpacity"] >= 0.8
    assert s_corridor["dollyCorridorOpacity"] >= 0.8

