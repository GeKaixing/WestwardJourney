import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CARD_CONFIGS, RELIC_CONFIGS, POTION_CONFIGS } from "../data";
import { useGameStore } from "../store";

const REWARD_GOLD = 25;

export function RewardScene() {
  const navigate = useNavigate();
  const run = useGameStore((s) => s.run);
  const addGold = useGameStore((s) => s.addGold);
  const addCardToDeck = useGameStore((s) => s.addCardToDeck);
  const addRelic = useGameStore((s) => s.addRelic);
  const addPotion = useGameStore((s) => s.addPotion);
  const [phase, setPhase] = useState<"gold" | "cards" | "done">("gold");

  const cardOptions = useMemo(() => {
    const shuffled = [...CARD_CONFIGS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, []);

  const relicDrop = useMemo(() => {
    if (Math.random() < 0.2) {
      const pool = RELIC_CONFIGS.filter((r) => r.rarity === "common" || r.rarity === "uncommon");
      return pool[Math.floor(Math.random() * pool.length)] ?? null;
    }
    return null;
  }, []);

  const potionDrop = useMemo(() => {
    if (Math.random() < 0.4) {
      return POTION_CONFIGS[Math.floor(Math.random() * POTION_CONFIGS.length)] ?? null;
    }
    return null;
  }, []);

  let instanceCounter = 0;
  const handleCardSelect = (configId: string) => {
    const config = CARD_CONFIGS.find((c) => c.id === configId);
    if (config) {
      addCardToDeck({
        instanceId: `reward_card_${instanceCounter++}_${Date.now()}`,
        configId,
        upgraded: false,
        cost: config.cost,
      });
    }
    setPhase("done");
  };

  const handleDone = () => {
    addGold(REWARD_GOLD);
    if (relicDrop) {
      addRelic({ configId: relicDrop.id, obtainedAtFloor: run?.currentFloor ?? 0 });
    }
    if (potionDrop) {
      addPotion({
        configId: potionDrop.id,
        name: potionDrop.name,
        description: potionDrop.description,
      });
    }
    navigate("/map");
  };

  if (phase === "gold") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-dark-900">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
          <p className="text-5xl">💰</p>
          <p className="mt-4 font-display text-3xl text-gold-400">+{REWARD_GOLD} 金币</p>
          {relicDrop && <p className="mt-2 text-sm text-purple-400">获得遗物: {relicDrop.name}</p>}
          {potionDrop && <p className="text-sm text-cyan-400">获得药水: {potionDrop.name}</p>}
          <motion.button
            className="mt-8 rounded border border-gray-600 px-6 py-2 text-gray-300 hover:bg-dark-700"
            whileHover={{ scale: 1.05 }}
            onClick={() => setPhase("cards")}
          >
            选择卡牌
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (phase === "cards") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-dark-900 p-8">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 font-display text-2xl text-gold-400">
          选择一张卡牌
        </motion.h1>
        <div className="flex flex-wrap justify-center gap-4">
          {cardOptions.map((card, i) => (
            <motion.button
              key={card.id}
              className="flex w-36 flex-col items-center rounded-xl border-2 border-gray-600 bg-dark-800 p-4 text-center transition-all hover:border-gold-500 hover:shadow-lg hover:shadow-gold-500/10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCardSelect(card.id)}
            >
              <span className="mb-1 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-900 text-xs text-yellow-400">
                {card.cost}
              </span>
              <p className="text-sm font-bold text-gray-200">{card.name}</p>
              <p className="mt-1 text-xs text-gray-400">{card.description}</p>
              <p className="mt-1 text-[10px] text-gray-600">{card.type}</p>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-dark-900">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
        <p className="text-4xl">✅</p>
        <p className="mt-2 font-display text-xl text-gold-400">卡牌已加入牌组</p>
        <motion.button
          className="mt-6 rounded border border-gold-600 px-6 py-2 text-gold-400 hover:bg-gold-950"
          whileHover={{ scale: 1.05 }}
          onClick={handleDone}
        >
          继续西行
        </motion.button>
      </motion.div>
    </div>
  );
}
