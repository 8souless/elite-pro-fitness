import { clamp } from "../core/math.js";

/**
 * Mathematical models for the Leon Vasari 3D curved VHS carousel.
 */

export function rel(v, s, n) {
  let d = (v - s) % n;
  if (d < -n / 2) d += n;
  if (d >= n / 2) d -= n;
  return d;
}

export function B(r) {
  if (Math.abs(r) < 1) {
    return (r + Math.sin(Math.PI * r) / Math.PI) / 2;
  }
  return Math.sign(r) * 0.5;
}

export function F(r, { ws, d, gap }) {
  return r * (ws + gap) + (d - ws + 1.4 * gap) * B(r);
}

export function scl(u, U) {
  return 1 / (1 + Math.pow(Math.abs(u) / U, 1.6));
}

export function buildXS(U) {
  const maxU = 3 * U;
  const step = 2;
  const count = Math.ceil(maxU / step) + 1;
  const xs = new Float32Array(count);
  xs[0] = 0;

  for (let i = 1; i < count; i++) {
    const u = i * step;
    xs[i] = xs[i - 1] + (2 / (1 + Math.pow(u / U, 1.6)));
  }

  return xs;
}

export function xsc(u, XS) {
  const au = Math.abs(u);
  const step = 2;
  const idx = Math.min(Math.floor(au / step), XS.length - 2);
  const frac = (au / step) - idx;
  const val = XS[idx] + frac * (XS[idx + 1] - XS[idx]);
  return Math.sign(u) * val;
}

export function tapeTransform(r, dims, XS, tilt = { x: 0, y: 0 }, lift = 0) {
  const u = F(r, dims);
  const x = xsc(u, XS) + (tilt.x || 0) * -12;
  const y = (tilt.y || 0) * 12 - lift;
  const z = (1 - Math.min(1, Math.abs(r))) * 120;

  const b = B(r);
  const ry = -90 * (1 - 2 * Math.abs(b)) + r * 16;
  const rx = (tilt.y || 0) * -8;

  // Fade out tapes past r = 2.4
  const o = clamp(1 - (Math.abs(r) - 2.2) / 0.7, 0, 1);
  const hidden = o <= 0.01;

  const shadeSpine = clamp(Math.abs(b) * 1.5, 0, 1);
  const shadeCover = clamp(1 - Math.abs(b) * 1.8, 0, 1);

  return {
    x,
    y,
    z,
    ry,
    rx,
    o,
    shadeSpine,
    shadeCover,
    hidden,
  };
}
