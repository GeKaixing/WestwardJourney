import type { HsvAdjust } from "./types";
import { CARD_HEIGHT, CARD_WIDTH } from "./constants";

function processPixels(
  data: Uint8ClampedArray,
  adjust: (r: number, g: number, b: number) => [number, number, number],
): void {
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const [r, g, b] = adjust((data[i] ?? 0) / 255, (data[i + 1] ?? 0) / 255, (data[i + 2] ?? 0) / 255);
    data[i] = Math.max(0, Math.min(255, Math.round(255 * r)));
    data[i + 1] = Math.max(0, Math.min(255, Math.round(255 * g)));
    data[i + 2] = Math.max(0, Math.min(255, Math.round(255 * b)));
  }
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta > 0) {
    if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
    h /= 6;
    if (h < 0) h += 1;
  }

  const s = max === 0 ? 0 : delta / max;
  return [h, s, max];
}

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const hue = ((h % 1) + 1) % 1;
  const chroma = v * s;
  const segment = hue * 6;
  const x = chroma * (1 - Math.abs((segment % 2) - 1));
  const m = v - chroma;

  let r = 0;
  let g = 0;
  let b = 0;
  if (segment < 1) {
    r = chroma;
    g = x;
  } else if (segment < 2) {
    r = x;
    g = chroma;
  } else if (segment < 3) {
    g = chroma;
    b = x;
  } else if (segment < 4) {
    g = x;
    b = chroma;
  } else if (segment < 5) {
    r = x;
    b = chroma;
  } else {
    r = chroma;
    b = x;
  }

  return [r + m, g + m, b + m];
}

export function drawAtlasRegion(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  region: { x: number; y: number; w: number; h: number },
  destX: number,
  destY: number,
  destW?: number,
  destH?: number,
): void {
  ctx.drawImage(
    img,
    region.x,
    region.y,
    region.w,
    region.h,
    destX,
    destY,
    destW ?? region.w,
    destH ?? region.h,
  );
}

export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  destX: number,
  destY: number,
  destW: number,
  destH: number,
): void {
  const source = img as HTMLImageElement;
  const sw = source.width;
  const sh = source.height;
  const ratio = sw / sh;
  const targetRatio = destW / destH;
  let sx = 0;
  let sy = 0;
  let cropW = sw;
  let cropH = sh;

  if (ratio > targetRatio) {
    cropW = sh * targetRatio;
    sx = (sw - cropW) / 2;
  } else {
    cropH = sw / targetRatio;
    sy = (sh - cropH) / 2;
  }

  ctx.drawImage(source, sx, sy, cropW, cropH, destX, destY, destW, destH);
}

export function clipRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
): void {
  const r = Math.max(0, Math.min(radius, Math.min(w, h) / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.clip();
}

export function drawGrayscaleRegion(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  intensity = 0.85,
): void {
  const off = document.createElement("canvas");
  off.width = dw;
  off.height = dh;
  const offCtx = off.getContext("2d");
  if (!offCtx) return;

  offCtx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
  const imageData = offCtx.getImageData(0, 0, dw, dh);
  processPixels(imageData.data, (r, g, b) => {
    const gray = (0.299 * r + 0.587 * g + 0.114 * b) * intensity;
    return [gray, gray, gray] as [number, number, number];
  });
  offCtx.putImageData(imageData, 0, 0);
  ctx.drawImage(off, 0, 0, dw, dh, dx, dy, dw, dh);
}

export function drawColorFilteredRegion(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  hsv: HsvAdjust,
): void {
  const off = document.createElement("canvas");
  off.width = dw;
  off.height = dh;
  const offCtx = off.getContext("2d");
  if (!offCtx) return;

  offCtx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
  const imageData = offCtx.getImageData(0, 0, dw, dh);

  const targetHue = hsv.h ?? 1;
  const saturationScale = hsv.s ?? 1;
  const valueScale = hsv.v ?? 1;

  processPixels(imageData.data, (r, g, b) => {
    const [, sourceSaturation, sourceValue] = rgbToHsv(r, g, b);
    return hsvToRgb(
      targetHue,
      Math.max(0, Math.min(1, sourceSaturation * saturationScale)),
      sourceValue * valueScale,
    );
  });

  offCtx.putImageData(imageData, 0, 0);
  ctx.drawImage(off, 0, 0, dw, dh, dx, dy, dw, dh);
}

export function drawFilteredAtlasRegion(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  region: { x: number; y: number; w: number; h: number },
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  hsv: HsvAdjust,
): void {
  if (Math.abs(hsv.s) < 1e-4) {
    drawGrayscaleRegion(ctx, img, region.x, region.y, region.w, region.h, dx, dy, dw, dh, hsv.v ?? 0.85);
  } else {
    drawColorFilteredRegion(ctx, img, region.x, region.y, region.w, region.h, dx, dy, dw, dh, hsv);
  }
}

export function createCardLayerCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  return canvas;
}
