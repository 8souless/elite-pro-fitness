# Elite Pro Fitness — Coach Identity, "Who We Are" & Logo Polish
## Design Specification

**Document Version:** 1.0.0  
**Date:** 2026-11-07  
**Status:** Under Review  

---

## 1. Intent & The "Why"
Elite Pro Fitness is not a commercial leisure center—it is an authentic England Boxing affiliated club (South Birmingham ABC, Reg #10452) dedicated to real amateur boxing craft, youth development, and disciplined conditioning. 

The site needs to reflect this authentic identity immediately in both brand aesthetics and personal voice:
1. **Logo Polish:** The navbar logo mark currently duplicates text underneath the boxer silhouette. Cleaning this up to the pure red boxer mark allows it to breathe, scale up, and animate cleanly.
2. **Pedigree Prominence:** England Boxing accreditation must stand out clearly both in the header and in the body.
3. **Who We Are Before When We Train:** Visitors need to know *who* they are stepping into the ring with before looking at the class schedule. Positioning Coach Ian Walker ahead of the timetable establishes emotional buy-in, trust, and community pride.
4. **Authentic Full-Figure Coach & Voice:** Head Coach Ian Walker must be presented as a full-length, authentic presence with a scroll-triggered entrance motion, speaking directly in the first person about why this club exists.

---

## 2. Goals, Non-Goals & Anti-Goals

### Goals
- **Clean Red Boxer Emblem:** Isolate the red boxer shape from any underlying text, scale it up by ~20%, and add an entrance pulse and hover micro-interaction alongside the white and gold text (*"ELITE PRO FITNESS / SOUTH BIRMINGHAM"*).
- **Enlarged England Boxing Header Seal:** Increase the top-right affiliation badge dimensions so it is crisp and immediately readable.
- **Section Swapping:** Reorder the DOM so that the Coach / "Who We Are" section comes before `#timetable`.
- **Full-Figure Coach Reveal:** Display Coach Ian as a complete, uncropped silhouette/figure with a dramatic entrance animation (fade + slight vertical/lateral translation) on scroll into view.
- **First-Person Manifesto Copy:** Replace generic third-person copy with an authentic letter written from Coach Ian Walker's personal perspective (100% amateur boxing development, youth pathways, competitive toughness, zero ego, local community anchor).
- **Side-by-Side Pass Booking:** Maintain the interactive Free Pass ticket generator in the right column, directly coupled to Ian's personal invitation.
- **Attribution & Copyright:** Embed official club copyright notice and England Boxing affiliation details at the base of the manifesto.

### Non-Goals
- Altering the 3D Three.js hero descent camera choreography.
- Redesigning the timetable component logic itself (only shifting its vertical position in the document flow).

### Anti-Goals
- No corporate "gym SaaS" jargon or generic "wellness" buzzwords.
- No cropped torso box that cuts Ian in half.

---

## 3. Approaches Considered & Selected Approach

### Approaches Considered
1. **Approach A (Full-width Manifesto, Isolated Pass):** Coach Ian takes full screen width like an editorial magazine feature, with the Free Pass ticket generator pushed below the section.  
   *Trade-off:* Great gravitas, but disconnects the call to action from Ian's personal invitation.
2. **Approach B (Coach's Corner Split — Selected):**  
   * Left Column: Full-figure Coach Ian with scroll-triggered entrance, prominent England Boxing badge, first-person written manifesto, and club copyright.  
   * Right Column: Interactive digital guest pass generator mounted side-by-side.  
   * *Why Selected:* Directly fulfills the user's vision of seeing Ian as a whole figure while keeping the interactive ticket generator right beside his invitation.

---

## 4. Technical Architecture & Implementation Details

### 4.1. Logo & Header Navigation (`css/base.css`, `index.html`)
- Crop or render `epf-emblem` without the bottom text lockup.
- Set `.brand-wrap .emblem` to `height: 52px` (up from 44px) with a subtle CSS keyframe pulse or glow on load and hover:
  ```css
  @keyframes boxerPulse {
    0%, 100% { filter: drop-shadow(0 0 6px rgba(229, 46, 46, 0.4)); }
    50% { filter: drop-shadow(0 0 14px rgba(229, 46, 46, 0.75)); }
  }
  ```
- Enlarge top-right `.affiliation-badge img` from `height: 38px` to `height: 48px` with clear padding.

### 4.2. DOM Section Reordering (`index.html`)
- Move `<section id="coach">` (or `<section id="who-we-are">`) directly above `<section id="timetable">`.
- Update navigation links: Ensure `Who We Are` / `Coach` links point correctly.

### 4.3. "Who We Are" Section & Full-Figure Coach (`css/pass.css`, `index.html`)
- **Full Figure Display:**
  - Wrap Ian's portrait in `.coach-full-figure` with `max-height: 580px; object-fit: contain; object-position: bottom;`.
  - Add an entrance reveal animation class triggered by `IntersectionObserver` in JavaScript:
    ```css
    .coach-figure-enter {
      opacity: 0;
      transform: translateY(30px) scale(0.96);
      transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .coach-figure-enter.is-visible {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    ```
- **England Boxing Badge:** Featured prominently next to the section title:
  - Header line: `WHO WE ARE` alongside England Boxing club crest.
- **First-Person Manifesto Text:**
  - Headings: *"Real Boxing. Real Standards. No Gimmicks."*
  - Body: Coach Ian's direct statement:
    > "I didn't open Elite Pro Fitness to run another soulless commercial fitness suite where people swipe a card and go through the motions. We built this gym on 201A Merritts Brook Lane as the fighting home of South Birmingham ABC—a real amateur boxing club where discipline, courage, and craft come first.
    > 
    > Whether you're an 11-year-old learning the sweet science, a competitive amateur preparing for tournament bouts, or someone who wants the unmatched conditioning of real 3-minute rounds without egos, you get 100% of my time, standards, and respect.
    > 
    > If you're ready to put the work in, step through the ropes. Your first session is on me."
  - Sign-off: *"Ian Walker — Head Coach & Founder, South Birmingham ABC (Club Reg No. 10452)"*.
  - Club Copyright: *"© Elite Pro Fitness & South Birmingham ABC. England Boxing Affiliated."*

### 4.4. Right Column: Interactive Pass Generator
- Retains existing `#free-pass` mounting point from `js/pass/view.js` and `js/pass/pass.js`.
- Synchronized with Ian's CTA so claiming a free pass generates the branded ticket pass.

---

## 5. Verification Plan
1. **Visual & Layout Check:**
   - Verify navbar logo: Boxer shape has no small text underneath, is larger, and pulses/animates cleanly.
   - Verify England Boxing logo in header: enlarged and sharp.
   - Verify DOM flow: Hero $\rightarrow$ Classes $\rightarrow$ Who We Are $\rightarrow$ Timetable $\rightarrow$ Prices $\rightarrow$ Find Us.
   - Verify Coach Ian appears as a full figure with smooth entrance motion.
   - Verify first-person manifesto copy and England Boxing crest beside the title.
2. **Interactive Pass Check:**
   - Submit a test pass (Name, Email, Class) to verify the ticket generates with correct date and pass ID.
3. **Automated Test Suite:**
   - Run `pytest tests/` to confirm all existing DOM and structure assertions pass or are updated cleanly.
