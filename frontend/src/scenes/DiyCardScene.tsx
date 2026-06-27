import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  applyCharacterRules,
  useSts2CardRenderer,
  type CardRarity,
  type CardType,
  type Character,
  type DiyCardFormState,
} from "../systems/diyCard";
import { LOCKED_CHARACTERS, SPECIAL_RARITIES } from "../systems/diyCard/constants";

const CARD_TYPES: { value: CardType; label: string }[] = [
  { value: "attack", label: "攻击 Attack" },
  { value: "skill", label: "技能 Skill" },
  { value: "power", label: "能力 Power" },
];

const CHARACTERS: { id: Character; label: string; color: string }[] = [
  { id: "ironclad", label: "铁甲战士", color: "#ef4444" },
  { id: "silent", label: "静默猎手", color: "#22c55e" },
  { id: "defect", label: "故障机器人", color: "#38bdf8" },
  { id: "necrobinder", label: "亡灵契约师", color: "#8b5cf6" },
  { id: "regent", label: "储君", color: "#eab308" },
  { id: "colorless", label: "无色", color: "#a1a1aa" },
  { id: "quest", label: "任务", color: "#f59e0b" },
  { id: "status", label: "状态", color: "#64748b" },
  { id: "curse", label: "诅咒", color: "#7f1d1d" },
];

const BASE_RARITIES: { value: CardRarity; label: string }[] = [
  { value: "basic", label: "基础" },
  { value: "common", label: "普通" },
  { value: "uncommon", label: "罕见" },
  { value: "rare", label: "稀有" },
  { value: "shop", label: "商店" },
  { value: "ancient", label: "先古" },
  { value: "special", label: "特殊" },
  { value: "event", label: "事件" },
];

const DEFAULT_FORM: DiyCardFormState = {
  cardType: "attack",
  character: "ironclad",
  cardRarity: "common",
  cardName: "Strike",
  description: "造成 {6} 点伤害。",
  orbCost: "1",
  starCost: "",
  upgraded: false,
  costGreen: false,
};

function sanitize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-|-$/g, "") || "card";
}

export function DiyCardScene() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<DiyCardFormState>(DEFAULT_FORM);
  const [artworkUrl, setArtworkUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [thievingHopper, setThievingHopper] = useState(false);

  const { canvasRef, assetsReady, isRendering, render, download } = useSts2CardRenderer();
  const lockedCharacter = LOCKED_CHARACTERS.has(form.character);

  const availableRarities = useMemo(() => {
    return BASE_RARITIES.filter((r) => !SPECIAL_RARITIES.has(r.value));
  }, []);

  const update = <K extends keyof DiyCardFormState>(key: K, value: DiyCardFormState[K]) => {
    setForm((prev) => applyCharacterRules({ ...prev, [key]: value }));
  };

  useEffect(() => {
    setForm((prev) => applyCharacterRules(prev));
  }, []);

  const handleFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setArtworkUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setFileName(file.name);
  }, []);

  const clearArtwork = useCallback(() => {
    setArtworkUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  useEffect(() => {
    if (!assetsReady) return;
    render(form, artworkUrl, { thievingHopper, locale: "zh" }).catch(console.error);
  }, [form, artworkUrl, thievingHopper, assetsReady, render]);

  const handleExport = () => {
    const base = sanitize(form.cardName);
    download(thievingHopper ? `thieving-hopper-${base}.png` : `${base}.png`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 lg:flex-row">
        <motion.div
          className="w-full space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 lg:w-[420px]"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold uppercase tracking-wider text-zinc-300">DIY 卡牌生成器</h1>
              <p className="mt-1 text-xs text-zinc-500">STS2 官方模板 · 图集渲染</p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="rounded-lg border border-zinc-700 px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-800"
            >
              ← 返回
            </button>
          </div>

          <Field label="类型">
            <select
              value={form.cardType}
              disabled={lockedCharacter}
              onChange={(e) => update("cardType", e.target.value as CardType)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 disabled:opacity-50"
            >
              {CARD_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>

          <Field label="角色">
            <div className="flex flex-wrap gap-2">
              {CHARACTERS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => update("character", c.id)}
                  className={`rounded-full border-2 px-2 py-1 text-[11px] transition-all ${
                    form.character === c.id
                      ? "border-white bg-zinc-700 text-white"
                      : "border-transparent bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                  title={c.label}
                >
                  <span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="稀有度">
            <select
              value={form.cardRarity}
              disabled={lockedCharacter}
              onChange={(e) => update("cardRarity", e.target.value as CardRarity)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 disabled:opacity-50"
            >
              {availableRarities.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </Field>

          {lockedCharacter && (
            <p className="text-xs text-zinc-500">任务 / 状态 / 诅咒卡池使用官方固定规则，类型与稀有度自动锁定。</p>
          )}

          <Field label="名称">
            <input
              type="text"
              value={form.cardName}
              maxLength={40}
              onChange={(e) => update("cardName", e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200"
              placeholder="Strike"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="能量费用">
              <input
                type="text"
                value={form.orbCost}
                onChange={(e) => update("orbCost", e.target.value.replace(/[^\dXx]/g, "").slice(0, 2))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200"
                placeholder="1"
              />
            </Field>
            {form.character === "regent" && (
              <Field label="星费">
                <input
                  type="text"
                  value={form.starCost}
                  onChange={(e) => update("starCost", e.target.value.replace(/[^\dXx]/g, "").slice(0, 2))}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200"
                  placeholder="1"
                />
              </Field>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={form.upgraded}
                onChange={(e) => update("upgraded", e.target.checked)}
                className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-amber-500"
              />
              <span className="text-xs text-zinc-400">已升级（绿名 +）</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={form.costGreen}
                onChange={(e) => update("costGreen", e.target.checked)}
                className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-green-500"
              />
              <span className="text-xs text-zinc-400">费用数字绿色</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={thievingHopper}
                onChange={(e) => setThievingHopper(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-purple-500"
              />
              <span className="text-xs text-zinc-400">盗宝跳虫效果</span>
            </label>
          </div>

          <Field label="描述">
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={4}
              maxLength={220}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200"
              placeholder="造成 {6} 点伤害。"
            />
            <p className="text-xs text-zinc-500">
              {"{6}"} 高亮 · {"[green]文本[/green]"} 绿色 · {"{Energy:energyIcons(2)}"} 能量图标
            </p>
          </Field>

          <Field label="卡牌立绘">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFile}
              className="hidden"
            />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700"
              >
                选择图片
              </button>
              {fileName && (
                <button
                  onClick={clearArtwork}
                  className="rounded-lg border border-red-800 bg-red-950/50 px-3 py-1.5 text-xs text-red-400 hover:bg-red-900/50"
                >
                  清除
                </button>
              )}
            </div>
            {fileName && <p className="text-xs text-zinc-500">已选择：{fileName}</p>}
          </Field>

          <button
            onClick={handleExport}
            disabled={isRendering || !assetsReady}
            className="mt-2 w-full rounded-lg bg-gradient-to-r from-amber-600 to-yellow-500 px-4 py-2.5 text-sm font-bold text-zinc-900 transition-all hover:from-amber-500 hover:to-yellow-400 disabled:opacity-50"
          >
            {!assetsReady ? "加载模板中…" : isRendering ? "渲染中…" : "下载 PNG"}
          </button>
        </motion.div>

        <motion.div
          className="flex flex-1 flex-col items-center justify-start pt-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="mb-2 flex w-full items-center justify-between px-1">
            <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">预览</h2>
            {isRendering && <span className="animate-pulse text-xs text-amber-400/80">渲染中…</span>}
          </div>
          <div className="relative rounded-xl border border-zinc-800/60 bg-gradient-to-b from-black/50 to-black/30 p-4 shadow-[0_0_60px_rgba(201,160,51,0.04)]">
            <div className="pointer-events-none absolute -inset-3 rounded-2xl bg-amber-500/[0.04] blur-2xl" />
            <canvas
              ref={canvasRef}
              width={726}
              height={924}
              className="h-auto w-full max-w-[420px] rounded-md"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</label>
      {children}
    </div>
  );
}
