import { seg, io, out, mix, clamp } from "../core/math.js";

/**
 * Pure timeline evaluation for the Redline scroll-driven hero.
 *
 * @param {number} p - Normalized scroll progress in hero [0, 1]
 * @param {Object} [opts] - Configuration options
 * @param {boolean} [opts.portrait] - Whether viewport is in portrait mode
 * @param {boolean} [opts.reduced] - Whether prefers-reduced-motion is active
 * @param {number} [opts.age] - Seconds since hero mounted (for opening growth animation)
 * @returns {HeroState}
 */
export function heroState(p, opts = {}) {
  const normP = clamp(p, 0, 1);
  const portrait = !!opts.portrait;
  const reduced = !!opts.reduced;
  const age = opts.age != null ? opts.age : 9;

  const a = seg(normP, 0, 0.22);
  const d = io(seg(normP, 0.40, 0.62));
  const l = out(seg(normP, 0.60, 0.82));
  const r = out(seg(normP, 0.64, 0.84));
  const k = io(seg(normP, 0.88, 1));
  const grow = out(seg(age, 0, 1.5));
  const iw = out(seg(age, 0.75, 1.7));

  const stage = normP < 0.2 ? 0 : normP < 0.5 ? 1 : normP < 0.88 ? 2 : 3;

  const emblemX = portrait ? 0.5 : mix(0.5, 0.34, a);
  const emblemY = portrait ? mix(0.4, 0.33, a) : 0.5;
  const emblemOpacity = 1 - seg(normP, 0.40, 0.50);

  const wordOpacity = 1 - seg(a, 0.1, 0.5);
  const wordClip = (1 - iw) * 50; // inset % from center

  const facadeOpacity = seg(normP, 0.04, 0.2);
  const word1Opacity = seg(a, 0.45, 1) * (1 - seg(normP, 0.40, 0.46));
  const listOpacity = seg(a, 0.55, 1) * (1 - seg(normP, 0.40, 0.45));
  const pinOpacity = seg(a, 0.3, 0.8) * (1 - seg(normP, 0.40, 0.44));

  const dollyDoorOpacity = seg(normP, 0.38, 0.45) * (1 - seg(normP, 0.52, 0.58));
  const dollyDoorScale = mix(1.0, 1.25, io(seg(normP, 0.38, 0.58)));
  const dollyCorridorOpacity = seg(normP, 0.50, 0.57) * (1 - seg(normP, 0.64, 0.70));
  const dollyCorridorScale = mix(1.0, 1.25, io(seg(normP, 0.50, 0.70)));

  const fog = seg(normP, 0.50, 0.58) * (1 - seg(normP, 0.66, 0.80));

  const ringTitleOpacity = seg(normP, 0.64, 0.72) * (1 - seg(normP, 0.88, 0.94));
  const ropesOpacity = 1 - seg(normP, 0.96, 1);
  const barOpacity = seg(normP, 0.76, 0.86) * (1 - seg(normP, 0.88, 0.92));
  const quoteOpacity = seg(normP, 0.89, 0.93) * (1 - seg(normP, 0.975, 1));
  const dim = 0;

  if (reduced) {
    return {
      stage,
      emblemScale: 1,
      emblemX,
      emblemY,
      emblemOpacity,
      wordOpacity,
      wordClip: 0,
      facadeOpacity,
      facadeScale: 1,
      foreY: 0,
      foreScale: 1,
      word1Opacity,
      listOpacity,
      pinOpacity,
      dollyDoorOpacity,
      dollyDoorScale: 1,
      dollyCorridorOpacity,
      dollyCorridorScale: 1,
      fog,
      interiorY: 0,
      interiorScale: 1,
      ringTitleY: 0.27,
      ringTitleOpacity,
      ropesY: 0,
      ropesScale: 1,
      ropesOpacity,
      barOpacity,
      quoteOpacity,
      dim,
    };
  }

  const emblemScale = mix(0.03, 1, grow) * (1 + a * 0.04) * Math.exp(d * 2.2);
  const facadeScale = mix(1.15, 1, a) * Math.exp(d * 2.6);
  const foreY = mix(0.35, 0, a);
  const foreScale = Math.exp(d * 3.4);
  const interiorY = mix(0.2, 0, l);
  const interiorScale = mix(1.3, 1.05, l) * (1 + k * 0.6);
  const ringTitleY = mix(0.62, 0.27, out(seg(normP, 0.66, 0.84)));
  const ropesY = mix(0.42, 0, r);
  const ropesScale = 1 + k * 2.4;

  return {
    stage,
    emblemScale,
    emblemX,
    emblemY,
    emblemOpacity,
    wordOpacity,
    wordClip,
    facadeOpacity,
    facadeScale,
    foreY,
    foreScale,
    word1Opacity,
    listOpacity,
    pinOpacity,
    dollyDoorOpacity,
    dollyDoorScale,
    dollyCorridorOpacity,
    dollyCorridorScale,
    fog,
    interiorY,
    interiorScale,
    ringTitleY,
    ringTitleOpacity,
    ropesY,
    ropesScale,
    ropesOpacity,
    barOpacity,
    quoteOpacity,
    dim,
  };
}
