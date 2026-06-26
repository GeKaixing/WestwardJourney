/**
 * ============================================================
 * Slay the Spire 2 DIY Card Generator
 * Reconstructed from slaythespire2.gg/zh/tools/diy-card
 * ============================================================
 *
 * This is a pure Canvas 2D card rendering engine.
 * It works with: STS1 (Slay the Spire 1) and STS2 (Slay the Spire 2) card templates.
 *
 * Rendering Pipeline:
 *   1. Load template assets (backgrounds, frames, banners) by card type/color/rarity
 *   2. Load user artwork or use placeholder
 *   3. Compose layers: background → frame → art → banners → text → icons
 *   4. Export to PNG via canvas.toBlob()
 *
 * Template Loading (image mapping):
 *   ${CDN}/assets/diy-card-templates/${game}/${type}-${color}-${rarity}_background.webp
 *   ${CDN}/assets/diy-card-templates/${game}/${type}-${color}-${rarity}_frame.webp
 *   ${CDN}/assets/diy-card-templates/${game}/${type}-${color}-${rarity}_banner.webp
 *
 * Standard Characters:
 *   ironclad → red    | silent → green  | defect → blue
 *   necrobinder → purple | regent → yellow | colorless → gray
 */

// ============================================================
// LAYOUT & CONSTANTS
// ============================================================

/** Canvas output dimensions */
const CANVAS_SIZE = 1024;

/** Layout regions (positions on the 1024×1424 canvas) */
const LAYOUT = {
  /** Card art (artwork image area) */
  art:      { x: 50,  y: 86,  w: 498, h: 380 },
  /** Card frame outer bounds */
  frame:    { x: 10,  y: 10,  w: 575, h: 820 },
  /** Banner overlay (title + description text background) */
  banner:   { x: 24,  y: 94,  w: 550, h: 420 },

  /** Title text Y position */
  titleY: 33,
  /** Energy cost offset from top-right */
  costYOffset: 12,
  /** Description text center Y */
  descCenterY: 610,
  /** Description line height */
  descLineHeight: 42,

  /** Energy icon position */
  energyIcon: { x: -32, y: -32 },
  /** Star icon position (for Regent's star cost) */
  starIcon: { x: 239, y: 424, w: 122, h: 74 },

  /** "Stolen by Thieving Hopper" overlay */
  thievingHopper: {
    canvasSize: 1024,
    enemyX: 110,
    enemyY: 70,
    enemySize: 800,
    cardCenterX: 500,
    cardCenterY: 530,
    cardWidth: 295,
    rotationDeg: -5,
  },
};

/** Color for upgraded cards */
const UPGRADE_COLOR = 'rgba(143, 211, 58, 1)';
const UPGRADE_STROKE = 'rgba(74, 74, 74, 1)';

/** Title text color */
const TITLE_COLOR = 'rgba(220, 215, 195, 1)';
const TITLE_STROKE = 'rgba(45, 40, 35, 1)';

/** Description text color */
const DESC_COLOR = 'rgba(82, 82, 82, 1)';

/** Shadow color for text effects */
const SHADOW_COLOR = 'rgba(0, 0, 0, 0.25)';

// ============================================================
// IMAGE LOADING HELPERS
// ============================================================

/** Simple in-memory image cache */
const imageCache = new Map();

/**
 * Load an image asynchronously (with CORS support).
 * Results are cached globally.
 */
async function loadImage(url) {
  if (imageCache.has(url)) return imageCache.get(url);
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = url;
  await img.decode();
  imageCache.set(url, img);
  return img;
}

// ============================================================
// CORE RENDERING HELPERS
// ============================================================

/**
 * Draw text with a stroke outline (for bold/legible text on any background).
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {object} style - { font, fill, stroke, strokeWidth, shadowX, shadowY, shadowColor }
 */
function drawStrokedText(ctx, text, x, y, style) {
  ctx.font = style.font;
  ctx.textBaseline = 'top';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // If no stroke, just fill
  if (style.strokeWidth <= 0) {
    ctx.fillStyle = style.fill;
    ctx.fillText(text, x, y);
    return;
  }

  // Shadow layer
  ctx.fillStyle = style.shadowColor;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.lineWidth = Math.max(1, style.strokeWidth - 1);
  ctx.strokeText(text, x + style.shadowX, y + style.shadowY);
  ctx.fillText(text, x + style.shadowX, y + style.shadowY);

  // Main layer
  ctx.fillStyle = style.fill;
  ctx.strokeStyle = style.stroke;
  ctx.lineWidth = style.strokeWidth;
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
}

/**
 * Draw text with a shadow (lighter effect than stroke).
 */
function drawShadowText(ctx, text, x, y, style) {
  ctx.font = style.font;
  ctx.textBaseline = 'top';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const sx = style.shadowX || 0;
  const sy = style.shadowY || 0;
  const sc = style.shadowColor || SHADOW_COLOR;

  // Shadow layer
  if (sx || sy) {
    ctx.fillStyle = sc;
    ctx.fillText(text, x + sx, y + sy);
  }

  // Main layer
  ctx.fillStyle = style.fill;
  ctx.strokeStyle = style.stroke;
  ctx.lineWidth = style.strokeWidth;
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
}

/**
 * Draw an image fitting into target dimensions while preserving aspect ratio
 * (similar to CSS object-fit: contain, centered).
 */
function drawImageFit(ctx, img, targetX, targetY, targetW, targetH) {
  const imgRatio = img.width / img.height;
  const targetRatio = targetW / targetH;
  let sx = 0, sy = 0, sw = img.width, sh = img.height;

  if (imgRatio > targetRatio) {
    // Image is wider - crop horizontally
    sw = img.height * targetRatio;
    sx = (img.width - sw) / 2;
  } else {
    // Image is taller - crop vertically
    sh = img.width / targetRatio;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, targetX, targetY, targetW, targetH);
}

/**
 * Draw a region from a source image to a target canvas.
 */
function drawImageRegion(ctx, img, srcRegion, destX, destY, destW, destH) {
  ctx.drawImage(
    img,
    srcRegion.x, srcRegion.y, srcRegion.w, srcRegion.h,
    destX, destY,
    destW != null ? destW : srcRegion.w,
    destH != null ? destH : srcRegion.h
  );
}

// ============================================================
// IMAGE FILTERING (Color Processing)
// ============================================================

/**
 * Convert an image region to grayscale with adjustable intensity.
 * @param {CanvasRenderingContext2D} ctx - destination context
 * @param {HTMLImageElement|HTMLCanvasElement} img - source image
 * @param {number} sx, sy, sw, sh - source region
 * @param {number} dx, dy, dw, dh - destination region
 * @param {number} intensity - 0 (full color) to 1 (full grayscale), default 0.85
 */
function drawGrayscale(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh, intensity = 0.85) {
  const offscreen = document.createElement('canvas');
  offscreen.width = dw;
  offscreen.height = dh;
  const offCtx = offscreen.getContext('2d');

  offCtx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
  const imageData = offCtx.getImageData(0, 0, dw, dh);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const gray = (0.299 * r + 0.587 * data[i + 1] + 0.114 * data[i + 2]) * intensity;
    data[i] = data[i + 1] = data[i + 2] = Math.min(255, Math.round(gray));
  }

  offCtx.putImageData(imageData, 0, 0);
  ctx.drawImage(offscreen, 0, 0, dw, dh, dx, dy, dw, dh);
}

/**
 * Apply HSV color transformation to an image region.
 * @param {CanvasRenderingContext2D} ctx - destination context
 * @param {HTMLImageElement|HTMLCanvasElement} img - source image
 * @param {number} sx, sy, sw, sh - source region
 * @param {number} dx, dy, dw, dh - destination region
 * @param {object} hsv - { h: hue shift (0-1), s: saturation multiplier, v: value multiplier }
 */
function drawColorFilter(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh, hsv = {}) {
  const hue = hsv.h ?? 1;
  const sat = hsv.s ?? 1;
  const val = hsv.v ?? 1;

  const offscreen = document.createElement('canvas');
  offscreen.width = dw;
  offscreen.height = dh;
  const offCtx = offscreen.getContext('2d');

  offCtx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
  const imageData = offCtx.getImageData(0, 0, dw, dh);
  const data = imageData.data;

  // Hue rotation matrix
  const hueAngle = (1 - hue) * 2 * Math.PI;
  const cosH = Math.cos(hueAngle);
  const sinH = Math.sin(hueAngle);
  const hueMat = [[1, 0, 0], [0, cosH, -sinH], [0, sinH, cosH]];
  const satMat = [[1, 0, 0], [0, sat, 0], [0, 0, sat]];

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue; // skip transparent

    let r = data[i] / 255;
    let g = data[i + 1] / 255;
    let b = data[i + 2] / 255;

    // Apply hue rotation in YCbCr-like space
    let [y, cb, cr] = rgbToYcbcr(r, g, b);
    [y, cb, cr] = [
      y * hueMat[0][0] + cb * hueMat[0][1] + cr * hueMat[0][2],
      y * hueMat[1][0] + cb * hueMat[1][1] + cr * hueMat[1][2],
      y * hueMat[2][0] + cb * hueMat[2][1] + cr * hueMat[2][2],
    ];
    // Apply saturation
    [y, cb, cr] = [
      y * satMat[0][0] + cb * satMat[0][1] + cr * satMat[0][2],
      y * satMat[1][0] + cb * satMat[1][1] + cr * satMat[1][2],
      y * satMat[2][0] + cb * satMat[2][1] + cr * satMat[2][2],
    ];
    // Apply value multiplier
    y *= val;
    cb *= val;
    cr *= val;

    // Convert back to RGB
    [r, g, b] = ycbcrToRgb(y, cb, cr);
    data[i]     = Math.max(0, Math.min(255, Math.round(255 * r)));
    data[i + 1] = Math.max(0, Math.min(255, Math.round(255 * g)));
    data[i + 2] = Math.max(0, Math.min(255, Math.round(255 * b)));
  }

  offCtx.putImageData(imageData, 0, 0);
  ctx.drawImage(offscreen, 0, 0, dw, dh, dx, dy, dw, dh);
}

// Color space conversion helpers
const RGB_TO_YCBCR = [
  [0.299,   0.596,  0.212],
  [0.587,  -0.275, -0.523],
  [0.114,  -0.321,  0.311],
];

const YCBCR_TO_RGB = (() => {
  const m = RGB_TO_YCBCR;
  const det = m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1])
            - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0])
            + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  if (!det) return [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const inv = (a, b) => {
    const r = [];
    for (let i = 0; i < 3; i++) {
      r[i] = [];
      for (let j = 0; j < 3; j++) {
        const c = (b + 1) % 3;
        const d = (a + 1) % 3;
        r[i][j] = ((m[(j + 1) % 3][(i + 1) % 3] * m[(j + 2) % 3][(i + 2) % 3])
                 - (m[(j + 1) % 3][(i + 2) % 3] * m[(j + 2) % 3][(i + 1) % 3])) / det;
      }
    }
    return r;
  };
  return inv(0, 2);
})();

function rgbToYcbcr(r, g, b) {
  const m = RGB_TO_YCBCR;
  return [
    r * m[0][0] + g * m[0][1] + b * m[0][2],
    r * m[1][0] + g * m[1][1] + b * m[1][2],
    r * m[2][0] + g * m[2][1] + b * m[2][2],
  ];
}

function ycbcrToRgb(y, cb, cr) {
  const m = YCBCR_TO_RGB;
  return [
    y * m[0][0] + cb * m[0][1] + cr * m[0][2],
    y * m[1][0] + cb * m[1][1] + cr * m[1][2],
    y * m[2][0] + cb * m[2][1] + cr * m[2][2],
  ];
}

// ============================================================
// ICON / SPECIAL TEXT PARSING & MEASURING
// ============================================================

/** Check if a segment is an energy icon */
function isEnergyIcon(seg) {
  return seg.type === 'energyIcon';
}
/** Check if a segment is a star icon */
function isStarIcon(seg) {
  return seg.type === 'starIcon';
}
/** Check if segment is any icon */
function isIcon(seg) {
  return isEnergyIcon(seg) || isStarIcon(seg);
}

/**
 * Measure the width of a text/icon segment.
 * Icons have a fixed width (28px each, or wider with count label).
 */
function measureSegment(ctx, seg) {
  if (isIcon(seg)) {
    if (seg.count >= 4) {
      return ctx.measureText(String(seg.count)).width + 28 + 2;
    }
    return 28 * seg.count + 2 * Math.max(0, seg.count - 1);
  }
  return ctx.measureText(seg.text).width;
}

/**
 * Parse description text into segments (text runs and icon placeholders).
 * Handles: [E] energy icons, [G] gold, {N} variables, NL newlines.
 */
function parseDescription(text) {
  // Strip template markers and normalize
  const cleaned = (text || '')
    .replace(/!D!|!M!|!B!|\[G\]|\[E\]/g, '')
    .replace(/NL/g, ' ');

  // Simple tokenizer - returns array of { type, text, count?, yellow?, green? }
  const tokens = [];
  let current = '';
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (ch === '{') {
      if (current) { tokens.push({ type: 'text', text: current }); current = ''; }
      const end = cleaned.indexOf('}', i);
      if (end === -1) { current += ch; continue; }
      const content = cleaned.slice(i + 1, end);
      // energyIcons(N) or starIcons(N)
      const energy = content.match(/^(\w+):energyIcons(?:\((\d*)\))?$/);
      const star = content.match(/^(\w+):starIcons(?:\((\d*)\))?$/);
      if (energy) {
        tokens.push({ type: 'energyIcon', count: parseInt(energy[2] || '1') });
      } else if (star) {
        tokens.push({ type: 'starIcon', count: parseInt(star[2] || '1') });
      } else {
        tokens.push({ type: 'text', text: '{' + content + '}' });
      }
      i = end;
    } else {
      current += ch;
    }
  }
  if (current) tokens.push({ type: 'text', text: current });
  return tokens;
}

/**
 * Word-wrap tokens into lines that fit a maximum width.
 */
function wrapTokens(ctx, tokens, maxWidth) {
  const lines = [];
  let currentLine = [];
  let currentWidth = 0;

  function flushLine() {
    if (currentLine.length > 0) {
      lines.push({ segments: [...currentLine] });
      currentLine = [];
      currentWidth = 0;
    }
  }

  for (const token of tokens) {
    if (token.type === 'newline') {
      flushLine();
      continue;
    }

    const seg = token.type === 'energyIcon'
      ? { type: 'energyIcon', count: token.count }
      : token.type === 'starIcon'
        ? { type: 'starIcon', count: token.count }
        : { text: token.text, yellow: token.yellow, green: token.green };

    const segWidth = measureSegment(ctx, seg);

    if (isIcon(seg) || segWidth <= maxWidth) {
      if (currentWidth + segWidth <= maxWidth || currentLine.length === 0) {
        currentLine.push(seg);
        currentWidth += segWidth;
      } else {
        flushLine();
        currentLine.push(seg);
        currentWidth = segWidth;
      }
      continue;
    }

    // Long word: split character by character
    let charStart = 0;
    for (let ci = 0; ci < seg.text.length; ) {
      let cs = 1;
      let sub = seg.text.slice(ci, ci + cs);
      let subWidth = ctx.measureText(sub).width;
      while (ci + cs < seg.text.length && subWidth <= maxWidth) {
        cs += 1;
        sub = seg.text.slice(ci, ci + cs);
        subWidth = ctx.measureText(sub).width;
      }
      if (subWidth > maxWidth && cs > 1) {
        cs -= 1;
        sub = seg.text.slice(ci, ci + cs);
        subWidth = ctx.measureText(sub).width;
      }
      const wordSeg = { text: sub, yellow: seg.yellow, green: seg.green };
      if (currentWidth + subWidth <= maxWidth) {
        currentLine.push(wordSeg);
        currentWidth += subWidth;
      } else {
        flushLine();
        currentLine.push(wordSeg);
        currentWidth = subWidth;
      }
      ci += cs;
    }
  }

  flushLine();
  return lines;
}

// ============================================================
// CARD LAYER DEFINITIONS
// ============================================================

const CARD_COLORS = {
  red:        { h: 1,    s: 0,    v: 0.85 },
  green:      { h: 0.35, s: 0.80, v: 0.85 },
  blue:       { h: 0.55, s: 0.80, v: 0.85 },
  purple:     { h: 0.75, s: 0.80, v: 0.85 },
  yellow:     { h: 0.12, s: 0.80, v: 0.85 },
  colorless:  { h: 1,    s: 0,    v: 0.85 },
};

const RARITY_NAMES = {
  basic:     'Basic',
  common:    'Common',
  uncommon:  'Uncommon',
  rare:      'Rare',
  shop:      'Shop',
  ancient:   'Ancient',
  curse:     'Curse',
  status:    'Status',
  special:   'Special',
};

// ============================================================
// MAIN CARD RENDERER
// ============================================================

/**
 * Render a complete Slay the Spire card onto a canvas.
 *
 * @param {HTMLCanvasElement} canvas - Target canvas (1024×1424 recommended)
 * @param {object} cardData - Card configuration
 * @param {string} cardData.cardType - 'attack' | 'skill' | 'power' | 'curse' | 'status'
 * @param {string} cardData.cardColor - 'red' | 'green' | 'blue' | 'purple' | 'yellow' | 'colorless'
 * @param {string} cardData.cardRarity - 'basic' | 'common' | 'uncommon' | 'rare' | 'shop' | ...
 * @param {string} cardData.cardName - Card title text
 * @param {string} cardData.description - Card effect description
 * @param {string} cardData.cost - Energy cost (number or 'X')
 * @param {boolean} cardData.upgraded - Whether to show upgraded styling
 * @param {HTMLImageElement|HTMLCanvasElement} cardData.artwork - User's artwork image
 * @param {object} assets - Pre-loaded template images
 * @param {HTMLImageElement} assets.background - Card frame background
 * @param {HTMLImageElement} assets.frame - Card frame overlay
 * @param {HTMLImageElement} assets.banner - Title/description banner
 * @param {HTMLImageElement} assets.energyIcon - Energy icon sprite
 * @param {HTMLImageElement} assets.starIcon - Star icon sprite
 * @param {object} options
 * @param {boolean} options.thievingHopper - Apply "Stolen by Hopper" effect
 * @param {boolean} options.darkMode - Use dark text styles
 */
async function renderCard(canvas, cardData, assets, options = {}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  const useDark = !!options.darkMode;
  const L = LAYOUT;

  // Clear
  ctx.clearRect(0, 0, W, H);

  // === LAYER 1: Background (card frame) ===
  if (assets.background) {
    ctx.drawImage(assets.background, L.frame.x, L.frame.y, L.frame.w, L.frame.h);
  }

  // === LAYER 2: Card Art ===
  if (cardData.artwork) {
    // Draw artwork with color filter
    const colorAdjust = CARD_COLORS[cardData.cardColor] || CARD_COLORS.colorless;
    drawColorFilter(
      ctx, cardData.artwork,
      0, 0, cardData.artwork.width, cardData.artwork.height,
      L.art.x, L.art.y, L.art.w, L.art.h,
      colorAdjust
    );
  }

  // === LAYER 3: Frame overlay ===
  if (assets.frame) {
    ctx.drawImage(assets.frame, 0, 0, W, H);
  }

  // === LAYER 4: Banner ===
  if (assets.banner) {
    ctx.drawImage(assets.banner, L.banner.x, L.banner.y, L.banner.w, L.banner.h);
  }

  // === LAYER 5: Energy Cost ===
  if (cardData.cost && cardData.cost !== '') {
    const isSpecialCost = cardData.cost === 'X';
    const costText = isSpecialCost ? 'X' : String(cardData.cost);
    const isUpgraded = cardData.upgraded;

    // Draw cost background (energy icon)
    if (assets.energyIcon) {
      const ePos = L.energyIcon;
      ctx.drawImage(assets.energyIcon, ePos.x, ePos.y);
    }

    // Draw cost number
    const fontFamily = assets.useBoldFont ? 'DIYKreonBold' : 'serif';
    const style = isUpgraded
      ? { font: `52px ${fontFamily}`, fill: UPGRADE_COLOR, stroke: UPGRADE_STROKE,
          strokeWidth: 7, shadowX: 3, shadowY: 4,
          shadowColor: 'rgba(30,30,30,0.95)' }
      : { font: `52px ${fontFamily}`, fill: 'rgba(220,215,195,1)',
          stroke: 'rgba(45,40,35,1)', strokeWidth: 7,
          shadowX: 3, shadowY: 4, shadowColor: 'rgba(30,30,30,0.95)' };

    const costX = 64 + (598 - ctx.measureText(costText).width) / 2;
    const costY = 48 + L.starIcon.y + L.starIcon.h / 2;
    ctx.textBaseline = 'middle';
    drawStrokedText(ctx, costText, costX, costY, style);
    ctx.textBaseline = 'top';
  }

  // === LAYER 6: Card Name ===
  if (cardData.cardName) {
    const name = cardData.cardName.trim();
    const fontFamily = assets.useBoldFont ? 'DIYKreonBold' : 'serif';
    const isUpgraded = cardData.upgraded;

    const style = isUpgraded
      ? { font: `90px ${fontFamily}`, fill: UPGRADE_COLOR,
          stroke: 'rgba(45,40,35,1)', strokeWidth: 12,
          shadowX: 3, shadowY: 4, shadowColor: 'rgba(30,30,30,0.95)' }
      : { font: `77px ${fontFamily}`, fill: TITLE_COLOR,
          stroke: TITLE_STROKE, strokeWidth: 12,
          shadowX: 3, shadowY: 4, shadowColor: 'rgba(30,30,30,0.95)' };

    const titleArea = { x: L.frame.x + 82, y: L.titleY, w: L.frame.w - 164, h: 91 };
    const nameWidth = ctx.measureText(name).width;
    const nameX = titleArea.x + (titleArea.w - nameWidth) / 2;
    const nameY = titleArea.y + 91 - 45;
    drawStrokedText(ctx, name, nameX, nameY, style);
  }

  // === LAYER 7: Type / Rarity indicator ===
  {
    const fontFamily = assets.useBoldFont ? 'DIYKreonBold' : 'serif';
    const typeLabel = `${cardData.cardType.toUpperCase()} · ${(RARITY_NAMES[cardData.cardRarity] || cardData.cardRarity).toUpperCase()}`;
    const labelFont = `30px ${fontFamily}`;
    ctx.font = labelFont;
    ctx.fillStyle = DESC_COLOR;
    const labelWidth = ctx.measureText(typeLabel).width;
    ctx.fillText(typeLabel, (W - labelWidth) / 2, 560);
  }

  // === LAYER 8: Description Text ===
  if (cardData.description) {
    const fontFamily = assets.useBoldFont ? 'DIYKreonBold' : 'serif';
    const descFont = `38px ${fontFamily}`;

    // Parse and wrap description
    const tokens = parseDescription(cardData.description);
    ctx.font = descFont;
    const lines = wrapTokens(ctx, tokens, 480); // max line width

    // Draw each line
    let lineY = L.descCenterY;
    for (const line of lines) {
      let segX = (W - line.segments.reduce((sum, s) => sum + measureSegment(ctx, s), 0)) / 2;

      for (const seg of line.segments) {
        if (isEnergyIcon(seg)) {
          if (seg.count >= 4) {
            const countStr = String(seg.count);
            const cWidth = ctx.measureText(countStr).width;
            drawShadowText(ctx, countStr, segX, lineY, {
              font: descFont,
              fill: 'rgba(255, 247, 237, 1)',
              stroke: 'rgba(0,0,0,0.25)',
              strokeWidth: 2,
            });
            segX += cWidth + 2;
          }
          for (let j = 0; j < seg.count; j++) {
            if (assets.energyIcon) {
              ctx.drawImage(assets.energyIcon, segX, lineY, 28, 28);
            }
            segX += 28 + (j < seg.count - 1 ? 2 : 0);
          }
        } else if (isStarIcon(seg)) {
          if (seg.count >= 4) {
            const countStr = String(seg.count);
            const cWidth = ctx.measureText(countStr).width;
            drawShadowText(ctx, countStr, segX, lineY, {
              font: descFont,
              fill: 'rgba(255, 247, 237, 1)',
              stroke: 'rgba(0,0,0,0.25)',
              strokeWidth: 2,
            });
            segX += cWidth + 2;
          }
          for (let j = 0; j < seg.count; j++) {
            if (assets.starIcon) {
              ctx.drawImage(assets.starIcon, segX, lineY, 28, 28);
            }
            segX += 28 + (j < seg.count - 1 ? 2 : 0);
          }
        } else {
          const textStyle = seg.yellow
            ? { font: descFont, fill: 'rgba(255, 215, 0, 1)', stroke: 'rgba(0,0,0,0.25)', strokeWidth: 2 }
            : seg.green
              ? { font: descFont, fill: 'rgba(100, 220, 100, 1)', stroke: 'rgba(0,0,0,0.25)', strokeWidth: 2 }
              : { font: descFont, fill: 'rgba(220, 215, 195, 1)', stroke: 'rgba(0,0,0,0.25)', strokeWidth: 2 };
          drawShadowText(ctx, seg.text, segX, lineY, textStyle);
          segX += ctx.measureText(seg.text).width;
        }
      }
      lineY += L.descLineHeight;
    }
  }

  // === LAYER 9: "Stolen by Thieving Hopper" effect ===
  if (options.thievingHopper) {
    const hopper = L.thievingHopper;
    const hopperCanvas = document.createElement('canvas');
    hopperCanvas.width = hopper.canvasSize;
    hopperCanvas.height = hopper.canvasSize;
    const hopCtx = hopperCanvas.getContext('2d');
    if (hopCtx) {
      hopCtx.clearRect(0, 0, hopper.canvasSize, hopper.canvasSize);

      // Draw hopper enemy
      const hopperImg = await loadImage('/assets/enemies/thieving_hopper.png');
      hopCtx.drawImage(hopperImg, hopper.enemyX, hopper.enemyY, hopper.enemySize, hopper.enemySize);

      // Draw card image on top with rotation
      const scale = 1.2727; // ~ 1/0.786
      const cardH = scale * hopper.cardWidth;
      hopCtx.save();
      hopCtx.translate(hopper.cardCenterX, hopper.cardCenterY);
      hopCtx.rotate(hopper.rotationDeg * Math.PI / 180);
      hopCtx.drawImage(canvas, -hopper.cardWidth / 2, -cardH / 2, hopper.cardWidth, cardH);
      hopCtx.restore();

      // Replace main canvas content with composed hopper version
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(hopperCanvas, 0, 0, W, H);
    }
  }
}

/**
 * Export the rendered card canvas as a PNG Blob.
 */
function exportAsPNG(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create PNG blob'));
    }, 'image/png');
  });
}

module.exports = {
  renderCard,
  exportAsPNG,
  loadImage,
  LAYOUT,
  CARD_COLORS,
  parseDescription,
  wrapTokens,
};
