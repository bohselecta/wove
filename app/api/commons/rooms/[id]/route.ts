import { NextResponse } from 'next/server'
import { getDB } from '../../../../lib/db'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const db = await getDB()
    
    // Get room with plan details
    const room = await db.get(`
      select cr.*, r.title as planTitle, r.summary as planSummary, r.steps, r.roles, r.verification
      from common_rooms cr
      left join recipes r on cr.planId = r.id
      where cr.id = ?
    `, [params.id])

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Get tasks for this room
    const tasks = await db.all(`
      select * from tasks where roomId = ? order by createdAt desc
    `, [params.id])

    if (db.close) db.close()

    return NextResponse.json({
      ...room,
      tasks
    })
  } catch (error) {
    console.error('Error fetching room:', error)
    return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 })
  }
}
