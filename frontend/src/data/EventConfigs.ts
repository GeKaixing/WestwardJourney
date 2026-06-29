import type { EventConfig } from "@shared/types/EventConfig";

export const EVENT_CONFIGS: EventConfig[] = [
  {
    id: "abyssal_baths",
    title: "深渊溶洞",
    description: "熔岩在深渊裂隙中流淌，空气中弥漫着硫磺的味道。魔龙曾在此蛰伏，它的余烬仍在地脉中燃烧。",
    image: "/assets/events/abyssal_baths.png",
    choices: [
      {
        label: "汲取余烬",
        description: "吸收深渊之力，但会被灼伤",
        effects: [{ effectType: "heal", value: 10 }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "amalgamator",
    title: "黄金熔炉",
    description: "一座辉金帝国留下的熔炉仍在运转。它将生物与金属融合，制造出半机械的战争兵器。",
    image: "/assets/events/amalgamator.png",
    choices: [
      {
        label: "调查熔炉",
        description: "也许能找到强化物品",
        effects: [{ effectType: "damage", value: 8 }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "aroma_of_chaos",
    title: "混沌裂口",
    description: "空间被撕裂了一道口子，现实与深渊在此交汇。龙晶的力量在此处最为薄弱。",
    image: "/assets/events/aroma_of_chaos.png",
    choices: [
      {
        label: "深入裂隙",
        description: "寻找时空碎片",
        effects: [{ effectType: "gold", value: 50 }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "battleworn_dummy",
    title: "龙骨战场",
    description: "一片巨大的龙骨散落在山谷中。骨龙的遗骸上还残留着战斗的痕迹。",
    image: "/assets/events/battleworn_dummy.png",
    choices: [
      {
        label: "搜寻骨骸",
        description: "从龙骨中获取力量",
        effects: [{ effectType: "cardReward", cardReward: [] }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "brain_leech",
    title: "记忆寄生体",
    description: "一只发光的晶化生物吸附在岩石上。它是被龙晶碎片照射后异变的生灵，体内保存着古老的记忆。",
    image: "/assets/events/brain_leech.png",
    choices: [
      {
        label: "吸收记忆",
        description: "获得远古遗物",
        effects: [{ effectType: "relicReward", relicReward: [] }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "bugslayer",
    title: "巨像猎手",
    description: "一位自称屠龙者的猎人。他并不知道眼前的才是真正的龙族——他猎杀的是辉金帝国制造的机械飞龙。",
    image: "/assets/events/bugslayer.png",
    choices: [
      {
        label: "揭露真相",
        description: "告知他真相，获得帮助",
        effects: [{ effectType: "heal", value: 15 }, { effectType: "cardReward", cardReward: [] }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "byrdonis_nest",
    title: "风暴巢穴",
    description: "悬崖之巅，一个由闪电雕刻而成的巢穴。风暴龙的余力在此化作永不停息的雷暴。",
    image: "/assets/events/byrdonis_nest.png",
    choices: [
      {
        label: "触碰雷霆",
        description: "承受雷电洗礼，获得金币",
        effects: [{ effectType: "damage", value: 5 }, { effectType: "gold", value: 80 }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "colorful_philosophers",
    title: "龙语学者",
    description: "一群研究上古龙语的学者。他们从遗迹中破译了部分龙族文字，但无法理解其中蕴含的力量。",
    image: "/assets/events/colorful_philosophers.png",
    choices: [
      {
        label: "展示龙之力",
        description: "用力量换取知识，但消耗精力",
        effects: [{ effectType: "relicReward", relicReward: [] }, { effectType: "damage", value: 10 }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "colossal_flower",
    title: "龙血花",
    description: "一朵吸收了五龙之血的魔花。它的花瓣流动着五种颜色的光芒，散发着古老而强大的气息。",
    image: "/assets/events/colossal_flower.png",
    choices: [
      {
        label: "汲取花露",
        description: "吸收龙血花的治愈之力",
        effects: [{ effectType: "heal", value: 20 }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "crystal_sphere",
    title: "龙晶碎片",
    description: "一块从龙晶上剥落的碎片悬浮在空中。它散发着柔和的紫光，周围的时空在它周围扭曲。",
    image: "/assets/events/crystal_sphere.png",
    choices: [
      {
        label: "触碰碎片",
        description: "获得力量与财富",
        effects: [{ effectType: "gold", value: 30 }, { effectType: "cardReward", cardReward: [] }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "dense_vegetation",
    title: "古龙森林",
    description: "一片被龙族魔法滋养了千年的古森林。树木高耸入云，树根下埋藏着远古的秘密。",
    image: "/assets/events/dense_vegetation.png",
    choices: [
      {
        label: "探索森林",
        description: "寻找远古之泉",
        effects: [{ effectType: "heal", value: 10 }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "doll_room",
    title: "炼金工坊",
    description: "一座废弃的辉金帝国炼金实验室。人形的金属傀儡仍在本能地重复着千年前的操作。",
    image: "/assets/events/doll_room.png",
    choices: [
      {
        label: "搜索实验室",
        description: "触发防防御机关",
        effects: [{ effectType: "damage", value: 8 }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "doors_of_light_and_dark",
    title: "龙魂之门",
    description: "两座巨大的石门矗立在你面前——一扇刻着仙龙的纹章，另一扇刻着魔龙的烙印。",
    image: "/assets/events/doors_of_light_and_dark.png",
    choices: [
      {
        label: "推开石门",
        description: "发现古老财宝",
        effects: [{ effectType: "gold", value: 50 }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "drowning_beacon",
    title: "沉没龙塔",
    description: "一座龙族古塔沉没在沼泽中。塔顶的龙火灯仍在燃烧，在浓雾中指引着什么。",
    image: "/assets/events/drowning_beacon.png",
    choices: [
      {
        label: "潜入塔中",
        description: "搜寻失传的龙族卡牌",
        effects: [{ effectType: "cardReward", cardReward: [] }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "endless_conveyor",
    title: "黄金生产线",
    description: "辉金帝国的自动化生产线仍在运作，日夜不停地铸造着黄金兵器的躯体。",
    image: "/assets/events/endless_conveyor.png",
    choices: [
      {
        label: "潜入生产线",
        description: "盗取辉金遗物",
        effects: [{ effectType: "relicReward", relicReward: [] }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "field_of_man_sized_holes",
    title: "龙陨坑",
    description: "地面上遍布着巨大的坑洞——那是远古巨龙陨落时砸出的痕迹。坑底凝结着龙血的结晶。",
    image: "/assets/events/field_of_man_sized_holes.png",
    choices: [
      {
        label: "收集结晶",
        description: "龙血结晶蕴含力量",
        effects: [{ effectType: "heal", value: 15 }, { effectType: "cardReward", cardReward: [] }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "grave_of_the_forgotten",
    title: "无名龙墓",
    description: "一座没有铭文的龙族墓碑。骨龙曾在这里埋葬了一位在战争中逝去的同伴。墓碑上只有一行爪痕。",
    image: "/assets/events/grave_of_the_forgotten.png",
    choices: [
      {
        label: "祭奠亡者",
        description: "获得龙族祝福",
        effects: [{ effectType: "damage", value: 5 }, { effectType: "gold", value: 80 }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "hungry_for_mushrooms",
    title: "龙息菌",
    description: "一片在风暴龙吐息中变异的大型真菌。它们释放的孢子能短时间内强化肉体。",
    image: "/assets/events/hungry_for_mushrooms.png",
    choices: [
      {
        label: "采集孢子",
        description: "获得遗物但可能中毒",
        effects: [{ effectType: "relicReward", relicReward: [] }, { effectType: "damage", value: 10 }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "infested_automaton",
    title: "腐化傀儡",
    description: "一台被深渊能量侵蚀的黄金傀儡。它的核心仍在运转，但已经被魔龙的混沌之力扭曲。",
    image: "/assets/events/infested_automaton.png",
    choices: [
      {
        label: "净化核心",
        description: "释放其中储存的能量",
        effects: [{ effectType: "heal", value: 20 }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "jungle_maze_adventure",
    title: "龙纹迷宫",
    description: "由远古龙族建造的试炼迷宫。墙壁上刻满了龙语的指引与警告。",
    image: "/assets/events/jungle_maze_adventure.png",
    choices: [
      {
        label: "挑战迷宫",
        description: "通过试炼获得奖励",
        effects: [{ effectType: "gold", value: 30 }, { effectType: "cardReward", cardReward: [] }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "lost_wisp",
    title: "龙魂残影",
    description: "一条远古龙族的灵魂残影在此徘徊。它似乎迷失在了轮回的间隙中。",
    image: "/assets/events/lost_wisp.png",
    choices: [
      {
        label: "安抚残魂",
        description: "龙魂的感激化为治愈之力",
        effects: [{ effectType: "heal", value: 10 }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "luminous_choir",
    title: "仙龙遗迹",
    description: "仙龙曾在此建立了一座圣殿。即使千年过去，圣光仍未消散，空中回荡着若有若无的龙吟。",
    image: "/assets/events/luminous_choir.png",
    choices: [
      {
        label: "步入圣光",
        description: "承受圣光的净化",
        effects: [{ effectType: "damage", value: 8 }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "morphic_grove",
    title: "扭曲丛林",
    description: "龙晶的力量使这片丛林的时空变得不稳定。树木在生长与腐朽之间循环，现实与记忆在此交织。",
    image: "/assets/events/morphic_grove.png",
    choices: [
      {
        label: "寻找稳定点",
        description: "时空裂隙中藏着金币",
        effects: [{ effectType: "gold", value: 50 }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "potion_courier",
    title: "龙血炼金师",
    description: "一位炼金师发现了龙血的秘密。她正在收集不同属性的龙血来炼制终极药剂。",
    image: "/assets/events/potion_courier.png",
    choices: [
      {
        label: "提供龙血",
        description: "换取炼金卡牌",
        effects: [{ effectType: "cardReward", cardReward: [] }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "punch_off",
    title: "角力大会",
    description: "龙斯拉的崇拜者们举办了一场力量竞赛。他们模仿龙王的战斗方式，以纯粹的肉体力量决出胜负。",
    image: "/assets/events/punch_off.png",
    choices: [
      {
        label: "参加比赛",
        description: "赢得冠军遗物",
        effects: [{ effectType: "relicReward", relicReward: [] }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "ranwid_the_elder",
    title: "轮回行者",
    description: "一位神秘的老人。他似乎知道龙晶和轮回的秘密。他的眼中倒映着无数条时间线。",
    image: "/assets/events/ranwid_the_elder.png",
    choices: [
      {
        label: "聆听教诲",
        description: "获得智慧与力量",
        effects: [{ effectType: "heal", value: 15 }, { effectType: "cardReward", cardReward: [] }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "reflections",
    title: "时光之池",
    description: "一池由龙晶泪水汇聚而成的湖水。水面倒映的不是你的面容，而是前次轮回中的你。",
    image: "/assets/events/reflections.png",
    choices: [
      {
        label: "凝视倒影",
        description: "获取前世的记忆和财富",
        effects: [{ effectType: "damage", value: 5 }, { effectType: "gold", value: 80 }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "relic_trader",
    title: "遗迹商人",
    description: "一个游走在轮回之间的神秘商人。他出售的货物来自不同的时间线——你甚至看到了上一轮回中自己掉落的物品。",
    image: "/assets/events/relic_trader.png",
    choices: [
      {
        label: "交易",
        description: "用生命交换遗物",
        effects: [{ effectType: "relicReward", relicReward: [] }, { effectType: "damage", value: 10 }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "room_full_of_cheese",
    title: "龙族宝库",
    description: "龙斯拉的藏宝室之一。金币和珍宝堆积如山，但守护陷阱也遍布其中。",
    image: "/assets/events/room_full_of_cheese.png",
    choices: [
      {
        label: "翻找宝物",
        description: "找到治疗药剂",
        effects: [{ effectType: "heal", value: 20 }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "round_tea_party",
    title: "精灵茶会",
    description: "一群被龙族魔法启蒙的森林精灵正在举办茶会。它们的茶能唤醒沉睡的力量。",
    image: "/assets/events/round_tea_party.png",
    choices: [
      {
        label: "加入茶会",
        description: "品茶获得灵感",
        effects: [{ effectType: "gold", value: 30 }, { effectType: "cardReward", cardReward: [] }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "sapphire_seed",
    title: "龙晶种子",
    description: "一颗由龙晶碎片培育而成的种子。它在地面上生根发芽，长出了晶莹剔透的晶体枝叶。",
    image: "/assets/events/sapphire_seed.png",
    choices: [
      {
        label: "触碰晶体",
        description: "吸收它的生命能量",
        effects: [{ effectType: "heal", value: 10 }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "self_help_book",
    title: "龙语石板",
    description: "一块记载着龙族战斗技巧的石板。上面的文字虽然古老，但其中蕴含的战斗智慧永不过时。",
    image: "/assets/events/self_help_book.png",
    choices: [
      {
        label: "研读石板",
        description: "承受龙语的冲击",
        effects: [{ effectType: "damage", value: 8 }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "slippery_bridge",
    title: "龙骨桥",
    description: "一座由风暴龙的肋骨搭建而成的天然桥梁。桥下是无尽深渊，桥上风声如龙啸。",
    image: "/assets/events/slippery_bridge.png",
    choices: [
      {
        label: "冒险过桥",
        description: "桥对岸有古代遗物",
        effects: [{ effectType: "gold", value: 50 }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "spiraling_whirlpool",
    title: "时空漩涡",
    description: "龙晶的力量在此处撕开了时空的裂缝。过去的影像与现实交叠，形成了能量的漩涡。",
    image: "/assets/events/spiraling_whirlpool.png",
    choices: [
      {
        label: "进入漩涡",
        description: "穿越时空获取卡牌",
        effects: [{ effectType: "cardReward", cardReward: [] }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "spirit_grafter",
    title: "灵魂嫁接者",
    description: "一个利用龙晶碎片力量进行灵魂实验的法师。他可以将战败敌人的灵魂嫁接到你身上。",
    image: "/assets/events/spirit_grafter.png",
    choices: [
      {
        label: "接受嫁接",
        description: "获得强大的灵魂遗物",
        effects: [{ effectType: "relicReward", relicReward: [] }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "stone_of_all_time",
    title: "永恒龙骨",
    description: "一块巨大的龙骨化石，上面刻满了龙族的年表。这是骨龙用来记录每一次轮回的石碑。",
    image: "/assets/events/stone_of_all_time.png",
    choices: [
      {
        label: "解读年表",
        description: "学习古老战斗技巧",
        effects: [{ effectType: "heal", value: 15 }, { effectType: "cardReward", cardReward: [] }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "sunken_statue",
    title: "辉金残像",
    description: "一座被摧毁的黄金巨像残骸。即使被击碎，它的 fragments 仍在吸收周围的魔法能量。",
    image: "/assets/events/sunken_statue.png",
    choices: [
      {
        label: "破坏残骸",
        description: "从中掠夺能量",
        effects: [{ effectType: "damage", value: 5 }, { effectType: "gold", value: 80 }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "sunken_treasury",
    title: "龙族金库",
    description: "一座被时间掩埋的龙族金库。门口的龙语封印仍然完好无损。",
    image: "/assets/events/sunken_treasury.png",
    choices: [
      {
        label: "破解封印",
        description: "遭遇守护者，但回报丰厚",
        effects: [{ effectType: "relicReward", relicReward: [] }, { effectType: "damage", value: 10 }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "symbiote",
    title: "龙晶共生体",
    description: "一团由纯净龙晶能量构成的活体能量体。它似乎拥有自己的意识，渴望与宿主结合。",
    image: "/assets/events/symbiote.png",
    choices: [
      {
        label: "接纳共生",
        description: "获得强大的治愈力",
        effects: [{ effectType: "heal", value: 20 }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "tablet_of_truth",
    title: "黄金法典",
    description: "一本辉金帝国的古籍。书中记载了黄金巨像的建造蓝图——也许能找到它的弱点。",
    image: "/assets/events/tablet_of_truth.png",
    choices: [
      {
        label: "研究法典",
        description: "获取知识和财富",
        effects: [{ effectType: "gold", value: 30 }, { effectType: "cardReward", cardReward: [] }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "tea_master",
    title: "龙火茶馆",
    description: "一位隐居的龙族后裔开设的茶馆。他用龙火煮茶，据说饮下后能感受到五龙的力量。",
    image: "/assets/events/tea_master.png",
    choices: [
      {
        label: "品茶",
        description: "龙火茶温暖你的身体",
        effects: [{ effectType: "heal", value: 10 }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "the_future_of_potions",
    title: "龙晶炼金术",
    description: "一位炼金大师发现了利用龙晶碎片强化药剂的方法。他正在寻找实验品。",
    image: "/assets/events/the_future_of_potions.png",
    choices: [
      {
        label: "自愿试药",
        description: "承受药剂的副作用",
        effects: [{ effectType: "damage", value: 8 }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "the_legends_were_true",
    title: "龙之圣地",
    description: "传说中五龙诞生之地出现在你面前。这里凝聚着最纯粹的龙族原初之力。",
    image: "/assets/events/the_legends_were_true.png",
    choices: [
      {
        label: "汲取原初之力",
        description: "获得龙族祝福",
        effects: [{ effectType: "gold", value: 50 }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "this_or_that",
    title: "轮回抉择",
    description: "龙晶向你展示了两条未来的分支。每一条都会带来不同的命运碎片。",
    image: "/assets/events/this_or_that.png",
    choices: [
      {
        label: "选择一条路",
        description: "命运会给你回报",
        effects: [{ effectType: "cardReward", cardReward: [] }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "tinker_time",
    title: "龙鳞匠人",
    description: "一位用龙鳞打造装备的工匠。他收集了五龙褪下的鳞片，能打造出独一无二的遗物。",
    image: "/assets/events/tinker_time.png",
    choices: [
      {
        label: "请他打造",
        description: "获得稀有遗物",
        effects: [{ effectType: "relicReward", relicReward: [] }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "trash_heap",
    title: "轮回废墟",
    description: "前次轮回中战斗的遗迹。残破的卡牌和遗物散落一地——有些还残留着能量。",
    image: "/assets/events/trash_heap.png",
    choices: [
      {
        label: "翻找废墟",
        description: "找回遗失的力量",
        effects: [{ effectType: "heal", value: 15 }, { effectType: "cardReward", cardReward: [] }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "trial",
    title: "龙魂试炼",
    description: "一座古老的龙族试炼场。只有拥有龙族血脉者才能进入。通过试炼将获得巨龙之力。",
    image: "/assets/events/trial.png",
    choices: [
      {
        label: "接受试炼",
        description: "通过试炼获得远古馈赠",
        effects: [{ effectType: "damage", value: 5 }, { effectType: "gold", value: 80 }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "unrest_site",
    title: "巨像战场",
    description: "一场与黄金巨像使徒激战后的废墟。空气中弥漫着金色的粉尘——那是被击碎的黄金之躯。",
    image: "/assets/events/unrest_site.png",
    choices: [
      {
        label: "收集金粉",
        description: "金粉可用于强化遗物",
        effects: [{ effectType: "relicReward", relicReward: [] }, { effectType: "damage", value: 10 }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "war_historian_repy",
    title: "辉金档案员",
    description: "一个保存着辉金帝国知识的机械档案员。它认为黄金巨像是伟大的成就——它不知道巨像已经失控。",
    image: "/assets/events/war_historian_repy.png",
    choices: [
      {
        label: "索要情报",
        description: "获取存档中的疗愈代码",
        effects: [{ effectType: "heal", value: 20 }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "waterlogged_scriptorium",
    title: "龙语图书馆",
    description: "一座收藏了无数龙语典籍的图书馆。虽然被时间侵蚀，但其中蕴含的知识仍闪闪发光。",
    image: "/assets/events/waterlogged_scriptorium.png",
    choices: [
      {
        label: "翻阅典籍",
        description: "学习龙族秘术",
        effects: [{ effectType: "gold", value: 30 }, { effectType: "cardReward", cardReward: [] }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "welcome_to_wongos",
    title: "流浪龙商",
    description: "一位自称在轮回中穿梭了上百次的商人。他的货物来自不同的时间线，标签上有各种语言。",
    image: "/assets/events/welcome_to_wongos.png",
    choices: [
      {
        label: "浏览货物",
        description: "买到治疗药剂",
        effects: [{ effectType: "heal", value: 10 }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "wellspring",
    title: "龙泪泉",
    description: "传说中仙龙落泪之处。她的泪水化为永不干涸的泉水，能治愈一切伤痛。",
    image: "/assets/events/wellspring.png",
    choices: [
      {
        label: "饮下泉水",
        description: "承受龙泪中蕴含的悲伤",
        effects: [{ effectType: "damage", value: 8 }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "whispering_hollow",
    title: "龙吟谷",
    description: "当风吹过山谷时，岩石间的孔洞会发出龙吟般的声音。这是风暴龙留给世界的最后歌声。",
    image: "/assets/events/whispering_hollow.png",
    choices: [
      {
        label: "倾听龙吟",
        description: "领悟风暴之力",
        effects: [{ effectType: "gold", value: 50 }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "wood_carvings",
    title: "龙骨雕刻",
    description: "一件用龙骨雕刻而成的艺术品。即使千年过去，龙骨中仍然流淌着微弱的魔力。",
    image: "/assets/events/wood_carvings.png",
    choices: [
      {
        label: "吸收魔力",
        description: "将龙骨之力转化为卡牌",
        effects: [{ effectType: "cardReward", cardReward: [] }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
  {
    id: "zen_weaver",
    title: "命运织者",
    description: "一位能看见时间线的织者。她用龙晶的能量丝线编织着命运之网——她可以帮助你改变轮回的走向。",
    image: "/assets/events/zen_weaver.png",
    choices: [
      {
        label: "重织命运",
        description: "改变因果，获得遗物",
        effects: [{ effectType: "relicReward", relicReward: [] }],
      },
      {
        label: "离开",
        description: "无事发生",
        effects: [],
      },
    ],
  },
];
