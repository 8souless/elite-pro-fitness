def test_zones_and_seams(page, base_url):
    page.goto(base_url + "/")
    zones = page.eval_on_selector_all("#classes [data-zone]", "e => e.map(z => z.dataset.zone)")
    assert zones == ["juniors", "ladies", "adults", "squad", "community"]
    assert page.locator("#classes .seam .ropes").count() >= 5

def test_no_video_elements_in_classes(page, base_url):
    page.goto(base_url + "/#classes")
    video_count = page.locator("#classes video").count()
    assert video_count == 0, f"Found {video_count} video elements in classes section; expected 0"

def test_pricing_pills_explicitly_labeled(page, base_url):
    page.goto(base_url + "/#classes")
    pills = page.locator("#classes .zone-pill").all_text_contents()
    for pill in pills:
        if "£5" in pill:
            assert "Junior" in pill or "Under 18" in pill, f"Pill '{pill}' contains £5 without Junior/Under 18 designation"
        if "£7" in pill:
            assert "Adult" in pill or "Ladies" in pill or "Over 18" in pill, f"Pill '{pill}' contains £7 without Adult designation"

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
