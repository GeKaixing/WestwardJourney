import { ActionQueue, ActionPriority } from "../actions/ActionQueue";

export enum TurnPhase {
  StartOfTurn,
  DrawPhase,
  MainPhase,
  EndOfTurn,
  EnemyTurn,
  Cleanup,
}

export interface TurnEvents {
  onTurnStart?: (turnNumber: number) => void;
  onDrawPhase?: () => void;
  onMainPhase?: () => void;
  onEndOfTurn?: () => void;
  onEnemyTurn?: () => void;
  onCleanup?: () => void;
  onBattleEnd?: (result: "victory" | "defeat") => void;
}

export class TurnManager {
  private actionQueue: ActionQueue;
  private turnNumber = 0;
  private phase: TurnPhase = TurnPhase.StartOfTurn;
  private events: TurnEvents;
  private isRunning = false;

  constructor(actionQueue: ActionQueue, events: TurnEvents = {}) {
    this.actionQueue = actionQueue;
    this.events = events;
  }

  get currentTurn(): number {
    return this.turnNumber;
  }

  get currentPhase(): TurnPhase {
    return this.phase;
  }

  async startBattle(): Promise<void> {
    this.turnNumber = 0;
    this.isRunning = true;
    await this.startPlayerTurn();
  }

  async startPlayerTurn(): Promise<void> {
    if (!this.isRunning) return;
    this.turnNumber++;

    this.phase = TurnPhase.StartOfTurn;
    this.actionQueue.enqueue({
      priority: ActionPriority.System,
      execute: async () => {
        this.events.onTurnStart?.(this.turnNumber);
      },
      sourceId: "system",
      label: `Turn ${this.turnNumber} Start`,
    });

    this.phase = TurnPhase.DrawPhase;
    this.actionQueue.enqueue({
      priority: ActionPriority.System,
      execute: async () => {
        this.events.onDrawPhase?.();
      },
      sourceId: "system",
      label: "Draw Phase",
    });

    this.phase = TurnPhase.MainPhase;
    this.actionQueue.enqueue({
      priority: ActionPriority.System,
      execute: async () => {
        this.events.onMainPhase?.();
      },
      sourceId: "system",
      label: "Main Phase",
    });

    await this.actionQueue.processAll();
  }

  async endPlayerTurn(): Promise<void> {
    this.phase = TurnPhase.EndOfTurn;
    this.actionQueue.enqueue({
      priority: ActionPriority.System,
      execute: async () => {
        this.events.onEndOfTurn?.();
      },
      sourceId: "system",
      label: "End of Turn",
    });

    this.phase = TurnPhase.EnemyTurn;
    this.actionQueue.enqueue({
      priority: ActionPriority.System,
      execute: async () => {
        this.events.onEnemyTurn?.();
      },
      sourceId: "system",
      label: "Enemy Turn",
    });

    this.phase = TurnPhase.Cleanup;
    this.actionQueue.enqueue({
      priority: ActionPriority.System,
      execute: async () => {
        this.events.onCleanup?.();
      },
      sourceId: "system",
      label: "Cleanup",
    });

    this.actionQueue.enqueue({
      priority: ActionPriority.System,
      execute: async () => {
        await this.startPlayerTurn();
      },
      sourceId: "system",
      label: `Turn ${this.turnNumber + 1} Start`,
    });

    await this.actionQueue.processAll();
  }

  endBattle(result: "victory" | "defeat"): void {
    this.isRunning = false;
    this.events.onBattleEnd?.(result);
  }

  reset(): void {
    this.actionQueue.clear();
    this.turnNumber = 0;
    this.phase = TurnPhase.StartOfTurn;
    this.isRunning = false;
  }
}
