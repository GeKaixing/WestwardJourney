export const BGM_CONFIG = {
  mainMenu: "/audio/主菜单.mp3",
  shop: "/audio/商人.mp3",
  denseForest: {
    normal: ["/audio/密林小怪1.mp3", "/audio/密林小怪2.mp3"],
    elite: ["/audio/密林精英.mp3"],
    boss: ["/audio/密林boss仪式兽.mp3", "/audio/密林boss同族小队.mp3", "/audio/密林boss墨影幻灵.mp3"],
  },
  nest: {
    normal: ["/audio/巢穴小怪1.mp3", "/audio/巢穴小怪2.mp3"],
    elite: ["/audio/巢穴精英Boss帝王蟹.mp3"],
    boss: ["/audio/巢穴Boss无厌沙虫.mp3", "/audio/巢穴Boss知识恶魔.mp3"],
  },
  darkPort: {
    normal: ["/audio/暗港小怪.mp3"],
    elite: ["/audio/暗港精英BOSS灵魂异鱼乐嘉维林族母.mp3"],
    boss: ["/audio/暗港Boss瀑布巨兽.mp3"],
  },
  glory: {
    normal: ["/audio/荣耀小怪1.mp3", "/audio/荣耀小怪2.mp3"],
    elite: ["/audio/荣耀精英.mp3"],
    boss: ["/audio/荣耀Boss女王.mp3", "/audio/荣耀Boss实验体.mp3"],
  },
} as const;

export type Zone = keyof typeof BGM_CONFIG;
