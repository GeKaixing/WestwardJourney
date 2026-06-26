import { BuffType } from "@shared/enums/BuffType";
import { CardSystem, type PlayCardContext } from "../cards/CardSystem";
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
}

export interface BattleState {
  player: CombatantState;
  enemies: EnemyState[];
  hand: string[];
  drawPile: string[];
  discardPile: string[];
  exhaustPile: string[];
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
  private hand: string[] = [];
  private drawPile: string[] = [];
  private discardPile: string[] = [];
  private exhaustPile: string[] = [];

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
      onTurnStart: (turnNumber) => {
        this.player.energy = 3;
        if (turnNumber > 1) {
          this.relicSystem.triggerEvent(
            "turn_start",
            { playerId: this.player.id, event: "turn_start" },
            this.createRelicContext(),
          );
        }
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
    playerConfig: { id: string; name: string; maxHealth: number; deck: string[] },
    enemyConfigs: Array<{ id: string; name: string; health: number }>,
    callbacks: BattleCallbacks,
  ): void {
    this.callbacks = callbacks;
    this.player = {
      id: playerConfig.id,
      name: playerConfig.name,
      health: playerConfig.maxHealth,
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
      block: 0,
      energy: 0,
      isPlayer: false,
      isAlive: true,
    }));

    this.drawPile = [...playerConfig.deck];
    this.shuffleArray(this.drawPile);
    this.hand = [];
    this.discardPile = [];
    this.exhaustPile = [];

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

    const handIndex = this.hand.indexOf(cardInstanceId);
    if (handIndex === -1) return;

    const cardInstance = this.cardSystem.createInstance("placeholder");
    if (!this.cardSystem.canPlay(cardInstance, this.player.energy)) return;

    this.actionQueue.enqueue({
      priority: ActionPriority.Card,
      execute: async () => {
        this.hand.splice(handIndex, 1);
        this.discardPile.push(cardInstanceId);
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
    const handIndex = this.hand.indexOf(cardId);
    if (handIndex !== -1) {
      this.hand.splice(handIndex, 1);
      this.exhaustPile.push(cardId);
      return;
    }
    const drawIndex = this.drawPile.indexOf(cardId);
    if (drawIndex !== -1) {
      this.drawPile.splice(drawIndex, 1);
      this.exhaustPile.push(cardId);
      return;
    }
    const discardIndex = this.discardPile.indexOf(cardId);
    if (discardIndex !== -1) {
      this.discardPile.splice(discardIndex, 1);
      this.exhaustPile.push(cardId);
    }
  }

  private executeEnemyIntents(): void {
    for (const enemy of this.enemies) {
      if (!enemy.isAlive) continue;
      const damage = Math.floor(Math.random() * 10) + 5;
      const blocked = Math.min(this.player.block, damage);
      this.player.block -= blocked;
      this.player.health -= damage - blocked;

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
        { playerId: this.player.id, event: "damage_taken", value: damage, targetId: enemy.id },
        this.createRelicContext(),
      );

      if (this.player.health <= 0) {
        this.player.health = 0;
        this.player.isAlive = false;
        this.checkBattleEnd();
        return;
      }
    }
    this.emitState();
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
