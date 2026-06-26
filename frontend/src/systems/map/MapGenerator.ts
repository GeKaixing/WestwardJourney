import { MapNodeType } from "@shared/enums/MapNodeType";

export interface MapNode {
  id: string;
  floor: number;
  col: number;
  type: MapNodeType;
  connections: number[];
  visited: boolean;
  available: boolean;
}

export interface GeneratedMap {
  nodes: MapNode[];
  floors: number;
}

const FLOORS_PER_ACT = 15;
const NODES_PER_FLOOR = 4;
const CENTER_COL = 1;

export class MapGenerator {
  generate(): GeneratedMap {
    const nodes: MapNode[] = [];
    const cols = NODES_PER_FLOOR;

    for (let floor = 0; floor < FLOORS_PER_ACT; floor++) {
      const floorNodes = this.generateFloor(floor, cols);
      nodes.push(...floorNodes);
    }

    this.generateConnections(nodes, cols);
    this.markAvailable(nodes);

    return { nodes, floors: FLOORS_PER_ACT };
  }

  private generateFloor(floor: number, cols: number): MapNode[] {
    const nodes: MapNode[] = [];
    const isLastFloor = floor === FLOORS_PER_ACT - 1;
    const isFirstFloor = floor === 0;

    for (let col = 0; col < cols; col++) {
      if (isFirstFloor && col !== CENTER_COL) continue;

      const type = this.pickNodeType(floor, isLastFloor, col);
      nodes.push({
        id: `${floor}_${col}`,
        floor,
        col,
        type,
        connections: [],
        visited: false,
        available: false,
      });
    }

    return nodes;
  }

  private pickNodeType(floor: number, isLastFloor: boolean, _col: number): MapNodeType {
    if (isLastFloor) return MapNodeType.Boss;

    const roll = Math.random();

    if (floor >= 12) {
      if (roll < 0.25) return MapNodeType.Elite;
      if (roll < 0.55) return MapNodeType.Monster;
      if (roll < 0.7) return MapNodeType.Rest;
      if (roll < 0.8) return MapNodeType.Shop;
      if (roll < 0.9) return MapNodeType.Event;
      return MapNodeType.Mystery;
    }

    if (floor >= 8) {
      if (roll < 0.15) return MapNodeType.Elite;
      if (roll < 0.5) return MapNodeType.Monster;
      if (roll < 0.65) return MapNodeType.Rest;
      if (roll < 0.75) return MapNodeType.Shop;
      if (roll < 0.85) return MapNodeType.Event;
      if (roll < 0.95) return MapNodeType.Treasure;
      return MapNodeType.Mystery;
    }

    if (roll < 0.45) return MapNodeType.Monster;
    if (roll < 0.6) return MapNodeType.Rest;
    if (roll < 0.7) return MapNodeType.Shop;
    if (roll < 0.8) return MapNodeType.Event;
    if (roll < 0.9) return MapNodeType.Treasure;
    return MapNodeType.Mystery;
  }

  private generateConnections(nodes: MapNode[], _cols: number): void {
    for (let floor = 0; floor < FLOORS_PER_ACT - 1; floor++) {
      const currentFloorNodes = nodes.filter((n) => n.floor === floor);
      const nextFloorNodes = nodes.filter((n) => n.floor === floor + 1);

      for (const node of currentFloorNodes) {
        const candidates = nextFloorNodes.filter(
          (n) => Math.abs(n.col - node.col) <= 1,
        );

        const shuffled = candidates.sort(() => Math.random() - 0.5);
        const connections = shuffled.slice(0, Math.min(2, shuffled.length));

        for (const conn of connections) {
          const connIndex = nodes.indexOf(conn);
          if (!node.connections.includes(connIndex)) {
            node.connections.push(connIndex);
          }
          const nodeIndex = nodes.indexOf(node);
          if (!conn.connections.includes(nodeIndex)) {
            conn.connections.push(nodeIndex);
          }
        }
      }
    }
  }

  private markAvailable(nodes: MapNode[]): void {
    const startNode = nodes.find((n) => n.floor === 0);
    if (startNode) {
      startNode.available = true;
    }
  }

  visitNode(nodes: MapNode[], nodeId: string): void {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || !node.available) return;

    node.visited = true;
    node.available = false;

    for (const connIndex of node.connections) {
      const conn = nodes[connIndex];
      if (conn && !conn.visited) {
        conn.available = true;
      }
    }
  }
}
