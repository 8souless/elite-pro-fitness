# Coach Identity, "Who We Are" & Logo Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Coach section into an authentic first-person "Who We Are" manifesto featuring a full-figure Coach Ian reveal positioned before the Timetable, enlarge England Boxing accreditation seals, and polish the navbar logo mark by isolating and animating the pure red boxer silhouette.

**Architecture:** Refine visual branding in CSS/HTML by stripping obsolete subtext from the boxer emblem and enlarging the England Boxing seals. Reorder DOM sections in `index.html` to place `#coach` ahead of `#timetable`. Structure the "Who We Are" layout into a two-column grid pairing an animated, uncropped full-figure Coach Ian manifesto on the left with the interactive Free Pass ticket generator on the right.

**Tech Stack:** Vanilla JavaScript (ES modules, IntersectionObserver), CSS3 (Flexbox/Grid, 3D transforms, keyframe animations), HTML5, Python/Playwright for automated regression testing.

**Spec:** `docs/superpowers/specs/2026-11-07-coach-identity-and-logo-polish-design.md`

## Global Constraints

- Never break or regress the 3D Three.js camera dive in `#hero` or the 3D timetable card flip interaction.
- The red boxer emblem mark must not retain any text beneath the boxer figure.
- Section ordering must strictly be: `hero` -> `classes` -> `coach` (or `who-we-are`) -> `timetable` -> `prices` -> `find-us`.
- Coach Ian Walker must be presented as a full, uncropped figure (`max-height: 580px`, `object-position: bottom`).
- Copy must be written in the first person ("I", "we"), authentically conveying 100% amateur boxing development, England Boxing standards (Club Reg #10452), and community roots without generic commercial gym buzzwords.
- The interactive Free Pass claim form (`#free-pass`) must remain functional and accessible alongside the manifesto.

## Review Focus

1. **Mobile Header Overflow (375px):** Enlarge the logo and England Boxing seal without causing the header to overflow or crowd out the CTA button. Pin with `test_brand_marks` at 375px viewport.
2. **Section Anchor Navigation:** Navigating to `#coach` or `#timetable` must land directly at the correct section now that their DOM order is swapped. Pin with `test_anchor_jump_order`.
3. **Scroll Reveal Degradation:** If JavaScript or IntersectionObserver is slow or disabled, Coach Ian's full figure must still be visible and not hidden behind `opacity: 0`. Pin with CSS fallback check.
4. **Pass Prefill Synchronization:** Clicking a timetable session from `#timetable` must still properly scroll and prefill `#free-pass` now that `#coach` is situated above `#timetable`. Pin with `test_click_session_prefills_pass`.
5. **No Vertical Scroll Trap:** Expanding Coach Ian to full figure height must not prevent natural wheel or touch scrolling through to the Timetable. Pin with `test_vertical_wheel_not_hijacked`.

---

### Task 1: Clean Red Boxer Silhouette & Header Affiliation Polish

**Files:**
- Create/Modify: `assets/brand/epf-emblem.webp` (isolate red boxer mark without bottom text)
- Modify: `css/base.css:12-55`
- Test: `tests/test_shell.py`

**Interfaces:**
- Consumes: `assets/logo-stacked.webp` or `assets/brand/epf-emblem.webp`
- Produces: Clean red boxer silhouette rendered via `.brand-wrap .emblem` and enlarged `.affiliation-badge`

- [ ] **Step 1: Write the failing test in `tests/test_shell.py`**

Add assertions in `tests/test_shell.py::test_brand_marks` checking that `.brand-wrap .emblem` has height >= 48px and that `.affiliation-badge img` has height >= 44px:

```python
def test_brand_marks(page, base_url):
    page.goto(base_url + "/")
    # Emblem should be scaled up and visible
    emblem_height = page.eval_on_selector("nav .emblem", "e => e.getBoundingClientRect().height")
    assert emblem_height >= 48, f"Emblem height {emblem_height} is under 48px"
    # England boxing badge should be enlarged and prominent
    eb_height = page.eval_on_selector(".affiliation-badge img", "e => e.getBoundingClientRect().height")
    assert eb_height >= 44, f"England Boxing badge height {eb_height} is under 44px"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_shell.py::test_brand_marks -v`
Expected: FAIL (emblem is currently 44px, badge is 38px)

- [ ] **Step 3: Isolate red boxer emblem and update CSS in `css/base.css`**

Crop `assets/brand/epf-emblem.webp` to exclude the bottom "Elite Pro Fitness South Birmingham" text, leaving only the red boxer torso and gloves.
In `css/base.css`:
1. Update `.brand-wrap .emblem` to `height: 52px`, `object-fit: contain`, and add `@keyframes boxerPulse` for entrance and hover glow.
2. Update `.affiliation-badge` and `.affiliation-badge img` to `height: 48px`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/test_shell.py::test_brand_marks -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add assets/brand/epf-emblem.webp css/base.css tests/test_shell.py
git commit -m "feat(brand): isolate red boxer emblem and enlarge header affiliation badge"
```

---

### Task 2: DOM Reordering — Move Coach Ahead of Timetable

**Files:**
- Modify: `index.html:230-285`
- Modify: `css/base.css:30-40`
- Test: `tests/test_shell.py::test_sections_in_order`

**Interfaces:**
- Consumes: `<section id="coach">` and `<section id="timetable">` in `index.html`
- Produces: New section order `["hero", "classes", "coach", "timetable", "prices", "find-us"]`

- [ ] **Step 1: Write the failing test in `tests/test_shell.py`**

Update `test_sections_in_order`:

```python
def test_sections_in_order(page, base_url):
    page.goto(base_url + "/")
    ids = page.eval_on_selector_all("main > section[id]", "els => els.map(e => e.id)")
    assert ids == ["hero", "classes", "coach", "timetable", "prices", "find-us"]
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_shell.py::test_sections_in_order -v`
Expected: FAIL (currently `["hero", "classes", "timetable", "coach", "prices", "find-us"]`)

- [ ] **Step 3: Reorder sections in `index.html` and update navigation order**

1. In `index.html`, move `<section id="coach">...</section>` so it sits immediately before `<section id="timetable">...</section>`.
2. In `<nav class="site-nav">`, update nav link order to reflect: `Classes`, `Who We Are`, `Timetable`, `Prices`, `Find us`.
3. Ensure `<a href="#coach">Who We Are</a>` points to `#coach`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/test_shell.py::test_sections_in_order -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add index.html tests/test_shell.py
git commit -m "refactor(layout): place Coach section before Timetable in document flow"
```

---

### Task 3: Full-Figure Coach Presentation & Scroll Reveal Animation

**Files:**
- Modify: `index.html:240-275`
- Modify: `css/pass.css:10-90`
- Modify: `js/pass/view.js`
- Test: `tests/test_roster.py::test_coach_portrait_is_prominent_and_visible`

**Interfaces:**
- Consumes: `assets/coach.webp`
- Produces: `.coach-full-figure` element with `.coach-figure-enter.is-visible` reveal class

- [ ] **Step 1: Write the failing test in `tests/test_roster.py`**

Update `test_coach_portrait_is_prominent_and_visible` to assert full-figure height and uncropped presentation:

```python
def test_coach_portrait_is_prominent_and_visible(page, base_url):
    page.set_viewport_size({"width": 1280, "height": 800})
    page.goto(base_url + "/#coach")
    coach_img = page.locator("#coach .coach-portrait")
    assert coach_img.is_visible()
    box = coach_img.bounding_box()
    assert box["height"] >= 520, f"Full-figure coach height ({box['height']}) is too small"
    # Ensure uncropped styling
    fit = page.evaluate("el => window.getComputedStyle(el).objectFit", coach_img.element_handle())
    assert fit == "contain"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_roster.py::test_coach_portrait_is_prominent_and_visible -v`
Expected: FAIL (height is under 520px or object-fit is cover)

- [ ] **Step 3: Implement full-figure markup and scroll reveal styling**

1. In `index.html`, wrap the coach portrait in `.coach-portrait-wrap` with `.coach-figure-enter` motion class.
2. In `css/pass.css`:
   - Set `.coach-portrait` to `height: 560px`, `max-height: 70vh`, `width: auto`, `object-fit: contain`, `object-position: bottom center`.
   - Add `.coach-figure-enter`: starts at `opacity: 0; transform: translateY(40px) scale(0.96); transition: opacity 0.8s ease-out, transform 0.8s ease-out;`.
   - Add `.coach-figure-enter.is-visible`: `opacity: 1; transform: translateY(0) scale(1);`.
3. In `js/pass/view.js`, initialize an `IntersectionObserver` that adds `is-visible` to `.coach-figure-enter` when `#coach` intersects 15% of viewport.

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/test_roster.py::test_coach_portrait_is_prominent_and_visible -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add index.html css/pass.css js/pass/view.js tests/test_roster.py
git commit -m "feat(coach): render full-figure coach with scroll entrance animation"
```

---

### Task 4: "Who We Are" First-Person Manifesto, England Boxing Seal & Copyright

**Files:**
- Modify: `index.html:245-280`
- Modify: `css/pass.css:90-180`
- Test: `tests/test_roster.py`

**Interfaces:**
- Consumes: Head Coach Ian Walker persona & England Boxing Club Reg #10452 credentials
- Produces: Branded manifesto layout with prominent England Boxing crest, first-person narrative, signature, and copyright text

- [ ] **Step 1: Write the failing test in `tests/test_roster.py`**

Add tests checking for the "Who We Are" title, England Boxing crest in the section header, first-person copy, and club copyright:

```python
def test_who_we_are_manifesto_and_affiliation(page, base_url):
    page.goto(base_url + "/#coach")
    # Section should feature "Who We Are"
    heading = page.locator("#coach .section-title, #coach h2").first.text_content()
    assert "who we are" in heading.lower() or "real boxing" in heading.lower()
    
    # England Boxing seal in section
    eb_seal = page.locator("#coach .section-eb-seal")
    assert eb_seal.is_visible()
    
    # First-person narrative copy
    bio_text = page.locator("#coach .coach-bio, #coach .coach-manifesto").text_content()
    assert "i didn't open" in bio_text.lower() or "my" in bio_text.lower()
    assert "amateur" in bio_text.lower()
    
    # Official copyright and affiliation
    copy_text = page.locator("#coach .coach-copyright").text_content()
    assert "10452" in copy_text
    assert "england boxing" in copy_text.lower()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_roster.py::test_who_we_are_manifesto_and_affiliation -v`
Expected: FAIL

- [ ] **Step 3: Implement "Who We Are" manifesto copy and styling**

1. In `index.html`:
   - Header with `.section-tag`: `WHO WE ARE` alongside an enlarged England Boxing crest `<img src="assets/england-boxing-logo.png" class="section-eb-seal" alt="England Boxing Affiliated">`.
   - Title: `Real Boxing. Real Standards. No Gimmicks.`
   - First-person manifesto paragraphs from Coach Ian Walker detailing the mission: 100% amateur boxing development, true discipline, youth pathways, zero ego, and community anchor at 201A Merritts Brook Lane.
   - Sign-off: `Ian Walker — Head Coach & Founder`.
   - Footer copyright: `© Elite Pro Fitness & South Birmingham ABC · England Boxing Registered Club #10452`.
2. In `css/pass.css`:
   - Style `.section-eb-seal` with `height: 52px; width: auto; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.4));`.
   - Style `.coach-manifesto` with high-contrast typography (`var(--ink-white)`, line-height 1.7, italic quote accents).
   - Style `.coach-copyright` with muted, crisp font (`var(--ink-muted)`, `0.85rem`).

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/test_roster.py::test_who_we_are_manifesto_and_affiliation -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add index.html css/pass.css tests/test_roster.py
git commit -m "feat(coach): implement Who We Are first-person manifesto and England Boxing affiliation seal"
```

---

### Task 5: End-to-End Verification Across Viewports & Timetable Linkage

**Files:**
- Modify: `tests/test_shell.py`, `tests/test_timetable.py`
- Test: All suites (`pytest tests/`)

**Interfaces:**
- Consumes: Complete page layout
- Produces: Validated, bug-free responsive experience across mobile (375px), tablet (768px), and desktop (1440px)

- [ ] **Step 1: Write verification test for timetable-to-pass jump and mobile integrity**

Verify in `tests/test_timetable.py`:
- Clicking a session from `#timetable` smoothly scrolls up/targets `#free-pass` and prefills class name.
- Verify no horizontal overflow across all viewports.

- [ ] **Step 2: Run all tests to verify coverage**

Run: `pytest tests/ -v`
Expected: ALL PASS

- [ ] **Step 3: Inspect responsive layout**

Check visual layout on:
- 375px (iPhone SE): Header elements wrap cleanly, Coach Ian scales appropriately, Free pass ticket is full width.
- 768px (iPad): Two-column layout adapts gracefully.
- 1440px (Desktop): Imposing coach figure flanks the ticket generator.

- [ ] **Step 4: Commit**

```bash
git add tests/
git commit -m "test: verify responsive layout and cross-section interaction across viewports"
```
