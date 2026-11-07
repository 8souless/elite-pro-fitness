import os
import sys
import time
import base64
import subprocess
from io import BytesIO
from PIL import Image
from playwright.sync_api import sync_playwright

os.makedirs("assets/videos/posters", exist_ok=True)

proc = subprocess.Popen([sys.executable, "-m", "http.server", "8765", "--bind", "127.0.0.1"])
time.sleep(1)

videos = [
    ("stage0-exterior.mp4", "assets/videos/posters/stage0.webp"),
    ("stage1-gym.mp4", "assets/videos/posters/stage1.webp"),
    ("stage2-ring.mp4", "assets/videos/posters/stage2.webp"),
]

try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        page = b.new_page()

        for video_file, poster_path in videos:
            print(f"Extracting poster for {video_file}...")
            video_url = f"http://127.0.0.1:8765/assets/videos/{video_file}"
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <body>
                <video id="v" src="{video_url}" muted playsinline></video>
                <canvas id="c"></canvas>
            </body>
            </html>
            """
            page.set_content(html_content)

            # Seek to 1.0s and render frame
            data_url = page.evaluate("""() => new Promise((resolve, reject) => {
                const v = document.querySelector('#v');
                const c = document.querySelector('#c');
                v.addEventListener('loadeddata', () => {
                    v.currentTime = Math.min(1.0, v.duration * 0.5 || 0.5);
                });
                v.addEventListener('seeked', () => {
                    c.width = v.videoWidth || 720;
                    c.height = v.videoHeight || 1280;
                    const ctx = c.getContext('2d');
                    ctx.drawImage(v, 0, 0, c.width, c.height);
                    resolve(c.toDataURL('image/png'));
                });
                v.addEventListener('error', (e) => reject(e));
                v.load();
            })""")

            # Strip header and decode PNG bytes
            header, encoded = data_url.split(",", 1)
            raw_bytes = base64.b64decode(encoded)
            img = Image.open(BytesIO(raw_bytes))

            # Resize to max width 720 if larger
            if img.width > 720:
                new_h = int(img.height * (720 / img.width))
                img = img.resize((720, new_h), Image.Resampling.LANCZOS)

            img.save(poster_path, format="WEBP", quality=85)
            print(f"Saved {poster_path} ({img.size[0]}x{img.size[1]})")

        b.close()
finally:
    proc.terminate()
