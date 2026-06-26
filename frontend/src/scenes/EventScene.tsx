import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { EVENT_CONFIGS, CARD_CONFIGS, RELIC_CONFIGS } from "../data";
import { useGameStore } from "../store";
import type { EventChoice } from "@shared/types/EventConfig";

export function EventScene() {
  const navigate = useNavigate();
  const run = useGameStore((s) => s.run);
  const heal = useGameStore((s) => s.heal);
  const takeDamage = useGameStore((s) => s.takeDamage);
  const addGold = useGameStore((s) => s.addGold);
  const spendGold = useGameStore((s) => s.spendGold);
  const addCardToDeck = useGameStore((s) => s.addCardToDeck);
  const removeCardFromDeck = useGameStore((s) => s.removeCardFromDeck);
  const addRelic = useGameStore((s) => s.addRelic);
  const [done, setDone] = useState(false);

  const event = EVENT_CONFIGS[Math.floor(Math.random() * EVENT_CONFIGS.length)];
  if (!event) return null;

  let instanceCounter = 0;
  const handleChoice = (choice: EventChoice) => {
    for (const effect of choice.effects) {
      switch (effect.effectType) {
        case "heal":
          heal(effect.value ?? 0);
          break;
        case "damage":
          takeDamage(effect.value ?? 0);
          break;
        case "gold":
          if ((effect.value ?? 0) > 0) {
            addGold(effect.value ?? 0);
          } else {
            spendGold(Math.abs(effect.value ?? 0));
          }
          break;
        case "cardReward": {
          const pool = CARD_CONFIGS.filter((c) => !c.characterClass || c.characterClass === run?.characterClass);
          const card = pool[Math.floor(Math.random() * pool.length)];
          if (card) {
            addCardToDeck({
              instanceId: `event_card_${instanceCounter++}_${Date.now()}`,
              configId: card.id,
              upgraded: false,
              cost: card.cost,
            });
          }
          break;
        }
        case "relicReward": {
          const relicPool = RELIC_CONFIGS.filter(
            (r) => !r.characterClass || r.characterClass === run?.characterClass,
          );
          const relic = relicPool[Math.floor(Math.random() * relicPool.length)];
          if (relic) {
            addRelic({ configId: relic.id, obtainedAtFloor: run?.currentFloor ?? 0 });
          }
          break;
        }
        case "removeCard": {
          const deck = run?.deck ?? [];
          if (deck.length > 0) {
            const idx = Math.floor(Math.random() * deck.length);
            const card = deck[idx];
            if (card) {
              removeCardFromDeck(card.instanceId);
            }
          }
          break;
        }
        case "transformCard": {
          const deck2 = run?.deck ?? [];
          if (deck2.length > 0) {
            const idx = Math.floor(Math.random() * deck2.length);
            const oldCard = deck2[idx];
            if (oldCard) {
              removeCardFromDeck(oldCard.instanceId);
              const newCardPool = CARD_CONFIGS.filter((c) => c.id !== oldCard.configId);
              const newCard = newCardPool[Math.floor(Math.random() * newCardPool.length)];
              if (newCard) {
                addCardToDeck({
                  instanceId: `transform_${instanceCounter++}_${Date.now()}`,
                  configId: newCard.id,
                  upgraded: false,
                  cost: newCard.cost,
                });
              }
            }
          }
          break;
        }
      }
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-dark-900">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
          <p className="text-4xl">📜</p>
          <p className="mt-4 font-display text-xl text-gold-400">继续前行</p>
          <button
            className="mt-6 rounded border border-gold-600 px-6 py-2 text-gold-400 hover:bg-gold-950"
            onClick={() => navigate("/map")}
          >
            离开
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-dark-900 p-8">
      <motion.div
        className="flex max-w-lg flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-4xl">👻</p>
        <h1 className="mt-4 font-display text-2xl text-gold-400">{event.title}</h1>
        <p className="mt-4 text-center text-sm leading-relaxed text-gray-300">{event.description}</p>
        <div className="mt-8 flex flex-col gap-3">
          {event.choices.map((choice, i) => (
            <motion.button
              key={i}
              className="w-72 rounded-xl border-2 border-gray-600 bg-dark-800 p-4 text-left transition-all hover:border-gold-500"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i + 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleChoice(choice)}
            >
              <p className="font-bold text-gray-200">{choice.label}</p>
              <p className="mt-1 text-xs text-gray-400">{choice.description}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
