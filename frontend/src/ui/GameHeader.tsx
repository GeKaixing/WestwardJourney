import { useNavigate } from "react-router-dom";
import {
  GiHearts,
  GiCoins,
  GiCampfire,
  GiHealthPotion,
  GiCompass,
  GiHourglass,
  GiTreasureMap,
  GiPokerHand,
  GiCog,
} from "react-icons/gi";
import { PLAYER_CONFIGS, RELIC_CONFIGS } from "../data";
import { useGameStore } from "../store";
import { Tooltip } from "./Tooltip";

interface GameHeaderProps {
  playerName?: string;
  currentHealth?: number;
  maxHealth?: number;
  hideAvatar?: boolean;
}

export function GameHeader({ playerName, currentHealth, maxHealth, hideAvatar }: GameHeaderProps) {
  const navigate = useNavigate();
  const run = useGameStore((s) => s.run);

  if (!run) return null;

  const config = PLAYER_CONFIGS[run.characterClass];
  const health = currentHealth ?? run.currentHealth;
  const maxHp = maxHealth ?? run.maxHealth;
  const name = playerName ?? config?.displayName ?? "未知";

  return (
    <div className="absolute left-0 right-0 top-0 z-50 flex h-14 w-full items-center justify-between bg-[#1e262f] px-6 text-sm shadow-md border-b border-black/50">
      {/* Left: Avatar / Name / HP / Gold / Relics / Potions */}
      <div className="flex items-center gap-6 pointer-events-auto">
        <div className="flex items-center gap-4">
          {!hideAvatar && config?.avatar && (
            <img
              src={config.avatar}
              alt={name}
              className="h-8 w-8 rounded-full border-2 border-amber-600 shadow-md"
            />
          )}
          <span className="font-bold text-gray-200">{name}</span>
          <div className="flex items-center gap-1 font-bold text-red-400">
            <GiHearts className="text-xl" /> {health}/{maxHp}
          </div>
          <div className="flex items-center gap-1 font-bold text-yellow-400">
            <GiCoins className="text-xl" /> {run.gold}
          </div>
        </div>

        <div className="flex gap-1 border-l border-gray-600/50 pl-4">
          {run.relics.map((r, i) => {
            const relicConfig = RELIC_CONFIGS.find((rc) => rc.id === r.configId);
            return (
              <Tooltip key={i} content={relicConfig?.description ?? relicConfig?.name ?? ""}>
                <div className="flex h-8 w-8 items-center justify-center cursor-pointer transition-transform hover:scale-110">
                  {relicConfig?.image ? (
                    <img src={relicConfig.image} alt={relicConfig.name} className="h-8 w-8 object-contain" />
                  ) : (
                    <GiCampfire className="text-xl text-orange-500" />
                  )}
                </div>
              </Tooltip>
            );
          })}
        </div>

        <div className="flex gap-2 border-l border-gray-600/50 pl-4">
          {run.potions.length > 0 ? run.potions.map((p, i) => (
            <Tooltip key={i} content={`${p.name}：${p.description}`}>
              <div className="flex h-8 w-8 items-center justify-center cursor-pointer transition-transform hover:scale-110">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="h-8 w-8 object-contain" />
                ) : (
                  <GiHealthPotion className="text-xl text-green-400" />
                )}
              </div>
            </Tooltip>
          )) : (
            <>
              <div className="h-8 w-8 rounded bg-black/20 border border-gray-600/50 border-dashed opacity-50" />
              <div className="h-8 w-8 rounded bg-black/20 border border-gray-600/50 border-dashed opacity-50" />
              <div className="h-8 w-8 rounded bg-black/20 border border-gray-600/50 border-dashed opacity-50" />
            </>
          )}
        </div>
      </div>

      {/* Right: Floor / Time / Map / Deck / Settings */}
      <div className="flex items-center gap-6 pointer-events-auto text-gray-300">
        <div className="flex items-center gap-4 font-bold">
          <span className="flex items-center gap-1 text-green-400"><GiCompass className="text-xl" /> {run.currentFloor}</span>
          <span className="flex items-center gap-1"><GiHourglass className="text-xl text-yellow-500" /> 00:00</span>
        </div>

        <div className="flex items-center gap-5 border-l border-gray-600/50 pl-4">
          <button className="flex items-center hover:text-white transition-colors text-2xl" title="地图">
            <GiTreasureMap />
          </button>
          <button
            className="flex items-center gap-1 hover:text-white transition-colors font-bold"
            title="牌组"
            onClick={() => navigate("/deck")}
          >
            <GiPokerHand className="text-2xl" /> <span className="text-base">{run.deck.length}</span>
          </button>
          <button
            className="flex items-center hover:text-white transition-colors text-2xl"
            title="设置"
            onClick={() => navigate("/settings")}
          >
            <GiCog />
          </button>
        </div>
      </div>
    </div>
  );
}
