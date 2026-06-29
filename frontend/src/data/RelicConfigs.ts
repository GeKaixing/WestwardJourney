import type { RelicConfig } from "@shared/types/RelicConfig";
import { Rarity } from "@shared/enums/Rarity";
import { CharacterClass } from "@shared/enums/CharacterClass";

export const RELIC_CONFIGS: RelicConfig[] = [
  {
    id: "skull_of_dead",
    name: "亡者颅骨",
    description: "战斗开始时，获得2层力量",
    image: "/assets/relics/circlet.webp",
    rarity: Rarity.Basic,
    characterClass: CharacterClass.BoneDragon,
    effects: [
      {
        effectType: "buff",
        condition: { event: "battle_start" },
      },
    ],
    unique: true,
  },
  {
    id: "heaven_scale_shard",
    name: "天鳞碎片",
    description: "每回合获得3点格挡",
    image: "/assets/relics/distinctive_cape.webp",
    rarity: Rarity.Basic,
    characterClass: CharacterClass.ImmortalDragon,
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
    id: "dragon_core_shard",
    name: "龙晶碎片",
    description: "每造成5点伤害，获得1点生命",
    image: "/assets/relics/archaic_tooth.webp",
    rarity: Rarity.Basic,
    characterClass: CharacterClass.Longsila,
    effects: [
      {
        effectType: "heal",
        condition: { event: "damage_dealt" },
      },
    ],
    unique: true,
  },
  {
    id: "abyss_brand",
    name: "深渊烙印",
    description: "战斗开始时，对所有敌人施加1层易伤",
    image: "/assets/relics/red_skull.webp",
    rarity: Rarity.Basic,
    characterClass: CharacterClass.DemonDragon,
    effects: [
      {
        effectType: "debuff",
        condition: { event: "battle_start" },
      },
    ],
    unique: true,
  },
  {
    id: "eye_of_storm",
    name: "风暴之眼",
    description: "每回合获得2点能量",
    image: "/assets/relics/ring_of_the_drake.webp",
    rarity: Rarity.Basic,
    characterClass: CharacterClass.StormDragon,
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
    image: "/assets/relics/golden_pearl.webp",
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
    image: "/assets/relics/demon_tongue.webp",
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
    image: "/assets/relics/happy_flower.webp",
    rarity: Rarity.Uncommon,
    effects: [],
  },
];
