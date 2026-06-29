import { useState, useEffect, useRef } from "react";
import { GiHearts, GiCoins, GiCampfire } from "react-icons/gi";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { Application } from "pixi.js";
import { CharacterClass } from "@shared/enums/CharacterClass";
import { PLAYER_CONFIGS, CARD_CONFIGS, RELIC_CONFIGS } from "../data";
import { useGameStore } from "../store";
import { buttonClick, startGame } from "../systems/sounds";
import { FrameSequenceSprite } from "../systems/sprites/FrameSequenceSprite";
import type { CardInstance } from "../systems/cards";
import type { RelicInstance } from "../systems/relics";

const CHARACTER_ORDER = [
  CharacterClass.BoneDragon,
  CharacterClass.ImmortalDragon,
  CharacterClass.Longsila,
  CharacterClass.DemonDragon,
  CharacterClass.StormDragon,
];

const CHAR_AVATAR: Record<CharacterClass, string> = {
  [CharacterClass.BoneDragon]: "/head-portrait/wukong.png",
  [CharacterClass.ImmortalDragon]: "/head-portrait/tanseng.png",
  [CharacterClass.Longsila]: "/head-portrait/zhubajie.png",
  [CharacterClass.DemonDragon]: "/head-portrait/sahesang.png",
  [CharacterClass.StormDragon]: "/head-portrait/bailongma.png",
};

const CHAR_TO_SPRITE: Record<CharacterClass, string> = {
  [CharacterClass.BoneDragon]: "hero_bone_dragon",
  [CharacterClass.ImmortalDragon]: "hero_fairy_dragon",
  [CharacterClass.Longsila]: "hero_dragzilla",
  [CharacterClass.DemonDragon]: "hero_magic_dragon",
  [CharacterClass.StormDragon]: "hero_storm_dragon",
};

let instanceCounter = 0;

function buildStartingDeck(charClass: CharacterClass): CardInstance[] {
  const config = PLAYER_CONFIGS[charClass];
  const deck: CardInstance[] = [];
  for (const cardId of config.startingDeck) {
    deck.push({
      instanceId: `card_${instanceCounter++}`,
      configId: cardId,
      upgraded: false,
      cost: CARD_CONFIGS.find((c) => c.id === cardId)?.cost ?? 1,
    });
  }
  return deck;
}

function buildStartingRelic(charClass: CharacterClass): RelicInstance | null {
  const config = PLAYER_CONFIGS[charClass];
  const relicConfig = RELIC_CONFIGS.find((r) => r.id === config.startingRelic);
  if (!relicConfig) return null;
  return { configId: relicConfig.id, obtainedAtFloor: 0 };
}

export function CharacterSelectScene() {
  const navigate = useNavigate();
  const startRun = useGameStore((s) => s.startRun);
  const [selectedChar, setSelectedChar] = useState<CharacterClass>(CharacterClass.BoneDragon);
  const pixiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = pixiRef.current;
    if (!el) return;

    let destroyed = false;
    let app: Application;

    const run = async () => {
      app = new Application();
      await app.init({
        width: el.clientWidth,
        height: el.clientHeight,
        backgroundAlpha: 0,
        antialias: true,
        autoStart: false,
      });
      if (destroyed) { app.destroy({ removeView: true }); return; }

      el.appendChild(app.canvas);
      app.start();

      const spriteId = CHAR_TO_SPRITE[selectedChar];
      if (!spriteId) return;

      const seq = new FrameSequenceSprite();
      try {
        await seq.load(spriteId);
        if (destroyed) { seq.destroy(); return; }
        app.stage.addChild(seq.displayContainer);

        seq.displayContainer.x = app.screen.width / 2;
        seq.displayContainer.y = app.screen.height / 2 + 20;
        const scale = Math.min(app.screen.width, app.screen.height) / 500;
        seq.displayContainer.scale.set(scale);

        seq.play("idle", true);
      } catch {
        if (!destroyed) seq.destroy();
      }
    };

    run();

    return () => {
      destroyed = true;
      if (app) {
        try { app.destroy({ removeView: true }, { children: true, texture: true }); } catch { /* ignore */ }
      }
    };
  }, [selectedChar]);

  const handleStartRun = () => {
    const deck = buildStartingDeck(selectedChar);
    const relic = buildStartingRelic(selectedChar);
    if (!relic) return;
    startRun(selectedChar, deck, relic);
    startGame();
    navigate("/map");
  };

  const config = PLAYER_CONFIGS[selectedChar];
  const relicConfig = RELIC_CONFIGS.find((r) => r.id === config.startingRelic);

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-dark-900 text-gray-200 select-none">
      {/* Animated Dragon Display */}
      <div ref={pixiRef} className="absolute inset-0 z-0" />

      {/* Vignette overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-dark-950/90 via-dark-950/40 to-transparent" />

      {/* Info Panel */}
      <div className="relative z-10 flex h-full w-1/2 flex-col justify-center px-16 lg:w-2/5">
        <AnimatePresence mode="wait">
          <motion.div
            key={`info-${selectedChar}`}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="mb-4 font-display text-5xl text-gold-400 drop-shadow-md">
              {config.displayName}
            </h1>

            <div className="mb-6 flex items-center gap-6 text-xl">
              <div className="flex items-center gap-2 text-red-400 font-bold drop-shadow">
                <GiHearts className="h-6 w-6" />
                {config.stats.maxHealth}/{config.stats.maxHealth}
              </div>
              <div className="flex items-center gap-2 text-yellow-400 font-bold drop-shadow">
                <GiCoins className="h-6 w-6" />
                {config.stats.startingGold}
              </div>
            </div>

            <div className="mb-8 whitespace-pre-wrap text-lg leading-relaxed text-gray-300">
              {config.description}
            </div>

            {relicConfig && (
              <div className="flex items-start gap-4 rounded-xl p-4 bg-dark-800/60">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-dark-700 drop-shadow text-2xl text-orange-500">
                  <GiCampfire />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gold-300 mb-1">{relicConfig.name}</h3>
                  <p className="text-sm text-gray-400">{relicConfig.description}</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Selection Bar */}
      <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center gap-3">
        {CHARACTER_ORDER.map((charClass) => {
          const isSelected = selectedChar === charClass;
          return (
            <button
              key={charClass}
              onClick={() => { buttonClick(); setSelectedChar(charClass); }}
              className={clsx(
                "h-24 w-20 overflow-hidden rounded-xl border-2 transition-all duration-300",
                isSelected
                  ? "border-gold-400 scale-110 shadow-[0_0_20px_rgba(250,204,21,0.3)] brightness-100 z-10"
                  : "border-gray-700 brightness-50 hover:brightness-75 hover:-translate-y-2 z-0"
              )}
            >
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-dark-700 to-dark-900">
                <img src={CHAR_AVATAR[charClass]} alt="Avatar" className="h-full w-full object-cover" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Back Button (Bottom Left) */}
      <div className="absolute bottom-10 left-12 z-20">
        <button
          onClick={() => navigate("/")}
          className="group flex h-16 w-24 items-center justify-center rounded-lg bg-orange-950/80 border border-orange-800/50 hover:bg-orange-900 transition-all shadow-lg hover:shadow-orange-900/30"
        >
          <svg className="h-10 w-10 text-orange-200/80 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l-7 7 7 7M2 12h18" />
          </svg>
        </button>
      </div>

      {/* Start Button (Bottom Right) */}
      <div className="absolute bottom-10 right-12 z-20">
        <button
          onClick={handleStartRun}
          className="group flex h-16 w-32 items-center justify-center rounded-lg bg-sky-900/90 border border-sky-600/50 hover:bg-sky-800 hover:shadow-[0_0_25px_rgba(14,165,233,0.4)] transition-all"
        >
          <svg className="h-10 w-10 text-sky-200/80 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
