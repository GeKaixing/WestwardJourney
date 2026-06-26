import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useGameStore } from "../store";
import { GiExitDoor, GiCardRandom } from "react-icons/gi";
import { CARD_CONFIGS } from "../data";

export function DeckScene() {
  const navigate = useNavigate();
  const run = useGameStore((s) => s.run);

  if (!run) {
    navigate("/");
    return null;
  }

  // Group or sort cards if needed, but for now just display them
  const deck = run.deck.map((cardInstance) => {
    const config = CARD_CONFIGS.find(c => c.id === cardInstance.configId);
    return { ...cardInstance, config };
  }).filter(c => c.config);

  return (
    <div className="relative flex min-h-screen flex-col items-center p-12 bg-dark-950 font-sans text-gray-200 select-none overflow-y-auto">
      <div className="fixed inset-0 z-0 bg-cover bg-center pointer-events-none opacity-40 grayscale" style={{ backgroundImage: "url('/kraft-paper.jpg')" }}></div>
      <div className="fixed inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] pointer-events-none z-0"></div>

      <div className="relative z-10 flex w-full max-w-6xl flex-col items-center">
        <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4 font-display text-5xl text-gold-500 drop-shadow-lg flex items-center gap-4">
          <GiCardRandom /> 你的牌组
        </motion.h1>
        <p className="mb-10 text-lg font-bold text-gray-300 bg-black/40 px-6 py-2 rounded-full border border-gray-600/50">
          共 {deck.length} 张卡牌
        </p>

        <div className="flex flex-wrap justify-center gap-6 w-full pb-20">
          {deck.map((card, i) => (
            <motion.div
              key={card.instanceId}
              className="relative flex w-56 h-72 flex-col items-center justify-between rounded-xl shadow-2xl p-6 text-center bg-cover bg-center border-2 border-amber-900/60 drop-shadow-md"
              style={{ backgroundImage: "url('/kraft-paper.jpg')" }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.02 * i }}
              whileHover={{ scale: 1.05, y: -5, zIndex: 10 }}
            >
              <div className="absolute -top-3 -left-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/80 border-2 border-gold-600 text-lg font-bold text-gold-400 shadow-md">
                {card.cost}
              </div>

              <div className="flex flex-col items-center w-full mt-4">
                <GiCardRandom className="text-5xl drop-shadow-md text-blue-900 mb-4" />
                <h3 className={`text-xl font-bold leading-tight mb-2 ${card.upgraded ? "text-green-800" : "text-amber-950"}`}>
                  {card.config?.name}{card.upgraded ? "+" : ""}
                </h3>
                <p className="text-sm font-medium text-amber-900/80 leading-snug line-clamp-4">
                  {card.upgraded && card.config?.upgradedDescription ? card.config.upgradedDescription : card.config?.description}
                </p>
              </div>

              <div className="w-full text-center py-1 mt-2 border-t border-amber-900/30">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-widest">{card.config?.type}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="fixed bottom-8 z-50">
          <button
            className="flex items-center gap-2 rounded-lg border-2 border-gray-600 bg-black/80 px-8 py-3 text-lg font-bold text-gray-300 transition-colors hover:bg-gray-800 hover:text-white shadow-2xl backdrop-blur-sm"
            onClick={() => navigate(-1)}
          >
            <GiExitDoor className="text-2xl" /> 返回
          </button>
        </div>
      </div>
    </div>
  );
}
