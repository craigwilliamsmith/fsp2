import { redirect } from 'react-router'
import { z } from 'zod'
import type { Route } from './+types/leagues.$id.results.new'
import { auth } from '~/lib/auth.server'
import { db } from '~/lib/db.server'
import { MatchResultForm } from '~/components/MatchResultForm'

const resultSchema = z.object({
  homeTeamId: z.string().min(1, 'Home team is required'),
  awayTeamId: z.string().min(1, 'Away team is required'),
  homeGoals: z.coerce.number().int().min(0, 'Home goals must be 0 or more'),
  awayGoals: z.coerce.number().int().min(0, 'Away goals must be 0 or more'),
})

export async function loader({ params }: Route.LoaderArgs) {
  const session = await auth()
  if (!session?.user?.id) {
    throw redirect('/api/auth/signin')
  }

  const league = await db.league.findFirst({
    where: { id: params.id, userId: session.user.id as string },
    include: { teams: true },
  })

  if (!league) {
    throw new Response('League not found', { status: 404 })
  }

  return { league }
}

export async function action({ request, params }: Route.ActionArgs) {
  const session = await auth()
  if (!session?.user?.id) {
    throw redirect('/api/auth/signin')
  }

  const formData = await request.formData()
  const raw = {
    homeTeamId: formData.get('homeTeamId'),
    awayTeamId: formData.get('awayTeamId'),
    homeGoals: formData.get('homeGoals'),
    awayGoals: formData.get('awayGoals'),
  }

  const result = resultSchema.safeParse(raw)
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    return { error: Object.values(errors).flat().join(', ') }
  }

  if (result.data.homeTeamId === result.data.awayTeamId) {
    return { error: 'Home and away teams must be different' }
  }

  await db.match.create({
    data: {
      leagueId: params.id,
      homeTeamId: result.data.homeTeamId,
      awayTeamId: result.data.awayTeamId,
      homeGoals: result.data.homeGoals,
      awayGoals: result.data.awayGoals,
      playedAt: new Date(),
    },
  })

  throw redirect(`/leagues/${params.id}`)
}

export default function NewResult({ loaderData, actionData }: Route.ComponentProps) {
  const { league } = loaderData

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold">Enter Result</h1>
      <p className="mb-6 text-sm text-gray-500">
        {league.name} — {league.season}
      </p>

      {actionData?.error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {actionData.error}
        </div>
      )}

      <MatchResultForm teams={league.teams} leagueId={league.id} />
    </div>
  )
}
