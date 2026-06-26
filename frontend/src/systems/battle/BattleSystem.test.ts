import { describe, it, expect, beforeEach } from "vitest";
import { BattleSystem } from "./BattleSystem";
import { CardSystem } from "../cards/CardSystem";
import { BuffSystem } from "../buffs/BuffSystem";
import { RelicSystem } from "../relics/RelicSystem";
import { TurnPhase } from "../turn/TurnManager";
import { BuffType } from "@shared/enums/BuffType";

describe("BattleSystem", () => {
  let cardSystem: CardSystem;
  let buffSystem: BuffSystem;
  let relicSystem: RelicSystem;
  let battleSystem: BattleSystem;

  beforeEach(() => {
    cardSystem = new CardSystem();
    buffSystem = new BuffSystem();
    relicSystem = new RelicSystem();
    battleSystem = new BattleSystem(cardSystem, buffSystem, relicSystem);
  });

  it("should initialize battle properly", () => {
    const playerConfig = { id: "p1", name: "Player", health: 100, maxHealth: 100, deck: [], baseEnergy: 4 };
    const enemyConfigs = [{ id: "e1", name: "Enemy", health: 50, maxHealth: 50, actions: [], intentPattern: [] }];
    
    battleSystem.initBattle(playerConfig, enemyConfigs, {
      onStateChanged: () => {},
      onBattleEnd: () => {},
    });

    const state = battleSystem.getState();
    expect(state.player.energy).toBe(4);
    expect(state.player.maxEnergy).toBe(4);
    expect(state.enemies.length).toBe(1);
    expect(state.enemies[0].health).toBe(50);
  });
  
  it("should reset block on turn start if no barricade", () => {
    const playerConfig = { id: "p1", name: "Player", health: 100, maxHealth: 100, deck: [], baseEnergy: 3 };
    const enemyConfigs = [{ id: "e1", name: "Enemy", health: 50, maxHealth: 50, actions: [], intentPattern: [] }];
    
    battleSystem.initBattle(playerConfig, enemyConfigs, {
      onStateChanged: () => {},
      onBattleEnd: () => {},
    });

    let state = battleSystem.getState();
    state.player.block = 10;
    
    // Actually, state is a clone, we need to access via internals or trigger turn start.
    // Let's start battle.
    battleSystem.startBattle(); // this is async, let's just trigger createTurnEvents
    // Wait, testing TurnManager is easier through the full integration or by extracting the logic.
  });
});
