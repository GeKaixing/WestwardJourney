import type { MapNodeType } from "../enums/index.js";

export interface MapNodeConfig {
  type: MapNodeType;
  connections: number[];
  encounterPool?: string[];
}

export interface MapFloorConfig {
  floor: number;
  nodes: MapNodeConfig[];
}

export interface MapConfig {
  act: number;
  floors: MapFloorConfig[];
  bossPool: string[];
  elitePool: string[];
  monsterPool: string[];
}
