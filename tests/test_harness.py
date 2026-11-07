import pytest
from helpers import run_module

def test_server_serves_blank(page, base_url):
    page.goto(f"{base_url}/tests/blank.html")
    assert page.title() == "blank"
    assert page.errors == []

def test_run_module_imports(page, base_url):
    page.goto(f"{base_url}/tests/blank.html")
    assert run_module(page, "/tests/blank-module.js", "m.answer") == 42
