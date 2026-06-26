import type { CardConfig, CardEffect } from "@shared/types/CardConfig";
import { TargetType } from "@shared/enums/TargetType";
import { CardType } from "@shared/enums/CardType";
import { BuffType } from "@shared/enums/BuffType";

export interface CardInstance {
  instanceId: string;
  configId: string;
  upgraded: boolean;
  cost: number;
  temporary?: boolean;
}

export interface PlayCardContext {
  playerId: string;
  targets: string[];
  energy: number;
  buffSystem: {
    getBuffStacks: (entityId: string, type: BuffType) => number;
    addBuff: (entityId: string, type: BuffType, stacks: number, duration: number, sourceId: string) => void;
  };
  dealDamage: (targetId: string, amount: number, sourceId: string) => number;
  addBlock: (targetId: string, amount: number) => void;
  drawCards: (count: number) => void;
  gainEnergy: (amount: number) => void;
  exhaustCard: (cardId: string) => void;
  healPlayer: (amount: number) => void;
}

export interface CardEffectResult {
  damage?: number;
  block?: number;
  buffsApplied?: number;
  cardsDrawn?: number;
  energyGained?: number;
}

function isMultiTarget(type: TargetType): boolean {
  return type === TargetType.AllEnemies || type === TargetType.AllAllies;
}

export class CardSystem {
  private configs: Map<string, CardConfig> = new Map();
  private instanceCounter = 0;

  registerConfig(config: CardConfig): void {
    this.configs.set(config.id, config);
  }

  registerConfigs(configs: CardConfig[]): void {
    for (const config of configs) {
      this.registerConfig(config);
    }
  }

  getConfig(id: string): CardConfig | undefined {
    return this.configs.get(id);
  }

  createInstance(configId: string, upgraded = false): CardInstance {
    const config = this.configs.get(configId);
    if (!config) throw new Error(`Card config not found: ${configId}`);

    return {
      instanceId: `card_${this.instanceCounter++}_${Date.now()}`,
      configId,
      upgraded,
      cost: Math.max(0, config.cost),
    };
  }

  canPlay(card: CardInstance, energy: number): boolean {
    if (card.cost > energy) return false;
    const config = this.configs.get(card.configId);
    if (!config) return false;
    if (config.type === CardType.Status || config.type === CardType.Curse) return false;
    return true;
  }

  async playCard(card: CardInstance, context: PlayCardContext): Promise<CardEffectResult> {
    const config = this.configs.get(card.configId);
    if (!config) throw new Error(`Card config not found: ${card.configId}`);

    const result: CardEffectResult = {};
    const effects = card.upgraded && config.secondaryEffects ? config.secondaryEffects : config.effects;

    for (const effect of effects) {
      this.resolveEffect(effect, context, result);
    }

    if (config.exhaust) {
      context.exhaustCard(card.instanceId);
    }

    return result;
  }

  private resolveEffect(effect: CardEffect, context: PlayCardContext, result: CardEffectResult): void {
    const value = effect.value ?? 0;
    const target = effect.target ?? TargetType.SingleEnemy;
    const targets = isMultiTarget(target) ? context.targets : [context.targets[0]].filter((t): t is string => t != null);

    switch (effect.effectType) {
      case "damage": {
        let damage = value;
        const strength = context.buffSystem.getBuffStacks(context.playerId, BuffType.Strength);
        damage += strength;
        const weakStacks = context.buffSystem.getBuffStacks(context.playerId, BuffType.Weak);
        if (weakStacks > 0) {
          damage = Math.floor(damage * 0.75);
        }
        for (const targetId of targets) {
          context.dealDamage(targetId, damage, context.playerId);
        }
        result.damage = (result.damage ?? 0) + damage * targets.length;
        break;
      }

      case "block": {
        let block = value;
        const dexterity = context.buffSystem.getBuffStacks(context.playerId, BuffType.Dexterity);
        block += dexterity;
        context.addBlock(context.playerId, block);
        result.block = (result.block ?? 0) + block;
        break;
      }

      case "buff": {
        if (effect.buffType) {
          const stacks = effect.buffAmount ?? value;
          const duration = effect.buffDuration ?? 99;
          context.buffSystem.addBuff(
            context.playerId,
            effect.buffType as BuffType,
            stacks,
            duration,
            context.playerId,
          );
          result.buffsApplied = (result.buffsApplied ?? 0) + stacks;
        }
        break;
      }

      case "debuff": {
        if (effect.buffType) {
          const stacks = effect.buffAmount ?? value;
          const duration = effect.buffDuration ?? 1;
          for (const targetId of targets) {
            context.buffSystem.addBuff(
              targetId,
              effect.buffType as BuffType,
              stacks,
              duration,
              context.playerId,
            );
          }
          result.buffsApplied = (result.buffsApplied ?? 0) + stacks * targets.length;
        }
        break;
      }

      case "draw_card": {
        context.drawCards(value);
        result.cardsDrawn = (result.cardsDrawn ?? 0) + value;
        break;
      }

      case "energy": {
        context.gainEnergy(value);
        result.energyGained = (result.energyGained ?? 0) + value;
        break;
      }

      case "heal": {
        context.healPlayer(value);
        break;
      }

      case "aoe_damage": {
        let damage = value;
        const strength = context.buffSystem.getBuffStacks(context.playerId, BuffType.Strength);
        damage += strength;
        for (const targetId of context.targets) {
          context.dealDamage(targetId, damage, context.playerId);
        }
        result.damage = (result.damage ?? 0) + damage * context.targets.length;
        break;
      }
    }
  }
}
