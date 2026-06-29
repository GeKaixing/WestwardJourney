import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Application, Container } from "pixi.js";
import { CharacterClass } from "@shared/enums/CharacterClass";
import { FrameSequenceSprite } from "../systems/sprites/FrameSequenceSprite";

const CHAR_TO_SPRITE: Record<CharacterClass, string> = {
  [CharacterClass.BoneDragon]: "hero_bone_dragon",
  [CharacterClass.ImmortalDragon]: "hero_fairy_dragon",
  [CharacterClass.Longsila]: "hero_dragzilla",
  [CharacterClass.DemonDragon]: "hero_magic_dragon",
  [CharacterClass.StormDragon]: "hero_storm_dragon",
};

export interface PlayerCharacterHandle {
  triggerAttack: () => void;
  isReady: () => boolean;
  getStage: () => Container | null;
}

export interface PlayerCharacterProps {
  characterClass: CharacterClass;
  onReady?: () => void;
  onError?: () => void;
}

export const PlayerCharacter = forwardRef<PlayerCharacterHandle, PlayerCharacterProps>(
  function PlayerCharacter({ characterClass, onReady, onError }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const seqRef = useRef<FrameSequenceSprite | null>(null);
    const appRef = useRef<Application | null>(null);
    const readyRef = useRef(false);
    const [failed, setFailed] = useState(false);

    const triggerAttack = () => {
      const seq = seqRef.current;
      if (!seq) return;
      seq.play("attack", false);
    };

    useImperativeHandle(ref, () => ({
      triggerAttack,
      isReady: () => readyRef.current,
      getStage: () => appRef.current?.stage ?? null,
    }), []);

    useEffect(() => {
      if (!containerRef.current) return;
      const el = containerRef.current;

      let app: Application | null = null;
      let destroyed = false;
      let inited = false;

      const reposition = () => {
        const seq = seqRef.current;
        const slot = document.querySelector('[data-player-id="player"]');
        if (!slot || !seq) return;
        const rect = slot.getBoundingClientRect();
        const b = seq.displayContainer.getBounds();
        const slotSize = Math.min(rect.width, rect.height);
        const scale = (slotSize * 0.75) / (b.width || 1);
        seq.displayContainer.scale.set(scale);
        const nb = seq.displayContainer.getBounds();
        seq.displayContainer.x = rect.left + (rect.width - nb.width) / 2 - nb.x;
        seq.displayContainer.y = rect.top + (rect.height - nb.height) / 2 - nb.y;
      };

      const onResize = () => {
        if (app && !destroyed) {
          app.renderer.resize(window.innerWidth, window.innerHeight);
          reposition();
        }
      };

      (async () => {
        app = new Application();
        await app.init({
          width: window.innerWidth,
          height: window.innerHeight,
          backgroundAlpha: 0,
          antialias: true,
        });
        inited = true;
        if (destroyed) return;

        const canvas = app.canvas as HTMLCanvasElement;
        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.pointerEvents = "none";
        el.appendChild(canvas);
        appRef.current = app;

        const spriteId = CHAR_TO_SPRITE[characterClass];
        if (!spriteId) { setFailed(true); onError?.(); return; }

        const seq = new FrameSequenceSprite();
        seq.onComplete = () => {
          if (seq.currentAnimation === "attack") seq.play("idle", true);
        };

        try {
          await seq.load(spriteId);
        } catch (e) {
          if (destroyed) return;
          console.error("PlayerCharacter frame load failed:", e);
          seq.destroy();
          setFailed(true);
          onError?.();
          return;
        }
        if (destroyed) { seq.destroy(); return; }

        app.stage.addChild(seq.displayContainer);
        seq.play("idle", true);
        seqRef.current = seq;
        reposition();
        readyRef.current = true;
        onReady?.();

        window.addEventListener("resize", onResize);
      })();

      return () => {
        destroyed = true;
        window.removeEventListener("resize", onResize);
        readyRef.current = false;
        seqRef.current = null;
        appRef.current = null;
        if (app) {
          if (inited) {
            const canvas = app.canvas as HTMLCanvasElement | undefined;
            app.destroy(true, { children: true, texture: true });
            if (canvas?.parentNode) canvas.parentNode.removeChild(canvas);
          }
          app = null;
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [characterClass]);

    if (failed) return null;

    return (
      <div
        ref={containerRef}
        className="pointer-events-none absolute inset-0 z-10"
        aria-hidden={true}
      />
    );
  },
);
