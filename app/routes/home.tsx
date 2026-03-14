import { Link, redirect } from 'react-router'
import type { Route } from './+types/home'
import { auth } from '~/lib/auth.server'
import { db } from '~/lib/db.server'

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth()
  if (!session?.user?.id) {
    throw redirect('/api/auth/signin')
  }

  const leagues = await db.league.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return { leagues, user: session.user }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { leagues, user } = loaderData

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Leagues</h1>
          <p className="mt-1 text-sm text-gray-500">Welcome back, {user.name ?? user.email}</p>
        </div>
        <Link
          to="/leagues/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Create League
        </Link>
      </div>

      {leagues.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No leagues yet. Create your first one!</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {leagues.map((league) => (
            <li key={league.id}>
              <Link
                to={`/leagues/${league.id}`}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm hover:border-blue-300 hover:shadow-md"
              >
                <div>
                  <p className="font-semibold">{league.name}</p>
                  <p className="text-sm text-gray-500">{league.season}</p>
                </div>
                <span className="text-gray-400">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
