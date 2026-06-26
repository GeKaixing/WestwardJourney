import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BattleSystem, type BattleState } from "../systems/battle";
import { BuffSystem } from "../systems/buffs";
import { CardSystem } from "../systems/cards";
import { RelicSystem } from "../systems/relics";
import { ENEMY_CONFIGS } from "../data";
import { useGameStore } from "../store";

const buffSystem = new BuffSystem();
const cardSystem = new CardSystem();
const relicSystem = new RelicSystem();

function HealthBar({ current, max, color }: { current: number; max: number; color: string }) {
  return (
    <div className="w-full">
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${Math.max(0, (current / max) * 100)}%` }}
        />
      </div>
    </div>
  );
}

function CardView({ cardId, cost, onClick }: { cardId: string; cost: number; onClick: () => void }) {
  const costColors = ["border-gray-500", "border-yellow-700", "border-yellow-500", "border-orange-500"];
  const border = costColors[Math.min(cost, 3)] ?? "border-red-500";
  return (
    <motion.button
      className={`flex w-24 shrink-0 flex-col items-center rounded-lg border-2 bg-dark-800 p-2 ${border}`}
      whileHover={{ y: -8, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <span className="mb-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-900 text-[10px] text-yellow-400">
        {cost}
      </span>
      <span className="text-[11px] font-bold text-gray-200">{cardId}</span>
    </motion.button>
  );
}

export function BattleScene() {
  const navigate = useNavigate();
  const run = useGameStore((s) => s.run);
  const addGold = useGameStore((s) => s.addGold);

  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [result, setResult] = useState<"victory" | "defeat" | null>(null);

  const deckConfigIds = useMemo(() => run?.deck.map((c) => c.configId) ?? [], [run]);

  const battleSystem = useMemo(() => new BattleSystem(cardSystem, buffSystem, relicSystem), []);

  useEffect(() => {
    const enemyConfig = ENEMY_CONFIGS[Math.floor(Math.random() * ENEMY_CONFIGS.length)];

    battleSystem.initBattle(
      {
        id: "player",
        name: "行者",
        maxHealth: run?.maxHealth ?? 80,
        deck: deckConfigIds.length > 0 ? deckConfigIds : ["strike", "strike", "strike", "defend", "defend"],
      },
      [
        {
          id: enemyConfig?.id ?? "bandit",
          name: enemyConfig?.name ?? "山贼喽啰",
          health: enemyConfig?.health ?? 30,
        },
      ],
      {
        onStateChanged: (state) => setBattleState(state),
        onBattleEnd: (res) => {
          if (res === "victory") {
            addGold(20);
            navigate("/reward");
          } else {
            setResult("defeat");
          }
        },
      },
    );
    battleSystem.startBattle();
    return () => battleSystem.reset();
  }, [battleSystem, run, deckConfigIds, navigate, addGold]);

  if (result === "defeat") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-dark-900">
        <motion.h1 className="font-display text-5xl text-red-500" initial={{ scale: 0 }} animate={{ scale: 1 }}>败北</motion.h1>
        <p className="text-gray-400">取经之路在此中断...</p>
        <button className="rounded-lg border border-gray-600 px-6 py-2 text-gray-300 hover:bg-dark-700" onClick={() => navigate("/select")}>重新开始</button>
      </div>
    );
  }

  if (!battleState) return null;

  const player = battleState.player;
  const enemies = battleState.enemies;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-dark-900 to-dark-800">
      {/* Top bar */}
      <div className="flex items-center justify-center gap-6 border-b border-gray-800 px-4 py-2 text-xs text-gray-500">
        <span>抽牌堆 {battleState.drawPile.length}</span>
        <span className="font-bold text-gray-400">第 {battleState.turnNumber} 回合</span>
        <span>弃牌堆 {battleState.discardPile.length}</span>
      </div>

      {/* Battle area */}
      <div className="flex flex-1 items-start justify-between px-8 py-6">
        {/* Player side — left */}
        <div className="flex w-48 flex-col items-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-yellow-950 text-3xl ring-2 ring-yellow-700">
            🐵
          </div>
          <p className="mt-2 text-sm font-bold text-yellow-400">{player.name}</p>
          <div className="mt-2 w-full">
            <HealthBar current={player.health} max={player.maxHealth} color="bg-green-500" />
            <p className="mt-0.5 text-center text-xs text-gray-400">
              {player.health}/{player.maxHealth}
            </p>
          </div>
          <div className="mt-3 flex gap-3 text-xs text-gray-400">
            <span>⚡ {player.energy}/3</span>
            {player.block > 0 && <span className="text-blue-400">🛡 {player.block}</span>}
          </div>
        </div>

        {/* Enemy side — right */}
        <div className="flex flex-wrap justify-end gap-4">
          {enemies.map((enemy) => (
            <div key={enemy.id} className="flex w-44 flex-col items-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-950 text-3xl ring-2 ring-red-700">
                👹
              </div>
              <p className="mt-2 text-sm font-bold text-red-400">{enemy.name}</p>
              {enemy.intent && (
                <span className="mt-1 rounded bg-red-900/60 px-3 py-0.5 text-xs text-red-300">
                  ⚔️ {enemy.intentValue ?? "?"}
                </span>
              )}
              <div className="mt-2 w-full">
                <HealthBar current={enemy.health} max={enemy.maxHealth} color="bg-red-500" />
                <p className="mt-0.5 text-center text-xs text-gray-400">
                  {enemy.health}/{enemy.maxHealth}
                </p>
              </div>
              {enemy.block > 0 && (
                <span className="mt-1 rounded bg-blue-900 px-2 py-0.5 text-xs text-blue-300">
                  🛡 {enemy.block}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Potion bar */}
      {run && run.potions.length > 0 && (
        <div className="flex justify-center gap-2 border-t border-gray-800 px-4 py-2">
          {run.potions.map((potion, i) => (
            <button
              key={i}
              className="rounded bg-cyan-900/40 px-3 py-1 text-xs text-cyan-300 transition-colors hover:bg-cyan-800/50"
              title={potion.description}
            >
              🧪 {potion.name}
            </button>
          ))}
        </div>
      )}

      {/* Hand cards */}
      <div className="flex items-center justify-center gap-2 border-t border-gray-800 px-4 py-3">
        {battleState.hand.map((cardId) => (
          <CardView
            key={cardId}
            cardId={cardId}
            cost={1}
            onClick={() => {
              const target = enemies[0];
              if (target) battleSystem.playCard(cardId, [target.id]);
            }}
          />
        ))}
      </div>

      {/* End turn button */}
      <div className="flex justify-center border-t border-gray-800 px-4 py-2">
        <button
          className="rounded-lg border border-yellow-600 bg-yellow-950/30 px-10 py-2 text-sm text-yellow-400 transition-all hover:bg-yellow-900/50"
          onClick={() => battleSystem.endTurn()}
        >
          结束回合
        </button>
      </div>
    </div>
  );
}
