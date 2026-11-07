import os
import sys
import time
import socket
import subprocess
import urllib.request
import pytest
from playwright.sync_api import sync_playwright

sys.path.insert(0, os.path.dirname(__file__))

@pytest.fixture(scope="session")
def base_url():
    port = 8765
    host = "127.0.0.1"
    server_url = f"http://{host}:{port}"
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

    proc = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(port), "--bind", host],
        cwd=repo_root,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )

    ready = False
    for _ in range(50):
        try:
            with urllib.request.urlopen(f"{server_url}/tests/blank.html", timeout=1) as resp:
                if resp.status == 200:
                    ready = True
                    break
        except Exception:
            time.sleep(0.1)

    if not ready:
        proc.kill()
        raise RuntimeError(f"HTTP server failed to start on {server_url}")

    yield server_url

    proc.terminate()
    proc.wait()

@pytest.fixture
def launch_args(request):
    return getattr(request, "param", [])

@pytest.fixture
def page(launch_args):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=launch_args)
        context = browser.new_context()
        page_obj = context.new_page()
        page_obj.errors = []

        def on_page_error(exc):
            page_obj.errors.append(str(exc))

        def on_console(msg):
            if msg.type == "error":
                page_obj.errors.append(msg.text)

        page_obj.on("pageerror", on_page_error)
        page_obj.on("console", on_console)

        yield page_obj

        context.close()
        browser.close()
