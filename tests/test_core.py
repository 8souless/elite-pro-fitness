from helpers import run_module

def test_math(page, base_url):
    page.goto(base_url + "/tests/blank.html")
    r = run_module(page, "/js/core/math.js",
        "[m.clamp(2), m.seg(.5,0,1), m.io(.5), m.out(1), m.mix(0,10,.25), +m.damp(0,1,1e9,.016).toFixed(3)]")
    assert r == [1, 0.5, 0.5, 1, 2.5, 1]

def test_section_progress(page, base_url):
    page.goto(base_url + "/tests/blank.html")
    r = run_module(page, "/js/core/progress.js",
        "[m.sectionProgress(0,5000,1000), m.sectionProgress(-2000,5000,1000), m.sectionProgress(-9999,5000,1000), m.sectionProgress(-10,800,1000)]")
    assert r == [0, 0.5, 1, 0]

def test_loop_isolates_failures(page, base_url):
    page.goto(base_url + "/tests/blank.html")
    r = run_module(page, "/js/core/progress.js", """await new Promise(res => {
        let n = 0; const bad = {update(){ throw new Error('x') }};
        const good = {update(){ if (++n === 3) res(n) }};
        m.createLoop([bad, good]).start(); })""")
    assert r == 3
