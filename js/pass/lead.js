/**
 * Lead dispatch service: endpoint submission or mailto fallback.
 */

export const LEAD_CONFIG = {
  endpoint: null,
  email: "elitepro121@gmail.com",
};

export async function submitLead(lead) {
  // Test seam override
  if (typeof window !== "undefined" && typeof window.__epfSubmitOverride === "function") {
    return window.__epfSubmitOverride(lead);
  }

  if (LEAD_CONFIG.endpoint) {
    try {
      const res = await fetch(LEAD_CONFIG.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
      return { ok: res.ok, via: "endpoint" };
    } catch (err) {
      console.warn("Lead POST failed, falling back to mailto:", err);
    }
  }

  // Mailto fallback
  if (typeof window !== "undefined") {
    const subject = encodeURIComponent(`Free session pass: ${lead.name}`);
    const body = encodeURIComponent(
      `Name: ${lead.name}\nEmail: ${lead.email}\nClass: ${lead.classKey}\nPass ID: ${lead.passId || "N/A"}\nIssued: ${new Date().toISOString()}`
    );
    window.location.href = `mailto:${LEAD_CONFIG.email}?subject=${subject}&body=${body}`;
  }

  return { ok: true, via: "mailto" };
}
