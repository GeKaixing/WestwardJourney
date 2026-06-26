import { describe, it, expect, beforeEach } from 'vitest';
import { BuffSystem } from '../buffs/BuffSystem';
import { BuffType } from '@shared/enums/BuffType';

describe('BuffSystem', () => {
  let buffSystem: BuffSystem;

  beforeEach(() => {
    buffSystem = new BuffSystem();
  });

  it('should add a buff to an entity', () => {
    buffSystem.addBuff('player1', BuffType.Strength, 2, 3, 'player1');
    expect(buffSystem.hasBuff('player1', BuffType.Strength)).toBe(true);
    expect(buffSystem.getBuffStacks('player1', BuffType.Strength)).toBe(2);
    
    const buffs = buffSystem.getBuffs('player1');
    expect(buffs).toHaveLength(1);
    expect(buffs[0].duration).toBe(3);
  });

  it('should stack buffs additively based on config', () => {
    buffSystem.addBuff('player1', BuffType.Strength, 2, 3, 'player1');
    buffSystem.addBuff('player1', BuffType.Strength, 3, 2, 'player1');
    
    expect(buffSystem.getBuffStacks('player1', BuffType.Strength)).toBe(5); // 2 + 3
    const buffs = buffSystem.getBuffs('player1');
    expect(buffs[0].duration).toBe(3); // max of durations
  });

  it('should stack buffs by max refresh based on config', () => {
    buffSystem.addBuff('player1', BuffType.Vulnerable, 1, 2, 'enemy1');
    buffSystem.addBuff('player1', BuffType.Vulnerable, 1, 3, 'enemy1');
    
    // Vulnerable is MaxRefresh, with maxStacks 1
    expect(buffSystem.getBuffStacks('player1', BuffType.Vulnerable)).toBe(1);
    const buffs = buffSystem.getBuffs('player1');
    expect(buffs[0].duration).toBe(3); // max of durations
  });

  it('should decrease duration on turn end and remove expired buffs', () => {
    buffSystem.addBuff('player1', BuffType.Strength, 2, 2, 'player1');
    buffSystem.addBuff('player1', BuffType.Dexterity, 1, 1, 'player1');
    
    buffSystem.processTurnEnd('player1');
    
    expect(buffSystem.hasBuff('player1', BuffType.Strength)).toBe(true);
    expect(buffSystem.getBuffs('player1').find(b => b.type === BuffType.Strength)?.duration).toBe(1);
    
    expect(buffSystem.hasBuff('player1', BuffType.Dexterity)).toBe(false);
  });

  it('should clear buffs for a specific entity', () => {
    buffSystem.addBuff('player1', BuffType.Strength, 2, 2, 'player1');
    buffSystem.addBuff('enemy1', BuffType.Weak, 1, 1, 'player1');
    
    buffSystem.clearEntity('player1');
    expect(buffSystem.hasBuff('player1', BuffType.Strength)).toBe(false);
    expect(buffSystem.hasBuff('enemy1', BuffType.Weak)).toBe(true);
  });

  it('should clear all buffs', () => {
    buffSystem.addBuff('player1', BuffType.Strength, 2, 2, 'player1');
    buffSystem.addBuff('enemy1', BuffType.Weak, 1, 1, 'player1');
    
    buffSystem.clearAll();
    expect(buffSystem.hasBuff('player1', BuffType.Strength)).toBe(false);
    expect(buffSystem.hasBuff('enemy1', BuffType.Weak)).toBe(false);
  });
});
