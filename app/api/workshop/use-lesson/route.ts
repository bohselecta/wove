import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { getDB } from '@/lib/db'
import { requireUserId } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const userId = await requireUserId()
    const { lessonId, createRoom = true } = await req.json()
    if (!lessonId) return NextResponse.json({ error: 'lessonId required' }, { status: 400 })

    const db = await getDB()
    const lesson = await db.get<any>('select * from library_lessons where id = ?', [lessonId])
    if (!lesson) return NextResponse.json({ error: 'lesson not found' }, { status: 404 })

    // Very light IFUE heuristic from tags (safe defaults)
    const tags = (lesson.tags || '').toLowerCase()
    const impact      = /climate|health|governance|food/.test(tags) ? 0.78 : 0.68
    const feasibility = /guide|how|template|starter/.test((lesson.title+lesson.summary).toLowerCase()) ? 0.76 : 0.66
    const urgency     = /heat|crisis|outage|deadline|now/.test(lesson.summary?.toLowerCase()||'') ? 0.74 : 0.62
    const equity      = /equity|access|community|students|elder/.test(tags) ? 0.8 : 0.7
    const total = (impact + feasibility + urgency + equity) / 4

    const planId = randomUUID()
    await db.run(
      `insert into recipes (id, title, summary, p_impact, p_feasibility, p_urgency, p_equity, p_total, template_id)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        planId,
        lesson.title,
        lesson.summary || 'Generated from Library lesson',
        impact, feasibility, urgency, equity, total,
        `lesson:${lessonId}`
      ]
    )

    if (!createRoom) return NextResponse.json({ success:true, planId })

    const now = new Date().toISOString()
    const roomId = randomUUID()
    await db.run(
      `insert into common_rooms (id, title, plan_id, status, created_at)
       values (?, ?, ?, 'open', ?)`,
      [roomId, lesson.title, planId, now]
    )
    // Optional starter task from lesson content
    await db.run(
      `insert into tasks (id, room_id, title, status, created_at)
       values (?, ?, ?, 'todo', ?)`,
      [randomUUID(), roomId, 'Review lesson & draft steps', now]
    )

    return NextResponse.json({ success:true, planId, roomId, roomUrl: `/commons#room-${roomId}` })
  } catch {
    return NextResponse.json({ error: 'unauthorized', hint: 'Sign in to continue' }, { status: 401 })
  }
}
