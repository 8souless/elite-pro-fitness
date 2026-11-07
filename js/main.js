import { createLoop } from "./core/progress.js";
import { hero } from "./hero/hero.js";
import { descent } from "./descent/descent.js";
import { timetableView } from "./timetable/view.js";
import { rosterView } from "./roster/view.js";
import { passView } from "./pass/view.js";

export function initApp() {
  if (window.__epfInitialized) return;
  window.__epfInitialized = true;

  const heroRoot = document.querySelector("#hero");
  const heroController = hero.init(heroRoot);

  const classesRoot = document.querySelector("#classes");
  const descentController = descent.init(classesRoot);

  const timetableRoot = document.querySelector("#timetable");
  timetableView.init(timetableRoot);

  const coachRoot = document.querySelector("#coach");
  const rosterController = rosterView.init(coachRoot);

  const passRoot = document.querySelector("#free-pass");
  passView.init(passRoot);

  const controllers = [heroController, descentController, rosterController];

  window.__epf = window.__epf || {};
  window.__epf.controllers = controllers;

  // Intercept all links targeting #free-pass to ensure flank reveals
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href='#free-pass']");
    if (link) {
      document.dispatchEvent(new CustomEvent("epf:coach-open"));
    }
  });

  const loop = createLoop(controllers);
  loop.start();

  console.log("EPF Cinematic Gateway mounted with Roster Arc");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
