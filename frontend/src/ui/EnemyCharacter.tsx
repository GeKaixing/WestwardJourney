import { useEffect, useRef } from "react";
import { type Container } from "pixi.js";
import { FrameSequenceSprite } from "../systems/sprites/FrameSequenceSprite";

export function EnemyCharacter({
  stage,
  enemyId,
  spriteId,
}: {
  stage: Container;
  enemyId: string;
  spriteId?: string;
}) {
  const seqRef = useRef<FrameSequenceSprite | null>(null);

  useEffect(() => {
    if (!spriteId) return;
    let destroyed = false;

    const reposition = () => {
      const el = document.querySelector(`[data-enemy-id="${enemyId}"]`);
      const seq = seqRef.current;
      if (!el || !seq) return;
      const rect = el.getBoundingClientRect();
      const b = seq.displayContainer.getBounds();
      const slotSize = Math.min(rect.width, rect.height);
      const scale = (slotSize * 0.9) / (b.width || 1);
      seq.displayContainer.scale.set(-scale, scale);
      const nb = seq.displayContainer.getBounds();
      seq.displayContainer.x = rect.left + (rect.width - nb.width) / 2 - nb.x;
      seq.displayContainer.y = rect.top + (rect.height - nb.height) / 2 - nb.y;
    };

    (async () => {
      const seq = new FrameSequenceSprite();
      seq.onComplete = () => {
        if (seq.currentAnimation !== "idle" && seq.currentAnimation !== "walk" && seq.currentAnimation !== "victory") {
          seq.play("idle", true);
        }
      };

      try {
        await seq.load(spriteId);
      } catch {
        return;
      }
      if (destroyed) { seq.destroy(); return; }

      stage.addChild(seq.displayContainer);
      seq.play("idle", true);
      seqRef.current = seq;
      reposition();
      window.addEventListener("resize", reposition);
    })();

    return () => {
      destroyed = true;
      window.removeEventListener("resize", reposition);
      if (seqRef.current) {
        seqRef.current.displayContainer.removeFromParent();
        seqRef.current.destroy();
        seqRef.current = null;
      }
    };
  }, [stage, enemyId, spriteId]);

  return null;
}