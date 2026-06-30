import { MapNodeType } from "@shared/enums/MapNodeType";
import { createRng, shuffleArray } from "../../utils/seededRandom";

export enum NodeVisibility { Visible, Blurred, Hidden }
export enum RoutePersonality { Balanced, Combat, Wealth, Event }

export interface MapNode {
  id: string;
  floor: number;
  col: number;
  type: MapNodeType;
  position: { x: number; y: number };
  incoming: number[];
  outgoing: number[];
  visited: boolean;
  available: boolean;
  visibility: NodeVisibility; // ponytail: added for hierarchy
  personality: RoutePersonality; // ponytail: added for play style
}

export interface MapLayerConfig {
  nodeType: MapNodeType;
  /** Unity uses FloatMinMax — random distance in [base - spread, base + spread] */
  distanceFromPreviousLayer: number;
  distanceSpread: number;
  nodesApartDistance: number;
  randomizePosition: number;
  randomizeNodes: number;
}

export interface MapConfig {
  gridWidth: number;
  numOfStartingNodes: number;
  numOfPreBossNodes: number;
  extraPaths: number;
  randomNodes: MapNodeType[];
  layers: MapLayerConfig[];
}

export interface GeneratedMap {
  nodes: MapNode[];
  config: MapConfig;
}

function rndRange(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

export const DEFAULT_MAP_CONFIG: MapConfig = {
  gridWidth: 7,
  numOfStartingNodes: 3,
  numOfPreBossNodes: 3,
  extraPaths: 1,
  randomNodes: [
    MapNodeType.Monster, MapNodeType.Elite, MapNodeType.Rest,
    MapNodeType.Shop, MapNodeType.Event, MapNodeType.Treasure, MapNodeType.Mystery,
  ],
  layers: [
    { nodeType: MapNodeType.Monster, distanceFromPreviousLayer: 0,   distanceSpread: 0, nodesApartDistance: 2.5, randomizePosition: 0.15, randomizeNodes: 0 },
    { nodeType: MapNodeType.Monster, distanceFromPreviousLayer: 2.0, distanceSpread: 0.3, nodesApartDistance: 2.5, randomizePosition: 0.2,  randomizeNodes: 0.3 },
    { nodeType: MapNodeType.Monster, distanceFromPreviousLayer: 2.0, distanceSpread: 0.3, nodesApartDistance: 2.5, randomizePosition: 0.2,  randomizeNodes: 0.4 },
    { nodeType: MapNodeType.Monster, distanceFromPreviousLayer: 2.0, distanceSpread: 0.3, nodesApartDistance: 2.5, randomizePosition: 0.2,  randomizeNodes: 0.5 },
    { nodeType: MapNodeType.Elite,   distanceFromPreviousLayer: 2.0, distanceSpread: 0.3, nodesApartDistance: 2.5, randomizePosition: 0.25, randomizeNodes: 0.4 },
    { nodeType: MapNodeType.Monster, distanceFromPreviousLayer: 2.0, distanceSpread: 0.4, nodesApartDistance: 2.5, randomizePosition: 0.25, randomizeNodes: 0.5 },
    { nodeType: MapNodeType.Monster, distanceFromPreviousLayer: 2.0, distanceSpread: 0.4, nodesApartDistance: 2.5, randomizePosition: 0.25, randomizeNodes: 0.5 },
    { nodeType: MapNodeType.Monster, distanceFromPreviousLayer: 2.0, distanceSpread: 0.4, nodesApartDistance: 2.5, randomizePosition: 0.25, randomizeNodes: 0.6 },
    { nodeType: MapNodeType.Elite,   distanceFromPreviousLayer: 2.0, distanceSpread: 0.4, nodesApartDistance: 2.5, randomizePosition: 0.3,  randomizeNodes: 0.5 },
    { nodeType: MapNodeType.Monster, distanceFromPreviousLayer: 2.0, distanceSpread: 0.4, nodesApartDistance: 2.5, randomizePosition: 0.3,  randomizeNodes: 0.6 },
    { nodeType: MapNodeType.Monster, distanceFromPreviousLayer: 2.0, distanceSpread: 0.4, nodesApartDistance: 2.5, randomizePosition: 0.3,  randomizeNodes: 0.6 },
    { nodeType: MapNodeType.Monster, distanceFromPreviousLayer: 2.0, distanceSpread: 0.4, nodesApartDistance: 2.5, randomizePosition: 0.3,  randomizeNodes: 0.7 },
    { nodeType: MapNodeType.Elite,   distanceFromPreviousLayer: 2.0, distanceSpread: 0.4, nodesApartDistance: 2.5, randomizePosition: 0.35, randomizeNodes: 0.6 },
    { nodeType: MapNodeType.Monster, distanceFromPreviousLayer: 2.0, distanceSpread: 0.4, nodesApartDistance: 2.5, randomizePosition: 0.35, randomizeNodes: 0.7 },
    { nodeType: MapNodeType.Monster, distanceFromPreviousLayer: 2.0, distanceSpread: 0.4, nodesApartDistance: 2.5, randomizePosition: 0.4,  randomizeNodes: 0.7 },
    { nodeType: MapNodeType.Monster, distanceFromPreviousLayer: 2.0, distanceSpread: 0.4, nodesApartDistance: 2.5, randomizePosition: 0.4,  randomizeNodes: 0.8 },
    { nodeType: MapNodeType.Boss,    distanceFromPreviousLayer: 2.5, distanceSpread: 0.4, nodesApartDistance: 2.5, randomizePosition: 0,    randomizeNodes: 0 },
  ],
};

export class MapGenerator {
  private config!: MapConfig;
  private nodes: MapNode[] = [];
  private layerYs: number[] = [];
  private rng: () => number;
  private seed: number;

  constructor(seed?: number) {
    this.seed = seed ?? Date.now();
    this.rng = createRng(this.seed);
  }

  getSeed(): number {
    return this.seed;
  }

  generate(config?: MapConfig): GeneratedMap {
    this.config = config ?? DEFAULT_MAP_CONFIG;
    this.nodes = [];
    this.layerYs = [];

    // 1. Calculate layer Y positions with random spread (mirrors Unity's FloatMinMax)
    for (let f = 0; f < this.config.layers.length; f++) {
      const l = this.config.layers[f]!;
      const dist = l.distanceFromPreviousLayer + rndRange(this.rng, -l.distanceSpread, l.distanceSpread);
      this.layerYs.push(f === 0 ? 0 : (this.layerYs[f - 1]! + Math.max(0.5, dist)));
    }

    // 2. Place all nodes on all layers
    for (let f = 0; f < this.config.layers.length; f++) this.placeLayer(f);

    // 3. Generate paths (returns grid coordinates only)
    const paths = this.generatePaths();

    // 4. Set up connections from paths
    this.setUpConnections(paths);

    // 5. Randomize node positions (mirrors Unity exactly)
    this.randomizeNodePositions();

    // 6. Remove cross connections
    this.removeCrossConnections();

    // 7. Mark floor 0 as available
    for (const n of this.nodes) { if (n.floor === 0) n.available = true; }

    return { nodes: this.nodes, config: this.config };
  }

  private placeLayer(floor: number): void {
    const layer = this.config.layers[floor]!;
    const offset = layer.nodesApartDistance * (this.config.gridWidth - 1) / 2;
    const isBoss = layer.nodeType === MapNodeType.Boss;

    for (let col = 0; col < this.config.gridWidth; col++) {
      this.nodes.push({
        id: `${floor}_${col}`,
        floor,
        col,
        type: isBoss ? MapNodeType.Boss : this.pickNodeType(layer),
        position: { x: -offset + col * layer.nodesApartDistance, y: this.layerYs[floor]! },
        incoming: [],
        outgoing: [],
        visited: false,
        available: false,
        visibility: floor < 2 ? NodeVisibility.Visible : NodeVisibility.Hidden, 
        personality: RoutePersonality.Balanced, 
      });
    }
  }

  private pickNodeType(layer: MapLayerConfig): MapNodeType {
    if (this.rng() < layer.randomizeNodes) {
      return this.config.randomNodes[Math.floor(this.rng() * this.config.randomNodes.length)]!;
    }
    return layer.nodeType;
  }

  private getNode(col: number, floor: number): MapNode | undefined {
    return this.nodes.find(n => n.col === col && n.floor === floor);
  }

  private getNodeIndex(col: number, floor: number): number {
    return this.nodes.findIndex(n => n.col === col && n.floor === floor);
  }

  private getFinalBossPoint(): { col: number; floor: number } {
    const lastFloor = this.config.layers.length - 1;
    const mid = Math.floor(this.config.gridWidth / 2);
    if (this.config.gridWidth % 2 === 1) return { col: mid, floor: lastFloor };
    return this.rng() < 0.5
      ? { col: mid, floor: lastFloor }
      : { col: mid - 1, floor: lastFloor };
  }

  private generatePaths(): { col: number; floor: number }[][] {
    const lastFloor = this.config.layers.length - 1;
    const bossPoint = this.getFinalBossPoint();

    let cols = Array.from({ length: this.config.gridWidth }, (_, i) => i);
    cols = shuffleArray(this.rng, cols);
    const startingCols = cols.slice(0, this.config.numOfStartingNodes);
    const startingPoints = startingCols.map(c => ({ col: c, floor: 0 }));

    cols = shuffleArray(this.rng, cols);
    const preBossCols = cols.slice(0, this.config.numOfPreBossNodes);
    const preBossPoints = preBossCols.map(c => ({ col: c, floor: lastFloor - 1 }));

    const numPaths = Math.max(this.config.numOfStartingNodes, this.config.numOfPreBossNodes) + Math.max(0, this.config.extraPaths);
    const paths: { col: number; floor: number }[][] = [];

    for (let i = 0; i < numPaths; i++) {
      const from = startingPoints[i % this.config.numOfStartingNodes]!;
      const to = preBossPoints[i % this.config.numOfPreBossNodes]!;
      const path = this.generatePath(from, to);
      path.push(bossPoint);
      paths.push(path);
    }
    return paths;
  }

  private generatePath(from: { col: number; floor: number }, to: { col: number; floor: number }): { col: number; floor: number }[] {
    const path: { col: number; floor: number }[] = [from];
    let lastCol = from.col;

    for (let row = 1; row < to.floor; row++) {
      const candidates: number[] = [];
      const verticalDistance = to.floor - row;
      for (const dc of [-1, 0, 1]) {
        const cc = lastCol + dc;
        if (cc < 0 || cc >= this.config.gridWidth) continue;
        if (Math.abs(to.col - cc) <= verticalDistance) candidates.push(cc);
      }
      const chosen = candidates.length > 0 ? candidates[Math.floor(this.rng() * candidates.length)]! : lastCol;
      path.push({ col: chosen, floor: row });
      lastCol = chosen;
    }
    path.push(to);
    return path;
  }

  private setUpConnections(paths: { col: number; floor: number }[][]): void {
    for (const path of paths) {
      for (let i = 0; i < path.length - 1; i++) {
        const fi = this.getNodeIndex(path[i]!.col, path[i]!.floor);
        const ti = this.getNodeIndex(path[i + 1]!.col, path[i + 1]!.floor);
        if (fi === -1 || ti === -1) continue;
        const fn = this.nodes[fi]!;
        const tn = this.nodes[ti]!;
        if (!fn.outgoing.includes(ti)) fn.outgoing.push(ti);
        if (!tn.incoming.includes(fi)) tn.incoming.push(fi);
      }
    }
  }

  private randomizeNodePositions(): void {
    for (let f = 0; f < this.config.layers.length; f++) {
      const layer = this.config.layers[f]!;
      if (layer.randomizePosition <= 0) continue;
      const floorNodes = this.nodes.filter(n => n.floor === f);
      const distToPrev = f > 0 ? this.layerYs[f]! - this.layerYs[f - 1]! : 0;
      const distToNext = f < this.config.layers.length - 1 ? this.layerYs[f + 1]! - this.layerYs[f]! : 0;

      for (const node of floorNodes) {
        // Exact mirror of Unity's RandomizeNodePositions
        const xRnd = this.rng() - 0.5;
        const yRnd = this.rng() - 0.5;
        const dx = xRnd * layer.nodesApartDistance;
        const dy = yRnd < 0 ? distToPrev * yRnd : distToNext * yRnd;
        node.position.x += dx * layer.randomizePosition;
        node.position.y += dy * layer.randomizePosition;
      }
    }
  }

  private removeCrossConnections(): void {
    for (let col = 0; col < this.config.gridWidth - 1; col++) {
      for (let f = 0; f < this.config.layers.length - 1; f++) {
        const node = this.getNode(col, f);
        if (!node || (node.incoming.length === 0 && node.outgoing.length === 0)) continue;
        const right = this.getNode(col + 1, f);
        if (!right || (right.incoming.length === 0 && right.outgoing.length === 0)) continue;
        const top = this.getNode(col, f + 1);
        if (!top || (top.incoming.length === 0 && top.outgoing.length === 0)) continue;
        const tr = this.getNode(col + 1, f + 1);
        if (!tr || (tr.incoming.length === 0 && tr.outgoing.length === 0)) continue;

        const ni = this.getNodeIndex(col, f)!;
        const ri = this.getNodeIndex(col + 1, f)!;
        const ti = this.getNodeIndex(col, f + 1)!;
        const tri = this.getNodeIndex(col + 1, f + 1)!;

        // Check for cross: node→tr && right→top
        if (!node.outgoing.includes(tri) || !right.outgoing.includes(ti)) continue;

        // Always add direct connections first (mirrors Unity)
        node.outgoing.push(ti);
        top.incoming.push(ni);
        right.outgoing.push(tri);
        tr.incoming.push(ri);

        // Randomly remove cross connections (mirrors Unity)
        const rnd = this.rng();
        if (rnd < 0.2) {
          this.removeEdge(ni, tri);
          this.removeEdge(ri, ti);
        } else if (rnd < 0.6) {
          this.removeEdge(ni, tri);
        } else {
          this.removeEdge(ri, ti);
        }
      }
    }
  }

  private removeEdge(fromIdx: number, toIdx: number): void {
    const f = this.nodes[fromIdx]!;
    const t = this.nodes[toIdx]!;
    f.outgoing = f.outgoing.filter(i => i !== toIdx);
    t.incoming = t.incoming.filter(i => i !== fromIdx);
  }

  visitNode(nodes: MapNode[], nodeId: string): void {
    const node = nodes.find(n => n.id === nodeId);
    if (!node || !node.available) return;
    node.visited = true;
    node.available = false;
    for (const outIdx of node.outgoing) {
      const conn = nodes[outIdx];
      if (conn && !conn.visited) conn.available = true;
    }
  }
}
