def test_zones_and_seams(page, base_url):
    page.goto(base_url + "/")
    zones = page.eval_on_selector_all("#classes [data-zone]", "e => e.map(z => z.dataset.zone)")
    assert zones == ["juniors", "ladies", "adults", "squad", "community"]
    assert page.locator("#classes .seam .ropes").count() >= 5

def test_reels_are_safe(page, base_url):
    page.goto(base_url + "/")
    for v in page.query_selector_all(".reel video"):
        assert v.get_attribute("muted") is not None and v.get_attribute("playsinline") is not None
        assert v.get_attribute("poster").endswith(".webp")

def test_particles_idle_offscreen(page, base_url):
    page.goto(base_url + "/")
    page.wait_for_timeout(500)
    assert page.evaluate("window.__epf.particles.map(p => p.drawCount).every(n => n === 0)")
    page.evaluate("document.querySelector('[data-zone=ladies]').scrollIntoView()")
    page.wait_for_timeout(500)
    assert page.evaluate("window.__epf.particles.some(p => p.drawCount > 0)")

def test_reveal_runs_once(page, base_url):
    page.goto(base_url + "/")
    page.evaluate("document.querySelector('[data-zone=adults]').scrollIntoView()")
    page.wait_for_timeout(1400)
    assert page.get_attribute("[data-zone=adults] .copy", "data-revealed") == "1"
