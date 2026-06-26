import { BuffType } from "@shared/enums/BuffType";
import { BuffStackBehavior } from "@shared/types/BuffConfig";
import type { BuffConfig } from "@shared/types/BuffConfig";

export const BUFF_CONFIGS: Record<BuffType, BuffConfig> = {
  [BuffType.Strength]: {
    type: BuffType.Strength,
    name: "力量",
    description: "每次攻击造成额外伤害",
    isDebuff: false,
    stackBehavior: BuffStackBehavior.Additive,
    applyEffect: {
      effectType: "damage_modifier",
      valuePerStack: 1,
    },
  },
  [BuffType.Dexterity]: {
    type: BuffType.Dexterity,
    name: "敏捷",
    description: "每层获得额外格挡",
    isDebuff: false,
    stackBehavior: BuffStackBehavior.Additive,
    applyEffect: {
      effectType: "block_modifier",
      valuePerStack: 1,
    },
  },
  [BuffType.Vulnerable]: {
    type: BuffType.Vulnerable,
    name: "易伤",
    description: "受到的伤害增加50%",
    isDebuff: true,
    stackBehavior: BuffStackBehavior.MaxRefresh,
    maxStacks: 1,
  },
  [BuffType.Weak]: {
    type: BuffType.Weak,
    name: "虚弱",
    description: "造成的伤害降低25%",
    isDebuff: true,
    stackBehavior: BuffStackBehavior.MaxRefresh,
    maxStacks: 1,
  },
  [BuffType.Block]: {
    type: BuffType.Block,
    name: "格挡",
    description: "每层格挡抵挡1点伤害",
    isDebuff: false,
    stackBehavior: BuffStackBehavior.Additive,
  },
  [BuffType.Poison]: {
    type: BuffType.Poison,
    name: "中毒",
    description: "回合开始时受到等同于层数的伤害，层数减半",
    isDebuff: true,
    stackBehavior: BuffStackBehavior.Additive,
    onTurnEnd: {
      effectType: "damage",
      valuePerStack: 1,
      removeOnTrigger: true,
    },
  },
  [BuffType.Ritual]: {
    type: BuffType.Ritual,
    name: "仪式",
    description: "回合结束时获得1层力量",
    isDebuff: false,
    stackBehavior: BuffStackBehavior.Intensity,
    onTurnEnd: {
      effectType: "buff",
      valuePerStack: 1,
    },
  },
  [BuffType.Thorns]: {
    type: BuffType.Thorns,
    name: "荆棘",
    description: "受到攻击时反弹伤害",
    isDebuff: false,
    stackBehavior: BuffStackBehavior.Additive,
  },
  [BuffType.Regeneration]: {
    type: BuffType.Regeneration,
    name: "再生",
    description: "回合结束时恢复生命",
    isDebuff: false,
    stackBehavior: BuffStackBehavior.Additive,
    onTurnEnd: {
      effectType: "heal",
      valuePerStack: 1,
    },
  },
  [BuffType.Intangible]: {
    type: BuffType.Intangible,
    name: "虚无",
    description: "免疫下一次受到的伤害",
    isDebuff: false,
    stackBehavior: BuffStackBehavior.MaxRefresh,
    maxStacks: 1,
  },
  [BuffType.Stun]: {
    type: BuffType.Stun,
    name: "眩晕",
    description: "跳过下一个回合",
    isDebuff: true,
    stackBehavior: BuffStackBehavior.Additive,
  },
  [BuffType.Taunt]: {
    type: BuffType.Taunt,
    name: "嘲讽",
    description: "强制攻击施加者",
    isDebuff: true,
    stackBehavior: BuffStackBehavior.MaxRefresh,
    maxStacks: 1,
  },
  [BuffType.Chi]: {
    type: BuffType.Chi,
    name: "气",
    description: "每层气使下一张牌费用减少1",
    isDebuff: false,
    stackBehavior: BuffStackBehavior.Additive,
    maxStacks: 10,
  },
  [BuffType.Meditation]: {
    type: BuffType.Meditation,
    name: "禅定",
    description: "每层禅定在回合结束时额外抽1张牌",
    isDebuff: false,
    stackBehavior: BuffStackBehavior.Additive,
    onTurnEnd: {
      effectType: "draw_card",
      valuePerStack: 1,
    },
  },
};
