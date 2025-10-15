import { NextResponse } from 'next/server'
import { getDB } from '../../../lib/db'

type RecipeRow = {
  id: string
  title: string
  summary: string
  p_impact: number
  p_feasibility: number
  p_urgency: number
  p_equity: number
  p_total: number
}

export async function GET() {
  try {
    const db = await getDB()
    const rows = await db.all<RecipeRow>(`select * from recipes order by p_total desc limit 10`)
    const data = rows.map(r => ({
      id: r.id, title: r.title, summary: r.summary,
      priority: { impact:r.p_impact, feasibility:r.p_feasibility, urgency:r.p_urgency, equity:r.p_equity, total:r.p_total }
    }))
    if (db.close) db.close()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching recipes:', error)
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 })
  }
}
