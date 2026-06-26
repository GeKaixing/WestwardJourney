import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export function TitleScene() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <motion.h1
        className="font-display text-6xl text-gold-400"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        西游行
      </motion.h1>
      <motion.p
        className="mt-4 text-xl text-gray-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        Westward Journey
      </motion.p>
      <motion.p
        className="mt-2 text-sm text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
      >
        A Roguelike Deck-Building Game
      </motion.p>
      <motion.button
        className="mt-12 rounded-lg border-2 border-gold-500 bg-transparent px-8 py-3 font-display text-lg text-gold-400 transition-colors hover:bg-gold-500 hover:text-dark-900"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/select")}
      >
        开始游戏
      </motion.button>
      <motion.button
        className="mt-8 rounded-lg border border-zinc-700 bg-zinc-800/50 px-6 py-3 text-sm text-zinc-300 transition-colors hover:border-amber-700 hover:text-amber-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        onClick={() => navigate("/tools/diy-card")}
      >
        DIY 卡牌生成器
      </motion.button>
    </div>
  );
}
