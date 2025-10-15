import { NextResponse } from 'next/server'
import { getDB } from '../../../lib/db'

export async function GET() {
  const db = await getDB()
  const rows = await db.all(
    `select id, plan_id, room_id, title, body,
            gi_delta_planet, gi_delta_people, gi_delta_democracy, gi_delta_learning,
            created_at
     from stories
     order by datetime(created_at) desc`
  )
  return NextResponse.json(rows)
}
