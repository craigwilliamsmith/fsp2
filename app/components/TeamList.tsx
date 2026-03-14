import { useFetcher } from 'react-router'

interface Team {
  id: string
  name: string
  colour: string
}

interface TeamListProps {
  teams: Team[]
  leagueId: string
}

export function TeamList({ teams, leagueId }: TeamListProps) {
  const fetcher = useFetcher()

  if (teams.length === 0) {
    return <p className="text-gray-500">No teams yet.</p>
  }

  return (
    <ul className="space-y-2">
      {teams.map((team) => (
        <li
          key={team.id}
          className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <span
              className="h-4 w-4 flex-shrink-0 rounded-full border border-gray-200"
              style={{ backgroundColor: team.colour }}
              aria-hidden="true"
            />
            <span className="text-sm font-medium">{team.name}</span>
          </div>
          <fetcher.Form
            method="post"
            action={`/leagues/${leagueId}/teams/${team.id}/delete`}
          >
            <button
              type="submit"
              className="text-xs text-red-500 hover:text-red-700"
              aria-label={`Delete ${team.name}`}
            >
              Delete
            </button>
          </fetcher.Form>
        </li>
      ))}
    </ul>
  )
}
