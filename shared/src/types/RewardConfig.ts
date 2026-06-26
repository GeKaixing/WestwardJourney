import type { Rarity } from "../enums/index.js";

export interface GoldReward {
  base: number;
  variance: number;
}

export interface CardReward {
  count: number;
  rarities: Array<{
    rarity: Rarity;
    weight: number;
  }>;
  characterSpecific?: boolean;
}

export interface RelicReward {
  count: number;
  rarities: Array<{
    rarity: Rarity;
    weight: number;
  }>;
}

export interface PotionReward {
  count: number;
}

export interface RewardConfig {
  gold?: GoldReward;
  cards?: CardReward;
  relic?: RelicReward;
  potion?: PotionReward;
}

export interface EncounterReward {
  baseGold: GoldReward;
  cardRewards: CardReward;
  relicChance: number;
  potionChance: number;
}
