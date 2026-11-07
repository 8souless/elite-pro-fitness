from helpers import run_module

def test_counts(page, base_url):
    page.goto(base_url + "/tests/blank.html")
    r = run_module(page, "/js/data/timetable.js",
        "Object.fromEntries(Object.entries(m.groupByDay(m.SESSIONS)).map(([d,l]) => [d,l.length]))")
    assert r == {"mon": 3, "tue": 2, "wed": 5, "thu": 3, "fri": 2, "sat": 6, "sun": 3}

def test_filters(page, base_url):
    page.goto(base_url + "/tests/blank.html")
    f = lambda k: run_module(page, "/js/data/timetable.js", f"m.filterSessions(m.SESSIONS,'{k}').length")
    assert (f("all"), f("ladies"), f("martial"), f("fitness"), f("juniors")) == (24, 3, 3, 3, 7)

def test_next_session(page, base_url):
    page.goto(base_url + "/tests/blank.html")
    # Tuesday 2026-11-10 18:30 local -> next is Tue Squad Training 19:00
    r = run_module(page, "/js/data/timetable.js", "m.nextSession(m.SESSIONS, new Date(2026,10,10,18,30)).id")
    assert r == "tue-squad-training"
    r = run_module(page, "/js/data/timetable.js", "m.nextSession(m.SESSIONS, new Date(2026,10,15,14,30)).id")
    assert r == "mon-junior-beginners"

def test_view_filter_and_mobile(page, base_url):
    page.set_viewport_size({"width": 375, "height": 812})
    page.goto(base_url + "/#timetable")
    page.click("#timetable [role=tab]:has-text('Ladies only')")
    assert page.locator("#timetable .session:visible").count() == 3
    assert page.evaluate("document.scrollingElement.scrollWidth") <= 375

def test_click_session_prefills_pass(page, base_url):
    page.goto(base_url + "/#timetable")
    page.click("#tue-ladies-only-boxing")
    page.wait_for_timeout(500)
    assert page.is_visible("#free-pass form")
    assert page.input_value("#pass-class") == "ladies"

