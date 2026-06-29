import { useEffect, useLayoutEffect, useMemo, useState, useRef, ReactNode } from "react";
import {
  GiGoblinHead,
  GiOgre,
  GiTripleSkulls,
  GiCampfire,
  GiScales,
  GiCardRandom,
  GiChest,
  GiRollingDices,
} from "react-icons/gi";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import clsx from "clsx";
import { MapNodeType } from "@shared/enums/MapNodeType";
import { MapGenerator, type MapNode } from "../systems/map";
import { useGameStore } from "../store";
import { pageEnter, buttonClick } from "../systems/sounds";
import { GameHeader } from "../ui";

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
  [MapNodeType.Monster]: "text-[#6d1b1b]",
  [MapNodeType.Elite]: "text-[#d32f2f]",
  [MapNodeType.Boss]: "text-[#4a148c]",
  [MapNodeType.Rest]: "text-[#2e7d32]",
  [MapNodeType.Shop]: "text-[#ef6c00]",
  [MapNodeType.Event]: "text-[#1565c0]",
  [MapNodeType.Treasure]: "text-[#fbc02d]",
  [MapNodeType.Mystery]: "text-[#455a64]",
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
  const [selectedIntro, setSelectedIntro] = useState<string | null>(null);
  const nodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<Array<{ key: string; x1: number; y1: number; x2: number; y2: number }>>([]);

  const nodes = run?.mapNodes ?? [];
  const mapFloors = run?.mapFloors ?? 0;
  const generator = useMemo(() => new MapGenerator(), []);

  useEffect(() => {
    setSelectedIntro(null);
  }, []);

  useEffect(() => {
    pageEnter();
    if (!run) navigate("/select");
  }, [run, navigate]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const newLines: typeof lines = [];
    for (const node of nodes) {
      for (const cIndex of node.connections) {
        const target = nodes[cIndex];
        if (!target) continue;
        const nodeEl = nodeRefs.current[node.id];
        const targetEl = nodeRefs.current[target.id];
        if (!nodeEl || !targetEl) continue;

        const nodeRect = nodeEl.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        const x1 = nodeRect.left - containerRect.left + nodeRect.width / 2;
        const y1 = nodeRect.top - containerRect.top + nodeRect.height / 2;
        const x2 = targetRect.left - containerRect.left + targetRect.width / 2;
        const y2 = targetRect.top - containerRect.top + targetRect.height / 2;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance === 0) continue;

        const padding = nodeRect.width / 2 + 8;
        const ux = dx / distance;
        const uy = dy / distance;

        newLines.push({
          key: `${node.id}-${target.id}`,
          x1: x1 + ux * padding,
          y1: y1 + uy * padding,
          x2: x2 - ux * padding,
          y2: y2 - uy * padding,
        });
      }
    }
    setLines(newLines);
  }, [nodes]);

  const floors = useMemo(() => {
    const groups: MapNode[][] = [];
    for (let f = 0; f < mapFloors; f++) {
      groups.push(nodes.filter((n) => n.floor === f));
    }
    return groups;
  }, [nodes, mapFloors]);

  const handleNodeClick = (node: MapNode) => {
    if (!node.available || node.visited) return;
    buttonClick();

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

  return (
    <div className="relative flex h-screen w-full flex-col items-center overflow-hidden bg-dark-950 font-sans text-gray-200 select-none">

      <GameHeader />

      {/* Intro Text */}
       <div className="absolute top-14 z-40 text-center pointer-events-none">
        <h1 className="font-display text-4xl text-gold-500 drop-shadow-md">龙骸之路</h1>
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

      {/* Legend Bar */}
       <div className="absolute left-0 right-0 top-24 z-40 flex h-16 w-full items-center justify-center bg-[#cba474]/90 px-6 text-sm text-amber-950 border-y-2 border-amber-900/30">
         <div className="flex items-center gap-4 font-bold">
          {Object.entries(NODE_LABELS).map(([type, label]) => (
            <div key={type} className="flex items-center gap-1">
              <span className={clsx("text-lg", NODE_COLORS[type as MapNodeType])}>{NODE_ICONS[type as MapNodeType]}</span>
              <span>{label}</span>
            </div>
          ))}
         </div>
      </div>

      {/* Scrollable Map Container */}
       <div className="relative z-10 mt-40 h-full w-full rounded-md shadow-2xl bg-[#e3d5ca] border-8 border-[#cba474] p-8 overflow-hidden">
         <div ref={containerRef} className="relative flex h-full w-full items-center justify-around px-2 ">
            <svg className="absolute inset-0 pointer-events-none z-0" style={{ width: '100%', height: '100%' }}>
             {lines.map(line => (
               <line
                 key={line.key}
                 x1={line.x1}
                 y1={line.y1}
                 x2={line.x2}
                 y2={line.y2}
                 stroke="#6b4729"
                 strokeWidth="2"
                 strokeDasharray="4 4"
               />
             ))}
           </svg>
           {floors.map((floorNodes) => (
             <div key={floorNodes[0]?.floor ?? 0} className="flex flex-col h-full items-center justify-between relative py-4">

               <span className="text-sm font-bold text-[#6b4729] opacity-50 pointer-events-none">
                 {floorNodes[0]?.floor}
               </span>

               <div className="flex flex-col h-full justify-around items-center">
                 {floorNodes.map((node) => {
                   const isFuture = !node.visited && !node.available;
                   const isAvailable = node.available && !node.visited;

                   return (
                     <motion.button
                       key={node.id}
                       ref={(el) => { nodeRefs.current[node.id] = el; }}
                       className={clsx(
                         "relative flex h-20 w-20 items-center justify-center text-5xl transition-all my-4",
                         NODE_COLORS[node.type],
                         isFuture ? "opacity-40" : "opacity-100",
                         node.visited ? "opacity-30" : "",
                         isAvailable ? "cursor-pointer scale-110 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]" : "cursor-default"
                       )}
                       whileHover={isAvailable ? { scale: 1.3, x: -5 } : {}}
                       whileTap={isAvailable ? { scale: 0.95 } : {}}
                       onClick={() => handleNodeClick(node)}
                       title={NODE_LABELS[node.type]}
                     >
                       {NODE_ICONS[node.type]}

                       {isAvailable && (
                         <div className="absolute -inset-2 rounded-full border-2 border-dashed border-gold-600 animate-spin-slow opacity-50 pointer-events-none"></div>
                       )}

                       {node.visited && (
                         <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-[10px] text-white shadow-md ring-1 ring-[#cba474]">
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
