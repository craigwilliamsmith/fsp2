import { Form, redirect } from 'react-router'
import { z } from 'zod'
import type { Route } from './+types/leagues.new'
import { auth } from '~/lib/auth.server'
import { db } from '~/lib/db.server'

const createLeagueSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  season: z.string().min(1, 'Season is required'),
})

export async function loader() {
  const session = await auth()
  if (!session?.user?.id) {
    throw redirect('/api/auth/signin')
  }
  return {}
}

export async function action({ request }: Route.ActionArgs) {
  const session = await auth()
  if (!session?.user?.id) {
    throw redirect('/api/auth/signin')
  }

  const formData = await request.formData()
  const raw = {
    name: formData.get('name'),
    season: formData.get('season'),
  }

  const result = createLeagueSchema.safeParse(raw)
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    return {
      error: Object.values(errors).flat().join(', '),
      values: raw,
    }
  }

  const league = await db.league.create({
    data: {
      name: result.data.name,
      season: result.data.season,
      userId: session.user.id as string,
    },
  })

  throw redirect(`/leagues/${league.id}`)
}

export default function NewLeague({ actionData }: Route.ComponentProps) {
  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Create League</h1>

      {actionData?.error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {actionData.error}
        </div>
      )}

      <Form method="post" className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            League Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={String(actionData?.values?.name ?? '')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Premier League"
          />
        </div>

        <div>
          <label htmlFor="season" className="block text-sm font-medium text-gray-700">
            Season
          </label>
          <input
            id="season"
            name="season"
            type="text"
            defaultValue={String(actionData?.values?.season ?? '')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="2024/25"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create League
          </button>
          <a
            href="/"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </a>
        </div>
      </Form>
    </div>
  )
}
