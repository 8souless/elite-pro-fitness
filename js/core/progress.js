import { clamp } from "./math.js";

/**
 * Calculates normalized scroll progress [0, 1] through a tall section.
 * When the section top is at the top of viewport (rectTop = 0), progress is 0.
 * When the section bottom reaches the bottom of viewport (rectTop = -(rectHeight - vh)), progress is 1.
 * If section is shorter than viewport (rectHeight <= vh), returns 0.
 */
export function sectionProgress(rectTop, rectHeight, vh) {
  const travel = rectHeight - vh;
  if (travel <= 0) return 0;
  return clamp(-rectTop / travel, 0, 1);
}

export function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Creates an animation frame loop coordinating multiple controllers.
 * Protects against buggy controllers by catching and disabling ones that throw.
 */
export function createLoop(controllers = []) {
  let rafId = null;
  let lastTime = 0;
  const activeList = [...controllers];
  const disabled = new Set();

  function tick(now) {
    if (!lastTime) lastTime = now;
    const rawDt = (now - lastTime) / 1000;
    const dt = Math.min(rawDt, 0.05);
    lastTime = now;

    const scroll = {
      y: typeof window !== "undefined" ? window.scrollY : 0,
      vh: typeof window !== "undefined" ? window.innerHeight : 0,
      vw: typeof window !== "undefined" ? window.innerWidth : 0,
    };

    for (const ctrl of activeList) {
      if (disabled.has(ctrl)) continue;
      try {
        if (typeof ctrl.update === "function") {
          ctrl.update(dt, scroll);
        }
      } catch (err) {
        console.error("Controller update failed and was deactivated:", ctrl, err);
        disabled.add(ctrl);
      }
    }

    rafId = requestAnimationFrame(tick);
  }

  return {
    start() {
      if (rafId === null) {
        lastTime = 0;
        rafId = requestAnimationFrame(tick);
      }
    },
    stop() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    },
  };
}
