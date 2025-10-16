import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { randomUUID } from 'crypto'
import { requireUserId } from '@/lib/auth'

export async function GET(req: Request) {
  const db = await getDB()
  const { searchParams } = new URL(req.url)
  const roomId = searchParams.get('roomId')
  const taskId = searchParams.get('taskId')
  let rows = await db.all(`select * from nudges order by datetime(created_at) desc limit 200`)
  if (roomId) rows = rows.filter((n:any)=> n.room_id === roomId)
  if (taskId) rows = rows.filter((n:any)=> n.task_id === taskId)
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  try {
    const userId = await requireUserId()
    const body = await req.json()
    if (!body.taskId || !body.assignee)
      return NextResponse.json({ error:'taskId and assignee required' }, { status:400 })

    const db = await getDB()
    const n = {
      id: randomUUID(),
      room_id: body.roomId || null,
      task_id: body.taskId,
      assignee: String(body.assignee).slice(0,140),
      reason: String(body.reason || 'Please take a look'),
      created_by: userId,
      created_at: new Date().toISOString(),
      status: 'queued'
    }
    await db.run(
      `insert into nudges (id, room_id, task_id, assignee, reason, created_by, created_at, status)
       values (?, ?, ?, ?, ?, ?, ?, ?)`,
      [n.id, n.room_id, n.task_id, n.assignee, n.reason, n.created_by, n.created_at, n.status]
    )
    return NextResponse.json({ success:true, nudge:n })
  } catch {
    return NextResponse.json({ error:'unauthorized', hint:'Sign in to continue' }, { status:401 })
  }
}
