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
  const db = getDB()
  const rows = db.prepare(`select * from recipes order by p_total desc limit 10`).all() as RecipeRow[]
  const data = rows.map(r => ({
    id: r.id, title: r.title, summary: r.summary,
    priority: { impact:r.p_impact, feasibility:r.p_feasibility, urgency:r.p_urgency, equity:r.p_equity, total:r.p_total }
  }))
  db.close()
  return NextResponse.json(data)
}
