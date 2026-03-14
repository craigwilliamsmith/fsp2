import { Link, redirect } from 'react-router'
import { useState } from 'react'
import type { Route } from './+types/leagues.$id'
import { auth } from '~/lib/auth.server'
import { db } from '~/lib/db.server'
import { calculateTable } from '~/lib/tableCalculator'
import { LeagueTable } from '~/components/LeagueTable'
import { ResultsList } from '~/components/ResultsList'

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await auth()
  if (!session?.user?.id) {
    throw redirect('/api/auth/signin')
  }

  const league = await db.league.findFirst({
    where: { id: params.id, userId: session.user.id as string },
    include: {
      teams: true,
      matches: {
        include: {
          homeTeam: true,
          awayTeam: true,
        },
        orderBy: { playedAt: 'desc' },
      },
    },
  })

  if (!league) {
    throw new Response('League not found', { status: 404 })
  }

  const standings = calculateTable(league.matches, league.teams)

  return { league, standings }
}

type Tab = 'table' | 'results' | 'fixtures'

export default function LeaguePage({ loaderData }: Route.ComponentProps) {
  const { league, standings } = loaderData
  const [activeTab, setActiveTab] = useState<Tab>('table')

  const playedMatches = league.matches.filter(
    (m) => m.homeGoals !== null && m.awayGoals !== null,
  )
  const unplayedMatches = league.matches.filter(
    (m) => m.homeGoals === null && m.awayGoals === null,
  )

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link to="/" className="mb-2 inline-block text-sm text-blue-600 hover:underline">
            ← My Leagues
          </Link>
          <h1 className="text-3xl font-bold">{league.name}</h1>
          <p className="mt-1 text-sm text-gray-500">{league.season}</p>
        </div>
        <Link
          to={`/leagues/${league.id}/results/new`}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Enter Result
        </Link>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {(['table', 'results', 'fixtures'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'table' && (
        <LeagueTable standings={standings} totalTeams={league.teams.length} />
      )}

      {activeTab === 'results' && (
        <ResultsList matches={playedMatches} />
      )}

      {activeTab === 'fixtures' && (
        <div>
          {unplayedMatches.length === 0 ? (
            <p className="text-gray-500">No upcoming fixtures.</p>
          ) : (
            <ul className="space-y-2">
              {unplayedMatches.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm"
                >
                  <span>{m.homeTeam.name}</span>
                  <span className="text-gray-400">vs</span>
                  <span>{m.awayTeam.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
