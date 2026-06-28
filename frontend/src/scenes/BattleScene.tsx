import { useEffect, useMemo, useRef, useState, ReactNode, useCallback } from "react";
import {
  GiMonkey,
  GiMonkFace,
  GiPigFace,
  GiBarbarian,
  GiHorseHead,
  GiRobber,
  GiOgre,
  GiScorpion,
  GiSwordClash,
  GiShield,
  GiMagicSwirl,
  GiPokerHand,
} from "react-icons/gi";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BattleSystem, type BattleState } from "../systems/battle";
import { BuffSystem } from "../systems/buffs";
import { CardSystem, type CardInstance } from "../systems/cards";
import { RelicSystem } from "../systems/relics";
import { CARD_CONFIGS, ENEMY_CONFIGS, PLAYER_CONFIGS, RELIC_CONFIGS } from "../data";
import { useGameStore } from "../store";
import { cardImageGenerator } from "../utils/cardImageGenerator";
import { startTurn, endTurn as playEndTurn, playBattleBGM } from "../systems/sounds";
import { useCardDragDrop } from "../hooks/useCardDragDrop";
import { GameHeader } from "../ui";

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
  return (
    <motion.button
      className={`shrink-0 rounded-lg border-2 transition-colors ${
        disabled ? "border-transparent opacity-50" : "border-transparent"
      }`}
      whileTap={disabled ? {} : { scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={card.configId}
          className="h-72 max-w-none rounded-lg"
          draggable={false}
        />
      ) : (
        <div className="flex h-72 w-[180px] items-center justify-center rounded-lg bg-dark-800">
          <span className="animate-pulse text-xs text-gray-600">...</span>
        </div>
      )}
    </motion.button>
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

  const onDragPlayCard = useCallback((cardInstanceId: string, targetIds: string[]) => {
    battleSystem.playCard(cardInstanceId, targetIds);
  }, [battleSystem]);
  const getCardTargetType = useCallback((cardInstanceId: string) => {
    const card = battleState?.hand.find(c => c.instanceId === cardInstanceId);
    if (!card) return "single_enemy";
    const config = CARD_CONFIGS.find(c => c.id === card.configId);
    return config?.targetType ?? "single_enemy";
  }, [battleState?.hand]);
  const { onPointerDown, onPointerMove, onPointerUp, onPointerCancel } = useCardDragDrop(onDragPlayCard, getCardTargetType);

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

      cardImageGenerator.getCardImageUrl(config, card.upgraded, run?.characterClass).then((url) => {
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
      startTurn();
      // ponytail: play random zone BGM since zones aren't defined yet
      const zones = ["denseForest", "nest", "darkPort", "glory"] as const;
      const randomZone = zones[Math.floor(Math.random() * zones.length)]!;
      playBattleBGM(randomZone, "normal");
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
  const phaseLabel = ["回合开始", "抽牌", "行动", "回合结束", "敌方行动", "清理"][battleState.phase] ?? "行动";

  const characterEmojis: Record<string, ReactNode> = {
    sun_wukong: <GiMonkey />,
    tang_sanzang: <GiMonkFace />,
    zhu_bajie: <GiPigFace />,
    sha_wujing: <GiBarbarian />,
    white_dragon_horse: <GiHorseHead />,
  };
  const enemyEmojis: Record<string, ReactNode> = {
    mountain_bandit: <GiRobber />,
    bandit_leader: <GiOgre />,
    yaoguai_scorpion: <GiScorpion />,
  };
  const playerEmoji = run ? characterEmojis[run.characterClass] ?? <GiMonkey /> : <GiMonkey />;

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-dark-900 font-sans text-gray-200 select-none">
      {/* Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/battle-bg.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark-950 opacity-70" />
      </div>

      <GameHeader hideAvatar playerName={player.name} currentHealth={player.health} maxHealth={player.maxHealth} />

      {/* Main Battle Area */}
      <div className="relative z-10 flex flex-1 w-full items-center justify-between px-32 pb-32 pt-16">
        
        {/* Player Character */}
        <div className="relative flex flex-col items-center">
          <div className="flex h-72 w-72 items-center justify-center text-[10rem] drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)] filter transition-transform hover:scale-105">
            {playerEmoji}
          </div>
          {/* HP Bar */}
          <div className="mt-4 w-40">
            <HealthBar current={player.health} max={player.maxHealth} color="bg-red-500" />
            <p className="mt-1 text-center text-sm font-bold text-white drop-shadow-md">
              {player.health}/{player.maxHealth}
            </p>
          </div>
          {/* Block */}
          {player.block > 0 && (
            <div className="absolute -bottom-10 flex h-14 w-14 items-center justify-center rounded-full bg-blue-900/90 font-bold text-xl text-white ring-2 ring-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] z-20">
              {player.block}
            </div>
          )}
        </div>

        {/* Enemies */}
        <div className="flex gap-20">
          {enemies.map((enemy) => (
            <div key={enemy.id} data-enemy-id={enemy.id} className={`Target relative flex flex-col items-center transition-all duration-500 ${enemy.isAlive ? "" : "opacity-0 scale-90"}`}>
               {/* Intent */}
               {enemy.intent && enemy.isAlive && (
                  <div className="absolute -top-16 flex flex-col items-center z-20">
                    <span className="text-4xl drop-shadow-lg filter">
                       {enemy.intentType === "attack" ? <GiSwordClash className="text-red-500" /> : enemy.intentType === "block" ? <GiShield className="text-blue-400" /> : <GiMagicSwirl className="text-purple-400" />}
                    </span>
                    {enemy.intentValue != null && (
                      <span className="font-bold text-white drop-shadow-md bg-black/60 px-2 rounded-full -mt-2 text-sm border border-gray-600/50">
                        {enemy.intentValue}
                      </span>
                    )}
                  </div>
               )}
               
               {/* Character */}
               {(() => {
                 const enemyConfig = ENEMY_CONFIGS.find(e => e.id === enemy.id);
                 const imgUrl = enemyConfig?.image;
                 if (imgUrl) {
                   return (
                      <div className="flex h-64 w-64 items-center justify-center drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)] filter transition-transform hover:scale-105">
                       <img
                         src={imgUrl}
                         alt={enemy.name}
                         className="h-full w-full object-contain"
                         onError={(e) => {
                           const target = e.target as HTMLImageElement;
                           target.style.display = "none";
                           const fallback = document.createElement("span");
                            fallback.className = "text-9xl text-gray-400";
                           fallback.textContent = "👹";
                           target.parentElement?.appendChild(fallback);
                         }}
                       />
                     </div>
                   );
                 }
                 return (
                    <div className="flex h-64 w-64 items-center justify-center text-9xl drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)] filter transition-transform hover:scale-105 text-gray-400">
                     {enemyEmojis[enemy.id] ?? <GiOgre />}
                   </div>
                 );
               })()}
               
               {/* HP Bar */}
               <div className="mt-4 w-32">
                 <HealthBar current={enemy.health} max={enemy.maxHealth} color="bg-red-500" />
                 <p className="mt-1 text-center text-sm font-bold text-white drop-shadow-md">
                   {enemy.health}/{enemy.maxHealth}
                 </p>
               </div>

               {/* Block */}
               {enemy.block > 0 && enemy.isAlive && (
                 <div className="absolute -bottom-8 -right-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-900/90 font-bold text-white ring-2 ring-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] z-20">
                   {enemy.block}
                 </div>
               )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom HUD */}
      <div className="absolute bottom-0 left-0 right-0 z-30 h-72 pointer-events-none">
        
        {/* Energy Orb (Bottom Left) */}
        <div className="pointer-events-auto absolute bottom-10 left-10 flex h-20 w-20 items-center justify-center rounded-full bg-orange-950/90 ring-2 ring-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.4)] z-40 transform transition-transform hover:scale-105">
          <span className="font-display text-3xl font-bold text-orange-400 drop-shadow-lg">
            {player.energy}/{baseEnergy}
          </span>
        </div>

        {/* Draw Pile (Bottom Left Corner) */}
        <div className="pointer-events-auto absolute bottom-6 left-36 flex flex-col items-center gap-1 cursor-pointer group z-30">
          <div className="flex h-16 w-12 items-center justify-center rounded bg-gray-300 text-gray-800 shadow-xl border-2 border-gray-400 font-bold text-3xl group-hover:-translate-y-1 transition-transform">
             <GiPokerHand />
          </div>
          <span className="font-bold text-white drop-shadow-md text-base">{battleState.drawPile.length}</span>
        </div>

        {/* End Turn Button (Bottom Right) */}
        <div className="pointer-events-auto absolute bottom-12 right-10 z-40">
          <button
            disabled={battleState.phase !== 2}
            onClick={() => { battleSystem.endTurn(); playEndTurn(); }}
            className={`flex h-12 w-32 items-center justify-center rounded-lg border-2 text-lg font-bold transition-all shadow-lg ${
              battleState.phase !== 2
                ? "bg-gray-800 border-gray-600 text-gray-500 cursor-not-allowed"
                : "bg-sky-950 border-sky-600 text-sky-200 hover:bg-sky-900 hover:scale-105 hover:shadow-[0_0_20px_rgba(14,165,233,0.5)]"
            }`}
          >
            {phaseLabel === "行动" ? "结束回合" : phaseLabel}
          </button>
        </div>

        {/* Discard Pile (Bottom Right Corner) */}
        <div className="pointer-events-auto absolute bottom-6 right-48 flex flex-col items-center gap-1 cursor-pointer group z-30">
          <div className="flex h-16 w-12 items-center justify-center rounded bg-gray-800 text-gray-400 shadow-xl border-2 border-gray-600 font-bold text-3xl group-hover:-translate-y-1 transition-transform opacity-90">
             <GiPokerHand />
          </div>
          <span className="font-bold text-white drop-shadow-md text-base">{battleState.discardPile.length}</span>
        </div>

        {/* Hand Cards */}
        <div className="pointer-events-auto absolute bottom-6 left-1/2 flex -translate-x-1/2 items-end justify-center w-[50%] z-20">
          <AnimatePresence mode="popLayout">
            {battleState.hand.map((card, idx) => {
              const total = battleState.hand.length;
              const offset = idx - (total - 1) / 2;
              const rotate = offset * 4; 
              const yOffset = Math.abs(offset) * 6;
              const disabled = card.cost > player.energy;
              
              return (
                <motion.div
                  key={card.instanceId}
                  layout
                  initial={{ opacity: 0, y: 150, scale: 0.3 }}
                  animate={{ opacity: 1, y: yOffset, rotate: rotate, scale: 1 }}
                  whileHover={disabled ? {} : { y: yOffset - 30, rotate: 0, scale: 1.15, zIndex: 50 }}
                  exit={{ opacity: 0, y: -100, scale: 0.5, transition: { duration: 0.2 } }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  style={{ zIndex: idx }}
                  className="-mx-3 Card--draggable shrink-0"
                  aria-disabled={disabled}
                   onPointerDown={(e) => onPointerDown(e, card.instanceId, disabled)}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerCancel}
                >
                  <CardView
                    card={card}
                    imageUrl={cardImages[card.instanceId]}
                    disabled={disabled}
                    onClick={() => {}}
                  />
                </motion.div>
              )
            })}
          </AnimatePresence>
          {battleState.hand.length === 0 && (
            <motion.span
              className="absolute bottom-10 text-lg font-bold text-gray-500 drop-shadow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              手牌为空
            </motion.span>
          )}
        </div>
      </div>
    </div>
  );
}
