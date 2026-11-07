/**
 * Specialized ambient particle emitters for training zones:
 * - chalk: Soft white/cool dust motes
 * - ember: Crimson & gold glowing specks
 * - spray: High-velocity micro sweat droplets
 */

export function createParticles(canvas, kind = "chalk", count = 40) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return {
      draw() {},
      drawCount: 0,
      resize() {},
    };
  }

  let width = canvas.clientWidth || 800;
  let height = canvas.clientHeight || 600;

  const particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: kind === "spray" ? Math.random() * 1.5 + 0.5 : Math.random() * 2.5 + 1,
      vx: (Math.random() - 0.5) * (kind === "spray" ? 30 : 10),
      vy: kind === "spray" ? Math.random() * 35 + 20 : -(Math.random() * 18 + 8),
      seed: Math.random() * 200,
      opacity: Math.random() * 0.6 + 0.25,
    });
  }

  const inst = {
    drawCount: 0,
    resize(w, h) {
      width = w;
      height = h;
      canvas.width = w;
      canvas.height = h;
    },
    draw(t, visible = true) {
      if (!visible) return;
      inst.drawCount++;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < count; i++) {
        const p = particles[i];
        const cx = (p.x + Math.sin(t * 0.4 + p.seed) * 12 + width) % width;
        const cy = ((p.y + t * p.vy) % height + height) % height;

        ctx.beginPath();
        ctx.arc(cx, cy, p.size, 0, Math.PI * 2);

        if (kind === "ember") {
          ctx.fillStyle = i % 2 === 0
            ? `rgba(245, 166, 35, ${p.opacity})`
            : `rgba(229, 46, 46, ${p.opacity})`;
          ctx.shadowBlur = 4;
          ctx.shadowColor = "rgba(229, 46, 46, 0.5)";
        } else if (kind === "spray") {
          ctx.fillStyle = `rgba(230, 240, 255, ${p.opacity * 0.8})`;
          ctx.shadowBlur = 0;
        } else {
          // chalk
          ctx.fillStyle = `rgba(240, 240, 255, ${p.opacity * 0.6})`;
          ctx.shadowBlur = 0;
        }

        ctx.fill();
      }
    },
  };

  return inst;
}
