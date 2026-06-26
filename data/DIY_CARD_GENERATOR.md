# Slay the Spire 2 DIY Card Generator — 源码分析

## 源码文件

| 文件 | 说明 | 大小 |
|------|------|------|
| `data/diy_generator_9716.js` | 原始 webpack chunk（完整 82KB） | 82 KB |
| `data/diy_module_29716.js` | 主 React 组件（表单+渲染） | 64 KB |
| `data/diy_raw_functions.js` | 提取的核心渲染函数 | 4 KB |
| `scripts/diy-card-generator.js` | **可读重建版** — 完整卡牌渲染引擎 | 25 KB |

## 架构总览

```
┌─ React Form ──────────────────────────────────────┐
│  CardType │ CardColor │ Rarity │ Name │ Cost │ ...│
│           Artwork Upload │ Thieving Hopper       │
└──────────────────┬────────────────────────────────┘
                   │  onChange
                   ▼
┌─ Render Pipeline ─────────────────────────────────┐
│  loadImage(url)  →  canvas  →  drawLayer1..N     │
│                           ↓                       │
│                    exportAsPNG()                  │
└───────────────────────────────────────────────────┘
```

## 卡牌生成流程

### 1. 模板资产加载
```
CDN: https://img.slaythespire2.gg/assets/diy-card-templates/{game}/
     {type}-{color}-{rarity}_background.webp
     {type}-{color}-{rarity}_frame.webp
     {type}-{color}-{rarity}_banner.webp
```
- game: `sts1` 或 `sts2`
- type: `attack`, `skill`, `power`, `curse`, `status` 等
- color: `red`, `green`, `blue`, `purple`, `yellow`, `colorless`
- rarity: `basic`, `common`, `uncommon`, `rare`, `shop`, `ancient`, `curse`, `status`, `special`

### 2. 角色颜色映射

| 角色 | 颜色 | HSV 调整 |
|------|------|----------|
| 铁甲战士 Ironclad | red | h=1, s=0, v=0.85 |
| 静默猎手 Silent | green | h=0.35, s=0.80, v=0.85 |
| 故障机器人 Defect | blue | h=0.55, s=0.80, v=0.85 |
| 亡灵契约师 Necrobinder | purple | h=0.75, s=0.80, v=0.85 |
| 储君 Regent | yellow | h=0.12, s=0.80, v=0.85 |
| 无色 Colorless | colorless | h=1, s=0, v=0.85 |

### 3. 绘制顺序（Canvas 2D）

```
Layer 1: Background  — 卡框背景（模板图片）
Layer 2: Artwork     — 用户上传图片（经 HSV 滤镜）
Layer 3: Frame       — 边框叠层（模板图片）
Layer 4: Banner      — 标题/描述横幅（模板图片）
Layer 5: Energy Cost — 能量费用数字+图标
Layer 6: Card Name   — 卡牌名称（描边文字）
Layer 7: Rarity/Type— 稀有度标签
Layer 8: Description — 效果描述（自动换行，含图标嵌入）
Layer 9: (可选) Thieving Hopper 效果
```

### 4. 文字解析 & 图标嵌入

描述文本支持特殊语法：

| 语法 | 效果 |
|------|------|
| `{N}` | 变量占位符（如 `{6}` 表示 6 点伤害） |
| `{color:energyIcons(N)}` | N 个能量图标 |
| `{color:starIcons(N)}` | N 个星标图标 |
| `[E]` | 能量标记 |
| `[G]` | 金币标记 |
| `!D!` / `!M!` / `!B!` | 伤害/敏捷/格挡标记 |
| `NL` | 换行 |

### 5. 导出

- Canvas 尺寸: 1024×1424 → 导出 PNG: 512×712
- 使用 `canvas.toBlob(blob => ..., 'image/png')`
- 文件名: `{card-name-sanitized}.png`
