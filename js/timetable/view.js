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
            (f) => `
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
              <div class="day-header">
                <span class="day-title">${DAY_LABELS[dayKey]}</span>
                <span class="day-count">${daySessions.length} classes</span>
              </div>
              <div class="sessions-list">
                ${daySessions
                  .map((s) => {
                    const color = DISCIPLINE_COLORS[s.discipline] || "#E52E2E";
                    const timeStr = s.start
                      ? `${s.start}${s.end ? " – " + s.end : ""}`
                      : (s.day === "thu" && s.discipline === "ladies" ? "6:00pm" : "Ask at gym");
                    const audStr = s.audience.join(", ");
                    const filterClasses = s.filters.join(" ");
                    const isJunior = s.discipline === "kids" ||
                                     s.discipline === "juniors" ||
                                     s.discipline === "dbg" ||
                                     s.audience.includes("kids") ||
                                     s.audience.includes("juniors") ||
                                     s.title.toLowerCase().includes("kids") ||
                                     s.title.toLowerCase().includes("junior");
                    const rateBadge = isJunior ? "£5 Under 18" : "£7 Adult";
                    const classKey = s.discipline === "ladies"
                      ? "ladies"
                      : s.discipline === "kids" || s.audience.includes("kids") || s.title.toLowerCase().includes("kids")
                      ? "kids"
                      : s.discipline === "juniors" || s.audience.includes("juniors") || s.discipline === "dbg"
                      ? "juniors"
                      : "adults";

                    const levelNote = s.discipline === "squad"
                      ? "Carded boxers & squad training"
                      : isJunior
                      ? "Beginners to competitive juniors"
                      : "All levels welcome · England Boxing";

                    const equipmentNote = s.discipline === "weights"
                      ? "Barbells & free weights available"
                      : s.discipline === "run"
                      ? "Running trainers required"
                      : "Gloves & wraps provided";

                    return `
                      <div
                        class="session session-card-wrapper"
                        id="${s.id}"
                        role="button"
                        tabindex="0"
                        aria-label="${s.title} on ${DAY_LABELS[s.day]} at ${timeStr}. Rate: ${rateBadge}. Claim free pass."
                        data-filters="${filterClasses}"
                        data-class-key="${classKey}"
                        style="--discipline-color: ${color};"
                      >
                        <div class="session-card-3d">
                          <!-- Front Face -->
                          <div class="card-front">
                            <div class="card-front-top">
                              <div class="session-time-row">
                                <span class="session-time">${timeStr}</span>
                                <span class="session-rate-badge">${rateBadge}</span>
                              </div>
                              <div class="session-title">${s.title}</div>
                              <div class="session-audience">${audStr}</div>
                            </div>
                            <div class="card-front-bottom">
                              <span class="session-badge">Free pass eligible</span>
                              <span class="flip-hint" aria-hidden="true">
                                <span class="flip-icon">↻</span>
                                <span>Hover / Tap</span>
                              </span>
                            </div>
                          </div>

                          <!-- Back Face (Rotated 180deg) -->
                          <div class="card-back">
                            <div class="card-back-top">
                              <div class="card-back-meta">
                                <span class="card-discipline-tag" style="color: ${color};">${s.discipline.toUpperCase()}</span>
                                <span class="card-back-time">${timeStr}</span>
                              </div>
                              <div class="card-back-title">${s.title}</div>
                              <div class="card-details-grid">
                                <div class="detail-row">
                                  <span class="detail-key">Coach:</span>
                                  <span class="detail-val">Ian Walker</span>
                                </div>
                                <div class="detail-row">
                                  <span class="detail-key">Gear:</span>
                                  <span class="detail-val">${equipmentNote}</span>
                                </div>
                                <div class="detail-row">
                                  <span class="detail-key">Level:</span>
                                  <span class="detail-val">${levelNote}</span>
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              class="claim-pass-btn"
                              aria-label="Claim free session pass for ${s.title}"
                            >
                              <span>Claim Free Session</span>
                              <span class="btn-arrow" aria-hidden="true">→</span>
                            </button>
                          </div>
                        </div>
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
    const dayColumns = Array.from(root.querySelectorAll(".day-column"));

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
          el.style.display = "block";
        } else {
          el.style.display = "none";
        }
      });

      dayColumns.forEach((col) => {
        const visibleSessions = col.querySelectorAll(".session:not([style*='display: none'])");
        if (key !== "all" && visibleSessions.length === 0) {
          col.style.display = "none";
        } else {
          col.style.display = "flex";
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
      const card3d = el.querySelector(".session-card-3d");
      const claimBtn = el.querySelector(".claim-pass-btn");

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

      if (claimBtn) {
        claimBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          triggerPass();
        });
      }

      el.addEventListener("click", (e) => {
        const isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
        if (isTouch) {
          if (e.target.closest(".claim-pass-btn")) {
            triggerPass();
          } else {
            const wasFlipped = card3d.classList.contains("flipped");
            root.querySelectorAll(".session-card-3d.flipped").forEach((c) => {
              if (c !== card3d) c.classList.remove("flipped");
            });
            if (wasFlipped) {
              card3d.classList.remove("flipped");
            } else {
              card3d.classList.add("flipped");
            }
          }
          return;
        }

        // Desktop click on card triggers pass
        triggerPass();
      });

      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          triggerPass();
        }
      });
    });
  },
};
