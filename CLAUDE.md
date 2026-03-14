# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Football (soccer) stats application — league results tracking for association football leagues. Built with a React frontend and next.js backend.


# Soccer League Manager — Project Overview

## Purpose

A web application that allows users to create and manage soccer leagues. Users can set up leagues with custom teams, enter match results, and view live-updated league tables with standings, stats, and form guides.

---

## Core Features

### League Management
- Create a league with a name, season, and number of teams
- Add teams to the league (name, badge/colour, optional details)
- Support multiple concurrent leagues per user
- Delete or archive leagues

### Match Results Entry
- Select home and away teams from the league
- Enter final score (home goals / away goals)
- Mark matches as played or upcoming
- Edit or delete previously entered results

### League Table
- Auto-calculated standings after every result entry
- Standard football table columns: P, W, D, L, GF, GA, GD, Pts
- Sorted by: Points → GD → GF → Alphabetical (tiebreakers)
- Visual indicators: promotion zones, relegation zone
- Form guide (last 5 results: W/D/L badges)

### Results & Fixtures
- List of all played matches with scores
- List of upcoming/unplayed fixtures (if pre-scheduled)

---

## Data Models

### League
```ts
{
  id: string
  name: string
  season: string
  createdAt: timestamp
  teams: Team[]
  matches: Match[]
}
```

### Team
```ts
{
  id: string
  name: string
  colour: string        // hex, for badge display
  leagueId: string
}
```

### Match
```ts
{
  id: string
  leagueId: string
  homeTeamId: string
  awayTeamId: string
  homeGoals: number | null   // null = not yet played
  awayGoals: number | null
  playedAt: timestamp | null
}
```

### Standing (computed, not stored)
```ts
{
  teamId: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form: ('W' | 'D' | 'L')[]   // last 5
}
```

---

## Tech Stack (Recommended)

| Layer | Choice | Notes |
|---|---|---|
| Frontend | React + Vite | Fast dev, component-based |
| Styling | Tailwind CSS | Utility-first, rapid UI |
| State | Zustand or Context API | Lightweight state for leagues/matches |
| Persistence | PostgreSQL (Docker) | Dev and prod via DATABASE_URL |
| Routing | React Router v6 | League → Table / Results pages |

---

## App Structure

```
src/
├── components/
│   ├── LeagueTable.tsx        # Standings table component
│   ├── MatchResultForm.tsx    # Enter/edit a result
│   ├── TeamList.tsx           # Manage teams in a league
│   ├── ResultsList.tsx        # All played matches
│   └── FormBadge.tsx          # W/D/L pill badges
├── pages/
│   ├── Home.tsx               # List all leagues
│   ├── CreateLeague.tsx       # New league wizard
│   ├── LeagueDashboard.tsx    # Table + results for a league
│   └── EnterResult.tsx        # Score entry page
├── store/
│   └── leagueStore.ts         # State management (Zustand)
├── utils/
│   └── tableCalculator.ts     # Standings computation logic
└── App.tsx
```

---

## Table Calculation Logic (`tableCalculator.ts`)

```typescript
// For each match that has been played:
// Home win  → home: W (+3pts), away: L (+0pts)
// Draw      → home: D (+1pt),  away: D (+1pt)
// Away win  → home: L (+0pts), away: W (+3pts)

// Sort order:
// 1. Points (desc)
// 2. Goal Difference (desc)
// 3. Goals For (desc)
// 4. Team name (asc)
```

---

## UI Pages & Flow

```
Home
 └── [Create League] → CreateLeague (name, teams setup)
 └── [Select League] → LeagueDashboard
                         ├── Tab: Table      ← default view
                         ├── Tab: Results    ← played matches
                         ├── Tab: Fixtures   ← unplayed matches
                         └── [Enter Result] → EnterResult form
```

---

## MVP Scope (Phase 1)

- [x] Create a league with a name
- [x] Add/remove teams
- [x] Enter match results (score only)
- [x] View calculated league table
- [x] View list of results
- [x] Persist data in PostgreSQL
- [x] User authentication (Auth.js)
- [x] Multi-user league sharing
- [x] Multiple users sharing a league

## Phase 2 (Post-MVP)

- [ ] Pre-schedule fixtures before results are entered
- [ ] Top scorers / player stats tracking
- [ ] Export table as image or PDF

---

## Key Design Decisions

**Why PostgreSQL from the start?**
Data is relational — leagues, teams, and matches have clear foreign key relationships. Using PostgreSQL from day one avoids a migration from localStorage later.

**Why compute standings on the fly?**
Avoids data inconsistency. Standings are always derived from match results — there's no separate table to keep in sync. The `tableCalculator` function runs over all matches whenever results change.

**Tiebreaker rules**
Standard football tiebreakers: Pts → GD → GF → Name. For leagues that use head-to-head, this can be added as a config option in Phase 2.

---

## Notes for Claude

- The `tableCalculator.ts` utility is the core logic — keep it pure and well-tested
- League table sorting must be strict; use a multi-key sort
- Form guide should show the most recent 5 matches in chronological order (latest on right)
- A match with `homeGoals: null` is "unplayed" and must be excluded from standings
- Colour-code table rows: top positions (green), relegation (red) based on league config
- When editing a result, recalculate the full table from scratch — don't patch incrementally


## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Shadcn
- **Backend**: Next.js, TypeScript
- **Database**: PostgreSQL via Docker (see Environment Configuration below)

## Environment Configuration

Database connection is controlled by the `DATABASE_URL` environment variable. Never commit either env file to source control.

**`.env.local` (dev — local Docker instance on port 5432):**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fsp2
```

**`.env.production` (prod — separate Docker instance):**
```env
DATABASE_URL=postgresql://postgres:<password>@<prod-host>:5432/fsp2
```

- All database access goes through `src/lib/db.ts` which reads `DATABASE_URL`
- Run migrations before starting the dev server if the schema has changed

## Authentication

- Library: **Auth.js v5** (`next-auth`)
- Providers: Google
- Session strategy: `database` (JWT not used)
- DB adapter: `@auth/prisma-adapter` (or `@auth/drizzle-adapter` — match whichever ORM is used)
- Session table lives in the existing Postgres instance
- Protect routes using middleware (`middleware.ts`) with `auth()` matcher
- Never store sensitive tokens client-side; always read session server-side via `auth()` in Server Components or `getServerSession()` in API routes
- Auth routes live under `/api/auth/[...nextauth]`
## Commands

> Update this section as the project is scaffolded.

```bash
# Install dependencies
npm install

# Dev (frontend)
npm run dev

# Dev (backend)
npm run dev:server

# Build
npm run build

# Lint
npm run lint

# Tests
npm test

# Run a single test file
npx vitest run src/path/to/file.test.tsx
```

## Architecture

This is a monorepo or split frontend/backend structure (to be determined during scaffolding). Key architectural decisions:

- **API layer**: The backend proxies requests to a third-party football data API, handles caching, and exposes a clean REST or tRPC API to the frontend
- **Data model**: Core entities are `Player`, `Team`, `League`, `Season`, `Match`, and `Stat` — stats are always scoped to a season and competition
- **Caching**: Stats data changes infrequently; cache API responses aggressively (Redis or in-memory) to avoid hitting rate limits on the upstream data provider
- **Type sharing**: Define shared TypeScript types/interfaces in a shared package or `types/` directory consumed by both frontend and backend

## Domain Notes

- Stats are always contextual: a player's stats are tied to a team, a season, and a competition
- Competitions have different structures (leagues vs. knockout cups) — keep this in mind when modeling match data
- Player positions affect which stats are relevant (e.g., goals/assists for attackers, clean sheets for goalkeepers)
