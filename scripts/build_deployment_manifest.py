import os
import hashlib
import json

files_to_deploy = [
    "vercel.json",
    "index.html",
    "css/tokens.css",
    "css/base.css",
    "css/hero.css",
    "css/descent.css",
    "css/timetable.css",
    "css/roster.css",
    "css/pass.css",
    "css/info.css",
    "js/main.js",
    "js/core/math.js",
    "js/core/progress.js",
    "js/data/coaches.js",
    "js/data/timetable.js",
    "js/descent/descent.js",
    "js/descent/particles.js",
    "js/hero/dust.js",
    "js/hero/emblem.js",
    "js/hero/hero.js",
    "js/hero/timeline.js",
    "js/pass/lead.js",
    "js/pass/pass.js",
    "js/pass/view.js",
    "js/roster/arc.js",
    "js/roster/view.js",
    "js/timetable/view.js",
    "assets/three.min.js",
    "assets/england-boxing-logo.png",
    "assets/brand/epf-emblem.webp",
    "assets/cards.webp",
    "assets/coach.webp",
    "assets/corner.webp",
    "assets/fore.webp",
    "assets/logo-3d.webp",
    "assets/outside.webp",
    "assets/gen/dolly-corridor.webp",
    "assets/gen/dolly-doorway.webp",
    "assets/gen/facade-dusk.webp",
    "assets/gen/interior-ring.webp",
    "assets/gen/prog-adults.webp",
    "assets/gen/prog-juniors.webp",
    "assets/gen/prog-kids.webp",
    "assets/gen/prog-ladies.webp",
    "assets/gen/texture-pricing.webp",
    "assets/gen/texture-timetable.webp",
    "assets/gen/zone-adults.webp",
    "assets/gen/zone-community.webp",
    "assets/gen/zone-juniors.webp",
    "assets/gen/zone-ladies.webp",
    "assets/gen/zone-squad.webp",
    "assets/videos/posters/stage0.webp",
    "assets/videos/posters/stage1.webp",
    "assets/videos/posters/stage2.webp",
    "assets/videos/stage0-exterior.mp4",
    "assets/videos/stage1-gym.mp4",
    "assets/videos/stage2-ring.mp4"
]

manifest = []
total_sz = 0
for rel in files_to_deploy:
    path = os.path.abspath(rel)
    if not os.path.exists(path):
        print(f"MISSING: {rel}")
        continue
    data = open(path, "rb").read()
    sz = len(data)
    total_sz += sz
    sha1 = hashlib.sha1(data).hexdigest()
    manifest.append({
        "file": rel.replace("\\", "/"),
        "sha": sha1,
        "size": sz
    })

print(f"Total files: {len(manifest)}, total size: {total_sz} bytes ({total_sz/1024/1024:.2f} MB)")
with open("deployment-manifest.json", "w") as f:
    json.dump(manifest, f, indent=2)
print("Saved deployment-manifest.json")
