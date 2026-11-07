# Elite Pro Fitness — Cinematic 3D Landing Page & Gateway
## Design Specification

**Document Version:** 1.0.0  
**Date:** 2026-11-07  
**Location:** 199–201A Merritts Brook Lane, Northfield, Birmingham, B31 1UH  
**Status:** Pending Review & Approval  

---

## 1. Intent & Business Truth

**Elite Pro Fitness** is an authentic, community-rooted boxing gym and fitness studio situated in Northfield, south Birmingham. Operating in tandem with **South Birmingham Amateur Boxing Club (ABC)** and officially affiliated with **England Boxing**, the gym provides high-caliber amateur fight coaching alongside accessible, energetic fitness programs for the entire local community.

* **Owner & Head Coach:** Ian Walker (sole head coach and owner; designed to expand with future coaches).
* **Core Philosophy:** Real boxing heritage without the intimidation. From young kids picking up gloves for the first time to competitive boxers and women seeking empowered conditioning, it is clean, friendly, and fully equipped.
* **Open Hours:** Mon–Sat 12:00 PM – 9:00 PM; Sunday sessions 9:00 AM – 2:00 PM.

---

## 2. Goals, Non-Goals & Anti-Goals

### Goals
1. **Cinematic Hero Entry (Zero Clicks):** Implement a continuous scroll-driven 3D camera move inspired by the Redline Three.js mechanic. The visitor scrolls, the camera dives smoothly from the exterior threshold directly onto the gym floor, punching through the boxing ring ropes into the lower sections without stopping or requiring clicks.
2. **Atmospheric Continuous Descent:** Transition seamlessly into a vertical momentum scroll (Hollowmere paradigm) traversing distinct training zones with dynamic canvas particles (chalk motes, lighting glare, mist, and speed streaks).
3. **Interactive Coach Feature & Free Trial Pass Generator:** Showcase Coach Ian Walker (`coach.png`). As the visitor scrolls into the coach zone, Coach Ian slides dynamically to one flank, while an interactive "Claim Your Free Session Pass" ticket generator reveals on the opposite side. Submitting name and email generates an authentic digital VIP Guest Pass (with Pass ID, session time, and gym address).
4. **Recreated Interactive Timetable:** Rebuild the uploaded weekly timetable into an interactive, filterable schedule matching the exact real sessions (Kids, Juniors, Adults Mixed, Ladies Only, Squad, JuJitsu/MMA, Weights, Run Club).
5. **Transparent Membership Matrix:** Clearly present the £15 joining fee, junior vs adult rates (£5/£7 per session, £30/£40 monthly), and special 10-week Junior Development camp (£35).
6. **Rock-Solid Stability:** Ensure 100% bug-free scroll orchestration: no wheel lock dead-ends, no WebGL canvas blackouts, zero horizontal overflow, and fully responsive across mobile (375px), tablet, and desktop (1440px+).

### Non-Goals
* Full member management backend or database auth in this phase (Phase 1 delivers the full-fidelity front-facing landing page and web app gateway; API integrations follow in Phase 2).

### Anti-Goals
* No generic cookie-cutter gym SaaS aesthetics.
* No flat monochrome placeholder sections or empty grey blocks.
* No jarring cuts or scroll traps.

---

## 3. Brand & Visual System (Impeccable Standard)

### Color Tokens
* `--bg-void`: `#09090C` (Deep industrial shadow)
* `--bg-surface`: `#121318` (Textured dark slate)
* `--ring-red`: `#E52E2E` (Combat crimson / ring ropes)
* `--ring-red-glow`: `rgba(229, 46, 46, 0.35)`
* `--champion-gold`: `#F5A623` (Accents, badges, sponsor highlights)
* `--ink-white`: `#F8F8FC` (Primary headers and text)
* `--ink-muted`: `#9A9BA8` (Body copy, technical labels)
* `--chalk-dust`: `rgba(240, 240, 255, 0.7)`

### Brand Assets & Identity Integration
* **England Boxing Official Affiliation:**
  * Featured prominently in the fixed header navigation bar and as an accreditation trust seal (`assets/england-boxing-logo.png`).
  * Explicitly establishes the gym's official amateur competition pedigree via South Birmingham ABC.
* **EPF Emblem Mark (Isolated Drawing):**
  * The EPF logo drawing/emblem is isolated as a standalone mark without the bottom text lockup.
  * Allows the graphic mark to scale boldly, large, and unconstrained in both the 3D Hero canvas and header bar without being squeezed down or distorted by text line heights.
  * Paired with the 3D metallic version (`logo-3d.webp` / `logo-3d.png`) for the central 3D Hero interaction.

### Typography
* **Display Titles:** `Oswald` / `Montserrat` (900 weight, uppercase, tight tracking `-0.02em` to `-0.04em`, heavy editorial weight).
* **Body & UI Microcopy:** `Inter` (weights 400, 500, 600, 700) for clean, legible schedules, ticket numbers, and descriptions.

### Atmosphere & Shaders
* **Background Texture:** Subtle industrial grain overlay via SVG noise filter.
* **Canvas Particles:** 2D particle engine simulating gym chalk motes, warm arena lighting flares, and sweat-droplet spray.
* **Depth Seams:** Natural illustrated visual seams between sections (iron beams, ring canvas borders, exposed brick textures) avoiding arbitrary flat gradient dividers.

---

## 4. Architectural Approaches & The Selected Path

### Approaches Considered
* **Approach A (Click-based State Machine):** Redline style with explicit buttons or locked step clicks. *Rejected: user explicitly requested natural scroll motion without clicks.*
* **Approach B (Isolated Pinned Sections):** Pinned cards that flip on scroll. *Rejected: breaks the feeling of moving physically through the gym.*
* **Approach C (Seamless Punch-Through Handoff — Selected):** 
  * The Hero acts as a scroll-driven canvas/video journey. The user's scroll delta directly scrubs camera depth from 0.0 to 1.0.
  * At 1.0, the camera passes through the ring ropes and the 3D stage cleanly pins out while the vertical scroller immediately takes over native/eased momentum scroll.
  * No event fighting, no lock-ups, no blank frames.

---

## 5. Page Structure & Section Breakdown

```
+-------------------------------------------------------+
| 0. Fixed Nav: Logo, England Boxing Badge, Nav Links,  |
|    "Claim Free Pass" CTA button                       |
+-------------------------------------------------------+
| 1. HERO: The 3D Camera Dive                           |
|    - Layer 1: Exterior & Northfield Heritage          |
|    - Layer 2: Gym Floor & Heavy Bag Rhythm            |
|    - Layer 3: The Boxing Ring & Ropes (Camera Dive)   |
|    - Scroll momentum punches through ropes            |
+-------------------------------------------------------+
| 2. THE TRAINING ZONES (Hollowmere-style Descent)      |
|    - Zone 1: Junior & Kids Boxing Pathway             |
|    - Zone 2: Ladies Only Boxing & Conditioning        |
|    - Zone 3: Mixed Adults Boxing & Fitness            |
|    - Zone 4: Senior Elite Squad & England Boxing ABC   |
+-------------------------------------------------------+
| 3. INTERACTIVE WEEKLY TIMETABLE                       |
|    - Day-by-Day & Category Filter                     |
|    - Mon–Sat 12-9 PM, Sunday Morning Sessions         |
|    - Boxing, Squad, Ladies, JuJitsu/MMA, Run Club     |
+-------------------------------------------------------+
| 4. COACH IAN & THE ROSTER CAROUSEL                    |
|    - Curved 3D Roster (VHS-inspired arc mechanic)     |
|    - Features Coach Ian Walker (Owner & Head Coach)   |
|    - 3D depth perspective & hover flip into bio card  |
|    - Modular architecture to add future coaches/squad |
|    - Shift-to-flank animation revealing the VIP       |
|      Free Session Pass generator                      |
+-------------------------------------------------------+
| 5. MEMBERSHIP & PRICING                               |
|    - £15 Joining Fee                                  |
|    - Under 18s: £5 session / £30 monthly              |
|    - Over 18s: £7 session / £40 monthly               |
|    - 10-Week Junior Development Camp (£35)            |
+-------------------------------------------------------+
| 6. THE HUB (Northfield Location, Hours & Sponsors)    |
|    - 199–201A Merritts Brook Lane, B31 1UH            |
|    - Arden Estate Agents & AA Garage Doors badges     |
|    - Direct Contact / Directions / Social Links       |
+-------------------------------------------------------+
```

---

## 6. Detailed Component Mechanics

### Component A: Scroll Handoff & Hybrid 3D Engine
* **Hybrid Viewport Architecture:**
  * To guarantee crisp visual fidelity across both 16:9 desktop (1440px+) and mobile (375px), the Hero uses a **Three.js Orthographic/Perspective camera dolly** paired with high-resolution wide layers (`outside.webp`, `logo-3d.webp`, `fore.webp` ring spires) and active canvas video textures.
  * Desktop screens render full-bleed 2.5D camera depth with volumetric light flares and floating chalk motes.
  * Mobile viewports naturally utilize the vertical framing of the gym clips (`stage0-exterior.mp4`, `stage1-gym.mp4`, `stage2-ring.mp4`) as dynamic layered backgrounds.
* **Unified RAF State Machine:**
  * A single `requestAnimationFrame` loop calculates `heroProgress = clamp(scrollY / heroHeight, 0, 1)`.
  * Camera Z-position, focal depth, and layer opacities scrub smoothly with `cubic-bezier(0.2, 0.8, 0.2, 1)`.
  * At `heroProgress >= 1.0`, the camera punches cleanly through the ring ropes and pins out, smoothly transferring scroll momentum directly into the vertical scroller. Zero scroll-trapping, zero black frames.

### Component B: Curved 3D Coach Roster & Free Pass Generator
* **The 3D Curved Roster (Leon Vasari VHS Inspiration):**
  * Built using a CSS 3D perspective arc (`perspective: 1400px; transform-style: preserve-3d`).
  * Features Coach Ian Walker as the lead card/cover with `assets/coach.png`, flanked by England Boxing certification credentials and future squad slots.
  * Tapes/cards sit on an arc that curves into depth. Hovering tilts the card in 3D (`rotateY`, `rotateX`) with smooth spring physics (`1 - e^(-12dt)`).
* **The Pass Generator Trigger:**
  * Selecting/clicking Coach Ian slides him smoothly into the personal flank spotlight.
  * The opposite side pops open the **VIP Free Session Pass Generator**:
    * Inputs: Full Name, Email, Class Selection (Kids, Juniors, Adults Mixed, Ladies Only).
    * Action: "Generate My Free Pass".
    * Dynamic Result: Generates a commemorative digital ticket with unique ID, session timestamp, and QR watermark that can be saved directly.

### Component C: The Timetable Engine
* Data array of all sessions exactly matching the verified schedule:
  * **Monday:** Junior Beginners (5:30-6:30pm), Junior Elite Squad (6:30-7:30pm), Senior Elite Boxing (7:30-9:00pm).
  * **Tuesday:** Ladies Only Boxing (6:00-7:00pm), Squad Training (7:00-8:30pm).
  * **Wednesday:** Ladies Legs Bums & Tums (12:00-1:00pm), Weight Training (2:00-3:00pm), Junior Beginners (5:30-6:30pm), Junior Elite Squad (6:30-7:30pm), Senior Elite Boxing (7:30-9:00pm).
  * **Thursday:** Ladies Only Boxing (6:00-7:00pm), Squad Training (7:00-8:00pm), MMA + JuJitsu (8:00-9:00pm).
  * **Friday:** Junior Elite Squad (5:00-6:00pm), Senior Elite Boxing (6:00-7:30pm).
  * **Saturday:** Run Club (9:00-10:00am), Advanced Juniors (9:30-10:30am), Boxing Session (10:30am-12:00pm), Junior Development Boxing (1:00-3:00pm), Kick Boxing, Squad Training (2:00-3:00pm).
  * **Sunday:** Run Club (9:00-10:00am), Squad Training (12:00-1:00pm), JuJitsu (1:00-2:00pm).
* Interactive filter pills: `All`, `Boxing`, `Squad`, `Ladies Only`, `Kids & Juniors`, `Martial Arts / MMA`.

---

## 7. Performance & Verification Plan

1. **Asset Optimization:** Use `.webp` variants where available (`cards.webp`, `fore.webp`, `outside.webp`, `coach.webp`, `logo-3d.webp`).
2. **Device Scaling:** Full support down to 375px mobile viewport with responsive typography clamps (`clamp()`) and touch-drag support.
3. **Canvas Performance:** Capped DPR `Math.min(window.devicePixelRatio, 1.75)` to prevent GPU throttling on 4K/retina displays.
4. **Automated Verification:** Self-contained single-page bundle tested on local server with responsive checks and zero console errors.

---

## 8. Asset Generation & Multi-Shot Transition Pipeline

To deliver true cinematic fluidity without relying on low-resolution phone clips or static images, the visual pipeline incorporates bespoke multi-shot generative assets:

1. **Exterior-to-Interior Continuous Camera Transition:**
   * **Source Reference:** `outside.webp` (199–201A Merritts Brook Lane entrance).
   * **Generation Goal:** A photoreal, smooth 4-second dolly shot advancing from the street pavement through the entrance into the dimly lit, atmospheric gym training floor.
   * **Tooling:** **Veo 2 / Gemini Omni Flash** (first-to-last-frame camera trajectory) or **Runway Gen-3 Alpha**.
2. **Gym Floor to Ring Ropes Transition:**
   * **Source Reference:** `corner.webp` and `fore.webp` (boxing ropes and turnbuckles).
   * **Generation Goal:** A smooth forward tracking shot gliding low between hanging heavy bags, lifting up to gaze directly through the ring ropes toward Coach Ian in the corner.
3. **Atmospheric Texture Passes:**
   * **Tooling:** **Imagen 3** (via the workspace `image-generator` subagent) for seamless industrial brickwork, canvas ring grain, and volumetric light leak overlays.

