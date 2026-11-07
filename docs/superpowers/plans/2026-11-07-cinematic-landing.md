# Elite Pro Fitness Cinematic Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Elite Pro Fitness landing page. It opens on a scroll-driven cinematic hero (Redline mechanic) that dives through the gym door into the ring, punches through the ropes and carries straight on into a vertical descent through the training zones (Hollowmere mechanic). Below that come the timetable, the coach roster with the free-pass generator, prices and contact details.

**Architecture:** A static site with no build step: `index.html` plus native ES modules and plain CSS. The whole page uses **native document scroll**. The hero is a tall section with a sticky stage, and its progress `p ∈ [0,1]` comes from the section's position on screen, so no wheel events are ever intercepted and no scroll lock exists. One `requestAnimationFrame` loop updates every controller. The photographic plates are DOM layers moved with transforms, the same split Redline uses for its land and foreground layers. Three.js renders only the EPF emblem with shader light. If WebGL fails, the emblem falls back to an `<img>` and the rest of the page is unaffected.

**Tech Stack:** HTML, CSS and vanilla JS (ES modules). Three.js from the local `assets/three.min.js` (2021 UMD build, global `THREE`). Python 3 with pytest and Playwright (Chromium) for tests. Pillow for the asset scripts. The `image-generator` subagent makes the stills. Gemini Omni 1.2 Flash is optional, for video.

**Spec:** `docs/superpowers/specs/2026-11-07-cinematic-landing-design.md`

## Spec Amendments (facts found while planning; these override the spec)

| Spec says | Reality / decision |
|---|---|
| Phone 07936 988705 (from a directory) | The gym's own signage shows **07534 444 063**, **elitepro121@gmail.com** and **elitepro-fitness.com**. Use the signage. *(User to confirm.)* |
| "South Birmingham ABC" | The building's wall reads **"ELITE ABC"** and the door reads "South Birmingham Community". Copy uses **Elite ABC**. *(User to confirm.)* |
| Coach "Ian Walker" | The name came from a web directory and is unverified. Keep it in one place only: `js/data/coaches.js`. *(User to confirm.)* |
| Address 199–201A | The door reads **201A**. Use "201A Merritts Brook Lane, Northfield, Birmingham B31 1UH". |
| Hours | The timetable says "Open 12–9pm Mon–Sat" and the pavement board says "9am–9pm". The site shows **"Mon–Sat 12–9pm, plus weekend morning sessions"**. *(User to confirm.)* |
| `stage*.mp4` are exterior/gym/ring stages | All three are **vertical phone clips shot inside the gym**. They become muted reels in the descent zones, not hero stages. |
| Three.js camera dolly over all layers | The plates are DOM layers and only the emblem is WebGL, as Redline does it. This removes the WebGL single point of failure. |
| Three r170 import map, `colorSpace` | Use the local r13x build. Do **not** use `colorSpace` or `NoColorSpace`, which don't exist in that build. |
| EPF emblem "to be isolated" | `assets/logo-stacked.png` is already emblem-only, but the mark fills only about 45% of a 2048² canvas. Task 1 trims it tight so it can be shown large. |
| QR watermark on pass | Dropped. A QR code that doesn't scan to anything would be misleading. The pass shows a large pass ID instead. |
| Imagen 3 / Veo 2 / Runway | Stills come from the `image-generator` subagent. Video is optional through Gemini Omni Flash and needs `GEMINI_API_KEY` plus ffmpeg, neither of which is present today. The hero is complete without video. |
| Roster "flanked by credentials" | No coaching credentials are verified, so none are invented. The VHS arc holds Coach Ian as the centre cover plus one spine per **programme** (real timetable data). Coaches added later get their own covers. |

## Global Constraints

- No build step and no npm. ES modules are served over HTTP: `python -m http.server 8765 --bind 127.0.0.1` from the repo root.
- Never call `preventDefault()` on `wheel`, `touchmove` or `keydown` for scrolling. Never set `overflow:hidden` on `html` or `body`.
- Colour tokens are copied verbatim from the spec: `--bg-void:#09090C; --bg-surface:#121318; --ring-red:#E52E2E; --ring-red-glow:rgba(229,46,46,.35); --champion-gold:#F5A623; --ink-white:#F8F8FC; --ink-muted:#9A9BA8; --chalk-dust:rgba(240,240,255,.7)`.
- Fonts: Oswald 500–700 for display (uppercase, tracking −0.02em to −0.04em) and Inter 400–700 for body text, from Google Fonts with `display=swap` and system fallbacks.
- Canvas DPR is `Math.min(devicePixelRatio, 1.75)`.
- Breakpoints to verify: 375×812, 812×375, 768×1024 and 1440×900. Horizontal overflow must be 0.
- `prefers-reduced-motion: reduce` means no dolly, no particles drift and instant progress (no damping).
- British English. Prices are shown exactly as £15, £5, £7, £30, £40 and £35.
- No generated image may show an identifiable face. Coach Ian appears only in his real photos (`coach.webp`, `cards.webp`).
- Before any UI edit, read `.agents/skills/impeccable/reference/craft-floor.md`.
- Every controller has the interface `{ update(t:number, dt:number, scroll:{y:number, vh:number, vw:number}):void, resize?():void }`.

## Review Focus

1. **Arriving mid-page.** This covers a deep link to `/#timetable`, a reload halfway through the hero, and a fast trackpad fling. The hero must show the stage for the current scroll position on the first frame and never get stuck. Tests are in Task 5.
2. **WebGL unavailable, Three.js failing to load or an image 404.** The page stays fully readable with zero uncaught errors, and the emblem shows as an `<img>`. Tests are in Task 5.
3. **Reduced motion.** There's no dolly or drift and every section is still reachable and legible. Tests are in Task 5.
4. **Small and landscape phones (375×812, 812×375).** No horizontal overflow, the nav and CTA are usable and no copy is clipped. Tests are in Task 3.
5. **Pass form abuse.** This covers a whitespace-only name, an invalid email, double submit, a 200-character name and HTML in the name. Each must be rejected or escaped, and the ticket must never overflow. Tests are in Task 9.

---

## File Structure

```
index.html                      page markup + all copy
css/tokens.css                  tokens, fonts, grain
css/base.css                    reset, nav, buttons, layout utilities, ropes component
css/hero.css  css/descent.css  css/timetable.css  css/roster.css  css/pass.css  css/info.css
js/main.js                      boot: create controllers, single RAF loop
js/core/math.js                 clamp, mix, seg, io, out, smoothstep, damp
js/core/progress.js             sectionProgress, createLoop, prefersReducedMotion
js/hero/timeline.js             heroState(p, opts) — pure
js/hero/emblem.js               createEmblemScene(canvas, url) — Three.js, may return null
js/hero/dust.js                 createDust(canvas) — 2D motes
js/hero/hero.js                 init(root) → controller
js/hero/sequence.js             createFrameSequence(canvas, manifestUrl) — optional (Task 11)
js/descent/particles.js         createParticles(canvas, kind, count)
js/descent/descent.js           init(root) → controller (reveals, reels, particles)
js/data/timetable.js            SESSIONS, FILTERS, filterSessions, groupByDay, nextSession, sessionsForClass
js/data/coaches.js              COACHES, PROGRAMMES
js/timetable/view.js            init(root) → controller
js/roster/arc.js                arc geometry — pure
js/roster/view.js               init(root) → controller
js/pass/pass.js                 validateLead, makePassId, escapeText
js/pass/lead.js                 LEAD_CONFIG, submitLead
js/pass/view.js                 init(root) → controller, ticket render, PNG save
scripts/build_assets.py         emblem trim + webp conversion
scripts/grab_posters.py         video poster frames via Playwright
assets/brand/epf-emblem.png|webp   assets/gen/*.webp   assets/videos/posters/*.webp
tests/conftest.py  tests/blank.html  tests/test_*.py
requirements-dev.txt  .gitignore
```

## Copy Deck (exact strings; used in Tasks 3–10)

- **Nav:** emblem + "ELITE PRO FITNESS" / "South Birmingham" · links "Classes" `#classes`, "Timetable" `#timetable`, "Coach" `#coach`, "Prices" `#prices`, "Find us" `#find-us` · CTA "Claim free session" `#free-pass` · badge `england-boxing-logo.png` alt "England Boxing affiliated club".
- **Hero, stage 0:** eyebrow "Northfield · South Birmingham" · giant word "ELITE" · hint "Scroll to step inside".
- **Hero, stage 1:** pin "201A Merritts Brook Lane" · word "NORTHFIELD" · list "Kids", "Juniors", "Adults (mixed)", "Ladies only" · card button "See times".
- **Hero, stage 2:** small "Step into" / big "THE RING" · bar fields "Class" (select), "Day" (select, filled from the timetable), "First session" = "Free" · button aria-label "Claim my free session".
- **Hero, punch-through quote:** "Tough times don't last. Tough people do."
- **Zone: Kids & Juniors** `#classes`. h2 "Start young. Grow strong." p "Juniors learn boxing the right way: stance, footwork, discipline and respect. Beginners train in a safe, structured class. The committed move up to Junior Elite Squad and on to competition." Facts: "Junior Beginners · Mon & Wed 5:30–6:30pm", "Advanced Juniors · Sat 9:30–10:30am", "Junior Development Group · 10 weeks · £35 · Yrs 11 and up".
- **Zone: Ladies only.** h2 "Your session. Your pace." p "Women-only boxing on Tuesday and Thursday evenings, plus Legs, Bums & Tums at Wednesday lunchtime. Proper technique, proper conditioning, no audience."
- **Zone: Adults (mixed).** h2 "Train like a fighter. No fight required." p "Mixed adult sessions for every level: pads, bags, conditioning and real boxing skills. Come to get fit. Stay because it's the best hour of your week."
- **Zone: Squad & Seniors.** h2 "For those who want to compete." p "Senior Elite Boxing and Squad Training are where Elite ABC's amateur boxers prepare for England Boxing club shows."
- **Zone: Community.** big "Put the knives down. Put the gloves on." small "Black eyes don't ruin lives. Knives do." caption "Painted on our front door. We mean it."
- **Timetable** `#timetable`. h2 "The week at Elite." sub "A clean, friendly, fully equipped studio. Mon–Sat 12–9pm, plus weekend morning sessions." "Next up" label "Next session".
- **Coach** `#coach`. eyebrow "Owner & Head Coach" · h2 = `COACHES[0].name` · p1 "Elite Pro Fitness is {first}'s gym. He built it for Northfield: a place where a nervous beginner and a carded amateur train side by side." · p2 "Not sure where to start? Claim a free session and he'll find the right class for you."
- **Pass** `#free-pass`. h3 "Your first session is on us." · labels "Full name", "Email", "Which class?" · options "Kids", "Juniors", "Adults (mixed)", "Ladies only" · button "Generate my free pass" · small print "No payment, no contract. Show this pass, or just give your name at the door." · ticket heading "ELITE PRO FITNESS · GUEST PASS" / "ADMIT ONE · FREE SESSION" · actions "Save pass", "Start again".
- **Prices** `#prices`. h2 "Straight-up prices." Rows: "Joining fee · £15 one-off"; "Under 18 · £5 per session · £30 a month"; "Over 18 · £7 per session · £40 a month"; note "Monthly memberships are due on the 1st of every month." Callout: "Junior Development Group · starting soon · 10 weeks · £35 · Yrs 11 and up". CTA "Your first session is free →" `#free-pass`.
- **Find us** `#find-us`. h2 "Find us." Address, hours, phone `tel:+447534444063`, email `mailto:elitepro121@gmail.com`, button "Get directions" → `https://www.google.com/maps/search/?api=1&query=201A+Merritts+Brook+Lane+Birmingham+B31+1UH`. Sponsors line: "Proudly supported by Arden Estate Agents and AA Garage Doors."
- **Footer:** "England Boxing affiliated · © 2026 Elite Pro Fitness, Northfield, Birmingham".

## Recommended model per task (token-friendly)

| Task | Model | Thinking |
|---|---|---|
| 0, 1, 4, 10 | Gemini 3.8 Flash | Medium |
| 2 (stills) | main agent dispatching `image-generator` | — |
| 3, 6, 7, 9 | Claude Sonnet 5.5 | Medium |
| 5 (hero), 8 (arc) | Claude Sonnet 5.5 | High |
| 11 (optional video) | main agent + Gemini Omni 1.2 Flash API | — |
| 12 final review | Claude Opus 5.5, once | Medium |

---

### Task 0: Repository and test harness

**Files:**
- Create: `.gitignore`, `requirements-dev.txt`, `tests/conftest.py`, `tests/blank.html`, `tests/test_harness.py`

**Interfaces:**
- Produces: the pytest fixtures `base_url` (str, session scope; starts and stops the HTTP server), `page` (Playwright page with `page.errors: list[str]` collecting `pageerror` events and console `error` messages), `launch_args` (a list[str] that tests can override with `@pytest.mark.parametrize("launch_args", [[...]], indirect=True)`) and the helper `run_module(page, path:str, expr:str)`. The helper evaluates `expr` with `m` bound to `await import(path)` and returns the JSON-serialisable result.

- [ ] **Step 1: Repair git.** `.git` has no `objects/` folder, so git reports "not a git repository". Run `Rename-Item .git .git-broken-20261107`. **Default (keeps history):** `git clone --no-checkout https://github.com/8souless/epf.git .tmp-epf` (BypassSandbox, network), then `Move-Item .tmp-epf/.git .git`, `Remove-Item .tmp-epf -Recurse`, `git checkout -b feat/cinematic-landing`. **Fallback if the clone fails:** `git init -b main` and `git remote add origin https://github.com/8souless/epf.git`. Never push.
- [ ] **Step 2: Write `.gitignore`** with `.git-broken-*/`, `.superpowers/`, `.tmp-epf/`, `__pycache__/`, `.pytest_cache/`, `test-results/`.
- [ ] **Step 3: Write `requirements-dev.txt`** with `pytest>=8`, `playwright>=1.48` and `pillow>=11`. Install with `python -m pip install -r requirements-dev.txt` and `python -m playwright install chromium` (BypassSandbox, network). If Python 3.15 has no wheels, use `py -3.13`.
- [ ] **Step 4: Write the failing test** `tests/test_harness.py`:

```python
def test_server_serves_blank(page, base_url):
    page.goto(f"{base_url}/tests/blank.html")
    assert page.title() == "blank"
    assert page.errors == []

def test_run_module_imports(page, base_url):
    page.goto(f"{base_url}/tests/blank.html")
    assert run_module(page, "/tests/blank-module.js", "m.answer") == 42
```

`tests/blank.html` is `<!doctype html><title>blank</title>`, and `tests/blank-module.js` is `export const answer = 42;`.
- [ ] **Step 5: Run** `python -m pytest tests/test_harness.py -v`. Expected: FAIL (fixtures missing).
- [ ] **Step 6: Implement `tests/conftest.py`.** The server is a subprocess, `python -m http.server 8765 --bind 127.0.0.1`, with cwd set to the repo root. Poll until it answers, terminate it at session end. The browser is Chromium, headless, with `args=launch_args`. Put `run_module` in `tests/helpers.py`. Every test file starts with `import json, pytest` and `from helpers import run_module` (pytest puts `tests/` on `sys.path` through the conftest).
- [ ] **Step 7: Run** the same command. Expected: 2 passed.
- [ ] **Step 8: Commit:** `git add .gitignore requirements-dev.txt tests && git commit -m "chore: test harness and repo repair"`

---

### Task 1: Brand assets (tight emblem + webp pipeline)

**Files:**
- Create: `scripts/build_assets.py`, `assets/brand/epf-emblem.png`, `assets/brand/epf-emblem.webp`, `tests/test_assets.py`

**Interfaces:**
- Produces: `scripts/build_assets.py` with `trim_emblem(src:Path, dst:Path, pad_ratio:float=0.04) -> tuple[int,int]` and `to_webp(src:Path, dst:Path, max_w:int, quality:int=82) -> tuple[int,int]`. The CLI `python scripts/build_assets.py` (re)builds the emblem and converts every `assets/gen/*.png` to `assets/gen/*.webp`, with max_w 2400 for files starting `zone-`, `facade-`, `interior-` or `texture-`, and 1400 for files starting `prog-`.

- [ ] **Step 1: Write the failing tests:**

```python
from PIL import Image
def test_emblem_is_tight_and_transparent():
    im = Image.open("assets/brand/epf-emblem.png").convert("RGBA")
    bbox = im.getchannel("A").point(lambda a: 255 if a > 16 else 0).getbbox()
    w, h = im.size
    assert (bbox[2]-bbox[0]) / w >= 0.90 and (bbox[3]-bbox[1]) / h >= 0.90
    assert im.getpixel((0, 0))[3] == 0
    assert max(w, h) >= 900

def test_emblem_webp_exists():
    assert Image.open("assets/brand/epf-emblem.webp").size[0] >= 600
```

- [ ] **Step 2: Run** `python -m pytest tests/test_assets.py -v`. Expected: FAIL (file missing).
- [ ] **Step 3: Implement** `trim_emblem` and `to_webp`. The source is `assets/logo-stacked.png`. Crop to the alpha bbox (alpha > 16), then add `pad_ratio` transparent padding.
- [ ] **Step 4: Run** `python scripts/build_assets.py && python -m pytest tests/test_assets.py -v`. Expected: PASS.
- [ ] **Step 5: Commit:** `git add scripts assets/brand tests/test_assets.py && git commit -m "feat: tight EPF emblem and webp asset pipeline"`

---

### Task 2: Generated cinematic stills

**Files:**
- Create: `assets/gen/*.png` (via the `image-generator` subagent), `assets/gen/*.webp` (via Task 1's CLI), `assets/gen/SHOTLIST.md`
- Modify: `tests/test_assets.py`

**Interfaces:**
- Consumes: `to_webp` from Task 1.
- Produces: the webp files listed below. Every later task references them by these exact names.

**Look for every shot:** photoreal, 35mm, shallow depth of field, tungsten practicals and haze, deep shadow `#09090C` with crimson `#E52E2E` and warm gold `#F5A623` light, fine film grain, **no identifiable faces** (figures from behind or in silhouette), no brand logos except where the reference shows the gym's own signage.

| File (png → webp) | Size | Reference images | Content | Copy-safe side |
|---|---|---|---|---|
| `facade-dusk` | 2688×1520 | `assets/outside.webp` | The same building at blue-hour dusk. Murals, signage and "201A" preserved. Doors lit warm from inside, wet pavement, sodium streetlight. | none (hero) |
| `interior-ring` | 2688×1520 | `cards.webp` (both ring photos) | View from just inside the door: ring with red and black ropes, dark gym, overhead spot on the canvas, heavy bags at the edges, chalk haze, empty of people. Upper 40% kept calm for the title. | top |
| `zone-juniors` | 2688×1520 | — | Small gloves and pads on a bench, a junior seen from behind wrapping hands, warm light. | left |
| `zone-ladies` | 2688×1520 | — | A woman from behind on a heavy bag, crimson rim light, chalk in the air. | right |
| `zone-adults` | 2688×1520 | — | Pad work in silhouette against a lit window, sweat spray in backlight. | left |
| `zone-squad` | 2688×1520 | `cards.webp` (corner photo) | Ring corner with stool, bucket and towel, competition night haze, empty. | right |
| `zone-community` | 2688×1520 | `outside.webp` (door panel) | A close, dramatic crop of a pair of worn boxing gloves hung on a nail on painted brick, night. | left |
| `prog-kids`, `prog-juniors`, `prog-adults`, `prog-ladies` | 1400×1000 | — | Detail shots: small gloves (kids), hand wraps (juniors), pads mid-strike (adults), skipping rope and gloves (ladies). | — |
| `texture-timetable` | 2688×1520 | — | Dark gym wall with gaffer tape and chalk marks, very low contrast. | all |
| `texture-pricing` | 2688×1520 | — | Close-up of a worn ring-canvas apron, low contrast. | all |

- [ ] **Step 1: Write the failing test** (append to `tests/test_assets.py`):

```python
GEN = ["facade-dusk","interior-ring","zone-juniors","zone-ladies","zone-adults","zone-squad",
       "zone-community","prog-kids","prog-juniors","prog-adults","prog-ladies",
       "texture-timetable","texture-pricing"]
def test_generated_stills_present_and_sized():
    import os
    for n in GEN:
        p = f"assets/gen/{n}.webp"
        w, h = Image.open(p).size
        assert w >= (1400 if n.startswith("prog-") else 2000), n
        assert 1.25 <= w / h <= 1.9, n
        assert os.path.getsize(p) < 650_000, n
```

- [ ] **Step 2: Run** `python -m pytest tests/test_assets.py::test_generated_stills_present_and_sized -v`. Expected: FAIL.
- [ ] **Step 3: Generate.** Dispatch the `image-generator` subagent once per row with the shared look, the row's content, the size, the reference image paths and the output path `assets/gen/<file>.png`. Record each final prompt in `assets/gen/SHOTLIST.md`. Reject and regenerate any shot with a readable face, distorted signage text or a missing copy-safe area.
- [ ] **Step 4: Run** `python scripts/build_assets.py`, then the test. Expected: PASS.
- [ ] **Step 5: Commit:** `git add assets/gen tests/test_assets.py && git commit -m "feat: generated cinematic stills"`

---

### Task 3: Page shell, nav, tokens and copy

**Files:**
- Create: `index.html`, `css/tokens.css`, `css/base.css`, `js/main.js` (empty boot that imports nothing yet), `tests/test_shell.py`

**Interfaces:**
- Produces: these section ids in DOM order: `hero`, `classes` (descent wrapper; zones inside have `data-zone="juniors|ladies|adults|squad|community"`), `timetable`, `coach` (contains `#free-pass`), `prices`, `find-us`. Also the component class `.ropes` (three twisted rope bars, red/black/red, built from CSS gradients, height `clamp(48px,7vw,96px)`), which Tasks 5 and 6 reuse.

- [ ] **Step 1: Write the failing tests:**

```python
import pytest
VIEWPORTS = [(375,812),(812,375),(768,1024),(1440,900)]
@pytest.mark.parametrize("w,h", VIEWPORTS)
def test_no_horizontal_overflow(page, base_url, w, h):
    page.set_viewport_size({"width": w, "height": h}); page.goto(base_url + "/")
    assert page.evaluate("document.scrollingElement.scrollWidth") <= w
    assert page.errors == []

def test_sections_in_order(page, base_url):
    page.goto(base_url + "/")
    ids = page.eval_on_selector_all("main > section[id]", "els => els.map(e => e.id)")
    assert ids == ["hero","classes","timetable","coach","prices","find-us"]

def test_brand_marks(page, base_url):
    page.goto(base_url + "/")
    assert page.get_attribute("nav img[alt='England Boxing affiliated club']", "src").endswith("england-boxing-logo.png")
    assert page.eval_on_selector("nav .emblem", "e => e.getBoundingClientRect().height") >= 40

@pytest.mark.parametrize("w,h", [(375,812),(812,375)])
def test_mobile_cta_reachable(page, base_url, w, h):
    page.set_viewport_size({"width": w, "height": h}); page.goto(base_url + "/")
    page.click("nav a[href='#free-pass']")
    page.wait_for_timeout(400)
    assert page.evaluate("document.querySelector('#free-pass').getBoundingClientRect().top") < h
```

- [ ] **Step 2: Run** `python -m pytest tests/test_shell.py -v`. Expected: FAIL.
- [ ] **Step 3: Implement** the markup with every Copy Deck string. Each section carries its backdrop (`assets/gen/*.webp`) as a CSS background; no section is flat colour. Add the grain overlay (SVG `feTurbulence`, fixed, `mix-blend-mode:overlay`, opacity .08, `pointer-events:none`). The nav emblem uses `assets/brand/epf-emblem.webp` at 44px tall (36px below 760px), with "ELITE PRO FITNESS / South Birmingham" set as HTML text beside it. Below 760px the links collapse into a menu button, and the CTA and England Boxing badge stay visible. `scroll-behavior:smooth`, plus `scroll-margin-top` equal to the nav height.
- [ ] **Step 4: Run** the tests. Expected: PASS.
- [ ] **Step 5: Commit:** `git add index.html css js tests/test_shell.py && git commit -m "feat: page shell, nav, copy and tokens"`

---

### Task 4: Core math and scroll progress

**Files:**
- Create: `js/core/math.js`, `js/core/progress.js`, `tests/test_core.py`

**Interfaces:**
- Produces: `clamp(v:number, a=0, b=1)`, `mix(a,b,t)`, `seg(p,a,b)` (`clamp((p-a)/(b-a))`), `io(k)` (`k<.5 ? 4k³ : 1-(-2k+2)³/2`), `out(k)` (`1-(1-k)³`), `smoothstep(k)`, `damp(cur, target, rate, dt)` (`cur+(target-cur)*(1-exp(-rate*dt))`). Also `sectionProgress(rectTop, rectHeight, vh) → number` (`clamp(-rectTop/(rectHeight-vh))`, returning 0 when `rectHeight<=vh`), `prefersReducedMotion() → boolean`, and `createLoop(controllers:Controller[]) → {start():void, stop():void}`. The loop caps `dt` at 0.05s, passes `scroll={y:scrollY, vh:innerHeight, vw:innerWidth}`, and wraps each `update` in try/catch so one failing controller logs once and is skipped thereafter.

- [ ] **Step 1: Write the failing tests:**

```python
def test_math(page, base_url):
    page.goto(base_url + "/tests/blank.html")
    r = run_module(page, "/js/core/math.js",
        "[m.clamp(2), m.seg(.5,0,1), m.io(.5), m.out(1), m.mix(0,10,.25), +m.damp(0,1,1e9,.016).toFixed(3)]")
    assert r == [1, 0.5, 0.5, 1, 2.5, 1]

def test_section_progress(page, base_url):
    page.goto(base_url + "/tests/blank.html")
    r = run_module(page, "/js/core/progress.js",
        "[m.sectionProgress(0,5000,1000), m.sectionProgress(-2000,5000,1000), m.sectionProgress(-9999,5000,1000), m.sectionProgress(-10,800,1000)]")
    assert r == [0, 0.5, 1, 0]

def test_loop_isolates_failures(page, base_url):
    page.goto(base_url + "/tests/blank.html")
    r = run_module(page, "/js/core/progress.js", """await new Promise(res => {
        let n = 0; const bad = {update(){ throw new Error('x') }};
        const good = {update(){ if (++n === 3) res(n) }};
        m.createLoop([bad, good]).start(); })""")
    assert r == 3
```

- [ ] **Step 2: Run** `python -m pytest tests/test_core.py -v`. Expected: FAIL.
- [ ] **Step 3: Implement** both modules.
- [ ] **Step 4: Run** the tests. Expected: PASS.
- [ ] **Step 5: Commit:** `git add js/core tests/test_core.py && git commit -m "feat: core math and scroll loop"`

---

### Task 5: Cinematic hero (Redline mechanic, scroll-driven)

**Files:**
- Create: `js/hero/timeline.js`, `js/hero/emblem.js`, `js/hero/dust.js`, `js/hero/hero.js`, `css/hero.css`, `tests/test_hero.py`
- Modify: `index.html` (hero markup), `js/main.js` (register controller)

**Interfaces:**
- Consumes: `math.js`, `sectionProgress`, `createLoop` and `prefersReducedMotion` from Task 4. The `.ropes` component from Task 3.
- Produces:
  - `heroState(p:number, opts:{portrait:boolean, reduced:boolean, age:number}) → HeroState` (pure).
  - `createEmblemScene(canvas, url) → {render(state, pointer:{x,y}), resize(w,h)} | null` (null when there's no WebGL or `THREE` is undefined).
  - `createDust(canvas) → {draw(t, alphaMul)}`.
  - `hero.init(root) → Controller`. It sets `document.documentElement.dataset.heroStage` to the current `stage` and `root.dataset.webgl = "on" | "off"`.
  - The `CustomEvent('epf:prefill-pass', {detail:{classKey}})` dispatched on `document` by the bar button. `classKey ∈ 'kids'|'juniors'|'adults'|'ladies'`.

**Structure.** `section#hero` has height `520vh` (`420vh` when portrait) and contains `.hero-stage {position:sticky; top:0; height:100svh; overflow:hidden}`. Layers, bottom to top: radial crimson backdrop (`radial-gradient(58% 72% at 50% 47%, #5a0f12 0%, #2a0709 45%, #09090C 100%)`), `#word0` "ELITE" (Oswald 700, `min(27vw,50vh)`), `#eyebrow`, `#flare`, `canvas#gl` (emblem; fallback `img.emblem-fallback` = epf-emblem.webp), `#facade` (facade-dusk.webp, `transform-origin:54.5% 62%`, the door), `#fore` (fore.webp, origin `50% 100%`), `#pin`, `#word1` "NORTHFIELD", `ul#programmes` + `#card` (prog-*.webp), `#fog`, `#interior` (interior-ring.webp), `#ringTitle`, `.ropes#ropes`, `form#bar`, `#quote`, `#dim` (`--bg-void`), `canvas#dust`, `#hint`.

**Keyframes for `heroState`** (`a=seg(p,0,.22)`, `d=io(seg(p,.40,.62))`, `l=out(seg(p,.60,.82))`, `r=out(seg(p,.64,.84))`, `k=io(seg(p,.88,1))`, `grow=out(seg(age,0,1.5))`, `iw=out(seg(age,.75,1.7))`):

| Field | Value |
|---|---|
| `stage` | `p<.2?0 : p<.5?1 : p<.88?2 : 3` |
| `emblemScale` (× R0, `R0 = portrait ? .36W : min(.3H,.19W)`) | `mix(.03,1,grow)*(1+a*.04)*exp(d*2.2)` |
| `emblemX`, `emblemY` (fractions of W, H) | `x = portrait ? .5 : mix(.5,.34,a)`; `y = portrait ? mix(.4,.33,a) : .5` |
| `emblemOpacity` | `1-seg(p,.40,.50)` |
| `wordOpacity`, `wordClip` | `1-seg(a,.1,.5)`; inset `(1-iw)*50`% from the centre |
| `facadeOpacity`, `facadeScale` | `seg(p,.04,.2)`; `mix(1.15,1,a)*exp(d*2.6)` |
| `foreY` (×H), `foreScale` | `mix(.35,0,a)`; `exp(d*3.4)` |
| `word1Opacity`, `listOpacity`, `pinOpacity` | `seg(a,.45,1)*(1-seg(p,.40,.46))`; `seg(a,.55,1)*(1-seg(p,.40,.45))`; `seg(a,.3,.8)*(1-seg(p,.40,.44))` |
| `fog` | `seg(p,.50,.58)*(1-seg(p,.66,.80))` |
| `interiorY` (×H), `interiorScale` | `mix(.2,0,l)`; `mix(1.3,1.05,l)*(1+k*.6)` |
| `ringTitleY` (×H), `ringTitleOpacity` | `mix(.62,.27,out(seg(p,.66,.84)))`; `seg(p,.64,.72)*(1-seg(p,.88,.94))` |
| `ropesY` (×H), `ropesScale`, `ropesOpacity` | `mix(.42,0,r)`; `1+k*2.4`; `1-seg(p,.96,1)` |
| `barOpacity` | `seg(p,.76,.86)*(1-seg(p,.88,.92))` (pointer events only when > .6) |
| `quoteOpacity` | `seg(p,.89,.93)*(1-seg(p,.975,1))` |
| `dim` | `seg(p,.9,1)`. At p=1 the stage is pure `--bg-void`, which matches the top of `#classes`. |
| `reduced: true` | All `*Scale` = 1, `*Y` = 0, `emblemScale = 1`, and opacities are kept so the stages crossfade. |

**Controller behaviour.** It damps `p` towards the measured progress at rate 8, or sets it instantly when reduced motion is on **or** the jump exceeds .25 (deep links and reloads). Pointer parallax adds `mouseX*-14px` to the facade/interior, `-46px` to fore and ropes, and a ±10° emblem tilt. The bar's "Day" options come from `sessionsForClass` (Task 7). Until Task 7 lands, use a static map with the same days. The bar submit dispatches `epf:prefill-pass` and scrolls to `#free-pass`. Hovering or focusing a programme item swaps the `#card` image. Clicking an item scrolls to its zone (`[data-zone=…]`). Dust follows Redline's dust spec, with 34 motes and the sprite colours `rgba(255,214,170,.95)` → `rgba(229,46,46,.35)` at .4 → transparent, multiplied ×.7 during stage 2.

- [ ] **Step 1: Write the failing tests:**

```python
def hs(page, p, **o):
    opts = {"portrait": False, "reduced": False, "age": 9, **o}
    return run_module(page, "/js/hero/timeline.js", f"m.heroState({p}, {json.dumps(opts)})")

def test_timeline_keyframes(page, base_url):
    page.goto(base_url + "/tests/blank.html")
    s0, s1, s2, s3 = hs(page,0), hs(page,.33), hs(page,.87), hs(page,1)
    assert (s0["stage"], s0["wordOpacity"]) == (0, 1)
    assert s1["stage"] == 1 and s1["listOpacity"] == 1 and s1["fog"] == 0
    assert hs(page,.58)["fog"] >= .99
    assert s2["stage"] == 2 and s2["barOpacity"] == 1
    assert s3["stage"] == 3 and s3["dim"] == 1 and s3["quoteOpacity"] == 0 and s3["barOpacity"] == 0

def test_timeline_reduced_has_no_dolly(page, base_url):
    page.goto(base_url + "/tests/blank.html")
    s = hs(page, .55, reduced=True)
    assert s["facadeScale"] == 1 and s["foreScale"] == 1 and s["emblemScale"] == 1

def test_native_wheel_scrolls_through_hero(page, base_url):           # no scroll trap
    page.set_viewport_size({"width":1440,"height":900}); page.goto(base_url + "/")
    for _ in range(60): page.mouse.wheel(0, 400); page.wait_for_timeout(16)
    page.wait_for_timeout(500)
    assert page.evaluate("document.querySelector('#classes').getBoundingClientRect().top") < 900
    assert page.errors == []

def test_deep_link_and_reload_mid_hero(page, base_url):              # Review Focus 1
    page.goto(base_url + "/#timetable"); page.wait_for_timeout(300)
    assert page.evaluate("document.documentElement.dataset.heroStage") == "3"
    page.goto(base_url + "/"); page.evaluate("scrollTo(0, document.querySelector('#hero').offsetHeight*0.6)")
    page.wait_for_timeout(100)
    assert page.evaluate("document.documentElement.dataset.heroStage") == "2"

@pytest.mark.parametrize("launch_args", [["--disable-webgl", "--disable-3d-apis"]], indirect=True)
def test_no_webgl_fallback(page, base_url):                          # Review Focus 2
    page.goto(base_url + "/"); page.wait_for_timeout(300)
    assert page.get_attribute("#hero", "data-webgl") == "off"
    assert page.is_visible(".emblem-fallback") and page.errors == []

def test_three_missing_and_image_404(page, base_url):                # Review Focus 2
    page.route("**/three.min.js", lambda r: r.abort())
    page.route("**/interior-ring.webp", lambda r: r.fulfill(status=404))
    page.goto(base_url + "/"); page.wait_for_timeout(300)
    assert [e for e in page.errors if "404" not in e and "Failed to load resource" not in e] == []

def test_reduced_motion(page, base_url):                             # Review Focus 3
    page.emulate_media(reduced_motion="reduce"); page.goto(base_url + "/")
    page.evaluate("scrollTo(0, document.querySelector('#hero').offsetHeight*0.5)"); page.wait_for_timeout(50)
    assert page.evaluate("getComputedStyle(document.querySelector('#facade')).transform") in ("none", "matrix(1, 0, 0, 1, 0, 0)")

def test_bar_prefills_pass(page, base_url):
    page.goto(base_url + "/"); page.evaluate("scrollTo(0, document.querySelector('#hero').offsetHeight*0.7)")  # p≈.87
    page.wait_for_timeout(600); page.select_option("#bar select[name=class]", "ladies")
    page.click("#bar button"); page.wait_for_timeout(900)
    assert page.input_value("#free-pass select[name=classKey]") == "ladies"   # passes after Task 9
```

Mark `test_bar_prefills_pass` with `@pytest.mark.xfail(reason="needs Task 9", strict=False)` until Task 9.
- [ ] **Step 2: Run** `python -m pytest tests/test_hero.py -v`. Expected: FAIL.
- [ ] **Step 3: Implement `js/hero/timeline.js`** exactly as in the keyframe table.
- [ ] **Step 4: Run** `python -m pytest tests/test_hero.py -k timeline -v`. Expected: PASS.
- [ ] **Step 5: Implement `emblem.js`.** Use an orthographic camera in CSS pixels, a `PlaneGeometry` sized to the emblem aspect and a `ShaderMaterial` sampling `epf-emblem.png`. The shader adds a rim light (`smoothstep` on alpha edges, colour `#F5A623`), a slow specular sweep (`sin(t*.6)`) and `ready` fade-in. Wrap everything in try/catch and return `null` on any failure. On `webglcontextlost`, set `root.dataset.webgl="off"` and show the fallback image.
- [ ] **Step 6: Implement `dust.js`, `hero.js` and `css/hero.css`.** Register the hero in `main.js`.
- [ ] **Step 7: Run** `python -m pytest tests/test_hero.py -v`. Expected: everything passes except the xfail.
- [ ] **Step 8: Look.** Take Playwright screenshots at p = 0, .33, .58, .8 and .98 at 1440×900 and 375×812 into `test-results/hero/`, then open them. Fix any clipped copy, empty frame or flat-colour frame before committing.
- [ ] **Step 9: Commit:** `git add js/hero css/hero.css index.html js/main.js tests/test_hero.py && git commit -m "feat: scroll-driven cinematic hero"`

---

### Task 6: Descent zones (Hollowmere mechanic on native scroll)

**Files:**
- Create: `js/descent/particles.js`, `js/descent/descent.js`, `css/descent.css`, `scripts/grab_posters.py`, `assets/videos/posters/stage0.webp|stage1.webp|stage2.webp`, `tests/test_descent.py`
- Modify: `index.html` (zone markup), `js/main.js`

**Interfaces:**
- Consumes: `math.js`, `createLoop`, `.ropes`.
- Produces: `createParticles(canvas, kind:'chalk'|'ember'|'spray', count:number) → {draw(t, visible:boolean), drawCount:number}` and `descent.init(root) → Controller`.

**Zone layout.** Each `[data-zone]` is `min-height:100svh`, with its plate (`zone-*.webp`) as a full-bleed background (`background-size:cover`, positioned so the copy-safe side holds the copy). Each zone has a parallax offset of `(rect.top * -.12)px` on the plate, one particle canvas, a copy block on the copy-safe side and, for juniors/adults/squad, a 9:16 `.reel` (`video muted playsinline loop preload="none" poster=…`) on the opposite side. The reels are `stage2-ring.mp4` → juniors, `stage0-exterior.mp4` → adults and `stage1-gym.mp4` → squad. A reel plays only while intersecting and is paused otherwise. If `play()` is rejected, the poster stays. Between zones (and between hero and zone 1) a `.seam` holds a `.ropes` band straddling the join (`translateY(-50%)`, `z-index:5`). Particle kinds: juniors `chalk` 50, ladies `ember` 40, adults `spray` 60, squad `chalk` 40, community `ember` 30. A canvas draws only while it is within 50px of the viewport. Reveals copy the Hollowmere spec: lines `.ln>span` rise `translateY(105%)→0` over 1000ms with 80ms stagger, triggered once when the block top passes 80% of vh, with no opacity fades. Community zone: the big line is Oswald `clamp(40px,7vw,120px)` and the second line is in `--ring-red`.

- [ ] **Step 1: Write the failing tests:**

```python
def test_zones_and_seams(page, base_url):
    page.goto(base_url + "/")
    zones = page.eval_on_selector_all("#classes [data-zone]", "e => e.map(z => z.dataset.zone)")
    assert zones == ["juniors","ladies","adults","squad","community"]
    assert page.locator("#classes .seam .ropes").count() >= 5

def test_reels_are_safe(page, base_url):
    page.goto(base_url + "/")
    for v in page.query_selector_all(".reel video"):
        assert v.get_attribute("muted") is not None and v.get_attribute("playsinline") is not None
        assert v.get_attribute("poster").endswith(".webp")

def test_particles_idle_offscreen(page, base_url):
    page.goto(base_url + "/"); page.wait_for_timeout(500)
    assert page.evaluate("window.__epf.particles.map(p => p.drawCount).every(n => n === 0)")
    page.evaluate("document.querySelector('[data-zone=ladies]').scrollIntoView()"); page.wait_for_timeout(500)
    assert page.evaluate("window.__epf.particles.some(p => p.drawCount > 0)")

def test_reveal_runs_once(page, base_url):
    page.goto(base_url + "/"); page.evaluate("document.querySelector('[data-zone=adults]').scrollIntoView()")
    page.wait_for_timeout(1400)
    assert page.get_attribute("[data-zone=adults] .copy", "data-revealed") == "1"
```

`window.__epf = { particles: [...] }` is a debug handle set by `descent.init`.
- [ ] **Step 2: Run** `python -m pytest tests/test_descent.py -v`. Expected: FAIL.
- [ ] **Step 3: Implement `scripts/grab_posters.py`.** Playwright opens each mp4 on a blank page in a `<video>`, seeks to 1.0s, draws the frame to a canvas and saves a webp to `assets/videos/posters/stage{n}.webp` (max width 720). Run it.
- [ ] **Step 4: Implement** the particles, descent controller, markup and CSS.
- [ ] **Step 5: Run** the tests. Expected: PASS. Re-run `tests/test_shell.py` and expect PASS (no overflow from the seams).
- [ ] **Step 6: Look.** Take screenshots of each zone at 1440 and 375 into `test-results/descent/` and review them. No zone may show a flat colour block.
- [ ] **Step 7: Commit:** `git add js/descent css/descent.css scripts/grab_posters.py assets/videos/posters index.html js/main.js tests/test_descent.py && git commit -m "feat: descent zones with particles, reels and rope seams"`

---

### Task 7: Timetable data and interactive view

**Files:**
- Create: `js/data/timetable.js`, `js/timetable/view.js`, `css/timetable.css`, `tests/test_timetable.py`
- Modify: `index.html`, `js/main.js`, `js/hero/hero.js` (swap the static day map for `sessionsForClass`)

**Interfaces:**
- Produces:
  - `SESSIONS: Session[]`, where `Session = {id, day:'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun', start:'HH:MM'|null, end:'HH:MM'|null, title, discipline, audience:string[], filters:string[]}`.
  - `FILTERS = ['all','boxing','squad','ladies','juniors','martial','fitness']`, labelled "All", "Boxing", "Squad", "Ladies only", "Kids & Juniors", "Martial arts", "Fitness".
  - `filterSessions(list, key) → Session[]`.
  - `groupByDay(list) → Record<day, Session[]>`, sorted by start, with `null` starts last.
  - `nextSession(list, now:Date) → Session|null` (the first session starting after `now` within the next 7 days).
  - `sessionsForClass(classKey) → Session[]` (sessions whose `audience` includes the key).

**Data** (verbatim from the uploaded timetable). Discipline → filters: `boxing`→[boxing], `squad`→[squad,boxing], `dbg`→[juniors,boxing], `ladies`→[ladies], `jujitsu`→[martial], `kickboxing`→[martial], `weights`→[fitness], `run`→[fitness]. Add `juniors` to the filters of every session whose audience includes `kids` or `juniors`.

| day | start–end | title | discipline | audience |
|---|---|---|---|---|
| mon | 17:30–18:30 | Junior Beginners | boxing | kids, juniors |
| mon | 18:30–19:30 | Junior Elite Squad Boxing | squad | juniors |
| mon | 19:30–21:00 | Senior Elite Boxing | boxing | adults |
| tue | 18:00–19:00 | Ladies Only Boxing | ladies | ladies |
| tue | 19:00–20:30 | Squad Training | squad | adults |
| wed | 12:00–13:00 | Ladies Legs, Bums & Tums | ladies | ladies |
| wed | 14:00–15:00 | Weight Training Session | weights | adults |
| wed | 17:30–18:30 | Junior Beginners | boxing | kids, juniors |
| wed | 18:30–19:30 | Junior Elite Squad Boxing | squad | juniors |
| wed | 19:30–21:00 | Senior Elite Boxing | boxing | adults |
| thu | 18:00–null | Ladies Only Boxing | ladies | ladies |
| thu | 19:00–20:00 | Squad Training | squad | adults |
| thu | 20:00–21:00 | MMA + Ju Jitsu | jujitsu | adults |
| fri | 17:00–18:00 | Junior Elite Squad Boxing | squad | juniors |
| fri | 18:00–19:30 | Senior Elite Boxing | boxing | adults |
| sat | 09:00–10:00 | Run Club | run | adults |
| sat | 09:30–10:30 | Advanced Junior Classes | boxing | juniors |
| sat | 10:30–12:00 | Boxing Session | boxing | adults |
| sat | 13:00–15:00 | Junior Development Boxing Group | dbg | juniors |
| sat | null–null | Kick Boxing | kickboxing | adults |
| sat | 14:00–15:00 | Squad Training | squad | adults |
| sun | 09:00–10:00 | Run Club | run | adults |
| sun | 12:00–13:00 | Squad Training | squad | adults |
| sun | 13:00–14:00 | Ju Jitsu | jujitsu | adults |

A `null` time renders as "Ask at the gym" (Thu ladies shows "6pm"). **View:** filter pills (`role="tablist"`, arrow-key navigable) and a 7-column week grid that becomes a horizontally snapping day carousel below 760px (overflow contained inside the component). Each card is coloured by discipline using the original legend hues, tuned to the dark theme: boxing `#3DDC84`, dbg `#E52E2E`, jujitsu `#3BA7F0`, weights `#A0703C`, squad `#F28C28`, ladies `#E85AA7`, run `#F5D33C`, kickboxing `#3E52D9`. A "Next session" ribbon comes from `nextSession(SESSIONS, new Date())`. The backdrop is `texture-timetable.webp`.

- [ ] **Step 1: Write the failing tests:**

```python
def test_counts(page, base_url):
    page.goto(base_url + "/tests/blank.html")
    r = run_module(page, "/js/data/timetable.js",
        "Object.fromEntries(Object.entries(m.groupByDay(m.SESSIONS)).map(([d,l]) => [d,l.length]))")
    assert r == {"mon":3,"tue":2,"wed":5,"thu":3,"fri":2,"sat":6,"sun":3}

def test_filters(page, base_url):
    page.goto(base_url + "/tests/blank.html")
    f = lambda k: run_module(page, "/js/data/timetable.js", f"m.filterSessions(m.SESSIONS,'{k}').length")
    assert (f("all"), f("ladies"), f("martial"), f("fitness"), f("juniors")) == (24, 3, 3, 3, 7)

def test_next_session(page, base_url):
    page.goto(base_url + "/tests/blank.html")
    # Tuesday 2026-11-10 18:30 local → next is Tue Squad Training 19:00
    r = run_module(page, "/js/data/timetable.js", "m.nextSession(m.SESSIONS, new Date(2026,10,10,18,30)).id")
    assert r == "tue-squad-training"
    r = run_module(page, "/js/data/timetable.js", "m.nextSession(m.SESSIONS, new Date(2026,10,15,14,30)).id")
    assert r == "mon-junior-beginners"   # Sunday after last session → Monday

def test_view_filter_and_mobile(page, base_url):
    page.set_viewport_size({"width":375,"height":812}); page.goto(base_url + "/#timetable")
    page.click("#timetable [role=tab]:has-text('Ladies only')")
    assert page.locator("#timetable .session:visible").count() == 3
    assert page.evaluate("document.scrollingElement.scrollWidth") <= 375
```

Ids are `${day}-${slug(title)}`, e.g. `tue-squad-training`.
- [ ] **Step 2: Run** `python -m pytest tests/test_timetable.py -v`. Expected: FAIL.
- [ ] **Step 3: Implement** the data module, view, CSS and the hero bar hookup.
- [ ] **Step 4: Run** `python -m pytest tests/test_timetable.py tests/test_hero.py -v`. Expected: PASS (hero xfail still allowed).
- [ ] **Step 5: Commit:** `git add js/data/timetable.js js/timetable css/timetable.css index.html js/main.js js/hero/hero.js tests/test_timetable.py && git commit -m "feat: interactive timetable"`

---

### Task 8: Coach roster (VHS curved arc)

**Files:**
- Create: `js/data/coaches.js`, `js/roster/arc.js`, `js/roster/view.js`, `css/roster.css`, `tests/test_roster.py`
- Modify: `index.html`, `js/main.js`

**Interfaces:**
- Consumes: `math.js`, `sessionsForClass` (Task 7).
- Produces:
  - `COACHES = [{id:'ian', name:'Ian Walker', role:'Owner & Head Coach', photo:'assets/coach.webp', cover:{sheet:'assets/cards.webp', box:[0,0,985,693], sheetW:2000, sheetH:1493}}]`. Measure the real `cards.webp` size and set `sheetW`/`sheetH` to it.
  - `PROGRAMMES = [{key:'kids', title:'Kids', cover:'assets/gen/prog-kids.webp'}, {key:'juniors', title:'Juniors', cover:'assets/gen/prog-juniors.webp'}, {key:'adults', title:'Adults (mixed)', cover:'assets/gen/prog-adults.webp'}, {key:'ladies', title:'Ladies only', cover:'assets/gen/prog-ladies.webp'}]`.
  - `arc.js`: `rel(v,s,n)` (wraps into [−n/2, n/2)), `B(r)` (`|r|<1 ? (r+sin(πr)/π)/2 : sign(r)*.5`), `F(r,{ws,d,gap})` (`r*(ws+gap)+(d-ws+1.4*gap)*B(r)`), `scl(u,U)` (`1/(1+(|u|/U)^1.6)`), `buildXS(U) → Float32Array` (2px steps to 3U, accumulating `2/(1+(u/U)^1.6)`), `xsc(u,XS)`, and `tapeTransform(r, dims:{H,ws,d,gap,U,P}, XS, tilt:{x,y}, lift) → {x,y,z,ry,rx,o,shadeSpine,shadeCover,hidden}`. The formulas are taken verbatim from the VHS reference prompt's "Per tape, every frame" section.
  - `roster.view.init(root) → Controller`. The items are `[...PROGRAMMES.slice(0,2), COACH, ...PROGRAMMES.slice(2)]`, rendered three times and starting on Ian. Clicking the active Ian cover dispatches `CustomEvent('epf:coach-open')`.

**Behaviour.** Arc dims: `H = min(47vh,33vw)` (`min(68vw,40svh)` on phones), `ws=H*142/840`, `d=H*474/900`, `gap=H*.035`, `U=H*1.3` (`H*1.05` below 768px), `P=1400`. Spring `k=5.2` (18 while dragging). Arrows, ←/→ keys, drag and wheel (horizontal intent only: act only when `|deltaX|>|deltaY|`, so vertical page scroll is never hijacked). Spines show the programme or coach name vertically in Oswald on the cover art. When a programme is active, its caption shows its sessions from `sessionsForClass`. When Ian is active, the caption shows the name and role. On `epf:coach-open` the roster section adds `.is-open`: Ian's photo (`coach.webp`) slides to the left flank (`translateX(-28vw)`, 900ms, `cubic-bezier(.76,0,.18,1)`) and `#free-pass` slides in from the right. Below 760px they stack instead. In reduced motion all of this happens instantly. **Every** link to `#free-pass` (nav CTA, prices CTA, hero bar) also dispatches `epf:coach-open`, so the pass is never hidden when someone arrives at it. Keep `tests/test_shell.py::test_mobile_cta_reachable` passing.

- [ ] **Step 1: Write the failing tests:**

```python
def test_arc_math(page, base_url):
    page.goto(base_url + "/tests/blank.html")
    r = run_module(page, "/js/roster/arc.js", """(() => {
      const dims = {H:900, ws:152.1, d:474, gap:31.5, U:1170, P:1400}, XS = m.buildXS(dims.U);
      const c = m.tapeTransform(0, dims, XS, {x:0,y:0}, 0), f = m.tapeTransform(3, dims, XS, {x:0,y:0}, 0);
      return [m.rel(35,0,36), m.B(0), m.B(2), m.scl(0,1170), c.o, Math.round(c.ry), f.o, f.x > 0, f.ry > 0];
    })()""")
    assert r == [-1, 0, 0.5, 1, 1, -90, 0, True, True]

def test_vertical_wheel_not_hijacked(page, base_url):
    page.goto(base_url + "/#coach"); y0 = page.evaluate("scrollY")
    page.hover("#coach .shelf"); page.mouse.wheel(0, 600); page.wait_for_timeout(400)
    assert page.evaluate("scrollY") > y0

def test_open_coach_reveals_pass(page, base_url):
    page.set_viewport_size({"width":1440,"height":900}); page.goto(base_url + "/#coach"); page.wait_for_timeout(600)
    page.click("#coach .tape.is-active")
    page.wait_for_timeout(1000)
    assert "is-open" in page.get_attribute("#coach", "class")
    assert page.is_visible("#free-pass form")

def test_roster_keyboard(page, base_url):
    page.goto(base_url + "/#coach"); page.focus("#coach .shelf"); page.keyboard.press("ArrowRight")
    page.wait_for_timeout(900)
    assert page.inner_text("#coach .caption .title") == "Adults (mixed)"
```

- [ ] **Step 2: Run** `python -m pytest tests/test_roster.py -v`. Expected: FAIL.
- [ ] **Step 3: Implement `arc.js`.** Then run `-k arc_math` and expect PASS.
- [ ] **Step 4: Implement** the data, view and CSS. Run all of `tests/test_roster.py` and expect PASS.
- [ ] **Step 5: Look.** Screenshots at 1440 and 375, closed and open. No empty space on either side of the arc.
- [ ] **Step 6: Commit:** `git add js/data/coaches.js js/roster css/roster.css index.html js/main.js tests/test_roster.py && git commit -m "feat: VHS-arc coach roster with flank reveal"`

---

### Task 9: Free session pass

**Files:**
- Create: `js/pass/pass.js`, `js/pass/lead.js`, `js/pass/view.js`, `css/pass.css`, `tests/test_pass.py`
- Modify: `index.html`, `js/main.js`, `tests/test_hero.py` (remove the xfail)

**Interfaces:**
- Consumes: `sessionsForClass` (Task 7) and the `epf:prefill-pass` event (Task 5).
- Produces:
  - `validateLead({name,email,classKey}) → {ok:boolean, errors:{name?:string, email?:string, classKey?:string}, value:{name,email,classKey}}`. Names are trimmed, internal whitespace is collapsed, and length must be 2–60. Emails must match `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/`. `classKey` must be one of the 4 keys. The error strings are "Please enter your name.", "Please enter a valid email." and "Please choose a class."
  - `makePassId(date:Date, rand:()=>number) → string` in the form `EPF-YYMMDD-XXXX`, with the alphabet `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`. The view passes a `crypto.getRandomValues`-based `rand`.
  - `LEAD_CONFIG = {endpoint:null, email:'elitepro121@gmail.com'}`.
  - `submitLead(lead) → Promise<{ok:boolean, via:'endpoint'|'mailto'}>`. If `endpoint` is set, it POSTs JSON. Otherwise it opens `mailto:` with the subject "Free session pass: {name}" and a body listing the name, email, class, pass ID and suggested sessions.
  - `pass.view.init(root) → Controller`.

**Behaviour.** On submit: validate, disable the button (this blocks double submits), generate the ID, render the ticket (all user text goes through `textContent`, and the name is clamped to 2 lines with ellipsis), list up to 3 suggested sessions from `sessionsForClass`, then call `submitLead`. "Save pass" draws the ticket to a 1200×630 canvas and downloads `EPF-guest-pass-{id}.png`. "Start again" resets the form. The ticket has a dark card with a crimson edge stripe, a perforation line, the gold "ADMIT ONE · FREE SESSION", the address line "201A Merritts Brook Lane, Northfield, B31 1UH" and the issued date in `en-GB` long format.

- [ ] **Step 1: Write the failing tests:**

```python
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

def test_flow_escapes_and_blocks_double_submit(page, base_url):     # Review Focus 5
    page.goto(base_url + "/#free-pass")
    page.evaluate("document.dispatchEvent(new CustomEvent('epf:coach-open'))")
    page.evaluate("window.__epfLeads = []; window.__epfSubmitOverride = l => (window.__epfLeads.push(l), Promise.resolve({ok:true, via:'endpoint'}))")
    page.fill("[name=name]", "<img src=x onerror=alert(1)> Jo"); page.fill("[name=email]", "jo@ex.com")
    page.select_option("[name=classKey]", "adults")
    page.click("#free-pass button[type=submit]"); page.click("#free-pass button[type=submit]", force=True)
    page.wait_for_timeout(300)
    assert page.locator("#free-pass .ticket img").count() == 0
    assert "<img" in page.inner_text("#free-pass .ticket .name")
    assert page.evaluate("window.__epfLeads.length") == 1
    assert page.evaluate("(() => { const n = document.querySelector('#free-pass .ticket .name'); return n.scrollWidth <= n.clientWidth + 1 })()")
```

`submitLead` checks `window.__epfSubmitOverride` first. This is a test seam only and does nothing in production when it's unset.
- [ ] **Step 2: Run** `python -m pytest tests/test_pass.py -v`. Expected: FAIL.
- [ ] **Step 3: Implement** `pass.js`, `lead.js`, `view.js` and the CSS, plus the prefill listener (sets the class select, focuses the name field) and the PNG save.
- [ ] **Step 4: Remove** the xfail in `tests/test_hero.py`. Run `python -m pytest tests/test_pass.py tests/test_hero.py -v` and expect PASS.
- [ ] **Step 5: Commit:** `git add js/pass css/pass.css index.html js/main.js tests/test_pass.py tests/test_hero.py && git commit -m "feat: free session pass generator"`

---

### Task 10: Prices, Find us, footer

**Files:**
- Create: `css/info.css`, `tests/test_info.py`
- Modify: `index.html`

**Interfaces:** static content only (Copy Deck strings).

- [ ] **Step 1: Write the failing tests:**

```python
def test_prices_exact(page, base_url):
    page.goto(base_url + "/#prices"); t = page.inner_text("#prices")
    for s in ["£15", "£5", "£7", "£30", "£40", "£35", "1st of every month", "Yrs 11 and up"]:
        assert s in t

def test_contact_links(page, base_url):
    page.goto(base_url + "/#find-us")
    assert page.get_attribute("#find-us a[href^='tel:']", "href") == "tel:+447534444063"
    assert page.get_attribute("#find-us a[href^='mailto:']", "href") == "mailto:elitepro121@gmail.com"
    assert "B31 1UH" in page.inner_text("#find-us address")
    assert page.is_visible("footer img[alt='England Boxing affiliated club']")
```

- [ ] **Step 2: Run** `python -m pytest tests/test_info.py -v`. Expected: FAIL.
- [ ] **Step 3: Implement.** Prices sit over `texture-pricing.webp` as a three-row "fight card" table, with the Junior Development callout as a gold-edged ticket. Find us uses `facade-dusk.webp` as a dimmed full-bleed backdrop, with the address, hours, phone, email, directions button and sponsors line. The footer carries the England Boxing badge (56px) and the emblem (64px).
- [ ] **Step 4: Run** `python -m pytest tests/test_info.py tests/test_shell.py -v`. Expected: PASS.
- [ ] **Step 5: Commit:** `git add css/info.css index.html tests/test_info.py && git commit -m "feat: prices, find us and footer"`

---

### Task 11 (optional, gated): Generated door-dolly video as a scroll frame sequence

**Gate:** run this only if `GEMINI_API_KEY` is set **and** ffmpeg is installed (`winget install Gyan.FFmpeg`, needs user approval). Otherwise skip it. The hero is complete without it.

**Files:**
- Create: `assets/seq/door/0001.webp…`, `assets/seq/door/manifest.json`, `js/hero/sequence.js`, `tests/test_sequence.py`
- Modify: `js/hero/hero.js`, `index.html` (add `canvas#seq` between `#facade` and `#fore`)

**Interfaces:**
- Produces: `createFrameSequence(canvas, manifestUrl) → Promise<{draw(progress:number):void, frames:number} | null>`. It returns `null` on a 404 or bad JSON. The manifest is `{"frames":N, "width":W, "height":H, "pattern":"assets/seq/door/%04d.webp"}`.

- [ ] **Step 1: Generate.** Follow `C:\Users\chahb\.gemini\config\plugins\gemini-api\skills\gemini-omni-flash-api\SKILL.md` for a first-and-last-frame transition: first `assets/gen/facade-dusk.png`, last `assets/gen/interior-ring.png`, 6s, 16:9, 1080p, prompt "slow steady dolly forward through the open doors into the gym, no camera shake, no people". Image inputs aren't affected by the UK video-upload restriction.
- [ ] **Step 2: Extract** 72 frames: `ffmpeg -i door.mp4 -vf "fps=12,scale=1600:-2" -c:v libwebp -quality 78 assets/seq/door/%04d.webp`. Write `manifest.json`.
- [ ] **Step 3: Write the failing test.** Check that `createFrameSequence` resolves `frames == 72`, and that with `manifest.json` routed to 404 it resolves to `null` and the hero still reaches stage 2 with no errors.
- [ ] **Step 4: Implement.** During `p ∈ [.40,.62]` the controller draws frame `round(d*(frames-1))` (cover-fit) and the facade/fore zoom fades out underneath. Outside that range the canvas is hidden. Preload frames lazily once `p > .2`.
- [ ] **Step 5: Run** `python -m pytest tests/test_sequence.py tests/test_hero.py -v`. Expected: PASS.
- [ ] **Step 6: Commit:** `git add assets/seq js/hero/sequence.js js/hero/hero.js index.html tests/test_sequence.py && git commit -m "feat: generated door dolly frame sequence"`

---

### Task 12: Full verification and design audit

**Files:**
- Create: `docs/superpowers/screens/` (screenshots), `docs/superpowers/plans/2026-11-07-verification.md`

- [ ] **Step 1: Run** `python -m pytest -v`. Expected: all tests pass with 0 failures and no xfails left.
- [ ] **Step 2: Take screenshots** of every section plus hero p = 0/.33/.58/.8/.98 at 375×812, 812×375, 768×1024 and 1440×900 into `docs/superpowers/screens/`. Open and review each one against the anti-goals: no flat monochrome blocks, no clipped copy, no empty frames.
- [ ] **Step 3: Run** the impeccable `audit` on `index.html` (a11y, performance, responsive) and fix every P0 and P1 finding. Re-run Step 1.
- [ ] **Step 4: Check performance.** In Playwright with CPU 4× throttling, scroll through the whole hero. Measure frame times with a `requestAnimationFrame` sampler and record the p95 in the verification note. The target is p95 under 20ms at 1440×900.
- [ ] **Step 5: Request** a whole-branch review (superpowers:requesting-code-review) on Claude Opus 5.5. Address the findings.
- [ ] **Step 6: Commit:** `git add docs/superpowers && git commit -m "docs: verification screenshots and audit"`

To view the site yourself, run `python -m http.server 8765` from the repo root (BypassSandbox) and open http://127.0.0.1:8765.
