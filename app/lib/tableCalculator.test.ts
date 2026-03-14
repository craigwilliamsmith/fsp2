import { describe, expect, it } from 'vitest'
import { calculateTable } from './tableCalculator'

const teams = [
  { id: 'team-a', name: 'Alpha FC' },
  { id: 'team-b', name: 'Beta United' },
  { id: 'team-c', name: 'Gamma City' },
]

const baseMatch = {
  playedAt: new Date('2024-01-01'),
}

describe('calculateTable', () => {
  it('computes standings for a home win, draw, and away win', () => {
    const matches = [
      // Alpha 3-1 Beta (home win)
      {
        id: 'm1',
        homeTeamId: 'team-a',
        awayTeamId: 'team-b',
        homeGoals: 3,
        awayGoals: 1,
        playedAt: new Date('2024-01-01'),
      },
      // Alpha 1-1 Gamma (draw)
      {
        id: 'm2',
        homeTeamId: 'team-a',
        awayTeamId: 'team-c',
        homeGoals: 1,
        awayGoals: 1,
        playedAt: new Date('2024-01-08'),
      },
      // Beta 0-2 Gamma (away win)
      {
        id: 'm3',
        homeTeamId: 'team-b',
        awayTeamId: 'team-c',
        homeGoals: 0,
        awayGoals: 2,
        playedAt: new Date('2024-01-15'),
      },
    ]

    const standings = calculateTable(matches, teams)

    // Alpha: W1 D1 L0 = 4pts, GF=4, GA=2, GD=+2
    const alpha = standings.find((s) => s.teamId === 'team-a')
    expect(alpha).toBeDefined()
    expect(alpha!.won).toBe(1)
    expect(alpha!.drawn).toBe(1)
    expect(alpha!.lost).toBe(0)
    expect(alpha!.points).toBe(4)
    expect(alpha!.goalsFor).toBe(4)
    expect(alpha!.goalsAgainst).toBe(2)
    expect(alpha!.goalDifference).toBe(2)

    // Gamma: W1 D1 L0 = 4pts, GF=3, GA=1, GD=+2
    const gamma = standings.find((s) => s.teamId === 'team-c')
    expect(gamma).toBeDefined()
    expect(gamma!.won).toBe(1)
    expect(gamma!.drawn).toBe(1)
    expect(gamma!.lost).toBe(0)
    expect(gamma!.points).toBe(4)
    expect(gamma!.goalsFor).toBe(3)
    expect(gamma!.goalsAgainst).toBe(1)
    expect(gamma!.goalDifference).toBe(2)

    // Beta: W0 D0 L2 = 0pts
    const beta = standings.find((s) => s.teamId === 'team-b')
    expect(beta).toBeDefined()
    expect(beta!.won).toBe(0)
    expect(beta!.points).toBe(0)
  })

  it('sorts by points desc, then GD desc, then GF desc, then name asc', () => {
    const matches = [
      {
        id: 'm1',
        homeTeamId: 'team-a',
        awayTeamId: 'team-b',
        homeGoals: 3,
        awayGoals: 1,
        playedAt: new Date('2024-01-01'),
      },
      {
        id: 'm2',
        homeTeamId: 'team-a',
        awayTeamId: 'team-c',
        homeGoals: 1,
        awayGoals: 1,
        playedAt: new Date('2024-01-08'),
      },
      {
        id: 'm3',
        homeTeamId: 'team-b',
        awayTeamId: 'team-c',
        homeGoals: 0,
        awayGoals: 2,
        playedAt: new Date('2024-01-15'),
      },
    ]

    const standings = calculateTable(matches, teams)

    // Alpha and Gamma both 4pts, GD +2 — Alpha has more GF (4 vs 3)
    expect(standings[0].teamId).toBe('team-a')
    expect(standings[1].teamId).toBe('team-c')
    expect(standings[2].teamId).toBe('team-b')
  })

  it('sorts by name asc when all else is equal', () => {
    const matches = [
      {
        id: 'm1',
        homeTeamId: 'team-a',
        awayTeamId: 'team-b',
        homeGoals: 1,
        awayGoals: 1,
        playedAt: new Date('2024-01-01'),
      },
    ]
    const twoTeams = [
      { id: 'team-a', name: 'Zeta FC' },
      { id: 'team-b', name: 'Alpha FC' },
    ]

    const standings = calculateTable(matches, twoTeams)

    // Both have 1pt, 0 GD, 1 GF — sort by name
    expect(standings[0].teamName).toBe('Alpha FC')
    expect(standings[1].teamName).toBe('Zeta FC')
  })

  it('excludes unplayed matches (null goals)', () => {
    const matches = [
      {
        id: 'm1',
        homeTeamId: 'team-a',
        awayTeamId: 'team-b',
        homeGoals: null,
        awayGoals: null,
        playedAt: null,
      },
    ]

    const standings = calculateTable(matches, teams)

    for (const s of standings) {
      expect(s.played).toBe(0)
    }
  })

  it('tracks form as last 5 results', () => {
    const matchList = Array.from({ length: 6 }, (_, i) => ({
      id: `m${i}`,
      homeTeamId: 'team-a',
      awayTeamId: 'team-b',
      homeGoals: 1,
      awayGoals: 0,
      playedAt: new Date(`2024-01-0${i + 1}`),
    }))

    const standings = calculateTable(matchList, teams)
    const alpha = standings.find((s) => s.teamId === 'team-a')

    expect(alpha!.form).toHaveLength(5)
    expect(alpha!.form.every((r) => r === 'W')).toBe(true)
  })
})
