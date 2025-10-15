import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { getDB } from '../../../lib/db'
import { requireUserId } from '@/lib/auth'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const roomId = searchParams.get('roomId')
  const planId = searchParams.get('planId')
  const needId = searchParams.get('needId')

  const db = await getDB()
  const where: string[] = []
  const args: any[] = []
  if (roomId) { where.push('room_id = ?'); args.push(roomId) }
  if (planId) { where.push('plan_id = ?'); args.push(planId) }
  if (needId) { where.push('need_id = ?'); args.push(needId) }
  const sql = `select * from proofs ${where.length ? 'where ' + where.join(' and ') : ''} order by datetime(created_at) desc`
  const rows = await db.all(sql, args)
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  try {
    const userId = await requireUserId()
    const body = await req.json()
    const proof = {
      id: randomUUID(),
      need_id: body.needId ?? null,
      room_id: body.roomId ?? null,
      plan_id: body.planId ?? null,
      kind: String(body.kind ?? 'text'),
      url: body.url ? String(body.url).slice(0, 1024) : null,
      text: body.text ? String(body.text).slice(0, 4000) : null,
      created_by: userId,  // Store actual userId
      created_at: new Date().toISOString(),
    }

    if (!proof.room_id && !proof.plan_id && !proof.need_id) {
      return NextResponse.json({ error: 'Provide at least one of roomId, planId, or needId' }, { status: 400 })
    }

    const db = await getDB()
    await db.run(
      `insert into proofs (id, need_id, room_id, plan_id, kind, url, text, created_by, created_at)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [proof.id, proof.need_id, proof.room_id, proof.plan_id, proof.kind, proof.url, proof.text, proof.created_by, proof.created_at]
    )
    return NextResponse.json({ success: true, proof })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'unauthorized', hint: 'Sign in to continue' }, { status: 401 })
    }
    console.error('Error creating proof:', error)
    return NextResponse.json({ error: 'Failed to create proof' }, { status: 500 })
  }
}
