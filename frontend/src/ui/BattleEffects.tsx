import { useEffect, useRef } from "react";
import { Application, Container, Text, TextStyle, Graphics } from "pixi.js";
import { effectBus } from "../systems/effects/effectBus";

interface DamageNumber {
  text: Text;
  life: number;
  maxLife: number;
  startY: number;
}

interface HitFlash {
  circle: Graphics;
  life: number;
  maxLife: number;
}

export function BattleEffects() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const app = new Application();
    let inited = false;
    let unsubs: (() => void)[] = [];
    const damageNumbers: DamageNumber[] = [];
    const hitFlashes: HitFlash[] = [];

    const w = window.innerWidth;
    const h = window.innerHeight;

    app
      .init({
        backgroundAlpha: 0,
        width: w,
        height: h,
        antialias: true,
      })
      .then(() => {
        if (!wrapper.parentElement) {
          app.destroy({ removeView: true }, { children: true, texture: true });
          return;
        }
        wrapper.appendChild(app.canvas);
        app.canvas.style.position = "fixed";
        app.canvas.style.top = "0";
        app.canvas.style.left = "0";
        app.canvas.style.width = "100%";
        app.canvas.style.height = "100%";
        inited = true;

        const layer = new Container();
        app.stage.addChild(layer);

        unsubs = [
          effectBus.on("damage", (dataRaw) => {
            const data = dataRaw as { targetId: string; amount: number };
            const el = document.querySelector(`[data-enemy-id="${data.targetId}"]`) as HTMLElement | null;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top - 20;
            spawnDamageNumber(layer, x, y, data.amount, damageNumbers);
            spawnHitFlash(layer, x, y + 40, hitFlashes);
          }),

          effectBus.on("hit-player", (dataRaw) => {
            const data = dataRaw as { amount: number };
            const x = window.innerWidth * 0.25;
            const y = window.innerHeight * 0.35;
            spawnDamageNumber(layer, x, y, data.amount, damageNumbers);
            spawnHitFlash(layer, x, y, hitFlashes);
          }),
        ];

        app.ticker.add(() => {
          updateDamageNumbers(layer, damageNumbers);
          updateHitFlashes(layer, hitFlashes);
        });
      })
      .catch(console.error);

    return () => {
      unsubs.forEach((fn) => fn());
      if (inited) {
        app.destroy({ removeView: true }, { children: true, texture: true });
      }
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="absolute inset-0 z-50 pointer-events-none"
    />
  );
}

function spawnDamageNumber(
  layer: Container,
  x: number,
  y: number,
  amount: number,
  pool: DamageNumber[],
) {
  const text = new Text({
    text: `-${amount}`,
    style: new TextStyle({
      fontFamily: "serif",
      fontSize: 36,
      fontWeight: "bold",
      fill: 0xff4444,
      stroke: { color: 0x000000, width: 5 },
      dropShadow: { color: 0x000000, blur: 3, distance: 2 },
    }),
  });
  text.anchor.set(0.5, 1);
  text.position.set(x, y);
  layer.addChild(text);
  pool.push({ text, life: 0, maxLife: 50, startY: y });
}

function spawnHitFlash(layer: Container, x: number, y: number, pool: HitFlash[]) {
  const circle = new Graphics();
  circle.circle(0, 0, 8).fill({ color: 0xffffff, alpha: 0.9 });
  circle.position.set(x, y);
  layer.addChild(circle);
  pool.push({ circle, life: 0, maxLife: 15 });
}

function updateDamageNumbers(layer: Container, pool: DamageNumber[]) {
  for (let i = pool.length - 1; i >= 0; i--) {
    const dn = pool[i]!;
    dn.life++;
    const progress = dn.life / dn.maxLife;
    dn.text.position.y = dn.startY - progress * 80;
    dn.text.alpha = 1 - progress;
    if (dn.life >= dn.maxLife) {
      layer.removeChild(dn.text);
      dn.text.destroy();
      pool.splice(i, 1);
    }
  }
}

function updateHitFlashes(layer: Container, pool: HitFlash[]) {
  for (let i = pool.length - 1; i >= 0; i--) {
    const hf = pool[i]!;
    hf.life++;
    const progress = hf.life / hf.maxLife;
    const scale = 1 + progress * 3;
    hf.circle.scale.set(scale);
    hf.circle.alpha = 1 - progress;
    if (hf.life >= hf.maxLife) {
      layer.removeChild(hf.circle);
      hf.circle.destroy();
      pool.splice(i, 1);
    }
  }
}
