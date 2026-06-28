import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { EVENT_CONFIGS, CARD_CONFIGS, RELIC_CONFIGS } from "../data";
import { useGameStore } from "../store";
import type { EventChoice } from "@shared/types/EventConfig";
import { buttonClick } from "../systems/sounds";
import { GiScrollUnfurled, GiExitDoor } from "react-icons/gi";
import { GameHeader } from "../ui";

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

  const instanceCounter = useRef(0);
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
              instanceId: `event_card_${instanceCounter.current++}_${Date.now()}`,
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
                  instanceId: `transform_${instanceCounter.current++}_${Date.now()}`,
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
      <div className="relative flex min-h-screen flex-row items-center justify-end pt-14 p-8 bg-dark-950 font-sans text-gray-200 select-none overflow-hidden">
        <GameHeader />        {event.image ? (
          <div className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none" style={{ backgroundImage: `url('${event.image}')` }}></div>
        ) : null}
        
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="relative z-10 flex flex-col items-center p-12 mr-16">
          <GiScrollUnfurled className="text-6xl text-gold-500 drop-shadow-md" />
          <p className="mt-6 font-display text-3xl text-gold-400 drop-shadow">继续前行</p>
          <button
            className="mt-8 flex items-center gap-2 rounded-lg border-2 border-gray-500 px-8 py-3 text-lg font-bold text-gray-300 hover:bg-gray-800 hover:text-white transition-all hover:scale-105"
            onClick={() => navigate("/map")}
          >
            <GiExitDoor className="text-2xl" /> 离开
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-row items-center justify-end pt-14 p-8 bg-dark-950 font-sans text-gray-200 select-none overflow-hidden">
      <GameHeader />      {event.image ? (
        <div className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none" style={{ backgroundImage: `url('${event.image}')` }}></div>
      ) : null}
      
      <motion.div
        className="relative z-10 flex w-80 flex-col gap-4 mr-16"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div>
          <h1 className="font-display text-4xl text-gold-500 drop-shadow-md">{event.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-300 font-medium">{event.description}</p>
        </div>
        {event.choices.map((choice, i) => (
          <motion.button
            key={i}
            className="w-full rounded-xl p-5 text-left transition-all hover:text-gold-500"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i + 0.3, type: "spring" }}
            whileHover={{ scale: 1.02, x: 10 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { buttonClick(); handleChoice(choice); }}
          >
            <p className="text-lg font-bold text-gold-200">{choice.label}</p>
            <p className="mt-2 text-sm text-gray-400">{choice.description}</p>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
