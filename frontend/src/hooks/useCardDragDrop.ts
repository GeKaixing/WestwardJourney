import { useCallback, useRef } from "react";
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
  const isDisabledRef = useRef(false);

  const getEnemyElements = useCallback(() => {
    return document.querySelectorAll<HTMLElement>("[data-enemy-id]");
  }, []);

  const getDropTarget = useCallback((x: number, y: number): string | null => {
    const enemies = getEnemyElements();
    for (const el of enemies) {
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        return el.dataset.enemyId ?? null;
      }
    }
    return null;
  }, [getEnemyElements]);

  const clearHighlights = useCallback(() => {
    getEnemyElements().forEach((el) => el.classList.remove("is-dragOver"));
  }, [getEnemyElements]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>, cardInstanceId: string, disabled: boolean) => {
    if (disabled) return;
    isDisabledRef.current = false;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const r = (e.target as HTMLElement).getBoundingClientRect();
    dragRef.current = { cardInstanceId, startX: r.left, startY: r.top, offsetX: e.clientX - r.left, offsetY: e.clientY - r.top };

    const ghost = (e.target as HTMLElement).cloneNode(true) as HTMLElement;
    ghost.style.position = "fixed";
    ghost.style.pointerEvents = "none";
    ghost.style.zIndex = "9999";
    ghost.style.opacity = "0.85";
    ghost.style.transform = "rotate(3deg) scale(1.1)";
    ghost.style.width = `${r.width}px`;
    ghost.style.left = `${r.left}px`;
    ghost.style.top = `${r.top}px`;
    ghost.style.transition = "none";
    document.body.appendChild(ghost);
    ghostRef.current = ghost;

    selectCard();
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (!dragRef.current || !ghostRef.current) return;
    ghostRef.current.style.left = `${e.clientX - dragRef.current.offsetX}px`;
    ghostRef.current.style.top = `${e.clientY - dragRef.current.offsetY}px`;

    clearHighlights();
    const targetId = getDropTarget(e.clientX, e.clientY);
    if (targetId) {
      const el = document.querySelector<HTMLElement>(`[data-enemy-id="${targetId}"]`);
      el?.classList.add("is-dragOver");
    }
  }, [clearHighlights, getDropTarget]);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    const ghost = ghostRef.current;
    dragRef.current = null;
    ghostRef.current = null;
    clearHighlights();

    if (ghost) {
      ghost.style.transition = "all 0.2s ease";
      if (drag) {
        ghost.style.left = `${drag.startX}px`;
        ghost.style.top = `${drag.startY}px`;
        ghost.style.transform = "rotate(0deg) scale(1)";
        ghost.style.opacity = "0.3";
      }
      setTimeout(() => ghost.remove(), 200);
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
  }, [clearHighlights, getDropTarget, onPlayCard]);

  return { onPointerDown, onPointerMove, onPointerUp };
}
