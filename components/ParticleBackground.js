// components/ParticleBackground.js
// 3-D animated mesh wave — pure canvas, no extra deps
import { useEffect, useRef } from 'react';

export default function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return () => {};
    const ctx = canvas.getContext('2d');

    let width  = (canvas.width  = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animId;
    let time = 0;

    const mouse = { x: width / 2, y: height / 2 };

    // ── Animation / wave config ───────────────────────────────
    const ANIMATION_SPEED   = 0.007;
    const WAVE_FREQ_COL     = 0.38;
    const WAVE_FREQ_ROW     = 0.38;
    const WAVE_FREQ_DIAG    = 0.28;
    const WAVE_AMP_PRIMARY  = 70;
    const WAVE_AMP_SECONDARY = 50;
    const WAVE_AMP_DIAGONAL = 35;
    const WAVE_AMP_MOUSE    = 60;
    const WAVE_SPEED_1      = 1.4;
    const WAVE_SPEED_2      = 1.1;
    const WAVE_SPEED_3      = 0.8;
    const WAVE_SPEED_MOUSE  = 1.2;
    const MOUSE_WAVE_SCALE  = 2.5;
    const COLS = 22;
    const ROWS = 16;
    const PERSPECTIVE = 900;
    const CAMERA_Z    = 350;

    // Electric-cyan palette
    const COLOR_NEAR = '#00e5ff';
    const COLOR_MID  = '#0891b2';
    const COLOR_FAR  = '#011a22';

    // ── Helpers ──────────────────────────────────────────────
    function lerpColor(hex1, hex2, t) {
      const parse = (h) => [
        parseInt(h.slice(1, 3), 16),
        parseInt(h.slice(3, 5), 16),
        parseInt(h.slice(5, 7), 16),
      ];
      const [r1, g1, b1] = parse(hex1);
      const [r2, g2, b2] = parse(hex2);
      return `rgb(${Math.round(r1+(r2-r1)*t)},${Math.round(g1+(g2-g1)*t)},${Math.round(b1+(b2-b1)*t)})`;
    }

    function project(x, y, z) {
      const scale = PERSPECTIVE / (PERSPECTIVE + z + CAMERA_Z);
      return { sx: width/2 + x*scale, sy: height/2 + y*scale, scale };
    }

    // ── Build grid ───────────────────────────────────────────
    const spacing = Math.min(width, height) / Math.min(COLS, ROWS) * 1.2;
    const totalW  = (COLS - 1) * spacing;
    const totalH  = (ROWS - 1) * spacing;

    const pts = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        pts.push({
          bx: col * spacing - totalW / 2,
          by: row * spacing - totalH / 2,
          z: 0,
          col,
          row,
        });
      }
    }

    // ── Animate ───────────────────────────────────────────────
    function animate() {
      ctx.clearRect(0, 0, width, height);
      time += ANIMATION_SPEED;

      const mx = (mouse.x - width  / 2) / (width  / 2);
      const my = (mouse.y - height / 2) / (height / 2);

      // Update Z with layered waves + mouse influence
      for (const p of pts) {
        const { col, row } = p;
        const w1 = Math.sin(col * WAVE_FREQ_COL  + time * WAVE_SPEED_1) * WAVE_AMP_PRIMARY;
        const w2 = Math.cos(row * WAVE_FREQ_ROW  + time * WAVE_SPEED_2) * WAVE_AMP_SECONDARY;
        const w3 = Math.sin((col + row) * WAVE_FREQ_DIAG + time * WAVE_SPEED_3) * WAVE_AMP_DIAGONAL;
        const wm = Math.sin(col * mx * MOUSE_WAVE_SCALE + row * my * MOUSE_WAVE_SCALE + time * WAVE_SPEED_MOUSE) * WAVE_AMP_MOUSE;
        p.z = w1 + w2 + w3 + wm;
      }

      // Draw grid lines
      function drawLine(a, b) {
        const pa = project(a.bx, a.by, a.z);
        const pb = project(b.bx, b.by, b.z);
        const t  = Math.max(0, Math.min(1, (((a.z + b.z) / 2) + 200) / 400));
        ctx.save();
        ctx.globalAlpha = 0.06 + t * 0.45;
        ctx.strokeStyle  = t > 0.55 ? lerpColor(COLOR_MID, COLOR_NEAR, (t - 0.55) / 0.45)
                                     : lerpColor(COLOR_FAR, COLOR_MID, t / 0.55);
        ctx.lineWidth    = 0.4 + t * 0.9;
        ctx.beginPath();
        ctx.moveTo(pa.sx, pa.sy);
        ctx.lineTo(pb.sx, pb.sy);
        ctx.stroke();
        ctx.restore();
      }

      // Horizontal
      for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS - 1; c++)
          drawLine(pts[r * COLS + c], pts[r * COLS + c + 1]);

      // Vertical
      for (let c = 0; c < COLS; c++)
        for (let r = 0; r < ROWS - 1; r++)
          drawLine(pts[r * COLS + c], pts[(r + 1) * COLS + c]);

      // Draw glowing nodes at intersections
      for (const p of pts) {
        const { sx, sy, scale } = project(p.bx, p.by, p.z);
        const t = Math.max(0, Math.min(1, (p.z + 200) / 400));
        if (t < 0.3) continue;
        ctx.save();
        ctx.globalAlpha  = 0.15 + t * 0.65;
        ctx.fillStyle    = lerpColor(COLOR_MID, COLOR_NEAR, t);
        ctx.shadowColor  = COLOR_NEAR;
        ctx.shadowBlur   = t * 12;
        ctx.beginPath();
        ctx.arc(sx, sy, (0.6 + t * 1.8) * scale * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(animate);
    }

    animate();

    // ── Event handlers ────────────────────────────────────────
    const onResize = () => {
      width  = canvas.width  = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    const onMouseMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onTouchMove = (e) => {
      if (e.touches.length > 0) { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; }
    };

    window.addEventListener('resize',    onResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize',    onResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
