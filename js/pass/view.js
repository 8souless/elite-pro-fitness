import { validateLead, makePassId } from "./pass.js";
import { submitLead } from "./lead.js";
import { sessionsForClass } from "../data/timetable.js";

const CLASS_TITLES = {
  kids: "Kids Boxing (Ages 5–10)",
  juniors: "Junior Boxing (Ages 11–17)",
  adults: "Adult Boxing & Fitness",
  ladies: "Ladies Only Boxing",
};

export const passView = {
  init(root) {
    if (!root) return;

    root.innerHTML = `
      <div class="pass-form-wrap">
        <div class="pass-punch-badge">
          <span class="badge-dot"></span>
          <span>Admit One · Free Session Pass</span>
        </div>
        <h2 class="pass-form-title">Sign Up to Claim Your Free Pass</h2>
        <p class="pass-form-sub">Experience authentic England Boxing training at South Birmingham ABC with 1 complimentary session. Zero obligation.</p>
        <form class="pass-form" novalidate>
          <div class="form-group">
            <label for="pass-name">Full Name</label>
            <input type="text" id="pass-name" name="name" required placeholder="e.g. Sam Walker">
            <span class="form-error" id="name-error"></span>
          </div>
          <div class="form-group">
            <label for="pass-email">Email Address</label>
            <input type="email" id="pass-email" name="email" required placeholder="e.g. sam@example.com">
            <span class="form-error" id="email-error"></span>
          </div>
          <div class="form-group">
            <label for="pass-phone">Phone Number (Optional)</label>
            <input type="tel" id="pass-phone" name="phone" placeholder="e.g. 07534 444 063">
            <span class="form-error" id="phone-error"></span>
          </div>
          <div class="form-group">
            <label for="pass-class">Select Training Class</label>
            <select id="pass-class" name="classKey">
              <option value="adults">Adult Boxing & Fitness</option>
              <option value="juniors">Junior Boxing (11-17)</option>
              <option value="kids">Kids Boxing (5-10)</option>
              <option value="ladies">Ladies Only Boxing</option>
            </select>
            <span class="form-error" id="class-error"></span>
          </div>
          <button type="submit" class="btn-primary pass-submit-btn">
            <span>Generate Free Session Pass</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
          <div class="pass-security-note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <span>Instant cryptographic pass generated. Show on arrival at 201A Merritts Brook Lane.</span>
          </div>
        </form>
      </div>

      <div class="pass-ticket-wrap" style="display: none;"></div>
    `;

    const formWrap = root.querySelector(".pass-form-wrap");
    const ticketWrap = root.querySelector(".pass-ticket-wrap");
    const form = root.querySelector("form.pass-form");
    const nameInput = form.querySelector("[name='name']");
    const emailInput = form.querySelector("[name='email']");
    const phoneInput = form.querySelector("[name='phone']");
    const classSelect = form.querySelector("[name='classKey']");
    const submitBtn = form.querySelector("button[type='submit']");
    const nameError = form.querySelector("#name-error");
    const emailError = form.querySelector("#email-error");
    const classError = form.querySelector("#class-error");

    let isSubmitting = false;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Prevent double submits immediately
      if (isSubmitting || submitBtn.disabled) return;
      isSubmitting = true;
      submitBtn.disabled = true;

      // Reset errors
      nameError.textContent = "";
      nameError.classList.remove("is-visible");
      emailError.textContent = "";
      emailError.classList.remove("is-visible");
      classError.textContent = "";
      classError.classList.remove("is-visible");

      const val = validateLead({
        name: nameInput.value,
        email: emailInput.value,
        classKey: classSelect.value,
        phone: phoneInput?.value || "",
      });

      if (!val.ok) {
        isSubmitting = false;
        submitBtn.disabled = false;
        if (val.errors.name) {
          nameError.textContent = val.errors.name;
          nameError.classList.add("is-visible");
        }
        if (val.errors.email) {
          emailError.textContent = val.errors.email;
          emailError.classList.add("is-visible");
        }
        if (val.errors.classKey) {
          classError.textContent = val.errors.classKey;
          classError.classList.add("is-visible");
        }
        return;
      }

      const now = new Date();
      const passId = makePassId(now, () => {
        const buf = new Uint32Array(1);
        crypto.getRandomValues(buf);
        return buf[0] / (0xffffffff + 1);
      });

      renderTicket(val.value, passId, now);

      // Submit lead in background
      submitLead({ ...val.value, passId }).catch((err) => {
        console.warn("Lead dispatch error:", err);
      });
    });

    function renderTicket(lead, passId, date) {
      const longDate = date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const sessions = sessionsForClass(lead.classKey).slice(0, 3);
      const sessionListHtml = sessions
        .map((s) => `<li>${s.day.toUpperCase()} ${s.start || ""} – ${s.title}</li>`)
        .join("");

      ticketWrap.innerHTML = `
        <div class="ticket">
          <div class="ticket-header">
            <span class="ticket-badge">ADMIT ONE · FREE SESSION</span>
            <span class="ticket-id">${passId}</span>
          </div>

          <div class="ticket-body">
            <div class="name"></div>
            <div class="ticket-class">${CLASS_TITLES[lead.classKey] || lead.classKey}</div>

            <div class="ticket-details">
              <p><strong>Venue:</strong> 201A Merritts Brook Lane, Northfield, B31 1UH</p>
              <p><strong>Issued:</strong> ${longDate}</p>
              <p><strong>Valid For:</strong> 1 Complimentary Training Session</p>
              ${
                sessions.length > 0
                  ? `<div class="suggested-sessions">
                      <p><strong>Recommended Next Sessions:</strong></p>
                      <ul style="padding-left: 18px; margin-top: 4px;">${sessionListHtml}</ul>
                    </div>`
                  : ""
              }
            </div>
          </div>

          <div class="ticket-actions">
            <button type="button" class="btn-download-pass">Save Pass (.PNG)</button>
            <button type="button" class="btn-reset-pass">Start Again</button>
          </div>
        </div>
      `;

      // Crucial security requirement: user name rendered safely via textContent
      const nameEl = ticketWrap.querySelector(".ticket .name");
      if (nameEl) {
        nameEl.textContent = lead.name;
      }

      formWrap.classList.add("is-hidden");
      ticketWrap.style.display = "block";

      const downloadBtn = ticketWrap.querySelector(".btn-download-pass");
      if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
          downloadPassPng(lead, passId, longDate);
        });
      }

      const resetBtn = ticketWrap.querySelector(".btn-reset-pass");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          isSubmitting = false;
          submitBtn.disabled = false;
          form.reset();
          formWrap.classList.remove("is-hidden");
          ticketWrap.style.display = "none";
        });
      }
    }

    function downloadPassPng(lead, passId, dateStr) {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext("2d");

      // Dark background
      ctx.fillStyle = "#09090C";
      ctx.fillRect(0, 0, 1200, 630);

      // Card boundary
      ctx.fillStyle = "#121318";
      ctx.fillRect(40, 40, 1120, 550);

      // Crimson stripe
      ctx.fillStyle = "#E52E2E";
      ctx.fillRect(40, 40, 16, 550);

      // Header
      ctx.font = "bold 28px sans-serif";
      ctx.fillStyle = "#F5A623";
      ctx.fillText("ADMIT ONE · FREE SESSION", 90, 110);

      // Pass ID
      ctx.font = "24px monospace";
      ctx.fillStyle = "#9A9BA8";
      ctx.fillText(passId, 850, 110);

      // Guest Name
      ctx.font = "bold 48px sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(lead.name.slice(0, 36), 90, 200);

      // Class
      ctx.font = "bold 26px sans-serif";
      ctx.fillStyle = "#E52E2E";
      ctx.fillText(CLASS_TITLES[lead.classKey] || lead.classKey, 90, 260);

      // Venue & Info
      ctx.font = "22px sans-serif";
      ctx.fillStyle = "#CCCCCC";
      ctx.fillText("Elite Pro Fitness · 201A Merritts Brook Lane, Northfield, B31 1UH", 90, 340);
      ctx.fillText(`Issued: ${dateStr} · England Boxing Affiliated · South Birmingham ABC`, 90, 380);

      const link = document.createElement("a");
      link.download = `EPF-guest-pass-${passId}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }

    // Prefill listener from Hero Bar & Timetable
    document.addEventListener("epf:prefill-pass", (e) => {
      const { classKey } = e.detail || {};
      if (classKey && classSelect) {
        classSelect.value = classKey;
      }
      if (nameInput) {
        nameInput.focus();
      }

      const coachSection = document.querySelector("#coach");
      if (coachSection) {
        coachSection.classList.add("is-open");
      }
    });

    document.addEventListener("epf:coach-open", () => {
      const coachSection = document.querySelector("#coach");
      if (coachSection) {
        coachSection.classList.add("is-open");
      }
      if (nameInput) {
        nameInput.focus();
      }
    });
  },
};
