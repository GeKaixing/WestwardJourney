# AGENTS.md — 西游行 (WestwardJourney)

## Project

Single-player roguelike deck-building game. Theme: Journey to the West. Long-term commercial-grade (Steam target). No prototype code.

Core gameplay: turn-based tactical combat, deck construction each run, randomly generated map progression, character-specific card pools, relics and status effects, random events and rewards, high replayability via procedural content. Inspired by the deck-building roguelike genre but uses an original setting, mechanics, and content based on Journey to the West.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, PixiJS 8, Zustand, React Router, Framer Motion, Tailwind CSS
- **Backend:** Node.js, NestJS, TypeScript, PostgreSQL, Prisma, Redis, WebSocket

## Directory Layout

```
frontend/
  assets/ components/ scenes/ systems/
  battle/ cards/ enemies/ relics/ events/
  map/ ui/ store/ hooks/ utils/ types/
backend/
  auth/ user/ battle/ card/ relic/
  enemy/ event/ save/ websocket/ common/
```

## Architecture Constraints

- **Data-driven design** — cards, relics, enemies, buffs, maps, events, rewards must all be configurable, never hardcoded
- **Decoupled rendering & logic** — gameplay logic, rendering, networking, persistence are independent layers
- **Independent game systems** — Battle System, Action Queue, Turn Manager, Buff System, Relic System, Card System, Map Generator, Save System, Event System, Reward System
- One responsibility per file. Prefer files under 300 lines.
- Separate UI from business logic.
- Composition over inheritance. Favor SOLID/DRY/KISS.
- Always consider future extensibility.

## Code Conventions

- **Files/Classes:** PascalCase (`Player.ts`, `BattleScene.ts`)
- **Functions/Methods:** camelCase (`drawCard()`, `applyBuff()`)
- Strong typing everywhere. No `any`.
- No duplicated code. No giant files.
- Never hardcode game data — use config/JSON for all game content.

## Commands

```sh
npm run dev          # Start frontend dev server (Vite, port 5173)
npm run build        # Type-check & build all packages
npm run lint         # Type-check frontend & backend (no emit)
npm run typecheck    # Alias for lint
npm run backend:dev  # Start NestJS dev server (port 3000)
npm run backend:build# Build NestJS backend
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run Prisma migrations (requires PostgreSQL + DATABASE_URL)
```

**Type-check before commit** — `npm run lint` catches issues early. Backend build requires `prisma:generate` first.
