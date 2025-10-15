import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { getDB } from '../../../../../lib/db'
import { requireUserId } from '@/lib/auth'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const db = await getDB()
    const tasks = await db.all(`select * from tasks where room_id = ? order by datetime(created_at) desc`, [params.id])
    
    if (db.close) db.close()
    
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await requireUserId()
    const db = await getDB()
    const { title, assignee, due } = await req.json()
    
    if (!title) {
      return NextResponse.json({ error: 'Missing title' }, { status: 400 })
    }

    const task = {
      id: randomUUID(),
      room_id: params.id,
      title: String(title).slice(0, 200),
      assignee: assignee ? String(assignee).slice(0, 120) : null,
      due: due || null,
      status: 'todo',
      created_at: new Date().toISOString(),
    }
    
    await db.run(
      `insert into tasks (id, room_id, title, assignee, due, status, created_at)
       values (?, ?, ?, ?, ?, ?, ?)`,
      [task.id, task.room_id, task.title, task.assignee, task.due, task.status, task.created_at]
    )
    
    if (db.close) db.close()
    
    return NextResponse.json({ success: true, task })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'unauthorized', hint: 'Sign in to continue' }, { status: 401 })
    }
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
