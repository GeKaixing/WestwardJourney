import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RelicSystem, RelicExecutionContext } from '../relics/RelicSystem';
import type { RelicConfig } from '@shared/types/RelicConfig';

describe('RelicSystem', () => {
  let relicSystem: RelicSystem;

  const mockBurningBlood: RelicConfig = {
    id: 'burning_blood',
    name: 'Burning Blood',
    description: 'Heal 6 HP at the end of combat.',
    rarity: 'starter' as any,
    unique: true,
    effects: [
      {
        effectType: 'heal',
        value: 6,
        condition: { event: 'battle_end' },
      },
    ],
  };

  const mockLantern: RelicConfig = {
    id: 'lantern',
    name: 'Lantern',
    description: 'Gain 1 Energy at the start of battle.',
    rarity: 'common' as any,
    unique: true,
    effects: [
      {
        effectType: 'energy',
        value: 1,
        condition: { event: 'battle_start' },
      }
    ]
  };

  beforeEach(() => {
    relicSystem = new RelicSystem();
    relicSystem.registerConfigs([mockBurningBlood, mockLantern]);
  });

  it('should add relic to player', () => {
    relicSystem.addRelic('player1', 'burning_blood', 1);
    expect(relicSystem.hasRelic('player1', 'burning_blood')).toBe(true);
    const relics = relicSystem.getRelics('player1');
    expect(relics).toHaveLength(1);
    expect(relics[0]!.configId).toBe('burning_blood');
    expect(relics[0]!.obtainedAtFloor).toBe(1);
  });

  it('should not add duplicate unique relics', () => {
    relicSystem.addRelic('player1', 'burning_blood', 1);
    relicSystem.addRelic('player1', 'burning_blood', 2);
    expect(relicSystem.getRelics('player1')).toHaveLength(1);
  });

  it('should replace relics correctly', () => {
    const mockBlackBlood: RelicConfig = {
      id: 'black_blood',
      name: 'Black Blood',
      description: 'Heals 12.',
      rarity: 'boss' as any,
      replaces: 'burning_blood',
      unique: true,
      effects: [],
    };
    relicSystem.registerConfig(mockBlackBlood);
    
    relicSystem.addRelic('player1', 'burning_blood', 1);
    relicSystem.addRelic('player1', 'black_blood', 2);
    
    expect(relicSystem.hasRelic('player1', 'burning_blood')).toBe(false);
    expect(relicSystem.hasRelic('player1', 'black_blood')).toBe(true);
  });

  it('should trigger relic effects correctly based on events', () => {
    relicSystem.addRelic('player1', 'burning_blood', 1);
    relicSystem.addRelic('player1', 'lantern', 1);
    
    const execContext: RelicExecutionContext = {
      playerId: 'player1',
      healPlayer: vi.fn(),
      gainGold: vi.fn(),
      drawCards: vi.fn(),
      gainEnergy: vi.fn(),
      addBlock: vi.fn(),
      dealDamage: vi.fn().mockReturnValue(0),
    };

    // Trigger turn_start -> should do nothing for these relics
    relicSystem.triggerEvent(
      'turn_start',
      { playerId: 'player1', event: 'turn_start' },
      execContext
    );
    expect(execContext.healPlayer).not.toHaveBeenCalled();
    expect(execContext.gainEnergy).not.toHaveBeenCalled();

    // Trigger battle_start -> should gain 1 energy
    relicSystem.triggerEvent(
      'battle_start',
      { playerId: 'player1', event: 'battle_start' },
      execContext
    );
    expect(execContext.gainEnergy).toHaveBeenCalledWith(1);
    expect(execContext.healPlayer).not.toHaveBeenCalled();

    // Trigger battle_end -> should heal 6
    relicSystem.triggerEvent(
      'battle_end',
      { playerId: 'player1', event: 'battle_end' },
      execContext
    );
    expect(execContext.healPlayer).toHaveBeenCalledWith(6);
  });

  it('should clear player relics', () => {
    relicSystem.addRelic('player1', 'burning_blood', 1);
    relicSystem.clearPlayer('player1');
    expect(relicSystem.hasRelic('player1', 'burning_blood')).toBe(false);
  });
});
