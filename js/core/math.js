/**
 * Core mathematical utilities for scroll timelines and animations.
 */

export function clamp(v, a = 0, b = 1) {
  return Math.min(b, Math.max(a, v));
}

export function mix(a, b, t) {
  return a + (b - a) * t;
}

export function seg(p, a, b) {
  if (a === b) return 0;
  return clamp((p - a) / (b - a), 0, 1);
}

export function io(k) {
  const t = clamp(k, 0, 1);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function out(k) {
  const t = clamp(k, 0, 1);
  return 1 - Math.pow(1 - t, 3);
}

export function smoothstep(k) {
  const x = clamp(k, 0, 1);
  return x * x * (3 - 2 * x);
}

export function damp(cur, target, rate, dt) {
  return cur + (target - cur) * (1 - Math.exp(-rate * dt));
}
