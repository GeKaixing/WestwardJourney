import type { CharacterClass } from "../enums/index.js";

export interface CharacterStats {
  maxHealth: number;
  startingGold: number;
  baseEnergy: number;
  handSize: number;
}

export interface PlayerConfig {
  characterClass: CharacterClass;
  displayName: string;
  description: string;
  stats: CharacterStats;
  startingDeck: string[];
  startingRelic: string;
}
