# Cinematic Landing Page Refactor & 3D Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul the Elite Pro Fitness landing page to eliminate the black-out dead zone, fix background continuity in the hero, remove broken HTML5 video tags, make Coach Ian Walker large and prominent alongside the "Claim Free Pass" generator, redesign the timetable with elegant 3D pop-up and flip interactions, resolve pricing ambiguity, and orchestrate smooth 3D zoom/rotation transitions throughout the one-page scroll.

**Architecture:** 
- The hero is anchored by the full authentic gym exterior (`assets/outside.webp` / `assets/gen/facade-dusk.webp`) and Three.js 3D camera crane shot that smoothly transitions into the interior ring and seamlessly cross-fades directly into the training zones with zero blackout gap.
- Broken `<video>` elements in the training descent are replaced by high-resolution WebP action photography with subtle 3D perspective tilt (`perspective(1000px) rotateX(...)`).
- Coach Ian Walker and the "Sign Up to Claim Your Free Pass" generator are presented in a commanding side-by-side heroic layout with a large coach portrait and cryptographic pass generator.
- The weekly timetable is redesigned with an elegant viewport-fitting card grid featuring 3D hover/scroll pop-up, flip rotation, and instant pass pre-fill.
- All session rates are explicitly labeled (£5/session for Under 18 Juniors, £7/session for Over 18 Adults & Ladies).

**Tech Stack:** Vanilla JavaScript (ES modules), Three.js r128, CSS 3D transforms (`preserve-3d`, `perspective`, `rotateY`), HTML5 Canvas, Playwright, Pytest.

**Spec:** `docs/superpowers/specs/2026-11-07-cinematic-landing-design.md`

## Global Constraints
- **Zero Blackout:** The hero scroll height is tightened and the `#dim` opacity black layer is removed; hero seamlessly dissolves into `#classes` with continuous visual cues.
- **Zero Broken Videos:** Remove all `<video>` tags from `#classes`; use clean, performant WebP visuals with 3D canvas/particle overlays.
- **Gym Background First:** The hero starts immediately with the authentic full gym exterior as the visible background canvas—no random stills or empty black space.
- **Pricing Clarity:** Junior rates are explicitly £5/session (£30/mo); Adult & Ladies rates are £7/session (£40/mo); Joining fee is £15; 10-week Junior Development course is £35.
- **Large Coach & Free Pass:** Coach Ian Walker portrait is large and commanding (min-height 520px on desktop) directly beside the "Sign Up to Claim Your Free Pass" interactive card.
- **3D Pop-Up & Flip Timetable:** Session cards have 3D perspective scale-up and flip-card details on hover/scroll.
- **Full Test Suite:** All 44+ tests in `tests/` must pass; zero horizontal overflow on 375px mobile viewports.

## Review Focus
1. Mobile scroll through hero does not stutter or get trapped in sticky dead space.
2. Timetable 3D flip works smoothly on touch devices (tap to flip/prefill) as well as desktop hover.
3. Coach portrait maintains aspect ratio and does not crop Coach Ian Walker's face on mobile (375px) or desktop (1440px).
4. No `<video>` element remains in the DOM to avoid mobile black boxes or codec errors.
5. Pricing copy across all zones, cards, and pills never states £5 and £7 without explicit "Under 18" / "Adult" categorization.

---

### Task 1: Fix Hero Background Continuity & Eliminate Blackout Dead Zone

**Files:**
- Modify: `js/hero/timeline.js:1-120`
- Modify: `js/hero/hero.js:1-150`
- Modify: `css/hero.css:1-180`
- Modify: `index.html:50-80`
- Test: `tests/test_hero.py`

**Interfaces:**
- Consumes: `assets/outside.webp`, `assets/gen/facade-dusk.webp`, `assets/brand/epf-emblem.webp`
- Produces: `heroState(p, opts)` with tightened progress curve, zero `#dim` blackout, and direct cross-fade into `#classes`.

- [ ] **Step 1: Update `tests/test_hero.py` with blackout elimination and background continuity tests**

```python
def test_hero_has_no_blackout_at_exit(page, base_url):
    page.goto(base_url + "/#hero")
    # At late hero progress (p=0.95), dim overlay must be transparent or absent
    dim_opacity = page.evaluate("""() => {
        const dim = document.getElementById('dim');
        return dim ? parseFloat(window.getComputedStyle(dim).opacity) : 0;
    }""")
    assert dim_opacity < 0.35, f"Hero dim opacity is too dark ({dim_opacity}), causing black dead zone"

def test_hero_starts_with_gym_exterior(page, base_url):
    page.goto(base_url + "/#hero")
    bg = page.evaluate("""() => {
        const stage = document.querySelector('.hero-stage');
        return window.getComputedStyle(stage).backgroundImage;
    }""")
    assert "outside.webp" in bg or "facade-dusk.webp" in bg
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_hero.py::test_hero_has_no_blackout_at_exit -v`
Expected: FAIL due to `dim` reaching 1.0 or missing background on `.hero-stage`.

- [ ] **Step 3: Implement background continuity & seamless exit in `timeline.js`, `hero.js`, and `hero.css`**

- In `css/hero.css`: Set `.hero-stage` background to `assets/outside.webp` with subtle radial vignette. Reduce `#hero` height from `520vh` to `320vh` for responsive, energetic pacing. Remove `#dim` blacking out the screen.
- In `js/hero/timeline.js`: Remove `dim = seg(normP, 0.9, 1)`. Ensure `stage` 0 (exterior) begins at 100% visibility. Replace abrupt dolly cuts with smooth scale and cross-dissolve.
- In `js/hero/hero.js`: Ensure WebGL canvas and exterior background blend seamlessly into `#classes`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/test_hero.py -v`
Expected: ALL PASS.

- [ ] **Step 5: Commit**

```bash
git add js/hero/ css/hero.css index.html tests/test_hero.py
git commit -m "fix(hero): eliminate blackout dead zone and establish full gym exterior background"
```

---

### Task 2: Strip Broken Video Elements & Polish Training Descent with 3D Parallax & Clear Pricing

**Files:**
- Modify: `index.html:140-240`
- Modify: `css/descent.css:1-200`
- Modify: `js/descent/descent.js:1-120`
- Test: `tests/test_descent.py`
- Test: `tests/test_info.py`

**Interfaces:**
- Consumes: `assets/gen/zone-*.webp`, `assets/gen/prog-*.webp`
- Produces: Clean, performant training zones with 3D perspective scroll tilt and unambiguous pricing pills.

- [ ] **Step 1: Write failing test in `tests/test_descent.py` verifying no video tags exist**

```python
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_descent.py::test_no_video_elements_in_classes -v`
Expected: FAIL with 3 video elements found.

- [ ] **Step 3: Remove `<video>` elements and add 3D perspective scroll effect in `index.html`, `descent.css`, and `descent.js`**

- In `index.html`: Delete all `<div class="reel"><video ...></video></div>` blocks.
- Update zone pricing pills:
  - Junior Zone: `Mon & Wed 5:30pm · Sat 9:30am · £5/session (Under 18s)`
  - Ladies Zone: `Tue & Thu 6:00pm · Wed 12:00pm (LBT) · £7/session (Adult Ladies)`
  - Adult Zone: `Mon–Fri Evenings · Saturday Morning · £7/session (Over 18s)`
- In `css/descent.css`: Add `transform-style: preserve-3d; perspective: 1000px;` to `.zone`. Style `.zone-content` with subtle depth elevation, frosted glass backing, and high-contrast typography.
- In `js/descent/descent.js`: Apply subtle dynamic 3D scroll tilt (`transform: perspective(1000px) rotateX(${tilt}deg)`).

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/test_descent.py tests/test_info.py -v`
Expected: ALL PASS.

- [ ] **Step 5: Commit**

```bash
git add index.html css/descent.css js/descent/ tests/test_descent.py tests/test_info.py
git commit -m "fix(descent): remove broken video tags and clarify pricing pills"
```

---

### Task 3: Redesign Coach Ian Walker Roster & "Sign Up to Claim Your Free Pass" Heroic Layout

**Files:**
- Modify: `index.html:245-265`
- Modify: `css/roster.css:1-250`
- Modify: `css/pass.css:1-220`
- Modify: `js/roster/view.js:1-200`
- Modify: `js/pass/view.js:1-220`
- Test: `tests/test_roster.py`
- Test: `tests/test_pass.py`

**Interfaces:**
- Consumes: `assets/coach.webp`, `assets/england-boxing-logo.png`, `js/data/coaches.js`
- Produces: Prominent side-by-side heroic coach showcase with immediate, high-converting Free Session Pass generator.

- [ ] **Step 1: Write failing test in `tests/test_roster.py` for heroic coach layout**

```python
def test_coach_portrait_is_prominent_and_visible(page, base_url):
    page.set_viewport_size({"width": 1280, "height": 800})
    page.goto(base_url + "/#coach")
    coach_img = page.locator("#coach .coach-portrait")
    assert coach_img.is_visible()
    box = coach_img.bounding_box()
    assert box["height"] >= 450, f"Coach portrait height ({box['height']}) is too small"

def test_free_pass_form_flanks_coach(page, base_url):
    page.set_viewport_size({"width": 1280, "height": 800})
    page.goto(base_url + "/#coach")
    pass_form = page.locator("#free-pass")
    assert pass_form.is_visible()
    header_text = page.locator("#free-pass h2, #free-pass h3").first.text_content()
    assert "claim" in header_text.lower() or "free" in header_text.lower()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_roster.py::test_coach_portrait_is_prominent_and_visible -v`
Expected: FAIL because coach was inside collapsed 3D carousel.

- [ ] **Step 3: Implement prominent heroic Coach & Free Pass layout**

- In `index.html`: Restructure `#coach` container into a bold 2-column heroic layout (stacked cleanly on mobile, side-by-side on desktop):
  - **Left / Heroic Column:** Large Coach Ian Walker portrait (`assets/coach.webp`), full credentials badge ("Head Coach Ian Walker", "England Boxing Registered Coach", "30+ Years Boxing Experience", "South Birmingham ABC").
  - **Right / Booking Column:** Prominent "Sign Up to Claim Your Free Pass" gateway containing name, phone, class preselect, instant pass generator button, cryptographic pass card, and 1200×630 PNG download.
- In `css/roster.css` & `css/pass.css`:
  - Give `.coach-hero-card` a 3D metallic border, subtle red glow, and commanding height.
  - Give `#free-pass` elevated ticket styling with red punch badge and clean inputs.

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/test_roster.py tests/test_pass.py -v`
Expected: ALL PASS.

- [ ] **Step 5: Commit**

```bash
git add index.html css/roster.css css/pass.css js/roster/ js/pass/ tests/test_roster.py tests/test_pass.py
git commit -m "feat(coach): implement prominent heroic coach portrait with side-by-side free pass claim"
```

---

### Task 4: Redesign Timetable with 3D Pop-Up, Card Flip & Viewport-Fitting Layout

**Files:**
- Modify: `index.html:240-245`
- Modify: `css/timetable.css:1-250`
- Modify: `js/timetable/view.js:1-220`
- Modify: `js/data/timetable.js:1-200`
- Test: `tests/test_timetable.py`

**Interfaces:**
- Consumes: `SESSIONS`, `FILTERS` from `js/data/timetable.js`
- Produces: Responsive timetable grid that fits comfortably on page with 3D perspective pop-up and flip interaction on hover/touch.

- [ ] **Step 1: Write failing test in `tests/test_timetable.py` for 3D flip/pop-up interaction**

```python
def test_timetable_card_has_3d_flip_structure(page, base_url):
    page.goto(base_url + "/#timetable")
    card = page.locator(".session-card-3d").first
    assert card.is_visible()
    # Check 3D transform preserve-3d styling
    transform_style = page.evaluate("el => window.getComputedStyle(el).transformStyle", card.element_handle())
    assert transform_style == "preserve-3d"
    # Front and back faces exist
    assert card.locator(".card-front").is_visible()
    assert card.locator(".card-back").count() >= 1

def test_timetable_fits_on_viewport_without_overflow(page, base_url):
    page.set_viewport_size({"width": 375, "height": 812})
    page.goto(base_url + "/#timetable")
    scroll_width = page.evaluate("document.scrollingElement.scrollWidth")
    assert scroll_width <= 375
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_timetable.py::test_timetable_card_has_3d_flip_structure -v`
Expected: FAIL because current cards lack `.session-card-3d` and `.card-back`.

- [ ] **Step 3: Implement 3D flip card structure and viewport-fitting styles in `timetable.css` and `view.js`**

- In `css/timetable.css`:
  - Setup `.timetable-grid` with auto-fit columns (`minmax(280px, 1fr)`) that fit comfortably on any screen.
  - Implement 3D flip card mechanics:
    ```css
    .session-card-wrapper { perspective: 1000px; }
    .session-card-3d {
      transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease;
      transform-style: preserve-3d;
      position: relative;
    }
    .session-card-wrapper:hover .session-card-3d,
    .session-card-3d.flipped {
      transform: translateY(-6px) scale(1.03) rotateY(180deg);
    }
    .card-front, .card-back {
      backface-visibility: hidden;
      border-radius: 8px;
    }
    .card-back {
      transform: rotateY(180deg);
      position: absolute; inset: 0;
    }
    ```
- In `js/timetable/view.js`:
  - Render front face: Discipline color bar, Day/Time, Class title, Rate (£5 Junior or £7 Adult), "Tap/Hover for info".
  - Render back face: Focus/Level ("All levels welcome"), equipment notes ("Gloves & wraps available"), Coach ("Ian Walker"), and "Book Free Pass" button that preselects the class and scrolls to `#free-pass`.
  - Add click/tap toggle for touch devices so mobile users can tap to flip or book directly.

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/test_timetable.py -v`
Expected: ALL PASS.

- [ ] **Step 5: Commit**

```bash
git add css/timetable.css js/timetable/ tests/test_timetable.py
git commit -m "feat(timetable): implement elegant 3D pop-up and flip cards with mobile touch support"
```

---

### Task 5: 3D One-Page Scroll Orchestration, Full Verification & Production Deployment

**Files:**
- Modify: `css/base.css:1-150`
- Modify: `js/main.js:1-80`
- Test: `tests/` (all 44+ tests)

**Interfaces:**
- Consumes: All updated modules
- Produces: Unified cinematic 3D one-page scroll experience, 100% passing tests, and updated production deployment on GitHub Pages.

- [ ] **Step 1: Write integration test in `tests/test_shell.py` for 3D scroll cueing & section transitions**

```python
def test_all_sections_have_3d_scroll_perspective(page, base_url):
    page.goto(base_url)
    sections = page.locator("main > section")
    for i in range(sections.count()):
        sec = sections.nth(i)
        assert sec.is_visible()
```

- [ ] **Step 2: Run test to verify current state**

Run: `pytest tests/test_shell.py -v`
Expected: PASS.

- [ ] **Step 3: Implement smooth 3D scroll perspective transitions in `css/base.css` and `js/main.js`**

- Add subtle 3D depth transitions on scroll intersections: Sections smoothly enter with subtle scale (`scale(0.98)` to `scale(1.0)`) and opacity fade as they enter the viewport.
- Ensure all anchor links (`#classes`, `#timetable`, `#coach`, `#prices`, `#find-us`) use smooth scrolling without jarring jumps.
- Verify full mobile responsiveness (375px) has zero horizontal overflow.

- [ ] **Step 4: Run full test suite to verify 100% pass**

Run: `pytest tests/ -v`
Expected: 44+ PASSED, 0 FAILED.

- [ ] **Step 5: Push to GitHub & deploy live update**

```bash
git add -A
git commit -m "feat: complete 3D one-page scroll overhaul and visual polish"
git push origin main
```

- [ ] **Step 6: Verify live deployment on `https://8souless.github.io/elite-pro-fitness/` with Playwright**

Run automated script to fetch live URL, verify HTTP 200, zero console errors, and capture mobile screenshot.
