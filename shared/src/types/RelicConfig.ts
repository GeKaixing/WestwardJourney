import type { Rarity, CharacterClass } from "../enums/index.js";

export interface RelicTriggerCondition {
  event: string;
  condition?: string;
}

export interface RelicEffect {
  effectType: string;
  value?: number;
  target?: string;
  condition?: RelicTriggerCondition;
}

export interface RelicConfig {
  id: string;
  name: string;
  description: string;
  image?: string;
  rarity: Rarity;
  characterClass?: CharacterClass;
  effects: RelicEffect[];
  unique?: boolean;
  replaces?: string;
}
