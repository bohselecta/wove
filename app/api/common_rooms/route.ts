import { NextResponse } from 'next/server'
import { getDB } from '../../../lib/db'

export async function GET() {
  try {
    const db = await getDB()
    const rows = await db.all(`select * from common_rooms order by datetime(created_at) desc`)
    
    if (db.close) db.close()
    
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching common rooms:', error)
    return NextResponse.json({ error: 'Failed to fetch common rooms' }, { status: 500 })
  }
}
