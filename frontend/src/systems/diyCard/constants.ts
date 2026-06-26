import type { CardRarity, HsvAdjust } from "./types";

export const MANIFEST_URL = "/diy-card-assets-sts2/manifest.json";

export const OUTPUT_WIDTH = 726;
export const OUTPUT_HEIGHT = 924;
export const CARD_OFFSET_X = 64;
export const CARD_OFFSET_Y = 48;
export const CARD_WIDTH = 598;
export const CARD_HEIGHT = 844;

export const ART_AREA = { x: 50, y: 86, w: 498, h: 380 };
export const ANCIENT_ART_AREA = { x: 10, y: 10, w: 575, h: 820 };
export const PORTRAIT_BORDER = { x: 24, y: 94, w: 550, h: 420 };
export const ENERGY_ICON_POS = { x: -32, y: -32 };
export const STAR_ICON_POS = { x: -50, y: 38 };
export const TYPE_PLAQUE = { x: 239, y: 424, w: 122, h: 74 };

export const TITLE_Y = 33;
export const COST_Y_OFFSET = 12;
export const DESC_CENTER_Y = 610;
export const DESC_LINE_HEIGHT = 42;
export const DESC_MAX_WIDTH = 480;
export const MAX_DESC_LINES = 8;

export const GREEN_TEXT = "rgba(127, 255, 0, 1)";
export const GREEN_STROKE = "rgba(50, 80, 0, 1)";

export const DEFAULT_BANNER_HSV: Record<string, HsvAdjust> = {
  basic: { h: 1, s: 0, v: 0.85 },
  common: { h: 1, s: 0, v: 0.85 },
  uncommon: { h: 1, s: 1, v: 1 },
  rare: { h: 0.563, s: 1.198, v: 1.14 },
  curse: { h: 0.27, s: 1.1, v: 0.9 },
  event: { h: 0.875, s: 0.85, v: 0.9 },
  quest: { h: 0.515, s: 1.727, v: 0.9 },
  status: { h: 0.634, s: 0.35, v: 0.8 },
  ancient: { h: 0, s: 0.2, v: 0.9 },
};

export const LOCKED_CHARACTERS = new Set(["quest", "status", "curse"]);
export const SPECIAL_RARITIES = new Set(["curse", "status", "quest", "event"]);

export function resolveBannerHsv(
  manifest: { bannerHsv?: Record<string, HsvAdjust> },
  rarity: CardRarity,
): HsvAdjust {
  const key = rarity.toLowerCase();
  return (
    manifest.bannerHsv?.[key] ??
    DEFAULT_BANNER_HSV[key] ??
    DEFAULT_BANNER_HSV.common ??
    { h: 1, s: 0, v: 0.85 }
  );
}

export function resolveFrameHsv(
  manifest: { frameHsv?: Record<string, HsvAdjust> },
  characterKey: string,
): HsvAdjust {
  return manifest.frameHsv?.[characterKey] ?? { h: 1, s: 1, v: 1 };
}
