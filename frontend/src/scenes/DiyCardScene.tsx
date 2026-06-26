import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

type CardType = "attack" | "skill" | "power" | "curse" | "status" | "quest";
type CardRarity = "basic" | "common" | "uncommon" | "rare" | "shop" | "ancient" | "curse" | "status" | "special" | "quest";
type Character = "ironclad" | "silent" | "defect" | "necrobinder" | "regent" | "colorless";

interface FormState {
  cardType: CardType;
  character: Character;
  cardRarity: CardRarity;
  cardName: string;
  description: string;
  cost: string;
  upgraded: boolean;
}

const CARD_TYPES: CardType[] = ["attack", "skill", "power", "curse", "status", "quest"];
const CHARACTERS: { id: Character; label: string; color: string; energyColor: string }[] = [
  { id: "ironclad",    label: "铁甲战士",   color: "#ef4444", energyColor: "#dc2626" },
  { id: "silent",      label: "静默猎手",   color: "#22c55e", energyColor: "#16a34a" },
  { id: "defect",      label: "故障机器人", color: "#38bdf8", energyColor: "#0284c7" },
  { id: "necrobinder", label: "亡灵契约师", color: "#8b5cf6", energyColor: "#7c3aed" },
  { id: "regent",      label: "储君",       color: "#eab308", energyColor: "#ca8a04" },
  { id: "colorless",   label: "无色",       color: "#a1a1aa", energyColor: "#71717a" },
];
const RARITIES: CardRarity[] = ["basic", "common", "uncommon", "rare", "shop", "ancient", "curse", "status", "special", "quest"];

const TYPE_COLORS: Record<string, string> = {
  attack: "#ef4444", skill: "#22c55e", power: "#3b82f6",
  curse: "#a855f7", status: "#64748b", quest: "#eab308",
};

function sanitize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-|-$/g, "") || "card";
}

export function DiyCardScene() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [artworkUrl, setArtworkUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  const [form, setForm] = useState<FormState>({
    cardType: "attack", character: "ironclad", cardRarity: "common",
    cardName: "Strike", description: "Deal {6} damage.", cost: "1", upgraded: false,
  });

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm(p => ({ ...p, [k]: v }));
  const char = CHARACTERS.find(c => c.id === form.character)!;

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setArtworkUrl(prev => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(file); });
  }, []);

  // ─── Render ────────────────────────────────────
  const doRender = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width, H = canvas.height;
    const rc = ++renderCount.current;
    setIsRendering(true);

    try {
      ctx.clearRect(0, 0, W, H);
      const CX = W / 2;

      // Card dimensions
      const cardW = 520, cardH = 740;
      const cardX = (W - cardW) / 2, cardY = (H - cardH) / 2;
      const R = 18; // corner radius

      function roundRect(x: number, y: number, w: number, h: number, r: number) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
      }

      // Card shadow
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 8;
      roundRect(cardX, cardY, cardW, cardH, R);
      ctx.fillStyle = "#1a1a2e";
      ctx.fill();
      ctx.shadowColor = "transparent";

      // Card border with type color
      roundRect(cardX, cardY, cardW, cardH, R);
      ctx.strokeStyle = TYPE_COLORS[form.cardType] || "#888";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Type indicator stripe at top
      roundRect(cardX + 2, cardY + 2, cardW - 4, 6, 3);
      ctx.fillStyle = TYPE_COLORS[form.cardType] || "#888";
      ctx.fill();

      // Art area
      const artX = cardX + 20, artY = cardY + 50, artW = cardW - 40, artH = 320;
      ctx.fillStyle = "#16213e";
      roundRect(artX, artY, artW, artH, 12);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Artwork
      if (artworkUrl) {
        try {
          const img = await new Promise<HTMLImageElement>((res, rej) => {
            const i = new Image();
            i.onload = () => res(i);
            i.onerror = rej;
            i.src = artworkUrl;
          });
          if (rc !== renderCount.current) return;
          // Fit image into art area (cover)
          const scale = Math.max(artW / img.width, artH / img.height);
          const iw = img.width * scale, ih = img.height * scale;
          const ix = artX + (artW - iw) / 2, iy = artY + (artH - ih) / 2;
          ctx.save();
          roundRect(artX, artY, artW, artH, 12);
          ctx.clip();
          ctx.drawImage(img, ix, iy, iw, ih);
          ctx.restore();
        } catch { /* artwork failed to load */ }
      } else {
        // Placeholder
        ctx.fillStyle = "rgba(255,255,255,0.05)";
        ctx.font = "20px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("上传立绘", CX, artY + artH / 2);
      }

      // Energy cost
      const costStr = form.cost === "X" ? "X" : String(Number(form.cost) || 0);
      ctx.save();
      // Cost circle
      const costCX = cardX + cardW - 50, costCY = cardY + 30, costR = 28;
      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(costCX, costCY, costR, 0, Math.PI * 2);
      ctx.fillStyle = form.upgraded ? "#166534" : "#1e293b";
      ctx.fill();
      ctx.strokeStyle = form.upgraded ? "#4ade80" : char.energyColor;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.shadowColor = "transparent";
      ctx.fillStyle = form.upgraded ? "#4ade80" : "#f8fafc";
      ctx.font = `bold ${costStr.length > 1 ? 22 : 28}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(costStr, costCX, costCY);
      ctx.restore();

      // Card name
      const name = form.cardName.trim() || "Unnamed";
      ctx.fillStyle = "#f1f5f9";
      ctx.font = "bold 22px serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      const nameX = cardX + 24, nameY = cardY + 14;
      ctx.fillText(name.toUpperCase(), nameX, nameY);

      // Type / Rarity label
      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px serif";
      ctx.textAlign = "right";
      const typeLabel = `${form.cardType.toUpperCase()} · ${form.cardRarity.toUpperCase()}`;
      ctx.fillText(typeLabel, cardX + cardW - 24, cardY + 16);

      // Description area
      const descX = cardX + 24, descW = cardW - 48;
      const descY = cardY + 50 + artH + 20;
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "15px serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      const desc = form.description.trim() || "Describe your card effect here.";
      const words = desc.split(" ");
      const lines: string[] = [];
      let line = "";
      for (const word of words) {
        const test = line ? line + " " + word : word;
        if (ctx.measureText(test).width <= descW) {
          line = test;
        } else {
          if (line) lines.push(line);
          line = word;
        }
      }
      if (line) lines.push(line);

      lines.forEach((l, i) => ctx.fillText(l, descX, descY + i * 22));

      // Rarity indicator bar at bottom
      const rarityColors: Record<string, string> = {
        basic: "#94a3b8", common: "#64748b", uncommon: "#22c55e",
        rare: "#f59e0b", shop: "#a855f7", ancient: "#ec4899",
        curse: "#7f1d1d", status: "#52525b", special: "#06b6d4", quest: "#eab308",
      };
      const barColor = rarityColors[form.cardRarity] || "#64748b";
      const barY = cardY + cardH - 16;
      ctx.fillStyle = barColor;
      ctx.shadowColor = barColor;
      ctx.shadowBlur = 10;
      roundRect(cardX + 60, barY, cardW - 120, 4, 2);
      ctx.fill();
      ctx.shadowColor = "transparent";

    } finally {
      if (rc === renderCount.current) setIsRendering(false);
    }
  }, [form, artworkUrl]);

  const renderCount = useRef(0);
  useEffect(() => { doRender().catch(e => console.error("[DIY] Render error:", e)); }, [doRender]);

  const handleExport = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sanitize(form.cardName)}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }, [form.cardName]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 lg:flex-row">
        {/* Form */}
        <motion.div className="w-full space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 lg:w-[420px]"
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center justify-between">
            <h1 className="font-bold text-lg uppercase tracking-wider text-zinc-300">DIY 卡牌生成器</h1>
            <button onClick={() => navigate("/")} className="rounded-lg border border-zinc-700 px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-800">← 返回</button>
          </div>

          <Field label="类型">
            <select value={form.cardType} onChange={e => update("cardType", e.target.value as CardType)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200">
              {CARD_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </Field>

          <Field label="角色">
            <div className="flex flex-wrap gap-2">
              {CHARACTERS.map(c => (
                <button key={c.id} onClick={() => update("character", c.id)}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${form.character === c.id ? "scale-110 border-white shadow-lg" : "border-transparent opacity-60 hover:opacity-100"}`}
                  style={{ backgroundColor: c.color }} title={c.label} />
              ))}
            </div>
          </Field>

          <Field label="稀有度">
            <select value={form.cardRarity} onChange={e => update("cardRarity", e.target.value as CardRarity)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200">
              {RARITIES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </Field>

          <Field label="名称">
            <input type="text" value={form.cardName} onChange={e => update("cardName", e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500" placeholder="Strike" />
          </Field>

          <Field label="费用">
            <div className="flex items-center gap-3">
              <input type="text" value={form.cost} onChange={e => update("cost", e.target.value)}
                className="w-20 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200" placeholder="1" />
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={form.upgraded} onChange={e => update("upgraded", e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-amber-500" />
                <span className="text-xs text-zinc-400">已升级</span>
              </label>
            </div>
          </Field>

          <Field label="描述">
            <textarea value={form.description} onChange={e => update("description", e.target.value)} rows={3}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500"
              placeholder='Deal {6} damage.' />
          </Field>

          <Field label="卡牌立绘">
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFile} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()}
              className="rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700">选择图片</button>
            {artworkUrl && (
              <button onClick={() => { setArtworkUrl(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                className="ml-2 rounded-lg border border-red-800 bg-red-950/50 px-3 py-1.5 text-xs text-red-400 hover:bg-red-900/50">清除</button>
            )}
          </Field>

          <button onClick={handleExport} disabled={isRendering}
            className="mt-2 w-full rounded-lg bg-gradient-to-r from-amber-600 to-yellow-500 px-4 py-2.5 text-sm font-bold text-zinc-900 transition-all hover:from-amber-500 hover:to-yellow-400 disabled:opacity-50">
            {isRendering ? "渲染中…" : "下载 PNG"}
          </button>
        </motion.div>

        {/* Preview */}
        <motion.div className="flex flex-1 flex-col items-center justify-start pt-4"
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="mb-2 flex w-full items-center justify-between px-1">
            <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">预览</h2>
            {isRendering && <span className="animate-pulse text-xs text-amber-400/80">渲染中…</span>}
          </div>
          <div className="relative rounded-xl border border-zinc-800/60 bg-gradient-to-b from-black/50 to-black/30 p-4 shadow-[0_0_60px_rgba(201,160,51,0.04)]">
            <div className="absolute -inset-3 rounded-2xl bg-amber-500/[0.04] blur-2xl pointer-events-none" />
            <canvas ref={canvasRef} width={600} height={800} className="h-auto max-w-[400px] w-full rounded-md" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1">
    <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</label>
    {children}
  </div>;
}
