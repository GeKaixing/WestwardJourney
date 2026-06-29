import { useCallback, useRef, useEffect } from "react";
import { selectCard, cardToHand, playCard } from "../systems/sounds";

interface DragState {
  cardInstanceId: string;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

export function useCardDragDrop(
  onPlayCard: (cardInstanceId: string, targetIds: string[]) => void,
  getCardTargetType?: (cardInstanceId: string) => string,
) {
  const dragRef = useRef<DragState | null>(null);
  const ghostRef = useRef<HTMLElement | null>(null);
  const draggingRef = useRef(false);

  const clearHighlights = useCallback(() => {
    document.querySelectorAll<HTMLElement>(".character-slot.is-dragOver").forEach((el) => el.classList.remove("is-dragOver"));
  }, []);

  const cleanup = useCallback(() => {
    draggingRef.current = false;
    const g = ghostRef.current;
    ghostRef.current = null;
    dragRef.current = null;
    g?.remove();
    clearHighlights();
  }, [clearHighlights]);

  // Global fallback: if mouseup/cancel fires anywhere during a drag, clean up
  useEffect(() => {
    const onGlobal = () => {
      if (draggingRef.current) cleanup();
    };
    document.addEventListener("pointerup", onGlobal);
    document.addEventListener("pointercancel", onGlobal);
    return () => {
      document.removeEventListener("pointerup", onGlobal);
      document.removeEventListener("pointercancel", onGlobal);
    };
  }, [cleanup]);

  const getTargetElements = useCallback(() => {
    return document.querySelectorAll<HTMLElement>("[data-enemy-id], [data-player-id]");
  }, []);

  const getDropTarget = useCallback((x: number, y: number): string | null => {
    const targets = getTargetElements();
    for (const el of targets) {
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        return el.dataset.enemyId ?? el.dataset.playerId ?? null;
      }
    }
    return null;
  }, [getTargetElements]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>, cardInstanceId: string, disabled: boolean) => {
    if (disabled) return;
    cleanup();

    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    const r = el.getBoundingClientRect();
    dragRef.current = { cardInstanceId, startX: r.left, startY: r.top, offsetX: e.clientX - r.left, offsetY: e.clientY - r.top };

    const ghost = el.cloneNode(true) as HTMLElement;
    ghost.style.margin = "0";
    ghost.style.position = "fixed";
    ghost.style.pointerEvents = "none";
    ghost.style.zIndex = "9999";
    ghost.style.opacity = "0.85";
    ghost.style.transform = "rotate(3deg) scale(1.1)";
    ghost.style.width = `${el.offsetWidth}px`;
    ghost.style.left = `${r.left}px`;
    ghost.style.top = `${r.top}px`;
    ghost.style.transition = "none";
    document.body.appendChild(ghost);
    ghostRef.current = ghost;
    draggingRef.current = true;

    selectCard();
  }, [cleanup]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (!draggingRef.current) return;
    const ghost = ghostRef.current;
    const drag = dragRef.current;
    if (!ghost || !drag) return;
    ghost.style.left = `${e.clientX - drag.offsetX}px`;
    ghost.style.top = `${e.clientY - drag.offsetY}px`;

    clearHighlights();
    const targetId = getDropTarget(e.clientX, e.clientY);
    if (targetId) {
      const sel = targetId === "player" ? `[data-player-id="${targetId}"]` : `[data-enemy-id="${targetId}"] .character-slot`;
      const el = document.querySelector<HTMLElement>(sel);
      el?.classList.add("is-dragOver");
    }
  }, [clearHighlights, getDropTarget]);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (!draggingRef.current) return;
    const drag = dragRef.current;
    const ghost = ghostRef.current;
    cleanup();

    if (ghost && drag) {
      ghost.style.transition = "all 0.2s ease";
      ghost.style.left = `${drag.startX}px`;
      ghost.style.top = `${drag.startY}px`;
      ghost.style.transform = "rotate(0deg) scale(1)";
      ghost.style.opacity = "0.3";
      setTimeout(() => ghost.remove(), 200);
    } else if (ghost) {
      ghost.remove();
    }

    if (drag) {
      const targetId = getDropTarget(e.clientX, e.clientY);
      if (targetId) {
        playCard();
        onPlayCard(drag.cardInstanceId, [targetId]);
      } else {
        const targetType = getCardTargetType?.(drag.cardInstanceId);
        if (targetType === "self" || targetType === "none") {
          playCard();
          onPlayCard(drag.cardInstanceId, ["player"]);
        } else {
          cardToHand();
        }
      }
    }
  }, [cleanup, getDropTarget, getCardTargetType, onPlayCard]);

  const onPointerCancel = useCallback(() => {
    if (draggingRef.current) cleanup();
  }, [cleanup]);

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel };
}
