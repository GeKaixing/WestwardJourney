export interface EnemyIntent {
  actionId: string;
  weight: number;
  minTurn?: number;
  maxTurn?: number;
}

export interface EnemyAction {
  id: string;
  name: string;
  description: string;
  effects: Array<{
    effectType: string;
    value?: number;
    target?: string;
    buffType?: string;
    buffDuration?: number;
    buffAmount?: number;
  }>;
}

export interface EnemyConfig {
  id: string;
  name: string;
  description?: string;
  image?: string;
  spriteId?: string;
  health: number;
  healthPerAscension?: number;
  block?: number;
  actions: EnemyAction[];
  intentPattern: EnemyIntent[];
  buffs?: Array<{
    buffType: string;
    amount: number;
    duration: number;
  }>;
  isBoss?: boolean;
  isElite?: boolean;
  minionGroup?: string;
}
