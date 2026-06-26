import { BuffType } from "@shared/enums/BuffType";
import { BuffStackBehavior } from "@shared/types/BuffConfig";
import type { BuffConfig } from "@shared/types/BuffConfig";
import { BUFF_CONFIGS } from "./BuffConfigs";

export interface BuffInstance {
  type: BuffType;
  stacks: number;
  duration: number;
  sourceId: string;
}

export class BuffSystem {
  private buffs: Map<string, BuffInstance[]>;
  private configs: Record<BuffType, BuffConfig>;

  constructor() {
    this.buffs = new Map();
    this.configs = BUFF_CONFIGS;
  }

  addBuff(entityId: string, type: BuffType, stacks: number, duration: number, sourceId: string): void {
    const config = this.configs[type];
    if (!config) return;

    const entityBuffs = this.buffs.get(entityId) ?? [];
    const existing = entityBuffs.find((b) => b.type === type);

    if (existing) {
      switch (config.stackBehavior) {
        case BuffStackBehavior.Additive:
          existing.stacks = Math.min(
            existing.stacks + stacks,
            config.maxStacks ?? Infinity,
          );
          existing.duration = Math.max(existing.duration, duration);
          break;
        case BuffStackBehavior.MaxRefresh:
          existing.stacks = Math.max(existing.stacks, stacks);
          existing.duration = Math.max(existing.duration, duration);
          break;
        case BuffStackBehavior.Replace:
          existing.stacks = stacks;
          existing.duration = duration;
          break;
        case BuffStackBehavior.Intensity:
          existing.stacks = Math.min(
            existing.stacks + stacks,
            config.maxStacks ?? Infinity,
          );
          existing.duration = Math.max(existing.duration, duration);
          break;
      }
    } else {
      entityBuffs.push({
        type,
        stacks: Math.min(stacks, config.maxStacks ?? Infinity),
        duration,
        sourceId,
      });
    }

    this.buffs.set(entityId, entityBuffs);
  }

  removeBuff(entityId: string, type: BuffType): void {
    const entityBuffs = this.buffs.get(entityId);
    if (!entityBuffs) return;
    this.buffs.set(
      entityId,
      entityBuffs.filter((b) => b.type !== type),
    );
  }

  getBuffs(entityId: string): BuffInstance[] {
    return this.buffs.get(entityId) ?? [];
  }

  getBuffStacks(entityId: string, type: BuffType): number {
    return this.buffs.get(entityId)?.find((b) => b.type === type)?.stacks ?? 0;
  }

  hasBuff(entityId: string, type: BuffType): boolean {
    return this.getBuffStacks(entityId, type) > 0;
  }

  processTurnEnd(entityId: string): void {
    const entityBuffs = this.buffs.get(entityId);
    if (!entityBuffs) return;

    const remaining: BuffInstance[] = [];

    for (const buff of entityBuffs) {
      const config = this.configs[buff.type];
      if (!config) continue;

      buff.duration -= 1;

      if (buff.duration <= 0) continue;

      remaining.push(buff);
    }

    if (remaining.length > 0) {
      this.buffs.set(entityId, remaining);
    } else {
      this.buffs.delete(entityId);
    }
  }

  clearEntity(entityId: string): void {
    this.buffs.delete(entityId);
  }

  clearAll(): void {
    this.buffs.clear();
  }
}
