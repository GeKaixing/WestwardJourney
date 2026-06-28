import { create } from "zustand";
import { CharacterClass } from "@shared/enums/CharacterClass";
import { PLAYER_CONFIGS } from "../data";
import { MapGenerator, type MapNode } from "../systems/map";
import type { CardInstance } from "../systems/cards";
import type { RelicInstance } from "../systems/relics";

export interface PotionInstance {
  configId: string;
  name: string;
  description: string;
  image?: string;
}

export interface RunState {
  characterClass: CharacterClass;
  gold: number;
  maxHealth: number;
  currentHealth: number;
  deck: CardInstance[];
  relics: RelicInstance[];
  potions: PotionInstance[];
  currentFloor: number;
  mapNodes: MapNode[];
  mapFloors: number;
  inBattle: boolean;
}

interface GameStore {
  run: RunState | null;
  startRun: (characterClass: CharacterClass, deck: CardInstance[], relic: RelicInstance) => void;
  setHealth: (hp: number) => void;
  heal: (amount: number) => void;
  takeDamage: (amount: number) => void;
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  addCardToDeck: (card: CardInstance) => void;
  removeCardFromDeck: (instanceId: string) => void;
  upgradeCard: (instanceId: string) => void;
  addRelic: (relic: RelicInstance) => void;
  addPotion: (potion: PotionInstance) => void;
  removePotion: (index: number) => void;
  setFloor: (floor: number) => void;
  setMapNodes: (nodes: MapNode[]) => void;
  setInBattle: (val: boolean) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  run: null,

  startRun: (characterClass, deck, relic) => {
    const config = PLAYER_CONFIGS[characterClass];
    const map = new MapGenerator().generate();
    set({
      run: {
        characterClass,
        gold: config.stats.startingGold,
        maxHealth: config.stats.maxHealth,
        currentHealth: config.stats.maxHealth,
        deck,
        relics: [relic],
        potions: [],
        currentFloor: 0,
        mapNodes: map.nodes,
        mapFloors: map.floors,
        inBattle: false,
      },
    });
  },

  setHealth: (hp) => {
    const run = get().run;
    if (!run) return;
    set({ run: { ...run, currentHealth: Math.max(0, Math.min(hp, run.maxHealth)) } });
  },

  heal: (amount) => {
    const run = get().run;
    if (!run) return;
    const newHp = Math.min(run.currentHealth + amount, run.maxHealth);
    set({ run: { ...run, currentHealth: newHp } });
  },

  takeDamage: (amount) => {
    const run = get().run;
    if (!run) return;
    set({ run: { ...run, currentHealth: Math.max(0, run.currentHealth - amount) } });
  },

  addGold: (amount) => {
    const run = get().run;
    if (!run) return;
    set({ run: { ...run, gold: run.gold + amount } });
  },

  spendGold: (amount) => {
    const run = get().run;
    if (!run || run.gold < amount) return false;
    set({ run: { ...run, gold: run.gold - amount } });
    return true;
  },

  addCardToDeck: (card) => {
    const run = get().run;
    if (!run) return;
    set({ run: { ...run, deck: [...run.deck, card] } });
  },

  removeCardFromDeck: (instanceId) => {
    const run = get().run;
    if (!run) return;
    set({ run: { ...run, deck: run.deck.filter((c) => c.instanceId !== instanceId) } });
  },

  upgradeCard: (instanceId) => {
    const run = get().run;
    if (!run) return;
    set({
      run: {
        ...run,
        deck: run.deck.map((c) =>
          c.instanceId === instanceId ? { ...c, upgraded: true } : c,
        ),
      },
    });
  },

  addRelic: (relic) => {
    const run = get().run;
    if (!run) return;
    set({ run: { ...run, relics: [...run.relics, relic] } });
  },

  addPotion: (potion) => {
    const run = get().run;
    if (!run || run.potions.length >= 3) return;
    set({ run: { ...run, potions: [...run.potions, potion] } });
  },

  removePotion: (index) => {
    const run = get().run;
    if (!run) return;
    const potions = run.potions.filter((_, i) => i !== index);
    set({ run: { ...run, potions } });
  },

  setFloor: (floor) => {
    const run = get().run;
    if (!run) return;
    set({ run: { ...run, currentFloor: floor } });
  },

  setMapNodes: (nodes) => {
    const run = get().run;
    if (!run) return;
    set({ run: { ...run, mapNodes: nodes } });
  },

  setInBattle: (val) => {
    const run = get().run;
    if (!run) return;
    set({ run: { ...run, inBattle: val } });
  },

  reset: () => set({ run: null }),
}));
