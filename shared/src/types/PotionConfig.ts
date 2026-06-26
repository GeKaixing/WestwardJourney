import type { PotionType } from "../enums/PotionType";
import type { Rarity } from "../enums/Rarity";

export interface PotionConfig {
  id: string;
  name: string;
  description: string;
  type: PotionType;
  value: number;
  rarity: Rarity;
  price: number;
}
