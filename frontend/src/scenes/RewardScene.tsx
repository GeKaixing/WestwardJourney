import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CARD_CONFIGS, RELIC_CONFIGS, POTION_CONFIGS } from "../data";
import { useGameStore } from "../store";
import { GiCoins, GiCheckMark, GiCardRandom, GiCampfire, GiHealthPotion, GiTreasureMap } from "react-icons/gi";
import { playCoin, selectCard } from "../systems/sounds";
import { cardImageGenerator } from "../utils/cardImageGenerator";
import type { CardConfig } from "@shared/types/CardConfig";

const REWARD_GOLD = 25;

export function RewardScene() {
  const navigate = useNavigate();
  const run = useGameStore((s) => s.run);
  const addGold = useGameStore((s) => s.addGold);
  const addCardToDeck = useGameStore((s) => s.addCardToDeck);
  const addRelic = useGameStore((s) => s.addRelic);
  const addPotion = useGameStore((s) => s.addPotion);
  const [phase, setPhase] = useState<"gold" | "cards" | "done">("gold");
  const instanceCounter = useRef(0);
  const [cardImages, setCardImages] = useState<Map<string, string>>(new Map());

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

  useEffect(() => {
    const loadCardImages = async () => {
      const images = new Map<string, string>();
      for (const card of cardOptions) {
        const imageUrl = await cardImageGenerator.getCardImageUrl(
          card as CardConfig,
          false,
          run?.characterClass
        );
        images.set(card.id, imageUrl);
      }
      setCardImages(images);
    };

    loadCardImages();
  }, [cardOptions, run?.characterClass]);

  const handleCardSelect = (configId: string) => {
    selectCard();
    const config = CARD_CONFIGS.find((c) => c.id === configId);
    if (config) {
      addCardToDeck({
        instanceId: `reward_card_${instanceCounter.current++}_${Date.now()}`,
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

  useEffect(() => { if (phase === "gold") playCoin(); }, [phase]);

  if (phase === "gold") {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center p-8 bg-dark-950 font-sans text-gray-200 select-none">

        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="relative z-10 flex flex-col items-center bg-black/60 p-12 rounded-2xl border-2 border-gold-900/50 shadow-2xl backdrop-blur-sm w-full max-w-lg">
          <GiTreasureMap className="text-7xl text-gold-500 drop-shadow-md mb-2" />
          <h1 className="mb-8 font-display text-4xl text-gold-400 drop-shadow">战利品</h1>
          
          <div className="flex flex-col w-full gap-4">
            <div className="flex items-center gap-4 bg-dark-800/80 p-4 rounded-xl border border-gray-700 w-full shadow-inner">
              <GiCoins className="text-4xl text-gold-400" />
              <p className="text-xl font-bold text-gray-200">+{REWARD_GOLD} 金币</p>
            </div>
            
            {relicDrop && (
              <div className="flex items-center gap-4 bg-dark-800/80 p-4 rounded-xl border border-purple-900/50 w-full shadow-inner">
                {relicDrop.image ? (
                  <img src={relicDrop.image} alt={relicDrop.name} className="h-10 w-10 object-contain" />
                ) : (
                  <GiCampfire className="text-4xl text-purple-400 drop-shadow-md" />
                )}
                <div>
                  <p className="text-sm text-purple-300 font-bold">遗物</p>
                  <p className="text-lg font-bold text-gray-200">{relicDrop.name}</p>
                </div>
              </div>
            )}
            
            {potionDrop && (
              <div className="flex items-center gap-4 bg-dark-800/80 p-4 rounded-xl border border-cyan-900/50 w-full shadow-inner">
                {potionDrop.image ? (
                  <img src={potionDrop.image} alt={potionDrop.name} className="h-10 w-10 object-contain" />
                ) : (
                  <GiHealthPotion className="text-4xl text-cyan-400 drop-shadow-md" />
                )}
                <div>
                  <p className="text-sm text-cyan-300 font-bold">药水</p>
                  <p className="text-lg font-bold text-gray-200">{potionDrop.name}</p>
                </div>
              </div>
            )}
          </div>
          
          <motion.button
            className="mt-10 flex items-center gap-2 rounded-lg border-2 border-gold-700 bg-gold-950/40 px-10 py-3 text-lg font-bold text-gold-400 transition-colors hover:bg-gold-900/60 hover:text-gold-200 shadow-lg hover:shadow-gold-500/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPhase("cards")}
          >
            <GiCardRandom className="text-2xl" /> 选择卡牌奖励
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (phase === "cards") {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center p-12 bg-dark-950 font-sans text-gray-200 select-none">

        <div className="relative z-10 flex flex-col items-center">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 font-display text-5xl text-gold-500 drop-shadow-lg">
            卡牌奖励
          </motion.h1>
          <p className="mb-8 text-lg font-bold text-gray-300 bg-black/40 px-6 py-2 rounded-full border border-gray-600/50">请选择一张卡牌加入你的牌组</p>
          <div className="flex flex-wrap justify-center gap-6">
            {cardOptions.map((card, i) => {
              const imageUrl = cardImages.get(card.id);
              return (
                <motion.button
                  key={card.id}
                  className={`relative flex w-56 h-80 flex-col items-center justify-center rounded-xl shadow-2xl overflow-hidden transition-all cursor-pointer hover:shadow-[0_0_20px_rgba(250,204,21,0.5)]`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i, type: "spring" }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCardSelect(card.id)}
                >
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={card.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full bg-dark-800 p-4">
                      <GiCardRandom className="text-5xl drop-shadow-md text-blue-900 mb-4" />
                      <h3 className="text-xl font-bold text-amber-950 leading-tight mb-2">{card.name}</h3>
                      <p className="text-sm font-medium text-amber-900/80 leading-snug line-clamp-4">{card.description}</p>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
          <button 
            className="mt-12 text-gray-500 font-bold hover:text-gray-300 transition-colors"
            onClick={() => setPhase("done")}
          >
            跳过
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-8 bg-dark-950 font-sans text-gray-200 select-none">

      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="relative z-10 flex flex-col items-center bg-black/60 p-12 rounded-2xl border-2 border-gold-900/50 shadow-2xl backdrop-blur-sm">
        <div className="h-24 w-24 rounded-full bg-green-900/50 border-4 border-green-500 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.3)] mb-6">
          <GiCheckMark className="text-5xl text-green-400" />
        </div>
        <p className="mt-2 font-display text-4xl text-gold-400 drop-shadow-md">卡牌已加入牌组</p>
        <motion.button
          className="mt-10 flex items-center gap-2 rounded-lg border-2 border-gold-700 bg-gold-950/50 px-10 py-3 text-xl font-bold text-gold-400 hover:bg-gold-900/80 hover:text-gold-200 hover:shadow-[0_0_15px_rgba(250,204,21,0.3)] transition-all"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDone}
        >
          继续西行
        </motion.button>
      </motion.div>
    </div>
  );
}
