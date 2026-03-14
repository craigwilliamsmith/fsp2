interface MatchWithTeams {
  id: string
  homeGoals: number | null
  awayGoals: number | null
  playedAt: Date | null
  homeTeam: { id: string; name: string }
  awayTeam: { id: string; name: string }
}

interface ResultsListProps {
  matches: MatchWithTeams[]
}

export function ResultsList({ matches }: ResultsListProps) {
  if (matches.length === 0) {
    return <p className="text-gray-500">No results yet.</p>
  }

  return (
    <ul className="space-y-2">
      {matches.map((match) => (
        <li
          key={match.id}
          className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm"
        >
          <span className="w-2/5 text-right font-medium">{match.homeTeam.name}</span>
          <span className="w-1/5 text-center font-bold text-lg">
            {match.homeGoals} – {match.awayGoals}
          </span>
          <span className="w-2/5 text-left font-medium">{match.awayTeam.name}</span>
        </li>
      ))}
    </ul>
  )
}
