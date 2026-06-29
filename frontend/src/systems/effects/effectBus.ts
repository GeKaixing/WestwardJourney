export interface DamageEffect {
  targetId: string;
  amount: number;
}

export interface BlockEffect {
  targetId: string;
  amount: number;
}

export interface HealEffect {
  targetId: string;
  amount: number;
}

type Listener = (...args: unknown[]) => void;

function createBus() {
  const listeners = new Map<string, Set<Listener>>();
  return {
    on(event: string, fn: Listener) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(fn);
      return () => { listeners.get(event)?.delete(fn); };
    },
    emit(event: string, ...args: unknown[]) {
      listeners.get(event)?.forEach((fn) => fn(...args));
    },
    clear() { listeners.clear(); },
  };
}

export const effectBus = createBus();
