import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CARD_CONFIGS, RELIC_CONFIGS, POTION_CONFIGS } from "../data";
import { useGameStore } from "../store";
import { GiCoins, GiHealthPotion, GiCampfire, GiCardRandom, GiExitDoor } from "react-icons/gi";

interface ShopItem {
  id: string;
  type: "card" | "relic" | "potion";
  name: string;
  description: string;
  price: number;
  configId: string;
}

export function ShopScene() {
  const navigate = useNavigate();
  const run = useGameStore((s) => s.run);
  const spendGold = useGameStore((s) => s.spendGold);
  const addCardToDeck = useGameStore((s) => s.addCardToDeck);
  const addRelic = useGameStore((s) => s.addRelic);
  const addPotion = useGameStore((s) => s.addPotion);
  const [sold, setSold] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState<string | null>(null);

  const items = useMemo(() => {
    const result: ShopItem[] = [];
    const shuffledCards = [...CARD_CONFIGS].sort(() => Math.random() - 0.5);
    for (const card of shuffledCards.slice(0, 3)) {
      result.push({
        id: `card_${card.id}`,
        type: "card",
        name: card.name,
        description: card.description,
        price: card.rarity === "basic" ? 50 : card.rarity === "common" ? 75 : card.rarity === "uncommon" ? 100 : 150,
        configId: card.id,
      });
    }
    const relicPool = RELIC_CONFIGS.filter((r) => r.rarity === "common" || r.rarity === "uncommon" && !run?.relics.some((rl) => rl.configId === r.id));
    if (relicPool.length > 0) {
      const relic = relicPool[Math.floor(Math.random() * relicPool.length)];
      if (relic) {
        result.push({
          id: `relic_${relic.id}`,
          type: "relic",
          name: relic.name,
          description: relic.description,
          price: 150,
          configId: relic.id,
        });
      }
    }
    for (const potion of POTION_CONFIGS) {
      result.push({
        id: `potion_${potion.id}`,
        type: "potion",
        name: potion.name,
        description: potion.description,
        price: potion.price,
        configId: potion.id,
      });
    }
    return result;
  }, [run]);

  let instanceCounter = 0;
  const handleBuy = (item: ShopItem) => {
    if (sold.has(item.id)) return;
    const ok = spendGold(item.price);
    if (!ok) {
      setMsg("金币不足！");
      setTimeout(() => setMsg(null), 1500);
      return;
    }
    setSold((prev) => new Set(prev).add(item.id));
    if (item.type === "card") {
      addCardToDeck({
        instanceId: `shop_card_${instanceCounter++}_${Date.now()}`,
        configId: item.configId,
        upgraded: false,
        cost: 1,
      });
    } else if (item.type === "relic") {
      addRelic({ configId: item.configId, obtainedAtFloor: run?.currentFloor ?? 0 });
    } else if (item.type === "potion") {
      addPotion({
        configId: item.configId,
        name: item.name,
        description: item.description,
      });
    }
    setMsg(`购买了 ${item.name}`);
    setTimeout(() => setMsg(null), 1500);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center p-12 bg-dark-950 font-sans text-gray-200 select-none">
      <div className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none opacity-40 grayscale" style={{ backgroundImage: "url('/kraft-paper.jpg')" }}></div>
      <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] pointer-events-none z-0"></div>

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center">
        <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4 font-display text-5xl text-gold-500 drop-shadow-lg">
          神秘商铺
        </motion.h1>
        <div className="mb-10 flex items-center gap-2 rounded-full bg-black/60 px-6 py-2 shadow-inner border border-gold-900/50">
          <GiCoins className="text-3xl text-gold-400" />
          <span className="text-2xl font-bold text-white">{run?.gold ?? 0}</span>
        </div>

      {msg && (
        <motion.p
          className="mb-4 rounded bg-dark-700 px-4 py-2 text-sm text-yellow-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {msg}
        </motion.p>
      )}

      <div className="flex max-w-2xl flex-wrap justify-center gap-4">
        {items.map((item, i) => {
          const isSold = sold.has(item.id);
          const Icon = item.type === "card" ? GiCardRandom : item.type === "relic" ? GiCampfire : GiHealthPotion;
          const colorClass = item.type === "card" ? "text-blue-900" : item.type === "relic" ? "text-orange-900" : "text-green-900";
          const canAfford = (run?.gold ?? 0) >= item.price;
          
          return (
            <motion.button
              key={item.id}
              className={`relative flex w-56 h-72 flex-col items-center justify-between rounded-xl shadow-2xl p-6 text-center transition-all bg-cover bg-center border-2 ${
                isSold ? "border-amber-900/30 opacity-30 grayscale cursor-not-allowed" : 
                canAfford ? "border-amber-900/80 cursor-pointer hover:border-gold-500 hover:shadow-[0_0_20px_rgba(250,204,21,0.5)]" : 
                "border-amber-900/50 cursor-pointer"
              }`}
              style={{ backgroundImage: "url('/kraft-paper.jpg')" }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, type: "spring" }}
              whileHover={isSold ? {} : { scale: 1.05, y: -5 }}
              whileTap={isSold ? {} : { scale: 0.95 }}
              onClick={() => handleBuy(item)}
              disabled={isSold}
            >
              <div className="flex flex-col items-center w-full">
                <Icon className={`text-6xl drop-shadow-md ${colorClass} mb-4`} />
                <h3 className="text-xl font-bold text-amber-950 leading-tight mb-2">{item.name}</h3>
                <p className="text-sm font-medium text-amber-900/80 leading-snug line-clamp-3">{item.description}</p>
              </div>
              
              <div className={`flex items-center gap-2 px-4 py-1 rounded-full bg-black/80 shadow-md ${!canAfford && !isSold ? "text-red-500" : "text-gold-400"}`}>
                <GiCoins className="text-xl" />
                <span className="font-bold text-lg">{item.price}</span>
              </div>
              
              {isSold && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl backdrop-blur-sm">
                  <span className="transform -rotate-12 border-4 border-red-800 text-red-800 px-4 py-1 text-3xl font-black rounded-lg">售罄</span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <button
        className="mt-16 flex items-center gap-2 rounded-lg border-2 border-gray-600 bg-black/50 px-8 py-3 text-lg font-bold text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
        onClick={() => navigate("/map")}
      >
        <GiExitDoor className="text-2xl" /> 离开商店
      </button>
      </div>
    </div>
  );
}
