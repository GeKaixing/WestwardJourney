import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CARD_CONFIGS, RELIC_CONFIGS, POTION_CONFIGS } from "../data";
import { useGameStore } from "../store";

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
    <div className="flex min-h-screen flex-col items-center bg-dark-900 p-8">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-2 font-display text-2xl text-gold-400">
        商铺
      </motion.h1>
      <p className="mb-8 text-sm text-gray-500">💰 {run?.gold ?? 0} 金币</p>

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
          const typeColor =
            item.type === "card" ? "border-blue-700" : item.type === "relic" ? "border-purple-700" : "border-cyan-700";
          return (
            <motion.button
              key={item.id}
              className={`flex w-44 flex-col items-center rounded-xl border-2 bg-dark-800 p-4 text-center transition-all ${
                isSold ? "border-gray-700 opacity-40" : typeColor + " hover:border-gold-500"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              whileHover={isSold ? {} : { scale: 1.05 }}
              whileTap={isSold ? {} : { scale: 0.95 }}
              onClick={() => handleBuy(item)}
              disabled={isSold}
            >
              <p className="text-sm font-bold text-gray-200">{item.name}</p>
              <p className="mt-1 text-xs text-gray-400">{item.description}</p>
              <p className={`mt-2 text-xs ${(run?.gold ?? 0) >= item.price ? "text-gold-400" : "text-red-400"}`}>
                💰 {item.price}
              </p>
              {isSold && <p className="mt-1 text-[10px] text-gray-600">已售</p>}
            </motion.button>
          );
        })}
      </div>

      <button
        className="mt-10 rounded border border-gray-600 px-6 py-2 text-sm text-gray-400 hover:bg-dark-700"
        onClick={() => navigate("/map")}
      >
        离开
      </button>
    </div>
  );
}
