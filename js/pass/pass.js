/**
 * Lead validation & pass ID generation.
 */

const ALLOWED_CLASSES = new Set(["kids", "juniors", "adults", "ladies"]);
const PASS_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function validateLead({ name = "", email = "", classKey = "" } = {}) {
  const errors = {};

  const cleanName = String(name || "").trim().replace(/\s+/g, " ");
  if (cleanName.length < 2 || cleanName.length > 60) {
    errors.name = "Please enter your name.";
  }

  const cleanEmail = String(email || "").trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(cleanEmail)) {
    errors.email = "Please enter a valid email.";
  }

  const cleanClass = String(classKey || "").trim().toLowerCase();
  if (!ALLOWED_CLASSES.has(cleanClass)) {
    errors.classKey = "Please choose a class.";
  }

  const ok = Object.keys(errors).length === 0;

  return {
    ok,
    errors,
    value: {
      name: cleanName,
      email: cleanEmail,
      classKey: cleanClass,
    },
  };
}

export function makePassId(date = new Date(), rand = Math.random) {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  let code = "";
  for (let i = 0; i < 4; i++) {
    const idx = Math.floor(rand() * PASS_ALPHABET.length);
    code += PASS_ALPHABET[idx];
  }

  return `EPF-${yy}${mm}${dd}-${code}`;
}
