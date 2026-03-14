# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A web application that allows users to create and manage soccer leagues. Users can set up leagues with custom teams, enter match results, and view live-updated league tables with standings, stats, and form guides.

---

## Tech Stack

- **Framework**: React Router v7 (framework mode), TypeScript
- **Rendering**: SSR + CSR (server and client side rendering)
- **Styling**: TailwindCSS, Shadcn/ui
- **ORM**: Prisma
- **Database**: PostgreSQL via Docker (see Environment Configuration)
- **Auth**: Auth.js v5 (`@auth/react-router`)
- **Testing**: Vitest

---

## Commands

```bash
# Install dependencies
npm install

# Dev
npm run dev

# Build
npm run build

# Start production server
npm start

# Lint
npm run lint

# Tests
npm test

# Run a single test file
npx vitest run app/path/to/file.test.tsx

# Prisma
npx prisma migrate dev     # create and apply a migration
npx prisma migrate deploy  # apply migrations in production
npx prisma studio          # open Prisma Studio
npx prisma generate        # regenerate Prisma client after schema changes
```

---

## Environment Configuration

Database connection is controlled by `DATABASE_URL`. Never commit either env file to source control.

**`.env.local` (dev — local Docker instance on port 5432):**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fsp2
AUTH_SECRET=<your-auth-secret>
AUTH_GOOGLE_ID=<your-google-client-id>
AUTH_GOOGLE_SECRET=<your-google-client-secret>
```

**`.env.production` (prod — separate Docker instance):**
```env
DATABASE_URL=postgresql://postgres:<password>@<prod-host>:5432/fsp2
AUTH_SECRET=<your-auth-secret>
AUTH_GOOGLE_ID=<your-google-client-id>
AUTH_GOOGLE_SECRET=<your-google-client-secret>
```

- All database access goes through Prisma client (`app/lib/db.server.ts`)
- Run `npx prisma migrate deploy` before starting the production server

---

## Authentication

- Library: **Auth.js v5** (`@auth/react-router`)
- Providers: Google
- Session strategy: `database` (JWT not used)
- DB adapter: `@auth/prisma-adapter`
- Session table lives in the existing Postgres instance
- Protect routes by checking session in the route `loader` — redirect to `/login` if unauthenticated
- Never store sensitive tokens client-side

---

## Architecture

React Router v7 framework mode — single app handles both server and client rendering. No separate backend server.

- **Loaders**: fetch data server-side per route (`loader` functions in route files). Always run on the server — safe to use Prisma directly.
- **Actions**: handle form submissions and mutations server-side (`action` functions in route files). Always run on the server.
- **Client components**: interactive UI. Use `useLoaderData()` to consume server-fetched data.
- **ORM**: Prisma manages all DB access. Schema lives in `prisma/schema.prisma`. Always run `prisma generate` after schema changes.
- **Type sharing**: Prisma-generated types are the source of truth. Shared utility types live in `app/types/`.
- **Server-only code**: any file that imports Prisma or reads env vars must use the `.server.ts` suffix to prevent bundling into the client.

---

## App Structure

```
prisma/
└── schema.prisma                  # Prisma schema (source of truth for DB)
app/
├── root.tsx                       # Root layout
├── routes.ts                      # Route definitions
├── routes/
│   ├── home.tsx                   # / — list all leagues
│   ├── leagues.new.tsx            # /leagues/new — create league
│   ├── leagues.$id.tsx            # /leagues/:id — league dashboard
│   └── leagues.$id.results.new.tsx # /leagues/:id/results/new
├── components/
│   ├── LeagueTable.tsx            # Standings table
│   ├── MatchResultForm.tsx        # Enter/edit a result
│   ├── TeamList.tsx               # Manage teams
│   ├── ResultsList.tsx            # All played matches
│   └── FormBadge.tsx              # W/D/L pill badges
├── lib/
│   ├── db.server.ts               # Prisma client singleton (server only)
│   ├── auth.server.ts             # Auth.js setup (server only)
│   └── tableCalculator.ts        # Standings computation logic
└── types/
    └── index.ts                   # Shared utility types
```

---

## Data Models

Defined in `prisma/schema.prisma`. Key shapes:

### League
```ts
{
  id: string
  name: string
  season: string
  createdAt: DateTime
  userId: string    // owner
  teams: Team[]
  matches: Match[]
}
```

### Team
```ts
{
  id: string
  name: string
  colour: string    // hex, for badge display
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
  playedAt: DateTime | null
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
/
 └── [Create League] → /leagues/new
 └── [Select League] → /leagues/:id
                         ├── Tab: Table      ← default view
                         ├── Tab: Results    ← played matches
                         ├── Tab: Fixtures   ← unplayed matches
                         └── [Enter Result] → /leagues/:id/results/new
```

---

## MVP Scope (Phase 1)

- [x] User authentication (Auth.js + Google)
- [x] Create a league with a name and season
- [x] Add/remove teams
- [x] Enter match results (score only)
- [x] View calculated league table
- [x] View list of results
- [x] Persist data in PostgreSQL via Prisma

## Phase 2 (Post-MVP)

- [ ] Multiple users sharing a league
- [ ] Pre-schedule fixtures before results are entered
- [ ] Top scorers / player stats tracking
- [ ] Export table as image or PDF
- [ ] Mobile-first PWA support

---

## Key Design Decisions

**Why React Router v7 framework mode?**
Gives SSR + CSR in a single framework with no separate backend. Loaders and actions run on the server and can use Prisma directly, while client components handle interactivity.

**Why compute standings on the fly?**
Avoids data inconsistency. Standings are always derived from match results — there's no separate table to keep in sync. `tableCalculator.ts` runs over all matches whenever results change.

**Tiebreaker rules**
Standard football tiebreakers: Pts → GD → GF → Name. Head-to-head can be added as a config option in Phase 2.

---

## Coding Conventions

- All files must use TypeScript. Never create `.js` or `.jsx` files — use `.ts` and `.tsx` exclusively.
- Use TypeScript strict mode everywhere. No `any`.
- Prefer named exports over default exports.
- Co-locate test files next to source files. Use `.tsx` for React component files and tests; `.ts` for non-component modules and their tests.
- Use `zod` for runtime validation at API boundaries (incoming requests, form data).
- Files that use Prisma or read env vars must end in `.server.ts` to prevent client bundle inclusion.
- Error handling: return typed error results rather than throwing in business logic; only throw at integration boundaries.
- Keep loaders and actions thin — business logic belongs in `app/lib/`.

---

## Notes for Claude

- `tableCalculator.ts` is the core logic — keep it pure and well-tested
- League table sorting must be strict; use a multi-key sort
- Form guide should show the most recent 5 matches in chronological order (latest on right)
- A match with `homeGoals: null` is "unplayed" and must be excluded from standings
- Colour-code table rows: top positions (green), relegation (red) based on league config
- When editing a result, recalculate the full table from scratch — don't patch incrementally
- Always run `prisma generate` after modifying `schema.prisma`
