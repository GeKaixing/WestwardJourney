import type { CardType, Rarity, TargetType, CharacterClass } from "../enums/index.js";

export interface CardEffect {
  effectType: string;
  value?: number;
  valuePerUpgrade?: number;
  target?: TargetType;
  buffType?: string;
  buffDuration?: number;
  buffAmount?: number;
  condition?: string;
}

export interface CardConfig {
  id: string;
  name: string;
  description: string;
  upgradedDescription?: string;
  cost: number;
  type: CardType;
  rarity: Rarity;
  targetType: TargetType;
  characterClass?: CharacterClass;
  effects: CardEffect[];
  secondaryEffects?: CardEffect[];
  innate?: boolean;
  exhaust?: boolean;
  ethereal?: boolean;
  retain?: boolean;
  upgradesTo?: string;
}
