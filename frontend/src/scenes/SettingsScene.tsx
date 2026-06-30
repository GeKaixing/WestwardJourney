import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore, useSettingsStore } from "../store";
import { buttonClick, updateBGMVolume } from "../systems/sounds";
import { MapGenerator, DEFAULT_MAP_CONFIG } from "../systems/map";
import {
  GiCog,
  GiBrokenSkull,
  GiGamepadCross,
  GiSoundOn,
  GiTv,
  GiReturnArrow,
  GiAnvilImpact,
  GiDiscussion,
  GiSpellBook,
  GiCycle,
  GiSpeedometer,
  GiCardRandom,
  GiSeedling,
} from "react-icons/gi";

type TabId = "game" | "video" | "audio" | "controls";

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabDef[] = [
  { id: "game", label: "游戏", icon: <GiSpellBook /> },
  { id: "video", label: "视频", icon: <GiTv /> },
  { id: "audio", label: "音频", icon: <GiSoundOn /> },
  { id: "controls", label: "操作", icon: <GiGamepadCross /> },
];

const LANGUAGES: { value: "zh" | "en"; label: string }[] = [
  { value: "zh", label: "简体中文" },
  { value: "en", label: "English" },
];

export function SettingsScene() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("game");
  const reset = useGameStore((s) => s.reset);

  const handleAbandonRun = () => {
    if (confirm("确定要放弃本次西行吗？")) {
      reset();
      navigate("/");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-6 bg-dark-950 font-body text-gray-200 select-none overflow-hidden">
      <div className="absolute inset-0 z-0 bg-dark-950 pointer-events-none" />

      <motion.div
        className="relative z-10 flex w-full max-w-6xl flex-col items-center bg-dark-800/80 p-16 rounded-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="flex items-center gap-6 mb-10">
          <div className="relative">
            <div className="absolute inset-0 bg-gold-500/20 blur-xl rounded-full" />
            <GiCog className="relative text-7xl text-gold-400 drop-shadow-lg" />
          </div>
          <h1 className="font-display text-6xl text-gold-400 drop-shadow-[0_0_12px_rgba(252,196,25,0.3)] tracking-wider">
            设置
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex w-full mb-8 gap-1.5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { buttonClick(); setActiveTab(tab.id); }}
              className={`flex-1 flex items-center justify-center gap-3 py-4 text-xl font-bold rounded-2xl transition-all ${
                activeTab === tab.id
                  ? "bg-dark-700/80 text-gold-300 shadow-inner shadow-gold-500/5"
                  : "bg-dark-900/40 text-gray-500 hover:bg-dark-800/60 hover:text-gray-300"
              }`}
            >
              <span className="text-2xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="w-full mb-8 h-[450px] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              className="absolute inset-0 overflow-y-auto custom-scrollbar"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === "game" && <GameTab onAbandon={handleAbandonRun} />}
              {activeTab === "video" && <VideoTab />}
              {activeTab === "audio" && <AudioTab />}
              {activeTab === "controls" && <ControlsTab />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Back */}
        <motion.button
          className="group flex items-center justify-center gap-3 rounded-2xl bg-dark-900/60 px-10 py-4 text-2xl font-bold text-gray-400 transition-all hover:text-gold-400 w-full"
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          <GiReturnArrow className="text-3xl transition-transform group-hover:-translate-x-1" />
          返回
        </motion.button>
      </motion.div>
    </div>
  );
}

/* ─── Game Tab ─── */
function GameTab({ onAbandon }: { onAbandon: () => void }) {
  const run = useGameStore((s) => s.run);
  const {
    language, setLanguage,
    speedMode, setSpeedMode,
    showHandCount, setShowHandCount,
    resetToDefaults,
  } = useSettingsStore();

  return (
    <div className="flex flex-col gap-6">
      <SectionCard>
        <SectionLabel icon={<GiDiscussion />} text="语言 / Language" />
        <div className="flex gap-4 mt-4">
          {LANGUAGES.map((l) => (
            <ChipButton
              key={l.value}
              active={language === l.value}
              onClick={() => setLanguage(l.value)}
            >
              {l.label}
            </ChipButton>
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <ToggleRow label="加速模式" value={speedMode} onChange={setSpeedMode} icon={<GiSpeedometer />} />
        <div className="my-3" />
        <ToggleRow label="显示手牌计数" value={showHandCount} onChange={setShowHandCount} icon={<GiCardRandom />} />
      </SectionCard>

      {/* ponytail: map seed export/import */}
      {run && (
        <SectionCard>
          <SectionLabel icon={<GiSeedling />} text="地图种子" />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="font-mono text-lg text-gold-400">{run.mapSeed}</span>
            <button
              onClick={() => navigator.clipboard.writeText(String(run.mapSeed))}
              className="flex items-center gap-1 rounded-lg bg-dark-700 px-3 py-1.5 text-sm text-gray-300 hover:text-gold-400 hover:bg-dark-600 transition-colors"
            >
              复制
            </button>
            <div className="flex items-center gap-2 ml-2 border-l border-gray-700 pl-3">
              <input
                id="seed-import"
                type="number"
                placeholder="粘贴种子..."
                className="w-28 rounded-lg bg-dark-900 px-2 py-1.5 text-sm text-gold-400 font-mono border border-gray-600 focus:border-gold-500 focus:outline-none"
              />
              <button
                onClick={() => {
                  const input = document.getElementById("seed-import") as HTMLInputElement;
                  const v = Number(input?.value);
                  if (!v || isNaN(v)) return;
                  const map = new MapGenerator(v).generate(DEFAULT_MAP_CONFIG);
                  useGameStore.getState().setMapNodes(map.nodes);
                }}
                className="rounded-lg bg-dark-700 px-3 py-1.5 text-sm text-gray-300 hover:text-gold-400 hover:bg-dark-600 transition-colors"
              >
                导入并重新生成地图
              </button>
            </div>
          </div>
        </SectionCard>
      )}

      <motion.button
        className="group flex items-center justify-center gap-3 rounded-2xl bg-dark-900/60 px-10 py-4 text-xl font-bold text-gray-500 transition-all hover:text-gold-400 w-full"
        onClick={resetToDefaults}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
      >
        <GiCycle className="text-2xl transition-transform group-hover:rotate-180" />
        重置为默认
      </motion.button>

      {run && (
        <div className="pt-4">
          <motion.button
            className="group flex items-center justify-center gap-4 rounded-2xl bg-red-950/20 px-10 py-5 text-3xl font-bold text-red-400 transition-all hover:bg-red-900/30 w-full"
            onClick={onAbandon}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
          >
            <GiBrokenSkull className="text-4xl transition-transform group-hover:rotate-12" />
            <span>放弃本次西行</span>
            <GiAnvilImpact className="text-2xl opacity-0 -translate-x-2 transition-all group-hover:opacity-60 group-hover:translate-x-0" />
          </motion.button>
        </div>
      )}
    </div>
  );
}

/* ─── Video Tab ─── */
function VideoTab() {
  const { windowMode, setWindowMode, resetToDefaults } = useSettingsStore();
  const supported = typeof document !== "undefined" && !!document.documentElement.requestFullscreen;

  useEffect(() => {
    const actual = document.fullscreenElement ? "fullscreen" : "windowed";
    if (windowMode !== actual) setWindowMode(actual);
    const handler = () => setWindowMode(document.fullscreenElement ? "fullscreen" : "windowed");
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const isFullscreen = windowMode === "fullscreen";

  return (
    <div className="flex flex-col gap-6">
      <SectionCard>
        <SectionLabel icon={<GiTv />} text="全屏模式" />
        <div className="mt-4">
          {supported ? (
            <ToggleRow
              label="启用全屏"
              value={isFullscreen}
              onChange={(v) => {
                setWindowMode(v ? "fullscreen" : "windowed");
                try {
                  const p = v ? document.documentElement.requestFullscreen({ navigationUI: "hide" }) : document.exitFullscreen();
                  p.catch(() => setWindowMode(v ? "windowed" : "fullscreen"));
                } catch {
                  setWindowMode(v ? "windowed" : "fullscreen");
                }
              }}
            />
          ) : (
            <p className="text-gray-500">当前浏览器不支持全屏</p>
          )}
        </div>
      </SectionCard>

      <motion.button
        className="group flex items-center justify-center gap-3 rounded-2xl bg-dark-900/60 px-10 py-4 text-xl font-bold text-gray-500 transition-all hover:text-gold-400 w-full"
        onClick={() => {
          resetToDefaults();
          const actual = document.fullscreenElement ? "fullscreen" : "windowed";
          setWindowMode(actual);
        }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
      >
        <GiCycle className="text-2xl transition-transform group-hover:rotate-180" />
        重置为默认
      </motion.button>
    </div>
  );
}

/* ─── Audio Tab ─── */
function AudioTab() {
  const { masterVolume, musicVolume, sfxVolume, setMasterVolume, setMusicVolume, setSfxVolume } =
    useSettingsStore();

  useEffect(() => { updateBGMVolume(); }, [masterVolume, musicVolume]);

  return (
    <div className="flex flex-col gap-5">
      <SectionCard>
        <SliderRow label="主音量" value={masterVolume} onChange={setMasterVolume} />
      </SectionCard>
      <SectionCard>
        <SliderRow label="音乐" value={musicVolume} onChange={setMusicVolume} />
      </SectionCard>
      <SectionCard>
        <SliderRow label="音效" value={sfxVolume} onChange={setSfxVolume} />
      </SectionCard>
    </div>
  );
}

/* ─── Controls Tab ─── */
function ControlsTab() {
  const { keyBindings, setKeyBinding, resetKeyBindings } = useSettingsStore();
  const [editing, setEditing] = useState<string | null>(null);

  const BINDINGS: { action: string; label: string; icon: React.ReactNode }[] = [
    { action: "endTurn", label: "结束回合", icon: <GiReturnArrow /> },
    { action: "drawPile", label: "查看抽牌堆", icon: <GiSpellBook /> },
    { action: "discardPile", label: "查看弃牌堆", icon: <GiDiscussion /> },
    { action: "exhaustPile", label: "查看消耗牌堆", icon: <GiBrokenSkull /> },
    { action: "handSort", label: "整理手牌", icon: <GiGamepadCross /> },
    { action: "pause", label: "暂停", icon: <GiSoundOn /> },
  ];

  const handleKeyDown = (action: string, e: React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const key = e.key === " " ? "Space" : e.key === "Escape" ? "Escape" : e.key.length === 1 ? e.key.toUpperCase() : e.key;
    setKeyBinding(action, key);
    setEditing(null);
  };

  return (
    <div className="flex flex-col gap-3">
      {BINDINGS.map(({ action, label, icon }) => (
        <motion.div
          key={action}
          className="flex items-center justify-between py-3 px-5 rounded-2xl bg-dark-900/50 transition-colors hover:bg-dark-800/60"
          layout
        >
          <div className="flex items-center gap-4">
            <span className="text-gold-500/60 text-xl">{icon}</span>
            <span className="text-xl font-bold text-gray-200">{label}</span>
          </div>
          <button
            className={`relative min-w-[120px] px-4 py-2.5 text-xl font-mono font-bold text-center rounded-xl border transition-all ${
              editing === action
                ? "border-gold-500 bg-gold-900/20 text-gold-400 shadow-[0_0_12px_rgba(252,196,25,0.15)]"
                : "border-gray-700 bg-dark-800 text-gray-300 hover:border-gray-500 hover:bg-dark-700"
            }`}
            onClick={() => setEditing(editing === action ? null : action)}
            onKeyDown={(e) => {
              if (editing === action) {
                handleKeyDown(action, e);
              }
            }}
            onBlur={() => editing === action && setEditing(null)}
            tabIndex={0}
          >
            {editing === action ? (
              <span className="animate-pulse text-gold-400">按下按键...</span>
            ) : (
              <span className="tracking-wide">{keyBindings[action]}</span>
            )}
          </button>
        </motion.div>
      ))}
      <motion.button
        className="mt-4 text-lg text-gray-600 hover:text-gray-400 self-end px-4 py-2 rounded-xl hover:bg-dark-700/50 transition-colors"
        onClick={resetKeyBindings}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        恢复默认
      </motion.button>
    </div>
  );
}

/* ─── Shared UI Components ─── */

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-dark-900/40 p-6 ${className}`}>
      {children}
    </div>
  );
}

function SectionLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-gold-500/60 text-xl">{icon}</span>
      <span className="text-lg font-bold text-gray-500 uppercase tracking-[0.15em]">{text}</span>
    </div>
  );
}

function ChipButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`px-6 py-3 rounded-2xl text-xl font-bold border transition-all ${
        active
          ? "border-gold-500/60 bg-gold-500/10 text-gold-400 shadow-[0_0_12px_rgba(252,196,25,0.08)]"
          : "border-dark-500/40 bg-dark-800/50 text-gray-400 hover:border-dark-400/60 hover:text-gray-200 hover:bg-dark-700/50"
      }`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
    >
      {children}
    </motion.button>
  );
}

function SliderRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold text-gray-300">{label}</span>
        <span className="text-xl text-gold-400 font-mono tabular-nums bg-gold-500/10 px-3 py-1 rounded-lg">{value}%</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="
            w-full h-4 rounded-full appearance-none cursor-pointer
            bg-dark-700
            [&::-webkit-slider-runnable-track]:h-4 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-dark-700
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-gradient-to-b [&::-webkit-slider-thumb]:from-gold-400 [&::-webkit-slider-thumb]:to-gold-600
            [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(252,196,25,0.3)] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gold-300
            [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-track]:h-4 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-dark-700
            [&::-moz-range-thumb]:w-8 [&::-moz-range-thumb]:h-8 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-gradient-to-b [&::-moz-range-thumb]:from-gold-400 [&::-moz-range-thumb]:to-gold-600
            [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(252,196,25,0.3)] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-gold-300
          "
          style={{
            background: `linear-gradient(to right, #fcc419 ${value}%, #1a1a2e ${value}%)`,
          }}
        />
      </div>
    </div>
  );
}

function ToggleRow({ label, value, onChange, icon }: { label: string; value: boolean; onChange: (v: boolean) => void; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        {icon && <span className="text-gold-500/60 text-xl">{icon}</span>}
        <span className="text-xl font-bold text-gray-200">{label}</span>
      </div>
      <motion.button
              onClick={() => { buttonClick(); onChange(!value); }}
        className={`relative w-16 h-8 rounded-full transition-colors ${
          value ? "bg-gold-600" : "bg-dark-600"
        }`}
        whileTap={{ scale: 0.9 }}
      >
        <motion.span
          className="absolute top-0.5 left-0.5 w-7 h-7 rounded-full bg-white shadow-md"
          animate={{ x: value ? 32 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </motion.button>
    </div>
  );
}
