import { NextResponse } from 'next/server'
import { getDB } from '../../../../lib/db'

export async function GET() {
  const db = await getDB()
  // Roll up last 30 days; if no rows, return empty series
  const rows = await db.all(
    `select date, 
            sum(planet) as planet, 
            sum(people) as people, 
            sum(democracy) as democracy, 
            sum(learning) as learning
     from gi_scores
     where date >= date('now','-30 day')
     group by date
     order by date asc`
  )
  return NextResponse.json({ series: rows })
}
