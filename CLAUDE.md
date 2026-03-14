# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Football (soccer) stats application — player and team statistics for association football leagues. Built with Next.js (React frontend + API routes backend).

## Tech Stack

- **Framework**: Next.js, React, TypeScript
- **API layer**: Next.js API routes (no separate backend server)
- **Database**: PostgreSQL via Docker (see Environment Configuration below)
- **Cache**: Redis for API response caching
- **Data source**: Third-party football data API (e.g., API-Football, football-data.org)
- **Testing**: Vitest

## Commands

```bash
# Install dependencies
npm install

# Dev
npm run dev

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

Next.js app with React pages and API routes in `src/app/`.

- **API layer**: Next.js API routes (`src/app/api/`) proxy requests to the upstream football data API and handle caching. Never call the upstream API directly from client components.
- **Data model**: Core entities are `Player`, `Team`, `League`, `Season`, `Match`, and `Stat`. Stats are always scoped to a season and competition — never store or display stats without that context.
- **Caching**: Stats data changes infrequently. Cache upstream API responses aggressively in Redis to avoid rate limits. Cache keys should encode the resource + season + competition.
- **Type sharing**: Shared TypeScript types live in `src/types/`. Never duplicate type definitions across client and server code.

## Coding Conventions

- All files must use TypeScript. Never create `.js` or `.jsx` files — use `.ts` and `.tsx` exclusively.
- Use TypeScript strict mode everywhere. No `any`.
- Prefer named exports over default exports.
- Co-locate test files next to source files. Use `.tsx` for React component files and tests; `.ts` for non-component modules and their tests.
- Use `zod` for runtime validation at API boundaries (incoming requests, upstream API responses).
- Error handling: return typed error results rather than throwing in business logic; only throw at integration boundaries.
- Keep API route handlers thin — business logic belongs in service modules under `src/lib/`.

## Environment Configuration

Database connection is controlled by the `DATABASE_URL` environment variable.

**`.env.local` (dev — local Docker instance):**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fsp2
```

**`.env.production` (prod — separate Docker instance):**
```env
DATABASE_URL=postgresql://postgres:<password>@<prod-host>:5432/fsp2
```

- Never commit `.env.local` or `.env.production` to source control.
- All database access goes through a single connection module at `src/lib/db.ts` which reads `DATABASE_URL`.
- Run migrations before starting the dev server if the schema has changed.

## Domain Notes

- Stats are contextual: a player's stats are tied to a team, a season, and a competition.
- Competitions differ in structure (league tables vs. knockout brackets) — keep this in mind when modeling matches.
- Player positions affect which stats are relevant (goals/assists for attackers, clean sheets for goalkeepers, pass accuracy for midfielders).
- Season identifiers follow the format `YYYY/YYYY` (e.g., `2024/2025`).
