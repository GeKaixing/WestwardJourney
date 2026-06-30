import type { EnemyConfig } from "@shared/types/EnemyConfig";
import { MapNodeType } from "@shared/enums/MapNodeType";

/* ─── T1 杂兵 (floors 0-3) ─── */
const T1: EnemyConfig[] = [
  {
    id: "gold_shard",
    name: "辉金碎片",
    image: "/assets/enemies/sneaky-gremlin.webp",
    spriteId: "monster_archer_grunt",
    health: 22,
    actions: [
      { id: "charge", name: "冲撞", description: "造成5点伤害", effects: [{ effectType: "damage", value: 5 }] },
    ],
    intentPattern: [{ actionId: "charge", weight: 100 }],
  },
  {
    id: "rusty_blade",
    name: "锈蚀刀兵",
    image: "/assets/enemies/sneaky-gremlin.webp",
    spriteId: "monster_goblin",
    health: 26,
    actions: [
      { id: "slash", name: "劈砍", description: "造成6点伤害", effects: [{ effectType: "damage", value: 6 }] },
      { id: "block", name: "举盾", description: "获得4点格挡", effects: [{ effectType: "block", value: 4 }] },
    ],
    intentPattern: [
      { actionId: "slash", weight: 70 },
      { actionId: "block", weight: 30 },
    ],
  },
  {
    id: "wandering_ember",
    name: "游荡余烬",
    image: "/assets/enemies/chomper.webp",
    spriteId: "monster_inferno_spider",
    health: 20,
    actions: [
      {
        id: "scorch", name: "灼烧", description: "造成4点伤害，施加1层灼烧",
        effects: [
          { effectType: "damage", value: 4 },
          { effectType: "debuff", buffType: "burn", buffAmount: 1, buffDuration: 3 },
        ],
      },
    ],
    intentPattern: [{ actionId: "scorch", weight: 100 }],
  },
  {
    id: "stone_fang",
    name: "石牙幼兽",
    image: "/assets/enemies/fat-gremlin.webp",
    spriteId: "monster_mushroom",
    health: 30,
    actions: [
      { id: "bite", name: "撕咬", description: "造成7点伤害", effects: [{ effectType: "damage", value: 7 }] },
      { id: "harden", name: "硬化", description: "获得5点格挡", effects: [{ effectType: "block", value: 5 }] },
    ],
    intentPattern: [
      { actionId: "bite", weight: 60 },
      { actionId: "harden", weight: 40 },
    ],
  },
];

/* ─── T2 精怪 (floors 5-7, 9-11) ─── */
const T2: EnemyConfig[] = [
  {
    id: "gold_scout",
    name: "辉金侦察兵",
    image: "/assets/enemies/sneaky-gremlin.webp",
    spriteId: "monster_scarecrow",
    health: 38,
    actions: [
      { id: "pierce", name: "穿刺", description: "造成8点伤害", effects: [{ effectType: "damage", value: 8 }] },
      {
        id: "mark", name: "标记", description: "获得3层力量",
        effects: [{ effectType: "buff", buffType: "strength", buffAmount: 3, buffDuration: 99 }],
      },
    ],
    intentPattern: [
      { actionId: "pierce", weight: 65 },
      { actionId: "mark", weight: 35 },
    ],
  },
  {
    id: "hex_leech",
    name: "咒术蛭",
    image: "/assets/enemies/chomper.webp",
    spriteId: "monster_squid",
    health: 34,
    actions: [
      {
        id: "shadow_bolt", name: "暗影弹", description: "造成6点伤害，施加2层易伤",
        effects: [
          { effectType: "damage", value: 6 },
          { effectType: "debuff", buffType: "vulnerable", buffAmount: 2, buffDuration: 2 },
        ],
      },
      {
        id: "leech", name: "汲取", description: "造成4点伤害，治疗自身4点",
        effects: [
          { effectType: "damage", value: 4 },
          { effectType: "buff", buffType: "regeneration", buffAmount: 4, buffDuration: 1 },
        ],
      },
    ],
    intentPattern: [
      { actionId: "shadow_bolt", weight: 50 },
      { actionId: "leech", weight: 50 },
    ],
  },
  {
    id: "dual_blade",
    name: "双刃武者",
    image: "/assets/enemies/fat-gremlin.webp",
    spriteId: "monster_phys_imp",
    health: 42,
    actions: [
      {
        id: "sweep", name: "横扫", description: "造成4点伤害，连续攻击2次",
        effects: [{ effectType: "damage", value: 4 }, { effectType: "damage", value: 4 }],
      },
      {
        id: "battle_cry", name: "战吼", description: "获得3点格挡，获得3层力量",
        effects: [
          { effectType: "block", value: 3 },
          { effectType: "buff", buffType: "strength", buffAmount: 3, buffDuration: 99 },
        ],
      },
    ],
    intentPattern: [
      { actionId: "sweep", weight: 60 },
      { actionId: "battle_cry", weight: 40 },
    ],
  },
  {
    id: "rock_turtle",
    name: "岩甲龟",
    image: "/assets/enemies/chomper.webp",
    spriteId: "monster_phys_golem",
    health: 48,
    actions: [
      { id: "headbutt", name: "撞击", description: "造成6点伤害", effects: [{ effectType: "damage", value: 6 }] },
      {
        id: "shell_up", name: "缩壳", description: "获得10点格挡",
        effects: [{ effectType: "block", value: 10 }],
      },
    ],
    intentPattern: [
      { actionId: "headbutt", weight: 40 },
      { actionId: "shell_up", weight: 60 },
    ],
  },
];

/* ─── T3 魔物 (floors 13-15) ─── */
const T3: EnemyConfig[] = [
  {
    id: "gold_executioner",
    name: "辉金行刑者",
    image: "/assets/enemies/fat-gremlin.webp",
    spriteId: "monster_archer_magic",
    health: 58,
    actions: [
      {
        id: "execute", name: "斩首", description: "造成15点伤害",
        effects: [{ effectType: "damage", value: 15 }],
      },
      {
        id: "strangle", name: "绞杀", description: "造成8点伤害，施加2层脆弱",
        effects: [
          { effectType: "damage", value: 8 },
          { effectType: "debuff", buffType: "frail", buffAmount: 2, buffDuration: 2 },
        ],
      },
    ],
    intentPattern: [
      { actionId: "execute", weight: 50 },
      { actionId: "strangle", weight: 50 },
    ],
  },
  {
    id: "corrupted_golem",
    name: "腐化巨像兵",
    image: "/assets/enemies/fat-gremlin.webp",
    spriteId: "monster_magic_golem",
    health: 65,
    actions: [
      {
        id: "slam", name: "重锤", description: "造成12点伤害",
        effects: [{ effectType: "damage", value: 12 }],
      },
      {
        id: "repair", name: "修复", description: "获得8点格挡",
        effects: [{ effectType: "block", value: 8 }],
      },
    ],
    intentPattern: [
      { actionId: "slam", weight: 65 },
      { actionId: "repair", weight: 35 },
    ],
  },
  {
    id: "shadow_soul_eater",
    name: "暗影噬魂者",
    image: "/assets/enemies/chomper.webp",
    spriteId: "monster_head_crab",
    health: 52,
    actions: [
      {
        id: "soul_drain", name: "灵魂汲取", description: "造成8点伤害，治疗自身7点",
        effects: [
          { effectType: "damage", value: 8 },
          { effectType: "buff", buffType: "regeneration", buffAmount: 7, buffDuration: 1 },
        ],
      },
      {
        id: "curse", name: "诅咒", description: "施加3层虚弱",
        effects: [{ effectType: "debuff", buffType: "weak", buffAmount: 3, buffDuration: 2 }],
      },
    ],
    intentPattern: [
      { actionId: "soul_drain", weight: 55 },
      { actionId: "curse", weight: 45 },
    ],
  },
  {
    id: "hellfire_demon",
    name: "狱炎魔",
    image: "/assets/enemies/chomper.webp",
    spriteId: "monster_cloud",
    health: 55,
    actions: [
      {
        id: "hellfire", name: "狱炎", description: "造成7点伤害，施加2层灼烧",
        effects: [
          { effectType: "damage", value: 7 },
          { effectType: "debuff", buffType: "burn", buffAmount: 2, buffDuration: 3 },
        ],
      },
    ],
    intentPattern: [{ actionId: "hellfire", weight: 100 }],
  },
];

/* ─── Elite 头目 (floors 4, 8, 12) ─── */
const ELITES: EnemyConfig[] = [
  {
    id: "gold_centurion",
    name: "辉金百夫长",
    image: "/assets/enemies/fat-gremlin.webp",
    spriteId: "monster_mr_smashy",
    health: 70,
    buffs: [{ buffType: "strength", amount: 4, duration: 99 }],
    isElite: true,
    actions: [
      { id: "strike", name: "挥击", description: "造成8点伤害", effects: [{ effectType: "damage", value: 8 }] },
      {
        id: "cleave", name: "破阵斩", description: "造成18点伤害",
        effects: [{ effectType: "damage", value: 18 }],
        // ponytail: only used every 3 turns via minTurn
      },
    ],
    intentPattern: [
      { actionId: "strike", weight: 70 },
      { actionId: "cleave", weight: 30, minTurn: 3 },
    ],
  },
  {
    id: "elemental_aggregate",
    name: "元素聚合体",
    image: "/assets/enemies/chomper.webp",
    spriteId: "monster_man_eating_plant",
    health: 80,
    buffs: [{ buffType: "regeneration", amount: 6, duration: 99 }],
    isElite: true,
    actions: [
      { id: "frost", name: "冰刺", description: "造成7点伤害，获得5点格挡", effects: [{ effectType: "damage", value: 7 }, { effectType: "block", value: 5 }] },
      { id: "flame_burst", name: "炎爆", description: "造成6点伤害，连续攻击2次", effects: [{ effectType: "damage", value: 6 }, { effectType: "damage", value: 6 }] },
    ],
    intentPattern: [
      { actionId: "frost", weight: 50 },
      { actionId: "flame_burst", weight: 50 },
    ],
  },
  {
    id: "abyss_watcher",
    name: "深渊监视者",
    image: "/assets/enemies/fat-gremlin.webp",
    spriteId: "monster_skeleton_deer",
    health: 90,
    buffs: [{ buffType: "thorns", amount: 4, duration: 99 }],
    isElite: true,
    actions: [
      { id: "gaze", name: "凝视", description: "造成10点伤害", effects: [{ effectType: "damage", value: 10 }] },
      {
        id: "void_slash", name: "虚空斩", description: "造成7点伤害，施加1层易伤",
        effects: [
          { effectType: "damage", value: 7 },
          { effectType: "debuff", buffType: "vulnerable", buffAmount: 1, buffDuration: 3 },
        ],
      },
    ],
    intentPattern: [
      { actionId: "gaze", weight: 60 },
      { actionId: "void_slash", weight: 40 },
    ],
  },
];

/* ─── Boss 守关 (floor 16) ─── */
const BOSSES: EnemyConfig[] = [
  {
    id: "colossus_projection",
    name: "黄金巨像的投影",
    description: "黄金巨像降下的一道投影，拥有本体部分力量",
    image: "/assets/enemies/fat-gremlin.webp",
    spriteId: "bosspit_gold_colossus",
    health: 150,
    buffs: [{ buffType: "barricade", amount: 1, duration: 99 }],
    isBoss: true,
    actions: [
      {
        id: "golden_ray", name: "黄金射线", description: "造成10点伤害，施加1层脆弱",
        effects: [
          { effectType: "damage", value: 10 },
          { effectType: "debuff", buffType: "frail", buffAmount: 1, buffDuration: 2 },
        ],
      },
      {
        id: "radiance", name: "耀光", description: "造成15点伤害",
        effects: [{ effectType: "damage", value: 15 }],
      },
      {
        id: "fissure", name: "裂地", description: "造成12点伤害",
        effects: [{ effectType: "damage", value: 12 }],
      },
      {
        id: "energy_burst", name: "能量爆发", description: "造成8点伤害",
        effects: [{ effectType: "damage", value: 8 }],
      },
    ],
    intentPattern: [
      { actionId: "golden_ray", weight: 35 },
      { actionId: "radiance", weight: 25, minTurn: 3 },
      { actionId: "fissure", weight: 25, minTurn: 2 },
      { actionId: "energy_burst", weight: 15, minTurn: 4 },
    ],
  },
];

/* ─── 导出所有配置 ─── */
export const ENEMY_CONFIGS: EnemyConfig[] = [...T1, ...T2, ...T3, ...ELITES, ...BOSSES];

/* ─── 楼层到难度阶的映射 ─── */
const FLOOR_TIER: Record<number, EnemyConfig[]> = {
  0: T1, 1: T1, 2: T1, 3: T1,
  5: T2, 6: T2, 7: T2,
  9: T2, 10: T2, 11: T2,
  13: T3, 14: T3, 15: T3,
};

/* ─── 楼层缩放 ─── */
function scaleHp(baseHp: number, floor: number): number {
  return Math.floor(baseHp * (1 + floor * 0.04));
}

function scaleDamage(baseDamage: number, floor: number): number {
  return Math.floor(baseDamage * (1 + floor * 0.03));
}

/* ─── 根据楼层和节点类型选敌 ─── */
export function pickEnemiesForNode(floor: number, nodeType: MapNodeType, excludeIds?: Set<string>): EnemyConfig[] {
  let pool: EnemyConfig[];

  if (nodeType === MapNodeType.Boss) {
    pool = BOSSES;
  } else if (nodeType === MapNodeType.Elite) {
    pool = ELITES;
  } else {
    pool = FLOOR_TIER[floor] ?? T1;
  }

  const available = excludeIds?.size ? pool.filter((e) => !excludeIds.has(e.id)) : pool;
  const pickFrom = available.length > 0 ? available : pool;
  const config = pickFrom[Math.floor(Math.random() * pickFrom.length)];
  if (!config) return [T1[0]!];

  const scaled: EnemyConfig = {
    ...config,
    health: scaleHp(config.health, floor),
    actions: config.actions.map((a) => ({
      ...a,
      effects: a.effects.map((e) =>
        e.effectType === "damage" || e.effectType === "aoe_damage"
          ? { ...e, value: scaleDamage(e.value ?? 0, floor) }
          : e
      ),
    })),
  };

  return [scaled];
}
