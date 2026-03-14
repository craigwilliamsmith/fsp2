import { route, type RouteConfig } from '@react-router/dev/routes'

export default [
  route('/', 'routes/home.tsx'),
  route('/leagues/new', 'routes/leagues.new.tsx'),
  route('/leagues/:id', 'routes/leagues.$id.tsx'),
  route('/leagues/:id/results/new', 'routes/leagues.$id.results.new.tsx'),
  route('/api/auth/*', 'routes/api.auth.$.ts'),
] satisfies RouteConfig
