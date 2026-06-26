import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapNodeType } from "@shared/enums/MapNodeType";
import { MapGenerator, type MapNode } from "../systems/map";
import { useGameStore } from "../store";

const NODE_LABELS: Record<MapNodeType, string> = {
  [MapNodeType.Monster]: "妖",
  [MapNodeType.Elite]: "将",
  [MapNodeType.Boss]: "王",
  [MapNodeType.Rest]: "憩",
  [MapNodeType.Shop]: "商",
  [MapNodeType.Event]: "遇",
  [MapNodeType.Treasure]: "宝",
  [MapNodeType.Mystery]: "？",
};

const NODE_COLORS: Record<MapNodeType, string> = {
  [MapNodeType.Monster]: "border-red-600 text-red-400 bg-red-950/40",
  [MapNodeType.Elite]: "border-orange-500 text-orange-400 bg-orange-950/40",
  [MapNodeType.Boss]: "border-purple-500 text-purple-400 bg-purple-950/40",
  [MapNodeType.Rest]: "border-green-500 text-green-400 bg-green-950/40",
  [MapNodeType.Shop]: "border-yellow-500 text-yellow-400 bg-yellow-950/40",
  [MapNodeType.Event]: "border-cyan-500 text-cyan-400 bg-cyan-950/40",
  [MapNodeType.Treasure]: "border-pink-500 text-pink-400 bg-pink-950/40",
  [MapNodeType.Mystery]: "border-gray-400 text-gray-300 bg-gray-800/40",
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
  const generator = useMemo(() => new MapGenerator(), []);
  const [mapData] = useState(() => generator.generate());
  const [nodes, setNodes] = useState(mapData.nodes);
  const [selectedIntro, setSelectedIntro] = useState<string | null>(null);

  const floors = useMemo(() => {
    const groups: MapNode[][] = [];
    for (let f = 0; f < mapData.floors; f++) {
      groups.push(nodes.filter((n) => n.floor === f));
    }
    return groups;
  }, [nodes, mapData.floors]);

  const handleNodeClick = (node: MapNode) => {
    if (!node.available || node.visited) return;

    generator.visitNode(nodes, node.id);
    setNodes([...nodes]);
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
    navigate("/select");
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-dark-900 p-4">
      <div className="mb-2 flex w-full max-w-md items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          第 {run.currentFloor} 层
        </span>
        <span className="flex items-center gap-3">
          <span>❤️ {run.currentHealth}/{run.maxHealth}</span>
          <span>💰 {run.gold}</span>
          <span>🎒 {run.deck.length}</span>
        </span>
      </div>

      <h1 className="mb-1 font-display text-2xl text-gold-400">西行之路</h1>
      {selectedIntro && (
        <motion.p
          className="mb-4 text-sm text-gray-400"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          key={selectedIntro}
        >
          {selectedIntro}
        </motion.p>
      )}

      <div className="flex max-h-[70vh] flex-col gap-1 overflow-y-auto px-4">
        {floors.map((floorNodes) => (
          <div key={floorNodes[0]?.floor ?? 0} className="flex items-center gap-2">
            <span className="w-6 text-right text-xs text-gray-600">
              {floorNodes[0]?.floor}
            </span>
            <svg width="32" height="32" className="shrink-0">
              <line x1="0" y1="16" x2="32" y2="16" stroke="#1a1a2e" strokeWidth="1" />
            </svg>
            <div className="flex gap-3">
              {floorNodes.map((node) => {
                const colors = NODE_COLORS[node.type];
                const isFuture = !node.visited && !node.available;
                return (
                  <motion.button
                    key={node.id}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${
                      isFuture ? "border-gray-800 bg-dark-800 text-gray-700" : colors
                    } ${
                      node.available && !node.visited
                        ? "cursor-pointer shadow-lg shadow-gold-500/20"
                        : "cursor-default"
                    } ${node.visited ? "opacity-60" : ""}`}
                    whileHover={node.available && !node.visited ? { scale: 1.15 } : {}}
                    whileTap={node.available && !node.visited ? { scale: 0.9 } : {}}
                    onClick={() => handleNodeClick(node)}
                    title={node.type}
                  >
                    {NODE_LABELS[node.type]}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
