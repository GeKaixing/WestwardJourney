import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CardSystem, PlayCardContext } from '../cards/CardSystem';
import { CardType } from '@shared/enums/CardType';
import { TargetType } from '@shared/enums/TargetType';
import { BuffType } from '@shared/enums/BuffType';
import type { CardConfig } from '@shared/types/CardConfig';

describe('CardSystem', () => {
  let cardSystem: CardSystem;

  const mockStrikeConfig: CardConfig = {
    id: 'strike',
    name: 'Strike',
    description: 'Deal 6 damage.',
    cost: 1,
    type: CardType.Attack,
    rarity: 'basic' as any,
    targetType: TargetType.SingleEnemy,
    effects: [{ effectType: 'damage', value: 6, target: TargetType.SingleEnemy }],
    secondaryEffects: [{ effectType: 'damage', value: 9, target: TargetType.SingleEnemy }]
  };

  const mockDefendConfig: CardConfig = {
    id: 'defend',
    name: 'Defend',
    description: 'Gain 5 block.',
    cost: 1,
    type: CardType.Skill,
    rarity: 'basic' as any,
    targetType: TargetType.Self,
    effects: [{ effectType: 'block', value: 5, target: TargetType.Self }]
  };

  const mockBashConfig: CardConfig = {
    id: 'bash',
    name: 'Bash',
    description: 'Deal 8 damage. Apply 2 Vulnerable.',
    cost: 2,
    type: CardType.Attack,
    rarity: 'basic' as any,
    targetType: TargetType.SingleEnemy,
    effects: [
      { effectType: 'damage', value: 8, target: TargetType.SingleEnemy },
      { effectType: 'debuff', buffType: BuffType.Vulnerable, buffAmount: 2, buffDuration: 2, target: TargetType.SingleEnemy }
    ]
  };

  const mockExhaustConfig: CardConfig = {
    id: 'exhaust_card',
    name: 'Exhaust Card',
    description: 'Draw 2 cards. Exhaust.',
    cost: 0,
    type: CardType.Skill,
    rarity: 'basic' as any,
    targetType: TargetType.Self,
    effects: [{ effectType: 'draw_card', value: 2 }],
    exhaust: true
  };

  beforeEach(() => {
    cardSystem = new CardSystem();
    cardSystem.registerConfigs([mockStrikeConfig, mockDefendConfig, mockBashConfig, mockExhaustConfig]);
  });

  it('should create card instance correctly', () => {
    const instance = cardSystem.createInstance('strike');
    expect(instance.configId).toBe('strike');
    expect(instance.cost).toBe(1);
    expect(instance.upgraded).toBe(false);
    expect(instance.instanceId).toMatch(/^card_\d+_\d+$/);
  });

  it('should determine if a card can be played', () => {
    const instance = cardSystem.createInstance('strike');
    expect(cardSystem.canPlay(instance, 1)).toBe(true);
    expect(cardSystem.canPlay(instance, 0)).toBe(false);

    // Should not play status/curse
    cardSystem.registerConfig({
      id: 'curse', name: 'Curse', description: '', cost: 1, type: CardType.Curse, rarity: 'basic' as any, targetType: TargetType.None, effects: []
    });
    const curseInstance = cardSystem.createInstance('curse');
    expect(cardSystem.canPlay(curseInstance, 2)).toBe(false);
  });

  describe('playing cards', () => {
    let mockContext: PlayCardContext;
    let getBuffStacksMock: ReturnType<typeof vi.fn>;
    
    beforeEach(() => {
      getBuffStacksMock = vi.fn().mockReturnValue(0) as any;
      mockContext = {
        playerId: 'player',
        targets: ['enemy1'],
        energy: 3,
        buffSystem: {
          getBuffStacks: getBuffStacksMock as (entityId: string, type: BuffType) => number,
          addBuff: vi.fn(),
        },
        dealDamage: vi.fn().mockReturnValue(0),
        addBlock: vi.fn(),
        drawCards: vi.fn(),
        gainEnergy: vi.fn(),
        exhaustCard: vi.fn(),
        healPlayer: vi.fn(),
      };
    });

    it('should play attack card and deal damage', async () => {
      const strike = cardSystem.createInstance('strike');
      const result = await cardSystem.playCard(strike, mockContext);
      
      expect(mockContext.dealDamage).toHaveBeenCalledWith('enemy1', 6, 'player');
      expect(result.damage).toBe(6);
    });

    it('should deal upgraded damage if card is upgraded', async () => {
      const strike = cardSystem.createInstance('strike', true); // upgraded
      const result = await cardSystem.playCard(strike, mockContext);
      
      expect(mockContext.dealDamage).toHaveBeenCalledWith('enemy1', 9, 'player');
      expect(result.damage).toBe(9);
    });

    it('should add strength to damage calculation', async () => {
      getBuffStacksMock.mockImplementation((entityId, type) => {
        if (entityId === 'player' && type === BuffType.Strength) return 3;
        return 0;
      });

      const strike = cardSystem.createInstance('strike');
      const result = await cardSystem.playCard(strike, mockContext);
      
      expect(mockContext.dealDamage).toHaveBeenCalledWith('enemy1', 9, 'player'); // 6 + 3
      expect(result.damage).toBe(9);
    });

    it('should apply weakness to damage calculation', async () => {
      getBuffStacksMock.mockImplementation((entityId, type) => {
        if (entityId === 'player' && type === BuffType.Strength) return 2;
        if (entityId === 'player' && type === BuffType.Weak) return 1;
        return 0;
      });

      const strike = cardSystem.createInstance('strike');
      const result = await cardSystem.playCard(strike, mockContext);
      
      // base(6) + str(2) = 8. weak(1) -> 8 * 0.75 = 6
      expect(mockContext.dealDamage).toHaveBeenCalledWith('enemy1', 6, 'player');
      expect(result.damage).toBe(6);
    });

    it('should play skill card and add block', async () => {
      const defend = cardSystem.createInstance('defend');
      const result = await cardSystem.playCard(defend, mockContext);
      
      expect(mockContext.addBlock).toHaveBeenCalledWith('player', 5);
      expect(result.block).toBe(5);
    });

    it('should add dexterity to block calculation', async () => {
      getBuffStacksMock.mockImplementation((entityId, type) => {
        if (entityId === 'player' && type === BuffType.Dexterity) return 2;
        return 0;
      });

      const defend = cardSystem.createInstance('defend');
      const result = await cardSystem.playCard(defend, mockContext);
      
      expect(mockContext.addBlock).toHaveBeenCalledWith('player', 7); // 5 + 2
      expect(result.block).toBe(7);
    });

    it('should apply debuffs to enemy', async () => {
      const bash = cardSystem.createInstance('bash');
      await cardSystem.playCard(bash, mockContext);
      
      expect(mockContext.dealDamage).toHaveBeenCalledWith('enemy1', 8, 'player');
      expect(mockContext.buffSystem.addBuff).toHaveBeenCalledWith('enemy1', BuffType.Vulnerable, 2, 2, 'player');
    });

    it('should draw cards and exhaust if specified', async () => {
      const exhaust = cardSystem.createInstance('exhaust_card');
      await cardSystem.playCard(exhaust, mockContext);
      
      expect(mockContext.drawCards).toHaveBeenCalledWith(2);
      expect(mockContext.exhaustCard).toHaveBeenCalledWith(exhaust.instanceId);
    });
  });
});
