import type { DiyCardFormState, RenderOptions, Sts2Manifest } from "./types";
import {
  ANCIENT_ART_AREA,
  ART_AREA,
  CARD_HEIGHT,
  CARD_OFFSET_X,
  CARD_OFFSET_Y,
  CARD_WIDTH,
  COST_Y_OFFSET,
  DESC_CENTER_Y,
  DESC_LINE_HEIGHT,
  ENERGY_ICON_POS,
  GREEN_STROKE,
  GREEN_TEXT,
  MAX_DESC_LINES,
  OUTPUT_HEIGHT,
  OUTPUT_WIDTH,
  PORTRAIT_BORDER,
  STAR_ICON_POS,
  TITLE_Y,
  TYPE_PLAQUE,
  resolveBannerHsv,
  resolveFrameHsv,
} from "./constants";
import {
  clipRoundRect,
  createCardLayerCanvas,
  drawAtlasRegion,
  drawFilteredAtlasRegion,
  drawImageCover,
} from "./canvasDraw";
import { measureSegment, preprocessDescription, wrapDescription } from "./descriptionParser";
import { loadImage } from "./imageCache";
import { createPortraitMask } from "./portraitMask";
import { getTemplateKeys, getTypeLabel, normalizeCharacter } from "./templateKeys";

interface TextStyle {
  font: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
  shadowX?: number;
  shadowY?: number;
  shadowColor?: string;
}

function drawStrokedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  style: TextStyle,
): void {
  ctx.font = style.font;
  ctx.textBaseline = "top";
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  if (style.strokeWidth <= 0) {
    ctx.fillStyle = style.fill;
    ctx.fillText(text, x, y);
    return;
  }

  ctx.fillStyle = style.shadowColor ?? "rgba(0,0,0,0.8)";
  ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
  ctx.lineWidth = Math.max(1, style.strokeWidth - 1);
  ctx.strokeText(text, x + (style.shadowX ?? 0), y + (style.shadowY ?? 0));
  ctx.fillText(text, x + (style.shadowX ?? 0), y + (style.shadowY ?? 0));

  ctx.fillStyle = style.fill;
  ctx.strokeStyle = style.stroke;
  ctx.lineWidth = style.strokeWidth;
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
}

function drawShadowText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  style: TextStyle,
): void {
  ctx.font = style.font;
  ctx.textBaseline = "top";
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  const sx = style.shadowX ?? 0;
  const sy = style.shadowY ?? 0;
  if (sx || sy) {
    ctx.fillStyle = style.shadowColor ?? "rgba(0,0,0,0.25)";
    ctx.fillText(text, x + sx, y + sy);
  }

  ctx.fillStyle = style.fill;
  ctx.strokeStyle = style.stroke;
  ctx.lineWidth = style.strokeWidth;
  if (style.strokeWidth > 0) ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
}

function pickAtlas(atlases: HTMLImageElement[], atlasIndex: number): HTMLImageElement {
  return atlases[atlasIndex] ?? atlases[0]!;
}

export async function renderSts2Card(
  canvas: HTMLCanvasElement,
  manifest: Sts2Manifest,
  form: DiyCardFormState,
  artworkUrl: string | null,
  options: RenderOptions = {},
): Promise<void> {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = OUTPUT_WIDTH;
  canvas.height = OUTPUT_HEIGHT;
  ctx.clearRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

  const atlas0 = await loadImage(manifest.atlases[0]!);
  const atlas1 = manifest.atlases[1] ? await loadImage(manifest.atlases[1]) : atlas0;
  const atlases = [atlas0, atlas1];

  const characterKey = normalizeCharacter(form.character);
  const template = getTemplateKeys(form.cardType, form.character, form.cardRarity);
  const frameRegion = manifest.regions[template.frame];
  const portraitRegion = template.portraitBorder
    ? manifest.regions[template.portraitBorder]
    : undefined;
  const bannerRegion = manifest.regions[template.banner];
  const energyRegion = manifest.regions[template.energy];

  if (!frameRegion || !bannerRegion || !energyRegion) return;

  const isAncient = form.cardRarity.toLowerCase() === "ancient";
  const bannerHsv = resolveBannerHsv(manifest, form.cardRarity);
  const frameHsv = resolveFrameHsv(manifest, characterKey);
  const fontsReady = document.fonts.check('12px "DIYKreonBold"');
  const boldFont = fontsReady ? "DIYKreonBold" : "serif";
  const regularFont = fontsReady ? "DIYKreonRegular" : "serif";

  const cardLayer = createCardLayerCanvas();
  const cardCtx = cardLayer.getContext("2d");
  if (!cardCtx) return;

  const artArea = isAncient ? ANCIENT_ART_AREA : ART_AREA;

  if (artworkUrl) {
    const artwork = await loadImage(artworkUrl);
    if (isAncient) {
      cardCtx.save();
      clipRoundRect(cardCtx, 0, 0, CARD_WIDTH, CARD_HEIGHT, 100);
      drawImageCover(cardCtx, artwork, artArea.x, artArea.y, artArea.w, artArea.h);
      cardCtx.restore();
    } else {
      drawImageCover(cardCtx, artwork, artArea.x, artArea.y, artArea.w, artArea.h);
    }

    if (portraitRegion) {
      const mask = createPortraitMask(
        pickAtlas(atlases, portraitRegion.atlas),
        portraitRegion.region,
      );
      cardCtx.globalCompositeOperation = "destination-in";
      cardCtx.drawImage(mask, 0, 0);
      cardCtx.globalCompositeOperation = "source-over";
    }
  } else {
    cardCtx.fillStyle = "#1a1a1a";
    if (isAncient) {
      cardCtx.save();
      clipRoundRect(cardCtx, 0, 0, CARD_WIDTH, CARD_HEIGHT, 34);
      cardCtx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
      cardCtx.restore();
    } else {
      cardCtx.fillRect(artArea.x, artArea.y, artArea.w, artArea.h);
    }
  }

  ctx.drawImage(cardLayer, CARD_OFFSET_X, CARD_OFFSET_Y);

  const frameAtlas = pickAtlas(atlases, frameRegion.atlas);
  drawFilteredAtlasRegion(
    ctx,
    frameAtlas,
    frameRegion.region,
    CARD_OFFSET_X,
    CARD_OFFSET_Y,
    CARD_WIDTH,
    CARD_HEIGHT,
    frameHsv,
  );

  if (portraitRegion) {
    const portraitAtlas = pickAtlas(atlases, portraitRegion.atlas);
    drawFilteredAtlasRegion(
      ctx,
      portraitAtlas,
      portraitRegion.region,
      CARD_OFFSET_X + PORTRAIT_BORDER.x,
      CARD_OFFSET_Y + PORTRAIT_BORDER.y,
      PORTRAIT_BORDER.w,
      PORTRAIT_BORDER.h,
      bannerHsv,
    );
  }

  const bannerAtlas = pickAtlas(atlases, bannerRegion.atlas);
  const bannerHeight = isAncient ? 162 : 133;
  const bannerWidth = (bannerRegion.region.w * bannerHeight) / bannerRegion.region.h * 1.075;
  const bannerX = CARD_OFFSET_X + (CARD_WIDTH - bannerWidth) / 2;
  const bannerY = CARD_OFFSET_Y + (isAncient ? 10 : 20);
  drawFilteredAtlasRegion(
    ctx,
    bannerAtlas,
    bannerRegion.region,
    bannerX,
    bannerY,
    bannerWidth,
    bannerHeight,
    bannerHsv,
  );

  const orbCost = (form.orbCost || "").trim();
  const showEnergy =
    form.character !== "quest" &&
    form.character !== "curse" &&
    orbCost.length > 0;

  if (showEnergy) {
    const energyAtlas = pickAtlas(atlases, energyRegion.atlas);
    drawAtlasRegion(
      ctx,
      energyAtlas,
      energyRegion.region,
      CARD_OFFSET_X + ENERGY_ICON_POS.x,
      CARD_OFFSET_Y + ENERGY_ICON_POS.y,
      110,
      110,
    );
  }

  const upgraded = !!form.upgraded;
  const title = `${(form.cardName || "Card").trim()}${upgraded ? "+" : ""}`;
  ctx.font = `50px ${boldFont}`;
  const titleWidth = ctx.measureText(title).width;
  drawStrokedText(ctx, title, CARD_OFFSET_X + (CARD_WIDTH - titleWidth) / 2, CARD_OFFSET_Y + (isAncient ? 48 : TITLE_Y), {
    font: `50px ${boldFont}`,
    fill: upgraded ? "rgba(127, 255, 0, 1)" : "rgba(255, 247, 237, 1)",
    stroke: "rgba(50,50,50,1)",
    strokeWidth: 7,
  });

  if (showEnergy) {
    const costText = orbCost.slice(0, 2);
    ctx.font = `bold 62px ${boldFont}`;
    const costWidth = ctx.measureText(costText).width;
    drawStrokedText(
      ctx,
      costText,
      CARD_OFFSET_X + ENERGY_ICON_POS.x + 55 - costWidth / 2 - 3,
      CARD_OFFSET_Y + ENERGY_ICON_POS.y + 55 - 40 + COST_Y_OFFSET,
      {
        font: `bold 62px ${boldFont}`,
        fill: form.costGreen ? GREEN_TEXT : "rgba(255, 252, 242, 1)",
        stroke: form.costGreen ? GREEN_STROKE : "rgba(97, 59, 26, 1)",
        strokeWidth: 6,
        shadowX: 5,
        shadowY: 5,
        shadowColor: "rgba(0,0,0,0.3)",
      },
    );
  }

  const starCost = (form.starCost || "").trim().toUpperCase();
  if (characterKey === "regent" && starCost.length > 0) {
    const starIcon = await loadImage("/assets/icons/star_icon.png");
    ctx.drawImage(starIcon, CARD_OFFSET_X + STAR_ICON_POS.x, CARD_OFFSET_Y + STAR_ICON_POS.y, 95, 95);
    const starText = starCost.slice(0, 2);
    ctx.font = `bold 36px ${boldFont}`;
    const starWidth = ctx.measureText(starText).width;
    drawStrokedText(
      ctx,
      starText,
      CARD_OFFSET_X + STAR_ICON_POS.x + 47.5 - starWidth / 2,
      CARD_OFFSET_Y + STAR_ICON_POS.y + 47.5 - 16,
      {
        font: `bold 36px ${boldFont}`,
        fill: "rgba(255, 252, 242, 1)",
        stroke: "rgba(23, 85, 97, 1)",
        strokeWidth: 5,
        shadowX: 2,
        shadowY: 2,
        shadowColor: "rgba(0,0,0,0.19)",
      },
    );
  }

  if (manifest.typePlaque) {
    const plaque = await loadImage(manifest.typePlaque);
    drawFilteredAtlasRegion(
      ctx,
      plaque,
      { x: 0, y: 0, w: plaque.width, h: plaque.height },
      CARD_OFFSET_X + TYPE_PLAQUE.x,
      CARD_OFFSET_Y + TYPE_PLAQUE.y,
      TYPE_PLAQUE.w,
      TYPE_PLAQUE.h,
      bannerHsv,
    );
  }

  const typeLabel = getTypeLabel(form.cardType, form.character, options.locale ?? "zh");
  ctx.font = `bold 30px ${boldFont}`;
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(13, 13, 13, 0.88)";
  const typeWidth = ctx.measureText(typeLabel).width;
  ctx.fillText(typeLabel, CARD_OFFSET_X + (CARD_WIDTH - typeWidth) / 2, CARD_OFFSET_Y + TYPE_PLAQUE.y + TYPE_PLAQUE.h / 2);
  ctx.textBaseline = "top";

  const descFont = `40px ${regularFont}`;
  ctx.font = descFont;
  const description = preprocessDescription(form.description, characterKey);
  const lines = wrapDescription(ctx, description).slice(0, MAX_DESC_LINES);
  const lineOffset = -((lines.length - 1) * DESC_LINE_HEIGHT) / 2;

  let energyDescIcon: HTMLImageElement | null = null;
  let starDescIcon: HTMLImageElement | null = null;
  try {
    energyDescIcon = await loadImage(`/assets/icons/${characterKey}_energy_icon.png`);
  } catch {
    try {
      energyDescIcon = await loadImage("/assets/icons/colorless_energy_icon.png");
    } catch {
      energyDescIcon = null;
    }
  }
  try {
    starDescIcon = await loadImage("/assets/icons/star_icon.png");
  } catch {
    starDescIcon = null;
  }

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex]!;
    const lineWidth = line.segments.reduce((sum, seg) => sum + measureSegment(ctx, seg), 0);
    let x = CARD_OFFSET_X + (CARD_WIDTH - lineWidth) / 2;
    const y = CARD_OFFSET_Y + DESC_CENTER_Y + lineOffset + lineIndex * DESC_LINE_HEIGHT;
    const iconY = y + 6;

    for (const seg of line.segments) {
      if (seg.type === "energyIcon") {
        if (seg.count >= 4) {
          const countText = String(seg.count);
          const countWidth = ctx.measureText(countText).width;
          drawShadowText(ctx, countText, x, y, {
            font: descFont,
            fill: "rgba(255, 247, 237, 1)",
            stroke: "rgba(60,55,50,1)",
            strokeWidth: 0,
            shadowX: 2,
            shadowY: 2,
            shadowColor: "rgba(0,0,0,0.25)",
          });
          x += countWidth + 2;
          if (energyDescIcon) {
            ctx.drawImage(energyDescIcon, 0, 0, energyDescIcon.width, energyDescIcon.height, x, iconY, 28, 28);
          }
          x += 28;
        } else {
          for (let i = 0; i < seg.count; i++) {
            if (energyDescIcon) {
              ctx.drawImage(energyDescIcon, 0, 0, energyDescIcon.width, energyDescIcon.height, x, iconY, 28, 28);
            }
            x += 28 + (i < seg.count - 1 ? 2 : 0);
          }
        }
        continue;
      }

      if (seg.type === "starIcon") {
        if (seg.count >= 4) {
          const countText = String(seg.count);
          const countWidth = ctx.measureText(countText).width;
          drawShadowText(ctx, countText, x, y, {
            font: descFont,
            fill: "rgba(255, 247, 237, 1)",
            stroke: "rgba(60,55,50,1)",
            strokeWidth: 0,
            shadowX: 2,
            shadowY: 2,
            shadowColor: "rgba(0,0,0,0.25)",
          });
          x += countWidth + 2;
          if (starDescIcon) {
            ctx.drawImage(starDescIcon, 0, 0, starDescIcon.width, starDescIcon.height, x, iconY, 28, 28);
          }
          x += 28;
        } else {
          for (let i = 0; i < seg.count; i++) {
            if (starDescIcon) {
              ctx.drawImage(starDescIcon, 0, 0, starDescIcon.width, starDescIcon.height, x, iconY, 28, 28);
            }
            x += 28 + (i < seg.count - 1 ? 2 : 0);
          }
        }
        continue;
      }

      drawShadowText(ctx, seg.text, x, y, {
        font: descFont,
        fill: seg.green ? GREEN_TEXT : seg.yellow ? "rgba(255,225,80,1)" : "rgba(255, 247, 237, 1)",
        stroke: seg.green ? GREEN_STROKE : seg.yellow ? "rgba(90,65,10,1)" : "rgba(60,55,50,1)",
        strokeWidth: 0,
        shadowX: 2,
        shadowY: 2,
        shadowColor: "rgba(0,0,0,0.25)",
      });
      x += ctx.measureText(seg.text).width;
    }
  }

  if (options.thievingHopper) {
    const snapshot = document.createElement("canvas");
    snapshot.width = OUTPUT_WIDTH;
    snapshot.height = OUTPUT_HEIGHT;
    snapshot.getContext("2d")?.drawImage(canvas, 0, 0);

    const hopperImg = await loadImage("/assets/enemies/thieving_hopper.png");
    const hopperCanvasSize = 1024;
    canvas.width = hopperCanvasSize;
    canvas.height = hopperCanvasSize;
    const hopperCtx = canvas.getContext("2d");
    if (!hopperCtx) return;

    hopperCtx.clearRect(0, 0, hopperCanvasSize, hopperCanvasSize);
    hopperCtx.drawImage(hopperImg, 110, 70, 800, 800);

    const cardWidth = 295;
    const cardHeight = 1.2727272727272727 * cardWidth;
    hopperCtx.save();
    hopperCtx.translate(500, 530);
    hopperCtx.rotate((-5 * Math.PI) / 180);
    hopperCtx.drawImage(snapshot, -cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);
    hopperCtx.restore();
  }
}
