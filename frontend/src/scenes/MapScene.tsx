import { useEffect, useMemo, useState, ReactNode } from "react";
import {
  GiGoblinHead,
  GiOgre,
  GiTripleSkulls,
  GiCampfire,
  GiScales,
  GiCardRandom,
  GiChest,
  GiRollingDices,
  GiHearts,
  GiCoins,
  GiHealthPotion,
  GiCompass,
  GiHourglass,
  GiTreasureMap,
  GiPokerHand,
  GiCog,
} from "react-icons/gi";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import clsx from "clsx";
import { MapNodeType } from "@shared/enums/MapNodeType";
import { MapGenerator, type MapNode } from "../systems/map";
import { useGameStore } from "../store";
import { PLAYER_CONFIGS, RELIC_CONFIGS } from "../data";

const NODE_LABELS: Record<MapNodeType, string> = {
  [MapNodeType.Monster]: "敌人",
  [MapNodeType.Elite]: "精英",
  [MapNodeType.Boss]: "首领",
  [MapNodeType.Rest]: "休息",
  [MapNodeType.Shop]: "商人",
  [MapNodeType.Event]: "事件",
  [MapNodeType.Treasure]: "宝箱",
  [MapNodeType.Mystery]: "未知",
};

const NODE_ICONS: Record<MapNodeType, ReactNode> = {
  [MapNodeType.Monster]: <GiGoblinHead />,
  [MapNodeType.Elite]: <GiOgre />,
  [MapNodeType.Boss]: <GiTripleSkulls />,
  [MapNodeType.Rest]: <GiCampfire />,
  [MapNodeType.Shop]: <GiScales />,
  [MapNodeType.Event]: <GiCardRandom />,
  [MapNodeType.Treasure]: <GiChest />,
  [MapNodeType.Mystery]: <GiRollingDices />,
};

const NODE_COLORS: Record<MapNodeType, string> = {
  [MapNodeType.Monster]: "text-[#3e2723]",
  [MapNodeType.Elite]: "text-red-900",
  [MapNodeType.Boss]: "text-red-950 scale-125",
  [MapNodeType.Rest]: "text-green-900",
  [MapNodeType.Shop]: "text-purple-900",
  [MapNodeType.Event]: "text-blue-900",
  [MapNodeType.Treasure]: "text-yellow-800",
  [MapNodeType.Mystery]: "text-teal-900",
};

const NODE_INTROS: Record<MapNodeType, string> = {
  [MapNodeType.Monster]: "妖魔挡道！",
  [MapNodeType.Elite]: "强敌当前！",
  [MapNodeType.Boss]: "妖王降临！",
  [MapNodeType.Rest]: "前方有篝火，可以歇息。",
  [MapNodeType.Shop]: "路旁有家店铺。",
  [MapNodeType.Event]: "前方似有异样...",
  [MapNodeType.Treasure]: "发现宝箱！",
  [MapNodeType.Mystery]: "前路未知...",
};

export function MapScene() {
  const navigate = useNavigate();
  const run = useGameStore((s) => s.run);
  const setFloor = useGameStore((s) => s.setFloor);
  const setMapNodes = useGameStore((s) => s.setMapNodes);
  const generator = useMemo(() => new MapGenerator(), []);
  const [selectedIntro, setSelectedIntro] = useState<string | null>(null);
  const nodes = run?.mapNodes ?? [];
  const mapFloors = run?.mapFloors ?? 0;

  useEffect(() => {
    if (!run) navigate("/select");
  }, [run, navigate]);

  const floors = useMemo(() => {
    const groups: MapNode[][] = [];
    for (let f = 0; f < mapFloors; f++) {
      groups.push(nodes.filter((n) => n.floor === f));
    }
    return groups;
  }, [nodes, mapFloors]);

  const handleNodeClick = (node: MapNode) => {
    if (!node.available || node.visited) return;

    const nextNodes = nodes.map((entry) => ({
      ...entry,
      connections: [...entry.connections],
    }));
    generator.visitNode(nextNodes, node.id);
    setMapNodes(nextNodes);
    setFloor(node.floor);
    setSelectedIntro(NODE_INTROS[node.type]);

    const pathMap: Partial<Record<MapNodeType, string>> = {
      [MapNodeType.Monster]: "/battle",
      [MapNodeType.Elite]: "/battle",
      [MapNodeType.Boss]: "/battle",
      [MapNodeType.Rest]: "/rest",
      [MapNodeType.Shop]: "/shop",
      [MapNodeType.Event]: "/event",
      [MapNodeType.Mystery]: "/event",
      [MapNodeType.Treasure]: "/event",
    };

    const path = pathMap[node.type];
    if (path) {
      navigate(path);
    }
  };

  if (!run) {
    return null;
  }

  const playerConfig = PLAYER_CONFIGS[run.characterClass];

  return (
    <div className="relative flex h-screen w-full flex-col items-center overflow-hidden bg-dark-950 font-sans text-gray-200 select-none">
      
      {/* Full-width Header */}
      <div className="absolute left-0 right-0 top-0 z-50 flex h-14 w-full items-center justify-between bg-[#1e262f] px-6 text-sm shadow-md border-b border-black/50">
        {/* Top Left: Name, HP, Gold, Relics, Potions */}
        <div className="flex items-center gap-6 pointer-events-auto">
          <div className="flex items-center gap-4">
            {playerConfig?.avatar && (
              <img 
                src={playerConfig.avatar} 
                alt={playerConfig.displayName}
                className="h-8 w-8 rounded-full border-2 border-amber-600 shadow-md"
              />
            )}
            <span className="font-bold text-gray-200">{playerConfig?.displayName ?? "未知"}</span>
            <div className="flex items-center gap-1 font-bold text-red-400">
              <GiHearts className="text-xl" /> {run.currentHealth}/{run.maxHealth}
            </div>
            <div className="flex items-center gap-1 font-bold text-yellow-400">
              <GiCoins className="text-xl" /> {run.gold}
            </div>
          </div>
          
          <div className="flex gap-1 border-l border-gray-600/50 pl-4">
             {/* Relics */}
             {run.relics.map((r, i) => {
               const config = RELIC_CONFIGS.find(rc => rc.id === r.configId);
               return (
                 <div key={i} className="flex h-8 w-8 items-center justify-center cursor-help transition-transform hover:scale-110" title={config?.name}>
                   {config?.image ? (
                     <img src={config.image} alt={config.name} className="h-8 w-8 object-contain" />
                   ) : (
                     <GiCampfire className="text-xl text-orange-500" />
                   )}
                 </div>
               );
             })}
           </div>

           <div className="flex gap-2 border-l border-gray-600/50 pl-4">
             {/* Potions */}
             {run.potions.length > 0 ? run.potions.map((p, i) => (
               <div key={i} className="flex h-8 w-8 items-center justify-center cursor-help transition-transform hover:scale-110" title={p.name}>
                 {p.image ? (
                   <img src={p.image} alt={p.name} className="h-8 w-8 object-contain" />
                 ) : (
                   <GiHealthPotion className="text-xl text-green-400" />
                 )}
               </div>
             )) : (
              // Empty potion slots placeholders
              <>
                <div className="h-8 w-8 rounded bg-black/20 border border-gray-600/50 border-dashed opacity-50"></div>
                <div className="h-8 w-8 rounded bg-black/20 border border-gray-600/50 border-dashed opacity-50"></div>
                <div className="h-8 w-8 rounded bg-black/20 border border-gray-600/50 border-dashed opacity-50"></div>
              </>
            )}
          </div>
        </div>
        
        {/* Top Right: Floor, Time, Map, Deck, Settings */}
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

      {/* Intro Text */}
      <div className="absolute top-20 z-40 text-center pointer-events-none">
        <h1 className="font-display text-4xl text-gold-500 drop-shadow-md">西行之路</h1>
        {selectedIntro && (
          <motion.p
            className="mt-2 text-lg text-gray-300 drop-shadow"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            key={selectedIntro}
          >
            {selectedIntro}
          </motion.p>
        )}
      </div>

      {/* Right Legend */}
      <div 
        className="absolute right-12 top-1/2 z-40 -translate-y-1/2 w-48 rounded-md p-4 text-amber-950 shadow-2xl border-2 border-amber-900/50 transform rotate-1 pointer-events-none bg-dark-800"
      >
        <h3 className="mb-4 text-center font-display text-2xl font-bold border-b border-amber-900/30 pb-2">图例</h3>
        <div className="flex flex-col gap-3 font-bold">
          {Object.entries(NODE_LABELS).map(([type, label]) => (
            <div key={type} className="flex items-center gap-3">
              <span className={clsx("flex w-8 justify-center text-xl drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]", NODE_COLORS[type as MapNodeType])}>{NODE_ICONS[type as MapNodeType]}</span>
              <span className="text-lg">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable Map Container */}
      <div className="relative z-10 mt-36 mb-10 h-full w-full max-w-3xl overflow-hidden rounded-lg shadow-2xl bg-dark-800">
         <div className="relative flex h-full flex-col-reverse overflow-y-auto px-16 py-12 [&::-webkit-scrollbar]:hidden">
            {floors.map((floorNodes) => (
              <div key={floorNodes[0]?.floor ?? 0} className="flex min-h-[100px] w-full items-center justify-center relative">
                
                {/* Floor Number Indicator */}
                <span className="absolute left-0 text-sm font-bold text-[#6b4729] opacity-50 pointer-events-none">
                  层 {floorNodes[0]?.floor}
                </span>

                <div className="flex w-full justify-around items-center px-12">
                  {floorNodes.map((node) => {
                    const isFuture = !node.visited && !node.available;
                    const isAvailable = node.available && !node.visited;
                    
                    return (
                      <motion.button
                        key={node.id}
                        className={clsx(
                          "relative flex h-14 w-14 items-center justify-center text-4xl transition-all drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]",
                          NODE_COLORS[node.type],
                          isFuture ? "opacity-40 grayscale" : "opacity-100",
                          node.visited ? "opacity-30 grayscale" : "",
                          isAvailable ? "cursor-pointer drop-shadow-[0_0_15px_rgba(250,204,21,1)] scale-110" : "cursor-default"
                        )}
                        whileHover={isAvailable ? { scale: 1.3, y: -5 } : {}}
                        whileTap={isAvailable ? { scale: 0.95 } : {}}
                        onClick={() => handleNodeClick(node)}
                        title={NODE_LABELS[node.type]}
                      >
                        {NODE_ICONS[node.type]}
                        
                        {/* Selected Indicator */}
                        {isAvailable && (
                          <div className="absolute -inset-2 rounded-full border-2 border-dashed border-gold-600 animate-spin-slow opacity-50 pointer-events-none"></div>
                        )}
                        
                        {/* Visited Checkmark */}
                        {node.visited && (
                          <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs text-white shadow-md ring-2 ring-[#cba474]">
                            ✓
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
         </div>
      </div>

    </div>
  );
}
