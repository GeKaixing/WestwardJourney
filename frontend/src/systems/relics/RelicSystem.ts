import type { RelicConfig, RelicEffect } from "@shared/types/RelicConfig";

export interface RelicInstance {
  configId: string;
  obtainedAtFloor: number;
}

export type GameEvent =
  | "battle_start"
  | "turn_start"
  | "card_played"
  | "enemy_defeated"
  | "damage_taken"
  | "damage_dealt"
  | "block_gained"
  | "heal_received"
  | "gold_gained"
  | "turn_end"
  | "battle_end";

export interface RelicTriggerContext {
  playerId: string;
  event: GameEvent;
  value?: number;
  targetId?: string;
  cardId?: string;
}

export interface RelicExecutionContext {
  playerId: string;
  healPlayer: (amount: number) => void;
  gainGold: (amount: number) => void;
  drawCards: (count: number) => void;
  gainEnergy: (amount: number) => void;
  addBlock: (amount: number) => void;
  dealDamage: (targetId: string, amount: number) => number | undefined;
}

export class RelicSystem {
  private configs: Map<string, RelicConfig> = new Map();
  private relics: Map<string, RelicInstance[]> = new Map();

  registerConfig(config: RelicConfig): void {
    this.configs.set(config.id, config);
  }

  registerConfigs(configs: RelicConfig[]): void {
    for (const config of configs) {
      this.registerConfig(config);
    }
  }

  getConfig(id: string): RelicConfig | undefined {
    return this.configs.get(id);
  }

  addRelic(playerId: string, configId: string, floor: number): void {
    const config = this.configs.get(configId);
    if (!config) return;

    let playerRelics = this.relics.get(playerId) ?? [];
    if (config.unique && playerRelics.some((r) => r.configId === configId)) return;

    if (config.replaces) {
      const replaced = playerRelics.find((r) => r.configId === config.replaces);
      if (replaced) {
        this.removeRelic(playerId, config.replaces);
        playerRelics = this.relics.get(playerId) ?? [];
      }
    }

    playerRelics.push({ configId, obtainedAtFloor: floor });
    this.relics.set(playerId, playerRelics);
  }

  removeRelic(playerId: string, configId: string): void {
    const playerRelics = this.relics.get(playerId);
    if (!playerRelics) return;
    this.relics.set(
      playerId,
      playerRelics.filter((r) => r.configId !== configId),
    );
  }

  getRelics(playerId: string): RelicInstance[] {
    return this.relics.get(playerId) ?? [];
  }

  hasRelic(playerId: string, configId: string): boolean {
    return this.relics.get(playerId)?.some((r) => r.configId === configId) ?? false;
  }

  triggerEvent(_event: GameEvent, context: RelicTriggerContext, execContext: RelicExecutionContext): void {
    const playerRelics = this.relics.get(context.playerId) ?? [];

    for (const relic of playerRelics) {
      const config = this.configs.get(relic.configId);
      if (!config) continue;

      for (const effect of config.effects) {
        if (this.matchesCondition(effect, context)) {
          this.executeEffect(effect, execContext);
        }
      }
    }
  }

  private matchesCondition(effect: RelicEffect, context: RelicTriggerContext): boolean {
    if (!effect.condition) return true;
    return effect.condition.event === context.event;
  }

  private executeEffect(effect: RelicEffect, context: RelicExecutionContext): void {
    const value = effect.value ?? 0;

    switch (effect.effectType) {
      case "heal":
        context.healPlayer(value);
        break;
      case "gold":
        context.gainGold(value);
        break;
      case "draw_card":
        context.drawCards(value);
        break;
      case "energy":
        context.gainEnergy(value);
        break;
      case "block":
        context.addBlock(value);
        break;
      case "damage": {
        if (effect.target && context.dealDamage) {
          context.dealDamage(effect.target, value);
        }
        break;
      }
    }
  }

  clearPlayer(playerId: string): void {
    this.relics.delete(playerId);
  }

  clearAll(): void {
    this.relics.clear();
  }
}
