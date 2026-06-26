import type { RelicConfig } from "@shared/types/RelicConfig";
import { Rarity } from "@shared/enums/Rarity";
import { CharacterClass } from "@shared/enums/CharacterClass";

export const RELIC_CONFIGS: RelicConfig[] = [
  {
    id: "golden_circlet",
    name: "金箍",
    description: "战斗开始时，获得2层力量",
    rarity: Rarity.Basic,
    characterClass: CharacterClass.SunWukong,
    effects: [
      {
        effectType: "buff",
        condition: { event: "battle_start" },
      },
    ],
    unique: true,
  },
  {
    id: "monk_robe",
    name: "锦斓袈裟",
    description: "每回合获得3点格挡",
    rarity: Rarity.Basic,
    characterClass: CharacterClass.TangSanzang,
    effects: [
      {
        effectType: "block",
        value: 3,
        condition: { event: "turn_start" },
      },
    ],
    unique: true,
  },
  {
    id: "nine_tooth_rake",
    name: "九齿钉耙",
    description: "每造成5点伤害，获得1点生命",
    rarity: Rarity.Basic,
    characterClass: CharacterClass.ZhuBajie,
    effects: [
      {
        effectType: "heal",
        condition: { event: "damage_dealt" },
      },
    ],
    unique: true,
  },
  {
    id: "demon_skull_necklace",
    name: "降魔宝珠",
    description: "战斗开始时，对所有敌人施加1层易伤",
    rarity: Rarity.Basic,
    characterClass: CharacterClass.ShaWujing,
    effects: [
      {
        effectType: "debuff",
        condition: { event: "battle_start" },
      },
    ],
    unique: true,
  },
  {
    id: "dragon_scale",
    name: "龙鳞",
    description: "每回合获得2点能量",
    rarity: Rarity.Basic,
    characterClass: CharacterClass.WhiteDragonHorse,
    effects: [
      {
        effectType: "energy",
        value: 2,
        condition: { event: "turn_start" },
      },
    ],
    unique: true,
  },
  {
    id: "jade_pearl",
    name: "定风珠",
    description: "受到伤害时，有50%几率只承受一半",
    rarity: Rarity.Common,
    effects: [
      {
        effectType: "block",
        condition: { event: "damage_taken" },
      },
    ],
  },
  {
    id: "purple_gourd",
    name: "紫金葫芦",
    description: "每击败3个敌人，获得1张随机牌",
    rarity: Rarity.Uncommon,
    effects: [
      {
        effectType: "draw_card",
        condition: { event: "enemy_defeated" },
      },
    ],
  },
  {
    id: "lotus_flower",
    name: "莲花宝座",
    description: "休息处额外恢复10点生命",
    rarity: Rarity.Uncommon,
    effects: [],
  },
];
