import type { AtlasRegion } from "./types";
import { ART_AREA, CARD_HEIGHT, CARD_WIDTH, PORTRAIT_BORDER } from "./constants";
import { drawAtlasRegion } from "./canvasDraw";

const PIXEL_COUNT = CARD_WIDTH * CARD_HEIGHT;

export function createPortraitMask(
  atlasImg: CanvasImageSource,
  portraitRegion: AtlasRegion["region"],
): HTMLCanvasElement {
  const probe = document.createElement("canvas");
  probe.width = CARD_WIDTH;
  probe.height = CARD_HEIGHT;
  const probeCtx = probe.getContext("2d");
  if (!probeCtx) return probe;

  probeCtx.fillStyle = "#fff";
  probeCtx.fillRect(ART_AREA.x, ART_AREA.y, ART_AREA.w, ART_AREA.h);
  probeCtx.globalCompositeOperation = "destination-out";
  drawAtlasRegion(
    probeCtx,
    atlasImg,
    portraitRegion,
    PORTRAIT_BORDER.x,
    PORTRAIT_BORDER.y,
    PORTRAIT_BORDER.w,
    PORTRAIT_BORDER.h,
  );

  const data = probeCtx.getImageData(0, 0, CARD_WIDTH, CARD_HEIGHT).data;
  const centerX = Math.floor(ART_AREA.x + ART_AREA.w / 2);
  const centerY = Math.floor(ART_AREA.y + ART_AREA.h / 2);
  let seed = centerY * CARD_WIDTH + centerX;

  if (seed < 0 || seed >= PIXEL_COUNT || (data[seed * 4 + 3] ?? 0) <= 120) {
    let found = false;
    for (let radius = 1; radius <= 80 && !found; radius++) {
      for (let dy = -radius; dy <= radius && !found; dy++) {
        for (let dx = -radius; dx <= radius && !found; dx++) {
          const x = centerX + dx;
          const y = centerY + dy;
          if (x < 0 || x >= CARD_WIDTH || y < 0 || y >= CARD_HEIGHT) continue;
          const idx = y * CARD_WIDTH + x;
          if ((data[idx * 4 + 3] ?? 0) > 120) {
            seed = idx;
            found = true;
          }
        }
      }
    }
  }

  const mask = document.createElement("canvas");
  mask.width = CARD_WIDTH;
  mask.height = CARD_HEIGHT;
  const maskCtx = mask.getContext("2d");
  if (!maskCtx) return mask;

  const visited = new Uint8Array(PIXEL_COUNT);
  if ((data[seed * 4 + 3] ?? 0) > 120) {
    const queue = [seed];
    visited[seed] = 1;
    for (let i = 0; i < queue.length; i++) {
      const idx = queue[i]!;
      const row = Math.floor(idx / CARD_WIDTH);
      const col = idx - row * CARD_WIDTH;
      const neighbors = [
        col > 0 ? idx - 1 : -1,
        col < CARD_WIDTH - 1 ? idx + 1 : -1,
        row > 0 ? idx - CARD_WIDTH : -1,
        row < CARD_HEIGHT - 1 ? idx + CARD_WIDTH : -1,
      ];
      for (const next of neighbors) {
        if (next < 0 || visited[next] || (data[next * 4 + 3] ?? 0) <= 120) continue;
        visited[next] = 1;
        queue.push(next);
      }
    }
  }

  const imageData = maskCtx.createImageData(CARD_WIDTH, CARD_HEIGHT);
  let hasPixels = false;
  for (let i = 0; i < PIXEL_COUNT; i++) {
    if (!visited[i]) continue;
    hasPixels = true;
    const offset = i * 4;
    imageData.data[offset] = 255;
    imageData.data[offset + 1] = 255;
    imageData.data[offset + 2] = 255;
    imageData.data[offset + 3] = 255;
  }

  maskCtx.putImageData(imageData, 0, 0);
  if (!hasPixels) {
    maskCtx.fillStyle = "#fff";
    maskCtx.fillRect(ART_AREA.x, ART_AREA.y, ART_AREA.w, ART_AREA.h);
  }

  return mask;
}
