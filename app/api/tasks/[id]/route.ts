import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { requireUserId } from '@/lib/auth'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireUserId()
    const body = await req.json()
    const db = await getDB()

    await db.run(
      `update tasks set
         title = coalesce(?, title),
         status = coalesce(?, status),
         assignee = coalesce(?, assignee),
         due_date = coalesce(?, due_date),
         priority = coalesce(?, priority)
       where id = ?`,
      [
        body.title ?? null,
        body.status ?? null,
        body.assignee ?? null,
        body.due_date ?? null,
        body.priority ?? null,
        params.id
      ]
    )
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'unauthorized', hint: 'Sign in to continue' }, { status: 401 })
  }
}