import { SESSIONS, FILTERS, DISCIPLINE_COLORS, groupByDay, nextSession } from "../data/timetable.js";

const DAY_LABELS = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export const timetableView = {
  init(root) {
    if (!root) return;

    let activeFilter = "all";
    const grouped = groupByDay(SESSIONS);
    const next = nextSession(SESSIONS, new Date());

    const nextText = next
      ? `Next Session: <strong>${DAY_LABELS[next.day]} ${next.start || ""} · ${next.title}</strong>`
      : "Open 12–9pm Mon–Sat";

    root.innerHTML = `
      <div class="timetable-container">
        <div class="timetable-header">
          <h2>Weekly Schedule</h2>
          <p>England Boxing Affiliated Studio · Open 12–9pm Mon–Sat</p>
          <div class="next-session-ribbon">
            <span class="pulse-dot"></span>
            <span>${nextText}</span>
          </div>
        </div>

        <div class="timetable-tabs" role="tablist" aria-label="Filter timetable by category">
          ${FILTERS.map(
            (f, idx) => `
            <button
              class="timetable-tab"
              role="tab"
              id="tab-${f.key}"
              aria-selected="${f.key === activeFilter ? "true" : "false"}"
              tabindex="${f.key === activeFilter ? "0" : "-1"}"
              data-filter="${f.key}"
            >${f.label}</button>
          `
          ).join("")}
        </div>

        <div class="timetable-grid">
          ${Object.entries(grouped)
            .map(([dayKey, daySessions]) => `
            <div class="day-column" data-day="${dayKey}">
              <div class="day-title">${DAY_LABELS[dayKey]}</div>
              <div class="sessions-list">
                ${daySessions
                  .map((s) => {
                    const color = DISCIPLINE_COLORS[s.discipline] || "#E52E2E";
                    const timeStr = s.start
                      ? `${s.start}${s.end ? " – " + s.end : ""}`
                      : (s.day === "thu" && s.discipline === "ladies" ? "6:00pm" : "Ask at gym");
                    const audStr = s.audience.join(", ");
                    const filterClasses = s.filters.join(" ");
                    const classKey = s.discipline === "ladies"
                      ? "ladies"
                      : s.discipline === "kids" || s.audience.includes("kids") || s.title.toLowerCase().includes("kids")
                      ? "kids"
                      : s.discipline === "juniors" || s.audience.includes("juniors") || s.discipline === "dbg"
                      ? "juniors"
                      : "adults";

                    return `
                      <div
                        class="session"
                        id="${s.id}"
                        role="button"
                        tabindex="0"
                        aria-label="Claim free session pass for ${s.title}"
                        data-filters="${filterClasses}"
                        data-class-key="${classKey}"
                        style="--discipline-color: ${color};"
                      >
                        <div class="session-time">${timeStr}</div>
                        <div class="session-title">${s.title}</div>
                        <div class="session-audience">${audStr}</div>
                        <span class="session-badge">Free pass eligible</span>
                      </div>
                    `;
                  })
                  .join("")}
              </div>
            </div>
          `)
            .join("")}
        </div>
      </div>
    `;

    const tabs = Array.from(root.querySelectorAll(".timetable-tab"));
    const sessionEls = Array.from(root.querySelectorAll(".session"));

    function applyFilter(key) {
      activeFilter = key;
      tabs.forEach((tab) => {
        const isMatch = tab.dataset.filter === key;
        tab.setAttribute("aria-selected", isMatch ? "true" : "false");
        tab.setAttribute("tabindex", isMatch ? "0" : "-1");
      });

      sessionEls.forEach((el) => {
        const filters = el.dataset.filters ? el.dataset.filters.split(" ") : [];
        if (key === "all" || filters.includes(key)) {
          el.style.display = "flex";
        } else {
          el.style.display = "none";
        }
      });
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        applyFilter(tab.dataset.filter);
      });

      tab.addEventListener("keydown", (e) => {
        let newIndex = null;
        if (e.key === "ArrowRight") {
          newIndex = (index + 1) % tabs.length;
        } else if (e.key === "ArrowLeft") {
          newIndex = (index - 1 + tabs.length) % tabs.length;
        }

        if (newIndex !== null) {
          e.preventDefault();
          tabs[newIndex].focus();
          applyFilter(tabs[newIndex].dataset.filter);
        }
      });
    });

    sessionEls.forEach((el) => {
      const triggerPass = () => {
        const classKey = el.dataset.classKey || "adults";
        document.dispatchEvent(
          new CustomEvent("epf:prefill-pass", {
            detail: {
              classKey,
              sessionTitle: el.querySelector(".session-title")?.textContent,
            },
          })
        );
        const passTarget = document.querySelector("#free-pass");
        if (passTarget) {
          passTarget.scrollIntoView({ behavior: "smooth" });
        }
      };

      el.addEventListener("click", triggerPass);
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          triggerPass();
        }
      });
    });
  },
};
