import os
import sys
import time
import subprocess
import urllib.request
import statistics
from playwright.sync_api import sync_playwright

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

try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()
        
        # Emulate 4x CPU throttling via CDP
        client = context.new_cdp_session(page)
        client.send("Emulation.setCPUThrottlingRate", {"rate": 4})

        page.goto(server_url + "/")
        page.wait_for_timeout(1000)

        # Inject RAF timing sampler
        page.evaluate("""(() => {
            window.__frameDeltas = [];
            let last = performance.now();
            function sample(now) {
                window.__frameDeltas.push(now - last);
                last = now;
                if (window.__frameDeltas.length < 300) {
                    requestAnimationFrame(sample);
                }
            }
            requestAnimationFrame(sample);
        })()""")

        # Scroll down through hero and classes
        for i in range(15):
            page.mouse.wheel(0, 300)
            page.wait_for_timeout(60)

        deltas = page.evaluate("window.__frameDeltas")
        deltas = [d for d in deltas[5:] if d > 0] # ignore first frame
        if deltas:
            p95 = statistics.quantiles(deltas, n=20)[18] if len(deltas) >= 20 else max(deltas)
            avg = statistics.mean(deltas)
            print(f"SAMPLE_COUNT: {len(deltas)}")
            print(f"AVG_FRAME_MS: {avg:.2f}")
            print(f"P95_FRAME_MS: {p95:.2f}")
        else:
            print("No deltas captured")
        browser.close()
finally:
    proc.kill()
