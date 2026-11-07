import { COACH, PROGRAMMES } from "../data/coaches.js";
import { sessionsForClass } from "../data/timetable.js";
import { damp } from "../core/math.js";
import { rel, buildXS, tapeTransform } from "./arc.js";
import { prefersReducedMotion } from "../core/progress.js";

export const rosterView = {
  init(root) {
    if (!root) return { update() {} };

    // Base sequence: [kids, juniors, COACH, adults, ladies]
    const baseItems = [
      ...PROGRAMMES.slice(0, 2),
      { ...COACH, isCoach: true, title: COACH.name },
      ...PROGRAMMES.slice(2),
    ];
    const n = baseItems.length; // 5

    // Repeat 3 times for seamless wrapping (15 items total)
    const allItems = [...baseItems, ...baseItems, ...baseItems];
    const total = allItems.length; // 15
    let sTarget = 7; // Center on Ian in the middle set (index 7)
    let s = 7;

    root.innerHTML = `
      <div class="roster-header">
        <h2>Leadership & Programmes</h2>
        <p>Curated Coaching By England Boxing Standards</p>
      </div>

      <div class="shelf-wrap">
        <div class="shelf" tabindex="0" role="region" aria-label="Interactive 3D Programme & Coach Shelf">
          ${allItems
            .map((item, idx) => {
              const coverImg = item.cover && item.cover.sheet ? item.photo : item.cover;
              return `
              <div class="tape" data-index="${idx}" data-base-idx="${idx % n}">
                <div class="tape-spine">
                  <span class="spine-text">${item.title}</span>
                </div>
                <div class="tape-cover">
                  <img src="${coverImg}" alt="${item.title}" loading="lazy">
                </div>
              </div>
            `;
            })
            .join("")}
        </div>

        <div class="caption">
          <div class="title">${COACH.name}</div>
          <div class="desc">${COACH.role} · England Boxing Qualified</div>
        </div>
      </div>

      <div class="flank-wrap">
        <button type="button" class="close-flank-btn">Close Back To Arc ✕</button>
        <div class="coach-details">
          <div class="coach-photo-flank">
            <img src="assets/coach.webp" alt="Coach Ian Walker">
            <div class="coach-bio-badge">
              <h3>${COACH.name}</h3>
              <p>${COACH.role} · Elite ABC</p>
            </div>
          </div>
          <div class="pass-container">
            <div id="free-pass">
              <!-- Free session pass will mount here in Task 9 -->
              <form id="pass-placeholder-form">
                <p style="color: var(--champion-gold); margin-bottom: 12px; font-weight: 600;">CLAIM YOUR FREE SESSION PASS</p>
                <button type="button" class="btn-primary">Generate Pass</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;

    const shelf = root.querySelector(".shelf");
    const tapeEls = Array.from(root.querySelectorAll(".tape"));
    const titleEl = root.querySelector(".caption .title");
    const descEl = root.querySelector(".caption .desc");
    const closeBtn = root.querySelector(".close-flank-btn");

    let dims = { H: 400, ws: 67, d: 210, gap: 14, U: 520, P: 1400 };
    let XS = buildXS(dims.U);

    function recalcDims() {
      const isMobile = window.innerWidth < 768;
      const H = isMobile
        ? Math.min(window.innerWidth * 0.68, window.innerHeight * 0.40)
        : Math.min(window.innerHeight * 0.47, window.innerWidth * 0.33);

      dims = {
        H,
        ws: (H * 142) / 840,
        d: (H * 474) / 900,
        gap: H * 0.035,
        U: isMobile ? H * 1.05 : H * 1.3,
        P: 1400,
      };
      XS = buildXS(dims.U);

      tapeEls.forEach((el) => {
        el.style.height = `${dims.H}px`;
        el.style.width = `${dims.ws}px`;
        const spine = el.querySelector(".tape-spine");
        const cover = el.querySelector(".tape-cover");
        if (spine) {
          spine.style.width = `${dims.ws}px`;
          spine.style.height = `${dims.H}px`;
        }
        if (cover) {
          cover.style.width = `${dims.d}px`;
          cover.style.height = `${dims.H}px`;
        }
      });
    }

    window.addEventListener("resize", recalcDims);
    recalcDims();

    // Dragging physics
    let isDragging = false;
    let didMove = false;
    let startX = 0;
    let startS = 0;

    shelf.addEventListener("pointerdown", (e) => {
      isDragging = true;
      didMove = false;
      startX = e.clientX;
      startS = sTarget;
    });

    shelf.addEventListener("pointermove", (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 6) {
        didMove = true;
        sTarget = startS - dx / (dims.ws * 1.2);
      }
    });

    const stopDrag = () => {
      if (isDragging) {
        isDragging = false;
        if (didMove) {
          sTarget = Math.round(sTarget);
        }
      }
    };
    shelf.addEventListener("pointerup", stopDrag);
    shelf.addEventListener("pointercancel", stopDrag);

    // Click on shelf / tape
    shelf.addEventListener("click", (e) => {
      if (didMove) return;
      const tape = e.target.closest(".tape");
      if (!tape) return;
      const idx = parseInt(tape.dataset.index, 10);
      const r = rel(idx, sTarget, total);
      if (Math.abs(r) < 0.4) {
        const activeItem = allItems[idx];
        if (activeItem.isCoach) {
          document.dispatchEvent(new CustomEvent("epf:coach-open"));
        }
      } else {
        sTarget += r;
      }
    });

    // Mouse wheel: horizontal intent only!
    shelf.addEventListener(
      "wheel",
      (e) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          e.preventDefault();
          sTarget += Math.sign(e.deltaX);
        }
      },
      { passive: false }
    );

    // Keyboard navigation
    shelf.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        sTarget += 1;
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        sTarget -= 1;
      }
    });

    // Flank reveal open / close
    const checkHashOpen = () => {
      if (typeof window !== "undefined" && window.location.hash === "#free-pass") {
        root.classList.add("is-open");
      }
    };

    document.addEventListener("epf:coach-open", () => {
      root.classList.add("is-open");
    });

    window.addEventListener("hashchange", checkHashOpen);
    checkHashOpen();

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        root.classList.remove("is-open");
      });
    }

    let lastActiveIdx = -1;

    return {
      update(dt, scroll) {
        const reduced = prefersReducedMotion();
        if (reduced) {
          s = Math.round(sTarget);
        } else {
          s = damp(s, sTarget, isDragging ? 18 : 5.2, dt);
        }

        // Keep s and sTarget in middle set [5, 9]
        if (!isDragging) {
          if (sTarget >= 10) {
            sTarget -= n;
            s -= n;
          } else if (sTarget < 5) {
            sTarget += n;
            s += n;
          }
        }

        const activeBaseIdx = ((Math.round(s) % n) + n) % n;

        tapeEls.forEach((el, idx) => {
          const r = rel(idx, s, total);
          const tf = tapeTransform(r, dims, XS, { x: 0, y: 0 }, 0);

          if (tf.hidden) {
            el.style.display = "none";
          } else {
            el.style.display = "block";
            el.style.opacity = String(tf.o);
            el.style.transform = `translateX(${tf.x}px) translateY(${tf.y}px) translateZ(${tf.z}px) rotateY(${tf.ry}deg) rotateX(${tf.rx}deg)`;
            el.classList.toggle("is-active", Math.abs(r) < 0.4);
          }
        });

        // Update caption if active item changed
        if (activeBaseIdx !== lastActiveIdx) {
          lastActiveIdx = activeBaseIdx;
          const activeItem = baseItems[activeBaseIdx];
          if (titleEl) titleEl.textContent = activeItem.title;

          if (descEl) {
            if (activeItem.isCoach) {
              descEl.innerHTML = `
                ${activeItem.role} · England Boxing Qualified
                <span class="coach-prompt">Tap card to unlock free session pass →</span>
              `;
            } else {
              const sessions = sessionsForClass(activeItem.key);
              if (sessions.length > 0) {
                const sessionSummary = sessions
                  .slice(0, 3)
                  .map((sess) => `${sess.day.toUpperCase()} ${sess.start || ""}`)
                  .join(" · ");
                descEl.textContent = `Sessions: ${sessionSummary}`;
              } else {
                descEl.textContent = "Weekly structured training sessions";
              }
            }
          }
        }
      },
    };
  },
};
