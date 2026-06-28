import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useGameStore } from "../store";
import { CARD_CONFIGS } from "../data";
import { GiCampfire, GiAnvil, GiExitDoor, GiHearts } from "react-icons/gi";
import { heal as playHealSound, upgrade, buttonClick } from "../systems/sounds";
import { cardImageGenerator } from "../utils/cardImageGenerator";
import { GameHeader } from "../ui";

export function RestScene() {
  const navigate = useNavigate();
  const run = useGameStore((s) => s.run);
  const heal = useGameStore((s) => s.heal);
  const deck = run?.deck ?? [];
  const [showSmith, setShowSmith] = useState(false);
  const [upgradedId, setUpgradedId] = useState<string | null>(null);
  const [cardImages, setCardImages] = useState<Record<string, string>>({});
  const loadingRef = useRef<Set<string>>(new Set());

  const healAmount = run ? Math.floor(run.maxHealth * 0.3) : 0;
  const canHeal = run ? run.currentHealth < run.maxHealth : false;

  useEffect(() => {
    for (const card of deck) {
      if (cardImages[card.instanceId] || loadingRef.current.has(card.instanceId)) continue;
      const config = CARD_CONFIGS.find((c) => c.id === card.configId);
      if (!config) continue;
      loadingRef.current.add(card.instanceId);
      cardImageGenerator.getCardImageUrl(config, card.upgraded, run?.characterClass).then((url) => {
        loadingRef.current.delete(card.instanceId);
        setCardImages((prev) => ({ ...prev, [card.instanceId]: url }));
      }).catch(() => {
        loadingRef.current.delete(card.instanceId);
      });
    }
  }, [deck, cardImages, run?.characterClass]);

  const handleRest = () => {
    heal(healAmount);
    playHealSound();
    navigate("/map");
  };

  const handleSmith = (instanceId: string) => {
    useGameStore.getState().upgradeCard(instanceId);
    setUpgradedId(instanceId);
    upgrade();
    setTimeout(() => navigate("/map"), 600);
  };

  if (showSmith) {
    return (
      <div className="relative flex min-h-screen flex-col items-center pt-14 p-12 bg-dark-950 font-sans text-gray-200 select-none overflow-hidden">
        <GameHeader />
        <div className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none" style={{ backgroundImage: "url('/assets/rest/campfire-camp.png')" }}></div>

        <div className="relative z-10 flex w-full max-w-5xl flex-col items-center mt-10">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4 font-display text-5xl text-gold-500 drop-shadow-lg flex items-center gap-4">
            <GiAnvil /> 锻造
          </motion.h1>
          <p className="mb-10 text-lg font-bold text-gray-300">选择一张牌来永久强化它</p>

          <div className="flex w-full max-w-4xl flex-wrap justify-center gap-6">
            {deck.map((card, i) => {
              const isUpgraded = upgradedId === card.instanceId;
              const isAlreadyUpgraded = card.upgraded;
              const imgUrl = cardImages[card.instanceId];

              return (
                <motion.button
                  key={card.instanceId}
                  className={`relative shrink-0 rounded-xl shadow-xl transition-all border-2 overflow-hidden ${
                    isUpgraded
                      ? "border-gold-500 shadow-[0_0_20px_rgba(250,204,21,0.6)] z-20 scale-110"
                      : isAlreadyUpgraded
                        ? "border-amber-700/30 opacity-40 grayscale cursor-not-allowed"
                        : "border-transparent cursor-pointer hover:border-gold-500 hover:shadow-[0_0_15px_rgba(250,204,21,0.4)]"
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  whileHover={isAlreadyUpgraded || isUpgraded ? {} : { scale: 1.05, y: -5 }}
                  whileTap={isAlreadyUpgraded || isUpgraded ? {} : { scale: 0.95 }}
                  disabled={isAlreadyUpgraded || isUpgraded}
                  onClick={() => handleSmith(card.instanceId)}
                >
                  {imgUrl ? (
                    <img src={imgUrl} alt={card.configId} className="h-56 w-auto rounded-lg" draggable={false} />
                  ) : (
                    <div className="flex h-56 w-36 items-center justify-center rounded-lg bg-dark-800">
                      <span className="animate-pulse text-xs text-gray-600">...</span>
                    </div>
                  )}
                  {isAlreadyUpgraded && (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                      <span className="px-3 py-1 bg-black/70 text-gold-400 rounded-full text-xs font-bold">已强化</span>
                    </div>
                  )}
                  {isUpgraded && (
                    <motion.div
                      className="absolute inset-0 z-10 flex items-center justify-center bg-gold-400/20 rounded-xl"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    >
                      <GiAnvil className="text-6xl text-gold-500 drop-shadow-md" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          <button
            className="mt-16 flex items-center gap-2 rounded-lg border-2 border-gray-600 bg-black/50 px-8 py-3 text-lg font-bold text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
            onClick={() => setShowSmith(false)}
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-row items-center justify-end pt-14 p-8 bg-dark-950 font-sans text-gray-200 select-none overflow-hidden">
      <GameHeader />
      <div className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none" style={{ backgroundImage: "url('/assets/rest/campfire-camp.png')" }}></div>

      <motion.div
        className="relative z-10 flex flex-col items-center mr-16"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <GiCampfire className="text-7xl text-orange-500 drop-shadow-lg mb-4 animate-pulse" />
        <h1 className="font-display text-5xl text-gold-500 drop-shadow-md">
          篝火营地
        </h1>
        <p className="mt-6 flex items-center gap-2 text-lg font-bold text-gray-300 bg-black/40 px-6 py-2 rounded-full border border-gray-600/50">
          暂时歇歇脚吧。<span className="text-red-400 flex items-center gap-1"><GiHearts /> {run?.currentHealth}/{run?.maxHealth}</span>
        </p>

        <div className="mt-12 flex gap-8 w-full justify-center">
          <motion.button
            className={`relative flex w-56 flex-col items-center justify-center rounded-2xl border-2 p-8 shadow-xl transition-all overflow-hidden ${
              canHeal
                ? "border-green-600 bg-green-950/40 text-green-400 hover:bg-green-900/60 hover:shadow-[0_0_20px_rgba(22,163,74,0.4)]"
                : "border-gray-700 bg-dark-800 text-gray-600 opacity-50 cursor-not-allowed"
            }`}
            whileHover={canHeal ? { scale: 1.05, y: -5 } : {}}
            whileTap={canHeal ? { scale: 0.95 } : {}}
            disabled={!canHeal}
            onClick={handleRest}
          >
            <GiHearts className="text-6xl mb-4 drop-shadow-md" />
            <span className="text-2xl font-bold font-display tracking-widest">休息</span>
            <span className="mt-2 text-sm font-medium">恢复 {healAmount} 点生命</span>
          </motion.button>

          <motion.button
            className="relative flex w-56 flex-col items-center justify-center rounded-2xl border-2 border-amber-600 bg-amber-950/40 p-8 text-amber-400 shadow-xl transition-all overflow-hidden hover:bg-amber-900/60 hover:shadow-[0_0_20px_rgba(217,119,6,0.4)]"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { buttonClick(); setShowSmith(true); }}
          >
            <GiAnvil className="text-6xl mb-4 drop-shadow-md" />
            <span className="text-2xl font-bold font-display tracking-widest">锻造</span>
            <span className="mt-2 text-sm font-medium">永久强化一张牌</span>
          </motion.button>
        </div>

        <button
          className="mt-12 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-300 transition-colors"
          onClick={() => navigate("/map")}
        >
          <GiExitDoor className="text-xl" /> 跳过
        </button>
      </motion.div>
    </div>
  );
}
