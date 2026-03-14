import type { Standing } from '~/types'

interface MatchData {
  id: string
  homeTeamId: string
  awayTeamId: string
  homeGoals: number | null
  awayGoals: number | null
  playedAt: Date | null
}

interface TeamData {
  id: string
  name: string
}

export function calculateTable(matches: MatchData[], teams: TeamData[]): Standing[] {
  const standingsMap = new Map<string, Standing>()

  for (const team of teams) {
    standingsMap.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      form: [],
    })
  }

  // Only include played matches
  const playedMatches = matches.filter(
    (m) => m.homeGoals !== null && m.awayGoals !== null,
  )

  // Sort by playedAt ascending for form calculation
  const sortedMatches = [...playedMatches].sort((a, b) => {
    if (!a.playedAt && !b.playedAt) return 0
    if (!a.playedAt) return 1
    if (!b.playedAt) return -1
    return a.playedAt.getTime() - b.playedAt.getTime()
  })

  for (const match of sortedMatches) {
    const homeGoals = match.homeGoals as number
    const awayGoals = match.awayGoals as number

    const home = standingsMap.get(match.homeTeamId)
    const away = standingsMap.get(match.awayTeamId)

    if (!home || !away) continue

    home.played += 1
    away.played += 1
    home.goalsFor += homeGoals
    home.goalsAgainst += awayGoals
    away.goalsFor += awayGoals
    away.goalsAgainst += homeGoals

    if (homeGoals > awayGoals) {
      home.won += 1
      home.points += 3
      home.form.push('W')
      away.lost += 1
      away.form.push('L')
    } else if (homeGoals < awayGoals) {
      away.won += 1
      away.points += 3
      away.form.push('W')
      home.lost += 1
      home.form.push('L')
    } else {
      home.drawn += 1
      home.points += 1
      home.form.push('D')
      away.drawn += 1
      away.points += 1
      away.form.push('D')
    }
  }

  const standings = Array.from(standingsMap.values()).map((s) => ({
    ...s,
    goalDifference: s.goalsFor - s.goalsAgainst,
    form: s.form.slice(-5) as Array<'W' | 'D' | 'L'>,
  }))

  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor
    return a.teamName.localeCompare(b.teamName)
  })

  return standings
}
