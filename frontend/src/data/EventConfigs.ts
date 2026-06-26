import type { EventConfig } from "@shared/types/EventConfig";

export const EVENT_CONFIGS: EventConfig[] = [
  {
    id: "wandering_monk",
    title: "云游僧人",
    description: "一位云游僧人拦住了你的去路。他微笑着问你是否愿意听他讲一段经文。",
    choices: [
      {
        label: "聆听经文",
        description: "恢复10点生命，获得1张随机牌",
        effects: [
          { effectType: "heal", value: 10 },
          { effectType: "cardReward", cardReward: [] },
        ],
      },
      {
        label: "布施钱财",
        description: "失去30金币，获得1件随机遗物",
        effects: [
          { effectType: "gold", value: -30 },
          { effectType: "relicReward", relicReward: [] },
        ],
      },
      {
        label: "谢绝离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "demon_well",
    title: "妖泉",
    description: "你发现一口散发着妖气的古井。井水泛着不祥的绿光，但似乎蕴含着某种力量。",
    choices: [
      {
        label: "饮用井水",
        description: "失去5点生命，获得1张随机牌",
        effects: [
          { effectType: "damage", value: 5 },
          { effectType: "cardReward", cardReward: [] },
        ],
      },
      {
        label: "封印妖泉",
        description: "获得1件遗物",
        effects: [{ effectType: "relicReward", relicReward: [] }],
      },
      {
        label: "绕道而行",
        description: "无事发生",
        effects: [],
      },
    ],
  },
];
