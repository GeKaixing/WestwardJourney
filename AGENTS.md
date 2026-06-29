# AGENTS.md — 龙骸纪元 (Dragon Remnants)

## 项目简介

单人 roguelike 卡牌构筑游戏。主题：五条远古巨龙对抗黄金巨像的永世轮回。长期商业化项目（目标 Steam）。无原型代码。

核心玩法：回合制战术战斗、每次运行的卡组构筑、随机生成的地图推进、角色专属卡池、遗物与状态效果、随机事件与奖励、通过程序化内容实现高重玩性。灵感来源于卡牌构筑 roguelike 类型，但采用基于五龙传说的原创设定、机制和内容。

### 故事背景

远古时代，五条原初之龙（骨龙、仙龙、龙斯拉、魔龙、风暴龙）统治世界。远古文明"辉金帝国"铸造了活体神像——黄金巨像，它判定巨龙是"不完美的造物"，发动了净化战争。五龙相继陨落。

末代龙王龙斯拉在临死前将自己和同伴的灵魂绑定在一颗龙晶上，创造了永世轮回——每次巨龙们阵亡，龙晶重置时间，保留部分记忆与力量。玩家必须在黄金巨像完全解析龙晶的秘密之前，集齐五龙之力，终结这场永恒的战争。
## 项目借鉴
杀戮尖塔2：https://store.steampowered.com/app/2868840/Slay_the_Spire_2/  
github开源类似的项目：https://github.com/oskarrough/slaytheweb  
杀戮尖塔2wiki百科：https://slaythespire2.gg/zh  
## 技术栈

- **前端：** React 19, TypeScript, Vite, PixiJS 8, Zustand, React Router, Framer Motion, Tailwind CSS
- **后端：** Node.js, NestJS, TypeScript, PostgreSQL, Prisma, Redis, WebSocket

## 目录结构

```
frontend/
  assets/ components/ scenes/ systems/
  battle/ cards/ enemies/ relics/ events/
  map/ ui/ store/ hooks/ utils/ types/
backend/
  auth/ user/ battle/ card/ relic/
  enemy/ event/ save/ websocket/ common/
```

## 架构约束

- **数据驱动设计** — 卡牌、遗物、敌人、增益、地图、事件、奖励必须全部可配置，绝不硬编码
- **解耦渲染与逻辑** — 游戏逻辑、渲染、网络、持久化为独立层
- **独立的游戏系统** — 战斗系统、行动队列、回合管理器、增益系统、遗物系统、卡牌系统、地图生成器、存档系统、事件系统、奖励系统
- 每个文件单一职责。文件尽量不超过 300 行。
- 将 UI 与业务逻辑分离。
- 组合优于继承。遵循 SOLID/DRY/KISS 原则。
- 始终考虑未来的可扩展性。
- 不要去做兜底设计，直接将错误抛出  
- 每一编写完都有做测试  

## 代码规范

- **文件/类：** PascalCase（`Player.ts`、`BattleScene.ts`）
- **函数/方法：** camelCase（`drawCard()`、`applyBuff()`）
- 全程强类型。禁止使用 `any`。
- 无重复代码。无超大型文件。
- 绝不硬编码游戏数据 — 所有游戏内容使用配置/JSON。

## 命令

```sh
npm run dev          # 启动前端开发服务器（Vite，端口 5173）
npm run build        # 类型检查并构建所有包
npm run lint         # 类型检查前端和后端（不输出文件）
npm run typecheck    # lint 的别名
npm run backend:dev  # 启动 NestJS 开发服务器（端口 3000）
npm run backend:build# 构建 NestJS 后端
npm run prisma:generate  # 生成 Prisma 客户端
npm run prisma:migrate   # 运行 Prisma 迁移（需要 PostgreSQL + DATABASE_URL）
```

**提交前进行类型检查** — `npm run lint` 可及早发现问题。后端构建需要先执行 `prisma:generate`。
