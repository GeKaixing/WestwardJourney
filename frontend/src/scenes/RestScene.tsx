import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useGameStore } from "../store";

export function RestScene() {
  const navigate = useNavigate();
  const run = useGameStore((s) => s.run);
  const heal = useGameStore((s) => s.heal);
  const deck = run?.deck ?? [];
  const [showSmith, setShowSmith] = useState(false);
  const upgradedId = useState<string | null>(null);

  const healAmount = run ? Math.floor(run.maxHealth * 0.3) : 0;
  const canHeal = run ? run.currentHealth < run.maxHealth : false;

  const handleRest = () => {
    heal(healAmount);
    navigate("/map");
  };

  const handleSmith = (instanceId: string) => {
    useGameStore.getState().upgradeCard(instanceId);
    upgradedId[1](instanceId);
    setTimeout(() => navigate("/map"), 600);
  };

  if (showSmith) {
    return (
      <div className="flex min-h-screen flex-col items-center bg-dark-900 p-8">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 font-display text-2xl text-gold-400">
          锻造
        </motion.h1>
        <p className="mb-6 text-sm text-gray-400">选择一张牌来强化</p>
        <div className="flex max-w-lg flex-wrap justify-center gap-3">
          {deck.map((card) => {
            const isUpgraded = upgradedId[0] === card.instanceId;
            return (
              <button
                key={card.instanceId}
                className={`w-28 rounded-xl border-2 p-3 text-center text-xs transition-all ${
                  isUpgraded
                    ? "border-gold-500 bg-gold-950 text-gold-300"
                    : card.upgraded
                      ? "border-gray-600 bg-dark-800 text-gray-500 line-through"
                      : "border-gray-600 bg-dark-800 text-gray-200 hover:border-yellow-600"
                }`}
                disabled={card.upgraded}
                onClick={() => handleSmith(card.instanceId)}
              >
                <p>{card.configId}</p>
                {card.upgraded && <p className="mt-1 text-gray-600">已强化</p>}
              </button>
            );
          })}
        </div>
        <button
          className="mt-8 text-sm text-gray-500 hover:text-gray-300"
          onClick={() => setShowSmith(false)}
        >
          返回
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-dark-900 p-8">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-2xl text-gold-400">
        篝火
      </motion.h1>
      <p className="text-sm text-gray-400">
        暂时歇歇脚吧。血量 {run?.currentHealth}/{run?.maxHealth}
      </p>
      <div className="flex gap-6">
        <motion.button
          className={`flex flex-col items-center rounded-xl border-2 px-10 py-6 ${
            canHeal
              ? "border-green-700 bg-green-950/30 text-green-400 hover:bg-green-900/50"
              : "border-gray-700 bg-dark-800 text-gray-600"
          }`}
          whileHover={canHeal ? { scale: 1.05 } : {}}
          whileTap={canHeal ? { scale: 0.95 } : {}}
          disabled={!canHeal}
          onClick={handleRest}
        >
          <span className="text-3xl">🔥</span>
          <span className="mt-2 font-bold">休息</span>
          <span className="mt-1 text-xs">恢复 {healAmount} 点生命</span>
        </motion.button>
        <motion.button
          className="flex flex-col items-center rounded-xl border-2 border-yellow-700 bg-yellow-950/30 px-10 py-6 text-yellow-400 hover:bg-yellow-900/50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSmith(true)}
        >
          <span className="text-3xl">⚒️</span>
          <span className="mt-2 font-bold">锻造</span>
          <span className="mt-1 text-xs">强化一张牌</span>
        </motion.button>
      </div>
      <button className="text-sm text-gray-600 hover:text-gray-400" onClick={() => navigate("/map")}>
        跳过
      </button>
    </div>
  );
}
