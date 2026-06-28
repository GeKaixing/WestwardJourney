import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { startGame, buttonClick, playMainMenuBGM } from "../systems/sounds";
import { Particles } from "../ui";

const menuVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: 1 + i * 0.12 },
  }),
};

export function TitleScene() {
  const navigate = useNavigate();

  useEffect(() => { startGame(); playMainMenuBGM(); }, []);

  const menuItems = [
    { label: "单人模式", onClick: () => { buttonClick(); navigate("/select"); } },

    { label: "设置", onClick: () => { buttonClick(); navigate("/settings"); } },
    {
      label: "退出",
      onClick: typeof window !== "undefined" ? () => window.close() : undefined,
    },
  ];

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center bg-cover bg-center bg-dark-950"
      style={{ backgroundImage: "url(/assets/title-bg.png)" }}
    >
      <Particles />
      <div className="relative z-10 flex flex-col items-center">
      <motion.h1
        className="font-display text-6xl text-gold-400"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        西游行
      </motion.h1>
      <motion.p
        className="mt-4 text-xl text-white"
        style={{ textShadow: "0 0 6px #000, 0 0 3px #000, 0 0 1px #000" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        Westward Journey
      </motion.p>
      <motion.p
        className="mt-2 text-sm text-white"
        style={{ textShadow: "0 0 6px #000, 0 0 3px #000, 0 0 1px #000" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
      >
        A Roguelike Deck-Building Game
      </motion.p>

      <div className="mt-14 flex flex-col items-center gap-4">
        {menuItems.map((item, i) => (
          <motion.button
            key={item.label}
            className={`w-48 rounded-lg border-2 border-transparent px-6 py-3 font-display text-lg transition-colors ${
              item.onClick
                ? "text-white hover:text-yellow-400"
                : "cursor-not-allowed border-zinc-700 text-zinc-600"
            }`}
            style={item.onClick ? { textShadow: "0 0 6px #000, 0 0 3px #000, 0 0 1px #000" } : undefined}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={menuVariants}
            whileHover={item.onClick ? { scale: 1.05 } : undefined}
            whileTap={item.onClick ? { scale: 0.95 } : undefined}
            onClick={item.onClick}
          >
            {item.label}
          </motion.button>
        ))}
      </div>

      <motion.a
        className="mt-12 cursor-pointer text-xs text-zinc-600 underline transition-colors hover:text-zinc-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        onClick={() => navigate("/tools/diy-card")}
      >
        DIY 卡牌生成器
      </motion.a>
      </div>
    </div>
  );
}
