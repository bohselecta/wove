import { NextResponse } from 'next/server'
import { getDB } from '../../../../lib/db'
import { randomUUID } from 'crypto'

export async function GET() {
  try {
    const db = await getDB()
    const rooms = await db.all(`
      select cr.*, r.title as planTitle, r.summary as planSummary
      from common_rooms cr
      left join recipes r on cr.planId = r.id
      order by cr.createdAt desc
    `)
    if (db.close) db.close()
    return NextResponse.json(rooms)
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, planId } = body

    if (!title || !planId) {
      return NextResponse.json({ error: 'Title and planId are required' }, { status: 400 })
    }

    const db = await getDB()
    
    // Verify the plan exists
    const plan = await db.get(`select * from recipes where id = ?`, [planId])
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    const roomId = randomUUID()
    const room = {
      id: roomId,
      title,
      planId,
      status: 'planning',
      createdAt: new Date().toISOString()
    }

    await db.run(`
      insert into common_rooms (id, title, planId, status, createdAt)
      values (?, ?, ?, ?, ?)
    `, [roomId, title, planId, 'planning', room.createdAt])

    if (db.close) db.close()

    return NextResponse.json(room)
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
  }
}
