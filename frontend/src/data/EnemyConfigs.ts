import type { EnemyConfig } from "@shared/types/EnemyConfig";

export const ENEMY_CONFIGS: EnemyConfig[] = [
  {
    id: "mountain_bandit",
    name: "山贼喽啰",
    image: "/assets/enemies/sneaky-gremlin.webp",
    spriteId: "monster_goblin",
    health: 28,
    actions: [
      {
        id: "slash",
        name: "劈砍",
        description: "造成6点伤害",
        effects: [{ effectType: "damage", value: 6 }],
      },
      {
        id: "defensive_stance",
        name: "防御姿态",
        description: "获得4点格挡",
        effects: [{ effectType: "block", value: 4 }],
      },
    ],
    intentPattern: [
      { actionId: "slash", weight: 70 },
      { actionId: "defensive_stance", weight: 30 },
    ],
  },
  {
    id: "bandit_leader",
    name: "山贼头目",
    image: "/assets/enemies/fat-gremlin.webp",
    spriteId: "hero_brute_dragon",
    health: 48,
    actions: [
      {
        id: "heavy_slash",
        name: "重劈",
        description: "造成10点伤害",
        effects: [{ effectType: "damage", value: 10 }],
      },
      {
        id: "rally",
        name: "鼓舞",
        description: "获得6点格挡，获得2层力量",
        effects: [
          { effectType: "block", value: 6 },
          { effectType: "buff", buffType: "strength", buffAmount: 2, buffDuration: 99 },
        ],
      },
    ],
    intentPattern: [
      { actionId: "heavy_slash", weight: 60 },
      { actionId: "rally", weight: 40 },
    ],
    isElite: true,
  },
  {
    id: "yaoguai_scorpion",
    name: "蝎子精",
    image: "/assets/enemies/chomper.webp",
    spriteId: "monster_eyeball",
    health: 36,
    actions: [
      {
        id: "sting",
        name: "毒刺",
        description: "造成5点伤害，施加2层中毒",
        effects: [
          { effectType: "damage", value: 5 },
          { effectType: "debuff", buffType: "poison", buffAmount: 2, buffDuration: 3 },
        ],
      },
      {
        id: "swift_strike",
        name: "快速攻击",
        description: "造成4点伤害，连续攻击2次",
        effects: [
          { effectType: "damage", value: 4 },
          { effectType: "damage", value: 4 },
        ],
      },
    ],
    intentPattern: [
      { actionId: "sting", weight: 50 },
      { actionId: "swift_strike", weight: 50 },
    ],
  },
];
