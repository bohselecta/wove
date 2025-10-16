import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { getDB } from '@/lib/db'
import { requireUserId } from '@/lib/auth'

type TemplateMap = Record<string, {
  title: string
  summary: string
  ifue: { impact:number, feasibility:number, urgency:number, equity:number }
  starterTasks?: string[]
}>

const TEMPLATES: TemplateMap = {
  'shade-sprint': {
    title: 'Shade Sprint — Cooler Walkways',
    summary: 'Map heat hotspots, select native species, install shade + water stations along busy routes.',
    ifue: { impact:0.82, feasibility:0.70, urgency:0.75, equity:0.78 },
    starterTasks: [
      'Map heat hotspots on busy routes',
      'Draft native tree list and spacing plan',
      'Coordinate permits with parks department'
    ]
  },
  'civic-wifi': {
    title: 'Civic Mesh Nodes',
    summary: 'Survey sites, install open Wi-Fi repeaters, publish access map, train stewards.',
    ifue: { impact:0.76, feasibility:0.68, urgency:0.72, equity:0.80 },
    starterTasks: [
      'Survey coverage gaps',
      'Select hardware + budget',
      'Pilot two nodes with local partners'
    ]
  },
  'school-garden': {
    title: 'School Garden Starter',
    summary: 'Build raised beds; collect rainwater; integrate science classes; host harvest days.',
    ifue: { impact:0.74, feasibility:0.78, urgency:0.60, equity:0.82 },
    starterTasks: [
      'Pick garden site and measure',
      'Source soil and lumber',
      'Draft lesson integrations'
    ]
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requireUserId()
    const { templateId, createRoom } = await req.json()
    const t = TEMPLATES[templateId as keyof typeof TEMPLATES]
    if (!t) return NextResponse.json({ error: 'Unknown template' }, { status: 400 })

    const db = await getDB()
    const now = new Date().toISOString()

    // 1) create recipe (plan)
    const planId = randomUUID()
    const { impact, feasibility, urgency, equity } = t.ifue
    const total = (impact + feasibility + urgency + equity) / 4
    await db.run(
      `insert into recipes
         (id, title, summary, p_impact, p_feasibility, p_urgency, p_equity, p_total, template_id)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [planId, t.title, t.summary, impact, feasibility, urgency, equity, total, templateId]
    )

    if (!createRoom) return NextResponse.json({ success:true, planId })

    // 2) create common room + starter tasks
    const roomId = randomUUID()
    await db.run(
      `insert into common_rooms (id, title, plan_id, status, created_at)
       values (?, ?, ?, 'open', ?)`,
      [roomId, t.title, planId, now]
    )
    for (const title of (t.starterTasks || [])) {
      await db.run(
        `insert into tasks (id, room_id, title, status, created_at)
         values (?, ?, ?, 'todo', ?)`,
        [randomUUID(), roomId, title, now]
      )
    }

    return NextResponse.json({ success:true, planId, roomId, roomUrl: `/commons#room-${roomId}` })
  } catch {
    return NextResponse.json({ error: 'unauthorized', hint: 'Sign in to continue' }, { status: 401 })
  }
}
