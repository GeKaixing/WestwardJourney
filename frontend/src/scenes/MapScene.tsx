import { useCallback, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { GiGoblinHead, GiOgre, GiTripleSkulls, GiCampfire, GiScales, GiCardRandom, GiChest, GiRollingDices } from "react-icons/gi";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapNodeType } from "@shared/enums/MapNodeType";
import { MapGenerator, type MapNode, NodeVisibility } from "../systems/map";
import { useGameStore } from "../store";
import { pageEnter, buttonClick } from "../systems/sounds";
import { GameHeader } from "../ui";

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
  [MapNodeType.Monster]: "#4a0e0e",
  [MapNodeType.Elite]: "#b71c1c",
  [MapNodeType.Boss]: "#31106b",
  [MapNodeType.Rest]: "#1b5e20",
  [MapNodeType.Shop]: "#e65100",
  [MapNodeType.Event]: "#0d47a1",
  [MapNodeType.Treasure]: "#f9a825",
  [MapNodeType.Mystery]: "#263238",
};


export function MapScene() {
  const navigate = useNavigate();
  const run = useGameStore((s) => s.run);
  const setFloor = useGameStore((s) => s.setFloor);
  const setMapNodes = useGameStore((s) => s.setMapNodes);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const generator = useMemo(() => new MapGenerator(), []);

  const nodes = run?.mapNodes ?? [];

  useEffect(() => { pageEnter(); if (!run) navigate("/select"); }, [run, navigate]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { minX, minY, rangeX, rangeY, scale, nodeSize } = useMemo(() => {
    if (nodes.length === 0) return { minX: 0, minY: 0, rangeX: 1, rangeY: 1, scale: 100, nodeSize: 32 };
    let mnX = Infinity, mxX = -Infinity, mnY = Infinity, mxY = -Infinity;
    for (const n of nodes) {
      if (n.position.x < mnX) mnX = n.position.x;
      if (n.position.x > mxX) mxX = n.position.x;
      if (n.position.y < mnY) mnY = n.position.y;
      if (n.position.y > mxY) mxY = n.position.y;
    }
    const rx = mxX - mnX || 1;
    const ry = mxY - mnY || 1;
    const pad = 80;
    const s = Math.min((size.w - pad * 2) / rx, (size.h - pad * 2) / ry);
    return { minX: mnX, minY: mnY, rangeX: rx, rangeY: ry, scale: s, nodeSize: Math.max(32, Math.min(72, s * 2.2)) };
  }, [nodes, size]);

  const STRETCH_X = 1.4;
  const STRETCH_Y = 1;
  const toPx = useCallback((pos: { x: number; y: number }) => ({
    x: (pos.x - minX) * scale * STRETCH_X + (size.w - rangeX * scale * STRETCH_X) / 2,
    y: (minY + rangeY - pos.y) * scale * STRETCH_Y + (size.h - rangeY * scale * STRETCH_Y) / 2,
  }), [minX, minY, scale, rangeX, rangeY, size]);

  const lines = useMemo(() => {
    const out: { key: string; x1: number; y1: number; x2: number; y2: number; active: boolean }[] = [];
    for (const node of nodes) {
      const from = toPx(node.position);
      for (const outIdx of node.outgoing) {
        const target = nodes[outIdx];
        if (!target) continue;
        const to = toPx(target.position);
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1) continue;
        const pad = nodeSize / 2 + 6;
        const ux = dx / dist;
        const uy = dy / dist;
        const active = node.visited && (target.available || target.visited);
        out.push({
          key: `${node.id}-${target.id}`,
          x1: from.x + ux * pad,
          y1: from.y + uy * pad,
          x2: to.x - ux * pad,
          y2: to.y - uy * pad,
          active,
        });
      }
    }
    return out;
  }, [nodes, toPx]);

  const handleNodeClick = useCallback((node: MapNode) => {
    if (!node.available || node.visited) return;
    buttonClick();
    const nextNodes = nodes.map(n => ({
      ...n,
      outgoing: [...n.outgoing],
      incoming: [...n.incoming],
    }));
    generator.visitNode(nextNodes, node.id);
    setMapNodes(nextNodes);
    setFloor(node.floor);

    const routes: Partial<Record<MapNodeType, string>> = {
      [MapNodeType.Monster]: "/battle",
      [MapNodeType.Elite]: "/battle",
      [MapNodeType.Boss]: "/battle",
      [MapNodeType.Rest]: "/rest",
      [MapNodeType.Shop]: "/shop",
      [MapNodeType.Event]: "/event",
      [MapNodeType.Mystery]: "/event",
      [MapNodeType.Treasure]: "/event",
    };
    const path = routes[node.type];
    if (path) navigate(path);
  }, [nodes, generator, setMapNodes, setFloor, navigate]);

  if (!run) return null;

  return (
    <div className="relative flex h-screen w-full flex-col bg-dark-950 overflow-hidden select-none">
      <GameHeader />

      {/* Scrollable map area */}
      <div ref={containerRef} className="relative flex-1 m-4 rounded-xl bg-[#0f0a08] border border-amber-900/20 overflow-auto">
        <div className="relative w-full h-full min-h-[500px]">
          {/* Background layer tint */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-950/10 to-transparent pointer-events-none" />

          {/* Connection lines */}
          <svg className="absolute inset-0 pointer-events-none z-0" style={{ width: '100%', height: '100%' }}>
            {lines.map(line => (
                  <line
                    key={line.key}
                    x1={line.x1} y1={line.y1}
                    x2={line.x2} y2={line.y2}
                    stroke={line.active ? "#fbbf24" : "#a16207"}
                    strokeWidth={4}
                    strokeDasharray="8 5"
                  strokeLinecap="round"
                  opacity={line.active ? 1 : 0.7}
                />

            ))}
          </svg>

          {/* Nodes */}
          <AnimatePresence>
              {nodes.map(node => {
                const revealed = true; // ponytail: forced true for debug
                if (node.incoming.length === 0 && node.outgoing.length === 0) return null;
                if (!revealed && node.visibility === NodeVisibility.Hidden) return null;

                const pos = toPx(node.position);
                const available = node.available && !node.visited;
                const visited = node.visited;
                const locked = !visited && !available;
                const color = NODE_COLORS[node.type] ?? "#fff"; // ponytail: force white if unknown

                return (
                  <motion.button
                    key={node.id}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: locked ? (node.visibility === NodeVisibility.Blurred ? 0.3 : 0.45) : 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}

                  transition={{ duration: 0.2 }}
                  className="absolute z-10 flex items-center justify-center rounded-full cursor-pointer outline-none"
                  style={{
                    left: pos.x - nodeSize / 2,
                    top: pos.y - nodeSize / 2,
                    width: nodeSize,
                    height: nodeSize,
                    fontSize: revealed ? nodeSize * 0.65 : nodeSize * 0.5,
                    color: visited ? "#aaa" : locked ? "#666" : color,
                    background: visited
                      ? "rgba(255,255,255,0.1)"
                      : available
                        ? "rgba(255,255,255,0.15)"
                        : "transparent",
                    boxShadow: available ? `0 0 15px ${color}88` : "none",
                    border: available ? `2px solid ${color}88` : "none",
                  }}
                  whileHover={available ? { scale: 1.25 } : {}}
                  whileTap={available ? { scale: 0.9 } : {}}
                  onClick={() => handleNodeClick(node)}
                >
                  {revealed ? (NODE_ICONS[node.type] ?? <span className="font-black text-white">?</span>) : <span className="font-black text-white">?</span>}

                  {visited && (
                    <span className="absolute -right-1 -top-1 w-4 h-4 flex items-center justify-center rounded-full bg-green-600 text-[9px] text-white shadow ring-1 ring-black/30">
                      ✓
                    </span>
                  )}

                  {available && (
                    <>
                      <span className="absolute inset-0 rounded-full border-2 border-dashed border-amber-400 animate-spin-slow pointer-events-none" />
                      <span className="absolute inset-0 rounded-full animate-ping opacity-40 pointer-events-none" style={{ background: color }} />
                    </>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
