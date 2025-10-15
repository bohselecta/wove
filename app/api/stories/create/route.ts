import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { getDB } from '../../../../lib/db'
import { requireUserId } from '@/lib/auth'

const USE_OPENAI = !!process.env.OPENAI_API_KEY

export async function POST(req: Request) {
  try {
    const userId = await requireUserId()
    const { roomId, planId, title } = await req.json()
    if (!roomId && !planId) {
      return NextResponse.json({ error: 'roomId or planId is required' }, { status: 400 })
    }

    const db = await getDB()
    const tasks = roomId ? await db.all(`select * from tasks where room_id = ? order by datetime(created_at) asc`, [roomId]) : []
    const proofs = await db.all(
      `select * from proofs where ${roomId ? 'room_id = ?' : 'plan_id = ?'} order by datetime(created_at) asc`,
      [roomId ?? planId]
    )

    // Build a compact context
    const taskLines = tasks.slice(0, 25).map(t => `- [${t.status}] ${t.title}${t.assignee ? ` (by ${t.assignee})` : ''}`).join('\n')
    const proofLines = proofs.slice(0, 25).map(p => `- (${p.kind}) ${p.url ?? (p.text ? p.text.slice(0,120) : '')}`).join('\n')

    const systemPrompt = `
You are the Storyteller for The Wove. Write a concise, factual, uplifting impact story (120-220 words).
Structure: What needed doing → What people did → Evidence/Proofs → What changed → Invitation to remix.
Tone: warm, civic, transparent. Avoid hype; include concrete details where possible.
`
    const userPrompt = `
Context:
Tasks:
${taskLines || '(none yet)'}
Proofs:
${proofLines || '(none yet)'}

Write the story now.
`

    let storyText = ''
    if (USE_OPENAI) {
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7
        })
      }).then(r => r.json())
      storyText = r?.choices?.[0]?.message?.content?.trim() || 'A small group took action and began making measurable progress.'
    } else {
      storyText = 'Neighbors organized a simple sprint, completed key tasks, captured proofs, and documented early impact for others to remix.'
    }

    // Naive GI delta calc v1 (tunable later)
    const done = tasks.filter((t:any) => t.status === 'done').length
    const pcount = proofs.length
    const base = Math.min(0.25, done * 0.02 + pcount * 0.03) // clamp to 0.25
    const gi = {
      planet: +(base * 0.9).toFixed(3),
      people: +(base * 1.1).toFixed(3),
      democracy: +(base * 0.8).toFixed(3),
      learning: +(base * 1.2).toFixed(3),
    }

    const story = {
      id: randomUUID(),
      plan_id: planId ?? null,
      room_id: roomId ?? null,
      title: (title || 'What We Wove'),
      body: storyText,
      gi_delta_planet: gi.planet,
      gi_delta_people: gi.people,
      gi_delta_democracy: gi.democracy,
      gi_delta_learning: gi.learning,
      created_at: new Date().toISOString()
    }

    await db.run(
      `insert into stories (id, plan_id, room_id, title, body,
        gi_delta_planet, gi_delta_people, gi_delta_democracy, gi_delta_learning, created_at)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [story.id, story.plan_id, story.room_id, story.title, story.body,
       story.gi_delta_planet, story.gi_delta_people, story.gi_delta_democracy, story.gi_delta_learning, story.created_at]
    )

    // Also write a daily GI score row (roll-up uses latest for date)
    const day = new Date().toISOString().slice(0,10)
    await db.run(
      `insert into gi_scores (id, date, planet, people, democracy, learning, source, room_id, plan_id)
       values (?, ?, ?, ?, ?, ?, 'story', ?, ?)`,
      [randomUUID(), day, gi.planet, gi.people, gi.democracy, gi.learning, story.room_id, story.plan_id]
    )

    return NextResponse.json({ success: true, story, gi })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'unauthorized', hint: 'Sign in to continue' }, { status: 401 })
    }
    console.error('Error creating story:', error)
    return NextResponse.json({ error: 'Failed to create story' }, { status: 500 })
  }
}
