import type { BuffType } from "../enums/index.js";

export enum BuffStackBehavior {
  Additive = "additive",
  MaxRefresh = "max_refresh",
  Replace = "replace",
  Intensity = "intensity",
}

export interface BuffConfig {
  type: BuffType;
  name: string;
  description: string;
  isDebuff: boolean;
  stackBehavior: BuffStackBehavior;
  maxStacks?: number;
  applyEffect?: {
    effectType: string;
    valuePerStack?: number;
  };
  onTurnEnd?: {
    effectType: string;
    valuePerStack?: number;
    removeOnTrigger?: boolean;
  };
}
