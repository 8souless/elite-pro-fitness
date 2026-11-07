import { damp } from "../core/math.js";
import { sectionProgress, prefersReducedMotion } from "../core/progress.js";
import { heroState } from "./timeline.js";
import { createEmblemScene } from "./emblem.js";
import { createDust } from "./dust.js";
import { sessionsForClass } from "../data/timetable.js";

export const hero = {
  init(root) {
    if (!root) return { update() {} };

    const stageEl = root.querySelector(".hero-stage");
    const glCanvas = root.querySelector("canvas#gl");
    const dustCanvas = root.querySelector("canvas#dust");
    const facadeEl = root.querySelector("#facade");
    const dollyDoorEl = root.querySelector("#dollyDoor");
    const dollyCorridorEl = root.querySelector("#dollyCorridor");
    const foreEl = root.querySelector("#fore");
    const word0El = root.querySelector("#word0");
    const word1El = root.querySelector("#word1");
    const pinEl = root.querySelector("#pin");
    const progListEl = root.querySelector("ul#programmes");
    const cardEl = root.querySelector("#card");
    const cardImg = cardEl ? cardEl.querySelector("img") : null;
    const fogEl = root.querySelector("#fog");
    const interiorEl = root.querySelector("#interior");
    const ringTitleEl = root.querySelector("#ringTitle");
    const ropesWrapEl = root.querySelector(".hero-ropes-wrap");
    const barEl = root.querySelector("form#bar");
    const classSelect = barEl ? barEl.querySelector("select[name='class']") : null;
    const daySelect = barEl ? barEl.querySelector("select[name='day']") : null;
    const quoteEl = root.querySelector("#quote");
    const dimEl = root.querySelector("#dim");
    const hintEl = root.querySelector("#hint");

    // Init WebGL Emblem
    let emblemScene = null;
    if (glCanvas) {
      emblemScene = createEmblemScene(glCanvas, "assets/brand/epf-emblem.webp");
    }
    root.dataset.webgl = emblemScene ? "on" : "off";

    // Init Dust Particles
    const dust = dustCanvas ? createDust(dustCanvas) : null;

    // Pointer Parallax state
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    window.addEventListener("pointermove", (e) => {
      const halfW = window.innerWidth / 2 || 1;
      const halfH = window.innerHeight / 2 || 1;
      pointer.targetX = (e.clientX - halfW) / halfW;
      pointer.targetY = (e.clientY - halfH) / halfH;
    });

    // Populate bar day select
    function updateDayOptions(selectedClass) {
      if (!daySelect) return;
      const dayNames = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };
      const sessions = sessionsForClass(selectedClass);
      if (sessions.length === 0) {
        daySelect.innerHTML = `<option value="Flexible">Open 12–9pm Mon–Sat</option>`;
        return;
      }
      daySelect.innerHTML = sessions.map((s) => {
        const d = dayNames[s.day] || s.day;
        const t = s.start ? `${s.start}` : "TBD";
        const label = `${d} ${t} (${s.title})`;
        return `<option value="${label}">${label}</option>`;
      }).join("");
    }

    if (classSelect) {
      updateDayOptions(classSelect.value);
      classSelect.addEventListener("change", () => updateDayOptions(classSelect.value));
    }

    if (barEl) {
      barEl.addEventListener("submit", (e) => {
        e.preventDefault();
        const classKey = classSelect ? classSelect.value : "adults";
        const day = daySelect ? daySelect.value : "";
        document.dispatchEvent(
          new CustomEvent("epf:prefill-pass", {
            detail: { classKey, day },
          })
        );
        const freePassSection = document.querySelector("#free-pass");
        if (freePassSection) {
          freePassSection.scrollIntoView({ behavior: "smooth" });
        }
      });
    }

    // Programme list interactions
    if (progListEl) {
      progListEl.querySelectorAll("li a").forEach((item) => {
        const progKey = item.dataset.prog;
        const targetZone = item.dataset.target || item.dataset.zone;

        function showCard() {
          if (cardEl && cardImg && progKey) {
            cardImg.src = `assets/gen/prog-${progKey}.webp`;
            cardEl.style.opacity = "1";
          }
        }

        item.addEventListener("mouseenter", showCard);
        item.addEventListener("focus", showCard);

        item.addEventListener("click", (e) => {
          if (targetZone) {
            e.preventDefault();
            const zoneTarget = document.querySelector(`[data-zone="${targetZone}"]`);
            if (zoneTarget) zoneTarget.scrollIntoView({ behavior: "smooth" });
          }
        });
      });

      if (cardEl) {
        progListEl.addEventListener("mouseleave", () => {
          cardEl.style.opacity = "0";
        });
      }
    }

    // Resize handler
    function handleResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (emblemScene) emblemScene.resize(w, h);
      if (dust) dust.resize(w, h);
    }
    window.addEventListener("resize", handleResize);
    handleResize();

    let curP = 0;
    const startTime = performance.now();

    return {
      update(dt, scroll) {
        const rect = root.getBoundingClientRect();
        const rawP = sectionProgress(rect.top, rect.height, scroll.vh);
        const reduced = prefersReducedMotion();
        const portrait = scroll.vh > scroll.vw;

        // Jump instantly on deep link / large jump or reduced motion
        if (reduced || Math.abs(rawP - curP) > 0.25) {
          curP = rawP;
        } else {
          curP = damp(curP, rawP, 8, dt);
        }

        // Pointer easing
        pointer.x = damp(pointer.x, pointer.targetX, 6, dt);
        pointer.y = damp(pointer.y, pointer.targetY, 6, dt);

        const age = (performance.now() - startTime) * 0.001;
        const state = heroState(curP, { portrait, reduced, age });

        // Update hero stage dataset
        document.documentElement.dataset.heroStage = String(state.stage);

        // Parallax factors
        const pFac = reduced ? 0 : pointer.x;
        const pxSmall = pFac * -14;
        const pxLarge = pFac * -46;

        // Render layers
        if (facadeEl) {
          facadeEl.style.opacity = String(state.facadeOpacity);
          facadeEl.style.transform = reduced
            ? "none"
            : `scale(${state.facadeScale}) translateX(${pxSmall}px)`;
        }

        if (dollyDoorEl) {
          dollyDoorEl.style.opacity = String(state.dollyDoorOpacity || 0);
          dollyDoorEl.style.transform = reduced
            ? "none"
            : `scale(${state.dollyDoorScale || 1}) translateX(${pxSmall}px)`;
        }

        if (dollyCorridorEl) {
          dollyCorridorEl.style.opacity = String(state.dollyCorridorOpacity || 0);
          dollyCorridorEl.style.transform = reduced
            ? "none"
            : `scale(${state.dollyCorridorScale || 1}) translateX(${pxSmall}px)`;
        }

        if (foreEl) {
          foreEl.style.transform = reduced
            ? "none"
            : `scale(${state.foreScale}) translateY(${state.foreY * scroll.vh}px) translateX(${pxLarge}px)`;
        }

        if (word0El) {
          word0El.style.opacity = String(state.wordOpacity);
          if (state.wordClip > 0) {
            word0El.style.clipPath = `inset(0 ${state.wordClip}% 0 ${state.wordClip}%)`;
          } else {
            word0El.style.clipPath = "none";
          }
        }

        if (word1El) {
          word1El.style.opacity = String(state.word1Opacity);
        }

        if (pinEl) {
          pinEl.style.opacity = String(state.pinOpacity);
        }

        if (progListEl) {
          progListEl.style.opacity = String(state.listOpacity);
        }

        if (fogEl) {
          fogEl.style.opacity = String(state.fog);
        }

        if (interiorEl) {
          interiorEl.style.opacity = String(state.interiorOpacity != null ? state.interiorOpacity : (state.stage >= 2 ? 1 : state.fog));
          interiorEl.style.transform = reduced
            ? "none"
            : `scale(${state.interiorScale}) translateY(${state.interiorY * scroll.vh}px) translateX(${pxSmall}px)`;
        }

        if (ringTitleEl) {
          ringTitleEl.style.opacity = String(state.ringTitleOpacity);
          ringTitleEl.style.transform = reduced
            ? "none"
            : `translateY(${state.ringTitleY * scroll.vh}px)`;
        }

        if (ropesWrapEl) {
          ropesWrapEl.style.opacity = String(state.ropesOpacity);
          ropesWrapEl.style.transform = reduced
            ? "none"
            : `scale(${state.ropesScale}) translateY(${state.ropesY * scroll.vh}px) translateX(${pxLarge}px)`;
        }

        if (barEl) {
          barEl.style.opacity = String(state.barOpacity);
          barEl.style.pointerEvents = state.barOpacity > 0.05 ? "auto" : "none";
        }

        if (quoteEl) {
          quoteEl.style.opacity = String(state.quoteOpacity);
        }

        if (dimEl) {
          dimEl.style.opacity = String(state.dim || 0);
        }

        if (glCanvas) {
          glCanvas.style.opacity = String(state.emblemOpacity != null ? state.emblemOpacity : 1);
        }

        if (hintEl) {
          hintEl.style.opacity = curP < 0.05 ? "1" : "0";
        }

        // WebGL emblem
        if (emblemScene) {
          emblemScene.render(state, pointer);
        }

        // Dust canvas
        if (dust) {
          const dustMul = state.stage === 2 ? 0.7 : 1;
          dust.draw(age, dustMul);
        }
      },
    };
  },
};
