import { createParticles } from "./particles.js";
import { prefersReducedMotion } from "../core/progress.js";

const ZONE_PARTICLES = {
  juniors: { kind: "chalk", count: 50 },
  ladies: { kind: "ember", count: 40 },
  adults: { kind: "spray", count: 60 },
  squad: { kind: "chalk", count: 40 },
  community: { kind: "ember", count: 30 },
};

export const descent = {
  init(root) {
    if (!root) return { update() {} };

    const zones = Array.from(root.querySelectorAll("[data-zone]"));
    const particleInstances = [];

    const zoneRecords = zones.map((zoneEl) => {
      const zoneName = zoneEl.dataset.zone;
      const bgEl = zoneEl.querySelector(".zone-bg");
      const canvasEl = zoneEl.querySelector(".zone-canvas");
      const copyEl = zoneEl.querySelector(".copy");
      const videoEl = zoneEl.querySelector(".reel video");

      let pInst = null;
      if (canvasEl) {
        const cfg = ZONE_PARTICLES[zoneName] || { kind: "chalk", count: 40 };
        pInst = createParticles(canvasEl, cfg.kind, cfg.count);
        particleInstances.push(pInst);
      }

      return {
        zoneEl,
        bgEl,
        canvasEl,
        copyEl,
        videoEl,
        pInst,
      };
    });

    // Attach particle handles to window.__epf
    window.__epf = window.__epf || {};
    window.__epf.particles = particleInstances;

    // Resize handler
    function handleResize() {
      zoneRecords.forEach(({ canvasEl, pInst }) => {
        if (canvasEl && pInst) {
          pInst.resize(canvasEl.clientWidth, canvasEl.clientHeight);
        }
      });
    }
    window.addEventListener("resize", handleResize);
    handleResize();

    const startTime = performance.now();

    return {
      update(dt, scroll) {
        const reduced = prefersReducedMotion();
        const t = (performance.now() - startTime) * 0.001;

        zoneRecords.forEach(({ zoneEl, bgEl, canvasEl, copyEl, videoEl, pInst }) => {
          const r = zoneEl.getBoundingClientRect();
          const inView = r.bottom >= -50 && r.top <= scroll.vh + 50;

          // Background plate parallax
          if (bgEl && !reduced) {
            const py = r.top * -0.12;
            bgEl.style.transform = `translateY(${py}px)`;
          }

          // Ambient particles
          if (pInst) {
            pInst.draw(t, inView);
          }

          // Hollowmere Copy Reveal: trigger once when top passes 80% vh
          if (copyEl && copyEl.dataset.revealed !== "1") {
            const copyRect = copyEl.getBoundingClientRect();
            if (copyRect.top <= scroll.vh * 0.8) {
              copyEl.dataset.revealed = "1";
            }
          }

          // Reel play / pause while intersecting
          if (videoEl) {
            const videoInView = r.top <= scroll.vh && r.bottom >= 0;
            if (videoInView) {
              if (videoEl.paused) {
                videoEl.play().catch(() => {
                  // Fallback: poster remains visible
                });
              }
            } else {
              if (!videoEl.paused) {
                videoEl.pause();
              }
            }
          }
        });
      },
    };
  },
};
