# Contributing

## Branching

- `main` — production-ready code, protected
- `dev` — integration branch for active development
- Feature branches: `feature/<short-description>` (e.g. `feature/player-stats-table`)
- Bug fixes: `fix/<short-description>` (e.g. `fix/season-filter-query`)

Always branch off `dev`, not `main`.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add player goals-per-90 stat
fix: correct season scoping in team query
chore: update dependencies
docs: update API endpoint list
```

## Pull Requests

1. Open PRs against `dev`, not `main`
2. Keep PRs focused — one feature or fix per PR
3. Include a short description of what changed and why
4. Ensure lint and tests pass before requesting review

## Code Style

- TypeScript only — no `.js` or `.jsx` files
- Run `npm run lint` before committing
- Tests are required for new business logic

## Environment Setup

1. Clone the repo
2. Copy `.env.local.example` to `.env.local` and fill in values
3. Ensure the local PostgreSQL Docker container is running on port 5432
4. Run `npm install`
5. Run database migrations
6. Run `npm run dev`
