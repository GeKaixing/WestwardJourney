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
  color: string;
}

const COLORS = [
  "rgba(200, 200, 220, {a})", // 骨龙 — 苍白
  "rgba(255, 215, 100, {a})", // 仙龙 — 金色
  "rgba(100, 130, 255, {a})", // 龙斯拉 — 深蓝
  "rgba(255, 80, 80, {a})",   // 魔龙 — 赤红
  "rgba(100, 220, 255, {a})", // 风暴龙 — 青
  "rgba(180, 100, 255, {a})", // 龙晶 — 紫
];

export function Particles({ count = 60 }: { count?: number }) {
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

    for (let i = 0; i < count; i++) {
      particles.push(createParticle(canvas.width, canvas.height));
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
        ctx.fillStyle = p.color.replace("{a}", String(p.alpha));
        ctx.fill();

        if (p.life >= p.maxLife) {
          particles[i] = createParticle(canvas.width, canvas.height);
        }
      }

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
    />
  );
}

function createParticle(w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.5,
    vy: -Math.random() * 0.8 - 0.2,
    size: Math.random() * 3 + 1,
    alpha: 0,
    life: 0,
    maxLife: Math.random() * 200 + 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
  };
}
