import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useGameStore } from "../store";
import { GiExitDoor, GiCog, GiBrokenSkull } from "react-icons/gi";

export function SettingsScene() {
  const navigate = useNavigate();
  const run = useGameStore((s) => s.run);
  const reset = useGameStore((s) => s.reset);

  const handleAbandonRun = () => {
    if (confirm("确定要放弃本次西行吗？")) {
      reset();
      navigate("/");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-12 bg-dark-950 font-sans text-gray-200 select-none">
      <div className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none opacity-40 grayscale" style={{ backgroundImage: "url('/kraft-paper.jpg')" }}></div>
      <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] pointer-events-none z-0"></div>

      <motion.div
        className="relative z-10 flex w-full max-w-lg flex-col items-center bg-black/60 p-12 rounded-2xl border-2 border-gold-900/50 shadow-2xl backdrop-blur-sm"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <GiCog className="text-7xl text-gold-500 drop-shadow-lg mb-4" />
        <h1 className="font-display text-5xl text-gold-500 drop-shadow-md mb-8">
          设置
        </h1>

        <div className="flex flex-col gap-6 w-full mb-10">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">主音量</label>
            <input type="range" className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gold-500" defaultValue="100" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">音乐</label>
            <input type="range" className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gold-500" defaultValue="100" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">音效</label>
            <input type="range" className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gold-500" defaultValue="100" />
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full">
          <button
            className="flex items-center justify-center gap-2 rounded-lg border-2 border-gray-600 bg-black/50 px-8 py-3 text-lg font-bold text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
            onClick={() => navigate(-1)}
          >
            <GiExitDoor className="text-2xl" /> 返回
          </button>
          
          {run && (
            <button
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-red-900 bg-red-950/30 px-8 py-3 text-lg font-bold text-red-400 transition-colors hover:bg-red-900/50 hover:text-red-300"
              onClick={handleAbandonRun}
            >
              <GiBrokenSkull className="text-2xl" /> 放弃本次西行
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
