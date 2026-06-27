import type { EventConfig } from "@shared/types/EventConfig";

export const EVENT_CONFIGS: EventConfig[] = [
  {
    id: "abyssal_baths",
    title: "深渊浴场",
    description: "深渊中有一池散发着幽光的水。跳入其中或许能获得祝福。",
    image: "/assets/events/abyssal_baths.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "融合怪",
    description: "一个奇怪的机器正在嗡嗡作响，似乎可以将两张卡牌融合。",
    image: "/assets/events/amalgamator.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "混沌之香",
    description: "一股奇异的香气飘来，闻到后你感觉身体发生了变化。",
    image: "/assets/events/aroma_of_chaos.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "战痕木偶",
    description: "一个满是伤痕的训练木偶立在路边。也许它身上还有有用的东西。",
    image: "/assets/events/battleworn_dummy.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "吸脑虫",
    description: "一只发光的虫子向你爬来，它似乎想要钻进你的脑袋。",
    image: "/assets/events/brain_leech.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "除虫师",
    description: "一位猎虫人正在展示他的战利品。他愿意用宝贝换取你的帮助。",
    image: "/assets/events/bugslayer.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "鸟巢",
    description: "你发现了一个巨大的鸟巢，里面有几颗闪闪发光的蛋。",
    image: "/assets/events/byrdonis_nest.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "多彩哲人",
    description: "一群穿着彩色长袍的哲人正在辩论。他们邀请你加入。",
    image: "/assets/events/colorful_philosophers.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "巨花",
    description: "一朵巨大的花朵挡住了去路。它的花瓣蕴含着神秘的力量。",
    image: "/assets/events/colossal_flower.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "水晶球",
    description: "一个闪烁着神秘光芒的水晶球出现在你面前。",
    image: "/assets/events/crystal_sphere.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "密林",
    description: "茂密的丛林遮蔽了天空。你感觉有什么东西在注视着你。",
    image: "/assets/events/dense_vegetation.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "人偶屋",
    description: "一间堆满了人偶的房间。这些人偶的眼睛似乎在跟随你。",
    image: "/assets/events/doll_room.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "光暗之门",
    description: "两扇门出现在你面前，一扇散发着白光，另一扇笼罩在黑暗中。",
    image: "/assets/events/doors_of_light_and_dark.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "溺水灯塔",
    description: "一座灯塔矗立在沼泽中，它的光芒似乎在召唤着什么。",
    image: "/assets/events/drowning_beacon.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "无尽传送带",
    description: "一条永不停歇的传送带，上面运送着各种奇怪的物品。",
    image: "/assets/events/endless_conveyor.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "巨坑原野",
    description: "一片遍布巨大坑洞的原野。坑底似乎有东西在发光。",
    image: "/assets/events/field_of_man_sized_holes.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "遗忘之墓",
    description: "一座无名墓碑孤零零地立在路边。碑文已经模糊不清。",
    image: "/assets/events/grave_of_the_forgotten.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "饥饿蘑菇",
    description: "你发现了一圈发光的蘑菇。传说这是妖精的舞池。",
    image: "/assets/events/hungry_for_mushrooms.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "寄生机关",
    description: "一台废弃的机械装置，内部爬满了奇怪的虫子。",
    image: "/assets/events/infested_automaton.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "丛林迷宫",
    description: "你进入了丛林迷宫。据说深处藏着宝藏，但也有危险。",
    image: "/assets/events/jungle_maze_adventure.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "迷途精灵",
    description: "一只迷路的精灵在空中飘荡。它似乎在寻找回家的路。",
    image: "/assets/events/lost_wisp.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "光之合唱",
    description: "一束神圣的光芒从天而降，伴随着悠扬的歌声。",
    image: "/assets/events/luminous_choir.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "变形林",
    description: "一片会变形的树林。树木的位置似乎在不断变化。",
    image: "/assets/events/morphic_grove.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "药水信使",
    description: "一位药水快递员正在寻找愿意帮忙送药的冒险者。",
    image: "/assets/events/potion_courier.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "拳击大赛",
    description: "一场拳击比赛正在举行。参加比赛可以获得丰厚的奖励。",
    image: "/assets/events/punch_off.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "长者兰维德",
    description: "一位云游僧人拦住了你的去路。他微笑着问你是否愿意听他讲一段经文。",
    image: "/assets/events/ranwid_the_elder.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "镜中倒影",
    description: "一池平静的水面映照出你的倒影。但倒影似乎在对你说话。",
    image: "/assets/events/reflections.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "遗物商人",
    description: "一个看似友善的商人拦住了你。他展示着各种宝贝。",
    image: "/assets/events/relic_trader.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "满屋奶酪",
    description: "一间堆满了奶酪的房间。这些奶酪散发着诱人的香气。",
    image: "/assets/events/room_full_of_cheese.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "圆形茶会",
    description: "一群小动物正在举办茶会。它们邀请你加入。",
    image: "/assets/events/round_tea_party.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "蓝宝石种子",
    description: "一颗闪闪发光的蓝宝石种子。种下它或许能长出特别的东西。",
    image: "/assets/events/sapphire_seed.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "自助宝典",
    description: "一本破旧的自助书籍。里面记载着一些实用的技巧。",
    image: "/assets/events/self_help_book.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "滑桥",
    description: "一座滑溜溜的桥横跨深渊。桥的对面似乎有什么东西。",
    image: "/assets/events/slippery_bridge.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "螺旋漩涡",
    description: "一个巨大的漩涡在水中旋转。漩涡中心闪烁着奇异的光芒。",
    image: "/assets/events/spiraling_whirlpool.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "灵魂嫁接师",
    description: "一位灵魂嫁接师正在寻找志愿者。他可以将强大的灵魂移植到你体内。",
    image: "/assets/events/spirit_grafter.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "永恒之石",
    description: "一块古老的石头，上面刻满了神秘的符文。",
    image: "/assets/events/stone_of_all_time.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "沉没雕像",
    description: "一尊沉没在水中的雕像。雕像的眼睛似乎在发光。",
    image: "/assets/events/sunken_statue.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "沉没宝库",
    description: "你发现了一个沉没的宝库。里面似乎还有值钱的东西。",
    image: "/assets/events/sunken_treasury.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "共生体",
    description: "一个发光的共生体漂浮在空中。它似乎想要依附在你身上。",
    image: "/assets/events/symbiote.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "真理石板",
    description: "一块刻着古老文字的石板。阅读上面的文字可能会改变命运。",
    image: "/assets/events/tablet_of_truth.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "茶道大师",
    description: "一位茶道大师正在泡茶。他的茶据说有神奇的功效。",
    image: "/assets/events/tea_master.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "药水未来",
    description: "一位预言家正在展示他发明的新式药水。",
    image: "/assets/events/the_future_of_potions.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "传说成真",
    description: "传说中的圣地出现在你面前。这里真的有宝藏吗？",
    image: "/assets/events/the_legends_were_true.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "二选一",
    description: "你必须在两个选项中做出选择。每个选择都会带来不同的后果。",
    image: "/assets/events/this_or_that.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "修补时光",
    description: "一位修补匠正在修理他的工具。他愿意帮你强化装备。",
    image: "/assets/events/tinker_time.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "垃圾堆",
    description: "一座巨大的垃圾堆。也许能在里面找到有用的东西。",
    image: "/assets/events/trash_heap.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "试炼",
    description: "一个古老的试炼场。通过试炼可以获得强大的力量。",
    image: "/assets/events/trial.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "骚乱之地",
    description: "一片骚乱的战场遗迹。这里似乎还残留着战斗的痕迹。",
    image: "/assets/events/unrest_site.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "战争史官",
    description: "一位战争史官正在收集战场上的遗物。他愿意用宝贝交换。",
    image: "/assets/events/war_historian_repy.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "水浸书阁",
    description: "一座被水淹没的图书馆。里面可能还保存着珍贵的书籍。",
    image: "/assets/events/waterlogged_scriptorium.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "欢迎来到旺果",
    description: "欢迎来到旺果的神秘商店。这里应有尽有。",
    image: "/assets/events/welcome_to_wongos.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "灵泉",
    description: "一汪清澈的泉水散发着淡淡的蓝光。据说饮下泉水能净化身心。",
    image: "/assets/events/wellspring.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "低语山谷",
    description: "一个会低语的山谷。风声中似乎隐藏着古老的秘密。",
    image: "/assets/events/whispering_hollow.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "木雕",
    description: "一些精美的木雕作品。每一件都蕴含着独特的魔力。",
    image: "/assets/events/wood_carvings.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
    title: "禅织者",
    description: "一位禅织者正在编织命运之网。她可以为你编织新的未来。",
    image: "/assets/events/zen_weaver.png",
    choices: [
      {
        label: "探索",
        description: "深入探索这个事件",
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
