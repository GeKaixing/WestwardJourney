import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  r: number;
  g: number;
  b: number;
}

const COLORS = [
  { r: 200, g: 200, b: 220 }, // 骨龙 — 苍白
  { r: 255, g: 215, b: 100 }, // 仙龙 — 金色
  { r: 100, g: 130, b: 255 }, // 龙斯拉 — 深蓝
  { r: 255, g: 80, b: 80 },   // 魔龙 — 赤红
  { r: 100, g: 220, b: 255 }, // 风暴龙 — 青
];

export function Particles({ count = 60, color }: { count?: number; color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const baseColor = color ? parseColor(color) : null;

    for (let i = 0; i < count; i++) {
      particles.push(createParticle(canvas.width, canvas.height, baseColor));
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]!;
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        const progress = p.life / p.maxLife;
        p.alpha = Math.sin(progress * Math.PI) * 0.6;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.alpha})`;
        ctx.fill();

        if (p.life >= p.maxLife) {
          particles[i] = createParticle(canvas.width, canvas.height, baseColor);
        }
      }

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [count, color]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
    />
  );
}

function parseColor(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function createParticle(w: number, h: number, baseColor: { r: number; g: number; b: number } | null): Particle {
  const c = baseColor ?? COLORS[Math.floor(Math.random() * COLORS.length)]!;
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.5,
    vy: -Math.random() * 0.8 - 0.2,
    size: Math.random() * 3 + 1,
    alpha: 0,
    life: 0,
    maxLife: Math.random() * 200 + 100,
    r: c.r,
    g: c.g,
    b: c.b,
  };
}
