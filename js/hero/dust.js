/**
 * 2D Canvas dust particles following Redline spec:
 * 34 motes, warm chalk/ember tones drifting across the scene.
 */

export function createDust(canvas) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { draw() {}, resize() {} };

  let width = canvas.clientWidth || window.innerWidth;
  let height = canvas.clientHeight || window.innerHeight;

  const count = 34;
  const motes = [];

  for (let i = 0; i < count; i++) {
    motes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 1,
      vx: (Math.random() - 0.5) * 12,
      vy: -(Math.random() * 15 + 8),
      seed: Math.random() * 100,
      opacity: Math.random() * 0.6 + 0.3,
    });
  }

  return {
    resize(w, h) {
      width = w;
      height = h;
      canvas.width = w;
      canvas.height = h;
    },
    draw(t, alphaMul = 1) {
      if (alphaMul <= 0.01) return;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < count; i++) {
        const m = motes[i];
        // Drift
        const waveX = Math.sin(t * 0.5 + m.seed) * 8;
        const cx = (m.x + waveX + width) % width;
        const cy = ((m.y + t * m.vy) % height + height) % height;

        const rad = m.size * 2;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        const a = m.opacity * alphaMul;
        grad.addColorStop(0, `rgba(255, 214, 170, ${a * 0.95})`);
        grad.addColorStop(0.4, `rgba(229, 46, 46, ${a * 0.35})`);
        grad.addColorStop(1, `rgba(9, 9, 12, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  };
}
