import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CARD_CONFIGS, RELIC_CONFIGS, POTION_CONFIGS } from "../data";
import { useGameStore } from "../store";
import type { RunState } from "../store";
import { GiCoins, GiCheckMark, GiCardRandom, GiCampfire, GiHealthPotion, GiTreasureMap } from "react-icons/gi";
import { playCoin, selectCard } from "../systems/sounds";
import { cardImageGenerator } from "../utils/cardImageGenerator";
import { GameHeader } from "../ui";
import type { CardConfig } from "@shared/types/CardConfig";
import { MapNodeType } from "@shared/enums/MapNodeType";

function getRewardGold(run: RunState | null): number {
  if (!run) return 15;
  const base = run.currentNodeType === MapNodeType.Boss ? 80
    : run.currentNodeType === MapNodeType.Elite ? 35
    : run.currentFloor <= 3 ? 12
    : run.currentFloor <= 11 ? 20
    : 30;
  return base + Math.floor(run.currentFloor * 1.5);
}

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
        try {
          const imageUrl = await cardImageGenerator.getCardImageUrl(
            card as CardConfig,
            false,
            run?.characterClass
          );
          images.set(card.id, imageUrl);
        } catch (e) {
          console.error("Failed to load card image:", card.id, e);
        }
      }
      setCardImages(images);
    };

    loadCardImages().catch((e) => console.error("Card image loading failed:", e));
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
    addGold(getRewardGold(run));
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
      <div className="relative flex min-h-screen flex-row items-center justify-end pt-14 p-8 bg-dark-950 font-sans text-gray-200 select-none overflow-hidden">
        <GameHeader />
        <div className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none" style={{ backgroundImage: "url('/assets/reward/spoils-of-war.png')" }}></div>
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="relative z-10 flex flex-col items-center p-12 mr-16 w-96">
          <GiTreasureMap className="text-7xl text-gold-500 drop-shadow-md mb-2" />
          <h1 className="mb-8 font-display text-4xl text-gold-400 drop-shadow">战利品</h1>
          
          <div className="flex flex-col w-full gap-4">
            <div className="flex items-center gap-4 bg-dark-800/80 p-4 rounded-xl border border-gray-700 w-full shadow-inner">
              <GiCoins className="text-4xl text-gold-400" />
              <p className="text-xl font-bold text-gray-200">+{getRewardGold(run)} 金币</p>
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
            className="mt-10 flex items-center gap-2 rounded-lg  px-10 py-3 text-lg font-bold text-gold-400 transition-colors  shadow-lg "
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
      <div className="relative flex min-h-screen flex-row items-center justify-end pt-14 p-12 bg-dark-950 font-sans text-gray-200 select-none overflow-hidden">
        <GameHeader />
        <div className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none" style={{ backgroundImage: "url('/assets/reward/spoils-of-war.png')" }}></div>
        <div className="relative z-10 flex flex-col items-center mr-16">
          <motion.h1 initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="mb-10 font-display text-5xl text-gold-500 drop-shadow-lg">
            卡牌奖励
          </motion.h1>
          <p className="mb-8 text-lg font-bold text-gray-300">请选择一张卡牌加入你的牌组</p>
          <div className="flex flex-wrap justify-center gap-6">
            {cardOptions.map((card, i) => {
              const imageUrl = cardImages.get(card.id);
              return (
                <motion.button
                  key={card.id}
                  className={`relative flex w-56 h-80 flex-col items-center justify-center rounded-xl shadow-2xl overflow-hidden transition-all cursor-pointer `}
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
    <div className="relative flex min-h-screen flex-row items-center justify-end pt-14 p-8 bg-dark-950 font-sans text-gray-200 select-none overflow-hidden">
      <GameHeader />
      <div className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none" style={{ backgroundImage: "url('/assets/reward/spoils-of-war.png')" }}></div>
      <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="relative z-10 flex flex-col items-center p-12 mr-16">
        <div className="h-24 w-24 rounded-full bg-green-900/50 border-4 border-green-500 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.3)] mb-6">
          <GiCheckMark className="text-5xl text-green-400" />
        </div>
        <p className="mt-2 font-display text-4xl text-gold-400 drop-shadow-md">卡牌已加入牌组</p>
        <motion.button
          className="mt-10 flex items-center gap-2 rounded-lg  px-10 py-3 text-xl font-bold text-gold-400  transition-all"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDone}
        >
          继续征战
        </motion.button>
      </motion.div>
    </div>
  );
}
