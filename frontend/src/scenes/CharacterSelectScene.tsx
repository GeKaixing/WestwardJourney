import { useState } from "react";
import { GiHearts, GiCoins, GiCampfire } from "react-icons/gi";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { CharacterClass } from "@shared/enums/CharacterClass";
import { PLAYER_CONFIGS, CARD_CONFIGS, RELIC_CONFIGS } from "../data";
import { useGameStore } from "../store";
import type { CardInstance } from "../systems/cards";
import type { RelicInstance } from "../systems/relics";

const CHARACTER_ORDER = [
  CharacterClass.SunWukong,
  CharacterClass.TangSanzang,
  CharacterClass.ZhuBajie,
  CharacterClass.ShaWujing,
  CharacterClass.WhiteDragonHorse,
];

const CHAR_AVATAR: Record<CharacterClass, string> = {
  [CharacterClass.SunWukong]: "/head-portrait/wukong.png",
  [CharacterClass.TangSanzang]: "/head-portrait/tanseng.png",
  [CharacterClass.ZhuBajie]: "/head-portrait/zhubajie.png",
  [CharacterClass.ShaWujing]: "/head-portrait/sahesang.png",
  [CharacterClass.WhiteDragonHorse]: "/head-portrait/bailongma.png",
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

function getBackgroundImage(charClass: CharacterClass): string {
  switch (charClass) {
    case CharacterClass.SunWukong: return '/wukong_bg.png';
    case CharacterClass.TangSanzang: return '/tanseng_bg.png';
    case CharacterClass.ZhuBajie: return '/zhubajie_bg.png';
    case CharacterClass.ShaWujing: return '/sahesang_bg.png';
    case CharacterClass.WhiteDragonHorse: return '/bailongma_bg.png';
    default: return 'none';
  }
}

export function CharacterSelectScene() {
  const navigate = useNavigate();
  const startRun = useGameStore((s) => s.startRun);
  const [selectedChar, setSelectedChar] = useState<CharacterClass>(CharacterClass.SunWukong);

  const handleStartRun = () => {
    const deck = buildStartingDeck(selectedChar);
    const relic = buildStartingRelic(selectedChar);
    if (!relic) return;
    startRun(selectedChar, deck, relic);
    navigate("/map");
  };

  const config = PLAYER_CONFIGS[selectedChar];
  const relicConfig = RELIC_CONFIGS.find((r) => r.id === config.startingRelic);

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-dark-900 text-gray-200 select-none">
      {/* Full Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${selectedChar}`}
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${getBackgroundImage(selectedChar)}')`,
            backgroundColor: "#2a1f1a"
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
      </AnimatePresence>

      {/* Info Panel */}
      <div className="relative z-10 flex h-full w-1/2 flex-col justify-center px-16 lg:w-2/5">
        <AnimatePresence mode="wait">
          <motion.div
            key={`info-${selectedChar}`}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl bg-dark-900/80 p-8 shadow-2xl backdrop-blur-sm border border-dark-600/60 opacity-20"
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
              <div className="flex items-start gap-4 rounded-xl bg-dark-800/80 p-4 border border-dark-600/50 shadow-inner">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-dark-700/80 ring-1 ring-gold-500/50 drop-shadow text-2xl text-orange-500">
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
              onClick={() => setSelectedChar(charClass)}
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
