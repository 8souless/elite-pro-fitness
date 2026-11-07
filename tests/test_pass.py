from helpers import run_module

def test_validate(page, base_url):
    page.goto(base_url + "/tests/blank.html")
    r = run_module(page, "/js/pass/pass.js", """[
      m.validateLead({name:'   ', email:'a@b.co', classKey:'kids'}).errors.name,
      m.validateLead({name:'Jo', email:'nope', classKey:'kids'}).errors.email,
      m.validateLead({name:'Jo', email:'a@b.co', classKey:'x'}).errors.classKey,
      m.validateLead({name:'x'.repeat(200), email:'a@b.co', classKey:'kids'}).ok,
      m.validateLead({name:'  Sam   Lee ', email:'s@l.uk', classKey:'ladies'}).value.name ]""")
    assert r == ["Please enter your name.", "Please enter a valid email.", "Please choose a class.", False, "Sam Lee"]

def test_pass_id(page, base_url):
    page.goto(base_url + "/tests/blank.html")
    r = run_module(page, "/js/pass/pass.js", "m.makePassId(new Date(2026,10,7), () => 0)")
    assert r == "EPF-261107-AAAA"

def test_flow_escapes_and_blocks_double_submit(page, base_url):
    page.goto(base_url + "/#free-pass")
    page.evaluate("document.dispatchEvent(new CustomEvent('epf:coach-open'))")
    page.evaluate("(() => { window.__epfLeads = []; window.__epfSubmitOverride = l => (window.__epfLeads.push(l), Promise.resolve({ok:true, via:'endpoint'})); })()")
    page.fill("[name=name]", "<img src=x onerror=alert(1)> Jo")
    page.fill("[name=email]", "jo@ex.com")
    page.select_option("[name=classKey]", "adults")
    page.click("#free-pass button[type=submit]")
    page.click("#free-pass button[type=submit]", force=True)
    page.wait_for_timeout(300)
    assert page.locator("#free-pass .ticket img").count() == 0
    assert "<img" in page.inner_text("#free-pass .ticket .name")
    assert page.evaluate("window.__epfLeads.length") == 1
    assert page.evaluate("(() => { const n = document.querySelector('#free-pass .ticket .name'); return n.scrollWidth <= n.clientWidth + 1 })()")
