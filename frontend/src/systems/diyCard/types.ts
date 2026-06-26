export type CardType = "attack" | "skill" | "power" | "curse" | "status" | "quest";
export type CardRarity =
  | "basic"
  | "common"
  | "uncommon"
  | "rare"
  | "shop"
  | "ancient"
  | "curse"
  | "status"
  | "special"
  | "quest"
  | "event";
export type Character =
  | "ironclad"
  | "silent"
  | "defect"
  | "necrobinder"
  | "regent"
  | "colorless"
  | "quest"
  | "status"
  | "curse";

export interface HsvAdjust {
  h: number;
  s: number;
  v: number;
}

export interface AtlasRegion {
  atlas: number;
  region: { x: number; y: number; w: number; h: number };
}

export interface Sts2Manifest {
  cardW: number;
  cardH: number;
  outW: number;
  outH: number;
  atlases: string[];
  regions: Record<string, AtlasRegion>;
  bannerHsv: Record<string, HsvAdjust>;
  frameHsv: Record<string, HsvAdjust>;
  typePlaque: string;
  fonts: { bold: string; regular: string };
}

export interface DiyCardFormState {
  cardType: CardType;
  character: Character;
  cardRarity: CardRarity;
  cardName: string;
  description: string;
  orbCost: string;
  starCost: string;
  upgraded: boolean;
  costGreen: boolean;
}

export interface RenderOptions {
  thievingHopper?: boolean;
  locale?: string;
}

export interface TemplateKeys {
  frame: string;
  portraitBorder: string | null;
  banner: string;
  energy: string;
}

export type DescSegment =
  | { type: "text"; text: string; yellow?: boolean; green?: boolean }
  | { type: "energyIcon"; count: number }
  | { type: "starIcon"; count: number };

export interface DescLine {
  segments: DescSegment[];
}
