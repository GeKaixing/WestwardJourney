export enum ActionPriority {
  System,
  Buff,
  Card,
  Enemy,
  EndOfTurn,
}

export interface GameAction {
  id: string;
  priority: ActionPriority;
  execute: () => void | Promise<void>;
  sourceId: string;
  label: string;
  cancelled?: boolean;
}

export class ActionQueue {
  private queue: GameAction[] = [];
  private executing = false;
  private actionIdCounter = 0;

  enqueue(action: Omit<GameAction, "id">): string {
    const id = `action_${this.actionIdCounter++}_${Date.now()}`;
    const entry: GameAction = { ...action, id };
    this.queue.push(entry);
    this.queue.sort((a, b) => a.priority - b.priority);
    return id;
  }

  enqueueFront(action: Omit<GameAction, "id">): string {
    const id = `action_urgent_${this.actionIdCounter++}_${Date.now()}`;
    this.queue.unshift({ ...action, id });
    return id;
  }

  cancel(actionId: string): void {
    const action = this.queue.find((a) => a.id === actionId);
    if (action) {
      action.cancelled = true;
    }
  }

  cancelAll(sourceId?: string): void {
    for (const action of this.queue) {
      if (!sourceId || action.sourceId === sourceId) {
        action.cancelled = true;
      }
    }
  }

  async processAll(): Promise<void> {
    if (this.executing) return;
    this.executing = true;

    while (this.queue.length > 0) {
      const action = this.queue.shift();
      if (!action || action.cancelled) continue;
      await action.execute();
    }

    this.executing = false;
  }

  get pendingCount(): number {
    return this.queue.filter((a) => !a.cancelled).length;
  }

  clear(): void {
    this.queue = [];
    this.executing = false;
  }
}
