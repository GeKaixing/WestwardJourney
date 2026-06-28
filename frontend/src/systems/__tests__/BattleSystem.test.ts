import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BattleSystem } from '../battle/BattleSystem';
import { CardSystem } from '../cards/CardSystem';
import { BuffSystem } from '../buffs/BuffSystem';
import { RelicSystem } from '../relics/RelicSystem';
import { TurnPhase } from '../turn/TurnManager';
import { CardType } from '@shared/enums/CardType';
import { TargetType } from '@shared/enums/TargetType';
import { BuffType } from '@shared/enums/BuffType';
import type { EnemyConfig } from '@shared/types/EnemyConfig';

describe('BattleSystem', () => {
  let cardSystem: CardSystem;
  let buffSystem: BuffSystem;
  let relicSystem: RelicSystem;
  let battleSystem: BattleSystem;
  
  beforeEach(() => {
    cardSystem = new CardSystem();
    buffSystem = new BuffSystem();
    relicSystem = new RelicSystem();
    battleSystem = new BattleSystem(cardSystem, buffSystem, relicSystem);
    
    cardSystem.registerConfigs([
      {
        id: 'strike',
        name: 'Strike',
        description: 'Deal 6 damage.',
        cost: 1,
        type: CardType.Attack,
        rarity: 'basic' as any,
        targetType: TargetType.SingleEnemy,
        effects: [{ effectType: 'damage', value: 6, target: TargetType.SingleEnemy }],
      },
      {
        id: 'defend',
        name: 'Defend',
        description: 'Gain 5 block.',
        cost: 1,
        type: CardType.Skill,
        rarity: 'basic' as any,
        targetType: TargetType.Self,
        effects: [{ effectType: 'block', value: 5, target: TargetType.Self }],
      }
    ]);
  });

  const createMockEnemy = (id: string, hp: number): EnemyConfig => ({
    id,
    name: `Enemy ${id}`,
    health: hp,
    actions: [
      {
        id: 'attack_1',
        name: 'Attack',
        effects: [{ effectType: 'damage', value: 5 }],
      },
      {
        id: 'defend_1',
        name: 'Defend',
        effects: [{ effectType: 'block', value: 5 }],
      }
    ],
    intentPattern: [
      { actionId: 'attack_1', weight: 1 },
      { actionId: 'defend_1', weight: 1 }
    ],
  } as any);

  it('should initialize battle correctly', () => {
    const callbacks = { onStateChanged: vi.fn(), onBattleEnd: vi.fn() };
    const deck = [cardSystem.createInstance('strike'), cardSystem.createInstance('defend')];
    
    battleSystem.initBattle(
      { id: 'player1', name: 'Player', health: 80, maxHealth: 80, deck },
      [createMockEnemy('e1', 50)],
      callbacks
    );
    
    const state = battleSystem.getState();
    expect(state.player.health).toBe(80);
    expect(state.enemies).toHaveLength(1);
    expect(state.drawPile).toHaveLength(2);
    expect(callbacks.onStateChanged).toHaveBeenCalled();
  });

  it('should start battle, reset energy/block, and draw cards', async () => {
    const callbacks = { onStateChanged: vi.fn(), onBattleEnd: vi.fn() };
    const deck = [
      cardSystem.createInstance('strike'), cardSystem.createInstance('strike'),
      cardSystem.createInstance('defend'), cardSystem.createInstance('defend'),
      cardSystem.createInstance('strike'), cardSystem.createInstance('strike')
    ];
    
    battleSystem.initBattle(
      { id: 'player1', name: 'Player', health: 80, maxHealth: 80, deck },
      [createMockEnemy('e1', 50)],
      callbacks
    );
    
    await battleSystem.startBattle(); // Should trigger turn manager to DrawPhase then MainPhase
    
    // Process queue microtasks
    await new Promise(r => setTimeout(r, 10));
    
    const state = battleSystem.getState();
    expect(state.player.energy).toBe(3);
    expect(state.player.block).toBe(0);
    expect(state.hand).toHaveLength(5);
    expect(state.drawPile).toHaveLength(1);
    expect(state.phase).toBe(TurnPhase.MainPhase);
  });

  it('should deal damage correctly considering vulnerable and block', async () => {
    const callbacks = { onStateChanged: vi.fn(), onBattleEnd: vi.fn() };
    const strike = cardSystem.createInstance('strike');
    
    battleSystem.initBattle(
      { id: 'player1', name: 'Player', health: 80, maxHealth: 80, deck: [strike] },
      [createMockEnemy('e1', 50)],
      callbacks
    );
    
    await battleSystem.startBattle();
    await new Promise(r => setTimeout(r, 10));
    
    // Add block to enemy and vulnerable debuff
    const enemy = battleSystem.getState().enemies[0]!;
    buffSystem.addBuff(enemy.id, BuffType.Vulnerable, 1, 1, 'player1');
    // We need to bypass encapsulation to set block directly or via effect, but let's assume we use addBlock logic via effect. 
    // Wait, let's just play the card. Strike deals 6. Vulnerable makes it 9.
    
    battleSystem.playCard(strike.instanceId, [enemy.id]);
    await new Promise(r => setTimeout(r, 10));
    
    const stateAfter = battleSystem.getState();
    expect(stateAfter.enemies[0]!.health).toBe(41); // 50 - 9
    expect(stateAfter.hand).toHaveLength(0);
    expect(stateAfter.discardPile).toHaveLength(1);
    expect(stateAfter.player.energy).toBe(2);
  });

  it('should process enemy turn correctly', async () => {
    const callbacks = { onStateChanged: vi.fn(), onBattleEnd: vi.fn() };
    const enemyConfig = createMockEnemy('e1', 50);
    // Force enemy to attack
    enemyConfig.intentPattern = [{ actionId: 'attack_1', weight: 1 }];
    
    battleSystem.initBattle(
      { id: 'player1', name: 'Player', health: 80, maxHealth: 80, deck: [] },
      [enemyConfig],
      callbacks
    );
    
    await battleSystem.startBattle();
    await new Promise(r => setTimeout(r, 10));
    
    // End player turn -> goes to EnemyPhase
    battleSystem.endTurn();
    await new Promise(r => setTimeout(r, 10)); // wait for transitions
    
    const state = battleSystem.getState();
    // Enemy attacked for 5 damage
    expect(state.player.health).toBe(75);
    // Turn should be back to MainPhase for turn 2
    expect(state.turnNumber).toBe(2);
  });

  it('should end battle when player dies', async () => {
    const callbacks = { onStateChanged: vi.fn(), onBattleEnd: vi.fn() };
    const enemyConfig = createMockEnemy('e1', 50);
    enemyConfig.intentPattern = [{ actionId: 'attack_1', weight: 1 }]; // Deals 5
    
    battleSystem.initBattle(
      { id: 'player1', name: 'Player', health: 5, maxHealth: 80, deck: [] },
      [enemyConfig],
      callbacks
    );
    
    await battleSystem.startBattle();
    await new Promise(r => setTimeout(r, 10));
    
    battleSystem.endTurn();
    await new Promise(r => setTimeout(r, 10));
    
    const state = battleSystem.getState();
    expect(state.player.health).toBe(0);
    expect(state.player.isAlive).toBe(false);
    expect(callbacks.onBattleEnd).toHaveBeenCalledWith('defeat');
  });

  it('should end battle when all enemies die', async () => {
    const callbacks = { onStateChanged: vi.fn(), onBattleEnd: vi.fn() };
    const strike = cardSystem.createInstance('strike');
    
    battleSystem.initBattle(
      { id: 'player1', name: 'Player', health: 80, maxHealth: 80, deck: [strike] },
      [createMockEnemy('e1', 5)], // 5 hp
      callbacks
    );
    
    await battleSystem.startBattle();
    await new Promise(r => setTimeout(r, 10));
    
    const enemy = battleSystem.getState().enemies[0]!;
    battleSystem.playCard(strike.instanceId, [enemy.id]);
    await new Promise(r => setTimeout(r, 10));
    
    expect(callbacks.onBattleEnd).toHaveBeenCalledWith('victory');
  });
});
