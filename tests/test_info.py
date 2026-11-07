import pytest

def test_prices_exact(page, base_url):
    page.goto(base_url + "/#prices")
    t = page.inner_text("#prices")
    for s in ["£15", "£5", "£7", "£30", "£40", "£35", "1st of every month", "Yrs 11 and up"]:
        assert s in t

def test_contact_links(page, base_url):
    page.goto(base_url + "/#find-us")
    assert page.get_attribute("#find-us a[href^='tel:']", "href") == "tel:+447534444063"
    assert page.get_attribute("#find-us a[href^='mailto:']", "href") == "mailto:elitepro121@gmail.com"
    assert "B31 1UH" in page.inner_text("#find-us address")
    assert page.is_visible("footer img[alt='England Boxing affiliated club']")

def test_sponsors_and_directions(page, base_url):
    page.goto(base_url + "/#find-us")
    t = page.inner_text("#find-us")
    assert "Arden Estate Agents" in t
    assert "AA Garage Doors" in t
    assert page.is_visible("#find-us a[href*='maps']")
