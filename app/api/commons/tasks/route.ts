import { NextResponse } from 'next/server'
import { getDB } from '../../../../lib/db'
import { randomUUID } from 'crypto'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const roomId = searchParams.get('roomId')

    if (!roomId) {
      return NextResponse.json({ error: 'roomId is required' }, { status: 400 })
    }

    const db = await getDB()
    const tasks = await db.all(`
      select * from tasks where roomId = ? order by createdAt desc
    `, [roomId])

    if (db.close) db.close()
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { roomId, title, assignee, due } = body

    if (!roomId || !title) {
      return NextResponse.json({ error: 'roomId and title are required' }, { status: 400 })
    }

    const db = await getDB()
    
    // Verify room exists
    const room = await db.get(`select * from common_rooms where id = ?`, [roomId])
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const taskId = randomUUID()
    const task = {
      id: taskId,
      roomId,
      title,
      assignee: assignee || null,
      due: due || null,
      completed: 0,
      createdAt: new Date().toISOString()
    }

    await db.run(`
      insert into tasks (id, roomId, title, assignee, due, completed, createdAt)
      values (?, ?, ?, ?, ?, ?, ?)
    `, [taskId, roomId, title, assignee || null, due || null, 0, task.createdAt])

    if (db.close) db.close()

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, completed, assignee, due } = body

    if (!id) {
      return NextResponse.json({ error: 'Task id is required' }, { status: 400 })
    }

    const db = await getDB()
    
    // Build dynamic update query
    const updates = []
    const params = []
    
    if (typeof completed === 'number') {
      updates.push('completed = ?')
      params.push(completed)
    }
    
    if (assignee !== undefined) {
      updates.push('assignee = ?')
      params.push(assignee)
    }
    
    if (due !== undefined) {
      updates.push('due = ?')
      params.push(due)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    params.push(id)

    await db.run(`
      update tasks set ${updates.join(', ')} where id = ?
    `, params)

    // Return updated task
    const updatedTask = await db.get(`select * from tasks where id = ?`, [id])

    if (db.close) db.close()

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}
