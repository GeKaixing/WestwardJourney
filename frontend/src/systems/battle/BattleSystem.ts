import { BuffType } from "@shared/enums/BuffType";
import type { EnemyAction, EnemyConfig } from "@shared/types/EnemyConfig";
import { CardSystem, type CardInstance, type PlayCardContext } from "../cards/CardSystem";
import { BuffSystem } from "../buffs/BuffSystem";
import { ActionQueue, ActionPriority } from "../actions/ActionQueue";
import { TurnManager, TurnPhase, type TurnEvents } from "../turn/TurnManager";
import { RelicSystem } from "../relics/RelicSystem";

export interface CombatantState {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  block: number;
  energy: number;
  isPlayer: boolean;
  isAlive: boolean;
}

export interface EnemyState extends CombatantState {
  intent?: string;
  intentValue?: number;
  intentType?: "attack" | "block" | "buff" | "debuff" | "unknown";
  actionId?: string;
  actions?: EnemyAction[];
  intentPattern?: EnemyConfig["intentPattern"];
}

export interface BattleState {
  player: CombatantState;
  enemies: EnemyState[];
  hand: CardInstance[];
  drawPile: CardInstance[];
  discardPile: CardInstance[];
  exhaustPile: CardInstance[];
  phase: TurnPhase;
  turnNumber: number;
}

export interface BattleCallbacks {
  onStateChanged: (state: BattleState) => void;
  onBattleEnd: (result: "victory" | "defeat") => void;
}

export class BattleSystem {
  private cardSystem: CardSystem;
  private buffSystem: BuffSystem;
  private actionQueue: ActionQueue;
  private turnManager: TurnManager;
  private relicSystem: RelicSystem;

  private player!: CombatantState;
  private enemies: EnemyState[] = [];
  private hand: CardInstance[] = [];
  private drawPile: CardInstance[] = [];
  private discardPile: CardInstance[] = [];
  private exhaustPile: CardInstance[] = [];

  private callbacks?: BattleCallbacks;

  constructor(
    cardSystem: CardSystem,
    buffSystem: BuffSystem,
    relicSystem: RelicSystem,
  ) {
    this.cardSystem = cardSystem;
    this.buffSystem = buffSystem;
    this.relicSystem = relicSystem;
    this.actionQueue = new ActionQueue();
    this.turnManager = new TurnManager(this.actionQueue, this.createTurnEvents());
  }

  private createTurnEvents(): TurnEvents {
    return {
      onTurnStart: (_turnNumber) => {
        this.player.energy = 3;
        this.player.block = 0;
        for (const enemy of this.enemies) {
          enemy.block = 0;
        }
        this.relicSystem.triggerEvent(
          "turn_start",
          { playerId: this.player.id, event: "turn_start" },
          this.createRelicContext(),
        );
        this.emitState();
      },

      onDrawPhase: () => {
        this.drawCards(5);
        this.emitState();
      },

      onMainPhase: () => {
        this.emitState();
      },

      onEndOfTurn: () => {
        for (const enemy of this.enemies) {
          this.buffSystem.processTurnEnd(enemy.id);
        }
        this.buffSystem.processTurnEnd(this.player.id);
        this.discardHand();
        this.emitState();
      },

      onEnemyTurn: () => {
        this.executeEnemyIntents();
        this.emitState();
      },

      onCleanup: () => {
        this.emitState();
      },
    };
  }

  private createRelicContext() {
    return {
      playerId: this.player.id,
      healPlayer: (amount: number) => {
        this.player.health = Math.min(this.player.maxHealth, this.player.health + amount);
      },
      gainGold: (_amount: number) => {},
      drawCards: (count: number) => this.drawCards(count),
      gainEnergy: (amount: number) => {
        this.player.energy += amount;
      },
      addBlock: (amount: number) => {
        this.player.block += amount;
      },
      dealDamage: (_targetId: string, _amount: number) => 0,
    };
  }

  initBattle(
    playerConfig: { id: string; name: string; health: number; maxHealth: number; deck: CardInstance[] },
    enemyConfigs: EnemyConfig[],
    callbacks: BattleCallbacks,
  ): void {
    this.callbacks = callbacks;
    this.player = {
      id: playerConfig.id,
      name: playerConfig.name,
      health: playerConfig.health,
      maxHealth: playerConfig.maxHealth,
      block: 0,
      energy: 3,
      isPlayer: true,
      isAlive: true,
    };

    this.enemies = enemyConfigs.map((ec) => ({
      id: ec.id,
      name: ec.name,
      health: ec.health,
      maxHealth: ec.health,
      block: ec.block ?? 0,
      energy: 0,
      isPlayer: false,
      isAlive: true,
      actions: ec.actions,
      intentPattern: ec.intentPattern,
    }));

    this.drawPile = [...playerConfig.deck];
    this.shuffleArray(this.drawPile);
    this.hand = [];
    this.discardPile = [];
    this.exhaustPile = [];
    this.rollEnemyIntents();

    this.relicSystem.triggerEvent(
      "battle_start",
      { playerId: this.player.id, event: "battle_start" },
      this.createRelicContext(),
    );

    this.emitState();
  }

  async startBattle(): Promise<void> {
    await this.turnManager.startBattle();
  }

  playCard(cardInstanceId: string, targetIds: string[]): void {
    if (this.turnManager.currentPhase !== TurnPhase.MainPhase) return;

    const handIndex = this.hand.findIndex((card) => card.instanceId === cardInstanceId);
    if (handIndex === -1) return;

    const cardInstance = this.hand[handIndex]!;
    if (!this.cardSystem.canPlay(cardInstance, this.player.energy)) return;

    this.actionQueue.enqueue({
      priority: ActionPriority.Card,
      execute: async () => {
        this.hand.splice(handIndex, 1);
        this.discardPile.push(cardInstance);
        this.player.energy -= cardInstance.cost;

        await this.cardSystem.playCard(cardInstance, this.createPlayContext(targetIds));
        this.relicSystem.triggerEvent(
          "card_played",
          { playerId: this.player.id, event: "card_played", cardId: cardInstanceId },
          this.createRelicContext(),
        );
        this.emitState();
      },
      sourceId: this.player.id,
      label: `Play card ${cardInstanceId}`,
    });
    void this.actionQueue.processAll();
  }

  endTurn(): void {
    this.turnManager.endPlayerTurn();
  }

  private createPlayContext(targetIds: string[]): PlayCardContext {
    return {
      playerId: this.player.id,
      targets: targetIds,
      energy: this.player.energy,
      buffSystem: {
        getBuffStacks: (entityId, type) => this.buffSystem.getBuffStacks(entityId, type),
        addBuff: (entityId, type, stacks, duration, sourceId) =>
          this.buffSystem.addBuff(entityId, type, stacks, duration, sourceId),
      },
      dealDamage: (targetId, amount, sourceId) => this.dealDamage(targetId, amount, sourceId),
      addBlock: (targetId, amount) => this.addBlock(targetId, amount),
      drawCards: (count) => this.drawCards(count),
      gainEnergy: (amount) => { this.player.energy += amount; },
      exhaustCard: (cardId) => this.exhaustCard(cardId),
      healPlayer: (amount) => {
        this.player.health = Math.min(this.player.maxHealth, this.player.health + amount);
      },
    };
  }

  private dealDamage(targetId: string, amount: number, _sourceId: string): number {
    const enemy = this.enemies.find((e) => e.id === targetId);
    if (!enemy || !enemy.isAlive) return 0;

    let finalDamage = amount;
    if (this.buffSystem.hasBuff(targetId, BuffType.Vulnerable)) {
      finalDamage = Math.floor(finalDamage * 1.5);
    }

    const blockAbsorbed = Math.min(enemy.block, finalDamage);
    enemy.block -= blockAbsorbed;
    finalDamage -= blockAbsorbed;
    enemy.health -= finalDamage;

    if (enemy.health <= 0) {
      enemy.health = 0;
      enemy.isAlive = false;
      this.checkBattleEnd();
    }

    this.relicSystem.triggerEvent(
      "damage_dealt",
      { playerId: this.player.id, event: "damage_dealt", value: amount, targetId },
      this.createRelicContext(),
    );

    this.emitState();
    return finalDamage;
  }

  private addBlock(targetId: string, amount: number): void {
    const target = targetId === this.player.id
      ? this.player
      : this.enemies.find((e) => e.id === targetId);
    if (!target) return;
    target.block += amount;
    this.emitState();
  }

  private drawCards(count: number): void {
    for (let i = 0; i < count; i++) {
      if (this.drawPile.length === 0) {
        this.shuffleDiscardIntoDraw();
        if (this.drawPile.length === 0) break;
      }
      const card = this.drawPile.pop();
      if (card) this.hand.push(card);
    }
    this.emitState();
  }

  private shuffleDiscardIntoDraw(): void {
    this.drawPile = [...this.discardPile];
    this.discardPile = [];
    this.shuffleArray(this.drawPile);
  }

  private discardHand(): void {
    this.discardPile.push(...this.hand);
    this.hand = [];
  }

  private exhaustCard(cardId: string): void {
    const handIndex = this.hand.findIndex((card) => card.instanceId === cardId);
    if (handIndex !== -1) {
      const [card] = this.hand.splice(handIndex, 1);
      if (card) this.exhaustPile.push(card);
      return;
    }
    const drawIndex = this.drawPile.findIndex((card) => card.instanceId === cardId);
    if (drawIndex !== -1) {
      const [card] = this.drawPile.splice(drawIndex, 1);
      if (card) this.exhaustPile.push(card);
      return;
    }
    const discardIndex = this.discardPile.findIndex((card) => card.instanceId === cardId);
    if (discardIndex !== -1) {
      const [card] = this.discardPile.splice(discardIndex, 1);
      if (card) this.exhaustPile.push(card);
    }
  }

  private executeEnemyIntents(): void {
    for (const enemy of this.enemies) {
      if (!enemy.isAlive) continue;
      const action = enemy.actions?.find((entry) => entry.id === enemy.actionId);
      if (!action) continue;

      for (const effect of action.effects) {
        switch (effect.effectType) {
          case "damage":
            this.dealDamageToPlayer(enemy, effect.value ?? 0);
            break;
          case "block":
            enemy.block += effect.value ?? 0;
            break;
          case "buff":
            if (effect.buffType) {
              this.buffSystem.addBuff(
                enemy.id,
                effect.buffType as BuffType,
                effect.buffAmount ?? effect.value ?? 1,
                effect.buffDuration ?? 99,
                enemy.id,
              );
            }
            break;
          case "debuff":
            if (effect.buffType) {
              this.buffSystem.addBuff(
                this.player.id,
                effect.buffType as BuffType,
                effect.buffAmount ?? effect.value ?? 1,
                effect.buffDuration ?? 1,
                enemy.id,
              );
            }
            break;
        }
      }

      if (this.player.health <= 0) {
        this.player.health = 0;
        this.player.isAlive = false;
        this.checkBattleEnd();
        return;
      }
    }
    this.rollEnemyIntents();
    this.emitState();
  }

  private dealDamageToPlayer(enemy: EnemyState, amount: number): void {
    let finalDamage = amount;
    if (this.buffSystem.hasBuff(enemy.id, BuffType.Strength)) {
      finalDamage += this.buffSystem.getBuffStacks(enemy.id, BuffType.Strength);
    }
    if (this.buffSystem.hasBuff(enemy.id, BuffType.Weak)) {
      finalDamage = Math.floor(finalDamage * 0.75);
    }

    const blocked = Math.min(this.player.block, finalDamage);
    this.player.block -= blocked;
    this.player.health -= finalDamage - blocked;

    if (this.buffSystem.hasBuff(this.player.id, BuffType.Thorns)) {
      const thornDamage = this.buffSystem.getBuffStacks(this.player.id, BuffType.Thorns);
      enemy.health -= thornDamage;
      if (enemy.health <= 0) {
        enemy.health = 0;
        enemy.isAlive = false;
      }
    }

    this.relicSystem.triggerEvent(
      "damage_taken",
      { playerId: this.player.id, event: "damage_taken", value: finalDamage, targetId: enemy.id },
      this.createRelicContext(),
    );
  }

  private rollEnemyIntents(): void {
    for (const enemy of this.enemies) {
      if (!enemy.isAlive || !enemy.actions?.length || !enemy.intentPattern?.length) continue;
      const available = enemy.intentPattern.filter((intent) => {
        const turn = this.turnManager.currentTurn;
        return (intent.minTurn == null || turn >= intent.minTurn) && (intent.maxTurn == null || turn <= intent.maxTurn);
      });
      const pool = available.length > 0 ? available : enemy.intentPattern;
      const totalWeight = pool.reduce((sum, intent) => sum + intent.weight, 0);
      let roll = Math.random() * totalWeight;
      const picked = pool.find((intent) => {
        roll -= intent.weight;
        return roll <= 0;
      }) ?? pool[0];
      const action = enemy.actions.find((entry) => entry.id === picked?.actionId) ?? enemy.actions[0];
      if (!action) continue;
      enemy.actionId = action.id;
      enemy.intent = action.name;
      enemy.intentValue = this.getIntentValue(action);
      enemy.intentType = this.getIntentType(action);
    }
  }

  private getIntentValue(action: EnemyAction): number | undefined {
    const primary = action.effects.find((effect) => effect.effectType === "damage" || effect.effectType === "block");
    return primary?.value;
  }

  private getIntentType(action: EnemyAction): EnemyState["intentType"] {
    const effectTypes = action.effects.map((effect) => effect.effectType);
    if (effectTypes.includes("damage")) return "attack";
    if (effectTypes.includes("block")) return "block";
    if (effectTypes.includes("buff")) return "buff";
    if (effectTypes.includes("debuff")) return "debuff";
    return "unknown";
  }

  private checkBattleEnd(): void {
    const allDead = this.enemies.every((e) => !e.isAlive);
    if (allDead) {
      this.relicSystem.triggerEvent(
        "battle_end",
        { playerId: this.player.id, event: "battle_end" },
        this.createRelicContext(),
      );
      this.turnManager.endBattle("victory");
      this.callbacks?.onBattleEnd("victory");
    } else if (!this.player.isAlive) {
      this.turnManager.endBattle("defeat");
      this.callbacks?.onBattleEnd("defeat");
    }
  }

  getState(): BattleState {
    return {
      player: { ...this.player },
      enemies: this.enemies.map((e) => ({ ...e })),
      hand: [...this.hand],
      drawPile: [...this.drawPile],
      discardPile: [...this.discardPile],
      exhaustPile: [...this.exhaustPile],
      phase: this.turnManager.currentPhase,
      turnNumber: this.turnManager.currentTurn,
    };
  }

  private emitState(): void {
    this.callbacks?.onStateChanged(this.getState());
  }

  private shuffleArray(arr: unknown[]): void {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
  }

  reset(): void {
    this.turnManager.reset();
    this.actionQueue.clear();
    this.buffSystem.clearAll();
    this.hand = [];
    this.drawPile = [];
    this.discardPile = [];
    this.exhaustPile = [];
    this.enemies = [];
  }
}
