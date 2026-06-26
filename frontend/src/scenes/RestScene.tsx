import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store";
import { GiCampfire, GiAnvil, GiExitDoor, GiHearts } from "react-icons/gi";

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
      <div className="relative flex min-h-screen flex-col items-center p-12 bg-dark-950 font-sans text-gray-200 select-none">
        <div className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none opacity-30 grayscale" style={{ backgroundImage: "url('/kraft-paper.jpg')" }}></div>
        <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] pointer-events-none z-0"></div>

        <div className="relative z-10 flex w-full max-w-5xl flex-col items-center">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4 font-display text-5xl text-gold-500 drop-shadow-lg flex items-center gap-4">
            <GiAnvil /> 锻造
          </motion.h1>
          <p className="mb-10 text-lg font-bold text-gray-300">选择一张牌来永久强化它</p>
          
          <div className="flex w-full max-w-4xl flex-wrap justify-center gap-4">
            {deck.map((card, i) => {
              const isUpgraded = upgradedId[0] === card.instanceId;
              const isAlreadyUpgraded = card.upgraded;
              
              return (
                <motion.button
                  key={card.instanceId}
                  className={`relative flex w-40 h-56 flex-col items-center justify-center rounded-xl shadow-xl p-4 text-center transition-all bg-cover bg-center border-2 ${
                    isUpgraded
                      ? "border-gold-500 shadow-[0_0_20px_rgba(250,204,21,0.6)] z-20 scale-110"
                      : isAlreadyUpgraded
                        ? "border-amber-900/30 opacity-40 grayscale cursor-not-allowed"
                        : "border-amber-900/60 cursor-pointer hover:border-gold-500 hover:shadow-[0_0_15px_rgba(250,204,21,0.4)]"
                  }`}
                  style={{ backgroundImage: "url('/kraft-paper.jpg')" }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  whileHover={isAlreadyUpgraded || isUpgraded ? {} : { scale: 1.05, y: -5 }}
                  whileTap={isAlreadyUpgraded || isUpgraded ? {} : { scale: 0.95 }}
                  disabled={isAlreadyUpgraded || isUpgraded}
                  onClick={() => handleSmith(card.instanceId)}
                >
                  <p className={`font-bold text-lg ${isAlreadyUpgraded ? "text-amber-900" : "text-amber-950"}`}>{card.configId}</p>
                  {isAlreadyUpgraded && <p className="mt-2 px-3 py-1 bg-black/60 text-gold-400 rounded-full text-xs font-bold shadow-inner">已强化</p>}
                  {isUpgraded && (
                    <motion.div 
                      className="absolute inset-0 flex items-center justify-center bg-gold-400/20 rounded-xl"
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
    <div className="relative flex min-h-screen flex-col items-center justify-center p-8 bg-dark-950 font-sans text-gray-200 select-none">
      <div className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none opacity-40 grayscale" style={{ backgroundImage: "url('/kraft-paper.jpg')" }}></div>
      <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] pointer-events-none z-0"></div>

      <motion.div
        className="relative z-10 flex w-full max-w-3xl flex-col items-center bg-black/60 p-12 rounded-2xl border-2 border-gold-900/50 shadow-2xl backdrop-blur-sm"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
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
            onClick={() => setShowSmith(true)}
          >
            <GiAnvil className="text-6xl mb-4 drop-shadow-md" />
            <span className="text-2xl font-bold font-display tracking-widest">锻造</span>
            <span className="mt-2 text-sm font-medium">永久强化一张牌</span>
          </motion.button>
        </div>
        
        <button 
          className="absolute right-8 top-8 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-300 transition-colors" 
          onClick={() => navigate("/map")}
        >
          <GiExitDoor className="text-xl" /> 跳过
        </button>
      </motion.div>
    </div>
  );
}
