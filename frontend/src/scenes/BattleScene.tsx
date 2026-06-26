import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BattleSystem, type BattleState } from "../systems/battle";
import { BuffSystem } from "../systems/buffs";
import { CardSystem, type CardInstance } from "../systems/cards";
import { RelicSystem } from "../systems/relics";
import { CARD_CONFIGS, ENEMY_CONFIGS, PLAYER_CONFIGS, RELIC_CONFIGS } from "../data";
import { useGameStore } from "../store";
import { cardImageGenerator } from "../utils/cardImageGenerator";

const buffSystem = new BuffSystem();
const cardSystem = new CardSystem();
const relicSystem = new RelicSystem();
cardSystem.registerConfigs(CARD_CONFIGS);
relicSystem.registerConfigs(RELIC_CONFIGS);

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

function CardView({
  card,
  imageUrl,
  disabled,
  onClick,
}: {
  card: CardInstance;
  imageUrl: string | undefined;
  disabled: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <motion.button
        className={`shrink-0 rounded-lg border-2 transition-colors ${
          disabled ? "border-gray-700 opacity-50" : "border-transparent"
        }`}
        whileHover={disabled ? {} : { y: -12, scale: 1.08 }}
        whileTap={disabled ? {} : { scale: 0.95 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={onClick}
        disabled={disabled}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={card.configId}
            className="h-36 w-auto rounded-lg"
            draggable={false}
          />
        ) : (
          <div className="flex h-36 w-[100px] items-center justify-center rounded-lg bg-dark-800">
            <span className="animate-pulse text-xs text-gray-600">...</span>
          </div>
        )}
      </motion.button>

      {/* Hover popup — larger card preview */}
      <AnimatePresence>
        {hovered && imageUrl && !disabled && (
          <motion.div
            className="pointer-events-none fixed z-50"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              left: "50%",
              top: "35%",
              transform: "translateX(-50%)",
            }}
          >
            <img
              src={imageUrl}
              alt={card.configId}
              className="h-auto w-[220px] drop-shadow-2xl"
              draggable={false}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function BattleScene() {
  const navigate = useNavigate();
  const run = useGameStore((s) => s.run);
  const addGold = useGameStore((s) => s.addGold);
  const setHealth = useGameStore((s) => s.setHealth);
  const setInBattle = useGameStore((s) => s.setInBattle);

  const baseEnergy = run ? (PLAYER_CONFIGS[run.characterClass]?.stats.baseEnergy ?? 3) : 3;

  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [result, setResult] = useState<"victory" | "defeat" | null>(null);
  const latestBattleState = useRef<BattleState | null>(null);
  const runRef = useRef(run);
  runRef.current = run;

  const battleSystem = useMemo(() => new BattleSystem(cardSystem, buffSystem, relicSystem), []);

  const [error, setError] = useState<string | null>(null);
  const [cardImages, setCardImages] = useState<Record<string, string>>({});
  const loadingCards = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!battleState) return;
    let changed = false;
    const next = { ...cardImages };

    for (const card of battleState.hand) {
      if (next[card.instanceId] || loadingCards.current.has(card.instanceId)) continue;

      const config = CARD_CONFIGS.find((c) => c.id === card.configId);
      if (!config) continue;

      loadingCards.current.add(card.instanceId);
      changed = true;

      cardImageGenerator.getCardImageUrl(config, card.upgraded).then((url) => {
        loadingCards.current.delete(card.instanceId);
        setCardImages((prev) => ({ ...prev, [card.instanceId]: url }));
      }).catch(() => {
        loadingCards.current.delete(card.instanceId);
      });
    }

    if (changed) setCardImages(next);
  }, [battleState?.hand, cardImages]);

  useEffect(() => {
    const currentRun = runRef.current;
    if (!currentRun) {
      navigate("/select");
      return;
    }

    try {
      const enemyConfig = ENEMY_CONFIGS[Math.floor(Math.random() * ENEMY_CONFIGS.length)];
      relicSystem.clearPlayer("player");
      for (const relic of currentRun.relics) {
        relicSystem.addRelic("player", relic.configId, relic.obtainedAtFloor);
      }

      battleSystem.initBattle(
        {
          id: "player",
          name: PLAYER_CONFIGS[currentRun.characterClass].displayName,
          health: currentRun.currentHealth,
          maxHealth: currentRun.maxHealth,
          deck: currentRun.deck,
        },
        enemyConfig ? [enemyConfig] : [],
        {
          onStateChanged: (state) => {
            latestBattleState.current = state;
            setBattleState(state);
          },
          onBattleEnd: (res) => {
            const finalHealth = latestBattleState.current?.player.health ?? runRef.current?.currentHealth ?? 0;
            setHealth(finalHealth);
            setInBattle(false);
            if (res === "victory") {
              addGold(20);
              navigate("/reward");
            } else {
              setResult("defeat");
            }
          },
        },
      );
      setInBattle(true);
      battleSystem.startBattle();
    } catch (e) {
      console.error("Battle init failed", e);
      setError(String(e));
    }
    return () => {
      battleSystem.reset();
      setInBattle(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battleSystem, navigate, addGold, setHealth, setInBattle]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-dark-900 p-8">
        <h2 className="text-xl text-red-500">战斗初始化失败</h2>
        <p className="text-sm text-gray-400">{error}</p>
        <button className="rounded border border-gray-600 px-4 py-2 text-gray-300 hover:bg-dark-700" onClick={() => navigate("/map")}>返回地图</button>
      </div>
    );
  }

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
  const aliveEnemies = enemies.filter((enemy) => enemy.isAlive);
  const defaultTarget = aliveEnemies[0];
  const phaseLabel = ["回合开始", "抽牌", "行动", "回合结束", "敌方行动", "清理"][battleState.phase] ?? "行动";

  const characterEmojis: Record<string, string> = {
    sun_wukong: "🐵",
    tang_sanzang: "🙏",
    zhu_bajie: "🐷",
    sha_wujing: "👨‍🦲",
    white_dragon_horse: "🐴",
  };
  const enemyEmojis: Record<string, string> = {
    mountain_bandit: "🗡️",
    bandit_leader: "👹",
    yaoguai_scorpion: "🦂",
  };
  const playerEmoji = run ? characterEmojis[run.characterClass] ?? "🐵" : "🐵";

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-dark-900 to-dark-800">
      {/* Top bar */}
      <div className="flex items-center justify-center gap-6 border-b border-gray-800 bg-dark-950/60 px-4 py-2 text-xs text-gray-400">
        <motion.span key={`draw-${battleState.drawPile.length}`} initial={{ scale: 1.3 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
          抽牌堆 {battleState.drawPile.length}
        </motion.span>
        <span className="font-bold text-gold-400">第 {battleState.turnNumber} 回合 · {phaseLabel}</span>
        <motion.span key={`discard-${battleState.discardPile.length}`} initial={{ scale: 1.3 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
          弃牌堆 {battleState.discardPile.length}
        </motion.span>
        <span>消耗 {battleState.exhaustPile.length}</span>
      </div>

      {/* Battle area */}
      <div className="flex flex-1 items-start justify-between gap-8 px-8 py-6">
        {/* Player side — left */}
        <div className="flex w-48 flex-col items-center">
           <div className="flex h-28 w-28 items-center justify-center rounded-full bg-yellow-950 text-4xl ring-2 ring-yellow-700">
            {playerEmoji}
          </div>
          <p className="mt-2 text-sm font-bold text-yellow-400">{player.name}</p>
          <div className="mt-2 w-full">
            <HealthBar current={player.health} max={player.maxHealth} color="bg-green-500" />
            <p className="mt-0.5 text-center text-xs text-gray-400">
              {player.health}/{player.maxHealth}
            </p>
          </div>
          <div className="mt-3 flex gap-3 text-xs text-gray-300">
            <span>⚡ {player.energy}/{baseEnergy}</span>
            {player.block > 0 && <span className="text-blue-400">🛡 {player.block}</span>}
          </div>
        </div>

        {/* Enemy side — right */}
        <div className="flex flex-wrap justify-end gap-5">
          {enemies.map((enemy) => (
            <div key={enemy.id} className={`flex w-48 flex-col items-center rounded-lg border bg-dark-900/50 p-3 ${enemy.isAlive ? "border-red-950" : "border-gray-800 opacity-50"}`}>
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-950 text-3xl ring-2 ring-red-700">
                {enemyEmojis[enemy.id] ?? "👹"}
              </div>
              <p className="mt-2 text-sm font-bold text-red-400">{enemy.name}</p>
              {enemy.intent && (
                <span className={`mt-2 rounded px-3 py-1 text-xs ${
                  enemy.intentType === "attack"
                    ? "bg-red-900/60 text-red-300"
                    : enemy.intentType === "block"
                      ? "bg-blue-900/60 text-blue-300"
                      : "bg-purple-900/60 text-purple-300"
                }`}>
                  {enemy.intentType === "attack" ? "⚔️" : enemy.intentType === "block" ? "🛡" : "✦"} {enemy.intent}
                  {enemy.intentValue != null ? ` ${enemy.intentValue}` : ""}
                </span>
              )}
              <div className="mt-2 w-full">
                <HealthBar current={enemy.health} max={enemy.maxHealth} color="bg-red-500" />
                <p className="mt-0.5 text-center text-xs text-gray-400">
                  {enemy.health}/{enemy.maxHealth}
                </p>
              </div>
              {enemy.block > 0 && enemy.isAlive && (
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
      <div className="flex min-h-[180px] items-center justify-center gap-3 overflow-x-auto border-t border-gray-800 bg-dark-950/40 px-4 py-4">
        <AnimatePresence mode="popLayout">
          {battleState.hand.map((card) => (
            <motion.div
              key={card.instanceId}
              layout
              initial={{ opacity: 0, y: -80, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 150, scale: 0.4, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
            >
              <CardView
                card={card}
                imageUrl={cardImages[card.instanceId]}
                disabled={card.cost > player.energy || !defaultTarget}
                onClick={() => {
                  const config = CARD_CONFIGS.find((entry) => entry.id === card.configId);
                  const targets = config?.targetType === "all_enemies"
                    ? aliveEnemies.map((enemy) => enemy.id)
                    : defaultTarget ? [defaultTarget.id] : [];
                  if (targets.length > 0) battleSystem.playCard(card.instanceId, targets);
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        {battleState.hand.length === 0 && (
          <motion.span
            className="py-10 text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            手牌为空
          </motion.span>
        )}
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
