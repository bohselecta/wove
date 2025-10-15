import { NextResponse } from 'next/server'
import { getDB } from '../../../lib/db'
import { randomUUID } from 'crypto'

export async function GET() {
  const db = getDB()
  const rows = db.prepare(`select * from frictions order by datetime(createdAt) desc`).all()
  db.close()
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const body = await req.json()
  const text = String(body?.text ?? '').slice(0, 500)
  const item = { id: randomUUID(), text, createdAt: new Date().toISOString() }
  const db = getDB()
  db.prepare(`insert into frictions (id, text, createdAt) values (@id, @text, @createdAt)`).run(item)
  db.close()
  return NextResponse.json(item)
}
