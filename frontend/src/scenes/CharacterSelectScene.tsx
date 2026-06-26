import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
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

const CHAR_EMOJI: Record<CharacterClass, string> = {
  [CharacterClass.SunWukong]: "🐵",
  [CharacterClass.TangSanzang]: "🙏",
  [CharacterClass.ZhuBajie]: "🐷",
  [CharacterClass.ShaWujing]: "👳",
  [CharacterClass.WhiteDragonHorse]: "🐉",
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

function getCharacterCards(charClass: CharacterClass): string[] {
  return CARD_CONFIGS
    .filter((c) => c.characterClass === charClass || !c.characterClass)
    .slice(0, 5)
    .map((c) => c.name);
}

export function CharacterSelectScene() {
  const navigate = useNavigate();
  const startRun = useGameStore((s) => s.startRun);

  const handleSelect = (charClass: CharacterClass) => {
    const deck = buildStartingDeck(charClass);
    const relic = buildStartingRelic(charClass);
    if (!relic) return;
    startRun(charClass, deck, relic);
    navigate("/map");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-dark-900 p-8">
      <motion.h1
        className="mb-2 font-display text-3xl text-gold-400"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        选择角色
      </motion.h1>
      <motion.p
        className="mb-10 text-sm text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.2 } }}
      >
        五位取经人，各有独特的牌组与机制
      </motion.p>
      <div className="flex flex-wrap justify-center gap-6">
        {CHARACTER_ORDER.map((charClass, i) => {
          const config = PLAYER_CONFIGS[charClass];
          const cards = getCharacterCards(charClass);
          return (
            <motion.button
              key={charClass}
              className="flex w-64 flex-col items-center rounded-2xl border-2 border-gray-700 bg-dark-800 p-6 text-center transition-all hover:border-gold-500 hover:shadow-xl hover:shadow-gold-500/10"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i + 0.3 }}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelect(charClass)}
            >
              <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-b from-dark-600 to-dark-700 text-3xl ring-1 ring-gray-600">
                {CHAR_EMOJI[charClass]}
              </div>
              <h2 className="mb-1 font-display text-xl text-white">
                {config.displayName}
              </h2>
              <p className="mb-4 text-xs leading-relaxed text-gray-400">
                {config.description}
              </p>
              <div className="mb-4 flex w-full justify-around border-t border-gray-700 pt-3 text-xs text-gray-500">
                <div className="text-center">
                  <p className="text-lg text-red-400">{config.stats.maxHealth}</p>
                  <p>生命</p>
                </div>
                <div className="text-center">
                  <p className="text-lg text-yellow-400">{config.stats.baseEnergy}</p>
                  <p>能量</p>
                </div>
                <div className="text-center">
                  <p className="text-lg text-blue-400">{config.stats.handSize}</p>
                  <p>手牌</p>
                </div>
                <div className="text-center">
                  <p className="text-lg text-gold-400">{config.stats.startingGold}</p>
                  <p>金币</p>
                </div>
              </div>
              <div className="flex w-full flex-wrap gap-1">
                {cards.map((name) => (
                  <span key={name} className="rounded bg-dark-700 px-2 py-0.5 text-xs text-gray-400">{name}</span>
                ))}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
