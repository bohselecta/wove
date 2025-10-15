import { NextResponse } from 'next/server'
import { getDB } from '../../../../lib/db'

type SignalRow = {
  id: string
  source: string
  topic: string
  time: string
  claim: string
  gi_planet: number
  gi_people: number
  gi_democracy: number
  gi_learning: number
}

export async function GET() {
  try {
    const db = await getDB()
    const rows = await db.all<SignalRow>(`select * from signals_top order by time desc limit 20`)
    const data = rows.map(r => ({
      id: r.id,
      source: r.source,
      topic: r.topic,
      time: r.time,
      claim: r.claim,
      gi: { planet:r.gi_planet, people:r.gi_people, democracy:r.gi_democracy, learning:r.gi_learning }
    }))
    if (db.close) db.close()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching signals:', error)
    return NextResponse.json({ error: 'Failed to fetch signals' }, { status: 500 })
  }
}
