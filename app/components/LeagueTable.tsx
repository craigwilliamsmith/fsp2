import type { Standing } from '~/types'
import { FormBadge } from './FormBadge'

interface LeagueTableProps {
  standings: Standing[]
  totalTeams: number
}

export function LeagueTable({ standings, totalTeams }: LeagueTableProps) {
  if (standings.length === 0) {
    return <p className="text-gray-500">No teams yet.</p>
  }

  const getRowClass = (position: number) => {
    if (position <= 2) return 'bg-green-50'
    if (position > totalTeams - 2) return 'bg-red-50'
    return ''
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            <th className="pb-3 pr-4 w-8">Pos</th>
            <th className="pb-3 pr-4">Team</th>
            <th className="pb-3 pr-4 text-center">P</th>
            <th className="pb-3 pr-4 text-center">W</th>
            <th className="pb-3 pr-4 text-center">D</th>
            <th className="pb-3 pr-4 text-center">L</th>
            <th className="pb-3 pr-4 text-center">GF</th>
            <th className="pb-3 pr-4 text-center">GA</th>
            <th className="pb-3 pr-4 text-center">GD</th>
            <th className="pb-3 pr-4 text-center font-bold">Pts</th>
            <th className="pb-3">Form</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((standing, index) => {
            const position = index + 1
            return (
              <tr
                key={standing.teamId}
                className={`border-b border-gray-100 ${getRowClass(position)}`}
              >
                <td className="py-3 pr-4 text-gray-500">{position}</td>
                <td className="py-3 pr-4 font-medium">{standing.teamName}</td>
                <td className="py-3 pr-4 text-center">{standing.played}</td>
                <td className="py-3 pr-4 text-center">{standing.won}</td>
                <td className="py-3 pr-4 text-center">{standing.drawn}</td>
                <td className="py-3 pr-4 text-center">{standing.lost}</td>
                <td className="py-3 pr-4 text-center">{standing.goalsFor}</td>
                <td className="py-3 pr-4 text-center">{standing.goalsAgainst}</td>
                <td className="py-3 pr-4 text-center">
                  {standing.goalDifference > 0
                    ? `+${standing.goalDifference}`
                    : standing.goalDifference}
                </td>
                <td className="py-3 pr-4 text-center font-bold">{standing.points}</td>
                <td className="py-3">
                  <div className="flex gap-1">
                    {standing.form.map((result, i) => (
                      <FormBadge key={i} result={result} />
                    ))}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
