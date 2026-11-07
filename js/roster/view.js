import { COACH } from "../data/coaches.js";

export const rosterView = {
  init(root) {
    if (!root) return { update() {} };

    // Support smooth focus/scroll on open event
    document.addEventListener("epf:coach-open", () => {
      root.classList.add("is-open");
      root.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return {
      update(dt, scroll) {
        // Coach Ian Walker heroic layout remains stably showcased
      },
    };
  },
};
