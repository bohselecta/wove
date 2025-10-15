import { NextResponse } from 'next/server'
import { getDB } from '../../../lib/db'
import { randomUUID } from 'crypto'

export async function GET() {
  try {
    const db = await getDB()
    const rows = await db.all(`select * from frictions order by datetime(createdAt) desc`)
    if (db.close) db.close()
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching frictions:', error)
    return NextResponse.json({ error: 'Failed to fetch frictions' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const text = String(body?.text ?? '').slice(0, 500)
    const item = { id: randomUUID(), text, createdAt: new Date().toISOString() }
    const db = await getDB()
    await db.run(`insert into frictions (id, text, createdAt) values (@id, @text, @createdAt)`, [item.id, item.text, item.createdAt])
    if (db.close) db.close()
    return NextResponse.json(item)
  } catch (error) {
    console.error('Error creating friction:', error)
    return NextResponse.json({ error: 'Failed to create friction' }, { status: 500 })
  }
}
