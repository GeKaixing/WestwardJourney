import type { PotionConfig } from "@shared/types/PotionConfig";
import { PotionType } from "@shared/enums/PotionType";
import { Rarity } from "@shared/enums/Rarity";

export const POTION_CONFIGS: PotionConfig[] = [
  {
    id: "health_potion",
    name: "活血散",
    description: "恢复 20 点生命",
    type: PotionType.Health,
    value: 20,
    rarity: Rarity.Common,
    price: 50,
  },
  {
    id: "energy_potion",
    name: "回气丹",
    description: "获得 2 点能量",
    type: PotionType.Energy,
    value: 2,
    rarity: Rarity.Common,
    price: 60,
  },
  {
    id: "strength_potion",
    name: "大力丸",
    description: "获得 3 层力量（战斗内）",
    type: PotionType.Strength,
    value: 3,
    rarity: Rarity.Uncommon,
    price: 80,
  },
  {
    id: "block_potion",
    name: "铁甲散",
    description: "获得 12 点格挡",
    type: PotionType.Block,
    value: 12,
    rarity: Rarity.Common,
    price: 50,
  },
  {
    id: "draw_potion",
    name: "灵感露",
    description: "抽 3 张牌",
    type: PotionType.DrawCards,
    value: 3,
    rarity: Rarity.Common,
    price: 60,
  },
  {
    id: "poison_potion",
    name: "毒蟾液",
    description: "对所有敌人施加 4 层中毒",
    type: PotionType.Poison,
    value: 4,
    rarity: Rarity.Uncommon,
    price: 90,
  },
];
