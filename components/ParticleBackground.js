// components/ParticleBackground.js
import { useEffect, useRef } from 'react';

export default function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animId;

    const mouse = { x: width / 2, y: height / 2 };

    // Colour palette — violet / blue / cyan / pink
    const PARTICLE_COLORS = ['#7c3aed', '#3b82f6', '#06b6d4', '#ec4899', '#a855f7', '#60a5fa'];
    const MOUSE_REPEL_RADIUS = 120;
    const CONNECTION_MAX_DISTANCE = 130;
    const PARTICLE_DENSITY_FACTOR = 8000;
    const MAX_PARTICLE_COUNT = 130;

    // ---------- Particle class ----------
    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : Math.random() * height;
        this.z = Math.random(); // 0 = far, 1 = near — depth illusion
        this.baseSize = 0.5 + this.z * 3;
        this.size = this.baseSize;
        this.color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
        this.alpha = 0.2 + this.z * 0.6;
        this.vx = (Math.random() - 0.5) * 0.4 * (0.3 + this.z);
        this.vy = (Math.random() - 0.5) * 0.4 * (0.3 + this.z);
        this.twinkle = Math.random() * Math.PI * 2;
        this.twinkleSpeed = 0.02 + Math.random() * 0.04;
      }

      update() {
        // Mouse repulsion
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repelRadius = MOUSE_REPEL_RADIUS;
        if (dist < repelRadius) {
          const force = ((repelRadius - dist) / repelRadius) * 1.5;
          this.x += (dx / dist) * force;
          this.y += (dy / dist) * force;
        }

        this.x += this.vx;
        this.y += this.vy;
        this.twinkle += this.twinkleSpeed;
        this.alpha = (0.2 + this.z * 0.6) * (0.7 + 0.3 * Math.sin(this.twinkle));

        if (this.x < -10) this.x = width + 10;
        if (this.x > width + 10) this.x = -10;
        if (this.y < -10) this.y = height + 10;
        if (this.y > height + 10) this.y = -10;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8 + this.z * 10;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // ---------- Create particles ----------
    const PARTICLE_COUNT = Math.min(MAX_PARTICLE_COUNT, Math.floor((width * height) / PARTICLE_DENSITY_FACTOR));
    const particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());

    // ---------- Draw connections ----------
    const MAX_DIST = CONNECTION_MAX_DISTANCE;
    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < MAX_DIST) {
            const alpha = (1 - d / MAX_DIST) * 0.25 * Math.min(a.alpha, b.alpha);
            ctx.save();
            ctx.globalAlpha = alpha;
            const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            grad.addColorStop(0, a.color);
            grad.addColorStop(1, b.color);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.5 + (1 - d / MAX_DIST) * 0.8;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    }

    // ---------- Animate ----------
    function animate() {
      ctx.clearRect(0, 0, width, height);
      drawConnections();
      for (const p of particles) {
        p.update();
        p.draw();
      }
      animId = requestAnimationFrame(animate);
    }

    animate();

    // ---------- Resize handler ----------
    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    // ---------- Mouse handler ----------
    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    // ---------- Touch handler ----------
    const onTouchMove = (e) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
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
