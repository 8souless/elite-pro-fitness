import os
import sys
import time
import subprocess
import urllib.request
from playwright.sync_api import sync_playwright

VIEWPORTS = [
    ("mobile", 375, 812),
    ("mobile-land", 812, 375),
    ("tablet", 768, 1024),
    ("desktop", 1440, 900)
]

SECTIONS = ["hero", "classes", "timetable", "coach", "prices", "find-us"]

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

out_dir = os.path.abspath("docs/superpowers/screens")
os.makedirs(out_dir, exist_ok=True)

try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for name, w, h in VIEWPORTS:
            page = browser.new_page(viewport={"width": w, "height": h})
            page.goto(server_url + "/")
            page.wait_for_timeout(1000)

            # Full page overview
            page.screenshot(path=os.path.join(out_dir, f"{name}-full.png"), full_page=True)

            # Specific section shots
            for sec in SECTIONS:
                el = page.locator(f"#{sec}")
                if el.count() > 0:
                    el.scroll_into_view_if_needed()
                    page.wait_for_timeout(400)
                    page.screenshot(path=os.path.join(out_dir, f"{name}-{sec}.png"))

            # Coach open shot
            page.goto(server_url + "/#coach")
            page.wait_for_timeout(600)
            page.evaluate("document.dispatchEvent(new CustomEvent('epf:coach-open'))")
            page.wait_for_timeout(600)
            page.screenshot(path=os.path.join(out_dir, f"{name}-coach-open.png"))

            page.close()
        browser.close()
finally:
    proc.kill()

print(f"Screenshots captured into {out_dir}")

