import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { getDB } from '../../../../lib/db'
import { requireUserId } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const userId = await requireUserId()
    const db = await getDB()
    const { planId, title } = await req.json()

    if (!planId || !title) {
      return NextResponse.json({ error: 'Missing planId or title' }, { status: 400 })
    }

    const id = randomUUID()
    await db.run(
      `insert into common_rooms (id, title, plan_id, status, created_at)
       values (?, ?, ?, 'open', ?)`,
      [id, title.slice(0, 140), planId, new Date().toISOString()]
    )

    if (db.close) db.close()

    return NextResponse.json({ success: true, room: { id, title, planId, status: 'open' } })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'unauthorized', hint: 'Sign in to continue' }, { status: 401 })
    }
    console.error('Error creating common room:', error)
    return NextResponse.json({ error: 'Failed to create common room' }, { status: 500 })
  }
}
