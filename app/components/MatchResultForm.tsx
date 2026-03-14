import { Form, Link } from 'react-router'

interface Team {
  id: string
  name: string
  colour: string
}

interface MatchResultFormProps {
  teams: Team[]
  leagueId: string
}

export function MatchResultForm({ teams, leagueId }: MatchResultFormProps) {
  return (
    <Form method="post" className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="homeTeamId" className="block text-sm font-medium text-gray-700">
            Home Team
          </label>
          <select
            id="homeTeamId"
            name="homeTeamId"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select team…</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="awayTeamId" className="block text-sm font-medium text-gray-700">
            Away Team
          </label>
          <select
            id="awayTeamId"
            name="awayTeamId"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select team…</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="homeGoals" className="block text-sm font-medium text-gray-700">
            Home Goals
          </label>
          <input
            id="homeGoals"
            name="homeGoals"
            type="number"
            min="0"
            defaultValue="0"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="awayGoals" className="block text-sm font-medium text-gray-700">
            Away Goals
          </label>
          <input
            id="awayGoals"
            name="awayGoals"
            type="number"
            min="0"
            defaultValue="0"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Save Result
        </button>
        <Link
          to={`/leagues/${leagueId}`}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
    </Form>
  )
}
